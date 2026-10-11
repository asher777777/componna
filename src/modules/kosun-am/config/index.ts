/**
 * KOSUN AM (קושאן מייל אוטומטי) - Module Configuration & Constants
 * 12-Layer Scaffolding Layer 2: Module metadata, collection names, and defaults
 */

import { EmailCampaign, EmailTemplate, EmailAutomation, EmailDeliveryLog } from '../types';

export const KOSUN_AM_MODULE_ID = 'kosun-am';
export const KOSUN_AM_DISPLAY_NAME_HE = 'קושאן מייל אוטומטי';
export const KOSUN_AM_DISPLAY_NAME_EN = 'KOSUN AM';
export const KOSUN_AM_COLLECTION_PREFIX = 'mod_kosun_am_';

export const KOSUN_AM_COLLECTIONS = {
  CAMPAIGNS: 'mod_kosun_am_campaigns',
  TEMPLATES: 'mod_kosun_am_templates',
  AUTOMATIONS: 'mod_kosun_am_automations',
  LOGS: 'mod_kosun_am_logs',
} as const;

export const KOSUN_AM_AI_MODELS = {
  PRIMARY: 'gemini-3.8-flash',
  SECONDARY: 'gemini-3.5-flash',
  TERTIARY: 'gemini-3.8-flash-lite',
} as const;

export const KOSUN_AM_EVENT_TOPICS = {
  // Inbound
  CRM_LEAD_CREATED: 'crm:lead:created',
  SMART_FORM_SUBMITTED: 'smart_form:submitted',
  AMBASSADOR_CREATED: 'campaign:ambassador:created',
  PAYMENT_COMPLETED: 'payment:completed',
  // Outbound
  CAMPAIGN_SENT: 'email:campaign:sent',
  AUTOMATION_TRIGGERED: 'email:automation:triggered',
  DELIVERY_FAILED: 'email:delivery:failed',
  KOSUN_CAMPAIGN_SENT: 'kosun_am:campaign:sent',
  KOSUN_EMAIL_DISPATCHED: 'kosun_am:email:dispatched',
} as const;

export const MOCK_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'cmp_welcome_2026',
    name: 'קמפיין ברוכים הבאים - קושאן 2026',
    subject: 'ברוכים הבאים למשפחת קושאן - המסע העסקי שלך מתחיל כאן',
    preheader: 'השותף האישי שלך לניהול דיוורים ושיווק דיגיטלי חכם',
    fromName: 'קושאן',
    fromEmail: 'hello@kosun.pro',
    templateId: 'tpl_welcome_modern',
    htmlContent: '<div dir="rtl" style="font-family: Heebo, sans-serif;"><h1>שלום וברוכים הבאים!</h1><p>קושאן דואג שהמסר השיווקי שלך יגיע בדיוק לנמענים הנכונים.</p></div>',
    status: 'sent',
    audience: { type: 'all' },
    sentAt: '2026-10-10T09:00:00Z',
    stats: {
      totalRecipients: 450,
      deliveredCount: 442,
      openedCount: 310,
      clickedCount: 168,
      bouncedCount: 8,
      unsubscribedCount: 2,
    },
    provider: 'resend',
    createdAt: '2026-10-09T14:20:00Z',
    updatedAt: '2026-10-10T09:15:00Z',
  },
  {
    id: 'cmp_spring_launch',
    name: 'השקת קולקציית קיץ ומבצעים בלעדיים',
    subject: 'הטבה מיוחדת רק לחברי המועדון של קושאן',
    preheader: '20% הנחה על כל השירותים הדיגיטליים למשך 48 שעות בלבד',
    fromName: 'קושאן שיווק',
    fromEmail: 'marketing@kosun.pro',
    templateId: 'tpl_promo_bento',
    htmlContent: '<div dir="rtl" style="font-family: Heebo, sans-serif;"><h2>מבצע קיץ מיוחד</h2><p>קושאן מכין לך הפתעות מיוחדות השבוע.</p></div>',
    status: 'scheduled',
    audience: { type: 'tags', tags: ['vip', 'club'] },
    scheduledAt: '2026-10-15T10:00:00Z',
    stats: {
      totalRecipients: 1200,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
    },
    provider: 'resend',
    createdAt: '2026-10-11T08:00:00Z',
    updatedAt: '2026-10-11T08:00:00Z',
  },
];

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_welcome_modern',
    name: 'תבנית ברוכים הבאים מודרנית (Bento)',
    description: 'מבנה כרטיסיות נקי עם הצגת יתרונות מרכזיים והנעה לפעולה',
    category: 'welcome',
    blocks: [
      {
        id: 'b_header',
        type: 'header',
        content: { title: 'קושאן', subtitle: 'מערכת דיוור חכמה' },
      },
      {
        id: 'b_hero',
        type: 'hero',
        content: {
          title: 'ברוכים הבאים לעולם של שיווק חכם',
          subtitle: 'קושאן לוקח אחריות על תהליך הדיוור שלך',
          buttonText: 'להתחלת העבודה',
          buttonUrl: 'https://kosun.pro',
        },
      },
      {
        id: 'b_footer',
        type: 'footer',
        content: {
          bodyText: 'נשלח באמצעות קושאן מייל אוטומטי. להסרה לחץ כאן.',
        },
      },
    ],
    htmlSnapshot: '<div dir="rtl">תבנית ברירת מחדל של קושאן</div>',
    variables: ['contact_name', 'business_name'],
    isDefault: true,
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'tpl_promo_bento',
    name: 'תבנית מבצעים וניוזלטר (Bento Grid)',
    description: 'חלוקה מודרנית לכרטיסיות עם תמונות וכפתורי הנעה לפעולה',
    category: 'promotional',
    blocks: [
      {
        id: 'b_hero',
        type: 'hero',
        content: {
          title: 'מבצע מיוחד לחברי המועדון',
          subtitle: 'אל תפספסו את ההזדמנות להגדיל מכירות',
          buttonText: 'לפרטים נוספים',
          buttonUrl: 'https://kosun.pro/promo',
        },
      },
    ],
    htmlSnapshot: '<div dir="rtl">תבנית מבצעים של קושאן</div>',
    variables: ['contact_name', 'discount_code'],
    isDefault: false,
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
  },
];

