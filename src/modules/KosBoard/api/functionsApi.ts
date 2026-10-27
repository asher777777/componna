/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * 12-Layer Scaffolding Layer 6: Cloud Functions & Server-Side API Client
 */

import { GenerateDashboardAiRequest, GeneratedCustomDashboard } from '../types';

export interface ServerSideGenerateDashboardParams {
  tenantId: string;
  request: GenerateDashboardAiRequest;
}

export interface ServerSideGenerateDashboardResponse {
  success: boolean;
  dashboard?: GeneratedCustomDashboard;
  error?: string;
}

export class KosunBoardFunctionsApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FUNCTIONS_BASE_URL) || '';
  }

  /**
   * Optional Cloud Function proxy for server-side AI dashboard generation and complex audits.
   */
  async generateDashboardProxy(
    params: ServerSideGenerateDashboardParams
  ): Promise<ServerSideGenerateDashboardResponse> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: 'Functions service unavailable or unconfigured (missing VITE_FUNCTIONS_BASE_URL)',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/generateCustomDashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return (await res.json()) as ServerSideGenerateDashboardResponse;
      }
      return {
        success: false,
        error: `Server error ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error calling Cloud Function',
      };
    }
  }
}

export const kosunBoardFunctionsApi = new KosunBoardFunctionsApi();
