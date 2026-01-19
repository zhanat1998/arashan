import { Product, Category, Video, Shop, Badge } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Баары', icon: '🏠', color: '#e4393c', count: 1200 },
  { id: '2', name: 'Электроника', icon: '📱', color: '#3b82f6', count: 280 },
  { id: '3', name: 'Кийим', icon: '👗', color: '#ec4899', count: 350 },
  { id: '4', name: 'Бут кийим', icon: '👟', color: '#8b5cf6', count: 180 },
  { id: '5', name: 'Үй буюмдары', icon: '🏡', color: '#22c55e', count: 220 },
  { id: '6', name: 'Косметика', icon: '💄', color: '#f43f5e', count: 150 },
  { id: '7', name: 'Спорт', icon: '⚽', color: '#f59e0b', count: 120 },
  { id: '8', name: 'Балдар', icon: '🧸', color: '#06b6d4', count: 160 },
  { id: '9', name: 'Азык-түлүк', icon: '🍎', color: '#84cc16', count: 130 },
  { id: '10', name: 'Авто', icon: '🚗', color: '#6366f1', count: 90 },
];

// Sample shops
const shops: Shop[] = [
  { id: 'shop1', name: 'TechWorld KG', logo: 'https://i.pravatar.cc/150?img=1', rating: 4.9, salesCount: 15600, followersCount: 8900, productsCount: 450, isVerified: true, isOfficialStore: true, responseRate: 98, responseTime: '< 1 саат', location: 'Бишкек', createdAt: '2020' },
  { id: 'shop2', name: 'Fashion House', logo: 'https://i.pravatar.cc/150?img=2', rating: 4.8, salesCount: 12300, followersCount: 6500, productsCount: 890, isVerified: true, isOfficialStore: false, responseRate: 95, responseTime: '< 2 саат', location: 'Бишкек', createdAt: '2021' },
  { id: 'shop3', name: 'HomeStyle', logo: 'https://i.pravatar.cc/150?img=3', rating: 4.7, salesCount: 8900, followersCount: 4200, productsCount: 320, isVerified: true, isOfficialStore: false, responseRate: 92, responseTime: '< 3 саат', location: 'Ош', createdAt: '2021' },
  { id: 'shop4', name: 'Beauty Lab', logo: 'https://i.pravatar.cc/150?img=4', rating: 4.9, salesCount: 23000, followersCount: 12000, productsCount: 560, isVerified: true, isOfficialStore: true, responseRate: 99, responseTime: '< 30 мин', location: 'Бишкек', createdAt: '2019' },
  { id: 'shop5', name: 'Sport Master', logo: 'https://i.pravatar.cc/150?img=5', rating: 4.6, salesCount: 6700, followersCount: 3100, productsCount: 280, isVerified: true, isOfficialStore: false, responseRate: 88, responseTime: '< 4 саат', location: 'Чүй', createdAt: '2022' },
  { id: 'shop6', name: 'Kids World', logo: 'https://i.pravatar.cc/150?img=6', rating: 4.8, salesCount: 9800, followersCount: 5600, productsCount: 420, isVerified: true, isOfficialStore: false, responseRate: 94, responseTime: '< 2 саат', location: 'Бишкек', createdAt: '2020' },
  { id: 'shop7', name: 'FoodMarket', logo: 'https://i.pravatar.cc/150?img=7', rating: 4.5, salesCount: 18500, followersCount: 9200, productsCount: 650, isVerified: true, isOfficialStore: false, responseRate: 90, responseTime: '< 1 саат', location: 'Бишкек', createdAt: '2021' },
  { id: 'shop8', name: 'AutoParts KG', logo: 'https://i.pravatar.cc/150?img=8', rating: 4.7, salesCount: 5400, followersCount: 2800, productsCount: 380, isVerified: true, isOfficialStore: false, responseRate: 91, responseTime: '< 3 саат', location: 'Токмок', createdAt: '2022' },
  { id: 'shop9', name: 'Gadget Store', logo: 'https://i.pravatar.cc/150?img=9', rating: 4.8, salesCount: 11200, followersCount: 7100, productsCount: 290, isVerified: true, isOfficialStore: true, responseRate: 97, responseTime: '< 1 саат', location: 'Бишкек', createdAt: '2020' },
  { id: 'shop10', name: 'Shoe Palace', logo: 'https://i.pravatar.cc/150?img=10', rating: 4.6, salesCount: 7800, followersCount: 4500, productsCount: 340, isVerified: true, isOfficialStore: false, responseRate: 89, responseTime: '< 2 саат', location: 'Ош', createdAt: '2021' },
];

