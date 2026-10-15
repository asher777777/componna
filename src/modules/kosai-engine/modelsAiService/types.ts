/**
 * KOSAI AI Monopoly - Core Types & Options
 * KOSUN26 Gate 3
 */

import { TokenUsageReport } from '../../../core/ai/geminiCostTracker';

export interface KosaiExecutionOptions {
  model?: 'gemini-3.8-flash' | 'gemini-3.8-flash-lite' | 'gemini-1.5-flash';
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
  systemInstruction?: string;
  cacheKey?: string;
  skipCache?: boolean;
  timeoutMs?: number;
  tenantId?: string;
  category?: 'content' | 'chatbot' | 'gallery' | 'video';
  customApiKey?: string;
}

export interface KosaiContractResult<T = any> {
  success: boolean;
  data: T;
  error?: string;
  costReport: TokenUsageReport;
  fromCache?: boolean;
}
