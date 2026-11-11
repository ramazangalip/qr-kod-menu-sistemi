import { MenuItem } from '@/types/menu';
import { MENU_ITEMS } from '@/data/menu';

const MENU_STORAGE_KEY = 'lezzet-duragi-menu-items';

export function getMenuItems(): MenuItem[] {
  if (typeof window === 'undefined') {
    return MENU_ITEMS;
  }

  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) {
      // Initialize with default items from menu.ts
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(MENU_ITEMS));
      return MENU_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return MENU_ITEMS;
  } catch (error) {
    console.error('Menü verileri yerel depolamadan okunurken hata oluştu:', error);
    return MENU_ITEMS;
  }
}

export function saveMenuItems(items: MenuItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('menu-items-updated'));
  } catch (error) {
    console.error('Menü verileri yerel depolamaya kaydedilirken hata oluştu:', error);
  }
}

export function updateMenuItem(updatedItem: MenuItem): void {
  const currentItems = getMenuItems();
  const index = currentItems.findIndex((item) => item.id === updatedItem.id);

  if (index !== -1) {
    currentItems[index] = updatedItem;
    saveMenuItems(currentItems);
  }
}

export function addMenuItem(newItem: MenuItem): void {
  const currentItems = getMenuItems();
  currentItems.unshift(newItem);
  saveMenuItems(currentItems);
}

export function deleteMenuItem(itemId: string): void {
  const currentItems = getMenuItems();
  const filtered = currentItems.filter((item) => item.id !== itemId);
  saveMenuItems(filtered);
}

export function resetMenuToDefaults(): MenuItem[] {
  if (typeof window === 'undefined') return MENU_ITEMS;

  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(MENU_ITEMS));
    window.dispatchEvent(new Event('menu-items-updated'));
    return MENU_ITEMS;
  } catch (error) {
    console.error('Menü varsayılana döndürülürken hata oluştu:', error);
    return MENU_ITEMS;
  }
}
