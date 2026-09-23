'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, X, Plus, Minus, Trash2, ChevronUp, Send, CheckCircle2, Utensils } from 'lucide-react';
import { BasketItem, TableInfo } from '@/types/menu';

interface AdisyonDrawerProps {
  basketItems: BasketItem[];
  tableInfo: TableInfo;
  onUpdateQuantity: (instanceId: string, delta: number) => void;
  onRemoveItem: (instanceId: string) => void;
  onClearBasket: () => void;
  onSubmitOrder: () => void;
}

export const AdisyonDrawer: React.FC<AdisyonDrawerProps> = ({
  basketItems,
  tableInfo,
  onUpdateQuantity,
  onRemoveItem,
  onClearBasket,
  onSubmitOrder,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const totalCount = basketItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = basketItems.reduce((acc, item) => acc + item.totalPrice, 0);

  if (basketItems.length === 0) return null;

  return (
    <>
      {/* 1. Floating Bottom Bar (Pill) */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="w-full max-w-md bg-stone-900 text-white rounded-2xl p-3 shadow-2xl border border-stone-800 flex items-center justify-between pointer-events-auto backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-emerald-600 p-2.5 rounded-xl text-white">
              <Receipt className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-900 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900">
                {totalCount}
              </span>
            </div>
            <div>
              <div className="text-[11px] text-stone-400 font-medium">Masa Adisyon Toplamı</div>
              <div className="text-base font-extrabold text-white">₺{totalPrice.toLocaleString('tr-TR')}</div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-sm"
          >
            <span>Adisyonu İncele</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* 2. Slide-up Adisyon Modal Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/65 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden z-10 shadow-2xl border border-stone-200 flex flex-col"
            >
              {/* Drag Indicator Bar */}
              <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 shrink-0" />

              {/* Header */}
              <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Adisyon Özeti</h3>
                    <p className="text-xs text-stone-500">{tableInfo.tableNumber} • {tableInfo.section}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClearBasket}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Temizle
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto space-y-3 max-h-[50vh] divide-y divide-stone-100 no-scrollbar">
                {basketItems.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                        {item.menuItem.name}
                      </h4>
                      {item.selectedOption && (
                        <p className="text-[11px] text-emerald-700 font-medium">{item.selectedOption}</p>
                      )}
                      {item.note && (
                        <p className="text-[11px] text-stone-500 italic truncate">"{item.note}"</p>
                      )}
                      <div className="text-xs text-stone-500 mt-1 font-semibold">
                        ₺{item.unitPrice} / adet
                      </div>
                    </div>

                    {/* Quantity controls & price */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                        ₺{item.totalPrice.toLocaleString('tr-TR')}
                      </span>

                      <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-white text-stone-800 flex items-center justify-center hover:bg-stone-200 active:scale-90"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-600" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="text-xs font-bold px-1 text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Sipariş Toplamı ({totalCount} Ürün)</span>
                  <span className="font-semibold text-stone-800">₺{totalPrice.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Masaya Servis & QR Hizmeti</span>
                  <span>Ücretsiz</span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold text-base pt-2 border-t border-stone-200">
                  <span>Ödenecek Toplam</span>
                  <span className="text-emerald-700">₺{totalPrice.toLocaleString('tr-TR')}</span>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onSubmitOrder();
                  }}
                  className="w-full mt-3 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Garsona & Mutfağa Siparişi İlet</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
