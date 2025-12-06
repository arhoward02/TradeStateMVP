// Edge Function: OAuth Initiate
// Purpose: Start Tradovate OAuth flow securely from backend

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TRADOVATE_OAUTH_URL = "https://trader.tradovate.com/oauth";

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const clientId = Deno.env.get("TRADOVATE_CLIENT_ID");
    const redirectUri = Deno.env.get("TRADOVATE_REDIRECT_URI");

    if (!clientId || !redirectUri) {
      throw new Error("Missing required environment variables");
    }

    // Generate state for CSRF protection
    const state = generateState();

    // Build OAuth authorization URL
    // Note: Tradovate doesn't require/use scope parameter in OAuth flow
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
    });

    const authUrl = `${TRADOVATE_OAUTH_URL}?${params.toString()}`;

    // Return the auth URL and state
    // Frontend will store state in sessionStorage and redirect
    return new Response(
      JSON.stringify({
        authUrl,
        state,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("OAuth initiate error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});


