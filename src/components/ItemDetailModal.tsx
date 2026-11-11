'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShieldAlert, Clock, Flame, Star, ShoppingBag, Check } from 'lucide-react';
import { MenuItem, AllergenType } from '@/types/menu';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToBasket: (item: MenuItem, quantity: number, selectedOption?: string, note?: string) => void;
}

const ALLERGEN_ICONS: Record<AllergenType, string> = {
  Gluten: '🌾 Gluten',
  Laktoz: '🥛 Laktoz',
  'Fındık/Fıstık': '🥜 Fındık / Fıstık',
  Yumurta: '🥚 Yumurta',
  'Deniz Ürünü': '🐟 Deniz Ürünleri',
  Susam: '🌱 Susam',
  Soya: '🫘 Soya',
};

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onAddToBasket,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    item?.options?.[0]?.choices[0]?.label
  );
  const [note, setNote] = useState<string>('');
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);

  if (!item) return null;

  // Calculate total price based on option delta
  const selectedChoice = item.options?.[0]?.choices.find((c) => c.label === selectedOption);
  const priceDelta = selectedChoice ? selectedChoice.priceDelta : 0;
  const unitPrice = item.price + priceDelta;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToBasket(item, quantity, selectedOption, note);
    setIsAddedToast(true);
    setTimeout(() => {
      setIsAddedToast(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 backdrop-blur-xs p-0 sm:p-4">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Bottom Sheet Modal Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl border border-stone-200 no-scrollbar flex flex-col"
        >
          {/* Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 shrink-0" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Item Image Header */}
          <div className="relative h-60 w-full bg-stone-100 shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                {item.rating && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/90 text-stone-900 font-bold text-xs">
                    <Star className="w-3 h-3 fill-stone-900" />
                    {item.rating}
                  </span>
                )}
                {item.prepTimeMinutes && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-stone-200 text-xs">
                    <Clock className="w-3 h-3" />
                    {item.prepTimeMinutes} dk hazırlanma
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold leading-tight">{item.name}</h2>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 space-y-5 flex-1">
            {/* Description */}
            <div>
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-1">Açıklama</h3>
              <p className="text-stone-700 text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Badges */}
            {item.badges && item.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.badges.map((b) => (
                  <span
                    key={b}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}

            {/* Allergen Warning Box */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Alerjen Uyarısı</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.allergens.map((alg) => (
                    <span
                      key={alg}
                      className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-medium text-[11px]"
                    >
                      {ALLERGEN_ICONS[alg] || alg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Options Selection (e.g. Pişme Derecesi or İçecek Seçimi) */}
            {item.options && item.options.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  {item.options[0].name}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {item.options[0].choices.map((choice) => {
                    const isSelected = selectedOption === choice.label;
                    return (
                      <button
                        key={choice.label}
                        type="button"
                        onClick={() => setSelectedOption(choice.label)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-600 ring-1 ring-emerald-600'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <span>{choice.label}</span>
                        {choice.priceDelta > 0 && (
                          <span className="font-semibold text-emerald-700">+₺{choice.priceDelta}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions Note */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                Özel Not / Aşçıya Mesaj (Opsiyonel)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn: Az tuzlu olsun, sosu ayrı kapta verilsin..."
                rows={2}
                className="w-full p-3 bg-stone-50 text-stone-900 placeholder-stone-400 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-4 bg-white border-t border-stone-200 sticky bottom-0 z-10 flex items-center justify-between gap-3 shadow-lg">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white text-stone-800 flex items-center justify-center hover:bg-stone-200 active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm text-stone-900 w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Basket Button */}
            {item.isAvailable === false ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center px-5 py-3.5 rounded-xl bg-stone-200 text-stone-500 font-bold text-sm cursor-not-allowed"
              >
                <span>Bu Ürün Geçici Olarak Tükendi</span>
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isAddedToast}
                className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  {isAddedToast ? (
                    <>
                      <Check className="w-4 h-4 text-white animate-bounce" />
                      <span>Eklendi!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Adisyona Ekle</span>
                    </>
                  )}
                </span>
                <span className="text-base font-extrabold">₺{totalPrice.toLocaleString('tr-TR')}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
