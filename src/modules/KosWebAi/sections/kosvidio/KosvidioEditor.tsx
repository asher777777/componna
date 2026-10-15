import React, { useState } from 'react';
import { KosvidioSectionConfig, KosvidioComment } from '../../types/sectionConfigs';
import {
  Video,
  Type,
  Tag,
  MessageSquare,
  FileText,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const KosvidioEditor: React.FC<{
  config: KosvidioSectionConfig;
  onChange: (updated: KosvidioSectionConfig) => void;
}> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'content' | 'tags' | 'comments' | 'cta'>('video');
  const [newTagInput, setNewTagInput] = useState('');

  const update = (patch: Partial<KosvidioSectionConfig>) => {
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
    const newComment: KosvidioComment = {
      id: `comm_${Date.now()}`,
      authorName: 'מגיב/ה חדש/ה',
      publishedAt: 'לפני יום',
      content: 'תודה רבה על הסרטון המרתק! למדתי המון.',
      likesCount: 5,
    };
    update({ comments: [newComment, ...(config.comments || [])] });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Editor Tab Navigation */}
      <div className="flex border-b border-slate-800 pb-2 gap-1 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'video'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>וידאו ונגן</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'content'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>תיאור ו-SEO</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'tags'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>תוויות ושיתוף</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'comments'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>תגובות יוטיוב</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cta')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'cta'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>הנעה לפעולה</span>
        </button>
      </div>

      {/* Tab: Video */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              מזהה סרטון יוטיוב (YouTube Video ID או קישור)
            </label>
            <input
              type="text"
              value={config.youtubeVideoId || ''}
              onChange={(e) => update({ youtubeVideoId: e.target.value })}
              placeholder="e.g. dQw4w9WgXcQ או קישור מלא"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">כותרת הוידאו (H1)</label>
            <input
              type="text"
              value={config.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">שם הערוץ</label>
              <input
                type="text"
                value={config.channelName || ''}
                onChange={(e) => update({ channelName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">כמות מנויים (טקסט)</label>
              <input
                type="text"
                value={config.channelSubscribers || ''}
                onChange={(e) => update({ channelSubscribers: e.target.value })}
                placeholder="למשל: 12.4K מנויים"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">כמות צפיות (Views Count)</label>
              <input
                type="text"
                value={config.viewsCount || config.viewsCountText || ''}
                onChange={(e) => update({ viewsCount: e.target.value, viewsCountText: e.target.value })}
                placeholder="למשל: 18,450 או 18.5K"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">סימוני לייק (Likes Count)</label>
              <input
                type="number"
                value={config.likesCount ?? 1240}
                onChange={(e) => update({ likesCount: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.ambientGlow !== false}
                onChange={(e) => update({ ambientGlow: e.target.checked })}
                className="rounded border-slate-700 text-red-600 focus:ring-0"
              />
              <span>תאורת אווירה חדשנית מסביב לנגן (Ambient Lighting Glow)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showTheaterMode !== false}
                onChange={(e) => update({ showTheaterMode: e.target.checked })}
                className="rounded border-slate-700 text-red-600 focus:ring-0"
              />
              <span>אפשר כפתור מעבר למצב קולנוע (Theater Mode)</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab: Content */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              על הסרטון בכמה מילים (תיאור קצר)
            </label>
            <textarea
              rows={3}
              value={config.shortDescription || ''}
              onChange={(e) => update({ shortDescription: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              תיאור ארוך ומאמר SEO מקיף (תומך בכותרות ## ו-### ורשימות)
            </label>
            <textarea
              rows={10}
              value={config.longDescriptionMarkdown || ''}
              onChange={(e) => update({ longDescriptionMarkdown: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      )}

      {/* Tab: Tags */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              תוויות עדינות (Tags)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="הוסף תגית חדשה..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                הוסף
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(config.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableSocialShare !== false}
                onChange={(e) => update({ enableSocialShare: e.target.checked })}
                className="rounded border-slate-700 text-red-600 focus:ring-0"
              />
              <span>הצג איקונים וכפתורי שיתוף ברשתות חברתיות</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab: Comments */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              תגובות מעוצבות בסגנון יוטיוב
            </label>
            <button
              type="button"
              onClick={handleAddComment}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוסף תגובה לדוגמה</span>
            </button>
          </div>

          <div className="space-y-3">
            {(config.comments || []).map((comment, idx) => (
              <div
                key={comment.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={comment.authorName}
                    onChange={(e) => {
                      const updatedComments = [...(config.comments || [])];
                      updatedComments[idx] = { ...comment, authorName: e.target.value };
                      update({ comments: updatedComments });
                    }}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={comment.content}
                  onChange={(e) => {
                    const updatedComments = [...(config.comments || [])];
                    updatedComments[idx] = { ...comment, content: e.target.value };
                    update({ comments: updatedComments });
                  }}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: CTA */}
      {activeTab === 'cta' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">כותרת ההנעה לפעולה</label>
            <input
              type="text"
              value={config.callToAction?.title || ''}
              onChange={(e) =>
                update({
                  callToAction: {
                    title: e.target.value,
                    subtitle: config.callToAction?.subtitle || '',
                    buttonText: config.callToAction?.buttonText || 'לפרטים נוספים',
                    buttonLink: config.callToAction?.buttonLink || '#contact',
                  },
                })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">תת-כותרת</label>
            <input
              type="text"
              value={config.callToAction?.subtitle || ''}
              onChange={(e) =>
                update({
                  callToAction: {
                    title: config.callToAction?.title || '',
                    subtitle: e.target.value,
                    buttonText: config.callToAction?.buttonText || 'לפרטים נוספים',
                    buttonLink: config.callToAction?.buttonLink || '#contact',
                  },
                })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">טקסט הכפתור</label>
              <input
                type="text"
                value={config.callToAction?.buttonText || ''}
                onChange={(e) =>
                  update({
                    callToAction: {
                      title: config.callToAction?.title || '',
                      subtitle: config.callToAction?.subtitle || '',
                      buttonText: e.target.value,
                      buttonLink: config.callToAction?.buttonLink || '#contact',
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">קישור הכפתור</label>
              <input
                type="text"
                value={config.callToAction?.buttonLink || ''}
                onChange={(e) =>
                  update({
                    callToAction: {
                      title: config.callToAction?.title || '',
                      subtitle: config.callToAction?.subtitle || '',
                      buttonText: config.callToAction?.buttonText || '',
                      buttonLink: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
