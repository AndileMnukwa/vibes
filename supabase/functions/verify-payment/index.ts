
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
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

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { sessionId, status: session.payment_status });

    if (session.payment_status === 'paid') {
      // Update purchase record
      const { data: purchase, error: updateError } = await supabaseClient
        .from('event_purchases')
        .update({
          payment_status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          purchase_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', sessionId)
        .select()
        .single();

      if (updateError || !purchase) {
        logStep("Error updating purchase", updateError);
        throw new Error("Failed to update purchase record");
      }

      logStep("Purchase updated", { purchaseId: purchase.id });

      // Create or update attendance record
      const { data: attendance, error: attendanceError } = await supabaseClient
        .from('user_event_attendance')
        .upsert({
          user_id: purchase.user_id,
          event_id: purchase.event_id,
          attendance_status: 'going',
          purchase_id: purchase.id,
        }, {
          onConflict: 'user_id,event_id'
        })
        .select()
        .single();

      if (attendanceError) {
        logStep("Error creating attendance record", attendanceError);
        // Don't throw here as payment is already processed
      } else {
        logStep("Attendance record created/updated");
      }

      // Create ticket automatically
      try {
        const { data: ticketData, error: ticketError } = await supabaseClient.functions.invoke('create-ticket', {
          body: {
            userId: purchase.user_id,
            eventId: purchase.event_id,
            purchaseId: purchase.id,
            attendanceId: attendance?.id || null
          }
        });

        if (ticketError) {
          logStep("Error creating ticket", ticketError);
        } else {
          logStep("Ticket created", ticketData);
        }
      } catch (ticketCreationError) {
        logStep("Ticket creation failed", ticketCreationError);
        // Don't fail the whole payment process if ticket creation fails
      }

      return new Response(JSON.stringify({ 
        success: true, 
        purchaseId: purchase.id,
        eventId: purchase.event_id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Update purchase as failed
      await supabaseClient
        .from('event_purchases')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', sessionId);

      return new Response(JSON.stringify({ 
        success: false, 
        error: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
