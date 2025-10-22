-- Add device management columns to webauthn_credentials table
ALTER TABLE webauthn_credentials 
ADD COLUMN IF NOT EXISTS device_name TEXT NOT NULL DEFAULT 'Unknown Device',
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'platform',
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for device management
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_last_used ON webauthn_credentials(last_used_at DESC);

-- Update RLS policies to allow anyone to view credentials
CREATE POLICY "Anyone can view credentials" ON webauthn_credentials
  FOR SELECT USING (true);