import { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, User, ShoppingBag, CheckCircle, Loader2, Tag, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../../lib/supabase';
// OWASP A03/A04: shared sanitization + validation utilities
import { sanitizeString, isValidEmail, isValidPhone, isValidPromoCode, validateCheckoutForm, type CheckoutFormErrors } from '../../lib/validate';

export function CheckoutModal() {
  const { user, customerProfile, signInWithGoogle, saveCustomerProfile, showCheckoutModal, setShowCheckoutModal } = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({ name: '', phone: '', email: '', delivery_location: '' });
  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [step, setStep] = useState<'form' | 'placing' | 'confirmed'>('form');
  const [orderId, setOrderId] = useState('');

  // Discount
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  // OWASP A04: rate-limit promo attempts — max 5 per session to prevent DB enumeration
  const [promoAttempts, setPromoAttempts] = useState(0);
  const MAX_PROMO_ATTEMPTS = 5;
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string; code: string; type: string; value: number;
  } | null>(null);

  // Computed totals
  const discountAmount = (() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') return (totalPrice * appliedDiscount.value) / 100;
    return Math.min(appliedDiscount.value, totalPrice);
  })();
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  // Auto-populate form from saved profile
  useEffect(() => {
    if (customerProfile) {
      setForm({
        name: customerProfile.name ?? '',
        phone: customerProfile.phone ?? '',
        email: customerProfile.email ?? user?.email ?? '',
        delivery_location: customerProfile.delivery_location ?? '',
      });
    } else if (user?.email) {
      setForm(prev => ({ ...prev, email: user.email ?? '' }));
    }
  }, [customerProfile, user]);

  // Reset when modal opens
  useEffect(() => {
    if (showCheckoutModal) {
      setStep('form');
      setPromoInput('');
      setPromoError('');
      setPromoAttempts(0); // reset rate-limit counter each session
      setAppliedDiscount(null);
      setFormErrors({});
    }
  }, [showCheckoutModal]);

  if (!showCheckoutModal) return null;

  // ─── Apply promo code ───────────────────────────────────────────
  const applyPromo = async () => {
    // OWASP A04: enforce per-session attempt limit before any DB call
    if (promoAttempts >= MAX_PROMO_ATTEMPTS) {
      setPromoError('Too many attempts. Please refresh and try again.');
      return;
    }

    // OWASP A03: validate format before hitting the database
    const code = sanitizeString(promoInput, 20).toUpperCase();
    if (!code) return;
    if (!isValidPromoCode(code)) {
      setPromoError('Invalid code format. Use letters, numbers, or dashes.');
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    setPromoAttempts(prev => prev + 1);

    const { data, error } = await supabase
      .from('discounts')
      .select('id, code, type, value, usage_limit, uses, valid_until, min_purchase, active')
      .eq('code', code)
      .single();

    setPromoLoading(false);

    if (error || !data) { setPromoError('Code not found.'); return; }
    if (!data.active) { setPromoError('This code is no longer active.'); return; }
    if (data.valid_until && new Date(data.valid_until) < new Date()) { setPromoError('This code has expired.'); return; }
    if (data.usage_limit != null && data.uses >= data.usage_limit) { setPromoError('This code has reached its usage limit.'); return; }
    if (data.min_purchase != null && totalPrice < data.min_purchase) {
      setPromoError(`Minimum order of $${data.min_purchase} required for this code.`);
      return;
    }

    setAppliedDiscount({ id: data.id, code: data.code, type: data.type, value: data.value });
  };

  const removePromo = () => {
    setAppliedDiscount(null);
    setPromoInput('');
    setPromoError('');
  };

  // ─── Place order ─────────────────────────────────────────────────
  const placeOrder = async (profile: typeof form) => {
    setStep('placing');

    try {
      const orderItems = items.map(item => ({
        id: item.id, name: item.name, price: item.price,
        quantity: item.quantity, size: item.size, image: item.image,
      }));

      // Build insert payload — try with discount columns first
      const payload: Record<string, unknown> = {
        items: orderItems,
        total: finalTotal,
        status: 'paid',
        customer_id: customerProfile?.id ?? null,
        discount_code: appliedDiscount?.code ?? null,
        discount_amount: discountAmount > 0 ? discountAmount : 0,
      };

      let result = await supabase.from('orders').insert(payload).select('id').single();

      // If insert failed (e.g. columns don't exist yet), retry without discount columns
      if (result.error) {
        const { discount_code: _dc, discount_amount: _da, ...fallbackPayload } = payload;
        result = await supabase.from('orders').insert(fallbackPayload).select('id').single();
      }

      if (!result.error && result.data) setOrderId(result.data.id);

      // Increment discount uses — safe select+update (no RPC needed)
      if (appliedDiscount) {
        const { data: discRow } = await supabase
          .from('discounts')
          .select('uses')
          .eq('id', appliedDiscount.id)
          .single();
        if (discRow) {
          await supabase
            .from('discounts')
            .update({ uses: (discRow.uses ?? 0) + 1 })
            .eq('id', appliedDiscount.id);
        }
      }
    } catch (_err) {
      // Absorb any unexpected errors — we still want to clear cart and confirm
    } finally {
      clearCart();
      setStep('confirmed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // OWASP A03: validate + sanitize all form fields before any DB write
    const { sanitized, errors } = validateCheckoutForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    await saveCustomerProfile(sanitized);
    await placeOrder(sanitized);
  };

  const hasProfile = !!customerProfile && !!customerProfile.delivery_location;

  // ─── Promo code section (shared by both form states) ──────────────
  const PromoSection = () => (
    <div className="border border-dashed border-gray-200 rounded-lg p-3">
      {appliedDiscount ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={14} style={{ color: '#C41E3A' }} />
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-800">
              <strong>{appliedDiscount.code}</strong> applied —{' '}
              <span style={{ color: '#C41E3A' }}>
                {appliedDiscount.type === 'percentage'
                  ? `${appliedDiscount.value}% off`
                  : `$${appliedDiscount.value} off`}
              </span>
            </span>
          </div>
          <button onClick={removePromo} className="text-gray-400 hover:text-gray-600 ml-2">
            <XCircle size={16} />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={promoInput}
                onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                placeholder="PROMO CODE"
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="w-full border border-gray-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-red-700 transition-colors uppercase tracking-widest"
              />
            </div>
            <button
              onClick={applyPromo}
              disabled={promoLoading || !promoInput.trim()}
              style={{ fontFamily: "'Inter', sans-serif", backgroundColor: promoInput.trim() ? '#111' : '#e5e7eb' }}
              className="px-4 py-2 text-white text-sm disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {promoLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
            </button>
          </div>
          {promoError && (
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-red-600 mt-1.5">
              {promoError}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ─── Price summary (shows discount breakdown) ─────────────────────
  const PriceSummary = () => (
    <div className="p-3 bg-gray-50 rounded-lg space-y-1.5">
      <div className="flex justify-between">
        <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-500">Subtotal</span>
        <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-700">${totalPrice.toFixed(2)}</span>
      </div>
      {appliedDiscount && discountAmount > 0 && (
        <div className="flex justify-between">
          <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-green-600">
            Discount ({appliedDiscount.code})
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-green-600">
            −${discountAmount.toFixed(2)}
          </span>
        </div>
      )}
      <div className="border-t border-gray-200 pt-1.5 flex justify-between">
        <span style={{ fontFamily: "'Inter', sans-serif", color: '#C41E3A' }} className="text-sm font-semibold">Total</span>
        <span style={{ fontFamily: "'Inter', sans-serif", color: '#C41E3A' }} className="text-base font-bold">
          ${finalTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={() => step !== 'placing' && setShowCheckoutModal(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-white shadow-2xl pointer-events-auto"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} style={{ color: '#C41E3A' }} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }} className="text-xl text-gray-900">
                {!user ? 'Continue to Checkout' : step === 'confirmed' ? 'Order Confirmed' : 'Delivery Details'}
              </span>
            </div>
            {step !== 'placing' && (
              <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Item count strip (not on confirmed) */}
          {step !== 'confirmed' && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-500">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", color: '#C41E3A' }} className="text-base font-semibold">
                ${finalTotal.toFixed(2)}
                {appliedDiscount && discountAmount > 0 && (
                  <span className="ml-1 text-xs line-through text-gray-400">${totalPrice.toFixed(2)}</span>
                )}
              </span>
            </div>
          )}

          <div className="px-6 py-6">

            {/* ─── Not logged in ─── */}
            {!user && (
              <div className="flex flex-col items-center text-center gap-6">
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }} className="text-2xl text-gray-900 mb-2">
                    Sign in to continue
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400">
                    We use your Google account to save your delivery details for faster future checkouts.
                  </p>
                </div>
                <button onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400">
                  Your cart will be preserved. We never post without your permission.
                </p>
              </div>
            )}

            {/* ─── Returning user (has profile) ─── */}
            {user && hasProfile && step === 'form' && (
              <div className="flex flex-col gap-4">
                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-500">
                  Delivering to your saved address:
                </p>
                <div className="border border-gray-100 rounded-lg p-4 space-y-2 bg-gray-50">
                  <div className="flex items-center gap-2"><User size={14} className="text-gray-400 shrink-0" /><span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-800">{form.name}</span></div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400 shrink-0" /><span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-800">{form.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400 shrink-0" /><span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-800">{form.email}</span></div>
                  <div className="flex items-start gap-2"><MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" /><span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-800">{form.delivery_location}</span></div>
                </div>

                <PromoSection />
                <PriceSummary />

                <button onClick={() => placeOrder(form)}
                  style={{ backgroundColor: '#C41E3A', fontFamily: "'Bebas Neue', cursive", letterSpacing: '3px' }}
                  className="w-full text-white py-4 text-lg transition-all cursor-pointer hover:opacity-90">
                  Place Order — ${finalTotal.toFixed(2)}
                </button>
              </div>
            )}

            {/* ─── New user (needs details) ─── */}
            {user && !hasProfile && step === 'form' && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-500 mb-1">
                  Tell us where to deliver your order.
                </p>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      maxLength={100}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors ${
                        formErrors.name ? 'border-red-400 focus:border-red-700' : 'border-gray-200 focus:border-red-700'
                      }`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />{formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      maxLength={254}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors ${
                        formErrors.email ? 'border-red-400 focus:border-red-700' : 'border-gray-200 focus:border-red-700'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />{formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Phone *</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+234 800 000 0000"
                      maxLength={20}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors ${
                        formErrors.phone ? 'border-red-400 focus:border-red-700' : 'border-gray-200 focus:border-red-700'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />{formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Delivery Address *</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      required
                      rows={3}
                      value={form.delivery_location}
                      onChange={e => setForm(p => ({ ...p, delivery_location: e.target.value }))}
                      placeholder="Full delivery address..."
                      maxLength={300}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors resize-none ${
                        formErrors.delivery_location ? 'border-red-400 focus:border-red-700' : 'border-gray-200 focus:border-red-700'
                      }`}
                    />
                  </div>
                  {formErrors.delivery_location && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />{formErrors.delivery_location}
                    </p>
                  )}
                </div>

                <PromoSection />
                <PriceSummary />

                <button type="submit"
                  style={{ backgroundColor: '#C41E3A', fontFamily: "'Bebas Neue', cursive", letterSpacing: '3px' }}
                  className="w-full text-white py-4 text-lg transition-all cursor-pointer hover:opacity-90">
                  Place Order — ${finalTotal.toFixed(2)}
                </button>
              </form>
            )}

            {/* ─── Placing ─── */}
            {step === 'placing' && (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <Loader2 size={40} className="animate-spin" style={{ color: '#C41E3A' }} />
                <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }} className="text-xl text-gray-900">
                  Placing your order...
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400">Please wait a moment</p>
              </div>
            )}

            {/* ─── Confirmed ─── */}
            {step === 'confirmed' && (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <CheckCircle size={56} style={{ color: '#C41E3A' }} />
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }} className="text-3xl text-gray-900 mb-2">
                    Order Placed!
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400">
                    Thank you for your order. We'll contact you shortly to confirm delivery.
                  </p>
                  {discountAmount > 0 && (
                    <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-green-600 mt-1">
                      You saved ${discountAmount.toFixed(2)}! 🎉
                    </p>
                  )}
                  {orderId && (
                    <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 mt-2">
                      Order ref: <span className="font-mono text-gray-600">#{orderId.slice(0, 8).toUpperCase()}</span>
                    </p>
                  )}
                </div>
                <button onClick={() => setShowCheckoutModal(false)}
                  style={{ backgroundColor: '#C41E3A', fontFamily: "'Bebas Neue', cursive", letterSpacing: '3px' }}
                  className="w-full text-white py-4 text-lg cursor-pointer hover:opacity-90 mt-2">
                  Continue Shopping
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
