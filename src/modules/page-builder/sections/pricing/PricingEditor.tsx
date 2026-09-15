import React from 'react';
import { PricingSectionConfig, PricingPackageItem } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { Plus, Trash2 } from 'lucide-react';

export const PricingEditor: React.FC<{
  config: PricingSectionConfig;
  onChange: (updated: PricingSectionConfig) => void;
}> = ({ config, onChange }) => {
  const handlePackageChange = (index: number, field: keyof PricingPackageItem, value: any) => {
    const updated = [...(config.packages || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, packages: updated });
  };

  const handleAddPackage = () => {
    const newPkg: PricingPackageItem = {
      id: `pkg_${Date.now()}`,
      name: 'חבילה חדשה',
      priceMonthly: '₪149',
      priceYearly: '₪119',
      period: '/ חודש',
      description: 'פירוט קצר על החבילה',
      features: ['תכונה ראשונה', 'תכונה שנייה', 'תמיכה מלאה'],
      buttonText: 'בחר מסלול',
      buttonUrl: '#contact',
    };
    onChange({ ...config, packages: [...(config.packages || []), newPkg] });
  };

  const handleDeletePackage = (index: number) => {
    const updated = (config.packages || []).filter((_, i) => i !== index);
    onChange({ ...config, packages: updated });
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PageBuilderInput
          label="כותרת מחירון"
          value={config.title || ''}
          onChange={(val) => onChange({ ...config, title: val })}
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(val) => onChange({ ...config, subtitle: val })}
        />
      </div>

      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-300">מתג תשלום שנתי / חודשי</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showBillingToggle !== false}
              onChange={(e) => onChange({ ...config, showBillingToggle: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>הצג מתג חודשי/שנתי</span>
          </label>
          <PageBuilderInput
            label="תגית הנחה שנתית (Badge)"
            value={config.yearlyDiscountBadge || 'חיסכון של 20% 🎉'}
            onChange={(val) => onChange({ ...config, yearlyDiscountBadge: val })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h4 className="text-sm font-bold text-white">חבילות מחיר ({config.packages?.length || 0})</h4>
        <button
          type="button"
          onClick={handleAddPackage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף חבילה</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {config.packages?.map((pkg, idx) => (
          <div key={pkg.id || idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">חבילה #{idx + 1}</span>
              <button
                type="button"
                onClick={() => handleDeletePackage(idx)}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="מחק"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PageBuilderInput
                label="שם החבילה"
                value={pkg.name || ''}
                onChange={(val) => handlePackageChange(idx, 'name', val)}
              />
              <PageBuilderInput
                label="מחיר חודשי"
                value={pkg.priceMonthly || ''}
                onChange={(val) => handlePackageChange(idx, 'priceMonthly', val)}
              />
              <PageBuilderInput
                label="מחיר שנתי מוזל"
                value={pkg.priceYearly || ''}
                onChange={(val) => handlePackageChange(idx, 'priceYearly', val)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PageBuilderInput
                label="תגית / Badge"
                value={pkg.badge || ''}
                onChange={(val) => handlePackageChange(idx, 'badge', val)}
              />
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-6">
                <input
                  type="checkbox"
                  checked={pkg.isFeatured || false}
                  onChange={(e) => handlePackageChange(idx, 'isFeatured', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>הבלט חבילה זו (Pro Highlight)</span>
              </label>
              <PageBuilderInput
                label="טקסט כפתור"
                value={pkg.buttonText || ''}
                onChange={(val) => handlePackageChange(idx, 'buttonText', val)}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">רשימת פיצ׳רים (שורה אחר שורה)</label>
              <textarea
                rows={3}
                value={(pkg.features || []).join('\n')}
                onChange={(e) => handlePackageChange(idx, 'features', e.target.value.split('\n').filter(Boolean))}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
