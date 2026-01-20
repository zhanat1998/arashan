-- =============================================
-- PINDUO SHOP - DATABASE SCHEMA
-- Pinduoduo clone for Kyrgyzstan
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  coins INTEGER DEFAULT 0,
  coupons_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. SHOPS (Sellers)
-- =============================================
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo TEXT,
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0,
  sales_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  products_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_official_store BOOLEAN DEFAULT FALSE,
  response_rate INTEGER DEFAULT 100,
  response_time VARCHAR(50) DEFAULT '30 мин',
  location VARCHAR(255) DEFAULT 'Бишкек',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. CATEGORIES
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  image TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. PRODUCTS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  brand VARCHAR(255),
  stock INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  colors TEXT[],
  sizes TEXT[],
  rating DECIMAL(2,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_group_buy BOOLEAN DEFAULT FALSE,
  group_buy_price DECIMAL(12,2),
  group_buy_min_people INTEGER DEFAULT 2,
  is_flash_sale BOOLEAN DEFAULT FALSE,
  flash_sale_price DECIMAL(12,2),
  flash_sale_ends_at TIMESTAMP WITH TIME ZONE,
  has_freeship BOOLEAN DEFAULT FALSE,
  specifications JSONB,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- =============================================
-- 5. GROUP BUYS (Бирге алуу)
-- =============================================
CREATE TABLE group_buys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  initiator_id UUID REFERENCES users(id),
  current_people INTEGER DEFAULT 1,
  required_people INTEGER NOT NULL,
  group_price DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_group_buys_status ON group_buys(status);
CREATE INDEX idx_group_buys_product ON group_buys(product_id);

-- Group Buy Participants
CREATE TABLE group_buy_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_buy_id UUID REFERENCES group_buys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_buy_id, user_id)
);

-- =============================================
-- 6. FLASH SALES
-- =============================================
CREATE TABLE flash_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sale_price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2) NOT NULL,
  stock INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flash_sales_active ON flash_sales(is_active, starts_at, ends_at);

-- =============================================
-- 7. ORDERS
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  shop_id UUID REFERENCES shops(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  shipping_fee DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(50),
  payment_id UUID,
  shipping_address JSONB NOT NULL,
  notes TEXT,
  group_buy_id UUID REFERENCES group_buys(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  selected_color VARCHAR(100),
  selected_size VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. COUPONS & GAMES
-- =============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(12,2) NOT NULL,
  min_purchase DECIMAL(12,2) DEFAULT 0,
  max_discount DECIMAL(12,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's collected coupons
CREATE TABLE user_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

-- Games configuration
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('spin_wheel', 'daily_checkin', 'scratch_card', 'lucky_draw')),
  rewards JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game play history
CREATE TABLE game_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id),
  reward_type VARCHAR(50) NOT NULL,
  reward_value DECIMAL(12,2) NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_game_plays_user ON game_plays(user_id, played_at);

-- =============================================
-- 9. LIVE STREAMS
-- =============================================
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  host_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key VARCHAR(255) UNIQUE DEFAULT uuid_generate_v4()::text,
  stream_url TEXT,
  playback_url TEXT,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  products UUID[] DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_live_streams_status ON live_streams(status);
CREATE INDEX idx_live_streams_shop ON live_streams(shop_id);

-- =============================================
-- 10. CHAT SYSTEM
-- =============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shop_id)
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'product', 'order')),
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);

-- =============================================
-- 11. REVIEWS
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  images TEXT[],
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- =============================================
-- 12. PAYMENTS
-- =============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KGS',
  method VARCHAR(20) CHECK (method IN ('mbank', 'elsom', 'visa', 'mastercard', 'balance')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  provider_id VARCHAR(255),
  provider_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =============================================
-- 13. VIDEOS (Feed)
-- =============================================
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_videos_created ON videos(created_at DESC);

-- =============================================
-- 14. VIEWS & FUNCTIONS
-- =============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'PD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Function to update product stats
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sold count
  UPDATE products
  SET sold_count = sold_count + NEW.quantity,
      stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_on_order
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stats();

-- Function to check group buy completion
CREATE OR REPLACE FUNCTION check_group_buy_completion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE group_buys
  SET current_people = current_people + 1,
      status = CASE
        WHEN current_people + 1 >= required_people THEN 'completed'
        ELSE status
      END,
      completed_at = CASE
        WHEN current_people + 1 >= required_people THEN NOW()
        ELSE completed_at
      END
  WHERE id = NEW.group_buy_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_group_buy_join
  AFTER INSERT ON group_buy_participants
  FOR EACH ROW
  EXECUTE FUNCTION check_group_buy_completion();

-- =============================================
-- 15. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Shop owners can manage their shop
CREATE POLICY "Shop owners can manage their shop" ON shops
  FOR ALL USING (auth.uid() = owner_id);

-- Users can view all shops
CREATE POLICY "Anyone can view shops" ON shops
  FOR SELECT USING (true);

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Chat messages - participants only
CREATE POLICY "Chat participants can view messages" ON chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- User coupons
CREATE POLICY "Users can view own coupons" ON user_coupons
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 16. INITIAL DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, icon, color, sort_order) VALUES
  ('Баары', '🏠', '#e4393c', 0),
  ('Электроника', '📱', '#3b82f6', 1),
  ('Кийим', '👗', '#ec4899', 2),
  ('Бут кийим', '👟', '#8b5cf6', 3),
  ('Үй буюмдары', '🏡', '#22c55e', 4),
  ('Косметика', '💄', '#f43f5e', 5),
  ('Спорт', '⚽', '#f59e0b', 6),
  ('Балдар', '🧸', '#06b6d4', 7),
  ('Азык-түлүк', '🍎', '#84cc16', 8),
  ('Авто', '🚗', '#6366f1', 9);

-- Insert default game (Spin Wheel)
INSERT INTO games (name, type, rewards, is_active) VALUES
  ('Дөңгөлөк айландыр', 'spin_wheel', '[
    {"type": "coins", "value": 10, "probability": 0.3, "label": "10 монета"},
    {"type": "coins", "value": 50, "probability": 0.2, "label": "50 монета"},
    {"type": "coins", "value": 100, "probability": 0.1, "label": "100 монета"},
    {"type": "coupon", "value": 5, "probability": 0.15, "label": "5% арзандатуу"},
    {"type": "coupon", "value": 10, "probability": 0.1, "label": "10% арзандатуу"},
    {"type": "coupon", "value": 20, "probability": 0.05, "label": "20% арзандатуу"},
    {"type": "nothing", "value": 0, "probability": 0.1, "label": "Кайра аракет кыл"}
  ]', true),
  ('Күнүмдүк кирүү', 'daily_checkin', '[
    {"day": 1, "type": "coins", "value": 5},
    {"day": 2, "type": "coins", "value": 10},
    {"day": 3, "type": "coins", "value": 15},
    {"day": 4, "type": "coins", "value": 20},
    {"day": 5, "type": "coins", "value": 30},
    {"day": 6, "type": "coins", "value": 50},
    {"day": 7, "type": "coupon", "value": 10}
  ]', true);

-- Insert sample coupons
INSERT INTO coupons (code, type, value, min_purchase, expires_at) VALUES
  ('WELCOME10', 'percentage', 10, 500, NOW() + INTERVAL '30 days'),
  ('FIRST50', 'fixed', 50, 1000, NOW() + INTERVAL '30 days'),
  ('VIP20', 'percentage', 20, 2000, NOW() + INTERVAL '14 days');