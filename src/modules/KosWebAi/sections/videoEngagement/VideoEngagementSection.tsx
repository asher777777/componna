import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  VideoEngagementSectionConfig,
  VideoEngagementComment,
  VideoEngagementLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import {
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
  Calendar,
  Sparkles,
  Shield,
  Compass,
  Crosshair,
  Activity,
  Layers,
  Heart,
  Tag,
} from 'lucide-react';

export const VideoEngagementSection: React.FC<{ config: VideoEngagementSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  const {
    anchorId = 'engagement',
    title,
    videoTitle,
    allowLikes = true,
    likesCount = 0,
    viewsCount = 0,
    publishedDateText,
    allowComments = true,
    allowUserComments = true,
    comments = [],
    enableSocialShare = true,
    tags = [],
    backgroundColor = 'transparent',
    accentColor,
    cardBackgroundColor,
    layout = 'standard',
    objectScale = 'normal',
    buttonShape = 'auto',
    buttonSize = 'normal',
    socialButtonsStyle = 'icons-only',
    showButtonLabels = false,
    textBgEnabled = false,
    textBgImageUrl,
    textBgOverlayColor = '#000000',
    textBgOverlayOpacity = 0.6,
    textBgEffect = 'zoom-glow',
    textBgScope = 'bar',
  } = config;

  // Resolve Brand DNA defaults
  const companyName = brandDna?.identity?.companyName || '';
  const brandSlogan = brandDna?.identity?.slogan || '';
  const primaryBrandColor = brandDna?.designTokens?.primaryColor || '#ef4444';
  const effectiveAccent = accentColor || primaryBrandColor;

  const effectiveTitle =
    title || (companyName ? `אינטראקציה, שיתוף ותגובות • ${companyName}` : 'אינטראקציה, שיתוף ותגובות');

  const effectiveVideoTitle =
    videoTitle || (companyName ? `הסרטון הרשמי של ${companyName}` : 'סרטון וידאו');

  const effectiveTags =
    tags && tags.length > 0
      ? tags
      : [companyName, 'וידאו', 'KOSUN', 'אינטראקציה'].filter(Boolean);

  // Video likes state
  const [videoLikes, setVideoLikes] = useState<number>(() => {
    if (typeof likesCount === 'number') return likesCount;
    return 0;
  });
  const [isVideoLiked, setIsVideoLiked] = useState<boolean>(false);
  const [isVideoDisliked, setIsVideoDisliked] = useState<boolean>(false);

  const formatStatNumber = (num?: number | string) => {
    if (!num) return '0';
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('he-IL');
  };

  // Copy link state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Collapse states
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState<boolean>(false);

  // Comments state
  const [localComments, setLocalComments] = useState<VideoEngagementComment[]>(comments);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [authorNameInput, setAuthorNameInput] = useState<string>('');
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (comments && comments.length > 0) {
      setLocalComments(comments);
    }
  }, [comments]);

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleToggleLike = (commentId: string) => {
    setLikedCommentIds((prev) => {
      const isCurrentlyLiked = !!prev[commentId];
      const nextLiked = !isCurrentlyLiked;
      setLocalComments((curr) =>
        curr.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              likesCount: isCurrentlyLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1,
            };
          }
          return c;
        })
      );
      return { ...prev, [commentId]: nextLiked };
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: VideoEngagementComment = {
      id: `comm_${Date.now()}`,
      authorName: authorNameInput.trim() || 'אורח/ת באתר',
      authorAvatar: '',
      publishedAt: 'כרגע',
      content: newCommentText.trim(),
      likesCount: 1,
    };

    setLocalComments([newComment, ...localComments]);
    setNewCommentText('');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`${effectiveVideoTitle} - ${currentUrl}`);

  // Scale settings
  const getScaleClasses = () => {
    switch (objectScale) {
      case 'compact':
        return {
          barP: 'p-2.5 sm:p-3',
          iconSize: 'w-3.5 h-3.5',
          btnP: 'px-2.5 py-1 text-xs',
          btnIconP: 'w-7 h-7',
          textSize: 'text-xs',
          commentP: 'p-3',
        };
      case 'large':
        return {
          barP: 'p-5 sm:p-6',
          iconSize: 'w-4 h-4',
          btnP: 'px-4 py-2.5 text-sm font-bold',
          btnIconP: 'w-10 h-10',
          textSize: 'text-sm font-semibold',
          commentP: 'p-5',
        };
      case 'massive':
        return {
          barP: 'p-6 sm:p-8',
          iconSize: 'w-5 h-5',
          btnP: 'px-5 py-3 text-base font-black',
          btnIconP: 'w-12 h-12',
          textSize: 'text-base font-bold',
          commentP: 'p-6',
        };
      case 'normal':
      default:
        return {
          barP: 'p-3.5 sm:p-4',
          iconSize: 'w-4 h-4',
          btnP: 'px-3 py-1.5 text-xs font-semibold',
          btnIconP: 'w-8 h-8',
          textSize: 'text-xs sm:text-sm font-medium',
          commentP: 'p-4',
        };
    }
  };
  const scale = getScaleClasses();

  // Button Shape
  const getButtonShapeClass = () => {
    if (buttonShape === 'round') return 'rounded-full';
    if (buttonShape === 'pill') return 'rounded-full px-4';
    if (buttonShape === 'sharp') return 'rounded-none';
    if (buttonShape === 'square') return 'rounded-lg';
    switch (layout) {
      case 'feminine':
        return 'rounded-full';
      case 'masculine':
        return 'rounded-lg';
      case 'sharp':
        return 'rounded-none';
      case 'spiritual':
        return 'rounded-full';
      case 'analytical':
        return 'rounded-md';
      default:
        return 'rounded-full';
    }
  };

  // Text Background Hover Effect
  const getTextBgEffectClass = (effect: HeroTextBgEffect) => {
    switch (effect) {
      case 'zoom-glow':
        return 'group-hover/bg:scale-105 group-hover/bg:brightness-110 transition-all duration-700';
      case 'shimmer-sweep':
        return 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:-translate-x-full group-hover/bg:after:translate-x-full after:transition-transform after:duration-1000';
      case 'float-parallax':
        return 'group-hover/bg:-translate-y-1 group-hover/bg:scale-[1.01] transition-all duration-500';
      case 'blur-reveal':
        return 'blur-[2px] group-hover/bg:blur-0 transition-all duration-500';
      case 'gradient-shift':
        return 'group-hover/bg:contrast-125 transition-all duration-700';
      default:
        return 'transition-transform duration-500 group-hover/bg:scale-105';
    }
  };

  // Layout Theme Container Classes
  const getContainerClasses = () => {
    switch (layout) {
      case 'feminine':
        return 'rounded-[2.5rem] bg-gradient-to-r from-rose-50/90 via-white to-pink-50/60 dark:from-stone-900/90 dark:via-stone-900/70 dark:to-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 shadow-xl';
      case 'masculine':
        return 'rounded-xl bg-zinc-950/90 border-2 border-zinc-800 hover:border-amber-500/50 shadow-2xl text-white';
      case 'spiritual':
        return 'rounded-3xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-emerald-950/20 border border-emerald-500/30 shadow-xl text-emerald-50';
      case 'sharp':
        return 'rounded-none bg-black border border-cyan-500/50 shadow-2xl text-white font-mono';
      case 'analytical':
        return 'rounded-xl bg-slate-900/95 border border-slate-700 shadow-xl text-slate-100';
      case 'standard':
      default:
        return 'rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm';
    }
  };

  // Render Social Share Buttons (Icons + Rich Tooltips by default)
  const isIconsOnly = !showButtonLabels && socialButtonsStyle !== 'icons-text';

  const renderSocialButtons = () => {
    const iconBtnClass = clsx(
      'relative group flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-110',
      scale.btnIconP,
      getButtonShapeClass()
    );

    const textBtnClass = clsx(
      'flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105',
      scale.btnP,
      getButtonShapeClass()
    );

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            isIconsOnly ? iconBtnClass : textBtnClass,
            'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
          )}
          title="שתף ב-WhatsApp"
        >
          {/* Custom SVG WhatsApp icon for high fidelity */}
          <svg className={scale.iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.176.2-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.678-1.635-.929-2.238-.244-.588-.493-.508-.678-.517-.175-.009-.376-.011-.577-.011s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.91 1.229 3.111.15.201 2.124 3.243 5.146 4.549.719.311 1.281.497 1.719.636.723.23 1.38.197 1.9.12.58-.087 1.78-.727 2.03-1.429.25-.702.25-1.304.175-1.429-.075-.125-.276-.2-.577-.35z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.436 5.176L2.05 21.95l4.908-1.353C8.423 21.49 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.618 0-3.132-.455-4.427-1.246l-.317-.193-2.913.803.818-2.836-.212-.338C4.12 15.118 3.65 13.612 3.65 12c0-4.604 3.746-8.35 8.35-8.35 4.604 0 8.35 3.746 8.35 8.35 0 4.604-3.746 8.35-8.35 8.35z" />
          </svg>
          {!isIconsOnly && <span>WhatsApp</span>}

          {/* Floating Tooltip */}
          {isIconsOnly && (
            <span className="absolute -top-8 z-30 px-2 py-0.5 rounded-md bg-zinc-950/90 text-white text-[10px] font-medium shadow-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              שתף ב-WhatsApp
            </span>
          )}
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            isIconsOnly ? iconBtnClass : textBtnClass,
            'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white'
          )}
          title="שתף ב-Facebook"
        >
          <svg className={scale.iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {!isIconsOnly && <span>Facebook</span>}

          {isIconsOnly && (
            <span className="absolute -top-8 z-30 px-2 py-0.5 rounded-md bg-zinc-950/90 text-white text-[10px] font-medium shadow-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              שתף ב-Facebook
            </span>
          )}
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            isIconsOnly ? iconBtnClass : textBtnClass,
            'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-600 hover:text-white'
          )}
          title="שתף ב-LinkedIn"
        >
          <svg className={scale.iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          {!isIconsOnly && <span>LinkedIn</span>}

          {isIconsOnly && (
            <span className="absolute -top-8 z-30 px-2 py-0.5 rounded-md bg-zinc-950/90 text-white text-[10px] font-medium shadow-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              שתף ב-LinkedIn
            </span>
          )}
        </a>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={clsx(
            isIconsOnly ? iconBtnClass : textBtnClass,
            copiedLink
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
          title="העתק קישור לעמוד"
        >
          {copiedLink ? <Check className={scale.iconSize} /> : <Copy className={scale.iconSize} />}
          {!isIconsOnly && <span>{copiedLink ? 'הועתק!' : 'העתק'}</span>}

          {isIconsOnly && (
            <span className="absolute -top-8 z-30 px-2 py-0.5 rounded-md bg-zinc-950/90 text-white text-[10px] font-medium shadow-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {copiedLink ? 'הקישור הועתק!' : 'העתק קישור'}
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <section
      id={anchorId}
      className={clsx(
        'relative w-full py-6 md:py-8 px-3 sm:px-6 lg:px-8 overflow-hidden font-sans transition-colors duration-300',
        (!backgroundColor || backgroundColor === 'transparent') && 'bg-slate-50 dark:bg-[#07090e]'
      )}
      style={{
        backgroundColor:
          backgroundColor && backgroundColor !== 'transparent' ? backgroundColor : undefined,
      }}
      dir="rtl"
    >
      {/* Background Image behind section scope */}
      {textBgEnabled && textBgImageUrl && textBgScope === 'section' && (
        <div className="group/bg absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={textBgImageUrl}
            alt="engagement background"
            className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: textBgOverlayColor,
              opacity: textBgOverlayOpacity,
            }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto space-y-4">
        {/* Layer 1: Engagement & Actions Bar (Likes, Views, Comments Anchor, Share) */}
        <div className="relative group/bg overflow-hidden rounded-2xl">
          {/* Card scope text background */}
          {textBgEnabled && textBgImageUrl && textBgScope === 'bar' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={textBgImageUrl}
                alt="bar background"
                className={clsx('w-full h-full object-cover', getTextBgEffectClass(textBgEffect))}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: textBgOverlayColor,
                  opacity: textBgOverlayOpacity,
                }}
              />
            </div>
          )}

          <div
            className={clsx(
              'relative z-10 flex flex-wrap items-center justify-between gap-4 transition-all duration-300',
              getContainerClasses(),
              scale.barP
            )}
            style={{ backgroundColor: cardBackgroundColor }}
          >
            {/* Right side (RTL first): Views, Likes, Comments anchor */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Views Counter (Truthful only) */}
              <div
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs',
                  scale.textSize,
                  getButtonShapeClass()
                )}
                title="סה״כ צפיות מאומתות"
              >
                <Eye className={clsx(scale.iconSize, 'text-emerald-500')} />
                <span>{viewsCount ? formatStatNumber(viewsCount) : '0'} צפיות</span>
              </div>

              {/* Like / Dislike Combined Action Pill */}
              {allowLikes && (
                <div
                  className={clsx(
                    'flex items-center rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs',
                    getButtonShapeClass()
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isVideoLiked) {
                        setIsVideoLiked(true);
                        setVideoLikes((prev) => prev + 1);
                        if (isVideoDisliked) setIsVideoDisliked(false);
                      } else {
                        setIsVideoLiked(false);
                        setVideoLikes((prev) => Math.max(0, prev - 1));
                      }
                    }}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 transition-colors cursor-pointer',
                      scale.textSize,
                      isVideoLiked
                        ? 'text-red-500 font-bold bg-red-500/10'
                        : 'text-slate-700 dark:text-slate-300 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                    title="אהבתי (לייק)"
                  >
                    <ThumbsUp
                      className={clsx(
                        scale.iconSize,
                        isVideoLiked ? 'fill-red-500 text-red-500' : 'text-slate-500'
                      )}
                    />
                    <span>{formatStatNumber(videoLikes)}</span>
                  </button>

                  <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />

                  <button
                    type="button"
                    onClick={() => {
                      if (!isVideoDisliked) {
                        setIsVideoDisliked(true);
                        if (isVideoLiked) {
                          setIsVideoLiked(false);
                          setVideoLikes((prev) => Math.max(0, prev - 1));
                        }
                      } else {
                        setIsVideoDisliked(false);
                      }
                    }}
                    className={clsx(
                      'px-2.5 py-1.5 transition-colors cursor-pointer',
                      isVideoDisliked
                        ? 'text-slate-900 dark:text-white bg-slate-300 dark:bg-slate-700'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    )}
                    title="לא אהבתי"
                  >
                    <ThumbsDown
                      className={clsx(
                        scale.iconSize,
                        isVideoDisliked ? 'fill-current' : ''
                      )}
                    />
                  </button>
                </div>
              )}

              {/* Comments Quick Counter Pill */}
              {allowComments && (
                <button
                  type="button"
                  onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs',
                    scale.textSize,
                    getButtonShapeClass()
                  )}
                  title="לחץ לפתיחת אזור התגובות"
                >
                  <MessageSquare className={clsx(scale.iconSize, 'text-rose-500')} />
                  <span>{localComments.length} תגובות</span>
                </button>
              )}
            </div>

            {/* Left side (RTL second): Tags Toggle & Social Sharing Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Tags Dropdown Toggle */}
              {effectiveTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 transition cursor-pointer shadow-xs',
                    scale.textSize,
                    getButtonShapeClass()
                  )}
                  title="הצג תוויות ותגיות וידאו"
                >
                  <Tag className={clsx(scale.iconSize, 'text-amber-500')} />
                  <span>תוויות ({effectiveTags.length})</span>
                  <ChevronDown
                    className={clsx('w-3.5 h-3.5 transition-transform duration-200', isTagsExpanded && 'rotate-180 text-amber-500')}
                  />
                </button>
              )}

              {/* Social Share Buttons */}
              {enableSocialShare && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>שיתוף:</span>
                  </span>
                  {renderSocialButtons()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layer 2: Expandable Tags Bar */}
        {isTagsExpanded && effectiveTags.length > 0 && (
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm animate-in fade-in duration-200 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-bold text-slate-400 ml-2">תוויות הסרטון:</span>
            {effectiveTags.map((tag, idx) => (
              <span
                key={idx}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 shadow-xs',
                  layout === 'feminine' && 'border-rose-300/40 text-rose-700 dark:text-rose-300',
                  layout === 'masculine' && 'border-amber-500/40 text-amber-400 bg-zinc-950',
                  layout === 'sharp' && 'rounded-none border-cyan-500/40 text-cyan-400 font-mono',
                  layout === 'spiritual' && 'border-emerald-500/40 text-emerald-300'
                )}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Layer 3: Comments Section (Toggleable or Always Available) */}
        {allowComments && (
          <div
            className={clsx(
              'rounded-2xl border transition-all duration-300 overflow-hidden',
              getContainerClasses()
            )}
            style={{ backgroundColor: cardBackgroundColor }}
          >
            {/* Comments Header Bar */}
            <div
              onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-500/5 transition select-none"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center shadow-sm',
                    layout === 'feminine' && 'bg-rose-100 dark:bg-rose-950 text-rose-500',
                    layout === 'masculine' && 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
                    layout === 'sharp' && 'rounded-none bg-cyan-950 text-cyan-400 border border-cyan-500/50',
                    layout === 'spiritual' && 'bg-emerald-900/30 text-emerald-400',
                    layout === 'analytical' && 'bg-indigo-950 text-indigo-400',
                    layout === 'standard' && 'bg-red-500/10 text-red-500'
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">
                    {localComments.length} תגובות לוידאו
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isCommentsExpanded ? 'לחץ לסגירת אזור התגובות' : 'לחץ להצגת התגובות וכתיבת תגובה חדשה'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                  {isCommentsExpanded ? 'הסתר תגובות' : 'הצג תגובות'}
                </span>
                <ChevronDown
                  className={clsx('w-4 h-4 text-slate-400 transition-transform duration-200', isCommentsExpanded && 'rotate-180 text-amber-500')}
                />
              </div>
            </div>

            {/* Comments Expanded Panel */}
            {isCommentsExpanded && (
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-200">
                {/* New Comment Submission Form */}
                {allowUserComments && (
                  <form onSubmit={handleAddComment} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={authorNameInput}
                        onChange={(e) => setAuthorNameInput(e.target.value)}
                        placeholder="השם שלך (אופציונלי)"
                        className={clsx(
                          'px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500',
                          getButtonShapeClass()
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <textarea
                        rows={2}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="הוסף תגובה לסרטון..."
                        className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className={clsx(
                          'p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow-md cursor-pointer disabled:opacity-40 shrink-0',
                          getButtonShapeClass()
                        )}
                        title="שלח תגובה"
                      >
                        <Send className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-3 pt-2">
                  {localComments.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      עדיין אין תגובות לסרטון זה. היו הראשונים להגיב!
                    </div>
                  ) : (
                    localComments.map((comment) => {
                      const isLiked = !!likedCommentIds[comment.id];
                      return (
                        <div
                          key={comment.id}
                          className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-200">
                                {comment.authorName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                • {comment.publishedAt}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleLike(comment.id)}
                              className={clsx(
                                'flex items-center gap-1 text-[11px] transition-colors cursor-pointer',
                                isLiked ? 'text-red-500 font-bold' : 'text-slate-400 hover:text-red-400'
                              )}
                              title="אהבתי תגובה"
                            >
                              <ThumbsUp className={clsx('w-3 h-3', isLiked && 'fill-current')} />
                              <span>{comment.likesCount}</span>
                            </button>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed pr-8">
                            {comment.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
