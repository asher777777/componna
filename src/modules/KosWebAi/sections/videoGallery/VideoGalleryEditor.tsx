import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import {
  VideoGallerySectionConfig,
  VideoGalleryItem,
  VideoGalleryLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { getCategoryFromPage } from '../../types/pageBuilder.types';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { BrandDnaContract, MediaPickerContract } from '../../../../core/contracts';
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
  Info,
  Video,
  Play,
  ExternalLink,
  FolderOpen,
  Youtube,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';

export type VideoGalleryEditorAccordionSection =
  | 'layouts'
  | 'text_bg'
  | 'content'
  | 'videos'
  | 'colors';

interface VideoGalleryLayoutDefinition {
  id: VideoGalleryLayoutPreset;
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

export const VIDEO_GALLERY_LAYOUT_DEFINITIONS: VideoGalleryLayoutDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)',
    subtitle: 'קווים עגולים וזורמים, פלטת רוז-גולד ושמנת, נגן וידאו מעוגל עמוק והילת תאורה רכה',
    icon: Heart,
    objectSizingDesc: 'מסגרת וידאו קפסולה מעוגלת עמוק (Radius 2.5rem), ריווחים אווריריים וכרטיסי תצוגה מעודנים',
    buttonStyleDesc: 'כפתורי קפסולה עגולים מלאים (Rounded Full) בגרדיאנט ורוד-רוז רך עם ברק עדין',
    colorPaletteDesc: 'ורוד פודרה, שמנת חמה, רוז-גולד, שמפניה ומסגרות פסטל',
    cardStyleDesc: 'כרטיסי וידאו רכים עם אייקון ניגון מעוגל, תגיות פסטל ומעבר חלק',
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)',
    subtitle: 'כותרות ענק מודגשות, פחם כהה, זהב מתכתי, מסגרת פלדה 2px כפולה ונגן מסיבי',
    icon: Shield,
    objectSizingDesc: 'כותרות ענק דרמטיות (Font Black), גבולות פלדה כפולים ונוכחות מסך מרשימה',
    buttonStyleDesc: 'כפתורים רחבים וגדולים מסותתים (Rounded LG) עם גבול כפול מודגש בזהב מתכתי',
    colorPaletteDesc: 'שחור-אוניקס, אפור פחם, זהב-ענבר מתכתי וכחול פלדה',
    cardStyleDesc: 'כרטיסי פלדה כהים עם מסגרות 2px מוארות בזהב וחיווי איכות וידאו סמכותי',
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (מה שכרגע נמצא)',
    subtitle: 'סגנון Notion SaaS 2026 נקי ומאוזן, נגן ראשי בולט (Spotlight) וגלריית תמונות ממוזערות',
    icon: LayoutTemplate,
    objectSizingDesc: 'נגן וידאו מרכזי רחב, כותרת מאוזנת ורשת כרטיסי וידאו תואמת',
    buttonStyleDesc: 'כפתורים מעוגלים מודרניים (Rounded XL) באינדיגו ואמרלד עם צל רך',
    colorPaletteDesc: 'אינדיגו מודרני, סגול עדין, לבן, סלייט וניגודיות שקופה אלגנטית',
    cardStyleDesc: 'כרטיסי Notion/SaaS נקיים עם תגיות משך זמן ותצוגה מקדימה חדה',
    swatches: ['#6366f1', '#a855f7', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית, שלווה ומעוררת השראה)',
    subtitle: 'סימטריה מרגיעה, ירוק מרווה, טורקיז עמוק, זהב הילה ומעברים איטיים ורגועים',
    icon: Sun,
    objectSizingDesc: 'מרווחי נשימה עמוקים, טיפוגרפיה רגועה ואובייקטים זורמים ללא עומס',
    buttonStyleDesc: 'כפתורי לוטוס הרמוניים עם שקיפות זכוכית ומעברי צבע איטיים ושלווים (duration-700)',
    colorPaletteDesc: 'ירוק מרווה (Sage), טורקיז עמוק, חול מדברי וזהב הילה זוהר בעדינות',
    cardStyleDesc: 'כרטיסי לוטוס הרמוניים עם מסגרת טורקיז מעודנת והילה עוטפת',
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)',
    subtitle: 'זוויות ישרות 90° ללא עיגול, מסגרות 2px שחור/לבן, צללים קשים מוסטים וטיפוגרפיה חותכת',
    icon: Crosshair,
    objectSizingDesc: 'אובייקטים גיאומטריים חדים (0px Radius), נגן מלבני קשיח ומסגרת 2px',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל קשיח מוסט ואפקט הזזה בלחיצה',
    colorPaletteDesc: 'שחור ולבן בניגודיות מקסימלית עם הדגשות אינדיגו חשמלי וטקסט חותך',
    cardStyleDesc: 'כרטיסים ממוסגרים ב-2px עם צל מוסט קשיח באינדיגו/סלייט ותוויות מונוספייס',
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מבוססת נתונים, צפיות ומדדי וידאו)',
    subtitle: 'מסוף טלמטריה טכנולוגי HUD, ציאן-כחול, רשת נקודות, מדדי צפיות ואיכות שידור 4K',
    icon: Activity,
    objectSizingDesc: 'קומפוזיציית דשבורד מהודקת, תגיות זמני וידאו (HD/4K), מונה צפיות וגריד נתונים',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded XL) בגרדיאנט ציאן-כחול עם חיווי סטטוס חי',
    colorPaletteDesc: 'כחול-צי עמוק, ציאן טלמטריה, ירוק אמרלד של זמינות ורשת נקודות טכנית',
    cardStyleDesc: 'כרטיסי וידאו עם חיווי סטטוס חי (HUD #), מסגרות ציאן דקות ומדדי צפייה',
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
  },
];

