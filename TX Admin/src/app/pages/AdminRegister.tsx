import { useState, useEffect } from "react";
import { Lock, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface AdminRegisterProps {
  onRegisterComplete: () => void;
}

export default function AdminRegister({
  onRegisterComplete,
}: AdminRegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [canRegister, setCanRegister] = useState(true);
  const [checkingAdmins, setCheckingAdmins] = useState(true);

  // Check if any admin users exist
  useEffect(() => {
    const checkExistingAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("is_admin", true);

        if (error) {
          // Table doesn't exist yet or error - allow registration
          setCanRegister(true);
        } else if (data && Array.isArray(data) && data.length > 0) {
          // Admin already exists
          setCanRegister(false);
          setError(
            "An admin account already exists. Please use the login page.",
          );
        } else {
          // No admins exist - allow registration
          setCanRegister(true);
        }
      } catch (err) {
        console.error("Error checking admins:", err);
        setCanRegister(true);
      } finally {
        setCheckingAdmins(false);
      }
    };

    checkExistingAdmins();
  }, []);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Register admin via our Python backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: "Admin", is_admin: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.detail || "Failed to create admin account. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess("Admin account created successfully! Redirecting to login...");
      setTimeout(() => {
        onRegisterComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  if (checkingAdmins) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!canRegister) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="inline-block">
              <h1 className="text-4xl tracking-tight mb-2 text-white">
                TOXIC SOCIETY
              </h1>
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent"></div>
            </div>
            <p className="text-neutral-400 mt-4 text-sm tracking-wide">
              ADMIN DASHBOARD
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-yellow-500" />
              <h2 className="text-xl text-white">Admin Already Exists</h2>
              <p className="text-neutral-400 text-center text-sm">
                An admin account has already been created. Please use the login
                page to access the dashboard.
              </p>
              <a
                href="/admin/login"
                className="mt-4 px-6 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl transition-colors"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <h1 className="text-4xl tracking-tight mb-2 text-white">
              TOXIC SOCIETY
            </h1>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent"></div>
          </div>
          <p className="text-neutral-400 mt-4 text-sm tracking-wide">
            ADMIN SETUP
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl text-white mb-2">Create Admin Account</h2>
            <p className="text-neutral-400 text-sm">
              Set up your first admin account. This can only be done once.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-neutral-300 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@toxicsociety.com"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-neutral-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-neutral-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Admin Account"}
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-neutral-500 text-xs mt-8">
          © 2026 Toxic Society. All rights reserved.
        </p>
      </div>
    </div>
  );
}
