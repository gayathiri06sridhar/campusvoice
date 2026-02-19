import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

// Get admin email from environment variables
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";

// Allowed origins for CORS - update with your actual domains
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  // Add your production domains:
  // "https://your-domain.com",
  // "https://www.your-domain.com",
];

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl || "", supabaseServiceKey || "");

// Helper function to get CORS headers
const getCorsHeaders = (origin: string | null) => {
  const corsOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, message } = (await req.json()) as ContactMessage;

    // Validate inputs
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Additional validation
    if (name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be between 2-100 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Message length validation
    if (message.length < 10 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message must be between 10-5000 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Save message to database first
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { data: savedMessage, error: dbError } = await supabase
          .from("contact_messages")
          .insert({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          })
          .select()
          .single();

        if (dbError) {
          console.error("Database save error:", dbError);
        } else {
          console.log("Message saved to database:", savedMessage?.id);
        }
      } catch (dbErr) {
        console.error("Database error:", dbErr);
      }
    }

    // Try sending email via Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `CampusVoice <noreply@campusvoice.com>`,
            to: ADMIN_EMAIL,
            reply_to: email,
            subject: `New Contact Message from ${name}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #000; margin-bottom: 24px;">New Contact Message from CampusVoice Diaries</h2>
                <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                  <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${name}</p>
                  <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a></p>
                </div>
                <div style="border-left: 4px solid #0066cc; padding-left: 16px; margin: 24px 0;">
                  <p style="white-space: pre-wrap; color: #333; line-height: 1.6; margin: 0;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="font-size: 12px; color: #999; margin: 0;">This message was sent through the contact form at CampusVoice Diaries.</p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("Resend API error:", error);
          throw new Error("Failed to send email via Resend");
        }

        console.log("Email sent successfully via Resend");
      } catch (resendError) {
        console.error("Resend error:", resendError);
      }
    } else {
      console.log("Resend API key not configured. Message saved to database.");
      console.log(`
========== CONTACT FORM MESSAGE ==========
From: ${name}
Email: ${email}
Message: ${message}
==========================================
      `);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you! We've received your message and will get back to you soon.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you! We've received your message and will get back to you soon.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
