import React, { useState } from 'react';
import { PageBuilderConfig, ViewportMode, BuilderTab, SectionType } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';
import { PageBuilderHeader } from './components/PageBuilderHeader';
import { SectionNavigator } from './components/SectionNavigator';
import { SectionContainer } from './components/SectionContainer';
import { AddSectionModal } from './components/AddSectionModal';
import { PageSettingsDrawer } from './components/PageSettingsDrawer';
import { LivePreviewFrame } from './components/LivePreviewFrame';
import { PageBuilderButton } from './ui/PageBuilderButton';
import { Plus, Sparkles, Layers, Eye, Edit3, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

interface PageBuilderEditorProps {
  initialConfig: PageBuilderConfig;
  onSaveConfig?: (config: PageBuilderConfig) => Promise<void> | void;
  onClose?: () => void;
}

export const PageBuilderEditor: React.FC<PageBuilderEditorProps> = ({
  initialConfig,
  onSaveConfig,
  onClose,
}) => {
  const [config, setConfig] = useState<PageBuilderConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<BuilderTab>('edit');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    config.sectionOrder[0] || null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    try {
      if (onSaveConfig) {
        await onSaveConfig(config);
      } else {
        localStorage.setItem(`comona_page_${config.pageId}`, JSON.stringify(config));
        await new Promise((resolve) => setTimeout(resolve, 500));
        alert('העמוד נשמר בהצלחה!');
      }
    } catch (e) {
      console.error(e);
      alert('אירעה שגיאה בשמירת העמוד');
    } finally {
      setIsSaving(false);
    }
  };

  // JSON Export / Import
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${config.slug || 'page'}-config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans select-none" dir="rtl">
      {/* Top Main Navigation Header */}
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
        onExportJson={handleExportJson}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* TAB 1: Visual Sections Editor */}
        {activeTab === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar: Layers / Sections Navigator */}
            <div className="lg:col-span-4 sticky top-20">
              <SectionNavigator
                sectionOrder={config.sectionOrder}
                sections={config.sections}
                activeSectionId={openSectionId}
                onSelectSection={(id: string) => {
                  setOpenSectionId(id);
                  const el = document.getElementById(`section-container-${id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onToggleVisibility={handleToggleVisibility}
                onToggleMobileHidden={handleToggleMobileHidden}
                onDeleteSection={handleDeleteSection}
                onDuplicateSection={handleDuplicateSection}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </div>

            {/* Canvas: Section Accordion Editors */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              {config.sectionOrder.map((sectionId: string, index: number) => {
                const sectionData = config.sections[sectionId];
                if (!sectionData) return null;

                const regDef = SECTION_REGISTRY[sectionData.type as keyof typeof SECTION_REGISTRY];
                if (!regDef) return null;

                const EditorComponent = regDef.editorComponent;
                const ViewComponent = regDef.viewComponent;
                const isOpen = openSectionId === sectionId;

                return (
                  <SectionContainer
                    key={sectionId}
                    sectionId={sectionId}
                    sectionData={sectionData}
                    index={index}
                    totalCount={config.sectionOrder.length}
                    isOpen={isOpen}
                    onToggleOpen={() => setOpenSectionId(isOpen ? null : sectionId)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onToggleVisibility={() => handleToggleVisibility(sectionId)}
                    onToggleMobileHidden={() => handleToggleMobileHidden(sectionId)}
                    onDelete={() => handleDeleteSection(sectionId)}
                    onDuplicate={() => handleDuplicateSection(sectionId)}
                    contentEditorNode={
                      <EditorComponent
                        config={sectionData}
                        onChange={(updated: any) => handleUpdateSectionData(sectionId, updated)}
                      />
                    }
                    previewNode={
                      <div className="pointer-events-none opacity-90 scale-95 origin-top">
                        <ViewComponent config={sectionData} />
                      </div>
                    }
                  />
                );
              })}

              {/* Add section CTA card at the bottom */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-8 border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-3xl bg-slate-900/30 hover:bg-slate-900/60 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">הוסף אזור חדש לעמוד</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Split Screen Mode */}
        {activeTab === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Active Section Editor */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="text-sm font-bold text-white">עריכת אזור פעיל</span>
                  <select
                    value={openSectionId || ''}
                    onChange={(e) => setOpenSectionId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  >
                    {config.sectionOrder.map((secId: string) => {
                      const sec = config.sections[secId];
                      const reg = SECTION_REGISTRY[sec?.type as keyof typeof SECTION_REGISTRY];
                      return (
                        <option key={secId} value={secId}>
                          {reg?.name || secId} (#{sec?.anchorId || secId})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {openSectionId && config.sections[openSectionId] && (
                  <div>
                    {(() => {
                      const sec = config.sections[openSectionId];
                      const reg = SECTION_REGISTRY[sec.type as keyof typeof SECTION_REGISTRY];
                      if (!reg) return null;
                      const Editor = reg.editorComponent;
                      return (
                        <Editor
                          config={sec}
                          onChange={(updated: any) => handleUpdateSectionData(openSectionId, updated)}
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Frame Preview */}
            <div className="lg:col-span-7 sticky top-20">
              <div className="rounded-3xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
                <LivePreviewFrame
                  config={config}
                  viewportMode={viewportMode}
                  onNavigateSection={(id: string) => setOpenSectionId(id)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Fullscreen Live Preview */}
        {activeTab === 'preview' && (
          <div className="w-full">
            <LivePreviewFrame
              config={config}
              viewportMode={viewportMode}
              onNavigateSection={(id: string) => setOpenSectionId(id)}
            />
          </div>
        )}

        {/* TAB 4: Layers / Reorder Only Mode */}
        {activeTab === 'reorder' && (
          <div className="max-w-3xl mx-auto w-full">
            <SectionNavigator
              sectionOrder={config.sectionOrder}
              sections={config.sections}
              activeSectionId={openSectionId}
              onSelectSection={(id: string) => {
                setOpenSectionId(id);
                setActiveTab('edit');
              }}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onToggleVisibility={handleToggleVisibility}
              onToggleMobileHidden={handleToggleMobileHidden}
              onDeleteSection={handleDeleteSection}
              onDuplicateSection={handleDuplicateSection}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={handleAddSection}
      />

      {/* Page Settings & SEO Drawer */}
      <PageSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        globalSettings={config.globalSettings}
        onUpdateGlobalSettings={(updated) => setConfig({ ...config, globalSettings: updated })}
        seoSettings={config.seoSettings}
        onUpdateSeoSettings={(updated) => setConfig({ ...config, seoSettings: updated })}
      />
    </div>
  );
};
