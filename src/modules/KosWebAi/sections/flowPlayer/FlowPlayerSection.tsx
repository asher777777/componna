import React from 'react';
import { FlowPlayerSectionConfig } from '../../types/sectionConfigs';
import { CapabilitySlot } from '../../../../core/bridge/CapabilitySlot';
import { Loader2, Play } from 'lucide-react';

export const FlowPlayerSection: React.FC<{ config: FlowPlayerSectionConfig }> = ({ config }) => {
  const targetCampaignId = config.campaignId || config.campaignSlug || 'demo-living-page';

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

        {/* 3. Pure Video Stage - Embedded Living Player via CapabilitySlot */}
        <div className="w-full flex justify-center">
          <CapabilitySlot
            name="living-page-player"
            props={{
              campaignId: targetCampaignId,
              embedMode: true,
              aspectRatio: '9:16',
            }}
            fallback={
              <div className="w-full max-w-[420px] aspect-[9/16] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-8 text-slate-400">
                <Play className="w-8 h-8 text-amber-500 mb-3" />
                <span className="text-xs font-medium">עמוד חי אינטראקטיבי</span>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
};
