import { DEFAULT_CAMPAIGN_CONFIG } from '../../flow-player-engine/config';
import { INITIAL_SERVER_MEDIA } from '../../media-gallery-hub/config';

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
      id: DEFAULT_CAMPAIGN_CONFIG.id,
      name: DEFAULT_CAMPAIGN_CONFIG.name,
      data: {
        ...DEFAULT_CAMPAIGN_CONFIG,
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
  sdo_media_items: INITIAL_SERVER_MEDIA.map((item) => ({
    id: item.id,
    name: item.name,
    data: {
      ...item,
      updatedAt: Date.now(),
    },
  })),
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
