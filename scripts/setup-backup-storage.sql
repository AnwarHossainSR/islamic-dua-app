-- Create backups storage bucket (run this in Supabase Dashboard > Storage)
-- Go to Storage > Create new bucket
-- Name: backups
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: application/sql, text/plain

-- Or use this SQL in the SQL Editor:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups',
  false,
  52428800, -- 50MB limit
  ARRAY['application/sql', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;