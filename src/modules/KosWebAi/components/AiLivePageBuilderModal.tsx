import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, MediaPickerContract } from '../../../core/contracts';
import { MarketingIdea } from '../types';
import { pageGenerator } from '../generators/pageGenerator';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  X,
  GraduationCap,
  Heart,
  MapPin,
  Zap,
  Image as ImageIcon,
  Settings,
  AlertCircle,
  Lightbulb,
  Calendar,
  Clock,
  Target,
  DollarSign,
  FileText,
  HelpCircle,
  Phone,
  Upload,
  Check,
  Edit3,
  Compass,
  Trash2,
  Plus,
  Users,
  Home,
  BookOpen,
  CreditCard,
  Globe,
  Link2,
  Database,
  Wand2,
  SlidersHorizontal,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { TenantTokenBadge } from '../../../core/ai';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import {
  PAGE_ARCHITECTURE_MATRIX,
  MatrixPageTypeId,
  getMatrixPageType,
  buildIntakeQuestionsForPage,
  buildPreFilledHeroImagePrompt,
  STANDARD_CRM_FORM_FIELDS,
  CrmFormFieldSpec,
} from '../config/pageArchitectureMatrix';
import {
  IngestedSourceItem,
  extractTextFromUploadedFile,
  scanWebsiteUrlForGrounding,
} from '../services/sourceIngestionService';
import {
  WizardStepOptions,
  StructuredPageDraft,
  StreamStepInfo,
  generateStructuredPageDraft,
  streamPageBuilding,
} from '../services/structuredPageAiService';
import { dispatchSectionEnhancementToKosai } from '../kosai/promptToKosai';

interface AiLivePageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (generatedConfig: PageBuilderConfig) => void;
  onOpenMarketingDrawer?: () => void;
}

type ModalStage = 'page_type' | 'intake' | 'review' | 'streaming';

