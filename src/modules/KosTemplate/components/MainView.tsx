import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Layers, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTemplateItems } from '../hooks/useTemplateItems';
import { useTemplateModule } from '../context/ModuleContext';

export const MainView: React.FC = () => {
  const navigate = useNavigate();
  const { collections, db } = useTemplateModule();
  const { items, loading, error, refresh, deleteItem } = useTemplateItems();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-white">מודול תבנית (Template Module)</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            אוסף נוכחי: <code className="text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded text-xs">{collections.items}</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            רענן
          </button>
          <button
            onClick={() => navigate('new')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            פריט חדש
          </button>
        </div>
      </div>

      {!db && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong>שים לב:</strong> פיירבייס טרם אותחל עבור מודול זה. יש להגדיר את קובץ ה-<code>.env</code> של המודול כדי לאפשר שמירת נתונים חיה.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
          שגיאה בטעינת נתונים: {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === tab
                ? 'bg-slate-800 text-indigo-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'all' && 'הכל'}
            {tab === 'active' && 'פעילים'}
            {tab === 'completed' && 'הושלמו'}
          </button>
        ))}
      </div>

      {/* Item List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">טוען נתונים...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-slate-400 text-base">אין פריטים להצגה כרגע.</p>
          <button
            onClick={() => navigate('new')}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium underline underline-offset-4"
          >
            לחץ כאן כדי להוסיף את הפריט הראשון
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.id)}
              className="group p-5 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 hover:border-indigo-500/50 transition cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition">
                  {item.title}
                </h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    item.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {item.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {item.status === 'completed' ? 'הושלם' : 'פעיל'}
                </span>
              </div>

              <p className="text-slate-300 text-sm line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs text-slate-400">
                <span>{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('האם למחוק פריט זה?')) deleteItem(item.id);
                  }}
                  className="text-rose-400 hover:text-rose-300 transition opacity-0 group-hover:opacity-100"
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
