import {
  KosTubeChannel,
  KosTubeVideo,
  KosTubeSeoPage,
  KosTubeSeoScoreBreakdown,
  KosTubeContract
} from '../../../core/contracts';

export type {
  KosTubeChannel,
  KosTubeVideo,
  KosTubeSeoPage,
  KosTubeSeoScoreBreakdown,
  KosTubeContract
};

export type VideoSyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export type SeoGenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface KosTubeFilterOptions {
  search?: string;
  status?: 'all' | 'pending' | 'processing' | 'processed' | 'error';
  sortBy?: 'date_desc' | 'date_asc' | 'views_desc';
}

export interface ChannelSyncResult {
  success: boolean;
  channel?: KosTubeChannel;
  videosCount?: number;
  error?: string;
}

export interface VideoSeoGenerationRequest {
  video: KosTubeVideo;
  customPrompt?: string;
  focusKeywords?: string[];
  targetAudience?: string;
  tone?: string;
}
