import React, { useState, useEffect } from 'react';
import { SectionType } from '../types/pageBuilder.types';
import { TenantStylePreset } from '../../../core/contracts';
import { SectionDesignRepository } from '../services/sectionDesignRepository';
import { PublicSectionDesignTemplate, applySectionDesignTemplate } from '../types/sectionDesignTemplates';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import {
  X,
  Palette,
  BookmarkPlus,
  Sparkles,
  Layers,
  Heart,
  Shield,
  Sun,
  Compass,
  Cpu,
  Check,
  Globe,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface SectionDesignLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: SectionType;
  currentSectionConfig: Record<string, any>;
  onApplyDesign: (updatedConfig: Record<string, any>) => void;
  isDarkMode?: boolean;
}

const STYLE_OPTIONS: Array<{
  id: TenantStylePreset;
  label: string;
  icon: any;
  color: string;
  desc: string;
}> = [
  { id: 'standard', label: 'סטנדרטי ומאוזן', icon: Layers, color: '#6366f1', desc: 'אלגנטי, נקי וקלאסי' },
  { id: 'feminine', label: 'נשי ורך', icon: Heart, color: '#ec4899', desc: 'מעוגל, פסטלי עם זוהר רך' },
  { id: 'masculine', label: 'גברי ועוצמתי', icon: Shield, color: '#2563eb', desc: 'כהה, יציב עם ניגודיות גבוהה' },
  { id: 'spiritual', label: 'רוחני ועדין', icon: Sun, color: '#8b5cf6', desc: 'לוטוס, פריסה אוורירית והרמונית' },
  { id: 'sharp', label: 'חד וטכנולוגי', icon: Compass, color: '#06b6d4', desc: '90 מעלות, קווים חדים וברוטליסטי' },
  { id: 'analytical', label: 'אנליטי ומדעי', icon: Cpu, color: '#10b981', desc: 'מגזיני, HUD ומדויק' },
];

