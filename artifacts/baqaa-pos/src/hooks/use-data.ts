import { useState, useEffect, useCallback } from 'react';
import { StorageAPI, type ShopInfo, type Category, type MenuItem, type Order, type Customer } from '@/lib/storage';

function useStorageData<T>(getter: () => T) {
  const [data, setData] = useState<T>(getter());

  useEffect(() => {
    const handleUpdate = () => setData(getter());
    window.addEventListener('baqaa_storage_update', handleUpdate);
    return () => window.removeEventListener('baqaa_storage_update', handleUpdate);
  }, [getter]);

  return data;
}

export function useShopInfo() {
  const info = useStorageData(StorageAPI.getShopInfo);
  return { 
    data: info, 
    update: StorageAPI.setShopInfo 
  };
}

export const CATEGORY_ORDER_KEYS = [
  "starter",
  "burger",
  "fries",
  "wrap",
  "sizzler",
  "mocktail",
  "beverage",
  "veg pizza",
  "non-veg pizza",
  "non veg pizza",
  "veg club",
  "veg sandwich",
  "non-veg club",
  "non veg club",
  "non-veg sandwich",
  "non veg sandwich",
  "combo",
  "add-on",
  "add on",
  "cold drink"
];

export function sortCategories<T extends { name: string }>(categories: T[]): T[] {
  if (!categories) return [];
  return [...categories].sort((a, b) => {
    const nameA = a.name.toLowerCase().trim();
    const nameB = b.name.toLowerCase().trim();

    const getIndex = (name: string) => {
      const idx = CATEGORY_ORDER_KEYS.findIndex(key => name.includes(key));
      return idx === -1 ? 999 : idx;
    };

    return getIndex(nameA) - getIndex(nameB);
  });
}

export function useCategories() {
  const rawCategories = useStorageData(StorageAPI.getCategories);
  const categories = sortCategories(rawCategories);
  const addCategory = useCallback((name: string) => {
    const cats = StorageAPI.getCategories();
    cats.push({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() });
    StorageAPI.setCategories(cats);
  }, []);
  const deleteCategory = useCallback((id: string) => {
    const cats = StorageAPI.getCategories().filter(c => c.id !== id);
    StorageAPI.setCategories(cats);
  }, []);
  return { data: categories, addCategory, deleteCategory };
}

export function useMenuItems() {
  const items = useStorageData(StorageAPI.getMenuItems);
  const addItem = useCallback((item: Omit<MenuItem, 'id' | 'createdAt'>) => {
    const current = StorageAPI.getMenuItems();
    current.push({ ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    StorageAPI.setMenuItems(current);
  }, []);
  const updateItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    const current = StorageAPI.getMenuItems().map(i => i.id === id ? { ...i, ...updates } : i);
    StorageAPI.setMenuItems(current);
  }, []);
  const deleteItem = useCallback((id: string) => {
    const current = StorageAPI.getMenuItems().filter(i => i.id !== id);
    StorageAPI.setMenuItems(current);
  }, []);
  return { data: items, addItem, updateItem, deleteItem };
}

export function useOrders() {
  const orders = useStorageData(StorageAPI.getOrders);
  return { 
    data: orders, 
    createOrder: StorageAPI.addOrder, 
    updateOrder: StorageAPI.updateOrder,
    deleteOrder: StorageAPI.deleteOrder,
    resetData: StorageAPI.resetData 
  };
}

export function useCustomers() {
  const customers = useStorageData(StorageAPI.getCustomers);
  return { data: customers };
}

export function useSecuritySettings() {
  const settings = useStorageData(StorageAPI.getSecuritySettings);
  return { 
    data: settings, 
    update: StorageAPI.setSecuritySettings 
  };
}
