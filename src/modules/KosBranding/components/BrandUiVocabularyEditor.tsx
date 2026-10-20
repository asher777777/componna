import React, { useState, useMemo } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { generateBrandUiVocabulary, buildDefaultBrandUiVocabulary } from '../services/brandCopilotService';
import { BrandUiVocabulary } from '../types/brandDna';
import { syncAllTenantPagesWithBrandDna } from '../../KosWebAi/services/pageBrandSyncService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import {
  MousePointerClick,
  FormInput,
  Type,
  Sparkles,
  RotateCcw,
  Globe,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  Compass,
  FolderArchive,
} from 'lucide-react';

export const BrandUiVocabularyEditor: React.FC = () => {
  const { brandDna, updateUiVocabulary } = useBrandDna();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'buttons' | 'placeholders' | 'headings' | 'categories'>('buttons');
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  // Compute live vocabulary with fallback to gender-aware defaults for all nested objects
  const defaultVocab = useMemo(() => buildDefaultBrandUiVocabulary(brandDna), [brandDna]);
  const effectiveVocab: BrandUiVocabulary = useMemo(() => {
    const custom = brandDna.uiVocabulary || {};
    return {
      ...defaultVocab,
      ...custom,
      sectionHeadings: {
        ...defaultVocab.sectionHeadings,
        ...(custom.sectionHeadings || {}),
      },
      categoryTitles: {
        ...defaultVocab.categoryTitles,
        ...(custom.categoryTitles || {}),
      },
      categoryDescriptions: {
        ...defaultVocab.categoryDescriptions,
        ...(custom.categoryDescriptions || {}),
      },
      archiveSeoDescriptions: {
        ...defaultVocab.archiveSeoDescriptions,
        ...(custom.archiveSeoDescriptions || {}),
      },
    };
  }, [brandDna.uiVocabulary, defaultVocab]);
  const headings = effectiveVocab.sectionHeadings || {};

  const showNotice = (msg: string) => {
    setLastActionNotice(msg);
    setTimeout(() => setLastActionNotice(null), 3500);
  };

  const handleGenerateWithAi = async () => {
    setIsGenerating(true);
    try {
      const res = await generateBrandUiVocabulary(brandDna);
      if (res.success && res.vocabulary) {
        updateUiVocabulary(res.vocabulary);
        showNotice('✓ הופקה שפת ממשק מותאמת אישית מבוססת Brand DNA!');
      } else {
        showNotice('חלה שגיאה ביצירת התוכן. שוחזרו ברירות מחדל.');
      }
    } catch (err: any) {
      console.error('[BrandUiVocabularyEditor] AI generation failed:', err);
      showNotice('שגיאה בחיבור ל-AI.');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleBulkSyncAllPages = async () => {
    if (!window.confirm('האם לעדכן ולסנכרן את שפת הממשק, הכפתורים והכותרות לכל העמודים הקיימים באתר? (גרסת שחזור נשמרת אוטומטית לכל עמוד)')) {
      return;
    }
    setIsBulkSyncing(true);
    try {
      const res = await syncAllTenantPagesWithBrandDna(db, tenantId, brandDna);
      if (res.success) {
        if (res.totalPages === 0) {
          showNotice('לא נמצאו עמודים קיימים לטננט זה.');
        } else {
          showNotice(`✓ ${res.updatedCount} עמודים עודכנו וסונכרנו בהצלחה עם שפת הממשק!`);
        }
      } else {
        showNotice(res.error || 'שגיאה בסנכרון העמודים.');
      }
    } catch (err: any) {
      console.error('[BrandUiVocabularyEditor] Bulk sync failed:', err);
      showNotice('שגיאה בסנכרון העמודים.');
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleResetToDefault = () => {
    const defaults = buildDefaultBrandUiVocabulary(brandDna);
    updateUiVocabulary(defaults);
    showNotice('השדות אופסו לברירת המחדל המגדרית.');
  };

  const updateField = (field: keyof Omit<BrandUiVocabulary, 'sectionHeadings'>, value: string) => {
    updateUiVocabulary({ [field]: value });
  };

  const updateHeading = (headingKey: keyof NonNullable<BrandUiVocabulary['sectionHeadings']>, value: string) => {
    updateUiVocabulary({
      sectionHeadings: {
        ...headings,
        [headingKey]: value,
      },
    });
  };

  const updateCategoryTitle = (key: keyof NonNullable<BrandUiVocabulary['categoryTitles']>, value: string) => {
    updateUiVocabulary({
      categoryTitles: {
        ...(effectiveVocab.categoryTitles || {}),
        [key]: value,
      },
    });
  };

  const updateCategoryDescription = (key: keyof NonNullable<BrandUiVocabulary['categoryDescriptions']>, value: string) => {
    updateUiVocabulary({
      categoryDescriptions: {
        ...(effectiveVocab.categoryDescriptions || {}),
        [key]: value,
      },
    });
  };

  const updateArchiveSeoDescription = (key: keyof NonNullable<BrandUiVocabulary['archiveSeoDescriptions']>, value: string) => {
    updateUiVocabulary({
      archiveSeoDescriptions: {
        ...(effectiveVocab.archiveSeoDescriptions || {}),
        [key]: value,
      },
    });
  };

  const genderLabel =
    brandDna.voice?.genderAddressing === 'female'
      ? 'פנייה בלשון נקבה יחיד'
      : brandDna.voice?.genderAddressing === 'male'
      ? 'פנייה בלשון זכר יחיד'
      : 'פנייה בלשון רבים';

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-5">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">שפת ממשק ומיקרו-קופי (UI Vocabulary)</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {genderLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ניסוח הכפתורים, הפלייסהולדרים וכותרות האזורים – מסונכרנים אוטומטית לבונה העמודים ולכל התבניות
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleBulkSyncAllPages}
            disabled={isBulkSyncing}
            title="עדכן את שפת הממשק, הכפתורים והכותרות בכל העמודים שכבר נוצרו באתר"
            className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isBulkSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{isBulkSyncing ? 'מסנכרן עמודים...' : 'סנכרן לכל עמודי האתר'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            title="איפוס להגדרות ברירת מחדל מגדריות"
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">איפוס</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateWithAi}
            disabled={isGenerating}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-900/20 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                מייצר עם Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                דיוק ויצירת שפה עם AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {lastActionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{lastActionNotice}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-700/60 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('buttons')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'buttons'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>כפתורים והנעה לפעולה</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('placeholders')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'placeholders'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <FormInput className="w-3.5 h-3.5" />
          <span>פלייסהולדרים ושדות טופס</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('headings')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'headings'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>כותרות אזורי תוכן</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>ארכיון (עמודי ארכיון וקטגוריות)</span>
        </button>
      </div>

      {/* Tab 1: Buttons & CTAs */}
      {activeTab === 'buttons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>כפתור ראשי (Primary CTA)</span>
              <span className="text-[10px] text-slate-400">אזור Hero ומוצרי דגל</span>
            </label>
            <input
              type="text"
              value={effectiveVocab.primaryCta || ''}
              onChange={(e) => updateField('primaryCta', e.target.value)}
              placeholder="למשל: בואי נתחיל / לפרטים והצטרפות"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>כפתור משני (Secondary CTA)</span>
              <span className="text-[10px] text-slate-400">מידע נוסף / גלה עוד</span>
            </label>
            <input
              type="text"
              value={effectiveVocab.secondaryCta || ''}
              onChange={(e) => updateField('secondaryCta', e.target.value)}
              placeholder="למשל: לגלות עוד / מידע נוסף"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>כפתור WhatsApp</span>
              <span className="text-[10px] text-emerald-400">פנייה ישירה לשיחה</span>
            </label>
            <input
              type="text"
              value={effectiveVocab.whatsappCta || ''}
              onChange={(e) => updateField('whatsappCta', e.target.value)}
              placeholder="למשל: דברי איתנו ב-WhatsApp / שיחה מהירה"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>כפתור יצירת קשר (Contact CTA)</span>
              <span className="text-[10px] text-slate-400">באנרי סיום והנעה לפעולה</span>
            </label>
            <input
              type="text"
              value={effectiveVocab.contactCta || ''}
              onChange={(e) => updateField('contactCta', e.target.value)}
              placeholder="למשל: השאירי פרטים ונחזור אלייך / צרו קשר"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50 md:col-span-2">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>טקסט כפתור שליחת טופס (Form Submit)</span>
              <span className="text-[10px] text-indigo-400">בטפסי יצירת קשר ולידים</span>
            </label>
            <input
              type="text"
              value={effectiveVocab.formSubmitText || ''}
              onChange={(e) => updateField('formSubmitText', e.target.value)}
              placeholder="למשל: שליחת פנייה / שרייני מקום עכשיו"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Placeholders */}
      {activeTab === 'placeholders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200">פלייסהולדר שדה שם</label>
            <input
              type="text"
              value={effectiveVocab.namePlaceholder || ''}
              onChange={(e) => updateField('namePlaceholder', e.target.value)}
              placeholder="למשל: שמך המלא / שם מלא"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200">פלייסהולדר שדה טלפון</label>
            <input
              type="text"
              value={effectiveVocab.phonePlaceholder || ''}
              onChange={(e) => updateField('phonePlaceholder', e.target.value)}
              placeholder="למשל: מספר הטלפון שלך / טלפון נייד"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200">פלייסהולדר שדה אימייל</label>
            <input
              type="text"
              value={effectiveVocab.emailPlaceholder || ''}
              onChange={(e) => updateField('emailPlaceholder', e.target.value)}
              placeholder="למשל: כתובת האימייל שלך"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
            <label className="text-xs font-bold text-slate-200">פלייסהולדר שדה הודעה / פירוט</label>
            <input
              type="text"
              value={effectiveVocab.messagePlaceholder || ''}
              onChange={(e) => updateField('messagePlaceholder', e.target.value)}
              placeholder="למשל: ספרי לנו, במה נוכל לסייע לך? / תוכן ההודעה"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Section Headings */}
      {activeTab === 'headings' && (
        <div className="space-y-4">
          <p className="text-[11px] text-slate-400">
            כותרות וכותרות משנה שיוזרקו אוטומטית לאזורי האתר בעת הוספתם בדף, במקום כותרות גנריות:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hero */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור Hero (פתיח הדף)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.heroTitle || ''}
                  onChange={(e) => updateHeading('heroTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.heroSubtitle || ''}
                  onChange={(e) => updateHeading('heroSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">פסקת תיאור</label>
                <textarea
                  rows={2}
                  value={headings.heroDescription || ''}
                  onChange={(e) => updateHeading('heroDescription', e.target.value)}
                  placeholder="תיאור קצר ומזמין..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">תווית / באדג' הכרזה</label>
                <input
                  type="text"
                  value={headings.heroBadge || ''}
                  onChange={(e) => updateHeading('heroBadge', e.target.value)}
                  placeholder="למשל: מהדורה מיוחדת / ייעוץ מומחה"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* About */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור אודות (About)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.aboutHeading || ''}
                  onChange={(e) => updateHeading('aboutHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.aboutSubtitle || ''}
                  onChange={(e) => updateHeading('aboutSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Advantages */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור יתרונות / בידול (Features)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.advantagesHeading || ''}
                  onChange={(e) => updateHeading('advantagesHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.advantagesSubtitle || ''}
                  onChange={(e) => updateHeading('advantagesSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Pain Points */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור מענה לאתגרים / CTA</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.painPointsHeading || ''}
                  onChange={(e) => updateHeading('painPointsHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.painPointsSubtitle || ''}
                  onChange={(e) => updateHeading('painPointsSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Landing Section */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">דף נחיתה וטופס הרשמה (Landing Section)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.landingHeading || ''}
                  onChange={(e) => updateHeading('landingHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.landingSubtitle || ''}
                  onChange={(e) => updateHeading('landingSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור יצירת קשר (Contact)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.contactHeading || ''}
                  onChange={(e) => updateHeading('contactHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.contactSubtitle || ''}
                  onChange={(e) => updateHeading('contactSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור שאלות ותשובות (FAQ)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.faqHeading || ''}
                  onChange={(e) => updateHeading('faqHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.faqSubtitle || ''}
                  onChange={(e) => updateHeading('faqSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור המלצות ועדויות (Testimonials)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.testimonialsHeading || ''}
                  onChange={(e) => updateHeading('testimonialsHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.testimonialsSubtitle || ''}
                  onChange={(e) => updateHeading('testimonialsSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-indigo-400 block">אזור גלריה ומדיה (Gallery)</span>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת ראשית</label>
                <input
                  type="text"
                  value={headings.galleryHeading || ''}
                  onChange={(e) => updateHeading('galleryHeading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">כותרת משנה</label>
                <input
                  type="text"
                  value={headings.gallerySubtitle || ''}
                  onChange={(e) => updateHeading('gallerySubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Categories & Archives Titles and Descriptions */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            הגדרת תוכן ברירת המחדל הממותג עבור כל אחד מהארכיונים והקטגוריות (כותרת ממותגת, תיאור קצר ממוקד ותיאור ארוך עבור SEO).
            נתונים אלו מוזרקים אוטומטית לעמודי הארכיון ולאזור הקטגוריות, ומנוסחים בהתאם לשפת המותג ללא נתוני דמה.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'articles' as const, label: 'מאמרים ותוכן (KOSINFO)', slug: 'kosinfo' },
              { key: 'events' as const, label: 'כנסים ואירועים (KOSEVENT)', slug: 'kosevent' },
              { key: 'courses' as const, label: 'קורסים והכשרות (KOSCOURSE)', slug: 'koscourse' },
              { key: 'videos' as const, label: 'וידאו ושידורים (KOSVIDIO)', slug: 'kosvidio' },
              { key: 'community' as const, label: 'קהילות ומועדון (KOSCOMMUNITY)', slug: 'koscommunity' },
              { key: 'services' as const, label: 'שירותים ומוצרים (KOSASS)', slug: 'kosass' },
              { key: 'posts' as const, label: 'פוסטים ועדכונים (/p/)', slug: 'p' },
              { key: 'fundraising' as const, label: 'גיוס כספים (KOSFUNRISE)', slug: 'kosfunrise' },
              { key: 'checkout' as const, label: 'מרכז סליקה (KOSCHECKOUT)', slug: 'koscheckout' },
            ].map((cat) => (
              <div key={cat.key} className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/40">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">/{cat.slug}</span>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">כותרת ממותגת (שם הארכיון)</label>
                    <input
                      type="text"
                      value={effectiveVocab.categoryTitles?.[cat.key] || ''}
                      onChange={(e) => updateCategoryTitle(cat.key, e.target.value)}
                      placeholder="כותרת ממותגת..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">תיאור קצר וממוקד</label>
                    <input
                      type="text"
                      value={effectiveVocab.categoryDescriptions?.[cat.key] || ''}
                      onChange={(e) => updateCategoryDescription(cat.key, e.target.value)}
                      placeholder="תיאור קצר ומזמין..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">תיאור ארוך עבור SEO ו-Hero</label>
                    <textarea
                      rows={3}
                      value={effectiveVocab.archiveSeoDescriptions?.[cat.key] || ''}
                      onChange={(e) => updateArchiveSeoDescription(cat.key, e.target.value)}
                      placeholder="תיאור מעמיק וממותג לקידום אורגני והסבר על הארכיון..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
