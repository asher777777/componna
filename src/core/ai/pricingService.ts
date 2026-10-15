/**
 * Universal AI Token Pricing, Real-Time Currency Exchange & Quota Manager
 * KOSUN26 Architecture: Central authority for Gemini API pricing, live ILS/USD exchange rates,
 * package billing, and tenant token top-ups.
 */

import { Firestore, doc, setDoc, increment, getDoc } from 'firebase/firestore';
import { getEffectiveFirestore, TenantTokenTracker, DEFAULT_MONTHLY_TOKEN_QUOTA } from './tenantTokenTracker';
import { GEMINI_PRICING_TABLE, ModelPricingRate } from './geminiCostTracker';
import { ROOT_TENANT_ID } from '../tenant/tenantResolver';

export interface ExchangeRateInfo {
  rateUSDToILS: number;
  highRateUSDToILS: number; // High water mark with protective buffer
  lastUpdated: string;
  source: string;
}

export interface AiUnitCostBreakdown {
  model: string;
  inputPerMillionUSD: number;
  inputPerMillionILS: number;
  cachedInputPerMillionUSD: number;
  cachedInputPerMillionILS: number;
  outputPerMillionUSD: number;
  outputPerMillionILS: number;
  imageCostUSD: number;
  imageCostILS: number;
  videoSecondUSD: number;
  videoSecondILS: number;
}

export interface TokenTopupPackage {
  id: string;
  name: string;
  tokens: number;
  priceILS: number;
  priceUSD: number;
  description: string;
  popular?: boolean;
  features: string[];
}

export const DEFAULT_EXCHANGE_RATE: ExchangeRateInfo = {
  rateUSDToILS: 3.70,
  highRateUSDToILS: 3.82, // +3.2% safety buffer
  lastUpdated: new Date().toISOString(),
  source: 'fallback',
};

// Fixed top-up packages available to customers
export const DEFAULT_TOKEN_PACKAGES: TokenTopupPackage[] = [
  {
    id: 'pack_starter',
    name: 'חבילת בסיס (Starter)',
    tokens: 250_000,
    priceILS: 49,
    priceUSD: 13.5,
    description: 'מתאים לעסקים קטנים ולשיחות ווטסאפ שוטפות',
    features: ['כ-250 שאילתות ווטסאפ', 'עד 15 תמונות AI איכותיות', 'איפוס חודשי מוגן'],
  },
  {
    id: 'pack_pro',
    name: 'חבילת פרו (Pro Business)',
    tokens: 1_000_000,
    priceILS: 149,
    priceUSD: 40.0,
    description: 'החבילה המשתלמת ביותר לסוכני מכירות וייצור אתרים',
    popular: true,
    features: ['כ-1,000 שאילתות ווטסאפ', 'עד 60 תמונות AI סטודיו', 'כ-30 שניות וידאו AI', 'Context Caching פעיל'],
  },
  {
    id: 'pack_enterprise',
    name: 'חבילת פרימיום (Enterprise Scale)',
    tokens: 5_000_000,
    priceILS: 499,
    priceUSD: 135.0,
    description: 'לעסקים פעילים, קמפיינים שיווקיים וסוכני תוכן מתקדמים',
    features: ['כ-5,000 שאילתות ווטסאפ', 'עד 300 תמונות סטודיו', 'כ-150 שניות וידאו AI', 'עדיפות תגובה עליונה'],
  },
];

let cachedExchangeRate: ExchangeRateInfo = { ...DEFAULT_EXCHANGE_RATE };
let lastFetchTime = 0;

/**
 * Fetches real-time USD to ILS exchange rate via open API
 * Computes the "High Rate" (+3% buffer) to protect platform against intraday fluctuations.
 */
export async function fetchLiveExchangeRate(): Promise<ExchangeRateInfo> {
  const now = Date.now();
  // Cache rate in memory for 30 minutes
  if (now - lastFetchTime < 30 * 60 * 1000 && lastFetchTime > 0) {
    return cachedExchangeRate;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      const rawIls = Number(data.rates?.ILS) || DEFAULT_EXCHANGE_RATE.rateUSDToILS;
      // High rate of the day with safe buffer (+3%)
      const highIls = Number((rawIls * 1.03).toFixed(4));

      cachedExchangeRate = {
        rateUSDToILS: Number(rawIls.toFixed(4)),
        highRateUSDToILS: highIls,
        lastUpdated: new Date().toISOString(),
        source: 'Open Exchange API',
      };
      lastFetchTime = now;
      return cachedExchangeRate;
    }
  } catch (err) {
    console.warn('[pricingService] Failed to fetch live rate, using safe default:', err);
  }

  return cachedExchangeRate;
}

