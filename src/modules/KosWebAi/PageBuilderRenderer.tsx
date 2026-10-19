import React, { useState, useEffect } from 'react';
import { PageBuilderConfig } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { 
  MessageCircle, Phone, ArrowLeft, Heart, ShieldCheck, MapPin, LogIn,
  Edit3, ArrowUp, ArrowDown, Eye, EyeOff, Trash2, Copy, Sparkles, Plus, Settings, MoreVertical
} from 'lucide-react';
import { clsx } from 'clsx';
import { useBrandDna } from '../KosBranding/hooks/useBrandDna';
import { AuthModal } from '../../components/Auth/AuthModal';
import { AddSectionModal } from './components/AddSectionModal';
import { AiSectionDesignerModal } from './components/AiSectionDesignerModal';
import { PageBuilderModal } from './ui/PageBuilderModal';
import { SectionType } from './types/pageBuilder.types';
import { FloatingWeAreHereWidget } from './components/FloatingWeAreHereWidget';
import { FloatingWidgetSettingsModal } from './components/FloatingWidgetSettingsModal';
import { Check } from 'lucide-react';
import { SectionResolutionVisibilityMenu } from './components/SectionResolutionVisibilityMenu';
import { getResolutionVisibilityClasses, getResolutionBadgeInfo } from './utils/resolutionVisibility';
import { CookieConsentBanner } from './components/CookieConsentBanner';

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
  const [moreMenuSectionId, setMoreMenuSectionId] = useState<string | null>(null);
  const [, setThemeVersion] = useState(0);

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeVersion((v) => v + 1);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  // Fallback cascade: page siteLogoUrl -> Brand DNA identity.logoUrl
  const effectiveLogoUrl = !logoLoadFailed ? (globalSettings.siteLogoUrl || brandLogoUrl || '') : '';

  // Recognizes common dark palette defaults so light mode can render freely
  const defaultDarkBgList = [
    '#0a0a0c', '#090a0f', '#09090b', '#041017', '#0c0714', '#0f0728', 
    '#07090e', '#08080a', '#060608', '#000000', '#050505', '#111827', '#0f172a',
    '#140c12', '#080c14', '#0c0716', '#05070a', '#04120e'
  ];
  const isCurrentlyDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true;
  const isDefaultDarkBg = !globalSettings.backgroundColor || defaultDarkBgList.includes(globalSettings.backgroundColor.toLowerCase());
  // In light (day) mode, never apply a dark custom background color to prevent contrast and theme inversion bugs
  const customBgColor = (!isDefaultDarkBg && isCurrentlyDark) ? globalSettings.backgroundColor : undefined;

  const customStyle: React.CSSProperties = {
    ['--primary' as any]: globalSettings.primaryColor || '#6366f1',
    ['--secondary' as any]: globalSettings.secondaryColor || '#0ea5e9',
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
        'flex flex-col min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors duration-300',
        globalSettings.theme ? `theme-${globalSettings.theme}` : 'theme-modern'
      )}
      style={{
        ...customStyle,
        backgroundColor: customBgColor,
      }}
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
                getResolutionVisibilityClasses(sectionData, isEditing),
                isEditing && 'border-y border-dashed border-slate-700/60 hover:border-indigo-500/80 my-1 py-1',
                isHidden && 'opacity-60 bg-slate-950/40'
              )}
            >
              {/* On-Page Live Edit Floating Toolbar */}
              {isEditing && (
                <div className={clsx(
                  "w-full max-w-7xl mx-auto px-2 sm:px-4 mb-2 select-none",
                  sectionData.type === 'header' ? 'relative z-50 pt-2' : 'sticky top-2 sm:top-4 z-40'
                )}>
                  <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-right animate-in fade-in duration-150">
                    {/* Left: Section Type & Title (Compact on mobile) */}
                    <div className="flex items-center gap-1.5 min-w-0 pr-0.5 max-w-[110px] xs:max-w-[150px] sm:max-w-xs">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 truncate shrink-0">
                        {regDef.name || sectionData.type}
                      </span>
                      {sectionData.adminTitle && (
                        <span className="text-xs text-slate-300 truncate font-bold hidden sm:inline">
                          {sectionData.adminTitle}
                        </span>
                      )}
                      {isHidden && (
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 font-bold">
                          מוסתר
                        </span>
                      )}
                      {(() => {
                        const resBadge = getResolutionBadgeInfo(sectionData);
                        if (!resBadge.isRestricted) return null;
                        return (
                          <span className={clsx("text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md border font-bold shrink-0 hidden xs:inline", resBadge.colorClass)}>
                            {resBadge.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit Content */}
                      <button
                        type="button"
                        onClick={() => setEditingSectionId(sectionId)}
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        title="עריכת תוכן והגדרות אזור זה"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ערוך אזור</span>
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
                            "flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer",
                            savedNotificationSectionId === sectionId
                              ? "bg-emerald-600 text-white border border-emerald-400"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          )}
                          title="שמירת שינויי אזור זה"
                        >
                          <Check className={clsx("w-3.5 h-3.5", savedNotificationSectionId === sectionId ? "text-white" : "text-emerald-400")} />
                          <span className="hidden sm:inline">{savedNotificationSectionId === sectionId ? 'נשמר בהצלחה!' : 'שמור אזור'}</span>
                        </button>
                      )}

                      {/* Screen Resolution Visibility (גילוי והצגה לפי רזולוציית מסך) */}
                      {onUpdateSection && (
                        <SectionResolutionVisibilityMenu
                          sectionId={sectionId}
                          sectionData={sectionData}
                          onUpdateSection={onUpdateSection}
                        />
                      )}

                      {/* Desktop Quick Actions (Visible on md+ screens) */}
                      <div className="hidden md:flex items-center gap-1">
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

                      {/* Mobile More Actions Menu (...) Button & Popover (Hidden on md+) */}
                      <div className="relative md:hidden">
                        <button
                          type="button"
                          onClick={() => setMoreMenuSectionId(moreMenuSectionId === sectionId ? null : sectionId)}
                          className={clsx(
                            "p-1.5 rounded-xl border transition cursor-pointer",
                            moreMenuSectionId === sectionId
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
                          )}
                          title="פעולות נוספות"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Mobile Popover Menu */}
                        {moreMenuSectionId === sectionId && (
                          <>
                            {/* Backdrop to close */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMoreMenuSectionId(null)}
                            />
                            <div 
                              className="absolute left-0 top-full mt-2 z-50 w-48 p-1.5 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-slate-700 shadow-2xl text-right animate-in fade-in zoom-in-95 space-y-1"
                              dir="rtl"
                            >
                              {/* AI Re-design in mobile menu */}
                              <button
                                type="button"
                                onClick={() => {
                                  setMoreMenuSectionId(null);
                                  setAiDesignerSectionId(sectionId);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-600/30 transition text-right"
                              >
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span>עיצוב מחדש ב-AI</span>
                              </button>

                              {/* Visibility in mobile menu */}
                              {onToggleSectionVisibility && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMoreMenuSectionId(null);
                                    onToggleSectionVisibility(sectionId);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition text-right"
                                >
                                  {!isHidden ? (
                                    <>
                                      <EyeOff className="w-4 h-4 text-amber-400" />
                                      <span>הסתרת אזור זה</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 text-emerald-400" />
                                      <span>הצגת אזור זה</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* Move Up in mobile menu */}
                              {onMoveSectionUp && sectionData.type !== 'header' && (
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => {
                                    setMoreMenuSectionId(null);
                                    onMoveSectionUp(index);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition text-right"
                                >
                                  <ArrowUp className="w-4 h-4 text-slate-400" />
                                  <span>העבר למעלה</span>
                                </button>
                              )}

                              {/* Move Down in mobile menu */}
                              {onMoveSectionDown && sectionData.type !== 'header' && (
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => {
                                    setMoreMenuSectionId(null);
                                    onMoveSectionDown(index);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition text-right"
                                >
                                  <ArrowDown className="w-4 h-4 text-slate-400" />
                                  <span>העבר למטה</span>
                                </button>
                              )}

                              {/* Duplicate in mobile menu */}
                              {onDuplicateSection && sectionData.type !== 'header' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMoreMenuSectionId(null);
                                    onDuplicateSection(sectionId);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition text-right"
                                >
                                  <Copy className="w-4 h-4 text-slate-400" />
                                  <span>שכפל אזור</span>
                                </button>
                              )}

                              {/* Delete in mobile menu */}
                              {onDeleteSection && sectionData.type !== 'header' && (
                                <>
                                  <div className="h-px bg-slate-800 my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMoreMenuSectionId(null);
                                      onDeleteSection(sectionId);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition text-right"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-400" />
                                    <span>מחיקת אזור</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
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

      {/* Section Content Editor Modal (Contact360Modal / PageSettingsDrawer style for Hero & RichContent, PageBuilderModal for others) */}
      {editingSectionId && sections[editingSectionId] && (
        (() => {
          const sec = sections[editingSectionId];
          const reg = SECTION_REGISTRY[sec.type as keyof typeof SECTION_REGISTRY];
          if (!reg || !reg.editorComponent) return null;
          const EditorComponent = reg.editorComponent;

          if (sec.type === 'hero' || sec.type === 'richContent' || sec.type === 'faq' || sec.type === 'contact' || sec.type === 'imageListing' || sec.type === 'videoGallery' || sec.type === 'timer' || sec.type === 'livePosts' || sec.type === 'kosvidio' || sec.type === 'mainContent' || sec.type === 'videoEngagement' || sec.type === 'kosvidioGallery') {
            return (
              <div
                className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300 font-sans"
                style={{ fontFamily: "'Heebo', sans-serif" }}
                dir="rtl"
                onClick={() => setEditingSectionId(null)}
              >
                <div
                  className="w-full max-w-[500px] max-h-[92vh] overflow-y-auto no-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EditorComponent
                    config={sec}
                    onChange={(updated) => {
                      if (onUpdateSection) {
                        onUpdateSection(editingSectionId, updated);
                      }
                    }}
                    onClose={() => setEditingSectionId(null)}
                  />
                </div>
              </div>
            );
          }

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
        <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#060608] py-14 px-6 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-right">
              <span className="font-black text-slate-900 dark:text-white text-lg block">
                {globalSettings.companyName || globalSettings.siteTitle || 'אתר הקהילה'}
              </span>
              {globalSettings.slogan && <p className="text-slate-600 dark:text-slate-400 mt-1">{globalSettings.slogan}</p>}
              {globalSettings.address && (
                <p className="text-slate-500 text-[11px] mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{globalSettings.address}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>מאובטח ומוגן בתקן SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                >
                  תנאי שימוש
                </a>
                <span>•</span>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                >
                  מדיניות פרטיות
                </a>
              </div>
              <p className="text-slate-500 text-[11px]">
                © {new Date().getFullYear()} {globalSettings.companyName || 'כל הזכויות שמורות'}. נבנה באמצעות KWB.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Guest Cookie Consent Modal / Banner */}
      <CookieConsentBanner
        settings={globalSettings?.cookieConsent}
        brandDna={brandContext?.brandDna}
        previewMode={false}
      />
    </div>
  );
};
