import { useState } from "react";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Attempt login
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setIsLoading(false);
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : authError.message,
      );
      return;
    }

    // Login successful
    if (authData.user) {
      setIsLoading(false);
      onLogin();
    }
  };

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
            ADMIN DASHBOARD
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 shadow-2xl">
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
                  placeholder="••••••••"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-neutral-400 hover:text-[#dc2626] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
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
