import React, { useState, useRef } from 'react';
import { 
  Sparkles, Wand2, Film, Clock, Users, Target, Volume2, 
  Image as ImageIcon, CheckCircle2, Globe, Palette, FileText, 
  Video, Play, Layers, X, Upload, HelpCircle, ShieldCheck,
  FileCode, Link as LinkIcon, MessageSquare, ArrowLeft, ArrowRight,
  Lightbulb, Check, ChevronDown, Edit3
} from 'lucide-react';
import { useVideoStudio } from '../context/VideoStudioContext';
import { 
  PRODUCTION_TYPES_CATALOG, 
  VISUAL_STYLES_CATALOG, 
  TTS_LANGUAGES, 
  OUTPUT_DELIVERABLES,
  TARGET_AUDIENCE_CATALOG,
  MARKETING_HOOKS_CATALOG
} from '../config/catalogs';
import { OutputDeliverablePreference, ClarificationQuestionItem } from '../types';

export const BrainstormWizardView: React.FC = () => {
  const { 
    createProjectFromWizard, 
    generateClarificationQuestions, 
    isGeneratingScript 
  } = useVideoStudio();

  // Wizard Step: 'brief' (initial inputs) | 'clarification' (answering Gemini guiding questions)
  const [wizardStep, setWizardStep] = useState<'brief' | 'clarification'>('brief');

  // Form State
  const [productionType, setProductionType] = useState<string>('landing_funnel');
  const [visualStyle, setVisualStyle] = useState<string>('cinematic_dramatic');
  const [sceneCount, setSceneCount] = useState<number>(4);
  const [ttsLanguage, setTtsLanguage] = useState<string>('he-IL');
  const [outputPreference, setOutputPreference] = useState<OutputDeliverablePreference>('full_production');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  
  const [topic, setTopic] = useState('');
  
  // 20 Target Audiences with custom text
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(TARGET_AUDIENCE_CATALOG[0].id);
  const [targetAudience, setTargetAudience] = useState(TARGET_AUDIENCE_CATALOG[0].name);

  // 20 Marketing Hooks with custom text
  const [selectedHookId, setSelectedHookId] = useState<string>(MARKETING_HOOKS_CATALOG[0].id);
  const [marketingHook, setMarketingHook] = useState(MARKETING_HOOKS_CATALOG[0].name);

  // Multimodal Image Reference
  const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // PDF Document Reference
  const [referencePdfBase64, setReferencePdfBase64] = useState<string | null>(null);
  const [referencePdfName, setReferencePdfName] = useState<string | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // Document Link / Google Sheet / Web URL
  const [documentUrl, setDocumentUrl] = useState<string>('');

  // Clarification Chat State
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestionItem[]>([]);
  const [clarificationAnalysis, setClarificationAnalysis] = useState<string>('');
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected object helpers
  const selectedProd = PRODUCTION_TYPES_CATALOG.find(p => p.id === productionType) || PRODUCTION_TYPES_CATALOG[0];
  const selectedStyle = VISUAL_STYLES_CATALOG.find(s => s.id === visualStyle) || VISUAL_STYLES_CATALOG[0];

  // Handle audience dropdown change
  const handleAudienceChange = (audId: string) => {
    setSelectedAudienceId(audId);
    const found = TARGET_AUDIENCE_CATALOG.find(a => a.id === audId);
    if (found) {
      setTargetAudience(found.name);
    }
  };

  // Handle hook dropdown change
  const handleHookChange = (hookId: string) => {
    setSelectedHookId(hookId);
    const found = MARKETING_HOOKS_CATALOG.find(h => h.id === hookId);
    if (found) {
      setMarketingHook(found.name);
    }
  };

  // Handle image upload & base64 conversion
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('נא להעלות קובץ תמונה תקין (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('גודל התמונה מוגבל לעד 5MB.');
      return;
    }

    setReferenceImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImageBase64(reader.result as string);
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('שגיאה בקריאת קובץ התמונה.');
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = () => {
    setReferenceImageBase64(null);
    setReferenceImageName(null);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  // Handle PDF upload & base64 conversion
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg('נא להעלות קובץ PDF תקין.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('גודל קובץ ה-PDF מוגבל לעד 10MB.');
      return;
    }

    setReferencePdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReferencePdfBase64(reader.result as string);
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('שגיאה בקריאת קובץ ה-PDF.');
    };
    reader.readAsDataURL(file);
  };

  const removeReferencePdf = () => {
    setReferencePdfBase64(null);
    setReferencePdfName(null);
    if (pdfFileInputRef.current) {
      pdfFileInputRef.current.value = '';
    }
  };

  const handleProductionTypeChange = (newTypeId: string) => {
    setProductionType(newTypeId);
    const found = PRODUCTION_TYPES_CATALOG.find(p => p.id === newTypeId);
    if (found && found.recommendedScenes) {
      setSceneCount(found.recommendedScenes);
    }
  };

  // Step 1 -> Trigger Gemini Clarification Questions
  const handleStartClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg('נא להזין נושא או רעיון לסרטון.');
      return;
    }
    setErrorMsg(null);

    try {
      const res = await generateClarificationQuestions({
        topic,
        targetAudience,
        marketingHook,
        sceneCount,
        productionType,
        visualStyle,
        ttsLanguage,
        outputPreference,
        referenceImageBase64: referenceImageBase64 || undefined,
        referencePdfBase64: referencePdfBase64 || undefined,
        referencePdfName: referencePdfName || undefined,
        documentUrl: documentUrl.trim() || undefined,
        aspectRatio
      });

      setClarificationQuestions(res.questions);
      setClarificationAnalysis(res.analysisSummary);
      setActiveConversationId(res.conversationId);

      // Pre-fill default answers from suggested answers
      const initialAnswers: Record<string, string> = {};
      res.questions.forEach(q => {
        if (q.suggestedAnswer) {
          initialAnswers[q.id] = q.suggestedAnswer;
        }
      });
      setClarificationAnswers(initialAnswers);

      setWizardStep('clarification');
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה בניתוח הפרויקט עם Gemini');
    }
  };

  // Direct generation bypassing clarification questions
  const handleDirectGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg('נא להזין נושא או רעיון לסרטון.');
      return;
    }
    setErrorMsg(null);
    try {
      await createProjectFromWizard({
        topic,
        targetAudience,
        marketingHook,
        sceneCount,
        productionType,
        visualStyle,
        ttsLanguage,
        outputPreference,
        referenceImageBase64: referenceImageBase64 || undefined,
        referencePdfBase64: referencePdfBase64 || undefined,
        referencePdfName: referencePdfName || undefined,
        documentUrl: documentUrl.trim() || undefined,
        aspectRatio
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה ביצירת התסריט');
    }
  };

  // Step 2 -> Submit Clarification Answers and Deploy to Editor
  const handleFinalSubmitWithClarifications = async () => {
    setErrorMsg(null);
    const answersList = clarificationQuestions.map(q => ({
      question: q.question,
      answer: clarificationAnswers[q.id] || q.suggestedAnswer || 'לפי שיקול דעת AI'
    }));

    try {
      await createProjectFromWizard({
        topic,
        targetAudience,
        marketingHook,
        sceneCount,
        productionType,
        visualStyle,
        ttsLanguage,
        outputPreference,
        referenceImageBase64: referenceImageBase64 || undefined,
        referencePdfBase64: referencePdfBase64 || undefined,
        referencePdfName: referencePdfName || undefined,
        documentUrl: documentUrl.trim() || undefined,
        clarificationAnswers: answersList,
        conversationId: activeConversationId,
        aspectRatio
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה ביצירת הסטוריבורד הסופי');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-slate-900/80 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Gemini AI Multimodal & Banana Pro Video Architect</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              אשף הפקת וידאו חכם עם שאלות מנחות וחיבור מסמכים
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              20 קהלי יעד, 20 הוקים שיווקיים, 20 סגנונות ויזואליים, העלאת PDF/תמונה/קישור וזרימת שיחה מנחה עם Gemini לפני פריסת הסטוריבורד בעורך.
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
            <Film className="w-8 h-8" />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: INITIAL BRIEF FORM */}
      {wizardStep === 'brief' && (
        <form onSubmit={handleStartClarification} className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
          
          {/* 1. Production Type Selector (20 options) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>1. סוג הפקת הוידאו (20 תבניות הפקה ייעודיות) *</span>
              </label>
              <span className="text-[11px] text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                מומלץ: {selectedProd.recommendedScenes} סצנות
              </span>
            </div>

            <select
              value={productionType}
              onChange={(e) => handleProductionTypeChange(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-950 border border-purple-500/40 text-white font-semibold text-sm focus:border-purple-400 focus:outline-none transition cursor-pointer"
            >
              {PRODUCTION_TYPES_CATALOG.map((item) => (
                <option key={item.id} value={item.id} className="bg-slate-900 text-white py-1">
                  {item.name} ({item.category === 'marketing' ? 'שיווק' : item.category === 'educational' ? 'הדרכה' : item.category === 'corporate' ? 'עסקי' : 'קריאייטיב'})
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-400 px-1">
              💡 <span className="font-semibold text-slate-300">{selectedProd.name}:</span> {selectedProd.description}
            </p>
          </div>

          {/* 2. Visual Style Selector (20 options) & Banana Pro consistency anchor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-400" />
                <span>2. סגנון ויזואלי ועקביות דמות בננה פרו (Nano Banana Pro / Imagen 3) *</span>
              </label>
              <span className="text-[11px] text-pink-300 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20 font-mono">
                {selectedStyle.badge}
              </span>
            </div>

            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-950 border border-pink-500/40 text-white font-semibold text-sm focus:border-pink-400 focus:outline-none transition cursor-pointer"
            >
              {VISUAL_STYLES_CATALOG.map((style) => (
                <option key={style.id} value={style.id} className="bg-slate-900 text-white py-1">
                  {style.name} — {style.badge}
                </option>
              ))}
            </select>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">עוגן עקביות ויזואלית: </span>
                <span className="text-slate-400">{selectedStyle.description}</span>
                <div className="mt-1 font-mono text-[10px] text-pink-400 truncate bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {selectedStyle.visualPromptPrefix}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Output Deliverables Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>3. תוצרי ההפקה המבוקשים (Output Deliverables):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {OUTPUT_DELIVERABLES.map((deliv) => {
                const isSelected = outputPreference === deliv.id;
                return (
                  <button
                    key={deliv.id}
                    type="button"
                    onClick={() => setOutputPreference(deliv.id)}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950/30'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>{deliv.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{deliv.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Topic & Concept */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>4. על מה הסרטון? (נושא, מוצר, שירות או רעיון שיווקי) *</span>
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="למשל: סוכנות נדל״ן יוקרתית שמציגה פנטהאוז מול הים עם סיור מודרך, מפרט טכני והנעה לתיאום פגישה אישית..."
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none transition"
              required
            />
          </div>

          {/* 5. 20 Target Audiences & 20 Marketing Hooks Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target Audience (20 Options + Custom Edit) */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>קהל יעד (20 אפשרויות)</span>
                </label>
                <span className="text-[10px] text-indigo-300 font-semibold">תפריט מהיר</span>
              </div>

              <select
                value={selectedAudienceId}
                onChange={(e) => handleAudienceChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-slate-100 text-xs focus:border-indigo-400 focus:outline-none cursor-pointer"
              >
                {TARGET_AUDIENCE_CATALOG.map((aud) => (
                  <option key={aud.id} value={aud.id}>
                    [{aud.category}] {aud.name}
                  </option>
                ))}
              </select>

              <div className="pt-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                  <Edit3 className="w-3 h-3 text-indigo-400" />
                  <span>עריכה והתאמה אישית של קהל היעד:</span>
                </div>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="הזן קהל יעד מותאם אישית..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Marketing Hook (20 Options + Custom Edit) */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <span>מטרת הסרטון / הוק שיווקי (20 אפשרויות)</span>
                </label>
                <span className="text-[10px] text-purple-300 font-semibold">תפריט מהיר</span>
              </div>

              <select
                value={selectedHookId}
                onChange={(e) => handleHookChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-purple-500/40 text-slate-100 text-xs focus:border-purple-400 focus:outline-none cursor-pointer"
              >
                {MARKETING_HOOKS_CATALOG.map((hk) => (
                  <option key={hk.id} value={hk.id}>
                    [{hk.badge}] {hk.name}
                  </option>
                ))}
              </select>

              <div className="pt-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                  <Edit3 className="w-3 h-3 text-purple-400" />
                  <span>עריכה והתאמה אישית של ההוק השיווקי:</span>
                </div>
                <input
                  type="text"
                  value={marketingHook}
                  onChange={(e) => setMarketingHook(e.target.value)}
                  placeholder="הזן הוק שיווקי מותאם אישית..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* 6. Document Uploads (PDF + Image) & Web/Google Sheet Link */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>חומרי רקע ומסמכים (PDF, תמונת רפרנס, קישור למסמך / Google Sheet / URL)</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">Gemini Multimodal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PDF File Upload */}
              <div>
                <input
                  type="file"
                  ref={pdfFileInputRef}
                  onChange={handlePdfFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                {referencePdfBase64 ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{referencePdfName || 'קובץ PDF נטען'}</span>
                        <span className="text-[10px] text-emerald-300">ה-PDF יוזרק ישירות ל-Gemini לניתוח מעמיק</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeReferencePdf}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => pdfFileInputRef.current?.click()}
                    className="w-full py-3.5 px-3 border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-emerald-950/20 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-emerald-300 transition cursor-pointer text-xs font-semibold"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>העלה מסמך PDF (עד 10MB)</span>
                  </button>
                )}
              </div>

              {/* Reference Image Upload */}
              <div>
                <input
                  type="file"
                  ref={imageFileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                {referenceImageBase64 ? (
                  <div className="flex items-center justify-between p-2.5 bg-indigo-950/30 border border-indigo-500/40 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={referenceImageBase64}
                        alt="Reference"
                        className="w-10 h-10 object-cover rounded-lg border border-indigo-500/50 bg-black shrink-0"
                      />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{referenceImageName || 'תמונת רפרנס נטענה'}</span>
                        <span className="text-[10px] text-indigo-300">תמונת רפרנס ל-Banana Pro</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeReferenceImage}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="w-full py-3.5 px-3 border border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-indigo-950/20 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-indigo-300 transition cursor-pointer text-xs font-semibold"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <span>העלה תמונת מוצר / לוגו (עד 5MB)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Link or Web URL */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>קישור למסמך, Google Sheet, עמוד מוצר או אתר אינטרנט:</span>
              </label>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/... או https://mywebsite.com/product"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 7. Technical Settings: Scene Count (1-20), TTS Language, Aspect Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>מספר סצנות (1 עד 20)</span>
              </label>
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 cursor-pointer"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} סצנות (~{num * 6} שניות סה״כ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>שפת קריינות (TTS Language)</span>
              </label>
              <select
                value={ttsLanguage}
                onChange={(e) => setTtsLanguage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 cursor-pointer"
              >
                {TTS_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-pink-400" />
                <span>יחס תצוגה (Aspect Ratio)</span>
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 cursor-pointer"
              >
                <option value="16:9">16:9 (לרוחב - YouTube, אתר)</option>
                <option value="9:16">9:16 (לאורך - Reels, TikTok, Shorts)</option>
                <option value="1:1">1:1 (ריבוע - פיד אינסטגרם/פייסבוק)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDirectGenerate}
              disabled={isGeneratingScript}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>⚡ דלג על שאלות וייצר סטוריבורד ישירות</span>
            </button>

            <button
              type="submit"
              disabled={isGeneratingScript}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30 transition cursor-pointer disabled:opacity-50 text-sm"
            >
              <MessageSquare className={`w-5 h-5 ${isGeneratingScript ? 'animate-spin' : ''}`} />
              <span>
                {isGeneratingScript 
                  ? 'Gemini מנתח את החומרים ומכין שאלות מנחות...' 
                  : 'המשך לשאלות מנחות וחידוד איכות עם Gemini'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: CLARIFICATION & GUIDING QUESTIONS CHAT */}
      {wizardStep === 'clarification' && (
        <div className="p-6 bg-slate-900/95 border border-purple-500/40 rounded-3xl space-y-6 shadow-2xl animate-scaleUp">
          
          {/* Analysis Bubble */}
          <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-purple-300 block">תובנת ניתוח מנהל קריאייטיב AI:</span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {clarificationAnalysis || 'הבריף שלך נותח בהצלחה! כדי להבטיח אחוזי המרה מקסימליים ועקביות דמות, ענה בקצרה על השאלות הבאות.'}
              </p>
            </div>
          </div>

          {/* Guiding Questions List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>שאלות מנחות לדיוק הסטוריבורד ({clarificationQuestions.length}):</span>
            </h3>

            {clarificationQuestions.map((q, qIdx) => (
              <div key={q.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-[10px] text-purple-300 font-bold">
                      {qIdx + 1}
                    </span>
                    <span>{q.question}</span>
                  </span>
                  {q.hint && (
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      💡 {q.hint}
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={clarificationAnswers[q.id] || ''}
                  onChange={(e) => setClarificationAnswers({ ...clarificationAnswers, [q.id]: e.target.value })}
                  placeholder={q.suggestedAnswer ? `למשל: ${q.suggestedAnswer}` : 'הזן את תשובתך כאן...'}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />

                {q.suggestedAnswer && (
                  <button
                    type="button"
                    onClick={() => setClarificationAnswers({ ...clarificationAnswers, [q.id]: q.suggestedAnswer || '' })}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>אמץ תשובה מוצעת: "{q.suggestedAnswer}"</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons in Clarification Mode */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setWizardStep('brief')}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>חזור לעריכת הפרטים</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleFinalSubmitWithClarifications}
                disabled={isGeneratingScript}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30 transition cursor-pointer disabled:opacity-50 text-sm"
              >
                <Wand2 className={`w-5 h-5 ${isGeneratingScript ? 'animate-spin text-amber-300' : ''}`} />
                <span>
                  {isGeneratingScript 
                    ? 'Gemini מייצר כעת את כל הסצנות ופורס בעורך...' 
                    : `🚀 ייצר ${sceneCount} סצנות ואפיון מלא ופרוס בעורך`}
                </span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
