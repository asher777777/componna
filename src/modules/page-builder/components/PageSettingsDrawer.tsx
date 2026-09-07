import React, { useState } from 'react';
import { GlobalPageSettings, SeoSettings } from '../types/pageBuilder.types';
import { PageBuilderInput, PageBuilderTextarea } from '../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../ui/PageBuilderButton';
import { X, Settings2, Palette, Globe, Sparkles, Layout, Phone } from 'lucide-react';
import { clsx } from 'clsx';

interface PageSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  globalSettings: GlobalPageSettings;
  onUpdateGlobalSettings: (updated: GlobalPageSettings) => void;
  seoSettings: SeoSettings;
  onUpdateSeoSettings: (updated: SeoSettings) => void;
}

export const PageSettingsDrawer: React.FC<PageSettingsDrawerProps> = ({
  isOpen,
  onClose,
  globalSettings,
  onUpdateGlobalSettings,
  seoSettings,
  onUpdateSeoSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'seo' | 'contact'>('general');
  const [isAiGeneratingSeo, setIsAiGeneratingSeo] = useState(false);

  if (!isOpen) return null;

  const updateGlobal = <K extends keyof GlobalPageSettings>(key: K, value: GlobalPageSettings[K]) => {
    onUpdateGlobalSettings({ ...globalSettings, [key]: value });
  };

  const updateSeo = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => {
    onUpdateSeoSettings({ ...seoSettings, [key]: value });
  };

  const handleGenerateAiSeo = () => {
    setIsAiGeneratingSeo(true);
    setTimeout(() => {
      const company = globalSettings.companyName || globalSettings.siteTitle || 'קהילה ופעילות';
      onUpdateSeoSettings({
        title: `${company} | האתר הרשמי - הצטרפות, תרומות ומידע`,
        description: `ברוכים הבאים לאתר הרשמי של ${company}. כאן תוכלו להתעדכן בפעילויות, שיעורים, קמפיינים וליצור קשר ישיר.`,
        keywords: ['קהילה', 'תרומות', 'אירועים', 'הדרכה', 'שירותים', company],
      });
      setIsAiGeneratingSeo(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0c0c0e] border-r border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">הגדרות עמוד ועיצוב גלובלי</h3>
              <p className="text-[11px] text-slate-400">מיתוג, צבעים, תפריטים ו-SEO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 p-2 bg-slate-950/80 border-b border-slate-800 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={clsx(
              'py-2 rounded-xl transition-all',
              activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            כללי ומיתוג
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={clsx(
              'py-2 rounded-xl transition-all',
              activeTab === 'design' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            צבעים וסגנון
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={clsx(
              'py-2 rounded-xl transition-all',
              activeTab === 'seo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            SEO ורשתות
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={clsx(
              'py-2 rounded-xl transition-all',
              activeTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            פרטי יצירת קשר
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 text-right">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-4">
              <PageBuilderInput
                label="שם האתר / ארגון"
                value={globalSettings.siteTitle || ''}
                onChange={(e) => updateGlobal('siteTitle', e.target.value)}
                placeholder="למשל: מרכז קהילתי אופק"
              />
              <PageBuilderInput
                label="שם החברה"
                value={globalSettings.companyName || ''}
                onChange={(e) => updateGlobal('companyName', e.target.value)}
                placeholder="למשל: עמותת אופק לפיתוח קהילתי"
              />
              <PageBuilderInput
                label="סלוגן / מוטו"
                value={globalSettings.slogan || ''}
                onChange={(e) => updateGlobal('slogan', e.target.value)}
                placeholder="למשל: מחברים לבבות, בונים עתיד"
              />
              <PageBuilderImageUpload
                label="לוגו האתר (URL)"
                value={globalSettings.siteLogoUrl}
                onChange={(url) => updateGlobal('siteLogoUrl', url)}
              />

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mt-2">
                <label className="text-xs font-semibold text-slate-300">הצג תפריט עליון (Header)</label>
                <input
                  type="checkbox"
                  checked={globalSettings.isHeaderVisible ?? true}
                  onChange={(e) => updateGlobal('isHeaderVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">תפריט עליון דביק (Sticky Header)</label>
                <input
                  type="checkbox"
                  checked={globalSettings.headerSticky ?? true}
                  onChange={(e) => updateGlobal('headerSticky', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">הצג פוטר תחתון (Footer)</label>
                <input
                  type="checkbox"
                  checked={globalSettings.isFooterVisible ?? true}
                  onChange={(e) => updateGlobal('isFooterVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="flex flex-col gap-4">
              <PageBuilderColorPicker
                label="צבע ראשי (Primary Color)"
                value={globalSettings.primaryColor || '#4f46e5'}
                onChange={(c) => updateGlobal('primaryColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע משני (Secondary Color)"
                value={globalSettings.secondaryColor || '#ec4899'}
                onChange={(c) => updateGlobal('secondaryColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כללי לדף"
                value={globalSettings.backgroundColor || '#0a0a0c'}
                onChange={(c) => updateGlobal('backgroundColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע טקסט ראשי"
                value={globalSettings.textColor || '#f8fafc'}
                onChange={(c) => updateGlobal('textColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע לכפתורים"
                value={globalSettings.buttonBgColor || '#4f46e5'}
                onChange={(c) => updateGlobal('buttonBgColor', c)}
              />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> מחולל SEO חכם עם AI
                  </span>
                  <PageBuilderButton
                    size="xs"
                    variant="gradient"
                    onClick={handleGenerateAiSeo}
                    disabled={isAiGeneratingSeo}
                  >
                    {isAiGeneratingSeo ? 'מייצר...' : 'צור אוטומטית'}
                  </PageBuilderButton>
                </div>
                <p className="text-[11px] text-slate-400">
                  בלחיצה אחת, ה-AI ייצור עבורכם כותרת מושכת, תיאור מטא ומילות מפתח מותאמות לגוגל.
                </p>
              </div>

              <PageBuilderInput
                label="כותרת SEO (Meta Title)"
                value={seoSettings.title || ''}
                onChange={(e) => updateSeo('title', e.target.value)}
                placeholder="כותרת שתופיע בתוצאות החיפוש בגוגל"
              />
              <PageBuilderTextarea
                label="תיאור מטא (Meta Description)"
                value={seoSettings.description || ''}
                onChange={(e) => updateSeo('description', e.target.value)}
                rows={3}
                placeholder="תיאור קצר ומזמין של הדף..."
              />
              <PageBuilderInput
                label="מילות מפתח (מופרדות בפסיקים)"
                value={(seoSettings.keywords || []).join(', ')}
                onChange={(e) =>
                  updateSeo(
                    'keywords',
                    e.target.value.split(',').map((k) => k.trim()).filter(Boolean)
                  )
                }
                placeholder="קהילה, תרומות, הרשמה..."
              />
              <PageBuilderImageUpload
                label="תמונת שיתוף חברתי (OG Image)"
                value={seoSettings.ogImage}
                onChange={(url) => updateSeo('ogImage', url)}
              />
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="flex flex-col gap-4">
              <PageBuilderInput
                label="מספר וואטסאפ ראשי"
                value={globalSettings.contactWhatsApp || ''}
                onChange={(e) => updateGlobal('contactWhatsApp', e.target.value)}
                placeholder="972545947701"
                dir="ltr"
              />
              <PageBuilderInput
                label="טלפון ליצירת קשר"
                value={globalSettings.contactPhone || ''}
                onChange={(e) => updateGlobal('contactPhone', e.target.value)}
                placeholder="03-1234567"
                dir="ltr"
              />
              <PageBuilderInput
                label="אימייל ארגון"
                value={globalSettings.contactEmail || ''}
                onChange={(e) => updateGlobal('contactEmail', e.target.value)}
                placeholder="info@example.com"
                dir="ltr"
              />
              <PageBuilderInput
                label="כתובת פיזית"
                value={globalSettings.address || ''}
                onChange={(e) => updateGlobal('address', e.target.value)}
                placeholder="רחוב הרצל 1, תל אביב"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <PageBuilderButton size="sm" variant="primary" onClick={onClose}>
            סגור הגדרות
          </PageBuilderButton>
        </div>
      </div>
    </div>
  );
};
