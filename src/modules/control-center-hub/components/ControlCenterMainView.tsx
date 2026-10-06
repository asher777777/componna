import React from 'react';
import { HeaderControlBar } from './HeaderControlBar';
import { QuickActionsPillBar } from './QuickActionsPillBar';
import { BentoGridLayout } from './layouts/BentoGridLayout';
import { CommandMatrixLayout } from './layouts/CommandMatrixLayout';
import { ExecutiveKpiLayout } from './layouts/ExecutiveKpiLayout';
import { WorkflowPipelineLayout } from './layouts/WorkflowPipelineLayout';
import { MobileSimulatorLayout } from './layouts/MobileSimulatorLayout';
import { QuickLeadModal } from './modals/QuickLeadModal';
import { ModuleDetailsDrawer } from './modals/ModuleDetailsDrawer';
import { useControlCenter } from '../context/ControlCenterContext';
import { Sparkles, Layers, ShieldCheck, Heart } from 'lucide-react';

export const ControlCenterMainView: React.FC = () => {
  const { layout } = useControlCenter();

  const renderActiveLayout = () => {
    switch (layout) {
      case 'matrix':
        return <CommandMatrixLayout />;
      case 'kpi':
        return <ExecutiveKpiLayout />;
      case 'pipeline':
        return <WorkflowPipelineLayout />;
      case 'mobile':
        return <MobileSimulatorLayout />;
      case 'bento':
      default:
        return <BentoGridLayout />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {/* Top Main Navigation Bar */}
      <HeaderControlBar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Sub-bar: Category Tabs & Quick Action Buttons */}
        <QuickActionsPillBar />

        {/* Dynamic 5-Layout Area */}
        <div className="pt-2">
          {renderActiveLayout()}
        </div>

      </main>

      {/* Sleek Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-slate-400">Comona Modular Workspace — Control Center Hub</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-mono text-emerald-400">Zero Mock Data • Clean Full Screen</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>תקן 11 שכבות מודולרי</span>
          <span className="text-slate-600">•</span>
          <span>עצמאי לחלוטין</span>
        </div>
      </footer>

      {/* Overlays / Modals */}
      <QuickLeadModal />
      <ModuleDetailsDrawer />

    </div>
  );
};
