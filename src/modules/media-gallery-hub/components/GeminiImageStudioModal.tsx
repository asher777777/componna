import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TenantTokenBadge } from '../../../core/ai';
import {
  X,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Download,
  FolderPlus,
  Sliders,
  Layers,
  Info,
  Maximize2,
  ChevronDown,
  UploadCloud,
  FileImage,
  Tag,
  FileText,
  Type,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Zap,
  Key,
  Send,
  Crown,
  PenTool,
  Palette,
  Camera,
  Building,
  Box,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Compass,
} from 'lucide-react';
import { useOptionalMediaGallery } from '../context/MediaGalleryContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import {
  BrandDnaContract,
  KosaiAgentContract,
  BrandDna,
} from '../../../core/contracts';
import { FirebaseStorageMediaService } from '../services/firebaseStorageMediaService';
import { FirestoreMediaService } from '../services/firestoreMediaService';
import {
  generateGeminiImage,
  GeminiImageResult,
  getDimensionsForAspectRatio,
} from '../services/geminiImageService';
import {
  IMAGE_STYLE_PRESETS,
  PromptStylePreset,
  enhancePromptWithAi,
  generateImageMetadataWithAi,
} from '../services/geminiPromptAssistant';
import { MediaItem } from '../types';
import { calculateGeminiCost } from '../../../core/ai/geminiCostTracker';
import { eventBus } from '../../../core/bridge/EventBus';

export type StudioTabMode = 'logo' | 'vibe' | 'edit' | 'custom';

export interface GeminiImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReferenceImage?: MediaItem | null;
  initialMode?: StudioTabMode;
  onUseImage?: (imageUrl: string, metadata: { title: string; prompt: string; tags: string[] }) => void;
  useButtonLabel?: string;
  defaultAspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  title?: string;
  subtitle?: string;
}

