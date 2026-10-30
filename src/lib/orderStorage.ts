import { BasketItem } from '@/types/menu';

export interface StoredOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedOption?: string;
    note?: string;
  }[];
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  status: 'Hazırlanıyor' | 'Hazır' | 'Teslim Edildi';
}

const STORAGE_KEY = 'lezzet-duragi-orders';

export function getOrders(): StoredOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveOrder(
  tableNumber: string,
  orderNumber: string,
  basketItems: BasketItem[]
): StoredOrder {
  const order: StoredOrder = {
    id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderNumber,
    tableNumber: `Masa ${tableNumber}`,
    items: basketItems.map((item) => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      selectedOption: item.selectedOption,
      note: item.note,
    })),
    totalPrice: basketItems.reduce((acc, item) => acc + item.totalPrice, 0),
    totalItems: basketItems.reduce((acc, item) => acc + item.quantity, 0),
    createdAt: new Date().toISOString(),
    status: 'Hazırlanıyor',
  };

  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  return order;
}

export function updateOrderStatus(orderId: string, status: StoredOrder['status']): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

export function deleteOrder(orderId: string): void {
  const orders = getOrders().filter((o) => o.id !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function clearAllOrders(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
