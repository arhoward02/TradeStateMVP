-- Allow authenticated users to manage their own journal entries and images

DROP POLICY IF EXISTS "Users can read own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can read own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own journal images" ON storage.objects;

CREATE POLICY "Users can read own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can read own journal images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can upload own journal images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can update own journal images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can delete own journal images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'trade-journal'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
