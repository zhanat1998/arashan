'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Буйрутманы кантип берем?',
    answer: 'Товарды тандап, "Корзинага" баскычын басыңыз. Андан кийин корзинага өтүп, "Буйрутмага өтүү" баскычын басыңыз. Жеткирүү дарегиңизди жана төлөм ыкмасын тандап, буйрутманы ырастаңыз.',
    category: 'orders',
  },
  {
    id: '2',
    question: 'Жеткирүү канча убакытка созулат?',
    answer: 'Бишкек шаары боюнча жеткирүү 2-5 жумуш күнү ичинде жүргүзүлөт. Башка аймактарга жеткирүү 5-10 жумуш күнү созулушу мүмкүн. Жеткирүү убактысы товардын жана жеткирүү ыкмасына жараша өзгөрүшү мүмкүн.',
    category: 'delivery',
  },
  {
    id: '3',
    question: 'Бекер жеткирүү кантип алам?',
    answer: 'Буйрутманын суммасы ₽5,000 же андан көп болсо, жеткирүү бекер болот. Бул сумма автоматтык түрдө эсептелет жана checkout бетинде көрсөтүлөт.',
    category: 'delivery',
  },
  {
    id: '4',
    question: 'Товарды кантип кайтарам?',
    answer: 'Товарды 14 күн ичинде кайтара аласыз. Товар колдонулбаган жана баштапкы абалында болушу керек. Кайтаруу үчүн "Профиль" > "Буйрутмалар" бөлүмүнө өтүп, кайтаргыңыз келген буйрутманы тандап, "Кайтаруу" баскычын басыңыз.',
    category: 'returns',
  },
  {
    id: '5',
    question: 'Кайсы төлөм ыкмалары бар?',
    answer: 'Биз төмөнкү төлөм ыкмаларын кабыл алабыз: Visa, MasterCard, МИР карталары, накладной төлөм (жеткирүүдө), электрондук капчыктар. Бардык онлайн төлөмдөр коопсуз SSL шифрлөө менен корголгон.',
    category: 'payment',
  },
  {
    id: '6',
    question: 'Буйрутманын статусун кантип текшерем?',
    answer: '"Профиль" > "Буйрутмалар" бөлүмүнө өтүңүз. Ал жерде бардык буйрутмаларыңыздын статусун көрө аласыз. Ошондой эле буйрутма статусу жөнүндө SMS жана email аркылуу кабарлайбыз.',
    category: 'orders',
  },
  {
    id: '7',
    question: 'Акча канча убакытта кайтарылат?',
    answer: 'Кайтаруу ырасталгандан кийин, акча 5-10 жумуш күнү ичинде баштапкы төлөм ыкмасына кайтарылат. Банк картасына кайтаруу банкка жараша көбүрөөк убакыт алышы мүмкүн.',
    category: 'returns',
  },
  {
    id: '8',
    question: 'Сыр сөздү кантип өзгөртөм?',
    answer: '"Профиль" > "Жөндөөлөр" > "Жеке маалымат" бөлүмүнө өтүңүз. Ал жерде "Сыр сөздү өзгөртүү" баскычын таап, жаңы сыр сөздү киргизиңиз.',
    category: 'account',
  },
  {
    id: '9',
    question: 'Группалык сатып алуу деген эмне?',
    answer: 'Группалык сатып алуу - бул достор менен бирге сатып алып, арзандатуу алуу. Товарды 2 же андан көп адам бирге сатып алса, кошумча арзандатуу берилет. Арзандатуу пайызы товарга жараша 5%-30% болушу мүмкүн.',
    category: 'orders',
  },
  {
    id: '10',
    question: 'Колдонмону кантип жүктөп алам?',
    answer: 'PinShop колдонмосу азырынча веб версияда гана жеткиликтүү. Мобилдик колдонмо жакында App Store жана Google Play\'де жеткиликтүү болот. Жаңылыктар үчүн билдирүүлөргө жазылыңыз!',
    category: 'account',
  },
];

const helpCategories = [
  { id: 'orders', name: 'Буйрутмалар', icon: '📦', color: 'bg-blue-100 text-blue-600' },
  { id: 'delivery', name: 'Жеткирүү', icon: '🚚', color: 'bg-green-100 text-green-600' },
  { id: 'payment', name: 'Төлөм', icon: '💳', color: 'bg-purple-100 text-purple-600' },
  { id: 'returns', name: 'Кайтаруу', icon: '↩️', color: 'bg-orange-100 text-orange-600' },
  { id: 'account', name: 'Аккаунт', icon: '👤', color: 'bg-pink-100 text-pink-600' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--pdd-gray)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Жардам борбору</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Суроо издөө..."
              className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-colors"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        {/* Quick Contact */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Тез байланыш</h2>
          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Чалуу</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Email</span>
            </button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              Иш убактысы: <span className="font-medium">09:00 - 21:00</span> (дүйшөмбү - ишемби)
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Категориялар</h2>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-[var(--pdd-red)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Баары
            </button>
            {helpCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCategory === category.id
                    ? 'bg-[var(--pdd-red)] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Көп берилүүчү суроолор</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredFAQs.length} суроо табылды</p>
          </div>

          {filteredFAQs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredFAQs.map((item) => (
                <div key={item.id} className="transition-colors">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                    className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {helpCategories.find(c => c.id === item.category)?.icon}
                      </span>
                      <span className={`font-medium ${expandedFAQ === item.id ? 'text-[var(--pdd-red)]' : 'text-gray-800'}`}>
                        {item.question}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedFAQ === item.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFAQ === item.id && (
                    <div className="px-4 pb-4 pl-12">
                      <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Суроо табылган жок</h3>
              <p className="text-sm text-gray-500">Башка сөздөр менен издеп көрүңүз</p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Байланыш маалыматы</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Телефон</p>
                <p className="font-medium text-gray-800">+996 555 123 456</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">support@pinshop.kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Дарек</p>
                <p className="font-medium text-gray-800">Бишкек ш., Чүй просп. 123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Дагы эле жардам керекпи?</h2>
          <p className="text-white/80 mb-4">Биздин колдоо командасы сизге жардам берүүгө даяр</p>
          <button className="px-6 py-3 bg-white text-[var(--pdd-red)] font-bold rounded-xl hover:bg-gray-100 transition-colors">
            Чат баштоо
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Башкы</span>
          </Link>
          <Link href="/categories" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs">Категория</span>
          </Link>
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xs mt-1">Видео</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Издөө</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}