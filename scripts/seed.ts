import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Insert categories (delete existing first)
  console.log('📁 Inserting categories...');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const categories = [
    { name: 'Электроника', icon: '📱', color: '#3B82F6', sort_order: 1 },
    { name: 'Кийим', icon: '👕', color: '#EC4899', sort_order: 2 },
    { name: 'Үй буюмдары', icon: '🏠', color: '#10B981', sort_order: 3 },
    { name: 'Сулуулук', icon: '💄', color: '#F59E0B', sort_order: 4 },
    { name: 'Спорт', icon: '⚽', color: '#6366F1', sort_order: 5 },
    { name: 'Оюнчуктар', icon: '🧸', color: '#EF4444', sort_order: 6 },
    { name: 'Тамак-аш', icon: '🍎', color: '#22C55E', sort_order: 7 },
    { name: 'Китептер', icon: '📚', color: '#8B5CF6', sort_order: 8 },
    { name: 'Автотовар', icon: '🚗', color: '#64748B', sort_order: 9 },
    { name: 'Башка', icon: '📦', color: '#F97316', sort_order: 10 },
  ];

  const { data: insertedCategories, error: catError } = await supabase
    .from('categories')
    .insert(categories)
    .select();

  if (catError) {
    console.error('Categories error:', catError.message);
  } else {
    console.log(`✅ ${insertedCategories?.length || 0} categories inserted`);
  }

  // Get category IDs
  const { data: allCategories } = await supabase.from('categories').select('id, name');
  const categoryMap = new Map(allCategories?.map(c => [c.name, c.id]) || []);
  console.log('   Categories:', Array.from(categoryMap.keys()).join(', '));

  // 2. Create users directly (skip auth for seeding)
  console.log('\n👤 Creating test users...');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const testUsers = [
    { email: 'techstore@pinduo.kg', full_name: 'TechStore Owner', coins: 1000 },
    { email: 'fashion@pinduo.kg', full_name: 'Fashion Owner', coins: 1000 },
    { email: 'home@pinduo.kg', full_name: 'Home Owner', coins: 1000 },
    { email: 'beauty@pinduo.kg', full_name: 'Beauty Owner', coins: 1000 },
  ];

  const { data: insertedUsers, error: userError } = await supabase
    .from('users')
    .insert(testUsers)
    .select('id, email');

  if (userError) {
    console.error('Users error:', userError.message);
  } else {
    console.log(`✅ ${insertedUsers?.length || 0} users inserted`);
  }

  // Get user IDs
  const { data: allUsers } = await supabase.from('users').select('id, email');
  const userMap = new Map(allUsers?.map(u => [u.email, u.id]) || []);

  if (userMap.size === 0) {
    console.error('❌ No users created. Cannot proceed with shops and products.');
    return;
  }

  // 3. Insert shops
  console.log('\n🏪 Inserting shops...');
  await supabase.from('shops').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const shops = [
    {
      owner_id: userMap.get('techstore@pinduo.kg'),
      name: 'TechStore KG',
      logo: 'https://ui-avatars.com/api/?name=Tech+Store&background=3B82F6&color=fff&size=200',
      rating: 4.8,
      sales_count: 15420,
      followers_count: 8500,
      products_count: 156,
      is_verified: true,
      is_official_store: true,
      response_rate: 98,
      response_time: '< 1 саат',
      location: 'Бишкек',
    },
    {
      owner_id: userMap.get('fashion@pinduo.kg'),
      name: 'Fashion House',
      logo: 'https://ui-avatars.com/api/?name=Fashion+House&background=EC4899&color=fff&size=200',
      rating: 4.6,
      sales_count: 23100,
      followers_count: 12000,
      products_count: 340,
      is_verified: true,
      is_official_store: false,
      response_rate: 95,
      response_time: '< 2 саат',
      location: 'Ош',
    },
    {
      owner_id: userMap.get('home@pinduo.kg'),
      name: 'Home & Living',
      logo: 'https://ui-avatars.com/api/?name=Home+Living&background=10B981&color=fff&size=200',
      rating: 4.7,
      sales_count: 8900,
      followers_count: 4200,
      products_count: 210,
      is_verified: true,
      is_official_store: false,
      response_rate: 92,
      response_time: '< 3 саат',
      location: 'Бишкек',
    },
    {
      owner_id: userMap.get('beauty@pinduo.kg'),
      name: 'Beauty World',
      logo: 'https://ui-avatars.com/api/?name=Beauty+World&background=F59E0B&color=fff&size=200',
      rating: 4.9,
      sales_count: 31000,
      followers_count: 18000,
      products_count: 520,
      is_verified: true,
      is_official_store: true,
      response_rate: 99,
      response_time: '< 30 мин',
      location: 'Бишкек',
    },
  ].filter(s => s.owner_id);

  if (shops.length === 0) {
    console.error('❌ No valid shops to insert (missing owner_ids).');
    return;
  }

  const { data: insertedShops, error: shopError } = await supabase
    .from('shops')
    .insert(shops)
    .select();

  if (shopError) {
    console.error('Shops error:', shopError.message);
    console.log('   Trying without description field...');
  } else {
    console.log(`✅ ${insertedShops?.length || 0} shops inserted`);
  }

  // Get shop IDs
  const { data: allShops } = await supabase.from('shops').select('id, name');
  const shopMap = new Map(allShops?.map(s => [s.name, s.id]) || []);
  console.log('   Shops:', Array.from(shopMap.keys()).join(', '));

  if (shopMap.size === 0) {
    console.error('❌ No shops created. Cannot proceed with products.');
    return;
  }

  // 4. Insert products
  console.log('\n📦 Inserting products...');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const products = [
    // Electronics - TechStore KG
    {
      shop_id: shopMap.get('TechStore KG'),
      category_id: categoryMap.get('Электроника'),
      title: 'iPhone 15 Pro Max 256GB - Titanium Blue',
      description: 'Apple iPhone 15 Pro Max - эң акыркы модель. A17 Pro чип, 48MP камера, титан корпус.',
      price: 89990,
      original_price: 99990,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop'
      ],
      brand: 'Apple',
      stock: 25,
      sold_count: 1250,
      rating: 4.9,
      review_count: 342,
      views: 45000,
      likes: 2100,
      is_group_buy: true,
      group_buy_price: 84990,
      group_buy_min_people: 3,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('TechStore KG'),
      category_id: categoryMap.get('Электроника'),
      title: 'Samsung Galaxy S24 Ultra 512GB',
      description: 'Samsung Galaxy S24 Ultra - AI функциялары менен. S Pen кирет.',
      price: 74990,
      original_price: 84990,
      images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop'],
      brand: 'Samsung',
      stock: 40,
      sold_count: 890,
      rating: 4.8,
      review_count: 256,
      views: 32000,
      likes: 1500,
      is_group_buy: true,
      group_buy_price: 69990,
      group_buy_min_people: 2,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('TechStore KG'),
      category_id: categoryMap.get('Электроника'),
      title: 'AirPods Pro 2 - USB-C',
      description: 'Apple AirPods Pro 2-чи муун. Активдүү шыбыш басуу, USB-C кубаттоо.',
      price: 18990,
      original_price: 22990,
      images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&h=500&fit=crop'],
      brand: 'Apple',
      stock: 100,
      sold_count: 3200,
      rating: 4.9,
      review_count: 890,
      views: 28000,
      likes: 4200,
      is_flash_sale: true,
      flash_sale_price: 16990,
      flash_sale_ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('TechStore KG'),
      category_id: categoryMap.get('Электроника'),
      title: 'MacBook Air M3 15"',
      description: 'Apple MacBook Air M3 чип менен. 15 дюйм Liquid Retina дисплей.',
      price: 114990,
      original_price: 129990,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop'],
      brand: 'Apple',
      stock: 15,
      sold_count: 420,
      rating: 4.9,
      review_count: 156,
      views: 18000,
      likes: 980,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('TechStore KG'),
      category_id: categoryMap.get('Электроника'),
      title: 'Sony PlayStation 5',
      description: 'Sony PS5 оюн консолу. 825GB SSD, DualSense контроллер.',
      price: 42990,
      original_price: 49990,
      images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop'],
      brand: 'Sony',
      stock: 20,
      sold_count: 650,
      rating: 4.9,
      review_count: 180,
      views: 35000,
      likes: 2500,
      is_group_buy: true,
      group_buy_price: 39990,
      group_buy_min_people: 2,
      has_freeship: true,
    },
    // Fashion House
    {
      shop_id: shopMap.get('Fashion House'),
      category_id: categoryMap.get('Кийим'),
      title: 'Кышкы куртка - Premium Down Jacket',
      description: 'Жылуу кышкы куртка. -30 градуска чейин жылуулук сактайт.',
      price: 4990,
      original_price: 7990,
      images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=500&fit=crop'],
      brand: 'WinterPro',
      stock: 200,
      sold_count: 5600,
      rating: 4.7,
      review_count: 1230,
      views: 42000,
      likes: 3200,
      is_group_buy: true,
      group_buy_price: 3990,
      group_buy_min_people: 5,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Fashion House'),
      category_id: categoryMap.get('Кийим'),
      title: 'Спорттук костюм - Nike Dri-FIT',
      description: 'Nike оригинал спорттук костюм. Дем алуучу материал.',
      price: 5490,
      original_price: 6990,
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop'],
      brand: 'Nike',
      stock: 150,
      sold_count: 2800,
      rating: 4.8,
      review_count: 567,
      views: 25000,
      likes: 1800,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Fashion House'),
      category_id: categoryMap.get('Кийим'),
      title: 'Adidas Ultraboost кроссовка',
      description: 'Adidas Ultraboost 22. Эң жеңил жана ыңгайлуу бут кийим.',
      price: 9990,
      original_price: 12990,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'],
      brand: 'Adidas',
      stock: 80,
      sold_count: 1200,
      rating: 4.8,
      review_count: 340,
      views: 22000,
      likes: 1400,
      is_flash_sale: true,
      flash_sale_price: 7990,
      flash_sale_ends_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      has_freeship: true,
    },
    // Home & Living
    {
      shop_id: shopMap.get('Home & Living'),
      category_id: categoryMap.get('Үй буюмдары'),
      title: 'Робот чаң соргуч - Xiaomi Mi Robot',
      description: 'Акылдуу робот чаң соргуч. LiDAR навигация, App башкаруу.',
      price: 19990,
      original_price: 24990,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop'],
      brand: 'Xiaomi',
      stock: 50,
      sold_count: 890,
      rating: 4.7,
      review_count: 345,
      views: 22000,
      likes: 1100,
      is_group_buy: true,
      group_buy_price: 17990,
      group_buy_min_people: 3,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Home & Living'),
      category_id: categoryMap.get('Үй буюмдары'),
      title: 'LED лампа - Philips Hue Starter Kit',
      description: 'Акылдуу LED лампа. 16 миллион түс, WiFi башкаруу.',
      price: 4990,
      original_price: 5990,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop'],
      brand: 'Philips',
      stock: 300,
      sold_count: 4500,
      rating: 4.8,
      review_count: 890,
      views: 35000,
      likes: 2300,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Home & Living'),
      category_id: categoryMap.get('Үй буюмдары'),
      title: 'Кофе машина - DeLonghi Magnifica',
      description: 'Автоматтык эспрессо машина. Кремдүү капучино.',
      price: 32990,
      original_price: 39990,
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop'],
      brand: 'DeLonghi',
      stock: 25,
      sold_count: 180,
      rating: 4.9,
      review_count: 89,
      views: 12000,
      likes: 650,
      is_group_buy: true,
      group_buy_price: 29990,
      group_buy_min_people: 2,
      has_freeship: true,
    },
    // Beauty World
    {
      shop_id: shopMap.get('Beauty World'),
      category_id: categoryMap.get('Сулуулук'),
      title: 'Парфюм - Chanel No.5',
      description: 'Chanel No.5 Eau de Parfum 100ml. Оригинал.',
      price: 12990,
      original_price: 15990,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop'],
      brand: 'Chanel',
      stock: 30,
      sold_count: 560,
      rating: 4.9,
      review_count: 234,
      views: 18000,
      likes: 1500,
      is_flash_sale: true,
      flash_sale_price: 10990,
      flash_sale_ends_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Beauty World'),
      category_id: categoryMap.get('Сулуулук'),
      title: 'Чач кургаткыч - Dyson Supersonic',
      description: 'Dyson Supersonic чач кургаткыч. Чачты коргойт.',
      price: 34990,
      original_price: 39990,
      images: ['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500&h=500&fit=crop'],
      brand: 'Dyson',
      stock: 25,
      sold_count: 340,
      rating: 4.8,
      review_count: 156,
      views: 20000,
      likes: 980,
      is_group_buy: true,
      group_buy_price: 31990,
      group_buy_min_people: 2,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Beauty World'),
      category_id: categoryMap.get('Сулуулук'),
      title: 'Крем - La Mer Moisturizing',
      description: 'La Mer Creme de la Mer 60ml. Люкс класс крем.',
      price: 24990,
      original_price: 29990,
      images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=500&fit=crop'],
      brand: 'La Mer',
      stock: 15,
      sold_count: 120,
      rating: 4.9,
      review_count: 67,
      views: 9000,
      likes: 450,
      has_freeship: true,
    },
    // More products for variety
    {
      shop_id: shopMap.get('TechStore KG'),
      category_id: categoryMap.get('Электроника'),
      title: 'Apple Watch Ultra 2',
      description: 'Apple Watch Ultra 2. Титан корпус, GPS + Cellular.',
      price: 59990,
      original_price: 69990,
      images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=500&fit=crop'],
      brand: 'Apple',
      stock: 30,
      sold_count: 280,
      rating: 4.9,
      review_count: 98,
      views: 15000,
      likes: 820,
      is_group_buy: true,
      group_buy_price: 54990,
      group_buy_min_people: 2,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('TechStore KG'),
      category_id: categoryMap.get('Электроника'),
      title: 'DJI Mini 4 Pro Drone',
      description: 'DJI Mini 4 Pro дрон. 4K камера, 34 мин учуу.',
      price: 64990,
      original_price: 74990,
      images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop'],
      brand: 'DJI',
      stock: 15,
      sold_count: 120,
      rating: 4.8,
      review_count: 56,
      views: 12000,
      likes: 680,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Fashion House'),
      category_id: categoryMap.get('Кийим'),
      title: 'Джинсы Levis 501 Original',
      description: 'Levis 501 классикалык джинсы. Оригинал.',
      price: 3990,
      original_price: 4990,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop'],
      brand: 'Levis',
      stock: 100,
      sold_count: 3400,
      rating: 4.7,
      review_count: 890,
      views: 28000,
      likes: 1900,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Home & Living'),
      category_id: categoryMap.get('Үй буюмдары'),
      title: 'Блендер - Vitamix E310',
      description: 'Vitamix профессионал блендер. 10 жылдык гарантия.',
      price: 29990,
      original_price: 34990,
      images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=500&fit=crop'],
      brand: 'Vitamix',
      stock: 20,
      sold_count: 150,
      rating: 4.9,
      review_count: 78,
      views: 8000,
      likes: 420,
      is_group_buy: true,
      group_buy_price: 26990,
      group_buy_min_people: 3,
      has_freeship: true,
    },
    {
      shop_id: shopMap.get('Beauty World'),
      category_id: categoryMap.get('Сулуулук'),
      title: 'Makeup Set - MAC Professional',
      description: 'MAC Professional макияж комплект. 24 түстүү палитра.',
      price: 8990,
      original_price: 11990,
      images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop'],
      brand: 'MAC',
      stock: 50,
      sold_count: 890,
      rating: 4.8,
      review_count: 234,
      views: 16000,
      likes: 1100,
      is_flash_sale: true,
      flash_sale_price: 6990,
      flash_sale_ends_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      has_freeship: true,
    },
  ].filter(p => p.shop_id && p.category_id);

  console.log(`   Preparing ${products.length} products...`);

  const { data: insertedProducts, error: prodError } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (prodError) {
    console.error('Products error:', prodError.message);
  } else {
    console.log(`✅ ${insertedProducts?.length || 0} products inserted`);
  }

  // 5. Insert coupons
  console.log('\n🎟️ Inserting coupons...');
  await supabase.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const coupons = [
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      min_purchase: 1000,
      max_discount: 500,
      usage_limit: 10000,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      code: 'NEWYEAR2025',
      type: 'fixed',
      value: 1000,
      min_purchase: 5000,
      usage_limit: 500,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      code: 'FREESHIP',
      type: 'fixed',
      value: 150,
      min_purchase: 2000,
      usage_limit: 1000,
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      code: 'VIP20',
      type: 'percentage',
      value: 20,
      min_purchase: 10000,
      max_discount: 2000,
      usage_limit: 100,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
  ];

  const { error: couponError } = await supabase
    .from('coupons')
    .insert(coupons);

  if (couponError) {
    console.error('Coupons error:', couponError.message);
  } else {
    console.log(`✅ ${coupons.length} coupons inserted`);
  }

  // 6. Insert games
  console.log('\n🎮 Inserting games...');
  await supabase.from('games').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const games = [
    {
      name: 'Бактылуу дөңгөлөк',
      type: 'spin_wheel',
      rewards: [
        { type: 'coins', value: 10, probability: 30, label: '10 монета' },
        { type: 'coins', value: 50, probability: 25, label: '50 монета' },
        { type: 'coins', value: 100, probability: 15, label: '100 монета' },
        { type: 'coins', value: 500, probability: 5, label: '500 монета' },
        { type: 'coupon', value: 5, probability: 10, label: '5% арзандатуу' },
        { type: 'nothing', value: 0, probability: 15, label: 'Кийинки жолу' },
      ],
      is_active: true,
    },
    {
      name: 'Күндөлүк белги',
      type: 'daily_checkin',
      rewards: [
        { day: 1, type: 'coins', value: 10 },
        { day: 2, type: 'coins', value: 20 },
        { day: 3, type: 'coins', value: 30 },
        { day: 4, type: 'coins', value: 50 },
        { day: 5, type: 'coins', value: 80 },
        { day: 6, type: 'coins', value: 100 },
        { day: 7, type: 'coins', value: 200 },
      ],
      is_active: true,
    },
  ];

  const { error: gameError } = await supabase
    .from('games')
    .insert(games);

  if (gameError) {
    console.error('Games error:', gameError.message);
  } else {
    console.log(`✅ ${games.length} games inserted`);
  }

  // Summary
  console.log('\n✨ Seeding completed!\n');

  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: shopCount } = await supabase.from('shops').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: couponCount } = await supabase.from('coupons').select('*', { count: 'exact', head: true });
  const { count: gameCount } = await supabase.from('games').select('*', { count: 'exact', head: true });

  console.log('📊 Database summary:');
  console.log(`   - ${catCount || 0} categories`);
  console.log(`   - ${shopCount || 0} shops`);
  console.log(`   - ${prodCount || 0} products`);
  console.log(`   - ${couponCount || 0} coupons`);
  console.log(`   - ${gameCount || 0} games`);
}

seed().catch(console.error);