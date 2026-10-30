'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Utensils, Sparkles } from 'lucide-react';

interface TableSelectModalProps {
  isOpen: boolean;
  onSelectTable: (tableNumber: string) => void;
}

const QUICK_TABLES = [
  '1', '2', '3', '4', '5', '6',
  '7', '8', '9', '10', '11', '12',
  '13', '14', '15', '16', '17', '18',
  '19', '20',
];

export const TableSelectModal: React.FC<TableSelectModalProps> = ({
  isOpen,
  onSelectTable,
}) => {
  const [customTable, setCustomTable] = useState<string>('');
  const [selectedQuick, setSelectedQuick] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const tableNum = selectedQuick || customTable.trim();
    if (tableNum) {
      onSelectTable(tableNum);
    }
  };

  const handleQuickSelect = (num: string) => {
    setSelectedQuick(num);
    setCustomTable('');
  };

  const handleCustomChange = (value: string) => {
    setCustomTable(value);
    setSelectedQuick(null);
  };

  const isValid = selectedQuick || customTable.trim();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 overflow-hidden"
        >
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700" />

          {/* Icon */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2 border border-emerald-200/60 shadow-inner">
            <Utensils className="w-8 h-8" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-extrabold text-stone-900 text-center leading-tight">
            Hoş Geldiniz!
          </h3>
          <p className="text-xs text-stone-500 text-center mt-1.5">
            Siparişinize başlamak için lütfen masa numaranızı seçin veya girin.
          </p>

          {/* Quick Select Grid */}
          <div className="mt-5">
            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-2">
              Masa Seçin
            </label>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_TABLES.map((num) => {
                const isSelected = selectedQuick === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleQuickSelect(num)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-stone-200/60'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Or Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">veya</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Custom Input */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={customTable}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Özel masa numarası girin (VIP 1, Teras 3...)"
              className="w-full pl-10 pr-4 py-3 bg-stone-100/90 focus:bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm rounded-xl border border-stone-200/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full mt-5 py-3.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
              isValid
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>Menüyü Görüntüle</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Bottom Branding */}
          <div className="mt-4 flex items-center gap-1.5 justify-center text-[11px] text-stone-400">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Lezzet Durağı Dijital QR Menü Sistemi</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
