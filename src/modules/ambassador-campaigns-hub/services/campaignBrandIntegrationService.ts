/**
 * CampaignBrandIntegrationService: Connects Ambassador Campaigns Hub with:
 * 1. Brand DNA Hub (Brand Profile, colors, typography, tone of voice, slogan, logo)
 * 2. CRM Groups Hub (Smart Groups & Communities for ambassador recruitment)
 * 3. Media Gallery Hub (Assets, vibe images, banners, documents)
 *
 * Adheres strictly to Zero Cross-Module Imports rule by communicating via:
 * - Core contracts (BrandDna, EventBus, SYSTEM_COLLECTIONS)
 * - Firestore scoped collections under tenant
 * - Core EventBus for live sync
 */

import { Firestore, doc, getDoc, getDocs, collection, query, limit } from 'firebase/firestore';
import { BrandDna } from '../../../core/contracts';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { eventBus } from '../../../core/bridge/EventBus';

export interface BrandProfileSummary {
  companyName: string;
  organizationType: string;
  slogan: string;
  vision: string;
  shortVision: string;
  logoUrl?: string;
  vibeImages?: string[];
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
  toneOfVoice: {
    formality: number;
    warmth: number;
    luxury: number;
    energy: number;
  };
  powerWords: string[];
  targetAudiences: string[];
}

export interface CrmGroupSummary {
  id: string;
  name: string;
  color: string;
  leaderName?: string;
  targetGoal?: number;
  count?: number;
  isCommunity?: boolean;
  pageSlug?: string;
}

export interface GalleryImageSummary {
  id: string;
  url: string;
  fileName: string;
  title?: string;
  thumbnailUrl?: string;
}

export const FALLBACK_BRAND_PROFILE: BrandProfileSummary = {
  companyName: 'קשואן',
  organizationType: 'עמותה',
  slogan: 'כל אדם זה נכנס',
  vision: 'הנגשת שותפות קהילתית, גיוס משאבים וערבות הדדית.',
  shortVision: 'כל אדם זה נכנס.',
  logoUrl: '',
  vibeImages: [
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=800&auto=format&fit=crop',
  ],
  primaryColor: '#4f46e5',
  secondaryColor: '#0ea5e9',
  backgroundColor: '#0f172a',
  textColor: '#0f172a',
  fontFamily: 'Heebo, sans-serif',
  borderRadius: 'rounded-2xl',
  buttonStyle: 'gradient',
  toneOfVoice: {
    formality: 3,
    warmth: 4,
    luxury: 3,
    energy: 4,
  },
  powerWords: ['שותפות', 'ערבות הדדית', 'שקיפות מלאה', 'השפעה מיידית', 'לב פתוח'],
  targetAudiences: ['בוגרי הקהילה וידידים', 'משפחות ותומכים', 'חברות ועסקים שותפים'],
};

/**
 * Fetch Brand DNA profile exclusively from Firestore DB under tenant path
 */
export async function fetchBrandProfile(
  db: Firestore | null,
  tenantId: string = '_master'
): Promise<BrandProfileSummary> {
  // Query Firestore DB strictly under the tenant path
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS || 'settings', 'brand_dna');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as BrandDna;
        return mapBrandDnaToSummary(data);
      }

      // If specific tenant not found, query root tenant in DB
      if (tenantId !== '_master') {
        const rootDocRef = doc(db, 'tenants', '_master', SYSTEM_COLLECTIONS.SETTINGS || 'settings', 'brand_dna');
        const rootSnap = await getDoc(rootDocRef);
        if (rootSnap.exists()) {
          const rootData = rootSnap.data() as BrandDna;
          return mapBrandDnaToSummary(rootData);
        }
      }

      // Also check settings/brand_dna top-level in DB
      const topLevelRef = doc(db, 'settings', 'brand_dna');
      const topLevelSnap = await getDoc(topLevelRef);
      if (topLevelSnap.exists()) {
        const topData = topLevelSnap.data() as BrandDna;
        return mapBrandDnaToSummary(topData);
      }
    } catch (err) {
      console.warn('[CampaignBrand] Firestore brand_dna read warning:', err);
    }
  }

  return FALLBACK_BRAND_PROFILE;
}

/**
 * Maps raw BrandDna to cleanly structured BrandProfileSummary
 */
