-- =============================================
-- FULL SETUP - Schema + Seed Data
-- Run this ONCE in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/unrlhlkysehdojmyvnno/sql
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP existing tables (clean start)
-- =============================================
DROP TABLE IF EXISTS game_plays CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS user_coupons CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS flash_sales CASCADE;
DROP TABLE IF EXISTS group_buy_participants CASCADE;
DROP TABLE IF EXISTS group_buys CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS live_streams CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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
-- 2. SHOPS
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
-- 5. GROUP BUYS
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

-- =============================================
-- 7. ORDERS
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  shop_id UUID REFERENCES shops(id),
  order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'PD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
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

CREATE TABLE user_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('spin_wheel', 'daily_checkin', 'scratch_card', 'lucky_draw')),
  rewards JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE game_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id),
  reward_type VARCHAR(50) NOT NULL,
  reward_value DECIMAL(12,2) NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- =============================================
-- 13. VIDEOS
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

-- =============================================
-- SEED DATA
-- =============================================

-- 1. Categories
INSERT INTO categories (name, icon, color, sort_order) VALUES
  ('Электроника', '📱', '#3B82F6', 1),
  ('Кийим', '👕', '#EC4899', 2),
  ('Үй буюмдары', '🏠', '#10B981', 3),
  ('Сулуулук', '💄', '#F59E0B', 4),
  ('Спорт', '⚽', '#6366F1', 5),
  ('Оюнчуктар', '🧸', '#EF4444', 6),
  ('Тамак-аш', '🍎', '#22C55E', 7),
  ('Китептер', '📚', '#8B5CF6', 8),
  ('Автотовар', '🚗', '#64748B', 9),
  ('Башка', '📦', '#F97316', 10);

-- 2. Users
INSERT INTO users (email, full_name, coins) VALUES
  ('techstore@pinduo.kg', 'TechStore Owner', 1000),
  ('fashion@pinduo.kg', 'Fashion Owner', 1000),
  ('home@pinduo.kg', 'Home Owner', 1000),
  ('beauty@pinduo.kg', 'Beauty Owner', 1000);

-- 3. Shops
INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT u.id, 'TechStore KG', 'https://ui-avatars.com/api/?name=Tech+Store&background=3B82F6&color=fff&size=200', 'Электроника жана гаджеттер', 4.8, 15420, 8500, 156, true, true, 98, '< 1 саат', 'Бишкек'
FROM users u WHERE u.email = 'techstore@pinduo.kg';

INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT u.id, 'Fashion House', 'https://ui-avatars.com/api/?name=Fashion+House&background=EC4899&color=fff&size=200', 'Модалуу кийимдер', 4.6, 23100, 12000, 340, true, false, 95, '< 2 саат', 'Ош'
FROM users u WHERE u.email = 'fashion@pinduo.kg';

INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT u.id, 'Home & Living', 'https://ui-avatars.com/api/?name=Home+Living&background=10B981&color=fff&size=200', 'Үй буюмдары жана декор', 4.7, 8900, 4200, 210, true, false, 92, '< 3 саат', 'Бишкек'
FROM users u WHERE u.email = 'home@pinduo.kg';

INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT u.id, 'Beauty World', 'https://ui-avatars.com/api/?name=Beauty+World&background=F59E0B&color=fff&size=200', 'Косметика жана парфюмерия', 4.9, 31000, 18000, 520, true, true, 99, '< 30 мин', 'Бишкек'
FROM users u WHERE u.email = 'beauty@pinduo.kg';

-- 4. Products - Electronics
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'iPhone 15 Pro Max 256GB', 'Apple iPhone 15 Pro Max - эң акыркы модель. A17 Pro чип, 48MP камера, титан корпус.', 89990, 99990, ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'], 'Apple', 25, 1250, 4.9, 342, 45000, 2100, true, 84990, 3, true
FROM shops s, categories c WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra - AI функциялары менен. S Pen кирет.', 74990, 84990, ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'], 'Samsung', 40, 890, 4.8, 256, 32000, 1500, true, 69990, 2, true
FROM shops s, categories c WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT s.id, c.id, 'AirPods Pro 2 USB-C', 'Apple AirPods Pro 2-чи муун. Активдүү шыбыш басуу.', 18990, 22990, ARRAY['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500'], 'Apple', 100, 3200, 4.9, 890, 28000, 4200, true, 16990, NOW() + INTERVAL '24 hours', true
FROM shops s, categories c WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT s.id, c.id, 'MacBook Air M3 15"', 'Apple MacBook Air M3 чип менен. 15 дюйм Retina дисплей.', 114990, 129990, ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'], 'Apple', 15, 420, 4.9, 156, 18000, 980, true
FROM shops s, categories c WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'Sony PlayStation 5', 'Sony PS5 оюн консолу. 825GB SSD, DualSense контроллер.', 42990, 49990, ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500'], 'Sony', 20, 650, 4.9, 180, 35000, 2500, true, 39990, 2, true
FROM shops s, categories c WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'Apple Watch Ultra 2', 'Apple Watch Ultra 2. Титан корпус, GPS + Cellular.', 59990, 69990, ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500'], 'Apple', 30, 280, 4.9, 98, 15000, 820, true, 54990, 2, true
FROM shops s, categories c WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT s.id, c.id, 'DJI Mini 4 Pro Drone', 'DJI Mini 4 Pro дрон. 4K камера, 34 мин учуу.', 64990, 74990, ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500'], 'DJI', 15, 120, 4.8, 56, 12000, 680, true
FROM shops s, categories c WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

