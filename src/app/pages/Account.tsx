import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  LogOut,
  Edit2,
  Save,
  X,
  Loader2,
  Mail,
  Phone,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export function Account() {
  const navigate = useNavigate();
  const {
    user,
    customerProfile,
    signOut,
    signUp,
    logIn,
    loading: authLoading,
    setShowCheckoutModal,
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    delivery_location: "",
  });

  // Auth mode toggle
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authLoading2, setAuthLoading2] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sign Up form
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Initialize form with customer profile data
  useEffect(() => {
    if (user && !authLoading) {
      setShowCheckoutModal(false);
      if (customerProfile) {
        setFormData({
          name: customerProfile.name || "",
          email: customerProfile.email || "",
          phone: customerProfile.phone || "",
          delivery_location: customerProfile.delivery_location || "",
        });
        setIsEditing(false);
      } else {
        setFormData({
          name: (user as any).full_name || "",
          email: user.email || "",
          phone: (user as any).phone || "",
          delivery_location: "",
        });
        setIsEditing(true);
      }
    }
  }, [user, customerProfile, authLoading, setShowCheckoutModal]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await supabase
        .from("customers")
        .upsert(
          {
            user_id: user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            delivery_location: formData.delivery_location,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading2(true);
    setAuthError(null);
    const { error } = await signUp({
      name: signUpForm.name.trim(),
      email: signUpForm.email.trim(),
      phone: signUpForm.phone.trim(),
      password: signUpForm.password,
    });
    if (error) setAuthError(error);
    setAuthLoading2(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading2(true);
    setAuthError(null);
    const { error } = await logIn({
      email: loginForm.email.trim(),
      password: loginForm.password,
    });
    if (error) setAuthError(error);
    setAuthLoading2(false);
  };

  // ─── Not logged in ─── Show Login / Sign Up tabs
  if (!user) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div
          style={{ backgroundColor: "#0f0f0f" }}
          className="py-16 px-4 text-center"
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "4px",
              color: "#C41E3A",
            }}
            className="text-xs uppercase mb-3"
          >
            Toxic Society
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "4px",
            }}
            className="text-6xl sm:text-7xl text-white"
          >
            My Account
          </h1>
        </div>

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-gray-200">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "2px",
                borderBottomColor:
                  authMode === "login" ? "#C41E3A" : "transparent",
                color: authMode === "login" ? "#C41E3A" : "#9CA3AF",
              }}
              className="flex-1 pb-3 text-xl border-b-2 transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthError(null);
              }}
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "2px",
                borderBottomColor:
                  authMode === "signup" ? "#C41E3A" : "transparent",
                color: authMode === "signup" ? "#C41E3A" : "#9CA3AF",
              }}
              className="flex-1 pb-3 text-xl border-b-2 transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {authError && (
            <div
              style={{ backgroundColor: "#FEE2E2", borderColor: "#FECACA" }}
              className="border rounded-lg p-3 mb-4"
            >
              <p
                style={{ fontFamily: "'Inter', sans-serif", color: "#991B1B" }}
                className="text-sm"
              >
                {authError}
              </p>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {authMode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    required
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="your@email.com"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-red-700 transition-colors rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Password *
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    required
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Enter your password"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-red-700 transition-colors rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading2}
                style={{
                  backgroundColor: "#C41E3A",
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "2px",
                }}
                className="w-full text-white px-10 py-4 text-lg hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading2 ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-xs text-gray-400 text-center mt-2"
              >
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError(null);
                  }}
                  style={{ color: "#C41E3A" }}
                  className="underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* ── SIGN UP FORM ── */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
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
                    value={signUpForm.name}
                    onChange={(e) =>
                      setSignUpForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    maxLength={100}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-red-700 transition-colors rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    required
                    type="email"
                    value={signUpForm.email}
                    onChange={(e) =>
                      setSignUpForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="your@email.com"
                    maxLength={254}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-red-700 transition-colors rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    required
                    type="tel"
                    value={signUpForm.phone}
                    onChange={(e) =>
                      setSignUpForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+234 800 000 0000"
                    maxLength={20}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-red-700 transition-colors rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Password *
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    required
                    type="password"
                    value={signUpForm.password}
                    onChange={(e) =>
                      setSignUpForm((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Create a password"
                    minLength={6}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-red-700 transition-colors rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading2}
                style={{
                  backgroundColor: "#C41E3A",
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "2px",
                }}
                className="w-full text-white px-10 py-4 text-lg hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading2 ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-xs text-gray-400 text-center mt-2"
              >
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                  }}
                  style={{ color: "#C41E3A" }}
                  className="underline cursor-pointer"
                >
                  Login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div
          style={{ backgroundColor: "#0f0f0f" }}
          className="py-16 px-4 text-center"
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "4px",
              color: "#C41E3A",
            }}
            className="text-xs uppercase mb-3"
          >
            Toxic Society
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "4px",
            }}
            className="text-6xl sm:text-7xl text-white"
          >
            My Account
          </h1>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center min-h-96">
          <Loader2 size={32} className="text-gray-300 animate-spin" />
        </div>
      </div>
    );
  }

  // ─── Logged in state ───
  return (
    <div className="bg-white min-h-screen">
      <div
        style={{ backgroundColor: "#0f0f0f" }}
        className="py-16 px-4 text-center"
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "4px",
            color: "#C41E3A",
          }}
          className="text-xs uppercase mb-3"
        >
          Toxic Society
        </p>
        <h1
          style={{
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "4px",
          }}
          className="text-6xl sm:text-7xl text-white"
        >
          My Account
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <div
            style={{ backgroundColor: "#FEE2E2", borderColor: "#FECACA" }}
            className="border rounded-lg p-4 mb-6"
          >
            <p
              style={{ fontFamily: "'Inter', sans-serif", color: "#991B1B" }}
              className="text-sm"
            >
              {error}
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            style={{ backgroundColor: "#f9f9f9" }}
            className="px-6 py-5 border-b border-gray-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: "#C41E3A" }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <User size={24} className="text-white" />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "2px",
                  }}
                  className="text-lg font-semibold text-gray-900"
                >
                  {formData.name || "Your Profile"}
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-xs text-gray-500"
                >
                  {user?.email}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: "#C41E3A",
                  fontFamily: "'Inter', sans-serif",
                }}
                className="flex items-center gap-2 text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-red-800 transition-colors"
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}
          </div>

          <div className="px-6 py-8">
            <div className="space-y-6">
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                  }}
                  className="text-xs uppercase text-gray-600 block mb-2"
                >
                  Delivery Address
                </label>
                <textarea
                  name="delivery_location"
                  value={formData.delivery_location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                  rows={4}
                  placeholder="Enter your delivery address"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div
              style={{ backgroundColor: "#f9f9f9" }}
              className="px-6 py-5 border-t border-gray-200 flex gap-3"
            >
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: "#C41E3A",
                  fontFamily: "'Inter', sans-serif",
                }}
                className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-3 text-xs uppercase tracking-widest hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                style={{
                  borderColor: "#E5E7EB",
                  fontFamily: "'Inter', sans-serif",
                  color: "#6B7280",
                }}
                className="flex-1 flex items-center justify-center gap-2 border px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            borderColor: "#E5E7EB",
            fontFamily: "'Inter', sans-serif",
            color: "#6B7280",
          }}
          className="w-full mt-6 flex items-center justify-center gap-2 border px-6 py-3 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out
        </button>

        <AlertDialog
          open={showLogoutConfirm}
          onOpenChange={setShowLogoutConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Sign Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? You'll need to sign in again
                to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmLogout}
                style={{ backgroundColor: "#C41E3A" }}
                className="bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
