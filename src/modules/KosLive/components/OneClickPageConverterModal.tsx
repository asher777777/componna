import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Wand2, Film, Users, Target, Volume2, 
  Image as ImageIcon, CheckCircle2, Globe, Palette, FileText, 
  Play, Layers, X, Upload, ShieldCheck,
  Link as LinkIcon, MessageSquare, ArrowLeft,
  Lightbulb, Check, Edit3, Plus, RefreshCw, Eye, ListOrdered, BookOpen,
  Layout, HelpCircle as HelpIcon, Send, ExternalLink, CreditCard, PhoneCall, Trash2, Loader2, FolderOpen
} from 'lucide-react';
import { useKosLive } from '../context/KosLiveContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { FormBuilderContract, FormItemSummary } from '../../../core/contracts';
import { 
  PRODUCTION_TYPES_CATALOG, 
  VISUAL_STYLES_CATALOG, 
  TTS_LANGUAGES, 
  OUTPUT_DELIVERABLES,
  TARGET_AUDIENCE_CATALOG,
  MARKETING_HOOKS_CATALOG
} from '../config/catalogs';
import { 
  OutputDeliverablePreference, 
  ClarificationQuestionItem, 
  ExtractedPageSummary,
  LivingFormFieldConfig,
  AspectRatioType
} from '../types';
import { 
  extractPageContentForLiving, 
  convertSummaryToLivingCampaign,
  buildFormFieldsFromPageSummary
} from '../services/pageToLivingConverter';
import { LivingStorageService } from '../services/livingStorageService';
import { pickMediaFromGallery, uploadFileAndSyncToGallery } from '../services/livingMediaGalleryBridge';

