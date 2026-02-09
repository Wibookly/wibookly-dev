import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * oauth-exchange
 *
 * Accepts a POST with { code, state } from the SPA after Google/Microsoft
 * redirects to /auth/callback with an authorization code.
 *
 * This is the Connect Gmail/Outlook flow ONLY — completely separate from
 * Cognito login/signup.
 *
 * redirect_uri used in the token exchange is always:
 *   https://app.wibookly.ai/auth/callback
 */

const CONNECT_REDIRECT_URI = 'https://app.wibookly.ai/auth/callback';

// AES-GCM encryption for tokens
async function encryptToken(token: string, keyString: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString.padEnd(32, '0').slice(0, 32));

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(token)
  );

  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT: expected 3 parts');
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return JSON.parse(atob(padded));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();

    console.log('[oauth-exchange] Flow: Connect Gmail/Outlook (NOT Cognito)');
    console.log('[oauth-exchange] redirect_uri:', CONNECT_REDIRECT_URI);

    if (!code || !state) {
      console.error('[oauth-exchange] Missing code or state');
      return jsonError('Missing code or state', 400);
    }

    // Decode state
    let stateData: {
      state: string;
      userId: string;
      organizationId: string;
      provider: string;
      appOrigin?: string;
      redirectUrl?: string;
    };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      console.error('[oauth-exchange] Invalid state parameter');
      return jsonError('Invalid state parameter', 400);
    }

    const { userId, organizationId, provider, redirectUrl } = stateData;

    console.log(`[oauth-exchange] provider=${provider}, userId=${userId}, payload=code`);

    if (!userId || !organizationId || !provider) {
      return jsonError('Incomplete state data', 400);
    }

    // Setup Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY')!;

    if (!encryptionKey) {
      console.error('[oauth-exchange] TOKEN_ENCRYPTION_KEY not configured');
      return jsonError('Server configuration error', 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    await logAttempt(supabase, userId, organizationId, provider, 'exchange_received');

    // Exchange authorization code for tokens
    let tokens;
    if (provider === 'google') {
      tokens = await exchangeGoogleCode(code);
    } else if (provider === 'outlook') {
      tokens = await exchangeMicrosoftCode(code);
    } else {
      await logAttempt(supabase, userId, organizationId, provider, 'exchange_error', 'unsupported_provider');
      return jsonError(`Unsupported provider: ${provider}`, 400);
    }

    if (!tokens) {
      await logAttempt(supabase, userId, organizationId, provider, 'exchange_error', 'token_exchange_failed');
      return jsonError('Failed to exchange authorization code', 502);
    }

    console.log(`[oauth-exchange] Token exchange successful for ${provider}`);

    // Validate id_token
    const idToken = tokens.id_token;
    if (!idToken || typeof idToken !== 'string') {
      console.error('[oauth-exchange] id_token missing from token response');
      await logAttempt(supabase, userId, organizationId, provider, 'exchange_error', 'id_token_missing');
      return jsonError('Identity token missing from provider response', 502);
    }

    let idTokenClaims: Record<string, unknown>;
    try {
      idTokenClaims = decodeJwtPayload(idToken);
      console.log('[oauth-exchange] id_token decoded, sub:', idTokenClaims.sub);
    } catch {
      await logAttempt(supabase, userId, organizationId, provider, 'exchange_error', 'id_token_decode_failed');
      return jsonError('Invalid identity token from provider', 502);
    }

    // Extract email
    let connectedEmail: string | null = (idTokenClaims.email as string) || null;
    if (!connectedEmail) {
      try {
        if (provider === 'google') {
          connectedEmail = await fetchGoogleEmail(tokens.access_token);
        } else if (provider === 'outlook') {
          connectedEmail = await fetchMicrosoftEmail(tokens.access_token);
        }
      } catch (e) {
        console.warn('[oauth-exchange] Fallback email fetch failed:', e);
      }
    }
    console.log(`[oauth-exchange] Connected email: ${connectedEmail}`);

    // Encrypt tokens
    const encryptedAccessToken = await encryptToken(tokens.access_token, encryptionKey);
    const encryptedRefreshToken = tokens.refresh_token
      ? await encryptToken(tokens.refresh_token, encryptionKey)
      : null;
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Store in vault
    const { error: vaultError } = await supabase
      .from('oauth_token_vault')
      .upsert(
        {
          user_id: userId,
          provider,
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

    if (vaultError) {
      console.error('[oauth-exchange] Vault error:', vaultError);
      await logAttempt(supabase, userId, organizationId, provider, 'exchange_error', 'vault_save_failed');
      return jsonError('Failed to save tokens securely', 500);
    }

    // Check existing connection
    const { data: existingConnection } = await supabase
      .from('provider_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();

    const isNewConnection = !existingConnection;

    // Upsert provider connection
    const { data: connectionData, error: dbError } = await supabase
      .from('provider_connections')
      .upsert(
        {
          user_id: userId,
          organization_id: organizationId,
          provider,
          is_connected: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          connected_email: connectedEmail,
          calendar_connected: true,
          calendar_connected_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      )
      .select('id')
      .single();

    if (dbError || !connectionData) {
      console.error('[oauth-exchange] DB error:', dbError);
      await logAttempt(supabase, userId, organizationId, provider, 'exchange_error', 'connection_save_failed');
      return jsonError('Failed to save connection', 500);
    }

    const connectionId = connectionData.id;
    console.log(`[oauth-exchange] Connection saved: ${connectionId} (new=${isNewConnection})`);

    // Initialize defaults for new connections
    if (isNewConnection) {
      await initializeDefaults(supabase, userId, organizationId, connectionId);
    }

    await logAttempt(supabase, userId, organizationId, provider, 'exchange_success');

    return new Response(
      JSON.stringify({
        success: true,
        provider,
        connectedEmail,
        redirectUrl: redirectUrl || '/integrations',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[oauth-exchange] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
});

// ── Token Exchange ──────────────────────────────────────────────

async function exchangeGoogleCode(code: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  console.log('[oauth-exchange] Exchanging Google code, redirect_uri:', CONNECT_REDIRECT_URI);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: CONNECT_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[oauth-exchange] Google token exchange failed:', errorText);
    return null;
  }

  return await response.json();
}

async function exchangeMicrosoftCode(code: string) {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');

  console.log('[oauth-exchange] Exchanging Microsoft code, redirect_uri:', CONNECT_REDIRECT_URI);

  const response = await fetch(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: CONNECT_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[oauth-exchange] Microsoft token exchange failed:', errorText);
    return null;
  }

  return await response.json();
}

// ── Email Fetch (fallback) ──────────────────────────────────────

async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.email || null;
}

async function fetchMicrosoftEmail(accessToken: string): Promise<string | null> {
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.mail || data.userPrincipalName || null;
}

// ── Default Initialization ──────────────────────────────────────

async function initializeDefaults(
  supabase: any,
  userId: string,
  organizationId: string,
  connectionId: string
) {
  console.log('[oauth-exchange] Initializing defaults for new connection');

  const defaultCategories = [
    { name: 'Urgent', color: '#EF4444', sort_order: 0 },
    { name: 'Follow Up', color: '#F97316', sort_order: 1 },
    { name: 'Approvals', color: '#EAB308', sort_order: 2 },
    { name: 'Meetings', color: '#22C55E', sort_order: 3 },
    { name: 'Customers', color: '#06B6D4', sort_order: 4 },
    { name: 'Vendors', color: '#3B82F6', sort_order: 5 },
    { name: 'Internal', color: '#8B5CF6', sort_order: 6 },
    { name: 'Projects', color: '#EC4899', sort_order: 7 },
    { name: 'Finance', color: '#14B8A6', sort_order: 8 },
    { name: 'FYI', color: '#6B7280', sort_order: 9 },
  ];

  const categoriesToInsert = defaultCategories.map((cat) => ({
    organization_id: organizationId,
    connection_id: connectionId,
    name: cat.name,
    color: cat.color,
    sort_order: cat.sort_order,
    is_enabled: true,
    ai_draft_enabled: false,
    auto_reply_enabled: false,
    writing_style: 'professional',
  }));

  const { error: catError } = await supabase
    .from('categories')
    .insert(categoriesToInsert);

  if (catError) console.error('[oauth-exchange] Failed to create categories:', catError);
  else console.log(`[oauth-exchange] Created ${defaultCategories.length} default categories`);

  const { error: aiError } = await supabase.from('ai_settings').insert({
    organization_id: organizationId,
    connection_id: connectionId,
    writing_style: 'professional',
    ai_draft_label_color: '#3B82F6',
    ai_sent_label_color: '#F97316',
  });
  if (aiError) console.error('[oauth-exchange] Failed to create AI settings:', aiError);

  const { error: profileError } = await supabase.from('email_profiles').insert({
    user_id: userId,
    organization_id: organizationId,
    connection_id: connectionId,
    full_name: null,
    title: null,
    email_signature: null,
  });
  if (profileError) console.error('[oauth-exchange] Failed to create email profile:', profileError);
}

// ── Logging ─────────────────────────────────────────────────────

async function logAttempt(
  supabase: any,
  userId: string,
  organizationId: string,
  provider: string,
  stage: string,
  errorCode?: string
): Promise<void> {
  try {
    await supabase.from('connect_attempts').insert({
      user_id: userId,
      organization_id: organizationId,
      provider,
      stage,
      error_code: errorCode || null,
      error_message: null,
      app_origin: 'app.wibookly.ai',
      meta: {},
    });
  } catch (e) {
    console.warn('[oauth-exchange] Failed to log attempt:', e);
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
