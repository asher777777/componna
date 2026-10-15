import React, { useState } from 'react';
import { PageBuilderConfig, ViewportMode } from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { isSectionVisibleInViewport } from '../utils/resolutionVisibility';
import { Sparkles, MessageCircle, Phone, LogIn } from 'lucide-react';
import { clsx } from 'clsx';
import { useBrandDna } from '../../KosBranding/hooks/useBrandDna';

interface LivePreviewFrameProps {
  config: PageBuilderConfig;
  viewportMode: ViewportMode;
  onNavigateSection?: (sectionId: string) => void;
  isDarkMode?: boolean;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({
  config,
  viewportMode,
  onNavigateSection,
  isDarkMode,
}) => {
  const { globalSettings, sectionOrder, sections } = config;
  const brandContext = useBrandDna();
  const brandLogoUrl = brandContext?.brandDna?.identity?.logoUrl;
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  const effectiveLogoUrl = !logoLoadFailed ? (globalSettings.siteLogoUrl || brandLogoUrl || '') : '';

  const defaultDarkBgList = [
    '#0a0a0c', '#090a0f', '#09090b', '#041017', '#0c0714', '#0f0728', 
    '#07090e', '#08080a', '#060608', '#000000', '#050505', '#111827', '#0f172a'
  ];
  const isDefaultDarkBg = !globalSettings.backgroundColor || defaultDarkBgList.includes(globalSettings.backgroundColor.toLowerCase());
  const customBgColor = !isDefaultDarkBg ? globalSettings.backgroundColor : undefined;

  const customStyle: React.CSSProperties = {
    ['--primary' as any]: globalSettings.primaryColor || '#4f46e5',
    ['--secondary' as any]: globalSettings.secondaryColor || '#ec4899',
    fontFamily: globalSettings.fontFamily || 'Heebo, sans-serif',
  };

  const viewportWidths: Record<ViewportMode, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px] my-6 shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800',
    mobile: 'w-[390px] my-6 shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800',
  };

  const isMobile = viewportMode === 'mobile';

  return (
    <div className="w-full flex justify-center bg-slate-200/70 dark:bg-slate-950/60 overflow-x-auto custom-scrollbar p-0 sm:p-4 min-h-screen transition-colors duration-300">
      <div
        className={clsx(
          'transition-all duration-300 bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-white flex flex-col min-h-full overflow-hidden relative shadow-2xl',
          viewportWidths[viewportMode],
          isDarkMode ? 'dark' : ''
        )}
        style={{
          ...customStyle,
          backgroundColor: customBgColor,
        }}
        dir="rtl"
      >
        {/* Sections Stream */}
        <main className="flex-1 flex flex-col">
          {sectionOrder.map((sectionId) => {
            const sectionData = sections[sectionId];
            if (!sectionData) return null;
            if (sectionData.visible === false) return null;
            if (!isSectionVisibleInViewport(sectionData, viewportMode)) return null;

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
          <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#08080a] py-12 px-6 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {globalSettings.companyName || globalSettings.siteTitle || 'אתר הקהילה'}
              </span>
              {globalSettings.slogan && <p className="text-slate-600 dark:text-slate-500">{globalSettings.slogan}</p>}
              <p className="text-slate-500 dark:text-slate-600">
                © {new Date().getFullYear()} כל הזכויות שמורות. נבנה באמצעות KWB.
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
