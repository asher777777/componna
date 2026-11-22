import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  QrCode,
  RefreshCw,
  Save,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import type { ProjectRecord } from '../types';
import type {
  CreateProjectMarketingOptions,
  CreateProjectMarketingResult,
} from '../services/projectSyncService';

export interface MarketingTrackPanelProps {
  project: ProjectRecord;
  syncLoading: boolean;
  onUpdateProject: (projectId: string, updates: Partial<ProjectRecord>) => Promise<void>;
  onSyncMarketingAssets: (
    projectId?: string,
    options?: CreateProjectMarketingOptions
  ) => Promise<CreateProjectMarketingResult>;
  onOpenAiTab: () => void;
}

export const MarketingTrackPanel: React.FC<MarketingTrackPanelProps> = ({
  project,
  syncLoading,
  onUpdateProject,
  onSyncMarketingAssets,
  onOpenAiTab,
}) => {
  const [headline, setHeadline] = useState(project.marketing.headline || project.title);
  const [subheadline, setSubheadline] = useState(
    project.marketing.subheadline || project.description || ''
  );
  const [ctaText, setCtaText] = useState(project.marketing.ctaText || 'הרשמה לפרויקט');
  const [coverImageUrl, setCoverImageUrl] = useState(project.marketing.coverImageUrl || '');
  const [savingDraft, setSavingDraft] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    setHeadline(project.marketing.headline || project.title);
    setSubheadline(project.marketing.subheadline || project.description || '');
    setCtaText(project.marketing.ctaText || 'הרשמה לפרויקט');
    setCoverImageUrl(project.marketing.coverImageUrl || '');
    setFeedback(null);
  }, [project.id, project.marketing.headline, project.marketing.subheadline, project.marketing.ctaText, project.marketing.coverImageUrl, project.title, project.description]);

  const publicUrl = project.marketing.landingPageUrl
    ? project.marketing.landingPageUrl
    : project.marketing.landingPageSlug
    ? `${window.location.origin}/p/${project.marketing.landingPageSlug}`
    : '';

  const handleSaveCopyOnly = async () => {
    setSavingDraft(true);
    setFeedback(null);
    try {
      await onUpdateProject(project.id, {
        marketing: {
          ...project.marketing,
          headline: headline.trim(),
          subheadline: subheadline.trim(),
          ctaText: ctaText.trim() || 'הרשמה לפרויקט',
          coverImageUrl: coverImageUrl.trim() || undefined,
        },
      });
      setFeedback({ type: 'success', message: 'תכני השיווק נשמרו בהצלחה.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'שגיאה בשמירת תכני השיווק.',
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublishMarketingAssets = async () => {
    setFeedback(null);
    const res = await onSyncMarketingAssets(project.id, {
      headline: headline.trim() || project.title,
      subheadline: subheadline.trim() || project.description,
      ctaText: ctaText.trim() || 'הרשמה לפרויקט',
      coverImageUrl: coverImageUrl.trim() || undefined,
    });
    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'דף הנחיתה וטופס ההרשמה נוצרו וסונכרנו בהצלחה מול KosWebAi ו-KosForms.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.warnings?.[0] || 'לא ניתן היה להשלים את יצירת נכסי השיווק.',
      });
    }
  };

  const handleCopyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Marketing KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>נרשמים מדף הנחיתה</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {project.marketing.registrationCount || 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">מסונכרנים אוטומטית ל-KosCrm</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>סטטוס דף נחיתה</span>
            <Globe className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {project.marketing.landingPageSlug ? 'פעיל ומפורסם' : 'טרם נוצר'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">מנוהל באמצעות KosWebAi</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>טופס הרשמה</span>
            <FileText className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {project.marketing.formId ? 'מחובר ופעיל' : 'ממתין להקמה'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">מוטמע דרך CapabilitySlot</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>סנכרון קהילה</span>
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {project.communityGroupId && project.marketing.syncedToCommunity !== false
              ? 'צירוף אוטומטי'
              : 'ללא קהילה משויכת'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {project.communityGroupName || 'ניתן לקשר בלשונית קהילה ו-CRM'}
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Guided Landing Page Copy & Builder */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">הגדרות דף נחיתה והרשמה</h3>
                <p className="text-xs text-slate-500">
                  הצד השיווקי של הפרויקט — יצירה אוטומטית לפי Brand DNA של העסק
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAiTab}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>שדרג קופי עם AI</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                כותרת ראשית לדף הנחיתה
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="לדוגמה: מצטרפים למהלך החדש של..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                תיאור והצעת ערך לנרשמים
              </label>
              <textarea
                rows={3}
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="הסבר קצר על הפרויקט, מה מקבלים בהרשמה ולמה כדאי להצטרף עכשיו"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  טקסט כפתור הרשמה (CTA)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  תמונת נושא לדף הנחיתה
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="קישור תמונה או בחירה מגלריה"
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaModalOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>מדיה</span>
                  </button>
                </div>
              </div>
            </div>

            {coverImageUrl && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={coverImageUrl}
                  alt={headline}
                  className="h-40 w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={syncLoading}
                onClick={handlePublishMarketingAssets}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {syncLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>
                  {project.marketing.landingPageId
                    ? 'עדכן דף נחיתה וטופס הרשמה'
                    : 'צור דף נחיתה וטופס הרשמה'}
                </span>
              </button>

              <button
                type="button"
                disabled={savingDraft}
                onClick={handleSaveCopyOnly}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {savingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>שמור טיוטה</span>
              </button>
            </div>
          </div>
        </div>

        {/* Share Link, QR & Live Form Preview via CapabilitySlot */}
        <div className="space-y-4 lg:col-span-5">
          {/* Public Link & QR Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <QrCode className="h-4 w-4 text-indigo-600" />
              <span>שיתוף והפצת דף הנחיתה</span>
            </div>

            {publicUrl ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                  <span
                    dir="ltr"
                    className="flex-1 truncate px-2 text-xs font-medium text-slate-700"
                  >
                    {publicUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'הועתק' : 'העתק'}</span>
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>פתח</span>
                  </a>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="rounded-xl bg-white p-2.5 shadow-sm">
                    <QRCodeSVG value={publicUrl} size={96} />
                  </div>
                  <div className="text-xs text-slate-600">
                    <div className="font-bold text-slate-800">קוד QR לסריקה מהירה</div>
                    <p className="mt-1 leading-relaxed">
                      ניתן להטמיע במצגות, שילוט או הזמנות פיזיות. כל נרשם נכנס אוטומטית ל-CRM ולקהילת הפרויקט.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                לחץ על "צור דף נחיתה וטופס הרשמה" כדי להפיק קישור ציבורי וקוד QR פעיל לפרויקט.
              </p>
            )}
          </div>

          {/* Embedded Registration Form Slot */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">תצוגה מקדימה של טופס ההרשמה</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                KosForms Slot
              </span>
            </div>

            {project.marketing.formId ? (
              <CapabilitySlot
                name="form-renderer"
                props={{
                  formId: project.marketing.formId,
                  compact: true,
                }}
                fallback={
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    טופס הרשמה ({project.marketing.formTitle || project.marketing.formId}) מוכן לשימוש בדף הנחיתה.
                  </div>
                }
              />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">
                לאחר יצירת נכסי השיווק, טופס ההרשמה יוצג כאן בזמן אמת.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Media Picker Modal via CapabilitySlot */}
      {mediaModalOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex flex-col bg-white"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-bold text-slate-900">בחירת תמונה מגלריית המדיה</h3>
            <button
              type="button"
              onClick={() => setMediaModalOpen(false)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="סגור"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <CapabilitySlot
              name="media-picker"
              props={{
                onSelect: (asset: any) => {
                  const url = typeof asset === 'string' ? asset : asset?.url || asset?.downloadUrl || '';
                  if (url) setCoverImageUrl(url);
                  setMediaModalOpen(false);
                },
                onClose: () => setMediaModalOpen(false),
              }}
              fallback={
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                  בוחר המדיה אינו זמין כרגע. ניתן להדביק קישור תמונה ישירות בשדה תמונת הנושא.
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
