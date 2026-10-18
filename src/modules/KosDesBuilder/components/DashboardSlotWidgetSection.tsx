import React from 'react';
import { Layers } from 'lucide-react';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import { DashboardSlotWidgetConfig } from '../types';

export interface DashboardSlotWidgetSectionProps {
  config: DashboardSlotWidgetConfig;
}

export const DashboardSlotWidgetSection: React.FC<DashboardSlotWidgetSectionProps> = ({ config }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4" dir="rtl">
      {config.title && (
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          {config.title}
        </h3>
      )}

      <CapabilitySlot
        name={config.slotName}
        props={config.props || {}}
        fallback={
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              ווידג׳ט מוטמע: {config.slotName}
            </p>
            <p className="text-xs text-slate-400">
              הרכיב יוצג כאשר המודול המספק ייטען בסביבת הדייר.
            </p>
          </div>
        }
      />
    </div>
  );
};
