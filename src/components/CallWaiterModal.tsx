'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MapPin, Send, Sparkles } from 'lucide-react';

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTableNumber: string;
  onCallWaiter: (tableNumber: string) => void;
}

export const CallWaiterModal: React.FC<CallWaiterModalProps> = ({
  isOpen,
  onClose,
  currentTableNumber,
  onCallWaiter,
}) => {
  const [tableNumber, setTableNumber] = useState<string>(currentTableNumber);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const tNum = tableNumber.trim();
    if (tNum) {
      onCallWaiter(tNum);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bell Icon */}
          <div className="w-14 h-14 bg-stone-900 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-800 shadow-lg">
            <Bell className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-center text-stone-900">
            Garson Çağır
          </h3>
          <p className="text-xs text-stone-500 text-center mt-1">
            Masa numaranızı doğrulayın ve garson çağırın.
          </p>

          {/* Table Number Input */}
          <div className="mt-5">
            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
              Masa Numarası
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Masa numaranızı girin"
                className="w-full pl-10 pr-4 py-3 bg-stone-100/90 focus:bg-white text-stone-900 placeholder-stone-400 text-sm rounded-xl border border-stone-200/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!tableNumber.trim()}
            className={`w-full mt-5 py-3.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
              tableNumber.trim()
                ? 'bg-stone-900 hover:bg-stone-800 active:scale-98 text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Garsonu Çağır</span>
          </button>

          <div className="mt-3 flex items-center gap-1.5 justify-center text-[11px] text-stone-400">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Personelimiz en kısa sürede masanıza gelecektir</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
