'use client';

import { useState } from 'react';
import { Category } from '@/data/types';

interface CategoryBarProps {
  categories: Category[];
  onCategoryChange?: (categoryId: string) => void;
}

export default function CategoryBar({ categories, onCategoryChange }: CategoryBarProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="bg-white sticky top-[72px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto hide-scrollbar py-2 md:py-3 px-2 md:px-4 gap-3 md:gap-6 md:justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex flex-col items-center gap-1 md:gap-1.5 min-w-[50px] md:min-w-[70px] transition-all ${
                activeCategory === category.id ? 'scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl transition-all ${
                  activeCategory === category.id
                    ? 'shadow-lg scale-110'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: activeCategory === category.id ? category.color + '20' : undefined,
                }}
              >
                {category.icon}
              </div>
              <span
                className={`text-[10px] md:text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id ? 'text-[var(--pdd-red)]' : 'text-gray-600'
                }`}
              >
                {category.name}
              </span>
              {activeCategory === category.id && (
                <div className="w-4 md:w-5 h-0.5 bg-[var(--pdd-red)] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}