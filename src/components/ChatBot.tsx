'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
}

// Bot responses based on keywords
const botResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ['салам', 'саламатсызбы', 'привет', 'здравствуйте', 'hello', 'hi'],
    response: "Саламатсызбы! 👋 Pinduo Shop'ко кош келиңиз! Сизге кандай жардам бере алам?"
  },
  {
    keywords: ['баа', 'канча', 'нарк', 'цена', 'price'],
    response: 'Баалар товардын барагында көрсөтүлгөн. Кайсы товар кызыктырат? Товардын атын жазыңыз, так бааны айтып берем! 💰'
  },
  {
    keywords: ['жеткирүү', 'доставка', 'delivery', 'жеткир'],
    response: '🚚 Жеткирүү шарттары:\n\n• Бишкек: 1-2 күн, 150 сом\n• Чүй областы: 2-3 күн, 200 сом\n• Башка аймактар: 3-5 күн, 250-400 сом\n• ¥3000+ заказда АКЫСЫЗ жеткирүү!'
  },
  {
    keywords: ['кайтаруу', 'алмаштыр', 'возврат', 'return'],
    response: '↩️ Кайтаруу шарттары:\n\n• 7 күн ичинде кайтарса болот\n• Товар колдонулбаган болушу керек\n• Чек жана таңгак сакталышы керек\n• Акча 3-5 күндө кайтарылат'
  },
  {
    keywords: ['төлөм', 'төлө', 'оплата', 'payment', 'акча'],
    response: '💳 Төлөм ыкмалары:\n\n• Накталай (жеткиргенде)\n• Элкарт, VISA, MasterCard\n• Мбанк, О!Деньги, Balance\n• QR код менен'
  },
  {
    keywords: ['размер', 'өлчөм', 'size'],
    response: '📏 Размер тандоо:\n\nТовардын барагында размер таблицасы бар. Өзүңүздүн өлчөмүңүздү алып, таблица менен салыштырыңыз. Суроо болсо - жазыңыз!'
  },
  {
    keywords: ['оригинал', 'түп нуска', 'копия', 'fake'],
    response: '✅ Биздин бардык товарлар ОРИГИНАЛ!\n\nОфициалдуу дистрибьютерлерден алып келебиз. Гарантия жана сертификат берилет.'
  },
  {
    keywords: ['акция', 'скидка', 'арзандатуу', 'sale', 'discount'],
    response: '🔥 Азыркы акциялар:\n\n• 2 товар алсаң 5% скидка\n• ¥5000+ заказда ¥200 скидка\n• Бирге алуу (группа) менен 30% чейин арзан!\n• Жаңы колдонуучуларга ¥100 купон!'
  },
  {
    keywords: ['заказ', 'буйрутма', 'order', 'кантип алам'],
    response: '🛒 Заказ кылуу:\n\n1. Товарды тандаңыз\n2. "Себетке" же "Сатып алуу" басыңыз\n3. Дарегиңизди жазыңыз\n4. Төлөм ыкмасын тандаңыз\n5. Заказды ырастаңыз\n\nБаары ушунчалык жөнөкөй! 😊'
  },
  {
    keywords: ['телефон', 'номер', 'байланыш', 'contact', 'звонить'],
    response: '📞 Байланыш:\n\n• Телефон: +996 555 123 456\n• WhatsApp: +996 555 123 456\n• Иш убактысы: 09:00 - 21:00\n\nЖазыңыз же чалыңыз!'
  },
  {
    keywords: ['рахмат', 'спасибо', 'thanks', 'thank'],
    response: 'Сизге да рахмат! 🙏 Дагы суроолор болсо - жазыңыз. Жакшы соода! 🛍️'
  },
  {
    keywords: ['кош', 'көрүшкөнчө', 'пока', 'bye', 'goodbye'],
    response: 'Көрүшкөнчө! 👋 Дагы келиңиз! Жакшы күн! ☀️'
  },
  {
    keywords: ['жардам', 'help', 'помощь'],
    response: '🆘 Мен сизге жардам бере алам:\n\n• Товар жөнүндө маалымат\n• Баа жана жеткирүү\n• Заказ статусу\n• Кайтаруу жана алмаштыруу\n• Төлөм ыкмалары\n\nСуроңузду жазыңыз!'
  },
  {
    keywords: ['статус', 'кайда', 'трек', 'track', 'где заказ'],
    response: '📦 Заказдын статусун билүү үчүн заказ номериңизди жазыңыз. Мисалы: #12345\n\nЖе профилиңизден "Заказдарым" бөлүмүн караңыз.'
  },
  {
    keywords: ['гарантия', 'warranty', 'кепилдик'],
    response: '🛡️ Гарантия шарттары:\n\n• Электроника: 12 ай\n• Кийим-кече: 30 күн\n• Аксессуарлар: 14 күн\n\nГарантия чеги менен берилет.'
  },
];

// Default response
const defaultResponse = 'Суроңузду түшүнө албадым 🤔\n\nБул темалар боюнча жардам бере алам:\n• Баа жана жеткирүү 🚚\n• Заказ кылуу 🛒\n• Кайтаруу ↩️\n• Төлөм 💳\n• Акциялар 🔥\n\nЖе операторго байланыш: +996 555 123 456';

// Quick reply suggestions
const quickReplies = [
  'Жеткирүү канча?',
  'Кантип заказ кылам?',
  'Акциялар бар?',
  'Кайтарса болобу?',
];

function getBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  for (const item of botResponses) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }

  return defaultResponse;
}

export default function ChatBot({ isOpen, onClose, shopName = 'Pinduo Shop' }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Саламатсызбы! 👋 ${shopName} кардар кызматына кош келиңиз!\n\nСизге кандай жардам бере алам?`,
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Bot typing
    setIsTyping(true);

    // Bot response after delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ky-KG', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Chat Window */}
      <div className="relative w-full sm:w-96 h-[85vh] sm:h-[600px] bg-white sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{shopName}</h3>
            <p className="text-xs text-green-100">Онлайн • Көбүнчө бат жооп берет</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] ${message.isBot ? 'order-2' : ''}`}>
                {message.isBot && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Бот</span>
                  </div>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    message.isBot
                      ? 'bg-white text-gray-800 rounded-tl-md shadow-sm'
                      : 'bg-green-500 text-white rounded-tr-md'
                  }`}
                >
                  {message.text}
                </div>
                <p className={`text-[10px] text-gray-400 mt-1 ${message.isBot ? '' : 'text-right'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-white border-t">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(reply)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap hover:bg-gray-200"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex items-center gap-2">
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Билдирүү жазыңыз..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 text-green-500 hover:text-green-600 disabled:text-gray-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}