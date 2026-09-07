import React from 'react';
import { PageBuilderConfig } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface PageBuilderRendererProps {
  config: PageBuilderConfig;
  onSelectDonationTier?: (tierId: string, mode: 'one_time' | 'recurring') => void;
  onLeadSubmit?: (formData: any) => void;
}

export const PageBuilderRenderer: React.FC<PageBuilderRendererProps> = ({
  config,
  onSelectDonationTier,
  onLeadSubmit,
}) => {
  const { globalSettings, sectionOrder, sections } = config;

  const customStyle: React.CSSProperties = {
    ['--primary' as any]: globalSettings.primaryColor || '#4f46e5',
    ['--secondary' as any]: globalSettings.secondaryColor || '#ec4899',
    ['--background' as any]: globalSettings.backgroundColor || '#0a0a0c',
    ['--foreground' as any]: globalSettings.textColor || '#f8fafc',
  };

  return (
    <div
      className={clsx(
        'flex flex-col min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500 selection:text-white',
        globalSettings.theme ? `theme-${globalSettings.theme}` : 'theme-navy'
      )}
      style={customStyle}
      dir="rtl"
    >
      {/* Global Navbar */}
      {globalSettings.isHeaderVisible !== false && (
        <header
          className={clsx(
            'w-full border-b border-white/10 px-4 sm:px-8 py-4 z-40 bg-[#0c0c0e]/95 backdrop-blur-md transition-all',
            globalSettings.headerSticky !== false && 'sticky top-0'
          )}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {globalSettings.siteLogoUrl ? (
                <img src={globalSettings.siteLogoUrl} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                  {globalSettings.companyName?.charAt(0) || 'C'}
                </div>
              )}
              <div className="text-right">
                <span className="font-extrabold text-base sm:text-lg text-white block leading-tight">
                  {globalSettings.siteTitle || globalSettings.companyName || 'אתר הקהילה'}
                </span>
                {globalSettings.slogan && (
                  <span className="text-[11px] text-slate-400 block">{globalSettings.slogan}</span>
                )}
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
              {sectionOrder.map((secId) => {
                const sec = sections[secId];
                if (!sec || sec.visible === false) return null;
                const reg = SECTION_REGISTRY[sec.type as keyof typeof SECTION_REGISTRY];
                return (
                  <a
                    key={secId}
                    href={`#${sec.anchorId || secId}`}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    {sec.title || reg?.name?.split(' ')[0] || secId}
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {globalSettings.contactWhatsApp && (
                <a
                  href={`https://wa.me/${globalSettings.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>וואטסאפ</span>
                </a>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Page Stream */}
      <main className="flex-1 flex flex-col">
        {sectionOrder.map((sectionId) => {
          const sectionData = sections[sectionId];
          if (!sectionData || sectionData.visible === false) return null;

          const regDef = SECTION_REGISTRY[sectionData.type as keyof typeof SECTION_REGISTRY];
          if (!regDef) return null;

          const ViewComponent = regDef.viewComponent;

          return (
            <div
              key={sectionId}
              id={sectionData.anchorId || sectionId}
              className={clsx(
                'w-full relative',
                sectionData.mobileHidden && 'hidden md:block'
              )}
            >
              <ViewComponent
                config={sectionData}
                onSelectTier={onSelectDonationTier}
                onLeadSubmit={onLeadSubmit}
              />
            </div>
          );
        })}
      </main>

      {/* Global Footer */}
      {globalSettings.isFooterVisible !== false && (
        <footer className="w-full border-t border-white/10 bg-[#08080a] py-12 px-6 text-center text-xs text-slate-400">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
            <span className="font-bold text-white text-base">
              {globalSettings.companyName || globalSettings.siteTitle || 'אתר הקהילה'}
            </span>
            {globalSettings.slogan && <p className="text-slate-400">{globalSettings.slogan}</p>}
            <p className="text-slate-500">
              © {new Date().getFullYear()} כל הזכויות שמורות. נבנה באמצעות Comona Page Builder.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
