import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('OAuth callback received');

    // Handle OAuth errors
    if (error) {
      console.error(`OAuth error: ${error} - ${errorDescription}`);
      return redirectWithError(`OAuth failed: ${errorDescription || error}`);
    }

    if (!code || !stateParam) {
      console.error('Missing code or state parameter');
      return redirectWithError('Missing authorization code or state');
    }

    // Decode state
    let stateData;
    try {
      stateData = JSON.parse(atob(stateParam));
    } catch (e) {
      console.error('Failed to decode state:', e);
      return redirectWithError('Invalid state parameter');
    }

    const { userId, organizationId, provider, redirectUrl } = stateData;
    console.log(`Processing OAuth callback for provider: ${provider}, userId: ${userId}`);

    // Get Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let tokens;

    if (provider === 'google') {
      tokens = await exchangeGoogleCode(code, supabaseUrl);
    } else if (provider === 'outlook') {
      tokens = await exchangeMicrosoftCode(code, supabaseUrl);
    } else {
      return redirectWithError(`Unsupported provider: ${provider}`);
    }

    if (!tokens) {
      return redirectWithError('Failed to exchange authorization code');
    }

    console.log(`Successfully obtained tokens for ${provider}`);

    // Store or update the connection in database
    const { error: dbError } = await supabase
      .from('provider_connections')
      .upsert({
        user_id: userId,
        organization_id: organizationId,
        provider: provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        is_connected: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return redirectWithError('Failed to save connection');
    }

    console.log(`Connection saved for ${provider}`);

    // Redirect back to the app
    const appUrl = getAppUrl();
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${appUrl}${redirectUrl || '/integrations'}?connected=${provider}`
      }
    });

  } catch (error: unknown) {
    console.error('OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return redirectWithError(message);
  }
});

async function exchangeGoogleCode(code: string, supabaseUrl: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback`;

  console.log('Exchanging Google authorization code');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google token exchange failed:', errorText);
    return null;
  }

  return await response.json();
}

async function exchangeMicrosoftCode(code: string, supabaseUrl: string) {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
  const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback`;

  console.log('Exchanging Microsoft authorization code');

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Microsoft token exchange failed:', errorText);
    return null;
  }

  return await response.json();
}

function getAppUrl(): string {
  // Return the Lovable app URL
  return 'https://jbzctydskdpzrejvpwpn.lovable.app';
}

function redirectWithError(message: string): Response {
  const appUrl = getAppUrl();
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${appUrl}/integrations?error=${encodeURIComponent(message)}`
    }
  });
}
