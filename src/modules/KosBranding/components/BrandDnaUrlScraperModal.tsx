import React, { useState } from 'react';
import { useBrandDna } from '../context/BrandDnaContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { scrapeBrandFromUrlOrSocial } from '../services/geminiBrandPrompt';
import {
  Globe,
  Share2,
  Sparkles,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  X,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface BrandDnaUrlScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandDnaUrlScraperModal: React.FC<BrandDnaUrlScraperModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { brandDna, updateIdentity, updateVoice, updateAudience, saveNow } = useBrandDna();
  const { apiKeys } = useSystemConnection();

  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedResult, setExtractedResult] = useState<{
    summary?: string;
    extractedBrand?: any;
    positioningQuestions?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState(false);

  if (!isOpen) return null;

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setExtractedResult(null);

    try {
      const apiKey = apiKeys.googleAiApiKey || '';
      const res = await scrapeBrandFromUrlOrSocial(urlInput.trim(), apiKey);
      if (res.success && res.extractedBrand) {
        setExtractedResult(res);
      } else {
        setError(res.error || 'שגיאה בסריקת הקישור');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בלתי צפויה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToBrandDna = async () => {
    if (!extractedResult?.extractedBrand) return;

    const eb = extractedResult.extractedBrand;
    if (eb.identity) {
      updateIdentity(eb.identity);
    }
    if (eb.voice) {
      updateVoice(eb.voice);
    }
    if (eb.audience) {
      updateAudience(eb.audience);
    }

    await saveNow();
    setAppliedNotice(true);
    setTimeout(() => {
      setAppliedNotice(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                סריקת אתר קיים או עמוד פייסבוק (AI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                הזן קישור לאתר או לעמוד פייסבוק פעיל לשאיבת נתוני מיתוג וחידוד המיצוב העסקי
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {appliedNotice && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>נתוני המותג והמיצוב נשאבו והוטמעו ב-Brand DNA בהצלחה!</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleScan} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              כתובת URL של האתר או עמוד הפייסבוק:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="לדוגמה: https://mybusiness.co.il או facebook.com/mypage"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-2xl pr-10 pl-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>סורק...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>סרוק ושאב נתונים</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              ה-AI סורק את ההקשר העסקי, מחלץ חזון, סלוגן וקהל יעד, ומציג שאלות מיצוב לחידוד.
            </p>
          </form>

          {/* Extracted Details & Questions */}
          {extractedResult && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
                  תקציר המותג שזוהה
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {extractedResult.summary}
                </p>
              </div>

              {/* Identity Snapshot */}
              {extractedResult.extractedBrand?.identity && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    נתונים שנשאבו:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">שם:</span>
                      <strong className="text-slate-800 dark:text-slate-100">
                        {extractedResult.extractedBrand.identity.companyName || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">סלוגן:</span>
                      <span className="text-slate-800 dark:text-slate-100">
                        {extractedResult.extractedBrand.identity.slogan || '—'}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[10px]">תכלית עיסוק:</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {extractedResult.extractedBrand.identity.organizationPurpose || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Positioning Questions */}
              {extractedResult.positioningQuestions && extractedResult.positioningQuestions.length > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    שאלות מיצוב שנולדו מהסריקה (להעמקה וחידוד ה-DNA):
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {extractedResult.positioningQuestions.map((q, qIdx) => (
                      <li key={qIdx} className="leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Action */}
              <button
                type="button"
                onClick={handleApplyToBrandDna}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>החל נתונים אלו על ה-Brand DNA ושמור במערכת</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50/80 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