-- Products - Clothing
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'Кышкы куртка Premium', 'Жылуу кышкы куртка. -30 градуска чейин жылуулук сактайт.', 4990, 7990, ARRAY['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500'], 'WinterPro', 200, 5600, 4.7, 1230, 42000, 3200, true, 3990, 5, true
FROM shops s, categories c WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT s.id, c.id, 'Nike Dri-FIT костюм', 'Nike оригинал спорттук костюм. Дем алуучу материал.', 5490, 6990, ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'], 'Nike', 150, 2800, 4.8, 567, 25000, 1800, true
FROM shops s, categories c WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT s.id, c.id, 'Adidas Ultraboost', 'Adidas Ultraboost 22. Эң жеңил жана ыңгайлуу бут кийим.', 9990, 12990, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], 'Adidas', 80, 1200, 4.8, 340, 22000, 1400, true, 7990, NOW() + INTERVAL '12 hours', true
FROM shops s, categories c WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT s.id, c.id, 'Levis 501 джинсы', 'Levis 501 классикалык джинсы. Оригинал.', 3990, 4990, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], 'Levis', 100, 3400, 4.7, 890, 28000, 1900, true
FROM shops s, categories c WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

-- Products - Home
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'Xiaomi Robot чаң соргуч', 'Акылдуу робот чаң соргуч. LiDAR навигация, App башкаруу.', 19990, 24990, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], 'Xiaomi', 50, 890, 4.7, 345, 22000, 1100, true, 17990, 3, true
FROM shops s, categories c WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT s.id, c.id, 'Philips Hue лампа', 'Акылдуу LED лампа. 16 миллион түс, WiFi башкаруу.', 4990, 5990, ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'], 'Philips', 300, 4500, 4.8, 890, 35000, 2300, true
FROM shops s, categories c WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'DeLonghi кофе машина', 'Автоматтык эспрессо машина. Кремдүү капучино.', 32990, 39990, ARRAY['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'], 'DeLonghi', 25, 180, 4.9, 89, 12000, 650, true, 29990, 2, true
FROM shops s, categories c WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'Vitamix блендер', 'Vitamix профессионал блендер. 10 жылдык гарантия.', 29990, 34990, ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500'], 'Vitamix', 20, 150, 4.9, 78, 8000, 420, true, 26990, 3, true
FROM shops s, categories c WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

-- Products - Beauty
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT s.id, c.id, 'Chanel No.5 парфюм', 'Chanel No.5 Eau de Parfum 100ml. Оригинал.', 12990, 15990, ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'], 'Chanel', 30, 560, 4.9, 234, 18000, 1500, true, 10990, NOW() + INTERVAL '6 hours', true
FROM shops s, categories c WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT s.id, c.id, 'Dyson Supersonic', 'Dyson Supersonic чач кургаткыч. Чачты коргойт.', 34990, 39990, ARRAY['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500'], 'Dyson', 25, 340, 4.8, 156, 20000, 980, true, 31990, 2, true
FROM shops s, categories c WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT s.id, c.id, 'La Mer крем', 'La Mer Creme de la Mer 60ml. Люкс класс крем.', 24990, 29990, ARRAY['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500'], 'La Mer', 15, 120, 4.9, 67, 9000, 450, true
FROM shops s, categories c WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT s.id, c.id, 'MAC макияж сет', 'MAC Professional макияж комплект. 24 түстүү палитра.', 8990, 11990, ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500'], 'MAC', 50, 890, 4.8, 234, 16000, 1100, true, 6990, NOW() + INTERVAL '8 hours', true
FROM shops s, categories c WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

-- 5. Coupons
INSERT INTO coupons (code, type, value, min_purchase, max_discount, usage_limit, expires_at, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 1000, 500, 10000, NOW() + INTERVAL '365 days', true),
  ('NEWYEAR2025', 'fixed', 1000, 5000, null, 500, NOW() + INTERVAL '30 days', true),
  ('FREESHIP', 'fixed', 150, 2000, null, 1000, NOW() + INTERVAL '60 days', true),
  ('VIP20', 'percentage', 20, 10000, 2000, 100, NOW() + INTERVAL '14 days', true);

-- 6. Games
INSERT INTO games (name, type, rewards, is_active) VALUES
  ('Бактылуу дөңгөлөк', 'spin_wheel', '[{"type": "coins", "value": 10, "probability": 30, "label": "10 монета"}, {"type": "coins", "value": 50, "probability": 25, "label": "50 монета"}, {"type": "coins", "value": 100, "probability": 15, "label": "100 монета"}, {"type": "coins", "value": 500, "probability": 5, "label": "500 монета"}, {"type": "coupon", "value": 5, "probability": 10, "label": "5% арзандатуу"}, {"type": "nothing", "value": 0, "probability": 15, "label": "Кийинки жолу"}]'::jsonb, true),
  ('Күндөлүк белги', 'daily_checkin', '[{"day": 1, "type": "coins", "value": 10}, {"day": 2, "type": "coins", "value": 20}, {"day": 3, "type": "coins", "value": 30}, {"day": 4, "type": "coins", "value": 50}, {"day": 5, "type": "coins", "value": 80}, {"day": 6, "type": "coins", "value": 100}, {"day": 7, "type": "coins", "value": 200}]'::jsonb, true);

-- Summary
SELECT 'Setup complete!' as status;
SELECT 'Categories: ' || COUNT(*)::text FROM categories;
SELECT 'Users: ' || COUNT(*)::text FROM users;
SELECT 'Shops: ' || COUNT(*)::text FROM shops;
SELECT 'Products: ' || COUNT(*)::text FROM products;
SELECT 'Coupons: ' || COUNT(*)::text FROM coupons;
SELECT 'Games: ' || COUNT(*)::text FROM games;