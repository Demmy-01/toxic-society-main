import { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  CheckCircle,
  Loader2,
  Tag,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { supabase } from "../../lib/supabase";
// OWASP A03/A04: shared sanitization + validation utilities
import {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isValidPromoCode,
  validateCheckoutForm,
  type CheckoutFormErrors,
} from "../../lib/validate";

// ─── Paystack inline JS types ─────────────────────────────────────────────────
// The public key is safe to use on the client. It only opens the payment popup.
// All verification (using the secret key) happens on the backend.
declare global {
  interface Window {
    PaystackPop: {
      setup(options: PaystackOptions): { openIframe(): void };
    };
  }
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  label?: string;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

const VERIFY_FN_URL = "/api/verify-payment";

// ─── Generate a unique payment reference ─────────────────────────────────────
function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TS_${ts}_${rand}`;
}

// ─── Load Paystack inline script ──────────────────────────────────────────────
function usePaystackScript(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) {
      setLoaded(true);
      return;
    }
    const existing = document.getElementById("paystack-inline");
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-inline";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  return loaded;
}

// ─── Fetch Paystack public key from backend ───────────────────────────────────
let _cachedPaystackKey: string | null = null;

function usePaystackPublicKey(): string | null {
  const [key, setKey] = useState<string | null>(_cachedPaystackKey);

  useEffect(() => {
    if (_cachedPaystackKey) {
      setKey(_cachedPaystackKey);
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/config/paystack-key`)
      .then((res) => res.json())
      .then((data) => {
        _cachedPaystackKey = data.publicKey;
        setKey(data.publicKey);
      })
      .catch((err) => {
        console.error("Failed to fetch Paystack key:", err);
      });
  }, []);

  return key;
}

