/**
 * Test Fixtures & Golden Datasets for KOSUN AM E2E Testing
 */

export const FIXTURES = {
  TENANT_A: 'tenant-startup-alpha',
  TENANT_B: 'tenant-enterprise-beta',
  ROOT_TENANT: '_master',

  CAMPAIGNS: {
    WELCOME_NEWSLETTER: {
      id: 'cmp_welcome_2026',
      title: 'ניוזלטר השקה חגיגי - קושאן מייל אוטומטי',
      subject: 'ברוכים הבאים לעולם של דיוור חכם עם קושאן',
      previewText: 'גלה איך קושאן דואג שהמסר שלך יגיע ישירות ללב הלקוח',
      status: 'draft',
      audience: {
        filterTags: ['new_leads', 'newsletter_subscribers'],
        totalEstimatedCount: 450,
      },
      templateId: 'tpl_bento_modern',
      scheduledAt: null,
    },
    FLASH_SALE: {
      id: 'cmp_flash_sale_99',
      title: 'מבצע בזק 24 שעות',
      subject: 'רק היום: 30% הנחה על כל המוצרים',
      previewText: 'הזדמנות חד פעמית שאסור לפספס',
      status: 'draft',
      audience: {
        filterTags: ['vip_customers'],
        totalEstimatedCount: 120,
      },
      templateId: 'tpl_promo_card',
    },
    SHABBAT_OBSERVANT: {
      id: 'cmp_shabbat_compliant',
      title: 'עדכון שבועי קהילתי',
      subject: 'פרשת השבוע ועדכוני קהילה',
      previewText: 'קושאן דואג לדיוור מותאם ומכבד',
      status: 'scheduled',
      scheduledAt: '2026-10-18T10:00:00Z',
    },
  },

  TEMPLATES: {
    BENTO_MODERN: {
      id: 'tpl_bento_modern',
      name: 'תבנית בנטו יוקרתית 2026',
      blocks: [
        { type: 'header', content: { logoUrl: 'https://cdn.kosun.ai/logo.png', title: 'קושאן מייל' } },
        { type: 'hero', content: { headline: 'היי {{conta_name}}, שמחים שבחרת בנו!', imageUrl: 'https://cdn.kosun.ai/hero.jpg' } },
        { type: 'text', content: { body: '<p>קושאן דואג שהמייל יגיע ליעד במהירות וברמת גימור מושלמת.</p>' } },
        { type: 'cta', content: { buttonText: 'צפייה בלוח הבקרה', targetUrl: 'https://app.kosun.ai/dashboard' } },
        { type: 'footer', content: { unsubscribeText: 'להסרה מרשימת התפוצה לחץ כאן: {{unsubscribe_url}}' } },
      ],
      htmlBody: `
        <div dir="rtl" style="text-align: right; font-family: Heebo, sans-serif;">
          <h1>היי {{conta_name}}, שמחים שבחרת בנו!</h1>
          <p>קושאן דואג שהמייל יגיע ליעד במהירות וברמת גימור מושלמת.</p>
          <a href="https://app.kosun.ai/dashboard">צפייה בלוח הבקרה</a>
          <p style="font-size: 11px; color: #888;">להסרה מרשימת התפוצה לחץ כאן: {{unsubscribe_url}}</p>
        </div>
      `,
    },
    UNSUBSCRIBE_MISSING: {
      id: 'tpl_no_unsub',
      name: 'תבנית ללא הסרה (פסולה)',
      htmlBody: '<div><p>שלום עולם, הודעת תוכן בלבד ללא שום קישור מזהה בתחתית</p></div>',
    },
  },

  AUTOMATIONS: {
    LEAD_WELCOME_DRIP: {
      id: 'aut_lead_welcome',
      tenantId: 'tenant-startup-alpha',
      name: 'קבלת פנים לליד חדש + וואטסאפ',
      triggerEvent: 'crm:lead:created',
      isActive: true,
      steps: [
        {
          id: 'step_1',
          type: 'email_action',
          config: {
            subject: 'נעים להכיר, {{conta_name}}! קושאן מכין לך הפתעה',
            html: '<div dir="rtl" style="text-align: right;"><p>היי {{conta_name}}, קושאן דואג שתמיד תהיה צעד אחד קדימה.</p><footer>להסרה</footer></div>',
          },
        },
        {
          id: 'step_2',
          type: 'whatsapp_action',
          config: {
            text: 'שלום {{conta_name}}, המייל נשלח בהצלחה! קושאן כאן לכל שאלה בוואטסאפ.',
          },
        },
      ],
    },
    FORM_SUBMISSION_FILTERED: {
      id: 'aut_form_submitted',
      tenantId: 'tenant-startup-alpha',
      name: 'מענה לטופס הרשמה מסונן',
      triggerEvent: 'smart_form:submitted',
      isActive: true,
      steps: [
        {
          id: 'step_cond',
          type: 'condition',
          config: {
            field: 'interest',
            equals: 'enterprise',
          },
        },
        {
          id: 'step_mail',
          type: 'email_action',
          config: {
            subject: 'פניית אנטרפרייז התקבלה בהצלחה',
            html: '<div dir="rtl" style="text-align: right;"><p>תודה {{conta_name}}, נציג קושאן יחזור בהקדם.</p><footer>להסרה</footer></div>',
          },
        },
      ],
    },
    AMBASSADOR_WELCOME: {
      id: 'aut_ambassador_onboarding',
      tenantId: 'tenant-startup-alpha',
      name: 'שגריר חדש הצטרף לקמפיין',
      triggerEvent: 'campaign:ambassador:created',
      isActive: true,
      steps: [
        {
          id: 'step_amb_mail',
          type: 'email_action',
          config: {
            subject: 'ברכות לשגריר החדש, {{conta_name}}!',
            html: '<div dir="rtl" style="text-align: right;"><p>קישור השיתוף האישי שלך הוא: {{shareUrl}}</p><footer>להסרה</footer></div>',
          },
        },
      ],
    },
  },

  BRAND_DNA: {
    HIGH_TECH_LUXURY: {
      companyName: 'טכנולוגיות העתיד בע״מ',
      voice: 'הייטקיסטי, יוקרתי, חדשני',
      powerWords: ['בינה מלאכותית', 'מהפכני', 'אוטומציה מלאה', 'דיוק מרבי'],
      shabbatObservant: false,
    },
    KOSHER_COMMUNITY: {
      companyName: 'חסדי ציון וברכה',
      voice: 'חם, קהילתי, מכבד',
      powerWords: ['ברכה', 'ערבות הדדית', 'באהבה', 'שמחה'],
      forbiddenWords: ['טרף', 'מבצע שבת', 'חילוני'],
      shabbatObservant: true,
    },
  },
};