/**
 * Get current Google Gemini unit cost breakdown in both USD and ILS
 */
export function getGoogleUnitCostBreakdown(
  model: string = 'gemini-3.8-flash',
  ilsRate: number = cachedExchangeRate.highRateUSDToILS
): AiUnitCostBreakdown {
  const rate: ModelPricingRate = GEMINI_PRICING_TABLE[model] || GEMINI_PRICING_TABLE['gemini-3.8-flash'];
  const cachedPerM = rate.cachedInputPerMillion ?? (rate.inputPerMillion * 0.10);

  return {
    model,
    inputPerMillionUSD: rate.inputPerMillion,
    inputPerMillionILS: Number((rate.inputPerMillion * ilsRate).toFixed(4)),
    cachedInputPerMillionUSD: cachedPerM,
    cachedInputPerMillionILS: Number((cachedPerM * ilsRate).toFixed(4)),
    outputPerMillionUSD: rate.outputPerMillion,
    outputPerMillionILS: Number((rate.outputPerMillion * ilsRate).toFixed(4)),
    imageCostUSD: 0.035,
    imageCostILS: Number((0.035 * ilsRate).toFixed(4)),
    videoSecondUSD: rate.videoSecondCost || 0.10,
    videoSecondILS: Number(((rate.videoSecondCost || 0.10) * ilsRate).toFixed(4)),
  };
}

/**
 * Adds token quota to a tenant (either from Admin manual adjustment or Customer purchase)
 */
export async function addTokensToTenant(params: {
  tenantId: string;
  tokensToAdd: number;
  reason: 'customer_purchase' | 'admin_grant' | 'bonus' | 'plan_upgrade';
  paymentDetails?: {
    transactionId?: string;
    amountPaidILS?: number;
    paymentMethod?: string;
  };
  db?: Firestore;
}): Promise<{ success: boolean; newQuota: number; error?: string }> {
  const { tenantId, tokensToAdd, reason, paymentDetails } = params;
  const cleanId = (tenantId || ROOT_TENANT_ID).trim().toLowerCase();
  const tokens = Math.max(0, Math.round(tokensToAdd));

  const effectiveDb = getEffectiveFirestore(params.db);
  if (!effectiveDb) {
    return { success: false, newQuota: 0, error: 'Database connection unavailable' };
  }

  try {
    const usageDocRef = doc(effectiveDb, 'tenants', cleanId, 'settings', 'token_usage');
    const existingSnap = await getDoc(usageDocRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : null;
    const currentQuota = Number(existingData?.monthlyQuota) || DEFAULT_MONTHLY_TOKEN_QUOTA;
    const newQuota = currentQuota + tokens;

    await setDoc(
      usageDocRef,
      {
        subdomain: cleanId,
        monthlyQuota: increment(tokens),
        lastTopupAt: new Date().toISOString(),
        lastTopupReason: reason,
        lastTopupAmount: tokens,
        ...(paymentDetails ? { lastPayment: paymentDetails } : {}),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Save transaction history log
    try {
      const topupHistoryRef = doc(effectiveDb, 'tenants', cleanId, 'token_topups', `${Date.now()}`);
      await setDoc(topupHistoryRef, {
        subdomain: cleanId,
        tokensAdded: tokens,
        previousQuota: currentQuota,
        newQuota,
        reason,
        paymentDetails: paymentDetails || null,
        createdAt: new Date().toISOString(),
      });
    } catch {}

    // Fetch and broadcast live update
    const updatedUsage = await TenantTokenTracker.getTenantTokenUsage(effectiveDb, cleanId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kosun_tenant_tokens_updated', {
          detail: { tenantId: cleanId, usage: updatedUsage, category: 'content', deltaTokens: 0 },
        })
      );
    }

    return { success: true, newQuota };
  } catch (err: any) {
    console.error(`[pricingService] Error topping up tokens for ${cleanId}:`, err);
    return { success: false, newQuota: 0, error: err?.message || 'Failed to update quota' };
  }
}
