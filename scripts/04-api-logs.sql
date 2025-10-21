-- Create API logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  meta JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_logs_level ON api_logs(level);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (only admins can access logs)
CREATE POLICY "Admin users can view logs" ON api_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can insert logs" ON api_logs
  FOR INSERT WITH CHECK (true);

-- Create delete policy (only admins can delete logs)
CREATE POLICY "Admin users can delete logs" ON api_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );