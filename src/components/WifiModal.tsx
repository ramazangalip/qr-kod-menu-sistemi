'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { TableInfo } from '@/types/menu';

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableInfo: TableInfo;
}

export const WifiModal: React.FC<WifiModalProps> = ({
  isOpen,
  onClose,
  tableInfo,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tableInfo.wifiPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Wi-Fi Icon */}
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200/60">
            <Wifi className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-center text-stone-900">
            Müşteri Wi-Fi Ağı
          </h3>
          <p className="text-xs text-stone-500 text-center mt-1">
            Restoranımızda yüksek hızlı internet erişimi ücretsizdir.
          </p>

          {/* Credentials Box */}
          <div className="mt-5 bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                Ağ Adı (SSID)
              </span>
              <span className="font-semibold text-stone-900 text-sm">{tableInfo.wifiSSID}</span>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Wi-Fi Şifresi
                </span>
                <span className="font-mono font-bold text-stone-900 text-base">{tableInfo.wifiPass}</span>
              </div>

              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 justify-center text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Güvenli & Otomatik Bağlantı</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
