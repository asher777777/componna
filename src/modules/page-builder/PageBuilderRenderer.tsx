import React, { useState } from 'react';
import { PageBuilderConfig } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { 
  MessageCircle, Phone, ArrowLeft, Heart, ShieldCheck, MapPin, LogIn,
  Edit3, ArrowUp, ArrowDown, Eye, EyeOff, Trash2, Copy, Sparkles, Plus, Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import { useBrandDna } from '../brand-dna-hub/hooks/useBrandDna';
import { AuthModal } from '../../components/Auth/AuthModal';
import { AddSectionModal } from './components/AddSectionModal';
import { AiSectionDesignerModal } from './components/AiSectionDesignerModal';
import { PageBuilderModal } from './ui/PageBuilderModal';
import { SectionType } from './types/pageBuilder.types';
import { FloatingWeAreHereWidget } from './components/FloatingWeAreHereWidget';
import { FloatingWidgetSettingsModal } from './components/FloatingWidgetSettingsModal';
import { Check } from 'lucide-react';

export interface PageBuilderRendererProps {
  config: PageBuilderConfig;
  isEditing?: boolean;
  onUpdateSection?: (sectionId: string, updatedData: any) => void;
  onSaveSection?: (sectionId: string, updatedData?: any) => Promise<void> | void;
  onDeleteSection?: (sectionId: string) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onMoveSectionUp?: (index: number) => void;
  onMoveSectionDown?: (index: number) => void;
  onToggleSectionVisibility?: (sectionId: string) => void;
  onAddSection?: (type: SectionType, insertIndex?: number) => void;
  onUpdateGlobalSettings?: (updatedGlobalSettings: any) => void;
  onSelectDonationTier?: (tierId: string, mode: 'one_time' | 'recurring') => void;
  onLeadSubmit?: (formData: any) => void;
}

export const PageBuilderRenderer: React.FC<PageBuilderRendererProps> = ({
  config,
  isEditing = false,
  onUpdateSection,
  onSaveSection,
  onDeleteSection,
  onDuplicateSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onToggleSectionVisibility,
  onAddSection,
  onUpdateGlobalSettings,
  onSelectDonationTier,
  onLeadSubmit,
}) => {
  const { globalSettings, seoSettings, sectionOrder, sections } = config;
  const brandContext = useBrandDna();
  const brandLogoUrl = brandContext?.brandDna?.identity?.logoUrl;
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // In-place section editing states
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [aiDesignerSectionId, setAiDesignerSectionId] = useState<string | null>(null);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [addSectionInsertIndex, setAddSectionInsertIndex] = useState<number | undefined>(undefined);
  const [isWidgetSettingsModalOpen, setIsWidgetSettingsModalOpen] = useState(false);
  const [savedNotificationSectionId, setSavedNotificationSectionId] = useState<string | null>(null);

  // Fallback cascade: page siteLogoUrl -> Brand DNA identity.logoUrl
  const effectiveLogoUrl = !logoLoadFailed ? (globalSettings.siteLogoUrl || brandLogoUrl || '') : '';

  const customStyle: React.CSSProperties = {
    ['--primary' as any]: globalSettings.primaryColor || '#6366f1',
    ['--secondary' as any]: globalSettings.secondaryColor || '#0ea5e9',
    ['--background' as any]: globalSettings.backgroundColor || '#0a0a0c',
    ['--foreground' as any]: globalSettings.textColor || '#f8fafc',
    fontFamily: globalSettings.fontFamily || 'Heebo, sans-serif',
  };

  // Schema.org GEO & AIO (Generative Engine Optimization) JSON-LD
  const geo = seoSettings?.geo;
  const hasAio = Boolean(seoSettings?.aiKnowledgeSummary || seoSettings?.aiTargetQuestions?.length);

  const mainEntityLd = (geo?.enabled || hasAio)
    ? {
        '@context': 'https://schema.org',
        '@type': seoSettings?.aiEntitySchemaType || geo?.localBusinessType || 'LocalBusiness',
        name: geo?.localBusinessName || config.pageTitle,
        description: seoSettings?.aiKnowledgeSummary || seoSettings?.description || globalSettings?.slogan,
        ...(geo?.enabled
          ? {
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
          : {}),
      }
    : null;

  const faqLd = seoSettings?.aiTargetQuestions && seoSettings.aiTargetQuestions.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seoSettings.aiTargetQuestions.map((q) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: seoSettings.aiKnowledgeSummary || seoSettings.description || config.pageTitle,
          },
        })),
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
      {/* Schema.org GEO & AIO Entity and FAQ Script Tags */}
      {mainEntityLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(mainEntityLd) }}
        />
      )}
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Main Page Stream */}
      <main className="flex-1 flex flex-col relative">
        {sectionOrder.map((sectionId, index) => {
          const sectionData = sections[sectionId];
          if (!sectionData) return null;
          // In view mode, skip hidden sections; in edit mode, render them with dim opacity & status badge
          if (!isEditing && sectionData.visible === false) return null;

          const regDef = SECTION_REGISTRY[sectionData.type as keyof typeof SECTION_REGISTRY];
          if (!regDef) return null;

          const ViewComponent = regDef.viewComponent;
          const isFirst = index === 0;
          const isLast = index === sectionOrder.length - 1;
          const isHidden = sectionData.visible === false;

          return (
            <div
              key={sectionId}
              id={sectionData.anchorId || sectionId}
              className={clsx(
                'w-full relative group/section transition-all',
                sectionData.mobileHidden && !isEditing && 'hidden md:block',
                isEditing && 'border-y border-dashed border-slate-700/60 hover:border-indigo-500/80 my-1 py-1',
                isHidden && 'opacity-60 bg-slate-950/40'
              )}
            >
              {/* On-Page Live Edit Floating Toolbar */}
              {isEditing && (
                <div className={clsx(
                  "max-w-7xl mx-auto px-4 mb-2",
                  sectionData.type === 'header' ? 'relative z-50 pt-2' : 'sticky top-4 z-40'
                )}>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-right animate-in fade-in duration-150">
                    {/* Left: Section Type & Title */}
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                        {regDef.name || sectionData.type}
                      </span>
                      {sectionData.adminTitle && (
                        <span className="text-xs text-slate-300 truncate font-bold">
                          {sectionData.adminTitle}
                        </span>
                      )}
                      {isHidden && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          מוסתר מגולשים
                        </span>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                      {/* Edit Content */}
                      <button
                        type="button"
                        onClick={() => setEditingSectionId(sectionId)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        title="עריכת תוכן והגדרות אזור זה"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ערוך אזור</span>
                      </button>

                      {/* Save Specific Section Button */}
                      {onSaveSection && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onSaveSection(sectionId, sectionData);
                            setSavedNotificationSectionId(sectionId);
                            setTimeout(() => setSavedNotificationSectionId(null), 2500);
                          }}
                          className={clsx(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer",
                            savedNotificationSectionId === sectionId
                              ? "bg-emerald-600 text-white border border-emerald-400"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          )}
                          title="שמירת שינויי אזור זה"
                        >
                          <Check className={clsx("w-3.5 h-3.5", savedNotificationSectionId === sectionId ? "text-white" : "text-emerald-400")} />
                          <span>{savedNotificationSectionId === sectionId ? 'נשמר בהצלחה!' : 'שמור אזור'}</span>
                        </button>
                      )}

                      {/* AI Re-design */}
                      <button
                        type="button"
                        onClick={() => setAiDesignerSectionId(sectionId)}
                        className="p-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white transition cursor-pointer"
                        title="עיצוב מחדש בעזרת AI"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Visibility Toggle (Hide / Show) */}
                      {onToggleSectionVisibility && (
                        <button
                          type="button"
                          onClick={() => onToggleSectionVisibility(sectionId)}
                          className={clsx(
                            'p-1.5 rounded-xl border transition cursor-pointer',
                            !isHidden
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                              : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          )}
                          title={!isHidden ? 'הסתר אזור' : 'הצג אזור'}
                        >
                          {!isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Move Up (Not applicable to permanent top Header) */}
                      {onMoveSectionUp && sectionData.type !== 'header' && (
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => onMoveSectionUp(index)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 text-slate-300 transition cursor-pointer"
                          title="העבר למעלה"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Move Down (Not applicable to permanent top Header) */}
                      {onMoveSectionDown && sectionData.type !== 'header' && (
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => onMoveSectionDown(index)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 text-slate-300 transition cursor-pointer"
                          title="העבר למטה"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Duplicate (Not applicable to permanent top Header) */}
                      {onDuplicateSection && sectionData.type !== 'header' && (
                        <button
                          type="button"
                          onClick={() => onDuplicateSection(sectionId)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                          title="שכפל אזור"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete (Header is permanent, user uses visibility toggle to hide/show) */}
                      {onDeleteSection && sectionData.type !== 'header' && (
                        <button
                          type="button"
                          onClick={() => onDeleteSection(sectionId)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                          title="מחק אזור"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Render Section View Component */}
              <ViewComponent
                config={sectionData}
                onSelectTier={onSelectDonationTier}
                onLeadSubmit={onLeadSubmit}
              />

              {/* In-Between Section Inserter in Edit Mode */}
              {isEditing && onAddSection && (
                <div className="relative py-2 flex items-center justify-center group/add">
                  <div className="absolute inset-x-8 h-px bg-slate-800 group-hover/add:bg-indigo-500/50 transition-colors" />
                  <button
                    type="button"
                    onClick={() => {
                      setAddSectionInsertIndex(index + 1);
                      setIsAddSectionModalOpen(true);
                    }}
                    className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-400 text-slate-300 hover:text-white text-xs font-bold transition shadow-lg cursor-pointer"
                    title="הוספת אזור כאן"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף אזור כאן</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom Add Section Button in Edit Mode */}
        {isEditing && onAddSection && (
          <div className="max-w-4xl mx-auto w-full px-4 py-8">
            <button
              type="button"
              onClick={() => {
                setAddSectionInsertIndex(undefined);
                setIsAddSectionModalOpen(true);
              }}
              className="w-full py-8 border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">הוסף אזור חדש לסוף העמוד (Bento, Hero, Pricing, FAQ...)</span>
            </button>
          </div>
        )}
      </main>

      {/* 100% Full-Screen Section Content Editor Modal */}
      {editingSectionId && sections[editingSectionId] && (
        (() => {
          const sec = sections[editingSectionId];
          const reg = SECTION_REGISTRY[sec.type as keyof typeof SECTION_REGISTRY];
          if (!reg || !reg.editorComponent) return null;
          const EditorComponent = reg.editorComponent;

          return (
            <PageBuilderModal
              isOpen={Boolean(editingSectionId)}
              onClose={() => setEditingSectionId(null)}
              title={`עריכת ${reg.name || sec.type}`}
              subtitle="שינויי התוכן והעיצוב מתעדכנים מיידית בעמוד"
              maxWidth="4xl"
            >
              <div className="p-4 sm:p-6 text-right" dir="rtl">
                <EditorComponent
                  config={sec}
                  onChange={(updated) => {
                    if (onUpdateSection) {
                      onUpdateSection(editingSectionId, updated);
                    }
                  }}
                />
              </div>
            </PageBuilderModal>
          );
        })()
      )}

      {/* Add Section Modal */}
      {isAddSectionModalOpen && onAddSection && (
        <AddSectionModal
          isOpen={isAddSectionModalOpen}
          onClose={() => {
            setIsAddSectionModalOpen(false);
            setAddSectionInsertIndex(undefined);
          }}
          onAddSection={(type) => {
            onAddSection(type, addSectionInsertIndex);
            setIsAddSectionModalOpen(false);
            setAddSectionInsertIndex(undefined);
          }}
        />
      )}

      {/* AI Section Designer Modal */}
      {aiDesignerSectionId && sections[aiDesignerSectionId] && (
        <AiSectionDesignerModal
          isOpen={Boolean(aiDesignerSectionId)}
          onClose={() => setAiDesignerSectionId(null)}
          sectionId={aiDesignerSectionId}
          sectionType={sections[aiDesignerSectionId].type}
          currentConfig={sections[aiDesignerSectionId]}
          allSections={sections}
          sectionOrder={sectionOrder}
          pageTitle={globalSettings?.siteTitle || globalSettings?.companyName}
          onApplyDesign={(newConfig) => {
            if (onUpdateSection) {
              onUpdateSection(aiDesignerSectionId, newConfig);
            }
            setAiDesignerSectionId(null);
          }}
        />
      )}

      {/* Floating We Are Here & Share Widget (Always accessible, configurable per page) */}
      <FloatingWeAreHereWidget
        pageConfigSettings={globalSettings}
        isEditing={isEditing}
        onEditWidgetSettings={() => setIsWidgetSettingsModalOpen(true)}
      />

      {/* Floating We Are Here Settings Modal */}
      {isWidgetSettingsModalOpen && onUpdateGlobalSettings && (
        <FloatingWidgetSettingsModal
          isOpen={isWidgetSettingsModalOpen}
          onClose={() => setIsWidgetSettingsModalOpen(false)}
          globalSettings={globalSettings}
          onSave={(updated) => {
            onUpdateGlobalSettings(updated);
          }}
        />
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
                © {new Date().getFullYear()} {globalSettings.companyName || 'כל הזכויות שמורות'}. נבנה באמצעות Kosun Web.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
