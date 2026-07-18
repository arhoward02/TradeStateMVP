// Edge Function: leading-groups-vision
// Purpose: Read Deepvue Industry Ranks / Theme Tracker screenshots via Claude
// Vision and return structured rows. Replaces the in-browser Tesseract OCR
// path for public/leading-groups.html. Requires a valid Supabase session —
// the Anthropic API key never reaches the client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tradestate.io",
  "https://www.tradestate.io",
];

const ANTHROPIC_MODEL = "claude-opus-4-8";
const MAX_IMAGES = 3;
const ALLOWED_MEDIA_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const INDUSTRY_SYSTEM_PROMPT = `You read screenshots of the Deepvue "Industry Ranks" table (73 industries total, though a screenshot may show fewer rows).
For every industry row visible in the image(s), extract:
- name: the industry name only (strip any leading/trailing rank-change arrows or numbers like "+5" / "-12", and ignore the "Stocks" count column)
- w1w, w1m, w3m: the 1W / 1M / 3M RANK as integers from 1 to 73 (lower number = stronger rank), exactly as shown in those columns

Ignore any "Sub-Industry" or "164" rows entirely — only top-level industries.
If a value/column is not visible for a row, omit that field's row rather than guessing.
Return JSON only, matching the provided schema. No commentary, no markdown fences.`;

const THEME_SYSTEM_PROMPT = `You read screenshots of the Deepvue "Theme Tracker" (normally 31 themes total). Each screenshot may show one or more of the 1W / 1M / 3M timeframe panels.
For every theme row visible in the image(s), extract:
- name: the theme name only
- w1w, w1m, w3m: the PERCENT RETURN for that timeframe as a float (e.g. 4.52 for "+4.52%", -1.3 for "-1.30%"), exactly as shown

Only fill in a timeframe field if that timeframe's panel/column is actually visible in the image(s) you were given — set any timeframe not shown to null. Do not guess or invent values.
Return JSON only, matching the provided schema. No commentary, no markdown fences.`;

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function rowSchema(kind: "industry" | "theme") {
  const numberField = kind === "industry" ? { type: "integer" } : { type: ["number", "null"] };
  return {
    type: "object",
    properties: {
      rows: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            w1w: numberField,
            w1m: numberField,
            w3m: numberField,
          },
          required: ["name", "w1w", "w1m", "w3m"],
          additionalProperties: false,
        },
      },
    },
    required: ["rows"],
    additionalProperties: false,
  };
}

function sanitizeRows(kind: "industry" | "theme", rows: unknown): Array<{ name: string; w1w: number | null; w1m: number | null; w3m: number | null }> {
  if (!Array.isArray(rows)) return [];
  const clean = (v: unknown, isIndustry: boolean): number | null => {
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    if (isIndustry) {
      if (!Number.isInteger(v) || v < 1 || v > 73) return null;
    }
    return v;
  };
  return rows
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => ({
      name: String(r.name ?? "").trim(),
      w1w: clean(r.w1w, kind === "industry"),
      w1m: clean(r.w1m, kind === "industry"),
      w3m: clean(r.w3m, kind === "industry"),
    }))
    .filter((r) => r.name.length > 0);
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, origin);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing Authorization header" }, 401, origin);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500, origin);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Invalid or expired session — log in with Google" }, 401, origin);
    }

    const body = await req.json().catch(() => null);
    const kind = body?.kind;
    const images = body?.images;

    if (kind !== "industry" && kind !== "theme") {
      return jsonResponse({ error: 'kind must be "industry" or "theme"' }, 400, origin);
    }
    if (!Array.isArray(images) || images.length === 0) {
      return jsonResponse({ error: "images must be a non-empty array" }, 400, origin);
    }
    if (images.length > MAX_IMAGES) {
      return jsonResponse({ error: `Max ${MAX_IMAGES} images per request` }, 400, origin);
    }

    const imageBlocks = [];
    for (const img of images) {
      const mediaType = img?.mediaType;
      const dataBase64 = img?.dataBase64;
      if (typeof mediaType !== "string" || !ALLOWED_MEDIA_TYPES.has(mediaType)) {
        return jsonResponse({ error: `Unsupported image mediaType: ${mediaType}` }, 400, origin);
      }
      if (typeof dataBase64 !== "string" || dataBase64.length === 0) {
        return jsonResponse({ error: "Each image needs dataBase64" }, 400, origin);
      }
      imageBlocks.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: dataBase64 },
      });
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return jsonResponse({ error: "Server missing ANTHROPIC_API_KEY" }, 500, origin);
    }

    const systemPrompt = kind === "industry" ? INDUSTRY_SYSTEM_PROMPT : THEME_SYSTEM_PROMPT;
    const instructionText =
      kind === "industry"
        ? "Extract every industry row visible in the image(s) above."
        : "Extract every theme row visible in the image(s) above.";

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [...imageBlocks, { type: "text", text: instructionText }],
          },
        ],
        output_config: {
          format: { type: "json_schema", schema: rowSchema(kind) },
        },
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errText.slice(0, 500));
      return jsonResponse({ error: "Vision request failed" }, 502, origin);
    }

    const anthropicJson = await anthropicResponse.json();

    if (anthropicJson.stop_reason === "refusal") {
      return jsonResponse({ error: "Claude declined to read this screenshot" }, 422, origin);
    }

    const textBlock = (anthropicJson.content || []).find((b: { type: string }) => b.type === "text");
    if (!textBlock?.text) {
      return jsonResponse({ error: "No output from vision model" }, 502, origin);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      console.error("Failed to parse model JSON:", textBlock.text.slice(0, 500));
      return jsonResponse({ error: "Vision model returned invalid JSON" }, 502, origin);
    }

    const rows = sanitizeRows(kind, (parsed as { rows?: unknown })?.rows);
    return jsonResponse({ rows }, 200, origin);
  } catch (err) {
    console.error("leading-groups-vision error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500, origin);
  }
});
