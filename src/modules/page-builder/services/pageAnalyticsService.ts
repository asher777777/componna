import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';

export interface PageAnalyticsTelemetry {
  pageId: string;
  tenantId: string;
  googleAnalyticsId?: string;
  views: number;
  uniqueVisitors: number;
  sessions: number;
  ctaClicks: number;
  leadsCount: number;
  whatsappClicks: number;
  phoneClicks: number;
  bounceRatePercent: number;
  avgTimeOnPageSec: number;
  liveActiveVisitors: number;
  sources: {
    google: number;
    direct: number;
    social: number;
    aiSearch: number; // ChatGPT, Gemini, Perplexity, Claude citations
    other: number;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  lastGaSync?: string;
  lastEventAt: string;
  recentEvents: Array<{
    id: string;
    type: 'page_view' | 'cta_click' | 'whatsapp' | 'phone' | 'lead';
    source: string;
    timestamp: string;
    details?: string;
  }>;
}

function resolveEffectiveTenant(tenantId?: string): string {
  if (!tenantId || tenantId === ROOT_TENANT_ID || tenantId === '_master') {
    return ROOT_TENANT_ID;
  }
  return tenantId;
}

function getAnalyticsCollectionPath(tenantId?: string): string {
  const eff = resolveEffectiveTenant(tenantId);
  return eff === ROOT_TENANT_ID
    ? 'tenants/_master/page_analytics_telemetry'
    : `tenants/${eff}/page_analytics_telemetry`;
}

function getLocalAnalyticsKey(tenantId: string | undefined, pageId: string): string {
  const eff = resolveEffectiveTenant(tenantId);
  return `kosun_${eff}_analytics_${pageId}`;
}

const DEFAULT_METRICS: Omit<PageAnalyticsTelemetry, 'pageId' | 'tenantId'> = {
  views: 0,
  uniqueVisitors: 0,
  sessions: 0,
  ctaClicks: 0,
  leadsCount: 0,
  whatsappClicks: 0,
  phoneClicks: 0,
  bounceRatePercent: 32,
  avgTimeOnPageSec: 85,
  liveActiveVisitors: 1,
  sources: {
    google: 0,
    direct: 0,
    social: 0,
    aiSearch: 0,
    other: 0,
  },
  devices: {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  },
  lastEventAt: new Date().toISOString(),
  recentEvents: [],
};

export const pageAnalyticsService = {
  /**
   * Retrieves analytics telemetry for a specific page under the tenant scope.
   */
  async getPageAnalytics(
    db: Firestore | null | undefined,
    tenantId: string | undefined,
    pageId: string
  ): Promise<PageAnalyticsTelemetry> {
    const eff = resolveEffectiveTenant(tenantId);
    const localKey = getLocalAnalyticsKey(eff, pageId);

    // Try Firestore if connected
    if (db) {
      try {
        const colPath = getAnalyticsCollectionPath(eff);
        const docRef = doc(db, colPath, pageId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as PageAnalyticsTelemetry;
          try {
            localStorage.setItem(localKey, JSON.stringify(data));
          } catch (_) {}
          return data;
        }
      } catch (err) {
        console.warn('[pageAnalyticsService] Error reading from Firestore:', err);
      }
    }

    // Try LocalStorage
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}

    return {
      pageId,
      tenantId: eff,
      ...DEFAULT_METRICS,
    };
  },

