export interface SeedDataMap {
  [collectionName: string]: {
    id: string;
    name: string;
    data: Record<string, any>;
  }[];
}

export const PROJECT_SEED_DATA: SeedDataMap = {
  // 1. CRM Contacts & Leads
  contacts: [
    {
      id: 'contact_yossi_cohen_01',
      name: 'יוסי כהן (מנכ״ל טק סולושנס)',
      data: {
        id: 'contact_yossi_cohen_01',
        conta_name: 'יוסי כהן',
        conta_phone: '050-1234567',
        email: 'yossi@techsolutions.demo',
        status: 'active',
        contact_type: 'contact',
        is_lead: false,
        company_name: 'טק סולושנס בע״מ',
        job_title: 'מנכ״ל ומייסד',
        mh_crm_city: 'תל אביב',
        mh_crm_street: 'רוטשילד 22',
        community: 'קהילת יזמים וטכנולוגיה',
        tags: ['לקוח VIP', 'תורם מתמיד', 'טכנולוגיה'],
        lead_source: 'דף נחיתה ראשי',
        total_spent: 4500,
        order_count: 3,
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'contact_sarah_levy_02',
      name: 'שרה לוי (מנהלת קהילה)',
      data: {
        id: 'contact_sarah_levy_02',
        conta_name: 'שרה לוי',
        conta_phone: '052-7654321',
        email: 'sarah@community-glow.demo',
        status: 'active',
        contact_type: 'contact',
        is_lead: false,
        company_name: 'עמותת אור וחסד',
        job_title: 'מנהלת קשרי קהילה',
        mh_crm_city: 'ירושלים',
        mh_crm_street: 'יפו 45',
        community: 'קהילת מובילי חסד',
        tags: ['קהילה', 'מובילת קבוצה'],
        lead_source: 'קמפיין פייסבוק',
        total_spent: 1200,
        order_count: 2,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'contact_david_mizrahi_03',
      name: 'דוד מזרחי (ליד חדש)',
      data: {
        id: 'contact_david_mizrahi_03',
        conta_name: 'דוד מזרחי',
        conta_phone: '054-9876543',
        email: 'david.m@innovate.demo',
        status: 'active',
        contact_type: 'lead',
        is_lead: true,
        company_name: 'אינובייט סטודיו',
        job_title: 'סמנכ״ל שיווק',
        mh_crm_city: 'חיפה',
        community: 'קהילת יזמים וטכנולוגיה',
        tags: ['ליד חדש', 'התעניינות בנגן'],
        lead_source: 'טופס הרשמה חכם',
        last_form_name: 'טופס קבלת הדגמה וידאו AI',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // 2. CRM Groups & Communities
  crm_groups: [
    {
      id: 'group_tech_entrepreneurs',
      name: 'קהילת יזמים וטכנולוגיה',
      data: {
        id: 'group_tech_entrepreneurs',
        name: 'קהילת יזמים וטכנולוגיה',
        color: '#6366f1',
        description: 'פורום בכירים, מייסדים ומנהלי טכנולוגיה בחברות צומחות',
        type: 'smart',
        category: 'community',
        isCommunity: true,
        leaderName: 'יוסי כהן',
        targetGoal: 100000,
        currentRaised: 42500,
        count: 24,
        rules: [
          { field: 'company_name', operator: 'exists', value: '' },
          { field: 'has_phone', operator: 'eq', value: 'true' },
        ],
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'group_vip_donors',
      name: 'תורמי VIP ומקבלי החלטות',
      data: {
        id: 'group_vip_donors',
        name: 'תורמי VIP ומקבלי החלטות',
        color: '#f59e0b',
        description: 'תורמים ולקוחות עם רף תרומה/רכישה מעל 1,000 ש״ח',
        type: 'smart',
        category: 'group',
        isCommunity: false,
        count: 12,
        rules: [
          { field: 'total_spent', operator: 'gte', value: 1000 },
        ],
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // 3. CRM Interactions
  crm_interactions: [
    {
      id: 'interaction_demo_call_01',
      name: 'שיחת היכרות ותיאום ציפיות',
      data: {
        id: 'interaction_demo_call_01',
        contactId: 'contact_yossi_cohen_01',
        type: 'call',
        title: 'שיחת היכרות והצגת נגן AI',
        notes: 'הלקוח התלהב מאוד מהיכולת לפצל ענפי שיחה בווידאו וביקש הצעת מחיר עבור 5 נציגים',
        sentiment: 'positive',
        handledBy: 'מנהל מכירות',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    },
  ],

  // 4. Kesher & EasyCount Financial Transactions
  kesher_transactions: [
    {
      id: 'tx_kesher_demo_8841',
      name: 'עסקה 8841 - יוסי כהן (קבלה 405)',
      data: {
        id: 'tx_kesher_demo_8841',
        transactionId: '8841',
        docNumber: '10420',
        contactName: 'יוסי כהן',
        contactPhone: '050-1234567',
        amount: 2500,
        currency: 'ILS',
        receiptType: 405, // תרומה סעיף 46
        receiptTypeName: 'קבלה על תרומה (סעיף 46)',
        paymentMethod: 'credit_card',
        last4Digits: '4580',
        status: 'approved',
        downloadUrl: 'https://kesherhk.info/receipts/demo_10420.pdf',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    },
    {
      id: 'tx_kesher_demo_8842',
      name: 'עסקה 8842 - שרה לוי (חשבונית מס קבלה)',
      data: {
        id: 'tx_kesher_demo_8842',
        transactionId: '8842',
        docNumber: '10421',
        contactName: 'שרה לוי',
        contactPhone: '052-7654321',
        amount: 850,
        currency: 'ILS',
        receiptType: 320, // חשבונית מס קבלה
        receiptTypeName: 'חשבונית מס קבלה',
        paymentMethod: 'credit_card',
        last4Digits: '1122',
        status: 'approved',
        downloadUrl: 'https://kesherhk.info/receipts/demo_10421.pdf',
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
    },
  ],

  // 5. Smart Form Builder
  mod_forms: [
    {
      id: 'form_lead_generation_ai',
      name: 'טופס קבלת הדגמה וידאו AI',
      data: {
        id: 'form_lead_generation_ai',
        title: 'טופס קבלת הדגמה - וידאו AI אינטראקטיבי',
        description: 'השאירו פרטים ותוך 60 שניות תקבלו סרטון מותאם אישית למייל ולוואטסאפ',
        status: 'published',
        submissionsCount: 18,
        steps: [
          {
            id: 'step_1',
            title: 'פרטים אישיים',
            fields: [
              { id: 'f_name', label: 'שם מלא', type: 'text', required: true },
              { id: 'f_phone', label: 'מספר טלפון וואטסאפ', type: 'tel', required: true },
              { id: 'f_email', label: 'כתובת אימייל', type: 'email', required: false },
            ],
          },
        ],
        theme: {
          primaryColor: '#6366f1',
          accentColor: '#ec4899',
          borderRadius: 'xl',
        },
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // 6. WhatsApp Green API & AI Bots
  whatsapp_ai_bots: [
    {
      id: 'wa_bot_sales_assistant',
      name: 'סייר מכירות ומידע וואטסאפ AI',
      data: {
        id: 'wa_bot_sales_assistant',
        name: 'סייר מכירות ומידע וואטסאפ AI',
        status: 'active',
        model: 'gemini-3.8-flash',
        systemPrompt: 'אתה נציג שירות ומכירות אדיב ומקצועי של הארגון. ענה בעברית רהוטה וקצרה.',
        welcomeMessage: 'שלום! הגעת לעוזר הדיגיטלי שלנו. במה אוכל לעזור לך היום?',
        totalChats: 42,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    },
  ],

  // 7. Video Producer Studio
  sdo_video_projects: [
    {
      id: 'proj_ai_assistant_intro',
      name: 'סרטון תדמית והצגת עוזר AI אינטראקטיבי',
      data: {
        id: 'proj_ai_assistant_intro',
        title: 'סרטון תדמית והצגת עוזר AI אינטראקטיבי',
        productionType: 'marketing_promo',
        visualStyle: 'cinematic_photorealistic',
        aspectRatio: '16:9',
        targetAudience: 'בעלי עסקים ומנהלי שיווק',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // 8. Flow Player Engine
  sdo_player_campaign_configs: [
    {
      id: 'sales_rep_interactive_01',
      name: 'קמפיין נציגת מכירות אינטראקטיבית - הדגמה',
      data: {
        id: 'sales_rep_interactive_01',
        name: 'קמפיין נציגת מכירות אינטראקטיבית - הדגמה',
        slug: 'sales_rep_interactive_01',
        initialNodeId: 'node_intro',
        states: {
          node_intro: {
            id: 'node_intro',
            name: 'פתיח - הצגת המערכת',
            description: 'סרטון פתיחה המציג את סוכן ה-AI האינטראקטיבי',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            autoPlay: true,
            loopUntilTrigger: true,
            soundEnabled: true,
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'published',
        version: '1.0.0',
      },
    },
  ],
  presenters: [
    {
      id: 'presenter_elena_vance_san_francisco_01',
      name: 'Elena Vance - סוכנת מכירות AI',
      data: {
        id: 'presenter_elena_vance_san_francisco_01',
        name: 'Elena Vance',
        displayName: 'אלנה ואנס',
        role: 'סוכנת שיווק ומכירות אינטראקטיבית',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        voiceType: 'he-IL-Standard-A',
        language: 'he-IL',
        status: 'active',
        createdAt: Date.now(),
      },
    },
  ],

  // 9. Media Gallery
  sdo_media_items: [
    {
      id: 'media_intro_video_01',
      name: 'סרטון הדגמה ראשי.mp4',
      data: {
        id: 'media_intro_video_01',
        name: 'סרטון הדגמה ראשי.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        sizeBytes: 15400000,
        createdAt: Date.now() - 3600000,
        tags: ['demo', 'video'],
        updatedAt: Date.now(),
      },
    },
  ],
  sdo_media_folders: [
    {
      id: 'folder_videos_01',
      name: 'סרטוני וידאו ראשיים',
      data: {
        id: 'folder_videos_01',
        name: 'סרטוני וידאו ראשיים',
        color: '#6366f1',
        itemCount: 3,
        createdAt: Date.now(),
      },
    },
    {
      id: 'folder_images_01',
      name: 'תמונות וגרפיקה',
      data: {
        id: 'folder_images_01',
        name: 'תמונות וגרפיקה',
        color: '#eab308',
        itemCount: 1,
        createdAt: Date.now(),
      },
    },
  ],

  // 10. Page Builder
  mod_pagebuilder_pages: [
    {
      id: 'landing_page_main',
      name: 'דף נחיתה ראשי - Kosun Hub',
      data: {
        id: 'landing_page_main',
        title: 'דף נחיתה ראשי - Kosun Hub',
        slug: 'home',
        status: 'published',
        blocksCount: 5,
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // 11. Platform & User Management
  client_platform_configs: [
    {
      id: 'client_default_shell',
      name: 'קונפיגורציית לקוח ראשית',
      data: {
        id: 'client_default_shell',
        brandName: 'Kosun Client Platform',
        themeColor: '#6366f1',
        activeModules: ['video-producer', 'media-gallery-hub', 'flow-player-engine'],
        updatedAt: new Date().toISOString(),
      },
    },
  ],
  users: [
    {
      id: 'admin_master_user',
      name: 'מנהל מערכת ראשי',
      data: {
        id: 'admin_master_user',
        email: 'admin@kosun.io',
        displayName: 'מנהל מערכת',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
      },
    },
  ],

  // 11. SaaS Tenants (דיירים ולקוחות מערכת)
  tenants: [
    {
      id: 'demo',
      name: 'דייר הדגמה ראשי (demo)',
      data: {
        id: 'demo',
        subdomain: 'demo',
        fullDomain: 'demo.kosun.pro',
        clientName: 'הדגמת מערכת Kosun',
        ownerEmail: 'demo@kosun.pro',
        ownerPhone: '050-0000000',
        activeModules: ['KosWebAi', 'smart-form-builder', 'media-gallery-hub', 'crm-analytics', 'KosBranding'],
        collectionPrefix: 'tenant_demo_mod_',
        billingPlan: 'annual',
        monthlyTotal: 346,
        paymentTransactionId: 'TXN-DEMO-001',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'techsolutions',
      name: 'טק סולושנס (techsolutions)',
      data: {
        id: 'techsolutions',
        subdomain: 'techsolutions',
        fullDomain: 'techsolutions.kosun.pro',
        clientName: 'טק סולושנס בע״מ',
        ownerEmail: 'yossi@techsolutions.demo',
        ownerPhone: '050-1234567',
        activeModules: ['KosWebAi', 'flow-player', 'KosBranding', 'crm-analytics'],
        collectionPrefix: 'tenant_techsolutions_mod_',
        billingPlan: 'monthly',
        monthlyTotal: 489,
        paymentTransactionId: 'TXN-ORD-88219',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // SaaS Orders & Subscriptions (הזמנות ומודולים שנרכשו)
  saas_orders: [
    {
      id: 'TXN-DEMO-001',
      name: 'הזמנת הקמה - דמו (TXN-DEMO-001)',
      data: {
        id: 'TXN-DEMO-001',
        orderId: 'TXN-DEMO-001',
        subdomain: 'demo',
        clientName: 'הדגמת מערכת Kosun',
        ownerEmail: 'demo@kosun.pro',
        ownerPhone: '050-0000000',
        purchasedModules: ['KosWebAi', 'smart-form-builder', 'media-gallery-hub', 'crm-analytics', 'KosBranding'],
        billingPlan: 'annual',
        monthlyTotal: 346,
        paymentStatus: 'paid',
        paymentTransactionId: 'TXN-DEMO-001',
        purchasedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'TXN-ORD-88219',
      name: 'הזמנת חבילת Pro - טק סולושנס (TXN-ORD-88219)',
      data: {
        id: 'TXN-ORD-88219',
        orderId: 'TXN-ORD-88219',
        subdomain: 'techsolutions',
        clientName: 'טק סולושנס בע״מ',
        ownerEmail: 'yossi@techsolutions.demo',
        ownerPhone: '050-1234567',
        purchasedModules: ['KosWebAi', 'flow-player', 'KosBranding', 'crm-analytics'],
        billingPlan: 'monthly',
        monthlyTotal: 489,
        paymentStatus: 'paid',
        paymentTransactionId: 'TXN-ORD-88219',
        purchasedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // 12. Tenant Settings: Brand DNA (הגדרות דייר ומיתוג)
  settings: [
    {
      id: 'brand_dna',
      name: 'DNA מותג וזהות ארגונית (brand_dna)',
      data: {
        identity: {
          companyName: 'קמונה פתרונות דיגיטליים',
          organizationType: 'חברה',
          organizationPurpose: 'מתן פתרונות תוכנה ווידאו אינטראקטיבי מתקדמים לעסקים וקהילות',
          memberCount: '10-50',
          slogan: 'חדשנות, צמיחה וחוויית לקוח מתקדמת',
          companyVision: 'להוביל את הדור הבא של תקשורת מבוססת וידאו AI ואינטראקציה קולית.',
          shortVision: 'פתרונות דיגיטליים מתקדמים המניעים תוצאות.',
          logoUrl: '',
        },
        voice: {
          personality: { formality: 3, warmth: 4, luxury: 4, energy: 4 },
          genderAddressing: 'plural',
          sectorCompliance: 'general',
          powerWords: ['איכות', 'שקט נפשי', 'מומחיות', 'תוצאות מוכחות', 'ליווי אישי'],
          forbiddenWords: ['זול', 'מבצע אחרון בהחלט', 'חלטורה'],
        },
        designTokens: {
          primaryColor: '#6366f1',
          secondaryColor: '#ec4899',
          accentColor: '#f59e0b',
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
          borderRadius: 'xl',
          buttonStyle: 'solid',
        },
        updatedAt: new Date().toISOString(),
      },
    },
  ],

  // 13. System Global Platform Infrastructure (תשתיות מערכת כלליות)
  system_settings: [
    {
      id: 'global',
      name: 'תשתיות מערכת גלובליות (global)',
      data: {
        appName: 'Kosun Workspace',
        theme: 'dark',
        defaultLanguage: 'he',
        enableRealtimeSync: true,
        updatedAt: Date.now(),
      },
    },
  ],

  mod_template_items: [
    {
      id: 'item_sample_01',
      name: 'פריט לדוגמה מודול תבנית',
      data: {
        title: 'פריט תבנית ראשון',
        description: 'רשומה פעילה במסד הנתונים מודול תבנית',
        status: 'active',
        priority: 'high',
        createdAt: Date.now(),
      },
    },
  ],

  // 14. KOSUN AM ("קושאן מייל אוטומטי") Seed Data
  mod_kosun_am_campaigns: [
    {
      id: 'cmp_welcome_2026',
      name: 'קמפיין ברוכים הבאים - קושאן 2026',
      data: {
        id: 'cmp_welcome_2026',
        name: 'קמפיין ברוכים הבאים - קושאן 2026',
        subject: 'ברוכים הבאים למשפחת קושאן - המסע העסקי שלך מתחיל כאן',
        preheader: 'השותף האישי שלך לניהול דיוורים ושיווק דיגיטלי חכם',
        fromName: 'קושאן',
        fromEmail: 'hello@kosun.pro',
        templateId: 'tpl_welcome_modern',
        htmlContent: '<div dir="rtl" style="text-align: right; font-family: Heebo, sans-serif;"><h1>שלום וברוכים הבאים!</h1><p>קושאן דואג שהמסר השיווקי שלך יגיע בדיוק ליעד.</p></div>',
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
    },
    {
      id: 'cmp_summer_promo',
      name: 'השקת קולקציית קיץ ומבצעים בלעדיים',
      data: {
        id: 'cmp_summer_promo',
        name: 'השקת קולקציית קיץ ומבצעים בלעדיים',
        subject: 'הטבה מיוחדת רק לחברי המועדון של קושאן',
        preheader: '20% הנחה על כל השירותים הדיגיטליים למשך 48 שעות בלבד',
        fromName: 'קושאן שיווק',
        fromEmail: 'marketing@kosun.pro',
        templateId: 'tpl_promo_bento',
        htmlContent: '<div dir="rtl" style="text-align: right; font-family: Heebo, sans-serif;"><h2>מבצע קיץ מיוחד</h2><p>קושאן מכין לך הפתעות מיוחדות השבוע.</p></div>',
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
    },
  ],

  mod_kosun_am_templates: [
    {
      id: 'tpl_welcome_modern',
      name: 'תבנית ברוכים הבאים מודרנית (Bento)',
      data: {
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
              bodyText: 'נשלח באמצעות קושאן מייל אוטומטי. להסרה מהרשימה לחץ כאן.',
            },
          },
        ],
        htmlSnapshot: '<div dir="rtl" style="text-align: right;">תבנית ברירת מחדל של קושאן</div>',
        variables: ['contact_name', 'business_name'],
        isDefault: true,
        createdAt: '2026-10-01T12:00:00Z',
        updatedAt: '2026-10-01T12:00:00Z',
      },
    },
    {
      id: 'tpl_promo_bento',
      name: 'תבנית מבצעים וניוזלטר (Bento Grid)',
      data: {
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
        htmlSnapshot: '<div dir="rtl" style="text-align: right;">תבנית מבצעים של קושאן</div>',
        variables: ['contact_name', 'discount_code'],
        isDefault: false,
        createdAt: '2026-10-02T10:00:00Z',
        updatedAt: '2026-10-02T10:00:00Z',
      },
    },
  ],

  mod_kosun_am_automations: [
    {
      id: 'aut_new_lead_journey',
      name: 'קליטת ליד חדש + וואטסאפ (רב-ערוצי)',
      data: {
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
    },
  ],

  mod_kosun_am_logs: [
    {
      id: 'log_1001',
      name: 'יומן שליחה: ברוכים הבאים (client1@example.com)',
      data: {
        id: 'log_1001',
        campaignId: 'cmp_welcome_2026',
        recipientEmail: 'client1@example.com',
        subject: 'ברוכים הבאים למשפחת קושאן - המסע העסקי שלך מתחיל כאן',
        status: 'delivered',
        provider: 'resend',
        messageId: 're_mock_12345',
        dispatchedAt: '2026-10-10T09:00:15Z',
      },
    },
    {
      id: 'log_1002',
      name: 'יומן שליחה: פתיחה (client2@example.com)',
      data: {
        id: 'log_1002',
        campaignId: 'cmp_welcome_2026',
        recipientEmail: 'client2@example.com',
        subject: 'ברוכים הבאים למשפחת קושאן - המסע העסקי שלך מתחיל כאן',
        status: 'opened',
        provider: 'resend',
        messageId: 're_mock_12346',
        dispatchedAt: '2026-10-10T09:00:20Z',
      },
    },
    {
      id: 'log_1003',
      name: 'יומן שליחה: אוטומציה ליד (lead99@example.com)',
      data: {
        id: 'log_1003',
        automationId: 'aut_new_lead_journey',
        recipientEmail: 'lead99@example.com',
        subject: 'שמחים שהצטרפת - קושאן כאן בשבילך',
        status: 'simulated_success',
        provider: 'mock_local',
        messageId: 'mock_loc_9981',
        dispatchedAt: '2026-10-11T10:30:05Z',
      },
    },
  ],
};
