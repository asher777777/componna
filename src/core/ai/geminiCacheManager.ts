/**
 * Gemini Context Cache Manager (Explicit Context Caching)
 * Manages server-side cached tokens for brand DNA, web page generators, and CRM segmentation.
 * Enforces strict TTL limits to prevent zombie storage charges and maximize profit margins.
 * 
 * Based on Google AI Studio Context Caching API (v1beta/cachedContents):
 * https://ai.google.dev/gemini-api/docs/caching
 */

import { GEMINI_API_BASE_URL } from './cloudAiClient';
import { getTenantApiKeysState } from '../connection/tenantApiKeys';

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

  // Resolve API Key
  const state = getTenantApiKeysState();
  const effectiveApiKey = (
    options.apiKey ||
    state.masterKeys?.googleAiApiKey ||
    state.tenantKeys?.googleAiApiKey ||
    (typeof window !== 'undefined' ? (localStorage.getItem('googleAiApiKey') || localStorage.getItem('geminiApiKey') || '') : '') ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ''
  ).trim();

  if (!effectiveApiKey) {
    return { success: false, error: 'Missing Gemini API key for cache creation.' };
  }

  try {
    const targetUrl = `${GEMINI_API_BASE_URL}/cachedContents?key=${effectiveApiKey}`;

    const requestBody: any = {
      model: normalizeCacheModel(model),
      contents: options.contents,
      ttl: `${ttlSec}s`,
    };

    if (options.displayName) {
      requestBody.displayName = options.displayName;
    }

    if (options.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `Cache creation failed with HTTP ${res.status}`;
      console.warn('[GeminiCacheManager] Creation failed:', errMsg);
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    const cacheInfo: ContextCacheInfo = {
      name: data.name,
      model: data.model,
      displayName: data.displayName,
      createTime: data.createTime,
      updateTime: data.updateTime,
      expireTime: data.expireTime,
      totalTokenCount: data.usageMetadata?.totalTokenCount || 0,
    };

    return { success: true, cache: cacheInfo };
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
  apiKey?: string
): Promise<boolean> {
  if (!cacheName) return true;

  const state = getTenantApiKeysState();
  const effectiveApiKey = (
    apiKey ||
    state.masterKeys?.googleAiApiKey ||
    state.tenantKeys?.googleAiApiKey ||
    (typeof window !== 'undefined' ? (localStorage.getItem('googleAiApiKey') || localStorage.getItem('geminiApiKey') || '') : '') ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ''
  ).trim();

  if (!effectiveApiKey) return false;

  try {
    const cleanName = cacheName.replace(/^cachedContents\//, 'cachedContents/');
    const deleteUrl = `${GEMINI_API_BASE_URL}/${cleanName}?key=${effectiveApiKey}`;

    const res = await fetch(deleteUrl, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn(`[GeminiCacheManager] Failed to delete cache ${cacheName}:`, err);
    return false;
  }
}
