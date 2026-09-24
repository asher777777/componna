import { TenantRecord } from '../types';
import { GreenApiService } from '../../whatsapp-green-api-hub/services/greenApiService';
import { eventBus } from '../../../core/bridge/EventBus';

export interface TenantCredentials {
  username: string;
  temporaryPassword: string;
  loginUrl: string;
  publicUrl: string;
}

export interface TenantReceiptDetails {
  transactionId: string;
  date: string;
  totalAmount: number;
  billingPlan: string;
  modules: string[];
}

export interface WelcomeDispatchResult {
  whatsappSent: boolean;
  whatsappDirectUrl?: string;
  emailSent: boolean;
  credentials: TenantCredentials;
  receipt: TenantReceiptDetails;
  error?: string;
}

export class TenantWelcomeNotificationService {
  /**
   * Generates login credentials for a new tenant
   */
  static generateCredentials(tenant: TenantRecord): TenantCredentials {
    const rawDigits = (tenant.ownerPhone || '0501234567').replace(/\D/g, '');
    const pin = rawDigits.slice(-4) || '7788';
    const temporaryPassword = `Ks@${pin}`;
    const username = tenant.ownerEmail || tenant.ownerPhone || tenant.subdomain;
    
    // In production this is the real subdomain URL; in dev it supports query param
    const publicUrl = `https://${tenant.fullDomain}`;
    const loginUrl = `${window.location.origin}/?tenant=${tenant.subdomain}&mode=admin`;

    return {
      username,
      temporaryPassword,
      loginUrl,
      publicUrl,
    };
  }

  /**
   * Builds the formatted WhatsApp Welcome & Receipt Message
   */
  static buildWhatsAppWelcomeMessage(tenant: TenantRecord, creds: TenantCredentials): string {
    const planText = tenant.billingPlan === 'annual' ? 'מנוי שנתי (כולל 20% הנחה)' : 'מנוי חודשי ללא התחייבות';
    const modulesText = tenant.activeModules.length > 0 
      ? tenant.activeModules.map(m => `  • ${m}`).join('\n')
      : '  • עורך דפי נחיתה ואתרים (Page Builder)';

    return `🎉 *ברוכים הבאים לפלטפורמת Kosun! סביבת העבודה שלך שוגרה בהצלחה* 🚀

שלום *${tenant.clientName}*,
הסאב-דומיין שלך והרכיבים שהזמנת הופעלו בהצלחה ברשת ומסד הנתונים הייעודי שלך מוכן לשימוש!

🌐 *כתובת האתר שלך (למבקרים):*
${creds.publicUrl}

🔐 *קישור ישיר לכניסה וניהול האתר (Admin):*
${creds.loginUrl}

🔑 *פרטי ההתחברות שלך למערכת:*
👤 *שם משתמש:* ${creds.username}
🔒 *סיסמה ראשונית:* ${creds.temporaryPassword}

━━━━━━━━━━━━━━━━━━━━
🧾 *קבלה ואישור הזמנה רשמי*
• *מספר עסקה:* ${tenant.paymentTransactionId || 'TXN-' + Date.now().toString(36).toUpperCase()}
• *תאריך:* ${new Date().toLocaleDateString('he-IL')}
• *רכיבים שהופעלו בחשבונך:*
${modulesText}
• *מסלול חיוב:* ${planText}
• *סך הכל שולם:* ${tenant.monthlyTotal} ₪ ${tenant.billingPlan === 'annual' ? '/ חודש (חיוב שנתי)' : '/ חודש'}
• *סטטוס תשלום:* מאושר בהצלחה ✅
━━━━━━━━━━━━━━━━━━━━

💡 *טיפ להתחלה:*
מומלץ להיכנס לקישור הניהול, להעלות לוגו ולערוך את עמוד הבית של הסאב-דומיין שלך בלחיצה אחת.

בכל שאלה, תמיכה או ייעוץ - אנחנו כאן בשבילך! צוות Kosun ✨`;
  }

  /**
   * Dispatches WhatsApp and Email welcome messages with credentials & receipt
   */
  static async sendWelcomeAndReceipt(tenant: TenantRecord): Promise<WelcomeDispatchResult> {
    const credentials = this.generateCredentials(tenant);
    const receipt: TenantReceiptDetails = {
      transactionId: tenant.paymentTransactionId || `TXN-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString(),
      totalAmount: tenant.monthlyTotal,
      billingPlan: tenant.billingPlan === 'annual' ? 'שנתי (חיסכון 20%)' : 'חודשי',
      modules: tenant.activeModules,
    };

    const whatsappMessage = this.buildWhatsAppWelcomeMessage(tenant, credentials);
    const rawPhone = (tenant.ownerPhone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? `972${rawPhone.substring(1)}` : rawPhone;
    const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    let whatsappSent = false;
    let emailSent = false;

    // 1. Send via Green API if configured
    try {
      const apiKeysRaw = localStorage.getItem('comona_system_apikeys_config');
      let instanceId = '';
      let token = '';
      if (apiKeysRaw) {
        const parsed = JSON.parse(apiKeysRaw);
        instanceId = parsed.greenApiInstanceId || '';
        token = parsed.greenApiToken || '';
      }

      if (instanceId && token && cleanPhone) {
        const greenApi = new GreenApiService({
          idInstance: instanceId,
          apiTokenInstance: token,
        });
        const res = await greenApi.sendMessage({
          chatId: `${cleanPhone}@c.us`,
          message: whatsappMessage,
        });
        if (res.idMessage) {
          whatsappSent = true;
          console.log(`[TenantWelcome] WhatsApp message sent successfully to ${cleanPhone}:`, res.idMessage);
        }
      }
    } catch (waErr) {
      console.warn('[TenantWelcome] Green API dispatch notice:', waErr);
    }

    // 2. Dispatch Email & CRM Event over EventBus
    try {
      const emailPayload = {
        to: tenant.ownerEmail,
        subject: `🎉 ברוכים הבאים ל-Kosun! פרטי הכניסה והקבלה עבור ${tenant.fullDomain}`,
        clientName: tenant.clientName,
        subdomain: tenant.subdomain,
        credentials,
        receipt,
        content: whatsappMessage,
        sentAt: new Date().toISOString(),
      };

      // Store in notification registry / localStorage
      const existingNotifs = JSON.parse(localStorage.getItem('comona_tenant_notifications') || '[]');
      existingNotifs.unshift(emailPayload);
      localStorage.setItem('comona_tenant_notifications', JSON.stringify(existingNotifs.slice(0, 50)));

      // Emit event across modular architecture
      eventBus.publish('notification:email:send' as any, emailPayload);
      eventBus.publish('crm:receipt:created' as any, {
        contactPhone: tenant.ownerPhone,
        contactEmail: tenant.ownerEmail,
        clientName: tenant.clientName,
        receipt,
      });

      emailSent = true;
      console.log(`[TenantWelcome] Email & Receipt notification queued for ${tenant.ownerEmail}`);
    } catch (emailErr) {
      console.warn('[TenantWelcome] Email dispatch notice:', emailErr);
    }

    return {
      whatsappSent,
      whatsappDirectUrl: directWaUrl,
      emailSent,
      credentials,
      receipt,
    };
  }
}
