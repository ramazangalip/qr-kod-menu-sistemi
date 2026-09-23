'use client';

import React from 'react';
import { Search, X, Filter, Sparkles, Leaf, Award } from 'lucide-react';
import { BadgeType } from '@/types/menu';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedBadge: BadgeType | null;
  onBadgeToggle: (badge: BadgeType | null) => void;
  totalResultsCount: number;
}

const BADGES: { type: BadgeType; label: string; icon: React.ElementType }[] = [
  { type: 'Şefin Önerisi', label: 'Şefin Seçimi', icon: Award },
  { type: 'Vejetaryen', label: 'Vejetaryen', icon: Leaf },
  { type: 'Organik', label: 'Organik', icon: Sparkles },
  { type: 'Glutensiz', label: 'Glutensiz', icon: Leaf },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedBadge,
  onBadgeToggle,
  totalResultsCount,
}) => {
  return (
    <div className="bg-white border-b border-stone-200/60 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Search Input Box */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Yemek, içecek veya malzeme ara... (örn: Antrikot, Cheesecake, Mantı)"
            className="w-full pl-11 pr-10 py-3 bg-stone-100/90 focus:bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm rounded-xl border border-stone-200/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary & Highlight Quick Filter Pills */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => onBadgeToggle(null)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedBadge === null
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tümü
          </button>

          {BADGES.map(({ type, label, icon: Icon }) => {
            const isActive = selectedBadge === type;
            return (
              <button
                key={type}
                onClick={() => onBadgeToggle(isActive ? null : type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-700/30'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Search status indicator */}
        {(searchTerm || selectedBadge) && (
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100 text-xs text-stone-500">
            <span>
              Arama Sonuçları: <strong className="text-stone-900 font-bold">{totalResultsCount} ürün</strong> bulundu
            </span>
            <button
              onClick={() => {
                onSearchChange('');
                onBadgeToggle(null);
              }}
              className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
            >
              <Filter className="w-3 h-3" />
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
