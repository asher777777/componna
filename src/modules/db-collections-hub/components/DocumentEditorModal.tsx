import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Code,
  ListPlus,
  AlertCircle,
  CheckCircle2,
  Key,
  Database,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useDbContext } from '../context/DbContext';

export const DocumentEditorModal: React.FC = () => {
  const {
    editingDoc,
    setEditingDoc,
    handleCreateOrUpdateDoc,
    selectedCollectionId,
  } = useDbContext();

  const isNew = editingDoc === 'new';
  const [mode, setMode] = useState<'form' | 'json'>('json');
  const [docId, setDocId] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<Array<{ key: string; value: string; type: 'string' | 'number' | 'boolean' | 'json' }>>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!editingDoc) return;

    if (isNew) {
      setDocId('');
      const defaultData = {
        name: 'פריט חדש',
        description: 'תיאור הפריט',
        status: 'active',
        tags: ['חדש'],
      };
      setJsonText(JSON.stringify(defaultData, null, 2));
      setFormFields([
        { key: 'name', value: 'פריט חדש', type: 'string' },
        { key: 'description', value: 'תיאור הפריט', type: 'string' },
        { key: 'status', value: 'active', type: 'string' },
      ]);
    } else {
      setDocId(editingDoc.id);
      setJsonText(JSON.stringify(editingDoc.data, null, 2));
      
      const fields = Object.entries(editingDoc.data).map(([k, v]) => {
        let type: 'string' | 'number' | 'boolean' | 'json' = 'string';
        let valStr = String(v);
        if (typeof v === 'number') type = 'number';
        else if (typeof v === 'boolean') type = 'boolean';
        else if (typeof v === 'object' && v !== null) {
          type = 'json';
          valStr = JSON.stringify(v);
        }
        return { key: k, value: valStr, type };
      });
      setFormFields(fields);
    }
  }, [editingDoc, isNew]);

  if (!editingDoc) return null;

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      JSON.parse(text);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleSave = async () => {
    let finalData: Record<string, any> = {};

    if (mode === 'json') {
      try {
        finalData = JSON.parse(jsonText);
      } catch (e: any) {
        setJsonError(`JSON לא תקין: ${e.message}`);
        return;
      }
    } else {
      formFields.forEach((field) => {
        if (!field.key.trim()) return;
        if (field.type === 'number') {
          finalData[field.key.trim()] = Number(field.value) || 0;
        } else if (field.type === 'boolean') {
          finalData[field.key.trim()] = field.value === 'true';
        } else if (field.type === 'json') {
          try {
            finalData[field.key.trim()] = JSON.parse(field.value);
          } catch {
            finalData[field.key.trim()] = field.value;
          }
        } else {
          finalData[field.key.trim()] = field.value;
        }
      });
    }

    setSaving(true);
    try {
      await handleCreateOrUpdateDoc(finalData, docId.trim() || undefined);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingDoc(null);
      }, 700);
    } catch (err: any) {
      alert(`שגיאה בשמירת המסמך: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    setFormFields([...formFields, { key: '', value: '', type: 'string' }]);
  };

  const handleRemoveField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: string, value: string, type: any) => {
    const updated = [...formFields];
    updated[index] = { key, value, type };
    setFormFields(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              {isNew ? <Plus className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isNew ? 'יצירת מסמך חדש ב-Firestore' : 'עריכת מסמך קיים'}
                <span className="text-xs bg-slate-800 text-indigo-300 font-mono px-2 py-0.5 rounded-lg border border-slate-700">
                  {selectedCollectionId}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                שמירה ישירה של שדות ומטא-דאטה במסד הנתונים
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setMode('json')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                  mode === 'json'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => setMode('form')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                  mode === 'form'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>טופס שדות</span>
              </button>
            </div>

            <button
              onClick={() => setEditingDoc(null)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Document ID Input */}
          <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              מזהה מסמך (Document ID)
              {isNew && <span className="text-[10px] text-slate-500 font-normal">(השאר ריק ליצירת מזהה אוטומטי ייחודי)</span>}
            </label>
            <input
              type="text"
              value={docId}
              disabled={!isNew}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="e.g. campaign_sales_01 או השאר ריק"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none transition disabled:opacity-60"
            />
          </div>

          {/* JSON Mode */}
          {mode === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  תוכן המסמך (JSON Schema & Values)
                </span>
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>יישר ועצב JSON</span>
                </button>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 font-mono text-xs text-indigo-200 border border-slate-700/80 rounded-xl p-4 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none shadow-inner"
              />

              {jsonError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>
          )}

          {/* Form Mode */}
          {mode === 'form' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  שדות ומפתחות (Key-Value)
                </span>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="flex items-center gap-1 text-xs text-indigo-300 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 px-3 py-1 rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף שדה</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {formFields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleFieldChange(idx, e.target.value, field.value, field.type)}
                      placeholder="שם שדה (key)"
                      className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />

                    <select
                      value={field.type}
                      onChange={(e) => handleFieldChange(idx, field.key, field.value, e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="string">String (טקסט)</option>
                      <option value="number">Number (מספר)</option>
                      <option value="boolean">Boolean (בוליאני)</option>
                      <option value="json">Object/Array (JSON)</option>
                    </select>

                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleFieldChange(idx, field.key, e.target.value, field.type)}
                      placeholder="ערך השדה (value)"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition rounded-lg hover:bg-slate-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setEditingDoc(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            ביטול
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium animate-pulse flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                המסמך נשמר בהצלחה!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || Boolean(jsonError && mode === 'json')}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'שומר במסד...' : isNew ? 'צור מסמך ב-Firestore' : 'עדכן מסמך'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
