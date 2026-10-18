import React, { useState, useEffect } from 'react';
import { Sparkles, X, Minus } from 'lucide-react';
import { LivingPlayerContainer } from './LivingPlayerContainer';
import { KOS_LIVE_AVATARS } from '../config';
import { ConciergePageUiConfig } from '../types';
import {
  LivingStorageService,
  DEFAULT_CONCIERGE_PAGE_UI_CONFIG
} from '../services/livingStorageService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';

interface FloatingConciergeWidgetProps {
  campaignId?: string;
  avatarId?: string;
  greetingText?: string;
  position?: 'bottom-right' | 'bottom-left';
  /** Allow forcing preview inside the studio editor */
  forceVisibleForPreview?: boolean;
  overrideConfig?: Partial<ConciergePageUiConfig>;
}

export const FloatingConciergeWidget: React.FC<FloatingConciergeWidgetProps> = ({
  campaignId,
  avatarId,
  greetingText,
  position,
  forceVisibleForPreview = false,
  overrideConfig
}) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [uiConfig, setUiConfig] = useState<ConciergePageUiConfig>(() => ({
    ...DEFAULT_CONCIERGE_PAGE_UI_CONFIG,
    ...LivingStorageService.getLocalPageUiConfig(tenantId)
  }));
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Sync with Firestore and live studio updates
  useEffect(() => {
    let mounted = true;
    LivingStorageService.loadPageUiConfig(db as any, tenantId).then(loaded => {
      if (mounted && loaded) {
        setUiConfig(loaded);
      }
    });

    const handleConfigUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<ConciergePageUiConfig>;
      if (customEvent.detail) {
        setUiConfig(customEvent.detail);
        setIsDismissed(false);
      } else {
        setUiConfig(LivingStorageService.getLocalPageUiConfig(tenantId));
      }
    };

    window.addEventListener('koslive:page-ui-config-updated', handleConfigUpdated);
    window.addEventListener('storage', handleConfigUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('koslive:page-ui-config-updated', handleConfigUpdated);
      window.removeEventListener('storage', handleConfigUpdated);
    };
  }, [db, tenantId]);

  const effectiveConfig: ConciergePageUiConfig = {
    ...uiConfig,
    ...(campaignId ? { activeCampaignId: campaignId } : {}),
    ...(avatarId ? { avatarId } : {}),
    ...(greetingText !== undefined ? { greetingText } : {}),
    ...(position ? { position } : {}),
    ...overrideConfig
  };

  const avatar =
    KOS_LIVE_AVATARS.find(a => a.id === effectiveConfig.avatarId) || KOS_LIVE_AVATARS[1];
  const avatarImageSrc = effectiveConfig.customAvatarImageUrl || avatar.previewImageUrl;
  const effectiveGreeting = (effectiveConfig.greetingText ?? '').trim();

  // Don't render floating widget when user is inside the studio itself or public fullscreen view (unless forceVisibleForPreview)
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  const isInsideStudioOrLive =
    pathname.startsWith('/koslive') ||
    pathname.startsWith('/koslivepage') ||
    pathname.startsWith('/live/') ||
    pathname.startsWith('/video-producer') ||
    pathname.startsWith('/flow-player-engine');

  // א. כברירת מחדל ה-UI בעמוד נסתר (isVisibleOnPage === false)
  if (!forceVisibleForPreview) {
    if (!effectiveConfig.isVisibleOnPage || isInsideStudioOrLive || isDismissed) {
      return null;
    }
  }

  const posClass =
    effectiveConfig.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6';

  return (
    <div
      className={`${
        forceVisibleForPreview ? 'relative inline-flex' : `fixed ${posClass} z-50 flex`
      } flex-col items-end select-none font-sans`}
      dir="rtl"
    >
      {/* Expanded Interactive Video Drawer / Card */}
      {isOpen && (
        <div className="mb-4 w-[330px] sm:w-[375px] h-[560px] bg-black border-2 border-amber-500/60 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-scale-up relative">
          {/* Header */}
          <div className="absolute top-2 left-2 right-2 z-40 flex items-center justify-between p-1 bg-black/40 backdrop-blur-md rounded-full pointer-events-auto">
            <div className="flex items-center gap-2 px-3 text-xs text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{avatar.name}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer"
              title="מזער חלון"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Embedded Player */}
          <div className="w-full h-full">
            <LivingPlayerContainer
              campaignId={effectiveConfig.activeCampaignId || 'demo-living-page'}
              aspectRatio="9:16"
              embedMode={true}
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Collapsed Floating Bubble Trigger */}
      {!isOpen && (
        <div className="flex items-center gap-2.5 group">
          {/* Dismiss button */}
          {!forceVisibleForPreview && (
            <button
              onClick={() => setIsDismissed(true)}
              className="w-5 h-5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition cursor-pointer"
              title="הסתר קונסיירז'"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* ב. במובייל הסתר את הטקסט שמופיע ליד התמונה של האווטאר (hidden sm:flex) ואפשר עריכה שלו */}
          {effectiveConfig.showTextOnDesktop !== false && effectiveGreeting.length > 0 && (
            <div
              onClick={() => setIsOpen(true)}
              className={`${
                effectiveConfig.hideTextOnMobile !== false ? 'hidden sm:flex' : 'flex'
              } cursor-pointer bg-slate-950/95 backdrop-blur-md border border-amber-500/50 text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold items-center gap-2 hover:border-amber-400 transition`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{effectiveGreeting}</span>
            </div>
          )}

          {/* Avatar Bubble Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-[0_4px_25px_rgba(234,179,8,0.5)] hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
            title={effectiveGreeting || 'פתח עמוד חי'}
          >
            <img
              src={avatarImageSrc}
              alt={avatar.name}
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </button>
        </div>
      )}
    </div>
  );
};
