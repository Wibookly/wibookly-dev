import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v5.2.2/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Cognito configuration ────────────────────────────────────────────────
const COGNITO_USER_POOL_ID = "us-west-2_mALN2509g";
const COGNITO_CLIENT_ID = "3k0v6stp6l5abmgsg6ja5rcauo";
const COGNITO_REGION = "us-west-2";
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
const COGNITO_JWKS_URL = `${COGNITO_ISSUER}/.well-known/jwks.json`;

// Cache the JWKS to avoid refetching on every request
let cachedJWKS: jose.JSONWebKeySet | null = null;
let jwksCachedAt = 0;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getJWKS(): Promise<jose.JSONWebKeySet> {
  const now = Date.now();
  if (cachedJWKS && now - jwksCachedAt < JWKS_CACHE_TTL_MS) {
    return cachedJWKS;
  }
  const response = await fetch(COGNITO_JWKS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }
  cachedJWKS = await response.json();
  jwksCachedAt = now;
  return cachedJWKS!;
}

/**
 * Verify a Cognito ID token cryptographically:
 * 1. Fetch the JWKS from Cognito.
 * 2. Find the matching key by `kid`.
 * 3. Verify signature, expiration, issuer, audience, and token_use.
 */
async function verifyCognitoIdToken(
  idToken: string
): Promise<Record<string, unknown>> {
  // ── Pre-check: ensure the value is a JWT (3 dot-separated segments) ──
  if (typeof idToken !== 'string' || idToken.split('.').length !== 3) {
    throw new Error(
      'Value is not a JWT (expected 3 dot-separated segments). ' +
      'An OAuth authorization code cannot be verified as a JWT.'
    );
  }

  // ── Pre-check: verify the issuer is Cognito BEFORE doing JWKS lookup ──
  // This rejects Google / Microsoft tokens immediately with a clear message.
  try {
    const payloadB64 = idToken.split('.')[1];
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      payloadB64.length + (4 - (payloadB64.length % 4)) % 4, '='
    );
    const rawPayload = JSON.parse(atob(padded));
    const tokenIssuer = rawPayload.iss || '';

    if (!tokenIssuer.includes('cognito-idp') || !tokenIssuer.includes(COGNITO_USER_POOL_ID)) {
      throw new Error(
        `Token issuer "${tokenIssuer}" is not this Cognito User Pool. ` +
        'This endpoint only accepts Cognito ID tokens. ' +
        'Gmail/Outlook tokens must use the oauth-callback endpoint instead.'
      );
    }
  } catch (decodeErr) {
    if (decodeErr instanceof Error && decodeErr.message.includes('Token issuer')) {
      throw decodeErr; // Re-throw issuer mismatch
    }
    throw new Error('Failed to decode token payload for issuer check.');
  }

  const jwks = await getJWKS();

  // Decode the header to get the kid
  const header = jose.decodeProtectedHeader(idToken);
  const kid = header.kid;
  if (!kid) {
    throw new Error("ID token header missing 'kid'");
  }

  // Find the matching key in the JWKS
  const key = jwks.keys.find((k: Record<string, unknown>) => k.kid === kid);
  if (!key) {
    throw new Error(`No matching key found in JWKS for kid: ${kid}`);
  }

  // Import the public key
  const publicKey = await jose.importJWK(key as jose.JWK, header.alg as string);

  // Verify the token — first arg MUST be the JWT string, second is the key
  const { payload } = await jose.jwtVerify(idToken, publicKey, {
    issuer: COGNITO_ISSUER,
    audience: COGNITO_CLIENT_ID,
  });

  // Additional Cognito-specific validations
  if (payload.token_use !== "id") {
    throw new Error(
      `Invalid token_use: expected 'id', got '${payload.token_use}'`
    );
  }

  if (!payload.email) {
    throw new Error("ID token missing 'email' claim");
  }

  return payload as Record<string, unknown>;
}

