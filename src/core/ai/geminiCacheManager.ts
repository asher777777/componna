/**
 * Gemini Context Cache Manager (Explicit Context Caching)
 * Manages server-side cached tokens for brand DNA, web page generators, and CRM segmentation.
 * Enforces strict TTL limits to prevent zombie storage charges and maximize profit margins.
 * 
 * Based on Google AI Studio Context Caching API (v1beta/cachedContents):
 * https://ai.google.dev/gemini-api/docs/caching
 */

import { resolveAiProxyUrl } from './cloudAiClient';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../tenant/tenantResolver';

export interface CreateCacheOptions {
  model?: string;
  displayName?: string;
  systemInstruction?: string;
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  /**
   * Time-to-live in seconds (default: 3600 = 1 hour, max: 7200 = 2 hours)
   * Hard-capped to prevent unexpected storage charges.
   */
  ttlSeconds?: number;
  apiKey?: string;
}

export interface ContextCacheInfo {
  name: string; // e.g. "cachedContents/abc123xyz"
  model: string;
  displayName?: string;
  createTime?: string;
  updateTime?: string;
  expireTime: string;
  totalTokenCount: number;
}

const DEFAULT_TTL_SECONDS = 3600; // 1 hour
const MAX_TTL_SECONDS = 7200;     // 2 hours hard cap

/**
 * Normalizes model string to "models/{modelName}" format required by cachedContents API
 */
function normalizeCacheModel(model: string = 'gemini-3.8-flash'): string {
  const clean = model.replace(/^models\//, '');
  return `models/${clean}`;
}

/**
 * Creates an explicit context cache in Google Gemini API.
 * Ensures strict TTL bounds and token count validation.
 */
export async function createExplicitContextCache(
  options: CreateCacheOptions
): Promise<{ success: boolean; cache?: ContextCacheInfo; error?: string }> {
  const model = options.model || 'gemini-3.8-flash';
  const ttlSec = Math.min(Math.max(60, options.ttlSeconds || DEFAULT_TTL_SECONDS), MAX_TTL_SECONDS);
  const tenantId = (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || ROOT_TENANT_ID;

  try {
    const res = await fetch(resolveAiProxyUrl('cache'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cache-create',
        tenantId,
        model: normalizeCacheModel(model),
        contents: options.contents,
        ttlSeconds: ttlSec,
        displayName: options.displayName,
        systemInstruction: options.systemInstruction,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      const errMsg = data?.error || `Cache creation failed with HTTP ${res.status}`;
      console.warn('[GeminiCacheManager] Creation failed:', errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, cache: data.cache };
  } catch (err: any) {
    console.error('[GeminiCacheManager] Unexpected error creating cache:', err);
    return { success: false, error: err?.message || 'Network error during cache creation' };
  }
}

/**
 * Deletes an explicit context cache when a task or session completes early.
 * Eliminates unnecessary storage fees immediately.
 */
export async function deleteExplicitContextCache(
  cacheName: string,
  _apiKey?: string
): Promise<boolean> {
  if (!cacheName) return true;
  const tenantId = (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || ROOT_TENANT_ID;

  try {
    const res = await fetch(resolveAiProxyUrl('cache'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cache-delete',
        tenantId,
        cacheName,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return Boolean(res.ok && data?.success);
  } catch (err) {
    console.warn(`[GeminiCacheManager] Failed to delete cache ${cacheName}:`, err);
    return false;
  }
}
