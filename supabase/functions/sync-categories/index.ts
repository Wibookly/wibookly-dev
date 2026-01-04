import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-GCM decryption for tokens (server-side only)
async function decryptToken(encryptedData: string, keyString: string): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString.padEnd(32, '0').slice(0, 32));
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return new TextDecoder().decode(decrypted);
}

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

// Refresh Google access token using refresh token
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  console.log('Refreshing Google access token...');
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'refresh_token'
    })
  });
  
  if (!response.ok) {
    console.error('Failed to refresh Google token:', await response.text());
    return null;
  }
  
  const tokens = await response.json();
  console.log('Successfully refreshed Google token');
  return tokens;
}

// Refresh Microsoft access token using refresh token
async function refreshMicrosoftToken(refreshToken: string): Promise<{ access_token: string; refresh_token?: string; expires_in: number } | null> {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
  
  console.log('Refreshing Microsoft access token...');
  
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'refresh_token'
    })
  });
  
  if (!response.ok) {
    console.error('Failed to refresh Microsoft token:', await response.text());
    return null;
  }
  
  const tokens = await response.json();
  console.log('Successfully refreshed Microsoft token');
  return tokens;
}

interface TokenData {
  provider: string;
  encrypted_access_token: string;
  encrypted_refresh_token: string | null;
  expires_at: string | null;
}

// Get valid access token, refreshing if expired
// deno-lint-ignore no-explicit-any
async function getValidAccessToken(
  tokenData: TokenData,
  encryptionKey: string,
  supabaseAdmin: any,
  userId: string
): Promise<string | null> {
  const isExpired = tokenData.expires_at && new Date(tokenData.expires_at) < new Date();
  
  // If not expired, return decrypted access token
  if (!isExpired) {
    return await decryptToken(tokenData.encrypted_access_token, encryptionKey);
  }
  
  console.log(`Token for ${tokenData.provider} is expired, attempting refresh...`);
  
  // Need to refresh - check if we have a refresh token
  if (!tokenData.encrypted_refresh_token) {
    console.error(`No refresh token available for ${tokenData.provider}`);
    return null;
  }
  
  const refreshToken = await decryptToken(tokenData.encrypted_refresh_token, encryptionKey);
  let newTokens;
  
  if (tokenData.provider === 'google') {
    newTokens = await refreshGoogleToken(refreshToken);
  } else if (tokenData.provider === 'microsoft') {
    newTokens = await refreshMicrosoftToken(refreshToken);
  }
  
  if (!newTokens) {
    console.error(`Failed to refresh token for ${tokenData.provider}`);
    return null;
  }
  
  // Encrypt and save new tokens
  const encryptedAccessToken = await encryptToken(newTokens.access_token, encryptionKey);
  const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
  
  // Update token in vault using direct fetch to avoid type issues
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const updatePayload: Record<string, string> = {
    encrypted_access_token: encryptedAccessToken,
    expires_at: expiresAt,
    updated_at: new Date().toISOString()
  };
  
  // Microsoft may return a new refresh token
  if (tokenData.provider === 'microsoft' && 'refresh_token' in newTokens && newTokens.refresh_token) {
    updatePayload.encrypted_refresh_token = await encryptToken(String(newTokens.refresh_token), encryptionKey);
  }
  
  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/oauth_token_vault?user_id=eq.${userId}&provider=eq.${tokenData.provider}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updatePayload)
    }
  );
  
  if (!updateResponse.ok) {
    console.error(`Failed to save refreshed token for ${tokenData.provider}:`, await updateResponse.text());
  } else {
    console.log(`Saved refreshed token for ${tokenData.provider}`);
  }
  
  return newTokens.access_token;
}

// Create Gmail label
async function createGmailLabel(accessToken: string, labelName: string): Promise<boolean> {
  try {
    // Check if label already exists
    const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!listRes.ok) {
      console.error('Failed to list Gmail labels:', await listRes.text());
      return false;
    }
    
    const { labels } = await listRes.json();
    const exists = labels?.some((l: { name: string }) => l.name === labelName);
    
    if (exists) {
      console.log(`Gmail label "${labelName}" already exists`);
      return true;
    }
    
    // Create the label
    const createRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      })
    });
    
    if (!createRes.ok) {
      console.error(`Failed to create Gmail label "${labelName}":`, await createRes.text());
      return false;
    }
    
    console.log(`Created Gmail label: ${labelName}`);
    return true;
  } catch (error) {
    console.error(`Error creating Gmail label "${labelName}":`, error);
    return false;
  }
}