// Cashwan Branding Tooltip Component (Rule 3: i icon, outside click close, X button)
const CashwanTooltip = ({ text, title = 'מידע על היכולת' }: { text: string; title?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center ml-1 z-30" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition cursor-pointer"
        title={title}
      >
        i
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-2xl shadow-2xl z-50 border border-slate-200 dark:border-slate-800 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-amber-500 text-[11px]">{title}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="leading-relaxed font-normal text-slate-600 dark:text-slate-300 text-[11px]">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export const GeminiImageStudioModal: React.FC<GeminiImageStudioModalProps> = ({
  isOpen,
  onClose,
  initialReferenceImage,
  initialMode,
  onUseImage,
  useButtonLabel,
  defaultAspectRatio = '1:1',
  title,
  subtitle,
}) => {
  const gallery = useOptionalMediaGallery();
  const addMediaItems = gallery?.addMediaItems;
  const theme = gallery?.theme || 'dark';
  const activeFolderId = gallery?.activeFolderId;
  const { apiKeys, updateApiKeys, db, collections, firebaseApp } = useSystemConnection();
  const isLight = theme === 'light';

  // Host Capabilities Bridges (Rule 4: Zero direct cross-module imports)
  const { getCapability } = useHostCapabilities();
  const brandContract = getCapability<BrandDnaContract>('brand-dna');
  const kosaiAgent = getCapability<KosaiAgentContract>('kosai-agent');

  // Brand DNA context
  const [brandDna, setBrandDna] = useState<BrandDna | null>(null);

  useEffect(() => {
    if (brandContract) {
      setBrandDna(brandContract.getBrandDna());
    }
  }, [brandContract, isOpen]);

  // Listen for brand updates over EventBus
  useEffect(() => {
    const unsub = eventBus.subscribe('brand:updated', (data) => {
      if (data?.brandDna) {
        setBrandDna(data.brandDna);
      }
    });
    return () => unsub();
  }, []);

  // Studio Mode: Logo, Vibe, Edit, Custom
  const [activeTab, setActiveTab] = useState<StudioTabMode>(
    initialMode || (initialReferenceImage ? 'edit' : 'logo')
  );

  // Logo Studio State
  const [logoPresetId, setLogoPresetId] = useState<string>('minimalist-vector');
  const [logoCustomPrompt, setLogoCustomPrompt] = useState<string>('');

  // Vibe Studio State
  const [vibePresetId, setVibePresetId] = useState<string>('commercial-product');
  const [vibeCustomPrompt, setVibeCustomPrompt] = useState<string>('');

  // AI Edit Studio State
  const [editInstruction, setEditInstruction] = useState<string>('');

  // Custom Studio State
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [enhancedCustomPrompt, setEnhancedCustomPrompt] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('minimalist-logo');
  const [injectBrandDnaInCustom, setInjectBrandDnaInCustom] = useState<boolean>(true);

  // Shared Settings
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>(defaultAspectRatio);
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.1-flash-image' | 'gemini-3-pro-image' | 'gemini-3.1-flash-lite-image' | 'imagen-3.0-generate-002'
  >('gemini-3.1-flash-image');

  // Reference Image
  const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null);

  // API Key Setting
  const resolveInitialKey = () => {
    if (apiKeys.googleAiApiKey) return apiKeys.googleAiApiKey;
    if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY as string;
    return '';
  };
  const [apiKeyInput, setApiKeyInput] = useState<string>(resolveInitialKey);
  const [isKeyInputOpen, setIsKeyInputOpen] = useState<boolean>(false);

  // Status & Progress
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingToStorage, setIsSavingToStorage] = useState<boolean>(false);

  // Brand DNA Sync Status Feedback
  const [brandSyncMessage, setBrandSyncMessage] = useState<string | null>(null);

  // Result State
  const [generatedResult, setGeneratedResult] = useState<GeminiImageResult | null>(null);
  const [resultTitle, setResultTitle] = useState<string>('');
  const [resultDescription, setResultDescription] = useState<string>('');
  const [resultTags, setResultTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial reference image if provided
  useEffect(() => {
    if (initialReferenceImage) {
      setReferenceImageBase64(initialReferenceImage.url);
      setReferenceImageName(initialReferenceImage.name);
      setActiveTab('edit');
    }
  }, [initialReferenceImage]);

  useEffect(() => {
    if (apiKeys.googleAiApiKey) {
      setApiKeyInput(apiKeys.googleAiApiKey);
    } else {
      const resolved = resolveInitialKey();
      if (resolved) setApiKeyInput(resolved);
    }
  }, [apiKeys.googleAiApiKey]);

  if (!isOpen) return null;

  const brandName = brandDna?.identity?.companyName || 'קושאן';
  const brandSlogan = brandDna?.identity?.slogan || '';
  const brandPrimaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
  const brandSecondaryColor = brandDna?.designTokens?.secondaryColor || '#0ea5e9';

  // Cost calculation
  const currentDimensions = getDimensionsForAspectRatio(aspectRatio);
  const estimatedTokens = aspectRatio === '1:1' ? 1120 : 1680;
  const liveCostReport = calculateGeminiCost({
    model: selectedModel,
    promptTokens: 80,
    candidatesTokens: estimatedTokens,
  });

  // Handle API Key Save
  const handleSaveApiKey = async () => {
    await updateApiKeys({ googleAiApiKey: apiKeyInput.trim() });
    setIsKeyInputOpen(false);
  };

  // Reference File Select
  const handleReferenceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImageBase64(reader.result as string);
      setReferenceImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Quick Action Pills for Editing
  const quickEditActions = [
    { label: 'התאם לצבעי המותג', text: `התאם את פלטת הצבעים והתאורה לגווני המותג (${brandPrimaryColor} ו-${brandSecondaryColor}) תוך שמירה על המבנה המקורי` },
    { label: 'תאורת סטודיו יוקרתית', text: 'הוסף תאורת סטודיו יוקרתית רכה, חדות קולנועית וניגודיות עשירה' },
    { label: 'הפוך לאיור וקטורי', text: 'הפוך את התמונה לאיור וקטורי מינימליסטי מודרני בסגנון 2026' },
    { label: 'החלף רקע לחלל הייטק', text: 'הסר את הרקע והחלף בחלל משרדי הייטקיסטי מודרני מואר עם זכוכית ועץ בהיר' },
    { label: 'שפר חדות ואיכות', text: 'שפר חדות, שחזר פרטים עדינים, והעלה רזולוציה לאיכות הדפסה גבוהה' },
  ];

  // Main Generation Handler calling KOSAI AI Agent orchestrator
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setIsSaved(false);
    setBrandSyncMessage(null);

    const effectiveKey = apiKeyInput || apiKeys.googleAiApiKey || '';

    try {
      let finalResult: GeminiImageResult;
      let finalTitle = '';
      let finalDescription = '';
      let finalTags: string[] = [];

      // 1. Brand Logo Mode
      if (activeTab === 'logo') {
        setGenerationStep(`קושאן מייצר לוגו מקצועי עבור "${brandName}"...`);
        if (kosaiAgent) {
          const res = await kosaiAgent.generateBrandLogo({
            prompt: logoCustomPrompt,
            stylePreset: logoPresetId,
            brandDna: brandDna || undefined,
          });
          finalResult = {
            imageUrl: res.imageUrl,
            base64Data: res.base64Data || '',
            mimeType: res.mimeType || 'image/png',
            width: res.width,
            height: res.height,
            model: res.model,
            usageReport: res.usageReport || liveCostReport,
          };
          finalTitle = res.suggestedTitle || `לוגו מותג - ${brandName}`;
          finalDescription = res.suggestedDescription || `לוגו מקצועי שנוצר עבור ${brandName} בסנכרון עם Brand DNA.`;
          finalTags = res.suggestedTags || ['לוגו', 'מיתוג', 'קושאן_AI'];
        } else {
          // Fallback direct synthesis
          const promptEn = `Professional sleek minimalist vector logo for "${brandName}", colors ${brandPrimaryColor} and ${brandSecondaryColor}, ${logoCustomPrompt || 'modern clean geometric branding'}, clean white isolated background`;
          finalResult = await generateGeminiImage(effectiveKey, {
            prompt: promptEn,
            model: 'gemini-3.1-flash-image',
            aspectRatio: '1:1',
            customApiKey: effectiveKey,
          });
          finalTitle = `לוגו מותג - ${brandName}`;
          finalDescription = `לוגו מעוצב עבור ${brandName}.`;
          finalTags = ['לוגו', 'מיתוג', 'קושאן_AI'];
        }
      }

      // 2. Brand Vibe Mode
      else if (activeTab === 'vibe') {
        setGenerationStep(`קושאן מייצר תמונת אווירה עבור "${brandName}"...`);
        if (kosaiAgent) {
          const res = await kosaiAgent.generateBrandVibeImage({
            prompt: vibeCustomPrompt,
            vibeStyle: vibePresetId,
            brandDna: brandDna || undefined,
            aspectRatio: aspectRatio,
          });
          finalResult = {
            imageUrl: res.imageUrl,
            base64Data: res.base64Data || '',
            mimeType: res.mimeType || 'image/jpeg',
            width: res.width,
            height: res.height,
            model: res.model,
            usageReport: res.usageReport || liveCostReport,
          };
          finalTitle = res.suggestedTitle || `תמונת אווירה - ${brandName}`;
          finalDescription = res.suggestedDescription || `תמונת אווירה שנוצרה עבור ${brandName} בסטודיו קושאן.`;
          finalTags = res.suggestedTags || ['תמונת_אווירה', 'מיתוג', 'קושאן_AI'];
        } else {
          const promptEn = `Atmospheric commercial photography for brand "${brandName}", conveying luxury and professionalism, color harmony ${brandPrimaryColor}, ${vibeCustomPrompt}`;
          finalResult = await generateGeminiImage(effectiveKey, {
            prompt: promptEn,
            model: selectedModel,
            aspectRatio: aspectRatio,
            customApiKey: effectiveKey,
          });
          finalTitle = `תמונת אווירה - ${brandName}`;
          finalDescription = `תמונת אווירה עבור ${brandName}.`;
          finalTags = ['תמונת_אווירה', 'מיתוג', 'קושאן_AI'];
        }
      }

      // 3. AI Edit Mode (With Reference Image)
      else if (activeTab === 'edit') {
        if (!referenceImageBase64) {
          setErrorMessage('אנא בחר תמונה מתוך הגלריה או העלה תמונה לעריכה.');
          setIsGenerating(false);
          return;
        }
        if (!editInstruction.trim()) {
          setErrorMessage('אנא הזן הנחיות עריכה עבור קושאן AI.');
          setIsGenerating(false);
          return;
        }

        setGenerationStep('קושאן מעבד ועורך את התמונה לפי ההנחיות...');
        if (kosaiAgent) {
          const res = await kosaiAgent.editImageWithAi({
            referenceImageBase64,
            instruction: editInstruction,
            brandDna: brandDna || undefined,
            aspectRatio,
            model: selectedModel,
            customApiKey: effectiveKey,
          });
          finalResult = {
            imageUrl: res.imageUrl,
            base64Data: res.base64Data || '',
            mimeType: res.mimeType || 'image/jpeg',
            width: res.width,
            height: res.height,
            model: res.model,
            usageReport: res.usageReport || liveCostReport,
          };
          finalTitle = res.suggestedTitle || `עריכת תמונה - קושאן AI`;
          finalDescription = res.suggestedDescription || `עריכה חכמה: ${editInstruction}`;
          finalTags = res.suggestedTags || ['עריכת_תמונה', 'קושאן_AI'];
        } else {
          finalResult = await generateGeminiImage(effectiveKey, {
            prompt: `Transform and edit image: ${editInstruction}`,
            model: selectedModel,
            aspectRatio,
            referenceImageBase64,
            customApiKey: effectiveKey,
          });
          finalTitle = `עריכת תמונה - קושאן AI`;
          finalDescription = `עריכה: ${editInstruction}`;
          finalTags = ['עריכת_תמונה', 'קושאן_AI'];
        }
      }

      // 4. Custom Prompt Mode
      else {
        if (!customPrompt.trim() && !enhancedCustomPrompt.trim()) {
          setErrorMessage('אנא הזן תיאור לתמונה.');
          setIsGenerating(false);
          return;
        }

        let activeP = enhancedCustomPrompt.trim();
        if (!activeP) {
          setGenerationStep('קושאן משדרג את הפרומפט בעברית...');
          try {
            const enh = await enhancePromptWithAi(customPrompt, selectedPresetId, effectiveKey);
            activeP = enh.enhancedPromptEn;
            setEnhancedCustomPrompt(enh.enhancedPromptEn);
          } catch {
            activeP = customPrompt.trim();
          }
        }

        if (injectBrandDnaInCustom && brandDna) {
          activeP += `, subtle color palette matching ${brandPrimaryColor} and ${brandSecondaryColor}`;
        }

        setGenerationStep(`קושאן מייצר תמונה באיכות גבוהה...`);
        finalResult = await generateGeminiImage(effectiveKey, {
          prompt: activeP,
          model: selectedModel,
          aspectRatio,
          referenceImageBase64: referenceImageBase64 || undefined,
          customApiKey: effectiveKey,
        });

        const meta = await generateImageMetadataWithAi(customPrompt || activeP, activeP, effectiveKey);
        finalTitle = meta.title;
        finalDescription = meta.description;
        finalTags = meta.tags;
      }

      setGeneratedResult(finalResult);
      setResultTitle(finalTitle);
      setResultDescription(finalDescription);
      setResultTags(finalTags);
      setGenerationStep('התמונה מוכנה בהצלחה!');
    } catch (err: any) {
      console.error('[KOSAI Studio Error]:', err);
      setErrorMessage(err?.message || 'חלה שגיאה ביצירת התמונה. נסה שוב.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert Base64 result to File
  const createMediaFile = (name: string): File | undefined => {
    if (!generatedResult?.base64Data) return undefined;
    try {
      const byteString = atob(generatedResult.base64Data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: generatedResult.mimeType || 'image/png' });
      return new File([blob], name, { type: generatedResult.mimeType || 'image/png' });
    } catch {
      return undefined;
    }
  };

  // Save Image To Gallery
  const handleSaveToGallery = async () => {
    if (!generatedResult) return;

    let finalName = resultTitle.trim() || `Kosai_Creation_${Date.now()}.png`;
    if (!finalName.includes('.')) {
      finalName = `${finalName}.png`;
    }

    setIsSavingToStorage(true);
    try {
      const file = createMediaFile(finalName);
      let storageUrl = generatedResult.imageUrl;

      if (firebaseApp && file) {
        try {
          storageUrl = await FirebaseStorageMediaService.uploadFileToStorage(
            firebaseApp,
            file,
            finalName
          );
        } catch (storageErr) {
          console.warn('Direct upload notice:', storageErr);
        }
      }

      const newMediaItem: MediaItem = {
        id: `kosai_img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: finalName,
        type: 'image',
        mimeType: generatedResult.mimeType || 'image/png',
        url: storageUrl,
        thumbnailUrl: storageUrl,
        sizeBytes: file ? file.size : 250000,
        width: generatedResult.width,
        height: generatedResult.height,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description: resultDescription.trim(),
        tags: resultTags,
        folderId: activeFolderId,
        sourceModule: 'kosai-engine',
        sourceModuleLabel: 'קושאן AI Studio',
        metadata: {
          studioMode: activeTab,
          brandDnaSynced: true,
          model: generatedResult.model,
          aspectRatio,
          estimatedCostUSD: generatedResult.usageReport.estimatedCostUSD,
          estimatedCostILS: generatedResult.usageReport.estimatedCostILS,
          totalTokens: generatedResult.usageReport.totalTokens,
        },
      };

      if (addMediaItems) {
        await addMediaItems([newMediaItem], file ? [file] : undefined);
      } else if (db) {
        await FirestoreMediaService.saveMediaItem(db, collections, newMediaItem);
      }

      setGeneratedResult((prev) => (prev ? { ...prev, imageUrl: storageUrl } : null));
      setIsSaved(true);
    } catch (saveErr: any) {
      console.error('Failed to save to gallery:', saveErr);
      setErrorMessage(`שגיאה בשמירת התמונה: ${saveErr.message || saveErr}`);
    } finally {
      setIsSavingToStorage(false);
    }
  };

  // Sync to Brand DNA as Logo
  const handleSyncToBrandLogo = async () => {
    if (!generatedResult) return;
    try {
      const targetUrl = generatedResult.imageUrl;
      if (brandContract?.setLogoUrl) {
        await brandContract.setLogoUrl(targetUrl);
      }
      eventBus.publish('brand:logo_updated', {
        logoUrl: targetUrl,
        updatedAt: new Date().toISOString(),
      });
      setBrandSyncMessage('הלוגו עודכן בהצלחה ב-Brand DNA של המותג!');
      setTimeout(() => setBrandSyncMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage('שגיאה בסנכרון הלוגו ל-Brand DNA');
    }
  };

  // Sync to Brand DNA as Vibe Image
  const handleSyncToBrandVibe = async () => {
    if (!generatedResult) return;
    try {
      const targetUrl = generatedResult.imageUrl;
      if (brandContract?.addVibeImage) {
        await brandContract.addVibeImage(targetUrl);
      }
      eventBus.publish('brand:vibe_image_added', {
        imageUrl: targetUrl,
        updatedAt: new Date().toISOString(),
      });
      setBrandSyncMessage('התמונה נוספה בהצלחה לתמונות האווירה ב-Brand DNA!');
      setTimeout(() => setBrandSyncMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage('שגיאה בסנכרון תמונת האווירה ל-Brand DNA');
    }
  };

  // Download locally
  const handleDownloadImage = () => {
    if (!generatedResult) return;
    const a = document.createElement('a');
    a.href = generatedResult.imageUrl;
    a.download = resultTitle || 'kosai-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans"
      dir="rtl"
    >
      <div
        className={`relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-200 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* 1. Top Bar (Top Navigation 2026 style, no emojis, Heebo) */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between flex-shrink-0 ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {title || 'קושאן AI Studio • גלריה ומיתוג'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>שותף AI חכם</span>
                </span>
                <CashwanTooltip
                  title="אודות הסטודיו של קושאן"
                  text="רכיב ה-AI של קושאן מסנכרן במדויק את יצירת הלוגואים ותמונות האווירה ישירות עם ה-Brand DNA ומאפשר עריכת תמונות מתוך הגלריה."
                />
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {subtitle || `מחובר לזהות המותג: ${brandName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* API Key Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsKeyInputOpen(!isKeyInputOpen)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                apiKeyInput
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                  : isLight
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-amber-950/40 text-amber-400 border-amber-800'
              }`}
              title="הגדרת מפתח Google AI"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">API</span>
            </button>

            <TenantTokenBadge />
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Dropdown Bar */}
        {isKeyInputOpen && (
          <div
            className={`p-3 border-b flex flex-col sm:flex-row items-center gap-2 text-xs ${
              isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-950 border-amber-500/20'
            }`}
          >
            <span className="font-bold flex items-center gap-1.5 flex-shrink-0 text-amber-500">
              <Key className="w-4 h-4" />
              <span>מפתח Gemini API:</span>
            </span>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="הזן מפתח API..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-sm"
            >
              שמור מפתח
            </button>
          </div>
        )}

        {/* 2. Bento Navigation Tabs (2026 Mobile First Bento) */}
        <div
          className={`px-4 pt-3 pb-2 border-b flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0 ${
            isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logo'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400/50'
                : isLight
                ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>לוגו מקצועי למותג</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vibe')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vibe'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400/50'
                : isLight
                ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>תמונות אווירה למותג</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'edit'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400/50'
                : isLight
                ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>עריכת תמונה ב-AI</span>
            {referenceImageBase64 && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'custom'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400/50'
                : isLight
                ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>יצירה חופשית</span>
          </button>
        </div>

        {/* 3. Main Bento Body (2 columns: Form controls on Right, Result/Preview on Left in RTL) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Controls Panel */}
          <div
            className={`w-full md:w-[420px] p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-shrink-0 border-b md:border-b-0 md:border-l space-y-4 ${
              isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            {/* Brand DNA Indicator Card */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-850 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full border shadow-xs"
                  style={{ backgroundColor: brandPrimaryColor }}
                />
                <div>
                  <span className="font-black text-slate-900 dark:text-white">{brandName}</span>
                  {brandSlogan && <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">{brandSlogan}</span>}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                DNA מחובר
              </span>
            </div>

            {/* TAB 1: Brand Logo Controls */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1.5">
                    <span>סגנון הלוגו</span>
                    <CashwanTooltip
                      title="סגנונות לוגו לקושאן"
                      text="בחר סגנון עיצובי מוביל. קושאן יסנתז את שם המותג, הסלוגן וצבעי ה-DNA לתוך פרומפט וקטורי מלוטש."
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'minimalist-vector', label: 'וקטורי נקי', icon: PenTool },
                      { id: 'luxury-emblem', label: 'סמל יוקרתי', icon: Crown },
                      { id: 'modern-3d-glyph', label: 'תלת-ממד 3D', icon: Box },
                      { id: 'tech-monogram', label: 'מונוגרמה הייטק', icon: Zap },
                      { id: 'organic-crest', label: 'חותם אלגנטי', icon: Compass },
                    ].map((st) => {
                      const Icon = st.icon;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setLogoPresetId(st.id)}
                          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            logoPresetId === st.id
                              ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                              : isLight
                              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                    דגשים נוספים לקושאן (אופציונלי)
                  </label>
                  <textarea
                    rows={2}
                    value={logoCustomPrompt}
                    onChange={(e) => setLogoCustomPrompt(e.target.value)}
                    placeholder="למשל: סמל של נשר גיאומטרי, אותיות K ו-C משולבות..."
                    className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Brand Vibe Controls */}
            {activeTab === 'vibe' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1.5">
                    <span>סוג תמונת האווירה</span>
                    <CashwanTooltip
                      title="תמונות אווירה למותג"
                      text="תמונות פרסומיות קולנועיות המותאמות לחזון, לתחום העיסוק ולצבעי המותג עבור דפי נחיתה, רשתות וקמפיינים."
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'commercial-product', label: 'צילום מוצר מסחרי יוקרתי', icon: ShoppingBag },
                      { id: 'modern-workspace', label: 'סביבת עבודה והייטק', icon: Building },
                      { id: 'warm-executive', label: 'אווירה חמימה ויוקרתית', icon: Palette },
                      { id: 'cinematic-story', label: 'סיפור מותג קולנועי (85mm)', icon: Camera },
                      { id: 'creative-abstract', label: 'אבסטרקט ואמנות דיגיטלית', icon: Wand2 },
                    ].map((vt) => {
                      const Icon = vt.icon;
                      return (
                        <button
                          key={vt.id}
                          type="button"
                          onClick={() => setVibePresetId(vt.id)}
                          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            vibePresetId === vt.id
                              ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                              : isLight
                              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{vt.label}</span>
                          </span>
                          {vibePresetId === vt.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio for Vibe */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">
                    יחס תמונה (Aspect Ratio)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '16:9', label: '16:9 לרוחב' },
                      { id: '1:1', label: '1:1 ריבוע' },
                      { id: '9:16', label: '9:16 סטורי' },
                    ].map((ar) => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setAspectRatio(ar.id as any)}
                        className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          aspectRatio === ar.id
                            ? 'bg-amber-500 text-black border-amber-500'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                    תיאור הסצנה לקושאן (אופציונלי)
                  </label>
                  <textarea
                    rows={2}
                    value={vibeCustomPrompt}
                    onChange={(e) => setVibeCustomPrompt(e.target.value)}
                    placeholder="למשל: יזם יושב מול לפטופ בבית קפה מואר, כוס קפה ועציץ..."
                    className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: AI Edit Controls */}
            {activeTab === 'edit' && (
              <div className="space-y-4">
                {/* Reference Image preview */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1.5">
                    <span>תמונת המקור לעריכה</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-amber-500 hover:underline text-[11px] font-bold"
                    >
                      החלף תמונה
                    </button>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReferenceFileSelect}
                  />

                  {referenceImageBase64 ? (
                    <div className="relative p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-black/40 flex items-center gap-3">
                      <img
                        src={referenceImageBase64}
                        alt="Reference"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block truncate">{referenceImageName || 'תמונה מתוך הגלריה'}</span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> טעונה ומוכנה לעריכה
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                        isLight
                          ? 'border-slate-300 hover:border-amber-500 bg-white'
                          : 'border-slate-700 hover:border-amber-500 bg-slate-900/60'
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 text-amber-500" />
                      <span className="text-xs font-bold">העלה או בחר תמונה מתוך הגלריה לעריכה</span>
                    </button>
                  )}
                </div>

                {/* Edit Instructions */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">
                    הנחיות עריכה לקושאן AI
                  </label>
                  <textarea
                    rows={3}
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder="הסבר לקושאן מה לשנות או לשפר בתמונה (למשל: שנה תאורה לקולנועית, התאם לצבעי המותג, הסר רקע...)"
                    className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>

                {/* Quick Edit Pills */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 mb-1.5 block">פעולות עריכה מהירות:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickEditActions.map((qa) => (
                      <button
                        key={qa.label}
                        type="button"
                        onClick={() => setEditInstruction(qa.text)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border font-bold transition-all cursor-pointer ${
                          editInstruction === qa.text
                            ? 'bg-amber-500 text-black border-amber-500'
                            : isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Custom Studio Controls */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">
                    תיאור התמונה (פרומפט חופשי)
                  </label>
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="תאר את התמונה שתרצה ליצור..."
                    className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>סנכרן עם צבעי Brand DNA</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={injectBrandDnaInCustom}
                    onChange={(e) => setInjectBrandDnaInCustom(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                    יחס תמונה
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1:1', label: '1:1 ריבוע' },
                      { id: '16:9', label: '16:9 רוחב' },
                      { id: '9:16', label: '9:16 סטורי' },
                    ].map((ar) => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setAspectRatio(ar.id as any)}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          aspectRatio === ar.id
                            ? 'bg-amber-500 text-black border-amber-500'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold animate-fade-in">
                {errorMessage}
              </div>
            )}

            {/* Sync Feedback Message */}
            {brandSyncMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{brandSyncMessage}</span>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{generationStep || 'מעבד ב-AI...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-black" />
                  <span>
                    {activeTab === 'logo'
                      ? `קושאן, עצב לוגו עבור ${brandName}`
                      : activeTab === 'vibe'
                      ? `קושאן, צור תמונת אווירה`
                      : activeTab === 'edit'
                      ? `קושאן, בצע עריכה לתמונה`
                      : `קושאן, צור תמונה ב-AI`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Result / Preview Canvas */}
          <div
            className={`flex-1 min-h-[350px] p-4 sm:p-6 flex flex-col justify-between overflow-y-auto ${
              isLight ? 'bg-slate-100/50' : 'bg-slate-950/90'
            }`}
          >
            {/* Center Canvas */}
            <div className="flex-1 flex items-center justify-center min-h-[280px] relative">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center space-y-3 text-center p-6">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base">קושאן יוצר עבורך תוצר מושלם...</h4>
                    <p className="text-xs text-slate-400 mt-1">{generationStep}</p>
                  </div>
                </div>
              ) : generatedResult ? (
                <div className="relative max-h-full max-w-full flex items-center justify-center group">
                  <img
                    src={generatedResult.imageUrl}
                    alt={resultTitle || 'נוצר ב-AI'}
                    className="max-h-[55vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-700/60"
                  />
                  {isSaved && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 text-black text-xs font-black shadow-md flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> נשמר בגלריה
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 space-y-3 max-w-sm">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-500">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-400">התצוגה המקדימה תופיע כאן</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      בחר הגדרות ולחץ על כפתור היצירה של קושאן כדי להפיק לוגו, תמונות אווירה או עריכת AI
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar (Appears when result is ready) */}
            {generatedResult && (
              <div
                className={`mt-4 p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm truncate">{resultTitle}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{resultDescription}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {/* Brand DNA Synchronization Buttons */}
                  {activeTab === 'logo' && (
                    <button
                      type="button"
                      onClick={handleSyncToBrandLogo}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-90 transition"
                      title="קבע תמונה זו כלוגו הרשמי של המותג"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>סנכרן כלוגו ב-DNA</span>
                    </button>
                  )}

                  {activeTab === 'vibe' && (
                    <button
                      type="button"
                      onClick={handleSyncToBrandVibe}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-90 transition"
                      title="הוסף תמונה זו לתמונות האווירה של המותג"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>הוסף לאווירת DNA</span>
                    </button>
                  )}

                  {/* Save to Drive Gallery */}
                  <button
                    type="button"
                    onClick={handleSaveToGallery}
                    disabled={isSavingToStorage || isSaved}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                    }`}
                  >
                    {isSavingToStorage ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isSaved ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <FolderPlus className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaved ? 'נשמר' : 'שמור בגלריה'}</span>
                  </button>

                  {/* Use Image Callback (e.g. from picker host) */}
                  {onUseImage && (
                    <button
                      type="button"
                      onClick={() => {
                        onUseImage(generatedResult.imageUrl, {
                          title: resultTitle,
                          prompt: resultDescription,
                          tags: resultTags,
                        });
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{useButtonLabel || 'בחר תמונה זו'}</span>
                    </button>
                  )}

                  {/* Download locally */}
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                    title="הורד תמונה למחשב"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
