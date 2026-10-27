import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { useTemplateModule } from '../context/ModuleContext';
import { TemplateFirestoreService } from '../services/firestoreService';
import { TemplateItem } from '../types';
import { callTemplateAIFunction } from '../api/functionsApi';

export const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db, collections, functionsBaseUrl } = useTemplateModule();
  const [item, setItem] = useState<TemplateItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!db || !id) {
      setLoading(false);
      return;
    }
    const service = new TemplateFirestoreService(db, collections.items);
    service.getItemById(id).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [db, id, collections.items]);

  const handleAIAnalyze = async () => {
    if (!item || !id || !db) return;
    try {
      setAiLoading(true);
      const res = await callTemplateAIFunction(functionsBaseUrl, {
        itemId: id,
        content: `${item.title}: ${item.description}`,
        promptType: 'summarize',
      });

      if (res.success && res.result) {
        const service = new TemplateFirestoreService(db, collections.items);
        await service.updateItem(id, { aiSummary: res.result });
        setItem((prev) => (prev ? { ...prev, aiSummary: res.result } : null));
      } else {
        alert(res.error || 'קריאת ה-AI החזירה תוצאה ריקה');
      }
    } catch (err: any) {
      alert('שגיאה בקריאת AI: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">טוען פרטי פריט...</div>;
  if (!item) return <div className="p-12 text-center text-slate-400">הפריט לא נמצא.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('..')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowRight className="w-4 h-4" />
        חזרה לרשימה
      </button>

      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{item.title}</h1>
            <p className="text-slate-400 text-xs">מזהה: {item.id}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              item.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {item.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {item.status === 'completed' ? 'הושלם' : 'פעיל'}
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">תיאור</h3>
          <p className="text-slate-200 text-sm whitespace-pre-wrap">{item.description || 'אין תיאור לפריט זה.'}</p>
        </div>

        {/* AI Analysis Block */}
        <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              ניתוח ותובנות AI
            </div>
            <button
              onClick={handleAIAnalyze}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              {aiLoading ? 'מעבד...' : 'הפעל ניתוח AI'}
            </button>
          </div>

          {item.aiSummary ? (
            <div className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
              {item.aiSummary}
            </div>
          ) : (
            <p className="text-xs text-slate-400">לחץ על הכפתור כדי להפיק ניתוח חכם ותקציר לפריט זה.</p>
          )}
        </div>
      </div>
    </div>
  );
};
