'use client';

import React from 'react';
import { Plus, Minus, Star, Clock, Flame, Award, Leaf, Sparkles } from 'lucide-react';
import { MenuItem, BadgeType } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  quantityInBasket: number;
  onOpenDetail: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onQuickRemove: (item: MenuItem) => void;
}

const BADGE_STYLES: Record<BadgeType, { bg: string; icon?: React.ElementType }> = {
  'Şefin Önerisi': { bg: 'bg-amber-50 text-amber-900 border-amber-200/80', icon: Award },
  'Popüler': { bg: 'bg-rose-50 text-rose-800 border-rose-200/80', icon: Flame },
  'Organik': { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80', icon: Sparkles },
  'Vejetaryen': { bg: 'bg-teal-50 text-teal-800 border-teal-200/80', icon: Leaf },
  'Glutensiz': { bg: 'bg-sky-50 text-sky-800 border-sky-200/80', icon: Leaf },
  'Acılı': { bg: 'bg-red-50 text-red-800 border-red-200/80', icon: Flame },
  'Yeni': { bg: 'bg-purple-50 text-purple-800 border-purple-200/80', icon: Sparkles },
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantityInBasket,
  onOpenDetail,
  onQuickAdd,
  onQuickRemove,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div onClick={() => onOpenDetail(item)} className="cursor-pointer">
        {/* Item Image */}
        <div className="relative h-44 w-full overflow-hidden bg-stone-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-60" />

          {/* Badges on image */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10 max-w-[80%]">
            {item.badges?.slice(0, 2).map((badge) => {
              const style = BADGE_STYLES[badge] || { bg: 'bg-stone-100 text-stone-800 border-stone-200', icon: Sparkles };
              const Icon = style.icon;
              return (
                <span
                  key={badge}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md shadow-xs ${style.bg}`}
                >
                  {Icon && <Icon className="w-2.5 h-2.5" />}
                  <span>{badge}</span>
                </span>
              );
            })}
          </div>

          {/* Rating / Prep Time badge bottom right */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-900/80 text-white backdrop-blur-md text-[11px] font-medium">
            {item.rating && (
              <span className="flex items-center gap-0.5 text-amber-300">
                <Star className="w-3 h-3 fill-amber-300" />
                {item.rating}
              </span>
            )}
            {item.prepTimeMinutes && (
              <span className="flex items-center gap-0.5 text-stone-300 border-l border-stone-700 pl-1.5">
                <Clock className="w-3 h-3 text-stone-300" />
                {item.prepTimeMinutes} dk
              </span>
            )}
          </div>
        </div>

        {/* Card Details */}
        <div className="p-3.5 pb-2">
          <h3 className="font-bold text-stone-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Quick Quantity Actions */}
      <div className="p-3.5 pt-1 flex items-center justify-between border-t border-stone-100/80 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Fiyat</span>
          <span className="text-base sm:text-lg font-extrabold text-stone-900">
            ₺{item.price.toLocaleString('tr-TR')}
          </span>
        </div>

        {/* Add / Quantity Counter */}
        {quantityInBasket > 0 ? (
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRemove(item);
              }}
              className="w-7 h-7 rounded-lg bg-white text-stone-800 flex items-center justify-center hover:bg-stone-200 active:scale-90 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-xs sm:text-sm px-1 text-stone-900">
              {quantityInBasket}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(item);
              }}
              className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(item);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Masaya Ekle</span>
          </button>
        )}
      </div>
    </div>
  );
};
