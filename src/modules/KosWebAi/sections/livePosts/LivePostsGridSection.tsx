import React, { useState, useMemo, useRef } from 'react';
import {
  LivePostsGridSectionConfig,
  LivePostItem,
  LivePostsLayoutPreset,
  LivePostsDisplayMode,
} from '../../types/sectionConfigs';
import {
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Star,
  Sparkles,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const LivePostsGridSection: React.FC<{ config: LivePostsGridSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'עדכונים ואירועים אחרונים',
    subtitle,
    description = 'כל מה שחדש וקורה בפעילות ובקהילה שלנו',
    backgroundColor = 'transparent',
    cardBackgroundColor,
    titleColor,
    descriptionColor,
    layout = 'standard',
    displayMode = 'grid',
    objectScale = 'normal',
    buttonShape = 'auto',
    buttonSize = 'auto',
    showCtaButton = true,
    ctaText = 'לכל האירועים והחדשות',
    ctaUrl = '#',
    showPostExcerpt = true,
    showPostDate = true,
    showPostTag = true,
    showPostAuthor = true,
    showReadTime = true,
    textBgEnabled,
    textBgImageUrl,
    textBgOverlayColor = '#000000',
    textBgOverlayOpacity = 60,
    textBgEffect = 'zoom-glow',
    textBgScope = 'text-card',
    customPages = [
      {
        id: '1',
        title: 'סיכום כנס הקיץ השנתי בהשתתפות מאות משפחות',
        excerpt: 'חוויה מעצימה ומרגשת של חיבור ולימוד משותף בהשתתפות נציגים מכל רחבי הארץ...',
        date: '15 באוגוסט 2026',
        tag: 'אירועים',
        readTimeMinutes: 4,
        authorName: 'צוות הקהילה',
        imageUrl:
          'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        linkUrl: '#',
        isFeatured: true,
      },
      {
        id: '2',
        title: 'השקת תוכנית המלגות לסטודנטים וחוקרים',
        excerpt: 'פתיחת מסלול חדש להענקת מלגות מחקר וסיוע לימודי לקראת שנת הלימודים החדשה...',
        date: '02 באוגוסט 2026',
        tag: 'חדשות',
        readTimeMinutes: 3,
        authorName: 'הנהלת הקרן',
        imageUrl:
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        linkUrl: '#',
      },
      {
        id: '3',
        title: 'פרויקט שיפוץ והרחבת מרכז הפעילות הקהילתי',
        excerpt: 'התקדמות העבודות לקראת פתיחת השנה החדשה, שדרוג האולמות ומתחמי ההתכנסות...',
        date: '28 ביולי 2026',
        tag: 'פיתוח',
        readTimeMinutes: 5,
        authorName: 'אגף בינוי ופיתוח',
        imageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        linkUrl: '#',
      },
    ],
  } = config;

  // Carousel scroll ref & state
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselContainerRef.current) return;
    const scrollAmount = 360;
    carouselContainerRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  // Scaling classes
  const scaleClasses = useMemo(() => {
    switch (objectScale) {
      case 'compact':
        return {
          title: 'text-2xl sm:text-3xl font-extrabold',
          cardPadding: 'p-4',
          cardTitle: 'text-base font-bold',
          cardExcerpt: 'text-xs line-clamp-2',
          imageHeight: 'aspect-[16/10]',
        };
      case 'large':
        return {
          title: 'text-4xl sm:text-5xl font-black',
          cardPadding: 'p-7',
          cardTitle: 'text-xl font-extrabold',
          cardExcerpt: 'text-sm line-clamp-3',
          imageHeight: 'aspect-[16/9]',
        };
      case 'massive':
        return {
          title: 'text-5xl sm:text-6xl font-black',
          cardPadding: 'p-8',
          cardTitle: 'text-2xl font-black',
          cardExcerpt: 'text-base line-clamp-4',
          imageHeight: 'aspect-[16/9]',
        };
      case 'normal':
      case 'auto':
      default:
        return {
          title: 'text-3xl sm:text-4xl font-extrabold',
          cardPadding: 'p-6',
          cardTitle: 'text-lg font-bold',
          cardExcerpt: 'text-xs line-clamp-2',
          imageHeight: 'aspect-video',
        };
    }
  }, [objectScale]);

  // CTA Button Shape resolution
  const resolvedButtonShapeClass = useMemo(() => {
    const shape =
      buttonShape === 'auto'
        ? layout === 'feminine'
          ? 'pill'
          : layout === 'sharp'
          ? 'sharp'
          : layout === 'masculine'
          ? 'chiseled'
          : 'rounded'
        : buttonShape;
    switch (shape) {
      case 'pill':
        return 'rounded-full';
      case 'sharp':
        return 'rounded-none border-2 border-current shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]';
      case 'chiseled':
        return 'rounded-lg border-2 border-amber-500/80 shadow-md';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  }, [buttonShape, layout]);

  // CTA Button Size resolution
  const resolvedButtonSizeClass = useMemo(() => {
    switch (buttonSize) {
      case 'sm':
        return 'px-4 py-2 text-xs';
      case 'lg':
        return 'px-8 py-3.5 text-base';
      case 'xl':
        return 'px-10 py-4 text-lg font-black';
      case 'md':
      case 'auto':
      default:
        return 'px-6 py-3 text-sm font-bold';
    }
  }, [buttonSize]);

  // Text Background effect class
  const textBgEffectClass = useMemo(() => {
    switch (textBgEffect) {
      case 'zoom-glow':
        return 'group-hover:scale-105 group-hover:brightness-110 transition-transform duration-700 ease-out';
      case 'shimmer-sweep':
        return 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full hover:before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';
      case 'float-parallax':
        return 'group-hover:-translate-y-1.5 transition-transform duration-500 ease-out';
      case 'blur-reveal':
        return 'transition-all duration-700 blur-[0.4px] hover:blur-0';
      case 'gradient-shift':
        return 'animate-pulse';
      default:
        return '';
    }
  }, [textBgEffect]);

  // Layout Specific Card Container Styling
  const getCardStyleClass = (isFeatured?: boolean) => {
    switch (layout) {
      case 'feminine':
        return 'rounded-[2rem] border border-rose-200/80 dark:border-rose-900/40 bg-white/95 dark:bg-slate-900/90 shadow-[0_15px_35px_rgba(244,63,94,0.08)] hover:shadow-[0_20px_45px_rgba(244,63,94,0.18)] hover:border-rose-400 transition-all duration-500';
      case 'masculine':
        return 'rounded-2xl border-2 border-slate-800 dark:border-slate-700 hover:border-amber-500 bg-slate-950 text-white shadow-xl hover:shadow-amber-500/10 transition-all duration-300';
      case 'spiritual':
        return 'rounded-3xl border border-teal-200/70 dark:border-teal-800/40 bg-white/90 dark:bg-slate-900/90 shadow-xl hover:border-teal-400/80 hover:shadow-teal-500/15 transition-all duration-700';
      case 'sharp':
        return 'rounded-none border-2 border-black dark:border-white bg-white dark:bg-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.95)] hover:-translate-x-1 hover:-translate-y-1 transition-transform duration-200';
      case 'analytical':
        return 'rounded-none border border-cyan-500/40 bg-slate-950/95 shadow-lg shadow-cyan-500/10 hover:border-cyan-400 transition-all duration-300';
      case 'standard':
      default:
        return 'rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xl hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all duration-300';
    }
  };

  // Layout Specific Tag Badge Styling
  const getTagBadgeStyle = (tag?: string) => {
    switch (layout) {
      case 'feminine':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300/60 rounded-full font-bold';
      case 'masculine':
        return 'bg-amber-500 text-slate-950 font-black uppercase tracking-wider rounded-md border border-amber-400';
      case 'spiritual':
        return 'bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-200 border border-teal-300/50 rounded-full font-semibold';
      case 'sharp':
        return 'bg-black text-white dark:bg-white dark:text-black font-mono font-black uppercase rounded-none border border-current';
      case 'analytical':
        return 'bg-cyan-950 text-cyan-300 font-mono font-bold tracking-wider rounded-xs border border-cyan-500/50';
      case 'standard':
      default:
        return 'bg-slate-950/80 backdrop-blur-md text-white border border-white/10 rounded-full font-bold';
    }
  };

  // Read More link styling
  const getReadMoreStyle = () => {
    switch (layout) {
      case 'feminine':
        return 'text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold';
      case 'masculine':
        return 'text-amber-400 hover:text-amber-300 font-extrabold uppercase tracking-wider';
      case 'spiritual':
        return 'text-teal-600 dark:text-teal-300 hover:text-teal-700 font-semibold';
      case 'sharp':
        return 'text-black dark:text-white font-mono font-black uppercase underline decoration-2';
      case 'analytical':
        return 'text-cyan-400 hover:text-cyan-300 font-mono font-bold';
      case 'standard':
      default:
        return 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold';
    }
  };

  // Layout Header Badge
  const renderLayoutHeaderBadge = () => {
    switch (layout) {
      case 'feminine':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>פעילות, השקות ואירועים</span>
          </div>
        );
      case 'masculine':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>חדשות שטח ודוחות פעילות</span>
          </div>
        );
      case 'spiritual':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold mb-2">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>השראה, מאמרים ומפגשים</span>
          </div>
        );
      case 'sharp':
        return (
          <div className="px-3 py-1 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black uppercase mb-2">
            LIVE_POSTS_FEED // 2026
          </div>
        );
      case 'analytical':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>COMMUNITY FEED // SYNCED</span>
          </div>
        );
      case 'standard':
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mb-2 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
        );
    }
  };

  // Render individual card
  const renderPostCard = (post: LivePostItem, isSpotlightMain?: boolean) => {
    const cardShape = getCardStyleClass(post.isFeatured);
    const tagStyle = getTagBadgeStyle(post.tag);
    const readMoreStyle = getReadMoreStyle();

    // Analytical HUD corner clips
    const isAnalytical = layout === 'analytical';

    return (
      <div
        key={post.id}
        className={`${cardShape} overflow-hidden flex flex-col justify-between group relative transition-all duration-300 ${
          isSpotlightMain ? 'md:col-span-2' : ''
        }`}
        style={{
          backgroundColor: cardBackgroundColor,
          clipPath: isAnalytical
            ? 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)'
            : undefined,
        }}
      >
        {isAnalytical && (
          <>
            <span className="absolute top-1 left-2 text-[8px] font-mono text-cyan-400/80 z-20">
              [POST#{post.id.slice(-4)}]
            </span>
            <span className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400/80 z-20">
              //DATA_ITEM
            </span>
          </>
        )}

        <div>
          {/* Post Image Container */}
          {post.imageUrl && (
            <div
              className={`${
                isSpotlightMain ? 'aspect-[16/9] sm:aspect-[21/9]' : scaleClasses.imageHeight
              } w-full overflow-hidden relative`}
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Tag / Category Badge */}
              {showPostTag && post.tag && (
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] ${tagStyle} shadow-md`}
                >
                  {post.tag}
                </span>
              )}

              {/* Featured Badge */}
              {post.isFeatured && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>מוביל</span>
                </span>
              )}
            </div>
          )}

          {/* Card Body */}
          <div className={`${scaleClasses.cardPadding} flex flex-col gap-2.5 text-right`}>
            {/* Metadata row: Date, Read Time, Author */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                {showPostDate && post.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.date}</span>
                  </div>
                )}
                {showReadTime && post.readTimeMinutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.readTimeMinutes} דק׳ קריאה</span>
                  </div>
                )}
              </div>

              {showPostAuthor && post.authorName && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[120px]">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">{post.authorName}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3
              className={`${scaleClasses.cardTitle} text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors`}
            >
              {post.title}
            </h3>

            {/* Excerpt */}
            {showPostExcerpt && post.excerpt && (
              <p
                className={`${scaleClasses.cardExcerpt} text-slate-600 dark:text-slate-400 leading-relaxed`}
              >
                {post.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Read More / Action link */}
        {post.linkUrl && (
          <div className={`px-6 pb-6 pt-1 flex items-center justify-between`}>
            <a
              href={post.linkUrl}
              className={`inline-flex items-center gap-2 text-xs ${readMoreStyle} transition-colors group/link`}
            >
              <span>{post.ctaButtonText || 'קרא את הכתבה המלאה'}</span>
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-x-1" />
            </a>
          </div>
        )}
      </div>
    );
  };

  // Render Display Modes:
  const renderPostsDisplay = () => {
    // 1. Carousel Mode
    if (displayMode === 'carousel') {
      return (
        <div className="relative w-full">
          {/* Carousel Arrows */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="הקודם"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="הבא"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={carouselContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {customPages.map((post) => (
              <div
                key={post.id}
                className="min-w-[280px] sm:min-w-[340px] md:min-w-[380px] shrink-0 snap-start"
              >
                {renderPostCard(post)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Spotlight Mode (1 Big Featured + Others)
    if (displayMode === 'spotlight') {
      const featuredPost = customPages.find((p) => p.isFeatured) || customPages[0];
      const otherPosts = customPages.filter((p) => p.id !== featuredPost?.id);

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full">
          {featuredPost && renderPostCard(featuredPost, true)}
          <div className="flex flex-col gap-6 md:col-span-1 justify-between">
            {otherPosts.slice(0, 2).map((post) => renderPostCard(post))}
          </div>
        </div>
      );
    }

    // 3. Compact List Mode
    if (displayMode === 'compact-list') {
      return (
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          {customPages.map((post) => (
            <div
              key={post.id}
              className={`p-4 sm:p-5 ${getCardStyleClass(
                post.isFeatured
              )} flex flex-col sm:flex-row items-center gap-4 group justify-between`}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 shadow-sm"
                  />
                )}
                <div className="flex flex-col gap-1 text-right">
                  <div className="flex items-center gap-2">
                    {post.tag && (
                      <span className={`px-2 py-0.5 text-[10px] ${getTagBadgeStyle(post.tag)}`}>
                        {post.tag}
                      </span>
                    )}
                    {post.date && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {post.title}
                  </h4>
                  {post.excerpt && (
                    <p className="text-xs text-slate-500 line-clamp-1">{post.excerpt}</p>
                  )}
                </div>
              </div>

              {post.linkUrl && (
                <a
                  href={post.linkUrl}
                  className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold ${getReadMoreStyle()}`}
                >
                  <span>קרא עוד</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Default: 3-Columns Grid
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full">
        {customPages.map((post) => renderPostCard(post))}
      </div>
    );
  };

  // Global CTA Button
  const renderGlobalCtaButton = () => {
    if (!showCtaButton || !ctaText) return null;

    let buttonColorClasses =
      'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-95';
    if (layout === 'feminine') {
      buttonColorClasses =
        'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40';
    } else if (layout === 'masculine') {
      buttonColorClasses =
        'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40';
    } else if (layout === 'spiritual') {
      buttonColorClasses =
        'bg-teal-700 hover:bg-teal-800 text-amber-100 shadow-lg shadow-teal-700/25';
    } else if (layout === 'sharp') {
      buttonColorClasses =
        'bg-black text-white dark:bg-white dark:text-black font-mono font-black';
    } else if (layout === 'analytical') {
      buttonColorClasses =
        'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25';
    } else if (layout === 'standard') {
      buttonColorClasses =
        'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25';
    }

    return (
      <div className="mt-8 sm:mt-12 flex justify-center">
        <a
          href={ctaUrl || '#'}
          className={`inline-flex items-center gap-2 ${resolvedButtonShapeClass} ${resolvedButtonSizeClass} ${buttonColorClasses} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group`}
        >
          <span>{ctaText}</span>
          <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </a>
      </div>
    );
  };

  return (
    <section
      id={anchorId || 'livePosts'}
      className={`w-full py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
        textBgEnabled && textBgScope === 'full-section' ? 'group' : ''
      }`}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      {/* Full-Section Text Background Image if scope is full-section */}
      {textBgEnabled && textBgImageUrl && textBgScope === 'full-section' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={textBgImageUrl}
            alt=""
            className={`w-full h-full object-cover ${textBgEffectClass}`}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: textBgOverlayColor,
              opacity: (textBgOverlayOpacity ?? 60) / 100,
            }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-10 sm:gap-12 relative z-10">
        {/* Header container */}
        {(title || description || subtitle) && (
          <div
            className={`text-center max-w-3xl mx-auto flex flex-col items-center gap-2 p-4 sm:p-6 rounded-3xl relative transition-all duration-300 ${
              textBgEnabled && textBgScope === 'text-card'
                ? 'group overflow-hidden shadow-2xl backdrop-blur-md'
                : ''
            }`}
          >
            {/* Text-Card Background Image */}
            {textBgEnabled && textBgImageUrl && textBgScope === 'text-card' && (
              <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
                <img
                  src={textBgImageUrl}
                  alt=""
                  className={`w-full h-full object-cover ${textBgEffectClass}`}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: textBgOverlayColor,
                    opacity: (textBgOverlayOpacity ?? 60) / 100,
                  }}
                />
              </div>
            )}

            {renderLayoutHeaderBadge()}

            {title && (
              <h2
                className={`${scaleClasses.title} text-slate-900 dark:text-white tracking-tight leading-tight`}
                style={{ color: titleColor }}
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {subtitle}
              </p>
            )}

            {description && (
              <p
                className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
                style={{ color: descriptionColor }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Posts Display Container */}
        {renderPostsDisplay()}

        {/* Global CTA Button */}
        {renderGlobalCtaButton()}
      </div>
    </section>
  );
};
