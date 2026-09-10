export interface SeedDataMap {
  [collectionName: string]: {
    id: string;
    name: string;
    data: Record<string, any>;
  }[];
}

export const PROJECT_SEED_DATA: SeedDataMap = {
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
  mod_pagebuilder_pages: [
    {
      id: 'landing_page_main',
      name: 'דף נחיתה ראשי - Comona Hub',
      data: {
        id: 'landing_page_main',
        title: 'דף נחיתה ראשי - Comona Hub',
        slug: 'home',
        status: 'published',
        blocksCount: 5,
        updatedAt: new Date().toISOString(),
      },
    },
  ],
  mod_crm_leads: [
    {
      id: 'lead_demo_01',
      name: 'יוסי כהן - מנהל טכנולוגיות',
      data: {
        id: 'lead_demo_01',
        fullName: 'יוסי כהן',
        company: 'טק סולושנס בע״מ',
        email: 'yossi@techsolutions.demo',
        phone: '050-1234567',
        status: 'new',
        createdAt: new Date().toISOString(),
      },
    },
  ],
  client_platform_configs: [
    {
      id: 'client_default_shell',
      name: 'קונפיגורציית לקוח ראשית',
      data: {
        id: 'client_default_shell',
        brandName: 'Comona Client Platform',
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
        email: 'admin@comona.io',
        displayName: 'מנהל מערכת',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
      },
    },
  ],
  settings: [
    {
      id: 'global_config',
      name: 'הגדרות סביבה גלובליות',
      data: {
        appName: 'Comona Workspace',
        theme: 'dark',
        defaultLanguage: 'he',
        enableRealtimeSync: true,
        updatedAt: Date.now(),
      },
    },
  ],
};
