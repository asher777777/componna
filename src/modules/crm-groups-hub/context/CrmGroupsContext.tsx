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
import { useTenantScope } from '../../../core/tenant';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts';
import {
  fetchGroupsAndContactsData,
  fetchSelectableCampaignsList,
  saveGroupOrCommunityRecord,
  deleteGroupRecord,
  deleteCommunityPageRecord,
  bulkAssignGroupToContacts,
  bulkDeleteContactsRecord,
  moveContactsBetweenGroups,
  toggleContactTag,
  addCommunityInteractionRecord,
  MOCK_COMMUNITIES,
  MOCK_CONTACTS,
} from '../services/firestoreService';
import { GreenApiConfig } from '../services/whatsappService';
import { eventBus } from '../../../core/bridge/EventBus';
import type { LeadPayload } from '../../../core/contracts';

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
  bulkDeleteContacts: (contactIds: string[]) => Promise<void>;
  bulkMoveBetweenGroups: (contactIds: string[], sourceGroupName: string, targetGroupName: string) => Promise<void>;
  toggleContactTag: (contactId: string, groupName: string) => Promise<void>;
  recordInteraction: (interaction: {
    contactId: string;
    contactName?: string;
    contactPhone?: string;
    type: 'whatsapp' | 'call' | 'donation' | 'note' | 'system' | 'email';
    title?: string;
    content: string;
    groupName?: string;
    metadata?: Record<string, any>;
  }) => Promise<string>;

  // Callbacks & Integrations
  onOpenContactDetail?: (contact: ContactRecord) => void;
  onOpenCampaignPage?: (url: string) => void;
  greenApiConfig?: GreenApiConfig;
  customCollections?: CrmGroupsCollectionsConfig;
}

const CrmGroupsContext = createContext<CrmGroupsContextValue | null>(null);

