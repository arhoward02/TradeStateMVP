-- Create table for storing Tradovate OAuth sessions
CREATE TABLE IF NOT EXISTS tradovate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oauth_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on oauth_username for faster lookups
CREATE INDEX IF NOT EXISTS idx_tradovate_sessions_oauth_username 
ON tradovate_sessions(oauth_username);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_tradovate_sessions_expires_at 
ON tradovate_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE tradovate_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access" 
ON tradovate_sessions 
FOR ALL 
TO service_role 
USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on row updates
CREATE TRIGGER update_tradovate_sessions_updated_at 
BEFORE UPDATE ON tradovate_sessions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM tradovate_sessions
    WHERE expires_at < NOW();
END;
$$ language 'plpgsql';



