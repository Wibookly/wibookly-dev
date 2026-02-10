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

      case "create_user": {
        const { email, password, full_name, plan_override } = body;
        if (!email || !password) throw new Error("email and password required");

        // Create auth user (auto-confirm email)
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createError) throw createError;
        const newUserId = newUser.user.id;

        // Create organization
        const { data: org, error: orgError } = await adminClient
          .from("organizations")
          .insert({ name: full_name ? `${full_name}'s Organization` : `${email}'s Organization` })
          .select("id")
          .single();
        if (orgError) throw orgError;

        // Create user profile
        await adminClient.from("user_profiles").insert({
          user_id: newUserId,
          organization_id: org.id,
          email,
          full_name: full_name || null,
        });

        // Create organization member
        await adminClient.from("organization_members").insert({
          user_id: newUserId,
          organization_id: org.id,
          role: "admin",
        });

        // Create user role
        await adminClient.from("user_roles").insert({
          user_id: newUserId,
          organization_id: org.id,
          role: "admin",
        });

        // Create subscription record
        await adminClient.from("subscriptions").insert({
          user_id: newUserId,
          organization_id: org.id,
          plan: "starter",
          status: "active",
        });

        // If a plan override is specified, grant it
        if (plan_override && plan_override !== "none") {
          await adminClient.from("user_plan_overrides").insert({
            user_id: newUserId,
            granted_plan: plan_override,
            granted_by: caller.id,
            is_active: true,
          });
        }

        return new Response(JSON.stringify({ success: true, user_id: newUserId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reset_password": {
        const { target_user_id, new_password } = body;
        if (!target_user_id || !new_password) throw new Error("target_user_id and new_password required");

        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          password: new_password,
        });
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "toggle_ban": {
        const { target_user_id, ban } = body;
        if (!target_user_id) throw new Error("target_user_id required");
        if (target_user_id === caller.id) throw new Error("Cannot lock your own account");

        if (ban) {
          const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
            ban_duration: "876000h", // ~100 years = effectively permanent
          });
          if (error) throw error;
        } else {
          const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
            ban_duration: "none",
          });
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_user_status": {
        const { target_user_id } = body;
        if (!target_user_id) throw new Error("target_user_id required");

        const { data: userData, error } = await adminClient.auth.admin.getUserById(target_user_id);
        if (error) throw error;

        return new Response(JSON.stringify({
          banned_until: userData.user.banned_until,
          last_sign_in_at: userData.user.last_sign_in_at,
          created_at: userData.user.created_at,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
