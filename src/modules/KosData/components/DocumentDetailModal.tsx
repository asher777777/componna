import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Key,
  FileCode,
  Layers,
} from 'lucide-react';
import { useDbContext } from '../context/DbContext';

export const DocumentDetailModal: React.FC = () => {
  const {
    inspectingDoc,
    setInspectingDoc,
    setEditingDoc,
    handleDeleteDoc,
    selectedCollectionId,
  } = useDbContext();

  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!inspectingDoc) return null;

  const jsonString = JSON.stringify(inspectingDoc.data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את המסמך "${inspectingDoc.id}" לצמיתות ממסד הנתונים?`)) {
      setDeleting(true);
      try {
        await handleDeleteDoc(inspectingDoc.id);
        setInspectingDoc(null);
      } catch (err: any) {
        alert(`שגיאה במחיקת המסמך: ${err?.message || err}`);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleStartEdit = () => {
    const docToEdit = inspectingDoc;
    setInspectingDoc(null);
    setEditingDoc(docToEdit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">פרטי מסמך Firestore</h2>
                <span className="text-xs bg-slate-800 text-indigo-300 font-mono px-2 py-0.5 rounded-lg border border-slate-700">
                  {selectedCollectionId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <Key className="w-3 h-3 text-amber-400" />
                ID: <span className="text-slate-200">{inspectingDoc.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
              title="העתק תוכן JSON ללוח"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'הועתק!' : 'העתק JSON'}</span>
            </button>
            <button
              onClick={() => setInspectingDoc(null)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timestamps Meta */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          {inspectingDoc.createdAtFormatted && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" />
              נוצר: <span className="text-slate-200 font-medium">{inspectingDoc.createdAtFormatted}</span>
            </span>
          )}
          {inspectingDoc.updatedAtFormatted && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              עודכן: <span className="text-slate-200 font-medium">{inspectingDoc.updatedAtFormatted}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-teal-400" />
            שדות: <span className="text-slate-200 font-medium font-mono">{Object.keys(inspectingDoc.data).length}</span>
          </span>
        </div>

        {/* JSON Code View */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/90 font-mono text-xs text-slate-200 leading-relaxed select-text">
          <pre className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl overflow-x-auto text-indigo-200">
            {jsonString}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'מוחק...' : 'מחק מסמך'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setInspectingDoc(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              סגור
            </button>
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition"
            >
              <Edit className="w-4 h-4" />
              <span>ערוך מסמך</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
