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
  totalCostUSD: number; // Actual platform production cost paid to Google
  totalCostILS: number;
  retailBilledUSD?: number; // Standard retail value billed/charged to client
  retailBilledILS?: number;
  grossProfitUSD?: number;  // Platform margin (retailBilled - actualCost)
  grossProfitILS?: number;
  cachedTokens?: number;    // Tokens served from Context Caching (90% cheaper)
  cacheHitRatio?: number;   // Percentage of cached tokens over total tokens
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
    retailBilledUSD: 0,
    retailBilledILS: 0,
    grossProfitUSD: 0,
    grossProfitILS: 0,
    cachedTokens: 0,
    cacheHitRatio: 0,
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
      retailBilledUSD?: number;
      cachedTokens?: number;
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
    const cached = Math.max(0, Math.round(additional?.cachedTokens || 0));

    // Real cost paid to Google (with Context Caching discount if applicable)
    const costUSD = Number((additional?.costUSD ?? (tokens * 0.00000075)).toFixed(6));
    const costILS = Number((costUSD * 3.70).toFixed(6));

    // Retail standard price charged to customer (always market rate)
    const retailBilledUSD = Number((additional?.retailBilledUSD ?? (tokens * 0.0000015)).toFixed(6));
    const retailBilledILS = Number((retailBilledUSD * 3.70).toFixed(6));

    // Platform gross profit
    const grossProfitUSD = Math.max(0, Number((retailBilledUSD - costUSD).toFixed(6)));
    const grossProfitILS = Number((grossProfitUSD * 3.70).toFixed(6));

    const images = additional?.images || (category === 'gallery' ? 1 : 0);
    const seconds = additional?.heygenSeconds || (category === 'video' ? 10 : 0);
    const now = new Date().toISOString();

    // 1. Update in-memory cache immediately
    const existing = inMemoryTokenCache.get(cleanId) || getDefaultTokenUsage(cleanId);
    const newTotalTokens = existing.totalTokens + tokens;
    const newCachedTokens = (existing.cachedTokens || 0) + cached;
    const cacheHitRatio = newTotalTokens > 0 ? Number(((newCachedTokens / newTotalTokens) * 100).toFixed(1)) : 0;

    const updated: TenantTokenUsage = {
      ...existing,
      totalTokens: newTotalTokens,
      totalCostUSD: Number((existing.totalCostUSD + costUSD).toFixed(6)),
      totalCostILS: Number((existing.totalCostILS + costILS).toFixed(6)),
      retailBilledUSD: Number(((existing.retailBilledUSD || 0) + retailBilledUSD).toFixed(6)),
      retailBilledILS: Number(((existing.retailBilledILS || 0) + retailBilledILS).toFixed(6)),
      grossProfitUSD: Number(((existing.grossProfitUSD || 0) + grossProfitUSD).toFixed(6)),
      grossProfitILS: Number(((existing.grossProfitILS || 0) + grossProfitILS).toFixed(6)),
      cachedTokens: newCachedTokens,
      cacheHitRatio,
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
            retailBilledUSD: increment(retailBilledUSD),
            retailBilledILS: increment(retailBilledILS),
            grossProfitUSD: increment(grossProfitUSD),
            grossProfitILS: increment(grossProfitILS),
            cachedTokens: increment(cached),
            [`${category}Tokens`]: increment(tokens),
            imageGenerationsCount: increment(images),
            heygenVideoSeconds: increment(seconds),
            monthlyQuota: existing.monthlyQuota || DEFAULT_MONTHLY_TOKEN_QUOTA,
            lastUsedAt: now,
            updatedAt: now,
          },
          { merge: true }
        );

        // Also mirror tokenUsage onto tenant root doc for instant availability in tenant collections
        if (cleanId !== ROOT_TENANT_ID) {
          setDoc(doc(db, 'tenants', cleanId), { tokenUsage: updated, updatedAt: now }, { merge: true }).catch(() => {});
        }

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
              retailBilledUSD: increment(retailBilledUSD),
              retailBilledILS: increment(retailBilledILS),
              grossProfitUSD: increment(grossProfitUSD),
              grossProfitILS: increment(grossProfitILS),
              cachedTokens: increment(cached),
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
            let aggTotalTokens = 0;
            let aggCostUSD = 0;
            let aggCostILS = 0;
            let aggRetailUSD = 0;
            let aggRetailILS = 0;
            let aggProfitUSD = 0;
            let aggProfitILS = 0;
            let aggCachedTokens = 0;
            let aggGallery = 0;
            let aggVideo = 0;
            let aggContent = 0;
            let aggChatbot = 0;
            let aggImages = 0;
            let aggHeygen = 0;

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
                  aggRetailUSD += Number(ud.retailBilledUSD) || 0;
                  aggRetailILS += Number(ud.retailBilledILS) || 0;
                  aggProfitUSD += Number(ud.grossProfitUSD) || 0;
                  aggProfitILS += Number(ud.grossProfitILS) || 0;
                  aggCachedTokens += Number(ud.cachedTokens) || 0;
                  aggGallery += Number(ud.galleryTokens) || 0;
                  aggVideo += Number(ud.videoTokens) || 0;
                  aggContent += Number(ud.contentTokens) || 0;
                  aggChatbot += Number(ud.chatbotTokens) || 0;
                  aggImages += Number(ud.imageGenerationsCount) || 0;
                  aggHeygen += Number(ud.heygenVideoSeconds) || 0;
                }
              } catch {}
            }

            const aggHitRatio = aggTotalTokens > 0 ? Number(((aggCachedTokens / aggTotalTokens) * 100).toFixed(1)) : 0;

            const aggregated: TenantTokenUsage = {
              subdomain: ROOT_TENANT_ID,
              totalTokens: aggTotalTokens,
              totalCostUSD: Number(aggCostUSD.toFixed(6)),
              totalCostILS: Number(aggCostILS.toFixed(6)),
              retailBilledUSD: Number(aggRetailUSD.toFixed(6)),
              retailBilledILS: Number(aggRetailILS.toFixed(6)),
              grossProfitUSD: Number(aggProfitUSD.toFixed(6)),
              grossProfitILS: Number(aggProfitILS.toFixed(6)),
              cachedTokens: aggCachedTokens,
              cacheHitRatio: aggHitRatio,
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
          const totalT = Number(data.totalTokens) || 0;
          const cachedT = Number(data.cachedTokens) || 0;
          const hitRatio = totalT > 0 ? Number(((cachedT / totalT) * 100).toFixed(1)) : 0;

          const parsed: TenantTokenUsage = {
            subdomain: cleanId,
            totalTokens: totalT,
            totalCostUSD: Number(data.totalCostUSD) || 0,
            totalCostILS: Number(data.totalCostILS) || 0,
            retailBilledUSD: Number(data.retailBilledUSD) || Number((totalT * 0.0000015).toFixed(6)),
            retailBilledILS: Number(data.retailBilledILS) || Number((totalT * 0.0000015 * 3.70).toFixed(6)),
            grossProfitUSD: Number(data.grossProfitUSD) || 0,
            grossProfitILS: Number(data.grossProfitILS) || 0,
            cachedTokens: cachedT,
            cacheHitRatio: hitRatio,
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
