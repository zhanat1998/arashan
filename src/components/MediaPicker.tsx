'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import data from '@emoji-mart/data';

// ==================== EMOJI DATA ====================
const CATEGORY_NAMES: Record<string, string> = {
  people: 'Адамдар',
  nature: 'Жаратылыш',
  foods: 'Тамак',
  activity: 'Аракеттер',
  places: 'Жерлер',
  objects: 'Буюмдар',
  symbols: 'Символдор',
  flags: 'Желектер',
};

const CATEGORY_ICONS: Record<string, string> = {
  people: '😀',
  nature: '🐻',
  foods: '🍔',
  activity: '⚽',
  places: '🏠',
  objects: '💡',
  symbols: '❤️',
  flags: '🏳️',
};

// ==================== STICKER PACKS ====================
const STICKER_PACKS = [
  {
    id: 'cute-animals',
    name: 'Сүйкүмдүү жаныбарлар',
    icon: '🐱',
    stickers: [
      { id: 'cat-love', url: 'https://media.tenor.com/images/a385a85e7aa3e59c9b04572f0572e9fe/tenor.gif' },
      { id: 'cat-hi', url: 'https://media.tenor.com/images/3068ddf0bc128e55c770f7f6dcb0ca07/tenor.gif' },
      { id: 'dog-love', url: 'https://media.tenor.com/images/5a5c685a28eb3d3a0c1a94f0c6c0b2b2/tenor.gif' },
      { id: 'bunny-hi', url: 'https://media.tenor.com/images/9e69f43d01d8e64c14dfc77d2558c7cc/tenor.gif' },
      { id: 'bear-love', url: 'https://media.tenor.com/images/72c6c00c31e54c65d64eb1937bf30566/tenor.gif' },
      { id: 'panda-hi', url: 'https://media.tenor.com/images/4c2ea6c10e5e3e7eb5d8e7dd6e8e3c3e/tenor.gif' },
    ]
  },
  {
    id: 'emotions',
    name: 'Эмоциялар',
    icon: '😍',
    stickers: [
      { id: 'love-hearts', url: 'https://media.tenor.com/images/9e69f43d01d8e64c14dfc77d2558c7cc/tenor.gif' },
      { id: 'happy-dance', url: 'https://media.tenor.com/images/1d3a7c3a4c3a1a4c3a1a4c3a1a4c3a1a/tenor.gif' },
      { id: 'sad-cry', url: 'https://media.tenor.com/images/2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e/tenor.gif' },
      { id: 'angry', url: 'https://media.tenor.com/images/3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f/tenor.gif' },
      { id: 'surprise', url: 'https://media.tenor.com/images/4g4g4g4g4g4g4g4g4g4g4g4g4g4g4g4g/tenor.gif' },
      { id: 'thinking', url: 'https://media.tenor.com/images/5h5h5h5h5h5h5h5h5h5h5h5h5h5h5h5h/tenor.gif' },
    ]
  },
  {
    id: 'greetings',
    name: 'Саламдашуу',
    icon: '👋',
    stickers: [
      { id: 'hi-wave', url: 'https://media.tenor.com/images/66a75328ff33e76e75aacde610936451/tenor.gif' },
      { id: 'bye-wave', url: 'https://media.tenor.com/images/77b86439ff44f87f86bbdef721047562/tenor.gif' },
      { id: 'thank-you', url: 'https://media.tenor.com/images/88c97540gg55g98g97ccefg832058673/tenor.gif' },
      { id: 'please', url: 'https://media.tenor.com/images/99d08651hh66h09h08ddfgh943169784/tenor.gif' },
      { id: 'sorry', url: 'https://media.tenor.com/images/00e19762ii77i10i19eeghi054270895/tenor.gif' },
      { id: 'congrats', url: 'https://media.tenor.com/images/11f20873jj88j21j20ffhij165381906/tenor.gif' },
    ]
  },
  {
    id: 'shopping',
    name: 'Соода',
    icon: '🛒',
    stickers: [
      { id: 'money', url: 'https://media.tenor.com/images/2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b/tenor.gif' },
      { id: 'sale', url: 'https://media.tenor.com/images/3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c/tenor.gif' },
      { id: 'gift', url: 'https://media.tenor.com/images/4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d/tenor.gif' },
      { id: 'delivery', url: 'https://media.tenor.com/images/5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e/tenor.gif' },
      { id: 'thumbs-up', url: 'https://media.tenor.com/images/6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f/tenor.gif' },
      { id: 'star-rating', url: 'https://media.tenor.com/images/7g7g7g7g7g7g7g7g7g7g7g7g7g7g7g7g/tenor.gif' },
    ]
  },
];

