import { FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { Contact, CustomField } from '../types';
import { KosunDiscoveryLayoutMode } from '../../../KOSDESYN/01-core-engine/areaCollectionManager';
import { matchCrmFunctionsForAdvisor } from './crmFunctionsCollection';

export type DynamicGroupCategory =
  | 'priority'
  | 'community'
  | 'tag'
  | 'source'
  | 'form'
  | 'city'
  | 'custom';

export type DynamicRankingMode =
  | 'combined'      // שקלול חכם: חשיבות + שימושים כלליים + שימושים של המשתמש
  | 'importance'    // לפי חשיבות עסקית בלבד
  | 'global_usage'  // לפי מספר שימושים כללי
  | 'user_usage';   // לפי מספר השימושים של המשתמש

export interface EntityUsageRecord {
  entityId: string;
  globalUsageCount: number;
  userUsageByUserId: Record<string, number>;
  importanceBoost?: number;
  lastUsedAt?: number;
}

export interface RankedContactItem {
  contact: Contact;
  importanceScore: number;
  globalUsageCount: number;
  userUsageCount: number;
  totalDynamicScore: number;
  primaryBadge: string;
  subtitleSummary: string;
}

export interface CrmDynamicGroup {
  id: string;
  title: string;
  subtitle: string;
  category: DynamicGroupCategory;
  categoryLabel: string;
  icon: string;
  bgImage: string;
  badgeText: string;
  ctaText: string;
  // 3-Factor Dynamic Ranking Metrics
  importanceScore: number;      // 0 - 100 (לפי חשיבות)
  globalUsageCount: number;     // מספר שימושים כללי במערכת
  userUsageCount: number;       // מספר השימושים של המשתמש הנוכחי
  totalDynamicScore: number;    // ציון משוקלל סופי (0 - 100)
  // Aggregated Live Collection Data
  contactsCount: number;
  leadsCount: number;
  totalRevenue: number;
  contacts: RankedContactItem[];
  filterKey?: {
    field: string;
    value: string;
  };
}

export interface ContactDataSectionGroup {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  importanceScore: number;
  globalUsageCount: number;
  userUsageCount: number;
  totalDynamicScore: number;
  items: Array<{
    key: string;
    label: string;
    value: string;
    actionType?: 'whatsapp' | 'call' | 'email' | 'edit' | 'copy';
  }>;
}

const LOCAL_USAGE_STORAGE_PREFIX = 'kos_crm_dynamic_usage_v1_';

const GROUP_CATEGORY_IMAGES: Record<DynamicGroupCategory, string[]> = {
  priority: [
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
  ],
  community: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
  ],
  tag: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  ],
  source: [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
  ],
  form: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  ],
  city: [
    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
  ],
  custom: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
  ],
};

function pickCategoryImage(category: DynamicGroupCategory, index: number): string {
  const list = GROUP_CATEGORY_IMAGES[category] || GROUP_CATEGORY_IMAGES.custom;
  return list[index % list.length];
}

/**
 * שמירה בטוחה ל-LocalStorage עם הגנה מלאה מפני QuotaExceededError ופינוי קאש עודף
 */
export function safeLocalStorageSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    try {
      // פינוי מפתחות קאש כבדים (>50KB) שתוקעים את הדפדפן
      const heavyKeys: Array<{ k: string; len: number }> = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const v = localStorage.getItem(k) || '';
        if (v.length > 50000) {
          heavyKeys.push({ k, len: v.length });
        }
      }
      heavyKeys.sort((a, b) => b.len - a.len);
      if (heavyKeys.length > 0) {
        localStorage.removeItem(heavyKeys[0].k);
        localStorage.setItem(key, value);
      }
    } catch {
      // Fallback: continue in-memory without crashing the UI
    }
  }
}

export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * קריאת מטריקות שימוש מ-LocalStorage (תגובה מיידית 0ms)
 */
export function loadLocalUsageMetrics(tenantId: string): Record<string, EntityUsageRecord> {
  const raw = safeLocalStorageGet(`${LOCAL_USAGE_STORAGE_PREFIX}${tenantId || '_master'}`);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[KosCrmDynamicGroups] Local usage load notice:', e);
    return {};
  }
}

/**
 * שמירת מטריקות שימוש ל-LocalStorage
 */
export function saveLocalUsageMetrics(
  tenantId: string,
  metrics: Record<string, EntityUsageRecord>
): void {
  safeLocalStorageSet(
    `${LOCAL_USAGE_STORAGE_PREFIX}${tenantId || '_master'}`,
    JSON.stringify(metrics)
  );
}

/**
 * סנכרון מטריקות שימוש וחשיבות מקולקציית Firestore של הטננט
 */
export async function fetchCloudUsageMetrics(
  firebaseApp?: FirebaseApp,
  tenantId: string = '_master'
): Promise<Record<string, EntityUsageRecord>> {
  const local = loadLocalUsageMetrics(tenantId);
  if (!firebaseApp) return local;

  try {
    const db = getFirestore(firebaseApp);
    const colRef = collection(db, 'tenants', tenantId || '_master', 'crm_group_metrics');
    const snap = await getDocs(colRef);
    const merged: Record<string, EntityUsageRecord> = { ...local };

    snap.forEach((docSnap) => {
      const data = docSnap.data() as EntityUsageRecord;
      const existing = merged[docSnap.id];
      const mergedUserMap: Record<string, number> = {
        ...(existing?.userUsageByUserId || {}),
        ...(data.userUsageByUserId || {}),
      };
      if (existing?.userUsageByUserId) {
        for (const [uid, cnt] of Object.entries(existing.userUsageByUserId)) {
          mergedUserMap[uid] = Math.max(cnt, data.userUsageByUserId?.[uid] || 0);
        }
      }
      merged[docSnap.id] = {
        entityId: docSnap.id,
        globalUsageCount: Math.max(
          existing?.globalUsageCount || 0,
          Number(data.globalUsageCount || 0)
        ),
        userUsageByUserId: mergedUserMap,
        importanceBoost: data.importanceBoost ?? existing?.importanceBoost ?? 0,
        lastUsedAt: Math.max(existing?.lastUsedAt || 0, Number(data.lastUsedAt || 0)),
      };
    });

    saveLocalUsageMetrics(tenantId, merged);
    return merged;
  } catch (e) {
    return local;
  }
}

/**
 * תיעוד שימוש (קליק / פתיחה / פעולה) בקבוצה, איש קשר או מקטע נתונים
 * מעדכן מיידית את מספר השימושים הכללי ואת מספר השימושים של המשתמש הנוכחי
 */
export async function recordCrmEntityUsage(
  tenantId: string,
  userId: string,
  entityId: string,
  firebaseApp?: FirebaseApp,
  importanceDelta: number = 0
): Promise<Record<string, EntityUsageRecord>> {
  const cleanTenant = tenantId || '_master';
  const cleanUser = userId || 'owner_default';
  const currentMetrics = loadLocalUsageMetrics(cleanTenant);

  const prev = currentMetrics[entityId] || {
    entityId,
    globalUsageCount: 0,
    userUsageByUserId: {},
    importanceBoost: 0,
  };

  const nextUserCount = (prev.userUsageByUserId[cleanUser] || 0) + 1;
  const nextGlobalCount = (prev.globalUsageCount || 0) + 1;
  const nextBoost = Math.max(
    -30,
    Math.min(40, (prev.importanceBoost || 0) + importanceDelta)
  );

  const updatedRecord: EntityUsageRecord = {
    entityId,
    globalUsageCount: nextGlobalCount,
    userUsageByUserId: {
      ...prev.userUsageByUserId,
      [cleanUser]: nextUserCount,
    },
    importanceBoost: nextBoost,
    lastUsedAt: Date.now(),
  };

  const nextMetrics = {
    ...currentMetrics,
    [entityId]: updatedRecord,
  };

  saveLocalUsageMetrics(cleanTenant, nextMetrics);

  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, 'tenants', cleanTenant, 'crm_group_metrics', entityId);
      await setDoc(docRef, updatedRecord, { merge: true });
    } catch (e) {
      // Fallback already persisted in localStorage
    }
  }

  return nextMetrics;
}

/**
 * שינוי יזום של משקל החשיבות (Pin / Boost Importance) עבור קבוצה או איש קשר
 */
export async function boostCrmEntityImportance(
  tenantId: string,
  entityId: string,
  boostDelta: number,
  firebaseApp?: FirebaseApp
): Promise<Record<string, EntityUsageRecord>> {
  const cleanTenant = tenantId || '_master';
  const currentMetrics = loadLocalUsageMetrics(cleanTenant);
  const prev = currentMetrics[entityId] || {
    entityId,
    globalUsageCount: 0,
    userUsageByUserId: {},
    importanceBoost: 0,
  };

  const nextBoost = Math.max(-30, Math.min(40, (prev.importanceBoost || 0) + boostDelta));
  const updatedRecord: EntityUsageRecord = {
    ...prev,
    entityId,
    importanceBoost: nextBoost,
    lastUsedAt: Date.now(),
  };

  const nextMetrics = {
    ...currentMetrics,
    [entityId]: updatedRecord,
  };

  saveLocalUsageMetrics(cleanTenant, nextMetrics);

  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, 'tenants', cleanTenant, 'crm_group_metrics', entityId);
      await setDoc(docRef, updatedRecord, { merge: true });
    } catch {}
  }

  return nextMetrics;
}

/**
 * חישוב ציון חשיבות, שימושים כלליים ושימושי משתמש עבור איש קשר בודד מתוך הקולקציה
 */
