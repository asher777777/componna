import React, { useState } from 'react';
import {
  VideoEngagementSectionConfig,
  VideoEngagementComment,
  VideoEngagementLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import {
  Sparkles,
  Shield,
  Layers,
  Compass,
  Crosshair,
  Activity,
  Save,
  X,
  Plus,
  Trash2,
  ChevronDown,
  Info,
  Sliders,
  ThumbsUp,
  Share2,
  Tag,
  MessageSquare,
  Eye,
  Image as ImageIcon,
  Palette,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface VideoEngagementEditorProps {
  config: VideoEngagementSectionConfig;
  onChange: (updated: VideoEngagementSectionConfig) => void;
  onClose?: () => void;
}

interface LayoutOptionDef {
  id: VideoEngagementLayoutPreset;
  title: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  typography: string;
  buttonShape: string;
  colors: string[];
  description: string;
}

const LAYOUT_OPTIONS: LayoutOptionDef[] = [
  {
    id: 'feminine',
    title: 'א. סגנון נשי',
    badge: 'רך ואלגנטי',
    icon: Sparkles,
    typography: 'גופן סריפי מעודן, צלליות מפוזרות רכות',
    buttonShape: 'קפסולה מעוגלת מלאה (Pill), גווני בלאש',
    colors: ['#f43f5e', '#fb7185', '#fff1f2', '#fda4af'],
    description: 'פינות מעוגלות רכות (40px), גווני רוז-גולד, הילת תאורה עדינה וכפתורי קפסולה.',
  },
  {
    id: 'masculine',
    title: 'ב. סגנון גברי',
    badge: 'עוצמתי ודומיננטי',
    icon: Shield,
    typography: 'אותיות מודגשות, שחור פחם וזהב מטאלי',
    buttonShape: 'מלבני ישר ומוצק עם מסגרת מתכתית',
    colors: ['#09090b', '#27272a', '#d97706', '#f59e0b'],
    description: 'פחם עמוק, שחור מט וזהב פליז יוקרתי. שולי פלדה יציבים, מסגרת חזקה וניגודיות דרמטית.',
  },
  {
    id: 'standard',
    title: 'ג. פריסה עכשווית',
    badge: 'מומלץ KOSUN',
    icon: Layers,
    typography: 'טיפוגרפיה מודרנית ונקייה, מרווחים מאוזנים',
    buttonShape: 'פינות מעוגלות קלאסיות (16px), חלקות',
    colors: ['#0f172a', '#1e293b', '#6366f1', '#38bdf8'],
    description: 'הפריסה המוכרת והאהובה של KOSUN – סרגל אינטראקציה מאוזן, מודרני ונקי.',
  },
  {
    id: 'spiritual',
    title: 'ד. סגנון רוחני',
    badge: 'הרמוני ושלו',
    icon: Compass,
    typography: 'גופן אוורירי ושקט, אותיות מרווחות',
    buttonShape: 'מעוגל רך עם קווי מתאר עדינים',
    colors: ['#064e3b', '#047857', '#10b981', '#a7f3d0'],
    description: 'גווני מרווה, מנטה ואמרלד. סרגל צף עם הילת צללים עדינה ואווירה שלווה ומחברת.',
  },
  {
    id: 'sharp',
    title: 'ה. סגנון חד',
    badge: 'הייטק ומינימליזם',
    icon: Crosshair,
    typography: 'גופן מונוספייס טכני, סמני HUD',
    buttonShape: 'חד לחלוטין (90 מעלות, ללא רדיוס)',
    colors: ['#000000', '#083344', '#06b6d4', '#22d3ee'],
    description: 'פינות 90 מעלות ללא רדיוס, סמני HUD פינתיים, כיתוב מונו וניגודיות שחור-ציאן עתידנית.',
  },
  {
    id: 'analytical',
    title: 'ו. סגנון אנליטי',
    badge: 'סדר ואינדקס נתונים',
    icon: Activity,
    typography: 'טיפוגרפיה מובנית וקטלוגית, אינדקס #01',
    buttonShape: 'קומפקטי ומיושר בדיוק לפי הגריד',
    colors: ['#0f172a', '#1e1b4b', '#4338ca', '#818cf8'],
    description: 'סדר קטלוגי מבוסס אינדקס נתונים מובנה, כחול נייבי עמוק, פלדה וקווים הנדסיים נקיים.',
  },
];

export const VideoEngagementEditor: React.FC<VideoEngagementEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  // Local state mirroring Contact360Modal & PageSettingsDrawer
  const [formData, setFormData] = useState<VideoEngagementSectionConfig>({
    socialButtonsStyle: 'icons-only',
    showButtonLabels: false,
    ...config,
  });
  const [initialData, setInitialData] = useState<VideoEngagementSectionConfig>({
    socialButtonsStyle: 'icons-only',
    showButtonLabels: false,
    ...config,
  });

  // Accordion state (all closed by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hoveredLayoutId, setHoveredLayoutId] = useState<VideoEngagementLayoutPreset | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  // New tag input
  const [newTagInput, setNewTagInput] = useState('');

  const isDarkMode = true;
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = <K extends keyof VideoEngagementSectionConfig>(
    field: K,
    val: VideoEngagementSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    onChange(updated);
  };

  const updatePatch = (patch: Partial<VideoEngagementSectionConfig>) => {
    const updated = { ...formData, ...patch };
    setFormData(updated);
    onChange(updated);
  };

  const handleSelectLayout = (layoutDef: LayoutOptionDef) => {
    updatePatch({
      layout: layoutDef.id,
      objectScale: 'auto',
      buttonShape: 'auto',
    });
    showNotification(`הוחלה ${layoutDef.title}`);
  };

  const handleSave = (closeAfter = false) => {
    setIsSaving(true);
    try {
      onChange(formData);
      setInitialData({ ...formData });
      setShowUnsavedConfirm(false);
      showNotification('הגדרות האינטראקציה נשמרו בהצלחה');
      if (closeAfter && onClose) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestClose = () => {
    if (!onClose) return;
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Sync with Brand DNA
  const handleSyncBrandDna = () => {
    if (!brandDna) {
      showNotification('לא נמצאו נתוני מיתוג ב-Brand DNA');
      return;
    }
    const companyName = brandDna.identity?.companyName || '';
    const slogan = brandDna.identity?.slogan || '';
    const services = brandDna.ecosystem?.services || [];
    const primaryColor = brandDna.designTokens?.primaryColor || '';

    const brandTags: string[] = [];
    if (companyName) brandTags.push(companyName);
    if (services.length > 0) {
      services.slice(0, 3).forEach((s: any) => {
        const name = typeof s === 'string' ? s : s.title;
        if (name && !brandTags.includes(name)) brandTags.push(name);
      });
    }
    brandTags.push('וידאו', 'KOSUN');

    const updated: VideoEngagementSectionConfig = {
      ...formData,
      title: companyName ? `אינטראקציה, שיתוף ותגובות • ${companyName}` : formData.title,
      videoTitle: companyName ? `הסרטון הרשמי של ${companyName}` : formData.videoTitle,
      shareTitle: companyName ? `צפו בסרטון מבית ${companyName}` : formData.shareTitle,
      tags: brandTags,
      accentColor: primaryColor || formData.accentColor,
      socialButtonsStyle: 'icons-only',
      showButtonLabels: false,
    };

    setFormData(updated);
    onChange(updated);
    setIsBrandSynced(true);
    showNotification('הסרגל סונכרן בהצלחה עם שפת המיתוג של ה-Brand DNA');
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  // Tags management
  const tags = formData.tags || [];
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      updateField('tags', [...tags, clean]);
    }
    setNewTagInput('');
    showNotification('התווית נוספה לסרטון');
  };

  const handleRemoveTag = (idx: number) => {
    updateField(
      'tags',
      tags.filter((_, i) => i !== idx)
    );
  };

  // Comments management
  const comments = formData.comments || [];
  const handleDeleteComment = (commentId: string) => {
    updateField(
      'comments',
      comments.filter((c) => c.id !== commentId)
    );
    showNotification('התגובה נמחקה');
  };

  const handleAddSampleComment = () => {
    const newComment: VideoEngagementComment = {
      id: `comm_${Date.now()}`,
      authorName: 'מגיב/ה חדש/ה',
      publishedAt: 'לפני יום',
      content: 'סרטון מדהים ומקצועי ביותר! תודה רבה על השיתוף.',
      likesCount: 5,
    };
    updateField('comments', [newComment, ...comments]);
    showNotification('נוספה תגובת דוגמה');
  };

  const activeLayout = formData.layout || 'standard';

  return (
    <div
      className={`rounded-[2.5rem] p-4 flex flex-col justify-between max-h-[88vh] text-right font-sans transition-all relative border shadow-2xl ${
        isDarkMode ? 'bg-[#141414] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-in fade-in flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {showUnsavedConfirm && (
        <div className="absolute top-2 left-3 right-3 z-50 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 backdrop-blur-md flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ישנם שינויים שלא נשמרו. האם לשמור כעת?</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
            >
              שמור וסגור
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUnsavedConfirm(false);
                if (onClose) onClose();
              }}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
            >
              בטל שינויים
            </button>
          </div>
        </div>
      )}

      {/* 1. Compact Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 font-black text-xs">
            VE
          </div>
          <div>
            <h3 className="text-sm font-extrabold flex items-center gap-1.5 leading-tight">
              <span>עריכת לייקים, שיתוף ותגובות</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              6 פריסות, איקונים וטולטיפ כברירת מחדל ומיתוג
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
              isBrandSynced
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-white/5 hover:bg-white/10 text-amber-400 border-amber-500/30'
            }`}
            title="סנכרן שפת מיתוג ותוויות מתוך ה-Brand DNA"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>סנכרן מיתוג</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'שומר...' : 'שמור'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top 6-Icon Layout Selector with Rich Hover Tooltips */}
      <div className="pt-2.5 pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <Sliders className="w-3 h-3" />
            <span>בחר סגנון פריסה לעיצוב הסרגל:</span>
          </span>
          <span className="text-[10px] text-zinc-400">
            {LAYOUT_OPTIONS.find((l) => l.id === activeLayout)?.title}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {LAYOUT_OPTIONS.map((layoutDef) => {
            const Icon = layoutDef.icon;
            const isSelected = activeLayout === layoutDef.id;
            const isHovered = hoveredLayoutId === layoutDef.id;

            return (
              <div
                key={layoutDef.id}
                className="relative"
                onMouseEnter={() => setHoveredLayoutId(layoutDef.id)}
                onMouseLeave={() => setHoveredLayoutId(null)}
              >
                <button
                  type="button"
                  onClick={() => handleSelectLayout(layoutDef)}
                  className={`w-full h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-white/5 border-white/5 hover:border-white/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-bold truncate max-w-[95%]">
                    {layoutDef.title.split('.')[1]?.trim() || layoutDef.title}
                  </span>
                </button>

                {/* Rich Hover Tooltip */}
                {isHovered && (
                  <div
                    className="absolute z-50 top-full mt-2 w-64 p-3 rounded-2xl bg-zinc-950/95 border border-amber-500/40 shadow-2xl text-right text-[11px] space-y-2 pointer-events-none backdrop-blur-md animate-in fade-in duration-200"
                    style={{ right: '50%', transform: 'translateX(50%)' }}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="font-extrabold text-amber-400 flex items-center gap-1">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{layoutDef.title}</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                        {layoutDef.badge}
                      </span>
                    </div>

                    <p className="text-zinc-300 text-[10px] leading-relaxed">
                      {layoutDef.description}
                    </p>

                    <div className="space-y-1 text-[10px] border-t border-white/10 pt-1.5">
                      <div className="flex items-start gap-1">
                        <span className="text-amber-400 shrink-0 font-bold">טיפוגרפיה:</span>
                        <span className="text-zinc-300">{layoutDef.typography}</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-amber-400 shrink-0 font-bold">כפתורים:</span>
                        <span className="text-zinc-300">{layoutDef.buttonShape}</span>
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1 pt-1 border-t border-white/10">
                      <span className="text-[9px] text-zinc-400 ml-1">פלטה:</span>
                      {layoutDef.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Accordion Settings Body */}
      <div className="overflow-y-auto space-y-2 py-2 pr-0.5 max-h-[58vh] no-scrollbar">
        {/* SECTION 1: Layout & Sizing */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <span>1. סגנון פריסה ומבנה (6 סגנונות)</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.layouts ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.layouts && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-500 block">
                  סגנון פריסה נבחר
                </label>
                <select
                  value={formData.layout || 'standard'}
                  onChange={(e) =>
                    updateField('layout', e.target.value as VideoEngagementLayoutPreset)
                  }
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                >
                  <option value="feminine" className="bg-zinc-900 text-white">
                    א. פריסה בסגנון נשי (רכה, רוז-גולד, קשתות ושמנת)
                  </option>
                  <option value="masculine" className="bg-zinc-900 text-white">
                    ב. פריסה בסגנון גברי (פחם, זהב פליז מטאלי ומסגרת פלדה)
                  </option>
                  <option value="standard" className="bg-zinc-900 text-white">
                    ג. פריסה עכשווית (הפריסה המקורית של KOSUN)
                  </option>
                  <option value="spiritual" className="bg-zinc-900 text-white">
                    ד. פריסה רוחנית (מרווה, מנטה, הילת צללים ושלווה)
                  </option>
                  <option value="sharp" className="bg-zinc-900 text-white">
                    ה. פריסה חדה (הייטק, ציאן ניאון ו-90 מעלות ללא רדיוס)
                  </option>
                  <option value="analytical" className="bg-zinc-900 text-white">
                    ו. פריסה אנליטית (אינדקס נתונים #01, כחול נייבי וסדר קטלוגי)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    קנה מידה (Object Scale)
                  </label>
                  <select
                    value={formData.objectScale || 'normal'}
                    onChange={(e) => updateField('objectScale', e.target.value as any)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="compact" className="bg-zinc-900 text-white">קומפקטי (Compact)</option>
                    <option value="normal" className="bg-zinc-900 text-white">רגיל (Normal)</option>
                    <option value="large" className="bg-zinc-900 text-white">גדול (Large)</option>
                    <option value="massive" className="bg-zinc-900 text-white">מסיבי (Massive)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    צורת כפתורים
                  </label>
                  <select
                    value={formData.buttonShape || 'auto'}
                    onChange={(e) => updateField('buttonShape', e.target.value as any)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto" className="bg-zinc-900 text-white">אוטומטי לפי הפריסה</option>
                    <option value="round" className="bg-zinc-900 text-white">עגול מלא (Circle)</option>
                    <option value="pill" className="bg-zinc-900 text-white">קפסולה מעוגלת (Pill)</option>
                    <option value="square" className="bg-zinc-900 text-white">מלבן מעוגל (Square)</option>
                    <option value="sharp" className="bg-zinc-900 text-white">חד (90 מעלות)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Social Sharing Buttons & Default Icons-Only Mode */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('social')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-cyan-500/15 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <span>2. סגנון כפתורי שיתוף (איקונים וטולטיפ כברירת מחדל)</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.social ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.social && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-500 block">
                  סגנון תצוגת כפתורי השיתוף
                </label>
                <select
                  value={formData.socialButtonsStyle || 'icons-only'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    updatePatch({
                      socialButtonsStyle: val,
                      showButtonLabels: val === 'icons-text',
                    });
                  }}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                >
                  <option value="icons-only" className="bg-zinc-900 text-white">
                    איקונים בלבד עם טולטיפ מרחף (ברירת מחדל מומלצת)
                  </option>
                  <option value="icons-text" className="bg-zinc-900 text-white">
                    איקונים + תוויות טקסט מלאות (WhatsApp, Facebook...)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-zinc-300">
                  הפעל אפשרויות שיתוף ברשתות
                </span>
                <input
                  type="checkbox"
                  checked={formData.enableSocialShare !== false}
                  onChange={(e) => updateField('enableSocialShare', e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="space-y-0.5 pt-1">
                <label className="text-[10px] font-bold text-amber-500 block">
                  כותרת / טקסט מלווה לשיתוף (Share Title)
                </label>
                <input
                  type="text"
                  value={formData.shareTitle || ''}
                  onChange={(e) => updateField('shareTitle', e.target.value)}
                  placeholder="צפו בסרטון המרתק..."
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Engagement & Likes Settings */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('engagement_stats')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </div>
              <span>3. לייקים, צפיות ואינטראקציה</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.engagement_stats ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.engagement_stats && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300">
                  הפעל כפתורי לייק / דיסלייק
                </span>
                <input
                  type="checkbox"
                  checked={formData.allowLikes !== false}
                  onChange={(e) => updateField('allowLikes', e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    כמות לייקים בסיסית
                  </label>
                  <input
                    type="number"
                    value={formData.likesCount ?? 0}
                    onChange={(e) => updateField('likesCount', Number(e.target.value))}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">
                    כמות צפיות
                  </label>
                  <input
                    type="number"
                    value={Number(formData.viewsCount ?? 0)}
                    onChange={(e) => updateField('viewsCount', Number(e.target.value))}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-amber-500 block">
                  שם / כותרת הוידאו
                </label>
                <input
                  type="text"
                  value={formData.videoTitle || ''}
                  onChange={(e) => updateField('videoTitle', e.target.value)}
                  placeholder="סרטון וידאו"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Text Background Overlay & 5 Hover Effects */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('text_bg')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-pink-500/15 text-pink-400' : 'bg-pink-100 text-pink-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
              <span>4. תמונת רקע מאחורי הסרגל והאזור</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.text_bg ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.text_bg && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300">
                  הפעל תמונת רקע
                </span>
                <input
                  type="checkbox"
                  checked={formData.textBgEnabled || false}
                  onChange={(e) => updateField('textBgEnabled', e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {formData.textBgEnabled && (
                <div className="space-y-3 pt-1 border-t border-white/5">
                  <PageBuilderImageUpload
                    label="קישור תמונת רקע"
                    value={formData.textBgImageUrl || ''}
                    onChange={(url) => updateField('textBgImageUrl', url)}
                  />

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      תחום השפעת הרקע
                    </label>
                    <select
                      value={formData.textBgScope || 'bar'}
                      onChange={(e) => updateField('textBgScope', e.target.value as any)}
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-transparent border-amber-500/60 text-white'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    >
                      <option value="bar" className="bg-zinc-900 text-white">
                        בתוך סרגל האינטראקציה בלבד
                      </option>
                      <option value="section" className="bg-zinc-900 text-white">
                        מאחורי כל שטח האזור כולו
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      אפקט מעבר (Hover Transition)
                    </label>
                    <select
                      value={formData.textBgEffect || 'zoom-glow'}
                      onChange={(e) => updateField('textBgEffect', e.target.value as HeroTextBgEffect)}
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-transparent border-amber-500/60 text-white'
                          : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    >
                      <option value="zoom-glow" className="bg-zinc-900 text-white">
                        1. זום והארה עדינה (Zoom & Glow)
                      </option>
                      <option value="shimmer-sweep" className="bg-zinc-900 text-white">
                        2. ברק חולף (Shimmer Sweep)
                      </option>
                      <option value="float-parallax" className="bg-zinc-900 text-white">
                        3. ציפה תלת-ממדית (Float Parallax)
                      </option>
                      <option value="blur-reveal" className="bg-zinc-900 text-white">
                        4. התבהרות מטשטוש (Blur Reveal)
                      </option>
                      <option value="gradient-shift" className="bg-zinc-900 text-white">
                        5. תנועת צבע דינמית (Gradient Shift)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>שקיפות שכבת כיסוי כהה (Overlay)</span>
                      <span className="text-amber-400 font-bold">
                        {Math.round((formData.textBgOverlayOpacity ?? 0.6) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={formData.textBgOverlayOpacity ?? 0.6}
                      onChange={(e) =>
                        updateField('textBgOverlayOpacity', parseFloat(e.target.value))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <PageBuilderColorPicker
                    label="צבע שכבת כיסוי"
                    value={formData.textBgOverlayColor || '#000000'}
                    onChange={(c) => updateField('textBgOverlayColor', c)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: Tags Management */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('tags')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
              </div>
              <span>5. תוויות ותגיות וידאו ({tags.length})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.tags ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.tags && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="הקלד תווית חדשה (למשל: הדרכה, מומחיות)..."
                  className={`flex-1 border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTagInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-zinc-500 hover:text-rose-400 transition cursor-pointer mr-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: Comments Management */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('comments')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span>6. ניהול תגובות גולשים ({comments.length})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.comments ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.comments && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300">
                  הצג אזור תגובות לוידאו
                </span>
                <input
                  type="checkbox"
                  checked={formData.allowComments !== false}
                  onChange={(e) => updateField('allowComments', e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300">
                  אפשר לגולשים להוסיף תגובה חדשה
                </span>
                <input
                  type="checkbox"
                  checked={formData.allowUserComments !== false}
                  onChange={(e) => updateField('allowUserComments', e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400">
                  סה״כ תגובות: <strong className="text-white">{comments.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleAddSampleComment}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף תגובת דוגמה</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>{comm.authorName}</span>
                        <span className="text-[10px] text-zinc-500">• {comm.publishedAt}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comm.id)}
                        className="text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                        title="מחק תגובה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-snug">{comm.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 7: Custom Colors & Anchor */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
              </div>
              <span>7. צבעים מותאמים אישית ומזהה עוגן</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.colors ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.colors && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>השאר ריק לשימוש בפלטת הצבעים המקורית של הפריסה</span>
                </span>
                {(formData.accentColor ||
                  formData.cardBackgroundColor ||
                  (formData.backgroundColor && formData.backgroundColor !== 'transparent')) && (
                  <button
                    type="button"
                    onClick={() =>
                      updatePatch({
                        accentColor: undefined,
                        cardBackgroundColor: undefined,
                        backgroundColor: 'transparent',
                      })
                    }
                    className="text-amber-400 hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    אפס צבעים לפריסה
                  </button>
                )}
              </div>

              <PageBuilderColorPicker
                label="צבע דגש (Accent Color)"
                value={formData.accentColor || '#ef4444'}
                onChange={(c) => updateField('accentColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כרטיס / סרגל"
                value={formData.cardBackgroundColor || 'transparent'}
                onChange={(c) => updateField('cardBackgroundColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כללי לאזור"
                value={formData.backgroundColor || 'transparent'}
                onChange={(c) => updateField('backgroundColor', c)}
              />

              <div className="space-y-0.5 pt-1">
                <label className="text-[10px] font-bold text-amber-500 block">
                  מזהה עוגן (Anchor ID)
                </label>
                <input
                  type="text"
                  value={formData.anchorId || 'engagement'}
                  onChange={(e) => updateField('anchorId', e.target.value)}
                  dir="ltr"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Footer: Compact Bottom Actions */}
      <div
        className={`flex items-center justify-between pt-2.5 mt-2.5 border-t shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        <div className="text-[11px] font-medium text-zinc-400">
          {isDirty ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              שינויים ממתינים לשמירה
            </span>
          ) : (
            <span className="text-zinc-500">כל השינויים מעודכנים</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              סגור
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave(Boolean(onClose))}
            disabled={isSaving}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50'
                : isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'שומר...' : 'שמור'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
