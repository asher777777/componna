import React, { useState, useEffect } from 'react';
import { PageBuilderConfig, ViewportMode, BuilderTab, SectionType } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { PageBuilderHeader } from './components/PageBuilderHeader';
import { SectionNavigator } from './components/SectionNavigator';
import { SectionContainer } from './components/SectionContainer';
import { AddSectionModal } from './components/AddSectionModal';
import { PageSettingsDrawer } from './components/PageSettingsDrawer';
import { LivePreviewFrame } from './components/LivePreviewFrame';
import { PublishPageModal } from './components/PublishPageModal';
import { UrlShortenerModal } from './components/UrlShortenerModal';
import { GeoSeoDrawer } from './components/GeoSeoDrawer';
import { AiLivePageBuilderModal } from './components/AiLivePageBuilderModal';
import { PageBuilderButton } from './ui/PageBuilderButton';
import { Plus, Sparkles, Layers, Eye, Edit3, Settings2, Globe, Share2, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

interface PageBuilderEditorProps {
  initialConfig: PageBuilderConfig;
  onSaveConfig?: (config: PageBuilderConfig) => Promise<void> | void;
  onClose?: () => void;
  onGoToPagesList?: () => void;
}

export const PageBuilderEditor: React.FC<PageBuilderEditorProps> = ({
  initialConfig,
  onSaveConfig,
  onClose,
  onGoToPagesList,
}) => {
  const [config, setConfig] = useState<PageBuilderConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<BuilderTab>('edit');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    config.sectionOrder[0] || null
  );

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isShortenerModalOpen, setIsShortenerModalOpen] = useState(false);
  const [isGeoDrawerOpen, setIsGeoDrawerOpen] = useState(false);
  const [isAiBuilderModalOpen, setIsAiBuilderModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
    if (!openSectionId && initialConfig.sectionOrder.length > 0) {
      setOpenSectionId(initialConfig.sectionOrder[0]);
    }
  }, [initialConfig]);

  // Reorder handlers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...config.sectionOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setConfig({ ...config, sectionOrder: newOrder });
  };

  const handleMoveDown = (index: number) => {
    if (index === config.sectionOrder.length - 1) return;
    const newOrder = [...config.sectionOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setConfig({ ...config, sectionOrder: newOrder });
  };

  // Section update handler
  const handleUpdateSectionData = (sectionId: string, updatedData: any) => {
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [sectionId]: updatedData,
      },
    });
  };

  // Toggle Visibility
  const handleToggleVisibility = (sectionId: string) => {
    const current = config.sections[sectionId];
    if (!current) return;
    handleUpdateSectionData(sectionId, {
      ...current,
      visible: current.visible === false,
    });
  };

  // Toggle Mobile Hidden
  const handleToggleMobileHidden = (sectionId: string) => {
    const current = config.sections[sectionId];
    if (!current) return;
    handleUpdateSectionData(sectionId, {
      ...current,
      mobileHidden: !current.mobileHidden,
    });
  };

  // Delete Section
  const handleDeleteSection = (sectionId: string) => {
    if (confirm('האם למחוק אזור זה מהעמוד?')) {
      const newOrder = config.sectionOrder.filter((id: string) => id !== sectionId);
      const newSections = { ...config.sections };
      delete newSections[sectionId];
      setConfig({
        ...config,
        sectionOrder: newOrder,
        sections: newSections,
      });
      if (openSectionId === sectionId) {
        setOpenSectionId(newOrder[0] || null);
      }
    }
  };

  // Duplicate Section
  const handleDuplicateSection = (sectionId: string) => {
    const original = config.sections[sectionId];
    if (!original) return;
    const newId = `${original.type}_${Date.now()}`;
    const duplicated = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      anchorId: `${original.anchorId || original.type}_copy`,
    };
    const originalIndex = config.sectionOrder.indexOf(sectionId);
    const newOrder = [...config.sectionOrder];
    newOrder.splice(originalIndex + 1, 0, newId);

    setConfig({
      ...config,
      sectionOrder: newOrder,
      sections: {
        ...config.sections,
        [newId]: duplicated,
      },
    });
    setOpenSectionId(newId);
  };

  // Add Section from registry
  const handleAddSection = (type: SectionType) => {
    const regDef = SECTION_REGISTRY[type];
    if (!regDef) return;

    const newId = `${type}_${Date.now()}`;
    const newSectionConfig = {
      ...JSON.parse(JSON.stringify(regDef.defaultConfig)),
      id: newId,
      anchorId: `${type}_${config.sectionOrder.length + 1}`,
    };

    setConfig({
      ...config,
      sectionOrder: [...config.sectionOrder, newId],
      sections: {
        ...config.sections,
        [newId]: newSectionConfig,
      },
    });
    setOpenSectionId(newId);
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    if (onSaveConfig) {
      await onSaveConfig(config);
    }
    setIsSaving(false);
  };

  // Toggle publish
  const handleSavePublished = async (updated: PageBuilderConfig) => {
    setConfig(updated);
    if (onSaveConfig) {
      await onSaveConfig(updated);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white select-none">
      {/* Top Navigation Bar */}
      <PageBuilderHeader
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewportMode={viewportMode}
        setViewportMode={setViewportMode}
        onSave={handleSave}
        isSaving={isSaving}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddSection={() => setIsAddModalOpen(true)}
        onOpenAiBuilder={() => setIsAiBuilderModalOpen(true)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onOpenShortener={() => setIsShortenerModalOpen(true)}
        onOpenGeo={() => setIsGeoDrawerOpen(true)}
        onGoToPagesList={onGoToPagesList}
      />

      {/* Main Workspace based on Active Tab */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: Edit Mode */}
        {activeTab === 'edit' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left/Side: Navigator list */}
            <SectionNavigator
              sectionOrder={config.sectionOrder}
              sections={config.sections}
              openSectionId={openSectionId}
              onSelectSection={(id) => setOpenSectionId(id)}
              onAddSectionClick={() => setIsAddModalOpen(true)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onToggleVisibility={handleToggleVisibility}
            />

            {/* Right/Main: Section Form Editors */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-[#09090b]">
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                {config.sectionOrder.map((sectionId, index) => {
                  const sectionData = config.sections[sectionId];
                  if (!sectionData) return null;
                  const regDef = SECTION_REGISTRY[sectionData.type as SectionType];

                  const isOpen = openSectionId === sectionId;

                  return (
                    <SectionContainer
                      key={sectionId}
                      sectionId={sectionId}
                      sectionType={sectionData.type}
                      title={sectionData.title || regDef?.name || sectionId}
                      isOpen={isOpen}
                      onToggleOpen={() => setOpenSectionId(isOpen ? null : sectionId)}
                      visible={sectionData.visible !== false}
                      mobileHidden={sectionData.mobileHidden}
                      onToggleVisibility={() => handleToggleVisibility(sectionId)}
                      onToggleMobileHidden={() => handleToggleMobileHidden(sectionId)}
                      onDuplicate={() => handleDuplicateSection(sectionId)}
                      onDelete={() => handleDeleteSection(sectionId)}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      isFirst={index === 0}
                      isLast={index === config.sectionOrder.length - 1}
                    >
                      {regDef && (
                        <regDef.editorComponent
                          config={sectionData}
                          onChange={(updated) => handleUpdateSectionData(sectionId, updated)}
                        />
                      )}
                    </SectionContainer>
                  );
                })}

                {/* Add Section Big Button */}
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full py-8 border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">הוסף אזור חדש לעמוד (Bento, Hero, Pricing, FAQ...)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Split Mode */}
        {activeTab === 'split' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Quick Editors */}
            <div className="w-full lg:w-[480px] border-l border-slate-800 bg-[#0c0c0e] overflow-y-auto p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">עריכה מהירה</span>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף אזור</span>
                </button>
              </div>

              {config.sectionOrder.map((sectionId, index) => {
                const sectionData = config.sections[sectionId];
                if (!sectionData) return null;
                const regDef = SECTION_REGISTRY[sectionData.type as SectionType];
                const isOpen = openSectionId === sectionId;

                return (
                  <SectionContainer
                    key={sectionId}
                    sectionId={sectionId}
                    sectionType={sectionData.type}
                    title={sectionData.title || regDef?.name || sectionId}
                    isOpen={isOpen}
                    onToggleOpen={() => setOpenSectionId(isOpen ? null : sectionId)}
                    visible={sectionData.visible !== false}
                    mobileHidden={sectionData.mobileHidden}
                    onToggleVisibility={() => handleToggleVisibility(sectionId)}
                    onToggleMobileHidden={() => handleToggleMobileHidden(sectionId)}
                    onDuplicate={() => handleDuplicateSection(sectionId)}
                    onDelete={() => handleDeleteSection(sectionId)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    isFirst={index === 0}
                    isLast={index === config.sectionOrder.length - 1}
                  >
                    {regDef && (
                      <regDef.editorComponent
                        config={sectionData}
                        onChange={(updated) => handleUpdateSectionData(sectionId, updated)}
                      />
                    )}
                  </SectionContainer>
                );
              })}
            </div>

            {/* Right: Live Preview Frame */}
            <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto">
              <LivePreviewFrame config={config} viewportMode={viewportMode} />
            </div>
          </div>
        )}

        {/* TAB 3: Preview Mode */}
        {activeTab === 'preview' && (
          <div className="flex-1 bg-slate-950 p-4 sm:p-8 flex items-center justify-center overflow-auto">
            <LivePreviewFrame config={config} viewportMode={viewportMode} />
          </div>
        )}

        {/* TAB 4: Reorder Layers */}
        {activeTab === 'reorder' && (
          <div className="flex-1 overflow-y-auto p-8 bg-[#09090b]" dir="rtl">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white mb-2">סידור שכבות ואזורי העמוד</h3>
              {config.sectionOrder.map((sectionId, idx) => {
                const sec = config.sections[sectionId];
                const reg = SECTION_REGISTRY[sec?.type as SectionType];
                return (
                  <div
                    key={sectionId}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-right"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {sec?.title || reg?.name || sectionId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs"
                      >
                        העלה ⬆
                      </button>
                      <button
                        type="button"
                        disabled={idx === config.sectionOrder.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs"
                      >
                        הורד ⬇
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={handleAddSection}
      />

      <PageSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        globalSettings={config.globalSettings}
        onUpdateGlobalSettings={(updated) => setConfig({ ...config, globalSettings: updated })}
        seoSettings={config.seoSettings}
        onUpdateSeoSettings={(updated) => setConfig({ ...config, seoSettings: updated })}
        onOpenGeoDrawer={() => setIsGeoDrawerOpen(true)}
      />

      <PublishPageModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        config={config}
        onTogglePublish={handleSavePublished}
        onOpenShortener={() => setIsShortenerModalOpen(true)}
      />

      <UrlShortenerModal
        isOpen={isShortenerModalOpen}
        onClose={() => setIsShortenerModalOpen(false)}
        config={config}
        onSaveShortUrl={(shortUrl, shortSlug) =>
          setConfig({ ...config, shortUrl, shortSlug })
        }
      />

      <GeoSeoDrawer
        isOpen={isGeoDrawerOpen}
        onClose={() => setIsGeoDrawerOpen(false)}
        config={config}
        onSaveConfig={(updated) => setConfig(updated)}
      />

      <AiLivePageBuilderModal
        isOpen={isAiBuilderModalOpen}
        onClose={() => setIsAiBuilderModalOpen(false)}
        onComplete={(generated) => {
          setConfig(generated);
          if (onSaveConfig) {
            onSaveConfig(generated);
          }
        }}
      />
    </div>
  );
};