export function rankContactsDynamically(
  contacts: Contact[],
  usageMetrics: Record<string, EntityUsageRecord>,
  userId: string = 'owner_default',
  rankingMode: DynamicRankingMode = 'combined'
): RankedContactItem[] {
  if (!contacts || contacts.length === 0) return [];

  const maxSpent = Math.max(
    1,
    ...contacts.map((c) => Number(c.total_spent || 0) + Number(c.campaign_amount || 0))
  );

  const items: RankedContactItem[] = contacts.map((c) => {
    const cid = `contact_${c.id || c.conta_phone || c.conta_name || 'anon'}`;
    const metric = usageMetrics[cid];

    const spent = Number(c.total_spent || 0) + Number(c.campaign_amount || 0) + Number(c.monthlyTotal || 0);
    const orders = Number(c.order_count || 0);
    const eventsCount = Array.isArray(c.events) ? c.events.length : 0;
    const formsCount = Array.isArray(c.form_submissions)
      ? c.form_submissions.length
      : c.last_form_name
      ? 1
      : 0;
    const aiCount = Array.isArray(c.ai_interactions) ? c.ai_interactions.length : 0;
    const tagsCount = Array.isArray(c.tags) ? c.tags.length : 0;

    // 1. חשיבות עסקית של איש הקשר (0-100)
    let rawImportance = 35;
    if (spent > 0) {
      rawImportance += Math.min(35, Math.round((spent / maxSpent) * 35) + 10);
    }
    if (c.isSubdomainAdmin || c.subdomain) {
      rawImportance += 20;
    }
    if (c.ai_lead_temperature === 'hot') {
      rawImportance += 18;
    } else if (c.is_lead || c.contact_type === 'lead') {
      rawImportance += 12;
    }
    if (c.conta_phone) rawImportance += 5;
    if (c.email) rawImportance += 4;
    rawImportance += Math.min(10, tagsCount * 2 + formsCount * 3);
    rawImportance += metric?.importanceBoost || 0;

    const importanceScore = Math.max(10, Math.min(100, Math.round(rawImportance)));

    // 2. מספר שימושים כללי באיש הקשר (מתוך היסטוריית פעולות בקולקציה + קליקים במערכת)
    const baseCollectionInteractions = orders + eventsCount + formsCount + aiCount + (spent > 0 ? 2 : 1);
    const globalUsageCount = baseCollectionInteractions + (metric?.globalUsageCount || 0);

    // 3. מספר השימושים של המשתמש הנוכחי באיש הקשר
    const userUsageCount = metric?.userUsageByUserId?.[userId] || 0;

    const name = c.kosun_crm_name || c.conta_name || 'איש קשר';
    const roleOrCompany = [c.job_title || c.kosun_crm_role, c.company_name || c.kosun_crm_company]
      .filter(Boolean)
      .join(' • ');
    const city = c.kosun_crm_city || c.mh_crm_city || '';

    let primaryBadge = c.is_lead || c.contact_type === 'lead' ? 'ליד פעיל' : 'איש קשר';
    if (c.isSubdomainAdmin || c.subdomain) {
      primaryBadge = `טננט: ${c.subdomain}`;
    } else if (spent > 0) {
      primaryBadge = `₪${spent.toLocaleString()}`;
    } else if (Array.isArray(c.tags) && c.tags.length > 0) {
      primaryBadge = c.tags[0];
    }

    const subtitleParts = [
      roleOrCompany,
      city ? `עיר: ${city}` : '',
      c.conta_phone || c.kosun_crm_phone || '',
      c.lead_source ? `מקור: ${c.lead_source}` : '',
    ].filter(Boolean);

    return {
      contact: c,
      importanceScore,
      globalUsageCount,
      userUsageCount,
      totalDynamicScore: importanceScore, // recalculated after normalization below
      primaryBadge,
      subtitleSummary: subtitleParts.join(' | ') || `רשומה פעילה במאגר (${name})`,
    };
  });

  const maxGlobal = Math.max(1, ...items.map((i) => i.globalUsageCount));
  const maxUser = Math.max(1, ...items.map((i) => i.userUsageCount));

  items.forEach((item) => {
    const normGlobal = Math.min(100, (item.globalUsageCount / maxGlobal) * 100);
    const normUser = item.userUsageCount > 0 ? Math.min(100, (item.userUsageCount / maxUser) * 100) : 0;

    if (rankingMode === 'importance') {
      item.totalDynamicScore = Math.round(item.importanceScore * 0.85 + normGlobal * 0.1 + normUser * 0.05);
    } else if (rankingMode === 'global_usage') {
      item.totalDynamicScore = Math.round(normGlobal * 0.75 + item.importanceScore * 0.15 + normUser * 0.1);
    } else if (rankingMode === 'user_usage') {
      item.totalDynamicScore = Math.round(normUser * 0.75 + item.importanceScore * 0.15 + normGlobal * 0.1);
    } else {
      // Combined Smart Score: 40% Importance + 25% Global Usage + 35% User Usage
      item.totalDynamicScore = Math.round(
        item.importanceScore * 0.4 +
          normGlobal * 0.25 +
          (item.userUsageCount > 0 ? normUser * 0.35 : item.importanceScore * 0.2)
      );
    }
  });

  return items.sort((a, b) => {
    if (rankingMode === 'importance') {
      return b.importanceScore - a.importanceScore || b.globalUsageCount - a.globalUsageCount;
    }
    if (rankingMode === 'global_usage') {
      return b.globalUsageCount - a.globalUsageCount || b.importanceScore - a.importanceScore;
    }
    if (rankingMode === 'user_usage') {
      return b.userUsageCount - a.userUsageCount || b.importanceScore - a.importanceScore;
    }
    return b.totalDynamicScore - a.totalDynamicScore || b.importanceScore - a.importanceScore;
  });
}

/**
 * המנוע המרכזי: הופך את כל נתוני קולקציית אנשי הקשר לקבוצות דינמיות
 * המדורגות לפי חשיבות (Importance), מספר שימושים כללי (Global Usage), ומספר השימושים של המשתמש (User Usage)
 */
