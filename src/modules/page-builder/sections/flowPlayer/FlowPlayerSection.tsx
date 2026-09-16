import React, { useEffect, useState } from 'react';
import { FlowPlayerSectionConfig } from '../../types/sectionConfigs';
import { FlowPlayerModuleProvider } from '../../../flow-player-engine/context/ModuleContext';
import { PlayerMachineProvider } from '../../../flow-player-engine/context/PlayerMachineContext';
import { PlayerContainer } from '../../../flow-player-engine/components/PlayerContainer';
import { FirestoreService } from '../../../flow-player-engine/services/firestoreService';
import { DEFAULT_CAMPAIGN_CONFIG, resolveCollections } from '../../../flow-player-engine/config';
import { CampaignConfig } from '../../../flow-player-engine/types';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { Loader2 } from 'lucide-react';

export const FlowPlayerSection: React.FC<{ config: FlowPlayerSectionConfig }> = ({ config }) => {
  const { firebaseApp, db } = useSystemConnection();
  const [campaign, setCampaign] = useState<CampaignConfig>(DEFAULT_CAMPAIGN_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);

  const collections = resolveCollections('sdo_player_');
  const targetCampaignId = config.campaignId || config.campaignSlug || DEFAULT_CAMPAIGN_CONFIG.id;

  useEffect(() => {
    let isMounted = true;

    async function loadCampaign() {
      setLoading(true);
      try {
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 2500)
        );
        const loadPromise = FirestoreService.getCampaignConfig(
          db as any,
          collections,
          targetCampaignId
        );
        const loaded = await Promise.race([loadPromise, timeoutPromise]);

        if (loaded && isMounted) {
          setCampaign(loaded);
        } else if (isMounted) {
          setCampaign(DEFAULT_CAMPAIGN_CONFIG);
        }
      } catch (err) {
        console.warn('[FlowPlayerSection] Failed to load campaign:', err);
        if (isMounted) {
          setCampaign(DEFAULT_CAMPAIGN_CONFIG);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [targetCampaignId, db]);

  const widthClasses = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    full: 'w-full',
  }[config.containerWidth || 'lg'];

  const overlayOpacity = (config.desktopBgOverlayOpacity ?? 40) / 100;

  return (
    <section
      id={`section-${config.id || 'flow-player'}`}
      className={`relative py-8 sm:py-14 px-2 sm:px-4 overflow-hidden transition-all ${
        config.mobileHidden ? 'hidden md:block' : ''
      }`}
      style={{ backgroundColor: config.backgroundColor || 'transparent' }}
      dir="rtl"
    >
      {/* 1. Desktop-Only Background Layer (Hidden on Mobile) */}
      {config.desktopBgImage && (
        <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden z-0">
          {config.desktopBgStyle === 'blur-ambient' ? (
            <div
              className="absolute inset-0 scale-110 filter blur-3xl opacity-40 transform transition-all duration-700"
              style={{
                backgroundImage: `url(${config.desktopBgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{
                backgroundImage: `url(${config.desktopBgImage})`,
                backgroundSize: config.desktopBgStyle === 'contain' ? 'contain' : 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: config.desktopBgStyle === 'pattern' ? 'repeat' : 'no-repeat',
              }}
            />
          )}

          {/* Desktop Overlay Gradient & Dimmer */}
          <div
            className="absolute inset-0 bg-slate-950 transition-opacity"
            style={{ opacity: overlayOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
        </div>
      )}

      {/* 2. Main Content Container */}
      <div className={`relative z-10 mx-auto ${widthClasses} space-y-4 flex flex-col items-center`}>
        {/* Optional Section Title & Subtitle (Only if enabled) */}
        {config.showSectionHeader && (config.sectionTitle || config.sectionSubtitle) && (
          <div className="text-center space-y-2 mb-2 max-w-2xl animate-fade-in">
            {config.sectionTitle && (
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {config.sectionTitle}
              </h2>
            )}
            {config.sectionSubtitle && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {config.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* 3. Pure Video Stage - Embedded Player (Zero Clutter, Zero Admin Bars) */}
        <div className="w-full flex justify-center">
          {loading ? (
            <div className="w-full max-w-[420px] aspect-[9/16] rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center p-8 text-slate-400">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
              <span className="text-xs font-medium">טוען נגן אינטראקטיבי...</span>
            </div>
          ) : (
            <FlowPlayerModuleProvider
              config={{
                firebaseApp,
                db: db as any,
                collectionPrefix: 'sdo_player_',
                initialCampaign: campaign,
              }}
            >
              <PlayerMachineProvider
                key={`${campaign.id}_${campaign.slug || ''}_${campaign.updatedAt || '0'}`}
                initialCampaign={campaign}
                initialMode="live"
              >
                <PlayerContainer className="w-full p-0 sm:p-0" embedMode={true} />
              </PlayerMachineProvider>
            </FlowPlayerModuleProvider>
          )}
        </div>
      </div>
    </section>
  );
};
