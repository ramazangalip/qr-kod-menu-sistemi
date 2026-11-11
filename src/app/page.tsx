'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MobileFrame } from '@/components/MobileFrame';
import { MenuHeader } from '@/components/MenuHeader';
import { CategoryNav } from '@/components/CategoryNav';
import { SearchBar } from '@/components/SearchBar';
import { MenuItemCard } from '@/components/MenuItemCard';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { AdisyonDrawer } from '@/components/AdisyonDrawer';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { CallWaiterToast } from '@/components/CallWaiterToast';
import { CallWaiterModal } from '@/components/CallWaiterModal';
import { TableSelectModal } from '@/components/TableSelectModal';
import { WifiModal } from '@/components/WifiModal';
import { FooterBranding } from '@/components/FooterBranding';

import { TABLE_INFO, CATEGORIES, MENU_ITEMS } from '@/data/menu';
import { MenuItem, BasketItem, BadgeType } from '@/types/menu';
import { saveOrder } from '@/lib/orderStorage';
import { getMenuItems } from '@/lib/menuStorage';
import { UtensilsCrossed } from 'lucide-react';

export default function QRMenuPage() {
  // Menu items state synced with local storage
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);

  useEffect(() => {
    setMenuItems(getMenuItems());

    const handleUpdate = () => {
      setMenuItems(getMenuItems());
    };

    window.addEventListener('menu-items-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('menu-items-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Table Selection State
  const [isTableSelectOpen, setIsTableSelectOpen] = useState<boolean>(true);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('');

  // State
  const [activeCategoryId, setActiveCategoryId] = useState<string>('popular');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // Basket State
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);

  // Modals & Toasts
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isWifiOpen, setIsWifiOpen] = useState<boolean>(false);
  const [isCallWaiterToast, setIsCallWaiterToast] = useState<boolean>(false);
  const [isCallWaiterModalOpen, setIsCallWaiterModalOpen] = useState<boolean>(false);
  const [callWaiterTableNumber, setCallWaiterTableNumber] = useState<string>('');
  const [isOrderSuccessModal, setIsOrderSuccessModal] = useState<boolean>(false);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');

  // Computed dynamic table info
  const dynamicTableInfo = useMemo(() => ({
    ...TABLE_INFO,
    tableNumber: selectedTableNumber ? `Masa ${selectedTableNumber}` : TABLE_INFO.tableNumber,
  }), [selectedTableNumber]);

  // Handle table selection
  const handleTableSelect = useCallback((tableNum: string) => {
    setSelectedTableNumber(tableNum);
    setIsTableSelectOpen(false);
  }, []);

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Search term match
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // 2. Badge match
      if (selectedBadge !== null) {
        if (!item.badges?.includes(selectedBadge)) return false;
      }

      // 3. Category match (if search & badge are empty)
      if (!searchTerm && !selectedBadge) {
        if (activeCategoryId === 'popular') {
          return item.isPopular;
        }
        return item.category === activeCategoryId;
      }

      return true;
    });
  }, [menuItems, searchTerm, selectedBadge, activeCategoryId]);

  // Quick Add Item
  const handleQuickAdd = (item: MenuItem) => {
    setBasketItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id && !i.selectedOption);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                totalPrice: (i.quantity + 1) * i.unitPrice,
              }
            : i
        );
      } else {
        const newItem: BasketItem = {
          id: `${item.id}-${Date.now()}`,
          menuItem: item,
          quantity: 1,
          unitPrice: item.price,
          totalPrice: item.price,
        };
        return [...prev, newItem];
      }
    });
  };

  // Quick Remove Item
  const handleQuickRemove = (item: MenuItem) => {
    setBasketItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id && !i.selectedOption);
      if (!existing) return prev;

      if (existing.quantity > 1) {
        return prev.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: i.quantity - 1,
                totalPrice: (i.quantity - 1) * i.unitPrice,
              }
            : i
        );
      } else {
        return prev.filter((i) => i.id !== existing.id);
      }
    });
  };

  // Detailed Add Item from Modal
  const handleAddFromModal = (
    item: MenuItem,
    quantity: number,
    selectedOption?: string,
    note?: string
  ) => {
    const selectedChoice = item.options?.[0]?.choices.find((c) => c.label === selectedOption);
    const priceDelta = selectedChoice ? selectedChoice.priceDelta : 0;
    const unitPrice = item.price + priceDelta;

    const newItem: BasketItem = {
      id: `${item.id}-${selectedOption || 'def'}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedOption,
      unitPrice,
      totalPrice: unitPrice * quantity,
      note,
    };

    setBasketItems((prev) => [...prev, newItem]);
  };

  // Basket Quantity Update
  const handleUpdateQuantity = (instanceId: string, delta: number) => {
    setBasketItems((prev) =>
      prev
        .map((i) => {
          if (i.id === instanceId) {
            const newQty = i.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...i,
              quantity: newQty,
              totalPrice: newQty * i.unitPrice,
            };
          }
          return i;
        })
        .filter(Boolean) as BasketItem[]
    );
  };

  // Submit Order - saves to localStorage
  const handleSubmitOrder = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNum = `LZT-${randomCode}`;

    // Save order to local storage with table number
    saveOrder(selectedTableNumber, orderNum, basketItems);

    setLastOrderNumber(orderNum);
    setIsOrderSuccessModal(true);
    setBasketItems([]);
  };

  // Handle Call Waiter with table number
  const handleCallWaiter = (tableNum: string) => {
    setCallWaiterTableNumber(tableNum);
    setIsCallWaiterToast(true);
  };

  // Get current category label for title
  const currentCategory = CATEGORIES.find((c) => c.id === activeCategoryId);

  return (
    <MobileFrame>
      {/* 0. Table Selection Modal (appears first) */}
      <TableSelectModal
        isOpen={isTableSelectOpen}
        onSelectTable={handleTableSelect}
      />

      {/* 1. Restaurant Full Header */}
      <MenuHeader
        tableInfo={dynamicTableInfo}
        onCallWaiter={() => setIsCallWaiterModalOpen(true)}
        onOpenWifi={() => setIsWifiOpen(true)}
      />

      {/* 2. Realtime Search Bar & Filter Pills */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedBadge={selectedBadge}
        onBadgeToggle={setSelectedBadge}
        totalResultsCount={filteredItems.length}
      />

      {/* 3. Horizontal Pill Categories (Only when not searching) */}
      {!searchTerm && !selectedBadge && (
        <CategoryNav
          categories={CATEGORIES}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
        />
      )}

      {/* 4. Main Menu Items Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Title Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              {searchTerm || selectedBadge
                ? 'Arama Sonuçları'
                : currentCategory?.name || 'Menü Lezzetleri'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-normal mt-1">
              {searchTerm || selectedBadge
                ? `Arama ve filtre kriterlerinize uygun lezzetler listeleniyor`
                : currentCategory?.description || 'Taze ve kaliteli malzemelerle şeflerimiz tarafından hazırlanır'}
            </p>
          </div>
        </div>

        {/* Menu Items Grid: 1 col on mobile, 2 on sm, 3 on lg, 4 on xl */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const quantityInBasket = basketItems
                .filter((bi) => bi.menuItem.id === item.id)
                .reduce((acc, bi) => acc + bi.quantity, 0);

              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantityInBasket={quantityInBasket}
                  onOpenDetail={setSelectedDetailItem}
                  onQuickAdd={handleQuickAdd}
                  onQuickRemove={handleQuickRemove}
                />
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-16 px-4 text-center bg-white rounded-3xl border border-stone-200 shadow-xs my-6">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Aradığınız lezzet bulunamadı</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              Farklı bir arama terimi deneyebilir veya kategorilerden diğer gurme lezzetlerimizi inceleyebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBadge(null);
                setActiveCategoryId('popular');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs sm:text-sm hover:bg-stone-800 transition-colors"
            >
              Tüm Menüyü Göster
            </button>
          </div>
        )}
      </main>

      {/* 5. Agency Branding Footer */}
      <FooterBranding />

      {/* 6. Item Detail Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onAddToBasket={handleAddFromModal}
      />

      {/* 7. Adisyon Summary & Drawer */}
      <AdisyonDrawer
        basketItems={basketItems}
        tableInfo={dynamicTableInfo}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => handleUpdateQuantity(id, -100)}
        onClearBasket={() => setBasketItems([])}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* 8. Order Success Modal */}
      <OrderSuccessModal
        isOpen={isOrderSuccessModal}
        onClose={() => setIsOrderSuccessModal(false)}
        orderNumber={lastOrderNumber}
        tableNumber={dynamicTableInfo.tableNumber}
      />

      {/* 9. Call Waiter Modal (with table number input) */}
      <CallWaiterModal
        isOpen={isCallWaiterModalOpen}
        onClose={() => setIsCallWaiterModalOpen(false)}
        currentTableNumber={selectedTableNumber}
        onCallWaiter={handleCallWaiter}
      />

      {/* 10. Call Waiter Toast (confirmation) */}
      <CallWaiterToast
        isVisible={isCallWaiterToast}
        onClose={() => setIsCallWaiterToast(false)}
        tableNumber={callWaiterTableNumber ? `Masa ${callWaiterTableNumber}` : dynamicTableInfo.tableNumber}
      />

      {/* 11. Wi-Fi Modal */}
      <WifiModal
        isOpen={isWifiOpen}
        onClose={() => setIsWifiOpen(false)}
        tableInfo={dynamicTableInfo}
      />
    </MobileFrame>
  );
}
