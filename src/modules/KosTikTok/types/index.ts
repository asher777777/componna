import {
  KosTikTokAccount,
  KosTikTokVideo,
  KosTikTokPublishParams,
  KosTikTokPublishResult,
  KosTikTokLead,
  KosTikTokEventPayload,
  KosTikTokContract,
} from '../../../core/contracts';

export type {
  KosTikTokAccount,
  KosTikTokVideo,
  KosTikTokPublishParams,
  KosTikTokPublishResult,
  KosTikTokLead,
  KosTikTokEventPayload,
  KosTikTokContract,
};

export type KosTikTokTab = 'overview' | 'videos' | 'publish' | 'leads' | 'events' | 'settings';

export type TikTokModalMode = 'connect-account' | 'publish-video' | 'preview-lead' | 'event-details' | null;

export interface TikTokAuthCredentials {
  clientKey: string;
  clientSecret?: string;
  redirectUri: string;
}

export interface TikTokPublishProgress {
  publishId: string;
  status: 'INITIATING' | 'UPLOADING' | 'PROCESSING' | 'PUBLISH_COMPLETE' | 'FAILED';
  errorMessage?: string;
  progressPercent: number;
}