export const OneClickPageConverterModal: React.FC = () => {
  const { db, storage } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const formBuilderCap = getCapability<FormBuilderContract>('smart-form-builder');

  const { 
    activeProject,
    setActiveProject,
    setActiveCampaign,
    createNewProject,
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
    setSelectedPageForWizard,
    loadProjects
  } = useKosLive();

  // Active Stage Tab: 'brief' | 'clarification' | 'overview' | 'scenes'
  const [activeStageTab, setActiveStageTab] = useState<'brief' | 'clarification' | 'overview' | 'scenes'>('brief');

  // Production & Visual Settings
  const [productionType, setProductionType] = useState<string>('landing_funnel');
  const [visualStyle, setVisualStyle] = useState<string>('cinematic_dramatic');
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [cardCountPerScene, setCardCountPerScene] = useState<number>(3);
  const [ttsLanguage, setTtsLanguage] = useState<string>('he-IL');
  const [outputPreference, setOutputPreference] = useState<OutputDeliverablePreference>('full_production');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');

  // Forms & Lead Capture Configuration
  const [includeLeadForm, setIncludeLeadForm] = useState<boolean>(true);
  const [smartFormId, setSmartFormId] = useState<string>('');
  const [formsApiEndpoint, setFormsApiEndpoint] = useState<string>('');
  const [availableSmartForms, setAvailableSmartForms] = useState<FormItemSummary[]>([]);
  const [customFormFields, setCustomFormFields] = useState<LivingFormFieldConfig[]>([
    { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text', required: true },
    { key: 'phone', label: 'מספר טלפון נייד / וואטסאפ', placeholder: '050-0000000', type: 'tel', required: true },
    { key: 'email', label: 'אימייל (אופציונלי)', placeholder: 'name@company.com', type: 'email', required: false }
  ]);

  // Brief Content
  const [topic, setTopic] = useState<string>('');
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(TARGET_AUDIENCE_CATALOG[0].id);
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCE_CATALOG[0].name);
  const [selectedHookId, setSelectedHookId] = useState<string>(MARKETING_HOOKS_CATALOG[0].id);
  const [marketingHook, setMarketingHook] = useState<string>(MARKETING_HOOKS_CATALOG[0].name);

  // Multimodal Reference Inputs
  const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const [referencePdfBase64, setReferencePdfBase64] = useState<string | null>(null);
  const [referencePdfName, setReferencePdfName] = useState<string | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const [documentUrl, setDocumentUrl] = useState<string>('');

  // Extracted Page Data Summary
  const [extractedSummary, setExtractedSummary] = useState<ExtractedPageSummary | null>(null);
  const [isInstantConverting, setIsInstantConverting] = useState<boolean>(false);

  // Clarification Stage State
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestionItem[]>([]);
  const [clarificationAnalysis, setClarificationAnalysis] = useState<string>('');
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

  // Continuation Scene
  const [continuationPrompt, setContinuationPrompt] = useState<string>('');
  const [isAddingContinuation, setIsAddingContinuation] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load KSF Smart Forms if capability is registered
  useEffect(() => {
    if (formBuilderCap?.getForms) {
      formBuilderCap.getForms().then(list => {
        if (Array.isArray(list)) setAvailableSmartForms(list);
      }).catch(() => {});
    } else if (formBuilderCap?.getActiveFormsList) {
      try {
        const list = formBuilderCap.getActiveFormsList();
        if (Array.isArray(list)) setAvailableSmartForms(list);
      } catch {}
    }
  }, [formBuilderCap]);

  // Auto-select first page if available and none selected
  useEffect(() => {
    if (availablePages.length > 0 && !selectedPageForWizard) {
      const targetPageId = localStorage.getItem('sdo_video_studio_target_page_id');
      const initialPage = (targetPageId && availablePages.find(p => p.pageId === targetPageId)) || availablePages[0];
      if (targetPageId) localStorage.removeItem('sdo_video_studio_target_page_id');
      handleSelectSourcePage(initialPage.pageId);
    }
  }, [availablePages]);

  const handleSelectSourcePage = (pageId: string) => {
    if (!pageId) {
      setSelectedPageForWizard(null);
      setExtractedSummary(null);
      return;
    }
    const page = availablePages.find(p => p.pageId === pageId);
    if (!page) return;

    setSelectedPageForWizard(page);
    const summary = extractPageContentForLiving(page);
    setExtractedSummary(summary);

    // Populate Topic, Hook, Form Fields & Card Count from the real page data
    const autoTopic = `${summary.pageTitle}${summary.heroHeadline ? ` - ${summary.heroHeadline}` : ''}`;
    setTopic(autoTopic);

    if (summary.heroSubheadline) {
      setMarketingHook(summary.heroSubheadline);
    }

    if (summary.formFields && summary.formFields.length > 0) {
      setCustomFormFields(buildFormFieldsFromPageSummary(summary));
    }
    if (summary.smartFormId) {
      setSmartFormId(summary.smartFormId);
    }

    // Recommend card count based on page services/products count
    const totalItems = summary.services.length + summary.pricingPackages.length;
    if (totalItems > 0) {
      setCardCountPerScene(Math.min(Math.max(totalItems, 2), 6));
    }
  };

  const handleSelectProductionType = (typeId: string) => {
    setProductionType(typeId);
    const found = PRODUCTION_TYPES_CATALOG.find(t => t.id === typeId);
    if (found) {
      setSceneCount(found.recommendedScenes);
      setCardCountPerScene(found.recommendedCards);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('גודל התמונה המקסימלי הוא 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImageBase64(reader.result as string);
      setReferenceImageName(file.name);
    };
    reader.readAsDataURL(file);

    try {
      await uploadFileAndSyncToGallery(file, file.name, 'image', {
        storage: storage as any,
        db: db as any,
        tenantId
      });
    } catch {}
  };

  const handlePickReferenceImageFromGallery = async () => {
    const url = await pickMediaFromGallery(getCapability as any, 'image');
    if (url) {
      setReferenceImageBase64(url);
      setReferenceImageName('תמונה מגלריית המדיה');
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('גודל קובץ ה-PDF המקסימלי הוא 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReferencePdfBase64(reader.result as string);
      setReferencePdfName(file.name);
    };
    reader.readAsDataURL(file);

    try {
      await uploadFileAndSyncToGallery(file, file.name, 'document', {
        storage: storage as any,
        db: db as any,
        tenantId
      });
    } catch {}
  };

  // Instant 1-Click Page Conversion (No AI wait required, uses 100% of extracted page data + selected card count & forms)
  const handleInstantPageConvert = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsInstantConverting(true);
    try {
      const summaryToUse: ExtractedPageSummary = extractedSummary || extractPageContentForLiving({
        pageId: 'page_custom_' + Date.now(),
        pageTitle: topic || 'עמוד חי אינטראקטיבי',
        slug: 'living-custom',
        sections: {
          hero: { type: 'hero', visible: true, title: topic || 'הפתרון המוביל שלנו', subtitle: marketingHook }
        }
      });

      summaryToUse.formFields = customFormFields;
      const { project, campaign } = convertSummaryToLivingCampaign(summaryToUse, {
        sceneCount,
        cardCountPerScene,
        includeLeadForm,
        smartFormId: smartFormId || summaryToUse.smartFormId,
        formsApiEndpoint,
        aspectRatio
      });

      await LivingStorageService.saveProject(db as any, tenantId, project);
      await LivingStorageService.saveCampaign(db as any, tenantId, campaign);
      setActiveProject(project);
      setActiveCampaign(campaign);
      await loadProjects();

      setSuccessMsg(`העמוד "${project.title}" הומר לעמוד חי עם ${project.scenes.length} סצנות ו-${cardCountPerScene} כרטיסים לסצנה!`);
      setActiveStageTab('scenes');
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה בהמרת העמוד.');
    } finally {
      setIsInstantConverting(false);
    }
  };

  // Ask Gemini Clarification Questions
  const handleStartClarification = async () => {
    if (!topic.trim()) {
      setErrorMsg('נא להזין נושא או לבחור עמוד קיים.');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await generateClarificationQuestions({
        topic,
        targetAudience,
        marketingHook,
        sceneCount,
        cardCountPerScene,
        includeLeadForm,
        smartFormId,
        formsApiEndpoint,
        customFormFields,
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

      setClarificationQuestions(res.questions || []);
      setClarificationAnalysis(res.analysisSummary || '');
      setActiveConversationId(res.conversationId);

      const initialAns: Record<string, string> = {};
      (res.questions || []).forEach(q => {
        if (q.suggestedAnswer) initialAns[q.id] = q.suggestedAnswer;
      });
      setClarificationAnswers(initialAns);
      setActiveStageTab('clarification');
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה ביצירת שאלות הבהרה מ-Gemini.');
    }
  };

  // Full AI Storyboard & Living Page Generation
  const handleGenerateFullAiProject = async (isRegenerate: boolean = false) => {
    if (!topic.trim()) {
      setErrorMsg('נא להזין נושא או לבחור עמוד לפני הפקת העמוד החי.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    const formattedAnswers = clarificationQuestions
      .map(q => ({ question: q.question, answer: clarificationAnswers[q.id] || '' }))
      .filter(a => a.answer.trim().length > 0);

    const params = {
      topic,
      targetAudience,
      marketingHook,
      sceneCount,
      cardCountPerScene,
      includeLeadForm,
      smartFormId: smartFormId || undefined,
      formsApiEndpoint: formsApiEndpoint.trim() || undefined,
      customFormFields,
      productionType,
      visualStyle,
      ttsLanguage,
      outputPreference,
      referenceImageBase64: referenceImageBase64 || undefined,
      referencePdfBase64: referencePdfBase64 || undefined,
      referencePdfName: referencePdfName || undefined,
      documentUrl: documentUrl.trim() || undefined,
      clarificationAnswers: formattedAnswers.length > 0 ? formattedAnswers : undefined,
      aspectRatio,
      conversationId: activeConversationId,
      brandDna,
      sourcePageId: selectedPageForWizard?.pageId,
      sourcePageTitle: selectedPageForWizard?.pageTitle,
      sourcePageSummary: extractedSummary
    };

    try {
      if (isRegenerate && activeProject) {
        const updated = await reGenerateProjectWithAI(activeProject.id, params);
        setSuccessMsg(`הפרויקט "${updated.title}" הופק מחדש ב-AI בהצלחה!`);
      } else {
        const created = await createProjectFromWizard(params);
        setSuccessMsg(`הפרויקט "${created.title}" נוצר בהצלחה עם ${created.scenes.length} סצנות ו-${cardCountPerScene} כרטיסים לסצנה!`);
      }
      setActiveStageTab('scenes');
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה ביצירת תסריט ועמוד חי ב-AI.');
    }
  };

  const handleAddContinuationScene = async () => {
    if (!activeProject) return;
    setIsAddingContinuation(true);
    setErrorMsg(null);
    try {
      const newScene = await addNextSceneWithAI(continuationPrompt.trim() || undefined);
      if (newScene) {
        setContinuationPrompt('');
        setSuccessMsg(`נוספה סצנת המשך חדשה (#${newScene.sceneNumber}: ${newScene.title})!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה בהוספת סצנת המשך.');
    } finally {
      setIsAddingContinuation(false);
    }
  };

  const addFormField = () => {
    setCustomFormFields(prev => [
      ...prev,
      { key: `field_${Date.now()}`, label: 'שדה חדש', placeholder: 'הזן ערך...', type: 'text', required: false }
    ]);
  };

  const updateFormField = (idx: number, patch: Partial<LivingFormFieldConfig>) => {
    setCustomFormFields(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));
  };

  const removeFormField = (idx: number) => {
    setCustomFormFields(prev => prev.filter((_, i) => i !== idx));
  };

  const selectedVisualStyleObj = VISUAL_STYLES_CATALOG.find(v => v.id === visualStyle);

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-5 text-right select-none" dir="rtl">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-l from-amber-900/40 via-slate-900 to-indigo-950/50 border border-amber-500/30 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 space-x-reverse px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>אדריכל עמודים חיים וסטודיו הפקות אווטארים AI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              הפיכת עמוד, מוצר או תוכן לעמוד חי אינטראקטיבי
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              חברו עמוד קיים מיוצר העמודים (KosWebAi), בחרו כמות סצנות וכמות כרטיסים לקרוסלה, הגדירו טפסי לידים חכמים והפיקו חוויית וידאו חיה עם אווטארים מדברים, כתוביות וניתוב קולי.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeProject && (
              <button
                type="button"
                onClick={() => setTab('timeline')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>עבור לעורך הסצנות המלא ({activeProject.scenes.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => createNewProject()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>פרויקט ריק חדש</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stage Navigation Stepper */}
      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveStageTab('brief')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeStageTab === 'brief'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>1. חיבור עמוד, כרטיסים, טפסים ואפיון</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStageTab('clarification')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeStageTab === 'clarification'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpIcon className="w-3.5 h-3.5" />
            <span>2. מיקוד ושאלות הבהרה (AI)</span>
            {clarificationQuestions.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-950/30 text-amber-300">
                {clarificationQuestions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveStageTab('overview')}
            disabled={!activeProject?.projectOverview}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeStageTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : activeProject?.projectOverview
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. תנ"ך המותג ועקביות Banana Pro</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStageTab('scenes')}
            disabled={!activeProject || activeProject.scenes.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeStageTab === 'scenes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : activeProject && activeProject.scenes.length > 0
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>4. סקירת סצנות ({activeProject?.scenes?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('timeline')}
              className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-[11px] cursor-pointer"
            >
              ערוך סצנות בסטודיו ➔
            </button>
            <button
              onClick={() => setTab('preview')}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[11px] cursor-pointer"
            >
              נגן עכשיו ▶
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STAGE 1: BRIEF, PAGE EXTRACTOR, CARD COUNT & FORMS                  */}
      {/* =================================================================== */}
      {activeStageTab === 'brief' && (
        <div className="space-y-6">
          
          {/* 1. Deep Page Builder & Brand DNA Connection Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Brand DNA Card (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <span>מרכז המיתוג הגלובלי (Brand DNA)</span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        מסונכרן
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">הנחיות הקול, הפרסונות ומילות הכוח מוזרקות אוטומטית</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => refreshBrandDna()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="רענן נתוני מיתוג"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {brandDna ? (
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">שם המותג:</span>
                    <span className="text-white font-bold truncate block">{brandDna.identity?.companyName || 'המותג'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">טון דיבור:</span>
                    <span className="text-amber-300 font-bold truncate block">
                      רשמיות {brandDna.voice?.personality?.formality || 3}/5 • אנרגיה {brandDna.voice?.personality?.energy || 4}/5
                    </span>
                  </div>
                  <div className="col-span-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">מילות כוח לשילוב בתסריט:</span>
                    <span className="text-emerald-300 font-semibold">
                      {(brandDna.voice?.powerWords || []).slice(0, 6).join(', ') || 'איכות, מקצועיות, תוצאות'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">משתמש בהגדרות מיתוג ברירת מחדל של הטננט.</p>
              )}
            </div>

            {/* KosWebAi Page Builder Deep Extractor (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Layout className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <span>חיבור עמוק לעמוד נחיתה קיים (KosWebAi Page Extractor)</span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {availablePages.length} עמודים זמינים
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      שואב כותרות, שירותים, מחירים, שאלות נפוצות וטפסים ובונה מהם סצנות וכרטיסים
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => refreshPages()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="רענן רשימת עמודים"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedPageForWizard?.pageId || ''}
                  onChange={(e) => handleSelectSourcePage(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- ללא עמוד מקושר (הזנת בריף / מוצר חופשי) --</option>
                  {availablePages.map((p) => (
                    <option key={p.pageId} value={p.pageId}>
                      📄 {p.pageTitle} ({p.slug})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleInstantPageConvert}
                  disabled={isInstantConverting}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
                >
                  {isInstantConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>המרה מיידית מנתוני העמוד ➔</span>
                </button>
              </div>

              {/* Extracted Page Real Data Breakdown */}
              {extractedSummary && (
                <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-200">
                      נתונים שחולצו מהעמוד "{extractedSummary.pageTitle}":
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">✓ מוכן להזרקה לסצנות ולכרטיסים</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-amber-400 font-black text-sm block">{extractedSummary.services.length}</span>
                      <span className="text-[10px] text-slate-400">שירותים ויתרונות</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-emerald-400 font-black text-sm block">{extractedSummary.pricingPackages.length}</span>
                      <span className="text-[10px] text-slate-400">חבילות מחיר</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-cyan-400 font-black text-sm block">{extractedSummary.faqItems.length}</span>
                      <span className="text-[10px] text-slate-400">שאלות נפוצות</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-purple-400 font-black text-sm block">{extractedSummary.testimonials.length}</span>
                      <span className="text-[10px] text-slate-400">המלצות לקוחות</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-pink-400 font-black text-sm block">{extractedSummary.formFields.length || 3}</span>
                      <span className="text-[10px] text-slate-400">שדות טופס</span>
                    </div>
                  </div>

                  {extractedSummary.heroHeadline && (
                    <div className="text-[11px] text-slate-300 truncate">
                      <span className="text-slate-500">כותרת Hero: </span>
                      <span className="font-semibold text-white">{extractedSummary.heroHeadline}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* 2. Scene Count, Card Count per Scene & Interactive Forms Configurator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Card Count & Scene Count Selector (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black text-white">בחירת כמות סצנות וכמות כרטיסים</h3>
                  <p className="text-[11px] text-slate-400">שליטה מדויקת במספר הסצנות ובכמות הכרטיסיות בקרוסלה</p>
                </div>
              </div>

              {/* Scene Count (1 - 20) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">מספר סצנות בעמוד החי:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                    {sceneCount} סצנות
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>סצנה 1</span>
                  <span>4 (מומלץ)</span>
                  <span>8 סצנות</span>
                  <span>15 סצנות</span>
                </div>
              </div>

              {/* Card Count Per Scene Selector (0 - 10) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">כמות כרטיסים בקרוסלה לכל סצנה:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-black border border-purple-500/40">
                    {cardCountPerScene === 0 ? 'ללא כרטיסים' : `${cardCountPerScene} כרטיסים לסצנה`}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 8, 10].slice(0, 6).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCardCountPerScene(num)}
                      className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                        cardCountPerScene === num
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {num === 0 ? 'ללא' : num}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCardCountPerScene(num)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        cardCountPerScene === num
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {num} כרטיסים
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio & Language */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">יחס תצוגה:</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="9:16">📱 9:16 (אנכי - מובייל/רילס)</option>
                    <option value="16:9">💻 16:9 (רוחבי - דסקטופ)</option>
                    <option value="1:1">⬛ 1:1 (ריבועי)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">שפת דיבוב (TTS):</label>
                  <select
                    value={ttsLanguage}
                    onChange={(e) => setTtsLanguage(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    {TTS_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Forms & Lead Capture Builder (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-black text-white">טפסים אינטראקטיביים וחיבור ל-CRM / KSF</h3>
                    <p className="text-[11px] text-slate-400">הגדרת שדות הטופס שיופיעו על גבי הוידאו בסצנת הסגירה</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={includeLeadForm}
                    onChange={(e) => setIncludeLeadForm(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-300">הפעל טופס לידים בעמוד החי</span>
                </label>
              </div>

              {includeLeadForm && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        חיבור לטופס חכם (KSF Smart Form):
                      </label>
                      <select
                        value={smartFormId}
                        onChange={(e) => setSmartFormId(e.target.value)}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      >
                        <option value="">-- טופס מובנה מהיר (לשמירה ישירה ב-CRM) --</option>
                        {availableSmartForms.map(f => (
                          <option key={f.id} value={f.id}>📋 {f.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        כתובת Webhook חיצוני (אופציונלי):
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={formsApiEndpoint}
                        onChange={(e) => setFormsApiEndpoint(e.target.value)}
                        placeholder="https://hook.eu1.make.com/..."
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* Dynamic Form Fields Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        שדות הטופס ({customFormFields.length}):
                      </span>
                      <button
                        type="button"
                        onClick={addFormField}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>הוסף שדה לטופס</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {customFormFields.map((field, idx) => (
                        <div key={field.key || idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateFormField(idx, { label: e.target.value })}
                            placeholder="תווית השדה"
                            className="col-span-4 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateFormField(idx, { type: e.target.value as any })}
                            className="col-span-3 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                          >
                            <option value="text">טקסט</option>
                            <option value="tel">טלפון</option>
                            <option value="email">אימייל</option>
                            <option value="textarea">הודעה ארוכה</option>
                            <option value="number">מספר</option>
                          </select>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateFormField(idx, { placeholder: e.target.value })}
                            placeholder="טקסט רמז (Placeholder)"
                            className="col-span-3 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                          />
                          <div className="col-span-2 flex items-center justify-end gap-1.5">
                            <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required !== false}
                                onChange={(e) => updateFormField(idx, { required: e.target.checked })}
                                className="accent-emerald-500"
                              />
                              <span>חובה</span>
                            </label>
                            {customFormFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFormField(idx)}
                                className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 3. Topic, 20 Target Audiences & 20 Marketing Hooks */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>נושא ההפקה, קהל יעד והוק שיווקי</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                נושא העמוד החי / המוצר / ההצעה המרכזית:
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="תארו את השירות, המוצר או העמוד שברצונכם להפוך לעמוד חי..."
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 20 Target Audiences */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  קהל יעד מרכזי (20 קטגוריות מובנות + עריכה חופשית):
                </label>
                <select
                  value={selectedAudienceId}
                  onChange={(e) => {
                    setSelectedAudienceId(e.target.value);
                    const found = TARGET_AUDIENCE_CATALOG.find(a => a.id === e.target.value);
                    if (found) setTargetAudience(found.name);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  {TARGET_AUDIENCE_CATALOG.map(a => (
                    <option key={a.id} value={a.id}>[{a.category}] {a.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs"
                  placeholder="דיוק קהל היעד..."
                />
              </div>

              {/* 20 Marketing Hooks */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  הוק שיווקי והבטחה מרכזית (20 תבניות המרה):
                </label>
                <select
                  value={selectedHookId}
                  onChange={(e) => {
                    setSelectedHookId(e.target.value);
                    const found = MARKETING_HOOKS_CATALOG.find(h => h.id === e.target.value);
                    if (found) setMarketingHook(found.name);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  {MARKETING_HOOKS_CATALOG.map(h => (
                    <option key={h.id} value={h.id}>{h.badge} - {h.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={marketingHook}
                  onChange={(e) => setMarketingHook(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs"
                  placeholder="דיוק ההבטחה השיווקית..."
                />
              </div>
            </div>
          </div>

          {/* 4. 20 Production Types & 20 Visual Styles (Banana Pro) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* 20 Production Types */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>סוג הפקה ותבנית משפך (20 סוגי הפקות)</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {PRODUCTION_TYPES_CATALOG.map((pt) => {
                  const isSelected = productionType === pt.id;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => handleSelectProductionType(pt.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer text-right ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{pt.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                          {pt.recommendedScenes} סצ׳ • {pt.recommendedCards} כרט׳
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{pt.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 20 Visual Styles + Banana Pro Seed */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>סגנון ויזואלי וסינמטי (20 סגנונות Banana Pro)</span>
                </h3>
                {selectedVisualStyleObj && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {selectedVisualStyleObj.badge}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {VISUAL_STYLES_CATALOG.map((vs) => {
                  const isSelected = visualStyle === vs.id;
                  return (
                    <div
                      key={vs.id}
                      onClick={() => setVisualStyle(vs.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer text-right ${
                        isSelected
                          ? 'bg-purple-500/15 border-purple-500 text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{vs.name}</span>
                        <span className="text-[10px] text-purple-300">{vs.badge}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{vs.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 5. Multimodal Context Attachments (PDF, Reference Image, Document URL) */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>חומרי עזר מולטי-מודאליים ל-AI (תמונת רפרנס, מצגת PDF, קישור חיצוני)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Image upload + Gallery Picker */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-200 block">תמונת פרזנטור / מוצר</span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {referenceImageName || 'העלה (נשמר בגלריה) או בחר מהגלריה'}
                  </span>
                </div>
                <input ref={imageFileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer"
                  >
                    {referenceImageBase64 ? 'החלף' : 'העלה'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePickReferenceImageFromGallery}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>מהגלריה</span>
                  </button>
                </div>
              </div>

              {/* PDF upload */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-200 block">מסמך / מצגת PDF</span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {referencePdfName || 'קובץ PDF עד 10MB'}
                  </span>
                </div>
                <input ref={pdfFileInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => pdfFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold cursor-pointer shrink-0"
                >
                  {referencePdfBase64 ? 'החלף' : 'העלה PDF'}
                </button>
              </div>

              {/* External Link */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="url"
                  dir="ltr"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 6. Bottom Action Bar */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
            <div className="space-y-0.5">
              <div className="text-xs font-black text-white">
                סיכום הפקה: {sceneCount} סצנות • {cardCountPerScene} כרטיסים לסצנה • {includeLeadForm ? `טופס לידים (${customFormFields.length} שדות)` : 'ללא טופס'}
              </div>
              <div className="text-[11px] text-slate-400">
                ניתן להמיר מיידית מנתוני העמוד או להפיק תסריט AI מלא דרך סוכן Gemini
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleStartClarification}
                disabled={isGeneratingScript}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <HelpIcon className="w-4 h-4" />
                <span>דיוק בשאלות הבהרה (Gemini)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateFullAiProject(false)}
                disabled={isGeneratingScript}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isGeneratingScript ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>מפיק עמוד חי, כרטיסים ותסריט ב-AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>הפק עמוד חי מלא ב-AI עכשיו ➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* STAGE 2: GEMINI AI CLARIFICATION QUESTIONS                          */}
      {/* =================================================================== */}
      {activeStageTab === 'clarification' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white">שאלות מיקוד והבהרה של הבמאי (Gemini AI)</h3>
              <p className="text-xs text-slate-400">{clarificationAnalysis || 'ענו על השאלות או אמצו את התשובות המוצעות בלחיצה'}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveStageTab('brief')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
            >
              חזרה להגדרות
            </button>
          </div>

          {clarificationQuestions.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-slate-400">טרם הופקו שאלות הבהרה לפרויקט זה.</p>
              <button
                type="button"
                onClick={handleStartClarification}
                disabled={isGeneratingScript}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
              >
                צור שאלות מיקוד עם Gemini עכשיו
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {clarificationQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">שאלה #{idx + 1}: {q.question}</span>
                    {q.suggestedAnswer && (
                      <button
                        type="button"
                        onClick={() => setClarificationAnswers(prev => ({ ...prev, [q.id]: q.suggestedAnswer! }))}
                        className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                      >
                        אמץ הצעת AI
                      </button>
                    )}
                  </div>
                  {q.hint && <p className="text-[11px] text-slate-500">{q.hint}</p>}
                  <textarea
                    rows={2}
                    value={clarificationAnswers[q.id] || ''}
                    onChange={(e) => setClarificationAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerateFullAiProject(false)}
                  disabled={isGeneratingScript}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>הפק עמוד חי מותאם לתשובות אלו ➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* STAGE 3: PROJECT OVERVIEW & BANANA PRO BIBLE                        */}
      {/* =================================================================== */}
      {activeStageTab === 'overview' && activeProject?.projectOverview && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>תנ"ך המותג ועקביות ויזואלית (Banana Pro Bible)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">קונספט מרכזי:</span>
              <p className="text-slate-200 leading-relaxed">{activeProject.projectOverview.concept}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">קשת נרטיבית ומשפך:</span>
              <p className="text-slate-200 leading-relaxed">{activeProject.projectOverview.narrativeArc}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-purple-400 font-bold block">Character Bible (עקביות פרזנטור):</span>
              <p className="text-slate-300 font-mono text-[11px]" dir="ltr">{activeProject.projectOverview.characterBible}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block">Banana Pro Consistency Seed:</span>
              <p className="text-slate-300 font-mono text-[11px]" dir="ltr">{activeProject.projectOverview.bananaConsistencySeed}</p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STAGE 4: SCENES, CARDS & FORMS INSPECTION + CONTINUATION            */}
      {/* =================================================================== */}
      {activeStageTab === 'scenes' && activeProject && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white">{activeProject.title}</h3>
              <p className="text-xs text-slate-400">
                {activeProject.scenes.length} סצנות אינטראקטיביות • לחצו על עורך הסצנות לעריכה מלאה של וידאו, קריינות, כרטיסים וטפסים
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab('timeline')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>פתח בעורך הסצנות המלא</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>הפעל בסימולטור הנגן</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProject.scenes.map((scn, idx) => {
              const carouselOverlay = scn.overlays?.find(o => o.type === 'carousel');
              const formOverlay = scn.overlays?.find(o => o.type === 'form_input');
              const actionsOverlay = scn.overlays?.find(o => o.type === 'quick_replies');
              return (
                <div key={scn.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                      סצנה #{idx + 1}: {scn.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{scn.sceneRole}</span>
                  </div>
                  <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                    "{scn.dialogueScript}"
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    {carouselOverlay?.cards && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        🗂️ {carouselOverlay.cards.length} כרטיסים בקרוסלה
                      </span>
                    )}
                    {formOverlay && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        📋 טופס לידים ({formOverlay.formFields?.length || 2} שדות)
                      </span>
                    )}
                    {actionsOverlay?.actions && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        🔀 {actionsOverlay.actions.length} כפתורי הסתעפות
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Continuation Scene */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={continuationPrompt}
              onChange={(e) => setContinuationPrompt(e.target.value)}
              placeholder="הנחיה לסצנת המשך נוספת (למשל: סצנת בונוס עם הצעה מיוחדת למתלבטים)..."
              className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs w-full"
            />
            <button
              type="button"
              onClick={handleAddContinuationScene}
              disabled={isAddingContinuation}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isAddingContinuation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>הוסף סצנת המשך ב-AI</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
