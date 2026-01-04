import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, userId, organizationId, redirectUrl } = await req.json();
    
    console.log(`OAuth init request for provider: ${provider}, userId: ${userId}`);

    if (!provider || !userId || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: provider, userId, organizationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();
    
    // Store the state in a simple format to pass to callback
    const stateData = btoa(JSON.stringify({
      state,
      userId,
      organizationId,
      provider,
      redirectUrl: redirectUrl || '/integrations'
    }));

    let authUrl: string;

    if (provider === 'google') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      if (!clientId) {
        console.error('GOOGLE_CLIENT_ID not configured');
        return new Response(
          JSON.stringify({ error: 'Google OAuth not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback`;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
        access_type: 'offline',
        prompt: 'consent',
        state: stateData
      });

      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      console.log('Generated Google OAuth URL');

    } else if (provider === 'outlook') {
      const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
      if (!clientId) {
        console.error('MICROSOFT_CLIENT_ID not configured');
        return new Response(
          JSON.stringify({ error: 'Microsoft OAuth not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback`;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'openid email profile offline_access https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite',
        response_mode: 'query',
        state: stateData
      });

      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
      console.log('Generated Microsoft OAuth URL');

    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('OAuth init error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
