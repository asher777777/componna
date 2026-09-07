import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Save } from 'lucide-react';
import { useTemplateItems } from '../hooks/useTemplateItems';

export const ItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useTemplateItems();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'completed'>('active');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      await addItem({ title, description, status });
      navigate('..');
    } catch (err: any) {
      alert('שגיאה בשמירה: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('..')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowRight className="w-4 h-4" />
        חזרה לרשימה
      </button>

      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
        <h2 className="text-xl font-bold text-white mb-5">יצירת פריט חדש</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">כותרת הפריט *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="הזן כותרת..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">תיאור ופרטים</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="הזן תיאור מפורט..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">סטטוס</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="active">פעיל</option>
              <option value="completed">הושלם</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => navigate('..')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-medium transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'שומר...' : 'שמור פריט'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