/**
 * cognito-user-bridge
 *
 * Bridges AWS Cognito authentication into the backend:
 * 1. Cryptographically verifies the Cognito ID token (JWKS).
 * 2. Finds or creates the corresponding backend user by email.
 * 3. Creates a user profile & organization for first-time users.
 * 4. Returns a one-time `token_hash` the frontend uses to establish a session.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawToken = body?.id_token;

    if (!rawToken) {
      return jsonError("Missing id_token in request body", 400);
    }

    if (typeof rawToken !== "string") {
      console.error(
        "id_token is not a string. Received type:",
        typeof rawToken,
        "value preview:",
        JSON.stringify(rawToken).slice(0, 120)
      );
      return jsonError(
        `id_token must be a JWT string, received ${typeof rawToken}`,
        400
      );
    }

    // Clean the token: trim whitespace, remove any accidental wrapping quotes
    const id_token = rawToken.trim();

    if (id_token.split(".").length !== 3) {
      console.error(
        "id_token does not look like a JWT (expected 3 dot-separated segments). Length:",
        id_token.length,
        "Preview:",
        id_token.slice(0, 60)
      );
      return jsonError("id_token is not a valid JWT format", 400);
    }

    console.log(
      "id_token validated: type=string, segments=3, length=",
      id_token.length
    );

    // ── 1. Cryptographically verify the Cognito ID token ──────────────
    let claims: Record<string, unknown>;
    try {
      claims = await verifyCognitoIdToken(id_token);
    } catch (verifyError) {
      console.error("JWT verification failed:", verifyError);
      const msg =
        verifyError instanceof Error
          ? verifyError.message
          : "Token verification failed";
      return jsonError(`Token verification failed: ${msg}`, 401);
    }

    const email = (claims.email as string).toLowerCase().trim();
    const fullName =
      (claims.name as string) ||
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

    // First check if a user_profile already exists for this email
    const { data: existingProfile } = await adminClient
      .from("user_profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    let userId: string;
    let isNewUser = false;
    if (existingProfile) {
      // User already exists in our system — reuse their auth user
      userId = existingProfile.user_id;
      console.log(`Found existing user via profile: ${userId}`);
    } else {
      // Check auth.users by email as fallback
      const { data: allUsers } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const existingUser = allUsers?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );

      if (existingUser) {
        userId = existingUser.id;
        console.log(`Found existing auth user: ${userId}`);
        
        // Check if profile exists for this user_id (might be missing)
        const { data: profileCheck } = await adminClient
          .from("user_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (!profileCheck) {
          // Profile missing for existing auth user — bootstrap it
          await bootstrapNewUser(adminClient, userId, email, fullName, authProvider);
        }
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
        isNewUser = true;
        console.log(`Created new user: ${userId}`);

        // ── 3. Bootstrap new user (org, profile, roles, categories) ──────
        await bootstrapNewUser(adminClient, userId, email, fullName, authProvider);
      }
    }

    // ── 4. Check if user is suspended ──────────────────────────────────
    const { data: suspendCheck } = await adminClient
      .from("user_profiles")
      .select("is_suspended, suspended_reason")
      .eq("user_id", userId)
      .maybeSingle();

    if (suspendCheck?.is_suspended) {
      console.log(`User ${userId} is suspended. Blocking login.`);
      return new Response(
        JSON.stringify({
          error: "account_suspended",
          message: suspendCheck.suspended_reason || "Your account has been suspended. If you have any questions, please reach out to support@wibookly.ai",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 5. Generate a session token ─────────────────────────────────────
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData) {
      console.error("Failed to generate session link:", linkError?.message);
      return jsonError("Failed to generate session", 500);
    }

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
        is_new_user: isNewUser,
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

function inferProvider(claims: Record<string, unknown>): string {
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

  const iss = (claims.iss as string) || "";
  if (iss.includes("google")) return "google";
  if (iss.includes("microsoft") || iss.includes("login.microsoftonline"))
    return "microsoft";

  return "cognito";
}

async function bootstrapNewUser(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  fullName: string,
  authProvider?: string
) {
  try {
    // ── Check if user already has an organization (avoid duplicates) ──
    const { data: existingOrg } = await adminClient
      .from("user_profiles")
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingOrg) {
      console.log(`User ${userId} already has org ${existingOrg.organization_id}, skipping bootstrap`);
      return;
    }

    // Also check organization_members to catch edge cases
    const { data: existingMembership } = await adminClient
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();

    let orgId: string;

    if (existingMembership) {
      orgId = existingMembership.organization_id;
      console.log(`User ${userId} has existing membership in org ${orgId}, reusing`);
    } else {
      // Check user_roles too
      const { data: existingRole } = await adminClient
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        orgId = existingRole.organization_id;
        console.log(`User ${userId} has existing role in org ${orgId}, reusing`);
      } else {
        // Create new organization only if none exists
        const { data: orgData, error: orgError } = await adminClient
          .from("organizations")
          .insert({ name: `${fullName}'s Workspace` })
          .select()
          .single();

        if (orgError) {
          console.error("Failed to create organization:", orgError.message);
          return;
        }
        orgId = orgData.id;
        console.log(`Created new org ${orgId} for user ${userId}`);
      }
    }

    // Create user profile (upsert to avoid conflicts)
    const { error: profileError } = await adminClient
      .from("user_profiles")
      .upsert({
        user_id: userId,
        organization_id: orgId,
        email,
        full_name: fullName,
      }, { onConflict: "user_id" });

    if (profileError) {
      // If upsert fails due to no unique constraint on user_id, try insert
      await adminClient.from("user_profiles").insert({
        user_id: userId,
        organization_id: orgId,
        email,
        full_name: fullName,
      });
    }

    // Create user role (admin) — only if one doesn't exist
    const { data: roleCheck } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!roleCheck) {
      await adminClient.from("user_roles").insert({
        user_id: userId,
        organization_id: orgId,
        role: "admin",
      });
    }

    // Create organization membership — only if one doesn't exist
    const { data: memCheck } = await adminClient
      .from("organization_members")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!memCheck) {
      await adminClient.from("organization_members").insert({
        user_id: userId,
        organization_id: orgId,
        role: "admin",
      });
    }

    // Auto-create provider connection if signed up via Google or Microsoft
    if (authProvider === "google" || authProvider === "microsoft") {
      const providerName = authProvider === "microsoft" ? "outlook" : "google";

      // Check if connection already exists
      const { data: existingConn } = await adminClient
        .from("provider_connections")
        .select("id")
        .eq("user_id", userId)
        .eq("provider", providerName)
        .maybeSingle();

      if (!existingConn) {
        const { error: connError } = await adminClient
          .from("provider_connections")
          .insert({
            user_id: userId,
            organization_id: orgId,
            provider: providerName,
            connected_email: email,
            is_connected: true,
            connected_at: new Date().toISOString(),
          });

        if (connError) {
          console.error("Failed to auto-create provider connection:", connError.message);
        } else {
          console.log(`Auto-connected ${providerName} for ${email}`);

          const { data: connData } = await adminClient
            .from("provider_connections")
            .select("id")
            .eq("user_id", userId)
            .eq("provider", providerName)
            .maybeSingle();

          if (connData) {
            await adminClient.from("email_profiles").insert({
              user_id: userId,
              organization_id: orgId,
              connection_id: connData.id,
              full_name: fullName,
              signature_enabled: false,
            });
          }
        }
      }
    }

    // Create default categories only if none exist for this org
    const { data: existingCats } = await adminClient
      .from("categories")
      .select("id")
      .eq("organization_id", orgId)
      .limit(1);

    if (!existingCats || existingCats.length === 0) {
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
        .insert(
          defaultCategories.map((cat) => ({ ...cat, organization_id: orgId }))
        );
    }

    // Create default AI settings only if none exist
    const { data: existingSettings } = await adminClient
      .from("ai_settings")
      .select("id")
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!existingSettings) {
      await adminClient.from("ai_settings").insert({
        organization_id: orgId,
        writing_style: "professional",
      });
    }

    console.log(`Bootstrapped user: org=${orgId}, profile created, provider=${authProvider || 'none'}`);
  } catch (error) {
    console.error("Error bootstrapping new user:", error);
  }
}
