'use client';

import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

export const FooterBranding: React.FC = () => {
  return (
    <footer className="mt-12 mb-8 px-6 text-center border-t border-stone-200/60 pt-8 pb-10 bg-white/50">
      <div className="max-w-xs mx-auto space-y-3">

        {/* Sync Guarantee */}
        <p className="text-[11px] text-stone-500 leading-relaxed font-normal flex items-center justify-center gap-1">
          <RefreshCw className="w-3 h-3 text-stone-400 shrink-0 animate-spin-slow" />
          <span>Fiyat ve menü içerikleri anlık olarak yönetim panelinden senkronize edilir.</span>
        </p>

        {/* Legal & Copyright */}
        <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-center gap-2">
          <span>© 2026 Lezzet Durağı</span>
          <span>•</span>
          <span>Tüm Hakları Saklıdır</span>
        </div>
      </div>
    </footer>
  );
};
