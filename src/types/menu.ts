export type AllergenType = 'Gluten' | 'Laktoz' | 'Fındık/Fıstık' | 'Yumurta' | 'Deniz Ürünü' | 'Susam' | 'Soya';

export type BadgeType = 'Şefin Önerisi' | 'Organik' | 'Acılı' | 'Vejetaryen' | 'Glutensiz' | 'Popüler' | 'Yeni';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  badges?: BadgeType[];
  allergens?: AllergenType[];
  prepTimeMinutes?: number;
  calories?: number;
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  isAvailable?: boolean;
  options?: {
    name: string;
    choices: { label: string; priceDelta: number }[];
  }[];
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description?: string;
}

export interface BasketItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOption?: string;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

export interface TableInfo {
  tableNumber: string;
  section: string;
  restaurantName: string;
  wifiSSID: string;
  wifiPass: string;
}
