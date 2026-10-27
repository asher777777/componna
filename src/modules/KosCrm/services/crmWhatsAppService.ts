import { getModuleGreenApiCredentials } from '../../../core/connection/tenantApiKeys';

export interface WhatsAppSenderConfig {
  idInstance?: string;
  apiTokenInstance?: string;
  apiUrl?: string;
}

export interface WhatsAppSendResult {
  idMessage?: string;
  error?: string;
}

export class CrmWhatsAppSenderService {
  private host: string;
  private idInstance: string;
  private token: string;

  constructor(config: WhatsAppSenderConfig) {
    this.idInstance = (config.idInstance || '').trim();
    this.token = (config.apiTokenInstance || '').trim();

    if (config.apiUrl && !config.apiUrl.includes('api.green-api.com') && config.apiUrl.trim().length > 0) {
      this.host = config.apiUrl.replace(/\/+$/, '');
    } else if (this.idInstance && this.idInstance.length >= 4) {
      const cluster = this.idInstance.slice(0, 4);
      this.host = `https://${cluster}.api.greenapi.com`;
    } else {
      this.host = 'https://api.green-api.com';
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.idInstance && this.token);
  }

  public get baseUrl(): string {
    return `${this.host}/waInstance${this.idInstance}`;
  }

  public async sendMessage(params: { chatId: string; message: string }): Promise<WhatsAppSendResult> {
    const url = `${this.baseUrl}/sendMessage/${this.token}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return { error: `HTTP ${resp.status}: ${errText}` };
    }
    return (await resp.json()) as WhatsAppSendResult;
  }

  public async sendFileByUrl(params: {
    chatId: string;
    urlFile: string;
    fileName: string;
    caption?: string;
  }): Promise<WhatsAppSendResult> {
    const url = `${this.baseUrl}/sendFileByUrl/${this.token}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return { error: `HTTP ${resp.status}: ${errText}` };
    }
    return (await resp.json()) as WhatsAppSendResult;
  }
}

/**
 * Resolves Green-API service from the tenant settings collection (tenants/{tenantId}/settings/api_keys)
 */
export function getCrmWhatsAppService(): CrmWhatsAppSenderService | null {
  try {
    const { instanceId, token } = getModuleGreenApiCredentials('crm-analytics');

    if (!instanceId || !token) {
      return null;
    }

    return new CrmWhatsAppSenderService({
      idInstance: instanceId,
      apiTokenInstance: token,
    });
  } catch (e) {
    console.warn('Could not initialize CrmWhatsAppSenderService:', e);
    return null;
  }
}

/**
 * Builds direct wa.me link for browser/mobile WhatsApp click-to-chat
 */
export function buildWaMeUrl(phone: string, text?: string): string {
  const clean = (phone || '').replace(/\D/g, '');
  const waPhone = clean.startsWith('0') ? `972${clean.slice(1)}` : clean;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${waPhone}${encodedText ? `?text=${encodedText}` : ''}`;
}

/**
 * Builds native whatsapp:// protocol link for mobile app
 */
export function buildNativeWhatsAppAppUrl(phone: string, text?: string): string {
  const clean = (phone || '').replace(/\D/g, '');
  const waPhone = clean.startsWith('0') ? `972${clean.slice(1)}` : clean;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `whatsapp://send?phone=${waPhone}${encodedText ? `&text=${encodedText}` : ''}`;
}
