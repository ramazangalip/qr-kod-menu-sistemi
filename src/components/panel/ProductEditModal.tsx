'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Link2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { MenuItem, BadgeType, AllergenType } from '@/types/menu';
import { CATEGORIES } from '@/data/menu';

interface ProductEditModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
}

const AVAILABLE_BADGES: BadgeType[] = [
  'Şefin Önerisi',
  'Popüler',
  'Organik',
  'Vejetaryen',
  'Glutensiz',
  'Acılı',
  'Yeni',
];

const AVAILABLE_ALLERGENS: AllergenType[] = [
  'Gluten',
  'Laktoz',
  'Fındık/Fıstık',
  'Yumurta',
  'Deniz Ürünü',
  'Susam',
  'Soya',
];

// Product categories that items belong to (excluding 'popular' which is a virtual filter)
const ITEM_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'popular');

/**
 * Resizes and compresses an uploaded image file into an optimized JPEG Data URL.
 * Prevents localStorage quota exceeded errors while keeping high visual quality.
 */
function compressImageFile(file: File, maxWidth = 900, maxHeight = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: 'ana-yemekler',
    description: '',
    price: 0,
    image: '',
    badges: [],
    allergens: [],
    prepTimeMinutes: 10,
    calories: 500,
    rating: 4.8,
    reviewCount: 20,
    isPopular: false,
    isAvailable: true,
  });

  // Image upload state
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options state
  const [optionName, setOptionName] = useState<string>('');
  const [optionChoices, setOptionChoices] = useState<{ label: string; priceDelta: number }[]>([]);
  const [newChoiceLabel, setNewChoiceLabel] = useState<string>('');
  const [newChoiceDelta, setNewChoiceDelta] = useState<number>(0);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        badges: item.badges ? [...item.badges] : [],
        allergens: item.allergens ? [...item.allergens] : [],
        isAvailable: item.isAvailable !== false,
      });

      // If existing image is a web link, default to URL tab, else upload tab
      if (item.image?.startsWith('http://') || item.image?.startsWith('https://')) {
        setImageInputMode('url');
      } else {
        setImageInputMode('upload');
      }

      setUploadedFileName('');
      setUploadError(null);

      if (item.options && item.options.length > 0) {
        setOptionName(item.options[0].name || '');
        setOptionChoices(item.options[0].choices ? [...item.options[0].choices] : []);
      } else {
        setOptionName('');
        setOptionChoices([]);
      }
    } else {
      setFormData({
        id: `item-${Date.now()}`,
        name: '',
        category: 'ana-yemekler',
        description: '',
        price: 150,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        badges: [],
        allergens: [],
        prepTimeMinutes: 10,
        calories: 450,
        rating: 4.8,
        reviewCount: 10,
        isPopular: false,
        isAvailable: true,
      });
      setImageInputMode('upload');
      setUploadedFileName('');
      setUploadError(null);
      setOptionName('');
      setOptionChoices([]);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  // Process chosen or dropped file
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Lütfen geçerli bir görsel dosyası (PNG, JPG, WEBP) seçin.');
      return;
    }

    setUploadError(null);
    setIsCompressing(true);

    try {
      const optimizedDataUrl = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, image: optimizedDataUrl }));
      setUploadedFileName(file.name);
    } catch (err) {
      console.error('Görsel işlenirken hata:', err);
      setUploadError('Görsel yüklenirken bir sorun oluştu.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input so the same file can be re-selected if desired
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setUploadedFileName('');
    setUploadError(null);
  };

  const toggleBadge = (badge: BadgeType) => {
    setFormData((prev) => {
      const current = prev.badges || [];
      const updated = current.includes(badge)
        ? current.filter((b) => b !== badge)
        : [...current, badge];
      return {
        ...prev,
        badges: updated,
        isPopular: badge === 'Popüler' ? updated.includes('Popüler') : prev.isPopular,
      };
    });
  };

  const toggleAllergen = (allergen: AllergenType) => {
    setFormData((prev) => {
      const current = prev.allergens || [];
      const updated = current.includes(allergen)
        ? current.filter((a) => a !== allergen)
        : [...current, allergen];
      return { ...prev, allergens: updated };
    });
  };

  const handleAddChoice = () => {
    if (!newChoiceLabel.trim()) return;
    setOptionChoices((prev) => [...prev, { label: newChoiceLabel.trim(), priceDelta: Number(newChoiceDelta) || 0 }]);
    setNewChoiceLabel('');
    setNewChoiceDelta(0);
  };

  const handleRemoveChoice = (index: number) => {
    setOptionChoices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Lütfen ürün adını giriniz.');
      return;
    }

    if (formData.price === undefined || formData.price < 0) {
      alert('Lütfen geçerli bir fiyat giriniz.');
      return;
    }

    const finalItem: MenuItem = {
      id: item?.id || formData.id || `item-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category || 'ana-yemekler',
      description: formData.description?.trim() || '',
      price: Number(formData.price),
      image: formData.image?.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      badges: formData.badges,
      allergens: formData.allergens,
      prepTimeMinutes: Number(formData.prepTimeMinutes) || 10,
      calories: Number(formData.calories) || 0,
      rating: Number(formData.rating) || 5.0,
      reviewCount: Number(formData.reviewCount) || 1,
      isPopular: !!(formData.isPopular || formData.badges?.includes('Popüler')),
      isAvailable: formData.isAvailable !== false,
      options: optionName.trim() && optionChoices.length > 0
        ? [{ name: optionName.trim(), choices: optionChoices }]
        : undefined,
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-stone-900"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90 shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                {item ? 'Ürün Bilgilerini Güncelle' : 'Yeni Ürün Ekle'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {item ? `"${item.name}" ürününü düzenliyorsunuz` : 'Menüye yeni bir lezzet ekleyin'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Top row: Name & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Trüflü Mantarlı Burger"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-semibold outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="350"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-bold text-emerald-700 outline-none transition-all"
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Kategori *
                </label>
                <select
                  value={formData.category || 'ana-yemekler'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-medium outline-none transition-all"
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-4 pt-4 sm:pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable !== false}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-stone-700">
                    Satışta (Mevcut)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!(formData.isPopular || formData.badges?.includes('Popüler'))}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => {
                        const currentBadges = prev.badges || [];
                        const updatedBadges = checked
                          ? (currentBadges.includes('Popüler') ? currentBadges : [...currentBadges, 'Popüler' as BadgeType])
                          : currentBadges.filter((b) => b !== 'Popüler');
                        return { ...prev, isPopular: checked, badges: updatedBadges };
                      });
                    }}
                    className="w-4 h-4 text-amber-500 rounded border-stone-300 focus:ring-amber-400"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-stone-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Popüler Lezzet
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Açıklama & Malzemeler
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ürünün içeriğini, sunum detaylarını ve lezzetini anlatan kısa açıklama..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs sm:text-sm outline-none transition-all leading-relaxed"
              />
            </div>

            {/* ========================================================================= */}
            {/* Enhanced Image Section (File Upload from Device + URL Mode)                */}
            {/* ========================================================================= */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Ürün Görseli
                </label>

                {/* Input Mode Selector: Upload from Device / Web URL */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                      imageInputMode === 'upload'
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cihazdan Yükle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                      imageInputMode === 'url'
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Web URL'si</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Device File Upload */}
              {imageInputMode === 'upload' ? (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {formData.image ? (
                    /* Uploaded / Selected Image Preview Box */
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 relative group">
                        <img
                          src={formData.image}
                          alt="Seçilen Görsel"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Görsel Hazır</span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5 font-medium">
                          {uploadedFileName ||
                            (formData.image.startsWith('data:')
                              ? 'Cihazınızdan optimize edilerek yüklendi'
                              : 'Mevcut ürün görseli')}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Yeni Dosya Seç</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Kaldır</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Drag & Drop Upload Dropzone */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
                          : 'border-stone-300 hover:border-emerald-600 hover:bg-stone-50/80 bg-stone-50/40'
                      }`}
                    >
                      {isCompressing ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-xs font-bold text-stone-800">Fotoğraf optimize ediliyor...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 border border-emerald-100 shadow-2xs">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-stone-800">
                            Cihazınızdan fotoğraf seçmek için tıklayın veya buraya sürükleyin
                          </p>
                          <p className="text-[11px] text-stone-400 mt-1">
                            JPG, PNG, WEBP, GIF desteklenir (otomatik boyutlandırılır ve sıkıştırılır)
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Mode 2: Web URL Input */
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setUploadedFileName('');
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs sm:text-sm outline-none transition-all"
                    />
                  </div>
                  {formData.image && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                      <img
                        src={formData.image}
                        alt="Önizleme"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preparation Time, Calories, Rating */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Hazırlanma (dk)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.prepTimeMinutes ?? 10}
                  onChange={(e) => setFormData({ ...formData, prepTimeMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs sm:text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Kalori (kcal)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.calories ?? 0}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs sm:text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Puan (1 - 5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating ?? 4.9}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs sm:text-sm font-semibold outline-none"
                />
              </div>
            </div>

            {/* Badges Multi-select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Öne Çıkan Rozetler
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_BADGES.map((badge) => {
                  const isSelected = formData.badges?.includes(badge);
                  return (
                    <button
                      type="button"
                      key={badge}
                      onClick={() => toggleBadge(badge)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected ? `✓ ${badge}` : badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergens Multi-select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Alerjen Bilgileri
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ALLERGENS.map((allergen) => {
                  const isSelected = formData.allergens?.includes(allergen);
                  return (
                    <button
                      type="button"
                      key={allergen}
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected ? `✓ ${allergen}` : allergen}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Item Options (e.g., Pişme Derecesi or Sos Seçimi) */}
            <div className="border-t border-stone-200 pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Opsiyonel Seçenek Grubu (İsteğe Bağlı)
              </label>
              <p className="text-[11px] text-stone-400 mb-3">
                Müşterinin ürün detayında seçebileceği seçenekler (Örn: Pişme Derecesi, İçecek Seçimi, Ekstra Sos)
              </p>

              <input
                type="text"
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                placeholder="Seçenek Grubu Başlığı (Örn: Pişme Derecesi)"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs sm:text-sm font-medium mb-3 outline-none"
              />

              {/* Choices list */}
              {optionChoices.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {optionChoices.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs"
                    >
                      <span className="font-semibold text-stone-800">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold">
                          {c.priceDelta > 0 ? `+₺${c.priceDelta}` : 'Ücretsiz'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(i)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add choice row */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newChoiceLabel}
                  onChange={(e) => setNewChoiceLabel(e.target.value)}
                  placeholder="Seçenek adı (örn: Orta Pişmiş)"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={newChoiceDelta || ''}
                  onChange={(e) => setNewChoiceDelta(Number(e.target.value))}
                  placeholder="Fiyat farkı (+₺)"
                  className="w-24 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-all"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{item ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
