import { Livestock, Category, Video, Seller } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Баары', icon: '🏠', color: '#e4393c', count: 1200 },
  { id: '2', name: 'Кой-эчки', icon: '🐑', color: '#22c55e', count: 320 },
  { id: '3', name: 'Жылкы', icon: '🐴', color: '#8b5cf6', count: 180 },
  { id: '4', name: 'Уй-музоо', icon: '🐄', color: '#f59e0b', count: 220 },
  { id: '5', name: 'Төө', icon: '🐪', color: '#ef4444', count: 45 },
  { id: '6', name: 'Эшек', icon: '🫏', color: '#6366f1', count: 55 },
  { id: '7', name: 'Ит-мышык', icon: '🐕', color: '#ec4899', count: 120 },
  { id: '8', name: 'Канаттуу', icon: '🐔', color: '#14b8a6', count: 60 },
  { id: '9', name: 'Жем-чөп', icon: '🌾', color: '#84cc16', count: 85 },
  { id: '10', name: 'Тоют', icon: '🥬', color: '#06b6d4', count: 65 },
  { id: '11', name: 'Витамин', icon: '💊', color: '#f43f5e', count: 50 },
];

// Sample sellers - more variety
const sellers: Seller[] = [
  { id: 's1', name: 'Асан Малчы', avatar: 'https://i.pravatar.cc/150?img=1', phone: '+996 555 123 456', rating: 4.9, salesCount: 156, isVerified: true, location: 'Нарын', memberSince: '2020' },
  { id: 's2', name: 'Бекболот Фермер', avatar: 'https://i.pravatar.cc/150?img=2', phone: '+996 700 789 012', rating: 4.8, salesCount: 89, isVerified: true, location: 'Ош', memberSince: '2021' },
  { id: 's3', name: 'Эркин Жылкычы', avatar: 'https://i.pravatar.cc/150?img=3', phone: '+996 777 456 789', rating: 5.0, salesCount: 234, isVerified: true, location: 'Талас', memberSince: '2019' },
  { id: 's4', name: 'Алтынбек Уйчу', avatar: 'https://i.pravatar.cc/150?img=4', phone: '+996 550 321 654', rating: 4.7, salesCount: 67, isVerified: true, location: 'Чүй', memberSince: '2022' },
  { id: 's5', name: 'Жаныбек Малчы', avatar: 'https://i.pravatar.cc/150?img=5', phone: '+996 705 987 654', rating: 4.9, salesCount: 112, isVerified: true, location: 'Ысык-Көл', memberSince: '2020' },
  { id: 's6', name: 'Нурбек Койчу', avatar: 'https://i.pravatar.cc/150?img=6', phone: '+996 558 111 222', rating: 4.6, salesCount: 78, isVerified: true, location: 'Жалал-Абад', memberSince: '2021' },
  { id: 's7', name: 'Кубат Атчы', avatar: 'https://i.pravatar.cc/150?img=7', phone: '+996 709 333 444', rating: 4.8, salesCount: 145, isVerified: true, location: 'Баткен', memberSince: '2020' },
  { id: 's8', name: 'Айбек Фермер', avatar: 'https://i.pravatar.cc/150?img=8', phone: '+996 772 555 666', rating: 4.5, salesCount: 56, isVerified: false, location: 'Кочкор', memberSince: '2023' },
  { id: 's9', name: 'Мурат Малчы', avatar: 'https://i.pravatar.cc/150?img=9', phone: '+996 556 777 888', rating: 4.9, salesCount: 198, isVerified: true, location: 'Токмок', memberSince: '2019' },
  { id: 's10', name: 'Талант Уйчу', avatar: 'https://i.pravatar.cc/150?img=10', phone: '+996 701 999 000', rating: 4.7, salesCount: 87, isVerified: true, location: 'Каракол', memberSince: '2022' },
];