export const SectionDesignLibraryModal: React.FC<SectionDesignLibraryModalProps> = ({
  isOpen,
  onClose,
  sectionType,
  currentSectionConfig,
  onApplyDesign,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'save'>('browse');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<TenantStylePreset | 'all'>('all');
  const [designs, setDesigns] = useState<PublicSectionDesignTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Save Form State
  const initialPreset: TenantStylePreset =
    currentSectionConfig?.stylePreset ||
    (currentSectionConfig?.layout && ['feminine', 'masculine', 'spiritual', 'sharp', 'analytical', 'standard'].includes(currentSectionConfig.layout)
      ? currentSectionConfig.layout
      : 'standard');

  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [savePreset, setSavePreset] = useState<TenantStylePreset>(initialPreset);

  const effTenant = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;

  // Load designs when modal opens or filter changes
  useEffect(() => {
    if (!isOpen) return;
    loadDesigns();
  }, [isOpen, sectionType, selectedStyleFilter]);

  const loadDesigns = async () => {
    setLoading(true);
    try {
      const list = await SectionDesignRepository.getSectionDesigns({
        sectionType,
        stylePreset: selectedStyleFilter === 'all' ? undefined : selectedStyleFilter,
      });
      setDesigns(list);
    } catch (e) {
      console.warn('Failed to load section designs', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSaveCurrentDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) {
      showFeedback('אנא הזן שם לעיצוב', 'error');
      return;
    }

    setSaving(true);
    try {
      const saved = await SectionDesignRepository.saveSectionDesign({
        sectionType,
        stylePreset: savePreset,
        name: saveName.trim(),
        description: saveDesc.trim(),
        rawSectionConfig: currentSectionConfig,
        authorTenantId: effTenant,
      });

      showFeedback(`עיצוב "${saved.name}" נשמר בהצלחה בטננט הפומבי תחת סגנון ${saved.stylePreset}!`, 'success');
      setSaveName('');
      setSaveDesc('');
      setActiveTab('browse');
      loadDesigns();
    } catch (err) {
      console.error('Save design error:', err);
      showFeedback('שגיאה בשמירת העיצוב הפומבי', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = (template: PublicSectionDesignTemplate) => {
    const updated = applySectionDesignTemplate(currentSectionConfig, template.designConfig);
    // Explicitly update stylePreset tag
    updated.stylePreset = template.stylePreset;
    onApplyDesign(updated);
    showFeedback(`העיצוב "${template.name}" הוחל בהצלחה! התוכן שלך נשמר.`, 'success');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDelete = async (e: React.MouseEvent, designId: string) => {
    e.stopPropagation();
    if (confirm('האם אתה בטוח שברצונך למחוק עיצוב פומבי זה?')) {
      await SectionDesignRepository.deleteSectionDesign(designId);
      setDesigns((prev) => prev.filter((d) => d.id !== designId));
      showFeedback('העיצוב נמחק בהצלחה', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div
        className={clsx(
          'relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden font-sans text-right transition-colors',
          isDarkMode ? 'bg-[#0f0f12] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        )}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-inherit flex items-center justify-between shrink-0 bg-inherit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">ספריית עיצובי אזור פומביים</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {sectionType}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>פומבי לכל הטננטים</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                שמירה ושאיבת עיצובי אזור שלמים (ללא שינוי התוכן האישי) והרחבת 6 סגנונות המותג.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              title="סגור חלונית"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-inherit flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={clsx(
              'pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5',
              activeTab === 'browse'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>סייר עיצובים קיימים ({designs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('save')}
            className={clsx(
              'pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5',
              activeTab === 'save'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            )}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>שמור עיצוב אזור נוכחי לטננט פומבי</span>
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div
            className={clsx(
              'mx-5 mt-3 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn',
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            )}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* TAB 1: BROWSE DESIGNS */}
        {activeTab === 'browse' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* 6 Styles Filter Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 block">סנן לפי סגנון מותג:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedStyleFilter('all')}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer',
                    selectedStyleFilter === 'all'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  כל הסגנונות ({designs.length})
                </button>

                {STYLE_OPTIONS.map((st) => {
                  const Icon = st.icon;
                  const isSelected = selectedStyleFilter === st.id;
                  const count = designs.filter((d) => d.stylePreset === st.id).length;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStyleFilter(st.id)}
                      className={clsx(
                        'px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500/40'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: st.color }} />
                      <span>{st.label}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Designs Grid */}
            {loading ? (
              <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                <span className="text-xs font-bold">טוען תבניות עיצוב מהטננט הפומבי...</span>
              </div>
            ) : designs.length === 0 ? (
              <div className="py-14 text-center border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center gap-3 text-zinc-400">
                <Palette className="w-10 h-10 text-zinc-600" />
                <h3 className="text-sm font-bold text-zinc-200">לא נמצאו עיצובים פומביים תחת סגנון זה</h3>
                <p className="text-xs max-w-md text-zinc-400 leading-relaxed">
                  היה הראשון לתרום ולהרחיב את הסגנון! עבור ללשונית "שמור עיצוב אזור נוכחי לטננט פומבי" ושמור את הגדרות העיצוב של האזור לשימוש כלל המשתמשים.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('save')}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>שמור עיצוב אזור זה עכשיו</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {designs.map((template) => {
                  const styleInfo = STYLE_OPTIONS.find((s) => s.id === template.stylePreset) || STYLE_OPTIONS[0];
                  const StyleIcon = styleInfo.icon;
                  const cfg = template.designConfig || {};

                  return (
                    <div
                      key={template.id}
                      className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-all flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-2">
                        {/* Badges row */}
                        <div className="flex items-center justify-between">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                            style={{
                              backgroundColor: `${styleInfo.color}15`,
                              borderColor: `${styleInfo.color}40`,
                              color: styleInfo.color,
                            }}
                          >
                            <StyleIcon className="w-3 h-3" />
                            <span>סגנון {styleInfo.label}</span>
                          </span>

                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                            <span>מאת: {template.authorName || 'משתמש מערכת'}</span>
                            {(template.authorTenantId === effTenant || effTenant === ROOT_TENANT_ID || effTenant === '_master') && (
                              <button
                                type="button"
                                onClick={(e) => handleDelete(e, template.id)}
                                className="p-1 rounded text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                                title="מחק עיצוב זה מהמאגר הפומבי"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                          {template.name}
                        </h4>
                        {template.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {template.description}
                          </p>
                        )}

                        {/* Visual Tokens Snapshot Preview */}
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-zinc-400 grid grid-cols-2 gap-1.5">
                          {cfg.layout && <div><strong>פריסה:</strong> {cfg.layout}</div>}
                          {cfg.boxShape && <div><strong>צורת כרטיסים:</strong> {cfg.boxShape}</div>}
                          {cfg.buttonShape && <div><strong>כפתורים:</strong> {cfg.buttonShape}</div>}
                          {cfg.effectStyle && <div><strong>אפקט:</strong> {cfg.effectStyle}</div>}
                          {cfg.sectionHeightMode && <div><strong>גובה:</strong> {cfg.sectionHeightMode}</div>}
                          {cfg.backgroundColor && cfg.backgroundColor !== 'transparent' && (
                            <div className="flex items-center gap-1">
                              <strong>רקע:</strong>
                              <span className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block" style={{ backgroundColor: cfg.backgroundColor }} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Apply Button */}
                      <button
                        type="button"
                        onClick={() => handleApply(template)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>החל עיצוב זה על האזור (שומר תוכן קיים)</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVE CURRENT DESIGN */}
        {activeTab === 'save' && (
          <form onSubmit={handleSaveCurrentDesign} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>איך פועלת שמירת העיצוב הפומבי?</strong>
                <p className="mt-1 opacity-90">
                  המערכת מחלצת אך ורק את הגדרות הפריסה, הטיפוגרפיה, הצורות, הגבהים, הגרדיאנטים והאפקטים של האזור הנוכחי (ללא טקסטים או תכנים אישיים).
                  העיצוב יאוחסן במאגר הפומבי של הטננט ויהיה זמין לכלל המשתמשים תחת הסגנון שתבחר.
                </p>
              </div>
            </div>

            {/* Design Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">שם העיצוב (לזיהוי נוח בספרייה):</label>
              <input
                type="text"
                required
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={`לדוגמה: פריסת ${sectionType} יוקרתית עם כרטיסים מעוגלים ורקע גרדיאנט`}
                className="w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border bg-white/5 border-white/10 text-white focus:border-indigo-500"
              />
            </div>

            {/* Target Style Preset Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">שמור תחת סגנון מותג (להרחבת הסגנון):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_OPTIONS.map((st) => {
                  const Icon = st.icon;
                  const isSelected = savePreset === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSavePreset(st.id)}
                      className={clsx(
                        'p-3 rounded-xl border flex flex-col gap-1 transition cursor-pointer select-none text-right',
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500/40 text-white'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <Icon className="w-3.5 h-3.5" style={{ color: st.color }} />
                          <span>{st.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-400">{st.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">תיאור קצר והערות עיצוביות (אופציונלי):</label>
              <textarea
                rows={3}
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
                placeholder="פירוט על האפקטים, השימושים המומלצים ושילוב האלמנטים..."
                className="w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border bg-white/5 border-white/10 text-white focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                ביטול
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>שומר בטננט הפומבי...</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>שמור עיצוב עכשיו לטננט פומבי</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
