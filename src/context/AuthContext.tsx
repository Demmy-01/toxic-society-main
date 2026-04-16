import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface CustomerProfile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  delivery_location: string | null;
}

interface AuthContextType {
  user: User | null;
  customerProfile: CustomerProfile | null;
  loading: boolean;
  signInWithGoogle: (fromCheckout?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  saveCustomerProfile: (
    profile: Omit<CustomerProfile, "id" | "user_id">,
  ) => Promise<void>;
  showCheckoutModal: boolean;
  setShowCheckoutModal: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setCustomerProfile(data ?? null);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes (including OAuth redirect callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        // If returning from Google OAuth during checkout, re-open modal
        if (
          _event === "SIGNED_IN" &&
          sessionStorage.getItem("ts_checkout_pending") === "true"
        ) {
          setShowCheckoutModal(true);
          sessionStorage.removeItem("ts_checkout_pending");
        }
      } else {
        setCustomerProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = async (fromCheckout: boolean = false) => {
    // Only mark checkout pending if signing in from checkout flow
    if (fromCheckout) {
      sessionStorage.setItem("ts_checkout_pending", "true");
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const saveCustomerProfile = async (
    profile: Omit<CustomerProfile, "id" | "user_id">,
  ) => {
    if (!user) return;
    const { data } = await supabase
      .from("customers")
      .upsert(
        { user_id: user.id, ...profile, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (data) setCustomerProfile(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        loading,
        signInWithGoogle,
        signOut,
        saveCustomerProfile,
        showCheckoutModal,
        setShowCheckoutModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
