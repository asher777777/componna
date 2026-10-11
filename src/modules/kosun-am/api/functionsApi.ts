/**
 * KOSUN AM (קושאן מייל אוטומטי) - Cloud Functions API Client
 * 12-Layer Scaffolding Layer 6: Secure server-side proxy for SMTP & mass dispatch
 */

export interface DispatchCampaignServerParams {
  tenantId: string;
  campaignId: string;
  providerPreference?: string;
}

export interface DispatchCampaignServerResponse {
  success: boolean;
  dispatchedCount: number;
  provider: string;
  batchId: string;
  error?: string;
}

export interface SendSmtpProxyParams {
  tenantId: string;
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
}

export interface SendSmtpProxyResponse {
  success: boolean;
  messageId: string;
  error?: string;
}

export class KosunAmFunctionsApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FUNCTIONS_BASE_URL) || '';
  }

  async dispatchCampaign(params: DispatchCampaignServerParams): Promise<DispatchCampaignServerResponse> {
    if (!this.baseUrl) {
      return {
        success: false,
        dispatchedCount: 0,
        provider: 'functions_api',
        batchId: '',
        error: 'Functions service unavailable or unconfigured (missing VITE_FUNCTIONS_BASE_URL)',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/dispatchEmailCampaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return (await res.json()) as DispatchCampaignServerResponse;
      }
      throw new Error(`Functions API error: ${res.statusText}`);
    } catch (err: unknown) {
      console.warn('[Kosun AM Functions API] Server dispatch call failed:', err);
      return {
        success: false,
        dispatchedCount: 0,
        provider: 'functions_api',
        batchId: '',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async sendSmtpProxy(params: SendSmtpProxyParams): Promise<SendSmtpProxyResponse> {
    if (!this.baseUrl) {
      return {
        success: false,
        messageId: '',
        error: 'Functions service unavailable or unconfigured (missing VITE_FUNCTIONS_BASE_URL)',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/sendSmtpEmailProxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return (await res.json()) as SendSmtpProxyResponse;
      }
      throw new Error(`SMTP proxy error: ${res.statusText}`);
    } catch (err: unknown) {
      console.warn('[Kosun AM Functions API] SMTP proxy call failed:', err);
      return {
        success: false,
        messageId: '',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

export const kosunAmFunctionsApi = new KosunAmFunctionsApi();
