'use client';

import React from 'react';
import { Star, Bell, Wifi, MapPin, Sparkles, Clock, Utensils } from 'lucide-react';
import { TableInfo } from '@/types/menu';

interface MenuHeaderProps {
  tableInfo: TableInfo;
  onCallWaiter: () => void;
  onOpenWifi: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  tableInfo,
  onCallWaiter,
  onOpenWifi,
}) => {
  return (
    <div className="relative w-full bg-white border-b border-stone-200/80 shadow-xs">
      {/* Hero Cover Banner Image */}
      <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-stone-900">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
          alt="Lezzet Durağı Atmosphere"
          className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
        />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />

        {/* Top Badges Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute top-4 left-0 right-0 flex justify-between items-center z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Şu an Açık
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 text-stone-900 backdrop-blur-md shadow-md border border-white/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Dijital QR Menü
          </span>
        </div>

        {/* Table & Location Info Overlay on Cover */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute bottom-4 left-0 right-0 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 text-stone-900 backdrop-blur-md shadow-lg border border-white/60 text-xs sm:text-sm font-bold">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{tableInfo.tableNumber}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600 font-medium">{tableInfo.section}</span>
          </div>
        </div>
      </div>

      {/* Main Restaurant Info Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Restaurant Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden sm:inline-block">
                <Utensils className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900">
                {tableInfo.restaurantName}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 font-medium flex items-center gap-2">
              <span>Gurme Dünya Mutfakları & Artisan Kahve</span>
              <span>•</span>
              <span className="text-stone-700 font-semibold">Masaya Hızlı Servis</span>
            </p>
          </div>

          {/* Stats & Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Rating & Prep stats */}
            <div className="flex items-center gap-2.5 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200/80 font-bold shadow-2xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-amber-700/80 font-normal hidden sm:inline">(140+ Değerlendirme)</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200/80 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ort. <strong className="text-stone-900 font-bold">12-18 dk</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onCallWaiter}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-95 transition-all duration-200 group"
              >
                <Bell className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Garson Çağır</span>
              </button>

              <button
                onClick={onOpenWifi}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-semibold text-xs sm:text-sm border border-stone-200 active:scale-95 transition-all duration-200"
              >
                <Wifi className="w-4 h-4 text-stone-600" />
                <span>Wi-Fi Şifresi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