export function buildDynamicCrmGroupsFromCollection(params: {
  contacts: Contact[];
  customFields?: CustomField[];
  extraCommunities?: string[];
  usageMetrics: Record<string, EntityUsageRecord>;
  userId?: string;
  rankingMode?: DynamicRankingMode;
  categoryFilter?: DynamicGroupCategory | 'all';
  searchQuery?: string;
}): CrmDynamicGroup[] {
  const {
    contacts,
    customFields = [],
    extraCommunities = [],
    usageMetrics,
    userId = 'owner_default',
    rankingMode = 'combined',
    categoryFilter = 'all',
    searchQuery = '',
  } = params;

  const activeContacts = contacts.filter((c) => c.status !== 'trashed');
  const totalContactsCount = Math.max(1, activeContacts.length);
  const totalSystemRevenue = Math.max(
    1,
    activeContacts.reduce(
      (sum, c) =>
        sum +
        Number(c.total_spent || 0) +
        Number(c.campaign_amount || 0) +
        Number(c.monthlyTotal || 0),
      0
    )
  );

  interface RawGroupCandidate {
    id: string;
    title: string;
    category: DynamicGroupCategory;
    categoryLabel: string;
    icon: string;
     matchedContacts: Contact[];
    baseStrategicWeight: number;
    filterKey?: { field: string; value: string };
  }

  const candidates: RawGroupCandidate[] = [];

  // =========================================================================
  // 1. קבוצות עדיפות וערך עסקי מתוך נתוני האמת בקולקציה (Priority & Lifecycle)
  // =========================================================================
  const payingContacts = activeContacts.filter(
    (c) => Number(c.total_spent || 0) > 0 || Number(c.order_count || 0) > 0
  );
  if (payingContacts.length > 0) {
    candidates.push({
      id: 'grp_priority_paying_vip',
      title: 'לקוחות משלמים ובעלי ערך (VIP)',
      category: 'priority',
      categoryLabel: 'עדיפות עסקית והכנסות',
      icon: 'Crown',
      matchedContacts: payingContacts,
      baseStrategicWeight: 26,
      filterKey: { field: 'metricFilter', value: 'revenue' },
    });
  }

  const hotAndActiveLeads = activeContacts.filter(
    (c) => c.is_lead || c.contact_type === 'lead' || c.ai_lead_temperature === 'hot'
  );
  if (hotAndActiveLeads.length > 0) {
    candidates.push({
      id: 'grp_priority_active_leads',
      title: 'לידים חמים ומתעניינים פעילים',
      category: 'priority',
      categoryLabel: 'מוקד המרה ומכירות',
      icon: 'Flame',
      matchedContacts: hotAndActiveLeads,
      baseStrategicWeight: 25,
      filterKey: { field: 'typeFilter', value: 'leads' },
    });
  }

  const subdomainTenants = activeContacts.filter(
    (c) => Boolean(c.isSubdomainAdmin || c.subdomain || (c.subscriptions && c.subscriptions.length > 0))
  );
  if (subdomainTenants.length > 0) {
    candidates.push({
      id: 'grp_priority_subdomain_tenants',
      title: 'דיירי סאב-דומיין ומנויי SaaS',
      category: 'priority',
      categoryLabel: 'נכסי מערכת ומנויים',
      icon: 'Globe',
      matchedContacts: subdomainTenants,
      baseStrategicWeight: 24,
      filterKey: { field: 'tag', value: 'סאב דומיין' },
    });
  }

  const campaignContacts = activeContacts.filter(
    (c) => Number(c.campaign_amount || 0) > 0 || Boolean(c.campaign_title)
  );
  if (campaignContacts.length > 0) {
    candidates.push({
      id: 'grp_priority_campaigns',
      title: 'שגרירים ומשתתפי קמפיינים',
      category: 'priority',
      categoryLabel: 'קמפיינים וגיוס המונים',
      icon: 'Award',
      matchedContacts: campaignContacts,
      baseStrategicWeight: 20,
      filterKey: { field: 'metricFilter', value: 'campaigns' },
    });
  }

  // =========================================================================
  // 2. קבוצות קהילה וקבוצות משויכות מתוך הקולקציה (Communities & CRM Groups)
  // =========================================================================
  const communityMap = new Map<string, Contact[]>();
  extraCommunities.forEach((commName) => {
    if (commName && commName.trim()) {
      communityMap.set(commName.trim(), []);
    }
  });

  activeContacts.forEach((c) => {
    const comm = (c.community || c.mh_crm_community || '').trim();
    if (comm) {
      const list = communityMap.get(comm) || [];
      list.push(c);
      communityMap.set(comm, list);
    }
  });

  communityMap.forEach((members, commName) => {
    if (members.length > 0) {
      candidates.push({
        id: `grp_community_${commName.replace(/\s+/g, '_')}`,
        title: commName.startsWith('קהיל') || commName.startsWith('קבוצת') ? commName : `קהילת ${commName}`,
        category: 'community',
        categoryLabel: 'קבוצת קהילה פעילה',
        icon: 'Users',
        matchedContacts: members,
        baseStrategicWeight: 18,
        filterKey: { field: 'community', value: commName },
      });
    }
  });

  // =========================================================================
  // 3. קבוצות תגיות וסגמנטים מתוך הקולקציה (Dynamic Tags & Segments)
  // =========================================================================
  const tagMap = new Map<string, Contact[]>();
  activeContacts.forEach((c) => {
    const rawTags = [
      ...(Array.isArray(c.kosun_crm_tags) ? c.kosun_crm_tags : []),
      ...(Array.isArray(c.tags) ? c.tags : []),
      c.tg1,
      c.tg2,
      c.tg3,
    ].filter((t): t is string => Boolean(t && typeof t === 'string' && t.trim()));

    const uniqueTags = Array.from(new Set(rawTags.map((t) => t.trim())));
    uniqueTags.forEach((tag) => {
      const list = tagMap.get(tag) || [];
      list.push(c);
      tagMap.set(tag, list);
    });
  });

  tagMap.forEach((members, tagName) => {
    if (members.length > 0) {
      candidates.push({
        id: `grp_tag_${tagName.replace(/\s+/g, '_')}`,
        title: `תגית: ${tagName}`,
        category: 'tag',
        categoryLabel: 'סגמנט תגית חכמה',
        icon: 'Tag',
        matchedContacts: members,
        baseStrategicWeight: 16,
        filterKey: { field: 'tag', value: tagName },
      });
    }
  });

  // =========================================================================
  // 4. קבוצות מקורות הגעה וטפסים חכמים (Lead Sources & Smart Forms)
  // =========================================================================
  const sourceMap = new Map<string, Contact[]>();
  const formMap = new Map<string, Contact[]>();

  activeContacts.forEach((c) => {
    const src = (c.kosun_crm_source || c.lead_source || '').trim();
    if (src) {
      const list = sourceMap.get(src) || [];
      list.push(c);
      sourceMap.set(src, list);
    }

    const formNames = new Set<string>();
    if (c.last_form_name && c.last_form_name.trim()) {
      formNames.add(c.last_form_name.trim());
    }
    if (Array.isArray(c.form_submissions)) {
      c.form_submissions.forEach((fs) => {
        if (fs?.name && fs.name.trim()) formNames.add(fs.name.trim());
      });
    }
    formNames.forEach((fn) => {
      const list = formMap.get(fn) || [];
      list.push(c);
      formMap.set(fn, list);
    });
  });

  sourceMap.forEach((members, srcName) => {
    if (members.length > 0) {
      candidates.push({
        id: `grp_source_${srcName.replace(/\s+/g, '_')}`,
        title: `מקור: ${srcName}`,
        category: 'source',
        categoryLabel: 'ערוץ הגעה ותנועה',
        icon: 'Compass',
        matchedContacts: members,
        baseStrategicWeight: 14,
        filterKey: { field: 'source', value: srcName },
      });
    }
  });

  formMap.forEach((members, formName) => {
    if (members.length > 0) {
      candidates.push({
        id: `grp_form_${formName.replace(/\s+/g, '_')}`,
        title: `טופס: ${formName}`,
        category: 'form',
        categoryLabel: 'הגשות טופס חכם',
        icon: 'FileText',
        matchedContacts: members,
        baseStrategicWeight: 15,
        filterKey: { field: 'form', value: formName },
      });
    }
  });

  // =========================================================================
  // 5. קבוצות גיאוגרפיות וערים מהקולקציה (Cities & Locations)
  // =========================================================================
  const cityMap = new Map<string, Contact[]>();
  activeContacts.forEach((c) => {
    const city = (c.kosun_crm_city || c.mh_crm_city || '').trim();
    if (city) {
      const list = cityMap.get(city) || [];
      list.push(c);
      cityMap.set(city, list);
    }
  });

  cityMap.forEach((members, cityName) => {
    if (members.length > 0) {
      candidates.push({
        id: `grp_city_${cityName.replace(/\s+/g, '_')}`,
        title: `אזור: ${cityName}`,
        category: 'city',
        categoryLabel: 'פילוח גיאוגרפי',
        icon: 'MapPin',
        matchedContacts: members,
        baseStrategicWeight: 12,
        filterKey: { field: 'city', value: cityName },
      });
    }
  });

  // =========================================================================
  // 6. קבוצות שדות מותאמים אישית (Custom Collection Fields)
  // =========================================================================
  customFields.forEach((cf) => {
    const matching = activeContacts.filter(
      (c) => c[cf.id] !== undefined && c[cf.id] !== null && c[cf.id] !== ''
    );
    if (matching.length > 0) {
      candidates.push({
        id: `grp_custom_${cf.id}`,
        title: `${cf.label || cf.id}`,
        category: 'custom',
        categoryLabel: 'שדה דינמי מהקולקציה',
        icon: 'Layers',
        matchedContacts: matching,
        baseStrategicWeight: 13,
      });
    }
  });

  // אם אין עדיין תתי-קבוצות (למשל קולקציה חדשה), ניצור קבוצת "כל אנשי הקשר הפעילים"
  if (candidates.length === 0 && activeContacts.length > 0) {
    candidates.push({
      id: 'grp_priority_all_active',
      title: 'כל אנשי הקשר הפעילים במאגר',
      category: 'priority',
      categoryLabel: 'מאגר ראשי',
      icon: 'Users',
      matchedContacts: activeContacts,
      baseStrategicWeight: 25,
    });
  }

  // =========================================================================
  // חישוב 3 המדדים לכל קבוצה: חשיבות + מספר שימושים כללי + שימושי המשתמש
  // =========================================================================
  const builtGroups: CrmDynamicGroup[] = candidates.map((cand, idx) => {
    const metric = usageMetrics[cand.id];
    const groupContacts = cand.matchedContacts;
    const contactsCount = groupContacts.length;
    const leadsCount = groupContacts.filter((c) => c.is_lead || c.contact_type === 'lead').length;
    const groupRevenue = groupContacts.reduce(
      (sum, c) =>
        sum +
        Number(c.total_spent || 0) +
        Number(c.campaign_amount || 0) +
        Number(c.monthlyTotal || 0),
      0
    );

    // 1. חישוב ציון חשיבות הקבוצה (Importance Score: 0-100)
    const revenueShareScore = Math.min(32, Math.round((groupRevenue / totalSystemRevenue) * 40));
    const volumeShareScore = Math.min(28, Math.round((contactsCount / totalContactsCount) * 35));
    const leadsUrgencyScore = Math.min(18, leadsCount * 4);
    const boost = metric?.importanceBoost || 0;

    const rawImportance =
      cand.baseStrategicWeight + revenueShareScore + volumeShareScore + leadsUrgencyScore + boost;
    const importanceScore = Math.max(15, Math.min(100, Math.round(rawImportance)));

    // 2. חישוב מספר שימושים כללי (Global Usage Count)
    // סוכם אינטראקציות אמיתיות מתוך אנשי הקשר שבקבוצה + קליקים שנרשמו במערכת על הקבוצה
    const collectionActivityCount = groupContacts.reduce((sum, c) => {
      const orders = Number(c.order_count || 0);
      const events = Array.isArray(c.events) ? c.events.length : 0;
      const forms = Array.isArray(c.form_submissions)
        ? c.form_submissions.length
        : c.last_form_name
        ? 1
        : 0;
      const ai = Array.isArray(c.ai_interactions) ? c.ai_interactions.length : 0;
      return sum + orders + events + forms + ai + 1;
    }, 0);

    const globalUsageCount = collectionActivityCount + (metric?.globalUsageCount || 0);

    // 3. חישוב מספר השימושים של המשתמש הנוכחי (User Usage Count)
    const userUsageCount = metric?.userUsageByUserId?.[userId] || 0;

    // דירוג אנשי הקשר שבתוך הקבוצה לפי אותם 3 עקרונות
    const rankedContacts = rankContactsDynamically(
      groupContacts,
      usageMetrics,
      userId,
      rankingMode
    );

    const topNames = rankedContacts
      .slice(0, 3)
      .map((rc) => rc.contact.kosun_crm_name || rc.contact.conta_name || 'איש קשר')
      .join(', ');

    const revenuePart = groupRevenue > 0 ? ` • מחזור: ₪${groupRevenue.toLocaleString()}` : '';
    const leadsPart = leadsCount > 0 ? ` • ${leadsCount} לידים` : '';
    const subtitle = `${contactsCount} אנשי קשר${leadsPart}${revenuePart} (${topNames})`;

    const badgeText = `חשיבות ${importanceScore}% • ${globalUsageCount} שימושים${
      userUsageCount > 0 ? ` • ${userUsageCount} שלך` : ''
    }`;

    return {
      id: cand.id,
      title: cand.title,
      subtitle,
      category: cand.category,
      categoryLabel: cand.categoryLabel,
      icon: cand.icon,
      bgImage: pickCategoryImage(cand.category, idx),
      badgeText,
      ctaText: `פתח ${contactsCount} אנשי קשר ◀`,
      importanceScore,
      globalUsageCount,
      userUsageCount,
      totalDynamicScore: importanceScore, // normalized below
      contactsCount,
      leadsCount,
      totalRevenue: groupRevenue,
      contacts: rankedContacts,
      filterKey: cand.filterKey,
    };
  });

  // נרמול ודירוג סופי לפי 3 הפרמטרים
  const maxGlobal = Math.max(1, ...builtGroups.map((g) => g.globalUsageCount));
  const maxUser = Math.max(1, ...builtGroups.map((g) => g.userUsageCount));

  builtGroups.forEach((group) => {
    const normGlobal = Math.min(100, (group.globalUsageCount / maxGlobal) * 100);
    const normUser =
      group.userUsageCount > 0 ? Math.min(100, (group.userUsageCount / maxUser) * 100) : 0;

    if (rankingMode === 'importance') {
      group.totalDynamicScore = Math.round(
        group.importanceScore * 0.85 + normGlobal * 0.1 + normUser * 0.05
      );
    } else if (rankingMode === 'global_usage') {
      group.totalDynamicScore = Math.round(
        normGlobal * 0.75 + group.importanceScore * 0.15 + normUser * 0.1
      );
    } else if (rankingMode === 'user_usage') {
      group.totalDynamicScore = Math.round(
        normUser * 0.75 + group.importanceScore * 0.15 + normGlobal * 0.1
      );
    } else {
      // שקלול חכם (Combined): 40% חשיבות + 25% שימושים כלליים + 35% שימושי המשתמש
      group.totalDynamicScore = Math.round(
        group.importanceScore * 0.4 +
          normGlobal * 0.25 +
          (group.userUsageCount > 0 ? normUser * 0.35 : group.importanceScore * 0.2)
      );
    }
  });

  // סינון לפי קטגוריה וחיפוש טקסטואלי/קולי אם הוזן
  let filtered = builtGroups;
  if (categoryFilter !== 'all') {
    filtered = filtered.filter((g) => g.category === categoryFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.subtitle.toLowerCase().includes(q) ||
        g.categoryLabel.toLowerCase().includes(q) ||
        g.contacts.some(
          (rc) =>
            (rc.contact.conta_name || '').toLowerCase().includes(q) ||
            (rc.contact.conta_phone || '').includes(q) ||
            (rc.contact.email || '').toLowerCase().includes(q) ||
            (rc.contact.company_name || '').toLowerCase().includes(q)
        )
    );
  }

  return filtered.sort((a, b) => {
    if (rankingMode === 'importance') {
      return b.importanceScore - a.importanceScore || b.globalUsageCount - a.globalUsageCount;
    }
    if (rankingMode === 'global_usage') {
      return b.globalUsageCount - a.globalUsageCount || b.importanceScore - a.importanceScore;
    }
    if (rankingMode === 'user_usage') {
      return b.userUsageCount - a.userUsageCount || b.importanceScore - a.importanceScore;
    }
    return b.totalDynamicScore - a.totalDynamicScore || b.importanceScore - a.importanceScore;
  });
}

