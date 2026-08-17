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

export function getCategoryRank(rawName: string): number {
  const name = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (name.includes('starter')) return 1;
  if (name.includes('burger')) return 2;
  if (name.includes('frie') || name.includes('fry')) return 3;
  if (name.includes('wrap')) return 4;
  if (name.includes('sizzler')) return 5;
  if (name.includes('beverage') || name.includes('mocktail')) return 6;

  // Check Non-Veg before Veg!
  if (name.includes('nonveg') && name.includes('pizza')) return 8;
  if (name.includes('vegpizza') || (name.includes('veg') && name.includes('pizza'))) return 7;
  if (name.includes('pizza')) return 8;

  if (name.includes('nonveg') && (name.includes('sandwich') || name.includes('club'))) return 10;
  if (name.includes('vegsandwich') || name.includes('vegclub') || (name.includes('veg') && (name.includes('sandwich') || name.includes('club')))) return 9;
  if (name.includes('sandwich') || name.includes('club')) return 10;

  if (name.includes('combo')) return 11;
  if (name.includes('addon') || name.includes('add')) return 12;
  if (name.includes('colddrink') || name.includes('drink')) return 13;

  return 999;
}

export function sortCategories<T extends { name: string }>(categories: T[]): T[] {
  if (!categories) return [];
  return [...categories].sort((a, b) => getCategoryRank(a.name) - getCategoryRank(b.name));
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
