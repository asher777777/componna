import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Loader2,
  FileText,
  Wand2,
  Code2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  ArrowRight,
  Save,
  Image as ImageIcon,
  Cloud,
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract, BrandDnaContract } from '../../../core/contracts';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { EventPosterSectionConfig } from '../types/sectionConfigs';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { SmartFormDefinition } from '../../KosForms/types';
import { saveSmartForm } from '../../KosForms/services/formStorageService';
import { DEFAULT_FORMS_COLLECTION } from '../../KosForms/config/constants';
import {
  CustomHtmlLandingPage,
  FlyerLandingReport,
  checkSlugAvailability,
  generateEventPosterAndFormWithKosai,
  generateLandingReportFromFlyer,
  sanitizeLandingSlug,
  saveCustomHtmlLandingPage,
} from '../services/customHtmlLandingService';
import { EventPosterSection } from '../sections/eventPoster/EventPosterSection';
import { EventPosterEditor } from '../sections/eventPoster/EventPosterEditor';

export interface FlyerToHtmlLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  kosWebPages: PageBuilderConfig[];
  customLandingPages: CustomHtmlLandingPage[];
  editingPage?: CustomHtmlLandingPage | null;
  companyName: string;
  onSaved: (saved: CustomHtmlLandingPage) => void;
}

type Stage = 'upload' | 'report' | 'preview';

