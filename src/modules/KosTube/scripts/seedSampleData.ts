/**
 * KosTube Seed & Ingestion Verification Script
 * Used for testing channel structure definitions.
 */

import { KosTubeChannel, KosTubeVideo } from '../types';

export function getEmptyChannelTemplate(channelId: string, title: string): KosTubeChannel {
  return {
    id: channelId,
    channelId,
    title,
    description: '',
    thumbnailUrl: '',
    connectedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    autoGeneratePages: true,
  };
}
