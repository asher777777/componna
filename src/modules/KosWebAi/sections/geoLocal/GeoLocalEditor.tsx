import React from 'react';
import { GeoLocalSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput, resolveInputValue } from '../../ui/PageBuilderInput';

export const GeoLocalEditor: React.FC<{
  config: GeoLocalSectionConfig;
  onChange: (updated: GeoLocalSectionConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PageBuilderInput
          label="כותרת אזור הסניף המקומי"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: resolveInputValue(e) })}
        />
        <PageBuilderInput
          label="תת-כותרת / תגית"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: resolveInputValue(e) })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PageBuilderInput
          label="שם העסק / הסניף"
          value={config.businessName || ''}
          onChange={(e) => onChange({ ...config, businessName: resolveInputValue(e) })}
        />
        <PageBuilderInput
          label="עיר מרכזית"
          value={config.city || ''}
          onChange={(e) => onChange({ ...config, city: resolveInputValue(e) })}
        />
      </div>

      <PageBuilderInput
        label="כתובת מלאה (כולל רחוב ומספר)"
        value={config.address || ''}
        onChange={(e) => onChange({ ...config, address: resolveInputValue(e) })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PageBuilderInput
          label="טלפון"
          value={config.phone || ''}
          onChange={(e) => onChange({ ...config, phone: resolveInputValue(e) })}
        />
        <PageBuilderInput
          label="וואטסאפ"
          value={config.whatsapp || ''}
          onChange={(e) => onChange({ ...config, whatsapp: resolveInputValue(e) })}
        />
        <PageBuilderInput
          label="אימייל"
          value={config.email || ''}
          onChange={(e) => onChange({ ...config, email: resolveInputValue(e) })}
        />
      </div>

      <PageBuilderInput
        label="קישור הטמעת Google Maps Embed (iframe URL)"
        value={config.mapEmbedUrl || ''}
        onChange={(e) => onChange({ ...config, mapEmbedUrl: resolveInputValue(e) })}
      />

      <div>
        <label className="block text-xs text-slate-400 mb-1 font-medium">אזורי שירות (מופרדים בפסיקים)</label>
        <input
          type="text"
          value={(config.serviceAreas || []).join(', ')}
          onChange={(e) =>
            onChange({
              ...config,
              serviceAreas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="תל אביב, גוש דן, השרון, ירושלים"
          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
};