/**
 * בניית 4 קבוצות נתונים דינמיות עבור איש קשר בודד (Contact Drill-Down)
 * המדורגות גם הן לפי חשיבות, מספר שימושים כללי ומספר שימושי המשתמש
 */
export function buildContactDynamicDataSections(
  contact: Contact,
  usageMetrics: Record<string, EntityUsageRecord>,
  userId: string = 'owner_default'
): ContactDataSectionGroup[] {
  const spent = Number(contact.total_spent || 0);
  const campAmount = Number(contact.campaign_amount || 0);
  const orders = Number(contact.order_count || 0);
  const tags = Array.isArray(contact.tags) ? contact.tags : [];
  const events = Array.isArray(contact.events) ? contact.events : [];
  const forms = Array.isArray(contact.form_submissions) ? contact.form_submissions : [];

  const rawSections: Omit<ContactDataSectionGroup, 'totalDynamicScore'>[] = [
    {
      id: 'sec_comms_identity',
      title: 'תקשורת ישירה וזיהוי ליבה',
      subtitle: `${contact.conta_phone || 'ללא טלפון'} • ${contact.email || 'ללא אימייל'} • ${
        contact.mh_crm_city || 'ללא עיר'
      }`,
      badge: 'תקשורת ופרופיל',
      icon: 'PhoneCall',
      importanceScore: contact.conta_phone ? 96 : 80,
      globalUsageCount: 12 + (usageMetrics['sec_comms_identity']?.globalUsageCount || 0),
      userUsageCount: usageMetrics['sec_comms_identity']?.userUsageByUserId?.[userId] || 0,
      items: [
        {
          key: 'conta_name',
          label: 'שם מלא',
          value: contact.kosun_crm_name || contact.conta_name || 'לא הוגדר',
          actionType: 'edit',
        },
        {
          key: 'conta_phone',
          label: 'טלפון נייד ו-WhatsApp',
          value: contact.kosun_crm_phone || contact.conta_phone || 'לא הוזן טלפון',
          actionType: 'whatsapp',
        },
        {
          key: 'email',
          label: 'כתובת דוא״ל',
          value: contact.kosun_crm_email || contact.email || 'לא הוזן דוא״ל',
          actionType: 'email',
        },
        {
          key: 'company_city',
          label: 'חברה, תפקיד ועיר',
          value:
            [
              contact.company_name || contact.kosun_crm_company,
              contact.job_title,
              contact.mh_crm_city || contact.kosun_crm_city,
            ]
              .filter(Boolean)
              .join(' • ') || 'לא הוזנו פרטי חברה/עיר',
          actionType: 'edit',
        },
      ],
    },
    {
      id: 'sec_financial_subs',
      title: 'ערך כלכלי, עסקאות ומנויים',
      subtitle: `סה״כ רכישות: ₪${spent.toLocaleString()} • ${orders} עסקאות • קמפיינים: ₪${campAmount.toLocaleString()}`,
      badge: spent > 0 ? `₪${spent.toLocaleString()}` : 'פיננסי ומנויים',
      icon: 'CreditCard',
      importanceScore: spent > 0 || contact.isSubdomainAdmin ? 94 : 68,
      globalUsageCount:
        orders + 5 + (usageMetrics['sec_financial_subs']?.globalUsageCount || 0),
      userUsageCount: usageMetrics['sec_financial_subs']?.userUsageByUserId?.[userId] || 0,
      items: [
        {
          key: 'total_spent',
          label: 'סך רכישות ותקבולים (Kesher)',
          value: `₪${spent.toLocaleString()} (${orders} עסקאות)`,
          actionType: 'edit',
        },
        {
          key: 'campaign_amount',
          label: 'תרומות וקמפיינים',
          value: contact.campaign_title
            ? `${contact.campaign_title}: ₪${campAmount.toLocaleString()}`
            : `₪${campAmount.toLocaleString()}`,
          actionType: 'edit',
        },
        {
          key: 'subdomain',
          label: 'סאב-דומיין ומנוי מערכת',
          value: contact.subdomain
            ? `${contact.fullDomain || contact.subdomain} (${contact.billingPlan || 'פעיל'})`
            : 'ללא סאב-דומיין משויך',
          actionType: 'copy',
        },
        {
          key: 'subscriptions',
          label: 'מנויים פעילים',
          value:
            Array.isArray(contact.subscriptions) && contact.subscriptions.length > 0
              ? `${contact.subscriptions.length} מנויים פעילים`
              : 'ללא מנוי חודשי פעיל',
          actionType: 'edit',
        },
      ],
    },
    {
      id: 'sec_communities_tags_forms',
      title: 'קהילות, תגיות וטפסים חכמים',
      subtitle: `קהילה: ${contact.community || 'כללי'} • ${tags.length} תגיות • מקור: ${
        contact.lead_source || 'ישיר'
      }`,
      badge: `${tags.length} תגיות`,
      icon: 'Tags',
      importanceScore: tags.length > 0 || contact.community ? 88 : 65,
      globalUsageCount:
        tags.length +
        forms.length +
        6 +
        (usageMetrics['sec_communities_tags_forms']?.globalUsageCount || 0),
      userUsageCount:
        usageMetrics['sec_communities_tags_forms']?.userUsageByUserId?.[userId] || 0,
      items: [
        {
          key: 'community',
          label: 'שיוך קהילה / קבוצה',
          value: contact.community || contact.mh_crm_community || 'לא משויך לקהילה',
          actionType: 'edit',
        },
        {
          key: 'tags',
          label: 'תגיות פעילות בקולקציה',
          value: tags.length > 0 ? tags.join(' , ') : 'ללא תגיות',
          actionType: 'edit',
        },
        {
          key: 'lead_source',
          label: 'מקור הגעה ראשוני',
          value: contact.kosun_crm_source || contact.lead_source || 'הזנה ישירה',
          actionType: 'edit',
        },
        {
          key: 'last_form_name',
          label: 'טופס חכם אחרון שהוגש',
          value: contact.last_form_name
            ? `${contact.last_form_name} (${contact.last_form_submission_date || ''})`
            : `${forms.length} הגשות טפסים`,
          actionType: 'edit',
        },
      ],
    },
    {
      id: 'sec_ai_timeline_notes',
      title: 'תובנות AI, הערות וציר זמן',
      subtitle:
        contact.ai_summary ||
        contact.notes ||
        `${events.length} אירועים מתועדים בציר הזמן של איש הקשר`,
      badge: contact.is_lead ? 'ניתוח ליד AI' : 'ציר זמן ו-AI',
      icon: 'Sparkles',
      importanceScore: contact.is_lead || contact.notes ? 90 : 72,
      globalUsageCount:
        events.length + 4 + (usageMetrics['sec_ai_timeline_notes']?.globalUsageCount || 0),
      userUsageCount: usageMetrics['sec_ai_timeline_notes']?.userUsageByUserId?.[userId] || 0,
      items: [
        {
          key: 'contact_type',
          label: 'סטטוס וסיווג ברשומה',
          value: contact.is_lead || contact.contact_type === 'lead' ? 'ליד מתעניין (Lead)' : 'לקוח / איש קשר פעיל',
          actionType: 'edit',
        },
        {
          key: 'notes',
          label: 'הערות ותיעוד שיחה',
          value: contact.kosun_crm_notes || contact.notes || 'אין הערות רשומות – לחץ להוספה',
          actionType: 'edit',
        },
        {
          key: 'ai_next_best_action',
          label: 'המלצת הפעולה הבאה (AI Next Action)',
          value:
            contact.ai_next_best_action ||
            (contact.is_lead
              ? 'שלח הודעת וואטסאפ אישית לתיאום שיחת היכרות'
              : 'שמור על קשר תקופתי והצע שדרוג או הזמנה למפגש קהילה'),
          actionType: 'whatsapp',
        },
        {
          key: 'createdAt',
          label: 'מועד יצירה ועדכון אחרון',
          value: `נוצר: ${contact.createdAt || 'לא ידוע'} ${
            contact.updatedAt ? `• עודכן: ${contact.updatedAt}` : ''
          }`,
          actionType: 'copy',
        },
      ],
    },
  ];

  return rawSections
    .map((sec) => ({
      ...sec,
      totalDynamicScore: Math.round(
        sec.importanceScore * 0.5 + sec.globalUsageCount * 1.5 + sec.userUsageCount * 8
      ),
    }))
    .sort((a, b) => b.totalDynamicScore - a.totalDynamicScore)
    .slice(0, 4);
}

/**
 * ============================================================================
 * ON-DEMAND BABUSHKA ENGINE (משיכת נתונים ממוקדת לפי דרישת משתמש בלבד - מקסימום 4 כרטיסים)
 * ============================================================================
 * שלב 1: מושך אך ורק את 4 הקבוצות המובילות (ללא משיכת כל אנשי הקשר!)
 * שלב 2: רק בלחיצת משתמש על קבוצה -> מושך מ-Firestore עד 4 אנשי קשר רלוונטיים בלבד!
 */