export const FlyerToHtmlLandingModal: React.FC<FlyerToHtmlLandingModalProps> = ({
  isOpen,
  onClose,
  kosWebPages,
  customLandingPages,
  editingPage,
  companyName,
  onSaved,
}) => {
  const { db } = useSystemConnection();
  const { tenantId, getScopedCollectionPath } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const brandDnaContract = getCapability<BrandDnaContract>('brand-dna');

  const [stage, setStage] = useState<Stage>('upload');
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerCloudUrl, setFlyerCloudUrl] = useState<string | undefined>(undefined);
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | undefined>(undefined);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [initialInstructions, setInitialInstructions] = useState<string>('');
  const [report, setReport] = useState<FlyerLandingReport | null>(null);
  const [refinements, setRefinements] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [posterConfig, setPosterConfig] = useState<EventPosterSectionConfig | null>(null);
  const [generatedForm, setGeneratedForm] = useState<SmartFormDefinition | null>(null);
  const [previewTab, setPreviewTab] = useState<'live' | 'editor'>('live');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [busyLabel, setBusyLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [savedPage, setSavedPage] = useState<CustomHtmlLandingPage | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSavedPage(null);
    if (editingPage) {
      setReport(editingPage.report || null);
      setSlug(editingPage.slug);
      setFlyerPreviewUrl(editingPage.flyerPreviewUrl);
      setFlyerCloudUrl(editingPage.flyerPreviewUrl);
      setHeroImageUrl(editingPage.heroImageUrl || editingPage.report?.heroImageUrl || '');
      setPosterConfig(null);
      setStage('report');
    } else {
      setStage('upload');
      setFlyerFile(null);
      setFlyerCloudUrl(undefined);
      setFlyerPreviewUrl(undefined);
      setHeroImageUrl('');
      setInitialInstructions('');
      setReport(null);
      setRefinements('');
      setSlug('');
      setPosterConfig(null);
      setGeneratedForm(null);
    }
  }, [isOpen, editingPage]);

  const slugCheck = useMemo(
    () => checkSlugAvailability(slug, kosWebPages, customLandingPages, editingPage?.id),
    [slug, kosWebPages, customLandingPages, editingPage?.id]
  );

  if (!isOpen) return null;

  const handleFilePick = (file: File | null) => {
    if (!file) return;
    setFlyerFile(file);
    setFlyerCloudUrl(undefined);
    setError(null);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFlyerPreviewUrl(url);
    } else {
      setFlyerPreviewUrl(undefined);
    }
  };

  const handlePickFlyerFromCloudStore = async () => {
    setError(null);
    if (!mediaPicker?.openPicker) {
      setError('מודל KOSCLOUD אינו זמין כרגע — ניתן להעלות קובץ מקומי למטה');
      return;
    }
    try {
      const picked = await mediaPicker.openPicker({
        multiple: false,
        initialTab: 'gallery',
      });
      const selectedUrl = Array.isArray(picked) ? picked[0] : picked;
      if (selectedUrl) {
        setFlyerFile(null);
        setFlyerCloudUrl(selectedUrl);
        setFlyerPreviewUrl(selectedUrl);
        if (!heroImageUrl && !selectedUrl.toLowerCase().includes('.pdf')) {
          setHeroImageUrl(selectedUrl);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'לא הצלחנו לפתוח את KOSCLOUD');
    }
  };

  const applyHeroUrlToHtml = (rawHtml: string, nextUrl: string): string => {
    if (!rawHtml || !nextUrl) return rawHtml;
    const imgRegex = /(<img\b[^>]*class=["'][^"']*kosun-hero-image[^"']*["'][^>]*\bsrc=["'])([^"']*)(["'][^>]*>)/i;
    if (imgRegex.test(rawHtml)) {
      return rawHtml.replace(imgRegex, `$1${nextUrl}$3`);
    }
    const heroImgBlock = `<div style="max-width:960px;margin:0 auto 24px auto;padding:0 16px;"><img class="kosun-hero-image" src="${nextUrl}" alt="${report?.title || 'Hero'}" style="width:100%;max-height:460px;object-fit:cover;border-radius:20px;box-shadow:0 18px 40px rgba(0,0,0,0.35);display:block;" /></div>`;
    const rootOpenRegex = /(<div\b[^>]*class=["'][^"']*lp-root[^"']*["'][^>]*>)/i;
    if (rootOpenRegex.test(rawHtml)) {
      return rawHtml.replace(rootOpenRegex, `$1\n${heroImgBlock}`);
    }
    return `${heroImgBlock}\n${rawHtml}`;
  };

  const handlePickHeroFromCloudStore = async () => {
    setError(null);
    if (!mediaPicker?.openPicker) {
      setError('מודל KOSCLOUD אינו זמין כרגע');
      return;
    }
    try {
      const picked = await mediaPicker.openPicker({
        accept: 'image/*',
        multiple: false,
        initialTab: 'gallery',
      });
      const selectedUrl = Array.isArray(picked) ? picked[0] : picked;
      if (selectedUrl) {
        setHeroImageUrl(selectedUrl);
        if (report) {
          setReport({ ...report, heroImageUrl: selectedUrl });
        }
        if (stage === 'preview' && posterConfig) {
          setPosterConfig({ ...posterConfig, venueImageUrl: selectedUrl });
        }
      }
    } catch (err: any) {
      setError(err?.message || 'לא הצלחנו לפתוח את KOSCLOUD');
    }
  };

  const handleGenerateReport = async () => {
    if (!flyerFile && !flyerCloudUrl && !initialInstructions.trim()) {
      setError('נא לבחור פלייר מ-KOSCLOUD, להעלות קובץ או להזין הנחיות כדי להתחיל');
      return;
    }
    setIsBusy(true);
    setBusyLabel('מנתח את הפלייר וההנחיות ומפיק דוח אפיון לעריכה...');
    setError(null);
    try {
      const existingSlugs = kosWebPages.map((p) => p.slug).filter(Boolean);
      const res = await generateLandingReportFromFlyer({
        file: flyerFile,
        flyerUrl: flyerCloudUrl,
        instructions: initialInstructions,
        companyName,
        existingKosWebSlugs: existingSlugs,
        tenantId,
      });
      setReport(res.report);
      if (res.previewImageDataUrl) setFlyerPreviewUrl(res.previewImageDataUrl);
      const check = checkSlugAvailability(
        res.report.suggestedSlug || res.report.title,
        kosWebPages,
        customLandingPages
      );
      setSlug(check.available ? sanitizeLandingSlug(res.report.suggestedSlug) : check.suggestedSlug);
      setStage('report');
    } catch (err: any) {
      setError(err?.message || 'שגיאה בהפקת הדוח מהפלייר');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendToKosai = async (isIteration = false) => {
    if (!report) return;
    setIsBusy(true);
    setBusyLabel(
      isIteration
        ? 'KOSAI מעדכן את אזור הפוסטר והטופס לפי הדיוקים שלך...'
        : 'KOSAI בונה את תבנית הפוסטר (EventPoster) + הטופס החכם...'
    );
    setError(null);
    try {
      const finalSlug = slugCheck.available ? sanitizeLandingSlug(slug) : slugCheck.suggestedSlug;
      setSlug(finalSlug);

      const brandLogo = brandDnaContract?.getBrandDna?.()?.identity?.logoUrl || '';
      const out = await generateEventPosterAndFormWithKosai({
        report,
        refinements,
        currentPosterConfig: isIteration ? posterConfig : null,
        heroImageUrl: heroImageUrl || report.heroImageUrl,
        logoUrl: brandLogo,
        companyName,
        slug: finalSlug,
        tenantId,
      });
      setPosterConfig(out.posterConfig);
      setGeneratedForm(out.form);
      setRefinements('');
      setStage('preview');
      setPreviewTab('live');
    } catch (err: any) {
      setError(err?.message || 'שגיאה ביצירת התבנית ב-KOSAI');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePublishAndSave = async () => {
    if (!posterConfig) {
      setError('אין תבנית פוסטר לשמירה');
      return;
    }
    if (!slugCheck.available) {
      setError(slugCheck.reason || 'הסלאג כבר תפוס — בחר סלאג אחר');
      return;
    }
    setIsBusy(true);
    setBusyLabel('שומר את הטופס החכם ואת דף ה-EventPoster ב-KOSWEB...');
    setError(null);
    try {
      let formId = posterConfig.formId || editingPage?.formId || '';
      let formTitle = generatedForm?.title || editingPage?.formTitle || posterConfig.formTitle || '';

      if (generatedForm) {
        const formsCollection = getScopedCollectionPath(DEFAULT_FORMS_COLLECTION);
        formId = await saveSmartForm(generatedForm, db, formsCollection);
        formTitle = generatedForm.title;
      }

      const finalPoster: EventPosterSectionConfig = {
        ...posterConfig,
        formId,
        showEmbeddedForm: false,
      };
      setPosterConfig(finalPoster);

      const cleanSlug = sanitizeLandingSlug(slug);
      const now = new Date().toISOString();
      const pageId = `page_${Date.now()}`;
      const smartFormSectionId = `sec_smartForm_${Date.now()}`;

      const smartFormSection = {
        id: smartFormSectionId,
        type: 'smartForm',
        visible: true,
        formId,
        sectionTitle: finalPoster.formTitle || formTitle || 'שמירת מקום והרשמה',
        sectionSubtitle: finalPoster.formSubtitle || '',
        submitButtonText: finalPoster.submitButtonText || 'שליחה והרשמה',
        containerWidth: 'md',
        backgroundColor: finalPoster.semanticStyle?.surfaceColor || '#fdf9ef',
      };

      // Save as a real KosWebAi PageBuilderConfig containing two sections: EventPoster + SmartForm
      const pageConfig: PageBuilderConfig = {
        pageId,
        slug: cleanSlug,
        pageTitle: finalPoster.headline || report?.title || 'דף אירוע מפלייר',
        published: true,
        isHomePage: false,
        sectionOrder: [finalPoster.id, smartFormSectionId],
        sections: {
          [finalPoster.id]: finalPoster as any,
          [smartFormSectionId]: smartFormSection as any,
        },
        globalSettings: {
          siteTitle: companyName,
          siteLogoUrl: finalPoster.logoUrl || '',
          primaryColor: finalPoster.semanticStyle?.primaryColor || '#0f5c66',
          backgroundColor: finalPoster.semanticStyle?.surfaceColor || '#fdf9ef',
          textColor: finalPoster.semanticStyle?.textColor || '#0d3b42',
          fontFamily: 'Heebo',
        },
        seoSettings: {
          title: finalPoster.headline || report?.title || companyName,
          description: finalPoster.subtitle || report?.description || '',
        },
        createdAt: now,
        updatedAt: now,
      };

      await pageBuilderFirestore.savePage(pageConfig, db, tenantId);

      // Also record metadata entry for quick tracking
      const pageToSave: CustomHtmlLandingPage = {
        id: editingPage?.id || pageId,
        slug: cleanSlug,
        title: finalPoster.headline || 'דף אירוע מפלייר',
        subtitle: finalPoster.subtitle || '',
        htmlContent: '',
        formId,
        formTitle,
        flyerPreviewUrl: flyerCloudUrl || (flyerPreviewUrl?.startsWith('http') ? flyerPreviewUrl : undefined),
        heroImageUrl: finalPoster.venueImageUrl || heroImageUrl || undefined,
        report: report || editingPage?.report,
        status: 'published',
        viewsCount: editingPage?.viewsCount || 0,
        createdAt: editingPage?.createdAt || now,
        updatedAt: now,
      };

      await saveCustomHtmlLandingPage(pageToSave, db, tenantId);
      setSavedPage(pageToSave);
      onSaved(pageToSave);
    } catch (err: any) {
      setError(err?.message || 'שגיאה בשמירת העמוד והטופס');
    } finally {
      setIsBusy(false);
    }
  };

  const publicUrl = `${window.location.origin}/p/${sanitizeLandingSlug(slug)}`;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-6xl max-h-[92vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg">
                מפלייר לתבנית פוסטר אירוע (EventPoster) + טופס KFS (KOSAI)
              </h2>
              <p className="text-xs text-slate-400">
                יוצר עמוד KOSWEB עם האזור החדש, עריכה חיה, סגנון סמנטי וטופס KFS בתחתית
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="px-6 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => !isBusy && setStage('upload')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              stage === 'upload'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. העלאת פלייר והנחיות
          </button>
          <span className="text-slate-600">←</span>
          <button
            type="button"
            disabled={!report || isBusy}
            onClick={() => report && setStage('report')}
            className={`px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40 ${
              stage === 'report'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. עריכת דוח ודיוקים
          </button>
          <span className="text-slate-600">←</span>
          <button
            type="button"
            disabled={!posterConfig || isBusy}
            onClick={() => posterConfig && setStage('preview')}
            className={`px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40 ${
              stage === 'preview'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. תבנית EventPoster + טופס ופרסום
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {isBusy && (
            <div className="p-10 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-9 h-9 animate-spin text-amber-400" />
              <p className="font-bold text-sm text-amber-200">{busyLabel}</p>
            </div>
          )}

          {/* STAGE 1: Upload Flyer & Initial Instructions */}
          {!isBusy && stage === 'upload' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-200 block">
                  העלאת פלייר מ-KOSCLOUD (תמונה, PDF או טקסט)
                </label>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handlePickFlyerFromCloudStore}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handlePickFlyerFromCloudStore();
                  }}
                  className="flex flex-col items-center justify-center min-h-[240px] p-6 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-3xl bg-slate-900/50 cursor-pointer transition-colors text-center space-y-3"
                >
                  {flyerPreviewUrl ? (
                    <img
                      src={flyerPreviewUrl}
                      alt="תצוגת פלייר"
                      className="max-h-52 rounded-2xl object-contain shadow-lg"
                    />
                  ) : (
                    <>
                      <Cloud className="w-10 h-10 text-amber-400" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-white">
                          {flyerFile ? flyerFile.name : flyerCloudUrl ? 'נבחר פלייר מ-KOSCLOUD' : 'לחץ לפתיחת מודל KOSCLOUD ובחירת פלייר'}
                        </p>
                        <p className="text-xs text-slate-400">
                          בחירה מהגלריה או העלאה ישירות ל-CloudStore
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-amber-300 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>או העלה קובץ ישירות מהמחשב</span>
                  <input
                    type="file"
                    accept="image/*,.pdf,.md,.txt"
                    className="hidden"
                    onChange={(e) => handleFilePick(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-200 block">
                    הנחיות ל-AI (מטרת העמוד, טופס נדרש, כרטיסים/קופונים, סגנון)
                  </label>
                  <textarea
                    rows={9}
                    value={initialInstructions}
                    onChange={(e) => setInitialInstructions(e.target.value)}
                    placeholder="לדוגמה: זה פלייר לערב התעוררות וסדנה. תבנה דוח לעמוד נחיתה יוקרתי בגווני זהב וכהה, עם טופס הזמנת כרטיסים (רגיל 120 ש״ח, VIP 220 ש״ח), קוד קופון VIP20 וסליקה."
                    className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 focus:border-amber-500 outline-none text-sm text-white leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>שלח ל-AI והפק דוח לעריכה</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: Editable Report + Refinements + Slug Guard */}
          {!isBusy && stage === 'report' && report && (
            <div className="space-y-6">
              {/* Unique Slug Check */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-300">
                    סלאג ייחודי לעמוד (נתיב: <span dir="ltr" className="font-mono text-amber-400">/lp/{sanitizeLandingSlug(slug) || '...'}</span>)
                  </label>
                  {slugCheck.available ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      סלאג פנוי ואינו קיים בעמודי KOSWEB
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{slugCheck.reason}</span>
                      <button
                        type="button"
                        onClick={() => setSlug(slugCheck.suggestedSlug)}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30"
                      >
                        השתמש ב-{slugCheck.suggestedSlug}
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-left text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Editable Core Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">כותרת ראשית</label>
                  <input
                    type="text"
                    value={report.title}
                    onChange={(e) => setReport({ ...report, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">תת-כותרת</label>
                  <input
                    type="text"
                    value={report.subtitle}
                    onChange={(e) => setReport({ ...report, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">תיאור מפורט</label>
                <textarea
                  rows={3}
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                />
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                {(
                  [
                    ['date', 'תאריך'],
                    ['time', 'שעה'],
                    ['location', 'מיקום'],
                    ['price', 'מחיר'],
                    ['audience', 'קהל יעד'],
                    ['contactInfo', 'פרטי קשר'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">{label}</label>
                    <input
                      type="text"
                      value={report.eventDetails?.[key] || ''}
                      onChange={(e) =>
                        setReport({
                          ...report,
                          eventDetails: { ...report.eventDetails, [key]: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">נקודות מרכזיות ויתרונות</label>
                  <button
                    type="button"
                    onClick={() =>
                      setReport({
                        ...report,
                        highlights: [...(report.highlights || []), { title: '', description: '' }],
                      })
                    }
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    הוסף נקודה
                  </button>
                </div>
                <div className="space-y-2">
                  {(report.highlights || []).map((h, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={h.title}
                        placeholder="כותרת"
                        onChange={(e) => {
                          const next = [...report.highlights];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setReport({ ...report, highlights: next });
                        }}
                        className="w-1/3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={h.description}
                        placeholder="פירוט"
                        onChange={(e) => {
                          const next = [...report.highlights];
                          next[idx] = { ...next[idx], description: e.target.value };
                          setReport({ ...report, highlights: next });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...report.highlights];
                          next.splice(idx, 1);
                          setReport({ ...report, highlights: next });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Plan & Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">תכנית הטופס המשולב</label>
                  <input
                    type="text"
                    value={report.formPlan?.formTitle || ''}
                    onChange={(e) =>
                      setReport({
                        ...report,
                        formPlan: { ...report.formPlan, formTitle: e.target.value },
                      })
                    }
                    placeholder="כותרת הטופס"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold"
                  />
                  <div className="flex flex-wrap gap-3 text-xs pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(report.formPlan?.includeTickets)}
                        onChange={(e) =>
                          setReport({
                            ...report,
                            formPlan: { ...report.formPlan, includeTickets: e.target.checked },
                          })
                        }
                      />
                      <span>כלול הזמנת כרטיסים</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(report.formPlan?.includeCoupons)}
                        onChange={(e) =>
                          setReport({
                            ...report,
                            formPlan: { ...report.formPlan, includeCoupons: e.target.checked },
                          })
                        }
                      />
                      <span>כלול קוד קופון</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(report.formPlan?.includePayment)}
                        onChange={(e) =>
                          setReport({
                            ...report,
                            formPlan: { ...report.formPlan, includePayment: e.target.checked },
                          })
                        }
                      />
                      <span>כלול סליקה</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">צבעי העיצוב</label>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {(
                      [
                        ['primaryColor', 'ראשי'],
                        ['secondaryColor', 'משני'],
                        ['backgroundColor', 'רקע'],
                        ['textColor', 'טקסט'],
                      ] as const
                    ).map(([k, lbl]) => (
                      <label key={k} className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={report.designDirection?.[k] || '#ffffff'}
                          onChange={(e) =>
                            setReport({
                              ...report,
                              designDirection: { ...report.designDirection, [k]: e.target.value },
                            })
                          }
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span>{lbl}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hero Image from CloudStore */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {heroImageUrl ? (
                    <img
                      src={heroImageUrl}
                      alt="Hero"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-white">תמונת Hero לעמוד הנחיתה (KOSCLOUD)</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs" dir="ltr">
                      {heroImageUrl || 'טרם נבחרה תמונת Hero'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePickHeroFromCloudStore}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{heroImageUrl ? 'החלף תמונה מ-KOSCLOUD' : 'בחר / העלה מ-KOSCLOUD'}</span>
                  </button>
                  {heroImageUrl && (
                    <button
                      type="button"
                      onClick={() => setHeroImageUrl('')}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      הסר
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Refinements to KOSAI */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-amber-300 block">
                  הוראות נוספות ודיוקים לשליחה ל-KOSAI
                </label>
                <textarea
                  rows={3}
                  value={refinements}
                  onChange={(e) => setRefinements(e.target.value)}
                  placeholder="הוסף כאן הוראות דיוק (למשל: הדגש את הבונוס לנרשמים מוקדמים, עצב כותרת דרמטית, הוסף קופון הנחה של 20%)..."
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 focus:border-amber-400 outline-none text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStage('upload')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>חזרה לפלייר</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendToKosai(false)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>שלח ל-KOSAI וצור תבנית EventPoster + טופס</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: Live EventPoster + Form Preview, Visual Editor, KOSAI Iteration & Publish */}
          {!isBusy && stage === 'preview' && posterConfig && (
            <div className="space-y-4">
              {savedPage && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>התבנית והטופס פורסמו בהצלחה ב-KOSWEB!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(publicUrl);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedUrl ? 'הועתק!' : 'העתק קישור'}</span>
                    </button>
                    <a
                      href={`/p/${savedPage.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>פתח דף חי</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Top Controls: View Switch + Iterate with KOSAI + Save */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('live')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      previewTab === 'live'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>תצוגה מקדימה (EventPoster + KFS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('editor')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      previewTab === 'editor'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>עורך האזור (סגנונות, KOSCLOUD ומיתוג)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePickHeroFromCloudStore}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{heroImageUrl ? 'החלף תמונת רקע' : 'הוסף תמונת רקע מ-KOSCLOUD'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400" dir="ltr">
                    /p/{sanitizeLandingSlug(slug)}
                  </span>
                  <button
                    type="button"
                    onClick={handlePublishAndSave}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>שמור ופרסם ב-KOSWEB</span>
                  </button>
                </div>
              </div>

              {/* Iterate with KOSAI */}
              {report && (
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={refinements}
                    onChange={(e) => setRefinements(e.target.value)}
                    placeholder="דיוק נוסף ל-KOSAI (למשל: שנה לסגנון בורדו וזהב, הדגש את לוח הזמנים)..."
                    className="flex-1 min-w-[240px] px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendToKosai(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>דייק שוב ב-KOSAI</span>
                  </button>
                </div>
              )}

              {/* Live EventPoster Preview or EventPosterEditor */}
              {previewTab === 'live' ? (
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 max-h-[55vh] overflow-y-auto">
                  <EventPosterSection config={posterConfig} />
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 p-4 bg-slate-950 max-h-[55vh] overflow-y-auto">
                  <EventPosterEditor
                    config={posterConfig}
                    onChange={(updated) => setPosterConfig(updated)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
