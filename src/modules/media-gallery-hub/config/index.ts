import { MediaGalleryCollectionsConfig, MediaItem, MediaType } from '../types';

export const DEFAULT_COLLECTION_PREFIX = 'sdo_media_';

export function resolveMediaCollections(
  prefix: string = DEFAULT_COLLECTION_PREFIX,
  custom?: MediaGalleryCollectionsConfig
): Required<MediaGalleryCollectionsConfig> {
  return {
    mediaItems: custom?.mediaItems || `${prefix}items`,
    folders: custom?.folders || `${prefix}folders`,
  };
}

const BUCKET = 'aioffice-1426f.firebasestorage.app';

export const INITIAL_SERVER_MEDIA: MediaItem[] = [
  {
    id: 'storage_1788087385571_scene_1_animated_mp4',
    name: 'scene_1_animated.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    url: `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent('sdo_media_vault/1788087385571_scene_1_animated.mp4')}?alt=media`,
    sizeBytes: 1992294,
    createdAt: 1788087385571,
    tags: ['firebase_storage', 'וידאו'],
  },
  {
    id: 'storage_1788089036047_scene_3_animated_mp4',
    name: 'scene_3_animated.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    url: `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent('sdo_media_vault/1788089036047_scene_3_animated.mp4')}?alt=media`,
    sizeBytes: 1992294,
    createdAt: 1788089036047,
    tags: ['firebase_storage', 'וידאו'],
  },
  {
    id: 'storage_1788094281947_batty_talk_1_mp4',
    name: 'batty_talk-1.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    url: `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent('sdo_media_vault/1788094281947_batty_talk-1.mp4')}?alt=media`,
    sizeBytes: 2264924,
    createdAt: 1788094281947,
    tags: ['firebase_storage', 'וידאו'],
  },
  {
    id: 'storage_1788094365029_batty_present_jpeg',
    name: 'batty_present.jpeg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent('sdo_media_vault/1788094365029_batty_present.jpeg')}?alt=media`,
    sizeBytes: 679055,
    createdAt: 1788094365029,
    tags: ['firebase_storage', 'תמונה'],
  },
  {
    id: 'media_crm_showcase',
    name: 'crm_showcase.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: '/images/crm_showcase.jpg',
    sizeBytes: 680245,
    createdAt: Date.now() - 4000,
    tags: ['crm', 'גלריה', 'תמונה', 'לוח בקרה'],
  },
  {
    id: 'media_whatsapp_automation',
    name: 'whatsapp_automation.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: '/images/whatsapp_automation.jpg',
    sizeBytes: 677024,
    createdAt: Date.now() - 3000,
    tags: ['whatsapp', 'בוטים', 'גלריה', 'תמונה'],
  },
  {
    id: 'media_page_builder_mockup',
    name: 'page_builder_mockup.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: '/images/page_builder_mockup.jpg',
    sizeBytes: 719288,
    createdAt: Date.now() - 2000,
    tags: ['page-builder', 'אתרים', 'גלריה', 'תמונה'],
  },
  {
    id: 'media_campaign_fundraising',
    name: 'campaign_fundraising.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: '/images/campaign_fundraising.jpg',
    sizeBytes: 689607,
    createdAt: Date.now() - 1000,
    tags: ['campaigns', 'גיוס', 'שגרירים', 'גלריה', 'תמונה'],
  },
];

export const INITIAL_SAMPLE_MEDIA: MediaItem[] = INITIAL_SERVER_MEDIA;