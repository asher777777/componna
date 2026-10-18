import React, { useState, useEffect, useMemo } from 'react';
import {
  LivePostsGridSectionConfig,
  LivePostItem,
  LivePostsLayoutPreset,
  LivePostsDisplayMode,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  Save,
  X,
  ChevronDown,
  Sparkles,
  Palette,
  LayoutTemplate,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Layers,
  Wand2,
  Calendar,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Clock,
  User,
  Star,
  ArrowLeft,
  Grid,
  Check,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

export type LivePostsEditorAccordionSection =
  | 'layouts'
  | 'display'
  | 'text_bg'
  | 'posts'
  | 'colors';

interface LivePostsLayoutDefinition {
  id: LivePostsLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  cardStyleDesc: string;
  swatches: string[];
}

export const LIVE_POSTS_LAYOUT_DEFINITIONS: LivePostsLayoutDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)',
    subtitle: 'קשתות מעוגלות עמוקות (Radius 2.25rem), פלטת רוז-גולד, פודרה ושמנת חמה, תגיות פסטל וברק עדין',
    icon: Heart,
    objectSizingDesc: 'כרטיסים קפסולריים מעוגלים, מרווחים אווריריים והילת תאורה ורודה-זהובה רכה',
    buttonStyleDesc: 'כפתורי קפסולה עגולים מלאים (Rounded Full) בגרדיאנט ורוד-רוז רך עם מעבר עדין',
    colorPaletteDesc: 'ורוד פודרה, שמנת חמה, רוז-גולד, שמפניה וזהב מעודן',
    cardStyleDesc: 'כרטיסים רכים עם קשתות עליונות, תגיות פסטל מעוגלות ואפקט הרמה רך',
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)',
    subtitle: 'כותרות ענק מודגשות, פחם כהה, זהב מתכתי, מסגרת פלדה כפולה 2px וכרטיסים מסיביים סמכותיים',
    icon: Shield,
    objectSizingDesc: 'כרטיסי פלדה רחבים, כותרות שחורות בולטות (Font Black) וגבולות מתכת כפולים',
    buttonStyleDesc: 'כפתורים רחבים מסותתים (Rounded LG) עם גבול כפול מודגש בזהב ענבר',
    colorPaletteDesc: 'שחור-אוניקס, אפור פחם, זהב-ענבר מתכתי וכחול פלדה כהה',
    cardStyleDesc: 'כרטיסי פלדה עם גבול 2px כפול, תגיות שחור-זהב וטיפוגרפיה סמכותית',
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (סגנון Notion SaaS 2026)',
    subtitle: 'סקוורקל מעוגל 3XL נקי ומאוזן, אינדיגו וסגול מודרניים, צללים רכים ואווירת Mesh Glow',
    icon: LayoutTemplate,
    objectSizingDesc: 'כרטיסי Notion SaaS מעוגלים (Rounded 3XL), טיפוגרפיה חדה וריווחים שקולים',
    buttonStyleDesc: 'כפתורים מעוגלים מודרניים (Rounded XL) באינדיגו ואמרלד עם צל רך',
    colorPaletteDesc: 'אינדיגו מודרני, סגול עדין, לבן, סלייט וניגודיות שקופה אלגנטית',
    cardStyleDesc: 'כרטיסי SaaS מאוזנים עם תגיות מעודנות וצל זכוכית עדין',
    swatches: ['#6366f1', '#a855f7', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית, שלווה ומעוררת השראה)',
    subtitle: 'ירוק מרווה (Sage), טורקיז עמוק, זהב הילה, עקומות אורגניות ומעברים איטיים ושלווים',
    icon: Sun,
    objectSizingDesc: 'מרווחי נשימה עמוקים, קווים עגולים עוטפים וטיפוגרפיה שלווה ומרווחת',
    buttonStyleDesc: 'כפתורי לוטוס הרמוניים עם שקיפות זכוכית ומעברי צבע איטיים ושלווים (duration-700)',
    colorPaletteDesc: 'ירוק מרווה (Sage), טורקיז עמוק, חול מדברי וזהב הילה זוהר בעדינות',
    cardStyleDesc: 'כרטיסים הרמוניים עם מסגרת טורקיז מעודנת, תגיות הילה וצל אוורירי',
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)',
    subtitle: 'זוויות ישרות 90° ללא שום עיגול, מסגרת 2px שחור/לבן, צל מוסט קשיח 5px ותגיות מונוספייס חותכות',
    icon: Crosshair,
    objectSizingDesc: 'אובייקטים גיאומטריים חדים (0px Radius), מסגרות 2px מודגשות וגריד מדויק',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל קשיח מוסט ואפקט לחיצה חותך',
    colorPaletteDesc: 'שחור ולבן בניגודיות מקסימלית עם הדגשות אינדיגו חשמלי',
    cardStyleDesc: 'כרטיסים מלבניים חדים 90° עם מסגרת 2px שחורה/לבנה, צל מוסט קשיח ותגיות [CHIP]',
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מסוף HUD טכנולוגי ודיוק מדדי)',
    subtitle: 'כרטיסי HUD עם חיתוכי פינות 45° (Chamfered), ציאן-כחול טלמטריה, זמני קריאה ומדדי חשיפה',
    icon: Activity,
    objectSizingDesc: 'קומפוזיציית מסוף דשבורד מהודקת, תגיות זמני קריאה (3m read) ומדדי פעילות חיים',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded XL) בגרדיאנט ציאן-כחול עם חיווי סטטוס',
    colorPaletteDesc: 'כחול-צי עמוק, ציאן טלמטריה, ירוק אמרלד של זמינות ורשת נקודות',
    cardStyleDesc: 'כרטיסי HUD מנוקבי זוויות עם סוגרי פינות מוארים, מדדי זמן קריאה וקווי סריקה',
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
  },
];

