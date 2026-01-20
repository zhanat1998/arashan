-- =============================================
-- SEED DATA FOR PINDUO SHOP
-- Run this in Supabase SQL Editor after schema.sql
-- =============================================

-- First, ensure the UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES
-- =============================================
INSERT INTO categories (id, name, icon, color, sort_order) VALUES
  (uuid_generate_v4(), 'Электроника', '📱', '#3B82F6', 1),
  (uuid_generate_v4(), 'Кийим', '👕', '#EC4899', 2),
  (uuid_generate_v4(), 'Үй буюмдары', '🏠', '#10B981', 3),
  (uuid_generate_v4(), 'Сулуулук', '💄', '#F59E0B', 4),
  (uuid_generate_v4(), 'Спорт', '⚽', '#6366F1', 5),
  (uuid_generate_v4(), 'Оюнчуктар', '🧸', '#EF4444', 6),
  (uuid_generate_v4(), 'Тамак-аш', '🍎', '#22C55E', 7),
  (uuid_generate_v4(), 'Китептер', '📚', '#8B5CF6', 8),
  (uuid_generate_v4(), 'Автотовар', '🚗', '#64748B', 9),
  (uuid_generate_v4(), 'Башка', '📦', '#F97316', 10)
ON CONFLICT DO NOTHING;

-- =============================================
-- TEMPORARY USERS (for shop owners)
-- =============================================
INSERT INTO users (id, email, full_name, coins) VALUES
  ('11111111-1111-1111-1111-111111111111', 'techstore@example.com', 'TechStore Owner', 1000),
  ('22222222-2222-2222-2222-222222222222', 'fashion@example.com', 'Fashion Owner', 1000),
  ('33333333-3333-3333-3333-333333333333', 'home@example.com', 'Home Owner', 1000),
  ('44444444-4444-4444-4444-444444444444', 'beauty@example.com', 'Beauty Owner', 1000)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SHOPS
-- =============================================
INSERT INTO shops (id, owner_id, name, logo, description, rating, sales_count, followers_count, products_count, is_verified, is_official_store, response_rate, response_time, location) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'TechStore KG', 'https://ui-avatars.com/api/?name=Tech+Store&background=3B82F6&color=fff', 'Электроника жана гаджеттер', 4.8, 15420, 8500, 156, true, true, 98, '< 1 саат', 'Бишкек'),
  ('aaaa2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Fashion House', 'https://ui-avatars.com/api/?name=Fashion+House&background=EC4899&color=fff', 'Модалуу кийимдер', 4.6, 23100, 12000, 340, true, false, 95, '< 2 саат', 'Ош'),
  ('aaaa3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Home & Living', 'https://ui-avatars.com/api/?name=Home+Living&background=10B981&color=fff', 'Үй буюмдары жана декор', 4.7, 8900, 4200, 210, true, false, 92, '< 3 саат', 'Бишкек'),
  ('aaaa4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Beauty World', 'https://ui-avatars.com/api/?name=Beauty+World&background=F59E0B&color=fff', 'Косметика жана парфюмерия', 4.9, 31000, 18000, 520, true, true, 99, '< 30 мин', 'Бишкек')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PRODUCTS
-- =============================================

