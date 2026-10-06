import React, { createContext, useContext, useState, useEffect } from 'react';
import { ControlCenterLayoutType, ControlCenterModuleItem, LiveSystemMetrics } from '../types';
import { MODULE_CATALOG } from '../config';
import { useLiveModuleStats } from '../hooks/useLiveModuleStats';

interface ControlCenterContextValue {
  layout: ControlCenterLayoutType;
  setLayout: (layout: ControlCenterLayoutType) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredModules: ControlCenterModuleItem[];
  selectedModule: ControlCenterModuleItem | null;
  setSelectedModule: (mod: ControlCenterModuleItem | null) => void;
  quickLeadModalOpen: boolean;
  setQuickLeadModalOpen: (open: boolean) => void;
  metrics: LiveSystemMetrics;
  moduleDocCounts: Record<string, number>;
  refreshStats: () => Promise<void>;
  isConnected: boolean;
  apiKeys: Record<string, any>;
  mobileDevice: 'iphone' | 'android' | 'fluid';
  setMobileDevice: (device: 'iphone' | 'android' | 'fluid') => void;
}

const ControlCenterContext = createContext<ControlCenterContextValue | null>(null);

export const ControlCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layout, setLayoutState] = useState<ControlCenterLayoutType>(() => {
    const saved = localStorage.getItem('comona_ctrl_layout') as ControlCenterLayoutType;
    return saved && ['bento', 'matrix', 'kpi', 'pipeline', 'mobile'].includes(saved) ? saved : 'bento';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<ControlCenterModuleItem | null>(null);
  const [quickLeadModalOpen, setQuickLeadModalOpen] = useState<boolean>(false);
  const [mobileDevice, setMobileDevice] = useState<'iphone' | 'android' | 'fluid'>('iphone');

  const { metrics, moduleDocCounts, isConnected, apiKeys, refreshStats } = useLiveModuleStats();

  const setLayout = (newLayout: ControlCenterLayoutType) => {
    setLayoutState(newLayout);
    try {
      localStorage.setItem('comona_ctrl_layout', newLayout);
    } catch {}
  };

  const filteredModules = MODULE_CATALOG.filter((mod) => {
    const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <ControlCenterContext.Provider
      value={{
        layout,
        setLayout,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filteredModules,
        selectedModule,
        setSelectedModule,
        quickLeadModalOpen,
        setQuickLeadModalOpen,
        metrics,
        moduleDocCounts,
        refreshStats,
        isConnected,
        apiKeys,
        mobileDevice,
        setMobileDevice,
      }}
    >
      {children}
    </ControlCenterContext.Provider>
  );
};

export function useControlCenter(): ControlCenterContextValue {
  const ctx = useContext(ControlCenterContext);
  if (!ctx) {
    throw new Error('useControlCenter must be used within ControlCenterProvider');
  }
  return ctx;
}
