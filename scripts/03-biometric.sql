-- Add this to your existing SQL schema
-- Biometric/Passkey Authentication Tables

-- WebAuthn Credentials table
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Credential data
  credential_id TEXT NOT NULL UNIQUE, -- Base64url encoded credential ID
  public_key TEXT NOT NULL, -- Public key for verification
  counter BIGINT NOT NULL DEFAULT 0, -- Signature counter for replay protection
  
  -- Device/Authenticator info
  device_name TEXT, -- User-friendly name like "iPhone 15", "MacBook Pro"
  device_type TEXT DEFAULT 'platform' CHECK (device_type IN ('platform', 'cross-platform')),
  -- platform = built-in (Touch ID, Face ID, Windows Hello)
  -- cross-platform = external (USB security key)
  
  aaguid TEXT, -- Authenticator Attestation GUID
  transports TEXT[], -- ['usb', 'nfc', 'ble', 'internal']
  
  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  user_agent TEXT, -- Browser/device info when registered
  ip_address INET -- IP when registered
);

-- Indexes for webauthn_credentials
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_active ON webauthn_credentials(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_webauthn_credentials_updated_at 
  BEFORE UPDATE ON webauthn_credentials
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credentials" ON webauthn_credentials;
DROP POLICY IF EXISTS "Users can manage their own credentials" ON webauthn_credentials;

CREATE POLICY "Users can view their own credentials"
  ON webauthn_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own credentials"
  ON webauthn_credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add biometric preference to user_preferences
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_preferences' AND column_name = 'biometric_enabled') THEN
    ALTER TABLE user_preferences ADD COLUMN biometric_enabled BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_preferences' AND column_name = 'biometric_device_name') THEN
    ALTER TABLE user_preferences ADD COLUMN biometric_device_name TEXT;
  END IF;
END $$;