// Breed templates for generating data
const breedTemplates = {
  sheep: [
    { breed: 'Арашан', titles: ['Арашан кочкор', 'Арашан кой', 'Арашан козу', 'Арашан токту'], priceRange: [15000, 250000] },
    { breed: 'Гисар', titles: ['Гисар кочкор', 'Гисар кой', 'Гисар козу', 'Гисар токту'], priceRange: [20000, 400000] },
    { breed: 'Меринос', titles: ['Меринос кочкор', 'Меринос кой', 'Меринос козу'], priceRange: [18000, 180000] },
    { breed: 'Эдильбай', titles: ['Эдильбай кочкор', 'Эдильбай кой', 'Эдильбай козу'], priceRange: [25000, 350000] },
    { breed: 'Романов', titles: ['Романов кочкор', 'Романов кой', 'Романов козу'], priceRange: [22000, 200000] },
    { breed: 'Кыргыз кою', titles: ['Кыргыз кочкор', 'Кыргыз кой', 'Кыргыз козу'], priceRange: [12000, 150000] },
  ],
  horse: [
    { breed: 'Араб', titles: ['Араб аты', 'Араб байтал', 'Араб кулун'], priceRange: [500000, 3500000] },
    { breed: 'Англис', titles: ['Англис аты', 'Англис байтал', 'Англис жарыш аты'], priceRange: [800000, 2500000] },
    { breed: 'Ахалтеке', titles: ['Ахалтеке аты', 'Ахалтеке байтал', 'Алтын ат'], priceRange: [1000000, 5000000] },
    { breed: 'Кыргыз', titles: ['Кыргыз аты', 'Тоо аты', 'Кыргыз байтал'], priceRange: [150000, 500000] },
    { breed: 'Орловский', titles: ['Орлов аты', 'Орлов байтал', 'Орлов кулун'], priceRange: [400000, 1500000] },
    { breed: 'Дончак', titles: ['Дон аты', 'Дон байтал', 'Дончак кулун'], priceRange: [300000, 1000000] },
  ],
  cattle: [
    { breed: 'Голштин', titles: ['Голштин уй', 'Голштин бука', 'Голштин музоо'], priceRange: [200000, 600000] },
    { breed: 'Симментал', titles: ['Симментал уй', 'Симментал бука', 'Симментал музоо'], priceRange: [250000, 750000] },
    { breed: 'Алатоо', titles: ['Алатоо уй', 'Алатоо бука', 'Алатоо музоо'], priceRange: [150000, 400000] },
    { breed: 'Швиц', titles: ['Швиц уй', 'Швиц бука', 'Швиц музоо'], priceRange: [180000, 500000] },
    { breed: 'Герефорд', titles: ['Герефорд бука', 'Герефорд уй', 'Герефорд музоо'], priceRange: [220000, 650000] },
    { breed: 'Ангус', titles: ['Ангус бука', 'Ангус уй', 'Абердин-ангус'], priceRange: [280000, 800000] },
  ],
  camel: [
    { breed: 'Бактриан', titles: ['Бактриан төө', 'Эки өркөчтүү төө', 'Төө бото'], priceRange: [400000, 1200000] },
    { breed: 'Дромедар', titles: ['Дромедар төө', 'Бир өркөчтүү төө'], priceRange: [350000, 900000] },
  ],
  donkey: [
    { breed: 'Пуату', titles: ['Пуату эшеги', 'Франция эшеги'], priceRange: [200000, 600000] },
    { breed: 'Кыргыз эшеги', titles: ['Кыргыз эшеги', 'Жергиликтүү эшек', 'Эшек кулуну'], priceRange: [50000, 200000] },
    { breed: 'Каталон', titles: ['Каталон эшеги', 'Испан эшеги'], priceRange: [180000, 450000] },
  ],
  dog: [
    { breed: 'Алабай', titles: ['Алабай ит', 'Алабай күчүк', 'Азия овчаркасы'], priceRange: [30000, 150000] },
    { breed: 'Тайган', titles: ['Тайган ит', 'Кыргыз тайган', 'Тайган күчүк'], priceRange: [50000, 250000] },
    { breed: 'Кангал', titles: ['Кангал ит', 'Түрк кангалы', 'Кангал күчүк'], priceRange: [80000, 300000] },
    { breed: 'Немис овчаркасы', titles: ['Немис овчаркасы', 'Овчарка күчүк'], priceRange: [25000, 120000] },
  ],
  poultry: [
    { breed: 'Брама', titles: ['Брама тоогу', 'Брама короз', 'Брама жөжө'], priceRange: [3000, 25000] },
    { breed: 'Бронза', titles: ['Бронза индюк', 'Индюк', 'Индюк жөжө'], priceRange: [5000, 15000] },
    { breed: 'Пекин', titles: ['Пекин өрдөгү', 'Өрдөк', 'Өрдөк жөжө'], priceRange: [1500, 8000] },
    { breed: 'Легорн', titles: ['Легорн тоогу', 'Легорн короз'], priceRange: [2000, 10000] },
  ],
  // Жем-чөп категориясы
  feed: [
    { breed: 'Арпа', titles: ['Арпа 50кг', 'Арпа таза', 'Арпа жем'], priceRange: [800, 2500] },
    { breed: 'Буудай', titles: ['Буудай 50кг', 'Буудай таза', 'Буудай жем'], priceRange: [1000, 3000] },
    { breed: 'Жүгөрү', titles: ['Жүгөрү 50кг', 'Жүгөрү таза', 'Жүгөрү дан'], priceRange: [900, 2800] },
    { breed: 'Сулу', titles: ['Сулу 50кг', 'Сулу таза', 'Сулу жем'], priceRange: [700, 2200] },
    { breed: 'Күнөсканак', titles: ['Күнөсканак 25кг', 'Күнөсканак жем'], priceRange: [1500, 4000] },
    { breed: 'Чөп', titles: ['Чөп тюк', 'Беде чөп', 'Кургак чөп'], priceRange: [200, 800] },
    { breed: 'Саман', titles: ['Саман тюк', 'Буудай саман', 'Арпа саман'], priceRange: [150, 500] },
  ],
  // Тоют категориясы
  fodder: [
    { breed: 'Комбикорм', titles: ['Комбикорм уй', 'Комбикорм кой', 'Комбикорм ат'], priceRange: [1500, 4500] },
    { breed: 'Премикс', titles: ['Премикс уй', 'Премикс кой', 'Премикс тоок'], priceRange: [2000, 6000] },
    { breed: 'Кебек', titles: ['Буудай кебек', 'Арпа кебек', 'Кебек 50кг'], priceRange: [500, 1500] },
    { breed: 'Макуха', titles: ['Күнөсканак макуха', 'Соя макуха', 'Макуха 50кг'], priceRange: [800, 2500] },
    { breed: 'Жашыл тоют', titles: ['Жашыл беде', 'Жашыл жүгөрү', 'Силос'], priceRange: [300, 1200] },
    { breed: 'Туз', titles: ['Мал тузу', 'Туз кесек', 'Туз 50кг'], priceRange: [200, 800] },
  ],
  // Витамин категориясы
  vitamins: [
    { breed: 'Витамин AD3E', titles: ['Витамин AD3E', 'AD3E уй үчүн', 'AD3E кой үчүн'], priceRange: [500, 3000] },
    { breed: 'Кальций', titles: ['Кальций малга', 'Мел малга', 'Кальций порошок'], priceRange: [300, 1500] },
    { breed: 'Селен', titles: ['Селен витамин', 'Е-Селен', 'Селен инъекция'], priceRange: [400, 2500] },
    { breed: 'Антибиотик', titles: ['Антибиотик малга', 'Окситетрациклин', 'Пенициллин'], priceRange: [350, 2000] },
    { breed: 'Глистогон', titles: ['Глистогон малга', 'Альбендазол', 'Ивермектин'], priceRange: [250, 1800] },
    { breed: 'Вакцина', titles: ['Вакцина кой', 'Вакцина уй', 'Вакцина ат'], priceRange: [500, 3500] },
  ],
};

