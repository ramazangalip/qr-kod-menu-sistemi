'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  clearAllOrders,
  StoredOrder,
} from '@/lib/orderStorage';
import {
  getMenuItems,
  updateMenuItem,
  addMenuItem,
  deleteMenuItem,
  resetMenuToDefaults,
} from '@/lib/menuStorage';
import { MenuItem, BadgeType } from '@/types/menu';
import { CATEGORIES } from '@/data/menu';
import { ProductEditModal } from '@/components/panel/ProductEditModal';
import {
  Receipt,
  Trash2,
  RefreshCw,
  ChefHat,
  CheckCircle2,
  Clock,
  Package,
  Search,
  X,
  AlertTriangle,
  Utensils,
  MapPin,
  Filter,
  ArrowLeft,
  Plus,
  Edit,
  Sparkles,
  RotateCcw,
  Star,
  Flame,
  Check,
  Ban,
  Tag,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<StoredOrder['status'], { bg: string; icon: React.ElementType; label: string }> = {
  'Hazırlanıyor': {
    bg: 'bg-amber-100 text-amber-900 border-amber-200',
    icon: ChefHat,
    label: 'Hazırlanıyor',
  },
  'Hazır': {
    bg: 'bg-sky-100 text-sky-900 border-sky-200',
    icon: Package,
    label: 'Hazır',
  },
  'Teslim Edildi': {
    bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    icon: CheckCircle2,
    label: 'Teslim Edildi',
  },
};

const STATUS_OPTIONS: StoredOrder['status'][] = ['Hazırlanıyor', 'Hazır', 'Teslim Edildi'];

export default function PanelPage() {
  // Main Navigation Tab: 'orders' | 'menu'
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  // --- Orders State ---
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<StoredOrder['status'] | 'all'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // --- Menu Management State ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productAvailabilityFilter, setProductAvailabilityFilter] = useState<'all' | 'available' | 'soldout'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState<string | null>(null);
  const [showResetMenuConfirm, setShowResetMenuConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Load orders from localStorage
  const loadOrders = () => {
    setOrders(getOrders());
  };

  // Load menu items from localStorage
  const loadMenu = () => {
    setMenuItems(getMenuItems());
  };

  useEffect(() => {
    loadOrders();
    loadMenu();

    // Auto-refresh orders every 5 seconds
    const interval = setInterval(loadOrders, 5000);

    const handleMenuUpdate = () => {
      loadMenu();
    };

    window.addEventListener('menu-items-updated', handleMenuUpdate);
    window.addEventListener('storage', handleMenuUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('menu-items-updated', handleMenuUpdate);
      window.removeEventListener('storage', handleMenuUpdate);
    };
  }, []);

  // --- Order Filtering & Stats ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTable = order.tableNumber.toLowerCase().includes(query);
        const matchesOrder = order.orderNumber.toLowerCase().includes(query);
        const matchesItems = order.items.some((item) =>
          item.name.toLowerCase().includes(query)
        );
        if (!matchesTable && !matchesOrder && !matchesItems) return false;
      }

      if (filterStatus !== 'all' && order.status !== filterStatus) return false;

      return true;
    });
  }, [orders, searchTerm, filterStatus]);

  const uniqueTables = useMemo(() => {
    const tables = new Set(orders.map((o) => o.tableNumber));
    return tables.size;
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'Teslim Edildi').length;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + o.totalPrice, 0);
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: StoredOrder['status']) => {
    updateOrderStatus(orderId, newStatus);
    loadOrders();
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    setShowDeleteConfirm(null);
    loadOrders();
  };

  const handleClearAll = () => {
    clearAllOrders();
    setShowClearConfirm(false);
    loadOrders();
  };

  // --- Menu Management Filtering & Stats ---
  const filteredProducts = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Search Query
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesBadges = item.badges?.some((b) => b.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesBadges) return false;
      }

      // 2. Category Filter
      if (productCategoryFilter !== 'all') {
        if (productCategoryFilter === 'popular') {
          if (!item.isPopular) return false;
        } else if (item.category !== productCategoryFilter) {
          return false;
        }
      }

      // 3. Availability Filter
      if (productAvailabilityFilter === 'available' && item.isAvailable === false) return false;
      if (productAvailabilityFilter === 'soldout' && item.isAvailable !== false) return false;

      return true;
    });
  }, [menuItems, productSearch, productCategoryFilter, productAvailabilityFilter]);

  const menuStats = useMemo(() => {
    const total = menuItems.length;
    const available = menuItems.filter((i) => i.isAvailable !== false).length;
    const soldout = total - available;
    const popular = menuItems.filter((i) => i.isPopular).length;
    return { total, available, soldout, popular };
  }, [menuItems]);

  const handleToggleAvailability = (item: MenuItem) => {
    const updated: MenuItem = {
      ...item,
      isAvailable: item.isAvailable === false ? true : false,
    };
    updateMenuItem(updated);
    loadMenu();
    showToast(`"${item.name}" ${updated.isAvailable ? 'satışa açıldı' : 'tükendi olarak işaretlendi'}.`);
  };

  const handleTogglePopular = (item: MenuItem) => {
    const isNowPopular = !item.isPopular;
    const currentBadges = item.badges || [];
    const updatedBadges = isNowPopular
      ? (currentBadges.includes('Popüler') ? currentBadges : [...currentBadges, 'Popüler' as BadgeType])
      : currentBadges.filter((b) => b !== 'Popüler');

    const updated: MenuItem = {
      ...item,
      isPopular: isNowPopular,
      badges: updatedBadges,
    };
    updateMenuItem(updated);
    loadMenu();
    showToast(`"${item.name}" ${isNowPopular ? 'popüler ürünlere eklendi' : 'popüler listeden çıkarıldı'}.`);
  };

  const handleSaveProduct = (product: MenuItem) => {
    const exists = menuItems.some((i) => i.id === product.id);
    if (exists) {
      updateMenuItem(product);
      showToast(`"${product.name}" başarıyla güncellendi.`);
    } else {
      addMenuItem(product);
      showToast(`Yeni ürün "${product.name}" eklendi.`);
    }
    loadMenu();
  };

  const handleDeleteProduct = (productId: string) => {
    const itemToDelete = menuItems.find((i) => i.id === productId);
    deleteMenuItem(productId);
    setShowDeleteProductConfirm(null);
    loadMenu();
    showToast(`"${itemToDelete?.name || 'Ürün'}" silindi.`);
  };

  const handleResetMenu = () => {
    resetMenuToDefaults();
    setShowResetMenuConfirm(false);
    loadMenu();
    showToast('Menü varsayılan lezzetlerine sıfırlandı.');
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium border-b border-stone-800 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Lezzet Durağı • Restoran Yönetim Paneli</span>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="Müşteri Menüsüne Dön"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <Utensils className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                    Yönetim Paneli
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                  Masa siparişlerini takip edin ve menü lezzetlerini anlık olarak güncelleyin
                </p>
              </div>
            </div>

            {/* Navigation Tabs (Siparişler & Menü Yönetimi) */}
            <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200/80 self-start sm:self-center">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Siparişler</span>
                {activeOrders > 0 && (
                  <span className="bg-amber-500 text-stone-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                    {activeOrders}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'menu'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Ürün & Menü</span>
                <span className="text-[11px] opacity-70 font-semibold">({menuItems.length})</span>
              </button>
            </div>
          </div>

          {/* Conditional Stats Section */}
          {activeTab === 'orders' ? (
            /* Orders Stats Cards */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Toplam Sipariş</div>
                <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{orders.length}</div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200/80">
                <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Aktif Sipariş</div>
                <div className="text-2xl font-extrabold text-amber-900 mt-0.5">{activeOrders}</div>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200/80">
                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Aktif Masa</div>
                <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">{uniqueTables}</div>
              </div>
              <div className="bg-sky-50 rounded-2xl p-3.5 border border-sky-200/80">
                <div className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Toplam Ciro</div>
                <div className="text-2xl font-extrabold text-sky-900 mt-0.5">₺{totalRevenue.toLocaleString('tr-TR')}</div>
              </div>
            </div>
          ) : (
            /* Menu Management Stats Cards */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Toplam Menü Ürünü</div>
                <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{menuStats.total}</div>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200/80">
                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Satışta (Mevcut)</div>
                <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">{menuStats.available}</div>
              </div>
              <div className="bg-rose-50 rounded-2xl p-3.5 border border-rose-200/80">
                <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Tükendi / Pasif</div>
                <div className="text-2xl font-extrabold text-rose-900 mt-0.5">{menuStats.soldout}</div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200/80">
                <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Öne Çıkan / Popüler</div>
                <div className="text-2xl font-extrabold text-amber-900 mt-0.5">{menuStats.popular}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORDERS SECTION                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <>
          {/* Search & Status Filters */}
          <div className="bg-white border-b border-stone-200/60 sticky top-0 z-20 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Masa numarası, sipariş kodu veya ürün ara..."
                    className="w-full pl-11 pr-10 py-3 bg-stone-100/90 focus:bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm rounded-xl border border-stone-200/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter Pills & Actions */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3.5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      filterStatus === 'all'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5" />
                      Tümü ({orders.length})
                    </span>
                  </button>

                  {STATUS_OPTIONS.map((status) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    const count = orders.filter((o) => o.status === status).length;
                    return (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                          filterStatus === status
                            ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-700/30'
                            : `${config.bg} border`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{config.label} ({count})</span>
                      </button>
                    );
                  })}

                  <div className="h-5 w-px bg-stone-200 mx-1 shrink-0" />

                  <button
                    onClick={loadOrders}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 shrink-0"
                    title="Yenile"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={orders.length === 0}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shrink-0 disabled:opacity-40"
                    title="Tüm Siparişleri Temizle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      {/* Order Header */}
                      <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-stone-900 text-sm">{order.tableNumber}</h3>
                            <p className="text-[11px] text-stone-500">
                              <span className="font-mono font-semibold text-emerald-700">#{order.orderNumber}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusConfig.bg}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="p-4 space-y-2 flex-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-stone-900">{item.quantity}x</span>{' '}
                              <span className="text-stone-700">{item.name}</span>
                              {item.selectedOption && (
                                <span className="text-emerald-700 text-[11px] block">• {item.selectedOption}</span>
                              )}
                              {item.note && (
                                <span className="text-stone-400 text-[11px] italic block">"{item.note}"</span>
                              )}
                            </div>
                            <span className="font-bold text-stone-900 whitespace-nowrap">
                              ₺{item.totalPrice.toLocaleString('tr-TR')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-stone-500">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(order.createdAt)}
                          </span>
                          <span className="font-extrabold text-stone-900 text-sm">
                            ₺{order.totalPrice.toLocaleString('tr-TR')}
                          </span>
                        </div>

                        {/* Status Change Dropdown & Delete Button */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as StoredOrder['status'])
                            }
                            className="flex-1 py-2 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          {showDeleteConfirm === order.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold active:scale-95 transition-all"
                              >
                                Evet
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-3 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold active:scale-95 transition-all"
                              >
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(order.id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 active:scale-95 transition-all"
                              title="Siparişi Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Orders State */
              <div className="py-20 px-4 text-center bg-white rounded-3xl border border-stone-200 shadow-xs">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg">
                  {orders.length === 0 ? 'Henüz sipariş yok' : 'Filtreye uygun sipariş bulunamadı'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                  {orders.length === 0
                    ? 'Müşterileriniz menüden sipariş verdikçe siparişler burada anında görüntülenecektir.'
                    : 'Farklı bir arama terimi veya filtre deneyin.'}
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs sm:text-sm hover:bg-stone-800 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MENU & PRODUCT MANAGEMENT SECTION                                 */}
      {/* ========================================================================= */}
      {activeTab === 'menu' && (
        <>
          {/* Menu Search, Category Filter & Action Bar */}
          <div className="bg-white border-b border-stone-200/60 sticky top-0 z-20 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
              {/* Row 1: Search & Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Product Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Menüde ürün, malzeme veya rozet ara... (örn: Antrikot, Cheesecake)"
                    className="w-full pl-11 pr-10 py-2.5 bg-stone-100/90 focus:bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm rounded-xl border border-stone-200/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Ürün Ekle</span>
                  </button>

                  <button
                    onClick={() => setShowResetMenuConfirm(true)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-200 transition-all active:scale-95"
                    title="Menüyü varsayılan başlangıç haline döndür"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Varsayılana Sıfırla</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Category Filter Pills & Availability Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-stone-100">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                  <button
                    onClick={() => setProductCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                      productCategoryFilter === 'all'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Tüm Kategoriler ({menuItems.length})
                  </button>

                  {CATEGORIES.map((cat) => {
                    const isActive = productCategoryFilter === cat.id;
                    const count = cat.id === 'popular'
                      ? menuItems.filter((i) => i.isPopular).length
                      : menuItems.filter((i) => i.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setProductCategoryFilter(cat.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200/60'
                        }`}
                      >
                        {cat.id === 'popular' && <Flame className="w-3 h-3 text-amber-400" />}
                        <span>{cat.name}</span>
                        <span className="text-[10px] opacity-75 font-normal">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Availability Filter Segmented Control */}
                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setProductAvailabilityFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      productAvailabilityFilter === 'all'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setProductAvailabilityFilter('available')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      productAvailabilityFilter === 'available'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Satışta
                  </button>
                  <button
                    onClick={() => setProductAvailabilityFilter('soldout')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      productAvailabilityFilter === 'soldout'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Tükendi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((item) => {
                  const isAvailable = item.isAvailable !== false;
                  const categoryName = CATEGORIES.find((c) => c.id === item.category)?.name || item.category;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                        isAvailable ? 'border-stone-200/80' : 'border-rose-200 bg-stone-50/60 opacity-90'
                      }`}
                    >
                      {/* Product Card Top: Image & Status Badges */}
                      <div>
                        <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              !isAvailable ? 'grayscale-40' : ''
                            }`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-80" />

                          {/* Category Badge top-left */}
                          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10 max-w-[75%]">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-stone-900/85 text-white backdrop-blur-md shadow-xs border border-white/20">
                              <Tag className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{categoryName}</span>
                            </span>
                          </div>

                          {/* Availability status badge top-right */}
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <button
                              onClick={() => handleToggleAvailability(item)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md transition-all active:scale-90 backdrop-blur-md border ${
                                isAvailable
                                  ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/40'
                                  : 'bg-rose-600/90 hover:bg-rose-600 text-white border-rose-400/40'
                              }`}
                              title="Durumu değiştirmek için tıklayın"
                            >
                              {isAvailable ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Satışta</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3 h-3" />
                                  <span>Tükendi</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Price & Rating Overlay bottom */}
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white z-10">
                            <span className="text-lg font-extrabold text-white drop-shadow-md">
                              ₺{item.price.toLocaleString('tr-TR')}
                            </span>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-900/80 backdrop-blur-md text-[11px] font-bold text-amber-300">
                              <Star className="w-3 h-3 fill-amber-300" />
                              <span>{item.rating || 4.9}</span>
                            </div>
                          </div>
                        </div>

                        {/* Product Info Body */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => handleTogglePopular(item)}
                              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                                item.isPopular
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-stone-100 text-stone-400 hover:text-stone-700'
                              }`}
                              title={item.isPopular ? 'Popüler ürünlerden çıkar' : 'Popüler ürünlere ekle'}
                            >
                              <Sparkles className="w-4 h-4 fill-current" />
                            </button>
                          </div>

                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {item.description || 'Açıklama bulunmuyor.'}
                          </p>

                          {/* Badges list */}
                          {item.badges && item.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.badges.map((b) => (
                                <span
                                  key={b}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Extra info: prep time & calories */}
                          <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                            {item.prepTimeMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.prepTimeMinutes} dk
                              </span>
                            )}
                            {item.calories ? (
                              <span>• {item.calories} kcal</span>
                            ) : null}
                            {item.options && item.options.length > 0 && (
                              <span className="text-emerald-700 font-semibold">• {item.options[0].name}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Actions Footer */}
                      <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all active:scale-95 shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Düzenle</span>
                        </button>

                        {showDeleteProductConfirm === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteProduct(item.id)}
                              className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold active:scale-95 transition-all"
                            >
                              Sil
                            </button>
                            <button
                              onClick={() => setShowDeleteProductConfirm(null)}
                              className="px-3 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold active:scale-95 transition-all"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteProductConfirm(item.id)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 transition-colors"
                            title="Ürünü Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Products State */
              <div className="py-20 px-4 text-center bg-white rounded-3xl border border-stone-200 shadow-xs">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg">Aradığınız kriterde ürün bulunamadı</h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                  Farklı bir arama terimi deneyebilir veya filtreleri temizleyerek tüm menüyü görüntüleyebilirsiniz.
                </p>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button
                    onClick={() => {
                      setProductSearch('');
                      setProductCategoryFilter('all');
                      setProductAvailabilityFilter('all');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs sm:text-sm hover:bg-stone-800 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsEditModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Ürün Ekle</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit/Create Product Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Clear All Orders Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Tüm Siparişleri Sil?</h3>
            <p className="text-xs text-stone-500 mt-1">
              Bu işlem geri alınamaz. Tüm masa sipariş kayıtları kalıcı olarak silinecektir.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all active:scale-95"
              >
                Tümünü Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Menu to Defaults Confirmation Modal */}
      {showResetMenuConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Menüyü Sıfırla?</h3>
            <p className="text-xs text-stone-500 mt-1">
              Yapılan tüm ürün değişiklikleri, yeni eklenen ürünler ve fiyat güncellemeleri varsayılan menü verileriyle değiştirilecektir.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setShowResetMenuConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleResetMenu}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all active:scale-95"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 px-6 text-center border-t border-stone-200/60 pt-8 pb-10 bg-white/50">
        <div className="max-w-xs mx-auto space-y-3">
          <p className="text-[11px] text-stone-500 leading-relaxed font-normal flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3 text-stone-400 shrink-0" />
            <span>Siparişler ve ürün değişiklikleri anlık olarak tarayıcı yerel belleğinde senkronize edilir.</span>
          </p>
          <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-center gap-2">
            <span>© 2026 Lezzet Durağı</span>
            <span>•</span>
            <span>Restoran & Menü Yönetim Sistemi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
