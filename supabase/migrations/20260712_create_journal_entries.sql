-- Trade Study Gallery: journal entries + private image storage

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

INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-journal', 'trade-journal', false)
ON CONFLICT (id) DO NOTHING;
