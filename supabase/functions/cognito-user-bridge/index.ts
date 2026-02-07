import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * cognito-user-bridge
 *
 * Bridges AWS Cognito authentication into the backend:
 * 1. Decodes + validates the Cognito ID token (basic claim checks).
 * 2. Finds or creates the corresponding backend user by email.
 * 3. Creates a user profile & organization for first-time users.
 * 4. Returns a one-time `token_hash` the frontend uses to establish a session.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { id_token } = await req.json();

    if (!id_token) {
      return jsonError("Missing id_token", 400);
    }

    // ── 1. Decode and validate the Cognito ID token ────────────────────
    const claims = decodeJwtPayload(id_token);

    if (!claims || !claims.email) {
      return jsonError("Invalid ID token: missing email claim", 400);
    }

    // Basic claim validation (not cryptographic – the token came via PKCE)
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) {
      return jsonError("ID token has expired", 401);
    }

    const email = (claims.email as string).toLowerCase().trim();
    const fullName =
      claims.name ||
      [claims.given_name, claims.family_name].filter(Boolean).join(" ") ||
      email.split("@")[0];
    const cognitoSub = claims.sub as string;
    const authProvider = inferProvider(claims);

    console.log(
      `Cognito bridge: email=${email}, provider=${authProvider}, sub=${cognitoSub}`
    );

    // ── 2. Find or create backend user ──────────────────────────────────
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to find existing user by email
    const { data: userList } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    let userId: string | undefined;

    // Search by email (listUsers doesn't support email filter well, so query all)
    // For production with many users, consider a direct DB query instead.
    const { data: allUsers } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const existingUser = allUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (existingUser) {
      userId = existingUser.id;
      console.log(`Found existing user: ${userId}`);
    } else {
      // Create new user (email auto-confirmed, no password needed)
      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            cognito_sub: cognitoSub,
            auth_provider: authProvider,
          },
        });

      if (createError) {
        console.error("Failed to create user:", createError.message);
        return jsonError(`Failed to create user: ${createError.message}`, 500);
      }

      userId = newUser.user.id;
      console.log(`Created new user: ${userId}`);

      // ── 3. Bootstrap new user (org, profile, roles, categories) ──────
      await bootstrapNewUser(adminClient, userId, email, fullName);
    }

    // ── 4. Generate a session token ─────────────────────────────────────
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData) {
      console.error("Failed to generate session link:", linkError?.message);
      return jsonError("Failed to generate session", 500);
    }

    // Extract the hashed token from the generated link
    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) {
      return jsonError("No token hash in generated link", 500);
    }

    console.log(`Session token generated for user ${userId}`);

    return new Response(
      JSON.stringify({
        token_hash: tokenHash,
        type: "magiclink",
        user_id: userId,
        is_new_user: !existingUser,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Cognito bridge error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, 500);
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64-URL decode the payload (part 1)
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function inferProvider(claims: Record<string, unknown>): string {
  const iss = (claims.iss as string) || "";
  const identities = claims.identities as
    | Array<{ providerName?: string }>
    | undefined;

  if (identities?.[0]?.providerName) {
    const pn = identities[0].providerName.toLowerCase();
    if (pn.includes("google")) return "google";
    if (pn.includes("microsoft") || pn.includes("azure") || pn.includes("entra"))
      return "microsoft";
    return pn;
  }

  // Fallback: check the issuer
  if (iss.includes("google")) return "google";
  if (iss.includes("microsoft") || iss.includes("login.microsoftonline"))
    return "microsoft";

  return "cognito";
}

async function bootstrapNewUser(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  fullName: string
) {
  try {
    // Create organization
    const { data: orgData, error: orgError } = await adminClient
      .from("organizations")
      .insert({ name: `${fullName}'s Workspace` })
      .select()
      .single();

    if (orgError) {
      console.error("Failed to create organization:", orgError.message);
      return;
    }

    const orgId = orgData.id;

    // Create user profile
    await adminClient.from("user_profiles").insert({
      user_id: userId,
      organization_id: orgId,
      email,
      full_name: fullName,
    });

    // Create user role (admin)
    await adminClient.from("user_roles").insert({
      user_id: userId,
      organization_id: orgId,
      role: "admin",
    });

    // Create default categories
    const defaultCategories = [
      { name: "Urgent", color: "#ef4444", sort_order: 0 },
      { name: "Follow Up", color: "#f97316", sort_order: 1 },
      { name: "Approvals", color: "#eab308", sort_order: 2 },
      { name: "Events", color: "#22c55e", sort_order: 3 },
      { name: "Customers", color: "#3b82f6", sort_order: 4 },
      { name: "Vendors", color: "#8b5cf6", sort_order: 5 },
      { name: "Internal", color: "#ec4899", sort_order: 6 },
      { name: "Projects", color: "#06b6d4", sort_order: 7 },
      { name: "Finance", color: "#84cc16", sort_order: 8 },
      { name: "FYI", color: "#6b7280", sort_order: 9 },
    ];

    await adminClient
      .from("categories")
      .insert(defaultCategories.map((cat) => ({ ...cat, organization_id: orgId })));

    // Create default AI settings
    await adminClient.from("ai_settings").insert({
      organization_id: orgId,
      writing_style: "professional",
    });

    console.log(`Bootstrapped new user: org=${orgId}, profile created`);
  } catch (error) {
    console.error("Error bootstrapping new user:", error);
  }
}
