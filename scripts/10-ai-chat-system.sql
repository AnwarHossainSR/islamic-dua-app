-- AI Chat System Tables
-- This script creates tables for storing AI chat sessions and messages

-- Create AI Chat Sessions table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    chat_mode TEXT NOT NULL DEFAULT 'general' CHECK (chat_mode IN ('general', 'database')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI Chat Messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata TEXT, -- JSON string for additional data like related duas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_updated_at ON ai_chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for ai_chat_sessions: Users can only access their own sessions
CREATE POLICY "Users can manage their own chat sessions" ON ai_chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Policy for ai_chat_messages: Users can only access messages from their own sessions
CREATE POLICY "Users can manage their own chat messages" ON ai_chat_messages
    FOR ALL USING (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM ai_chat_sessions 
            WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
            AND ai_chat_sessions.user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on ai_chat_sessions
CREATE TRIGGER trigger_update_ai_chat_sessions_updated_at
    BEFORE UPDATE ON ai_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_chat_sessions_updated_at();

-- Grant necessary permissions
GRANT ALL ON ai_chat_sessions TO authenticated;
GRANT ALL ON ai_chat_messages TO authenticated;