export const LIVE_POSTS_DISPLAY_MODES: Array<{
  id: LivePostsDisplayMode;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'grid',
    label: 'גריד עמודות קלאסי (Grid)',
    description: 'חלוקה מאוזנת ל-3 עמודות עם תמונות ביחס 16:9 וכרטיסים אחידים',
    icon: Grid,
  },
  {
    id: 'carousel',
    label: 'קרוסלה זזה עם חיצים (Carousel Slider)',
    description: 'גלילה אופקית חלקה עם חיצי ניווט – אידיאלי לעמודים עמוסי תוכן',
    icon: Sliders,
  },
  {
    id: 'spotlight',
    label: 'פוסט מוביל מודגש (Featured Spotlight)',
    description: 'פוסט ראשי גדול ומרשים בצד, ופוסטים משניים לצדו',
    icon: Star,
  },
  {
    id: 'compact-list',
    label: 'רשימה מהודקת (Compact List)',
    description: 'כרטיסים אופקיים עם תמונה קומפקטית בצד – מתאים ליומן אירועים וחדשות',
    icon: Calendar,
  },
];

interface LivePostsGridEditorProps {
  config: LivePostsGridSectionConfig;
  onChange: (updated: LivePostsGridSectionConfig) => void;
  onClose?: () => void;
}