export function mapBrandDnaToSummary(dna: any): BrandProfileSummary {
  return {
    companyName: dna?.identity?.companyName || FALLBACK_BRAND_PROFILE.companyName,
    organizationType: dna?.identity?.organizationType || FALLBACK_BRAND_PROFILE.organizationType,
    slogan: dna?.identity?.slogan || FALLBACK_BRAND_PROFILE.slogan,
    vision: dna?.identity?.companyVision || FALLBACK_BRAND_PROFILE.vision,
    shortVision: dna?.identity?.shortVision || FALLBACK_BRAND_PROFILE.shortVision,
    logoUrl: dna?.identity?.logoUrl || '',
    vibeImages: Array.isArray(dna?.identity?.vibeImages) && dna.identity.vibeImages.length > 0
      ? dna.identity.vibeImages
      : FALLBACK_BRAND_PROFILE.vibeImages,
    primaryColor: dna?.designTokens?.primaryColor || '#4f46e5',
    secondaryColor: dna?.designTokens?.secondaryColor || '#0ea5e9',
    backgroundColor: dna?.designTokens?.backgroundColor || '#0f172a',
    textColor: dna?.designTokens?.textColor || '#0f172a',
    fontFamily: dna?.designTokens?.fontFamily || 'Heebo, sans-serif',
    borderRadius: dna?.designTokens?.borderRadius === 'full' ? 'rounded-full' : 'rounded-2xl',
    buttonStyle: dna?.designTokens?.buttonStyle || 'gradient',
    toneOfVoice: {
      formality: dna?.voice?.personality?.formality ?? 3,
      warmth: dna?.voice?.personality?.warmth ?? 4,
      luxury: dna?.voice?.personality?.luxury ?? 3,
      energy: dna?.voice?.personality?.energy ?? 4,
    },
    powerWords: Array.isArray(dna?.voice?.powerWords) && dna.voice.powerWords.length > 0
      ? dna.voice.powerWords
      : FALLBACK_BRAND_PROFILE.powerWords,
    targetAudiences: Array.isArray(dna?.audience?.targetAudiences) && dna.audience.targetAudiences.length > 0
      ? dna.audience.targetAudiences
      : FALLBACK_BRAND_PROFILE.targetAudiences,
  };
}

/**
 * Fetch available CRM Groups from Firestore collection
 */
export async function fetchAvailableCrmGroups(
  db: Firestore | null,
  groupsCollectionPath: string = 'crm_groups'
): Promise<CrmGroupSummary[]> {
  if (!db) {
    return getFallbackCrmGroups();
  }

  try {
    const snap = await getDocs(query(collection(db, groupsCollectionPath), limit(50)));
    if (!snap.empty) {
      return snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: d.name || 'קבוצה ללא שם',
          color: d.color || '#4f46e5',
          leaderName: d.leaderName || '',
          targetGoal: Number(d.targetGoal || 25000),
          count: Number(d.count || 0),
          isCommunity: Boolean(d.isCommunity),
          pageSlug: d.pageSlug || '',
        };
      });
    }
  } catch (err) {
    console.warn('[CampaignBrand] Error fetching CRM groups:', err);
  }

  return getFallbackCrmGroups();
}

/**
 * Fetch available Media Gallery items
 */
export async function fetchAvailableMediaItems(
  db: Firestore | null,
  mediaCollectionPath: string = 'sdo_media_items'
): Promise<GalleryImageSummary[]> {
  if (!db) {
    return getFallbackMediaItems();
  }

  try {
    const snap = await getDocs(query(collection(db, mediaCollectionPath), limit(30)));
    if (!snap.empty) {
      return snap.docs
        .map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            url: d.url || d.downloadUrl || '',
            fileName: d.fileName || d.name || 'תמונה',
            title: d.title || d.fileName || '',
            thumbnailUrl: d.thumbnailUrl || d.url || '',
          };
        })
        .filter((item) => Boolean(item.url));
    }
  } catch (err) {
    console.warn('[CampaignBrand] Error fetching media gallery items:', err);
  }

  return getFallbackMediaItems();
}

/**
 * Listen for Brand DNA changes via eventBus
 */
export function subscribeToBrandDnaUpdates(
  callback: (brand: BrandProfileSummary) => void
): () => void {
  const unsubscribe = eventBus.subscribe('brand:updated', (payload: any) => {
    if (payload?.brandDna) {
      callback(mapBrandDnaToSummary(payload.brandDna));
    }
  });
  return unsubscribe;
}

export function getFallbackCrmGroups(): CrmGroupSummary[] {
  return [
    {
      id: 'grp-1',
      name: 'קהילת בוגרים וידידים',
      color: '#4f46e5',
      leaderName: 'יונתן כהן',
      targetGoal: 50000,
      count: 42,
      isCommunity: true,
    },
    {
      id: 'grp-2',
      name: 'נבחרת שגרירי השרון',
      color: '#059669',
      leaderName: 'דנה שפירא',
      targetGoal: 35000,
      count: 28,
      isCommunity: true,
    },
    {
      id: 'grp-3',
      name: 'חוג ידידי ירושלים',
      color: '#d97706',
      leaderName: 'מיכאל אבנר',
      targetGoal: 40000,
      count: 35,
      isCommunity: true,
    },
    {
      id: 'grp-4',
      name: 'מעגלי מתנדבים וקהילה',
      color: '#dc2626',
      leaderName: 'רחלי לוין',
      targetGoal: 20000,
      count: 54,
      isCommunity: true,
    },
  ];
}

export function getFallbackMediaItems(): GalleryImageSummary[] {
  return [
    {
      id: 'med-1',
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop',
      fileName: 'קהילה_שמחה_מתכנסת.jpg',
      title: 'התכנסות שגרירים שנתית',
    },
    {
      id: 'med-2',
      url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop',
      fileName: 'ילדים_ופעילות_חסד.jpg',
      title: 'פעילות חברתית וחלוקה',
    },
    {
      id: 'med-3',
      url: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=1200&auto=format&fit=crop',
      fileName: 'כנס_ידידים_יוקרתי.jpg',
      title: 'אירוע שותפים מרכזי',
    },
    {
      id: 'med-4',
      url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?w=1200&auto=format&fit=crop',
      fileName: 'ערבות_הדדית_גיוס.jpg',
      title: 'צוות מובילי גיוס',
    },
  ];
}