  /**
   * Subscribes to real-time analytics updates for a page in Firestore.
   */
  subscribePageAnalytics(
    db: Firestore | null | undefined,
    tenantId: string | undefined,
    pageId: string,
    callback: (data: PageAnalyticsTelemetry) => void
  ): () => void {
    const eff = resolveEffectiveTenant(tenantId);
    if (!db) {
      this.getPageAnalytics(null, eff, pageId).then(callback);
      return () => {};
    }

    try {
      const colPath = getAnalyticsCollectionPath(eff);
      const docRef = doc(db, colPath, pageId);
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as PageAnalyticsTelemetry;
            callback(data);
          } else {
            callback({
              pageId,
              tenantId: eff,
              ...DEFAULT_METRICS,
            });
          }
        },
        (error) => {
          console.warn('[pageAnalyticsService] Snapshot listener error:', error);
          this.getPageAnalytics(null, eff, pageId).then(callback);
        }
      );
    } catch (err) {
      console.warn('[pageAnalyticsService] Could not establish snapshot listener:', err);
      return () => {};
    }
  },

  /**
   * Records a page view event with referrer detection (including AI search referrals like ChatGPT, Perplexity, Gemini).
   */
  async recordPageView(
    db: Firestore | null | undefined,
    tenantId: string | undefined,
    pageId: string,
    gaId?: string
  ): Promise<void> {
    const eff = resolveEffectiveTenant(tenantId);
    const referrer = typeof document !== 'undefined' ? document.referrer || '' : '';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);

    let trafficSource: 'google' | 'direct' | 'social' | 'aiSearch' | 'other' = 'direct';
    if (/chatgpt|openai|perplexity|claude|gemini|bard/i.test(referrer)) {
      trafficSource = 'aiSearch';
    } else if (/google\./i.test(referrer)) {
      trafficSource = 'google';
    } else if (/facebook|instagram|linkedin|twitter|t\.co|tiktok/i.test(referrer)) {
      trafficSource = 'social';
    } else if (referrer) {
      trafficSource = 'other';
    }

    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const nowIso = new Date().toISOString();

    // Check if unique visitor session
    const sessionKey = `kosun_visited_${pageId}`;
    const isUnique = !sessionStorage.getItem(sessionKey);
    if (isUnique) {
      try {
        sessionStorage.setItem(sessionKey, '1');
      } catch (_) {}
    }

    const eventEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'page_view' as const,
      source: trafficSource,
      timestamp: nowIso,
      details: referrer ? `Referrer: ${referrer.slice(0, 50)}` : 'Direct visit',
    };

    if (db) {
      try {
        const colPath = getAnalyticsCollectionPath(eff);
        const docRef = doc(db, colPath, pageId);
        await setDoc(
          docRef,
          {
            pageId,
            tenantId: eff,
            googleAnalyticsId: gaId || '',
            views: increment(1),
            uniqueVisitors: isUnique ? increment(1) : increment(0),
            sessions: isUnique ? increment(1) : increment(0),
            [`sources.${trafficSource}`]: increment(1),
            [`devices.${deviceType}`]: increment(1),
            lastEventAt: nowIso,
            recentEvents: arrayUnion(eventEntry),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('[pageAnalyticsService] Failed to record page view in Firestore:', err);
      }
    }

    // Always update local cache
    try {
      const localKey = getLocalAnalyticsKey(eff, pageId);
      const existing = localStorage.getItem(localKey);
      const parsed: PageAnalyticsTelemetry = existing
        ? JSON.parse(existing)
        : { pageId, tenantId: eff, ...DEFAULT_METRICS };

      parsed.views = (parsed.views || 0) + 1;
      if (isUnique) parsed.uniqueVisitors = (parsed.uniqueVisitors || 0) + 1;
      parsed.sources[trafficSource] = (parsed.sources[trafficSource] || 0) + 1;
      parsed.devices[deviceType] = (parsed.devices[deviceType] || 0) + 1;
      parsed.lastEventAt = nowIso;
      parsed.recentEvents = [eventEntry, ...(parsed.recentEvents || [])].slice(0, 15);

      localStorage.setItem(localKey, JSON.stringify(parsed));
    } catch (_) {}
  },

  /**
   * Records a CTA click or conversion action.
   */
  async recordInteraction(
    db: Firestore | null | undefined,
    tenantId: string | undefined,
    pageId: string,
    type: 'cta_click' | 'whatsapp' | 'phone' | 'lead',
    label?: string
  ): Promise<void> {
    const eff = resolveEffectiveTenant(tenantId);
    const nowIso = new Date().toISOString();

    const eventEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      source: label || 'interaction',
      timestamp: nowIso,
      details: label || type,
    };

    if (db) {
      try {
        const colPath = getAnalyticsCollectionPath(eff);
        const docRef = doc(db, colPath, pageId);

        const updates: any = {
          lastEventAt: nowIso,
          recentEvents: arrayUnion(eventEntry),
        };

        if (type === 'cta_click') updates.ctaClicks = increment(1);
        if (type === 'whatsapp') updates.whatsappClicks = increment(1);
        if (type === 'phone') updates.phoneClicks = increment(1);
        if (type === 'lead') updates.leadsCount = increment(1);

        await updateDoc(docRef, updates);
      } catch (err) {
        console.warn('[pageAnalyticsService] Failed updating interaction in Firestore:', err);
      }
    }

    // Local storage sync
    try {
      const localKey = getLocalAnalyticsKey(eff, pageId);
      const existing = localStorage.getItem(localKey);
      if (existing) {
        const parsed: PageAnalyticsTelemetry = JSON.parse(existing);
        if (type === 'cta_click') parsed.ctaClicks = (parsed.ctaClicks || 0) + 1;
        if (type === 'whatsapp') parsed.whatsappClicks = (parsed.whatsappClicks || 0) + 1;
        if (type === 'phone') parsed.phoneClicks = (parsed.phoneClicks || 0) + 1;
        if (type === 'lead') parsed.leadsCount = (parsed.leadsCount || 0) + 1;
        parsed.lastEventAt = nowIso;
        parsed.recentEvents = [eventEntry, ...(parsed.recentEvents || [])].slice(0, 15);
        localStorage.setItem(localKey, JSON.stringify(parsed));
      }
    } catch (_) {}
  },
};