// Product templates by category
const productTemplates = {
  electronics: [
    { brand: 'Apple', titles: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14'], priceRange: [45000, 120000] },
    { brand: 'Samsung', titles: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy A54', 'Galaxy Tab S9'], priceRange: [25000, 95000] },
    { brand: 'Xiaomi', titles: ['Redmi Note 13 Pro', 'Xiaomi 14', 'POCO X6 Pro', 'Mi Pad 6'], priceRange: [12000, 55000] },
    { brand: 'Apple', titles: ['AirPods Pro 2', 'AirPods 3', 'Apple Watch 9', 'MacBook Air M3'], priceRange: [15000, 150000] },
    { brand: 'JBL', titles: ['JBL Flip 6', 'JBL Charge 5', 'JBL Tune 770NC', 'JBL Bar 5.1'], priceRange: [5000, 35000] },
    { brand: 'Sony', titles: ['PlayStation 5', 'DualSense Controller', 'Sony WH-1000XM5', 'Sony TV 55"'], priceRange: [8000, 85000] },
  ],
  fashion: [
    { brand: 'Nike', titles: ['Nike Худи', 'Nike Футболка', 'Nike Спорт костюм', 'Nike Шорты'], priceRange: [2500, 12000] },
    { brand: 'Adidas', titles: ['Adidas Куртка', 'Adidas Футболка', 'Adidas Треники', 'Adidas Ветровка'], priceRange: [2000, 15000] },
    { brand: 'Zara', titles: ['Zara Платье', 'Zara Джинсы', 'Zara Рубашка', 'Zara Пальто'], priceRange: [3000, 18000] },
    { brand: 'H&M', titles: ['H&M Свитер', 'H&M Юбка', 'H&M Блузка', 'H&M Жилет'], priceRange: [1500, 8000] },
    { brand: 'Uniqlo', titles: ['Uniqlo Куртка', 'Uniqlo Джинсы', 'Uniqlo Рубашка', 'Uniqlo Футболка'], priceRange: [2000, 10000] },
    { brand: 'Levis', titles: ['Levis 501 Джинсы', 'Levis Куртка', 'Levis Шорты', 'Levis Рубашка'], priceRange: [4000, 15000] },
  ],
  shoes: [
    { brand: 'Nike', titles: ['Nike Air Max', 'Nike Air Force 1', 'Nike Dunk Low', 'Nike Jordan 1'], priceRange: [8000, 25000] },
    { brand: 'Adidas', titles: ['Adidas Superstar', 'Adidas Stan Smith', 'Adidas Yeezy', 'Adidas Ultra Boost'], priceRange: [6000, 35000] },
    { brand: 'New Balance', titles: ['New Balance 574', 'New Balance 550', 'New Balance 990', 'New Balance 327'], priceRange: [7000, 20000] },
    { brand: 'Converse', titles: ['Converse Chuck 70', 'Converse All Star', 'Converse Run Star', 'Converse Jack Purcell'], priceRange: [4000, 12000] },
    { brand: 'Puma', titles: ['Puma Suede', 'Puma RS-X', 'Puma Cali', 'Puma Future Rider'], priceRange: [5000, 15000] },
  ],
  home: [
    { brand: 'IKEA', titles: ['IKEA Кресло', 'IKEA Лампа', 'IKEA Шкаф', 'IKEA Стол'], priceRange: [3000, 45000] },
    { brand: 'Xiaomi', titles: ['Xiaomi Robot Vacuum', 'Xiaomi Air Purifier', 'Xiaomi Kettle', 'Xiaomi Humidifier'], priceRange: [5000, 35000] },
    { brand: 'Philips', titles: ['Philips Блендер', 'Philips Утюг', 'Philips Фен', 'Philips Кофемашина'], priceRange: [4000, 25000] },
    { brand: 'Samsung', titles: ['Samsung Холодильник', 'Samsung Кир жуугуч', 'Samsung Микроволновка', 'Samsung Пылесос'], priceRange: [15000, 85000] },
    { brand: 'Tefal', titles: ['Tefal Сковорода', 'Tefal Кастрюля', 'Tefal Мультиварка', 'Tefal Тостер'], priceRange: [2000, 18000] },
  ],
  beauty: [
    { brand: 'Dyson', titles: ['Dyson Airwrap', 'Dyson Supersonic', 'Dyson Corrale', 'Dyson Airstrait'], priceRange: [25000, 55000] },
    { brand: 'Loreal', titles: ['Loreal Шампунь', 'Loreal Крем', 'Loreal Помада', 'Loreal Тушь'], priceRange: [800, 5000] },
    { brand: 'MAC', titles: ['MAC Помада', 'MAC Тени', 'MAC Хайлайтер', 'MAC Румяна'], priceRange: [2000, 8000] },
    { brand: 'The Ordinary', titles: ['The Ordinary Niacinamide', 'The Ordinary Retinol', 'The Ordinary AHA', 'The Ordinary Squalane'], priceRange: [1000, 3500] },
    { brand: 'Maybelline', titles: ['Maybelline Тушь', 'Maybelline Помада', 'Maybelline Консилер', 'Maybelline Тоналка'], priceRange: [600, 3000] },
  ],
  sports: [
    { brand: 'Nike', titles: ['Nike Гантели', 'Nike Йога мат', 'Nike Фитнес резинка', 'Nike Спорт сумка'], priceRange: [1500, 8000] },
    { brand: 'Adidas', titles: ['Adidas Футбол топ', 'Adidas Боксерские перчатки', 'Adidas Гантели', 'Adidas Велосипед шлем'], priceRange: [2000, 12000] },
    { brand: 'Decathlon', titles: ['Велосипед MTB', 'Теннис ракетка', 'Баскетбол топ', 'Бассейн очки'], priceRange: [1000, 45000] },
    { brand: 'Reebok', titles: ['Reebok Беговая дорожка', 'Reebok Степпер', 'Reebok Гиря', 'Reebok Турник'], priceRange: [3000, 65000] },
  ],
  kids: [
    { brand: 'LEGO', titles: ['LEGO City', 'LEGO Technic', 'LEGO Star Wars', 'LEGO Friends'], priceRange: [2000, 25000] },
    { brand: 'Hasbro', titles: ['Трансформер', 'Монополия', 'Ненуко кукла', 'Hasbro фигурка'], priceRange: [1500, 12000] },
    { brand: 'Fisher-Price', titles: ['Балдар коляскасы', 'Ойноок', 'Балдар кроватка', 'Музыка ойноок'], priceRange: [3000, 35000] },
    { brand: 'Pampers', titles: ['Pampers подгузник', 'Балдар кийими', 'Балдар бут кийим', 'Балдар тойчок'], priceRange: [500, 8000] },
  ],
  food: [
    { brand: 'Nestle', titles: ['Nescafe кофе', 'KitKat шоколад', 'Nestle каша', 'Nestle сүт'], priceRange: [200, 2500] },
    { brand: 'Coca-Cola', titles: ['Coca-Cola 2л', 'Fanta', 'Sprite', 'Coca-Cola Zero'], priceRange: [100, 800] },
    { brand: 'Lay\'s', titles: ['Lay\'s чипсы', 'Doritos', 'Cheetos', 'Lay\'s Stax'], priceRange: [150, 600] },
    { brand: 'Ferrero', titles: ['Nutella', 'Ferrero Rocher', 'Kinder Surprise', 'Raffaello'], priceRange: [300, 3500] },
  ],
  auto: [
    { brand: 'Bosch', titles: ['Bosch аккумулятор', 'Bosch щетки', 'Bosch тормоз', 'Bosch свечи'], priceRange: [500, 15000] },
    { brand: 'Michelin', titles: ['Michelin шины R16', 'Michelin шины R17', 'Michelin шины R18', 'Michelin шины R15'], priceRange: [8000, 25000] },
    { brand: 'Shell', titles: ['Shell масло 5W-30', 'Shell масло 5W-40', 'Shell антифриз', 'Shell тормоз суюктук'], priceRange: [800, 8000] },
    { brand: 'Xiaomi', titles: ['Xiaomi видеорегистратор', 'Xiaomi компрессор', 'Xiaomi зарядка', 'Xiaomi держатель'], priceRange: [1500, 12000] },
  ],
};

const badgeTypes: Badge[] = [
  { text: 'ХИТ', type: 'hot' },
  { text: 'ЖАНЫ', type: 'new' },
  { text: 'АРЗАНДАТУУ', type: 'sale' },
  { text: 'ТОП', type: 'top' },
  { text: 'БИРГЕ АЛУУ', type: 'groupbuy' },
  { text: 'АКЫСЫЗ ЖТК', type: 'freeship' },
  { text: 'FLASH', type: 'flash' },
];

const colors = ['Кара', 'Ак', 'Көк', 'Кызыл', 'Жашыл', 'Сары', 'Күмүш', 'Алтын', 'Көк-Жашыл', 'Кызгылт'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

// Helper functions
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPrice = (min: number, max: number): number => Math.round(randomInt(min, max) / 100) * 100;

// Generate products
function generateProducts(): Product[] {
  const items: Product[] = [];
  let id = 1;

  const categoryMapping = [
    { categoryId: '2', templates: productTemplates.electronics, count: 280 },
    { categoryId: '3', templates: productTemplates.fashion, count: 350 },
    { categoryId: '4', templates: productTemplates.shoes, count: 180 },
    { categoryId: '5', templates: productTemplates.home, count: 220 },
    { categoryId: '6', templates: productTemplates.beauty, count: 150 },
    { categoryId: '7', templates: productTemplates.sports, count: 120 },
    { categoryId: '8', templates: productTemplates.kids, count: 160 },
    { categoryId: '9', templates: productTemplates.food, count: 130 },
    { categoryId: '10', templates: productTemplates.auto, count: 90 },
  ];

  for (const category of categoryMapping) {
    for (let i = 0; i < category.count; i++) {
      const template = randomItem(category.templates);
      const title = randomItem(template.titles);
      const basePrice = randomPrice(template.priceRange[0], template.priceRange[1]);

      // 45% discount
      const hasDiscount = Math.random() > 0.55;
      const discountPercent = hasDiscount ? randomInt(10, 50) : 0;
      const originalPrice = hasDiscount ? Math.round(basePrice / (1 - discountPercent / 100)) : undefined;

      const shop = randomItem(shops);
      const hasVideo = Math.random() > 0.6;
      const isGroupBuy = Math.random() > 0.75;
      const isFlashSale = !isGroupBuy && Math.random() > 0.85;
      const hasFreeship = Math.random() > 0.4;

      // Determine if product has sizes/colors
      const needsSizes = ['3', '4'].includes(category.categoryId); // Fashion & Shoes
      const needsColors = ['2', '3', '4', '5'].includes(category.categoryId);

      const badges: Badge[] = [];
      if (hasDiscount && discountPercent > 30) badges.push({ text: 'АРЗАНДАТУУ', type: 'sale' });
      if (isGroupBuy) badges.push({ text: 'БИРГЕ АЛУУ', type: 'groupbuy' });
      if (isFlashSale) badges.push({ text: 'FLASH', type: 'flash' });
      if (hasFreeship) badges.push({ text: 'АКЫСЫЗ ЖТК', type: 'freeship' });
      if (Math.random() > 0.8) badges.push(randomItem(badgeTypes.filter(b => !badges.find(x => x.type === b.type))));

      const item: Product = {
        id: String(id++),
        title: `${template.brand} ${title}`,
        price: basePrice,
        originalPrice,
        images: [
          `https://picsum.photos/seed/product${id}/800/800`,
          `https://picsum.photos/seed/product${id}b/800/800`,
          `https://picsum.photos/seed/product${id}c/800/800`,
        ],
        videoUrl: hasVideo ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : undefined,
        brand: template.brand,
        sku: `SKU-${id.toString().padStart(6, '0')}`,
        stock: randomInt(10, 500),
        soldCount: randomInt(100, 50000),
        colors: needsColors ? colors.slice(0, randomInt(3, 6)) : undefined,
        sizes: needsSizes ? (category.categoryId === '4' ? sizes.slice(6) : sizes.slice(0, 6)) : undefined,
        shop,
        views: randomInt(500, 100000),
        likes: randomInt(50, 5000),
        rating: Number((4 + Math.random()).toFixed(1)),
        reviewCount: randomInt(10, 2000),
        badges: badges.slice(0, 3),
        isGroupBuy,
        groupBuyPrice: isGroupBuy ? Math.round(basePrice * 0.7) : undefined,
        groupBuyMinPeople: isGroupBuy ? randomInt(2, 5) : undefined,
        hasFreeship,
        isFlashSale,
        flashSaleEndsAt: isFlashSale ? new Date(Date.now() + randomInt(1, 24) * 60 * 60 * 1000).toISOString() : undefined,
        categoryId: category.categoryId,
        description: `${template.brand} ${title} - сапаттуу товар. ${hasFreeship ? 'Акысыз жеткирүү!' : ''} ${isGroupBuy ? 'Бирге алып арзандатууга ээ болуңуз!' : ''}`,
        specifications: [
          { key: 'Бренд', value: template.brand },
          { key: 'Модель', value: title },
          { key: 'Гарантия', value: randomItem(['6 ай', '1 жыл', '2 жыл', '3 жыл']) },
          { key: 'Өлкө', value: randomItem(['Кытай', 'Корея', 'Вьетнам', 'Түркия', 'Германия']) },
        ],
        features: [
          'Сапаттуу материал',
          hasFreeship ? 'Акысыз жеткирүү' : '',
          'Кайтаруу 14 күн',
          shop.isOfficialStore ? 'Официалдуу дүкөн' : '',
        ].filter(Boolean),
        createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      items.push(item);
    }
  }

  return items.sort(() => Math.random() - 0.5);
}

export const products: Product[] = generateProducts();

// Legacy export
export const livestock = products;

// Video URLs
const sampleVideoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
];

// Generate videos
export const videos: Video[] = Array.from({ length: 100 }, (_, index) => {
  const product = products[index % products.length];
  const videoUrl = sampleVideoUrls[index % sampleVideoUrls.length];

  return {
    id: `video-${index + 1}`,
    videoUrl,
    thumbnailUrl: `https://picsum.photos/seed/video${index}/800/800`,
    productId: product.id,
    product,
    likes: randomInt(500, 100000),
    comments: randomInt(50, 10000),
    shares: randomInt(20, 5000),
    duration: randomInt(10, 90),
    isLive: index < 3,
  };
});