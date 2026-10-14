/**
 * Universal Tenant Token Usage Tracker (מונה טוקנים מבודד סאב-דומיינים)
 * KOSUN26 Architecture: Tracks all AI token consumption per tenant (Gallery, HeyGen/Video, Content, Chatbots).
 * Stored in Firestore under: tenants/{tenantId}/settings/token_usage
 */

import { Firestore, doc, getDoc, setDoc, onSnapshot, increment, collection, getDocs, getFirestore } from 'firebase/firestore';
import { getApps } from 'firebase/app';
import { ROOT_TENANT_ID, resolveCurrentTenantId } from '../tenant/tenantResolver';

export interface TenantTokenUsage {
  subdomain: string;
  totalTokens: number;
  totalCostUSD: number;
  totalCostILS: number;
  galleryTokens: number;
  videoTokens: number;
  contentTokens: number;
  chatbotTokens: number;
  imageGenerationsCount: number;
  heygenVideoSeconds: number;
  monthlyQuota: number;
  lastUsedAt?: string;
  updatedAt?: string;
}

export const DEFAULT_MONTHLY_TOKEN_QUOTA = 1_000_000; // 1M tokens quota by default

const inMemoryTokenCache = new Map<string, TenantTokenUsage>();

let activeGlobalFirestore: Firestore | undefined;

export function setTokenTrackerFirestore(db: Firestore | undefined) {
  if (db) {
    activeGlobalFirestore = db;
  }
}

export function getEffectiveFirestore(provided?: Firestore): Firestore | undefined {
  if (provided) return provided;
  if (activeGlobalFirestore) return activeGlobalFirestore;
  try {
    const apps = getApps();
    if (apps.length > 0) {
      const db = getFirestore(apps[0]);
      activeGlobalFirestore = db;
      return db;
    }
  } catch {}
  return undefined;
}

