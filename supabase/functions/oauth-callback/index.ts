// Edge Function: OAuth Callback
// Purpose: Handle Tradovate OAuth callback and exchange code for tokens securely

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/**
 * Generate a consistent device ID
 */
function generateDeviceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Set version (4) and variant bits
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;
  
  const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
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
    // Get request body
    // Note: oauth_username not needed for standard OAuth flow
    // The authorization code contains all necessary user information
    const { code, state } = await req.json();

    if (!code || !state) {
      throw new Error("Missing required parameters: code or state");
    }

    // Get environment variables
    const clientId = Deno.env.get("TRADOVATE_CLIENT_ID");
    const clientSecret = Deno.env.get("TRADOVATE_CLIENT_SECRET");
    const environment = Deno.env.get("TRADOVATE_ENVIRONMENT") || "demo";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_API_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");

    if (!clientId || !clientSecret) {
      throw new Error("Missing Tradovate credentials in environment");
    }

    // Determine API base URL (OAuth token endpoint is different from regular API)
    const baseUrl = environment === "demo"
      ? "https://demo.tradovateapi.com"
      : "https://live.tradovateapi.com";

    // Exchange authorization code for access token using OAuth token endpoint
    const tokenUrl = `${baseUrl}/auth/oauthtoken`;
    
    // Standard OAuth token exchange format
    const requestBody = {
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: Deno.env.get("TRADOVATE_REDIRECT_URI"),
      code: code,
    };

    console.log("Token request:", { url: tokenUrl, body: { ...requestBody, client_secret: "***" } });

    // Convert to URL-encoded form format (as per Tradovate OAuth spec)
    const formBody = new URLSearchParams(requestBody as Record<string, string>).toString();

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const tokenText = await tokenResponse.text();
    console.log("Token response:", { status: tokenResponse.status, body: tokenText });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${tokenText}`);
    }

    const tokenData = JSON.parse(tokenText);

    // Tradovate returns snake_case (access_token), normalize to camelCase
    const accessToken = tokenData.access_token || tokenData.accessToken || tokenData.token;
    const refreshToken = tokenData.refresh_token || tokenData.refreshToken;
    const expiresIn = tokenData.expires_in || tokenData.expiresIn || tokenData.expirationTime || 8 * 60 * 60;
    const userId = tokenData.user_id || tokenData.userId;

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));

    // Store tokens in Supabase database (if configured)
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from("tradovate_sessions").insert({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    }

    // Return tokens to frontend
    return new Response(
      JSON.stringify({
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: expiresAt.toISOString(),
        tokenType: "Bearer",
        userId: userId,
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
    console.error("OAuth callback error:", error);
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

