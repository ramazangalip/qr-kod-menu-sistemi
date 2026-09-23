'use client';

import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Subtle Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium border-b border-stone-800 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Lezzet Durağı Artisan Cafe & Grill • Dijital QR Menü & Masaya Servis Sistemi</span>
      </div>

      {/* Main Page Container */}
      <div className="w-full relative min-h-screen pb-28">
        {children}
      </div>
    </div>
  );
};
