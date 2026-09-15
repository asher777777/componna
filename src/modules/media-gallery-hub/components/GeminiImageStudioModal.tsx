import React, { useState, useEffect, useRef } from 'react';
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
  DollarSign,
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
} from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
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

export interface GeminiImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReferenceImage?: MediaItem | null;
}

export const GeminiImageStudioModal: React.FC<GeminiImageStudioModalProps> = ({
  isOpen,
  onClose,
  initialReferenceImage,
}) => {
  const { addMediaItems, theme, activeFolderId, folders } = useMediaGallery();
  const { apiKeys, updateApiKeys } = useSystemConnection();
  const isLight = theme === 'light';

  // Generation Parameters
  const [prompt, setPrompt] = useState<string>('');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('minimalist-logo');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.1-flash-image' | 'gemini-3-pro-image' | 'gemini-3.1-flash-lite-image' | 'imagen-3.0-generate-002'
  >('gemini-3.1-flash-image');

  // API Key Setting
  const [apiKeyInput, setApiKeyInput] = useState<string>(apiKeys.googleAiApiKey || '');
  const [isKeyInputOpen, setIsKeyInputOpen] = useState<boolean>(false);

  // Reference Image
  const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null);

  // Status & Progress
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [enhancementNote, setEnhancementNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result State
  const [generatedResult, setGeneratedResult] = useState<GeminiImageResult | null>(null);
  const [resultTitle, setResultTitle] = useState<string>('');
  const [resultDescription, setResultDescription] = useState<string>('');
  const [resultTags, setResultTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Fullscreen preview in modal
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial reference image if provided
  useEffect(() => {
    if (initialReferenceImage) {
      setReferenceImageBase64(initialReferenceImage.url);
      setReferenceImageName(initialReferenceImage.name);
    }
  }, [initialReferenceImage]);

  useEffect(() => {
    if (apiKeys.googleAiApiKey) {
      setApiKeyInput(apiKeys.googleAiApiKey);
    }
  }, [apiKeys.googleAiApiKey]);

  if (!isOpen) return null;

  // Real-time estimated cost badge calculation
  const currentDimensions = getDimensionsForAspectRatio(aspectRatio);
  const estimatedTokens = aspectRatio === '1:1' ? 1120 : 1680;
  const liveCostReport = calculateGeminiCost({
    model: selectedModel,
    promptTokens: 80,
    candidatesTokens: estimatedTokens,
  });

  // Handle AI Prompt Enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancingPrompt(true);
    setErrorMessage(null);
    try {
      const res = await enhancePromptWithAi(prompt, selectedPresetId, apiKeyInput || apiKeys.googleAiApiKey);
      setEnhancedPrompt(res.enhancedPromptEn);
      setEnhancementNote(res.explanationHe);
    } catch (e: any) {
      console.warn('Enhance error:', e);
      setErrorMessage('שגיאה בשדרוג הפרומפט. נסה שנית.');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Handle Image File Upload for Reference
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

  // Save API key
  const handleSaveApiKey = async () => {
    await updateApiKeys({ googleAiApiKey: apiKeyInput.trim() });
    setIsKeyInputOpen(false);
  };

  // Main Generation Handler
  const handleGenerate = async () => {
    if (!prompt.trim() && !enhancedPrompt.trim()) {
      setErrorMessage('אנא הזן תיאור לתמונה.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setIsSaved(false);

    try {
      let activePrompt = enhancedPrompt.trim();

      // If not enhanced yet, translate & enrich automatically in the background
      if (!activePrompt) {
        setGenerationStep('מתרגם ומשדרג פרומפט בעזרת עוזר AI...');
        try {
          const enh = await enhancePromptWithAi(prompt, selectedPresetId, apiKeyInput || apiKeys.googleAiApiKey);
          activePrompt = enh.enhancedPromptEn;
          setEnhancedPrompt(enh.enhancedPromptEn);
          setEnhancementNote(enh.explanationHe);
        } catch {
          activePrompt = prompt.trim();
        }
      }

      // Step 1: Generate the Image
      setGenerationStep(`יוצר תמונה איכותית עם מודל ${selectedModel}...`);
      const effectiveKey = apiKeyInput || apiKeys.googleAiApiKey || '';
      const result = await generateGeminiImage(effectiveKey, {
        prompt: activePrompt,
        model: selectedModel,
        aspectRatio: aspectRatio,
        referenceImageBase64: referenceImageBase64 || undefined,
        customApiKey: effectiveKey,
      });

      setGeneratedResult(result);

      // Step 2: Auto-encode Hebrew Title, Rich Description, and Semantic Tags with AI
      setGenerationStep('מקודד כותרת, תיאור ותגיות סמנטיות ב-AI...');
      const metadata = await generateImageMetadataWithAi(
        prompt || activePrompt,
        activePrompt,
        effectiveKey
      );

      setResultTitle(metadata.title);
      setResultDescription(metadata.description);
      setResultTags(metadata.tags);

      setGenerationStep('התמונה מוכנה!');
    } catch (err: any) {
      console.error('Generation failure:', err);
      setErrorMessage(err?.message || 'חלה שגיאה במהלך יצירת התמונה. אנא נסה שוב.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save to Gallery
  const handleSaveToGallery = async () => {
    if (!generatedResult) return;

    let finalName = resultTitle.trim() || `Gemini_Creation_${Date.now()}.png`;
    if (!finalName.includes('.')) {
      finalName = `${finalName}.png`;
    }

    let file: File | undefined = undefined;

    if (generatedResult.base64Data) {
      try {
        const byteString = atob(generatedResult.base64Data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: generatedResult.mimeType || 'image/png' });
        file = new File([blob], finalName, { type: generatedResult.mimeType || 'image/png' });
      } catch (b64Err) {
        console.warn('Blob conversion notice:', b64Err);
      }
    }

    const newMediaItem: MediaItem = {
      id: `gemini_img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: finalName,
      type: 'image',
      mimeType: generatedResult.mimeType || 'image/png',
      url: generatedResult.imageUrl,
      sizeBytes: file ? file.size : 250000,
      width: generatedResult.width,
      height: generatedResult.height,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: resultDescription.trim(),
      tags: resultTags,
      folderId: activeFolderId,
      sourceModule: 'gemini-image-generation',
      sourceModuleLabel: 'מחולל Gemini AI',
      metadata: {
        aiPrompt: enhancedPrompt || prompt,
        originalUserPrompt: prompt,
        model: generatedResult.model,
        aspectRatio: aspectRatio,
        estimatedCostUSD: generatedResult.usageReport.estimatedCostUSD,
        estimatedCostILS: generatedResult.usageReport.estimatedCostILS,
        totalTokens: generatedResult.usageReport.totalTokens,
      },
    };

    await addMediaItems([newMediaItem], file ? [file] : undefined);
    setIsSaved(true);
  };

  // Download locally
  const handleDownloadImage = () => {
    if (!generatedResult) return;
    const a = document.createElement('a');
    a.href = generatedResult.imageUrl;
    a.download = resultTitle || 'gemini-ai-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Use as new reference image
  const handleUseAsReference = () => {
    if (!generatedResult) return;
    setReferenceImageBase64(generatedResult.imageUrl);
    setReferenceImageName(resultTitle || 'תמונת_ייחוס.png');
    setGeneratedResult(null);
    setIsSaved(false);
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !resultTags.includes(trimmed)) {
      setResultTags([...resultTags, trimmed]);
      setNewTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setResultTags(resultTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans"
      dir="rtl"
    >
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-200 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between flex-shrink-0 ${
            isLight
              ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-slate-200'
              : 'bg-gradient-to-r from-yellow-950/30 via-slate-900 to-amber-950/30 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  סטודיו Gemini AI • יצירת תמונות מושלמות
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-yellow-300 border border-amber-500/30">
                  Nano Banana 2 & Pro
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                מחולל תמונות מתקדם עם עוזר פרומפטים וקידוד כותרת ותיאור אוטומטיים
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* API Key configuration toggle */}
            <button
              type="button"
              onClick={() => setIsKeyInputOpen(!isKeyInputOpen)}
              className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 rtl:space-x-reverse transition-colors cursor-pointer ${
                apiKeyInput || apiKeys.googleAiApiKey
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              }`}
              title="הגדרות מפתח Google AI Gemini"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {apiKeyInput || apiKeys.googleAiApiKey ? 'API מחובר' : 'הגדר מפתח API'}
              </span>
            </button>

            {/* Live Token Cost Tag */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 rtl:space-x-reverse text-xs px-3 py-1.5 rounded-xl border font-mono font-medium ${
                isLight
                  ? 'bg-white text-slate-700 border-slate-300 shadow-xs'
                  : 'bg-slate-950 text-yellow-300 border-slate-800'
              }`}
              title="עלות משוערת ליצירת תמונה בודדת"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>${liveCostReport.estimatedCostUSD.toFixed(4)}</span>
              <span className="text-[10px] opacity-75">({liveCostReport.estimatedCostILS.toFixed(3)} ₪)</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Inline API Key Bar */}
        {isKeyInputOpen && (
          <div
            className={`px-5 py-2.5 border-b text-xs flex items-center justify-between gap-3 animate-fade-in ${
              isLight ? 'bg-amber-50/90 border-amber-200' : 'bg-amber-950/40 border-amber-900/60'
            }`}
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse flex-1">
              <Key className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-bold whitespace-nowrap">Google Gemini API Key:</span>
              <input
                type="password"
                placeholder="הדבק כאן את המפתח (AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className={`w-full max-w-md px-3 py-1 rounded-lg text-xs font-mono border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 text-xs shadow cursor-pointer"
              >
                שמור
              </button>
              <button
                type="button"
                onClick={() => setIsKeyInputOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          {/* Left Column: Controls & Prompt Studio (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Prompt Input with AI Assistant Wizard */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Wand2 className="w-4 h-4 text-amber-500" />
                  <span>מה תרצה ליצור? (תיאור בעברית או באנגלית)</span>
                </label>

                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt.trim()}
                  className={`text-xs px-3 py-1 rounded-xl font-bold flex items-center space-x-1 rtl:space-x-reverse transition-all cursor-pointer shadow-sm ${
                    isEnhancingPrompt || !prompt.trim()
                      ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                      : isLight
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                      : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/40'
                  }`}
                  title="שדרג את הפרומפט לפרומפט קולנועי עשיר באנגלית עם עוזר ה-AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                  <span>{isEnhancingPrompt ? 'משדרג ב-AI...' : 'שדרג בעזרת AI'}</span>
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setEnhancedPrompt('');
                }}
                placeholder="לדוגמה: לוגו עבור חברת תוכנה לגיבוש קהילות, או: אסטרונאוט שותה קפה בחלל ליד כוכב שבתאי..."
                rows={3}
                className={`w-full p-3 rounded-2xl text-xs sm:text-sm resize-none focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                    : 'bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-yellow-500'
                }`}
              />

              {/* Enhanced Prompt Preview Card */}
              {enhancedPrompt && (
                <div
                  className={`p-3 rounded-2xl border text-xs space-y-1.5 animate-fade-in ${
                    isLight
                      ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                      : 'bg-purple-950/30 border-purple-900/60 text-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px] text-purple-600 dark:text-purple-400">
                    <span className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>פרומפט משודרג באנגלית (יועבר למודל):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnhancedPrompt('')}
                      className="hover:underline text-[10px] text-purple-500 cursor-pointer"
                    >
                      הסר שדרוג
                    </button>
                  </div>
                  <p className="font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 select-all" dir="ltr">
                    {enhancedPrompt}
                  </p>
                  {enhancementNote && (
                    <p className="text-[10px] italic text-purple-700 dark:text-purple-300 pt-1 border-t border-purple-200/50 dark:border-purple-800/40">
                      💡 {enhancementNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 2. Style Presets Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>סגנון אמנותי (Style Preset)</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {IMAGE_STYLE_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        if (enhancedPrompt) {
                          handleEnhancePrompt();
                        }
                      }}
                      className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? isLight
                            ? 'bg-amber-100 text-amber-950 border-amber-500 shadow-sm font-bold ring-2 ring-amber-500/20'
                            : 'bg-yellow-500/20 text-yellow-200 border-yellow-500 shadow-md font-bold ring-2 ring-yellow-500/30'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse mb-1">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-[11px] font-bold truncate">{preset.nameHe}</span>
                      </div>
                      <span className={`text-[9px] line-clamp-2 leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {preset.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Aspect Ratio & Model Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>יחס תמונה (Aspect Ratio)</span>
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        aspectRatio === ratio
                          ? isLight
                            ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                            : 'bg-yellow-500 text-black border-yellow-500 shadow-md'
                          : isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>מודל AI</span>
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as any)}
                  className={`w-full p-2 rounded-xl text-xs font-semibold border cursor-pointer focus:outline-none ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="gemini-3.1-flash-image">⚡ Nano Banana 2 (Gemini 3.1 Flash Image)</option>
                  <option value="gemini-3-pro-image">💎 Nano Banana Pro (Gemini 3 Pro Image)</option>
                  <option value="gemini-3.1-flash-lite-image">🚀 Nano Banana 2 Lite (Fast & Cheap)</option>
                  <option value="imagen-3.0-generate-002">🎨 Google Imagen 3 (Studio Grade)</option>
                </select>
              </div>
            </div>

            {/* 4. Reference Image (Image-to-Image / Style Transfer) */}
            <div className="space-y-2 pt-1 border-t border-dashed border-slate-300 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>תמונת ייחוס (אופציונלי - להעברת סגנון / Image-to-Image)</span>
                </label>
                {referenceImageBase64 && (
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceImageBase64(null);
                      setReferenceImageName(null);
                    }}
                    className="text-[11px] text-red-500 hover:underline cursor-pointer"
                  >
                    הסר תמונת ייחוס
                  </button>
                )}
              </div>

              {referenceImageBase64 ? (
                <div
                  className={`p-2.5 rounded-2xl border flex items-center space-x-3 rtl:space-x-reverse ${
                    isLight ? 'bg-amber-50 border-amber-300' : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}
                >
                  <img
                    src={referenceImageBase64}
                    alt="Reference"
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{referenceImageName || 'תמונת ייחוס נבחרה'}</p>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      המודל ישתמש בתמונה זו כבסיס לקומפוזיציה ולסגנון
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 rounded-2xl border border-dashed text-center cursor-pointer transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                    isLight
                      ? 'border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-600'
                      : 'border-slate-700 hover:border-yellow-500 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium">העלה תמונת ייחוס מהמחשב או גרור לכאן</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center space-x-2 rtl:space-x-reverse">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt.trim() && !enhancedPrompt.trim())}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-xl transition-all cursor-pointer active:scale-98 ${
                isGenerating || (!prompt.trim() && !enhancedPrompt.trim())
                  ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-800 dark:text-slate-600'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-500/25 hover:shadow-amber-500/40'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{generationStep || 'מעבד תמונה ב-AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>צור תמונה מושלמת עכשיו</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Generation Canvas & Metadata Studio (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                <FileImage className="w-4 h-4 text-amber-500" />
                <span>תצוגה מקדימה וקידוד נתונים</span>
              </label>

              {generatedResult && (
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs cursor-pointer"
                    title="תצוגה מוגדלת"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Result Image Preview Card */}
            <div
              className={`relative w-full rounded-3xl border overflow-hidden flex items-center justify-center min-h-[260px] max-h-[340px] ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-7 h-7 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xs">{generationStep}</p>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      יוצר רזולוציה אופטימלית {currentDimensions.width}x{currentDimensions.height}
                    </p>
                  </div>
                </div>
              ) : generatedResult ? (
                <img
                  src={generatedResult.imageUrl}
                  alt={resultTitle}
                  className="w-full h-full object-contain cursor-pointer hover:scale-102 transition-transform duration-300"
                  onClick={() => setIsFullscreenPreview(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl ${
                      isLight ? 'bg-white border-slate-300 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    🎨
                  </div>
                  <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    התמונה שתיווצר תוצג כאן
                  </p>
                  <p className={`text-[10px] max-w-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    הזן תיאור משמאל ולחץ על "צור תמונה מושלמת"
                  </p>
                </div>
              )}
            </div>

            {/* Generated Metadata Panel (Auto-Encoded by AI) */}
            {generatedResult && (
              <div
                className={`p-3.5 rounded-2xl border space-y-3 animate-fade-in ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                {/* Auto Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold flex items-center space-x-1 rtl:space-x-reverse text-amber-600 dark:text-yellow-400">
                    <Type className="w-3 h-3" />
                    <span>כותרת קובץ שנוצרה ב-AI:</span>
                  </label>
                  <input
                    type="text"
                    value={resultTitle}
                    onChange={(e) => setResultTitle(e.target.value)}
                    className={`w-full p-2 rounded-xl text-xs font-bold border focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-yellow-500'
                    }`}
                    dir="auto"
                  />
                </div>

                {/* Auto Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold flex items-center space-x-1 rtl:space-x-reverse text-amber-600 dark:text-yellow-400">
                    <FileText className="w-3 h-3" />
                    <span>תיאור תוכן ואווירה שקודד ב-AI:</span>
                  </label>
                  <textarea
                    value={resultDescription}
                    onChange={(e) => setResultDescription(e.target.value)}
                    rows={2}
                    className={`w-full p-2 rounded-xl text-xs resize-none border focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500'
                        : 'bg-slate-900 border-slate-700 text-slate-200 focus:border-yellow-500'
                    }`}
                    dir="auto"
                  />
                </div>

                {/* Semantic Tags */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold flex items-center space-x-1 rtl:space-x-reverse text-amber-600 dark:text-yellow-400">
                    <Tag className="w-3 h-3" />
                    <span>תגיות סמנטיות:</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {resultTags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex items-center space-x-1 rtl:space-x-reverse ${
                          isLight
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                        }`}
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 mr-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <div className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                      <input
                        type="text"
                        placeholder="+ תגית..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border focus:outline-none w-16 ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Cost & Token Accounting */}
                <div
                  className={`p-2 rounded-xl text-[10px] font-mono flex items-center justify-between border ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>טוקנים: {generatedResult.usageReport.totalTokens.toLocaleString()}</span>
                  <span className="font-bold text-amber-600 dark:text-yellow-400">
                    עלות: ${generatedResult.usageReport.estimatedCostUSD.toFixed(5)} ({generatedResult.usageReport.estimatedCostILS.toFixed(4)} ₪)
                  </span>
                </div>

                {/* Result Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveToGallery}
                    disabled={isSaved}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow transition-all ${
                      isSaved
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>נשמר בהצלחה בגלריה!</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>שמור לגלריה</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse border cursor-pointer transition-all ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>הורד למחשב</span>
                  </button>
                </div>

                {/* Iterate / Image-to-Image helper */}
                <button
                  type="button"
                  onClick={handleUseAsReference}
                  className={`w-full py-1.5 rounded-xl text-[11px] font-medium flex items-center justify-center space-x-1 rtl:space-x-reverse transition-colors cursor-pointer ${
                    isLight
                      ? 'text-purple-700 hover:bg-purple-50'
                      : 'text-purple-300 hover:bg-purple-950/40'
                  }`}
                >
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  <span>השתמש בתמונה זו כייחוס ליצירת וריאציה נוספת</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Preview Modal */}
      {isFullscreenPreview && generatedResult && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsFullscreenPreview(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreenPreview(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={generatedResult.imageUrl}
            alt={resultTitle}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 text-center text-white space-y-1" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-sm">{resultTitle}</p>
            <p className="text-xs text-slate-400 max-w-lg">{resultDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
};