// Create Outlook folder
async function createOutlookFolder(accessToken: string, folderName: string): Promise<boolean> {
  try {
    // Check if folder already exists
    const listRes = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!listRes.ok) {
      console.error('Failed to list Outlook folders:', await listRes.text());
      return false;
    }
    
    const { value: folders } = await listRes.json();
    const exists = folders?.some((f: { displayName: string }) => f.displayName === folderName);
    
    if (exists) {
      console.log(`Outlook folder "${folderName}" already exists`);
      return true;
    }
    
    // Create the folder
    const createRes = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ displayName: folderName })
    });
    
    if (!createRes.ok) {
      console.error(`Failed to create Outlook folder "${folderName}":`, await createRes.text());
      return false;
    }
    
    console.log(`Created Outlook folder: ${folderName}`);
    return true;
  } catch (error) {
    console.error(`Error creating Outlook folder "${folderName}":`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's organization using RPC function
    const { data: profileData } = await supabaseUserClient.rpc('get_my_profile');
    const profile = profileData?.[0];
    
    if (!profile?.organization_id) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get categories for the organization with sort_order for numbering
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('id, name, is_enabled, sort_order')
      .eq('organization_id', profile.organization_id)
      .eq('is_enabled', true)
      .order('sort_order');

    if (catError || !categories) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch categories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY')!;

    // Get tokens from vault (including refresh token and expiry for refresh logic)
    const { data: tokenDataList, error: tokenError } = await supabaseAdmin
      .from('oauth_token_vault')
      .select('provider, encrypted_access_token, encrypted_refresh_token, expires_at')
      .eq('user_id', user.id);

    if (tokenError || !tokenDataList?.length) {
      return new Response(
        JSON.stringify({ error: 'No connected email providers found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { provider: string; created: number; failed: number }[] = [];
    const syncedCategoryIds: string[] = [];

    // Process each connected provider
    for (const tokenRecord of tokenDataList) {
      try {
        // Get valid access token (will refresh if expired)
        const accessToken = await getValidAccessToken(
          tokenRecord as TokenData, 
          encryptionKey, 
          supabaseAdmin, 
          user.id
        );
        
        if (!accessToken) {
          console.error(`Could not get valid access token for ${tokenRecord.provider}`);
          results.push({ provider: tokenRecord.provider, created: 0, failed: categories.length });
          continue;
        }
        let created = 0;
        let failed = 0;

        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          // Create label/folder name with number prefix based on sort_order position
          const labelName = `${i + 1}: ${category.name}`;
          let success = false;
          
          if (tokenRecord.provider === 'google') {
            success = await createGmailLabel(accessToken, labelName);
          } else if (tokenRecord.provider === 'microsoft') {
            success = await createOutlookFolder(accessToken, labelName);
          }
          
          if (success) {
            created++;
            // Track successfully synced categories
            if (!syncedCategoryIds.includes(category.id)) {
              syncedCategoryIds.push(category.id);
            }
          } else {
            failed++;
          }
        }

        results.push({ provider: tokenRecord.provider, created, failed });
      } catch (error) {
        console.error(`Failed to process ${tokenRecord.provider}:`, error);
        results.push({ provider: tokenRecord.provider, created: 0, failed: categories.length });
      }
    }

    // Update last_synced_at for successfully synced categories
    if (syncedCategoryIds.length > 0) {
      const now = new Date().toISOString();
      await supabaseAdmin
        .from('categories')
        .update({ last_synced_at: now })
        .in('id', syncedCategoryIds);
      console.log(`Updated last_synced_at for ${syncedCategoryIds.length} categories`);
    }

    const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        syncedCategoryIds,
        message: `Synced ${totalCreated} labels/folders across ${results.length} provider(s)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Sync categories error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
