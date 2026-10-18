import React from 'react';
import { X, Trash2, Eye, EyeOff, Smartphone, Monitor } from 'lucide-react';
import { useKosDesBuilder } from '../context/KosDesBuilderContext';
import { DASHBOARD_SECTIONS_REGISTRY } from '../sections/sectionRegistry';

export const DashboardSectionEditor: React.FC = () => {
  const {
    currentDashboard,
    selectedSectionId,
    setSelectedSectionId,
    updateSection,
    removeSection,
    toggleSectionVisibility,
    toggleSectionMobileHidden,
  } = useKosDesBuilder();

  const section = currentDashboard.sections.find((s) => s.id === selectedSectionId);

  if (!section) return null;

  const sectionDef = DASHBOARD_SECTIONS_REGISTRY[section.type];
  const EditorComponent = sectionDef?.editorComponent;

  const handleTitleChange = (title: string) => {
    updateSection(section.id, { title });
  };

  const handleGridColsChange = (cols: 1 | 2 | 3 | 4) => {
    updateSection(section.id, { gridCols: cols });
  };

  const handleConfigChange = (newConfig: any) => {
    updateSection(section.id, { config: newConfig });
  };

  return (
    <div className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-40 flex flex-col animate-slideRight" dir="rtl">
      {/* Editor Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            עריכת {sectionDef?.name || section.title}
          </h3>
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
            {section.type} | {section.id}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedSectionId(null)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs sm:text-sm">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            כותרת האזור
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Display Toggles */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            נראות ומובייל
          </span>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">הצג אזור</span>
            <button
              type="button"
              onClick={() => toggleSectionVisibility(section.id)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                section.visible
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40'
                  : 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40'
              }`}
            >
              {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">הסתר במובייל בלבד</span>
            <button
              type="button"
              onClick={() => toggleSectionMobileHidden(section.id)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                section.mobileHidden
                  ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/40'
                  : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column Width */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            רוחב פריסה (מתוך 4 עמודות)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleGridColsChange(c as 1 | 2 | 3 | 4)}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  (section.gridCols || 4) === c
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {c}/4
              </button>
            ))}
          </div>
        </div>

        {/* Dedicated Section Editor Component */}
        {EditorComponent && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <EditorComponent
              config={section.config}
              onChange={handleConfigChange}
            />
          </div>
        )}
      </div>

      {/* Editor Footer / Delete Action */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => removeSection(section.id)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>מחק אזור</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSectionId(null)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
        >
          <span>סגור</span>
        </button>
      </div>
    </div>
  );
};
