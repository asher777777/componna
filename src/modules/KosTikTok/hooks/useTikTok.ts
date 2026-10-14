import { useTikTok } from '../context/TikTokContext';
import { KosTikTokPublishParams } from '../types';

export { useTikTok };

export function useTikTokPublisher() {
  const { publishVideo, isPublishing, activeAccount, error, clearError } = useTikTok();

  const handlePublish = async (params: KosTikTokPublishParams) => {
    return await publishVideo(params);
  };

  return {
    publishVideo: handlePublish,
    isPublishing,
    isConnected: Boolean(activeAccount && activeAccount.status === 'connected'),
    account: activeAccount,
    error,
    clearError,
  };
}

export function useTikTokLeads() {
  const { leads, refreshLeads, isLoading } = useTikTok();

  return {
    leads,
    refreshLeads,
    isLoading,
    totalLeads: leads.length,
    syncedLeadsCount: leads.filter(l => l.syncedToCrm).length,
  };
}
