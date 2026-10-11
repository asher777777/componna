/**
 * KOSUN AM (קושאן מייל אוטומטי) - Email Dispatch Engine
 * 12-Layer Scaffolding Layer 5: Multi-Provider Email Engine (Real Dispatch with Tenant API Keys)
 */

import { EmailProviderType, DispatchResult } from '../types';
import { isModuleEntitled, getModuleApiKeys } from '../../../core/connection/tenantApiKeys';
import { KOSUN_AM_MODULE_ID } from '../config';
import { kosunAmFunctionsApi } from '../api/functionsApi';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  fromName?: string;
  fromAddress?: string;
  campaignId?: string;
  automationId?: string;
  tenantId?: string;
}

export class EmailDispatchService {
  private moduleId = KOSUN_AM_MODULE_ID;
  private forceMock: boolean;
  private tenantId: string;

  constructor(forceMock = false, tenantId = '_master') {
    this.forceMock = forceMock;
    this.tenantId = (tenantId || '').trim().toLowerCase() || '_master';
  }

  private getCredentials() {
    if (!isModuleEntitled(this.moduleId)) {
      return {
        resendApiKey: '',
        sendgridApiKey: '',
        smtpHost: '',
        smtpPort: 587,
        fromAddress: 'noreply@kosun.pro',
        fromName: 'קושאן',
      };
    }
    const keys = getModuleApiKeys(this.moduleId) as Record<string, unknown>;
    return {
      resendApiKey: typeof keys.resendApiKey === 'string' ? keys.resendApiKey.trim() : '',
      sendgridApiKey: typeof keys.sendgridApiKey === 'string' ? keys.sendgridApiKey.trim() : '',
      smtpHost: typeof keys.smtpHost === 'string' ? keys.smtpHost.trim() : '',
      smtpPort: typeof keys.smtpPort === 'number' ? keys.smtpPort : 587,
      fromAddress: typeof keys.emailFromAddress === 'string' ? keys.emailFromAddress.trim() : 'noreply@kosun.pro',
      fromName: typeof keys.emailFromName === 'string' ? keys.emailFromName.trim() : 'קושאן',
    };
  }

  async send(payload: EmailPayload, preferredProvider?: EmailProviderType): Promise<DispatchResult> {
    const creds = this.getCredentials();
    const rawRecipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    const recipients = rawRecipients.map((r) => (r || '').trim()).filter(Boolean);
    const timestamp = new Date().toISOString();
    const targetTenant = payload.tenantId || this.tenantId;

    if (recipients.length === 0) {
      return {
        success: false,
        provider: preferredProvider || 'resend',
        messageId: '',
        dispatchedCount: 0,
        error: 'לא צוינו נמענים חוקיים לשליחה (רשימת נמענים ריקה)',
        timestamp,
      };
    }

    // 1. If explicit forceMock set for offline testing harness
    if (this.forceMock) {
      return {
        success: true,
        provider: preferredProvider || 'mock',
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        dispatchedCount: recipients.length,
        timestamp,
      };
    }

    // 2. Validate API Keys from tenantApiKeys (tenants/{tenantId}/settings/api_keys)
    if (!creds.resendApiKey && !creds.sendgridApiKey && !creds.smtpHost) {
      return {
        success: false,
        provider: preferredProvider || 'resend',
        messageId: '',
        dispatchedCount: 0,
        error: `לא הוגדרו מפתחות API עבור שליחת מיילים בטננט זה (tenants/${targetTenant}/settings/api_keys)`,
        timestamp,
      };
    }

    // 3. Resend Provider
    if ((!preferredProvider || preferredProvider === 'resend') && creds.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${creds.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${payload.fromName || creds.fromName} <${payload.fromAddress || creds.fromAddress}>`,
            to: recipients,
            subject: payload.subject,
            html: payload.htmlContent,
            text: payload.textContent,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { id?: string };
          return {
            success: true,
            provider: 'resend',
            messageId: data.id || `msg_re_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            dispatchedCount: recipients.length,
            timestamp,
          };
        }
        console.warn('[Kosun AM] Resend API returned error status:', res.status);
      } catch (err: unknown) {
        console.warn('[Kosun AM] Resend dispatch attempt failed:', err);
      }
    }

    // 4. SendGrid Provider
    if ((!preferredProvider || preferredProvider === 'sendgrid') && creds.sendgridApiKey) {
      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${creds.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: recipients.map((r) => ({ email: r })) }],
            from: {
              email: payload.fromAddress || creds.fromAddress,
              name: payload.fromName || creds.fromName,
            },
            subject: payload.subject,
            content: [{ type: 'text/html', value: payload.htmlContent }],
          }),
        });

        if (res.ok || res.status === 202) {
          return {
            success: true,
            provider: 'sendgrid',
            messageId: `msg_sg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            dispatchedCount: recipients.length,
            timestamp,
          };
        }
        console.warn('[Kosun AM] SendGrid API returned error status:', res.status);
      } catch (err: unknown) {
        console.warn('[Kosun AM] SendGrid dispatch attempt failed:', err);
      }
    }

    // 5. SMTP Cloud Functions Proxy Provider
    if (preferredProvider === 'smtp_proxy' || preferredProvider === 'functions_smtp' || creds.smtpHost) {
      try {
        const proxyRes = await kosunAmFunctionsApi.sendSmtpProxy({
          tenantId: targetTenant,
          to: recipients,
          subject: payload.subject,
          html: payload.htmlContent,
          fromName: payload.fromName || creds.fromName,
        });

        if (proxyRes.success) {
          return {
            success: true,
            provider: preferredProvider || 'smtp_proxy',
            messageId: proxyRes.messageId || `msg_smtp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            dispatchedCount: recipients.length,
            timestamp,
          };
        } else {
          return {
            success: false,
            provider: preferredProvider || 'smtp_proxy',
            messageId: '',
            dispatchedCount: 0,
            error: proxyRes.error || 'קריאת SMTP דרך Cloud Functions נכשלה',
            timestamp,
          };
        }
      } catch (err: unknown) {
        console.warn('[Kosun AM] SMTP Cloud Functions proxy dispatch failed:', err);
      }
    }

    // 6. Real Error Reporting (Zero Mock Data)
    return {
      success: false,
      provider: preferredProvider || 'resend',
      messageId: '',
      dispatchedCount: 0,
      error: 'השליחה נכשלה: ספק הדיוור החיצוני אינו זמין או שהחזיר שגיאה',
      timestamp,
    };
  }
}
