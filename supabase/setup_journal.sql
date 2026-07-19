-- TradeState Study Gallery setup (safe to run in Supabase SQL Editor)
-- Run this entire script once. Safe to re-run — uses IF NOT EXISTS / DROP IF EXISTS.

-- 1. Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  ticker TEXT NOT NULL,
  index_ticker TEXT NOT NULL DEFAULT 'QQQ',
  trade_date DATE NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '',
  stock_image_path TEXT NOT NULL,
  index_image_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_owner_id
  ON journal_entries(owner_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at
  ON journal_entries(owner_id, created_at DESC);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- 2. Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-journal', 'trade-journal', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop old policies if re-running
DROP POLICY IF EXISTS "Service role full access on journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can read own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Service role full access on trade-journal bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own journal images" ON storage.objects;

-- 4. Journal table policies
CREATE POLICY "Users can read own journal entries"
  ON journal_entries FOR SELECT TO authenticated
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE TO authenticated
  USING (owner_id = auth.uid()::text);

-- 5. Storage policies (path format: userId/entryId/stock.png)
CREATE POLICY "Users can read own journal images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can upload own journal images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can update own journal images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can delete own journal images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
