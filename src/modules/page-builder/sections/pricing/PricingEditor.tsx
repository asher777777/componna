import React, { useState } from 'react';
import { PricingSectionConfig, PricingPackageItem } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../../ui/PageBuilderButton';
import { Plus, Trash2, Edit2, CreditCard, Sliders } from 'lucide-react';

interface PricingEditorProps {
  config: PricingSectionConfig;
  onChange: (updated: PricingSectionConfig) => void;
}

export const PricingEditor: React.FC<PricingEditorProps> = ({ config, onChange }) => {
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);

  const update = <K extends keyof PricingSectionConfig>(field: K, value: PricingSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleAddPackage = () => {
    const newPkg: PricingPackageItem = {
      id: Date.now().toString(),
      name: 'חבילה חדשה',
      price: '₪149',
      period: '/ חודש',
      description: 'תיאור קצר',
      features: ['פיצ׳ר 1', 'פיצ׳ר 2', 'פיצ׳ר 3'],
      buttonText: 'בחר חבילה',
      buttonUrl: '#',
    };
    const updated = [...(config.packages || []), newPkg];
    update('packages', updated);
    setEditingPkgId(newPkg.id);
  };

  const handleUpdatePackage = (id: string, updates: Partial<PricingPackageItem>) => {
    const updated = (config.packages || []).map((p) => (p.id === id ? { ...p, ...updates } : p));
    update('packages', updated);
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('האם למחוק חבילה זו?')) {
      update('packages', (config.packages || []).filter((p) => p.id !== id));
      if (editingPkgId === id) setEditingPkgId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרות מחירונים" icon={<CreditCard className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: תוכניות ומחירים מותאמים"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: בחרו את החבילה המתאימה ביותר"
        />
      </PageBuilderAccordion>

      <PageBuilderAccordion
        title={`ניהול חבילות (${(config.packages || []).length})`}
        icon={<Plus className="w-4 h-4 text-emerald-400" />}
        defaultOpen={true}
        actionNode={
          <PageBuilderButton size="xs" variant="primary" onClick={handleAddPackage} icon={<Plus className="w-3.5 h-3.5" />}>
            הוסף חבילה
          </PageBuilderButton>
        }
      >
        <div className="flex flex-col gap-3">
          {(config.packages || []).map((pkg, idx) => {
            const isEditing = editingPkgId === pkg.id;
            return (
              <div key={pkg.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span className="text-sm font-bold text-white">{pkg.name} - {pkg.price}</span>
                    {pkg.isFeatured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        מודגשת
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingPkgId(isEditing ? null : pkg.id)}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex flex-col gap-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PageBuilderInput
                        label="שם החבילה"
                        value={pkg.name}
                        onChange={(e) => handleUpdatePackage(pkg.id, { name: e.target.value })}
                      />
                      <PageBuilderInput
                        label="מחיר (למשל: ₪199)"
                        value={pkg.price}
                        onChange={(e) => handleUpdatePackage(pkg.id, { price: e.target.value })}
                        dir="ltr"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PageBuilderInput
                        label="תקופה (למשל: / חודש)"
                        value={pkg.period || ''}
                        onChange={(e) => handleUpdatePackage(pkg.id, { period: e.target.value })}
                      />
                      <PageBuilderInput
                        label="תגית עליונה (Badge)"
                        value={pkg.badge || ''}
                        onChange={(e) => handleUpdatePackage(pkg.id, { badge: e.target.value })}
                        placeholder="למשל: הכי פופולרי"
                      />
                    </div>

                    <PageBuilderTextarea
                      label="מאפיינים ופיצ'רים (הפרד בשורות חדשות)"
                      value={(pkg.features || []).join('\n')}
                      onChange={(e) =>
                        handleUpdatePackage(pkg.id, {
                          features: e.target.value.split('\n').filter(Boolean),
                        })
                      }
                      rows={3}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PageBuilderInput
                        label="טקסט כפתור"
                        value={pkg.buttonText || ''}
                        onChange={(e) => handleUpdatePackage(pkg.id, { buttonText: e.target.value })}
                      />
                      <PageBuilderInput
                        label="קישור כפתור"
                        value={pkg.buttonUrl || ''}
                        onChange={(e) => handleUpdatePackage(pkg.id, { buttonUrl: e.target.value })}
                        dir="ltr"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <label className="text-xs font-semibold text-slate-300">הבלט חבילה זו (Featured)</label>
                      <input
                        type="checkbox"
                        checked={pkg.isFeatured || false}
                        onChange={(e) => handleUpdatePackage(pkg.id, { isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'pricing'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="pricing"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
