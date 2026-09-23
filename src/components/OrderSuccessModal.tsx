'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, ChefHat, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  tableNumber: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  tableNumber,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Check Icon */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <h3 className="text-xl font-extrabold text-stone-900 leading-tight">
            Siparişiniz Alındı!
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            <strong className="text-stone-800 font-semibold">{tableNumber}</strong> adisyonunuza başarıyla eklendi ve mutfağımıza iletildi.
          </p>

          {/* Order Code Box */}
          <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Sipariş Kodu:</span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              #{orderNumber}
            </span>
          </div>

          {/* Timeline Status */}
          <div className="mt-5 space-y-3 text-left text-xs border-t border-stone-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div>
                <div className="font-bold text-stone-900">Sipariş Alındı</div>
                <div className="text-[11px] text-stone-400">QR Masaya Servis Sistemi</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                <ChefHat className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-amber-900">Mutfakta Hazırlanıyor</div>
                <div className="text-[11px] text-amber-700/80">Tahmini Süre: ~12-15 dk</div>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <div>
                <div className="font-bold text-stone-700">Masaya Servis Edilecek</div>
                <div className="text-[11px] text-stone-400">Garson Personeli Yönlendirilecek</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all"
          >
            Menüye Dön & İncelemeye Devam Et
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
