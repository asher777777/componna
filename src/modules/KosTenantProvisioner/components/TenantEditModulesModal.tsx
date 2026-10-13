import React, { useState, useEffect } from 'react';
import { X, Layers, Check, Save, RefreshCw } from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';

export const TenantEditModulesModal: React.FC = () => {
  const { editingTenant, setEditingTenant, updateModules } = useTenantProvisioner();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTenant) {
      setSelectedModules(editingTenant.activeModules || []);
    }
  }, [editingTenant]);

  if (!editingTenant) return null;

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateModules(editingTenant.subdomain, selectedModules);
      setEditingTenant(null);
    } catch (e) {
      console.warn('Error updating modules:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                עריכת רכיבים מוטענים: {editingTenant.clientName}
              </h3>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400" dir="ltr">
                {editingTenant.fullDomain}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditingTenant(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              בחר את הרכיבים שיופעלו עבור דייר זה ({selectedModules.length} פעילים):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedModules(AVAILABLE_MODULES_CATALOG.map((m) => m.id))}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
              >
                בחר הכל
              </button>
              <button
                type="button"
                onClick={() => setSelectedModules([])}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
              >
                נקה הכל
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
            {AVAILABLE_MODULES_CATALOG.map((mod) => {
              const isChecked = selectedModules.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ${
                    isChecked
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold truncate ${isChecked ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                        {mod.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0" dir="ltr">
                        {mod.englishPrefix}{mod.englishRest}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditingTenant(null)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>שמור שינויים ברכיבים</span>
          </button>
        </div>

      </div>
    </div>
  );
};
