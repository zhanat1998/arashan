// Reels/Video Comments Generator - Instagram style

export interface ReelComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  isVerified: boolean;
  replies: ReelComment[];
  createdAt: string;
}

// Kyrgyz usernames
const userNames = [
  'ainura_kg', 'bektur_01', 'gulnaz.shop', 'aida_beauty', 'nurlan_biz',
  'zhazgul_style', 'azamat.official', 'aigerim_fashion', 'talant_kg',
  'elmira_home', 'ruslan_tech', 'nazgul.mom', 'aidai_fit', 'bektour_travel',
  'meerim_cook', 'sultan.cars', 'jibek_art', 'argen_music', 'syimyk_photo',
  'aichurok_beauty', 'erkin_bro', 'kanykei_makeup', 'dosbol_gym', 'ainash_decor',
  'timur_games', 'zhyldyz_dance', 'ulan.kg', 'bermet_nails', 'aibek_moto',
  'cholpon_yoga', 'nuriza_kids', 'bakyt_food', 'asel_flowers', 'mirlan_dj',
  'zhamilya_spa', 'kuban_fishing', 'aidana_hair', 'chyngyz_box', 'nurzat_bride',
  'almaz_watch', 'tolkun_swim', 'erkaiym_handmade', 'tilek_barber', 'kunduz_cafe',
  'janybek_auto', 'anara_dress', 'bolot_sport', 'saltanat_jewel', 'askar_build',
  'zhypargul_tea', 'dastan_beats', 'gulmira_organic', 'esen_leather', 'nurgul_cake',
  'omurbek_wood', 'burul_cosmetic', 'iskender_gold', 'aiturgan_pet', 'kylych_hunt',
  'nuraiym_vintage', 'maksat_cargo', 'jazira_parfum', 'tynchtyk_stone', 'aidarkan_bike',
  'damira_plant', 'eldar_shoes', 'zarina_silk', 'aktan_metal', 'begaiym_candle',
  'zholdosh_fruit', 'ainur_mirror', 'bekzhan_lamp', 'dilara_soap', 'kubanych_tool',
  'svetlana_yarn', 'farida_spice', 'muratbek_tire', 'sabira_scarf', 'kairat_fish',
];

// Avatars
const avatars = [
  'https://i.pravatar.cc/100?img=1', 'https://i.pravatar.cc/100?img=2', 'https://i.pravatar.cc/100?img=3',
  'https://i.pravatar.cc/100?img=4', 'https://i.pravatar.cc/100?img=5', 'https://i.pravatar.cc/100?img=6',
  'https://i.pravatar.cc/100?img=7', 'https://i.pravatar.cc/100?img=8', 'https://i.pravatar.cc/100?img=9',
  'https://i.pravatar.cc/100?img=10', 'https://i.pravatar.cc/100?img=11', 'https://i.pravatar.cc/100?img=12',
  'https://i.pravatar.cc/100?img=13', 'https://i.pravatar.cc/100?img=14', 'https://i.pravatar.cc/100?img=15',
  'https://i.pravatar.cc/100?img=16', 'https://i.pravatar.cc/100?img=17', 'https://i.pravatar.cc/100?img=18',
  'https://i.pravatar.cc/100?img=19', 'https://i.pravatar.cc/100?img=20', 'https://i.pravatar.cc/100?img=21',
  'https://i.pravatar.cc/100?img=22', 'https://i.pravatar.cc/100?img=23', 'https://i.pravatar.cc/100?img=24',
  'https://i.pravatar.cc/100?img=25', 'https://i.pravatar.cc/100?img=26', 'https://i.pravatar.cc/100?img=27',
  'https://i.pravatar.cc/100?img=28', 'https://i.pravatar.cc/100?img=29', 'https://i.pravatar.cc/100?img=30',
  'https://i.pravatar.cc/100?img=31', 'https://i.pravatar.cc/100?img=32', 'https://i.pravatar.cc/100?img=33',
  'https://i.pravatar.cc/100?img=34', 'https://i.pravatar.cc/100?img=35', 'https://i.pravatar.cc/100?img=36',
  'https://i.pravatar.cc/100?img=37', 'https://i.pravatar.cc/100?img=38', 'https://i.pravatar.cc/100?img=39',
  'https://i.pravatar.cc/100?img=40', 'https://i.pravatar.cc/100?img=41', 'https://i.pravatar.cc/100?img=42',
  'https://i.pravatar.cc/100?img=43', 'https://i.pravatar.cc/100?img=44', 'https://i.pravatar.cc/100?img=45',
  'https://i.pravatar.cc/100?img=46', 'https://i.pravatar.cc/100?img=47', 'https://i.pravatar.cc/100?img=48',
  'https://i.pravatar.cc/100?img=49', 'https://i.pravatar.cc/100?img=50', 'https://i.pravatar.cc/100?img=51',
  'https://i.pravatar.cc/100?img=52', 'https://i.pravatar.cc/100?img=53', 'https://i.pravatar.cc/100?img=54',
  'https://i.pravatar.cc/100?img=55', 'https://i.pravatar.cc/100?img=56', 'https://i.pravatar.cc/100?img=57',
  'https://i.pravatar.cc/100?img=58', 'https://i.pravatar.cc/100?img=59', 'https://i.pravatar.cc/100?img=60',
];

