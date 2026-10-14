import React, { useState, useMemo } from 'react';
import { KosvidioSectionConfig, KosvidioComment } from '../../types/sectionConfigs';
import {
  Play,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Send,
  Eye,
  Calendar,
} from 'lucide-react';

export const KosvidioSection: React.FC<{ config: KosvidioSectionConfig }> = ({ config }) => {
  const {
    anchorId = 'kosvidio',
    youtubeVideoId,
    videoUrl,
    ambientGlow = true,
    showTheaterMode = true,
    channelName = 'קושאן דיגיטל',
    channelAvatarUrl,
    channelSubscribers,
    verifiedBadge = true,
    title = 'סרטון וידאו מעמיק',
    viewsCountText,
    publishedDateText,
    tags = ['וידאו', 'יוטיוב', 'SEO', 'AISEO'],
    shareTitle,
    enableSocialShare = true,
    comments = [],
    allowUserComments = true,
    shortDescription = 'תקציר תובנות המפתח מהסרטון בקצרה.',
    shortDescriptionBadge = 'תקציר מנהלים • AI',
    longDescriptionMarkdown = '',
    keyTakeaways = [],
    faqs = [],
    callToAction,
    backgroundColor = '#07090e',
  } = config;

  // Extract clean YouTube ID
  const effectiveVideoId = useMemo(() => {
    if (youtubeVideoId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeVideoId.trim())) {
      return youtubeVideoId.trim();
    }
    if (videoUrl) {
      const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (match) return match[1];
    }
    return youtubeVideoId || 'dQw4w9WgXcQ';
  }, [youtubeVideoId, videoUrl]);

  // Theater mode state
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  // Copy link state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Comments state (supports user adding live comments)
  const [localComments, setLocalComments] = useState<KosvidioComment[]>(comments);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [authorNameInput, setAuthorNameInput] = useState<string>('');
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});

  // Expanded FAQ accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Update local comments if config comments change
  React.useEffect(() => {
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

    const newComment: KosvidioComment = {
      id: `comm_${Date.now()}`,
      authorName: authorNameInput.trim() || 'אורח/ת באתר',
      authorAvatar: '',
      publishedAt: 'כרגע',
      content: newCommentText.trim(),
      likesCount: 1,
    };

    setLocalComments([newComment, ...localComments]);
    setNewCommentText('');
    setIsInputFocused(false);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`${title} - ${currentUrl}`);

  return (
    <section
      id={anchorId}
      className="relative w-full py-8 md:py-14 px-3 sm:px-6 lg:px-8 text-slate-100 overflow-hidden font-sans transition-all duration-300"
      style={{ backgroundColor: backgroundColor || '#07090e' }}
      dir="rtl"
    >
      {/* Schema.org VideoObject Script for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: title,
            description: shortDescription,
            thumbnailUrl: [`https://i.ytimg.com/vi/${effectiveVideoId}/hqdefault.jpg`],
            uploadDate: new Date().toISOString(),
            embedUrl: `https://www.youtube-nocookie.com/embed/${effectiveVideoId}`,
            keywords: tags.join(','),
          }),
        }}
      />

      <div
        className={`mx-auto transition-all duration-500 ${
          isTheaterMode ? 'max-w-7xl' : 'max-w-5xl'
        }`}
      >
        {/* ============================================================== */}
        {/* LAYER 1: בראש העמוד נגן חדשני (Innovative Video Player)        */}
        {/* ============================================================== */}
        <div className="relative group mb-6">
          {/* Ambient Lighting Glow Behind the Player */}
          {ambientGlow && (
            <div className="absolute -inset-3 sm:-inset-5 rounded-3xl bg-gradient-to-r from-red-600/25 via-indigo-600/20 to-purple-600/25 blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />
          )}

          {/* Futuristic Player Container */}
          <div className="relative z-10 bg-black/90 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-white/10">
            {/* Top Player Control / Ambient Bar */}
            <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-semibold text-slate-200">נגן וידאו אינטראקטיבי Kosvidio</span>
              </div>

              {showTheaterMode && (
                <button
                  type="button"
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all text-xs"
                  title={isTheaterMode ? 'מצב רגיל' : 'מצב קולנוע'}
                >
                  {isTheaterMode ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">מצב רגיל</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">מצב קולנוע</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 16:9 Responsive Video Frame */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${effectiveVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
                title={title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LAYER 2: תחתיו הכותרת (Title & Metadata)                       */}
        {/* ============================================================== */}
        <div className="mb-5 pb-5 border-b border-slate-800/60">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm mb-3">
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-400">
            {/* Channel Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden ring-2 ring-white/10">
                {channelAvatarUrl ? (
                  <img src={channelAvatarUrl} alt={channelName} className="w-full h-full object-cover" />
                ) : (
                  <span>{channelName.slice(0, 2)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <span>{channelName}</span>
                  {verifiedBadge && <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />}
                </div>
                {channelSubscribers && (
                  <div className="text-[11px] text-slate-400">{channelSubscribers} מנויים</div>
                )}
              </div>
            </div>

            {/* Video Stats */}
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              {viewsCountText && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  {viewsCountText}
                </span>
              )}
              {publishedDateText && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {publishedDateText}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LAYER 3: תחתיו תוויות בעיצוב עדין ואיקונים לשיתוף ברשתות       */}
        {/* ============================================================== */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
          {/* Delicate Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {tags && tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors shadow-sm"
              >
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>

          {/* Social Share Icons */}
          {enableSocialShare && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                שיתוף:
              </span>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all hover:scale-105"
                title="שיתוף בוואטסאפ"
              >
                <span className="text-xs font-bold px-1">WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all hover:scale-105"
                title="שיתוף בפייסבוק"
              >
                <span className="text-xs font-bold px-1">Facebook</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all hover:scale-105"
                title="שיתוף ב-LinkedIn"
              >
                <span className="text-xs font-bold px-1">LinkedIn</span>
              </a>

              {/* Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-medium"
                title="העתק קישור"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">הועתק!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>העתק קישור</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* LAYER 4: תחתיו אזור לתגובות מעוצב כמו ביוטיוב (YouTube Comments)*/}
        {/* ============================================================== */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-lg">
          {/* Comments Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" />
                <span>{localComments.length} תגובות</span>
              </h2>
            </div>
            <div className="text-xs text-slate-400">מסודר לפי: מובילות</div>
          </div>

          {/* Add Comment Input Form (YouTube Style) */}
          {allowUserComments && (
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 mt-0.5">
                  👤
                </div>

                <div className="flex-1">
                  {isInputFocused && (
                    <input
                      type="text"
                      placeholder="שמך (אופציונלי)"
                      value={authorNameInput}
                      onChange={(e) => setAuthorNameInput(e.target.value)}
                      className="w-full mb-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-all"
                    />
                  )}

                  <textarea
                    rows={isInputFocused ? 3 : 1}
                    placeholder="הוסף תגובה ציבורית..."
                    value={newCommentText}
                    onFocus={() => setIsInputFocused(true)}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/80 border-b-2 border-slate-700 focus:border-red-500 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none transition-all resize-none"
                  />

                  {isInputFocused && (
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsInputFocused(false);
                          setNewCommentText('');
                        }}
                        className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        ביטול
                      </button>
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-xs font-bold text-white transition-all shadow-md shadow-red-600/20"
                      >
                        <Send className="w-3 h-3" />
                        תגובה
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {localComments.map((comment) => {
              const isLiked = !!likedCommentIds[comment.id];
              return (
                <div key={comment.id} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                    {comment.authorAvatar ? (
                      <img src={comment.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.authorName.slice(0, 1)
                    )}
                  </div>

                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200 text-xs">
                        {comment.authorName}
                      </span>
                      <span className="text-[11px] text-slate-400">{comment.publishedAt}</span>
                    </div>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-1.5">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(comment.id)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors ${
                          isLiked ? 'text-red-400' : 'hover:text-slate-200'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-400' : ''}`} />
                        <span>{comment.likesCount}</span>
                      </button>

                      <button
                        type="button"
                        className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="לא אהבתי"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 font-semibold text-[11px] transition-colors"
                      >
                        השב
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* LAYER 5: תחתיו תיאור קצר (Short Description / Executive Summary)*/}
        {/* ============================================================== */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-950/30 via-slate-900/60 to-purple-950/30 border border-red-900/40 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {shortDescriptionBadge}
            </span>
          </div>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            {shortDescription}
          </p>
        </div>

        {/* ============================================================== */}
        {/* LAYER 6: ותחתיו תיאור ארוך לפי דרישות SEO ו-AISEO              */}
        {/* ============================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-md">
          {/* Key Takeaways Card */}
          {keyTakeaways && keyTakeaways.length > 0 && (
            <div className="mb-8 p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>נקודות מפתח מרכזיות מהוידאו</span>
              </h3>
              <ul className="space-y-2">
                {keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Long Description Article Content (Markdown formatted) */}
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
            {longDescriptionMarkdown ? (
              <div
                className="space-y-4"
                dangerouslySetInnerHTML={{
                  __html: formatSimpleMarkdown(longDescriptionMarkdown),
                }}
              />
            ) : (
              <p className="text-slate-400 text-sm">
                טוען מאמר עומק וניתוח SEO מקיף עבור סרטון זה...
              </p>
            )}
          </div>

          {/* FAQs Accordion */}
          {faqs && faqs.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-800/70">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <span>שאלות ותשובות נפוצות על הוידאו</span>
              </h3>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-800 rounded-xl overflow-hidden bg-slate-800/30 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full p-4 text-right flex items-center justify-between text-sm sm:text-base font-semibold text-slate-200 hover:text-white transition-colors"
                      >
                        <span>{faq.question}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Call To Action Box */}
          {callToAction && (
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-red-600/20 via-purple-600/20 to-indigo-600/20 border border-red-500/30 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-white mb-1">{callToAction.title}</h4>
                {callToAction.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-300">{callToAction.subtitle}</p>
                )}
              </div>

              <a
                href={callToAction.buttonLink || '#contact'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-red-600/25 shrink-0"
              >
                <span>{callToAction.buttonText || 'לפרטים נוספים'}</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Basic markdown parser converting headings, bold, bullet points to styled HTML
 */
function formatSimpleMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black text-white mt-8 mb-3 pb-2 border-b border-slate-800">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-slate-100 font-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="text-slate-200 italic">$1</em>')
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 mb-1">$1</li>')
    .replace(/<\/li>\n<li/gim, '</li><li')
    .split('\n\n')
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<li')) return trimmed;
      return `<p class="mb-4 text-slate-300 leading-relaxed text-sm sm:text-base">${trimmed}</p>`;
    })
    .join('');
}
