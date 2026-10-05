import { useState, useEffect, useMemo } from 'react';
import { useKesherPaymentsContext } from '../context/KesherPaymentsContext';
import { GlossaryItem } from '../types';

export const useReceiptGlossary = () => {
  const { glossaryItems, saveGlossaryItem, deleteGlossaryItem } = useKesherPaymentsContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return glossaryItems;
    const term = searchTerm.trim().toLowerCase();
    return glossaryItems.filter(
      item =>
        item.name.toLowerCase().includes(term) ||
        (item.category && item.category.toLowerCase().includes(term))
    );
  }, [glossaryItems, searchTerm]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    glossaryItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [glossaryItems]);

  return {
    items: filteredItems,
    allItems: glossaryItems,
    categories,
    searchTerm,
    setSearchTerm,
    saveItem: saveGlossaryItem,
    deleteItem: deleteGlossaryItem,
  };
};
