-- ============================================
-- LIVESTREAM TABLES FOR PINDUODUO-STYLE LIVE SELLING
-- ============================================

-- 1. Livestreams table (Түз эфирлер)
CREATE TABLE IF NOT EXISTS livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic info
  title VARCHAR(200) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,

  -- Stream status
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,

  -- Stream URLs (for actual streaming)
  stream_key VARCHAR(100),
  playback_url TEXT,
  replay_url TEXT,

  -- Stats
  viewer_count INT DEFAULT 0,
  peak_viewers INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,

  -- Settings
  is_chat_enabled BOOLEAN DEFAULT true,
  is_products_enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Livestream products (Live учурунда көрсөтүлгөн продукттар)
CREATE TABLE IF NOT EXISTS livestream_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Display order
  display_order INT DEFAULT 0,

  -- Special live price (optional discount)
  live_price DECIMAL(10,2),
  live_stock INT,

  -- Stats
  clicks INT DEFAULT 0,
  orders INT DEFAULT 0,

  -- Is currently being showcased
  is_featured BOOLEAN DEFAULT false,
  featured_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(livestream_id, product_id)
);

-- 3. Livestream messages (Live чат)
CREATE TABLE IF NOT EXISTS livestream_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'emoji', 'gift', 'system')),

  -- For gifts/special messages
  metadata JSONB,

  -- Moderation
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Livestream likes (Лайктар - анимация үчүн)
CREATE TABLE IF NOT EXISTS livestream_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  emoji VARCHAR(10) DEFAULT '❤️',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Livestream viewers (Көрүүчүлөр трекинг)
CREATE TABLE IF NOT EXISTS livestream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Anonymous viewers tracked by session
  session_id VARCHAR(100),

  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,

  -- Duration in seconds
  watch_duration INT DEFAULT 0
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_livestreams_shop ON livestreams(shop_id);
CREATE INDEX IF NOT EXISTS idx_livestreams_status ON livestreams(status);
CREATE INDEX IF NOT EXISTS idx_livestreams_scheduled ON livestreams(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_livestreams_live ON livestreams(started_at) WHERE status = 'live';

CREATE INDEX IF NOT EXISTS idx_livestream_products_stream ON livestream_products(livestream_id);
CREATE INDEX IF NOT EXISTS idx_livestream_products_featured ON livestream_products(livestream_id) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_livestream_messages_stream ON livestream_messages(livestream_id);
CREATE INDEX IF NOT EXISTS idx_livestream_messages_created ON livestream_messages(livestream_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_livestream_likes_stream ON livestream_likes(livestream_id);
CREATE INDEX IF NOT EXISTS idx_livestream_likes_recent ON livestream_likes(livestream_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_livestream_viewers_stream ON livestream_viewers(livestream_id);
CREATE INDEX IF NOT EXISTS idx_livestream_viewers_active ON livestream_viewers(livestream_id) WHERE left_at IS NULL;

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE livestreams;
ALTER PUBLICATION supabase_realtime ADD TABLE livestream_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE livestream_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE livestream_viewers;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestream_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestream_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestream_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestream_viewers ENABLE ROW LEVEL SECURITY;

-- Livestreams policies
CREATE POLICY "Anyone can view live and ended streams" ON livestreams
  FOR SELECT USING (status IN ('live', 'ended'));

CREATE POLICY "Shop owners can manage their livestreams" ON livestreams
  FOR ALL USING (
    host_id = auth.uid() OR
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Livestream products policies
CREATE POLICY "Anyone can view livestream products" ON livestream_products
  FOR SELECT USING (true);

CREATE POLICY "Shop owners can manage livestream products" ON livestream_products
  FOR ALL USING (
    livestream_id IN (
      SELECT id FROM livestreams WHERE host_id = auth.uid()
    )
  );

-- Livestream messages policies
CREATE POLICY "Anyone can view messages" ON livestream_messages
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Authenticated users can send messages" ON livestream_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON livestream_messages
  FOR DELETE USING (user_id = auth.uid());

-- Livestream likes policies
CREATE POLICY "Anyone can view likes" ON livestream_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON livestream_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Livestream viewers policies
CREATE POLICY "Anyone can view viewer count" ON livestream_viewers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can join as viewer" ON livestream_viewers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own viewer record" ON livestream_viewers
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- FUNCTIONS FOR REAL-TIME STATS
-- ============================================

-- Function to update viewer count
CREATE OR REPLACE FUNCTION update_livestream_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE livestreams
    SET viewer_count = viewer_count + 1,
        peak_viewers = GREATEST(peak_viewers, viewer_count + 1)
    WHERE id = NEW.livestream_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    UPDATE livestreams
    SET viewer_count = GREATEST(0, viewer_count - 1)
    WHERE id = NEW.livestream_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viewer_count
  AFTER INSERT OR UPDATE ON livestream_viewers
  FOR EACH ROW EXECUTE FUNCTION update_livestream_viewer_count();

-- Function to update like count
CREATE OR REPLACE FUNCTION update_livestream_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE livestreams
  SET total_likes = total_likes + 1
  WHERE id = NEW.livestream_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_count
  AFTER INSERT ON livestream_likes
  FOR EACH ROW EXECUTE FUNCTION update_livestream_like_count();

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_livestream_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE livestreams
  SET total_comments = total_comments + 1
  WHERE id = NEW.livestream_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT ON livestream_messages
  FOR EACH ROW EXECUTE FUNCTION update_livestream_comment_count();