// Edge Function: Tradovate API Proxy
// Purpose: Proxy authenticated requests to Tradovate API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const environment = Deno.env.get("TRADOVATE_ENVIRONMENT") || "demo";

    // Determine API base URL
    const baseUrl = environment === "demo"
      ? "https://demo.tradovateapi.com/v1"
      : "https://live.tradovateapi.com/v1";

    // Get access token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Extract endpoint from query parameter
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    
    if (!endpoint) {
      throw new Error("Missing endpoint parameter");
    }

    // Build Tradovate API URL
    const tradovateUrl = `${baseUrl}${endpoint}`;

    console.log("Proxying request:", {
      method: req.method,
      url: tradovateUrl,
      hasAuth: !!authHeader,
    });

    // Get request body if present
    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    // Forward request to Tradovate
    const tradovateResponse = await fetch(tradovateUrl, {
      method: req.method,
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: body,
    });

    const responseText = await tradovateResponse.text();
    
    console.log("Tradovate response:", {
      status: tradovateResponse.status,
      body: responseText.substring(0, 200),
    });

    // Return Tradovate response
    return new Response(responseText, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: tradovateResponse.status,
    });
  } catch (error) {
    console.error("Proxy error:", error);
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



