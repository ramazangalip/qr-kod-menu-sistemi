'use client';

import React from 'react';
import { Flame, UtensilsCrossed, ChefHat, Salad, Cake, Coffee, Sparkles } from 'lucide-react';
import { Category } from '@/types/menu';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  UtensilsCrossed,
  ChefHat,
  Salad,
  Cake,
  Coffee,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="sticky top-[73px] z-15 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const IconComponent = ICON_MAP[cat.iconName] || Sparkles;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
