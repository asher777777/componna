import React, { useState } from 'react';
import { HeaderSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { useBrandDna } from '../../../brand-dna-hub/hooks/useBrandDna';
import {
  LayoutTemplate,
  Check,
  Plus,
  Trash2,
  Info,
  Sparkles,
  Link as LinkIcon,
  Phone,
  MessageCircle,
  LogIn,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderEditorProps {
  config: HeaderSectionConfig;
  onChange: (updated: Partial<HeaderSectionConfig>) => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({ config, onChange }) => {
  const brandContext = useBrandDna();
  const brandLogo = brandContext?.brandDna?.identity?.logoUrl;
  const brandCompanyName = brandContext?.brandDna?.identity?.companyName || 'קושאן';

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const layouts = [
    { id: 'floating-glass', label: 'צף עם זכוכית (Glass)', desc: 'פינות מעוגלות, אפקט טשטוש צף ומודרני 2026' },
    { id: 'classic', label: 'קלאסי מלא', desc: 'תפריט לרוחב מלא עם גבול תחתון עדין' },
    { id: 'centered', label: 'לוגו במרכז', desc: 'לוגו מיושר לאמצע ותפריט מפוצל או מתחת' },
    { id: 'minimal', label: 'מינימליסטי', desc: 'גובה קומפקטי, מרווחים צפופים ונקיים' },
    { id: 'transparent', label: 'שקוף מעל התוכן', desc: 'רקע שקוף המשתלב עם אזור ה-Hero' },
  ];

  const handleAddCustomLink = () => {
    const existing = config.customLinks || [];
    onChange({
      customLinks: [...existing, { label: 'קישור חדש', url: '#' }],
    });
  };

  const handleUpdateCustomLink = (index: number, field: 'label' | 'url', value: string) => {
    const existing = [...(config.customLinks || [])];
    if (existing[index]) {
      existing[index] = { ...existing[index], [field]: value };
      onChange({ customLinks: existing });
    }
  };

  const handleRemoveCustomLink = (index: number) => {
    const existing = (config.customLinks || []).filter((_, i) => i !== index);
    onChange({ customLinks: existing });
  };

  return (
    <div className="flex flex-col gap-6 text-right font-sans" dir="rtl">
      {/* 1. Layout Selection */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">סגנון ופריסת ההדר</h4>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'layout' ? null : 'layout')}
              className="p-1 rounded-full text-slate-400 hover:text-indigo-400 transition"
              title="מידע נוסף"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {config.layout || 'floating-glass'}
          </span>
        </div>

        {activeTooltip === 'layout' && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-slate-300 relative">
            <button
              type="button"
              onClick={() => setActiveTooltip(null)}
              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            בחרו את הפריסה הרצויה להדר. כל הפריסות נבנו בגישת Mobile-First ומתאימות אוטומטית למסכי טלפון.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {layouts.map((l) => {
            const isSelected = (config.layout || 'floating-glass') === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onChange({ layout: l.id as any })}
                className={clsx(
                  'p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1',
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/15'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">{l.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">{l.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Sticky Navbar Toggle */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div>
            <span className="text-xs font-bold text-white block">תפריט דביק (Sticky)</span>
            <span className="text-[11px] text-slate-400">נשאר קבוע בראש העמוד בזמן גלילה</span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ sticky: config.sticky === false ? true : false })}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              config.sticky !== false ? 'bg-indigo-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.sticky !== false ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* 2. Logo & Branding Settings */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>הגדרות לוגו ומיתוג</span>
          </h4>
          {brandLogo && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              לוגו מותג זמין
            </span>
          )}
        </div>

        {/* Use Brand DNA Logo Toggle */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt="Brand DNA Logo"
                className="w-8 h-8 rounded-lg object-contain bg-slate-900 p-0.5 border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                ק
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-white block">
                השתמש בלוגו מרכיב המיתוג (Brand DNA)
              </span>
              <span className="text-[11px] text-slate-400">
                {brandCompanyName ? `מותג פעיל: ${brandCompanyName}` : 'מסנכרן אוטומטית עם הגדרות העסק'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ useBrandLogo: config.useBrandLogo === false ? true : false })}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              config.useBrandLogo !== false ? 'bg-indigo-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.useBrandLogo !== false ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>

        {/* Custom Logo URL (if not using brand logo) */}
        {config.useBrandLogo === false && (
          <PageBuilderInput
            label="כתובת לוגו מותאם אישית (URL)"
            placeholder="https://example.com/logo.png"
            value={config.customLogoUrl || ''}
            onChange={(e) => onChange({ customLogoUrl: e.target.value })}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <PageBuilderInput
            label="שם העסק / כותרת הלוגו"
            placeholder={brandCompanyName}
            value={config.logoText || ''}
            onChange={(e) => onChange({ logoText: e.target.value })}
          />
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 mt-5">
            <span className="text-xs font-bold text-white">הצג טקסט ליד הלוגו</span>
            <button
              type="button"
              onClick={() => onChange({ showLogoText: config.showLogoText === false ? true : false })}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                config.showLogoText !== false ? 'bg-indigo-600' : 'bg-slate-800'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  config.showLogoText !== false ? 'left-1' : 'right-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Menu Settings */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>סוג התפריט והניווט</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onChange({ menuMode: 'dynamic-tenant' })}
            className={clsx(
              'p-3 rounded-2xl border text-right transition-all flex flex-col gap-1',
              (config.menuMode || 'dynamic-tenant') === 'dynamic-tenant'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">תפריט דינמי</span>
              {(config.menuMode || 'dynamic-tenant') === 'dynamic-tenant' && (
                <Check className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </div>
            <span className="text-[10px] text-slate-400">קולקציית עמודי התוכן של ה-Tenant</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ menuMode: 'custom' })}
            className={clsx(
              'p-3 rounded-2xl border text-right transition-all flex flex-col gap-1',
              config.menuMode === 'custom'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">קישורים ידניים</span>
              {config.menuMode === 'custom' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <span className="text-[10px] text-slate-400">הגדרה אישית של קישורים וכפתורים</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ menuMode: 'none' })}
            className={clsx(
              'p-3 rounded-2xl border text-right transition-all flex flex-col gap-1',
              config.menuMode === 'none'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">ללא תפריט</span>
              {config.menuMode === 'none' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <span className="text-[10px] text-slate-400">הצגת לוגו וכפתורי פעולה בלבד</span>
          </button>
        </div>

        {/* Dynamic Tenant Info Notice */}
        {(config.menuMode || 'dynamic-tenant') === 'dynamic-tenant' && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>
              התפריט מושך ומציג באופן אוטומטי את כל עמודי התוכן המפורסמים של העסק שלך (כולל עמוד הבית).
            </span>
          </div>
        )}

        {/* Custom Links List Editor */}
        {config.menuMode === 'custom' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">רשימת קישורים</span>
              <button
                type="button"
                onClick={handleAddCustomLink}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף קישור</span>
              </button>
            </div>

            {(config.customLinks || []).map((link, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2"
              >
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateCustomLink(idx, 'label', e.target.value)}
                    placeholder="שם הקישור"
                    className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateCustomLink(idx, 'url', e.target.value)}
                    placeholder="#section או https://"
                    className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                    dir="ltr"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomLink(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition"
                  title="מחק קישור"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Action Buttons (Login, CTA, WhatsApp, Phone) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white">כפתורי פעולה והתחברות</h4>

        {/* Login Button */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogIn className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-xs font-bold text-white block">אייקון התחברות</span>
              <span className="text-[11px] text-slate-400">פותח חלון התחברות מהיר למערכת</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ showLoginButton: config.showLoginButton === false ? true : false })}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              config.showLoginButton !== false ? 'bg-indigo-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.showLoginButton !== false ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>

        {/* CTA Button */}
        <div className="space-y-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">כפתור הנעה לפעולה (CTA)</span>
              <span className="text-[11px] text-slate-400">כפתור בולט בראש התפריט</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ showCtaButton: config.showCtaButton === false ? true : false })}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                config.showCtaButton !== false ? 'bg-indigo-600' : 'bg-slate-800'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  config.showCtaButton !== false ? 'left-1' : 'right-1'
                )}
              />
            </button>
          </div>

          {config.showCtaButton !== false && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <PageBuilderInput
                label="טקסט הכפתור"
                placeholder="התחל עכשיו"
                value={config.ctaButtonText || ''}
                onChange={(e) => onChange({ ctaButtonText: e.target.value })}
              />
              <PageBuilderInput
                label="קישור הכפתור (URL / Anchor)"
                placeholder="#contact"
                value={config.ctaButtonUrl || ''}
                onChange={(e) => onChange({ ctaButtonUrl: e.target.value })}
                dir="ltr"
              />
            </div>
          )}
        </div>

        {/* WhatsApp & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>וואטסאפ בהדר</span>
              </span>
              <button
                type="button"
                onClick={() => onChange({ showWhatsApp: !config.showWhatsApp })}
                className={clsx(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                  config.showWhatsApp ? 'bg-emerald-600' : 'bg-slate-800'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    config.showWhatsApp ? 'left-1' : 'right-1'
                  )}
                />
              </button>
            </div>
            {config.showWhatsApp && (
              <input
                type="text"
                placeholder="050-0000000"
                value={config.whatsApp || ''}
                onChange={(e) => onChange({ whatsApp: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
                dir="ltr"
              />
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>טלפון בהדר</span>
              </span>
              <button
                type="button"
                onClick={() => onChange({ showPhone: !config.showPhone })}
                className={clsx(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                  config.showPhone ? 'bg-indigo-600' : 'bg-slate-800'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    config.showPhone ? 'left-1' : 'right-1'
                  )}
                />
              </button>
            </div>
            {config.showPhone && (
              <input
                type="text"
                placeholder="03-0000000"
                value={config.phone || ''}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                dir="ltr"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
