import { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { BrandStyleIconDef, TenantStylePreset } from '../contracts';

export const PUBLIC_BRAND_ICONS_COLLECTION = 'tenants/_public/brand_icons';
export const PUBLIC_BRAND_ICONS_STORAGE_PREFIX = 'tenants/_public/brand_icons';

export interface PublicBrandIconItem extends BrandStyleIconDef {
  id: string;
  svgUrl: string;
  storagePath: string;
  updatedAt: number;
}

const MEMORY_CACHE = new Map<string, PublicBrandIconItem[]>();

/**
 * Fetches public branding icons from Firestore `public_brand_icons`,
 * optionally filtered by `stylePreset` (e.g. 'feminine').
 */
export async function fetchPublicBrandIcons(
  db: Firestore | null | undefined,
  stylePreset?: TenantStylePreset
): Promise<PublicBrandIconItem[]> {
  if (!db) return [];

  const cacheKey = stylePreset || 'all';
  const cached = MEMORY_CACHE.get(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    const collRef = collection(db, PUBLIC_BRAND_ICONS_COLLECTION);
    const q = stylePreset
      ? query(collRef, where('archetype', '==', stylePreset))
      : collRef;

    const snap = await getDocs(q);
    const items: PublicBrandIconItem[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Partial<PublicBrandIconItem>;
      if (data?.name && data?.archetype) {
        items.push({
          id: docSnap.id,
          name: data.name,
          labelHe: data.labelHe || data.name,
          archetype: data.archetype,
          category: (data.category as BrandStyleIconDef['category']) || 'luxury',
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
          svgUrl: data.svgUrl || '',
          storagePath: data.storagePath || '',
          updatedAt: Number(data.updatedAt) || 0,
        });
      }
    });

    if (items.length > 0) {
      MEMORY_CACHE.set(cacheKey, items);
    }
    return items;
  } catch (err) {
    console.warn('[publicBrandIconsService] Failed to fetch public_brand_icons:', err);
    return [];
  }
}

/**
 * Clears the in-memory cache for public brand icons (e.g. after syncing).
 */
export function clearPublicBrandIconsCache(): void {
  MEMORY_CACHE.clear();
}

/**
 * Uploads all branding icons to Firebase Cloud Storage under `public_brand_icons/{archetype}/{name}.svg`
 * and indexes them in Firestore `public_brand_icons/{archetype}_{name}`.
 */
export async function syncBrandIconsToPublicFirebase(
  app: FirebaseApp,
  db: Firestore,
  icons: BrandStyleIconDef[],
  generateSvgDataUrl: (iconName: string, archetype: TenantStylePreset) => string,
  onProgress?: (done: number, total: number) => void
): Promise<{ syncedCount: number; failedCount: number; lastError?: string }> {
  const bucket = app.options.storageBucket || 'glowmanage.firebasestorage.app';
  const storage = getStorage(app, bucket.startsWith('gs://') ? bucket : `gs://${bucket}`);

  let syncedCount = 0;
  let failedCount = 0;
  let lastError: string | undefined;
  const total = icons.length;

  // Deduplicate by archetype + name
  const seen = new Set<string>();
  const uniqueIcons = icons.filter((ic) => {
    const key = `${ic.archetype}_${ic.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (let i = 0; i < uniqueIcons.length; i++) {
    const item = uniqueIcons[i];
    const safeName = item.name.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    const docId = `${item.archetype}_${safeName}`;
    const storagePath = `${PUBLIC_BRAND_ICONS_STORAGE_PREFIX}/${item.archetype}/${safeName}.svg`;

    try {
      const dataUrl = generateSvgDataUrl(item.name, item.archetype);
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, blob, {
        contentType: 'image/svg+xml',
        cacheControl: 'public,max-age=31536000',
      });
      const svgUrl = await getDownloadURL(storageRef);

      await setDoc(
        doc(db, PUBLIC_BRAND_ICONS_COLLECTION, docId),
        {
          name: item.name,
          labelHe: item.labelHe,
          archetype: item.archetype,
          category: item.category,
          keywords: item.keywords || [],
          svgUrl,
          storagePath,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      syncedCount++;
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`[publicBrandIconsService] Failed syncing ${docId}:`, err);
      failedCount++;
    }

    if (onProgress) {
      onProgress(i + 1, uniqueIcons.length);
    }
  }

  clearPublicBrandIconsCache();
  return { syncedCount, failedCount, lastError };
}
