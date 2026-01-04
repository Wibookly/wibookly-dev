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

// Apply Gmail filter for a rule
async function applyGmailFilter(accessToken: string, rule: any, labelId: string): Promise<boolean> {
  try {
    let criteria: any = {};
    
    if (rule.rule_type === 'sender') {
      criteria.from = rule.rule_value;
    } else if (rule.rule_type === 'domain') {
      criteria.from = `@${rule.rule_value}`;
    } else if (rule.rule_type === 'keyword') {
      criteria.query = rule.rule_value;
    }

    // Create filter
    const filterRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/filters', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        criteria,
        action: {
          addLabelIds: [labelId],
          removeLabelIds: []
        }
      })
    });

    if (!filterRes.ok) {
      const errorText = await filterRes.text();
      // Check if filter already exists (409 conflict)
      if (filterRes.status === 409) {
        console.log(`Gmail filter for "${rule.rule_value}" already exists`);
        return true;
      }
      console.error(`Failed to create Gmail filter:`, errorText);
      return false;
    }

    console.log(`Created Gmail filter for: ${rule.rule_value}`);
    return true;
  } catch (error) {
    console.error(`Error creating Gmail filter:`, error);
    return false;
  }
}

// Apply Outlook rule
async function applyOutlookRule(accessToken: string, rule: any, folderId: string, ruleName: string): Promise<boolean> {
  try {
    // Check if rule already exists
    const listRes = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messageRules', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!listRes.ok) {
      console.error('Failed to list Outlook rules:', await listRes.text());
      return false;
    }

    const { value: existingRules } = await listRes.json();
    const exists = existingRules?.some((r: { displayName: string }) => r.displayName === ruleName);

    if (exists) {
      console.log(`Outlook rule "${ruleName}" already exists`);
      return true;
    }

    // Build conditions based on rule type
    let conditions: any = {};
    
    if (rule.rule_type === 'sender') {
      conditions.senderContains = [rule.rule_value];
    } else if (rule.rule_type === 'domain') {
      conditions.senderContains = [`@${rule.rule_value}`];
    } else if (rule.rule_type === 'keyword') {
      conditions.subjectOrBodyContains = [rule.rule_value];
    }

    // Create rule
    const createRes = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messageRules', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayName: ruleName,
        sequence: 1,
        isEnabled: true,
        conditions,
        actions: {
          moveToFolder: folderId
        }
      })
    });

    if (!createRes.ok) {
      console.error(`Failed to create Outlook rule "${ruleName}":`, await createRes.text());
      return false;
    }

    console.log(`Created Outlook rule: ${ruleName}`);
    return true;
  } catch (error) {
    console.error(`Error creating Outlook rule "${ruleName}":`, error);
    return false;
  }
}

// Get Gmail label ID by name
async function getGmailLabelId(accessToken: string, labelName: string): Promise<string | null> {
  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!res.ok) return null;
    
    const { labels } = await res.json();
    const label = labels?.find((l: { name: string, id: string }) => l.name === labelName);
    return label?.id || null;
  } catch {
    return null;
  }
}

// Get Outlook folder ID by name
async function getOutlookFolderId(accessToken: string, folderName: string): Promise<string | null> {
  try {
    const res = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!res.ok) return null;
    
    const { value: folders } = await res.json();
    const folder = folders?.find((f: { displayName: string, id: string }) => f.displayName === folderName);
    return folder?.id || null;
  } catch {
    return null;
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

    // Parse request body for optional rule_id filter
    let ruleId: string | null = null;
    try {
      const body = await req.json();
      ruleId = body?.rule_id || null;
    } catch {
      // No body or invalid JSON - run all rules
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

    // Get rules with category info
    let rulesQuery = supabaseAdmin
      .from('rules')
      .select(`
        id,
        rule_type,
        rule_value,
        is_enabled,
        category_id,
        categories!inner(name, is_enabled, sort_order)
      `)
      .eq('organization_id', profile.organization_id)
      .eq('is_enabled', true);

    if (ruleId) {
      rulesQuery = rulesQuery.eq('id', ruleId);
    }

    const { data: rules, error: rulesError } = await rulesQuery;

    if (rulesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch rules' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter rules where category is enabled
    const enabledRules = rules?.filter(r => (r.categories as any)?.is_enabled) || [];

    if (enabledRules.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No enabled rules found', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY')!;

    // Get tokens from vault
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('oauth_token_vault')
      .select('provider, encrypted_access_token')
      .eq('user_id', user.id);

    if (tokenError || !tokenData?.length) {
      return new Response(
        JSON.stringify({ error: 'No connected email providers found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all categories for numbering
    const { data: allCategories } = await supabaseAdmin
      .from('categories')
      .select('id, name, sort_order')
      .eq('organization_id', profile.organization_id)
      .order('sort_order');

    const categoryMap = new Map(allCategories?.map((c, i) => [c.id, { name: c.name, index: i }]));

    const results: { provider: string; synced: number; failed: number }[] = [];

    // Process each connected provider
    for (const token of tokenData) {
      try {
        const accessToken = await decryptToken(token.encrypted_access_token, encryptionKey);
        let synced = 0;
        let failed = 0;

        for (const rule of enabledRules) {
          const catInfo = categoryMap.get(rule.category_id);
          if (!catInfo) continue;

          const labelName = `${catInfo.index + 1}: ${catInfo.name}`;
          let success = false;
          
          if (token.provider === 'google') {
            const labelId = await getGmailLabelId(accessToken, labelName);
            if (labelId) {
              success = await applyGmailFilter(accessToken, rule, labelId);
            } else {
              console.log(`Gmail label "${labelName}" not found - please sync categories first`);
            }
          } else if (token.provider === 'microsoft') {
            const folderId = await getOutlookFolderId(accessToken, labelName);
            if (folderId) {
              const ruleName = `Wibookly: ${rule.rule_type} - ${rule.rule_value}`;
              success = await applyOutlookRule(accessToken, rule, folderId, ruleName);
            } else {
              console.log(`Outlook folder "${labelName}" not found - please sync categories first`);
            }
          }
          
          if (success) synced++;
          else failed++;
        }

        results.push({ provider: token.provider, synced, failed });
      } catch (error) {
        console.error(`Failed to process ${token.provider}:`, error);
        results.push({ provider: token.provider, synced: 0, failed: enabledRules.length });
      }
    }

    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Synced ${totalSynced} rule(s) across ${results.length} provider(s)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Sync rules error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