export async function fetchTopFourBabushkaGroupsOnDemand(params: {
  firebaseApp?: FirebaseApp;
  tenantId: string;
  userId: string;
  usageMetrics: Record<string, EntityUsageRecord>;
  groupsCollectionPath?: string;
}): Promise<CrmDynamicGroup[]> {
  const { firebaseApp, tenantId, userId, usageMetrics, groupsCollectionPath } = params;

  // קבוצות הליבה המונעות לפעולה (Action-Driven Babushka Root Cards)
  const candidates: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: DynamicGroupCategory;
    categoryLabel: string;
    icon: string;
    bgImage: string;
    ctaText: string;
    baseImportance: number;
    baseGlobalUsage: number;
    filterKey?: { field: string; value: string };
  }> = [
    {
      id: 'grp_priority_hot_leads',
      title: 'טפל בלידים חמים הממתינים למענה',
      subtitle: 'מתעניינים חדשים בעדיפות גבוהה להמרה מהירה בשיחה או WhatsApp',
      category: 'priority',
      categoryLabel: 'דחיפות גבוהה',
      icon: 'Flame',
      bgImage: GROUP_CATEGORY_IMAGES.priority[1],
      ctaText: 'פתח 4 לידים ◀',
      baseImportance: 96,
      baseGlobalUsage: 24,
      filterKey: { field: 'is_lead', value: 'true' },
    },
    {
      id: 'grp_priority_paying_vip',
      title: 'שמור על קשר עם לקוחות VIP ומשלמים',
      subtitle: 'לקוחות בעלי רכישות פעילות, מנויים וערך כלכלי מוביל',
      category: 'priority',
      categoryLabel: 'לקוחות VIP',
      icon: 'Crown',
      bgImage: GROUP_CATEGORY_IMAGES.priority[0],
      ctaText: 'פתח 4 לקוחות ◀',
      baseImportance: 94,
      baseGlobalUsage: 20,
      filterKey: { field: 'vip', value: 'true' },
    },
    {
      id: 'grp_priority_communities',
      title: 'הפעל את חברי הקהילות והקבוצות',
      subtitle: 'ניהול קשר ישיר עם חברי הקהילות הפעילות ומועדון הלקוחות',
      category: 'community',
      categoryLabel: 'קהילות וקבוצות',
      icon: 'Users',
      bgImage: GROUP_CATEGORY_IMAGES.community[0],
      ctaText: 'פתח 4 חברים ◀',
      baseImportance: 89,
      baseGlobalUsage: 16,
      filterKey: { field: 'has_community', value: 'true' },
    },
    {
      id: 'grp_priority_campaigns_forms',
      title: 'קלוט פניות מטפסים וקמפיינים פעילים',
      subtitle: 'נרשמים חדשים שהגישו טפסים חכמים או השתתפו בקמפיין',
      category: 'form',
      categoryLabel: 'טפסים וקמפיינים',
      icon: 'FileText',
      bgImage: GROUP_CATEGORY_IMAGES.form[0],
      ctaText: 'פתח 4 פניות ◀',
      baseImportance: 86,
      baseGlobalUsage: 14,
      filterKey: { field: 'has_form', value: 'true' },
    },
  ];

  // משיכה קלה בלבד (limit 6) של שמות קבוצות מוגדרות מהקולקציה (ללא משיכת אנשי הקשר!)
  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const colPath = groupsCollectionPath || `tenants/${tenantId || '_master'}/crm_groups`;
      const q = query(collection(db, colPath), limit(6));
      const snap = await getDocs(q);
      let idx = 0;
      snap.forEach((d) => {
        const data = d.data();
        const gName = (data.name || data.title || '').trim();
        if (gName) {
          const gid = `grp_community_${gName.toLowerCase().replace(/\s+/g, '_')}`;
          if (!candidates.some((c) => c.id === gid)) {
            candidates.push({
              id: gid,
              title: `פעל בקבוצת "${gName}"`,
              subtitle: data.description || `אנשי קשר המשויכים ישירות לקבוצת ${gName}`,
              category: 'community',
              categoryLabel: 'קבוצה מהקולקציה',
              icon: 'Users',
              bgImage: pickCategoryImage('community', idx++),
              ctaText: 'פתח 4 בקבוצה ◀',
              baseImportance: 84,
              baseGlobalUsage: 10,
              filterKey: { field: 'community', value: gName },
            });
          }
        }
      });
    } catch {
      // Fallback to core 4 action groups
    }
  }

  // חישוב ציון דינמי לפי: חשיבות + מספר שימושים כללי + מספר השימושים של המשתמש
  const scored: CrmDynamicGroup[] = candidates.map((cand) => {
    const rec = usageMetrics[cand.id];
    const userCount = rec?.userUsageByUserId?.[userId] || 0;
    const globalCount = cand.baseGlobalUsage + (rec?.globalUsageCount || 0);
    const boost = rec?.importanceBoost || 0;
    const importanceScore = Math.max(15, Math.min(100, cand.baseImportance + boost));

    const totalDynamicScore = Math.round(
      importanceScore * 0.4 + Math.min(100, globalCount * 4) * 0.3 + Math.min(100, userCount * 15) * 0.3
    );

    return {
      id: cand.id,
      title: cand.title,
      subtitle: cand.subtitle,
      category: cand.category,
      categoryLabel: cand.categoryLabel,
      icon: cand.icon,
      bgImage: cand.bgImage,
      badgeText: cand.categoryLabel,
      ctaText: cand.ctaText,
      importanceScore,
      globalUsageCount: globalCount,
      userUsageCount: userCount,
      totalDynamicScore,
      contactsCount: 4,
      leadsCount: cand.category === 'priority' ? 4 : 0,
      totalRevenue: 0,
      contacts: [],
      filterKey: cand.filterKey,
    };
  });

  // מיון אוטומטי והחזרת 4 כרטיסים בלבד! (חוק הבבושקה)
  scored.sort((a, b) => b.totalDynamicScore - a.totalDynamicScore);
  return scored.slice(0, 4);
}

function mapDocToLightweightContact(id: string, data: any): Contact {
  const rawEvents = Array.isArray(data.events) ? data.events : [];
  const eventsSpent = rawEvents.reduce((acc: number, ev: any) => acc + (Number(ev.amount) || 0), 0);
  const totalSpentVal =
    data.total_spent !== undefined && data.total_spent !== null && Number(data.total_spent) > 0
      ? Number(data.total_spent)
      : eventsSpent > 0
      ? eventsSpent
      : Number(data.kosun_crm_total_spent || data.amount || 0);

  const contactName =
    data.kosun_crm_name ||
    data.conta_name ||
    data.fullName ||
    data.name ||
    (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : '') ||
    'איש קשר';
  const contactPhone =
    data.kosun_crm_phone || data.conta_phone || data.phone || data.mobile || '';
  const contactEmail = data.kosun_crm_email || data.email || '';
  const contactCompany = data.kosun_crm_company || data.company_name || data.company || '';
  const contactCity = data.kosun_crm_city || data.mh_crm_city || data.city || '';
  const contactTags = Array.isArray(data.kosun_crm_tags)
    ? data.kosun_crm_tags
    : Array.isArray(data.tags)
    ? data.tags
    : [];

  return {
    id,
    status: data.status || 'active',
    is_lead: Boolean(data.is_lead || data.contact_type === 'lead' || data.kosun_crm_type === 'lead'),
    contact_type: data.contact_type || (data.is_lead ? 'lead' : 'contact'),
    kosun_crm_name: contactName,
    kosun_crm_phone: contactPhone,
    kosun_crm_email: contactEmail,
    kosun_crm_company: contactCompany,
    kosun_crm_city: contactCity,
    kosun_crm_tags: contactTags,
    conta_name: contactName,
    conta_phone: contactPhone,
    email: contactEmail,
    company_name: contactCompany,
    mh_crm_city: contactCity,
    tags: contactTags,
    community: data.community || data.mh_crm_community || '',
    lead_source: data.kosun_crm_source || data.lead_source || data.source || '',
    total_spent: totalSpentVal,
    order_count: Number(data.order_count || (rawEvents.length > 0 ? rawEvents.length : totalSpentVal > 0 ? 1 : 0)),
    campaign_title: data.campaign_title,
    campaign_amount: Number(data.campaign_amount || 0),
    last_form_name: data.last_form_name,
    notes: data.kosun_crm_notes || data.notes || '',
    events: rawEvents,
  } as Contact;
}

/**
 * משיכת עד 4 אנשי קשר בלבד מתוך הקולקציה – מופעל אך ורק כשהמשתמש לוחץ על קבוצה או מבקש פקודה!
 */
export async function fetchFourContactsForGroupOnDemand(params: {
  firebaseApp?: FirebaseApp;
  tenantId: string;
  group: CrmDynamicGroup;
  userId: string;
  usageMetrics: Record<string, EntityUsageRecord>;
  contactsCollectionPath?: string;
  searchQuery?: string;
}): Promise<RankedContactItem[]> {
  const {
    firebaseApp,
    tenantId,
    group,
    userId,
    usageMetrics,
    contactsCollectionPath,
    searchQuery,
  } = params;

  const fetchedContacts: Contact[] = [];

  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const colPath = contactsCollectionPath || `tenants/${tenantId || '_master'}/contacts`;
      const colRef = collection(db, colPath);

      let snap;
      const fk = group.filterKey;

      // ניסיון ראשון: שאילתה ממוקדת עם limit(12) לפי סוג הקבוצה
      try {
        if (fk?.field === 'is_lead') {
          snap = await getDocs(query(colRef, where('is_lead', '==', true), limit(12)));
        } else if (fk?.field === 'community' && fk.value) {
          snap = await getDocs(query(colRef, where('community', '==', fk.value), limit(12)));
        } else {
          snap = await getDocs(query(colRef, limit(16)));
        }
      } catch {
        snap = await getDocs(query(colRef, limit(16)));
      }

      // אם השאילתה הספציפית חזרה ריקה (או שהנתונים בקולקציית השורש contacts), משוך מדגם קומפקטי של עד 16 בלבד
      if (!snap || snap.empty) {
        snap = await getDocs(query(colRef, limit(16)));
      }
      if (snap.empty) {
        try {
          snap = await getDocs(query(collection(db, 'contacts'), limit(16)));
        } catch {}
      }

      if (snap && !snap.empty) {
        snap.forEach((d) => {
          fetchedContacts.push(mapDocToLightweightContact(d.id, d.data()));
        });
      }
    } catch (e) {
      console.warn('[KosCrm OnDemand] Targeted contacts query notice:', e);
    }
  }

  // סינון עדין מתוך המדגם הקטן שנמשך (עד 16 רשומות בלבד)
  let pool = fetchedContacts;
  const fk = group.filterKey;
  if (fk && pool.length > 4) {
    const matching = pool.filter((c) => {
      if (fk.field === 'is_lead') return Boolean(c.is_lead || c.contact_type === 'lead');
      if (fk.field === 'vip') return Number(c.total_spent || 0) > 0 || (c.tags || []).some((t) => t.includes('VIP'));
      if (fk.field === 'has_community') return Boolean(c.community);
      if (fk.field === 'community') return c.community === fk.value;
      if (fk.field === 'has_form') return Boolean(c.last_form_name || c.campaign_title);
      return true;
    });
    if (matching.length > 0) {
      pool = matching;
    }
  }

  if (searchQuery && searchQuery.trim()) {
    const qNorm = searchQuery.trim().toLowerCase();
    const searched = pool.filter((c) => {
      const text = `${c.conta_name || ''} ${c.conta_phone || ''} ${c.email || ''} ${c.company_name || ''} ${c.community || ''}`.toLowerCase();
      return text.includes(qNorm);
    });
    if (searched.length > 0) {
      pool = searched;
    }
  }

  // דירוג והחזרת 4 אנשי קשר בלבד! (חוק ה-4 של הבבושקה)
  const ranked = rankContactsDynamically(pool, usageMetrics, userId, 'combined');
  return ranked.slice(0, 4);
}

