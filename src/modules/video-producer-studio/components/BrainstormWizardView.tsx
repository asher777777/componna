import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Wand2, Film, Clock, Users, Target, Volume2, 
  Image as ImageIcon, CheckCircle2, Globe, Palette, FileText, 
  Video, Play, Layers, X, Upload, HelpCircle, ShieldCheck,
  FileCode, Link as LinkIcon, MessageSquare, ArrowLeft, ArrowRight,
  Lightbulb, Check, ChevronDown, Edit3, Plus, RefreshCw, Eye, ListOrdered, BookOpen,
  Layout, HelpCircle as HelpIcon, Send, Sparkle, ExternalLink
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
import { OutputDeliverablePreference, ClarificationQuestionItem, VideoProject } from '../types';
import { extractPageContentForVideo, ExtractedPageSummary } from '../services/pageContentExtractor';
import { PageBuilderConfig } from '../../page-builder/types/pageBuilder.types';

const WIZARD_DRAFT_KEY = 'sdo_studio_wizard_draft_v1';

export const BrainstormWizardView: React.FC = () => {
  const { 
    activeProject,
    setActiveProject,
    startNewProject,
    setTab,
    createProjectFromWizard, 
    reGenerateProjectWithAI,
    addNextSceneWithAI,
    generateClarificationQuestions, 
    isGeneratingScript,
    brandDna,
    refreshBrandDna,
    availablePages,
    refreshPages,
    selectedPageForWizard,
    setSelectedPageForWizard
  } = useVideoStudio();

  // Active Stage Tab for Stage Inspection: 'brief' | 'clarification' | 'overview' | 'scenes'
  const [activeStageTab, setActiveStageTab] = useState<'brief' | 'clarification' | 'overview' | 'scenes'>('brief');

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

  // Page Builder Extraction State
  const [extractedSummary, setExtractedSummary] = useState<ExtractedPageSummary | null>(null);

  // Clarification Chat State
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestionItem[]>([]);
  const [clarificationAnalysis, setClarificationAnalysis] = useState<string>('');
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

  // Continuation scene prompt
  const [continuationPrompt, setContinuationPrompt] = useState<string>('');
  const [isAddingContinuation, setIsAddingContinuation] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-pickup target page passed from Page Builder via localStorage
  useEffect(() => {
    try {
      const targetPageId = localStorage.getItem('sdo_video_studio_target_page_id');
      if (targetPageId && availablePages.length > 0) {
        const page = availablePages.find(p => p.pageId === targetPageId);
        if (page) {
          setSelectedPageForWizard(page);
          localStorage.removeItem('sdo_video_studio_target_page_id');
        }
      }
    } catch {}
  }, [availablePages, setSelectedPageForWizard]);

  // 1. Handle selected page change
  useEffect(() => {
    if (selectedPageForWizard) {
      const summary = extractPageContentForVideo(selectedPageForWizard);
      setExtractedSummary(summary);
      if (!topic.trim()) {
        setTopic(`${selectedPageForWizard.pageTitle} - ${summary.heroHeadline || summary.companyName || 'עמוד נחיתה אינטראקטיבי'}`);
      }
      if (summary.heroHeadline && marketingHook === MARKETING_HOOKS_CATALOG[0].name) {
        setMarketingHook(summary.heroHeadline);
      }
    } else {
      setExtractedSummary(null);
    }
  }, [selectedPageForWizard]);

  // 2. Load active project data into form if an active project exists
  useEffect(() => {
    if (activeProject) {
      setTopic(activeProject.description || activeProject.title || '');
      setProductionType(activeProject.productionType || 'landing_funnel');
      setVisualStyle(activeProject.visualStyle || 'cinematic_dramatic');
      setSceneCount(activeProject.scenes?.length || 4);
      setTtsLanguage(activeProject.ttsLanguage || 'he-IL');
      setOutputPreference(activeProject.outputPreference || 'full_production');
      setAspectRatio(activeProject.aspectRatio || '16:9');
      setDocumentUrl(activeProject.documentUrl || '');
      setReferencePdfName(activeProject.referencePdfName || null);
      setReferenceImageName(activeProject.referenceImageUrl ? 'תמונת רפרנס קיימת' : null);
      setActiveConversationId(activeProject.conversationId);

      if (activeProject.targetAudience) {
        setTargetAudience(activeProject.targetAudience);
        const aud = TARGET_AUDIENCE_CATALOG.find(a => a.name === activeProject.targetAudience);
        if (aud) setSelectedAudienceId(aud.id);
      }

      if (activeProject.marketingHook) {
        setMarketingHook(activeProject.marketingHook);
        const hk = MARKETING_HOOKS_CATALOG.find(h => h.name === activeProject.marketingHook);
        if (hk) setSelectedHookId(hk.id);
      }

      if (activeProject.clarificationAnswers && activeProject.clarificationAnswers.length > 0) {
        const reconstructedQuestions: ClarificationQuestionItem[] = activeProject.clarificationAnswers.map((item, idx) => ({
          id: `q_${idx + 1}`,
          question: item.question,
          suggestedAnswer: item.answer
        }));
        setClarificationQuestions(reconstructedQuestions);

        const ansMap: Record<string, string> = {};
        activeProject.clarificationAnswers.forEach((item, idx) => {
          ansMap[`q_${idx + 1}`] = item.answer;
        });
        setClarificationAnswers(ansMap);
      }
    } else {
      // Restore draft from local storage if starting fresh
      try {
        const savedDraft = localStorage.getItem(WIZARD_DRAFT_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.topic && !selectedPageForWizard) setTopic(parsed.topic);
          if (parsed.productionType) setProductionType(parsed.productionType);
          if (parsed.visualStyle) setVisualStyle(parsed.visualStyle);
          if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
          if (parsed.marketingHook) setMarketingHook(parsed.marketingHook);
          if (parsed.ttsLanguage) setTtsLanguage(parsed.ttsLanguage);
          if (parsed.documentUrl) setDocumentUrl(parsed.documentUrl);
        }
      } catch (e) {
        console.warn('Draft load warning:', e);
      }
    }
  }, [activeProject, selectedPageForWizard]);

  // 3. Real-time auto-save draft to localStorage
  useEffect(() => {
    if (!activeProject && topic.trim()) {
      const draft = {
        topic,
        productionType,
        visualStyle,
        targetAudience,
        marketingHook,
        ttsLanguage,
        documentUrl,
        aspectRatio,
        sceneCount,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(draft));
    }
  }, [topic, productionType, visualStyle, targetAudience, marketingHook, ttsLanguage, documentUrl, aspectRatio, sceneCount, activeProject]);

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
      setErrorMsg('נא להזין נושא או לבחור עמוד לסרטון.');
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
        aspectRatio,
        brandDna,
        sourcePageId: selectedPageForWizard?.pageId,
        sourcePageTitle: selectedPageForWizard?.pageTitle,
        sourcePageSummary: extractedSummary
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
      setActiveStageTab('clarification');
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה בניתוח הפרויקט עם Gemini');
    }
  };

  // Direct generation bypassing clarification questions
  const handleDirectGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg('נא להזין נושא או לבחור עמוד לסרטון.');
      return;
    }
    setErrorMsg(null);
    try {
      if (activeProject) {
        await reGenerateProjectWithAI({
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
          aspectRatio,
          conversationId: activeConversationId,
          brandDna,
          sourcePageId: selectedPageForWizard?.pageId,
          sourcePageTitle: selectedPageForWizard?.pageTitle,
          sourcePageSummary: extractedSummary
        });
      } else {
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
          aspectRatio,
          brandDna,
          sourcePageId: selectedPageForWizard?.pageId,
          sourcePageTitle: selectedPageForWizard?.pageTitle,
          sourcePageSummary: extractedSummary
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה ביצירת התסריט');
    }
  };

  // Submit with Clarifications (Create or Re-generate existing project)
  const handleFinalSubmitWithClarifications = async () => {
    setErrorMsg(null);
    const answersList = clarificationQuestions.map(q => ({
      question: q.question,
      answer: clarificationAnswers[q.id] || q.suggestedAnswer || 'לפי שיקול דעת AI'
    }));

    try {
      if (activeProject) {
        await reGenerateProjectWithAI({
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
          conversationId: activeConversationId || activeProject.conversationId,
          aspectRatio,
          brandDna,
          sourcePageId: selectedPageForWizard?.pageId,
          sourcePageTitle: selectedPageForWizard?.pageTitle,
          sourcePageSummary: extractedSummary
        });
      } else {
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
          aspectRatio,
          brandDna,
          sourcePageId: selectedPageForWizard?.pageId,
          sourcePageTitle: selectedPageForWizard?.pageTitle,
          sourcePageSummary: extractedSummary
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה ביצירת הסטוריבורד הסופי');
    }
  };

  // Add Continuation Scene for Active Project
  const handleAddContinuationScene = async () => {
    if (!activeProject) return;
    if (activeProject.scenes.length >= 20) {
      setErrorMsg('הפרויקט הגיע למגבלה המקסימלית של 20 סצנות.');
      return;
    }
    setErrorMsg(null);
    setIsAddingContinuation(true);
    try {
      await addNextSceneWithAI(continuationPrompt.trim() || undefined);
      setContinuationPrompt('');
      setSuccessMsg(`סצנה ${activeProject.scenes.length + 1} נוצרה בהצלחה ונשמרה בפרויקט!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'שגיאה ביצירת סצנת המשך');
    } finally {
      setIsAddingContinuation(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6" dir="rtl">
      
      {/* Active Project Banner if viewing/editing an existing project */}
      {activeProject && (
        <div className="p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activeProject.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  פרויקט שמור ({activeProject.scenes.length} סצנות)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                מזהה שיחה: {activeProject.conversationId || 'ללא מזהה'} | עודכן: {new Date(activeProject.updatedAt).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={startNewProject}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ פרויקט חדש</span>
            </button>

            <button
              onClick={() => setTab('editor')}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-600/30"
            >
              <Film className="w-3.5 h-3.5" />
              <span>🎬 פתח עורך סצנות</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-slate-900/80 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Brand DNA & Page-to-Interactive Video Architect</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              יוצר עצי וידאו אינטראקטיביים חכמים להמרת עמודים סטטיים
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              המרת תוכן עמודים מ-Page Builder ושפת המותג מ-Brand DNA לעץ סרטונים אינטראקטיבי עם שאלות ותשובות, תגיות קוליות של Google Speech, עוגן בננה פרו (Banana Pro) ונגן ממיר לפעולה.
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
            <Film className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* BRAND DNA & PAGE BUILDER INTEGRATION OVERVIEW BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Brand DNA Hub Card */}
        <div className="p-4 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">מרכז מיתוג גלובלי (Brand DNA)</span>
                <span className="text-[10px] text-indigo-300">מסונכרן לפרומפטים של Gemini</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refreshBrandDna()}
              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition cursor-pointer border border-slate-800"
              title="רענן מיתוג"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">שם המותג:</span>
              <span className="font-bold text-slate-200">{brandDna?.identity.companyName || 'המותג המוביל'}</span>
            </div>
            {brandDna?.identity.slogan && (
              <div className="flex justify-between">
                <span className="text-slate-400">סלוגן:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{brandDna.identity.slogan}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">רשמיות קולית:</span>
              <span className="text-indigo-300 font-mono">
                {brandDna?.voice.personality.formality || 3}/5 | פנייה: {brandDna?.voice.genderAddressing || 'רבים'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
              <Sparkle className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">
                מילות עוצמה: {(brandDna?.voice.powerWords || ['איכות', 'מקצועיות', 'תוצאות']).slice(0, 3).join(', ')}...
              </span>
            </div>
          </div>
        </div>

        {/* Page Builder Selector Card */}
        <div className="p-4 bg-gradient-to-br from-slate-900/90 via-purple-950/40 to-slate-900/90 border border-purple-500/30 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Layout className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">יוצר העמודים (Page Builder)</span>
                <span className="text-[10px] text-purple-300">בחר עמוד להמרת תוכן לעץ וידאו</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refreshPages()}
              className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition cursor-pointer border border-slate-800"
              title="רענן רשימת דפים"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <select
              value={selectedPageForWizard?.pageId || ''}
              onChange={(e) => {
                const targetId = e.target.value;
                if (!targetId) {
                  setSelectedPageForWizard(null);
                } else {
                  const p = availablePages.find(page => page.pageId === targetId);
                  if (p) setSelectedPageForWizard(p);
                }
              }}
              className="w-full p-2.5 bg-slate-950 border border-purple-500/40 rounded-xl text-xs text-white font-semibold focus:border-purple-400 focus:outline-none cursor-pointer"
            >
              <option value="">-- יצירת תסריט חופשי (ללא עמוד מקושר) --</option>
              {availablePages.map((page) => (
                <option key={page.pageId} value={page.pageId}>
                  📄 {page.pageTitle} ({page.slug || page.pageId}) {page.isHomePage ? '🌟 דף בית' : ''}
                </option>
              ))}
            </select>

            {extractedSummary ? (
              <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-[11px] space-y-1 text-slate-300">
                <div className="flex items-center justify-between font-bold text-purple-200">
                  <span>תוכן שנשלף מהעמוד:</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">מוכן לסנכרון</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  🔹 Hero: {extractedSummary.heroHeadline || 'כותרת ראשית'}
                </div>
                <div className="flex gap-2 text-[10px] text-slate-300">
                  <span>🛠 {extractedSummary.services.length} שירותים</span>
                  <span>❓ {extractedSummary.faqItems.length} שאלות ותשובות</span>
                  <span>💎 {extractedSummary.pricingPackages.length} חבילות</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 px-1">
                💡 בחר עמוד נחיתה כדי לחלץ את הכותרות, השירותים, השאלות הנפוצות וההנעה לפעולה ישירות לתוך עץ הוידאו.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* STAGE TABS BAR */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveStageTab('brief')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeStageTab === 'brief'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>שלב 1: בריף והגדרות הפקה</span>
        </button>

        <button
          onClick={() => setActiveStageTab('clarification')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeStageTab === 'clarification'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>שלב 2: שאלות מנחות ותשובות ({clarificationQuestions.length || (activeProject?.clarificationAnswers?.length || 0)})</span>
        </button>

        {activeProject?.projectOverview && (
          <button
            onClick={() => setActiveStageTab('overview')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeStageTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>שלב 3: אפיון הפקה & עוגן בננה פרו</span>
          </button>
        )}

        {activeProject && (
          <button
            onClick={() => setActiveStageTab('scenes')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeStageTab === 'scenes'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>שלב 4: סקירת סצנות ({activeProject.scenes.length})</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-medium animate-fadeIn">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs font-medium animate-fadeIn">
          {successMsg}
        </div>
      )}

      {/* STAGE 1: INITIAL BRIEF FORM */}
      {activeStageTab === 'brief' && (
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
                {referencePdfBase64 || referencePdfName ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{referencePdfName || 'קובץ PDF מקושר'}</span>
                        <span className="text-[10px] text-emerald-300">ה-PDF מנותח ומעובד עם Gemini</span>
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
                  accept="image/*"
                  className="hidden"
                />
                {referenceImageBase64 || referenceImageName ? (
                  <div className="flex items-center justify-between p-3 bg-indigo-950/30 border border-indigo-500/40 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{referenceImageName || 'תמונת רפרנס מקושרת'}</span>
                        <span className="text-[10px] text-indigo-300">תמונת הרפרנס מעובדת עם Gemini</span>
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
                    <span>העלה תמונת רפרנס / דמות (עד 5MB)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Link / Web URL */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1.5 font-semibold">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>קישור למסמך חיצוני / Google Sheets / Notion / עמוד אינטרנט:</span>
              </div>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... או https://example.com/page"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 7. Output Settings (Scene Count, Language, Aspect Ratio) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">כמות סצנות מבוקשת</label>
              <input
                type="number"
                min={1}
                max={20}
                value={sceneCount}
                onChange={(e) => setSceneCount(parseInt(e.target.value) || 4)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">שפת קריינות (TTS)</label>
              <select
                value={ttsLanguage}
                onChange={(e) => setTtsLanguage(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-purple-400 focus:outline-none cursor-pointer"
              >
                {TTS_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">יחס מסך (Aspect Ratio)</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-purple-400 focus:outline-none cursor-pointer"
              >
                <option value="16:9">16:9 (רוחב / מחשב ויוטיוב)</option>
                <option value="9:16">9:16 (אורך / סטורי וטיקטוק)</option>
                <option value="1:1">1:1 (ריבוע / פוסט אינסטגרם)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDirectGenerate}
              disabled={isGeneratingScript || !topic.trim()}
              className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>יצירה ישירה מהירה (דלג על שאלות מנחות)</span>
            </button>

            <button
              type="submit"
              disabled={isGeneratingScript || !topic.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingScript ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini מעבד ומנתח את הבריף...</span>
                </>
              ) : (
                <>
                  <span>שלב הבא: קבל שאלות מנחות מ-Gemini</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      )}

      {/* STAGE 2: CLARIFICATION QUESTIONS CHAT */}
      {activeStageTab === 'clarification' && (
        <div className="p-6 bg-slate-900/90 border border-pink-500/30 rounded-3xl space-y-6 shadow-2xl">
          
          <div className="p-4 bg-pink-950/30 border border-pink-500/30 rounded-2xl">
            <div className="flex items-center gap-2 text-pink-300 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>ניתוח Gemini AI Marketing & CRO:</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {clarificationAnalysis || 'Gemini ניתח את הנתונים ומציע 2-3 שאלות מיקוד כדי להבטיח אחוזי המרה מקסימליים:'}
            </p>
          </div>

          <div className="space-y-4">
            {clarificationQuestions.map((item, idx) => (
              <div key={item.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span>{item.question}</span>
                  </label>
                  {item.hint && <span className="text-[10px] text-slate-400">{item.hint}</span>}
                </div>

                <textarea
                  rows={2}
                  value={clarificationAnswers[item.id] || ''}
                  onChange={(e) => setClarificationAnswers({ ...clarificationAnswers, [item.id]: e.target.value })}
                  placeholder={item.suggestedAnswer || 'הזן את תשובתך או קבל את ההצעה...'}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-pink-400 focus:outline-none"
                />

                {item.suggestedAnswer && (
                  <button
                    type="button"
                    onClick={() => setClarificationAnswers({ ...clarificationAnswers, [item.id]: item.suggestedAnswer || '' })}
                    className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>אמץ הצעה: "{item.suggestedAnswer}"</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStageTab('brief')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>חזור לבריף</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmitWithClarifications}
              disabled={isGeneratingScript}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-pink-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingScript ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>בונה עץ סצנות אינטראקטיבי עם Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>צור עץ סטוריבורד אינטראקטיבי סופי 🎬</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* STAGE 3: OVERVIEW & BANANA PRO CONSISTENCY BIBLE */}
      {activeStageTab === 'overview' && activeProject?.projectOverview && (
        <div className="p-6 bg-slate-900/90 border border-indigo-500/30 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>אפיון הפקה כולל & עוגן עקביות בננה פרו</span>
            </h2>
            <span className="text-xs text-indigo-300 font-mono bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Gemini Architect Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5">
              <span className="text-indigo-400 font-bold block">חזון וקונספט (Concept):</span>
              <p className="text-slate-200 leading-relaxed">{activeProject.projectOverview.concept}</p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5">
              <span className="text-amber-400 font-bold block">עוגן בננה פרו (Consistency Seed):</span>
              <p className="text-amber-200 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800 break-all">
                {activeProject.projectOverview.bananaConsistencySeed || selectedStyle.visualPromptPrefix}
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5">
              <span className="text-pink-400 font-bold block">תנ"ך דמות (Character Bible):</span>
              <p className="text-slate-300 leading-relaxed">{activeProject.projectOverview.characterBible}</p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5">
              <span className="text-emerald-400 font-bold block">מדריך סביבה ותאורה (Visual Guide):</span>
              <p className="text-slate-300 leading-relaxed">{activeProject.projectOverview.visualGuide}</p>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: SCENES INSPECTION & CONTINUATION */}
      {activeStageTab === 'scenes' && activeProject && (
        <div className="p-6 bg-slate-900/90 border border-amber-500/30 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-amber-400" />
              <span>סקירת עץ הסצנות האינטראקטיבי ({activeProject.scenes.length} סצנות)</span>
            </h2>
            <button
              type="button"
              onClick={() => setTab('editor')}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30"
            >
              <Film className="w-3.5 h-3.5" />
              <span>עבור לעורך המלא</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProject.scenes.map((scene, idx) => (
              <div key={scene.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center">
                      {scene.sceneNumber}
                    </span>
                    <span className="text-xs font-bold text-white">{scene.title}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                    {scene.sceneRole || 'explainer'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  🗣️ {scene.dialogueScript}
                </p>

                {scene.interactiveActions && scene.interactiveActions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-400 font-bold block">שאלות / כפתורי פעולה אינטראקטיביים:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {scene.interactiveActions.map((act, aIdx) => (
                        <span key={aIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30">
                          🔘 {act.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Continuation Scene */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>הוסף סצנת המשך לעץ (Scene {activeProject.scenes.length + 1})</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">מקסימום 20 סצנות</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={continuationPrompt}
                onChange={(e) => setContinuationPrompt(e.target.value)}
                placeholder="הנחיה מיוחדת לסצנה הבאה (אופציונלי, למשל: שאלת העמקה על מחיר או מענה להתנגדות ספציפית)..."
                className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddContinuationScene}
                disabled={isAddingContinuation}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {isAddingContinuation ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>הוסף סצנה</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
