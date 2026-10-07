/**
 * CampaignStudioEditor: Full Visual Studio & Design Editor for Campaigns
 * Implements all design and customization capabilities found in LEA's HomeEditor,
 * including SVG trend curves, multi-tier management, test-mode sandbox, WhatsApp templates,
 * and direct synchronization with the user's Media Gallery component.
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Heart,
  Video,
  Image as ImageIcon,
  Users,
  Save,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  FlaskConical,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Eye,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { Campaign, DonationTier, CampaignVideoGallery, DrawerConfig } from '../types';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { CampaignHeaderWidget } from './CampaignHeaderWidget';
import { CampaignTiersWidget } from './CampaignTiersWidget';
import { CampaignDonorsWidget } from './CampaignDonorsWidget';

interface CampaignStudioEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignStudioEditor: React.FC<CampaignStudioEditorProps> = ({
  isOpen,
  onClose,
}) => {
  const { campaign, saveCampaignDesign } = useCampaignModule();
  const { getCapability } = useHostCapabilities();

  // Local editing draft state
  const [activeTab, setActiveTab] = useState<'header' | 'tiers' | 'media' | 'donors' | 'story'>('header');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields initialized from active campaign
  const [title, setTitle] = useState(campaign?.title || '');
  const [subtitle, setSubtitle] = useState(campaign?.subtitle || '');
  const [targetGoal, setTargetGoal] = useState<number>(campaign?.targetGoal || 100000);
  const [totalRaised, setTotalRaised] = useState<number>(campaign?.totalRaised || 0);
  const [svgTrendPreset, setSvgTrendPreset] = useState<'curve_up' | 'percentage_gauge' | 'custom'>(
    campaign?.branding?.svgTrendPreset || 'curve_up'
  );
  const [customSvgPath, setCustomSvgPath] = useState(campaign?.branding?.customSvgPath || '');
  const [primaryColor, setPrimaryColor] = useState(campaign?.branding?.primaryColor || '#4f46e5');
  const [brandingTheme, setBrandingTheme] = useState<'gradient' | 'dark' | 'light'>(
    campaign?.branding?.theme || 'gradient'
  );

  // Tiers & Drawer
  const [tiers, setTiers] = useState<DonationTier[]>(
    campaign?.campaignTiers?.tiers || [
      { id: 't1', name: 'שותף לדרך', amount: 180, monthlyAmount: 180, description: 'שותפות בהגעה ליעד', color: '#3b82f6' },
      { id: 't2', name: 'תומך פעיל', amount: 360, monthlyAmount: 360, description: 'תמיכה שנתית בפעילות', color: '#10b981', isDefault: true, popular: true },
      { id: 't3', name: 'ידיד נאמן', amount: 770, monthlyAmount: 770, description: 'זכות שותפות מורחבת', color: '#8b5cf6' },
      { id: 't4', name: 'פטרון הקהילה', amount: 1800, monthlyAmount: 1800, description: 'פטרון ראשי', color: '#f59e0b' },
    ]
  );
  const [donationType, setDonationType] = useState<'both' | 'one_time' | 'recurring'>(
    campaign?.campaignTiers?.donationType || 'both'
  );
  const [testMode, setTestMode] = useState<boolean>(Boolean(campaign?.testMode));

  // Drawer & WhatsApp
  const [drawerConfig, setDrawerConfig] = useState<DrawerConfig>(
    campaign?.drawerConfig || {
      theme: 'light',
      whatsapp_enabled: true,
      whatsapp_success_message: 'שלום {שם מלא}, תודה רבה על תרומתך בסך ₪{סכום} עבור {שם קמפיין}! תזכו למצוות ולברכה.',
      whatsapp_pending_message: 'שלום {שם מלא}, שמנו לב שהתחלת תרומה בסך ₪{סכום} עבור {שם קמפיין} אך התהליך טרם הושלם. לחץ כאן להשלמת התרומה: {קישור לתשלום}',
      whatsapp_success_image_url: '',
      whatsapp_pending_image_url: '',
      direct_bit_phone: '050-0000000',
      receipt_prefix: 'REC-',
    }
  );

  // Media Gallery & Video
  const [videoGallery, setVideoGallery] = useState<CampaignVideoGallery>(
    campaign?.videoGallery || {
      images: [],
      videoUrl: '',
      videoType: 'auto',
      effect: 'fade',
      objectFit: 'cover',
      desktopHeight: '500px',
    }
  );

  // Donors display settings
  const [donorsCardLayout, setDonorsCardLayout] = useState<'grid-2' | 'grid-3' | 'list'>(
    campaign?.donorsConfig?.cardLayout || 'grid-2'
  );
  const [donorsDefaultTab, setDonorsDefaultTab] = useState<'recent' | 'top'>(
    campaign?.donorsConfig?.defaultTab || 'recent'
  );
  const [showSearch, setShowSearch] = useState<boolean>(campaign?.donorsConfig?.showSearch ?? true);
  const [showSort, setShowSort] = useState<boolean>(campaign?.donorsConfig?.showSort ?? true);

  // Story & Rich content
  const [storyHeading, setStoryHeading] = useState(campaign?.storyContent?.heading || 'חזון הקמפיין והמטרות');
  const [storyBody, setStoryBody] = useState(
    campaign?.storyContent?.body || 'הצטרפו אלינו לבניית עתיד משותף. כל שקל מקרב אותנו ליעד!'
  );
  const [storyBannerImage, setStoryBannerImage] = useState(campaign?.storyContent?.bannerImage || '');

  if (!isOpen) return null;

  // Media Picker Trigger
  const handleOpenMediaPicker = async (onPick: (urls: string[]) => void, multiple = false) => {
    const mediaPicker = getCapability<MediaPickerContract>('media-picker');
    if (mediaPicker && typeof mediaPicker.openPicker === 'function') {
      try {
        const result = await mediaPicker.openPicker({ accept: 'image/*', multiple });
        if (result) {
          const arr = Array.isArray(result) ? result : [result];
          onPick(arr);
        }
      } catch (err) {
        console.warn('[StudioEditor] Media picker error:', err);
      }
    } else {
      const url = window.prompt('הזן קישור לתמונה (URL):');
      if (url) onPick([url]);
    }
  };

  // Tier operations
  const handleAddTier = () => {
    const newTier: DonationTier = {
      id: `tier_${Date.now()}`,
      name: 'מדרגה חדשה',
      amount: 500,
      monthlyAmount: 500,
      description: 'השתתפות בפעילות',
      color: '#4f46e5',
    };
    setTiers([...tiers, newTier]);
  };

  const handleUpdateTier = (idx: number, field: keyof DonationTier, value: any) => {
    const copy = [...tiers];
    copy[idx] = { ...copy[idx], [field]: value };
    setTiers(copy);
  };

  const handleRemoveTier = (idx: number) => {
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  // Save all design configurations
  const handleSave = async () => {
    if (!campaign) return;
    setSaving(true);

    const updatedData: Partial<Campaign> = {
      title,
      subtitle,
      targetGoal,
      totalRaised,
      testMode,
      campaignTiers: {
        donationType,
        tiers,
      },
      drawerConfig,
      videoGallery,
      donorsConfig: {
        cardLayout: donorsCardLayout,
        defaultTab: donorsDefaultTab,
        showSearch,
        showSort,
      },
      branding: {
        primaryColor,
        theme: brandingTheme,
        svgTrendPreset,
        customSvgPath,
      },
      storyContent: {
        heading: storyHeading,
        body: storyBody,
        bannerImage: storyBannerImage,
      },
    };

    const res = await saveCampaignDesign(campaign.id, updatedData);
    setSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col dir-rtl overflow-hidden">
      {/* Top Studio Navbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black flex items-center gap-2">
              עורך ומעצב הקמפיין (HomeEditor Studio)
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {campaign?.title || 'קמפיין'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              התאמה מלאה של יעדים, גרפים, מדרגות, גלריית מדיה, וואטסאפ וסליקה
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                נשמר בהצלחה!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                שמור שינויים בקמפיין
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Studio Body: Controls on Right, Live Preview on Left */}
      <div className="flex-1 flex overflow-hidden">
        {/* Controls Panel */}
        <div className="w-full lg:w-1/2 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1.5 p-3 border-b border-slate-800 bg-slate-950/40 text-xs font-bold overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('header')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'header' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              כותרת ומד תנופה
            </button>

            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'tiers' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              מדרגות וסליקה
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'media' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              גלריית מדיה ווידאו
            </button>

            <button
              onClick={() => setActiveTab('donors')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'donors' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              לוח תורמים ותצוגה
            </button>

            <button
              onClick={() => setActiveTab('story')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'story' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              סיפור וחזון
            </button>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 text-xs">
            {/* Tab 1: Header & Goal & Trends */}
            {activeTab === 'header' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-indigo-300">
                  הגדרות כותרת הקמפיין, סכומי יעד ומד תנופה ויזואלי בסגנון Charidy.
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">כותרת הקמפיין הראשי</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">סלוגן / תת-כותרת</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">סכום יעד הקמפיין (₪)</label>
                    <input
                      type="number"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">סכום נוכחי שהושג (₪)</label>
                    <input
                      type="number"
                      value={totalRaised}
                      onChange={(e) => setTotalRaised(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-amber-400 font-bold text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">תבנית גרף SVG הטרנד (Visual Trend Preset)</label>
                  <select
                    value={svgTrendPreset}
                    onChange={(e) => setSvgTrendPreset(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  >
                    <option value="curve_up">עקומת קשת עולה עם חץ תנופה (סגנון Charidy)</option>
                    <option value="percentage_gauge">מד אחוז התקדמות מעגלי</option>
                    <option value="custom">נתיב SVG מותאם אישית (Custom SVG Path)</option>
                  </select>
                </div>

                {svgTrendPreset === 'custom' && (
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">נתיב SVG מותאם (path d=...)</label>
                    <textarea
                      rows={2}
                      value={customSvgPath}
                      onChange={(e) => setCustomSvgPath(e.target.value)}
                      placeholder="M 10 80 Q 100 10, 200 80 T 300 20"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">ערכת עיצוב (Branding Theme)</label>
                    <select
                      value={brandingTheme}
                      onChange={(e) => setBrandingTheme(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs [color-scheme:dark]"
                    >
                      <option value="gradient">גרדיאנט יוקרתי (Indigo / Slate)</option>
                      <option value="dark">כהה עמוק (Dark Premium)</option>
                      <option value="light">בהיר ונקי (Light Clean)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">צבע מיתוג ראשי</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Tiers, Test Mode & WhatsApp Drawer */}
            {activeTab === 'tiers' && (
              <div className="space-y-5">
                {/* Test Mode Switch Banner */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    testMode ? 'bg-amber-950/40 border-amber-500' : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <FlaskConical className={`w-4 h-4 ${testMode ? 'text-amber-400' : 'text-slate-400'}`} />
                        מצב בדיקה (Sandbox / Test Mode)
                        {testMode && (
                          <span className="px-2 py-0.5 bg-amber-500 text-black rounded-full font-black text-[10px]">
                            פעיל
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        מדמה תשלום מוצלח מיידית במסד הנתונים, מעדכן את היעד, רושם ב-CRM ומשגר התראות — ללא פנייה לחברת אשראי.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={testMode}
                      onChange={(e) => setTestMode(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 shrink-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Donation Type Mode */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">סוגי תרומות מותרים בטופס</label>
                  <select
                    value={donationType}
                    onChange={(e) => setDonationType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs [color-scheme:dark]"
                  >
                    <option value="both">שניהם: הוראת קבע (×12 חודשים) ותרומה חד פעמית</option>
                    <option value="recurring">הוראת קבע חודשית בלבד</option>
                    <option value="one_time">תרומה חד פעמית בלבד</option>
                  </select>
                </div>

                {/* Tiers List Editor */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">רשימת מדרגות תרומה ({tiers.length})</span>
                    <button
                      onClick={handleAddTier}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      הוסף מדרגה
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {tiers.map((tier, idx) => (
                      <div
                        key={tier.id || idx}
                        className="p-3 bg-slate-800/90 border border-slate-700/80 rounded-xl space-y-2 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                            placeholder="שם המדרגה"
                            className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">₪</span>
                            <input
                              type="number"
                              value={tier.amount}
                              onChange={(e) => handleUpdateTier(idx, 'amount', Number(e.target.value))}
                              placeholder="סכום"
                              className="w-24 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-amber-400 text-xs font-bold"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveTier(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <input
                            type="text"
                            value={tier.description || ''}
                            onChange={(e) => handleUpdateTier(idx, 'description', e.target.value)}
                            placeholder="תיאור קצר של המדרגה"
                            className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300 text-[11px]"
                          />
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(tier.popular)}
                              onChange={(e) => handleUpdateTier(idx, 'popular', e.target.checked)}
                              className="rounded text-indigo-600 w-3.5 h-3.5"
                            />
                            מומלץ
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp & Drawer Settings */}
                <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-4 pt-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      הודעות WhatsApp ותזכורות נטישה (GREEN-API)
                    </span>
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(drawerConfig.whatsapp_enabled)}
                        onChange={(e) =>
                          setDrawerConfig({ ...drawerConfig, whatsapp_enabled: e.target.checked })
                        }
                        className="rounded text-emerald-600 w-4 h-4"
                      />
                      מופעל
                    </label>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">נוסח הודעת תודה והצלחה (תרומה הושלמה)</label>
                    <textarea
                      rows={2}
                      value={drawerConfig.whatsapp_success_message || ''}
                      onChange={(e) =>
                        setDrawerConfig({ ...drawerConfig, whatsapp_success_message: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none"
                    />
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-slate-400">תמונת תודה מהגלריה:</span>
                      <button
                        onClick={() =>
                          handleOpenMediaPicker((urls) =>
                            setDrawerConfig({ ...drawerConfig, whatsapp_success_image_url: urls[0] })
                          )
                        }
                        className="text-indigo-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        בחר מגלריית המדיה
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">נוסח תזכורת נטישה (לאחר 5 דק' בסטטוס ממתין)</label>
                    <textarea
                      rows={2}
                      value={drawerConfig.whatsapp_pending_message || ''}
                      onChange={(e) =>
                        setDrawerConfig({ ...drawerConfig, whatsapp_pending_message: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none"
                    />
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-slate-400">תמונת תזכורת מהגלריה:</span>
                      <button
                        onClick={() =>
                          handleOpenMediaPicker((urls) =>
                            setDrawerConfig({ ...drawerConfig, whatsapp_pending_image_url: urls[0] })
                          )
                        }
                        className="text-indigo-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        בחר מגלריית המדיה
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Media Gallery & Video */}
            {activeTab === 'media' && (
              <div className="space-y-5">
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">סנכרון תמונות מגלריית המשתמש</h4>
                    <p className="text-slate-400 text-[11px]">
                      בחירת תמונות מרובות מתוך מנהל המדיה המרכזי של Comona.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenMediaPicker((urls) => {
                        const existing = videoGallery.images || [];
                        setVideoGallery({ ...videoGallery, images: [...existing, ...urls] });
                      }, true)
                    }
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <ImageIcon className="w-4 h-4" />
                    בחר מגלריית המדיה
                  </button>
                </div>

                {/* Images thumbnails list */}
                <div>
                  <label className="block font-bold text-slate-300 mb-2">
                    תמונות הקמפיין ({videoGallery.images?.length || 0})
                  </label>
                  {videoGallery.images && videoGallery.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2.5">
                      {videoGallery.images.map((imgUrl, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-slate-700 group h-24">
                          <img src={imgUrl} alt={`media-${i}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              const filtered = videoGallery.images!.filter((_, idx) => idx !== i);
                              setVideoGallery({ ...videoGallery, images: filtered });
                            }}
                            className="absolute top-1 left-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl text-slate-400">
                      אין תמונות בגלריה עדיין. לחץ למעלה לבחירה מהגלריה.
                    </div>
                  )}
                </div>

                {/* Video Embed Settings */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-indigo-400" />
                    סרטון וידאו ראשי (YouTube / Vimeo / קישור ישיר)
                  </h4>

                  <div>
                    <label className="block text-slate-400 mb-1">קישור לסרטון (Video URL)</label>
                    <input
                      type="text"
                      value={videoGallery.videoUrl || ''}
                      onChange={(e) => setVideoGallery({ ...videoGallery, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs dir-ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">סוג וידאו</label>
                      <select
                        value={videoGallery.videoType || 'auto'}
                        onChange={(e) => setVideoGallery({ ...videoGallery, videoType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs [color-scheme:dark]"
                      >
                        <option value="auto">זיהוי אוטומטי</option>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="direct">קובץ וידאו ישיר (MP4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">אפקט מעבר תמונות</label>
                      <select
                        value={videoGallery.effect || 'fade'}
                        onChange={(e) => setVideoGallery({ ...videoGallery, effect: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs [color-scheme:dark]"
                      >
                        <option value="fade">עמעום (Fade)</option>
                        <option value="slide">גלילה (Slide)</option>
                        <option value="zoom">זום קולנועי (Zoom)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Donors Feed & Display */}
            {activeTab === 'donors' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">פריסת כרטיסי תורמים (Card Layout)</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDonorsCardLayout('grid-2')}
                      className={`py-2 rounded-lg transition-all ${
                        donorsCardLayout === 'grid-2' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      גריד 2 עמודות
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonorsCardLayout('grid-3')}
                      className={`py-2 rounded-lg transition-all ${
                        donorsCardLayout === 'grid-3' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      גריד 3 עמודות
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonorsCardLayout('list')}
                      className={`py-2 rounded-lg transition-all ${
                        donorsCardLayout === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      רשימה מלאה
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">טאב ברירת מחדל בעת פתיחה</label>
                  <select
                    value={donorsDefaultTab}
                    onChange={(e) => setDonorsDefaultTab(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs [color-scheme:dark]"
                  >
                    <option value="recent">תרומות אחרונות (פיד חי)</option>
                    <option value="top">תורמים מובילים (סכום גבוה ביותר)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input
                      type="checkbox"
                      checked={showSearch}
                      onChange={(e) => setShowSearch(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    הצג תיבת חיפוש תורמים והקדשות
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input
                      type="checkbox"
                      checked={showSort}
                      onChange={(e) => setShowSort(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    הצג כפתורי מיון וסינון (אחרונים / מובילים)
                  </label>
                </div>
              </div>
            )}

            {/* Tab 5: Story & Rich Content */}
            {activeTab === 'story' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">כותרת הסקשן</label>
                  <input
                    type="text"
                    value={storyHeading}
                    onChange={(e) => setStoryHeading(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">תוכן הסיפור וחזון הקמפיין</label>
                  <textarea
                    rows={4}
                    value={storyBody}
                    onChange={(e) => setStoryBody(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">תמונת באנר מהגלריה</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={storyBannerImage}
                      onChange={(e) => setStoryBannerImage(e.target.value)}
                      placeholder="כתובת תמונה"
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono dir-ltr"
                    />
                    <button
                      onClick={() => handleOpenMediaPicker((urls) => setStoryBannerImage(urls[0]))}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                    >
                      בחר מהגלריה
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Panel (Left Side) */}
        <div className="hidden lg:flex flex-1 bg-slate-950 p-6 flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 shrink-0">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Eye className="w-4 h-4" />
              תצוגה מקדימה חיה (Live Interactive Preview)
            </span>
            <span>שינויי העיצוב מתעדכנים מיידית</span>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-6 pr-1">
            {/* Live Header Widget Preview */}
            <div className="opacity-95">
              <CampaignHeaderWidget />
            </div>

            {/* Video or Image Preview */}
            {videoGallery.images && videoGallery.images.length > 0 && (
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={videoGallery.images[0]}
                  alt="תצוגה"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Tiers Widget Preview */}
            <CampaignTiersWidget />

            {/* Donors Widget Preview */}
            <CampaignDonorsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};
