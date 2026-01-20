-- =============================================
-- SEED DATA - Run this after schema.sql
-- =============================================

-- Disable RLS temporarily for seeding
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE shops DISABLE ROW LEVEL SECURITY;

-- Clear existing data
DELETE FROM products;
DELETE FROM shops;
DELETE FROM users WHERE email LIKE '%@pinduo.kg';
DELETE FROM categories;
DELETE FROM coupons;
DELETE FROM games;

-- 1. Insert categories
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

-- 2. Insert test users
INSERT INTO users (email, full_name, coins) VALUES
  ('techstore@pinduo.kg', 'TechStore Owner', 1000),
  ('fashion@pinduo.kg', 'Fashion Owner', 1000),
  ('home@pinduo.kg', 'Home Owner', 1000),
  ('beauty@pinduo.kg', 'Beauty Owner', 1000);

-- 3. Insert shops
INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT
  u.id,
  'TechStore KG',
  'https://ui-avatars.com/api/?name=Tech+Store&background=3B82F6&color=fff&size=200',
  'Электроника жана гаджеттер',
  4.8,
  15420,
  8500,
  156,
  true,
  true,
  98,
  '< 1 саат',
  'Бишкек'
FROM users u WHERE u.email = 'techstore@pinduo.kg';

INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT
  u.id,
  'Fashion House',
  'https://ui-avatars.com/api/?name=Fashion+House&background=EC4899&color=fff&size=200',
  'Модалуу кийимдер',
  4.6,
  23100,
  12000,
  340,
  true,
  false,
  95,
  '< 2 саат',
  'Ош'
FROM users u WHERE u.email = 'fashion@pinduo.kg';

INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT
  u.id,
  'Home & Living',
  'https://ui-avatars.com/api/?name=Home+Living&background=10B981&color=fff&size=200',
  'Үй буюмдары жана декор',
  4.7,
  8900,
  4200,
  210,
  true,
  false,
  92,
  '< 3 саат',
  'Бишкек'
FROM users u WHERE u.email = 'home@pinduo.kg';

INSERT INTO shops (owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location)
SELECT
  u.id,
  'Beauty World',
  'https://ui-avatars.com/api/?name=Beauty+World&background=F59E0B&color=fff&size=200',
  'Косметика жана парфюмерия',
  4.9,
  31000,
  18000,
  520,
  true,
  true,
  99,
  '< 30 мин',
  'Бишкек'
FROM users u WHERE u.email = 'beauty@pinduo.kg';

-- 4. Insert products
-- Electronics
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'iPhone 15 Pro Max 256GB - Titanium Blue',
  'Apple iPhone 15 Pro Max - эң акыркы модель. A17 Pro чип, 48MP камера, титан корпус.',
  89990,
  99990,
  ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
  'Apple',
  25,
  1250,
  4.9,
  342,
  45000,
  2100,
  true,
  84990,
  3,
  true
FROM shops s, categories c
WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Samsung Galaxy S24 Ultra 512GB',
  'Samsung Galaxy S24 Ultra - AI функциялары менен. S Pen кирет.',
  74990,
  84990,
  ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
  'Samsung',
  40,
  890,
  4.8,
  256,
  32000,
  1500,
  true,
  69990,
  2,
  true
FROM shops s, categories c
WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT
  s.id,
  c.id,
  'AirPods Pro 2 - USB-C',
  'Apple AirPods Pro 2-чи муун. Активдүү шыбыш басуу, USB-C кубаттоо.',
  18990,
  22990,
  ARRAY['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500'],
  'Apple',
  100,
  3200,
  4.9,
  890,
  28000,
  4200,
  true,
  16990,
  NOW() + INTERVAL '24 hours',
  true
FROM shops s, categories c
WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT
  s.id,
  c.id,
  'MacBook Air M3 15"',
  'Apple MacBook Air M3 чип менен. 15 дюйм Liquid Retina дисплей.',
  114990,
  129990,
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
  'Apple',
  15,
  420,
  4.9,
  156,
  18000,
  980,
  true
