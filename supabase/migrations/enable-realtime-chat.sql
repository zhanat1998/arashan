-- =============================================
-- ENABLE REALTIME FOR CHAT
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Enable Realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 2. Enable RLS on chat tables
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for chat_messages
-- Users can read messages where they are sender or receiver
DROP POLICY IF EXISTS "Users can read own messages" ON chat_messages;
CREATE POLICY "Users can read own messages" ON chat_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Users can insert messages as sender
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
  );

-- Users can update their own messages (mark as read)
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE USING (
    receiver_id = auth.uid()
  );

-- 4. RLS Policies for conversations
-- Users can read their own conversations
DROP POLICY IF EXISTS "Users can read own conversations" ON conversations;
CREATE POLICY "Users can read own conversations" ON conversations
  FOR SELECT USING (
    user_id = auth.uid() OR
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Users can create conversations
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Users can update their own conversations
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    user_id = auth.uid() OR
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- 5. Create user_presence table for online status
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'offline', -- online, offline, away
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  typing_in UUID REFERENCES conversations(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_presence
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Enable Realtime for user_presence
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- RLS for user_presence
DROP POLICY IF EXISTS "Anyone can read presence" ON user_presence;
CREATE POLICY "Anyone can read presence" ON user_presence
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own presence" ON user_presence;
CREATE POLICY "Users can update own presence" ON user_presence
  FOR ALL USING (user_id = auth.uid());

-- 6. Function to update presence on login
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, last_seen)
  VALUES (NEW.id, 'online', NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'online',
    last_seen = NOW(),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_shop ON conversations(shop_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);

-- Done!
SELECT 'Realtime chat enabled successfully!' as message;