export const CrmGroupsProvider: React.FC<React.PropsWithChildren<CrmGroupsModuleProps>> = ({
  children,
  firebaseApp,
  customCollections,
  ownerId = '',
  onOpenContactDetail,
  onOpenCampaignPage,
  greenApiCredentials,
}) => {
  const db = useMemo(() => (firebaseApp ? getFirestore(firebaseApp) : null), [firebaseApp]);
  const { tenantId, getScopedCollectionPath } = useTenantScope();

  const resolvedCustomCollections: CrmGroupsCollectionsConfig = useMemo(() => ({
    groups: customCollections?.groups || getScopedCollectionPath(SYSTEM_COLLECTIONS.GROUPS),
    contacts: customCollections?.contacts || getScopedCollectionPath(SYSTEM_COLLECTIONS.CONTACTS),
    pages: customCollections?.pages || getScopedCollectionPath(SYSTEM_COLLECTIONS.PAGES),
    campaigns: customCollections?.campaigns || getScopedCollectionPath('campaigns'),
    interactions: customCollections?.interactions || getScopedCollectionPath(SYSTEM_COLLECTIONS.INTERACTIONS),
    chatMessages: customCollections?.chatMessages || getScopedCollectionPath(SYSTEM_COLLECTIONS.CHAT_MESSAGES),
    videoRooms: customCollections?.videoRooms || getScopedCollectionPath('crm_community_video_rooms'),
  }), [customCollections, getScopedCollectionPath]);

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
        const saved = localStorage.getItem(`comona_${tenantId}_crm_groups_columns`);
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
        localStorage.setItem(`comona_${tenantId}_crm_groups_columns`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const resetColumns = () => {
    setSelectedColumns(DEFAULT_VISIBLE_COLUMNS);
    try {
      localStorage.setItem(`comona_${tenantId}_crm_groups_columns`, JSON.stringify(DEFAULT_VISIBLE_COLUMNS));
    } catch (e) {}
  };

  // Load Data
  const loadData = useCallback(async () => {
    if (!db) {
      // Mock Fallback when Firestore is null / offline
      const mockGroupsWithCounts = MOCK_COMMUNITIES.map((g) => {
        const count = MOCK_CONTACTS.filter((c) => isContactInGroup(c, g)).length;
        return { ...g, count };
      });
      const mockUntagged = MOCK_CONTACTS.filter((c) => !mockGroupsWithCounts.some((g) => isContactInGroup(c, g))).length;
      const mockCities = Array.from(new Set(MOCK_CONTACTS.map((c) => c.mh_crm_city).filter(Boolean) as string[])).sort();

      setContacts(MOCK_CONTACTS);
      setGroups(mockGroupsWithCounts);
      setTotalContacts(MOCK_CONTACTS.length);
      setUntaggedCount(mockUntagged);
      setAvailableCities(mockCities);
      setCampaigns([
        { id: 'camp_1', title: '🎯 קמפיין שגרירים שנתי', category: 'קמפיינים', type: 'campaign', url: '/c/camp_1', target: 100000, currentAmount: 72000 },
        { id: 'camp_2', title: '🎯 חלוקת חורף למשפחות', category: 'קמפיינים', type: 'campaign', url: '/c/camp_2', target: 50000, currentAmount: 38000 },
      ]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [res, campList] = await Promise.all([
        fetchGroupsAndContactsData(db, ownerId, resolvedCustomCollections),
        fetchSelectableCampaignsList(db, ownerId, resolvedCustomCollections),
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
  }, [db, ownerId, resolvedCustomCollections]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // EventBus Subscriptions: Listen to crm:lead:created and smart_form:submitted
  useEffect(() => {
    const unsubLead = eventBus.subscribe('crm:lead:created', (payload: LeadPayload) => {
      if (!payload || !payload.conta_phone) return;
      setContacts((prev) => {
        const existingIdx = prev.findIndex((c) => c.conta_phone === payload.conta_phone);
        const tags = Array.isArray(payload.tags) ? payload.tags : [];
        if (payload.community && !tags.includes(payload.community)) {
          tags.push(payload.community);
        }

        if (existingIdx >= 0) {
          const updated = [...prev];
          const existing = updated[existingIdx];
          const mergedTags = Array.from(new Set([...(existing.tags || []), ...tags]));
          updated[existingIdx] = {
            ...existing,
            conta_name: payload.conta_name || existing.conta_name,
            email: payload.email || existing.email,
            community: payload.community || existing.community,
            tags: mergedTags,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          const newContact: ContactRecord = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            conta_name: payload.conta_name || 'ליד חדש',
            conta_phone: payload.conta_phone,
            email: payload.email,
            lead_source: payload.source || 'EventBus',
            community: payload.community,
            tags,
            status: 'פעיל',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return [newContact, ...prev];
        }
      });
    });

    const unsubForm = eventBus.subscribe('smart_form:submitted', (evt) => {
      if (evt?.leadPayload?.community || (evt?.leadPayload?.tags && evt.leadPayload.tags.length > 0)) {
        loadData();
      }
    });

    return () => {
      unsubLead();
      unsubForm();
    };
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
    if (!db) {
      // Offline local save
      const id = groupData.id || `group_${Date.now()}`;
      const newGroup: SmartGroup = {
        id,
        name: groupData.name || 'קבוצה חדשה',
        color: groupData.color || '#4f46e5',
        type: groupData.type || 'manual',
        isCommunity: Boolean(groupData.createPage || groupData.isCommunity),
        ...groupData,
      };
      setGroups((prev) => {
        const idx = prev.findIndex((g) => g.id === id || g.name === groupData.previousName);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newGroup;
          return next;
        }
        return [...prev, newGroup];
      });
      return { success: true, id, pageUrl: newGroup.pageUrl };
    }
    const res = await saveGroupOrCommunityRecord(db, ownerId, groupData, resolvedCustomCollections);
    await loadData();
    return res;
  };

  const deleteGroup = async (group: SmartGroup) => {
    if (!db) {
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      if (activeGroupId === group.id || activeGroupId === group.name) {
        setActiveGroupId('__all__');
      }
      return;
    }
    await deleteGroupRecord(db, group, resolvedCustomCollections);
    if (activeGroupId === group.id || activeGroupId === group.name) {
      setActiveGroupId('__all__');
    }
    await loadData();
  };

  const deleteCommunityPage = async (groupId: string) => {
    if (!db) return;
    await deleteCommunityPageRecord(db, groupId, resolvedCustomCollections);
    await loadData();
  };

  const bulkAssignToGroup = async (contactIds: string[], groupName: string) => {
    if (db) {
      await bulkAssignGroupToContacts(db, contactIds, groupName, resolvedCustomCollections);
    }
    // Update local state and publish events
    setContacts((prev) =>
      prev.map((c) => {
        if (!contactIds.includes(c.id)) return c;
        const currentTags: string[] = Array.isArray(c.tags) ? c.tags : [];
        const nextTags = currentTags.includes(groupName) ? currentTags : [...currentTags, groupName];
        eventBus.publish('crm:contact:updated', { id: c.id, tags: nextTags, community: groupName, conta_name: c.conta_name, email: c.email });
        return { ...c, tags: nextTags, community: groupName };
      })
    );
    setSelectedContactIds([]);
    if (db) await loadData();
  };

  const bulkDeleteContacts = async (contactIds: string[]) => {
    if (db) {
      await bulkDeleteContactsRecord(db, contactIds, resolvedCustomCollections);
    }
    setContacts((prev) => prev.filter((c) => !contactIds.includes(c.id)));
    setSelectedContactIds([]);
    if (db) await loadData();
  };

  const bulkMoveBetweenGroups = async (contactIds: string[], sourceGroupName: string, targetGroupName: string) => {
    if (db) {
      await moveContactsBetweenGroups(db, contactIds, sourceGroupName, targetGroupName, resolvedCustomCollections);
    }
    setContacts((prev) =>
      prev.map((c) => {
        if (!contactIds.includes(c.id)) return c;
        let tags: string[] = Array.isArray(c.tags) ? c.tags : [];
        if (sourceGroupName) tags = tags.filter((t) => t !== sourceGroupName);
        if (!tags.includes(targetGroupName)) tags.push(targetGroupName);
        eventBus.publish('crm:contact:updated', { id: c.id, tags, community: targetGroupName, conta_name: c.conta_name, email: c.email });
        return { ...c, tags, community: targetGroupName };
      })
    );
    setSelectedContactIds([]);
    if (db) await loadData();
  };

  const toggleSingleTag = async (contactId: string, groupName: string) => {
    let nextTags: string[] = [];
    if (db) {
      nextTags = await toggleContactTag(db, contactId, groupName, resolvedCustomCollections);
    } else {
      const target = contacts.find((c) => c.id === contactId);
      const curr = target?.tags || [];
      nextTags = curr.includes(groupName) ? curr.filter((t) => t !== groupName) : [...curr, groupName];
    }
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, tags: nextTags } : c))
    );
    eventBus.publish('crm:contact:updated', { id: contactId, tags: nextTags, community: groupName });
    if (db) await loadData();
  };

  const recordInteraction = async (interaction: {
    contactId: string;
    contactName?: string;
    contactPhone?: string;
    type: 'whatsapp' | 'call' | 'donation' | 'note' | 'system' | 'email';
    title?: string;
    content: string;
    groupName?: string;
    metadata?: Record<string, any>;
  }) => {
    const id = await addCommunityInteractionRecord(
      db,
      {
        ...interaction,
        groupName: interaction.groupName || activeGroup.name,
        date: new Date().toISOString(),
        status: 'completed',
      },
      customCollections
    );

    // Also publish an event across the platform so CRM timeline updates immediately
    eventBus.publish('crm:contact:updated', {
      id: interaction.contactId,
      lastInteraction: {
        type: interaction.type,
        title: interaction.title,
        content: interaction.content,
        date: new Date().toISOString(),
      },
    });

    return id;
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
    bulkDeleteContacts,
    bulkMoveBetweenGroups,
    toggleContactTag: toggleSingleTag,
    recordInteraction,
    onOpenContactDetail,
    onOpenCampaignPage,
    greenApiConfig: greenApiCredentials,
    customCollections: resolvedCustomCollections,
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