FROM shops s, categories c
WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Sony PlayStation 5',
  'Sony PS5 оюн консолу. 825GB SSD, DualSense контроллер.',
  42990,
  49990,
  ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500'],
  'Sony',
  20,
  650,
  4.9,
  180,
  35000,
  2500,
  true,
  39990,
  2,
  true
FROM shops s, categories c
WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Apple Watch Ultra 2',
  'Apple Watch Ultra 2. Титан корпус, GPS + Cellular.',
  59990,
  69990,
  ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500'],
  'Apple',
  30,
  280,
  4.9,
  98,
  15000,
  820,
  true,
  54990,
  2,
  true
FROM shops s, categories c
WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT
  s.id,
  c.id,
  'DJI Mini 4 Pro Drone',
  'DJI Mini 4 Pro дрон. 4K камера, 34 мин учуу.',
  64990,
  74990,
  ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500'],
  'DJI',
  15,
  120,
  4.8,
  56,
  12000,
  680,
  true
FROM shops s, categories c
WHERE s.name = 'TechStore KG' AND c.name = 'Электроника';

-- Clothing
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Кышкы куртка - Premium Down Jacket',
  'Жылуу кышкы куртка. -30 градуска чейин жылуулук сактайт.',
  4990,
  7990,
  ARRAY['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500'],
  'WinterPro',
  200,
  5600,
  4.7,
  1230,
  42000,
  3200,
  true,
  3990,
  5,
  true
FROM shops s, categories c
WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT
  s.id,
  c.id,
  'Спорттук костюм - Nike Dri-FIT',
  'Nike оригинал спорттук костюм. Дем алуучу материал.',
  5490,
  6990,
  ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'],
  'Nike',
  150,
  2800,
  4.8,
  567,
  25000,
  1800,
  true
FROM shops s, categories c
WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT
  s.id,
  c.id,
  'Adidas Ultraboost кроссовка',
  'Adidas Ultraboost 22. Эң жеңил жана ыңгайлуу бут кийим.',
  9990,
  12990,
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
  'Adidas',
  80,
  1200,
  4.8,
  340,
  22000,
  1400,
  true,
  7990,
  NOW() + INTERVAL '12 hours',
  true
FROM shops s, categories c
WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT
  s.id,
  c.id,
  'Джинсы Levis 501 Original',
  'Levis 501 классикалык джинсы. Оригинал.',
  3990,
  4990,
  ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
  'Levis',
  100,
  3400,
  4.7,
  890,
  28000,
  1900,
  true
FROM shops s, categories c
WHERE s.name = 'Fashion House' AND c.name = 'Кийим';

-- Home & Living
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Робот чаң соргуч - Xiaomi Mi Robot',
  'Акылдуу робот чаң соргуч. LiDAR навигация, App башкаруу.',
  19990,
  24990,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
  'Xiaomi',
  50,
  890,
  4.7,
  345,
  22000,
  1100,
  true,
  17990,
  3,
  true
FROM shops s, categories c
WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT
  s.id,
  c.id,
  'LED лампа - Philips Hue Starter Kit',
  'Акылдуу LED лампа. 16 миллион түс, WiFi башкаруу.',
  4990,
  5990,
  ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'],
  'Philips',
  300,
  4500,
  4.8,
  890,
  35000,
  2300,
  true
