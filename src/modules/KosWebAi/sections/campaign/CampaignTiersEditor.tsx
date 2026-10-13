import React, { useState } from 'react';
import { CampaignTiersSectionConfig, CampaignTierItem } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../../ui/PageBuilderButton';
import { Plus, Trash2, Edit2, Heart, Sliders } from 'lucide-react';

interface CampaignTiersEditorProps {
  config: CampaignTiersSectionConfig;
  onChange: (updated: CampaignTiersSectionConfig) => void;
}

export const CampaignTiersEditor: React.FC<CampaignTiersEditorProps> = ({ config, onChange }) => {
  const [editingTierId, setEditingTierId] = useState<string | null>(null);

  const update = <K extends keyof CampaignTiersSectionConfig>(field: K, value: CampaignTiersSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleAddTier = () => {
    const newTier: CampaignTierItem = {
      id: Date.now().toString(),
      title: 'מדרגת תרומה חדשה',
      amount: 500,
      description: 'פירוט הזכות או ההקדשה',
      isPopular: false,
    };
    const updated = [...(config.tiers || []), newTier];
    update('tiers', updated);
    setEditingTierId(newTier.id);
  };

  const handleUpdateTier = (id: string, updates: Partial<CampaignTierItem>) => {
    const updated = (config.tiers || []).map((t) => (t.id === id ? { ...t, ...updates } : t));
    update('tiers', updated);
  };

  const handleDeleteTier = (id: string) => {
    if (confirm('האם למחוק מדרגת תרומה זו?')) {
      update('tiers', (config.tiers || []).filter((t) => t.id !== id));
      if (editingTierId === id) setEditingTierId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרות ואופן תרומה" icon={<Heart className="w-4 h-4 text-pink-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: בחרו סכום לתרומה"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="למשל: כל תרומה מקדמת אותנו אל היעד"
        />

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-slate-300">סוגי תרומה זמינים</label>
          <select
            value={config.donationType || 'both'}
            onChange={(e) => update('donationType', e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="both">גם חד-פעמי וגם הוראת קבע (שני כפתורים)</option>
            <option value="one_time">חד-פעמי בלבד</option>
            <option value="recurring">הוראת קבע בלבד</option>
          </select>
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion
        title={`ניהול מדרגות סכום (${(config.tiers || []).length})`}
        icon={<Plus className="w-4 h-4 text-indigo-400" />}
        defaultOpen={true}
        actionNode={
          <PageBuilderButton size="xs" variant="primary" onClick={handleAddTier} icon={<Plus className="w-3.5 h-3.5" />}>
            הוסף סכום
          </PageBuilderButton>
        }
      >
        <div className="flex flex-col gap-3">
          {(config.tiers || []).map((tier, idx) => {
            const isEditing = editingTierId === tier.id;
            return (
              <div key={tier.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span className="text-sm font-bold text-white">₪{tier.amount} - {tier.title}</span>
                    {tier.isPopular && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        מומלץ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingTierId(isEditing ? null : tier.id)}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTier(tier.id)}
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
                        label="שם המדרגה / תיאור קצר"
                        value={tier.title}
                        onChange={(e) => handleUpdateTier(tier.id, { title: e.target.value })}
                      />
                      <PageBuilderInput
                        label="סכום לתרומה (₪)"
                        type="number"
                        value={tier.amount}
                        onChange={(e) => handleUpdateTier(tier.id, { amount: parseInt(e.target.value) || 0 })}
                        dir="ltr"
                      />
                    </div>

                    <PageBuilderInput
                      label="פירוט הזכות / הסבר"
                      value={tier.description || ''}
                      onChange={(e) => handleUpdateTier(tier.id, { description: e.target.value })}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PageBuilderInput
                        label="טקסט תגית מובלטת (Badge)"
                        value={tier.badgeText || ''}
                        onChange={(e) => handleUpdateTier(tier.id, { badgeText: e.target.value })}
                        placeholder="למשל: הכי נבחר"
                      />
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 self-end">
                        <label className="text-xs font-semibold text-slate-300">סמן כמדרגה מודגשת (Popular)</label>
                        <input
                          type="checkbox"
                          checked={tier.isPopular || false}
                          onChange={(e) => handleUpdateTier(tier.id, { isPopular: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                        />
                      </div>
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
          value={config.anchorId || 'campaignTiers'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="campaignTiers"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
