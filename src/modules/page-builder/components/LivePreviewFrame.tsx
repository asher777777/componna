import React, { useState } from 'react';
import { PageBuilderConfig, ViewportMode } from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { Sparkles, MessageCircle, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import { useBrandDna } from '../../brand-dna-hub/hooks/useBrandDna';

interface LivePreviewFrameProps {
  config: PageBuilderConfig;
  viewportMode: ViewportMode;
  onNavigateSection?: (sectionId: string) => void;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({
  config,
  viewportMode,
  onNavigateSection,
}) => {
  const { globalSettings, sectionOrder, sections } = config;
  const brandContext = useBrandDna();
  const brandLogoUrl = brandContext?.brandDna?.identity?.logoUrl;
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  const effectiveLogoUrl = !logoLoadFailed ? (globalSettings.siteLogoUrl || brandLogoUrl || '') : '';

  const customStyle: React.CSSProperties = {
    ['--primary' as any]: globalSettings.primaryColor || '#4f46e5',
    ['--secondary' as any]: globalSettings.secondaryColor || '#ec4899',
    ['--background' as any]: globalSettings.backgroundColor || '#0a0a0c',
    ['--foreground' as any]: globalSettings.textColor || '#f8fafc',
  };

  const viewportWidths: Record<ViewportMode, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px] my-6 shadow-2xl rounded-3xl border border-slate-800',
    mobile: 'w-[390px] my-6 shadow-2xl rounded-3xl border border-slate-800',
  };

  const isMobile = viewportMode === 'mobile';

  return (
    <div className="w-full flex justify-center bg-slate-950/60 overflow-x-auto custom-scrollbar p-0 sm:p-4 min-h-screen">
      <div
        className={clsx(
          'transition-all duration-300 bg-[#0a0a0c] text-white flex flex-col min-h-full overflow-hidden relative',
          viewportWidths[viewportMode]
        )}
        style={customStyle}
        dir="rtl"
      >
        {/* Mock Global Navbar with Layout Styles */}
        {globalSettings.isHeaderVisible !== false && (() => {
          const layout = globalSettings.headerLayout || 'floating-glass';
          const isFloating = layout === 'floating-glass';
          const isTransparent = layout === 'transparent';
          const isCentered = layout === 'centered';
          const isMinimal = layout === 'minimal';

          return (
            <nav
              className={clsx(
                'w-full z-30 transition-all',
                isFloating && 'p-3',
                !isFloating && 'px-6 py-3 border-b border-white/10',
                globalSettings.headerSticky !== false && 'sticky top-0',
                isTransparent ? 'bg-transparent text-white' : 'bg-[#0c0c0e]/90 backdrop-blur-md'
              )}
            >
              <div
                className={clsx(
                  'flex items-center',
                  isFloating && 'rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 shadow-md',
                  isCentered ? 'flex-col sm:flex-row justify-center sm:justify-between gap-3' : 'justify-between gap-4'
                )}
              >
                <div className={clsx('flex items-center gap-3', isCentered && 'justify-center')}>
                  {effectiveLogoUrl ? (
                    <img
                      src={effectiveLogoUrl}
                      alt={globalSettings.companyName || 'קושאן'}
                      onError={() => setLogoLoadFailed(true)}
                      className={clsx(isMinimal ? 'h-6' : 'h-8', 'w-auto max-w-[120px] object-contain')}
                    />
                  ) : (
                    <div
                      className={clsx(
                        'rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/30',
                        isMinimal ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
                      )}
                    >
                      {globalSettings.companyName?.charAt(0) || brandContext?.brandDna?.identity?.companyName?.charAt(0) || 'ק'}
                    </div>
                  )}
                  <span className={clsx('font-bold text-white', isMinimal ? 'text-xs' : 'text-sm sm:text-base')}>
                    {globalSettings.siteTitle || globalSettings.companyName || 'קושאן'}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-slate-300">
                  {sectionOrder.map((secId) => {
                    const sec = sections[secId];
                    if (!sec || sec.visible === false) return null;
                    const reg = SECTION_REGISTRY[sec.type as keyof typeof SECTION_REGISTRY];
                    return (
                      <a
                        key={secId}
                        href={`#${sec.anchorId || secId}`}
                        onClick={(e) => {
                          if (onNavigateSection) {
                            e.preventDefault();
                            onNavigateSection(secId);
                          }
                        }}
                        className="hover:text-indigo-400 transition-colors"
                      >
                        {reg?.name?.split(' ')[0] || sec.title || secId}
                      </a>
                    );
                  })}
                </div>

                {globalSettings.contactWhatsApp && (
                  <a
                    href={`https://wa.me/${globalSettings.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>וואטסאפ</span>
                  </a>
                )}
              </div>
            </nav>
          );
        })()}

        {/* Sections Stream */}
        <main className="flex-1 flex flex-col">
          {sectionOrder.map((sectionId) => {
            const sectionData = sections[sectionId];
            if (!sectionData) return null;
            if (sectionData.visible === false) return null;
            if (isMobile && sectionData.mobileHidden === true) return null;

            const regDef = SECTION_REGISTRY[sectionData.type as keyof typeof SECTION_REGISTRY];
            if (!regDef) return null;

            const ViewComponent = regDef.viewComponent;

            return (
              <div key={sectionId} id={sectionData.anchorId || sectionId} className="w-full relative">
                <ViewComponent config={sectionData} />
              </div>
            );
          })}
        </main>

        {/* Mock Global Footer */}
        {globalSettings.isFooterVisible !== false && (
          <footer className="w-full border-t border-white/10 bg-[#08080a] py-12 px-6 text-center text-xs text-slate-400">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
              <span className="font-bold text-white text-sm">
                {globalSettings.companyName || globalSettings.siteTitle || 'אתר הקהילה'}
              </span>
              {globalSettings.slogan && <p className="text-slate-500">{globalSettings.slogan}</p>}
              <p className="text-slate-600">
                © {new Date().getFullYear()} כל הזכויות שמורות. נבנה באמצעות Kosun Web.
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