FROM shops s, categories c
WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Кофе машина - DeLonghi Magnifica',
  'Автоматтык эспрессо машина. Кремдүү капучино.',
  32990,
  39990,
  ARRAY['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
  'DeLonghi',
  25,
  180,
  4.9,
  89,
  12000,
  650,
  true,
  29990,
  2,
  true
FROM shops s, categories c
WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Блендер - Vitamix E310',
  'Vitamix профессионал блендер. 10 жылдык гарантия.',
  29990,
  34990,
  ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500'],
  'Vitamix',
  20,
  150,
  4.9,
  78,
  8000,
  420,
  true,
  26990,
  3,
  true
FROM shops s, categories c
WHERE s.name = 'Home & Living' AND c.name = 'Үй буюмдары';

-- Beauty World
INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT
  s.id,
  c.id,
  'Парфюм - Chanel No.5',
  'Chanel No.5 Eau de Parfum 100ml. Оригинал.',
  12990,
  15990,
  ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
  'Chanel',
  30,
  560,
  4.9,
  234,
  18000,
  1500,
  true,
  10990,
  NOW() + INTERVAL '6 hours',
  true
FROM shops s, categories c
WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship)
SELECT
  s.id,
  c.id,
  'Чач кургаткыч - Dyson Supersonic',
  'Dyson Supersonic чач кургаткыч. Чачты коргойт.',
  34990,
  39990,
  ARRAY['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500'],
  'Dyson',
  25,
  340,
  4.8,
  156,
  20000,
  980,
  true,
  31990,
  2,
  true
FROM shops s, categories c
WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, has_freeship)
SELECT
  s.id,
  c.id,
  'Крем - La Mer Moisturizing',
  'La Mer Creme de la Mer 60ml. Люкс класс крем.',
  24990,
  29990,
  ARRAY['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500'],
  'La Mer',
  15,
  120,
  4.9,
  67,
  9000,
  450,
  true
FROM shops s, categories c
WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship)
SELECT
  s.id,
  c.id,
  'Makeup Set - MAC Professional',
  'MAC Professional макияж комплект. 24 түстүү палитра.',
  8990,
  11990,
  ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500'],
  'MAC',
  50,
  890,
  4.8,
  234,
  16000,
  1100,
  true,
  6990,
  NOW() + INTERVAL '8 hours',
  true
FROM shops s, categories c
WHERE s.name = 'Beauty World' AND c.name = 'Сулуулук';

-- 5. Insert coupons
INSERT INTO coupons (code, type, value, min_purchase, max_discount, usage_limit, expires_at, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 1000, 500, 10000, NOW() + INTERVAL '365 days', true),
  ('NEWYEAR2025', 'fixed', 1000, 5000, null, 500, NOW() + INTERVAL '30 days', true),
  ('FREESHIP', 'fixed', 150, 2000, null, 1000, NOW() + INTERVAL '60 days', true),
  ('VIP20', 'percentage', 20, 10000, 2000, 100, NOW() + INTERVAL '14 days', true);

-- 6. Insert games
INSERT INTO games (name, type, rewards, is_active) VALUES
  ('Бактылуу дөңгөлөк', 'spin_wheel', '[
    {"type": "coins", "value": 10, "probability": 30, "label": "10 монета"},
    {"type": "coins", "value": 50, "probability": 25, "label": "50 монета"},
    {"type": "coins", "value": 100, "probability": 15, "label": "100 монета"},
    {"type": "coins", "value": 500, "probability": 5, "label": "500 монета"},
    {"type": "coupon", "value": 5, "probability": 10, "label": "5% арзандатуу"},
    {"type": "nothing", "value": 0, "probability": 15, "label": "Кийинки жолу"}
  ]'::jsonb, true),
  ('Күндөлүк белги', 'daily_checkin', '[
    {"day": 1, "type": "coins", "value": 10},
    {"day": 2, "type": "coins", "value": 20},
    {"day": 3, "type": "coins", "value": 30},
    {"day": 4, "type": "coins", "value": 50},
    {"day": 5, "type": "coins", "value": 80},
    {"day": 6, "type": "coins", "value": 100},
    {"day": 7, "type": "coins", "value": 200}
  ]'::jsonb, true);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Summary
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Shops: ' || COUNT(*) FROM shops;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Coupons: ' || COUNT(*) FROM coupons;
SELECT 'Games: ' || COUNT(*) FROM games;