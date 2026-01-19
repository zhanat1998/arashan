import { Comment } from './types';

// Kyrgyz names
const kyrgyzNames = [
  'Айбек Асанов', 'Гулнура Токтоева', 'Нурлан Жумабеков', 'Айжан Сулейманова',
  'Бакыт Эсенов', 'Мира Кадырова', 'Талант Абдыкеримов', 'Жибек Исмаилова',
  'Эрлан Сатыбалдиев', 'Назгул Орозбекова', 'Канат Турдубаев', 'Айгуль Мамбетова',
  'Алмаз Жолдошев', 'Бурул Касымова', 'Руслан Байгазиев', 'Элнура Шаршенова',
  'Азамат Кылычбеков', 'Нургуль Токтосунова', 'Марат Исаков', 'Айпери Жапарова',
  'Данияр Кадыров', 'Асель Бекболотова', 'Улан Темиров', 'Чынара Акматова',
];

// Avatar URLs
const avatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
];

// Positive comments
const positiveComments = [
  'Мыкты продукт! Сапаты абдан жакшы, күтүүмдөн да ашты. Рахмат сатуучуга!',
  'Тез жеткирилди, упаковкасы абдан жакшы. Сунуштайм баарына! 👍',
  'Сүрөттөгүдөй эле келди. Баасына татыктуу товар. Дагы заказ берем.',
  'Биринчи жолу ушул дүкөндөн алдым, абдан ыраазымын! Сервис мыкты.',
  'Балама белекке алдым, абдан жакты. Сапаты жогору, рахмат!',
  'Оригинал продукт экенине ишенем. Бардыгы супер! ⭐⭐⭐⭐⭐',
  'Баасы да жакшы, сапаты да. Мындай дүкөн сейрек кездешет.',
  'Экинчи жолу заказ кылып жатам. Биринчиси абдан жакты!',
  'Жеткирүү тез, товар сапаттуу. Дүкөнгө рахмат! 🙏',
  'Кардар кызматы мыкты, суроолорго тез жооп беришти.',
  'Бул баада мындай сапат табуу кыйын. Сунуштайм!',
  'Үй-бүлөм баарына жакты. Дагы келебиз! 😊',
  'Абдан ыраазымын! Ар бир тыйыным татыктуу жерине кетти.',
  'Көптөн бери издеп жүргөнүм. Акыры таптым! Рахмат огромное!',
  'Сүрөттөн да чоңураак жана сапаттуураак чыкты. Супер! 💯',
];

// Negative comments
const negativeComments = [
  'Сүрөттөгүдөй эмес экен. Түсү башкача, капа болдум. 😞',
  'Жеткирүү өтө узакка созулду, 2 жума күттүм.',
  'Сапаты начар экен, бир жумадан кийин бузулуп калды.',
  'Баасына татыксыз товар. Кайтарып берсем деп жатам.',
  'Өлчөмү туура келбеди. Сүрөттө башкача көрүнөт.',
  'Упаковкасы жаман болгон, товар бир аз бузулуп келди.',
  'Күтүүмдү актаган жок. Башка жерден алсам болмок.',
  'Сатуучу суроолорго жооп бербейт. Сервис начар.',
  'Экинчи жолу албайм. Акча ыргытып жибергендей болдум.',
  'Материалы арзан, бат эле тозуп калчудай.',
];

// Neutral comments
const neutralComments = [
  'Жаман эмес, бирок мыкты деп да айта албайм. Баасына жараша.',
  'Кадимки товар, өзгөчө эч нерсе жок. Иштейт.',
  'Күткөнүмдөй келди. Жакшы да эмес, жаман да эмес.',
  'Нормалдуу сапат, бирок жеткирүү бир аз узак болду.',
  'Пайдаланып жатам, азырынча көйгөй жок.',
];

// Shop owner replies
const shopReplies = [
  'Рахмат сатып алганыңыз үчүн! Дагы келиңиз! 🙏',
  'Баа бергениңизге рахмат! Сиздин пикириңиз биз үчүн маанилүү.',
  'Кечиресиз, тез арада чечебиз. Байланышыңыз: +996555123456',
  'Рахмат! Сиз биздин туруктуу кардарсыз! ❤️',
  'Кыйынчылык үчүн кечирим сурайбыз. Алмаштырып беребиз.',
  'Пикириңиз үчүн рахмат! Жакшыртабыз.',
];

// Helper functions
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random date within last 90 days
const randomDate = (): string => {
  const days = randomInt(0, 90);
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

// Generate comments for a product
export function generateCommentsForProduct(productId: string, count: number = 15): Comment[] {
  const comments: Comment[] = [];

  for (let i = 0; i < count; i++) {
    const isPositive = Math.random() > 0.25; // 75% positive
    const isNeutral = !isPositive && Math.random() > 0.5;

    let rating: number;
    let content: string;

    if (isPositive) {
      rating = randomInt(4, 5);
      content = randomItem(positiveComments);
    } else if (isNeutral) {
      rating = 3;
      content = randomItem(neutralComments);
    } else {
      rating = randomInt(1, 2);
      content = randomItem(negativeComments);
    }

    const hasImages = Math.random() > 0.7;
    const hasReply = Math.random() > 0.6;

    const comment: Comment = {
      id: `comment-${productId}-${i + 1}`,
      productId,
      userId: `user-${randomInt(1, 1000)}`,
      userName: randomItem(kyrgyzNames),
      userAvatar: randomItem(avatars),
      rating,
      content,
      images: hasImages ? [
        `https://images.unsplash.com/photo-${1500000000000 + randomInt(0, 100000000)}?w=200&h=200&fit=crop`,
      ] : undefined,
      likes: randomInt(0, 150),
      isVerifiedPurchase: Math.random() > 0.2,
      selectedColor: Math.random() > 0.5 ? randomItem(['Кара', 'Ак', 'Көк', 'Кызыл']) : undefined,
      selectedSize: Math.random() > 0.5 ? randomItem(['S', 'M', 'L', 'XL', '128GB', '256GB']) : undefined,
      createdAt: randomDate(),
      replies: hasReply ? [{
        id: `reply-${productId}-${i + 1}`,
        userId: 'shop-owner',
        userName: 'Дүкөн',
        content: randomItem(shopReplies),
        isShopOwner: true,
        createdAt: randomDate(),
      }] : undefined,
    };

    comments.push(comment);
  }

  // Sort by date (newest first)
  return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Get rating distribution
export function getRatingDistribution(comments: Comment[]): { rating: number; count: number; percentage: number }[] {
  const distribution = [5, 4, 3, 2, 1].map(rating => {
    const count = comments.filter(c => c.rating === rating).length;
    return {
      rating,
      count,
      percentage: comments.length > 0 ? Math.round((count / comments.length) * 100) : 0,
    };
  });
  return distribution;
}

// Get average rating
export function getAverageRating(comments: Comment[]): number {
  if (comments.length === 0) return 0;
  const sum = comments.reduce((acc, c) => acc + c.rating, 0);
  return Number((sum / comments.length).toFixed(1));
}