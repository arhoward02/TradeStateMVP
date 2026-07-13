const BUCKET = 'trade-journal';
const SIGNED_URL_TTL = 60 * 60 * 24; // 24h — gallery may stay open longer than a short token

let client = null;

function getConfig() {
  return window.__STUDY_CONFIG__ || {};
}

function getCreateClient() {
  const createClient = window.supabase?.createClient;
  if (!createClient) {
    throw new Error('Supabase client library failed to load');
  }
  return createClient;
}

function getSupabase() {
  if (!client) {
    const cfg = getConfig();
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      throw new Error('Supabase is not configured');
    }
    client = getCreateClient()(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
  }
  return client;
}

async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function getUser() {
  const { data: { session } } = await withTimeout(
    getSupabase().auth.getSession(),
    3000,
    'getSession',
  );
  return session?.user || null;
}

function dataUrlToBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  let ext = 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
  else if (mime.includes('webp')) ext = 'webp';
  else if (mime.includes('gif')) ext = 'gif';

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mime }), mime, ext };
}

async function uploadImage(userId, entryId, role, dataUrl) {
  const { blob, mime, ext } = dataUrlToBlob(dataUrl);
  const path = `${userId}/${entryId}/${role}.${ext}`;
  const { error } = await getSupabase().storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: mime,
  });
  if (error) throw error;
  return path;
}

async function signedUrl(path) {
  if (!path) return null;
  const { data, error } = await getSupabase().storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) throw error;
  return data.signedUrl;
}

async function signedUrlSafe(path) {
  try {
    return await signedUrl(path);
  } catch (err) {
    console.warn('createSignedUrl failed for', path, err);
    return null;
  }
}

function toClientEntry(row, stockImageUrl, indexImageUrl) {
  return {
    id: row.id,
    ticker: row.ticker,
    indexTicker: row.index_ticker,
    date: row.trade_date,
    tags: row.tags || [],
    notes: row.notes || '',
    created: new Date(row.created_at).getTime(),
    synced: true,
    stockImagePath: row.stock_image_path || null,
    indexImagePath: row.index_image_path || null,
    stockImageUrl,
    indexImageUrl,
  };
}

async function rowToClientEntry(row) {
  const [stockImageUrl, indexImageUrl] = await Promise.all([
    signedUrlSafe(row.stock_image_path),
    signedUrlSafe(row.index_image_path),
  ]);
  return toClientEntry(row, stockImageUrl, indexImageUrl);
}

async function createEntry(userId, entry, stockImage, indexImage) {
  const stockPath = await uploadImage(userId, entry.id, 'stock', stockImage);
  const indexPath = await uploadImage(userId, entry.id, 'index', indexImage);

  const row = {
    id: entry.id,
    owner_id: userId,
    ticker: entry.ticker.toUpperCase(),
    index_ticker: (entry.indexTicker || 'QQQ').toUpperCase(),
    trade_date: entry.date || new Date().toISOString().slice(0, 10),
    tags: entry.tags || [],
    notes: entry.notes || '',
    stock_image_path: stockPath,
    index_image_path: indexPath,
    created_at: entry.created
      ? new Date(entry.created).toISOString()
      : new Date().toISOString(),
  };

  const { error } = await getSupabase()
    .from('journal_entries')
    .upsert(row, { onConflict: 'id' });
  if (error) throw error;

  return rowToClientEntry(row);
}

function mapSyncedEntry(e) {
  return {
    id: e.id,
    ticker: e.ticker,
    indexTicker: e.indexTicker,
    date: e.date,
    tags: e.tags || [],
    notes: e.notes || '',
    created: e.created,
    synced: true,
    stockImagePath: e.stockImagePath || null,
    indexImagePath: e.indexImagePath || null,
    stockImageUrl: e.stockImageUrl || null,
    indexImageUrl: e.indexImageUrl || null,
  };
}

export const cloud = {
  async isReady() {
    const cfg = getConfig();
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return false;
    const user = await getUser();
    return !!user;
  },

  async getStatus() {
    const cfg = getConfig();
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      return { mode: 'local', label: 'Local only (cloud not configured)' };
    }
    const user = await getUser();
    if (!user) {
      return {
        mode: 'local',
        label: 'Local only — log in with Google to enable cloud backup',
        loginUrl: '/#/login',
      };
    }
    return { mode: 'cloud', label: 'Cloud backup active' };
  },

  async list() {
    const user = await getUser();
    if (!user) throw new Error('Log in with Google to use cloud backup');

    const { data, error } = await getSupabase()
      .from('journal_entries')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Sign per-row with isolation so one bad path cannot wipe the gallery.
    return Promise.all((data || []).map(rowToClientEntry));
  },

  async create(entry, stockImage, indexImage) {
    const user = await getUser();
    if (!user) throw new Error('Log in with Google to use cloud backup');
    return createEntry(user.id, entry, stockImage, indexImage);
  },

  async migrate(entries) {
    const user = await getUser();
    if (!user) throw new Error('Log in with Google to use cloud backup');

    const created = [];
    for (const item of entries) {
      created.push(await createEntry(user.id, item, item.stockImage, item.indexImage));
    }
    return created;
  },

  async remove(id) {
    const user = await getUser();
    if (!user) throw new Error('Log in with Google to use cloud backup');

    const { data, error } = await getSupabase()
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Entry not found');

    const paths = [data.stock_image_path, data.index_image_path].filter(Boolean);
    if (paths.length) {
      await getSupabase().storage.from(BUCKET).remove(paths);
    }

    const { error: deleteError } = await getSupabase()
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);

    if (deleteError) throw deleteError;
  },

  /** Mint a fresh signed URL for a storage path (or null on failure). */
  async signedUrlForPath(path) {
    if (!path) return null;
    return signedUrlSafe(path);
  },

  mapSyncedEntry,
};