export const MOCK_AUTOMATIONS: EmailAutomation[] = [
  {
    id: 'aut_new_lead_journey',
    name: 'קליטת ליד חדש + וואטסאפ (רב-ערוצי)',
    description: 'שליחת מייל ברוכים הבאים מיידי, השהיה של שעתיים ושליחת וואטסאפ Green API',
    isActive: true,
    trigger: {
      event: 'crm:lead:created',
    },
    steps: [
      {
        id: 'step_1',
        order: 1,
        title: 'שליחת מייל היכרות ראשוני',
        type: 'send_email',
        emailConfig: {
          subject: 'שמחים שהצטרפת - קושאן כאן בשבילך',
          templateId: 'tpl_welcome_modern',
          fromName: 'קושאן',
        },
      },
      {
        id: 'step_2',
        order: 2,
        title: 'השהיה של 120 דקות',
        type: 'delay',
        delayMinutes: 120,
      },
      {
        id: 'step_3',
        order: 3,
        title: 'שליחת הודעת וואטסאפ Green API',
        type: 'send_whatsapp',
        whatsAppConfig: {
          messageTemplate: 'היי {{contact_name}}, שמחים שבחרת בקושאן! קיבלת את המייל שלנו?',
        },
      },
    ],
    executionCount: 124,
    lastExecutedAt: '2026-10-11T10:30:00Z',
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-11T10:30:00Z',
  },
];

export const MOCK_LOGS: EmailDeliveryLog[] = [
  {
    id: 'log_1001',
    campaignId: 'cmp_welcome_2026',
    recipientEmail: 'client1@example.com',
    subject: 'ברוכים הבאים למשפחת קושאן - המסע העסקי שלך מתחיל כאן',
    status: 'delivered',
    provider: 'resend',
    messageId: 're_mock_12345',
    dispatchedAt: '2026-10-10T09:00:15Z',
  },
  {
    id: 'log_1002',
    campaignId: 'cmp_welcome_2026',
    recipientEmail: 'client2@example.com',
    subject: 'ברוכים הבאים למשפחת קושאן - המסע העסקי שלך מתחיל כאן',
    status: 'opened',
    provider: 'resend',
    messageId: 're_mock_12346',
    dispatchedAt: '2026-10-10T09:00:20Z',
  },
  {
    id: 'log_1003',
    automationId: 'aut_new_lead_journey',
    recipientEmail: 'lead99@example.com',
    subject: 'שמחים שהצטרפת - קושאן כאן בשבילך',
    status: 'simulated_success',
    provider: 'mock_local',
    messageId: 'mock_loc_9981',
    dispatchedAt: '2026-10-11T10:30:05Z',
  },
];
