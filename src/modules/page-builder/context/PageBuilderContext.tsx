import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  PageBuilderConfig,
  SectionType,
  ViewportMode,
  BuilderTab,
} from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, BrandDna } from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';
import { PAGE_BUILDER_MODULE_CONFIG } from '../config';

export interface PageBuilderContextValue {
  // Page Configuration
  currentPageConfig: PageBuilderConfig | null;
  setCurrentPageConfig: (config: PageBuilderConfig | null) => void;
  updatePageConfig: (updater: PageBuilderConfig | ((prev: PageBuilderConfig) => PageBuilderConfig)) => void;

  // History (Undo / Redo)
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Section Management
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  addSection: (type: SectionType, targetIndex?: number) => string;
  removeSection: (sectionId: string) => void;
  reorderSections: (newOrder: string[]) => void;
  duplicateSection: (sectionId: string) => string;
  updateSectionData: (sectionId: string, updatedData: any) => void;
  toggleSectionVisibility: (sectionId: string) => void;

  // Viewport & Navigation
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  activeTab: BuilderTab;
  setActiveTab: (tab: BuilderTab) => void;

  // Persistence & Publishing
  isSaving: boolean;
  isSaved: boolean;
  lastSavedAt: Date | null;
  savePage: () => Promise<void>;
  publishPage: (isPublished?: boolean) => Promise<void>;

  // Brand DNA
  brandDna: BrandDna | null;
  applyBrandDnaStyles: () => void;
}

const PageBuilderContext = createContext<PageBuilderContextValue | null>(null);

const MAX_HISTORY_LENGTH = 25;