// ==================== POPULAR GIFS ====================
const POPULAR_GIFS = [
  'https://media.tenor.com/images/a385a85e7aa3e59c9b04572f0572e9fe/tenor.gif',
  'https://media.tenor.com/images/66a75328ff33e76e75aacde610936451/tenor.gif',
  'https://media.tenor.com/images/9e69f43d01d8e64c14dfc77d2558c7cc/tenor.gif',
  'https://media.tenor.com/images/72c6c00c31e54c65d64eb1937bf30566/tenor.gif',
  'https://media.tenor.com/images/3068ddf0bc128e55c770f7f6dcb0ca07/tenor.gif',
];

// ==================== TYPES ====================
interface EmojiData {
  id: string;
  name: string;
  keywords: string[];
  skins: { native: string }[];
}

interface CategoryData {
  id: string;
  emojis: string[];
}

interface GifResult {
  id: string;
  url: string;
  preview: string;
}

interface MediaPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (url: string) => void;
  onSelectSticker: (url: string) => void;
  onClose: () => void;
}

type TabType = 'emoji' | 'gif' | 'sticker';

// ==================== COMPONENT ====================
export default function MediaPicker({ onSelectEmoji, onSelectGif, onSelectSticker, onClose }: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('emoji');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('people');
  const [activeStickerPack, setActiveStickerPack] = useState(STICKER_PACKS[0].id);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loadingGifs, setLoadingGifs] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Recent emojis
  useEffect(() => {
    const stored = localStorage.getItem('recentEmojis');
    if (stored) {
      try {
        setRecentEmojis(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  // Emoji categories
  const emojiCategories = useMemo(() => {
    const emojiData = data as any;
    return (emojiData.categories as CategoryData[]).filter(
      (cat) => cat.id !== 'frequent' && CATEGORY_NAMES[cat.id]
    );
  }, []);

  // Get emoji native
  const getEmoji = (id: string): string | null => {
    const emojiData = data as any;
    const emoji = emojiData.emojis[id] as EmojiData | undefined;
    return emoji?.skins?.[0]?.native || null;
  };

  // Emoji search
  const emojiSearchResults = useMemo(() => {
    if (!searchQuery.trim() || activeTab !== 'emoji') return null;

    const query = searchQuery.toLowerCase();
    const emojiData = data as any;
    const results: string[] = [];

    Object.entries(emojiData.emojis as Record<string, EmojiData>).forEach(([id, emoji]) => {
      if (results.length >= 50) return;
      const matchesName = emoji.name?.toLowerCase().includes(query);
      const matchesKeyword = emoji.keywords?.some((k: string) => k.toLowerCase().includes(query));
      if (matchesName || matchesKeyword) {
        const native = emoji.skins?.[0]?.native;
        if (native) results.push(native);
      }
    });

    return results;
  }, [searchQuery, activeTab]);

  // Current emojis
  const currentEmojis = useMemo(() => {
    if (emojiSearchResults) return emojiSearchResults;
    if (activeEmojiCategory === 'recent') return recentEmojis;

    const category = emojiCategories.find((c) => c.id === activeEmojiCategory);
    if (!category) return [];

    return category.emojis.map((id) => getEmoji(id)).filter((e): e is string => e !== null);
  }, [activeEmojiCategory, emojiCategories, emojiSearchResults, recentEmojis]);

  // GIF search with Tenor
  const searchGifs = useCallback(async (query: string) => {
    setLoadingGifs(true);
    try {
      // Using Tenor API (free tier)
      const apiKey = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ'; // Public demo key
      const url = query.trim()
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${apiKey}&limit=20&media_filter=gif`
        : `https://tenor.googleapis.com/v2/featured?key=${apiKey}&limit=20&media_filter=gif`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        const gifResults: GifResult[] = data.results.map((item: any) => ({
          id: item.id,
          url: item.media_formats?.gif?.url || item.media_formats?.mediumgif?.url,
          preview: item.media_formats?.tinygif?.url || item.media_formats?.nanogif?.url,
        })).filter((g: GifResult) => g.url);

        setGifs(gifResults);
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      setGifs([]);
    } finally {
      setLoadingGifs(false);
    }
  }, []);

  // Search GIFs when query changes
  useEffect(() => {
    if (activeTab !== 'gif') return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchGifs(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, activeTab, searchGifs]);

  // Load initial GIFs
  useEffect(() => {
    if (activeTab === 'gif' && gifs.length === 0) {
      searchGifs('');
    }
  }, [activeTab, gifs.length, searchGifs]);

  // Handle emoji select
  const handleSelectEmoji = (emoji: string) => {
    const newRecent = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 30);
    setRecentEmojis(newRecent);
    localStorage.setItem('recentEmojis', JSON.stringify(newRecent));
    onSelectEmoji(emoji);
  };

  // Outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Current sticker pack
  const currentStickerPack = STICKER_PACKS.find(p => p.id === activeStickerPack);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ height: '380px' }}
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('emoji')}
          className={`flex-1 py-3 text-sm font-medium transition-all ${
            activeTab === 'emoji'
              ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg mr-1">😀</span> Эмодзи
        </button>
        <button
          onClick={() => setActiveTab('gif')}
          className={`flex-1 py-3 text-sm font-medium transition-all ${
            activeTab === 'gif'
              ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg mr-1">🎬</span> GIF
        </button>
        <button
          onClick={() => setActiveTab('sticker')}
          className={`flex-1 py-3 text-sm font-medium transition-all ${
            activeTab === 'sticker'
              ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg mr-1">🎨</span> Стикер
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'emoji' ? 'Эмодзи издөө...' :
              activeTab === 'gif' ? 'GIF издөө (мис: happy, love)...' :
              'Стикер издөө...'
            }
            className="w-full bg-gray-100 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:ring-2 focus:ring-red-500/30 focus:bg-white transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ==================== EMOJI TAB ==================== */}
      {activeTab === 'emoji' && (
        <div className="flex flex-col h-[calc(100%-110px)]">
          {/* Category tabs */}
          {!searchQuery && (
            <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {recentEmojis.length > 0 && (
                <button
                  onClick={() => setActiveEmojiCategory('recent')}
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                    activeEmojiCategory === 'recent' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
                  }`}
                  title="Акыркылар"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              {emojiCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveEmojiCategory(cat.id)}
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all text-lg ${
                    activeEmojiCategory === cat.id ? 'bg-red-100' : 'hover:bg-gray-100'
                  }`}
                  title={CATEGORY_NAMES[cat.id]}
                >
                  {CATEGORY_ICONS[cat.id]}
                </button>
              ))}
            </div>
          )}

          {/* Emoji grid */}
          <div className="flex-1 overflow-y-auto p-2">
            {currentEmojis.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Табылган жок</div>
            ) : (
              <div className="grid grid-cols-8 gap-1">
                {currentEmojis.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    onClick={() => handleSelectEmoji(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-lg transition-all active:scale-90 hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== GIF TAB ==================== */}
      {activeTab === 'gif' && (
        <div className="h-[calc(100%-110px)] overflow-y-auto p-2">
          {loadingGifs ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : gifs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {searchQuery ? 'GIF табылган жок' : 'GIF жүктөлүүдө...'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => onSelectGif(gif.url)}
                  className="relative aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 transition-all group"
                >
                  <img
                    src={gif.preview || gif.url}
                    alt="GIF"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Tenor attribution */}
          <div className="text-center py-2 mt-2">
            <span className="text-xs text-gray-400">Powered by Tenor</span>
          </div>
        </div>
      )}

      {/* ==================== STICKER TAB ==================== */}
      {activeTab === 'sticker' && (
        <div className="flex flex-col h-[calc(100%-110px)]">
          {/* Sticker pack tabs */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {STICKER_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setActiveStickerPack(pack.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg transition-all text-sm flex items-center gap-1 ${
                  activeStickerPack === pack.id
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span>{pack.icon}</span>
                <span className="whitespace-nowrap">{pack.name}</span>
              </button>
            ))}
          </div>

          {/* Sticker grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {currentStickerPack && (
              <div className="grid grid-cols-3 gap-3">
                {currentStickerPack.stickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => onSelectSticker(sticker.url)}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-50 hover:bg-gray-100 hover:ring-2 hover:ring-red-500 transition-all p-2"
                  >
                    <img
                      src={sticker.url}
                      alt="Sticker"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}