export const AiLivePageBuilderModal: React.FC<AiLivePageBuilderModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const { openConnectorModal, getApiKeysForModule } = useSystemConnection();

  const [stage, setStage] = useState<ModalStage>('page_type');

  // Stage 1: Matrix Page Type & Optional Section Customization
  const [selectedPageTypeId, setSelectedPageTypeId] = useState<MatrixPageTypeId>('landing');
  const [selectedSectionTypes, setSelectedSectionTypes] = useState<SectionType[]>(
    getMatrixPageType('landing').sections
  );
  const [showSectionCustomizer, setShowSectionCustomizer] = useState(false);

  // Quick Marketing Ideas
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // Stage 2: One-Question-at-a-Time Intake
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [promptTopic, setPromptTopic] = useState('');

  // Grounding Sources (PDF/DOCX, URL, Pasted Text)
  const [groundingSources, setGroundingSources] = useState<IngestedSourceItem[]>([]);
  const [scanUrlInput, setScanUrlInput] = useState('');
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [pastedSourceText, setPastedSourceText] = useState('');

  // Hero Media
  const [imageMode, setImageMode] = useState<'gallery' | 'ai' | 'unsplash' | 'none'>('gallery');
  const [selectedGalleryImageUrl, setSelectedGalleryImageUrl] = useState('');
  const [customHeroImagePrompt, setCustomHeroImagePrompt] = useState('');

  // Event Hard Facts
  const [eventDate, setEventDate] = useState('2026-12-01');
  const [eventTime, setEventTime] = useState('19:30');
  const [eventEndTime, setEventEndTime] = useState('22:00');
  const [locationName, setLocationName] = useState('מרכז הכנסים והאירועים');
  const [locationAddress, setLocationAddress] = useState(brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב');
  const [wazeQuery, setWazeQuery] = useState(brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144 תל אביב');

  // Campaign Hard Facts
  const [targetGoal, setTargetGoal] = useState<number>(100000);
  const [totalRaised, setTotalRaised] = useState<number>(45000);
  const [campaignCause, setCampaignCause] = useState('');

  // Pricing & Kesher Checkout Hard Facts
  const [kesherDocType, setKesherDocType] = useState<320 | 400 | 405>(320);
  const [enableInstallments, setEnableInstallments] = useState(true);
  const [maxInstallments, setMaxInstallments] = useState(12);
  const [pricingPlans, setPricingPlans] = useState<
    Array<{ id: string; name: string; priceMonthly: number; description: string; isFeatured?: boolean }>
  >([
    { id: 'p1', name: 'מסלול בסיסי', priceMonthly: 490, description: 'פתרון ממוקד להתחלה מהירה', isFeatured: false },
    { id: 'p2', name: 'מסלול פרימיום', priceMonthly: 990, description: 'המסלול המלא והמבוקש ביותר', isFeatured: true },
  ]);

  // Geo Local
  const [geoCity, setGeoCity] = useState('תל אביב והמרכז');
  const [geoAreasText, setGeoAreasText] = useState('תל אביב, רמת גן, גבעתיים, הרצליה');

  // CRM Form Fields
  const [selectedCrmFieldKeys, setSelectedCrmFieldKeys] = useState<string[]>(
    STANDARD_CRM_FORM_FIELDS.filter((f) => f.defaultSelected).map((f) => f.crmFieldKey)
  );

  // SEO/GEO 2026.4 Focus
  const [authorName, setAuthorName] = useState(brandDna?.identity?.companyName || '');
  const [targetGeoQuestion, setTargetGeoQuestion] = useState('');

  // Stage 3: Draft Review & Inline AI Refine
  const [draft, setDraft] = useState<StructuredPageDraft | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<'hero' | 'content' | 'details' | 'faq' | 'seo'>('hero');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isRefiningTab, setIsRefiningTab] = useState(false);

  // Stage 4: Streaming
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamStep, setCurrentStreamStep] = useState<StreamStepInfo | null>(null);
  const [streamedConfig, setStreamedConfig] = useState<PageBuilderConfig | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const moduleKeys = getApiKeysForModule('KosWebAi');
  const apiKey = moduleKeys.googleAiApiKey || '';

  const wasOpenRef = useRef(false);
  const isLoadingIdeasRef = useRef(false);

  const selectedMatrixDef = useMemo(() => getMatrixPageType(selectedPageTypeId), [selectedPageTypeId]);
  const intakeSteps = useMemo(
    () => buildIntakeQuestionsForPage(selectedMatrixDef, selectedSectionTypes),
    [selectedMatrixDef, selectedSectionTypes]
  );

  const prefilledImageSpec = useMemo(
    () => buildPreFilledHeroImagePrompt(promptTopic, selectedMatrixDef, brandDna),
    [promptTopic, selectedMatrixDef, brandDna]
  );

  useEffect(() => {
    if (!customHeroImagePrompt && prefilledImageSpec.prompt) {
      setCustomHeroImagePrompt(prefilledImageSpec.prompt);
    }
  }, [prefilledImageSpec.prompt]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setStage('page_type');
      setActiveQuestionIdx(0);
      setPromptTopic('');
      setGroundingSources([]);
      setPastedSourceText('');
      setScanUrlInput('');
      setSelectedGalleryImageUrl('');
      setCustomHeroImagePrompt('');
      setErrorMsg(null);
      setDraft(null);
      setIsStreaming(false);
      setCurrentStreamStep(null);
      setStreamedConfig(null);
      setAuthorName(brandDna?.identity?.companyName || '');
      if (ideas.length === 0) {
        loadIdeas();
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, ideas.length]);

  const loadIdeas = async (force: boolean = false) => {
    if (isLoadingIdeasRef.current) return;
    if (!force && ideas.length > 0) return;
    isLoadingIdeasRef.current = true;
    setLoadingIdeas(true);
    try {
      const existingPages = await pageBuilderFirestore.getAllPages();
      const generatedIdeas = await pageGenerator.generatePageIdeas(brandDna, apiKey, existingPages, force);
      setIdeas(generatedIdeas);
    } catch (err) {
      console.warn('Could not load marketing ideas:', err);
    } finally {
      setLoadingIdeas(false);
      isLoadingIdeasRef.current = false;
    }
  };

  if (!isOpen) return null;

  const handleSelectPageType = (id: MatrixPageTypeId) => {
    setSelectedPageTypeId(id);
    const def = getMatrixPageType(id);
    setSelectedSectionTypes([...def.sections]);
    setActiveQuestionIdx(0);
  };

  const toggleSection = (type: SectionType) => {
    if (selectedSectionTypes.includes(type)) {
      if (selectedSectionTypes.length <= 1) return;
      setSelectedSectionTypes((prev) => prev.filter((t) => t !== type));
    } else {
      setSelectedSectionTypes((prev) => [...prev, type]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const item = await extractTextFromUploadedFile(file);
    setGroundingSources((prev) => [...prev, item]);
    e.target.value = '';
  };

  const handleScanUrl = async () => {
    if (!scanUrlInput.trim()) return;
    setIsScanningUrl(true);
    const item = await scanWebsiteUrlForGrounding(scanUrlInput);
    setGroundingSources((prev) => [...prev, item]);
    setScanUrlInput('');
    setIsScanningUrl(false);
  };

  const handleAddPastedSource = () => {
    if (!pastedSourceText.trim()) return;
    setGroundingSources((prev) => [
      ...prev,
      {
        id: `src_text_${Date.now()}`,
        type: 'text',
        label: 'טקסט חופשי שהודבק',
        extractedText: pastedSourceText.trim().slice(0, 6000),
        charCount: pastedSourceText.trim().length,
      },
    ]);
    setPastedSourceText('');
  };

  const handleHeroImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedGalleryImageUrl(reader.result);
        setImageMode('gallery');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePickOrCreateFromGallery = async () => {
    if (mediaPicker?.openPicker) {
      try {
        const promptToPass = customHeroImagePrompt || prefilledImageSpec.prompt;
        const selected = await mediaPicker.openPicker({
          accept: 'image/*',
          title: `בחר או צור תמונה (${prefilledImageSpec.width}x${prefilledImageSpec.height})`,
          // Pass pre-filled AI generation hint if gallery supports it
          ...( { aiPrompt: promptToPass, aspectRatio: prefilledImageSpec.aspectRatio } as any ),
        });
        const item = Array.isArray(selected) ? selected[0] : selected;
        const url = typeof item === 'string' ? item : (item as any)?.url || '';
        if (url) {
          setSelectedGalleryImageUrl(url);
          setImageMode('gallery');
        }
      } catch (err) {
        console.warn('Gallery picker canceled:', err);
      }
    } else {
      setErrorMsg('גלריית המדיה אינה זמינה כרגע — ניתן להעלות תמונה ישירות מהמחשב.');
    }
  };

  const buildWizardOptions = (): WizardStepOptions => {
    const selectedCrmSpecs: CrmFormFieldSpec[] = STANDARD_CRM_FORM_FIELDS.filter((f) =>
      selectedCrmFieldKeys.includes(f.crmFieldKey)
    );

    const allSources = [...groundingSources];
    if (pastedSourceText.trim()) {
      allSources.push({
        id: 'pasted_inline',
        type: 'text',
        label: 'בריף טקסט מהמשתמש',
        extractedText: pastedSourceText.trim(),
        charCount: pastedSourceText.trim().length,
      });
    }

    return {
      promptTopic: promptTopic.trim() || selectedMatrixDef.shortTitleHe,
      selectedSectionTypes,
      pageTypeId: selectedPageTypeId,
      groundingSources: allSources.map((s) => ({
        label: s.label,
        extractedText: s.extractedText,
      })),
      eventDetails: selectedSectionTypes.some((t) => t === 'eventRsvp' || t === 'timer')
        ? { locationName, locationAddress, wazeQuery, eventDate, eventTime, eventEndTime }
        : undefined,
      campaignDetails: selectedSectionTypes.some((t) => t === 'campaignHeader' || t === 'campaignTiers')
        ? { targetGoal, totalRaised, campaignCause: campaignCause || promptTopic }
        : undefined,
      pricingDetails: selectedSectionTypes.includes('pricing')
        ? {
            documentType: kesherDocType,
            enableInstallments,
            maxInstallments,
            plans: pricingPlans,
          }
        : undefined,
      geoDetails: selectedSectionTypes.includes('geoLocal')
        ? {
            targetCity: geoCity,
            serviceAreas: geoAreasText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          }
        : undefined,
      crmFormFields: selectedCrmSpecs,
      seoGeoFocus: {
        authorName: authorName.trim() || brandDna?.identity?.companyName || '',
        targetQuestion: targetGeoQuestion.trim(),
      },
      imageSelection: {
        mode: imageMode,
        selectedImageUrl: selectedGalleryImageUrl,
        aiImagePrompt: customHeroImagePrompt || prefilledImageSpec.prompt,
      },
    };
  };

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    setErrorMsg(null);
    try {
      const wizardOptions = buildWizardOptions();
      const generatedDraft = await generateStructuredPageDraft(wizardOptions, brandDna, apiKey);
      setDraft(generatedDraft);
      setStage('review');
    } catch (err: any) {
      console.error('Draft generation error:', err);
      setErrorMsg(err?.message || 'שגיאה במהלך הפקת הטיוטה.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleQuickRefineSection = async (sectionKey: 'hero' | 'richContent' | 'faq', instruction: string) => {
    if (!draft) return;
    setIsRefiningTab(true);
    try {
      const company = brandDna?.identity?.companyName || 'המותג';
      const currentData =
        sectionKey === 'hero' ? draft.hero : sectionKey === 'richContent' ? draft.richContent : draft.faqs;

      const updated = await dispatchSectionEnhancementToKosai(
        {
          sectionType: sectionKey,
          userPrompt: instruction,
          companyName: company,
          currentConfig: currentData,
        },
        { apiKey }
      );

      if (updated && typeof updated === 'object') {
        setDraft((prev) => {
          if (!prev) return prev;
          if (sectionKey === 'hero') {
            return { ...prev, hero: { ...prev.hero, ...updated } };
          }
          if (sectionKey === 'richContent') {
            return { ...prev, richContent: { ...prev.richContent!, ...updated } };
          }
          if (sectionKey === 'faq' && Array.isArray(updated.items || updated)) {
            return { ...prev, faqs: updated.items || updated };
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('Quick refine failed:', err);
    } finally {
      setIsRefiningTab(false);
    }
  };

  const handleStartStreaming = async () => {
    if (!draft) return;
    setStage('streaming');
    setIsStreaming(true);
    setErrorMsg(null);

    try {
      const wizardOptions = buildWizardOptions();
      const finalConfig = await streamPageBuilding(
        draft,
        wizardOptions,
        brandDna,
        (step, partial) => {
          setCurrentStreamStep(step);
          setStreamedConfig(partial);
        }
      );

      setIsStreaming(false);
      onComplete(finalConfig);
      onClose();
    } catch (err: any) {
      console.error('Streaming error:', err);
      setIsStreaming(false);
      setErrorMsg(err?.message || 'שגיאה במהלך הרכבת העמוד.');
    }
  };

  const getMatrixIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Calendar': return <Calendar className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const currentQuestion = intakeSteps[activeQuestionIdx];
  const isLastIntakeQuestion = activeQuestionIdx >= intakeSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-text" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#07090e] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 flex-wrap">
                <span>אדריכל העמודים החכם (AI + GEO 2026)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  {stage === 'page_type' && 'שלב 1: בחירת ארכיטקטורת עמוד'}
                  {stage === 'intake' && `שאלה ${activeQuestionIdx + 1} מתוך ${intakeSteps.length}`}
                  {stage === 'review' && 'תצוגה ועריכת טיוטה'}
                  {stage === 'streaming' && 'הרכבה והזרמה חיה'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedMatrixDef.titleHe} • מותאם ל-Brand DNA, CRM, סליקה ופרוטוקול SEO/GEO 2026.4
              </p>
            </div>
          </div>
          {!isStreaming && (
            <div className="flex items-center gap-2">
              <TenantTokenBadge />
              <button
                type="button"
                onClick={() => openConnectorModal('apiKeys')}
                title="הגדרת מפתחות AI"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ==================== STAGE 1: 10-PAGE MATRIX SELECTION ==================== */}
          {stage === 'page_type' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-white mb-1">איזה סוג עמוד תרצה לבנות היום?</h3>
                <p className="text-xs text-slate-400">
                  לכל סוג עמוד הוגדר מבנה אזורים אופטימלי (Top-to-Bottom) ושאלון ממוקד המותאם בדיוק לאזורים שבו.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAGE_ARCHITECTURE_MATRIX.map((pt) => {
                  const isSelected = selectedPageTypeId === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => handleSelectPageType(pt.id)}
                      className={clsx(
                        'p-4 rounded-2xl border text-right transition-all flex items-start gap-3',
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      )}
                    >
                      <div
                        className={clsx(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {getMatrixIcon(pt.iconName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white truncate">{pt.titleHe}</span>
                          {pt.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold shrink-0">
                              {pt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{pt.subtitleHe}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                          <span>{pt.sections.length} אזורים</span>
                          <span>•</span>
                          <span>{pt.hasHeader ? 'כולל תפריט עליון' : 'ממוקד ללא תפריט'}</span>
                          {pt.hasPaymentCheckout && <span>• סליקת קשר</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Matrix Flow Preview & Optional Section Customizer */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>זרימת העמוד הנבחרת ({selectedSectionTypes.length} אזורים)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSectionCustomizer((v) => !v)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{showSectionCustomizer ? 'סגור התאמת אזורים' : 'התאמה ידנית של אזורים'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">{selectedMatrixDef.essenceAndFlow}</p>

                {showSectionCustomizer && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                    {(Object.keys(SECTION_REGISTRY) as SectionType[]).map((secType) => {
                      const active = selectedSectionTypes.includes(secType);
                      return (
                        <button
                          key={secType}
                          type="button"
                          onClick={() => toggleSection(secType)}
                          className={clsx(
                            'px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all',
                            active
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          )}
                        >
                          {SECTION_REGISTRY[secType]?.name || secType}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== STAGE 2: ONE QUESTION AT A TIME ==================== */}
          {stage === 'intake' && currentQuestion && (
            <div className="space-y-5">
              {/* Step Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-2">
                    <span>{currentQuestion.badgeHe}</span>
                    {currentQuestion.isHardFactRequired && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                        שדה חובה מדויק
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400">
                    שאלה {activeQuestionIdx + 1} מתוך {intakeSteps.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${Math.round(((activeQuestionIdx + 1) / intakeSteps.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Single Focused Question Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">{currentQuestion.questionHe}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-start gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{currentQuestion.helperTipHe}</span>
                  </p>
                </div>

                {/* Q1: Topic & Goal */}
                {currentQuestion.id === 'topic_and_goal' && (
                  <div className="space-y-3">
                    <textarea
                      value={promptTopic}
                      onChange={(e) => setPromptTopic(e.target.value)}
                      rows={3}
                      placeholder={`לדוגמה: דף ${selectedMatrixDef.shortTitleHe} עבור ${brandDna?.identity?.companyName || 'העסק שלנו'} שמציג את השירות החדש ומניע לתיאום שיחה...`}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    {ideas.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400">רעיונות מהירים מתוך ה-Brand DNA (לחיצה למילוי):</span>
                        <div className="flex flex-wrap gap-2">
                          {ideas.slice(0, 4).map((idea) => (
                            <button
                              key={idea.id}
                              type="button"
                              onClick={() => setPromptTopic(idea.prompt)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500 text-xs text-slate-200 transition-all text-right"
                            >
                              {idea.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Q2: Grounding Sources (PDF / DOCX / URL / Text) */}
                {currentQuestion.id === 'grounding_sources' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="p-4 rounded-2xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 cursor-pointer flex items-center gap-3 transition-all">
                        <Upload className="w-5 h-5 text-indigo-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">העלאת קובץ (PDF / DOCX / TXT)</div>
                          <div className="text-[11px] text-slate-400">חילוץ נתונים אוטומטי ל-AI</div>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.md,.csv,.html"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="p-3 rounded-2xl border border-slate-700 bg-slate-950/60 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                        <input
                          type="url"
                          value={scanUrlInput}
                          onChange={(e) => setScanUrlInput(e.target.value)}
                          placeholder="סרוק כתובת אתר (https://...)"
                          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={handleScanUrl}
                          disabled={isScanningUrl || !scanUrlInput.trim()}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold"
                        >
                          {isScanningUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'סרוק'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        value={pastedSourceText}
                        onChange={(e) => setPastedSourceText(e.target.value)}
                        rows={3}
                        placeholder="או הדבק כאן טקסט מקורי, נקודות מפתח, סיכום פגישה או נתונים אמיתיים מהשטח..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      {pastedSourceText.trim() && (
                        <button
                          type="button"
                          onClick={handleAddPastedSource}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold"
                        >
                          + הוסף כמקור מידע מאומת
                        </button>
                      )}
                    </div>

                    {groundingSources.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="text-xs font-bold text-emerald-400">מקורות שנטענו ({groundingSources.length}):</div>
                        {groundingSources.map((src) => (
                          <div
                            key={src.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{src.label}</div>
                              <div className="text-[11px] text-slate-400">
                                {src.charCount > 0 ? `חולצו ${src.charCount.toLocaleString()} תווים` : src.warning}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setGroundingSources((prev) => prev.filter((s) => s.id !== src.id))}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Q3: Hero / Header Media with Pre-filled Prompt & Dimensions */}
                {currentQuestion.id === 'hero_media' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-300">מידות ופרומפט מוכן לגלריה / יצירת AI:</span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-200 font-mono text-[11px]">
                          {prefilledImageSpec.width}x{prefilledImageSpec.height} ({prefilledImageSpec.aspectRatio})
                        </span>
                      </div>
                      <textarea
                        value={customHeroImagePrompt}
                        onChange={(e) => setCustomHeroImagePrompt(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={handlePickOrCreateFromGallery}
                        className="p-4 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500 text-right space-y-1 transition-all"
                      >
                        <ImageIcon className="w-5 h-5 text-indigo-400" />
                        <div className="text-xs font-bold text-white">בחר / צור בגלריה</div>
                        <div className="text-[11px] text-slate-400">פתיחת KosCloudStore עם הפרומפט והמידות</div>
                      </button>

                      <label className="p-4 rounded-2xl bg-slate-950 hover:border-indigo-500 border border-slate-700 cursor-pointer text-right space-y-1 transition-all">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <div className="text-xs font-bold text-white">העלה תמונה מהמחשב</div>
                        <div className="text-[11px] text-slate-400">JPG, PNG, WebP</div>
                        <input type="file" accept="image/*" onChange={handleHeroImageFileUpload} className="hidden" />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setImageMode('unsplash');
                          setSelectedGalleryImageUrl('');
                        }}
                        className={clsx(
                          'p-4 rounded-2xl border text-right space-y-1 transition-all',
                          imageMode === 'unsplash' && !selectedGalleryImageUrl
                            ? 'bg-purple-600/20 border-purple-500'
                            : 'bg-slate-950 border-slate-700 hover:border-slate-600'
                        )}
                      >
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <div className="text-xs font-bold text-white">התאמה אוטומטית</div>
                        <div className="text-[11px] text-slate-400">תמונת אווירה תואמת לתחום</div>
                      </button>
                    </div>

                    {selectedGalleryImageUrl && (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-48">
                        <img src={selectedGalleryImageUrl} alt="תצוגה מקדימה" className="w-full h-44 object-cover" />
                        <button
                          type="button"
                          onClick={() => setSelectedGalleryImageUrl('')}
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Q4: Event Date, Time & Location */}
                {currentQuestion.id === 'event_datetime_location' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">תאריך האירוע *</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">שעת התחלה</label>
                        <input
                          type="time"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">שעת סיום</label>
                        <input
                          type="time"
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">שם המתחם / זום *</label>
                      <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">כתובת מלאה / Waze</label>
                      <input
                        type="text"
                        value={locationAddress}
                        onChange={(e) => {
                          setLocationAddress(e.target.value);
                          setWazeQuery(e.target.value);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Q5: Campaign Goal & Tiers */}
                {currentQuestion.id === 'campaign_goal_tiers' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">יעד גיוס (₪) *</label>
                      <input
                        type="number"
                        value={targetGoal}
                        onChange={(e) => setTargetGoal(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">סכום שנאסף עד כה (₪)</label>
                      <input
                        type="number"
                        value={totalRaised}
                        onChange={(e) => setTotalRaised(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">מטרת הקמפיין (למה תורמים?)</label>
                      <input
                        type="text"
                        value={campaignCause}
                        onChange={(e) => setCampaignCause(e.target.value)}
                        placeholder="לדוגמה: הקמת מרכז חדשנות לנוער..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Q6: Pricing & Kesher Checkout */}
                {currentQuestion.id === 'pricing_and_checkout' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {pricingPlans.map((plan, idx) => (
                        <div key={plan.id} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => {
                              const next = [...pricingPlans];
                              next[idx].name = e.target.value;
                              setPricingPlans(next);
                            }}
                            placeholder="שם חבילה"
                            className="col-span-4 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <input
                            type="number"
                            value={plan.priceMonthly}
                            onChange={(e) => {
                              const next = [...pricingPlans];
                              next[idx].priceMonthly = Number(e.target.value);
                              setPricingPlans(next);
                            }}
                            placeholder="מחיר ₪"
                            className="col-span-3 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={plan.description}
                            onChange={(e) => {
                              const next = [...pricingPlans];
                              next[idx].description = e.target.value;
                              setPricingPlans(next);
                            }}
                            placeholder="תיאור קצר"
                            className="col-span-4 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setPricingPlans((prev) => prev.filter((_, i) => i !== idx))}
                            disabled={pricingPlans.length <= 1}
                            className="col-span-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 flex justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setPricingPlans((prev) => [
                            ...prev,
                            { id: `p_${Date.now()}`, name: 'מסלול חדש', priceMonthly: 1490, description: 'ליווי VIP מלא' },
                          ])
                        }
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>הוסף מסלול מחיר</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">סוג מסמך סליקה (קשר)</label>
                        <select
                          value={kesherDocType}
                          onChange={(e) => setKesherDocType(Number(e.target.value) as 320 | 400 | 405)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value={320}>חשבונית מס קבלה (320)</option>
                          <option value={400}>קבלה לעוסק פטור / עמותה (400)</option>
                          <option value={405}>קבלת תרומה - סעיף 46 (405)</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3 pt-4">
                        <input
                          id="kesher_inst"
                          type="checkbox"
                          checked={enableInstallments}
                          onChange={(e) => setEnableInstallments(e.target.checked)}
                          className="rounded border-slate-700"
                        />
                        <label htmlFor="kesher_inst" className="text-xs text-slate-300">
                          אפשר פריסה לתשלומים (עד {maxInstallments})
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Q7: Geo Local */}
                {currentQuestion.id === 'geo_location_details' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">עיר מרכזית</label>
                      <input
                        type="text"
                        value={geoCity}
                        onChange={(e) => setGeoCity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">אזורי שירות (מופרדים בפסיק)</label>
                      <input
                        type="text"
                        value={geoAreasText}
                        onChange={(e) => setGeoAreasText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Q8: CRM Form Fields Mapping */}
                {currentQuestion.id === 'crm_form_fields' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {STANDARD_CRM_FORM_FIELDS.map((field) => {
                      const checked = selectedCrmFieldKeys.includes(field.crmFieldKey);
                      return (
                        <button
                          key={field.crmFieldKey}
                          type="button"
                          onClick={() => {
                            if (field.required) return;
                            setSelectedCrmFieldKeys((prev) =>
                              checked ? prev.filter((k) => k !== field.crmFieldKey) : [...prev, field.crmFieldKey]
                            );
                          }}
                          className={clsx(
                            'p-3 rounded-xl border text-right flex items-center justify-between transition-all',
                            checked
                              ? 'bg-indigo-600/15 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-bold">{field.labelHe}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{field.crmFieldKey}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Q9: SEO & GEO 2026.4 Focus */}
                {currentQuestion.id === 'seo_geo_focus' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">שם המומחה / המחבר (לסכמת Person)</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder={brandDna?.identity?.companyName || 'שם המומחה או המותג'}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">שאלת ליבה שתרצו להופיע עליה ב-AI וגוגל</label>
                      <input
                        type="text"
                        value={targetGeoQuestion}
                        onChange={(e) => setTargetGeoQuestion(e.target.value)}
                        placeholder="לדוגמה: איך בוחרים..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== STAGE 3: IN-MODAL DRAFT REVIEW ==================== */}
          {stage === 'review' && draft && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'hero', label: 'Hero ראשי' },
                    { id: 'content', label: 'תוכן (Answer-First)' },
                    { id: 'details', label: 'נתונים / מחירון' },
                    { id: 'faq', label: `שאלות נפוצות (${draft.faqs?.length || 0})` },
                    { id: 'seo', label: 'SEO & GEO 2026' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveReviewTab(tab.id as any)}
                      className={clsx(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                        activeReviewTab === tab.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {(activeReviewTab === 'hero' || activeReviewTab === 'content') && (
                  <button
                    type="button"
                    disabled={isRefiningTab}
                    onClick={() =>
                      handleQuickRefineSection(
                        activeReviewTab === 'hero' ? 'hero' : 'richContent',
                        'חדד את המסר השיווקי, הפוך אותו לישיר יותר והדגש את הערך הייחודי של המותג'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/25"
                  >
                    {isRefiningTab ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    <span>חדד אזור זה ב-AI</span>
                  </button>
                )}
              </div>

              {activeReviewTab === 'hero' && (
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">כותרת עמוד (Title)</label>
                    <input
                      type="text"
                      value={draft.pageTitle}
                      onChange={(e) => setDraft({ ...draft, pageTitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">כותרת H1 ראשית</label>
                    <input
                      type="text"
                      value={draft.hero.title}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, title: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">תת-כותרת (Answer-First)</label>
                    <textarea
                      rows={2}
                      value={draft.hero.subtitle}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, subtitle: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {activeReviewTab === 'content' && draft.richContent && (
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">כותרת H2 מרכזית</label>
                    <input
                      type="text"
                      value={draft.richContent.heading}
                      onChange={(e) =>
                        setDraft({ ...draft, richContent: { ...draft.richContent!, heading: e.target.value } })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">גוף תוכן (HTML / Answer-First)</label>
                    <textarea
                      rows={6}
                      value={draft.richContent.body}
                      onChange={(e) =>
                        setDraft({ ...draft, richContent: { ...draft.richContent!, body: e.target.value } })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}

              {activeReviewTab === 'details' && (
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs text-slate-300">
                  <div><strong className="text-white">סוג עמוד:</strong> {selectedMatrixDef.titleHe}</div>
                  <div><strong className="text-white">אזורי עמוד ({selectedSectionTypes.length}):</strong> {selectedSectionTypes.join(' ➔ ')}</div>
                  {draft.pricing?.plans && (
                    <div>
                      <strong className="text-white">מסלולי מחיר (סליקת קשר {kesherDocType}):</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {draft.pricing.plans.map((p) => (
                          <li key={p.id}>{p.name} — ₪{p.priceMonthly}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeReviewTab === 'faq' && (
                <div className="space-y-2">
                  {(draft.faqs || []).map((faq, idx) => (
                    <div key={faq.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const next = [...(draft.faqs || [])];
                          next[idx] = { ...next[idx], question: e.target.value };
                          setDraft({ ...draft, faqs: next });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const next = [...(draft.faqs || [])];
                          next[idx] = { ...next[idx], answer: e.target.value };
                          setDraft({ ...draft, faqs: next });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeReviewTab === 'seo' && (
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Meta Title (50-60 תווים)</label>
                    <input
                      type="text"
                      value={draft.seoGeo?.title || draft.pageTitle}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          seoGeo: {
                            ...(draft.seoGeo || {
                              description: '',
                              keywords: [],
                              aiKnowledgeSummary: '',
                              aiTargetQuestions: [],
                              author: authorName,
                            }),
                            title: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">AI Knowledge Summary (GEO/AIO)</label>
                    <textarea
                      rows={3}
                      value={draft.seoGeo?.aiKnowledgeSummary || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          seoGeo: {
                            ...(draft.seoGeo || {
                              title: draft.pageTitle,
                              description: '',
                              keywords: [],
                              aiTargetQuestions: [],
                              author: authorName,
                            }),
                            aiKnowledgeSummary: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STAGE 4: STREAMING ==================== */}
          {stage === 'streaming' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  {currentStreamStep?.stepTitle || 'מרכיב את העמוד ומחיל Brand DNA...'}
                </h3>
                <p className="text-xs text-slate-400">
                  {currentStreamStep?.statusText || 'מסנכרן עיצוב, שדות CRM, סליקת קשר וסכמות SEO/GEO 2026.4'}
                </p>
              </div>
              <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${currentStreamStep?.progressPercent || 15}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {stage !== 'streaming' && (
          <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-3">
            <div>
              {stage === 'intake' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeQuestionIdx > 0) setActiveQuestionIdx((i) => i - 1);
                    else setStage('page_type');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>הקודם</span>
                </button>
              )}
              {stage === 'review' && (
                <button
                  type="button"
                  onClick={() => setStage('intake')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>חזור לשאלון</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {stage === 'page_type' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuestionIdx(0);
                    setStage('intake');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <span>המשך לשאלון הממוקד ({intakeSteps.length} שאלות)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {stage === 'intake' && !isLastIntakeQuestion && (
                <button
                  type="button"
                  onClick={() => setActiveQuestionIdx((i) => Math.min(intakeSteps.length - 1, i + 1))}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2"
                >
                  <span>לשאלה הבאה</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {stage === 'intake' && isLastIntakeQuestion && (
                <button
                  type="button"
                  disabled={isGeneratingDraft}
                  onClick={handleGenerateDraft}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  {isGeneratingDraft ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>מייצר טיוטה מותאמת מותג ב-AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>הפק עמוד עם AI</span>
                    </>
                  )}
                </button>
              )}

              {stage === 'review' && (
                <button
                  type="button"
                  onClick={handleStartStreaming}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-indigo-600 hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>אשר והרכב עמוד בעורך</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiLivePageBuilderModal;