export function CheckoutModal() {
  const {
    user,
    customerProfile,
    signUp,
    logIn,
    saveCustomerProfile,
    showCheckoutModal,
    setShowCheckoutModal,
  } = useAuth();

  // Auth mode & forms for checkout
  const [checkoutAuthMode, setCheckoutAuthMode] = useState<'login' | 'signup'>('login');
  const [signUpForm2, setSignUpForm2] = useState({ name: '', email: '', phone: '', password: '' });
  const [loginForm2, setLoginForm2] = useState({ email: '', password: '' });
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');
  const { items, totalPrice, clearCart } = useCart();
  const { currency, formatPrice, ratesLoading } = useCurrency();

  const paystackReady = usePaystackScript();
  const PAYSTACK_PUBLIC_KEY = usePaystackPublicKey();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    delivery_location: "",
  });
  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [step, setStep] = useState<
    "form" | "paying" | "verifying" | "confirmed" | "failed"
  >("form");
  const [orderId, setOrderId] = useState("");
  const [payError, setPayError] = useState("");

  // Discount
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoAttempts, setPromoAttempts] = useState(0);
  const MAX_PROMO_ATTEMPTS = 5;
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string;
    code: string;
    type: string;
    value: number;
  } | null>(null);

  // Computed totals
  const discountAmount = (() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === "percentage")
      return (totalPrice * appliedDiscount.value) / 100;
    return Math.min(appliedDiscount.value, totalPrice);
  })();
  const finalTotalUsd = Math.max(0, totalPrice - discountAmount);

  // Convert to the user's selected currency for payment
  const finalTotalInCurrency = finalTotalUsd * currency.rate;
  // Paystack needs amount in smallest currency subunit (kobo for NGN, cents for USD, etc.)
  const amountInSubunit = Math.round(finalTotalInCurrency * 100);

  // Auto-populate form from saved profile
  useEffect(() => {
    if (customerProfile) {
      setForm({
        name: customerProfile.name ?? "",
        phone: customerProfile.phone ?? "",
        email: customerProfile.email ?? user?.email ?? "",
        delivery_location: customerProfile.delivery_location ?? "",
      });
    } else if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email ?? "" }));
    }
  }, [customerProfile, user]);

  // Reset when modal opens
  useEffect(() => {
    if (showCheckoutModal) {
      setStep("form");
      setPromoInput("");
      setPromoError("");
      setPromoAttempts(0);
      setAppliedDiscount(null);
      setFormErrors({});
      setPayError("");
    }
  }, [showCheckoutModal]);

  if (!showCheckoutModal) return null;

  // ─── Apply promo code ───────────────────────────────────────────────────────
  const applyPromo = async () => {
    if (promoAttempts >= MAX_PROMO_ATTEMPTS) {
      setPromoError("Too many attempts. Please refresh and try again.");
      return;
    }
    const code = sanitizeString(promoInput, 20).toUpperCase();
    if (!code) return;
    if (!isValidPromoCode(code)) {
      setPromoError("Invalid code format. Use letters, numbers, or dashes.");
      return;
    }

    setPromoLoading(true);
    setPromoError("");
    setPromoAttempts((prev) => prev + 1);

    const { data, error } = await supabase
      .from("discounts")
      .select(
        "id, code, type, value, usage_limit, uses, valid_until, min_purchase, active",
      )
      .eq("code", code)
      .single();

    setPromoLoading(false);

    if (error || !data) {
      setPromoError("Code not found.");
      return;
    }
    if (!data.active) {
      setPromoError("This code is no longer active.");
      return;
    }
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      setPromoError("This code has expired.");
      return;
    }
    if (data.usage_limit != null && data.uses >= data.usage_limit) {
      setPromoError("This code has reached its usage limit.");
      return;
    }
    if (data.min_purchase != null && totalPrice < data.min_purchase) {
      setPromoError(
        `Minimum order of $${data.min_purchase} required for this code.`,
      );
      return;
    }

    setAppliedDiscount({
      id: data.id,
      code: data.code,
      type: data.type,
      value: data.value,
    });
  };

  const removePromo = () => {
    setAppliedDiscount(null);
    setPromoInput("");
    setPromoError("");
  };

  // ─── Verify payment & save order (calls server-side API function) ────────────
  const verifyAndSaveOrder = async (
    reference: string,
    profile: typeof form,
  ) => {
    setStep("verifying");
    setPayError("");

    try {
      const orderItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
      }));

      // Fetch the current user session token to bypass RLS errors on the server
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(VERIFY_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reference,
          orderData: {
            items: orderItems,
            totalUsd: finalTotalUsd,
            customerId: customerProfile?.id ?? null,
            discountCode: appliedDiscount?.code ?? null,
            discountAmount: discountAmount > 0 ? discountAmount : 0,
            discountId: appliedDiscount?.id ?? null,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error ?? "Payment verification failed.");
      }

      if (result.orderId) setOrderId(result.orderId);
      clearCart();
      setStep("confirmed");
    } catch (err: unknown) {
      console.error("verifyAndSaveOrder error:", err);
      setPayError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Contact support with your payment reference.",
      );
      setStep("failed");
    }
  };

  const initiatePayment = (profile: typeof form) => {
    if (!paystackReady || !window.PaystackPop) {
      setPayError("Payment system is still loading. Please try again.");
      return;
    }

    // Diagnostic: log key prefix so we can confirm it's being read correctly
    const keyPreview = PAYSTACK_PUBLIC_KEY
      ? `${PAYSTACK_PUBLIC_KEY.slice(0, 10)}...${PAYSTACK_PUBLIC_KEY.slice(-4)}`
      : "UNDEFINED";
    console.log(`[Paystack] Initiating payment. Key: ${keyPreview} | Currency: ${currency.code} | Amount (subunit): ${amountInSubunit}`);

    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === "undefined") {
      setPayError("Payment configuration error: Paystack public key is missing. Contact support.");
      setStep("form");
      return;
    }

    setStep("paying");
    setPayError("");

    const ref = generateRef();

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY, // public key — safe on client
      email: profile.email,
      amount: amountInSubunit, // in kobo/subunit
      currency: currency.code, // NGN, USD, EUR, GBP
      ref,
      label: `Toxic Society Order`,
      callback: (response) => {
        // Payment popup closed with success — now verify server-side
        verifyAndSaveOrder(response.reference, profile);
      },
      onClose: () => {
        // User dismissed the popup without paying
        setStep("form");
        setPayError("");
      },
    });

    handler.openIframe();
  };

  // ─── Form submit (new user) ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { sanitized, errors } = validateCheckoutForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    await saveCustomerProfile(sanitized);
    initiatePayment(sanitized);
  };

  // ─── Returning user — directly pay ───────────────────────────────────────
  const handleReturnUserPay = () => {
    initiatePayment(form);
  };

  const hasProfile = !!customerProfile && !!customerProfile.delivery_location;
  const isProcessing = step === "paying" || step === "verifying";

  // ─── Promo code section ─────────────
  const PromoSection = () => (
    <div className="border border-dashed border-gray-200 rounded-lg p-3">
      {appliedDiscount ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={14} style={{ color: "#C41E3A" }} />
            <span
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-sm text-gray-800"
            >
              <strong>{appliedDiscount.code}</strong> applied —{" "}
              <span style={{ color: "#C41E3A" }}>
                {appliedDiscount.type === "percentage"
                  ? `${appliedDiscount.value}% off`
                  : `$${appliedDiscount.value} off`}
              </span>
            </span>
          </div>
          <button
            onClick={removePromo}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <XCircle size={16} />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                  setPromoError("");
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), applyPromo())
                }
                placeholder="PROMO CODE"
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="w-full border border-gray-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-red-700 transition-colors uppercase tracking-widest"
              />
            </div>
            <button
              onClick={applyPromo}
              disabled={promoLoading || !promoInput.trim()}
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: promoInput.trim() ? "#111" : "#e5e7eb",
              }}
              className="px-4 py-2 text-white text-sm disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {promoLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {promoError && (
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-xs text-red-600 mt-1.5"
            >
              {promoError}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ─── Price summary ──────────────────────────────────────────────────────
  const PriceSummary = () => (
    <div className="p-3 bg-gray-50 rounded-lg space-y-1.5">
      <div className="flex justify-between">
        <span
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="text-sm text-gray-500"
        >
          Subtotal
        </span>
        <span
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="text-sm text-gray-700"
        >
          {formatPrice(totalPrice)}
        </span>
      </div>
      {appliedDiscount && discountAmount > 0 && (
        <div className="flex justify-between">
          <span
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-sm text-green-600"
          >
            Discount ({appliedDiscount.code})
          </span>
          <span
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-sm text-green-600"
          >
            −{formatPrice(discountAmount)}
          </span>
        </div>
      )}
      <div className="border-t border-gray-200 pt-1.5 flex justify-between">
        <span
          style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
          className="text-sm font-semibold"
        >
          Total
        </span>
        <span
          style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
          className="text-base font-bold"
        >
          {ratesLoading ? "..." : formatPrice(finalTotalUsd)}
        </span>
      </div>
    </div>
  );

  // ─── Paystack Pay button shared component ────────────────────────────────
  const PayButton = ({
    onClick,
    type = "button",
  }: {
    onClick?: () => void;
    type?: "button" | "submit";
  }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={isProcessing || !paystackReady}
      style={{
        backgroundColor: "#C41E3A",
        fontFamily: "'Bebas Neue', cursive",
        letterSpacing: "3px",
      }}
      className="w-full text-white py-4 text-lg transition-all cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isProcessing ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <ShieldCheck size={18} />
      )}
      {isProcessing
        ? "Processing..."
        : `Pay ${ratesLoading ? "..." : formatPrice(finalTotalUsd)}`}
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={() => !isProcessing && setShowCheckoutModal(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md bg-white shadow-2xl pointer-events-auto"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} style={{ color: "#C41E3A" }} />
              <span
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "2px",
                }}
                className="text-xl text-gray-900"
              >
                {!user
                  ? "Continue to Checkout"
                  : step === "confirmed"
                    ? "Order Confirmed"
                    : "Delivery Details"}
              </span>
            </div>
            {!isProcessing && step !== "confirmed" && (
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Item count strip */}
          {step !== "confirmed" && step !== "verifying" && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-xs text-gray-500"
              >
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
              <span
                style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
                className="text-base font-semibold"
              >
                {formatPrice(finalTotalUsd)}
                {appliedDiscount && discountAmount > 0 && (
                  <span className="ml-1 text-xs line-through text-gray-400">
                    {formatPrice(totalPrice)}
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="px-6 py-6">
            {/* ─── Not logged in — Login / Sign Up ─── */}
            {!user && (
              <div className="flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-1">
                  <button
                    type="button"
                    onClick={() => { setCheckoutAuthMode('login'); setSignInError(''); }}
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: "2px",
                      borderBottomColor: checkoutAuthMode === 'login' ? '#C41E3A' : 'transparent',
                      color: checkoutAuthMode === 'login' ? '#C41E3A' : '#9CA3AF',
                    }}
                    className="flex-1 pb-2.5 text-lg border-b-2 transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCheckoutAuthMode('signup'); setSignInError(''); }}
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: "2px",
                      borderBottomColor: checkoutAuthMode === 'signup' ? '#C41E3A' : 'transparent',
                      color: checkoutAuthMode === 'signup' ? '#C41E3A' : '#9CA3AF',
                    }}
                    className="flex-1 pb-2.5 text-lg border-b-2 transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>

                {signInError && (
                  <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-red-600 bg-red-50 p-2 rounded text-center">{signInError}</p>
                )}

                {/* ── LOGIN ── */}
                {checkoutAuthMode === 'login' && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSigningIn(true);
                      setSignInError('');
                      sessionStorage.setItem('ts_checkout_pending', 'true');
                      const { error } = await logIn({
                        email: loginForm2.email.trim(),
                        password: loginForm2.password,
                      });
                      if (error) {
                        setSignInError(error);
                        sessionStorage.removeItem('ts_checkout_pending');
                      }
                      setSigningIn(false);
                    }}
                    className="flex flex-col gap-3"
                  >
                    <div>
                      <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Email *</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="email" value={loginForm2.email} onChange={(e) => setLoginForm2(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" style={{ fontFamily: "'Inter', sans-serif" }} className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Password *</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="password" value={loginForm2.password} onChange={(e) => setLoginForm2(p => ({ ...p, password: e.target.value }))} placeholder="Enter your password" style={{ fontFamily: "'Inter', sans-serif" }} className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors" />
                      </div>
                    </div>
                    <button type="submit" disabled={signingIn} style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }} className="w-full text-white py-3.5 text-lg transition-all cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                      {signingIn ? (<><Loader2 size={18} className="animate-spin" /> Logging In...</>) : 'Login'}
                    </button>
                    <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 text-center">
                      Don't have an account? <button type="button" onClick={() => { setCheckoutAuthMode('signup'); setSignInError(''); }} style={{ color: '#C41E3A' }} className="underline cursor-pointer">Sign up</button>
                    </p>
                  </form>
                )}

                {/* ── SIGN UP ── */}
                {checkoutAuthMode === 'signup' && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSigningIn(true);
                      setSignInError('');
                      sessionStorage.setItem('ts_checkout_pending', 'true');
                      const { error } = await signUp({
                        name: signUpForm2.name.trim(),
                        email: signUpForm2.email.trim(),
                        phone: signUpForm2.phone.trim(),
                        password: signUpForm2.password,
                      });
                      if (error) {
                        setSignInError(error);
                        sessionStorage.removeItem('ts_checkout_pending');
                      }
                      setSigningIn(false);
                    }}
                    className="flex flex-col gap-3"
                  >
                    <div>
                      <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="text" value={signUpForm2.name} onChange={(e) => setSignUpForm2(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" maxLength={100} style={{ fontFamily: "'Inter', sans-serif" }} className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Email *</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="email" value={signUpForm2.email} onChange={(e) => setSignUpForm2(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" maxLength={254} style={{ fontFamily: "'Inter', sans-serif" }} className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Phone *</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="tel" value={signUpForm2.phone} onChange={(e) => setSignUpForm2(p => ({ ...p, phone: e.target.value }))} placeholder="+234 800 000 0000" maxLength={20} style={{ fontFamily: "'Inter', sans-serif" }} className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontFamily: "'Inter', sans-serif" }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Password *</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="password" value={signUpForm2.password} onChange={(e) => setSignUpForm2(p => ({ ...p, password: e.target.value }))} placeholder="Create a password" minLength={6} style={{ fontFamily: "'Inter', sans-serif" }} className="w-full border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors" />
                      </div>
                    </div>
                    <button type="submit" disabled={signingIn} style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }} className="w-full text-white py-3.5 text-lg transition-all cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                      {signingIn ? (<><Loader2 size={18} className="animate-spin" /> Creating Account...</>) : 'Sign Up'}
                    </button>
                    <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 text-center">
                      Already have an account? <button type="button" onClick={() => { setCheckoutAuthMode('login'); setSignInError(''); }} style={{ color: '#C41E3A' }} className="underline cursor-pointer">Login</button>
                    </p>
                  </form>
                )}
              </div>
            )}

            {/* ─── Returning user (has profile) ─── */}
            {user && hasProfile && step === "form" && (
              <div className="flex flex-col gap-4">
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-500"
                >
                  Delivering to your saved address:
                </p>
                <div className="border border-gray-100 rounded-lg p-4 space-y-2 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400 shrink-0" />
                    <span
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-sm text-gray-800"
                    >
                      {form.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-sm text-gray-800"
                    >
                      {form.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-sm text-gray-800"
                    >
                      {form.email}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="text-gray-400 shrink-0 mt-0.5"
                    />
                    <span
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-sm text-gray-800"
                    >
                      {form.delivery_location}
                    </span>
                  </div>
                </div>

                <PromoSection />
                <PriceSummary />

                <PayButton onClick={handleReturnUserPay} />

                {/* Paystack branding */}
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={12} />
                  Secured by Paystack
                </p>
              </div>
            )}

            {/* ─── New user (needs details) ─── */}
            {user && !hasProfile && step === "form" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-500 mb-1"
                >
                  Tell us where to deliver your order.
                </p>

                <div>
                  <label
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Your full name"
                      maxLength={100}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors ${formErrors.name ? "border-red-400 focus:border-red-700" : "border-gray-200 focus:border-red-700"}`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5"
                  >
                    Email *
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="your@email.com"
                      maxLength={254}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors ${formErrors.email ? "border-red-400 focus:border-red-700" : "border-gray-200 focus:border-red-700"}`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5"
                  >
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+234 800 000 0000"
                      maxLength={20}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors ${formErrors.phone ? "border-red-400 focus:border-red-700" : "border-gray-200 focus:border-red-700"}`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5"
                  >
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin
                      size={15}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <textarea
                      required
                      rows={3}
                      value={form.delivery_location}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          delivery_location: e.target.value,
                        }))
                      }
                      placeholder="Full delivery address..."
                      maxLength={300}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className={`w-full border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors resize-none ${formErrors.delivery_location ? "border-red-400 focus:border-red-700" : "border-gray-200 focus:border-red-700"}`}
                    />
                  </div>
                  {formErrors.delivery_location && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={11} />
                      {formErrors.delivery_location}
                    </p>
                  )}
                </div>

                <PromoSection />
                <PriceSummary />

                <PayButton type="submit" />

                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={12} />
                  Secured by Paystack
                </p>
              </form>
            )}

            {/* ─── Paying (Paystack popup is open) ─── */}
            {step === "paying" && (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <Loader2
                  size={40}
                  className="animate-spin"
                  style={{ color: "#C41E3A" }}
                />
                <p
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "2px",
                  }}
                  className="text-xl text-gray-900"
                >
                  Complete payment in the Paystack popup
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-400"
                >
                  A secure Paystack payment window has opened. Complete your
                  payment there.
                </p>
              </div>
            )}

            {/* ─── Verifying ─── */}
            {step === "verifying" && (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <Loader2
                  size={40}
                  className="animate-spin"
                  style={{ color: "#C41E3A" }}
                />
                <p
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "2px",
                  }}
                  className="text-xl text-gray-900"
                >
                  Confirming your payment...
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-400"
                >
                  Please wait while we verify your transaction
                </p>
              </div>
            )}

            {/* ─── Confirmed ─── */}
            {step === "confirmed" && (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <CheckCircle size={56} style={{ color: "#C41E3A" }} />
                <div>
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: "2px",
                    }}
                    className="text-3xl text-gray-900 mb-2"
                  >
                    Order Placed!
                  </p>
                  <p
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-sm text-gray-400"
                  >
                    Payment confirmed. We'll contact you shortly to confirm
                    delivery.
                  </p>
                  {discountAmount > 0 && (
                    <p
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-sm text-green-600 mt-1"
                    >
                      You saved {formatPrice(discountAmount)}! 🎉
                    </p>
                  )}
                  {orderId && (
                    <p
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-xs text-gray-400 mt-2"
                    >
                      Order ref:{" "}
                      <span className="font-mono text-gray-600">
                        #{orderId.slice(0, 8).toUpperCase()}
                      </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  style={{
                    backgroundColor: "#C41E3A",
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "3px",
                  }}
                  className="w-full text-white py-4 text-lg cursor-pointer hover:opacity-90 mt-2"
                >
                  Continue Shopping
                </button>
              </div>
            )}

            {/* ─── Payment failed ─── */}
            {step === "failed" && (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <AlertCircle size={56} className="text-red-500" />
                <div>
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: "2px",
                    }}
                    className="text-2xl text-gray-900 mb-2"
                  >
                    Payment Issue
                  </p>
                  <p
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-sm text-gray-500"
                  >
                    {payError || "Something went wrong verifying your payment."}
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => setStep("form")}
                    style={{
                      backgroundColor: "#C41E3A",
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: "3px",
                    }}
                    className="w-full text-white py-4 text-lg cursor-pointer hover:opacity-90"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full text-xs text-gray-400 uppercase tracking-widest py-2 hover:text-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
