import React, { useState } from 'react';
import { VideoEngagementSectionConfig, VideoEngagementComment } from '../../types/sectionConfigs';
import {
  ThumbsUp,
  Share2,
  Tag,
  MessageSquare,
  Sliders,
  Plus,
  Trash2,
} from 'lucide-react';

export const VideoEngagementEditor: React.FC<{
  config: VideoEngagementSectionConfig;
  onChange: (updated: VideoEngagementSectionConfig) => void;
}> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'engagement' | 'social' | 'tags' | 'comments'>('engagement');
  const [newTagInput, setNewTagInput] = useState('');

  const update = (patch: Partial<VideoEngagementSectionConfig>) => {
    onChange({ ...config, ...patch });
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const current = config.tags || [];
    const clean = newTagInput.trim().replace(/^#/, '');
    if (!current.includes(clean)) {
      update({ tags: [...current, clean] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagIndex: number) => {
    const current = config.tags || [];
    update({ tags: current.filter((_, idx) => idx !== tagIndex) });
  };

  const handleDeleteComment = (commentId: string) => {
    const current = config.comments || [];
    update({ comments: current.filter((c) => c.id !== commentId) });
  };

  const handleAddComment = () => {
    const newComment: VideoEngagementComment = {
      id: `comm_${Date.now()}`,
      authorName: 'מגיב/ה חדש/ה',
      publishedAt: 'לפני יום',
      content: 'תודה רבה על הסרטון המרתק! למדתי המון.',
      likesCount: 5,
    };
    update({ comments: [newComment, ...(config.comments || [])] });
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700/60 pb-2 gap-1 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('engagement')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            activeTab === 'engagement'
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>לייקים וצפיות</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            activeTab === 'social'
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>שיתוף ברשתות</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            activeTab === 'tags'
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>תוויות ({config.tags?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>תגובות ({config.comments?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Engagement */}
      {activeTab === 'engagement' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-400" />
              <span>הגדרות לייקים וצפיות</span>
            </h4>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowLikes !== false}
                onChange={(e) => update({ allowLikes: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-0"
              />
              <span>אפשר כפתור לייק לסרטון</span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">כמות לייקים</label>
              <input
                type="number"
                value={config.likesCount ?? 0}
                onChange={(e) => update({ likesCount: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">כמות צפיות</label>
              <input
                type="number"
                value={Number(config.viewsCount ?? 0)}
                onChange={(e) => update({ viewsCount: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">טקסט תאריך פרסום (אופציונלי)</label>
              <input
                type="text"
                value={config.publishedDateText || ''}
                placeholder="למשל: פורסם לפני 3 ימים"
                onChange={(e) => update({ publishedDateText: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Social Sharing */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>הגדרות שיתוף חברתי</span>
            </h4>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableSocialShare !== false}
                onChange={(e) => update({ enableSocialShare: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-0"
              />
              <span>הצג כפתורי שיתוף ברשתות (WhatsApp, Facebook, LinkedIn, העתקת קישור)</span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">כותרת הסרטון בעת שיתוף</label>
              <input
                type="text"
                value={config.videoTitle || ''}
                placeholder="כותרת הסרטון"
                onChange={(e) => update({ videoTitle: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tags */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-sky-400" />
              <span>ניהול תוויות ונושאים</span>
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="הוסף תגית חדשה..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                הוסף
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {(config.tags || []).map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md text-xs"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Comments */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-400" />
              <span>הגדרות תגובות</span>
            </h4>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowComments !== false}
                onChange={(e) => update({ allowComments: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-0"
              />
              <span>הצג אזור תגובות לוידאו</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowUserComments !== false}
                onChange={(e) => update({ allowUserComments: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-0"
              />
              <span>אפשר לגולשים להוסיף תגובה ישירות באתר</span>
            </label>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">תגובות קיימות ({config.comments?.length || 0})</span>
              <button
                type="button"
                onClick={handleAddComment}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף תגובה</span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {(config.comments || []).map((c, idx) => (
                <div key={c.id || idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{c.authorName}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-slate-500 hover:text-red-400"
                      title="מחק תגובה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
