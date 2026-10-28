import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Palette, 
  Globe, 
  Plus, 
  Eye, 
  Save, 
  Sliders, 
  LayoutGrid, 
  ChevronRight, 
  CheckCircle2, 
  Smartphone,
  Monitor,
  Tablet,
  RotateCcw
} from 'lucide-react';
import { PageBuilderConfig, SectionType, ViewportMode } from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { LivePreviewFrame } from './LivePreviewFrame';
import { SectionContainer } from './SectionContainer';
import { AddSectionModal } from './AddSectionModal';
import { PageSettingsDrawer } from './PageSettingsDrawer';
import { AiLivePageBuilderModal } from './AiLivePageBuilderModal';
import { KosWebDesignModeToggle } from './KosWebDesignModeToggle';
import { BrandDna } from '../../../core/contracts';

interface KosWebBackofficeDesynProps {
  config: PageBuilderConfig;
  onSaveConfig: (updated: PageBuilderConfig) => Promise<void> | void;
  onClose?: () => void;
  onGoToPagesList?: () => void;
  onConvertToVideo?: () => void;
  brandDna?: BrandDna | null;
  tenantId?: string;
  onToggleDesignMode: () => void;
}

export const KosWebBackofficeDesyn: React.FC<KosWebBackofficeDesynProps> = ({
  config,
  onSaveConfig,
  onClose,
  onGoToPagesList,
  onConvertToVideo,
  brandDna,
  tenantId,
  onToggleDesignMode,
}) => {
  const [currentConfig, setCurrentConfig] = useState<PageBuilderConfig>(config);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    currentConfig.sectionOrder[0] || null
  );

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiBuilderModalOpen, setIsAiBuilderModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleSave = async (cfgToSave = currentConfig) => {
    setIsSaving(true);
    try {
      await onSaveConfig(cfgToSave);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSection = (sectionId: string, updatedData: any) => {
    const updatedSections = {
      ...currentConfig.sections,
      [sectionId]: updatedData,
    };
    const nextConfig = {
      ...currentConfig,
      sections: updatedSections,
    };
    setCurrentConfig(nextConfig);
  };

  const handleRemoveSection = (sectionId: string) => {
    const nextOrder = currentConfig.sectionOrder.filter((id) => id !== sectionId);
    const nextSections = { ...currentConfig.sections };
    delete nextSections[sectionId];
    const nextConfig = {
      ...currentConfig,
      sectionOrder: nextOrder,
      sections: nextSections,
    };
    setCurrentConfig(nextConfig);
    if (openSectionId === sectionId) {
      setOpenSectionId(nextOrder[0] || null);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...currentConfig.sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setCurrentConfig({
      ...currentConfig,
      sectionOrder: newOrder,
    });
  };

  return (
    <div 
      className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200"
      dir="rtl"
    >
      {/* KOSDESYN Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0c1017]/95 backdrop-blur-md border-b border-white/5 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onGoToPagesList && (
            <button
              type="button"
              onClick={onGoToPagesList}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/5"
            >
              <ChevronRight className="w-4 h-4" />
              <span>כל הדפים</span>
            </button>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <h1 className="text-sm font-bold text-white tracking-wide">
                {currentConfig.pageTitle || 'דף ללא שם'}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">
                /{currentConfig.slug || 'home'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              KOSDESYN Babushka Architecture • {currentConfig.sectionOrder.length} מקטעים פעילים
            </span>
          </div>
        </div>

        {/* Action Center & Design Mode Switcher */}
        <div className="flex items-center gap-3">
          {/* Toggle between KOSDESYN & Classic */}
          <KosWebDesignModeToggle mode="kosdesyn" onToggle={onToggleDesignMode} />

          {/* View Mode Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>עריכת מקטעים</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>תצוגה מקדימה</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? (
              <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
            ) : saveSuccessNotice ? (
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
            ) : (
              <Save className="w-4 h-4 text-slate-950" />
            )}
            <span>{isSaving ? 'שומר...' : saveSuccessNotice ? 'נשמר בהצלחה!' : 'שמור שינויים'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'editor' ? (
          <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
            {/* Right Pane: Bento Section Cards & Navigation */}
            <aside className="col-span-12 lg:col-span-4 xl:col-span-3 bg-[#0a0d14] border-l border-white/5 p-4 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <span>שכבות העמוד (Bento Stack)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1 transition-colors border border-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף מקטע</span>
                </button>
              </div>

              {/* Quick AI & Setup Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiBuilderModalOpen(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 hover:border-indigo-500/40 text-right transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                    <span>KosAi Studio</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    יצירה ודיוק מקטעים בבינה מלאכותית
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/20 hover:border-amber-500/40 text-right transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>הגדרות וסגנון</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    צבעים גלובליים, טיפוגרפיה ו-SEO
                  </p>
                </button>
              </div>

              {/* Sections List */}
              <div className="space-y-2 pt-2">
                {currentConfig.sectionOrder.map((sectionId, idx) => {
                  const sectionData = currentConfig.sections[sectionId];
                  const type = sectionData?.type || sectionId;
                  const reg = SECTION_REGISTRY[type as SectionType];
                  const isOpen = openSectionId === sectionId;

                  return (
                    <div
                      key={sectionId}
                      className={`rounded-2xl p-3 border transition-all cursor-pointer ${
                        isOpen
                          ? 'bg-amber-500/[0.07] border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-[#0f141d] hover:bg-[#141b27] border-white/5'
                      }`}
                      onClick={() => setOpenSectionId(sectionId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[11px] font-mono text-slate-400">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">
                              {reg?.name || sectionId}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {reg?.description || 'מקטע תוכן עצמאי'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, 'up')}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-300 disabled:opacity-20"
                            title="הזז למעלה"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === currentConfig.sectionOrder.length - 1}
                            onClick={() => handleMoveSection(idx, 'down')}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-300 disabled:opacity-20"
                            title="הזז למטה"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Left Pane: Focused Babushka Card Editor */}
            <main className="col-span-12 lg:col-span-8 xl:col-span-9 bg-[#07090e] p-6 overflow-y-auto">
              {openSectionId && currentConfig.sections[openSectionId] ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between bg-[#0e131c] p-4 rounded-2xl border border-white/5">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        עריכת מקטע נוכחי (KOSDESYN Focused Card)
                      </span>
                      <h2 className="text-lg font-bold text-white">
                        {SECTION_REGISTRY[currentConfig.sections[openSectionId]?.type as SectionType]?.name || openSectionId}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(openSectionId)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition-colors"
                      >
                        הסר מקטע זה
                      </button>
                    </div>
                  </div>

                  {/* Section Editor Container */}
                  <div className="bg-[#0c1017] p-6 rounded-3xl border border-white/5 shadow-2xl">
                    <SectionContainer
                      key={openSectionId}
                      sectionId={openSectionId}
                      sectionType={currentConfig.sections[openSectionId]?.type}
                      title={currentConfig.sections[openSectionId]?.adminTitle || SECTION_REGISTRY[currentConfig.sections[openSectionId]?.type as SectionType]?.name || openSectionId}
                      isOpen={true}
                      onToggleOpen={() => {}}
                      sectionData={currentConfig.sections[openSectionId]}
                      visible={currentConfig.sections[openSectionId]?.visible !== false}
                      mobileHidden={currentConfig.sections[openSectionId]?.mobileHidden}
                      onToggleVisibility={() => {
                        const cur = currentConfig.sections[openSectionId];
                        handleUpdateSection(openSectionId, { ...cur, visible: cur.visible === false ? true : false });
                      }}
                      onToggleMobileHidden={() => {
                        const cur = currentConfig.sections[openSectionId];
                        handleUpdateSection(openSectionId, { ...cur, mobileHidden: !cur.mobileHidden });
                      }}
                      onUpdateSection={(id: string, data: any) => handleUpdateSection(id, data)}
                      onDuplicate={() => {}}
                      onDelete={() => handleRemoveSection(openSectionId)}
                      onMoveUp={() => {}}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <Layers className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-sm font-medium">בחר מקטע מהרשימה כדי לערוך את תוכנו ועיצובו</p>
                </div>
              )}
            </main>
          </div>
        ) : (
          /* Live Preview Mode */
          <div className="flex-1 flex flex-col bg-[#05070a]">
            {/* Viewport Control Bar */}
            <div className="bg-[#0b0f16] border-b border-white/5 px-6 py-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewportMode === 'desktop' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>דסקטופ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewportMode === 'tablet' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span>טאבלט</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewportMode === 'mobile' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>נייד</span>
              </button>
            </div>

            <div className="flex-1 p-6 flex items-center justify-center overflow-auto">
              <LivePreviewFrame config={currentConfig} viewportMode={viewportMode} />
            </div>
          </div>
        )}
      </div>

      {/* Modals & Sub-drawers */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={(type) => {
          const newId = `${type}_${Date.now()}`;
          const reg = SECTION_REGISTRY[type];
          const newSectionData = reg ? reg.defaultConfig : { type };
          const nextConfig = {
            ...currentConfig,
            sectionOrder: [...currentConfig.sectionOrder, newId],
            sections: {
              ...currentConfig.sections,
              [newId]: newSectionData,
            },
          };
          setCurrentConfig(nextConfig);
          setOpenSectionId(newId);
          setIsAddModalOpen(false);
        }}
      />

      <PageSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        globalSettings={currentConfig.globalSettings}
        onUpdateGlobalSettings={(updated: any) => {
          setCurrentConfig((prev) => ({
            ...prev,
            globalSettings: updated,
          }));
        }}
        seoSettings={currentConfig.seoSettings}
        onUpdateSeoSettings={(updated: any) => {
          setCurrentConfig((prev) => ({
            ...prev,
            seoSettings: updated,
          }));
        }}
      />

      <AiLivePageBuilderModal
        isOpen={isAiBuilderModalOpen}
        onClose={() => setIsAiBuilderModalOpen(false)}
        onComplete={(newConfig) => {
          setCurrentConfig(newConfig);
          setIsAiBuilderModalOpen(false);
          handleSave(newConfig);
        }}
      />
    </div>
  );
};
