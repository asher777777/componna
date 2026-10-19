import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DynamicListingSectionConfig,
  DynamicListingItem,
  DynamicListingLayout,
} from '../../types/sectionConfigs';
import {
  Search,
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Sparkles,
  X,
  ExternalLink,
  Layers,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { PAGE_CATEGORIES, getCategoryFromPage } from '../../types/pageBuilder.types';

export const DynamicListingSection: React.FC<{ config: DynamicListingSectionConfig }> = ({ config }) => {
  const {
    anchorId = 'dynamic-listing',
    title = 'מאגר התוכן והפעילות',
    subtitle = 'סקירה מעמיקה של כל העדכונים, הפרויקטים והשירותים המובילים',
    badge = 'תוכן ופעילות',
    source = 'pages',
    layout = 'bento-showcase',
    gridColumns = 3,
    aspectRatio = '16:9',
    showCategoryFilter = true,
    showSearchBar = true,
    searchPlaceholder = 'חיפוש מהיר בתוכן...',
    effectStyle = 'border-beam',
    items = [],
    primaryButton,
    backgroundColor = 'transparent',
    cardBgColor,
    titleColor,
  } = config;

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalItem, setModalItem] = useState<DynamicListingItem | null>(null);

  // Dynamic Content Resolution State
  const [dynamicItems, setDynamicItems] = useState<DynamicListingItem[]>(items && items.length > 0 ? items : []);
  const [, setIsLoadingDynamic] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchDynamicContent() {
      // If user explicitly chose custom items and provided them
      if (source === 'custom' && items && items.length > 0) {
        if (isMounted) setDynamicItems(items);
        return;
      }

      setIsLoadingDynamic(true);
      try {
        const effTenant = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
        const brand = resolveLiveBrandDna(null, effTenant);
        const pages = await pageBuilderFirestore.getAllPages(null, effTenant);

        const pageItems: DynamicListingItem[] = [];

        // 1. Process published tenant pages
        pages.forEach((p) => {
          if (!p || !p.pageTitle || p.isHomePage || p.slug === 'home') return;
          const cat = getCategoryFromPage(p) || 'general';
          const catCfg = PAGE_CATEGORIES[cat];
          const heroSec = Object.values(p.sections || {}).find((s: any) => s && s.type === 'hero') as any;

          const defaultImg =
            heroSec?.imageSrc ||
            heroSec?.imageUrl ||
            p.globalSettings?.siteLogoUrl ||
            (cat === 'event'
              ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
              : cat === 'course'
              ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
              : cat === 'fundraising'
              ? 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=800&q=80'
              : cat === 'checkout'
              ? 'https://images.unsplash.com/photo-1556742049-0a67e557229f?auto=format&fit=crop&w=800&q=80'
              : cat === 'community'
              ? 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
              : cat === 'youtube_post'
              ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80');

          const slug = p.publishedUrl || p.shortUrl || (p.slug ? (p.slug.startsWith('/') ? p.slug : `/${p.slug}`) : `/p/${p.pageId}`);

          pageItems.push({
            id: p.pageId,
            title: p.pageTitle,
            subtitle: heroSec?.subtitle || p.globalSettings?.slogan || catCfg?.description || '',
            excerpt: heroSec?.description || p.seoSettings?.description || '',
            imageUrl: defaultImg,
            badge: catCfg?.shortLabel || 'עמוד פעיל',
            category: catCfg?.label || 'תוכן ומאמרים',
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('he-IL') : undefined,
            linkUrl: slug,
            actionType: 'link',
          });
        });

        // 2. Add Brand Products & Services
        const products = brand.ecosystem?.products || [];
        products.forEach((prod: any, idx: number) => {
          if (!prod) return;
          const pName = typeof prod === 'string' ? prod : (prod.nameAndSlogan || prod.title || `מוצר ${idx + 1}`);
          const pDesc = typeof prod === 'string' ? '' : (prod.shortDescription || prod.painPointSolved || '');
          const pSlug = typeof prod === 'string' ? '' : (prod.linkedPageSlug ? (prod.linkedPageSlug.startsWith('/') ? prod.linkedPageSlug : `/${prod.linkedPageSlug}`) : `/kosass/${prod.id || idx + 1}`);
          const pImg = typeof prod === 'string' ? '' : (prod.imageUrl || (prod.galleryImages && prod.galleryImages[0]));

          pageItems.push({
            id: `brand-prod-${idx + 1}`,
            title: pName,
            subtitle: pDesc,
            excerpt: typeof prod !== 'string' && prod.longDescription ? prod.longDescription.slice(0, 100) : pDesc,
            imageUrl: pImg || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
            badge: 'מוצר דגל',
            category: 'מוצרי דגל ושירותים',
            linkUrl: pSlug || '#sec-contact',
            actionType: 'link',
          });
        });

        // 3. Fallback starters if total is 0 (brand new installation with zero pages and products)
        if (pageItems.length === 0) {
          const company = brand.identity?.companyName || 'המותג שלנו';
          const starters: DynamicListingItem[] = [
            {
              id: 'starter-1',
              title: `מדריך עומק מקצועי מבית ${company}`,
              subtitle: 'תובנות מעשיות, מחקרי שוק וכלים מובילים',
              excerpt: 'קריאת עומק מקיפה למקבלי החלטות ולמנהלים',
              imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
              badge: 'תוכן ומאמרים',
              category: 'עמודי תוכן ומאמרים',
              linkUrl: '/kosinfo',
              actionType: 'link',
            },
            {
              id: 'starter-2',
              title: `כנס ומפגש קהילה שנתי מבית ${company}`,
              subtitle: 'שריון מקום מוקדם לערב שיא מעורר השראה',
              excerpt: 'הרצאות מרכזיות, סדנאות מעשיות ונטוורקינג ממוקד',
              imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
              badge: 'אירועים',
              category: 'עמודי אירועים וכנסים',
              linkUrl: '/kosevent',
              actionType: 'link',
            },
            {
              id: 'starter-3',
              title: `התכנית המקיפה להכשרה ומצוינות`,
              subtitle: 'סילבוס מעשי וליווי צמוד לתוצאות מוכחות',
              excerpt: 'מחזור קרוב יוצא לדרך • מספר המקומות מוגבל',
              imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
              badge: 'קורסים',
              category: 'דפי קורסים והכשרות',
              linkUrl: '/koscourse',
              actionType: 'link',
            },
            {
              id: 'starter-4',
              title: `קהילת השגרירים והמובילים`,
              subtitle: 'מרחב שיח פתוח, שיתופי פעולה ותוכן בלעדי',
              excerpt: 'הצטרפו למעגל העשייה והנטוורקינג',
              imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
              badge: 'קהילה',
              category: 'דפי קהילה ומועדון',
              linkUrl: '/koscommunity',
              actionType: 'link',
            },
          ];
          if (isMounted) setDynamicItems(starters);
        } else {
          if (isMounted) setDynamicItems(pageItems);
        }
      } catch (err) {
        console.warn('[DynamicListingSection] Dynamic content load failed, using config items:', err);
        if (isMounted) setDynamicItems(items || []);
      } finally {
        if (isMounted) setIsLoadingDynamic(false);
      }
    }

    fetchDynamicContent();

    return () => {
      isMounted = false;
    };
  }, [source, items]);

  // Use dynamic items if available, otherwise config items
  const effectiveItems = dynamicItems && dynamicItems.length > 0 ? dynamicItems : items;

  // Magnetic thumbnail state for Editorial List
  const [hoveredItem, setHoveredItem] = useState<DynamicListingItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Carousel ref for horizontal scrolling
  const carouselRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categoriesList = useMemo(() => {
    if (config.categories && config.categories.length > 0) {
      return ['all', ...config.categories];
    }
    const set = new Set<string>();
    effectiveItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['all', ...Array.from(set)];
  }, [config.categories, effectiveItems]);

  // Filtered items by category and search query
  const filteredItems = useMemo(() => {
    return effectiveItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [effectiveItems, selectedCategory, searchQuery]);

  const handleCardClick = (item: DynamicListingItem) => {
    if (item.actionType === 'modal' || !item.linkUrl || item.linkUrl === '#') {
      setModalItem(item);
    } else if (item.linkUrl) {
      window.open(item.linkUrl, '_blank');
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getAspectClass = (ratio: string) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '9:16':
        return 'aspect-[9/16]';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <section
      id={anchorId}
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Background ambient light */}
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-3">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1 shadow-sm">
              <span>{badge}</span>
            </div>
          )}

          {title && (
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
              style={{ color: titleColor }}
            >
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Filters and Search Bar Row */}
        {(showCategoryFilter || showSearchBar) && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            {/* Category Pills */}
            {showCategoryFilter && categoriesList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={clsx(
                      'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer',
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    )}
                  >
                    {cat === 'all' ? 'הכל' : cat}
                  </button>
                ))}
              </div>
            )}

            {/* Instant Search Bar */}
            {showSearchBar && (
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">לא נמצאו פריטים תואמים</h3>
            <p className="text-xs max-w-sm">נסה לשנות את מונח החיפוש או לבחור קטגוריה אחרת.</p>
          </div>
        )}

        {/* =========================================================================
            LAYOUT 1: BENTO SHOWCASE (Spotlight Hero + Secondary Bento Cards)
        ========================================================================= */}
        {layout === 'bento-showcase' && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Spotlight Card (Item 0) */}
            {filteredItems[0] && (
              <div
                onClick={() => handleCardClick(filteredItems[0])}
                className={clsx(
                  'group md:col-span-2 relative rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col justify-end min-h-[380px] sm:min-h-[460px] cursor-pointer shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:shadow-indigo-500/10',
                  effectStyle === 'border-beam' && 'before:absolute before:inset-0 before:rounded-3xl before:border before:border-indigo-500/40'
                )}
                style={{ backgroundColor: cardBgColor }}
              >
                {/* Background Image with Zoom */}
                <img
                  src={filteredItems[0].imageUrl}
                  alt={filteredItems[0].title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {filteredItems[0].category && (
                      <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-md">
                        {filteredItems[0].category}
                      </span>
                    )}
                    {filteredItems[0].badge && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold backdrop-blur-md">
                        {filteredItems[0].badge}
                      </span>
                    )}
                    {filteredItems[0].date && (
                      <span className="flex items-center gap-1 text-slate-300 text-xs font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{filteredItems[0].date}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                    {filteredItems[0].title}
                  </h3>

                  {filteredItems[0].subtitle && (
                    <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-2xl font-normal leading-relaxed">
                      {filteredItems[0].subtitle}
                    </p>
                  )}

                  <div className="pt-2 flex items-center gap-2 text-indigo-400 font-bold text-xs sm:text-sm group-hover:-translate-x-1 transition-transform">
                    <span>קרא עוד וצפה בפרטים</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Other Bento Cards */}
            {filteredItems.slice(1).map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: cardBgColor }}
              >
                <div className="aspect-[16/10] w-full overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  {item.category && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                      {item.category}
                    </span>
                  )}
                  {item.price && (
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg">
                      {item.price}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-2 flex-grow justify-between">
                  <div>
                    {item.date && (
                      <span className="text-[11px] text-slate-400 font-mono block mb-1">
                        {item.date}
                      </span>
                    )}
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>לפרטים המלאים</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            LAYOUT 2: FLOATING GLASS GRID (3D Tilt & Glassmorphism)
        ========================================================================= */}
        {layout === 'floating-grid' && filteredItems.length > 0 && (
          <div className={clsx('grid gap-6 sm:gap-8', getGridColsClass(gridColumns))}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group relative rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                style={{ backgroundColor: cardBgColor }}
              >
                <div>
                  <div className={clsx('w-full overflow-hidden relative', getAspectClass(aspectRatio))}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

                    {item.badge && (
                      <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-md">
                        {item.badge}
                      </span>
                    )}

                    {item.category && !item.badge && (
                      <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                        {item.category}
                      </span>
                    )}

                    {item.price && (
                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-lg">
                        {item.price}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    {item.date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </div>
                    )}

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>

                    {(item.subtitle || item.excerpt) && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {item.subtitle || item.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>צפייה במידע המלא</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            LAYOUT 3: INFINITE SNAP CAROUSEL (Smooth Horizontal Slider)
        ========================================================================= */}
        {layout === 'snap-carousel' && filteredItems.length > 0 && (
          <div className="relative w-full">
            {/* Navigation Buttons */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition cursor-pointer"
                title="הבא"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition cursor-pointer"
                title="הקודם"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Slider Track */}
            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 px-1 scrollbar-none"
            >
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px] rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                  style={{ backgroundColor: cardBgColor }}
                >
                  <div className={clsx('w-full overflow-hidden relative', getAspectClass(aspectRatio))}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {item.category && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                        {item.category}
                      </span>
                    )}
                    {item.price && (
                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg">
                        {item.price}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col gap-2 flex-grow justify-between">
                    <div>
                      {item.date && (
                        <span className="text-[11px] text-slate-400 font-mono block mb-1">
                          {item.date}
                        </span>
                      )}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span>צפייה בפרטים</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            LAYOUT 4: EDITORIAL MAGAZINE LIST (Magnetic Hover Thumbnail)
        ========================================================================= */}
        {layout === 'editorial-list' && filteredItems.length > 0 && (
          <div
            className="relative flex flex-col divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800"
            onMouseMove={handleMouseMove}
          >
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className="group py-5 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60 px-4 rounded-2xl cursor-pointer"
              >
                <div className="flex items-center gap-4 sm:gap-6 flex-grow">
                  <span className="text-xs sm:text-sm font-mono text-slate-400 font-bold w-6 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {item.date && (
                    <span className="text-xs font-mono text-slate-400 shrink-0 hidden md:block">
                      {item.date}
                    </span>
                  )}

                  <div className="flex flex-col">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {item.category && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {item.category}
                    </span>
                  )}
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 text-slate-600 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-all group-hover:rotate-45">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}

            {/* Floating Magnetic Thumbnail Preview (Desktop) */}
            {hoveredItem && (
              <div
                className="hidden lg:block fixed pointer-events-none z-40 w-64 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white dark:border-slate-700 transition-opacity duration-150 animate-in fade-in zoom-in-95"
                style={{
                  top: mousePos.y - 80,
                  right: mousePos.x + 30,
                }}
              >
                <img
                  src={hoveredItem.imageUrl}
                  alt={hoveredItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            LAYOUT 5: ASYMMETRIC MASONRY (Pinterest-style Columns)
        ========================================================================= */}
        {layout === 'masonry' && filteredItems.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="break-inside-avoid group relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                style={{ backgroundColor: cardBgColor }}
              >
                <div className="relative w-full overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-30 group-hover:opacity-10 transition-opacity" />
                  {item.category && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-2">
                  {item.date && (
                    <span className="text-[11px] text-slate-400 font-mono block">
                      {item.date}
                    </span>
                  )}
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global CTA Bottom Button */}
        {primaryButton?.text && (
          <div className="flex justify-center mt-6">
            <a
              href={primaryButton.url || '#'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <span>{primaryButton.text}</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right animate-in zoom-in-95 duration-200"
            dir="rtl"
          >
            <button
              type="button"
              onClick={() => setModalItem(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 relative">
              <img
                src={modalItem.imageUrl}
                alt={modalItem.title}
                className="w-full h-full object-cover"
              />
              {modalItem.category && (
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-md">
                  {modalItem.category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-2">
              {modalItem.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{modalItem.date}</span>
                </span>
              )}
              {modalItem.price && (
                <span className="font-bold text-emerald-500">{modalItem.price}</span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
              {modalItem.title}
            </h2>

            {modalItem.subtitle && (
              <p className="text-base text-slate-600 dark:text-slate-300 font-semibold mb-4 leading-relaxed">
                {modalItem.subtitle}
              </p>
            )}

            {modalItem.excerpt && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line mb-6">
                {modalItem.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {modalItem.linkUrl && modalItem.linkUrl !== '#' ? (
                <a
                  href={modalItem.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition"
                >
                  <span>מעבר לעמוד המלא</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
