import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import {
  ContactRecord,
  SelectableCampaignOrPage,
  SmartGroup,
  CrmGroupsCollectionsConfig,
  CrmGroupsModuleProps,
} from '../types';
import { DEFAULT_VISIBLE_COLUMNS } from '../config';
import { isContactInGroup } from '../services/groupsUtils';
import {
  fetchGroupsAndContactsData,
  fetchSelectableCampaignsList,
  saveGroupOrCommunityRecord,
  deleteGroupRecord,
  deleteCommunityPageRecord,
  bulkAssignGroupToContacts,
  moveContactsBetweenGroups,
  toggleContactTag,
} from '../services/firestoreService';
import { GreenApiConfig } from '../services/whatsappService';

export interface CrmGroupsContextValue {
  db: Firestore | null;
  ownerId: string;
  loading: boolean;
  contacts: ContactRecord[];
  groups: SmartGroup[];
  communities: SmartGroup[];
  tagGroups: SmartGroup[];
  smartGroups: SmartGroup[];
  totalContacts: number;
  untaggedCount: number;
  availableCities: string[];
  campaigns: SelectableCampaignOrPage[];

  // Active filter state
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  activeGroup: SmartGroup;
  categoryFilter: 'all' | 'communities' | 'groups' | 'smart';
  setCategoryFilter: (c: 'all' | 'communities' | 'groups' | 'smart') => void;

  // Search & Filtering
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filteredContacts: ContactRecord[];

  // Selection state
  selectedContactIds: string[];
  setSelectedContactIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectContact: (id: string) => void;
  toggleSelectAll: () => void;

  // Column Selector State
  selectedColumns: string[];
  toggleColumn: (colId: string) => void;
  resetColumns: () => void;

  // Actions
  refreshData: () => Promise<void>;
  saveGroup: (groupData: Partial<SmartGroup> & { previousName?: string; createPage?: boolean }) => Promise<{ success: boolean; id: string; pageUrl?: string }>;
  deleteGroup: (group: SmartGroup) => Promise<void>;
  deleteCommunityPage: (groupId: string) => Promise<void>;
  bulkAssignToGroup: (contactIds: string[], groupName: string) => Promise<void>;
  bulkMoveBetweenGroups: (contactIds: string[], sourceGroupName: string, targetGroupName: string) => Promise<void>;
  toggleContactTag: (contactId: string, groupName: string) => Promise<void>;

  // Callbacks & Integrations
  onOpenContactDetail?: (contact: ContactRecord) => void;
  onOpenCampaignPage?: (url: string) => void;
  greenApiConfig?: GreenApiConfig;
}

const CrmGroupsContext = createContext<CrmGroupsContextValue | null>(null);

