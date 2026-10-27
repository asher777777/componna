import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  HelpCircle,
  Megaphone,
  Globe,
  Loader2,
  Check,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { KosTubeFullscreenModal } from './KosTubeFullscreenModal';
import { KosTubeVideo } from '../types';
import { KosTubeAiGeneratedData } from '../../KosAi/modelsAiService';
import { normalizeKeyTakeaways } from '../api/functionsApi';
import { IconPickerPopover } from '../../../core/ui/BrandIconPicker';
import { TenantTokenBadge } from '../../../core/ai/components/TenantTokenBadge';
import { useTenantScope } from '../../../core/tenant';
import { useBrandDna } from '../../KosBranding/hooks/useBrandDna';
import { kosTubePromptGateway } from '../kosai/promptToKosai';

interface KosTubeContentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: KosTubeVideo;
  initialData: KosTubeAiGeneratedData;
  brandDna?: any;
  tenantId?: string;
  onSaveAndDeploy: (
    reviewedData: KosTubeAiGeneratedData
  ) => Promise<{ success: boolean; publicUrl?: string; error?: string }>;
}

export const KosTubeContentReviewModal: React.FC<KosTubeContentReviewModalProps> = ({
  isOpen,
  onClose,
  video,
  initialData,
  brandDna,
  tenantId: propTenantId,
  onSaveAndDeploy,
}) => {
  const { tenantId: scopeTenantId } = useTenantScope();
  let contextBrandDna: any = null;
  try {
    const brandCtx = useBrandDna();
    contextBrandDna = brandCtx?.brandDna;
  } catch {}
  const effectiveBrandDna = brandDna || contextBrandDna;
  const effectiveTenantId = propTenantId || scopeTenantId || effectiveBrandDna?.subdomain || '_master';

  const [activeTab, setActiveTab] = useState<'seo' | 'takeaways' | 'faqs' | 'cta'>('seo');
  const [isSaving, setIsSaving] = useState(false);
  const [savedPublicUrl, setSavedPublicUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Loading states
  const [isFillingMissing, setIsFillingMissing] = useState(false);
  const [isRewritingAll, setIsRewritingAll] = useState(false);
  const [activeAiField, setActiveAiField] = useState<string | null>(null);

  // Form states
  const [h1, setH1] = useState(initialData.h1 || video.title || '');
  const [slug, setSlug] = useState(
    initialData.slug
      ? initialData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : (video.youtubeVideoId || 'clip').toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  const [metaTitle, setMetaTitle] = useState(initialData.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData.metaDescription || '');
  const [tags, setTags] = useState<string[]>(initialData.tags || ['וידאו', 'יוטיוב', 'SEO']);
  const [newTagInput, setNewTagInput] = useState('');

  const [executiveSummary, setExecutiveSummary] = useState(initialData.executiveSummary || '');
  const [keyTakeaways, setKeyTakeaways] = useState<Array<{ title: string; text: string; icon?: string }>>(() => {
    return normalizeKeyTakeaways(initialData.keyTakeaways, effectiveBrandDna?.identity?.companyName || initialData.metaTitle || 'קושאן');
  });

  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    initialData.faqs && initialData.faqs.length > 0
      ? initialData.faqs
      : [
          { question: 'מהי התובנה המרכזית מהסרטון?', answer: 'תשובה מפורטת על התובנה.' },
          { question: 'כיצד ניתן ליישם את הידע בפועל?', answer: 'שלבי עבודה מוגדרים ליישום.' },
        ]
  );

  const [ctaTitle, setCtaTitle] = useState(initialData.callToAction?.title || 'רוצים להעמיק בנושא?');
  const [ctaSubtitle, setCtaSubtitle] = useState(
    initialData.callToAction?.subtitle || 'פנו אלינו ונשמח ללוות אתכם באופן אישי ומקצועי'
  );
  const [ctaButtonText, setCtaButtonText] = useState(
    initialData.callToAction?.buttonText || 'צרו קשר עכשיו'
  );

  if (!isOpen) return null;

  const isWorking = isSaving || isFillingMissing || isRewritingAll || !!activeAiField;

  // --- AI Actions ---

  /**
   * השלמת שדות חסרים ב-AI מבלי לדרוס שדות קיימים שהמשתמש כבר הזין
   */
  const handleFillMissing = async () => {
    setIsFillingMissing(true);
    setErrorMessage(null);
    try {
      const currentData: Partial<KosTubeAiGeneratedData> = {
        h1,
        metaTitle,
        metaDescription,
        executiveSummary,
        keyTakeaways,
        faqs,
        callToAction: {
          title: ctaTitle,
          subtitle: ctaSubtitle,
          buttonText: ctaButtonText,
          buttonLink: '#sec-cta',
        },
      };

      const res = await kosTubePromptGateway.fillMissingContent({
        video,
        channelTitle: video.title,
        currentData,
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
      });

      if (res.success && res.data) {
        const patch = res.data;
        if (patch.h1 && !h1.trim()) setH1(patch.h1);
        if (patch.metaTitle && !metaTitle.trim()) setMetaTitle(patch.metaTitle);
        if (patch.metaDescription && !metaDescription.trim()) setMetaDescription(patch.metaDescription);
        if (patch.executiveSummary && !executiveSummary.trim()) setExecutiveSummary(patch.executiveSummary);
        if (patch.keyTakeaways && Array.isArray(patch.keyTakeaways) && keyTakeaways.length < 4) {
          const normalized = normalizeKeyTakeaways(patch.keyTakeaways, effectiveBrandDna?.identity?.companyName || 'קושאן');
          setKeyTakeaways([...keyTakeaways, ...normalized.slice(keyTakeaways.length)]);
        }
        if (patch.faqs && Array.isArray(patch.faqs) && faqs.length < 5) {
          setFaqs([...faqs, ...patch.faqs.slice(faqs.length)]);
        }
        if (patch.callToAction) {
          if (!ctaTitle.trim()) setCtaTitle(patch.callToAction.title || 'רוצים להעמיק בנושא?');
          if (!ctaSubtitle.trim()) setCtaSubtitle(patch.callToAction.subtitle || '');
          if (!ctaButtonText.trim()) setCtaButtonText(patch.callToAction.buttonText || 'צרו קשר עכשיו');
        }
      } else {
        setErrorMessage(res.error || 'לא אותרו שדות חסרים או שאירעה שגיאה בביצוע');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'שגיאה בהשלמת שדות חסרים');
    } finally {
      setIsFillingMissing(false);
    }
  };

  /**
   * שכתוב מלא של כל התוכן מחדש לפי סגנון המותג
   */
  const handleRewriteAll = async () => {
    if (!window.confirm('האם לשכתב את כל התכנים מחדש ב-AI בהתאם למיתוג הטננט? פעולה זו תחליף את הטקסטים בטופס.')) {
      return;
    }
    setIsRewritingAll(true);
    setErrorMessage(null);
    try {
      const res = await kosTubePromptGateway.generateVideoSeo({
        video,
        channelTitle: video.title,
        brandDna: effectiveBrandDna,
        options: {
          tenantId: effectiveTenantId,
          skipCache: true,
        },
      });

      if (res.success && res.data) {
        const d = res.data;
        if (d.h1) setH1(d.h1);
        if (d.metaTitle) setMetaTitle(d.metaTitle);
        if (d.metaDescription) setMetaDescription(d.metaDescription);
        if (d.executiveSummary) setExecutiveSummary(d.executiveSummary);
        if (d.keyTakeaways) {
          setKeyTakeaways(normalizeKeyTakeaways(d.keyTakeaways, effectiveBrandDna?.identity?.companyName || 'קושאן'));
        }
        if (d.faqs && d.faqs.length > 0) setFaqs(d.faqs);
        if (d.callToAction) {
          setCtaTitle(d.callToAction.title || 'רוצים להעמיק בנושא?');
          setCtaSubtitle(d.callToAction.subtitle || '');
          setCtaButtonText(d.callToAction.buttonText || 'צרו קשר עכשיו');
        }
      } else {
        setErrorMessage(res.error || 'שגיאה בשכתוב הכללי של התוכן');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'שגיאה בלתי צפויה בשכתוב');
    } finally {
      setIsRewritingAll(false);
    }
  };

  /**
   * שכתוב כותרת ראשית (H1)
   */
  const handleRewriteH1 = async () => {
    setActiveAiField('h1');
    try {
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'h1',
        videoTitle: video.title,
        currentValue: h1,
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
      });
      if (res.success && res.data) {
        setH1(String(res.data).trim().replace(/^["']|["']$/g, ''));
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה בשכתוב כותרת');
    } finally {
      setActiveAiField(null);
    }
  };

  /**
   * שכתוב תמצית מנהלים
   */
  const handleRewriteSummary = async () => {
    setActiveAiField('summary');
    try {
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'executiveSummary',
        videoTitle: video.title,
        currentValue: executiveSummary,
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
      });
      if (res.success && res.data) {
        setExecutiveSummary(String(res.data).trim().replace(/^["']|["']$/g, ''));
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה בשכתוב תמצית מנהלים');
    } finally {
      setActiveAiField(null);
    }
  };

  /**
   * שכתוב מטא SEO (Title + Description)
   */
  const handleRewriteMeta = async () => {
    setActiveAiField('meta');
    try {
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'meta',
        videoTitle: video.title,
        currentValue: { metaTitle, metaDescription },
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
      });
      if (res.success && res.data) {
        if (res.data.metaTitle) setMetaTitle(res.data.metaTitle);
        if (res.data.metaDescription) setMetaDescription(res.data.metaDescription);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה בשכתוב מטא');
    } finally {
      setActiveAiField(null);
    }
  };

  /**
   * שכתוב תובנת מפתח בודדת
   */
  const handleRewriteTakeaway = async (idx: number) => {
    setActiveAiField(`takeaway_${idx}`);
    try {
      const current = keyTakeaways[idx];
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'takeaway',
        videoTitle: video.title,
        currentValue: current,
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
      });
      if (res.success && res.data) {
        const item = res.data;
        const updated = [...keyTakeaways];
        updated[idx] = {
          title: item.title || current.title,
          text: item.text || current.text,
          icon: item.icon || current.icon || 'Sparkles',
        };
        setKeyTakeaways(updated);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה בשכתוב תובנה');
    } finally {
      setActiveAiField(null);
    }
  };

  /**
   * הוספת תובנה חדשה ומקורית באמצעות AI
   */
  const handleAddAiTakeaway = async () => {
    setActiveAiField('add_takeaway');
    try {
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'takeaway',
        videoTitle: video.title,
        currentValue: null,
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
        instructions: 'צור תובנה חדשה, מסקרנת ומקורית שלא הופיעה קודם, עם כותרת סוחפת ופירוט מעשי',
      });
      if (res.success && res.data) {
        const item = res.data;
        setKeyTakeaways([
          ...keyTakeaways,
          {
            title: item.title || 'עיקרון מנחה חדש',
            text: item.text || 'הסבר מעשי על התובנה',
            icon: item.icon || 'Sparkles',
          },
        ]);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה ביצירת תובנה חדשה');
    } finally {
      setActiveAiField(null);
    }
  };

  /**
   * שכתוב שאלת FAQ בודדת
   */
  const handleRewriteFaq = async (idx: number) => {
    setActiveAiField(`faq_${idx}`);
    try {
      const current = faqs[idx];
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'faq',
        videoTitle: video.title,
        currentValue: current,
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
      });
      if (res.success && res.data) {
        const item = res.data;
        const updated = [...faqs];
        updated[idx] = {
          question: item.question || current.question,
          answer: item.answer || current.answer,
        };
        setFaqs(updated);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה בשכתוב שאלה ותשובה');
    } finally {
      setActiveAiField(null);
    }
  };

  /**
   * יצירת שאלה ותשובה חדשה ב-AI
   */
  const handleAddAiFaq = async () => {
    setActiveAiField('add_faq');
    try {
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'faq',
        videoTitle: video.title,
        currentValue: null,
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
        instructions: 'צור שאלה ותשובה נפוצה ומסקרנת חדשה בנושא הסרטון',
      });
      if (res.success && res.data) {
        const item = res.data;
        setFaqs([
          ...faqs,
          {
            question: item.question || 'שאלה חדשה?',
            answer: item.answer || 'תשובה מקיפה וממוקדת.',
          },
        ]);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה ביצירת שאלה חדשה');
    } finally {
      setActiveAiField(null);
    }
  };

  /**
   * שכתוב אזור הנעה לפעולה (CTA)
   */
  const handleRewriteCta = async () => {
    setActiveAiField('cta');
    try {
      const res = await kosTubePromptGateway.rewriteContent({
        target: 'cta',
        videoTitle: video.title,
        currentValue: { title: ctaTitle, subtitle: ctaSubtitle, buttonText: ctaButtonText },
        brandDna: effectiveBrandDna,
        tenantId: effectiveTenantId,
      });
      if (res.success && res.data) {
        const item = res.data;
        if (item.title) setCtaTitle(item.title);
        if (item.subtitle) setCtaSubtitle(item.subtitle);
        if (item.buttonText) setCtaButtonText(item.buttonText);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'שגיאה בשכתוב הנעה לפעולה');
    } finally {
      setActiveAiField(null);
    }
  };

  // --- Handlers ---

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleUpdateTakeaway = (idx: number, field: 'title' | 'text' | 'icon', val: string) => {
    const updated = [...keyTakeaways];
    updated[idx] = { ...updated[idx], [field]: val };
    setKeyTakeaways(updated);
  };

  const handleAddTakeaway = () => {
    setKeyTakeaways([
      ...keyTakeaways,
      { title: 'עיקרון מנחה חדש', text: 'הסבר תמציתי ומעשי על התובנה מהסרטון', icon: 'Lightbulb' },
    ]);
  };

  const handleRemoveTakeaway = (idx: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== idx));
  };

  const handleUpdateFaq = (idx: number, field: 'question' | 'answer', val: string) => {
    const updated = [...faqs];
    updated[idx] = { ...updated[idx], [field]: val };
    setFaqs(updated);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: 'שאלה חדשה?', answer: 'תשובה מקיפה וממוקדת.' }]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleSaveAndDeploy = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const cleanSlug =
        slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'video';

      const reviewedData: KosTubeAiGeneratedData = {
        metaTitle,
        metaDescription,
        slug: cleanSlug,
        focusKeywords: initialData.focusKeywords || [],
        tags,
        h1,
        executiveSummary,
        keyTakeaways,
        articleContent: '',
        faqs,
        callToAction: {
          title: ctaTitle,
          subtitle: ctaSubtitle,
          buttonText: ctaButtonText,
          buttonLink: '#sec-cta',
        },
      };

      const res = await onSaveAndDeploy(reviewedData);
      if (res.success && res.publicUrl) {
        setSavedPublicUrl(res.publicUrl);
      } else {
        setErrorMessage(res.error || 'שגיאה בפריסת העמוד ב-KWB');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'שגיאה בלתי צפויה בשמירה');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPublicLink = () => {
    if (!savedPublicUrl) return;
    const full = `${window.location.origin}${savedPublicUrl}`;
    navigator.clipboard.writeText(full);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <KosTubeFullscreenModal
      isOpen={isOpen}
      onClose={onClose}
      title="סקירת תוכן, עריכה ושכתוב AI לפני פריסה ב-KWB"
      subtitle="התאם אייקונים, שכתב תכנים ב-AI והשלם טקסטים חסרים לפני הפצת עמוד ה-KOSVIDIO לאוויר"
    >
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans" dir="rtl">
        {/* Video Header Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-24 sm:w-28 aspect-video rounded-xl object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">סרטון מקור</span>
            <h4 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">{video.title}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{video.viewCount?.toLocaleString('he-IL') || '0'} צפיות</span>
              <span>•</span>
              <span>{video.likeCount?.toLocaleString('he-IL') || '0'} לייקים</span>
              <span>•</span>
              <span>סלאג יעד: /kosvidio/{slug || 'video'}</span>
            </div>
          </div>
        </div>

        {/* Global AI Action Bar & Live Tenant Token Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFillMissing}
              disabled={isWorking}
              title="סורק את כל השדות וממלא אוטומטית ב-AI רק את מה שחסר, מבלי לדרוס עריכות קיימות"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              {isFillingMissing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>השלם טקסטים חסרים ב-AI</span>
            </button>

            <button
              type="button"
              onClick={handleRewriteAll}
              disabled={isWorking}
              title="משכתב מחדש את כל התכנים בהתאמה מלאה לשפת המותג והסלוגן של הטננט"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              {isRewritingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>שכתב הכל מחדש (AI)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
            <span className="text-[11px] text-slate-400">מונה טוקנים לטננט:</span>
            <TenantTokenBadge compact={true} />
          </div>
        </div>

        {/* Success Banner if already saved */}
        {savedPublicUrl && (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>עמוד ה-KOSVIDIO נוצר ונפרס בהצלחה ב-KWB!</span>
            </div>
            <p className="text-xs text-slate-300">העמוד זמין כעת לצפייה ציבורית בנתיב המותאם:</p>
            <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-emerald-300 flex-1 truncate" dir="ltr">
                {window.location.origin}
                {savedPublicUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'הועתק!' : 'העתק'}</span>
              </button>
              <a
                href={savedPublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>פתח עמוד</span>
              </a>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 pb-2 gap-2 overflow-x-auto text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. כותרת ו-SEO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('takeaways')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'takeaways'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. תמצית ותובנות ({keyTakeaways.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>3. שאלות ותשובות ({faqs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cta')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'cta'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>4. הנעה לפעולה (CTA)</span>
          </button>
        </div>

        {/* Tab 1: SEO & Titles */}
        {activeTab === 'seo' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">כותרת ראשית (H1)</label>
                <button
                  type="button"
                  onClick={handleRewriteH1}
                  disabled={isWorking}
                  title="שכתב כותרת ראשית ב-AI לפי שפת המותג"
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  {activeAiField === 'h1' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>שכתב כותרת ב-AI</span>
                </button>
              </div>
              <input
                type="text"
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                סלאג באנגלית (Slug - יוצג בכתובת /kosvidio/{slug})
              </label>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-slate-400 font-mono bg-slate-800/80 px-3 py-2.5 rounded-xl border border-slate-700/60"
                  dir="ltr"
                >
                  /kosvidio/
                </span>
                <input
                  type="text"
                  dir="ltr"
                  value={slug}
                  placeholder="e.g. struggles-self-control-tanya"
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-emerald-400 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                אותיות קטנות באנגלית ומקפים בלבד. אין צורך בקידומת /p/ או kosvidio.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  כותרת מטא ל-SEO (Meta Title - מומלץ 50-60 תווים)
                </label>
                <button
                  type="button"
                  onClick={handleRewriteMeta}
                  disabled={isWorking}
                  title="שכתב כותרת ותיאור מטא ל-SEO באמצעות AI"
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  {activeAiField === 'meta' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>שכתב מטא ב-AI</span>
                </button>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
              <div className="text-[10px] text-slate-500 text-left mt-0.5">{metaTitle.length} תווים</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                תיאור מטא (Meta Description - מומלץ 140-160 תווים)
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
              />
              <div className="text-[10px] text-slate-500 text-left mt-0.5">{metaDescription.length} תווים</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">תגיות ונושאים (Tags)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="הוסף תגית..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  הוסף
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md text-xs"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Executive Summary & Key Takeaways */}
        {activeTab === 'takeaways' && (
          <div className="space-y-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  תמצית מנהלים (על הסרטון בכמה מילים - 2-3 משפטים)
                </label>
                <button
                  type="button"
                  onClick={handleRewriteSummary}
                  disabled={isWorking}
                  title="שכתב תמצית מנהלים ב-AI בשפת המותג"
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  {activeAiField === 'summary' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>שכתב תמצית ב-AI</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white resize-none leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    כרטיסי תובנות מפתח מהוידאו (Key Takeaways עם בחירת אייקון וכותרת מותאמת)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    בחר אייקון מהספרייה (כמו במודל השירותים) וערוך או שכתב כל כרטיס ב-AI
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddAiTakeaway}
                    disabled={isWorking}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    {activeAiField === 'add_takeaway' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>צור תובנה ב-AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTakeaway}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף ידנית</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {keyTakeaways.map((point, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>

                        {/* Icon Picker Popover matching KosBranding services model */}
                        <IconPickerPopover
                          value={point.icon || 'Sparkles'}
                          onChange={(iconName) => handleUpdateTakeaway(idx, 'icon', iconName)}
                          size="sm"
                          title="בחר אייקון לתובנה"
                        />

                        <input
                          type="text"
                          value={point.title}
                          onChange={(e) => handleUpdateTakeaway(idx, 'title', e.target.value)}
                          placeholder="כותרת סוחפת לתובנה (לפי שפת המותג)"
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRewriteTakeaway(idx)}
                          disabled={isWorking}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="שכתב תובנה זו ב-AI"
                        >
                          {activeAiField === `takeaway_${idx}` ? (
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTakeaway(idx)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="מחק תובנה"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={point.text}
                      onChange={(e) => handleUpdateTakeaway(idx, 'text', e.target.value)}
                      placeholder="הסבר מעשי ותמציתי של התובנה..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: FAQs */}
        {activeTab === 'faqs' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">שאלות ותשובות (מוזרקות לאזור ה-FAQ הייעודי ב-KWB)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  כל שאלה מקבלת אקורדיון אינטראקטיבי וחיפוש דינמי
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddAiFaq}
                  disabled={isWorking}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {activeAiField === 'add_faq' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>צור שאלה ב-AI</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף ידנית</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400">שאלה #{idx + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRewriteFaq(idx)}
                        disabled={isWorking}
                        className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="שכתב שאלה ותשובה זו ב-AI"
                      >
                        {activeAiField === `faq_${idx}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="מחק שאלה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={faq.question}
                    placeholder="הזן שאלה..."
                    onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    placeholder="הזן תשובה מפורטת..."
                    onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 resize-none focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Call to Action */}
        {activeTab === 'cta' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">אזור הנעה לפעולה (CTA Section ב-KWB)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  משתמש באזור ה-CTA המקורי של KWB עם אפקט Banner Glow וטופס לידים
                </p>
              </div>
              <button
                type="button"
                onClick={handleRewriteCta}
                disabled={isWorking}
                title="שכתב את כל רכיבי ה-CTA ב-AI לפי המותג"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold cursor-pointer"
              >
                {activeAiField === 'cta' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>שכתב CTA ב-AI</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">כותרת ה-CTA</label>
              <input
                type="text"
                value={ctaTitle}
                onChange={(e) => setCtaTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">תת-כותרת / תיאור</label>
              <textarea
                rows={2}
                value={ctaSubtitle}
                onChange={(e) => setCtaSubtitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">טקסט כפתור הנעה לפעולה</label>
              <input
                type="text"
                value={ctaButtonText}
                onChange={(e) => setCtaButtonText(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {savedPublicUrl ? 'סיום וסגירה' : 'ביטול'}
          </button>

          <button
            type="button"
            onClick={handleSaveAndDeploy}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{savedPublicUrl ? 'עדכן ופרוס מחדש ב-KWB' : 'שמור, פרוס והפעל ב-KWB'}</span>
          </button>
        </div>
      </div>
    </KosTubeFullscreenModal>
  );
};
