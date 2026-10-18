import React, { useState } from 'react';
import { clsx } from 'clsx';
import { VideoEngagementSectionConfig, VideoEngagementComment } from '../../types/sectionConfigs';
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
} from 'lucide-react';

export const VideoEngagementSection: React.FC<{ config: VideoEngagementSectionConfig }> = ({ config }) => {
  const {
    anchorId = 'engagement',
    title = 'אינטראקציה, שיתוף ותגובות',
    videoTitle = 'הסרטון',
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
    accentColor = '#ef4444',
  } = config;

  // Video likes state (authentic: defaults to likesCount)
  const [videoLikes, setVideoLikes] = useState<number>(() => {
    if (typeof likesCount === 'number') return likesCount;
    return 0;
  });
  const [isVideoLiked, setIsVideoLiked] = useState<boolean>(false);

  const formatStatNumber = (num?: number | string) => {
    if (!num) return '0';
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('he-IL');
  };

  // Copy link state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Tags & Comments collapse states
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState<boolean>(false);

  // Comments state (supports user adding live comments)
  const [localComments, setLocalComments] = useState<VideoEngagementComment[]>(comments);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [authorNameInput, setAuthorNameInput] = useState<string>('');
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});

  // Sync with prop changes
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
    setIsInputFocused(false);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`${videoTitle || title} - ${currentUrl}`);

  return (
    <section
      id={anchorId}
      className={clsx(
        "relative w-full py-6 md:py-8 px-3 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300",
        (!backgroundColor || backgroundColor === '#07090e' || backgroundColor === 'transparent') && "bg-slate-50 dark:bg-[#07090e]"
      )}
      style={{ backgroundColor: (backgroundColor && backgroundColor !== '#07090e' && backgroundColor !== 'transparent') ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Layer 1: Engagement & Actions Bar (Likes, Views, Comments Anchor, Share) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
          {/* Left stats: Views & Likes */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
            {/* Views Counter (Truthful only) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-xs">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>{viewsCount ? formatStatNumber(viewsCount) : '0'} צפיות</span>
            </div>

            {/* Like / Dislike Combined Action Pill */}
            {allowLikes && (
              <div className="flex items-center rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoLiked(!isVideoLiked);
                    setVideoLikes((prev) => (isVideoLiked ? prev - 1 : prev + 1));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    isVideoLiked
                      ? 'text-red-500 bg-red-500/10'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="סימון לייק לסרטון"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isVideoLiked ? 'fill-red-500 text-red-500' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{formatStatNumber(videoLikes)}</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />
                <button
                  type="button"
                  className="px-2.5 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="לא אהבתי"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Comments Quick Counter */}
            {allowComments && (
              <button
                type="button"
                onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors shadow-xs cursor-pointer"
                title="הצגת אזור התגובות"
              >
                <MessageSquare className="w-4 h-4 text-red-500" />
                <span>{localComments.length} תגובות</span>
              </button>
            )}

            {publishedDateText && (
              <div className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs px-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{publishedDateText}</span>
              </div>
            )}
          </div>

          {/* Right actions: Social Sharing & Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tags Toggle */}
            {tags && tags.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
                title={isTagsExpanded ? 'קפל תוויות' : 'הצג תוויות'}
              >
                <span className="text-red-500 font-mono">#</span>
                <span>תוויות ({tags.length})</span>
                {isTagsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Social Share Icons */}
            {enableSocialShare && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1 hidden sm:inline-flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" />
                  שיתוף:
                </span>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all text-xs font-bold"
                  title="שיתוף בוואטסאפ"
                >
                  WhatsApp
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all text-xs font-bold"
                  title="שיתוף בפייסבוק"
                >
                  Facebook
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-all text-xs font-bold"
                  title="שיתוף ב-LinkedIn"
                >
                  LinkedIn
                </a>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all text-xs font-medium cursor-pointer"
                  title="העתק קישור"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">הועתק</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>העתק</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Tags Area */}
        {isTagsExpanded && tags && tags.length > 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors shadow-xs"
              >
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        {/* Layer 2: YouTube-style Comments Area */}
        {allowComments && (
          <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-lg overflow-hidden transition-all">
            {/* Comments Header Bar */}
            <button
              type="button"
              onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{localComments.length} תגובות לוידאו</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                    {isCommentsExpanded ? 'לחץ לקיפול התגובות' : 'לחץ להצגת התגובות וכתיבת תגובה חדשה'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                <span>{isCommentsExpanded ? 'קפל תגובות' : 'הצג תגובות'}</span>
                {isCommentsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Collapsible Comments Feed */}
            {isCommentsExpanded && (
              <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-6 animate-in fade-in duration-200">
                {/* Add Comment Input Form */}
                {allowUserComments && (
                  <form onSubmit={handleAddComment} className="mt-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                        
                      </div>

                      <div className="flex-1">
                        {isInputFocused && (
                          <input
                            type="text"
                            placeholder="שמך (אופציונלי)"
                            value={authorNameInput}
                            onChange={(e) => setAuthorNameInput(e.target.value)}
                            className="w-full mb-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-all"
                          />
                        )}

                        <textarea
                          rows={isInputFocused ? 3 : 1}
                          placeholder="הוסף תגובה פומבית על הוידאו..."
                          value={newCommentText}
                          onFocus={() => setIsInputFocused(true)}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all resize-none"
                        />

                        {isInputFocused && (
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsInputFocused(false);
                                setNewCommentText('');
                              }}
                              className="px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              ביטול
                            </button>
                            <button
                              type="submit"
                              disabled={!newCommentText.trim()}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-xs font-bold text-white transition-all shadow-md shadow-red-600/20"
                            >
                              <Send className="w-3 h-3" />
                              <span>פרסם תגובה</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                {localComments.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                    <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">עדיין אין תגובות בסרטון זה.</p>
                    <p className="text-slate-500 text-xs mt-1">היו הראשונים להגיב ולשתף את דעתכם!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localComments.map((comment) => {
                      const isLiked = !!likedCommentIds[comment.id];
                      return (
                        <div key={comment.id} className="flex items-start gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white shrink-0 shadow-xs">
                            {comment.authorAvatar ? (
                              <img src={comment.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              comment.authorName.slice(0, 1)
                            )}
                          </div>

                          <div className="flex-1 text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs">
                                {comment.authorName}
                              </span>
                              <span className="text-[11px] text-slate-400">{comment.publishedAt}</span>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-1.5">
                              {comment.content}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <button
                                type="button"
                                onClick={() => handleToggleLike(comment.id)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                  isLiked ? 'text-red-500 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                              >
                                <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                                <span>{comment.likesCount}</span>
                              </button>

                              <button
                                type="button"
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title="לא אהבתי"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