export const CrmGroupsProvider: React.FC<React.PropsWithChildren<CrmGroupsModuleProps>> = ({
  children,
  firebaseApp,
  customCollections,
  ownerId = 'default_user',
  onOpenContactDetail,
  onOpenCampaignPage,
  greenApiCredentials,
}) => {
  const db = useMemo(() => (firebaseApp ? getFirestore(firebaseApp) : null), [firebaseApp]);

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [groups, setGroups] = useState<SmartGroup[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [untaggedCount, setUntaggedCount] = useState(0);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<SelectableCampaignOrPage[]>([]);

  // Navigation & Filter States
  const [activeGroupId, setActiveGroupId] = useState<string>('__all__');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'communities' | 'groups' | 'smart'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Column Picker state with localStorage persistence
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_groups_columns');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_VISIBLE_COLUMNS;
  });

  const toggleColumn = (colId: string) => {
    setSelectedColumns((prev) => {
      let next: string[];
      if (prev.includes(colId)) {
        if (prev.length <= 1) return prev;
        next = prev.filter((c) => c !== colId);
      } else {
        next = [...prev, colId];
      }
      try {
        localStorage.setItem('crm_groups_columns', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const resetColumns = () => {
    setSelectedColumns(DEFAULT_VISIBLE_COLUMNS);
    try {
      localStorage.setItem('crm_groups_columns', JSON.stringify(DEFAULT_VISIBLE_COLUMNS));
    } catch (e) {}
  };

  // Load Data
  const loadData = useCallback(async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [res, campList] = await Promise.all([
        fetchGroupsAndContactsData(db, ownerId, customCollections),
        fetchSelectableCampaignsList(db, ownerId, customCollections),
      ]);

      setContacts(res.contacts);
      setGroups(res.groups);
      setTotalContacts(res.totalContacts);
      setUntaggedCount(res.untaggedCount);
      setAvailableCities(res.availableCities);
      setCampaigns(campList);
    } catch (err: any) {
      console.error('Failed to load groups data:', err);
    } finally {
      setLoading(false);
    }
  }, [db, ownerId, customCollections]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived group lists
  const communities = useMemo(() => groups.filter((g) => Boolean(g.isCommunity || g.pageSlug || g.pageUrl || g.pageId)), [groups]);
  const tagGroups = useMemo(() => groups.filter((g) => !g.isCommunity && g.type !== 'smart' && !g.pageSlug && !g.pageUrl), [groups]);
  const smartGroups = useMemo(() => groups.filter((g) => g.type === 'smart'), [groups]);

  // Active Group Definition
  const activeGroup = useMemo<SmartGroup>(() => {
    if (activeGroupId === '__all__') {
      return {
        id: '__all__',
        name: 'כל אנשי הקשר',
        type: 'manual',
        count: totalContacts,
        color: '#4f46e5',
        description: 'רשימת כל אנשי הקשר הרשומים במערכת',
        isCommunity: false,
      };
    }
    if (activeGroupId === '__untagged__') {
      return {
        id: '__untagged__',
        name: 'ללא שיוך לקבוצה או קהילה',
        type: 'manual',
        count: untaggedCount,
        color: '#e11d48',
        description: 'אנשי קשר שאינם משויכים לאף קבוצה, קהילה או תגית',
        isCommunity: false,
      };
    }
    const found = groups.find((g) => g.id === activeGroupId || g.name === activeGroupId);
    if (found) return found;

    return {
      id: activeGroupId,
      name: activeGroupId,
      type: 'manual',
      count: 0,
      color: '#64748b',
      description: '',
      isCommunity: false,
    };
  }, [activeGroupId, groups, totalContacts, untaggedCount]);

  // Filtered contacts based on active group & search query
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // 1. Group membership
      if (activeGroupId === '__untagged__') {
        const inAny = groups.some((g) => isContactInGroup(c, g));
        if (inAny) return false;
      } else if (activeGroupId !== '__all__') {
        if (!isContactInGroup(c, activeGroup)) return false;
      }

      // 2. Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const name = (c.conta_name || '').toLowerCase();
        const phone = (c.conta_phone || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const city = (c.mh_crm_city || '').toLowerCase();
        const company = (c.company_name || '').toLowerCase();
        const tags = (c.tags || []).join(' ').toLowerCase();

        if (
          !name.includes(q) &&
          !phone.includes(q) &&
          !email.includes(q) &&
          !city.includes(q) &&
          !company.includes(q) &&
          !tags.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [contacts, activeGroupId, activeGroup, groups, searchTerm]);

  // Selection handlers
  const toggleSelectContact = (id: string) => {
    setSelectedContactIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    }
  };

  // Actions
  const saveGroup = async (groupData: Partial<SmartGroup> & { previousName?: string; createPage?: boolean }) => {
    if (!db) throw new Error('Database not initialized');
    const res = await saveGroupOrCommunityRecord(db, ownerId, groupData, customCollections);
    await loadData();
    return res;
  };

  const deleteGroup = async (group: SmartGroup) => {
    if (!db) return;
    await deleteGroupRecord(db, group, customCollections);
    if (activeGroupId === group.id || activeGroupId === group.name) {
      setActiveGroupId('__all__');
    }
    await loadData();
  };

  const deleteCommunityPage = async (groupId: string) => {
    if (!db) return;
    await deleteCommunityPageRecord(db, groupId, customCollections);
    await loadData();
  };

  const bulkAssignToGroup = async (contactIds: string[], groupName: string) => {
    if (!db) return;
    await bulkAssignGroupToContacts(db, contactIds, groupName, customCollections);
    setSelectedContactIds([]);
    await loadData();
  };

  const bulkMoveBetweenGroups = async (contactIds: string[], sourceGroupName: string, targetGroupName: string) => {
    if (!db) return;
    await moveContactsBetweenGroups(db, contactIds, sourceGroupName, targetGroupName, customCollections);
    setSelectedContactIds([]);
    await loadData();
  };

  const toggleSingleTag = async (contactId: string, groupName: string) => {
    if (!db) return;
    await toggleContactTag(db, contactId, groupName, customCollections);
    await loadData();
  };

  const value: CrmGroupsContextValue = {
    db,
    ownerId,
    loading,
    contacts,
    groups,
    communities,
    tagGroups,
    smartGroups,
    totalContacts,
    untaggedCount,
    availableCities,
    campaigns,
    activeGroupId,
    setActiveGroupId,
    activeGroup,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    filteredContacts,
    selectedContactIds,
    setSelectedContactIds,
    toggleSelectContact,
    toggleSelectAll,
    selectedColumns,
    toggleColumn,
    resetColumns,
    refreshData: loadData,
    saveGroup,
    deleteGroup,
    deleteCommunityPage,
    bulkAssignToGroup,
    bulkMoveBetweenGroups,
    toggleContactTag: toggleSingleTag,
    onOpenContactDetail,
    onOpenCampaignPage,
    greenApiConfig: greenApiCredentials,
  };

  return <CrmGroupsContext.Provider value={value}>{children}</CrmGroupsContext.Provider>;
};

export function useCrmGroups(): CrmGroupsContextValue {
  const context = useContext(CrmGroupsContext);
  if (!context) {
    throw new Error('useCrmGroups must be used within a CrmGroupsProvider');
  }
  return context;
}
