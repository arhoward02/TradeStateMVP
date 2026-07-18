/**
 * Leading Groups vision OCR — reads Deepvue Industry Ranks / Theme Tracker
 * screenshots via the `leading-groups-vision` Supabase Edge Function, which
 * calls Claude Vision server-side. Requires the user to be logged in
 * (Google via Supabase Auth); the Anthropic key never reaches the browser.
 */

const FUNCTION_NAME = 'leading-groups-vision';
const MAX_IMAGES_PER_CALL = 3;

let client = null;

function getConfig() {
  return window.__STUDY_CONFIG__ || {};
}

function getSupabase() {
  if (!client) {
    const cfg = getConfig();
    const createClient = window.supabase?.createClient;
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !createClient) {
      throw new Error('Supabase is not configured');
    }
    client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, detectSessionInUrl: false, flowType: 'pkce' },
    });
  }
  return client;
}

async function requireSession() {
  const { data: { session } } = await getSupabase().auth.getSession();
  if (!session) {
    throw new Error('Log in with Google to read screenshots — CSV still works without login.');
  }
  return session;
}

function dataUrlToImagePart(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl || '');
  if (!match) throw new Error('Invalid pasted image');
  const [, rawMediaType, dataBase64] = match;
  const mediaType = ['image/png', 'image/jpeg', 'image/webp'].includes(rawMediaType)
    ? rawMediaType
    : 'image/png';
  return { mediaType, dataBase64 };
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function normalizeKey(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Merge rows from multiple vision calls, keeping the most complete values per name. */
function mergeByName(rows) {
  const map = new Map();
  for (const r of rows || []) {
    const name = String(r.name || '').trim();
    const key = normalizeKey(name);
    if (!key) continue;
    const prev = map.get(key) || { name, w1w: null, w1m: null, w3m: null, source: 'ocr' };
    map.set(key, {
      name: prev.name.length >= name.length ? prev.name : name,
      w1w: r.w1w != null ? r.w1w : prev.w1w,
      w1m: r.w1m != null ? r.w1m : prev.w1m,
      w3m: r.w3m != null ? r.w3m : prev.w3m,
      source: 'ocr',
    });
  }
  return Array.from(map.values());
}

async function callVision(kind, dataUrls) {
  await requireSession();
  const images = dataUrls.map(dataUrlToImagePart);
  const { data, error } = await getSupabase().functions.invoke(FUNCTION_NAME, {
    body: { kind, images },
  });
  if (error) {
    // error.context is the raw Response for FunctionsHttpError/FunctionsRelayError —
    // read its JSON body for the real message rather than the generic error.message.
    let msg = error?.message || 'Vision request failed';
    try {
      const body = await error?.context?.json?.();
      if (body?.error) msg = body.error;
    } catch { /* context wasn't JSON — keep generic message */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return Array.isArray(data?.rows) ? data.rows : [];
}

async function ocrKindImages(kind, dataUrls, onProgress) {
  const list = dataUrls || [];
  if (!list.length) return [];
  const batches = chunk(list, MAX_IMAGES_PER_CALL);
  const all = [];
  for (let i = 0; i < batches.length; i++) {
    const label = `${kind === 'industry' ? 'Industry' : 'Theme'} screenshots ${
      i * MAX_IMAGES_PER_CALL + 1
    }-${Math.min((i + 1) * MAX_IMAGES_PER_CALL, list.length)}/${list.length}`;
    if (onProgress) onProgress(label, 10);
    const rows = await callVision(kind, batches[i]);
    all.push(...rows);
    if (onProgress) onProgress(label, 100);
  }
  return mergeByName(all);
}

/** Vision OCR industry screenshots → merged rank rows. */
export async function ocrIndustryImages(dataUrls, onProgress) {
  return ocrKindImages('industry', dataUrls, onProgress);
}

/** Vision OCR theme screenshots → merged % rows. */
export async function ocrThemeImages(dataUrls, onProgress) {
  return ocrKindImages('theme', dataUrls, onProgress);
}

if (typeof window !== 'undefined') {
  window.LeadingGroupsOcr = { ocrIndustryImages, ocrThemeImages };
}
