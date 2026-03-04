import { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../context/CartContext';

export function CheckoutModal() {
  const { user, customerProfile, signInWithGoogle, saveCustomerProfile, showCheckoutModal, setShowCheckoutModal } = useAuth();
  const { items, totalPrice } = useCart();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    delivery_location: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-populate form when customer profile loads (returning customer)
  useEffect(() => {
    if (customerProfile) {
      setForm({
        name: customerProfile.name ?? '',
        phone: customerProfile.phone ?? '',
        email: customerProfile.email ?? user?.email ?? '',
        delivery_location: customerProfile.delivery_location ?? '',
      });
    } else if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email ?? '' }));
    }
  }, [customerProfile, user]);

  // Reset done state when modal opens
  useEffect(() => {
    if (showCheckoutModal) setDone(false);
  }, [showCheckoutModal]);

  if (!showCheckoutModal) return null;

  const handleGoogleLogin = () => {
    signInWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveCustomerProfile(form);
    setSaving(false);
    setDone(true);
    // TODO: integrate payment gateway here
    setTimeout(() => {
      setShowCheckoutModal(false);
    }, 2500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={() => setShowCheckoutModal(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md bg-white shadow-2xl pointer-events-auto"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} style={{ color: '#C41E3A' }} />
              <span
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }}
                className="text-xl text-gray-900"
              >
                {!user ? 'Continue to Checkout' : 'Delivery Details'}
              </span>
            </div>
            <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Order summary strip */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", color: '#C41E3A' }} className="text-base font-semibold">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="px-6 py-6">

            {/* ─── Step 1: Not logged in ─── */}
            {!user && (
              <div className="flex flex-col items-center text-center gap-6">
                <div>
                  <p
                    style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }}
                    className="text-2xl text-gray-900 mb-2"
                  >
                    Sign in to continue
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400">
                    We use your Google account to save your delivery details for faster future checkouts.
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
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

            {/* ─── Step 2: Logged in — delivery form ─── */}
            {user && !done && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-500 mb-1">
                  {customerProfile
                    ? 'Your saved details are pre-filled. Update if needed.'
                    : 'Tell us where to deliver your order.'}
                </p>

                {/* Name */}
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+234 800 000 0000"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors"
                    />
                  </div>
                </div>

                {/* Delivery location */}
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      required
                      rows={3}
                      value={form.delivery_location}
                      onChange={(e) => setForm((p) => ({ ...p, delivery_location: e.target.value }))}
                      placeholder="Full delivery address..."
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{ backgroundColor: '#C41E3A', fontFamily: "'Bebas Neue', cursive", letterSpacing: '3px' }}
                  className="w-full text-white py-4 text-lg disabled:opacity-60 transition-all mt-2 cursor-pointer"
                >
                  {saving ? 'Saving...' : `Proceed to Payment — $${totalPrice.toFixed(2)}`}
                </button>
              </form>
            )}

            {/* ─── Done state ─── */}
            {done && (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#C41E3A' }}
                >
                  <ShoppingBag size={28} className="text-white" />
                </div>
                <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }} className="text-2xl text-gray-900">
                  Details Saved!
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400">
                  Connecting to payment processor...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
