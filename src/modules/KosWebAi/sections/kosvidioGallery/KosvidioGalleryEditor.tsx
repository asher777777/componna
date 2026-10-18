import React, { useState, useRef, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import {
  KosvidioGallerySectionConfig,
  KosvidioGalleryItem,
  KosvidioGalleryLayout,
  KosvidioGallerySource,
  KosvidioGallerySortBy,
} from '../../types/sectionConfigs';
import { getCategoryFromPage } from '../../types/pageBuilder.types';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { PageBuilderAccordion, PageBuilderAccordionGroup } from '../../ui/PageBuilderAccordion';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { BrandDna } from '../../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';
import {
  Video,
  LayoutGrid,
  List,
  Columns,
  Sliders,
  Palette,
  Sparkles,
  Plus,
  Trash2,
  Briefcase,
  Database,
  Link2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

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

function isDummyVideoItem(item?: Partial<KosvidioGalleryItem> | null): boolean {
  if (!item) return true;
  const ytId = extractYouTubeId(item.youtubeVideoId || item.videoUrl);
  if (ytId && DUMMY_YOUTUBE_IDS.has(ytId)) return true;
  const itemId = String(item.id || '');
  return (
    itemId.startsWith('kosvidio-default-') ||
    itemId.startsWith('kosvidio-item-') ||
    itemId.startsWith('brand-srv-vid-')
  );
}

export interface KosvidioGalleryEditorProps {
  config: KosvidioGallerySectionConfig;
  onChange: (updated: KosvidioGallerySectionConfig) => void;
}

export const KosvidioGalleryEditor: React.FC<KosvidioGalleryEditorProps> = ({
  config,
  onChange,
}) => {
  const { db } = useSystemConnection();
  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );
  const isMaster = effTenant === '_master' || effTenant === ROOT_TENANT_ID;

  const [firestoreBrand, setFirestoreBrand] = useState<BrandDna | null>(null);
  const [tenantVideos, setTenantVideos] = useState<KosvidioGalleryItem[]>([]);

  // Default all items closed; only one item open at a time, centered on open
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [newQuickTitle, setNewQuickTitle] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  const liveBrand = useMemo(
    () => resolveLiveBrandDna(firestoreBrand, effTenant),
    [firestoreBrand, effTenant]
  );

  const brandCompanyName =
    liveBrand?.identity?.companyName ||
    (liveBrand?.identity as any)?.brandName ||
    (isMaster ? 'קושאן' : '');
  const brandSlogan = liveBrand?.identity?.slogan || (isMaster ? 'כל אדם זה נכס' : '');
  const brandUvp = liveBrand?.audience?.mainUvp || liveBrand?.identity?.companyVision || '';
  const brandLogoUrl =
    liveBrand?.identity?.logoUrl || (isMaster ? '/images/kosun-official-logo.png' : '');
  const brandPrimaryColor = liveBrand?.designTokens?.primaryColor;

  // Load Tenant Brand DNA & Tenant Real KOSVIDIO Videos from Firestore
  useEffect(() => {
    let active = true;

    async function loadTenantBrandingAndVideos() {
      try {
        const dna = await loadBrandDna(db, effTenant);
        if (active && dna) {
          setFirestoreBrand(dna);
        }
      } catch {
        // ignore
      }

      if (!db) return;
      const collected: KosvidioGalleryItem[] = [];
      const seenYoutubeIds = new Set<string>();
      const tenantPrefix = isMaster ? 'tenants/_master' : `tenants/${effTenant}`;

      try {
        const tubePagesRef = collection(db, `${tenantPrefix}/${SYSTEM_COLLECTIONS.KOS_TUBE_PAGES}`);
        const tubePagesSnap = await getDocs(tubePagesRef);
        tubePagesSnap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          if (!d) return;
          const ytId = extractYouTubeId(d.youtubeVideoId);
          if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId) || seenYoutubeIds.has(ytId)) return;
          seenYoutubeIds.add(ytId);
          collected.push({
            id: `tube_page_${docSnap.id}`,
            title: d.seoTitle || d.title || 'סרטון KOSVIDIO',
            subtitle: brandCompanyName,
            description: d.summary || d.metaDescription || '',
            youtubeVideoId: ytId,
            thumbnailUrl: d.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            kosvidioSlug: d.slug || `kosvidio-${ytId}`,
            viewsCount: Number(d.viewsCount || 150),
            likesCount: Number(d.likesCount || 30),
            publishedAt: d.publishedAt || d.createdAt || '',
            category: d.category || 'KOSVIDIO',
            tags: Array.isArray(d.tags) ? d.tags : ['KOSVIDIO'],
            featured: collected.length === 0,
          });
        });
      } catch {
        // ignore
      }

      try {
        const allPages = await pageBuilderFirestore.getAllPages(db, effTenant);
        const videoPages = (allPages || []).filter((p) => {
          if (!p || p.isHomePage) return false;
          const pageId = String(p.pageId || '');
          const slugLower = String(p.slug || '').toLowerCase();
          if (pageId.startsWith('home_')) return false;
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
          if (!ytId || DUMMY_YOUTUBE_IDS.has(ytId) || seenYoutubeIds.has(ytId)) continue;
          seenYoutubeIds.add(ytId);

          collected.push({
            id: p.pageId || `page_${p.slug}`,
            title: kosvidioSec?.title || p.pageTitle || 'סרטון KOSVIDIO',
            subtitle: brandCompanyName,
            description: kosvidioSec?.shortDescription || p.seoSettings?.description || '',
            youtubeVideoId: ytId,
            videoUrl: kosvidioSec?.videoUrl,
            thumbnailUrl:
              p.seoSettings?.ogImage || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            kosvidioSlug: p.slug || `kosvidio-${ytId}`,
            viewsCount: Number(kosvidioSec?.viewsCount || p.viewsCount || 120),
            likesCount: Number(kosvidioSec?.likesCount || 24),
            publishedAt: kosvidioSec?.publishedDateText || p.updatedAt || '',
            category: 'KOSVIDIO',
            tags: ['KOSVIDIO'],
            featured: collected.length === 0,
          });
        }
      } catch {
        // ignore
      }

      if (active) {
        setTenantVideos(collected);
      }
    }

    loadTenantBrandingAndVideos();
    return () => {
      active = false;
    };
  }, [db, effTenant, isMaster, brandCompanyName]);

  useEffect(() => {
    if (activeItemId && activeItemRef.current) {
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [activeItemId]);

  const update = <K extends keyof KosvidioGallerySectionConfig>(
    key: K,
    value: KosvidioGallerySectionConfig[K]
  ) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const updateLogicRule = <
    K extends keyof NonNullable<KosvidioGallerySectionConfig['logicRules']>
  >(
    key: K,
    value: NonNullable<KosvidioGallerySectionConfig['logicRules']>[K]
  ) => {
    const nextRules = {
      ...(config.logicRules || {}),
      [key]: value,
    };
    onChange({
      ...config,
      logicRules: nextRules,
      ...(key === 'maxVideos' && typeof value === 'number' ? { maxVideos: value } : {}),
    });
  };

  const handleSyncFromBrandDna = async () => {
    const freshBrand = await loadBrandDna(db, effTenant);
    setFirestoreBrand(freshBrand);
    const companyName =
      freshBrand.identity?.companyName ||
      (freshBrand.identity as any)?.brandName ||
      (isMaster ? 'קושאן' : '');
    const slogan = freshBrand.identity?.slogan || (isMaster ? 'כל אדם זה נכס' : '');
    const uvp = freshBrand.audience?.mainUvp || freshBrand.identity?.companyVision || '';
    const logoUrl =
      freshBrand.identity?.logoUrl || (isMaster ? '/images/kosun-official-logo.png' : '');
    const primaryColor = freshBrand.designTokens?.primaryColor;

    onChange({
      ...config,
      title: companyName ? `ספריית הוידאו והתוכן של ${companyName}` : 'ספריית הוידאו והתוכן',
      subtitle: slogan,
      description:
        uvp ||
        (companyName
          ? `צפו בסרטונים המובילים של ${companyName} המקושרים ישירות לעמודי ה-KOSVIDIO של הטננט.`
          : ''),
      channelName: companyName,
      channelSlogan: slogan,
      channelAvatarUrl: logoUrl,
      ...(primaryColor ? { accentColor: primaryColor } : {}),
      items: [],
    });
  };

  const cleanCustomItems = useMemo(
    () => (Array.isArray(config.items) ? config.items.filter((i) => !isDummyVideoItem(i)) : []),
    [config.items]
  );

  // Videos displayed in editor list: custom items if present, otherwise live tenant KOSVIDIO videos
  const editorVideoList = useMemo(
    () => (cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos),
    [cleanCustomItems, tenantVideos]
  );

  const handleAiSuggestVideos = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      if (tenantVideos.length > 0) {
        update('items', tenantVideos);
      }
      setIsGeneratingAi(false);
    }, 250);
  };

  const handleQuickAddItem = () => {
    const clean = newQuickTitle.trim();
    if (!clean) return;

    const newItem: KosvidioGalleryItem = {
      id: `vid-${Date.now()}`,
      title: clean,
      subtitle: brandCompanyName,
      description: `סרטון וידאו בנושא ${clean} המקושר לעמוד ה-KOSVIDIO.`,
      youtubeVideoId: '',
      kosvidioSlug: '/kosvidio',
      duration: '03:30',
      viewsCount: 100,
      likesCount: 20,
      category: 'KOSVIDIO',
      tags: [clean, 'KOSVIDIO'],
    };

    const baseList = cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos;
    const next = [...baseList, newItem];
    update('items', next);
    setNewQuickTitle('');
    setActiveItemId(newItem.id);
  };

  const handleUpdateItem = (id: string, patch: Partial<KosvidioGalleryItem>) => {
    const baseList = cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos;
    const next = baseList.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    update('items', next);
  };

  const handleRemoveItem = (id: string) => {
    const baseList = cleanCustomItems.length > 0 ? cleanCustomItems : tenantVideos;
    const next = baseList.filter((item) => item.id !== id);
    update('items', next);
    if (activeItemId === id) {
      setActiveItemId(null);
    }
  };

  const currentMaxVideos = config.logicRules?.maxVideos || config.maxVideos || 6;

  return (
    <div className="w-full max-w-xl mx-auto py-2 space-y-4 text-right" dir="rtl">
      {/* Top Info Banner */}
      <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">גלריית סרטוני וידאו (KOSVIDIO)</div>
            <div className="text-[11px] text-slate-400">
              כל הלשוניות סגורות כברירת מחדל • לחיצה פותחת וממרכזת לשונית אחת
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSyncFromBrandDna}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition cursor-pointer shrink-0"
          title="משוך ברירות מחדל מרכיב המיתוג"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>סנכרן מהמיתוג</span>
        </button>
      </div>

      {/* Main Accordion Group: defaultActiveId={null} ensures ALL CLOSED by default and ONLY ONE OPEN at a time */}
      <PageBuilderAccordionGroup defaultActiveId={null} className="space-y-3">
        {/* TAB 1: פריסות התצוגה (סעיף א) */}
        <PageBuilderAccordion
          id="tab-layouts"
          title="א. בחירת פריסת הגלריה (3 פריסות)"
          subtitle="וידאו גדול ותחתיו קטנים • רשימה זה תחת זה • גלילה אופקית ללא גלישה"
          icon={<LayoutGrid className="w-4 h-4 text-red-400" />}
        >
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              בחרו את פריסת הוידאו באזור:
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'spotlight-grid' as KosvidioGalleryLayout,
                  label: 'פריסה א׳: וידאו גדול ותחתיו כמה קטנים',
                  desc: 'נגן ראשי גדול בראש האזור ומתחתיו כרטיסי וידאו קטנים המתחלפים בלחיצה ומקושרים ל-KOSVIDIO',
                  icon: LayoutGrid,
                },
                {
                  id: 'stacked-list' as KosvidioGalleryLayout,
                  label: 'פריסה ב׳: רשימה זה תחת זה',
                  desc: 'כרטיסי וידאו עשירים המסודרים אנכית זה תחת זה עם נגן מובנה וקישור לסלאג KOSVIDIO',
                  icon: List,
                },
                {
                  id: 'horizontal-scroll' as KosvidioGalleryLayout,
                  label: 'פריסה ג׳: גלריה עם גלילה אופקית ללא גלישה',
                  desc: 'קרוסלת וידאו אופקית חלקה בתוך מסגרת תחומה ללא גלישת רוחב בעמוד',
                  icon: Columns,
                },
              ].map((opt) => {
                const IconComp = opt.icon;
                const isSelected = (config.layout || 'spotlight-grid') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update('layout', opt.id)}
                    className={`w-full text-right p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-red-500/15 border-red-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        isSelected ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-extrabold">{opt.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mt-2">
              <div>
                <div className="text-xs font-bold text-white">אפשר למבקרים להחליף פריסה בלייב</div>
                <div className="text-[11px] text-slate-400">
                  הצגת כפתורי מעבר בין 3 הפריסות בראש הגלריה
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.allowVisitorLayoutSwitch ?? false}
                onChange={(e) => update('allowVisitorLayoutSwitch', e.target.checked)}
                className="w-4 h-4 rounded accent-red-500 cursor-pointer"
              />
            </div>
          </div>
        </PageBuilderAccordion>

        {/* TAB 2: תצוגה דינמית, תנאים לוגיים וכמות סרטונים (סעיף ב) */}
        <PageBuilderAccordion
          id="tab-dynamic-logic"
          title="ב. תצוגה דינמית, תנאים לוגיים וכמות סרטונים"
          subtitle={`מקור: ${
            config.source === 'custom'
              ? 'ידני'
              : config.source === 'brand_services'
              ? 'שירותי המיתוג'
              : 'קולקציית הטננט (KOSVIDIO)'
          } • עד ${currentMaxVideos} סרטונים`}
          icon={<Sliders className="w-4 h-4 text-amber-400" />}
        >
          <div className="space-y-4">
            {/* Source Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                מקור הנתונים של הגלריה
              </label>
              <select
                value={config.source || 'tenant_kosvidio'}
                onChange={(e) => update('source', e.target.value as KosvidioGallerySource)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-amber-500"
              >
                <option value="tenant_kosvidio">
                  דינמי מקולקציית הטננט (עמודי KOSVIDIO / סרטוני הערוץ + השלמה מהמיתוג)
                </option>
                <option value="brand_services">
                  דינמי מתוך שירותי המותג ברכיב המיתוג (Brand DNA Services)
                </option>
                <option value="custom">רשימת סרטונים מותאמת אישית בלבד</option>
              </select>
            </div>

            {/* Selectable Number of Videos to Display */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">
                  כמות סרטונים מקסימלית שתוצג באזור:
                </label>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold">
                  {currentMaxVideos} סרטונים
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[3, 4, 6, 8, 12].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      update('maxVideos', count);
                      updateLogicRule('maxVideos', count);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      currentMaxVideos === count
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">או הזינו כמות מדויקת:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={currentMaxVideos}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value) || 1);
                    update('maxVideos', val);
                    updateLogicRule('maxVideos', val);
                  }}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white text-center"
                />
              </div>
            </div>

            {/* Logical Conditions set by User */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>תנאים לוגיים לסינון ומיון הסרטונים</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  סדר מיון הסרטונים (Sort Order)
                </label>
                <select
                  value={config.logicRules?.sortBy || 'newest'}
                  onChange={(e) =>
                    updateLogicRule('sortBy', e.target.value as KosvidioGallerySortBy)
                  }
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="newest">החדשים ביותר תחילה</option>
                  <option value="most_views">הנצפים ביותר (לפי כמות צפיות)</option>
                  <option value="most_likes">האהובים ביותר (לפי לייקים)</option>
                  <option value="title_asc">לפי סדר א׳-ב׳ של הכותרת</option>
                </select>
              </div>

              <PageBuilderInput
                label="הצג רק סרטונים הכוללים תגית / קטגוריה (אופציונלי)"
                value={config.logicRules?.filterTag || ''}
                onChange={(e) => updateLogicRule('filterTag', e.target.value)}
                placeholder="למשל: KOSVIDIO, שירותים, הדרכה..."
              />

              <PageBuilderInput
                label="סינון לפי מילת מפתח בכותרת או בתיאור (אופציונלי)"
                value={config.logicRules?.filterKeyword || ''}
                onChange={(e) => updateLogicRule('filterKeyword', e.target.value)}
                placeholder="השאירו ריק להצגת הכל..."
              />

              <PageBuilderInput
                label="מינימום צפיות להצגה (סף צפיות לוגי)"
                type="number"
                value={String(config.logicRules?.minViews || 0)}
                onChange={(e) => updateLogicRule('minViews', Number(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            {/* Click behavior */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                פעולה בעת לחיצה על כרטיס וידאו
              </label>
              <select
                value={config.clickBehavior || 'inline_and_link'}
                onChange={(e) => update('clickBehavior', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="inline_and_link">
                  ניגון ישיר בגלריה + כפתור מעבר לסלאג KOSVIDIO
                </option>
                <option value="navigate_slug">מעבר מיידי לעמוד הסרטון (סלאג KOSVIDIO)</option>
                <option value="inline_only">ניגון בתוך הגלריה בלבד</option>
              </select>
            </div>
          </div>
        </PageBuilderAccordion>

        {/* TAB 3: ניהול רשימת הסרטונים בעיצוב כרטיס המיתוג (סעיף ג + ד + צילום המסך) */}
        <PageBuilderAccordion
          id="tab-videos-list"
          title={`ג. סרטונים בגלריה מתוך קולקציית הטננט (${editorVideoList.length})`}
          subtitle="ניהול סרטונים המקושרים ל-KOSVIDIO • כל פריט נפתח בנפרד וממורכז"
          icon={<Briefcase className="w-4 h-4 text-indigo-400" />}
        >
          {/* Card styled exactly like BrandEcosystemSection screenshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>סרטוני הטננט ({editorVideoList.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAiSuggestVideos}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAi ? 'טוען...' : 'משוך סרטוני KOSVIDIO מהטננט'}</span>
              </button>
            </div>

            {/* Rounded rows list - Default all closed, clicking opens ONE centered */}
            <div className="space-y-2.5">
              {editorVideoList.map((item) => {
                const isOpen = activeItemId === item.id;
                return (
                  <div
                    key={item.id}
                    ref={isOpen ? activeItemRef : null}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isOpen
                        ? 'bg-slate-950 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/25'
                        : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Row Header (matches screenshot: title on right, trash icon on left) */}
                    <div
                      onClick={() => setActiveItemId(isOpen ? null : item.id)}
                      className="flex items-center justify-between gap-2 p-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-indigo-400' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-sm font-medium text-slate-200 truncate">
                          {item.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="מחק סרטון"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Expanded Single Item Editor (Centered in Viewport) */}
                    {isOpen && (
                      <div className="p-3.5 pt-3 border-t border-slate-800/90 bg-slate-900/70 space-y-3">
                        <PageBuilderInput
                          label="כותרת הסרטון"
                          value={item.title || ''}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <PageBuilderInput
                            label="מזהה YouTube או קישור וידאו"
                            value={item.youtubeVideoId || item.videoUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.includes('http') || val.includes('/')) {
                                handleUpdateItem(item.id, { videoUrl: val });
                              } else {
                                handleUpdateItem(item.id, { youtubeVideoId: val });
                              }
                            }}
                            placeholder="מזהה סרטון YouTube או קישור מלא"
                            dir="ltr"
                          />

                          <PageBuilderInput
                            label="סלאג עמוד יעד (KOSVIDIO Slug)"
                            value={item.kosvidioSlug || '/kosvidio'}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { kosvidioSlug: e.target.value })
                            }
                            placeholder="/kosvidio"
                            dir="ltr"
                          />
                        </div>

                        <PageBuilderTextarea
                          label="תיאור קצר של הסרטון"
                          value={item.description || ''}
                          onChange={(e) =>
                            handleUpdateItem(item.id, { description: e.target.value })
                          }
                          rows={2}
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <PageBuilderInput
                            label="קטגוריה / תגית"
                            value={item.category || ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { category: e.target.value })
                            }
                            placeholder="KOSVIDIO"
                          />
                          <PageBuilderInput
                            label="משך (למשל 03:45)"
                            value={item.duration || ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { duration: e.target.value })
                            }
                            dir="ltr"
                          />
                          <PageBuilderInput
                            label="צפיות"
                            type="number"
                            value={String(item.viewsCount ?? 120)}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                viewsCount: Number(e.target.value) || 0,
                              })
                            }
                            dir="ltr"
                          />
                        </div>

                        <PageBuilderInput
                          label="תמונה ממוזערת מותאמת (אופציונלי - ברירת מחדל מיוטיוב)"
                          value={item.thumbnailUrl || ''}
                          onChange={(e) =>
                            handleUpdateItem(item.id, { thumbnailUrl: e.target.value })
                          }
                          placeholder="https://..."
                          dir="ltr"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {editorVideoList.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  לא נמצאו סרטוני KOSVIDIO בקולקציית הטננט. הוסיפו סרטון למטה או דרך מודול KOSVIDIO.
                </div>
              )}
            </div>

            {/* Bottom Quick Add Row matching screenshot */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newQuickTitle}
                onChange={(e) => setNewQuickTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAddItem()}
                placeholder="הוסף סרטון לקישור ל-KOSVIDIO..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleQuickAddItem}
                className="px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף</span>
              </button>
            </div>
          </div>
        </PageBuilderAccordion>

        {/* TAB 4: כותרת, תיאור וצבעי האזור (סעיף ה + ד) */}
        <PageBuilderAccordion
          id="tab-colors-titles"
          title="ד-ה. צבע רקע, כותרת, תיאור ומיתוג האזור"
          subtitle="קביעת צבע רקע, כותרת, תיאור ופרטי ערוץ מתוך קולקציית המיתוג של הטננט"
          icon={<Palette className="w-4 h-4 text-emerald-400" />}
        >
          <div className="space-y-4">
            <PageBuilderInput
              label="תגית עליונה (Badge)"
              value={config.badge || ''}
              onChange={(e) => update('badge', e.target.value)}
              placeholder="KOSVIDIO • גלריית וידאו חכמה"
            />

            <PageBuilderInput
              label="כותרת האזור (ברירת מחדל מתוך מיתוג הטננט)"
              value={
                config.title ||
                (brandCompanyName ? `ספריית הוידאו והתוכן של ${brandCompanyName}` : '')
              }
              onChange={(e) => update('title', e.target.value)}
              placeholder={
                brandCompanyName
                  ? `ספריית הוידאו והתוכן של ${brandCompanyName}`
                  : 'ספריית הוידאו והתוכן'
              }
            />

            <PageBuilderInput
              label="תת-כותרת (סלוגן מתוך מיתוג הטננט)"
              value={config.subtitle || brandSlogan || ''}
              onChange={(e) => update('subtitle', e.target.value)}
              placeholder={brandSlogan || 'סלוגן הערוץ'}
            />

            <PageBuilderTextarea
              label="תיאור האזור (ברירת מחדל מתוך מיתוג הטננט)"
              value={config.description || brandUvp || ''}
              onChange={(e) => update('description', e.target.value)}
              placeholder={brandUvp || 'תיאור קצר המופיע מתחת לכותרת האזור...'}
              rows={3}
            />

            {/* Color Pickers for Background, Title, Description, Accent, Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <PageBuilderColorPicker
                label="צבע רקע לאזור (Background)"
                value={config.backgroundColor || '#090d16'}
                onChange={(color) => update('backgroundColor', color)}
              />

              <PageBuilderColorPicker
                label="צבע כותרת ראשית"
                value={config.titleColor || '#ffffff'}
                onChange={(color) => update('titleColor', color)}
              />

              <PageBuilderColorPicker
                label="צבע תיאור וטקסט משני"
                value={config.descriptionColor || '#94a3b8'}
                onChange={(color) => update('descriptionColor', color)}
              />

              <PageBuilderColorPicker
                label="צבע הדגשה וכפתור ניגון (Accent)"
                value={config.accentColor || brandPrimaryColor || '#ef4444'}
                onChange={(color) => update('accentColor', color)}
              />

              <PageBuilderColorPicker
                label="צבע רקע כרטיסי הוידאו"
                value={config.cardBgColor || '#111827'}
                onChange={(color) => update('cardBgColor', color)}
              />
            </div>

            {/* Channel & KOSVIDIO Link Settings */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-sky-400" />
                <span>חיבור לערוץ הטננט ולסלאג KOSVIDIO</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PageBuilderInput
                  label="שם הערוץ (ברירת מחדל ממיתוג הטננט)"
                  value={config.channelName || brandCompanyName || ''}
                  onChange={(e) => update('channelName', e.target.value)}
                  placeholder={brandCompanyName || 'שם הערוץ'}
                />
                <PageBuilderInput
                  label="סלוגן הערוץ"
                  value={config.channelSlogan || brandSlogan || ''}
                  onChange={(e) => update('channelSlogan', e.target.value)}
                  placeholder={brandSlogan || 'סלוגן הערוץ'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PageBuilderInput
                  label="טקסט כפתור ראשי בתחתית הגלריה"
                  value={config.ctaButtonText || ''}
                  onChange={(e) => update('ctaButtonText', e.target.value)}
                  placeholder="לכל סרטוני הערוץ (KOSVIDIO)"
                />
                <PageBuilderInput
                  label="כתובת / סלאג יעד (KOSVIDIO)"
                  value={config.ctaButtonUrl || '/kosvidio'}
                  onChange={(e) => update('ctaButtonUrl', e.target.value)}
                  placeholder="/kosvidio"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </PageBuilderAccordion>
      </PageBuilderAccordionGroup>
    </div>
  );
};