// Comments in Kyrgyz - various styles like Instagram
const positiveComments = [
  '🔥🔥🔥', '❤️❤️❤️', '👍👍👍', '😍😍', '💯',
  'Мыкты!', 'Супер!', 'Класс!', 'Жакшы!', 'Сонун!',
  'Мыкты экен! 🔥', 'Абдан жакты! ❤️', 'Супер товар! 👍', 'Класс! 🙌', 'Жакшы экен!',
  'Ушундай товар издеп жүргөм 😍', 'Кайдан алса болот?', 'Баасы канча?', 'Жеткирүү барбы?', 'Бишкекке жеткиресиңерби?',
  'Качан келет заказ кылсам?', 'Сапаты кандай?', 'Оригиналбы?', 'Гарантиясы барбы?', 'Кайтаруу болобу?',
  'Буга чейин алгам, сапаты мыкты! ✅', 'Экинчи жолу заказ кылам! 🔄', 'Достума сунуштадым 👫', 'Бүт үй-бүлөгө алдык 👨‍👩‍👧‍👦', 'Белекке мыкты болот 🎁',
  'Баракчаңарга жазылдым! ✨', '@ainura_kg карачы буну!', '@bektur_01 сага керек эмеспи? 👀', 'Досторго тегдейм 👇', '@gulnaz.shop алып берчи',
  'Видеоңор абдан жакшы тартылган! 📹', 'Дагы видео чыгаргыла! 🎬', 'Башка түстөрү барбы? 🎨', 'XL размер барбы?', 'Акция качан болот? 💸',
  'Бул менин сактаганым! 📌', 'Айлык акы алгандан кийин алам 💰', 'Кийинки жумада заказ кылам 📅', 'Жаңы жылга чейин жетеби? 🎄', 'Эртеңки жеткирүү барбы? 🚀',
  'Биринчи комментарий! 🥇', 'Кечээ заказ кылдым ⏰', 'Жакында алам! 🛒', 'Акчамды сактап жатам 🐷', 'Бул керек! ✋',
];

const questionComments = [
  'Баасы канча болот?', 'Бишкекке жеткиресиңерби?', 'Ошко жеткирүү барбы?', 'Жалал-Абадга канча убакытта жетет?',
  'Башка түстөрү барбы?', 'Кызыл түсү барбы?', 'Ак түсү калдыбы?', 'Кара түсү качан келет?',
  'S размер барбы?', 'XXL барбы?', '42 размер жокпу?', 'Бала үчүн кайсы размер?',
  'Оригиналбы же копияб?', 'Кайдан алып келесиңер?', 'Кытайданбы?', 'Түркиядан алып келесиңерби?',
  'Канча күндө жетет?', 'Экспресс жеткирүү барбы?', 'Бүгүн заказ кылсам качан жетет?',
  'Оптом баасы барбы?', '10 даана алсам арзандатасыңарбы?', 'Дүкөнүңөр кайда?', 'Көрүп алса болобу?',
  'Гарантиясы канча?', 'Бузулса алмаштырып бересиңерби?', 'Кайтарып берсе болобу?',
  'WhatsApp номериңер кайсы?', 'DM жазсам болобу?', 'Телефонуңарды жазып коюңузчу',
];

const emojiOnlyComments = [
  '🔥', '❤️', '👍', '😍', '💯', '✨', '🙌', '👏', '💪', '🎉',
  '🔥🔥', '❤️❤️', '👍👍', '😍😍', '💯💯', '✨✨', '🙌🙌',
  '🔥🔥🔥', '❤️❤️❤️', '👍👍👍', '😍😍😍', '💯💯💯',
  '😱😱', '🤩🤩', '😻😻', '💖💖', '🥰🥰', '💕💕',
  '👀', '🛒', '💰', '🎁', '📦', '🚀', '⭐',
];

