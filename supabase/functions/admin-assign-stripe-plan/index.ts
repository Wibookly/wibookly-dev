import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan → Stripe price mapping
const PLAN_PRICES: Record<string, string> = {
  starter: "price_1Sog5tAESvm0s6Eqlef0MlRD",
  pro: "price_1Sog6BAESvm0s6EqGMDf8sch",
  enterprise: "price_1SyhgUAESvm0s6Eq8WbV6wWE",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    // Verify caller is super_admin
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

    const { target_user_id, plan } = await req.json();
    if (!target_user_id || !plan) throw new Error("target_user_id and plan required");

    const priceId = PLAN_PRICES[plan];
    if (!priceId) throw new Error(`Invalid plan: ${plan}. Must be starter, pro, or enterprise`);

    console.log(`[admin-assign-stripe-plan] Assigning ${plan} to user ${target_user_id}`);

    // Get user profile for email and org
    const { data: profile, error: profileError } = await adminClient
      .from("user_profiles")
      .select("email, full_name, organization_id")
      .eq("user_id", target_user_id)
      .single();
    if (profileError || !profile) throw new Error("User profile not found");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // 1. Find or create Stripe customer
    const existingCustomers = await stripe.customers.list({ email: profile.email, limit: 1 });
    let customerId: string;

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log(`[admin-assign-stripe-plan] Found existing Stripe customer: ${customerId}`);
    } else {
      const newCustomer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name || profile.email,
        metadata: {
          user_id: target_user_id,
          organization_id: profile.organization_id,
          assigned_by: caller.id,
        },
      });
      customerId = newCustomer.id;
      console.log(`[admin-assign-stripe-plan] Created Stripe customer: ${customerId}`);
    }

    // 2. Cancel any existing active subscriptions for this customer
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });
    for (const sub of existingSubs.data) {
      await stripe.subscriptions.cancel(sub.id);
      console.log(`[admin-assign-stripe-plan] Cancelled existing subscription: ${sub.id}`);
    }

    // 3. Create new subscription (admin-assigned, no trial)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        user_id: target_user_id,
        organization_id: profile.organization_id,
        assigned_by_admin: caller.id,
      },
    });
    console.log(`[admin-assign-stripe-plan] Created subscription: ${subscription.id}`);

    // 4. Update local subscriptions table
    const { error: subError } = await adminClient
      .from("subscriptions")
      .upsert({
        user_id: target_user_id,
        organization_id: profile.organization_id,
        plan: plan,
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "organization_id" });

    if (subError) {
      console.error("[admin-assign-stripe-plan] DB error:", subError);
      throw new Error("Failed to update subscription record");
    }

    // 5. Remove any free override since user is now on paid plan
    await adminClient
      .from("user_plan_overrides")
      .delete()
      .eq("user_id", target_user_id);
    console.log(`[admin-assign-stripe-plan] Removed free override for user ${target_user_id}`);

    // 6. Create usage preferences if not exists
    const { data: existingPrefs } = await adminClient
      .from("usage_preferences")
      .select("id")
      .eq("user_id", target_user_id)
      .maybeSingle();

    if (!existingPrefs) {
      await adminClient.from("usage_preferences").insert({
        user_id: target_user_id,
        organization_id: profile.organization_id,
        usage_billing_enabled: false,
        additional_drafts_limit: 0,
        additional_messages_limit: 0,
        monthly_spend_cap: 50.00,
      });
      console.log(`[admin-assign-stripe-plan] Created usage preferences`);
    }

    return new Response(JSON.stringify({
      success: true,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[admin-assign-stripe-plan] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
