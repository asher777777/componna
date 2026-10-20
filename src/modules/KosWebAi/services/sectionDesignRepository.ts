import { Firestore, collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db as defaultFirestoreDb } from '../../../services/firebase';
import { PublicSectionDesignTemplate, extractSectionDesign } from '../types/sectionDesignTemplates';
import { SectionType } from '../types/pageBuilder.types';
import { TenantStylePreset } from '../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';

// Public collection accessible across all tenants
const PUBLIC_SECTION_DESIGNS_COLLECTION = 'tenants/_public/section_designs';

function resolveDb(db?: Firestore | null): Firestore | null {
  return db || defaultFirestoreDb || null;
}

export class SectionDesignRepository {
  /**
   * Save a pure section design (excluding content) into public tenant storage
   * under its designated style preset to expand the style ecosystem.
   */
  static async saveSectionDesign(
    params: {
      sectionType: SectionType;
      stylePreset: TenantStylePreset;
      name: string;
      description?: string;
      rawSectionConfig: Record<string, any>;
      authorTenantId?: string;
      authorName?: string;
    },
    firestoreDb?: Firestore | null
  ): Promise<PublicSectionDesignTemplate> {
    const db = resolveDb(firestoreDb);
    const effTenant = params.authorTenantId || (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || ROOT_TENANT_ID;
    const designId = `des_${params.sectionType}_${params.stylePreset}_${Date.now()}`;

    // Extract pure layout & design properties
    const cleanDesign = extractSectionDesign(params.rawSectionConfig, params.stylePreset);

    const template: PublicSectionDesignTemplate = {
      id: designId,
      sectionType: params.sectionType,
      stylePreset: params.stylePreset,
      name: params.name.trim() || `עיצוב ${params.stylePreset} עבור ${params.sectionType}`,
      description: params.description?.trim() || `עיצוב מודולרי שנשמר בסגנון ${params.stylePreset} לשימוש ציבורי`,
      authorTenantId: effTenant,
      authorName: params.authorName || effTenant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      designConfig: cleanDesign,
      isOfficial: effTenant === ROOT_TENANT_ID || effTenant === '_master',
    };

    if (db) {
      try {
        const docRef = doc(db, PUBLIC_SECTION_DESIGNS_COLLECTION, designId);
        await setDoc(docRef, template, { merge: true });
        console.log(`[SectionDesignRepository] Saved public design ${designId} to Firestore`);
      } catch (err) {
        console.warn(`[SectionDesignRepository] Firestore save failed, using local storage fallback:`, err);
        this.saveToLocalCache(template);
      }
    } else {
      this.saveToLocalCache(template);
    }

    return template;
  }

  /**
   * Retrieve all public section designs, optionally filtered by sectionType and/or stylePreset.
   */
  static async getSectionDesigns(
    filters?: {
      sectionType?: SectionType;
      stylePreset?: TenantStylePreset;
    },
    firestoreDb?: Firestore | null
  ): Promise<PublicSectionDesignTemplate[]> {
    const db = resolveDb(firestoreDb);
    let results: PublicSectionDesignTemplate[] = [];

    if (db) {
      try {
        const colRef = collection(db, PUBLIC_SECTION_DESIGNS_COLLECTION);
        const snapshot = await getDocs(colRef);
        snapshot.forEach((d) => {
          results.push(d.data() as PublicSectionDesignTemplate);
        });
      } catch (err) {
        console.warn('[SectionDesignRepository] Firestore getDocs failed, fallback to local cache:', err);
        results = this.loadFromLocalCache();
      }
    } else {
      results = this.loadFromLocalCache();
    }

    // Merge with any locally saved items
    const local = this.loadFromLocalCache();
    for (const item of local) {
      if (!results.some((r) => r.id === item.id)) {
        results.push(item);
      }
    }

    // Apply filters
    if (filters?.sectionType) {
      results = results.filter((r) => r.sectionType === filters.sectionType);
    }
    if (filters?.stylePreset) {
      results = results.filter((r) => r.stylePreset === filters.stylePreset);
    }

    // Sort newest first
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Delete a section design (only author or master)
   */
  static async deleteSectionDesign(
    designId: string,
    firestoreDb?: Firestore | null
  ): Promise<boolean> {
    const db = resolveDb(firestoreDb);
    if (db) {
      try {
        const docRef = doc(db, PUBLIC_SECTION_DESIGNS_COLLECTION, designId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[SectionDesignRepository] Firestore delete failed:', err);
      }
    }
    this.removeFromLocalCache(designId);
    return true;
  }

  // --- Local cache fallback helpers ---
  private static getCacheKey(): string {
    return 'kosun_public_section_designs_cache';
  }

  private static loadFromLocalCache(): PublicSectionDesignTemplate[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.getCacheKey());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveToLocalCache(item: PublicSectionDesignTemplate): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.loadFromLocalCache().filter((i) => i.id !== item.id);
      list.unshift(item);
      localStorage.setItem(this.getCacheKey(), JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save to local cache', e);
    }
  }

  private static removeFromLocalCache(designId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.loadFromLocalCache().filter((i) => i.id !== designId);
      localStorage.setItem(this.getCacheKey(), JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to remove from local cache', e);
    }
  }
}