export interface CrmMinimalSummaryItem {
  id: string;
  title: string;
  summaryLine: string; // שורת הסיכום המעטה בלבד
  badge: string;
  icon: string;
  ctaText: string;
  phone?: string;
  email?: string;
  amount?: number;
  contactRef?: Contact;
  // תמיכה בהתאמה לפונקציה בקוד וביצוע בלחיצה
  actionKey?: string;
  actionPayload?: any;
  targetLayout?: KosunDiscoveryLayoutMode;
  relevanceScore?: number; // 0 - 100 למיון מהמתאים ביותר לפחות מתאים
}

function isBelongingToManagerTenant(docId: string, data: any, activeTenantId: string): boolean {
  const cleanTenant = (activeTenantId || '_master').toLowerCase().trim();
  // בטננט של המנג'ר (_master / kosun) מסננים החוצה רשומות סאב-דומיין של טננטים חיצוניים (כמו lea, mlea, rachelgal, turbo_motors)
  if (cleanTenant === '_master' || cleanTenant === 'kosun') {
    if (docId.startsWith('tenant_admin_')) return false;
    if (data.isSubdomainAdmin === true) return false;
    if (data.subdomain && data.subdomain !== '_master' && data.subdomain !== 'kosun') {
      return false;
    }
    return true;
  }
  // בטננט ספציפי - רק רשומות של אותו טננט
  if (data.subdomain && data.subdomain.toLowerCase() !== cleanTenant) {
    return false;
  }
  return true;
}

/**
 * שליפת מסמכי הטננט הפעיל בלבד (ללא ערבוב טננטים אחרים וללא משיכת כל המסד!)
 */
async function queryManagerTenantDocsLimited(
  firebaseApp: FirebaseApp | undefined,
  tenantId: string,
  contactsCollectionPath?: string,
  maxDocs: number = 24
): Promise<Contact[]> {
  if (!firebaseApp) return [];
  const cleanTenant = (tenantId || '_master').trim();
  const primaryPath = contactsCollectionPath || `tenants/${cleanTenant}/contacts`;
  const results: Contact[] = [];
  const seenIds = new Set<string>();

  try {
    const db = getFirestore(firebaseApp);
    
    // 1. קריאה מהנתיב הראשי של הטננט
    try {
      const colRef = collection(db, primaryPath);
      const snap = await getDocs(query(colRef, limit(maxDocs)));
      snap.forEach((d) => {
        const raw = d.data();
        if (isBelongingToManagerTenant(d.id, raw, cleanTenant)) {
          results.push(mapDocToLightweightContact(d.id, raw));
          seenIds.add(d.id);
        }
      });
    } catch (colErr) {
      console.warn('[KosCrm TenantQuery] Primary col error:', colErr);
    }

    // 2. אם אנחנו בטננט מנהל (_master / kosun) והתוצאות דלות, בודקים נתיב contacts שורשי
    if (results.length < 4 && (cleanTenant === '_master' || cleanTenant === 'kosun')) {
      try {
        const rootRef = collection(db, 'contacts');
        const rootSnap = await getDocs(query(rootRef, limit(maxDocs)));
        rootSnap.forEach((d) => {
          if (!seenIds.has(d.id)) {
            const raw = d.data();
            if (isBelongingToManagerTenant(d.id, raw, cleanTenant)) {
              results.push(mapDocToLightweightContact(d.id, raw));
              seenIds.add(d.id);
            }
          }
        });
      } catch (rootErr) {
        console.warn('[KosCrm TenantQuery] Root contacts fallback notice:', rootErr);
      }
    }
  } catch (e) {
    console.warn('[KosCrm TenantQuery] Scoped fetch notice:', e);
  }

  return results;
}

/**
 * כרטיס 2: משיכת 4 נתוני ההכנסות האחרונות של הטננט בלבד (שורת סיכום מעטה)
 * בודק גם אנשי קשר משלמים וגם עסקאות מקולקציית kesher_transactions
 */
export async function fetchTenantRecentRevenuesOnDemand(params: {
  firebaseApp?: FirebaseApp;
  tenantId: string;
  contactsCollectionPath?: string;
}): Promise<{ summaryLine: string; items: CrmMinimalSummaryItem[] }> {
  const { firebaseApp, tenantId, contactsCollectionPath } = params;
  const cleanTenant = (tenantId || '_master').trim();

  // 1. קודם כל שלוף אנשי קשר של הטננט
  const docs = await queryManagerTenantDocsLimited(
    firebaseApp,
    cleanTenant,
    contactsCollectionPath,
    30
  );

  const payingContacts = docs
    .filter((c) => Number(c.total_spent || 0) > 0 || Number(c.campaign_amount || 0) > 0)
    .sort(
      (a, b) =>
        Number(b.total_spent || b.campaign_amount || 0) -
        Number(a.total_spent || a.campaign_amount || 0)
    );

  const revenueItems: CrmMinimalSummaryItem[] = [];

  // המרת אנשי קשר משלמים
  payingContacts.forEach((c) => {
    const amt = Number(c.total_spent || c.campaign_amount || 0);
    const orders = Number(c.order_count || 1);
    const name = c.kosun_crm_name || c.conta_name || 'לקוח משלם';
    revenueItems.push({
      id: `rev_contact_${c.id}`,
      title: name,
      summaryLine: `₪${amt.toLocaleString()} • ${orders} עסקאות • ${c.conta_phone || c.email || 'פעיל'}`,
      badge: `₪${amt.toLocaleString()}`,
      icon: 'CreditCard',
      ctaText: 'כרטיס לקוח ◀',
      phone: c.conta_phone,
      email: c.email,
      amount: amt,
      contactRef: c,
    });
  });

  // 2. בדיקת עסקאות מקולקציית kesher_transactions של הטננט
  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const txPaths = [
        `tenants/${cleanTenant}/kesher_transactions`,
        ...(cleanTenant === '_master' || cleanTenant === 'kosun' ? ['kesher_transactions'] : []),
      ];

      for (const tPath of txPaths) {
        try {
          const txSnap = await getDocs(query(collection(db, tPath), limit(12)));
          txSnap.forEach((txDoc) => {
            const tData = txDoc.data();
            const txAmt = Number(tData.amount || tData.sum || tData.total || 0);
            if (txAmt > 0) {
              const payer =
                tData.payerName ||
                tData.customerName ||
                tData.clientName ||
                tData.fullName ||
                tData.name ||
                tData.contactName ||
                'תקבול / עסקה';
              const pMethod = tData.paymentMethod || tData.type || 'סליקה';
              const dateStr = tData.date || tData.createdAt || tData.timestamp || '';
              const shortDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';

              revenueItems.push({
                id: `tx_${txDoc.id}`,
                title: payer,
                summaryLine: `₪${txAmt.toLocaleString()} • ${pMethod} ${shortDate ? `• ${shortDate}` : ''}`,
                badge: `₪${txAmt.toLocaleString()}`,
                icon: 'DollarSign',
                ctaText: 'פרטי עסקה ◀',
                phone: tData.phone || tData.payerPhone,
                email: tData.email,
                amount: txAmt,
              });
            }
          });
          if (revenueItems.length >= 4) break;
        } catch {
          // ignore path error and proceed
        }
      }
    } catch (e) {
      console.warn('[KosCrm RevenueQuery] Transactions check notice:', e);
    }
  }

  // מיון לפי הסכום הגבוה לעליון
  revenueItems.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));

  const topFour = revenueItems.slice(0, 4);
  const totalRev = revenueItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    summaryLine:
      topFour.length > 0
        ? `סיכום הכנסות אחרונות לטננט: ₪${totalRev.toLocaleString()} (${revenueItems.length} עסקאות/משלמים)`
        : 'סיכום הכנסות לטננט: טרם נרשמו עסקאות בקולקציית הטננט',
    items: topFour,
  };
}

/**
 * כרטיס 3: משיכת 4 לידים שדורשים טיפול של הטננט בלבד (שורת סיכום מעטה)
 */
export async function fetchTenantLeadsRequiringCareOnDemand(params: {
  firebaseApp?: FirebaseApp;
  tenantId: string;
  contactsCollectionPath?: string;
}): Promise<{ summaryLine: string; items: CrmMinimalSummaryItem[] }> {
  const docs = await queryManagerTenantDocsLimited(
    params.firebaseApp,
    params.tenantId,
    params.contactsCollectionPath,
    20
  );

  const leads = docs.filter(
    (c) => Boolean(c.is_lead || c.contact_type === 'lead' || Number(c.total_spent || 0) === 0)
  );

  const topFour = leads.slice(0, 4).map((c) => {
    const name = c.kosun_crm_name || c.conta_name || 'ליד חדש';
    const src = c.lead_source || c.community || 'פנייה ישירה';
    return {
      id: `lead_${c.id}`,
      title: name,
      summaryLine: `${c.conta_phone || c.email || 'ללא טלפון'} • מקור: ${src}`,
      badge: 'דורש טיפול',
      icon: 'Flame',
      ctaText: c.conta_phone ? 'שלח WhatsApp ◀' : 'טפל בליד ◀',
      phone: c.conta_phone,
      email: c.email,
      contactRef: c,
    };
  });

  return {
    summaryLine:
      leads.length > 0
        ? `סיכום לידים לטננט: מוצגים ${topFour.length} לידים דחופים לטיפול מיידי`
        : 'סיכום לידים לטננט: אין לידים הממתינים לטיפול כעת',
    items: topFour,
  };
}