const regions = ['Нарын', 'Ош', 'Чүй', 'Талас', 'Ысык-Көл', 'Жалал-Абад', 'Баткен'];
const locations = [
  'Бишкек', 'Ош шаары', 'Нарын шаары', 'Талас шаары', 'Каракол', 'Жалал-Абад шаары',
  'Баткен шаары', 'Токмок', 'Кара-Балта', 'Кант', 'Сокулук', 'Кочкор', 'Ат-Башы',
  'Ноокат', 'Узген', 'Кызыл-Кыя', 'Сүлүктү', 'Майлуу-Суу', 'Таш-Көмүр', 'Балыкчы'
];
const colors = ['Ак', 'Кара', 'Күрөң', 'Боз', 'Ак-кара', 'Кызыл-ак', 'Сары', 'Алтын', 'Ак-боз', 'Кара-күрөң'];
const ages = ['2 ай', '3 ай', '4 ай', '6 ай', '8 ай', '1 жаш', '1.5 жаш', '2 жаш', '2.5 жаш', '3 жаш', '4 жаш', '5 жаш', '6 жаш'];

const badgeTypes: Array<{ text: string; type: 'hot' | 'new' | 'sale' | 'premium' | 'verified' | 'top' | 'urgent' }> = [
  { text: 'ТОП', type: 'top' },
  { text: 'ЖАҢЫ', type: 'new' },
  { text: 'ПРЕМИУМ', type: 'premium' },
  { text: 'ЭЛИТА', type: 'premium' },
  { text: 'ТУКУМ', type: 'premium' },
  { text: 'ТЕЗ', type: 'urgent' },
  { text: 'СААН', type: 'hot' },
  { text: 'ТЕКШЕРИЛГЕН', type: 'verified' },
];

