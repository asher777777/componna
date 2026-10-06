import React from 'react';
import { HeaderControlBar } from './HeaderControlBar';
import { QuickActionsPillBar } from './QuickActionsPillBar';
import { BentoGridLayout } from './layouts/BentoGridLayout';
import { CommandMatrixLayout } from './layouts/CommandMatrixLayout';
import { ExecutiveKpiLayout } from './layouts/ExecutiveKpiLayout';
import { WorkflowPipelineLayout } from './layouts/WorkflowPipelineLayout';
import { MobileSimulatorLayout } from './layouts/MobileSimulatorLayout';
import { QuickLeadModal } from './modals/QuickLeadModal';
import { QuickWhatsAppModal } from './modals/QuickWhatsAppModal';
import { ModuleDetailsDrawer } from './modals/ModuleDetailsDrawer';
import { useControlCenter } from '../context/ControlCenterContext';
import { Sparkles } from 'lucide-react';

export const ControlCenterMainView: React.FC = () => {
  const { layout, theme, quickWhatsAppModalOpen, setQuickWhatsAppModalOpen } = useControlCenter();
  const isLight = theme === 'light';

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
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-500 selection:text-white ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#07070a] text-slate-100'
      }`}
      dir="rtl"
    >
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
      <footer
        className={`border-t px-6 py-4 text-xs transition-colors duration-300 flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight
            ? 'border-slate-200 bg-white/90 text-slate-500 shadow-inner'
            : 'border-slate-900 bg-slate-950/80 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            Comona Modular Workspace — Control Center Hub
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold">
            Zero Mock Data • Clean Full Screen • Day Mode Default
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>תקן 11 שכבות מודולרי</span>
          <span className="text-slate-400">•</span>
          <span>עצמאי לחלוטין</span>
        </div>
      </footer>

      {/* Overlays / Modals */}
      <QuickLeadModal />
      <QuickWhatsAppModal isOpen={quickWhatsAppModalOpen} onClose={() => setQuickWhatsAppModalOpen(false)} />
      <ModuleDetailsDrawer />
    </div>
  );
};
