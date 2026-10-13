import React, { useState } from 'react';
import { LivePostsGridSectionConfig, LivePostItem } from '../../types/sectionConfigs';
import { PageBuilderInput, PageBuilderTextarea } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderAccordion } from '../../ui/PageBuilderAccordion';
import { PageBuilderButton } from '../../ui/PageBuilderButton';
import { Plus, Trash2, Edit2, Calendar, Sliders } from 'lucide-react';

interface LivePostsGridEditorProps {
  config: LivePostsGridSectionConfig;
  onChange: (updated: LivePostsGridSectionConfig) => void;
}

export const LivePostsGridEditor: React.FC<LivePostsGridEditorProps> = ({ config, onChange }) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const update = <K extends keyof LivePostsGridSectionConfig>(field: K, value: LivePostsGridSectionConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const handleAddPost = () => {
    const newPost: LivePostItem = {
      id: Date.now().toString(),
      title: 'פוסט או עדכון חדש',
      excerpt: 'תקציר הידיעה או העדכון...',
      date: 'היום',
      tag: 'חדשות',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      linkUrl: '#',
    };
    const updated = [...(config.customPages || []), newPost];
    update('customPages', updated);
    setEditingPostId(newPost.id);
  };

  const handleUpdatePost = (id: string, updates: Partial<LivePostItem>) => {
    const updated = (config.customPages || []).map((p) => (p.id === id ? { ...p, ...updates } : p));
    update('customPages', updated);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('האם למחוק פוסט זה?')) {
      update('customPages', (config.customPages || []).filter((p) => p.id !== id));
      if (editingPostId === id) setEditingPostId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-right" dir="rtl">
      <PageBuilderAccordion title="כותרות אזור עדכונים ואירועים" icon={<Calendar className="w-4 h-4 text-indigo-400" />} defaultOpen={true}>
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="למשל: עדכונים ואירועים אחרונים"
        />
        <PageBuilderTextarea
          label="תיאור האזור"
          value={config.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
        />
      </PageBuilderAccordion>

      <PageBuilderAccordion
        title={`ניהול פוסטים ועדכונים (${(config.customPages || []).length})`}
        icon={<Plus className="w-4 h-4 text-emerald-400" />}
        defaultOpen={true}
        actionNode={
          <PageBuilderButton size="xs" variant="primary" onClick={handleAddPost} icon={<Plus className="w-3.5 h-3.5" />}>
            הוסף פוסט
          </PageBuilderButton>
        }
      >
        <div className="flex flex-col gap-3">
          {(config.customPages || []).map((post, idx) => {
            const isEditing = editingPostId === post.id;
            return (
              <div key={post.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span className="text-sm font-bold text-white">{post.title || 'ללא כותרת'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingPostId(isEditing ? null : post.id)}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex flex-col gap-3 animate-in fade-in">
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
                        placeholder="למשל: 15 באוגוסט 2026"
                      />
                      <PageBuilderInput
                        label="תגית (Tag)"
                        value={post.tag || ''}
                        onChange={(e) => handleUpdatePost(post.id, { tag: e.target.value })}
                        placeholder="למשל: אירועים / חדשות"
                      />
                    </div>
                    <PageBuilderImageUpload
                      label="תמונה ראשית לפוסט"
                      value={post.imageUrl}
                      onChange={(url) => handleUpdatePost(post.id, { imageUrl: url })}
                    />
                    <PageBuilderInput
                      label="קישור לכתבה מלאה"
                      value={post.linkUrl || ''}
                      onChange={(e) => handleUpdatePost(post.id, { linkUrl: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageBuilderAccordion>

      <PageBuilderAccordion title="עיצוב ועוגן" icon={<Sliders className="w-4 h-4 text-pink-400" />}>
        <PageBuilderColorPicker
          label="צבע רקע"
          value={config.backgroundColor || 'transparent'}
          onChange={(c) => update('backgroundColor', c)}
        />
        <PageBuilderInput
          label="מזהה עוגן"
          value={config.anchorId || 'livePosts'}
          onChange={(e) => update('anchorId', e.target.value)}
          placeholder="livePosts"
          dir="ltr"
        />
      </PageBuilderAccordion>
    </div>
  );
};
