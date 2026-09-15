import React, { useState } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { generateBrandDnaFromInterview } from '../services/geminiBrandPrompt';
import { BrandDna } from '../types/brandDna';
import {
  Wand2,
  Sparkles,
  Loader2,
  CheckCircle,
  HelpCircle,
  Building2,
  Users,
  Target,
  X,
  FileText,
} from 'lucide-react';

interface AiDiscoveryWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_QUESTIONS = [
  'מה שם העסק ובאיזה תחום אתם פועלים?',
  'מהו השירות או המוצר המרכזי שלכם ולמי הוא מיועד?',
  'מה הייחוד שלכם לעומת המתחרים? מדוע לקוחות אוהבים לעבוד איתכם?',
  'איזה אופי או סגנון דיבור מתאים למותג (יוקרתי, חברי, שמרני, צעיר)?',
];

export const AiDiscoveryWizardModal: React.FC<AiDiscoveryWizardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { brandDna, setFullBrandDna } = useBrandDna();
  const { apiKeys } = useSystemConnection();

  const [interviewText, setInterviewText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDna, setGeneratedDna] = useState<Partial<BrandDna> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRunAiDiscovery = async () => {
    if (!interviewText.trim()) {
      setErrorMsg('נא להזין תיאור קצר על הפעילות או תשובות לשאלות');
      return;
    }
    const apiKey = apiKeys.googleAiApiKey || '';
    if (!apiKey) {
      setErrorMsg('יש להגדיר מפתח Google Gemini API בהגדרות המערכת');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);
    const res = await generateBrandDnaFromInterview(interviewText, apiKey);
    setIsGenerating(false);

    if (res.success && res.brandDna) {
      setGeneratedDna(res.brandDna);
    } else {
      setErrorMsg(res.error || 'שגיאה בחילוץ ה-DNA ב-AI');
    }
  };

  const handleApplyGeneratedDna = () => {
    if (generatedDna) {
      const merged: BrandDna = {
        ...brandDna,
        identity: { ...brandDna.identity, ...(generatedDna.identity || {}) },
        voice: { ...brandDna.voice, ...(generatedDna.voice || {}) },
        audience: { ...brandDna.audience, ...(generatedDna.audience || {}) },
        designTokens: { ...brandDna.designTokens, ...(generatedDna.designTokens || {}) },
        trust: { ...brandDna.trust, ...(generatedDna.trust || {}) },
        updatedAt: new Date().toISOString(),
      };
      setFullBrandDna(merged);
      alert('ה-Brand DNA עודכן והוחל בהצלחה!');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">אשף חילוץ DNA ב-Gemini AI</h3>
              <p className="text-xs text-slate-400">
                ספר לנו בכמה משפטים על העסק, וה-AI יבנה פרופיל מותג שלם ומדויק
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {!generatedDna ? (
            <>
              {/* Question Suggestions */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  נקודות מומלצות לפירוט (תוכל להעתיק או לענות בחופשיות):
                </span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {SAMPLE_QUESTIONS.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Free Text Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  תיאור העסק, השירותים וקהל היעד:
                </label>
                <textarea
                  rows={6}
                  value={interviewText}
                  onChange={(e) => setInterviewText(e.target.value)}
                  placeholder="לדוגמה: אנחנו משרד לייעוץ משכנתאות ופיננסים שנקרא 'אופק פיננסי'. הקהל שלנו הוא זוגות צעירים שמחפשים ביטחון ושקט נפשי. אנחנו שונים בכך שאנו נותנים ליווי אישי 24/7 ושיעורי ריבית נמוכים במיוחד..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  {errorMsg}
                </p>
              )}
            </>
          ) : (
            /* Generated Result Preview Card */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>ה-AI חילץ בהצלחה את ה-DNA של המותג! אנא עיין בתוצאה:</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <div>
                  <strong className="text-purple-400 block mb-1">שם וסלוגן:</strong>
                  <span className="text-white font-bold">{generatedDna.identity?.companyName}</span> -{' '}
                  <span className="text-slate-300">"{generatedDna.identity?.slogan}"</span>
                </div>

                <div>
                  <strong className="text-purple-400 block mb-1">תמצית חזון ובידול:</strong>
                  <p className="text-slate-300">{generatedDna.identity?.shortVision}</p>
                </div>

                <div>
                  <strong className="text-purple-400 block mb-1">הצעת ערך ייחודית (UVP):</strong>
                  <p className="text-slate-300">{generatedDna.audience?.mainUvp}</p>
                </div>

                {generatedDna.voice?.powerWords && (
                  <div>
                    <strong className="text-purple-400 block mb-1">מילות כוח מומלצות:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {generatedDna.voice.powerWords.map((w, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px]">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            סגור
          </button>
          {!generatedDna ? (
            <button
              type="button"
              onClick={handleRunAiDiscovery}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Gemini מנתח ומחלץ DNA...' : 'הפק Brand DNA עכשיו'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyGeneratedDna}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              החל נתונים אלו במערכת
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
