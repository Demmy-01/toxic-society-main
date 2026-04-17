import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  email: string;
  password: string;
}

serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405 }
    );
  }

  try {
    const { email, password } = (await req.json()) as RequestBody;

    // Validate inputs
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "Email and password required" }),
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Password must be at least 8 characters",
        }),
        { status: 400 }
      );
    }

    // Create admin client with service role (bypasses RLS and rate limits)
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if admin already exists
    const { data: existingAdmins } = await adminClient
      .from("admin_users")
      .select("id", { count: "exact" });

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Admin account already exists",
        }),
        { status: 400 }
      );
    }

    // Create auth user with admin API (no rate limiting)
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authError.message || "Failed to create auth user",
        }),
        { status: 400 }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User creation failed",
        }),
        { status: 500 }
      );
    }

    // Create admin record
    const { error: adminError } = await adminClient
      .from("admin_users")
      .insert({
        id: authData.user.id,
        email,
        role: "admin",
        is_owner: true,
      });

    if (adminError) {
      // Delete the auth user if admin record creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create admin record. Please try again.",
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account created successfully",
        user_id: authData.user.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      { status: 500 }
    );
  }
});
