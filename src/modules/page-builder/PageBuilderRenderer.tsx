import React from 'react';
import { PageBuilderConfig } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { MessageCircle, Phone, ArrowLeft, Heart, ShieldCheck, MapPin } from 'lucide-react';
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
  const { globalSettings, seoSettings, sectionOrder, sections } = config;

  const customStyle: React.CSSProperties = {
    ['--primary' as any]: globalSettings.primaryColor || '#6366f1',
    ['--secondary' as any]: globalSettings.secondaryColor || '#0ea5e9',
    ['--background' as any]: globalSettings.backgroundColor || '#0a0a0c',
    ['--foreground' as any]: globalSettings.textColor || '#f8fafc',
    fontFamily: globalSettings.fontFamily || 'Heebo, sans-serif',
  };

  // Schema.org GEO JSON-LD
  const geo = seoSettings?.geo;
  const jsonLd = geo?.enabled
    ? {
        '@context': 'https://schema.org',
        '@type': geo.localBusinessType || 'LocalBusiness',
        name: geo.localBusinessName || config.pageTitle,
        description: seoSettings?.description || globalSettings?.slogan,
        address: {
          '@type': 'PostalAddress',
          streetAddress: geo.businessAddress || globalSettings.address,
          addressLocality: geo.targetCity,
          addressRegion: geo.targetRegion,
          addressCountry: geo.targetCountry || 'IL',
        },
        telephone: geo.businessPhone || globalSettings.contactPhone,
        email: geo.businessEmail || globalSettings.contactEmail,
        openingHours: geo.openingHours,
        areaServed: geo.serviceAreas,
      }
    : null;

  return (
    <div
      className={clsx(
        'flex flex-col min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500 selection:text-white',
        globalSettings.theme ? `theme-${globalSettings.theme}` : 'theme-modern'
      )}
      style={customStyle}
      dir="rtl"
    >
      {/* Schema.org GEO Script Tag */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Floating Glass Navbar */}
      {globalSettings.isHeaderVisible !== false && (
        <header
          className={clsx(
            'w-full z-40 transition-all duration-300 px-4 sm:px-8 py-4',
            globalSettings.headerSticky !== false && 'sticky top-0 backdrop-blur-2xl bg-[#0a0a0c]/85 border-b border-white/10 shadow-lg shadow-black/40'
          )}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              {globalSettings.siteLogoUrl ? (
                <img src={globalSettings.siteLogoUrl} alt="Logo" className="h-10 w-auto object-contain rounded-lg" />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
                  {globalSettings.companyName?.charAt(0) || 'C'}
                </div>
              )}
              <div className="text-right">
                <span className="font-black text-base sm:text-lg text-white block leading-tight">
                  {globalSettings.siteTitle || globalSettings.companyName || 'אתר הקהילה'}
                </span>
                {globalSettings.slogan && (
                  <span className="text-[11px] text-slate-400 block font-medium">{globalSettings.slogan}</span>
                )}
              </div>
            </div>

            {/* Nav and header buttons removed per user request */}
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

      {/* Global Floating WhatsApp Button */}
      {globalSettings.contactWhatsApp && (
        <a
          href={`https://wa.me/${globalSettings.contactWhatsApp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all shadow-2xl shadow-emerald-600/40 hover:scale-110"
          title="שיחה בוואטסאפ"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden sm:inline text-sm">שיחה בוואטסאפ</span>
        </a>
      )}

      {/* Global Rich Footer */}
      {globalSettings.isFooterVisible !== false && (
        <footer className="w-full border-t border-white/10 bg-[#060608] py-14 px-6 text-center text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-right">
              <span className="font-black text-white text-lg block">
                {globalSettings.companyName || globalSettings.siteTitle || 'אתר הקהילה'}
              </span>
              {globalSettings.slogan && <p className="text-slate-400 mt-1">{globalSettings.slogan}</p>}
              {globalSettings.address && (
                <p className="text-slate-500 text-[11px] mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{globalSettings.address}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>מאובטח ומוגן בתקן SSL 256-bit</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                © {new Date().getFullYear()} {globalSettings.companyName || 'כל הזכויות שמורות'}. נבנה באמצעות Comona Page Builder.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
