import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is a super_admin
    const authHeader = req.headers.get("Authorization")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check super_admin role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: super_admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "delete_account": {
        const { target_user_id } = body;
        if (!target_user_id) throw new Error("target_user_id required");
        if (target_user_id === caller.id) throw new Error("Cannot delete your own account");

        // Delete all related data in order
        await adminClient.from("ai_chat_messages").delete().in(
          "conversation_id",
          (await adminClient.from("ai_chat_conversations").select("id").eq("user_id", target_user_id)).data?.map((c: any) => c.id) || []
        );
        await adminClient.from("ai_chat_conversations").delete().eq("user_id", target_user_id);
        await adminClient.from("ai_activity_logs").delete().eq("user_id", target_user_id);
        await adminClient.from("availability_hours").delete().eq("user_id", target_user_id);
        await adminClient.from("email_profiles").delete().eq("user_id", target_user_id);
        await adminClient.from("ai_settings").delete().eq("organization_id",
          (await adminClient.from("user_profiles").select("organization_id").eq("user_id", target_user_id).single()).data?.organization_id || ""
        );
        await adminClient.from("processed_emails").delete().eq("user_id", target_user_id);
        await adminClient.from("rules").delete().eq("organization_id",
          (await adminClient.from("user_profiles").select("organization_id").eq("user_id", target_user_id).single()).data?.organization_id || ""
        );
        await adminClient.from("categories").delete().eq("organization_id",
          (await adminClient.from("user_profiles").select("organization_id").eq("user_id", target_user_id).single()).data?.organization_id || ""
        );
        await adminClient.from("jobs").delete().eq("user_id", target_user_id);
        await adminClient.from("connect_attempts").delete().eq("user_id", target_user_id);
        await adminClient.from("oauth_token_vault").delete().eq("user_id", target_user_id);
        await adminClient.from("provider_connections").delete().eq("user_id", target_user_id);
        await adminClient.from("user_plan_overrides").delete().eq("user_id", target_user_id);
        await adminClient.from("white_label_configs").delete().eq("user_id", target_user_id);
        await adminClient.from("subscriptions").delete().eq("user_id", target_user_id);
        await adminClient.from("user_roles").delete().eq("user_id", target_user_id);
        await adminClient.from("organization_members").delete().eq("user_id", target_user_id);
        await adminClient.from("user_profiles").delete().eq("user_id", target_user_id);

        // Delete the auth user
        const { error: authError } = await adminClient.auth.admin.deleteUser(target_user_id);
        if (authError) throw authError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_connection": {
        const { connection_id } = body;
        if (!connection_id) throw new Error("connection_id required");

        // Get connection info
        const { data: conn } = await adminClient
          .from("provider_connections")
          .select("*")
          .eq("id", connection_id)
          .single();
        if (!conn) throw new Error("Connection not found");

        // Delete related data
        await adminClient.from("availability_hours").delete().eq("connection_id", connection_id);
        await adminClient.from("email_profiles").delete().eq("connection_id", connection_id);
        await adminClient.from("ai_settings").delete().eq("connection_id", connection_id);
        await adminClient.from("ai_activity_logs").delete().eq("connection_id", connection_id);
        await adminClient.from("ai_chat_conversations").delete().eq("connection_id", connection_id);
        await adminClient.from("rules").delete().eq("connection_id", connection_id);
        await adminClient.from("categories").delete().eq("connection_id", connection_id);
        await adminClient.from("oauth_token_vault").delete().eq("user_id", conn.user_id).eq("provider", conn.provider);
        await adminClient.from("provider_connections").delete().eq("id", connection_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_organization": {
        const { organization_id } = body;
        if (!organization_id) throw new Error("organization_id required");

        // Check caller's org isn't this one
        const { data: callerProfile } = await adminClient
          .from("user_profiles")
          .select("organization_id")
          .eq("user_id", caller.id)
          .single();
        if (callerProfile?.organization_id === organization_id) {
          throw new Error("Cannot delete your own organization");
        }

        // Get all users in this org
        const { data: orgUsers } = await adminClient
          .from("user_profiles")
          .select("user_id")
          .eq("organization_id", organization_id);
        const userIds = (orgUsers || []).map((u: any) => u.user_id);

        // Delete all data for these users
        for (const uid of userIds) {
          await adminClient.from("ai_chat_messages").delete().in(
            "conversation_id",
            (await adminClient.from("ai_chat_conversations").select("id").eq("user_id", uid)).data?.map((c: any) => c.id) || []
          );
          await adminClient.from("ai_chat_conversations").delete().eq("user_id", uid);
          await adminClient.from("ai_activity_logs").delete().eq("user_id", uid);
          await adminClient.from("processed_emails").delete().eq("user_id", uid);
          await adminClient.from("jobs").delete().eq("user_id", uid);
          await adminClient.from("connect_attempts").delete().eq("user_id", uid);
          await adminClient.from("oauth_token_vault").delete().eq("user_id", uid);
          await adminClient.from("user_plan_overrides").delete().eq("user_id", uid);
          await adminClient.from("white_label_configs").delete().eq("user_id", uid);
        }

        await adminClient.from("availability_hours").delete().eq("organization_id", organization_id);
        await adminClient.from("email_profiles").delete().eq("organization_id", organization_id);
        await adminClient.from("ai_settings").delete().eq("organization_id", organization_id);
        await adminClient.from("rules").delete().eq("organization_id", organization_id);
        await adminClient.from("categories").delete().eq("organization_id", organization_id);
        await adminClient.from("provider_connections").delete().eq("organization_id", organization_id);
        await adminClient.from("subscriptions").delete().eq("organization_id", organization_id);
        await adminClient.from("user_roles").delete().eq("organization_id", organization_id);
        await adminClient.from("organization_members").delete().eq("organization_id", organization_id);
        await adminClient.from("user_profiles").delete().eq("organization_id", organization_id);
        await adminClient.from("organizations").delete().eq("id", organization_id);

        // Delete auth users
        for (const uid of userIds) {
          await adminClient.auth.admin.deleteUser(uid);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_organization": {
        const { organization_id, name } = body;
        if (!organization_id || !name) throw new Error("organization_id and name required");

        const { error } = await adminClient
          .from("organizations")
          .update({ name })
          .eq("id", organization_id);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_user_connections": {
        const { target_user_id } = body;
        if (!target_user_id) throw new Error("target_user_id required");

        const { data, error } = await adminClient
          .from("provider_connections")
          .select("id, provider, connected_email, is_connected, connected_at")
          .eq("user_id", target_user_id);
        if (error) throw error;

        return new Response(JSON.stringify({ connections: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_organizations": {
        const { data, error } = await adminClient
          .from("organizations")
          .select("id, name, created_at");
        if (error) throw error;

        // Get member counts
        const orgsWithCounts = await Promise.all(
          (data || []).map(async (org: any) => {
            const { count } = await adminClient
              .from("user_profiles")
              .select("*", { count: "exact", head: true })
              .eq("organization_id", org.id);
            return { ...org, member_count: count || 0 };
          })
        );

        return new Response(JSON.stringify({ organizations: orgsWithCounts }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
