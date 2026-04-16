import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, LogOut, Edit2, Save, X, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export function Account() {
  const navigate = useNavigate();
  const {
    user,
    customerProfile,
    signOut,
    signInWithGoogle,
    loading: authLoading,
    setShowCheckoutModal,
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    delivery_location: "",
  });

  // Initialize form with customer profile data and auto-enable edit mode if no profile exists
  useEffect(() => {
    if (user && !authLoading) {
      // Close any open checkout modal
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
        // If user just signed in but has no profile, auto-enable edit mode
        setFormData({
          name: "",
          email: user.email || "",
          phone: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Not logged in state
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

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <User size={48} className="mx-auto mb-6 text-gray-200" />
          <p
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "3px",
            }}
            className="text-4xl text-gray-200 mb-4"
          >
            Welcome
          </p>
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-sm text-gray-400 mb-8"
          >
            Sign in to your account to view and manage your profile information.
          </p>
          <button
            onClick={() => signInWithGoogle(false)}
            style={{
              backgroundColor: "#C41E3A",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "2px",
            }}
            className="w-full text-white px-10 py-4 text-lg hover:bg-red-800 transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
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

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center min-h-96">
          <Loader2 size={32} className="text-gray-300 animate-spin" />
        </div>
      </div>
    );
  }

  // Logged in state
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
          {/* Card Header */}
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

          {/* Card Content */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Name */}
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

              {/* Email */}
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

              {/* Phone */}
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

              {/* Delivery Address */}
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

          {/* Card Footer */}
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

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            borderColor: "#E5E7EB",
            fontFamily: "'Inter', sans-serif",
            color: "#6B7280",
          }}
          className="w-full mt-6 flex items-center justify-center gap-2 border px-6 py-3 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
