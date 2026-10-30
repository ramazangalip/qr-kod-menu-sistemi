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
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<StoredOrder['status'] | 'all'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Load orders from localStorage
  const loadOrders = () => {
    setOrders(getOrders());
  };

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTable = order.tableNumber.toLowerCase().includes(query);
        const matchesOrder = order.orderNumber.toLowerCase().includes(query);
        const matchesItems = order.items.some((item) =>
          item.name.toLowerCase().includes(query)
        );
        if (!matchesTable && !matchesOrder && !matchesItems) return false;
      }

      // Status filter
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;

      return true;
    });
  }, [orders, searchTerm, filterStatus]);

  // Unique table numbers for stats
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

  const handleDelete = (orderId: string) => {
    deleteOrder(orderId);
    setShowDeleteConfirm(null);
    loadOrders();
  };

  const handleClearAll = () => {
    clearAllOrders();
    setShowClearConfirm(false);
    loadOrders();
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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium border-b border-stone-800 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Lezzet Durağı • Sipariş Yönetim Paneli</span>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <Receipt className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                    Sipariş Paneli
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                  Tüm masalardan gelen siparişleri buradan takip edin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadOrders}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-semibold text-xs sm:text-sm border border-stone-200 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-stone-600" />
                <span>Yenile</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={orders.length === 0}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm border border-rose-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tümünü Sil</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
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
        </div>
      </div>

      {/* Search & Filters */}
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

            {/* Status Filter Pills */}
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
                    {/* Time & Total */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-stone-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(order.createdAt)}
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        ₺{order.totalPrice.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    {/* Status Change Buttons */}
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
                            onClick={() => handleDelete(order.id)}
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
          /* Empty State */
          <div className="py-20 px-4 text-center bg-white rounded-3xl border border-stone-200 shadow-xs">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-stone-900 text-lg">
              {orders.length === 0 ? 'Henüz sipariş yok' : 'Filtreye uygun sipariş bulunamadı'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              {orders.length === 0
                ? 'Müşterileriniz menüden sipariş verdikçe siparişler burada otomatik olarak görüntülenecektir.'
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

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Tüm Siparişleri Sil?</h3>
            <p className="text-xs text-stone-500 mt-1">
              Bu işlem geri alınamaz. Tüm sipariş kayıtları kalıcı olarak silinecektir.
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

      {/* Footer */}
      <footer className="mt-12 mb-8 px-6 text-center border-t border-stone-200/60 pt-8 pb-10 bg-white/50">
        <div className="max-w-xs mx-auto space-y-3">
          <p className="text-[11px] text-stone-500 leading-relaxed font-normal flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3 text-stone-400 shrink-0" />
            <span>Siparişler her 5 saniyede otomatik olarak yenilenir.</span>
          </p>
          <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-center gap-2">
            <span>© 2026 Lezzet Durağı</span>
            <span>•</span>
            <span>Sipariş Yönetim Paneli</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