/**
 * כרטיס 4: ביצוע פעולת תיוג / מיון רבת-משתתפים בשרת עבור הטננט הפעיל בלבד
 */
export async function executeTenantBulkTagActionOnDemand(params: {
  firebaseApp?: FirebaseApp;
  tenantId: string;
  contactsCollectionPath?: string;
  actionType: 'tag_vip' | 'tag_followup' | 'assign_group' | 'tag_campaign';
  customValue?: string;
}): Promise<{ updatedCount: number; summaryMessage: string }> {
  const { firebaseApp, tenantId, contactsCollectionPath, actionType, customValue } = params;
  if (!firebaseApp) {
    return { updatedCount: 0, summaryMessage: 'אין חיבור שרת פעיל' };
  }

  const cleanTenant = tenantId || '_master';
  const colPath = contactsCollectionPath || `tenants/${cleanTenant}/contacts`;
  const docs = await queryManagerTenantDocsLimited(firebaseApp, cleanTenant, colPath, 20);

  let targets: Contact[] = [];
  let tagToApply = customValue || 'מסומן';

  if (actionType === 'tag_vip') {
    targets = docs.filter((c) => Number(c.total_spent || 0) > 0);
    tagToApply = 'לקוח VIP';
  } else if (actionType === 'tag_followup') {
    targets = docs.filter((c) => Boolean(c.is_lead || Number(c.total_spent || 0) === 0));
    tagToApply = 'בטיפול ממוקד';
  } else if (actionType === 'assign_group') {
    targets = docs;
    tagToApply = customValue || 'קהילת המנג׳ר';
  } else {
    targets = docs;
    tagToApply = customValue || 'קמפיין פעיל';
  }

  const db = getFirestore(firebaseApp);
  let count = 0;

  for (const c of targets.slice(0, 12)) {
    if (!c.id) continue;
    try {
      const nextTags = Array.from(new Set([...(c.tags || []), tagToApply]));
      const patch: Record<string, any> = {
        tags: nextTags,
        kosun_crm_tags: nextTags,
        updatedAt: new Date().toISOString(),
      };
      if (actionType === 'assign_group') {
        patch.community = tagToApply;
      }
      await setDoc(doc(db, colPath, c.id), patch, { merge: true });
      count++;
    } catch {}
  }

  return {
    updatedCount: count,
    summaryMessage:
      count > 0
        ? `התיוג "${tagToApply}" הוחל בהצלחה על ${count} אנשי קשר של הטננט!`
        : `לא נמצאו רשומות מתאימות בטננט לתיוג "${tagToApply}"`,
  };
}

/**
 * מפענח שאילתת פילטור בשפה טבעית מול שדות אנשי הקשר בטננט
 */
export interface CrmNaturalQueryFilter {
  textTerms: string[];
  minSpent?: number;
  maxSpent?: number;
  isLead?: boolean;
  isVip?: boolean;
  hasPhone?: boolean;
  hasEmail?: boolean;
  tags?: string[];
  cities?: string[];
  communities?: string[];
  sources?: string[];
  sortBy?: 'spent_desc' | 'orders_desc' | 'recent' | 'name';
  summaryDescription: string;
}

export function parseNaturalCrmFilter(queryText: string): CrmNaturalQueryFilter {
  const norm = (queryText || '').toLowerCase().trim();
  const filter: CrmNaturalQueryFilter = {
    textTerms: [],
    summaryDescription: queryText,
  };

  // בדיקת סכומים: "מעל 1000", "יותר מ 500", "מ-200"
  const overMatch = norm.match(/(?:מעל|יותר מ|גבוה מ|סכום של מעל)\s*(\d+[\d,]*)/);
  if (overMatch) {
    filter.minSpent = Number(overMatch[1].replace(/,/g, ''));
  }
  const underMatch = norm.match(/(?:מתחת|פחות מ|נמוך מ)\s*(\d+[\d,]*)/);
  if (underMatch) {
    filter.maxSpent = Number(underMatch[1].replace(/,/g, ''));
  }

  // סינון לידים / מתעניינים / ללא תשלום
  if (norm.includes('ליד') || norm.includes('מתעניינ') || norm.includes('פנייה') || norm.includes('ללא רכישה')) {
    filter.isLead = true;
  }

  // לקוחות משלמים / VIP
  if (norm.includes('vip') || norm.includes('משלמ') || norm.includes('קנו') || norm.includes('רכישות') || norm.includes('לקוחות עיקריים')) {
    filter.isVip = true;
  }

  // ערים מובילות
  const knownCities = [
    'ירושלים', 'תל אביב', 'בני ברק', 'חיפה', 'פתח תקווה', 'אשדוד', 'נתניה',
    'באר שבע', 'חולון', 'רמת גן', 'רחובות', 'בת ים', 'הרצליה', 'מודיעין',
    'כפר סבא', 'רעננה', 'ביתר עילית', 'מודיעין עילית', 'בית שמש'
  ];
  for (const city of knownCities) {
    if (norm.includes(city.toLowerCase())) {
      filter.cities = filter.cities || [];
      filter.cities.push(city);
    }
  }

  // מקורות הגעה
  const knownSources = ['פייסבוק', 'facebook', 'אינסטגרם', 'instagram', 'גוגל', 'google', 'וואטסאפ', 'whatsapp', 'טופס', 'אתר', 'המלצה'];
  for (const src of knownSources) {
    if (norm.includes(src.toLowerCase())) {
      filter.sources = filter.sources || [];
      filter.sources.push(src);
    }
  }

  // סינון טלפון / מייל
  if (norm.includes('עם טלפון') || norm.includes('שיש להם טלפון')) {
    filter.hasPhone = true;
  }
  if (norm.includes('עם מייל') || norm.includes('שיש להם מייל')) {
    filter.hasEmail = true;
  }

  // מיון
  if (norm.includes('הכי הרבה') || norm.includes('הכנסות גבוהות') || norm.includes('מובילים')) {
    filter.sortBy = 'spent_desc';
  } else if (norm.includes('עסקאות') || norm.includes('הזמנות')) {
    filter.sortBy = 'orders_desc';
  }

  // מונחי חיפוש חופשי (מילים שמנקות מילות קישור נפוצות)
  const stopWords = new Set([
    'תציג', 'הצג', 'תסנן', 'סנן', 'חפש', 'תמצא', 'מצא', 'אנשי', 'קשר', 'לידים', 'לקוחות', 'של',
    'כל', 'את', 'עם', 'מי', 'שקנה', 'שיש', 'בטננט', 'במערכת', 'לי', 'לידים', 'נא', 'בבקשה'
  ]);
  const words = norm.split(/\s+/).filter((w) => w.length > 1 && !stopWords.has(w));
  filter.textTerms = words;

  return filter;
}

/**
 * משיכת אנשי קשר מרובים מהשרת עבור שאילתות פילטור של היועץ (עד 60 רשומות ללא הצפת זיכרון)
 */
async function queryTenantContactsForAdvisor(
  firebaseApp: FirebaseApp | undefined,
  tenantId: string,
  contactsCollectionPath?: string
): Promise<Contact[]> {
  if (!firebaseApp) return [];
  const cleanTenant = (tenantId || '_master').trim();
  const primaryPath = contactsCollectionPath || `tenants/${cleanTenant}/contacts`;
  const results: Contact[] = [];
  const seenIds = new Set<string>();

  try {
    const db = getFirestore(firebaseApp);
    // קריאה מוגדלת ומסודרת של עד 80 רשומות מהשרת
    try {
      const snap = await getDocs(query(collection(db, primaryPath), limit(80)));
      snap.forEach((d) => {
        const raw = d.data();
        if (isBelongingToManagerTenant(d.id, raw, cleanTenant)) {
          results.push(mapDocToLightweightContact(d.id, raw));
          seenIds.add(d.id);
        }
      });
    } catch (colErr) {
      console.warn('[KosCrm AdvisorQuery] Primary fetch notice:', colErr);
    }

    if (results.length < 10 && (cleanTenant === '_master' || cleanTenant === 'kosun')) {
      try {
        const rootSnap = await getDocs(query(collection(db, 'contacts'), limit(80)));
        rootSnap.forEach((d) => {
          if (!seenIds.has(d.id)) {
            const raw = d.data();
            if (isBelongingToManagerTenant(d.id, raw, cleanTenant)) {
              results.push(mapDocToLightweightContact(d.id, raw));
              seenIds.add(d.id);
            }
          }
        });
      } catch (rootErr) {
        console.warn('[KosCrm AdvisorQuery] Root fallback notice:', rootErr);
      }
    }
  } catch (err) {
    console.warn('[KosCrm AdvisorQuery] Execution notice:', err);
  }

  return results;
}

/**
 * היועץ העליון של ה-CRM (Top Advisor):
 * מחובר לקולקציית אנשי הקשר של הטננט ומספק:
 * א. הצעות לפריסת נתונים מותאמת (אקורדיון, זרקור, רשת, בנטו, חפיסה).
 * ב. התאמה חכמה של בקשות המשתמש לפונקציות שקיימות בקוד.
 * ג. פריסת תשובות ב-4 כרטיסיות ממוינות מהתשובה הכי מתאימה (רלוונטיות גבוהה) להכי פחות רלוונטית.
 * ד. בלחיצה על כרטיס מתבצעת הפונקציה והתוצאות שלה מתפרסות על גבי הכרטיסים בפריסה מותאמת.
 */