-- Get category IDs first (we'll use direct insert with subqueries)
DO $$
DECLARE
  cat_electronics UUID;
  cat_clothing UUID;
  cat_home UUID;
  cat_beauty UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_electronics FROM categories WHERE name = 'Электроника' LIMIT 1;
  SELECT id INTO cat_clothing FROM categories WHERE name = 'Кийим' LIMIT 1;
  SELECT id INTO cat_home FROM categories WHERE name = 'Үй буюмдары' LIMIT 1;
  SELECT id INTO cat_beauty FROM categories WHERE name = 'Сулуулук' LIMIT 1;

  -- Electronics
  INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, colors, sizes, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship, specifications) VALUES
    ('aaaa1111-1111-1111-1111-111111111111', cat_electronics, 'iPhone 15 Pro Max 256GB - Titanium Blue', 'Apple iPhone 15 Pro Max - эң акыркы модель. A17 Pro чип, 48MP камера, титан корпус.', 89990, 99990, ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'], 'Apple', 25, 1250, ARRAY['Titanium Blue', 'Titanium Black', 'Titanium White'], ARRAY['256GB', '512GB', '1TB'], 4.9, 342, 45000, 2100, true, 84990, 3, true, '[{"key": "Экран", "value": "6.7\" Super Retina XDR"}, {"key": "Чип", "value": "A17 Pro"}, {"key": "Камера", "value": "48MP + 12MP + 12MP"}]'::jsonb),

    ('aaaa1111-1111-1111-1111-111111111111', cat_electronics, 'Samsung Galaxy S24 Ultra 512GB', 'Samsung Galaxy S24 Ultra - AI функциялары менен. S Pen кирет.', 74990, 84990, ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'], 'Samsung', 40, 890, ARRAY['Titanium Gray', 'Titanium Black'], ARRAY['256GB', '512GB', '1TB'], 4.8, 256, 32000, 1500, true, 69990, 2, true, NULL),

    ('aaaa1111-1111-1111-1111-111111111111', cat_electronics, 'AirPods Pro 2 - USB-C', 'Apple AirPods Pro 2-чи муун. Активдүү шыбыш басуу, USB-C кубаттоо.', 18990, 22990, ARRAY['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500'], 'Apple', 100, 3200, ARRAY['White'], NULL, 4.9, 890, 28000, 4200, false, NULL, NULL, true, NULL),

    ('aaaa1111-1111-1111-1111-111111111111', cat_electronics, 'MacBook Air M3 15"', 'Apple MacBook Air M3 чип менен. 15 дюйм Liquid Retina дисплей.', 114990, 129990, ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'], 'Apple', 15, 420, ARRAY['Space Gray', 'Silver', 'Midnight'], ARRAY['8GB/256GB', '16GB/512GB'], 4.9, 156, 18000, 980, false, NULL, NULL, true, NULL),

    ('aaaa1111-1111-1111-1111-111111111111', cat_electronics, 'Apple Watch Ultra 2', 'Apple Watch Ultra 2 - экстремалдык спорт үчүн. GPS, 100м сууга чөмүлүү.', 64990, 69990, ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500'], 'Apple', 20, 340, ARRAY['Orange', 'Blue', 'Black'], NULL, 4.8, 123, 15000, 890, true, 59990, 2, true, NULL);

  -- Clothing
  INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, colors, sizes, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship) VALUES
    ('aaaa2222-2222-2222-2222-222222222222', cat_clothing, 'Кышкы куртка - Premium Down Jacket', 'Жылуу кышкы куртка. -30 градуска чейин жылуулук сактайт.', 4990, 7990, ARRAY['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'], 'WinterPro', 200, 5600, ARRAY['Кара', 'Көк', 'Кызыл', 'Жашыл'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], 4.7, 1230, 42000, 3200, true, 3990, 5, true),

    ('aaaa2222-2222-2222-2222-222222222222', cat_clothing, 'Спорттук костюм - Nike Dri-FIT', 'Nike оригинал спорттук костюм. Дем алуучу материал.', 5490, 6990, ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'], 'Nike', 150, 2800, ARRAY['Кара', 'Боз', 'Көк'], ARRAY['S', 'M', 'L', 'XL'], 4.8, 567, 25000, 1800, false, NULL, NULL, false),

    ('aaaa2222-2222-2222-2222-222222222222', cat_clothing, 'Жумшак свитер - Кашемир', '100% кашемир свитер. Жумшак жана жылуу.', 3990, 5990, ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'], NULL, 80, 1200, ARRAY['Кремовый', 'Боз', 'Кара', 'Кызгылт'], ARRAY['S', 'M', 'L'], 4.6, 234, 15000, 890, false, NULL, NULL, false),

    ('aaaa2222-2222-2222-2222-222222222222', cat_clothing, 'Джинсы - Levis 501', 'Оригинал Levis 501 джинсы. Classic fit.', 4590, 5990, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], 'Levis', 120, 1800, ARRAY['Көк', 'Кара'], ARRAY['28', '30', '32', '34', '36'], 4.7, 456, 22000, 1200, false, NULL, NULL, false);

  -- Home
  INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, colors, rating, review_count, views, likes, is_group_buy, group_buy_price, group_buy_min_people, has_freeship) VALUES
    ('aaaa3333-3333-3333-3333-333333333333', cat_home, 'Робот чаң соргуч - Xiaomi Mi Robot', 'Акылдуу робот чаң соргуч. LiDAR навигация, App башкаруу.', 19990, 24990, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], 'Xiaomi', 50, 890, ARRAY['Ак', 'Кара'], 4.7, 345, 22000, 1100, true, 17990, 3, true),

    ('aaaa3333-3333-3333-3333-333333333333', cat_home, 'LED лампа - Philips Hue', 'Акылдуу LED лампа. 16 миллион түс, WiFi башкаруу.', 2490, 2990, ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'], 'Philips', 300, 4500, NULL, 4.8, 890, 35000, 2300, false, NULL, NULL, false),

    ('aaaa3333-3333-3333-3333-333333333333', cat_home, 'Кофе машина - DeLonghi', 'Автоматтык кофе машина. Капучино, латте, эспрессо.', 34990, 44990, ARRAY['https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=500'], 'DeLonghi', 25, 230, ARRAY['Silver', 'Black'], 4.9, 89, 12000, 670, true, 31990, 2, true);

  -- Beauty
  INSERT INTO products (shop_id, category_id, title, description, price, original_price, images, brand, stock, sold_count, sizes, rating, review_count, views, likes, is_flash_sale, flash_sale_price, flash_sale_ends_at, has_freeship) VALUES
    ('aaaa4444-4444-4444-4444-444444444444', cat_beauty, 'Парфюм - Chanel No.5', 'Chanel No.5 Eau de Parfum 100ml. Оригинал.', 12990, 15990, ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'], 'Chanel', 30, 560, ARRAY['50ml', '100ml'], 4.9, 234, 18000, 1500, true, 10990, NOW() + INTERVAL '6 hours', true),

    ('aaaa4444-4444-4444-4444-444444444444', cat_beauty, 'Бет крем - La Mer Moisturizing', 'La Mer увлажняющий крем. Тери жаңыртуу.', 24990, 29990, ARRAY['https://images.unsplash.com/photo-1570194065650-d99fb4a8ba58?w=500'], 'La Mer', 20, 180, ARRAY['30ml', '60ml'], 4.9, 89, 12000, 670, false, NULL, NULL, true),

    ('aaaa4444-4444-4444-4444-444444444444', cat_beauty, 'Чач кургаткыч - Dyson Supersonic', 'Dyson Supersonic чач кургаткыч. Чачты коргойт.', 34990, 39990, ARRAY['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500'], 'Dyson', 25, 340, NULL, 4.8, 156, 20000, 980, false, NULL, NULL, true);

END $$;

-- =============================================
-- COUPONS
-- =============================================
INSERT INTO coupons (code, type, value, min_purchase, max_discount, usage_limit, expires_at, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 1000, 500, 10000, NOW() + INTERVAL '365 days', true),
  ('NEWYEAR2024', 'fixed', 1000, 5000, NULL, 500, NOW() + INTERVAL '30 days', true),
  ('FREESHIP', 'fixed', 150, 2000, NULL, 1000, NOW() + INTERVAL '60 days', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- GAMES
-- =============================================
INSERT INTO games (name, type, rewards, is_active) VALUES
  ('Бактылуу дөңгөлөк', 'spin_wheel', '[
    {"type": "coins", "value": 10, "probability": 30, "label": "10 монета"},
    {"type": "coins", "value": 50, "probability": 25, "label": "50 монета"},
    {"type": "coins", "value": 100, "probability": 15, "label": "100 монета"},
    {"type": "coins", "value": 500, "probability": 5, "label": "500 монета"},
    {"type": "coupon", "value": 5, "probability": 10, "label": "5% арзандатуу"},
    {"type": "coupon", "value": 10, "probability": 5, "label": "10% арзандатуу"},
    {"type": "nothing", "value": 0, "probability": 10, "label": "Кийинки жолу"}
  ]'::jsonb, true),
  ('Күндөлүк белги', 'daily_checkin', '[
    {"day": 1, "type": "coins", "value": 10},
    {"day": 2, "type": "coins", "value": 20},
    {"day": 3, "type": "coins", "value": 30},
    {"day": 4, "type": "coins", "value": 50},
    {"day": 5, "type": "coins", "value": 80},
    {"day": 6, "type": "coins", "value": 100},
    {"day": 7, "type": "coins", "value": 200}
  ]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- FLASH SALES (for products with flash sale)
-- =============================================
INSERT INTO flash_sales (product_id, sale_price, original_price, stock, sold_count, starts_at, ends_at, is_active)
SELECT
  p.id,
  p.flash_sale_price,
  p.price,
  p.stock,
  FLOOR(p.stock * 0.3)::integer,
  NOW(),
  p.flash_sale_ends_at,
  true
FROM products p
WHERE p.is_flash_sale = true AND p.flash_sale_price IS NOT NULL
ON CONFLICT DO NOTHING;

-- =============================================
-- Done!
-- =============================================
SELECT 'Seed completed!' as message;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as shops_count FROM shops;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as coupons_count FROM coupons;
SELECT COUNT(*) as games_count FROM games;