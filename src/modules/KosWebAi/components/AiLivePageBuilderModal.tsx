import React, { useState, useEffect, useRef } from 'react';
import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, MediaPickerContract } from '../../../core/contracts';
import { resolveApiKey } from '../api/functionsApi';
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
  LayoutTemplate,
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
  Send,
  Users,
  Star,
  MessageCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { TenantTokenBadge } from '../../../core/ai';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import {
  WizardStepOptions,
  StructuredPageDraft,
  StreamStepInfo,
  generateStructuredPageDraft,
  streamPageBuilding,
} from '../services/structuredPageAiService';

interface AiLivePageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (generatedConfig: PageBuilderConfig) => void;
  onOpenMarketingDrawer?: () => void;
}

export const AiLivePageBuilderModal: React.FC<AiLivePageBuilderModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const { openConnectorModal, getApiKeysForModule } = useSystemConnection();

  // Wizard Steps:
  // 1: Topic & Goal
  // 2: Section Selection (Pre-generation)
  // 3: Contextual Details (Event, Campaign, Current Affairs)
  // 4: Media & Image Selection
  // 5: In-Modal Content Review & Refinement (Flagship Style)
  // 6: Streaming & Live Page Assembly
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form State: Step 1 (Topic & Goal)
  const [promptTopic, setPromptTopic] = useState('');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // Form State: Step 2 (Section Selection)
  const [selectedSectionTypes, setSelectedSectionTypes] = useState<SectionType[]>([
    'hero',
    'richContent',
    'statsBento',
    'testimonials',
    'faq',
    'contact',
  ]);

  // Form State: Step 3 (Contextual Details)
  const [locationName, setLocationName] = useState('מרכז האירועים והכנסים');
  const [locationAddress, setLocationAddress] = useState(brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב');
  const [wazeQuery, setWazeQuery] = useState(brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144 תל אביב');
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [eventTime, setEventTime] = useState('19:30');
  const [eventEndTime, setEventEndTime] = useState('22:00');

  const [targetGoal, setTargetGoal] = useState<number>(100000);
  const [totalRaised, setTotalRaised] = useState<number>(45000);
  const [campaignCause, setCampaignCause] = useState('');

  const [currentAffairsTopic, setCurrentAffairsTopic] = useState('');
  const [mainPoints, setMainPoints] = useState('');

  // Form State: Step 4 (Image Selection)
  const [imageMode, setImageMode] = useState<'gallery' | 'ai' | 'unsplash' | 'none'>('unsplash');
  const [selectedGalleryImageUrl, setSelectedGalleryImageUrl] = useState<string>('');
  const [aiImageStyle, setAiImageStyle] = useState('פוטוריאליסטי יוקרתי');

  // Form State: Step 5 (In-Modal Content Review)
  const [draft, setDraft] = useState<StructuredPageDraft | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<'hero' | 'content' | 'details' | 'faq' | 'contact'>('hero');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  // Form State: Step 6 (Streaming)
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamStep, setCurrentStreamStep] = useState<StreamStepInfo | null>(null);
  const [streamedConfig, setStreamedConfig] = useState<PageBuilderConfig | null>(null);

  // Error & Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const moduleKeys = getApiKeysForModule('KosWebAi');
  const apiKey = moduleKeys.googleAiApiKey || '';

  const wasOpenRef = useRef(false);
  const isLoadingIdeasRef = useRef(false);

  // Reset & Load Initial Ideas
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setPromptTopic('');
      setSelectedIdeaId(null);
      setWizardStep(1);
      setErrorMsg(null);
      setDraft(null);
      setIsStreaming(false);
      setCurrentStreamStep(null);
      setStreamedConfig(null);
      setSelectedSectionTypes(['hero', 'richContent', 'statsBento', 'testimonials', 'faq', 'contact']);
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
    } catch (err: any) {
      console.warn('Could not load marketing ideas:', err);
    } finally {
      setLoadingIdeas(false);
      isLoadingIdeasRef.current = false;
    }
  };

  if (!isOpen) return null;

  // Has contextual needs
  const hasEventSections = selectedSectionTypes.some((t) => t === 'eventRsvp' || t === 'timer');
  const hasCampaignSections = selectedSectionTypes.some(
    (t) => t === 'campaignHeader' || t === 'campaignTiers' || t === 'campaignDonors'
  );
  const hasContentOrNewsSections = selectedSectionTypes.some(
    (t) => t === 'richContent' || t === 'livePosts'
  );

  // Section toggle handler
  const toggleSection = (type: SectionType) => {
    if (selectedSectionTypes.includes(type)) {
      if (selectedSectionTypes.length <= 1) {
        alert('יש לבחור לפחות אזור אחד בעמוד.');
        return;
      }
      setSelectedSectionTypes((prev) => prev.filter((t) => t !== type));
    } else {
      setSelectedSectionTypes((prev) => [...prev, type]);
    }
  };

  // Section Presets
  const applyPreset = (presetKey: 'service' | 'event' | 'campaign' | 'news' | 'checkout') => {
    switch (presetKey) {
      case 'service':
        setSelectedSectionTypes(['hero', 'richContent', 'statsBento', 'pricing', 'testimonials', 'faq', 'contact']);
        break;
      case 'event':
        setSelectedSectionTypes(['hero', 'timer', 'eventRsvp', 'richContent', 'statsBento', 'faq', 'contact']);
        break;
      case 'campaign':
        setSelectedSectionTypes(['campaignHeader', 'hero', 'campaignTiers', 'campaignDonors', 'statsBento', 'faq', 'contact']);
        break;
      case 'news':
        setSelectedSectionTypes(['hero', 'richContent', 'statsBento', 'livePosts', 'testimonials', 'faq', 'contact']);
        break;
      case 'checkout':
        setSelectedSectionTypes(['hero', 'pricing', 'smartForm', 'timer', 'testimonials', 'contact']);
        break;
    }
  };

  // Gallery Picker
  const handlePickFromGallery = async () => {
    if (mediaPicker?.openPicker) {
      try {
        const selected = await mediaPicker.openPicker({ accept: 'image/*' });
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
      alert('גלריית המדיה של KosCloudStore אינה זמינה כרגע.');
    }
  };

  // Generate Structured Draft and Move to Step 5 (Review in Modal)
  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    setErrorMsg(null);

    const wizardOptions: WizardStepOptions = {
      promptTopic: promptTopic.trim() || 'עמוד שירות ופעילות חדש',
      selectedSectionTypes,
      eventDetails: hasEventSections
        ? {
            locationName,
            locationAddress,
            wazeQuery,
            eventDate,
            eventTime,
            eventEndTime,
          }
        : undefined,
      campaignDetails: hasCampaignSections
        ? {
            targetGoal,
            totalRaised,
            campaignCause: campaignCause || promptTopic,
          }
        : undefined,
      newsDetails: hasContentOrNewsSections
        ? {
            currentAffairsTopic: currentAffairsTopic || promptTopic,
            mainPoints,
          }
        : undefined,
      imageSelection: {
        mode: imageMode,
        selectedImageUrl: selectedGalleryImageUrl,
        aiImagePrompt: promptTopic,
      },
    };

    try {
      const generatedDraft = await generateStructuredPageDraft(wizardOptions, brandDna, apiKey);
      setDraft(generatedDraft);
      setIsGeneratingDraft(false);
      setWizardStep(5);
    } catch (err: any) {
      console.error('Draft generation error:', err);
      setIsGeneratingDraft(false);
      setErrorMsg(err?.message || 'שגיאה במהלך הפקת הטיוטה.');
    }
  };

  // Live Stream Building (Step 6)
  const handleStartStreaming = async () => {
    if (!draft) return;
    setWizardStep(6);
    setIsStreaming(true);
    setErrorMsg(null);

    const wizardOptions: WizardStepOptions = {
      promptTopic: promptTopic.trim() || 'עמוד חדש',
      selectedSectionTypes,
      imageSelection: {
        mode: imageMode,
        selectedImageUrl: draft.hero.imageUrl || selectedGalleryImageUrl,
      },
    };

    try {
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
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>סיעור מוחות ויצירת עמוד ב-AI</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  {wizardStep <= 4 ? `שאלה ${wizardStep} מתוך 4` : wizardStep === 5 ? 'עריכת תוכן במודל' : 'הזרמה חיה'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                תהליך מונחה חכם מבוסס Brand DNA – שאלה אחת בכל שלב, קבלת התוכן בתוך מודל והזרמה חיה.
              </p>
            </div>
          </div>
          {!isStreaming && (
            <div className="flex items-center gap-2">
              <TenantTokenBadge />
              <button
                type="button"
                onClick={() => openConnectorModal('apiKeys')}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="הגדרות מפתחות AI"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-slate-900/80 px-6 py-2.5 border-b border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-400 overflow-x-auto no-scrollbar gap-2">
          <div className={clsx('flex items-center gap-1.5 shrink-0', wizardStep === 1 ? 'text-indigo-400 font-black' : wizardStep > 1 ? 'text-emerald-400' : '')}>
            <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[10px]', wizardStep > 1 ? 'bg-emerald-500 text-slate-950 font-black' : wizardStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800')}>1</span>
            <span>מטרה ונושא</span>
          </div>
          <span className="text-slate-700">←</span>
          <div className={clsx('flex items-center gap-1.5 shrink-0', wizardStep === 2 ? 'text-indigo-400 font-black' : wizardStep > 2 ? 'text-emerald-400' : '')}>
            <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[10px]', wizardStep > 2 ? 'bg-emerald-500 text-slate-950 font-black' : wizardStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800')}>2</span>
            <span>בחירת אזורים</span>
          </div>
          <span className="text-slate-700">←</span>
          <div className={clsx('flex items-center gap-1.5 shrink-0', wizardStep === 3 ? 'text-indigo-400 font-black' : wizardStep > 3 ? 'text-emerald-400' : '')}>
            <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[10px]', wizardStep > 3 ? 'bg-emerald-500 text-slate-950 font-black' : wizardStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800')}>3</span>
            <span>פרטים מיוחדים</span>
          </div>
          <span className="text-slate-700">←</span>
          <div className={clsx('flex items-center gap-1.5 shrink-0', wizardStep === 4 ? 'text-indigo-400 font-black' : wizardStep > 4 ? 'text-emerald-400' : '')}>
            <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[10px]', wizardStep > 4 ? 'bg-emerald-500 text-slate-950 font-black' : wizardStep === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-800')}>4</span>
            <span>תמונה ומדיה</span>
          </div>
          <span className="text-slate-700">←</span>
          <div className={clsx('flex items-center gap-1.5 shrink-0', wizardStep === 5 ? 'text-indigo-400 font-black' : wizardStep > 5 ? 'text-emerald-400' : '')}>
            <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[10px]', wizardStep > 5 ? 'bg-emerald-500 text-slate-950 font-black' : wizardStep === 5 ? 'bg-indigo-600 text-white' : 'bg-slate-800')}>5</span>
            <span>עריכת תוכן במודל</span>
          </div>
          <span className="text-slate-700">←</span>
          <div className={clsx('flex items-center gap-1.5 shrink-0', wizardStep === 6 ? 'text-indigo-400 font-black' : '')}>
            <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[10px]', wizardStep === 6 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800')}>6</span>
            <span>הזרמה חיה</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {/* STEP 1: Page Goal & Topic */}
          {wizardStep === 1 && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <span>שאלה 1: מה מטרת העמוד ומה הנושא שתרצו לקדם?</span>
                </h3>
                <p className="text-xs text-slate-400">
                  בחרו מאחת מאפשרויות הבחירה המהירות, או כתבו באופן חופשי את הרעיון שלכם:
                </p>
              </div>

              {/* Quick Choice Chips */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">שורות בחירה מהירות:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'עמוד שירות / מוצר דגל חדש', icon: Zap },
                    { label: 'כנס ואירוע קהילתי מרכזי', icon: Calendar },
                    { label: 'קמפיין גיוס תרומות ושותפים', icon: Heart },
                    { label: 'דף נחיתה ומכירה מהירה', icon: DollarSign },
                    { label: 'מרכז תוכן ומאמר מקצועי / אקטואליה', icon: FileText },
                    { label: 'הרשמה לקורס והכשרה מעשית', icon: GraduationCap },
                  ].map((chip) => {
                    const isSelected = promptTopic === chip.label;
                    const IconComp = chip.icon;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setPromptTopic(chip.label);
                          setSelectedIdeaId(null);
                        }}
                        className={clsx(
                          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        )}
                      >
                        <IconComp className={clsx('w-3.5 h-3.5', isSelected ? 'text-amber-300' : 'text-indigo-400')} />
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Brainstorm Ideas (if loaded) */}
              {ideas.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>או בחרו רעיון מותאם אישית מתוך ה-Brand DNA:</span>
                    {loadingIdeas && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ideas.slice(0, 4).map((idea) => {
                      const isSelected = selectedIdeaId === idea.id;
                      return (
                        <div
                          key={idea.id}
                          onClick={() => {
                            setSelectedIdeaId(idea.id);
                            setPromptTopic(idea.prompt || idea.title);
                          }}
                          className={clsx(
                            'p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1',
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500 shadow-lg'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{idea.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                              {idea.badge || 'רעיון מוביל'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {idea.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Free-text Manual Writing */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">
                  כתיבה ידנית (הגדירו במילים שלכם או ערכו את הבחירה):
                </label>
                <textarea
                  value={promptTopic}
                  onChange={(e) => {
                    setPromptTopic(e.target.value);
                    setSelectedIdeaId(null);
                  }}
                  placeholder="למשל: עמוד השקת שירות ליווי אישי לבכירים, או כנס שנתי עם רישום ב-Waze, או קמפיין שותפות לגיוס 100 אלף ש״ח..."
                  className="w-full h-24 p-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white text-xs placeholder-slate-500 resize-none transition-all select-text"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Section Selection (Pre-generation) */}
          {wizardStep === 2 && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                  <span>שאלה 2: אילו אזורים תרצו לכלול במבנה העמוד?</span>
                </h3>
                <p className="text-xs text-slate-400">
                  בחרו תבנית מבנה מוכנה בלחיצה אחת, או סמנו/הסירו אזורים באופן אישי:
                </p>
              </div>

              {/* 1-Click Structure Presets */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">תבניות מבנה מומלצות (בחירה מהירה):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'service', label: 'עמוד שירות/מוצר (7)', icon: Zap },
                    { key: 'event', label: 'כנס ואירוע (7)', icon: Calendar },
                    { key: 'campaign', label: 'קמפיין גיוס (7)', icon: Heart },
                    { key: 'news', label: 'תוכן ואקטואליה (7)', icon: FileText },
                    { key: 'checkout', label: 'דף סליקה מהיר (6)', icon: DollarSign },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p.key as any)}
                      className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
                    >
                      <p.icon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Section Checkbox Grid */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>רשימת כל האזורים (לחצו להפעלה/כיבוי):</span>
                  <span className="text-indigo-400 font-bold">
                    נבחרו {selectedSectionTypes.length} אזורים
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { type: 'hero', name: 'Hero ראשי והנעה לפעולה', desc: 'כותרת, סלוגן, באדג׳ וכפתורי הנעה', icon: Sparkles },
                    { type: 'richContent', name: 'אודות ותוכן עשיר', desc: 'סיפור המותג, פסקאות תוכן וחזון', icon: FileText },
                    { type: 'eventRsvp', name: 'פרטי אירוע, הרשמה ו-Waze', desc: 'מיקום, שעה, קישור ניווט וטופס RSVP', icon: Calendar },
                    { type: 'timer', name: 'טיימר ספירה לאחור', desc: 'שעון רץ למועד האירוע או סיום מבצע', icon: Clock },
                    { type: 'campaignHeader', name: 'מד התקדמות קמפיין תרומות', desc: 'יעד גיוס, סכום שנאסף ומספר תורמים', icon: Target },
                    { type: 'campaignTiers', name: 'מדרגות תרומה וסכומים', desc: 'כרטיסיות סכומים מהירות והוראות קבע', icon: Heart },
                    { type: 'campaignDonors', name: 'כרטיסיות תורמים ושגרירים', desc: 'פיד תורמים בזמן אמת והקדשות', icon: Users },
                    { type: 'pricing', name: 'מחירון וחבילות שירות', desc: 'השוואת מסלולים ותמחור שקוף', icon: DollarSign },
                    { type: 'statsBento', name: 'מדדי מפתח והישגים (Bento)', desc: '4 מדדים בולטים עם אייקונים ואחוזים', icon: Star },
                    { type: 'testimonials', name: 'ביקורות ולקוחות ממליצים', desc: 'חוות דעת מאומתות ודירוג כוכבים', icon: Star },
                    { type: 'faq', name: 'שאלות ותשובות נפוצות (FAQ)', desc: 'מענה לכל השאלות עם חיפוש מובנה', icon: HelpCircle },
                    { type: 'contact', name: 'יצירת קשר ו-WhatsApp', desc: 'טופס פנייה, כפתור ווטסאפ ישיר וכתובת', icon: Phone },
                    { type: 'community', name: 'קהילה וקבוצת WhatsApp', desc: 'כרטיס הזמנה לקהילה ודיאלוג פתוח', icon: MessageCircle },
                    { type: 'imageListing', name: 'גלריית תמונות מהשטח', desc: 'גריד תמונות רספונסיבי מהפעילות', icon: ImageIcon },
                  ].map((item) => {
                    const isChecked = selectedSectionTypes.includes(item.type as SectionType);
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.type}
                        onClick={() => toggleSection(item.type as SectionType)}
                        className={clsx(
                          'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400')}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">{item.desc}</span>
                          </div>
                        </div>
                        <div className={clsx('w-5 h-5 rounded-lg border flex items-center justify-center transition-all', isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700')}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Contextual Details (Event, Campaign, Current Affairs) */}
          {wizardStep === 3 && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>שאלה 3: פרטים מיוחדים עבור האזורים שנבחרו</span>
                </h3>
                <p className="text-xs text-slate-400">
                  הזינו את הנתונים המדויקים שיוזרמו ישירות לתוך האזורים המתאימים בעמוד:
                </p>
              </div>

              {/* Event Specific Fields */}
              {hasEventSections && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>פרטי האירוע והכנס (יוזרמו לאזור EventRsvp ולטיימר):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-300 font-bold">שם המקום / האולם:</label>
                      <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="מרכז הכנסים והאירועים"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-300 font-bold">כתובת מלאה או יעד Waze:</label>
                      <input
                        type="text"
                        value={locationAddress}
                        onChange={(e) => {
                          setLocationAddress(e.target.value);
                          setWazeQuery(e.target.value);
                        }}
                        placeholder="דרך מנחם בגין 144, תל אביב"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-300 font-bold">תאריך האירוע:</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-300 font-bold">שעת התחלה וסיום:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white flex-1"
                        />
                        <span className="text-slate-500 text-xs">עד</span>
                        <input
                          type="time"
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Campaign / Fundraising Specific Fields */}
              {hasCampaignSections && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                    <Heart className="w-4 h-4" />
                    <span>פרטי קמפיין הגיוס והתרומות:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-300 font-bold">יעד הגיוס (₪):</label>
                      <input
                        type="number"
                        value={targetGoal}
                        onChange={(e) => setTargetGoal(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-300 font-bold">סכום שגויס כעת (₪):</label>
                      <input
                        type="number"
                        value={totalRaised}
                        onChange={(e) => setTotalRaised(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[11px] text-slate-300 font-bold">מטרת העל של הקמפיין:</label>
                      <input
                        type="text"
                        value={campaignCause}
                        onChange={(e) => setCampaignCause(e.target.value)}
                        placeholder="הקמת מרכז קהילתי חדש / מלגות והרחבת הפעילות"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Current Affairs / News Points */}
              {hasContentOrNewsSections && (
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                    <FileText className="w-4 h-4" />
                    <span>פרטי אקטואליה ומסר מרכזי (אודות / תוכן עשיר / פוסטים):</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={currentAffairsTopic}
                      onChange={(e) => setCurrentAffairsTopic(e.target.value)}
                      placeholder="נושא מרכזי או מבזק אקטואלי"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <textarea
                      value={mainPoints}
                      onChange={(e) => setMainPoints(e.target.value)}
                      placeholder="נקודות מפתח להבלטה בפסקאות התוכן..."
                      className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white h-20 resize-none"
                    />
                  </div>
                </div>
              )}

              {!hasEventSections && !hasCampaignSections && !hasContentOrNewsSections && (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <span className="text-sm font-bold text-white">כל נתוני האזורים שנבחרו מוכנים ומסונכרנים!</span>
                  <span className="text-xs text-slate-400">האזורים שנבחרו ישתמשו בנתוני ה-Brand DNA המובילים שלכם. ניתן להמשיך לשלב התמונה.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Media & Image Selection */}
          {wizardStep === 4 && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  <span>שאלה 4: איזו תמונה ראשית תלווה את העמוד?</span>
                </h3>
                <p className="text-xs text-slate-400">
                  בחרו תמונה מתוך גלריית המדיה (KosCloudStore), צרו ב-AI, או השתמשו בתמונת אווירה:
                </p>
              </div>

              {/* 4 Image Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Pick from Gallery (KosCloudStore) */}
                <div
                  onClick={handlePickFromGallery}
                  className={clsx(
                    'p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2 relative',
                    imageMode === 'gallery' && selectedGalleryImageUrl
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">בחירה מגלריית המדיה</span>
                    <Upload className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    בחירת תמונה שכבר הועלתה ל-KosCloudStore עבור העסק.
                  </p>
                  {selectedGalleryImageUrl && (
                    <div className="w-full h-20 rounded-xl overflow-hidden mt-1 border border-indigo-500/40 relative">
                      <img src={selectedGalleryImageUrl} alt="נבחר" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-emerald-400 font-bold">
                        נבחר בהצלחה ✓
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePickFromGallery();
                    }}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    {selectedGalleryImageUrl ? 'החלף תמונה מהגלריה' : 'פתח את גלריית המדיה'}
                  </button>
                </div>

                {/* 2. Generate with AI */}
                <div
                  onClick={() => setImageMode('ai')}
                  className={clsx(
                    'p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2',
                    imageMode === 'ai' ? 'bg-indigo-950/60 border-indigo-500 shadow-md' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">יצירת תמונה על ידי AI</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    הפקת תמונה מקורית לפי נושא העמוד והמיתוג.
                  </p>
                  {imageMode === 'ai' && (
                    <div className="mt-1 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">סגנון אמנותי:</span>
                      <select
                        value={aiImageStyle}
                        onChange={(e) => setAiImageStyle(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="פוטוריאליסטי יוקרתי">פוטוריאליסטי יוקרתי</option>
                        <option value="הייטק מודרני מואר">הייטק מודרני מואר</option>
                        <option value="קהילתי וחם">קהילתי וחם</option>
                        <option value="מינימליסטי נקי">מינימליסטי נקי</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 3. Smart Unsplash Matching */}
                <div
                  onClick={() => setImageMode('unsplash')}
                  className={clsx(
                    'p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2',
                    imageMode === 'unsplash' ? 'bg-indigo-950/60 border-indigo-500 shadow-md' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">תמונת מאגר מותאמת אישית</span>
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    תמונה מקצועית איכותית ממאגר Unsplash המותאמת לנושא העמוד.
                  </p>
                </div>

                {/* 4. No Image */}
                <div
                  onClick={() => setImageMode('none')}
                  className={clsx(
                    'p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2',
                    imageMode === 'none' ? 'bg-indigo-950/60 border-indigo-500 shadow-md' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">ללא תמונה (מראה טיפוגרפי)</span>
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    דף נקי מבוסס טיפוגרפיה, צבעי מותג וכרטיסיות מידע.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: In-Modal Review & Refinement (Flagship Style) */}
          {wizardStep === 5 && draft && (
            <div className="flex flex-col gap-5 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-indigo-400" />
                    <span>סקירת תוכן העמוד ועריכתו בתוך המודל</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    בדקו וערכו את התוכן שהופק. לאחר אישורכם, העמוד יוזרם חי אל תוך המערכת:
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  התוכן מוכן לעריכה ✓
                </span>
              </div>

              {/* Sub-tabs for Review */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('hero')}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                    activeReviewTab === 'hero' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  Hero ראשי
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('content')}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                    activeReviewTab === 'content' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  אודות ותוכן
                </button>
                {(hasEventSections || hasCampaignSections) && (
                  <button
                    type="button"
                    onClick={() => setActiveReviewTab('details')}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                      activeReviewTab === 'details' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    פרטי {hasEventSections ? 'אירוע' : 'קמפיין'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('faq')}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                    activeReviewTab === 'faq' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  שאלות ותשובות ({draft.faqs?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('contact')}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                    activeReviewTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  יצירת קשר
                </button>
              </div>

              {/* Sub-tab 1: Hero */}
              {activeReviewTab === 'hero' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-300">כותרת עמוד ודפדפן (Page Title):</label>
                    <input
                      type="text"
                      value={draft.pageTitle}
                      onChange={(e) => setDraft({ ...draft, pageTitle: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-300">כותרת ראשית (Hero Title):</label>
                    <input
                      type="text"
                      value={draft.hero.title}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, title: e.target.value } })}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-300">פסקת משנה / סלוגן (Hero Subtitle):</label>
                    <textarea
                      value={draft.hero.subtitle}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, subtitle: e.target.value } })}
                      className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white h-20 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">כפתור ראשי:</label>
                      <input
                        type="text"
                        value={draft.hero.ctaPrimaryText}
                        onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, ctaPrimaryText: e.target.value } })}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">כפתור משני (WhatsApp):</label>
                      <input
                        type="text"
                        value={draft.hero.ctaSecondaryText}
                        onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, ctaSecondaryText: e.target.value } })}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Content */}
              {activeReviewTab === 'content' && draft.richContent && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-300">כותרת אזור התוכן:</label>
                    <input
                      type="text"
                      value={draft.richContent.heading}
                      onChange={(e) => setDraft({ ...draft, richContent: { ...draft.richContent!, heading: e.target.value } })}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-300">גוף התוכן (פסקאות מעוצבות):</label>
                    <textarea
                      value={draft.richContent.body.replace(/<[^>]+>/g, '')}
                      onChange={(e) => setDraft({ ...draft, richContent: { ...draft.richContent!, body: `<p>${e.target.value}</p>` } })}
                      className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white h-32 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Event / Campaign Details */}
              {activeReviewTab === 'details' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  {draft.event && hasEventSections && (
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold text-amber-400">פרטי האירוע:</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={draft.event.locationName}
                          onChange={(e) => setDraft({ ...draft, event: { ...draft.event!, locationName: e.target.value } })}
                          placeholder="שם המקום"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={draft.event.locationAddress}
                          onChange={(e) => setDraft({ ...draft, event: { ...draft.event!, locationAddress: e.target.value } })}
                          placeholder="כתובת"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {draft.campaign && hasCampaignSections && (
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold text-rose-400">פרטי הקמפיין:</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={draft.campaign.targetGoal}
                          onChange={(e) => setDraft({ ...draft, campaign: { ...draft.campaign!, targetGoal: Number(e.target.value) } })}
                          placeholder="יעד גיוס"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="number"
                          value={draft.campaign.totalRaised}
                          onChange={(e) => setDraft({ ...draft, campaign: { ...draft.campaign!, totalRaised: Number(e.target.value) } })}
                          placeholder="סכום שכבר נאסף"
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 4: FAQ */}
              {activeReviewTab === 'faq' && draft.faqs && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">שאלות ותשובות נפוצות:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq = { id: `f_${Date.now()}`, question: 'שאלה חדשה', answer: 'תשובה מפורטת' };
                        setDraft({ ...draft, faqs: [...draft.faqs!, newFaq] });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>הוסף שאלה</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {draft.faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...draft.faqs!];
                              updated[idx].question = e.target.value;
                              setDraft({ ...draft, faqs: updated });
                            }}
                            className="bg-transparent border-none text-xs font-bold text-white w-full focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDraft({ ...draft, faqs: draft.faqs!.filter((_, i) => i !== idx) });
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...draft.faqs!];
                            updated[idx].answer = e.target.value;
                            setDraft({ ...draft, faqs: updated });
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 h-14 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Contact */}
              {activeReviewTab === 'contact' && draft.contact && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">טלפון:</label>
                      <input
                        type="text"
                        value={draft.contact.phone}
                        onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact!, phone: e.target.value } })}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">ווטסאפ:</label>
                      <input
                        type="text"
                        value={draft.contact.whatsapp}
                        onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact!, whatsapp: e.target.value } })}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Live Streaming and Progress */}
          {wizardStep === 6 && (
            <div className="flex flex-col items-center justify-center py-10 gap-6 max-w-xl mx-auto">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div
                  className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"
                  style={{ animationDuration: '1.2s' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">
                  {currentStreamStep?.progressPercent || 0}%
                </div>
              </div>

              <div className="text-center flex flex-col gap-2">
                <h3 className="text-xl font-black text-white">
                  {currentStreamStep?.stepTitle || 'מקים את תשתיות העמוד...'}
                </h3>
                <p className="text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>{currentStreamStep?.statusText || 'מזרים תוכן ועיצוב בזמן אמת...'}</span>
                </p>
              </div>

              {/* Live Section Building Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mt-2">
                {streamedConfig?.sectionOrder.map((secId, idx) => (
                  <div
                    key={secId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold animate-in fade-in"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>אזור {idx + 1} הוקם ({secId.split('_')[0]})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-xs text-red-200">{errorMsg}</span>
          </div>
        )}

        {/* Footer Actions Bar */}
        {wizardStep !== 6 && (
          <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            {wizardStep > 1 ? (
              <button
                type="button"
                onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>חזור</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {wizardStep === 1 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  disabled={!promptTopic.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <span>המשך לבחירת אזורים</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {wizardStep === 2 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  disabled={selectedSectionTypes.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <span>המשך לפרטים מיוחדים</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {wizardStep === 3 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(4)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <span>המשך לבחירת תמונה ומדיה</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {wizardStep === 4 && (
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={isGeneratingDraft}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {isGeneratingDraft ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>מפיק תוכן מותאם ב-AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>הפק תוכן ופתח לעריכה במודל</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}

              {wizardStep === 5 && (
                <button
                  type="button"
                  onClick={handleStartStreaming}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-600/30 cursor-pointer hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>צור עמוד מלא (הזרמת נתונים חיה)</span>
                  <ArrowLeft className="w-4 h-4" />
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