export const PageBuilderProvider: React.FC<{
  initialConfig?: PageBuilderConfig | null;
  children: React.ReactNode;
}> = ({ initialConfig = null, children }) => {
  const { getCapability } = useHostCapabilities();
  const brandDnaContract = getCapability<BrandDnaContract>('brand-dna');
  const [brandDna, setBrandDna] = useState<BrandDna | null>(() => brandDnaContract?.getBrandDna() || null);

  // Active Page State
  const [currentPageConfig, setCurrentPageConfigState] = useState<PageBuilderConfig | null>(initialConfig);

  // Viewport & Navigation
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [activeTab, setActiveTab] = useState<BuilderTab>('edit');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialConfig?.sectionOrder?.[0] || null
  );

  // Persistence State
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // History State
  const historyRef = useRef<PageBuilderConfig[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Subscribe to live brand changes
  useEffect(() => {
    const unsub = eventBus.subscribe('brand:updated', (data) => {
      if (data.brandDna) {
        setBrandDna(data.brandDna);
      }
    });
    return () => unsub();
  }, []);

  // Update history index and flags
  const pushHistory = useCallback((config: PageBuilderConfig) => {
    const clone = JSON.parse(JSON.stringify(config));
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(clone);
    if (nextHistory.length > MAX_HISTORY_LENGTH) {
      nextHistory.shift();
    }
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const setCurrentPageConfig = useCallback((config: PageBuilderConfig | null) => {
    setCurrentPageConfigState(config);
    if (config) {
      historyRef.current = [JSON.parse(JSON.stringify(config))];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setSelectedSectionId(config.sectionOrder?.[0] || null);
    }
  }, []);

  const updatePageConfig = useCallback(
    (updater: PageBuilderConfig | ((prev: PageBuilderConfig) => PageBuilderConfig)) => {
      setCurrentPageConfigState((prev) => {
        if (!prev) return prev;
        const next = typeof updater === 'function' ? updater(prev) : updater;
        pushHistory(next);
        setIsSaved(false);
        return next;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const targetConfig = historyRef.current[historyIndexRef.current];
      setCurrentPageConfigState(JSON.parse(JSON.stringify(targetConfig)));
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const targetConfig = historyRef.current[historyIndexRef.current];
      setCurrentPageConfigState(JSON.parse(JSON.stringify(targetConfig)));
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  // Section Management Methods
  const addSection = useCallback(
    (type: SectionType, targetIndex?: number): string => {
      let createdId = '';
      updatePageConfig((prev) => {
        const id = `${type}_${Date.now()}`;
        createdId = id;
        const definition = SECTION_REGISTRY[type];
        const initialData = definition
          ? JSON.parse(JSON.stringify(definition.defaultConfig))
          : { id, type, visible: true };

        const newSections = {
          ...prev.sections,
          [id]: { ...initialData, id, type, visible: true },
        };

        const newOrder = [...prev.sectionOrder];
        if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= newOrder.length) {
          newOrder.splice(targetIndex, 0, id);
        } else {
          newOrder.push(id);
        }

        return {
          ...prev,
          sectionOrder: newOrder,
          sections: newSections,
        };
      });
      setSelectedSectionId(createdId);
      return createdId;
    },
    [updatePageConfig]
  );

  const removeSection = useCallback(
    (sectionId: string) => {
      updatePageConfig((prev) => {
        const newOrder = prev.sectionOrder.filter((id) => id !== sectionId);
        const newSections = { ...prev.sections };
        delete newSections[sectionId];
        return {
          ...prev,
          sectionOrder: newOrder,
          sections: newSections,
        };
      });
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
    },
    [updatePageConfig, selectedSectionId]
  );

  const reorderSections = useCallback(
    (newOrder: string[]) => {
      updatePageConfig((prev) => ({
        ...prev,
        sectionOrder: newOrder,
      }));
    },
    [updatePageConfig]
  );

  const duplicateSection = useCallback(
    (sectionId: string): string => {
      let newId = '';
      updatePageConfig((prev) => {
        const sourceData = prev.sections[sectionId];
        if (!sourceData) return prev;
        const type = sourceData.type || 'hero';
        newId = `${type}_${Date.now()}`;
        const clonedData = {
          ...JSON.parse(JSON.stringify(sourceData)),
          id: newId,
        };

        const idx = prev.sectionOrder.indexOf(sectionId);
        const newOrder = [...prev.sectionOrder];
        if (idx >= 0) {
          newOrder.splice(idx + 1, 0, newId);
        } else {
          newOrder.push(newId);
        }

        return {
          ...prev,
          sectionOrder: newOrder,
          sections: {
            ...prev.sections,
            [newId]: clonedData,
          },
        };
      });
      setSelectedSectionId(newId);
      return newId;
    },
    [updatePageConfig]
  );

  const updateSectionData = useCallback(
    (sectionId: string, updatedData: any) => {
      updatePageConfig((prev) => {
        if (!prev.sections[sectionId]) return prev;
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionId]: {
              ...prev.sections[sectionId],
              ...updatedData,
            },
          },
        };
      });
    },
    [updatePageConfig]
  );

  const toggleSectionVisibility = useCallback(
    (sectionId: string) => {
      updatePageConfig((prev) => {
        const current = prev.sections[sectionId];
        if (!current) return prev;
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionId]: {
              ...current,
              visible: current.visible === false ? true : false,
            },
          },
        };
      });
    },
    [updatePageConfig]
  );

  // Brand DNA token application
  const applyBrandDnaStyles = useCallback(() => {
    if (!brandDna) return;
    updatePageConfig((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        primaryColor: brandDna.designTokens?.primaryColor || prev.globalSettings.primaryColor,
        secondaryColor: brandDna.designTokens?.secondaryColor || prev.globalSettings.secondaryColor,
        backgroundColor: brandDna.designTokens?.backgroundColor || prev.globalSettings.backgroundColor,
        textColor: brandDna.designTokens?.textColor || prev.globalSettings.textColor,
        fontFamily: brandDna.designTokens?.fontFamily || prev.globalSettings.fontFamily,
        borderRadius: brandDna.designTokens?.borderRadius || prev.globalSettings.borderRadius,
        buttonStyle: brandDna.designTokens?.buttonStyle || prev.globalSettings.buttonStyle,
        siteLogoUrl: brandDna.identity?.logoUrl || prev.globalSettings.siteLogoUrl,
        brandDnaSynced: true,
      },
    }));
  }, [brandDna, updatePageConfig]);

  // Saving & Publishing
  const savePage = useCallback(async () => {
    if (!currentPageConfig) return;
    setIsSaving(true);
    try {
      await pageBuilderFirestore.savePage(currentPageConfig);
      setIsSaved(true);
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('[PageBuilderContext] Error saving page:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentPageConfig]);

  const publishPage = useCallback(
    async (isPublished: boolean = true) => {
      if (!currentPageConfig) return;
      setIsSaving(true);
      try {
        const updated = {
          ...currentPageConfig,
          published: isPublished,
          publishedAt: isPublished ? new Date().toISOString() : undefined,
        };
        await pageBuilderFirestore.savePage(updated);
        setCurrentPageConfigState(updated);
        setIsSaved(true);
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('[PageBuilderContext] Error publishing page:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [currentPageConfig]
  );

  const value: PageBuilderContextValue = {
    currentPageConfig,
    setCurrentPageConfig,
    updatePageConfig,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedSectionId,
    setSelectedSectionId,
    addSection,
    removeSection,
    reorderSections,
    duplicateSection,
    updateSectionData,
    toggleSectionVisibility,
    viewportMode,
    setViewportMode,
    activeTab,
    setActiveTab,
    isSaving,
    isSaved,
    lastSavedAt,
    savePage,
    publishPage,
    brandDna,
    applyBrandDnaStyles,
  };

  return <PageBuilderContext.Provider value={value}>{children}</PageBuilderContext.Provider>;
};

export const usePageBuilderContext = (): PageBuilderContextValue => {
  const ctx = useContext(PageBuilderContext);
  if (!ctx) {
    throw new Error('usePageBuilderContext must be used within a PageBuilderProvider');
  }
  return ctx;
};

export default PageBuilderContext;