// Helper functions
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPrice = (min: number, max: number): number => Math.round(randomInt(min, max) / 1000) * 1000;

// Generate 1000 livestock entries
function generateLivestock(): Livestock[] {
  const items: Livestock[] = [];
  let id = 1;

  const categoryMapping = [
    { categoryId: '2', templates: breedTemplates.sheep, count: 320, isAnimal: true },
    { categoryId: '3', templates: breedTemplates.horse, count: 180, isAnimal: true },
    { categoryId: '4', templates: breedTemplates.cattle, count: 220, isAnimal: true },
    { categoryId: '5', templates: breedTemplates.camel, count: 45, isAnimal: true },
    { categoryId: '6', templates: breedTemplates.donkey, count: 55, isAnimal: true },
    { categoryId: '7', templates: breedTemplates.dog, count: 120, isAnimal: true },
    { categoryId: '8', templates: breedTemplates.poultry, count: 60, isAnimal: true },
    { categoryId: '9', templates: breedTemplates.feed, count: 85, isAnimal: false },
    { categoryId: '10', templates: breedTemplates.fodder, count: 65, isAnimal: false },
    { categoryId: '11', templates: breedTemplates.vitamins, count: 50, isAnimal: false },
  ];

  for (const category of categoryMapping) {
    for (let i = 0; i < category.count; i++) {
      const template = randomItem(category.templates);
      const title = randomItem(template.titles);
      const basePrice = randomPrice(template.priceRange[0], template.priceRange[1]);
      // 45% of items have discount (more discounts for visibility)
      const hasDiscount = Math.random() > 0.55;
      // Discount between 5% and 35%
      const discountPercent = hasDiscount ? randomInt(5, 35) : 0;
      const originalPrice = hasDiscount ? Math.round(basePrice / (1 - discountPercent / 100)) : undefined;

      const seller = randomItem(sellers);
      const region = randomItem(regions);
      const location = randomItem(locations);
      const isPremium = Math.random() > 0.85;
      const isVerified = Math.random() > 0.3;
      const hasDocuments = Math.random() > 0.4;
      const hasDelivery = Math.random() > 0.5;
      const hasVideo = Math.random() > 0.6;
      const hasLineage = isPremium && Math.random() > 0.5;

      // More discounts and negotiable items for better UX
      const isNegotiable = !hasDiscount && Math.random() > 0.5; // 50% of non-discounted items
      const isUrgent = Math.random() > 0.88; // 12% urgent sale

      const badges = [];
      if (isPremium) badges.push(randomItem(badgeTypes.filter(b => b.type === 'premium')));
      if (Math.random() > 0.7) badges.push(randomItem(badgeTypes.filter(b => b.type !== 'premium')));

      // Different data for animal vs non-animal products
      const isAnimal = category.isAnimal;
      const feedWeights = ['25кг', '50кг', '100кг', '1 тонн', '10шт', '20шт', '100мл', '500мл', '1л'];
      const feedTitles = ['Сапаттуу', 'Таза', 'Жаңы', 'Арзан', 'Көтөрмө', 'Дүкөндөн'];
      const animalTitles = ['Элита', 'Премиум', 'Жакшы', 'Таза тукум', 'Сапаттуу', 'Күчтүү', 'Саан', 'Тукум'];

      const item: Livestock = {
        id: String(id++),
        title: `${title} - ${randomItem(isAnimal ? animalTitles : feedTitles)}`,
        breed: template.breed,
        price: basePrice,
        originalPrice,
        images: [
          `https://picsum.photos/seed/livestock${id}/800/600`,
          `https://picsum.photos/seed/livestock${id}b/800/600`,
        ],
        videoUrl: hasVideo ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : undefined,
        age: isAnimal ? randomItem(ages) : '-',
        weight: isAnimal ? `${randomInt(5, 800)} кг` : randomItem(feedWeights),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        color: isAnimal ? randomItem(colors) : '-',
        location,
        region,
        seller,
        views: randomInt(50, 10000),
        likes: randomInt(5, 500),
        rating: Number((4 + Math.random()).toFixed(1)),
        reviewCount: randomInt(0, 100),
        badges: badges.slice(0, 2),
        isVerified,
        hasDocuments: isAnimal ? hasDocuments : Math.random() > 0.7, // Less documents for feed
        hasDelivery,
        isNegotiable,
        isUrgent,
        isPremium,
        categoryId: category.categoryId,
        description: isAnimal
          ? `${title} сатылат. ${template.breed} тукуму. Ден соолугу жакшы, ${hasDocuments ? 'документтери бар' : 'документсиз'}. ${hasDelivery ? 'Жеткирүү бар.' : ''} Кененирээк маалымат үчүн байланышыңыз.`
          : `${title} сатылат. Сапаты жакшы. ${hasDelivery ? 'Жеткирүү бар.' : ''} Көтөрмө баада арзандатуу бар.`,
        features: isAnimal ? [
          'Ден соо',
          hasDocuments ? 'Документтери бар' : null,
          hasDelivery ? 'Жеткирүү бар' : null,
          isPremium ? 'Премиум класс' : null,
          isVerified ? 'Текшерилген' : null,
        ].filter(Boolean) as string[] : [
          'Сапаттуу',
          hasDelivery ? 'Жеткирүү бар' : null,
          'Көтөрмө бар',
          isVerified ? 'Текшерилген сатуучу' : null,
        ].filter(Boolean) as string[],
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // Only animals have lineage
        lineage: (isAnimal && hasLineage) ? {
          father: {
            name: `${randomItem(['Алп', 'Шер', 'Бай', 'Хан', 'Батыр'])}-${randomItem(['Эр', 'Бек', 'Хан', 'Тай'])}`,
            breed: `${template.breed} элита`,
            photo: `https://picsum.photos/seed/father${id}/400/300`,
            achievements: `${randomItem(['Чемпион', 'Жеңүүчү', 'Элита'])} ${randomInt(2019, 2023)}`,
          },
          mother: {
            name: `${randomItem(['Ак', 'Гүл', 'Ай', 'Нур'])}-${randomItem(['Марал', 'Бийке', 'Ханым', 'Сулуу'])}`,
            breed: `${template.breed} таза`,
            photo: `https://picsum.photos/seed/mother${id}/400/300`,
            achievements: `${randomItem(['Саан', 'Элита', 'Таза тукум'])}`,
          },
          pedigreeInfo: `${randomInt(2, 5)}-муундан бери таза кандуу ${template.breed} тукуму.`,
        } : undefined,
        documentPhotos: (isAnimal && hasDocuments) ? [
          `https://picsum.photos/seed/doc${id}a/600/400`,
          `https://picsum.photos/seed/doc${id}b/600/400`,
        ] : undefined,
      };

      items.push(item);
    }
  }

  // Shuffle array for variety
  return items.sort(() => Math.random() - 0.5);
}

export const livestock: Livestock[] = generateLivestock();

// Legacy export for compatibility
export const products = livestock;

// Sample video URLs for reels
const sampleVideoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
];

// Generate 100 videos (reduced for performance)
export const videos: Video[] = Array.from({ length: 100 }, (_, index) => {
  const baseLivestock = livestock[index % livestock.length];
  const videoUrl = sampleVideoUrls[index % sampleVideoUrls.length];

  return {
    id: `video-${index + 1}`,
    videoUrl,
    thumbnailUrl: `https://picsum.photos/seed/video${index}/800/600`,
    livestockId: baseLivestock.id,
    livestock: baseLivestock,
    likes: randomInt(500, 100000),
    comments: randomInt(50, 10000),
    shares: randomInt(20, 5000),
    duration: randomInt(10, 90),
    isLive: index < 3,
  };
});