const DUMMY_YOUTUBE_IDS = new Set([
  'M7lc1UVf-VE',
  'dQw4w9WgXcQ',
  'aqz-KE-bpKQ',
  'jNQXAC9IVRw',
  'L_LUpnjgPso',
]);

function extractYouTubeId(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
  );
  return match ? match[1] : null;
}

export interface VideoGalleryEditorProps {
  config: VideoGallerySectionConfig;
  onChange: (updated: VideoGallerySectionConfig) => void;
  onClose?: () => void;
}

export const VideoGalleryEditor: React.FC<VideoGalleryEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { db } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );
  const isMaster = effTenant === '_master' || effTenant === ROOT_TENANT_ID;

  // Local form state
  const [formData, setFormData] = useState<VideoGallerySectionConfig>({
    source: 'tenant_youtube', // Default connected to author's tenant YouTube!
    ...config,
  });
  const [initialData, setInitialData] = useState<VideoGallerySectionConfig>({
    source: 'tenant_youtube',
    ...config,
  });

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hoveredLayoutId, setHoveredLayoutId] = useState<VideoGalleryLayoutPreset | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  // Tenant YouTube fetched videos list
  const [tenantVideos, setTenantVideos] = useState<VideoGalleryItem[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);

  // Dynamic Light / Dark mode sync from document element
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    setFormData({
      source: 'tenant_youtube',
      ...config,
    });
  }, [config]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch real YouTube videos from the author's tenant
  const loadTenantYouTubeVideos = async () => {
    setIsLoadingVideos(true);
    const collected: VideoGalleryItem[] = [];
    const seenIds = new Set<string>();

    try {
      const tenantPrefix = isMaster ? 'tenants/_master' : `tenants/${effTenant}`;

      // 1. Primary Firestore collection: mod_kos_tube_pages
      if (db) {
        try {
          const tubePagesRef = collection(db, `${tenantPrefix}/${SYSTEM_COLLECTIONS.KOS_TUBE_PAGES}`);
          const tubePagesSnap = await getDocs(tubePagesRef);
          tubePagesSnap.forEach((docSnap) => {
            const d = docSnap.data() as any;
            if (!d) return;
            const ytId = extractYouTubeId(d.youtubeVideoId);
            if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId)) return;
            if (seenIds.has(ytId)) return;
            seenIds.add(ytId);

            collected.push({
              id: `tube_${docSnap.id}`,
              title: d.seoTitle || d.title || 'סרטון YouTube מהטננט',
              subtitle: d.category || 'YouTube Video',
              description: d.summary || d.metaDescription || '',
              youtubeVideoId: ytId,
              videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
              thumbnailUrl: d.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
              viewsCount: Number(d.viewsCount || 120),
              publishedAt: d.publishedAt || d.createdAt || '',
              category: d.category || 'וידאו',
            });
          });
        } catch {
          // Ignore if collection not present
        }
      }

      // 2. Secondary source: PageBuilder pages created in tenant
      try {
        const allPages = await pageBuilderFirestore.getAllPages(db, effTenant);
        const videoPages = (allPages || []).filter((p) => {
          if (!p || p.isHomePage) return false;
          const pageId = String(p.pageId || '');
          const slugLower = String(p.slug || '').toLowerCase();
          const cat = getCategoryFromPage(p);
          return (
            pageId.startsWith('page_kosvidio_') ||
            cat === 'youtube_post' ||
            slugLower.startsWith('kosvidio-') ||
            slugLower.startsWith('kostube-')
          );
        });

        for (const p of videoPages) {
          const kosvidioSec = Object.values(p.sections || {}).find(
            (s: any) => s && s.type === 'kosvidio'
          ) as any;
          const pageIdSuffix = String(p.pageId || '').replace(/^page_kosvidio_/, '');
          const ytId =
            extractYouTubeId(kosvidioSec?.youtubeVideoId) ||
            extractYouTubeId(kosvidioSec?.videoUrl) ||
            extractYouTubeId(pageIdSuffix);
          if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId)) continue;
          if (seenIds.has(ytId)) continue;
          seenIds.add(ytId);

          collected.push({
            id: p.pageId || `page_${p.slug}`,
            title: p.pageTitle || kosvidioSec?.title || 'סרטון ערוץ',
            subtitle: p.slug || 'YouTube Video',
            description: kosvidioSec?.description || '',
            youtubeVideoId: ytId,
            videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            category: 'YouTube',
          });
        }
      } catch {
        // Ignore
      }

      setTenantVideos(collected);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    loadTenantYouTubeVideos();
  }, [db, effTenant, isMaster]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSection = (section: VideoGalleryEditorAccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = <K extends keyof VideoGallerySectionConfig>(
    key: K,
    value: VideoGallerySectionConfig[K]
  ) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updatePatch = (patch: Partial<VideoGallerySectionConfig>) => {
    const updated = { ...formData, ...patch };
    setFormData(updated);
    onChange(updated);
  };

  const handleSelectLayout = (layoutDef: VideoGalleryLayoutDefinition) => {
    updatePatch({
      layout: layoutDef.id,
      objectScale: 'auto',
      buttonShape: 'auto',
      buttonSize: 'auto',
    });
    showNotification(`הוחלה ${layoutDef.title}`);
  };

  const handleSave = (closeAfter = false) => {
    setIsSaving(true);
    try {
      onChange(formData);
      setInitialData({ ...formData });
      setShowUnsavedConfirm(false);
      showNotification('הגדרות גלריית הוידאו נשמרו בהצלחה');
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

  const handleSyncBrandDna = () => {
    if (!brandDna) {
      showNotification('לא נמצאו נתוני מיתוג ב-Brand DNA');
      return;
    }
    const companyName = brandDna.identity?.companyName || '';
    const slogan = brandDna.identity?.slogan || '';

    const updated: VideoGallerySectionConfig = {
      ...formData,
      title: companyName ? `ספריית הוידאו והתוכן של ${companyName}` : formData.title,
      subtitle: slogan || formData.subtitle,
      source: 'tenant_youtube',
    };
    setFormData(updated);
    onChange(updated);
    setIsBrandSynced(true);
    showNotification('גלריית הוידאו סונכרנה עם נתוני ה-Brand DNA ו-YouTube של הטננט');
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  const handlePickVideoFromGallery = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'video/*' });
      if (selected) {
        const finalUrl = Array.isArray(selected) ? selected[0] : selected;
        if (finalUrl) {
          updateField('videoUrl', finalUrl);
          updateField('source', 'custom');
        }
      }
    }
  };

  const normalizedActiveLayout: VideoGalleryLayoutPreset =
    !formData.layout ||
    formData.layout === 'current' ||
    formData.layout === 'standard' ||
    formData.layout === 'spotlight' ||
    formData.layout === 'grid'
      ? 'standard'
      : formData.layout;

  const activeLayoutDef =
    VIDEO_GALLERY_LAYOUT_DEFINITIONS.find((d) => d.id === normalizedActiveLayout) ||
    VIDEO_GALLERY_LAYOUT_DEFINITIONS[2];

  const tooltipLayoutDef =
    VIDEO_GALLERY_LAYOUT_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

  const isTenantSource = (formData.source || 'tenant_youtube') === 'tenant_youtube';

  return (
    <div
      className={`w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right ${
        isDarkMode
          ? 'bg-[#0a0a0a] border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* 1. Header: Two-Letter Avatar Icon (VG), Title, Brand DNA Sync, Save Icon, Close */}
      <div
        className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        {/* Right: Connected Two-Letter Avatar Icon (VG) + Title */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
              isDarkMode
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title="Video Gallery Section Editor"
          >
            VG
          </div>

          <div className="truncate">
            <div
              className={`text-xs sm:text-sm font-black truncate leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              עיצוב והגדרות גלריית וידאו ומדיה (Video Gallery)
            </div>
            <div
              className={`text-[10px] truncate leading-none mt-0.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              {activeLayoutDef.title}
            </div>
          </div>
        </div>

        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className={`p-1.5 rounded-full border transition hover:opacity-80 cursor-pointer ${
              isBrandSynced
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : isDarkMode
                  ? 'border-indigo-900 text-indigo-400 bg-indigo-950/30'
                  : 'border-indigo-200 text-indigo-600 bg-indigo-50/50'
            }`}
            title="סנכרן מ-Brand DNA ו-YouTube של הטננט"
          >
            {isBrandSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                : isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isDirty ? 'שמור שינויים שלא נשמרו' : 'שמור'}
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Banner */}
      {showUnsavedConfirm && (
        <div
          className={`mb-2.5 p-3 rounded-2xl border flex flex-col gap-2 animate-fadeIn ${
            isDarkMode
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="text-xs font-bold">יש שינויים שלא נשמרו. מה ברצונך לעשות?</div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition cursor-pointer"
            >
              שמור וסגור
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUnsavedConfirm(false);
                if (onClose) onClose();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              צא ללא שמירה
            </button>
            <button
              type="button"
              onClick={() => setShowUnsavedConfirm(false)}
              className="px-2.5 py-1 rounded-xl text-xs opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* 2. Icon Menu with Rich Tooltip for the 6 Video Gallery Layouts */}
      <div
        className={`p-2.5 mb-2.5 rounded-2xl border relative transition-all ${
          isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>תפריט אייקונים לבחירת סגנון פריסה (רחף מעל אייקון לפירוט)</span>
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDarkMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            פעיל: {activeLayoutDef.letter}. {activeLayoutDef.shortLabel}
          </span>
        </div>

        {/* 6 Icons Row */}
        <div className="grid grid-cols-6 gap-1.5">
          {VIDEO_GALLERY_LAYOUT_DEFINITIONS.map((def) => {
            const IconComp = def.icon;
            const isSelected = normalizedActiveLayout === def.id;
            return (
              <div
                key={def.id}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredLayoutId(def.id)}
                onMouseLeave={() => setHoveredLayoutId((prev) => (prev === def.id ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => handleSelectLayout(def)}
                  onFocus={() => setHoveredLayoutId(def.id)}
                  onBlur={() => setHoveredLayoutId(null)}
                  aria-label={def.title}
                  className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md ring-1 ring-amber-500/40'
                      : isDarkMode
                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-1 justify-center py-1">
                    <span className="text-[11px] font-black opacity-75">{def.letter}.</span>
                    <IconComp className="w-5 h-5 shrink-0" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Rich Interactive Tooltip Panel on Hover / Focus */}
        {tooltipLayoutDef && (
          <div
            className={`mt-2 p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn shadow-xl ${
              isDarkMode
                ? 'bg-[#0d0d0d] border-amber-500/40 text-zinc-200'
                : 'bg-white border-amber-400 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-1.5 border-amber-500/20">
              <span className="font-black text-amber-400 text-xs">{tooltipLayoutDef.title}</span>
              <div className="flex items-center gap-1">
                {tooltipLayoutDef.swatches.map((hex, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-3 rounded-full border border-white/20 inline-block"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] leading-snug pt-0.5">
              <div>
                <strong className="text-amber-500">גודל אובייקטים: </strong>
                <span>{tooltipLayoutDef.objectSizingDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">צורת כפתורים: </strong>
                <span>{tooltipLayoutDef.buttonStyleDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">פלטת צבעים: </strong>
                <span>{tooltipLayoutDef.colorPaletteDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">סגנון נגן וכרטיסים: </strong>
                <span>{tooltipLayoutDef.cardStyleDesc}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Toast Notification */}
      {toastMessage && (
        <div className="mb-2.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Active Layout Details Card */}
      <div
        className={`p-3 mb-2.5 rounded-2xl border text-xs space-y-2 ${
          isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="font-black text-xs text-amber-400 flex items-center gap-1.5">
              <span>{activeLayoutDef.title}</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">{activeLayoutDef.subtitle}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {activeLayoutDef.swatches.map((hex, idx) => (
              <span
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-zinc-300 font-bold">
              {isTenantSource
                ? `סנכרון YouTube של הטננט (${tenantVideos.length} סרטונים זוהו)`
                : 'מקור וידאו ידני'}
            </span>
          </div>
          <span className="text-zinc-400 font-mono">
            {formData.desktopHeight || '480px'}
          </span>
        </div>
      </div>

      {/* Accordion Sections Container */}
      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-0.5">
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
                <LayoutTemplate className="w-3.5 h-3.5" />
              </div>
              <span>1. בחירת פריסה ועיצוב כללי</span>
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
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-500 block">
                  סגנון פריסה לגלריית הוידאו:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {VIDEO_GALLERY_LAYOUT_DEFINITIONS.map((def) => {
                    const isSelected = normalizedActiveLayout === def.id;
                    const IconComp = def.icon;
                    return (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() => handleSelectLayout(def)}
                        className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-sm ring-1 ring-amber-500/30'
                            : isDarkMode
                              ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-black font-black'
                                : isDarkMode
                                  ? 'bg-white/10 text-zinc-300'
                                  : 'bg-white text-slate-700'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs">{def.title}</div>
                            <div className="text-[10px] text-zinc-400">{def.subtitle}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 mr-2">
                          {def.swatches.map((hex, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizing & Buttons Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    גודל אובייקטים וטקסט
                  </label>
                  <select
                    value={formData.objectScale || 'auto'}
                    onChange={(e) =>
                      updateField(
                        'objectScale',
                        e.target.value as VideoGallerySectionConfig['objectScale']
                      )
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי (לפי הפריסה)</option>
                    <option value="compact">קומפקטי (Compact)</option>
                    <option value="normal">רגיל (Normal)</option>
                    <option value="large">גדול (Large)</option>
                    <option value="massive">מסיבי (Massive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    צורת כפתורים
                  </label>
                  <select
                    value={formData.buttonShape || 'auto'}
                    onChange={(e) =>
                      updateField(
                        'buttonShape',
                        e.target.value as VideoGallerySectionConfig['buttonShape']
                      )
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי (לפי הפריסה)</option>
                    <option value="pill">קפסולה עגולה (Pill)</option>
                    <option value="rounded">מעוגל מודרני (Rounded)</option>
                    <option value="sharp">חד ללא עיגול (Sharp 0px)</option>
                    <option value="chiseled">מסותת (Chiseled LG)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    גובה נגן במחשב
                  </label>
                  <input
                    type="text"
                    value={formData.desktopHeight || '480px'}
                    onChange={(e) => updateField('desktopHeight', e.target.value)}
                    dir="ltr"
                    placeholder="480px / 520px"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Advanced Text Background Image & Passing Hover Effect */}
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
                  isDarkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>2. רקע תמונה מאחורי הטקסט ואפקט עובר</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.textBgEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openSections.text_bg ? 'rotate-180 text-amber-400' : 'opacity-60'
                }`}
              />
            </div>
          </button>

          {openSections.text_bg && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="font-bold text-xs">הפעל רקע תמונה מאחורי הטקסט / האזור</div>
                  <div className="text-[10px] text-zinc-400">
                    תמונת אווירה עם שכבת מיסוך כהה ואפקט אינטראקטיבי במעבר עכבר
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.textBgEnabled)}
                  onChange={(e) => updateField('textBgEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
              </div>

              {formData.textBgEnabled && (
                <div className="space-y-3 pt-1 animate-fadeIn">
                  <PageBuilderImageUpload
                    label="תמונת רקע לטקסט / לגלריה"
                    value={formData.textBgImageUrl || ''}
                    onChange={(url) => updateField('textBgImageUrl', url)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                        היקף פריסת התמונה (Scope)
                      </label>
                      <select
                        value={formData.textBgScope || 'text-card'}
                        onChange={(e) =>
                          updateField(
                            'textBgScope',
                            e.target.value as 'text-card' | 'full-section'
                          )
                        }
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode
                            ? 'bg-transparent border-amber-500/60 text-white'
                            : 'bg-white border-amber-500/60 text-slate-900'
                        }`}
                      >
                        <option value="text-card">כרטיס הכותרת והטקסט בלבד</option>
                        <option value="full-section">כל שטח אזור גלריית הוידאו</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                        שקיפות שכבת כיסוי (Opacity: {formData.textBgOverlayOpacity ?? 75}%)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={formData.textBgOverlayOpacity ?? 75}
                        onChange={(e) =>
                          updateField('textBgOverlayOpacity', Number(e.target.value))
                        }
                        className="w-full accent-amber-500 cursor-pointer mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      אפקט מעבר אינטראקטיבי (Hover Effect):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        {
                          id: 'zoom-glow',
                          title: 'זום והילה זוהרת (Zoom & Glow)',
                          desc: 'התמונה גדלה בעדינות עם הילת תאורה רכה',
                        },
                        {
                          id: 'shimmer-sweep',
                          title: 'הבזק אור חולף (Shimmer Sweep)',
                          desc: 'קרן אור אלכסונית חולפת על פני התמונה',
                        },
                        {
                          id: 'float-parallax',
                          title: 'ציפה ופרלקס תלת-ממדי (Float Parallax)',
                          desc: 'הזזת תמונה אנכית עם טבעת הילה',
                        },
                        {
                          id: 'blur-reveal',
                          title: 'טשטוש מתחדד (Blur Reveal)',
                          desc: 'התמונה מתחדדת ומקבלת בהירות במעבר עכבר',
                        },
                        {
                          id: 'gradient-shift',
                          title: 'גרדיאנט נושם בתנועה (Gradient Shift)',
                          desc: 'שינוי זווית וצבעי תאורה זוהרים',
                        },
                      ].map((eff) => {
                        const isEffSelected =
                          (formData.textBgEffect || 'zoom-glow') === eff.id;
                        return (
                          <button
                            key={eff.id}
                            type="button"
                            onClick={() =>
                              updateField('textBgEffect', eff.id as HeroTextBgEffect)
                            }
                            className={`p-2 rounded-xl border text-right transition cursor-pointer ${
                              isEffSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                : isDarkMode
                                  ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-bold text-xs">{eff.title}</div>
                            <div className="text-[10px] text-zinc-400">{eff.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <PageBuilderColorPicker
                    label="גוון שכבת הכיסוי של התמונה"
                    value={formData.textBgOverlayColor || '#0a0a0f'}
                    onChange={(c) => updateField('textBgOverlayColor', c)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Content & Tenant YouTube Source Connection */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('content')}
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
                <Youtube className="w-3.5 h-3.5" />
              </div>
              <span>3. כותרות ומקור סנכרון YouTube של הטננט</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.content ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.content && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              {/* Default Tenant YouTube Source Banner */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isTenantSource
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">
                      {isTenantSource
                        ? 'מחובר כברירת מחדל לנתוני YouTube של הטננט'
                        : 'מצב הזנה ידנית'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {isTenantSource
                        ? `נטענים אוטומטית ${tenantVideos.length} סרטונים מ-YouTube ו-KOSVIDIO תחת הטננט ${effTenant}`
                        : 'הזנת קישור ישיר או בחירת קובץ מגלריית המדיה'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'source',
                      isTenantSource ? 'custom' : 'tenant_youtube'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition cursor-pointer shrink-0"
                >
                  {isTenantSource ? 'עבור להזנה ידנית' : 'הפעל סנכרון YouTube של הטננט'}
                </button>
              </div>

              <PageBuilderInput
                label="כותרת האזור"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="למשל: ספריית הוידאו וההרצאות"
              />
              <PageBuilderInput
                label="תת-כותרת / תגית"
                value={formData.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="למשל: סרטוני הדרכה, שיעורים ותוכן בלעדי"
              />

              {/* Direct Video URL (Manual mode fallback) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 block">
                    קישור וידאו ישיר או YouTube ID
                  </label>
                  <button
                    type="button"
                    onClick={handlePickVideoFromGallery}
                    className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>בחר מגלריית מדיה</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.videoUrl || ''}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... או מזהה סרטון"
                  dir="ltr"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    כמות סרטונים מקסימלית להצגה
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.maxVideos || 6}
                    onChange={(e) => updateField('maxVideos', Number(e.target.value))}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 mt-auto">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 block">
                      הצג תמונות ממוזערות
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      גריד לבחירת סרטונים מתחת לנגן
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showThumbnails ?? true}
                    onChange={(e) => updateField('showThumbnails', e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <PageBuilderInput
                  label="טקסט כפתור הנעה לפעולה (CTA)"
                  value={formData.ctaButtonText || ''}
                  onChange={(e) => updateField('ctaButtonText', e.target.value)}
                  placeholder="למשל: לכל הסרטונים בערוץ"
                />
                <PageBuilderInput
                  label="קישור כפתור CTA"
                  value={formData.ctaButtonUrl || ''}
                  onChange={(e) => updateField('ctaButtonUrl', e.target.value)}
                  placeholder="/kosvidio או קישור חיצוני"
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Synced YouTube Videos Management */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('videos')}
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
                <Video className="w-3.5 h-3.5" />
              </div>
              <span>4. סרטוני YouTube של הטננט ({tenantVideos.length})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.videos ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.videos && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-zinc-400">
                  לחץ על סרטון כדי להגדירו כסרטון הראשי בנגן
                </span>
                <button
                  type="button"
                  onClick={loadTenantYouTubeVideos}
                  disabled={isLoadingVideos}
                  className="text-amber-400 hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingVideos ? 'animate-spin' : ''}`} />
                  <span>רענן סרטונים</span>
                </button>
              </div>

              {tenantVideos.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-zinc-700 text-center text-zinc-400 text-xs">
                  {isLoadingVideos ? 'טוען סרטונים מ-YouTube של הטננט...' : 'לא נמצאו סרטוני YouTube שמורים בטננט. הוסף קישור ידני למעלה או הזן מזהה סרטון.'}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
                  {tenantVideos.map((vid, idx) => {
                    const isSelected =
                      formData.selectedVideoId === vid.youtubeVideoId ||
                      (!formData.selectedVideoId && idx === 0);
                    return (
                      <div
                        key={vid.id || idx}
                        onClick={() => {
                          updatePatch({
                            selectedVideoId: vid.youtubeVideoId,
                            videoUrl: vid.videoUrl,
                          });
                          showNotification(`נבחר כסרטון ראשי: ${vid.title}`);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/80 text-white ring-1 ring-amber-500/30'
                            : isDarkMode
                              ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {vid.thumbnailUrl && (
                            <img
                              src={vid.thumbnailUrl}
                              alt=""
                              className="w-12 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                            />
                          )}
                          <div className="truncate">
                            <div className="font-bold text-xs truncate">{vid.title}</div>
                            <div className="text-[10px] text-zinc-400 font-mono truncate">
                              ID: {vid.youtubeVideoId}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black shrink-0">
                            ראשי
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: Custom Colors & Anchor */}
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
              <span>5. צבעים מותאמים אישית ומזהה עוגן</span>
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
                {(formData.titleColor ||
                  formData.subtitleColor ||
                  formData.cardBackgroundColor ||
                  (formData.backgroundColor && formData.backgroundColor !== 'transparent')) && (
                  <button
                    type="button"
                    onClick={() =>
                      updatePatch({
                        titleColor: undefined,
                        subtitleColor: undefined,
                        cardBackgroundColor: undefined,
                        backgroundColor: 'transparent',
                      })
                    }
                    className="text-amber-400 hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    אפס צבעים לסגנון הפריסה
                  </button>
                )}
              </div>

              <PageBuilderColorPicker
                label="צבע כותרת ראשית"
                value={formData.titleColor || '#ffffff'}
                onChange={(c) => updateField('titleColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע תת-כותרת / תגית"
                value={formData.subtitleColor || '#94a3b8'}
                onChange={(c) => updateField('subtitleColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כרטיסי וידאו"
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
                  value={formData.anchorId || 'videoGallery'}
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

      {/* 5. Footer: Compact Bottom Actions */}
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