export const LivePostsGridEditor: React.FC<LivePostsGridEditorProps> = ({ config, onChange, onClose }) => {
  const { getCapability } = useHostCapabilities();
  const brandDnaCap = getCapability<BrandDnaContract>('brandDna');

  const [formData, setFormData] = useState<LivePostsGridSectionConfig>({
    ...config,
    title: config.title || 'עדכונים ואירועים אחרונים',
    description: config.description || 'כל מה שחדש וקורה בפעילות ובקהילה שלנו',
    layout: config.layout || 'standard',
    displayMode: config.displayMode || 'grid',
    objectScale: config.objectScale || 'normal',
    buttonShape: config.buttonShape || 'rounded',
    buttonSize: config.buttonSize || 'md',
    showCtaButton: config.showCtaButton ?? true,
    ctaText: config.ctaText || 'לכל האירועים והחדשות',
    ctaUrl: config.ctaUrl || '#',
    showPostExcerpt: config.showPostExcerpt ?? true,
    showPostDate: config.showPostDate ?? true,
    showPostTag: config.showPostTag ?? true,
    showPostAuthor: config.showPostAuthor ?? true,
    showReadTime: config.showReadTime ?? true,
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layouts: true,
  });
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  useEffect(() => {
    setFormData({
      ...config,
      title: config.title || 'עדכונים ואירועים אחרונים',
      description: config.description || 'כל מה שחדש וקורה בפעילות ובקהילה שלנו',
      layout: config.layout || 'standard',
      displayMode: config.displayMode || 'grid',
      objectScale: config.objectScale || 'normal',
      buttonShape: config.buttonShape || 'rounded',
      buttonSize: config.buttonSize || 'md',
      showCtaButton: config.showCtaButton ?? true,
      ctaText: config.ctaText || 'לכל האירועים והחדשות',
      ctaUrl: config.ctaUrl || '#',
      showPostExcerpt: config.showPostExcerpt ?? true,
      showPostDate: config.showPostDate ?? true,
      showPostTag: config.showPostTag ?? true,
      showPostAuthor: config.showPostAuthor ?? true,
      showReadTime: config.showReadTime ?? true,
    });
  }, [config]);

  // Dirty state tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(config);
  }, [formData, config]);

  const update = <K extends keyof LivePostsGridSectionConfig>(
    field: K,
    value: LivePostsGridSectionConfig[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: LivePostsEditorAccordionSection) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    onChange(formData);
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage('השינויים נשמרו בהצלחה!');
      setTimeout(() => setToastMessage(null), 3000);
    }, 250);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else if (onClose) {
      onClose();
    }
  };

  const handleSyncBrandDna = async () => {
    if (!brandDnaCap) {
      setToastMessage('שירות Brand DNA אינו זמין כעת');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    try {
      const dna = await brandDnaCap.getBrandDna();
      if (dna) {
        const company = dna.identity?.companyName || '';
        const slogan = dna.identity?.slogan || '';
        const phone = dna.trust?.contactPhone || '';
        const whatsapp = dna.trust?.whatsappSupportNumber || phone;

        setFormData((prev) => ({
          ...prev,
          title: company ? `עדכונים ואירועים אחרונים של ${company}` : prev.title,
          description: slogan || prev.description,
          ctaText: prev.ctaText || 'לכל האירועים והחדשות',
          ctaUrl: whatsapp
            ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`שלום, קראתי על העדכונים של ${company}`)}`
            : prev.ctaUrl || '#',
        }));

        setIsBrandSynced(true);
        setToastMessage(`סונכרן בהצלחה עם ה-DNA של ${company || 'המותג'}!`);
        setTimeout(() => {
          setIsBrandSynced(false);
          setToastMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to sync brand DNA:', err);
      setToastMessage('שגיאה בסנכרון עם Brand DNA');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Post management helpers
  const handleAddPost = () => {
    const newPost: LivePostItem = {
      id: Date.now().toString(),
      title: 'כותרת אירוע או עדכון חדש',
      excerpt: 'תקציר הידיעה, מה התחדש, ומידע רלוונטי לקהילה וללקוחות...',
      date: 'היום',
      tag: 'אירועים',
      tagColor: '#6366f1',
      readTimeMinutes: 3,
      authorName: 'צוות המערכת',
      isFeatured: false,
      imageUrl:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      linkUrl: '#',
      ctaButtonText: 'קרא עוד',
    };
    const updated = [...(formData.customPages || []), newPost];
    update('customPages', updated);
    setEditingPostId(newPost.id);
  };

  const handleUpdatePost = (id: string, updates: Partial<LivePostItem>) => {
    const updated = (formData.customPages || []).map((p) => (p.id === id ? { ...p, ...updates } : p));
    update('customPages', updated);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('האם למחוק פוסט זה?')) {
      const updated = (formData.customPages || []).filter((p) => p.id !== id);
      update('customPages', updated);
      if (editingPostId === id) setEditingPostId(null);
    }
  };

  const currentLayoutDef = useMemo(() => {
    const active = formData.layout || 'standard';
    return (
      LIVE_POSTS_LAYOUT_DEFINITIONS.find((l) => l.id === active) ||
      LIVE_POSTS_LAYOUT_DEFINITIONS[2] // standard
    );
  }, [formData.layout]);

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-300 relative text-right"
      dir="rtl"
      style={{ fontFamily: "'Heebo', sans-serif" }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-indigo-600/95 text-white text-xs sm:text-sm px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
            LP
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              <span>עדכונים ואירועים (פוסטים) 2.0</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              6 פריסות מותג • גריד, קרוסלה וספוטלייט • ניהול עשיר
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Brand DNA Sync */}
          {brandDnaCap && (
            <button
              type="button"
              onClick={handleSyncBrandDna}
              title="סנכרן כותרות ותכנים מ-Brand DNA של המותג"
              className={`p-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1 border ${
                isBrandSynced
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-500'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBrandSynced ? 'animate-spin' : 'text-indigo-500'}`} />
              <span className="hidden sm:inline text-xs">סנכרון DNA</span>
            </button>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
              isDirty
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ring-2 ring-indigo-400/30 animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'שומר...' : isDirty ? 'שמור שינויים' : 'שמור'}</span>
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="סגור חלונית עריכה"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ICON MENU TOOLBAR (STRICTLY ICON + RICH TOOLTIP ONLY, NO TEXT LABELS) */}
      <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-around gap-1">
        {[
          {
            id: 'layouts' as LivePostsEditorAccordionSection,
            icon: LayoutTemplate,
            label: 'פריסות וסגנון מותג',
            badge: currentLayoutDef.shortLabel,
          },
          {
            id: 'display' as LivePostsEditorAccordionSection,
            icon: Sliders,
            label: 'אופן תצוגה וכפתור פעולה',
            badge: formData.displayMode,
          },
          {
            id: 'text_bg' as LivePostsEditorAccordionSection,
            icon: Layers,
            label: 'רקע תמונה ואפקטים',
            badge: formData.textBgEnabled ? 'פעיל' : undefined,
          },
          {
            id: 'posts' as LivePostsEditorAccordionSection,
            icon: Calendar,
            label: 'ניהול פוסטים ואירועים',
            badge: `${(formData.customPages || []).length} פוסטים`,
          },
          {
            id: 'colors' as LivePostsEditorAccordionSection,
            icon: Palette,
            label: 'צבעים ומזהה עוגן',
          },
        ].map((item) => {
          const isOpen = Boolean(openSections[item.id]);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSection(item.id)}
              className={`relative group p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                isOpen
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200/80 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />

              {/* Rich Floating Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE LAYOUT SUMMARY CARD */}
      <div className="mx-3 my-2.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            {React.createElement(currentLayoutDef.icon, { className: 'w-4 h-4' })}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>{currentLayoutDef.shortLabel}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold">
                תצוגה: {formData.displayMode || 'grid'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {currentLayoutDef.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {currentLayoutDef.swatches.map((color, idx) => (
            <span
              key={idx}
              className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800 shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* ACCORDION CONTENT BODY */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3 max-h-[calc(90vh-180px)]">

        {/* 1. LAYOUT PRESETS ACCORDION (STRICTLY VERTICAL ROWS STACKED ONE UNDER ANOTHER) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  1. בחירת פריסה ועיצוב מותג
                </span>
                <span className="text-[10px] text-slate-500 block">
                  6 סגנונות מותג מתקדמים לאזור הפוסטים והאירועים
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.layouts ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.layouts && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              {/* VERTICAL ROWS ONE UNDER ANOTHER (FLEX FLEX-COL) */}
              <div className="flex flex-col gap-2.5">
                {LIVE_POSTS_LAYOUT_DEFINITIONS.map((layout) => {
                  const isSelected = formData.layout === layout.id;
                  const LayoutIcon = layout.icon;
                  return (
                    <div
                      key={layout.id}
                      onClick={() => update('layout', layout.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 relative text-right flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-indigo-500 text-white border-indigo-600'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            <LayoutIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white block leading-tight">
                              {layout.title}
                            </span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                              {layout.cardStyleDesc}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {layout.subtitle}
                      </p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400">פלטת צבעים:</span>
                        <div className="flex items-center gap-1">
                          {layout.swatches.map((color, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. DISPLAY MODES & SECTION CONTROLS (VERTICAL ROWS) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('display')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  2. אופן תצוגה וכפתור פעולה
                </span>
                <span className="text-[10px] text-slate-500 block">
                  גריד, קרוסלה, ספוטלייט מודגש או רשימה מהודקת
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.display ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.display && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              {/* DISPLAY MODE ROWS (VERTICAL STACK) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  סגנון תצוגת הפוסטים (Display Mode)
                </span>
                <div className="flex flex-col gap-2">
                  {LIVE_POSTS_DISPLAY_MODES.map((mode) => {
                    const isSelected = (formData.displayMode || 'grid') === mode.id;
                    const ModeIcon = mode.icon;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => update('displayMode', mode.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <ModeIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                              {mode.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {mode.description}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Display controls toggles */}
              <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  הצגת אלמנטים בכרטיסי הפוסטים:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showPostExcerpt ?? true)}
                      onChange={(e) => update('showPostExcerpt', e.target.checked)}
                      className="rounded text-indigo-500 focus:ring-indigo-400 w-3.5 h-3.5"
                    />
                    <span className="text-slate-700 dark:text-slate-300">תקציר הפוסט</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showPostDate ?? true)}
                      onChange={(e) => update('showPostDate', e.target.checked)}
                      className="rounded text-indigo-500 focus:ring-indigo-400 w-3.5 h-3.5"
                    />
                    <span className="text-slate-700 dark:text-slate-300">תאריך אירוע</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showPostTag ?? true)}
                      onChange={(e) => update('showPostTag', e.target.checked)}
                      className="rounded text-indigo-500 focus:ring-indigo-400 w-3.5 h-3.5"
                    />
                    <span className="text-slate-700 dark:text-slate-300">תגית / קטגוריה</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showReadTime ?? true)}
                      onChange={(e) => update('showReadTime', e.target.checked)}
                      className="rounded text-indigo-500 focus:ring-indigo-400 w-3.5 h-3.5"
                    />
                    <span className="text-slate-700 dark:text-slate-300">זמן קריאה משוער</span>
                  </label>
                </div>
              </div>

              {/* Sizing & Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    קנה מידה לאובייקטים (Object Scale)
                  </label>
                  <select
                    value={formData.objectScale || 'normal'}
                    onChange={(e) => update('objectScale', e.target.value as any)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="auto">אוטומטי (לפי הפריסה)</option>
                    <option value="compact">קומפקטי ומדויק</option>
                    <option value="normal">סטנדרטי מאוזן</option>
                    <option value="large">גדול ומודגש</option>
                    <option value="massive">ענק ומסיבי (Eye-Catching)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    צורת כפתורי פעולה
                  </label>
                  <select
                    value={formData.buttonShape || 'rounded'}
                    onChange={(e) => update('buttonShape', e.target.value as any)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="auto">אוטומטי (לפי הפריסה)</option>
                    <option value="pill">קפסולה עגולה (Pill)</option>
                    <option value="rounded">מעוגל מודרני (Rounded)</option>
                    <option value="sharp">חד 90° (Sharp Brutalist)</option>
                    <option value="chiseled">מסותת טקטי (Chiseled)</option>
                  </select>
                </div>
              </div>

              {/* Global CTA button */}
              <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.showCtaButton ?? true)}
                    onChange={(e) => update('showCtaButton', e.target.checked)}
                    className="rounded text-indigo-500 focus:ring-indigo-400 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    הצג כפתור הנעה לפעולה ראשי (CTA) בתחתית האזור
                  </span>
                </label>

                {(formData.showCtaButton ?? true) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <PageBuilderInput
                      label="טקסט הכפתור"
                      value={formData.ctaText || ''}
                      onChange={(e) => update('ctaText', e.target.value)}
                      placeholder="לכל האירועים והחדשות"
                    />
                    <PageBuilderInput
                      label="קישור הכפתור (URL / עוגן)"
                      value={formData.ctaUrl || ''}
                      onChange={(e) => update('ctaUrl', e.target.value)}
                      placeholder="#events או קישור מלא"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. TEXT BACKGROUND OVERLAY ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('text_bg')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  3. רקע תמונה מתקדם לטקסט / אזור (Text Background)
                </span>
                <span className="text-[10px] text-slate-500 block">
                  שכבת רקע עם 5 אפקטים עוברים מתקדמים
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.text_bg ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.text_bg && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(formData.textBgEnabled)}
                  onChange={(e) => update('textBgEnabled', e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-400 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  הפעל תמונת רקע מאחורי הכותרות או אזור הפוסטים
                </span>
              </label>

              {formData.textBgEnabled && (
                <div className="space-y-3 bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <PageBuilderImageUpload
                    label="תמונת רקע"
                    value={formData.textBgImageUrl || ''}
                    onChange={(url) => update('textBgImageUrl', url)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PageBuilderColorPicker
                      label="צבע שכבת כיסוי (Overlay Color)"
                      value={formData.textBgOverlayColor || '#000000'}
                      onChange={(c) => update('textBgOverlayColor', c)}
                    />

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        אטימות שכבת כיסוי: {formData.textBgOverlayOpacity ?? 60}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.textBgOverlayOpacity ?? 60}
                        onChange={(e) => update('textBgOverlayOpacity', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        אפקט עובר (Hover / Reveal Effect)
                      </label>
                      <select
                        value={formData.textBgEffect || 'zoom-glow'}
                        onChange={(e) => update('textBgEffect', e.target.value as HeroTextBgEffect)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <option value="zoom-glow">זום וזוהר עדין (Zoom & Glow)</option>
                        <option value="shimmer-sweep">ברק נע מתכתי (Shimmer Sweep)</option>
                        <option value="float-parallax">ציפה תלת-ממדית (Float Parallax)</option>
                        <option value="blur-reveal">חשיפה מטשטוש (Blur Reveal)</option>
                        <option value="gradient-shift">שינוי גרדיאנט דינמי (Gradient Shift)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        תחולת הרקע (Scope)
                      </label>
                      <select
                        value={formData.textBgScope || 'text-card'}
                        onChange={(e) => update('textBgScope', e.target.value as any)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <option value="text-card">כרטיס הכותרות בלבד</option>
                        <option value="full-section">כל האזור מקצה לקצה</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. POSTS & EVENTS MANAGEMENT ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('posts')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  4. ניהול פוסטים ואירועים ({(formData.customPages || []).length})
                </span>
                <span className="text-[10px] text-slate-500 block">
                  הוספה, עריכת תכנים, תמונות, תאריכים ותגיות
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddPost();
                }}
                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>הוסף פוסט</span>
              </button>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSections.posts ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openSections.posts && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <PageBuilderInput
                label="כותרת ראשית של האזור"
                value={formData.title || ''}
                onChange={(e) => update('title', e.target.value)}
                placeholder="למשל: עדכונים ואירועים אחרונים"
              />

              <PageBuilderTextarea
                label="תיאור משנה של האזור"
                value={formData.description || ''}
                onChange={(e) => update('description', e.target.value)}
                rows={2}
                placeholder="למשל: כל מה שחדש וקורה בפעילות ובקהילה שלנו"
              />

              {/* POST ITEMS LIST (VERTICAL ROWS) */}
              <div className="flex flex-col gap-2.5 pt-2">
                {(formData.customPages || []).map((post, idx) => {
                  const isEditing = editingPostId === post.id;
                  return (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 overflow-hidden shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-800/80">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {post.title || 'ללא כותרת'}
                          </span>
                          {post.isFeatured && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                              מוביל
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPostId(isEditing ? null : post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="ערוך פוסט"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="מחק פוסט"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="p-3.5 border-t border-slate-200 dark:border-slate-700 space-y-3 bg-white dark:bg-slate-900">
                          <PageBuilderInput
                            label="כותרת הפוסט"
                            value={post.title}
                            onChange={(e) => handleUpdatePost(post.id, { title: e.target.value })}
                          />

                          <PageBuilderTextarea
                            label="תקציר הפוסט"
                            value={post.excerpt || ''}
                            onChange={(e) => handleUpdatePost(post.id, { excerpt: e.target.value })}
                            rows={2}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <PageBuilderInput
                              label="תאריך"
                              value={post.date || ''}
                              onChange={(e) => handleUpdatePost(post.id, { date: e.target.value })}
                              placeholder="15 באוגוסט 2026"
                            />
                            <PageBuilderInput
                              label="תגית / קטגוריה"
                              value={post.tag || ''}
                              onChange={(e) => handleUpdatePost(post.id, { tag: e.target.value })}
                              placeholder="אירועים / חדשות / פיתוח"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <PageBuilderInput
                              label="זמן קריאה משוער (בדקות)"
                              type="number"
                              value={String(post.readTimeMinutes || 3)}
                              onChange={(e) =>
                                handleUpdatePost(post.id, {
                                  readTimeMinutes: Number(e.target.value) || 1,
                                })
                              }
                            />
                            <PageBuilderInput
                              label="מחבר הפוסט"
                              value={post.authorName || ''}
                              onChange={(e) => handleUpdatePost(post.id, { authorName: e.target.value })}
                              placeholder="צוות המערכת"
                            />
                          </div>

                          <PageBuilderImageUpload
                            label="תמונה ראשית לפוסט"
                            value={post.imageUrl || ''}
                            onChange={(url) => handleUpdatePost(post.id, { imageUrl: url })}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <PageBuilderInput
                              label="קישור לכתבה מלאה"
                              value={post.linkUrl || ''}
                              onChange={(e) => handleUpdatePost(post.id, { linkUrl: e.target.value })}
                              placeholder="https://..."
                              dir="ltr"
                            />
                            <PageBuilderInput
                              label="טקסט כפתור הקריאה"
                              value={post.ctaButtonText || 'קרא את הכתבה המלאה'}
                              onChange={(e) =>
                                handleUpdatePost(post.id, { ctaButtonText: e.target.value })
                              }
                            />
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(post.isFeatured)}
                              onChange={(e) => handleUpdatePost(post.id, { isFeatured: e.target.checked })}
                              className="rounded text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              סמן כפוסט מוביל (Featured Spotlight)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. COLORS AND ANCHOR ACCORDION */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 transition-all">
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className="w-full p-3 flex items-center justify-between text-right hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-500" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  5. צבעים מותאמים אישית ומזהה עוגן
                </span>
                <span className="text-[10px] text-slate-500 block">
                  צבעי רקע, כותרות, כרטיסים ועוגן ניווט
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.colors ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.colors && (
            <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע רקע כרטיסי פוסט"
                  value={formData.cardBackgroundColor || ''}
                  onChange={(c) => update('cardBackgroundColor', c)}
                />
                <PageBuilderColorPicker
                  label="צבע רקע כללי לאזור"
                  value={formData.backgroundColor || 'transparent'}
                  onChange={(c) => update('backgroundColor', c)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PageBuilderColorPicker
                  label="צבע כותרת ראשית"
                  value={formData.titleColor || ''}
                  onChange={(c) => update('titleColor', c)}
                />
                <PageBuilderColorPicker
                  label="צבע תיאור"
                  value={formData.descriptionColor || ''}
                  onChange={(c) => update('descriptionColor', c)}
                />
              </div>

              <PageBuilderInput
                label="מזהה עוגן (Anchor ID)"
                value={formData.anchorId || 'livePosts'}
                onChange={(e) => update('anchorId', e.target.value)}
                placeholder="livePosts"
                dir="ltr"
              />
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR WITH SAVE / DIRTY STATUS */}
      <div className="p-3 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          {isDirty ? (
            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping inline-block" />
              ישנם שינויים שלא נשמרו
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              הכל שמור ומסונכרן
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              ביטול
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'שומר...' : 'שמור והחל'}</span>
          </button>
        </div>
      </div>

      {/* UNSAVED CHANGES CONFIRMATION MODAL */}
      {showUnsavedConfirm && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-sm w-full text-right space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              האם לצאת ללא שמירה?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ביצעת שינויים באזור הפוסטים והאירועים שטרם נשמרו. יציאה כעת תבטל את השינויים הללו.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                המשך בעריכה
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  if (onClose) onClose();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                צא ללא שמירה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
