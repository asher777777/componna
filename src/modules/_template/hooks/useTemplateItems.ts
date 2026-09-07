import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTemplateModule } from '../context/ModuleContext';
import { TemplateFirestoreService } from '../services/firestoreService';
import { TemplateItem } from '../types';

export function useTemplateItems() {
  const { db, collections } = useTemplateModule();
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => {
    if (!db) return null;
    return new TemplateFirestoreService(db, collections.items);
  }, [db, collections.items]);

  const fetchItems = useCallback(async () => {
    if (!service) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await service.getItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: Omit<TemplateItem, 'id' | 'createdAt'>) => {
    if (!service) throw new Error('Firestore not connected');
    const id = await service.createItem(item);
    await fetchItems();
    return id;
  };

  const updateItem = async (id: string, updates: Partial<TemplateItem>) => {
    if (!service) throw new Error('Firestore not connected');
    await service.updateItem(id, updates);
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!service) throw new Error('Firestore not connected');
    await service.deleteItem(id);
    await fetchItems();
  };

  return { items, loading, error, refresh: fetchItems, addItem, updateItem, deleteItem };
}
