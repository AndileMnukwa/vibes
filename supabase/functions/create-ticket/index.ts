
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TICKET] ${step}${detailsStr}`);
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

    const { userId, eventId, purchaseId, attendanceId } = await req.json();
    
    if (!userId || !eventId) {
      throw new Error("User ID and Event ID are required");
    }

    logStep("Parameters received", { userId, eventId, purchaseId, attendanceId });

    // Check if ticket already exists for this user/event combination
    const { data: existingTicket } = await supabaseClient
      .from('tickets')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingTicket) {
      logStep("Ticket already exists", { ticketId: existingTicket.id });
      return new Response(JSON.stringify({ 
        success: true, 
        ticketId: existingTicket.id,
        message: "Ticket already exists" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate ticket number using database function
    const { data: ticketNumberResult, error: ticketNumberError } = await supabaseClient
      .rpc('generate_ticket_number');

    if (ticketNumberError) {
      logStep("Error generating ticket number", ticketNumberError);
      throw new Error("Failed to generate ticket number");
    }

    const ticketNumber = ticketNumberResult;
    logStep("Generated ticket number", { ticketNumber });

    // Create QR code data (encrypted ticket validation info)
    const qrData = {
      ticketNumber,
      userId,
      eventId,
      timestamp: new Date().toISOString(),
      hash: btoa(`${ticketNumber}-${userId}-${eventId}-${Date.now()}`)
    };

    const qrCodeData = btoa(JSON.stringify(qrData));

    // Create ticket record
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('tickets')
      .insert({
        ticket_number: ticketNumber,
        user_id: userId,
        event_id: eventId,
        purchase_id: purchaseId || null,
        attendance_id: attendanceId || null,
        qr_code_data: qrCodeData,
        validation_status: 'valid'
      })
      .select()
      .single();

    if (ticketError) {
      logStep("Error creating ticket", ticketError);
      throw new Error("Failed to create ticket record");
    }

    logStep("Ticket created successfully", { ticketId: ticket.id });

    return new Response(JSON.stringify({ 
      success: true, 
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-ticket", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