export async function queryAdvisorCardsOnDemand(params: {
  firebaseApp?: FirebaseApp;
  tenantId: string;
  queryText: string;
  contactsCollectionPath?: string;
}): Promise<{
  advisorReply: string;
  modeTrigger?: 'home' | 'add_assets' | 'revenues' | 'leads' | 'bulk_sort' | 'custom_cards';
  customCards?: CrmMinimalSummaryItem[];
  suggestedLayout?: KosunDiscoveryLayoutMode;
}> {
  const clean = params.queryText.trim();
  const norm = clean.toLowerCase();

  // -------------------------------------------------------------------------
  // א. הצעות לפריסת נתונים (אם המשתמש שואל איך להציג / לשנות עיצוב ופריסה)
  // -------------------------------------------------------------------------
  if (
    norm.includes('פריס') ||
    norm.includes('עיצוב') ||
    norm.includes('תצוגה') ||
    norm.includes('איך להציג') ||
    norm.includes('לשנות מראה') ||
    norm.includes('סגנון')
  ) {
    const layoutSuggestions: CrmMinimalSummaryItem[] = [
      {
        id: 'layout_accordion',
        title: 'פריסת אקורדיון דינמית (Accordion Morph)',
        summaryLine: 'הרחבה חלקה של כרטיס נבחר ומיקוד פוקוס מקסימלי על שורת הנתונים',
        badge: 'המלצה מובילה',
        icon: 'LayoutList',
        ctaText: 'החל פריסה זו ◀',
        actionKey: 'apply_layout',
        targetLayout: 'accordion_morph',
        relevanceScore: 98,
      },
      {
        id: 'layout_glass',
        title: 'פריסת רשת 2x2 (Glass Flip Overlay)',
        summaryLine: 'חלוקה נקייה של 4 כרטיסים על מסך שלם עם היפוך זכוכית בלחיצה',
        badge: 'פופולרי',
        icon: 'Grid2X2',
        ctaText: 'החל פריסה זו ◀',
        actionKey: 'apply_layout',
        targetLayout: 'glass_flip_overlay',
        relevanceScore: 88,
      },
      {
        id: 'layout_spotlight',
        title: 'פריסת זרקור מרכזי (Spotlight Stage)',
        summaryLine: 'כרטיס פעולה בולט בראש המסך ו-3 כרטיסי לווין תומכים מתחתיו',
        badge: 'מיקוד ADHD',
        icon: 'Sparkles',
        ctaText: 'החל פריסה זו ◀',
        actionKey: 'apply_layout',
        targetLayout: 'spotlight_stage',
        relevanceScore: 82,
      },
      {
        id: 'layout_bento',
        title: 'פריסת בנטו מודרנית (Bento Asymmetric)',
        summaryLine: 'כרטיסיות גיאומטריות מדויקות בהשראת KOSUN2026 עם יחס שטח מגוון',
        badge: 'עיצוב פרימיום',
        icon: 'Layers',
        ctaText: 'החל פריסה זו ◀',
        actionKey: 'apply_layout',
        targetLayout: 'bento_asymmetric',
        relevanceScore: 75,
      },
    ];

    layoutSuggestions.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return {
      advisorReply: 'היועץ גיבש עבורך 4 הצעות לפריסת נתונים – לחץ להחלה מיידית:',
      modeTrigger: 'custom_cards',
      customCards: layoutSuggestions,
      suggestedLayout: 'accordion_morph',
    };
  }

  // -------------------------------------------------------------------------
  // ב. שליפת פונקציות חכמות מקולקציית ה-CRM של KOSUN2026 (התאמה לתגיות, שם ויכולות)
  // -------------------------------------------------------------------------
  const matchedFunctions = matchCrmFunctionsForAdvisor(clean);
  const topMatch = matchedFunctions[0];

  // אם נמצאה התאמה חזקה לקולקציית הפונקציות (ציון מעל 25, או מילות מפתח מובהקות)
  const isActionIntent =
    (topMatch && topMatch.score >= 25) ||
    norm.includes('ייבוא') ||
    norm.includes('אקסל') ||
    norm.includes('כרטיס ביקור') ||
    norm.includes('סריקה') ||
    norm.includes('כפילויות') ||
    norm.includes('מיזוג') ||
    norm.includes('סנכרון') ||
    norm.includes('גוגל שיטס') ||
    norm.includes('טפסים') ||
    norm.includes('תיוג') ||
    norm.includes('מחיקה') ||
    norm.includes('קבוצה') ||
    norm.includes('ווטסאפ') ||
    norm.includes('whatsapp') ||
    norm.includes('מנוי') ||
    norm.includes('קופון') ||
    norm.includes('גרף') ||
    norm.includes('סינון') ||
    norm.includes('דוח') ||
    norm.includes('vcard') ||
    norm.includes('פגישה') ||
    norm.includes('שיחה קולית');

  if (isActionIntent && matchedFunctions.length > 0) {
    const actionCards: CrmMinimalSummaryItem[] = matchedFunctions.map((match) => {
      const fn = match.item;
      return {
        id: fn.id,
        title: fn.title,
        summaryLine: `${fn.summary} • ${fn.processStep}`,
        badge: fn.badge,
        icon: fn.icon,
        ctaText: fn.ctaText,
        actionKey: fn.actionKey,
        targetLayout: fn.targetLayout || 'accordion_morph',
        relevanceScore: match.score,
      };
    });

    return {
      advisorReply: `היועץ שלף 4 פונקציות פעולה מתאימות מתוך קולקציית ה-CRM עבור: "${clean}"`,
      modeTrigger: 'custom_cards',
      customCards: actionCards,
      suggestedLayout: actionCards[0]?.targetLayout || 'accordion_morph',
    };
  }

  // -------------------------------------------------------------------------
  // ג. סריקת אנשי הקשר של הטננט ופילטור נתונים מהשרת
  // -------------------------------------------------------------------------
  const docs = await queryTenantContactsForAdvisor(
    params.firebaseApp,
    params.tenantId,
    params.contactsCollectionPath
  );

  const parsedFilter = parseNaturalCrmFilter(clean);

  // חישוב ציון התאמה ורלוונטיות לכל איש קשר (0 עד 100)
  const scoredContacts: Array<{ contact: Contact; score: number; matchReasons: string[] }> = [];

  docs.forEach((c) => {
    let score = 50; // ציון בסיס
    const reasons: string[] = [];
    const spent = Number(c.total_spent || 0) + Number(c.campaign_amount || 0);
    const haystack = `${c.kosun_crm_name || ''} ${c.conta_name || ''} ${c.conta_phone || ''} ${c.email || ''} ${c.community || ''} ${(c.tags || []).join(' ')} ${c.company_name || ''} ${c.kosun_crm_city || c.mh_crm_city || ''}`.toLowerCase();

    // התאמת מונחי טקסט
    if (parsedFilter.textTerms.length > 0) {
      let matchedTerms = 0;
      parsedFilter.textTerms.forEach((term) => {
        if (haystack.includes(term)) matchedTerms++;
      });
      if (matchedTerms > 0) {
        score += (matchedTerms / parsedFilter.textTerms.length) * 35;
        reasons.push('התאמת טקסט');
      } else {
        score -= 30; // אי התאמה
      }
    }

    // התאמת סכום
    if (parsedFilter.minSpent !== undefined) {
      if (spent >= parsedFilter.minSpent) {
        score += 25;
        reasons.push(`סכום ₪${spent.toLocaleString()}`);
      } else {
        score -= 40;
      }
    }

    // התאמת ליד / מתעניין
    if (parsedFilter.isLead) {
      if (c.is_lead || c.contact_type === 'lead' || spent === 0) {
        score += 25;
        reasons.push('ליד פעיל');
      } else {
        score -= 20;
      }
    }

    // התאמת VIP / לקוח משלם
    if (parsedFilter.isVip) {
      if (spent > 0 || (c.tags || []).some((t) => t.includes('VIP'))) {
        score += 25;
        reasons.push('לקוח משלם');
      } else {
        score -= 25;
      }
    }

    // התאמת עיר
    if (parsedFilter.cities && parsedFilter.cities.length > 0) {
      const contactCity = (c.kosun_crm_city || c.mh_crm_city || '').toLowerCase();
      if (parsedFilter.cities.some((ct) => contactCity.includes(ct.toLowerCase()))) {
        score += 25;
        reasons.push(c.kosun_crm_city || c.mh_crm_city || '');
      } else {
        score -= 30;
      }
    }

    // בונוס לפעילות עדכנית
    if (c.conta_phone) score += 5;
    if (spent > 0) score += Math.min(10, Math.floor(spent / 500));

    scoredContacts.push({ contact: c, score, matchReasons: reasons });
  });

  // מיון מדויק מהתשובה הכי מתאימה (רלוונטיות גבוהה) להכי פחות רלוונטית
  scoredContacts.sort((a, b) => b.score - a.score);

  // בחירת 4 הכרטיסים המובילים בלבד
  const topFourScored = scoredContacts.slice(0, 4);

  // קביעת פריסה מותאמת לפי אופי המידע שנמצא
  let bestLayout: KosunDiscoveryLayoutMode = 'accordion_morph';
  const hasHighSpenders = topFourScored.some((sc) => Number(sc.contact.total_spent || 0) > 0);
  if (hasHighSpenders) {
    bestLayout = 'spotlight_stage'; // זרקור עבור משלמים ו-VIP
  } else if (topFourScored.length === 4) {
    bestLayout = 'glass_flip_overlay'; // רשת 2x2 נוחה ובהירה
  }

  const customCards: CrmMinimalSummaryItem[] = topFourScored.map((item, idx) => {
    const c = item.contact;
    const name = c.kosun_crm_name || c.conta_name || 'איש קשר';
    const spent = Number(c.total_spent || c.campaign_amount || 0);
    const city = c.kosun_crm_city || c.mh_crm_city;
    const phone = c.conta_phone || c.email || 'ללא פרטי קשר';
    const relPercent = Math.min(100, Math.max(10, Math.round(item.score)));

    let badgeText = `${relPercent}% התאמה`;
    let iconName = 'UserCheck';

    if (spent > 0) {
      badgeText = `₪${spent.toLocaleString()} • ${relPercent}%`;
      iconName = 'CreditCard';
    } else if (c.is_lead) {
      badgeText = `ליד • ${relPercent}%`;
      iconName = 'Flame';
    }

    const summaryParts = [
      phone,
      city ? `עיר: ${city}` : null,
      spent > 0 ? `${c.order_count || 1} עסקאות` : c.community || 'פעיל בטננט',
      item.matchReasons.length > 0 ? item.matchReasons.join(', ') : null,
    ].filter(Boolean);

    return {
      id: `adv_scored_${c.id}_${idx}`,
      title: name,
      summaryLine: summaryParts.join(' • '),
      badge: badgeText,
      icon: iconName,
      ctaText: 'פתח כרטיס מלא ◀',
      phone: c.conta_phone,
      email: c.email,
      amount: spent,
      contactRef: c,
      actionKey: 'open_contact_360',
      actionPayload: c,
      relevanceScore: relPercent,
      targetLayout: bestLayout,
    };
  });

  const replyMessage =
    topFourScored.length > 0
      ? `נפרסו 4 תוצאות מהמתאימה ביותר לפחות רלוונטית (${topFourScored[0].matchReasons.join(', ')}):`
      : `לא אותרו תוצאות התואמות מדויק את השאילתה "${clean}" — הנה 4 רשומות מהשרת:`;

  return {
    advisorReply: replyMessage,
    modeTrigger: 'custom_cards',
    customCards,
    suggestedLayout: bestLayout,
  };
}


