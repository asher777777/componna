import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Plus,
  Save,
  CheckCircle,
  Smartphone,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import {
  DashboardPageDocument,
  DashboardSection,
  DashboardSectionType,
} from '../types';
import { INITIAL_DASHBOARD } from '../config';
import { dashboardFirestore } from '../services/dashboardFirestore';
import { DASHBOARD_SECTIONS_REGISTRY } from '../sections/sectionRegistry';
import { DashboardSectionPickerModal } from './DashboardSectionPickerModal';

export interface DashboardPageRendererProps {
  dashboardId?: string;
  moduleId?: string;
  pageId?: string;
  initialSections?: DashboardSection[];
  dashboard?: DashboardPageDocument | null;
  isEditing?: boolean;
  tenantId?: string;
  tenantName?: string;
  onSave?: (saved: DashboardPageDocument) => void;
}

export const DashboardPageRenderer: React.FC<DashboardPageRendererProps> = ({
  dashboardId,
  moduleId,
  pageId,
  initialSections,
  dashboard: propDashboard,
  isEditing: controlledIsEditing,
  tenantId: propTenantId,
  tenantName = 'דייר מערכת',
  onSave,
}) => {
  const { db } = useSystemConnection();
  const { tenantId: scopeTenantId } = useTenantScope();
  const effectiveTenantId = propTenantId || scopeTenantId || '_master';
  const effectiveDocId =
    propDashboard?.id ||
    dashboardId ||
    (moduleId ? `dashboard_${moduleId}` : pageId ? `dashboard_${pageId}` : 'default');

  // Edit Mode state (controlled or listened via event)
  const [internalIsEditing, setInternalIsEditing] = useState<boolean>(false);
  const isEditing = controlledIsEditing !== undefined ? controlledIsEditing : internalIsEditing;

  // Active dashboard document
  const [currentDashboard, setCurrentDashboard] = useState<DashboardPageDocument>(
    propDashboard || {
      ...INITIAL_DASHBOARD,
      id: effectiveDocId,
      title: moduleId ? `לוח בקרה — ${moduleId}` : INITIAL_DASHBOARD.title,
      sections: initialSections && initialSections.length > 0 ? initialSections : INITIAL_DASHBOARD.sections,
    }
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerInsertIndex, setPickerInsertIndex] = useState<number | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Load from Firestore if propDashboard is not provided
  useEffect(() => {
    if (propDashboard) {
      setCurrentDashboard(propDashboard);
      return;
    }
    let isMounted = true;
    dashboardFirestore.getDashboardById(db, effectiveTenantId, effectiveDocId).then((found) => {
      if (!isMounted) return;
      if (found) {
        setCurrentDashboard(found);
      } else if (initialSections && initialSections.length > 0) {
        setCurrentDashboard({
          ...INITIAL_DASHBOARD,
          id: effectiveDocId,
          title: `לוח בקרה — ${moduleId || pageId || tenantName}`,
          sections: initialSections,
        });
      } else {
        dashboardFirestore.getDashboards(db, effectiveTenantId).then((list) => {
          if (!isMounted) return;
          if (list && list.length > 0) {
            setCurrentDashboard(list[0]);
          }
        });
      }
    }).catch((err) => {
      console.warn('[DashboardPageRenderer] Could not load dashboard:', err);
    });
    return () => {
      isMounted = false;
    };
  }, [propDashboard, db, effectiveTenantId, effectiveDocId, initialSections, moduleId, pageId, tenantName]);

  // Listen to dock edit mode events
  useEffect(() => {
    const handleToggle = (e: any) => {
      if (e?.detail?.isEditMode !== undefined) {
        setInternalIsEditing(Boolean(e.detail.isEditMode));
      } else {
        setInternalIsEditing((prev) => !prev);
      }
    };
    window.addEventListener('kos_des_builder_toggle_edit', handleToggle);
    return () => window.removeEventListener('kos_des_builder_toggle_edit', handleToggle);
  }, []);

  // Save changes to Firestore under tenant scope
  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    try {
      const toSave: DashboardPageDocument = {
        ...currentDashboard,
        id: effectiveDocId,
      };
      const saved = await dashboardFirestore.saveDashboard(db, effectiveTenantId, toSave);
      setCurrentDashboard(saved);
      if (onSave) onSave(saved);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
      window.dispatchEvent(new CustomEvent('kos_des_builder_saved', { detail: { dashboard: saved } }));
    } catch (err) {
      console.warn('[DashboardPageRenderer] Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [db, effectiveTenantId, currentDashboard, effectiveDocId, onSave]);

  // Section CRUD Handlers
  const handleUpdateSection = useCallback((sectionId: string, updatedConfig: any) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, config: updatedConfig } : sec
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleUpdateSectionBase = useCallback((sectionId: string, updates: Partial<DashboardSection>) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, ...updates } : sec
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!window.confirm('האם למחוק אזור זה מלוח הבקרה?')) return;
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
      updatedAt: new Date().toISOString(),
    }));
    setEditingSectionId(null);
  }, []);

  const handleDuplicateSection = useCallback((sectionId: string) => {
    setCurrentDashboard((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      const src = prev.sections[idx];
      const newSection: DashboardSection = {
        ...src,
        id: `sec-${src.type}-${Date.now().toString(36)}`,
        title: `${src.title} (משוכפל)`,
      };
      const nextSections = [...prev.sections];
      nextSections.splice(idx + 1, 0, newSection);
      return {
        ...prev,
        sections: nextSections,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setCurrentDashboard((prev) => {
      const nextSections = [...prev.sections];
      const temp = nextSections[index - 1];
      nextSections[index - 1] = nextSections[index];
      nextSections[index] = temp;
      return { ...prev, sections: nextSections, updatedAt: new Date().toISOString() };
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setCurrentDashboard((prev) => {
      if (index >= prev.sections.length - 1) return prev;
      const nextSections = [...prev.sections];
      const temp = nextSections[index + 1];
      nextSections[index + 1] = nextSections[index];
      nextSections[index] = temp;
      return { ...prev, sections: nextSections, updatedAt: new Date().toISOString() };
    });
  }, []);

  const handleToggleVisibility = useCallback((sectionId: string) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleToggleMobileHidden = useCallback((sectionId: string) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, mobileHidden: !s.mobileHidden } : s
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleAddSection = useCallback(
    (type: DashboardSectionType, defaultTitle?: string) => {
      const def = DASHBOARD_SECTIONS_REGISTRY[type];
      const newSection: DashboardSection = {
        id: `sec-${type}-${Date.now().toString(36)}`,
        type,
        title: defaultTitle || def?.name || `אזור ${type}`,
        visible: true,
        mobileHidden: false,
        gridCols: 4,
        config: def?.defaultConfig ? JSON.parse(JSON.stringify(def.defaultConfig)) : {},
      };

      setCurrentDashboard((prev) => {
        const nextSections = [...prev.sections];
        if (typeof pickerInsertIndex === 'number' && pickerInsertIndex >= 0) {
          nextSections.splice(pickerInsertIndex, 0, newSection);
        } else {
          nextSections.push(newSection);
        }
        return { ...prev, sections: nextSections, updatedAt: new Date().toISOString() };
      });
      setPickerInsertIndex(undefined);
    },
    [pickerInsertIndex]
  );

  const activeEditingSection = currentDashboard.sections.find((s) => s.id === editingSectionId);
  const activeDef = activeEditingSection ? DASHBOARD_SECTIONS_REGISTRY[activeEditingSection.type] : null;
  const ActiveEditor = activeDef?.editorComponent;

  return (
    <div className="w-full relative selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Top Inline Edit Mode Bar when active */}
      {isEditing && (
        <aside
          aria-label="מצב עריכת לוח בקרה"
          className="sticky top-2 z-40 max-w-7xl mx-auto px-4 mb-4"
        >
          <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-indigo-500/40 p-3 sm:p-4 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base">
                    עריכת לוח בקרה (טננט מנג׳ר)
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    מצב עריכה חי
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  כל שינוי בטקסטים, בפריסה ובכפתורים חל מיידית על לוחות הבקרה של הדייר
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPickerInsertIndex(undefined);
                  setIsPickerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>הוסף אזור</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'שומר...' : 'שמור שינויים'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInternalIsEditing(false);
                  window.dispatchEvent(
                    new CustomEvent('kos_des_builder_toggle_edit', { detail: { isEditMode: false } })
                  );
                  window.dispatchEvent(
                    new CustomEvent('kos_des_builder_edit_mode_changed', { detail: { isEditMode: false } })
                  );
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                title="סיום עריכה"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {saveSuccessNotice && (
            <div className="mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>השינויים נשמרו בהצלחה בלוח הבקרה של הדייר!</span>
            </div>
          )}
        </aside>
      )}

      {/* Main Sections Grid / Stack */}
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
        {currentDashboard.sections.map((section, index) => {
          const def = DASHBOARD_SECTIONS_REGISTRY[section.type];
          if (!def) return null;

          const ViewComponent = def.viewComponent;
          const isFirst = index === 0;
          const isLast = index === currentDashboard.sections.length - 1;
          const isHidden = !section.visible;

          // If not in editing mode and section is hidden, don't render it
          if (!isEditing && isHidden) return null;

          return (
            <div
              key={section.id}
              className={`relative transition-all duration-200 ${
                isEditing
                  ? 'border-2 border-dashed border-indigo-400/40 hover:border-indigo-500 rounded-3xl p-2 sm:p-3 my-2'
                  : ''
              } ${isHidden ? 'opacity-40 grayscale-75' : ''}`}
            >
              {/* In-Place Section Toolbar when Editing */}
              {isEditing && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-2xl border border-slate-700 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-600/40 text-indigo-300 border border-indigo-500/30">
                      {def.name}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {section.title}
                    </span>
                    {isHidden && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                        מוסתר
                      </span>
                    )}
                    {section.mobileHidden && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        מוסתר במובייל
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(section.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      title="ערוך תוכן, כפתורים והגדרות"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ערוך אזור</span>
                    </button>

                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="הזז למעלה"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="הזז למטה"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(section.id)}
                      className="p-1.5 text-slate-300 hover:text-white cursor-pointer"
                      title={section.visible ? 'הסתר אזור' : 'הצג אזור'}
                    >
                      {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleMobileHidden(section.id)}
                      className={`p-1.5 cursor-pointer ${
                        section.mobileHidden ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                      }`}
                      title="תצוגת מובייל"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateSection(section.id)}
                      className="p-1.5 text-slate-300 hover:text-white cursor-pointer"
                      title="שכפל אזור"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                      title="מחק אזור"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Live Rendered View */}
              <ViewComponent config={section.config} tenantName={tenantName} />

              {/* Add Section Button Divider in Edit Mode */}
              {isEditing && (
                <div className="my-3 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPickerInsertIndex(index + 1);
                      setIsPickerOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold border border-dashed border-slate-300 dark:border-slate-700 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף אזור כאן</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* In-Place Section Editor Modal */}
      {editingSectionId && activeEditingSection && ActiveEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    עריכת {activeDef?.name || activeEditingSection.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeEditingSection.type}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingSectionId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  כותרת מנהל לאזור
                </label>
                <input
                  type="text"
                  value={activeEditingSection.title}
                  onChange={(e) => handleUpdateSectionBase(activeEditingSection.id, { title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Dedicated Editor */}
              <ActiveEditor
                config={activeEditingSection.config}
                onChange={(updatedConfig: any) => handleUpdateSection(activeEditingSection.id, updatedConfig)}
              />
            </div>

            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between z-10">
              <button
                type="button"
                onClick={() => handleDeleteSection(activeEditingSection.id)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>מחק אזור</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingSectionId(null);
                  handleSaveAll();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>שמור וסגור</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Picker Modal */}
      <DashboardSectionPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(type, title) => handleAddSection(type, title)}
      />
    </div>
  );
};
