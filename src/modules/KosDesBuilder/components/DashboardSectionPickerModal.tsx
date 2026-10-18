import React, { useState } from 'react';
import { X, Plus, Layers, Filter } from 'lucide-react';
import { DashboardSectionType } from '../types';
import { DASHBOARD_SECTIONS_REGISTRY, DashboardSectionDefinition } from '../sections/sectionRegistry';

export interface DashboardSectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: DashboardSectionType, defaultTitle?: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'הכל',
  header: 'כותרות',
  metrics: 'מדדים',
  data: 'נתונים',
  actions: 'פעולות',
  navigation: 'ניווט',
  matrix: 'מרכז שליטה',
  embeds: 'ווידג׳טים',
  branding: 'מיתוג ו-DNA',
};

const CATEGORY_COLORS: Record<string, string> = {
  header: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  metrics: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  data: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  actions: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  navigation: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  matrix: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  embeds: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  branding: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

export const DashboardSectionPickerModal: React.FC<DashboardSectionPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const allSections: DashboardSectionDefinition[] = Object.values(DASHBOARD_SECTIONS_REGISTRY);
  const filtered = selectedCategory === 'all'
    ? allSections
    : allSections.filter((s) => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              הוספת אזור חדש ללוח הבקרה
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              בחר סוג אזור לשילוב בלוח הבקרה מתוך קטלוג הרכיבים המודולרי
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 pb-2 flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/40">
          {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === catKey
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {catLabel}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((opt) => {
            const Icon = opt.icon;
            const badgeColor = CATEGORY_COLORS[opt.category] || 'bg-slate-100 text-slate-600 border-slate-200';
            const badgeLabel = CATEGORY_LABELS[opt.category] || opt.category;

            return (
              <div
                key={opt.type}
                onClick={() => {
                  onSelect(opt.type, opt.name);
                  onClose();
                }}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {opt.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>הוסף אזור זה</span>
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
