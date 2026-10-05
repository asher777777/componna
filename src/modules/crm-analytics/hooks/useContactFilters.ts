import { useState, useMemo } from 'react';
import { Contact, DynamicColumn } from '../types';

export interface UseContactFiltersOptions {
  contacts: Contact[];
  initialPageSize?: number;
}

export function useContactFilters({
  contacts,
  initialPageSize = 20,
}: UseContactFiltersOptions) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableTypeFilter, setTableTypeFilter] = useState<'all' | 'contacts' | 'leads'>('all');
  const [sortField, setSortField] = useState<string>('total_spent');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Counts for pill filters
  const totalLeadsCount = useMemo(
    () => contacts.filter(c => c.is_lead || c.contact_type === 'lead').length,
    [contacts]
  );
  
  const totalContactsCount = useMemo(
    () => contacts.filter(c => !c.is_lead && c.contact_type !== 'lead').length,
    [contacts]
  );

  // Filter contacts by search and table type filter
  const filtered = useMemo(() => {
    let list = contacts;
    if (tableTypeFilter === 'contacts') {
      list = list.filter(c => !c.is_lead && c.contact_type !== 'lead');
    } else if (tableTypeFilter === 'leads') {
      list = list.filter(c => c.is_lead || c.contact_type === 'lead');
    }

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(c => 
      (c.conta_name || '').toLowerCase().includes(term) ||
      (c.conta_phone || '').includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.company_name || '').toLowerCase().includes(term) ||
      (c.mh_crm_city || '').toLowerCase().includes(term) ||
      (c.community || '').toLowerCase().includes(term) ||
      (c.lead_source || '').toLowerCase().includes(term) ||
      (c.tags || []).some(t => t.toLowerCase().includes(term))
    );
  }, [contacts, searchTerm, tableTypeFilter]);

  // Sort list
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = (a as any)[sortField];
      let valB = (b as any)[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB), 'he')
        : String(valB).localeCompare(String(valA), 'he');
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (colId: string) => {
    if (sortField === colId) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(colId);
      setSortAsc(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    tableTypeFilter,
    setTableTypeFilter,
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalLeadsCount,
    totalContactsCount,
    filtered,
    sorted,
    paginated,
    totalPages,
    handleSort,
  };
}