const tagComments = [
  '@ainura_kg бул сага!', '@bektur_01 көрдүңбү?', '@gulnaz.shop карачы', '@aida_beauty сага керек',
  '@nurlan_biz алып берчи', '@zhazgul_style мына ушул!', '@azamat.official кандай дейсиң?',
  '@aigerim_fashion өзүңө жакпайбы?', '@talant_kg белекке ушуну!', '@elmira_home үйгө керек',
  'Досторду тегдегиле 👇', 'Кимге керек? 🙋‍♀️', 'Тегдегиле! ⬇️', 'Досуңа көрсөт! 👀',
];

const replyComments = [
  'Рахмат! ❤️', 'Ооба, бар!', 'Жок, түгөндү 😔', 'DMге жазыңыз', 'Профилде бар',
  'Баасы описаниеде', '3-5 күндө жетет', 'Ооба, акысыз жеткирүү', 'WhatsApp: +996555123456',
  'Бардык түстөр бар!', 'Заказ кылыңыз!', 'Күтөбүз! 🙏', 'Рахмат жазганыңыз үчүн!',
];

const negativeComments = [
  'Өтө кымбат 😕', 'Башка жерде арзаныраак', 'Сапаты жаман деп угуп калдым',
  'Менде бар, сапаты начар', 'Алган жокмун, бирок...',
];

// Helper functions
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const randomTimeAgo = (): string => {
  const rand = Math.random();
  if (rand < 0.2) return `${randomInt(1, 59)}мүн`;
  if (rand < 0.5) return `${randomInt(1, 23)}саат`;
  if (rand < 0.8) return `${randomInt(1, 6)}күн`;
  return `${randomInt(1, 4)}жума`;
};

// Generate comments for a video
export function generateReelComments(videoId: string, count: number = 100): ReelComment[] {
  const comments: ReelComment[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count; i++) {
    // Get unique user
    let userIndex: number;
    do {
      userIndex = randomInt(0, userNames.length - 1);
    } while (usedIndices.has(userIndex) && usedIndices.size < userNames.length);
    usedIndices.add(userIndex);
    if (usedIndices.size >= userNames.length) usedIndices.clear();

    // Determine comment type
    const rand = Math.random();
    let content: string;
    if (rand < 0.25) {
      content = randomItem(emojiOnlyComments);
    } else if (rand < 0.5) {
      content = randomItem(positiveComments);
    } else if (rand < 0.7) {
      content = randomItem(questionComments);
    } else if (rand < 0.85) {
      content = randomItem(tagComments);
    } else if (rand < 0.95) {
      content = randomItem(positiveComments) + ' ' + randomItem(emojiOnlyComments);
    } else {
      content = randomItem(negativeComments);
    }

    // Maybe add replies (20% chance)
    const replies: ReelComment[] = [];
    if (Math.random() < 0.2) {
      const replyCount = randomInt(1, 3);
      for (let j = 0; j < replyCount; j++) {
        let replyUserIndex: number;
        do {
          replyUserIndex = randomInt(0, userNames.length - 1);
        } while (replyUserIndex === userIndex);

        const isShopReply = Math.random() < 0.5;
        replies.push({
          id: `${videoId}-comment-${i}-reply-${j}`,
          videoId,
          userId: isShopReply ? 'shop' : `user-${replyUserIndex}`,
          userName: isShopReply ? 'pinduo.shop ✓' : userNames[replyUserIndex],
          userAvatar: isShopReply ? 'https://i.pravatar.cc/100?img=70' : avatars[replyUserIndex % avatars.length],
          content: isShopReply ? randomItem(replyComments) : randomItem([...positiveComments.slice(0, 10), ...emojiOnlyComments]),
          likes: randomInt(0, 50),
          isLiked: false,
          isVerified: isShopReply,
          replies: [],
          createdAt: randomTimeAgo(),
        });
      }
    }

    comments.push({
      id: `${videoId}-comment-${i}`,
      videoId,
      userId: `user-${userIndex}`,
      userName: userNames[userIndex],
      userAvatar: avatars[userIndex % avatars.length],
      content,
      likes: randomInt(0, 500),
      isLiked: Math.random() < 0.1,
      isVerified: Math.random() < 0.05,
      replies,
      createdAt: randomTimeAgo(),
    });
  }

  // Sort by likes (most liked first) with some randomness
  return comments.sort((a, b) => {
    const aScore = a.likes + (Math.random() * 100);
    const bScore = b.likes + (Math.random() * 100);
    return bScore - aScore;
  });
}