export function getDefaultTokenUsage(subdomain: string): TenantTokenUsage {
  return {
    subdomain: subdomain || ROOT_TENANT_ID,
    totalTokens: 0,
    totalCostUSD: 0,
    totalCostILS: 0,
    galleryTokens: 0,
    videoTokens: 0,
    contentTokens: 0,
    chatbotTokens: 0,
    imageGenerationsCount: 0,
    heygenVideoSeconds: 0,
    monthlyQuota: DEFAULT_MONTHLY_TOKEN_QUOTA,
    lastUsedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export class TenantTokenTracker {
  /**
   * Record token consumption for a tenant and broadcast live update
   */
  static async recordTokenUsage(
    tenantId: string | undefined,
    category: 'gallery' | 'video' | 'content' | 'chatbot',
    tokenCount: number,
    additional?: {
      costUSD?: number;
      heygenSeconds?: number;
      images?: number;
      db?: Firestore;
    }
  ): Promise<void> {
    const activeFromResolver = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
    const resolvedTenant = (tenantId && tenantId !== ROOT_TENANT_ID) 
      ? tenantId 
      : ((activeFromResolver && activeFromResolver !== ROOT_TENANT_ID) ? activeFromResolver : (tenantId || ROOT_TENANT_ID));
    const cleanId = resolvedTenant.trim().toLowerCase();
    const tokens = Math.max(0, Math.round(tokenCount));
    const costUSD = Number((additional?.costUSD || (tokens * 0.00000035)).toFixed(6));
    const costILS = Number((costUSD * 3.70).toFixed(6));
    const images = additional?.images || (category === 'gallery' ? 1 : 0);
    const seconds = additional?.heygenSeconds || (category === 'video' ? 10 : 0);
    const now = new Date().toISOString();

    // 1. Update in-memory cache immediately
    const existing = inMemoryTokenCache.get(cleanId) || getDefaultTokenUsage(cleanId);
    const updated: TenantTokenUsage = {
      ...existing,
      totalTokens: existing.totalTokens + tokens,
      totalCostUSD: Number((existing.totalCostUSD + costUSD).toFixed(6)),
      totalCostILS: Number((existing.totalCostILS + costILS).toFixed(6)),
      galleryTokens: existing.galleryTokens + (category === 'gallery' ? tokens : 0),
      videoTokens: existing.videoTokens + (category === 'video' ? tokens : 0),
      contentTokens: existing.contentTokens + (category === 'content' ? tokens : 0),
      chatbotTokens: existing.chatbotTokens + (category === 'chatbot' ? tokens : 0),
      imageGenerationsCount: existing.imageGenerationsCount + images,
      heygenVideoSeconds: existing.heygenVideoSeconds + seconds,
      lastUsedAt: now,
      updatedAt: now,
    };
    inMemoryTokenCache.set(cleanId, updated);

    // 2. Broadcast live event in browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kosun_tenant_tokens_updated', {
          detail: { tenantId: cleanId, usage: updated, category, deltaTokens: tokens },
        })
      );
    }

    // 3. Persist to Firestore
    const db = getEffectiveFirestore(additional?.db);
    if (db) {
      try {
        const usageDocRef = doc(db, 'tenants', cleanId, 'settings', 'token_usage');
        await setDoc(
          usageDocRef,
          {
            subdomain: cleanId,
            totalTokens: increment(tokens),
            totalCostUSD: increment(costUSD),
            totalCostILS: increment(costILS),
            [`${category}Tokens`]: increment(tokens),
            imageGenerationsCount: increment(images),
            heygenVideoSeconds: increment(seconds),
            monthlyQuota: existing.monthlyQuota || DEFAULT_MONTHLY_TOKEN_QUOTA,
            lastUsedAt: now,
            updatedAt: now,
          },
          { merge: true }
        );

        // If recording for a subdomain, also increment master platform counter
        if (cleanId !== ROOT_TENANT_ID) {
          const masterUsageRef = doc(db, 'tenants', ROOT_TENANT_ID, 'settings', 'token_usage');
          await setDoc(
            masterUsageRef,
            {
              subdomain: ROOT_TENANT_ID,
              totalTokens: increment(tokens),
              totalCostUSD: increment(costUSD),
              totalCostILS: increment(costILS),
              [`${category}Tokens`]: increment(tokens),
              imageGenerationsCount: increment(images),
              heygenVideoSeconds: increment(seconds),
              updatedAt: now,
              lastUsedAt: now,
            },
            { merge: true }
          ).catch(() => {});
        }
      } catch (err) {
        console.warn(`[TenantTokenTracker] Error persisting token usage for ${cleanId}:`, err);
      }
    }
  }

  /**
   * Get current token usage for a tenant
   */
  static async getTenantTokenUsage(db: Firestore | undefined, tenantId: string): Promise<TenantTokenUsage> {
    const cleanId = (tenantId || ROOT_TENANT_ID).trim().toLowerCase();
    const effectiveDb = getEffectiveFirestore(db);

    if (effectiveDb) {
      try {
        const usageDocRef = doc(effectiveDb, 'tenants', cleanId, 'settings', 'token_usage');
        const snap = await getDoc(usageDocRef);
        const directData = snap.exists() ? snap.data() : null;

        // If checking master, aggregate all tenant token usages to reflect total platform consumption
        if (cleanId === ROOT_TENANT_ID) {
          try {
            const tenantsSnap = await getDocs(collection(effectiveDb, 'tenants'));
            let aggTotalTokens = Number(directData?.totalTokens) || 0;
            let aggCostUSD = Number(directData?.totalCostUSD) || 0;
            let aggCostILS = Number(directData?.totalCostILS) || 0;
            let aggGallery = Number(directData?.galleryTokens) || 0;
            let aggVideo = Number(directData?.videoTokens) || 0;
            let aggContent = Number(directData?.contentTokens) || 0;
            let aggChatbot = Number(directData?.chatbotTokens) || 0;
            let aggImages = Number(directData?.imageGenerationsCount) || 0;
            let aggHeygen = Number(directData?.heygenVideoSeconds) || 0;

            for (const tDoc of tenantsSnap.docs) {
              const subId = tDoc.id.toLowerCase();
              if (subId === ROOT_TENANT_ID || subId === 'admin' || subId === 'www') continue;
              try {
                const subUsageSnap = await getDoc(doc(effectiveDb, 'tenants', subId, 'settings', 'token_usage'));
                if (subUsageSnap.exists()) {
                  const ud = subUsageSnap.data();
                  aggTotalTokens += Number(ud.totalTokens) || 0;
                  aggCostUSD += Number(ud.totalCostUSD) || 0;
                  aggCostILS += Number(ud.totalCostILS) || 0;
                  aggGallery += Number(ud.galleryTokens) || 0;
                  aggVideo += Number(ud.videoTokens) || 0;
                  aggContent += Number(ud.contentTokens) || 0;
                  aggChatbot += Number(ud.chatbotTokens) || 0;
                  aggImages += Number(ud.imageGenerationsCount) || 0;
                  aggHeygen += Number(ud.heygenVideoSeconds) || 0;
                }
              } catch {}
            }

            const aggregated: TenantTokenUsage = {
              subdomain: ROOT_TENANT_ID,
              totalTokens: aggTotalTokens,
              totalCostUSD: Number(aggCostUSD.toFixed(6)),
              totalCostILS: Number(aggCostILS.toFixed(6)),
              galleryTokens: aggGallery,
              videoTokens: aggVideo,
              contentTokens: aggContent,
              chatbotTokens: aggChatbot,
              imageGenerationsCount: aggImages,
              heygenVideoSeconds: aggHeygen,
              monthlyQuota: 10_000_000,
              lastUsedAt: directData?.lastUsedAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            inMemoryTokenCache.set(ROOT_TENANT_ID, aggregated);
            await setDoc(usageDocRef, aggregated, { merge: true });
            return aggregated;
          } catch (aggErr) {
            console.warn('[TenantTokenTracker] Master aggregation warning:', aggErr);
          }
        }

        if (snap.exists()) {
          const data = snap.data();
          const parsed: TenantTokenUsage = {
            subdomain: cleanId,
            totalTokens: Number(data.totalTokens) || 0,
            totalCostUSD: Number(data.totalCostUSD) || 0,
            totalCostILS: Number(data.totalCostILS) || 0,
            galleryTokens: Number(data.galleryTokens) || 0,
            videoTokens: Number(data.videoTokens) || 0,
            contentTokens: Number(data.contentTokens) || 0,
            chatbotTokens: Number(data.chatbotTokens) || 0,
            imageGenerationsCount: Number(data.imageGenerationsCount) || 0,
            heygenVideoSeconds: Number(data.heygenVideoSeconds) || 0,
            monthlyQuota: Number(data.monthlyQuota) || DEFAULT_MONTHLY_TOKEN_QUOTA,
            lastUsedAt: data.lastUsedAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
          inMemoryTokenCache.set(cleanId, parsed);
          return parsed;
        }
      } catch (err) {
        console.warn(`[TenantTokenTracker] Error loading tokens for ${cleanId}:`, err);
      }
    }

    return inMemoryTokenCache.get(cleanId) || getDefaultTokenUsage(cleanId);
  }

  /**
   * Real-time subscription to tenant token changes
   */
  static subscribe(
    db: Firestore | undefined,
    tenantId: string,
    callback: (usage: TenantTokenUsage) => void
  ): () => void {
    const cleanId = (tenantId || ROOT_TENANT_ID).trim().toLowerCase();
    const effectiveDb = getEffectiveFirestore(db);

    // Send cached initial data
    const cached = inMemoryTokenCache.get(cleanId) || getDefaultTokenUsage(cleanId);
    callback(cached);

    // Browser event listener for instant responsiveness
    const handleEvent = (e: any) => {
      if (e?.detail?.tenantId === cleanId && e?.detail?.usage) {
        callback(e.detail.usage);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('kosun_tenant_tokens_updated', handleEvent);
    }

    let unsubscribeFirestore = () => {};
    if (effectiveDb) {
      try {
        const docRef = doc(effectiveDb, 'tenants', cleanId, 'settings', 'token_usage');
        unsubscribeFirestore = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const parsed: TenantTokenUsage = {
              subdomain: cleanId,
              totalTokens: Number(data.totalTokens) || 0,
              totalCostUSD: Number(data.totalCostUSD) || 0,
              totalCostILS: Number(data.totalCostILS) || 0,
              galleryTokens: Number(data.galleryTokens) || 0,
              videoTokens: Number(data.videoTokens) || 0,
              contentTokens: Number(data.contentTokens) || 0,
              chatbotTokens: Number(data.chatbotTokens) || 0,
              imageGenerationsCount: Number(data.imageGenerationsCount) || 0,
              heygenVideoSeconds: Number(data.heygenVideoSeconds) || 0,
              monthlyQuota: Number(data.monthlyQuota) || DEFAULT_MONTHLY_TOKEN_QUOTA,
              lastUsedAt: data.lastUsedAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            };
            inMemoryTokenCache.set(cleanId, parsed);
            callback(parsed);
          }
        });
      } catch (err) {
        console.warn(`[TenantTokenTracker] Subscribe warning for ${cleanId}:`, err);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kosun_tenant_tokens_updated', handleEvent);
      }
      unsubscribeFirestore();
    };
  }

  /**
   * Reset or re-set token quota
   */
  static async updateQuota(db: Firestore | undefined, tenantId: string, newQuota: number): Promise<void> {
    const cleanId = (tenantId || ROOT_TENANT_ID).trim().toLowerCase();
    const effectiveDb = db || activeGlobalFirestore;
    const existing = inMemoryTokenCache.get(cleanId) || getDefaultTokenUsage(cleanId);
    const updated = { ...existing, monthlyQuota: newQuota };
    inMemoryTokenCache.set(cleanId, updated);

    if (effectiveDb) {
      const docRef = doc(effectiveDb, 'tenants', cleanId, 'settings', 'token_usage');
      await setDoc(docRef, { monthlyQuota: newQuota, updatedAt: new Date().toISOString() }, { merge: true });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kosun_tenant_tokens_updated', {
          detail: { tenantId: cleanId, usage: updated },
        })
      );
    }
  }
}
