/**
 * CreateCampaignModal: Modal for creating a new crowdfunding campaign
 * 
 * Deeply integrates:
 * 1. Brand DNA Hub: Colors, typography, slogan, logo, and tone of voice.
 * 2. Media Gallery Hub: MediaPickerContract for selecting assets & vibe images.
 * 3. CRM Groups Hub: Automatic ambassador team assignment from CRM groups & communities.
 * 4. AI Campaign Recommendation Engine: 3 tailored campaign packages powered by Gemini AI with smart fallback.
 * 5. Page Generation Choice: "לפי המיתוג" (Brand DNA Automated) vs "בחירה עצמית" (Custom Manual).
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Sparkles,
  Image as ImageIcon,
  Target,
  Globe,
  Plus,
  Check,
  Palette,
  Users,
  Wand2,
  Sliders,
  ChevronRight,
  RefreshCw,
  Building2,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract, BrandDnaContract } from '../../../core/contracts';
import { useTenantScope } from '../../../core/tenant';
import {
  fetchBrandProfile,
  fetchAvailableCrmGroups,
  fetchAvailableMediaItems,
  subscribeToBrandDnaUpdates,
  mapBrandDnaToSummary,
  BrandProfileSummary,
  CrmGroupSummary,
  GalleryImageSummary,
  FALLBACK_BRAND_PROFILE,
} from '../services/campaignBrandIntegrationService';
import {
  generateAiCampaignRecommendations,
  AiCampaignRecommendation,
} from '../services/campaignAiService';
import { DonationTier } from '../types';

export const CreateCampaignModal: React.FC = () => {
  const { isCreateCampaignOpen, setIsCreateCampaignOpen, createCampaign, db } = useCampaignModule();
  const { getCapability } = useHostCapabilities();

  let activeTenantId = '_master';
  try {
    const scope = useTenantScope();
    if (scope?.tenantId) activeTenantId = scope.tenantId;
  } catch {}

  // Mode Selection: 'brand_dna' (לפי המיתוג ו-AI) vs 'custom' (בחירה עצמית)
  const [creationMode, setCreationMode] = useState<'brand_dna' | 'custom'>('brand_dna');

  // Integrations state
  const [brand, setBrand] = useState<BrandProfileSummary>(FALLBACK_BRAND_PROFILE);
  const [crmGroups, setCrmGroups] = useState<CrmGroupSummary[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryImageSummary[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // AI Recommendations state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AiCampaignRecommendation[]>([]);
  const [selectedAiRecId, setSelectedAiRecId] = useState<string | null>(null);
  const [userGoalFocus, setUserGoalFocus] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetGoal, setTargetGoal] = useState<number | ''>(250000);
  const [slug, setSlug] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [donationType, setDonationType] = useState<'both' | 'one_time' | 'recurring'>('both');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#0ea5e9');
  const [customTiers, setCustomTiers] = useState<DonationTier[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load Brand DNA, CRM Groups & Media when modal opens
  useEffect(() => {
    if (!isCreateCampaignOpen) return;

    let isMounted = true;

    async function loadIntegrations() {
      try {
        // 1. Check live Brand DNA capability from host/BrandDnaProvider if mounted
        const brandCap = getCapability<BrandDnaContract>('brand-dna');
        let liveBrandFromCap: BrandProfileSummary | null = null;
        if (brandCap && typeof brandCap.getBrandDna === 'function') {
          try {
            const rawDna = brandCap.getBrandDna();
            if (rawDna?.identity?.companyName) {
              liveBrandFromCap = mapBrandDnaToSummary(rawDna);
            }
          } catch {}
        }

        const [loadedBrand, loadedGroups, loadedMedia] = await Promise.all([
          liveBrandFromCap ? Promise.resolve(liveBrandFromCap) : fetchBrandProfile(db, activeTenantId),
          fetchAvailableCrmGroups(db),
          fetchAvailableMediaItems(db),
        ]);

        if (isMounted) {
          setBrand(loadedBrand);
          setCrmGroups(loadedGroups);
          setGalleryMedia(loadedMedia);

          // Apply brand defaults
          setPrimaryColor(loadedBrand.primaryColor || '#4f46e5');
          setSecondaryColor(loadedBrand.secondaryColor || '#0ea5e9');

          if (!featuredImageUrl && loadedBrand.vibeImages?.[0]) {
            setFeaturedImageUrl(loadedBrand.vibeImages[0]);
          }

          // Pre-select first 2 groups as default ambassadors
          if (loadedGroups.length > 0) {
            setSelectedGroupIds(loadedGroups.slice(0, 2).map((g) => g.id));
          }
        }
      } catch (err) {
        console.warn('[CreateCampaignModal] Error loading integrations:', err);
      }
    }

    loadIntegrations();

    // Subscribe to live brand changes
    const unsubBrand = subscribeToBrandDnaUpdates((updated) => {
      if (isMounted) {
        setBrand(updated);
        if (creationMode === 'brand_dna') {
          setPrimaryColor(updated.primaryColor);
          setSecondaryColor(updated.secondaryColor);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubBrand();
    };
  }, [isCreateCampaignOpen, db, creationMode]);

  // Handle switching between 'brand_dna' and 'custom'
  const handleModeSwitch = (mode: 'brand_dna' | 'custom') => {
    setCreationMode(mode);
    if (mode === 'brand_dna') {
      setPrimaryColor(brand.primaryColor || '#4f46e5');
      setSecondaryColor(brand.secondaryColor || '#0ea5e9');
    }
  };

  // Generate AI Recommendations
  const handleGenerateAi = async () => {
    setIsAiLoading(true);
    setError('');
    try {
      const res = await generateAiCampaignRecommendations({
        brand,
        groups: crmGroups,
        media: galleryMedia,
        userGoalFocus,
        targetBudget: typeof targetGoal === 'number' ? targetGoal : undefined,
      });

      if (res.success && res.recommendations.length > 0) {
        setAiRecommendations(res.recommendations);
      } else {
        setError(res.error || 'לא ניתן היה לייצר המלצות כעת');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בפנייה למנוע ה-AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply a specific AI Recommendation to the form
  const handleApplyAiRecommendation = (rec: AiCampaignRecommendation) => {
    setSelectedAiRecId(rec.id);
    setTitle(rec.title);
    setSubtitle(rec.subtitle);
    setDescription(rec.description);
    setTargetGoal(rec.targetGoal);
    setDonationType(rec.donationType);
    setFeaturedImageUrl(rec.featuredImageUrl);
    setPrimaryColor(rec.branding.primaryColor || brand.primaryColor);
    setSecondaryColor(rec.branding.accentColor || brand.secondaryColor);
    setCustomTiers(rec.tiers);

    if (rec.suggestedGroupIds && rec.suggestedGroupIds.length > 0) {
      setSelectedGroupIds(rec.suggestedGroupIds);
    }

    const autoSlug = rec.title
      .replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    setSlug(autoSlug || `camp-${Date.now().toString().slice(-4)}`);
  };

  // Open Media Gallery Picker
  const handleOpenMediaPicker = async () => {
    const mediaPicker = getCapability<MediaPickerContract>('media-picker');
    if (mediaPicker && typeof mediaPicker.openPicker === 'function') {
      try {
        const result = await mediaPicker.openPicker({ accept: 'image/*', multiple: false });
        if (result) {
          const url = Array.isArray(result) ? result[0] : result;
          if (url) setFeaturedImageUrl(url);
        }
      } catch (err) {
        console.warn('MediaPicker error:', err);
      }
    } else {
      const manualUrl = window.prompt('הזן כתובת תמונה ראשית עבור הקמפיין:');
      if (manualUrl) setFeaturedImageUrl(manualUrl);
    }
  };

  // Toggle CRM group selection
  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // Submit and create the campaign
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetGoal) {
      setError('נא למלא את כותרת הקמפיין וסכום היעד');
      return;
    }

    setLoading(true);
    setError('');

    const cleanSlug = (slug || title)
      .trim()
      .replace(/[^a-zA-Z0-9\u0590-\u05FF-]/g, '-')
      .replace(/^-+|-+$/g, '') || `camp-${Date.now().toString().slice(-4)}`;

    // Prepare connected CRM groups payload
    const connectedGroups = crmGroups
      .filter((g) => selectedGroupIds.includes(g.id))
      .map((g) => ({
        id: g.id,
        name: g.name,
        leaderName: g.leaderName,
        targetGoal: g.targetGoal,
        color: g.color,
      }));

    const res = await createCampaign({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      targetGoal: Number(targetGoal),
      slug: cleanSlug,
      featuredImageUrl,
      donationType,
      themeMode: creationMode,
      brandName: brand.companyName,
      branding: {
        primaryColor,
        accentColor: secondaryColor,
        theme: 'gradient',
        svgTrendPreset: 'curve_up',
      },
      tiers: customTiers.length > 0 ? customTiers : undefined,
      videoGallery: {
        images: featuredImageUrl ? [featuredImageUrl] : brand.vibeImages || [],
        videoUrl: '',
        videoType: 'auto',
        effect: 'fade',
        objectFit: 'cover',
        desktopHeight: '500px',
      },
      connectedCrmGroups: connectedGroups,
    });

    setLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setError(res.error || 'שגיאה ביצירת הקמפיין');
    }
  };

  const handleClose = () => {
    setTitle('');
    setSubtitle('');
    setDescription('');
    setTargetGoal(250000);
    setSlug('');
    setFeaturedImageUrl('');
    setError('');
    setSelectedAiRecId(null);
    setAiRecommendations([]);
    setUserGoalFocus('');
    setIsCreateCampaignOpen(false);
  };

  if (!isCreateCampaignOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 dir-rtl select-none">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 border border-indigo-100 shadow-xs">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-950">הקמת קמפיין גיוס דיגיטלי</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            בחרו האם ליצור עמוד המבוסס אוטומטית על ה-Brand DNA ומנוע ה-AI, או לעצב בבחירה עצמית
          </p>
        </div>

        {/* Mode Selector Tabs: לפי המיתוג vs בחירה עצמית */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => handleModeSwitch('brand_dna')}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              creationMode === 'brand_dna'
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/10'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>לפי המיתוג ו-AI (Brand DNA)</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              מומלץ
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('custom')}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              creationMode === 'custom'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span>בחירה עצמית (התאמה ידנית)</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* ================= SECTION 1: BRAND DNA + AI ASSISTANT ================= */}
        {creationMode === 'brand_dna' && (
          <div className="space-y-4">
            {/* Live Brand Card */}
            <div className="p-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    brand.companyName.slice(0, 2)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{brand.companyName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {brand.organizationType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{brand.slogan}</p>
                </div>
              </div>

              {/* Brand Colors Swatches */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-left text-xs font-bold text-slate-500">צבעי מיתוג:</div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: brand.primaryColor }}
                    title={`צבע ראשי: ${brand.primaryColor}`}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: brand.secondaryColor }}
                    title={`צבע משני: ${brand.secondaryColor}`}
                  />
                </div>
              </div>
            </div>

            {/* AI Campaign Generator Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  <span className="font-black text-xs sm:text-sm">
                    מנוע המלצות AI מבוסס מיתוג (Gemini Campaign Strategist)
                  </span>
                </div>
                <span className="text-[11px] text-amber-300 font-medium">
                  מייצר 3 חבילות קמפיין מותאמות אישית
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={userGoalFocus}
                  onChange={(e) => setUserGoalFocus(e.target.value)}
                  placeholder="מיקוד נוסף לקמפיין (אופציונלי): למשל, שותפות שנתית, גיוס לפסח, חסד..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>ה-AI מנתח...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>הפק המלצות AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Generated Recommendation Cards */}
              {aiRecommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {aiRecommendations.map((rec) => {
                    const isSelected = selectedAiRecId === rec.id;
                    return (
                      <div
                        key={rec.id}
                        className={`rounded-2xl p-3.5 border transition-all flex flex-col justify-between gap-3 text-right ${
                          isSelected
                            ? 'bg-indigo-950/90 border-amber-400 ring-2 ring-amber-400/30'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              {rec.conceptTag}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              ₪{rec.targetGoal.toLocaleString()}
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-white line-clamp-1">{rec.title}</h4>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{rec.subtitle}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 italic line-clamp-2">
                            "{rec.reasoning}"
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyAiRecommendation(rec)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>המלצה זו נבחרה</span>
                            </>
                          ) : (
                            <>
                              <span>החל המלצה זו</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= FORM FIELDS ================= */}
        <form onSubmit={handleSubmit} className="space-y-5 text-slate-700 text-sm">
          {/* Campaign Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">כותרת הקמפיין המרכזי *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="למשל: שותפים לחזון 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">סלוגן / תת-כותרת שיווקית</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="יחד בונים עתיד ומחברים קהילות"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Target Goal & URL Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">יעד גיוס ראשי (₪) *</label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-black text-indigo-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">מזהה סלאג אינטרנטי (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="campaign-2026"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono dir-ltr"
              />
            </div>
          </div>

          {/* Featured Image with Gallery Picker & Quick Gallery Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">תמונת נושא ראשית (מסונכרן עם הגלריה)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://... או בחר מגלריית המדיה"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono dir-ltr"
              />
              <button
                type="button"
                onClick={handleOpenMediaPicker}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>פתח גלריית מדיה</span>
              </button>
            </div>

            {/* Quick Gallery Carousel / Vibe Images */}
            {galleryMedia.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <span className="text-[11px] text-slate-400 font-bold shrink-0">בחירה מהירה:</span>
                {galleryMedia.slice(0, 6).map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setFeaturedImageUrl(img.url)}
                    className={`w-14 h-10 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      featuredImageUrl === img.url ? 'ring-2 ring-indigo-600 border-transparent scale-105' : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CRM Groups Integration (Auto-provision Ambassadors) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">
                  חיבור קבוצות CRM כשגרירי הקמפיין (סנכרון קהילות)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedGroupIds.length} קבוצות נבחרו להוביל
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              כל קבוצה שתסמנו תקבל אוטומטית עמוד שגריר אישי ויעד קבוצתי בתוך הקמפיין.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {crmGroups.map((group) => {
                const isChecked = selectedGroupIds.includes(group.id);
                return (
                  <div
                    key={group.id}
                    onClick={() => handleToggleGroup(group.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border text-white text-[10px] ${
                          isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{group.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      {group.leaderName && (
                        <span className="text-slate-400 font-normal">({group.leaderName})</span>
                      )}
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: group.color || '#4f46e5' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campaign Story Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">סיפור הקמפיין והחזון הציבורי</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספרו על מהות הקמפיין, החזון, ולמה כל תרומה משפיעה ומקדמת את היעד..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          {/* Color & Theme Customization (Custom Mode or Override) */}
          {creationMode === 'custom' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">צבע ראשי לקמפיין (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">צבע משני / הדגשה (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono dir-ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Donation Types */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">מסלולי תרומה מותרים</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setDonationType('both')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  donationType === 'both' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                שניהם (הו"ק וחד-פעמי)
              </button>
              <button
                type="button"
                onClick={() => setDonationType('recurring')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  donationType === 'recurring' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                הוראת קבע בלבד
              </button>
              <button
                type="button"
                onClick={() => setDonationType('one_time')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  donationType === 'one_time' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                חד פעמי בלבד
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {creationMode === 'brand_dna'
                    ? 'הקם קמפיין מותאם Brand DNA ועבור לקאנבס'
                    : 'הקם קמפיין מותאם אישית ועבור לקאנבס'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
