
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-TICKET] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { ticketId } = await req.json();
    if (!ticketId) throw new Error("Ticket ID is required");

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get ticket details with event and user information
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('tickets')
      .select(`
        *,
        events (
          title,
          description,
          short_description,
          location,
          address,
          event_date,
          end_date,
          image_url,
          profiles (
            full_name,
            username
          )
        ),
        profiles!tickets_user_id_fkey (
          full_name,
          username
        )
      `)
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single();

    if (ticketError || !ticket) {
      logStep("Ticket not found", { ticketId, error: ticketError });
      throw new Error("Ticket not found or access denied");
    }

    logStep("Ticket retrieved", { ticketNumber: ticket.ticket_number });

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(ticket.qr_code_data, {
      width: 200,
      margin: 2,
    });

    // Create HTML template for PDF
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Ticket</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
        }
        .ticket {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          border: 2px dashed #e5e7eb;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header .event-title {
          font-size: 32px;
          margin: 10px 0;
          font-weight: bold;
        }
        .content {
          padding: 30px;
        }
        .ticket-info {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .details {
          display: grid;
          gap: 15px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        .detail-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .detail-value {
          font-size: 16px;
          color: #1f2937;
          font-weight: 500;
        }
        .qr-section {
          text-align: center;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .qr-code {
          width: 150px;
          height: 150px;
          margin: 0 auto 15px;
        }
        .ticket-number {
          background: #1f2937;
          color: white;
          padding: 15px;
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 2px;
        }
        .footer {
          padding: 20px;
          background: #f9fafb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        .organizer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          opacity: 0.05;
          font-size: 60px;
          font-weight: bold;
          color: #1f2937;
          z-index: 1;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="watermark">VALID TICKET</div>
        
        <div class="header">
          <h1>🎟️ EVENT TICKET</h1>
          <div class="event-title">${ticket.events.title}</div>
        </div>

        <div class="content">
          <div class="ticket-info">
            <div class="details">
              <div class="detail-item">
                <div class="detail-label">Event Date & Time</div>
                <div class="detail-value">${new Date(ticket.events.event_date).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">${ticket.events.location}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Ticket Holder</div>
                <div class="detail-value">${ticket.profiles?.full_name || ticket.profiles?.username || 'Guest'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value" style="color: ${ticket.validation_status === 'valid' ? '#059669' : '#dc2626'};">
                  ${ticket.validation_status.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div class="qr-section">
              <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
              <div class="detail-label">Scan for Validation</div>
            </div>
          </div>
          
          ${ticket.events.organizer ? `
            <div class="organizer">
              <div class="detail-label">Organized by</div>
              <div class="detail-value">${ticket.events.profiles?.full_name || ticket.events.profiles?.username || 'Event Organizer'}</div>
            </div>
          ` : ''}
        </div>

        <div class="ticket-number">
          TICKET #${ticket.ticket_number}
        </div>

        <div class="footer">
          <p>This ticket is valid for one admission only. Please present this ticket (digital or printed) at the event entrance.</p>
          <p>For questions, contact the event organizer. Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;

    logStep("HTML template generated");

    // Convert HTML to PDF using Puppeteer
    const { default: puppeteer } = await import("https://deno.land/x/puppeteer@16.2.0/mod.ts");

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    logStep("PDF generated successfully");

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ticket-${ticket.ticket_number}.pdf"`,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-ticket", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
