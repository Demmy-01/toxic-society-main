import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

/** Minimal User type — matches what the mock client stores in localStorage. */
export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  user_metadata?: Record<string, any>;
  is_admin?: boolean;
}

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
  /** Register a new account */
  signUp: (details: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ error?: string }>;
  /** Login with existing email + password */
  logIn: (details: {
    email: string;
    password: string;
  }) => Promise<{ error?: string }>;
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
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

  /** Create customer profile after sign-up or login */
  const createCustomerProfile = async (
    userId: string,
    details: { name: string; email: string; phone: string },
  ) => {
    try {
      await supabase
        .from("customers")
        .upsert(
          {
            user_id: userId,
            name: details.name,
            email: details.email,
            phone: details.phone,
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();
      await fetchProfile(userId);
    } catch (err) {
      console.warn("Failed to create customer profile:", err);
    }
  };

  /**
   * Register a new account with name, email, phone, password.
   */
  const signUp = async (details: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      name: details.name,
      email: details.email,
      phone: details.phone,
      password: details.password,
    });

    if (error) {
      return { error: error.message };
    }

    // Create customer profile
    const signedInUser = data?.user || data?.session?.user;
    if (signedInUser) {
      await createCustomerProfile(signedInUser.id, {
        name: details.name,
        email: details.email,
        phone: details.phone,
      });
    }

    return {};
  };

  /**
   * Login with email + password.
   */
  const logIn = async (details: {
    email: string;
    password: string;
  }): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: details.email,
      password: details.password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
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
        signUp,
        logIn,
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
