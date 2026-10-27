import { FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { Contact, CustomField } from '../types';

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
 * קריאת מטריקות שימוש מ-LocalStorage (תגובה מיידית 0ms)
 */
export function loadLocalUsageMetrics(tenantId: string): Record<string, EntityUsageRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${LOCAL_USAGE_STORAGE_PREFIX}${tenantId || '_master'}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[KosCrmDynamicGroups] Local usage load notice:', e);
  }
  return {};
}

/**
 * שמירת מטריקות שימוש ל-LocalStorage
 */
export function saveLocalUsageMetrics(
  tenantId: string,
  metrics: Record<string, EntityUsageRecord>
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${LOCAL_USAGE_STORAGE_PREFIX}${tenantId || '_master'}`,
      JSON.stringify(metrics)
    );
  } catch (e) {
    console.warn('[KosCrmDynamicGroups] Local usage save notice:', e);
  }
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
    .sort((a, b) => b.totalDynamicScore - a.totalDynamicScore);
}
