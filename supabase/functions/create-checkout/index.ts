
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { eventId } = await req.json();
    if (!eventId) throw new Error("Event ID is required");

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) throw new Error("Event not found");
    if (!event.ticket_price || event.ticket_price <= 0) {
      throw new Error("This event is free and doesn't require payment");
    }

    logStep("Event found", { eventId, price: event.ticket_price });

    // Check if user already has a purchase for this event
    const { data: existingPurchase } = await supabaseClient
      .from('event_purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .eq('payment_status', 'paid')
      .maybeSingle();

    if (existingPurchase) {
      throw new Error("You have already purchased a ticket for this event");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Ticket for ${event.title}`,
              description: event.short_description || event.description,
            },
            unit_amount: Math.round(event.ticket_price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/events/${eventId}?payment=cancelled`,
      metadata: {
        eventId: eventId,
        userId: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Create purchase record
    const { error: purchaseError } = await supabaseClient
      .from('event_purchases')
      .insert({
        user_id: user.id,
        event_id: eventId,
        stripe_session_id: session.id,
        amount_paid: Math.round(event.ticket_price * 100),
        payment_status: 'pending',
      });

    if (purchaseError) {
      logStep("Error creating purchase record", purchaseError);
      throw new Error("Failed to create purchase record");
    }

    logStep("Purchase record created");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
