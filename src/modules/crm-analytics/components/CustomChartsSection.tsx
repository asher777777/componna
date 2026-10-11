import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Plus, Sparkles, RefreshCw, AlertCircle, 
  CheckCircle2, X, ChevronDown, Layers, PieChart, LineChart
} from 'lucide-react';
import { FirebaseApp } from 'firebase/app';
import { CustomCrmChart, Contact } from '../types';
import { 
  fetchCustomCharts, saveCustomChart, deleteCustomChart, generateChartWithGeminiAI 
} from '../services/customChartsService';
import { CustomChartCard } from './CustomChartCard';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { eventBus } from '../../../core/bridge/EventBus';

interface Props {
  contacts: Contact[];
  firebaseApp?: FirebaseApp;
  tenantId?: string;
}

export const CustomChartsSection: React.FC<Props> = ({
  contacts,
  firebaseApp,
  tenantId = '_master',
}) => {
  const { apiKeys } = useSystemConnection();
  const effectiveApiKey = 
    (apiKeys?.googleAiApiKey || '').trim() ||
    getModuleGeminiKey('crm-analytics') ||
    getModuleGeminiKey() ||
    ((import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();

  const [charts, setCharts] = useState<CustomCrmChart[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(false);

  // Manual modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'bar' | 'pie' | 'line' | 'area'>('bar');
  const [newGroupBy, setNewGroupBy] = useState('tags');
  const [newMetric, setNewMetric] = useState<'count' | 'sum'>('count');

  // AI Prompt Bar
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadCharts = async () => {
    setLoadingCharts(true);
    try {
      const data = await fetchCustomCharts(firebaseApp, tenantId);
      setCharts(data);
    } finally {
      setLoadingCharts(false);
    }
  };

  useEffect(() => {
    loadCharts();
  }, [firebaseApp, tenantId]);

  // Listen to Kosun AI external actions (EventBus)
  useEffect(() => {
    const unsub = eventBus.subscribe('kosai:action', async (payload: any) => {
      if (payload?.action === 'CREATE_CRM_CHART' && payload?.payload) {
        const item = payload.payload;
        const newChart: CustomCrmChart = {
          id: `chart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title: item.title || 'גרף מותאם מ-Kosun AI',
          type: item.type || 'bar',
          groupByField: item.groupByField || 'tags',
          metric: item.metric || 'count',
          metricField: item.metricField,
          description: item.description,
          createdAt: new Date().toISOString(),
          createdBy: 'ai',
        };
        await saveCustomChart(newChart, firebaseApp, tenantId);
        await loadCharts();
        setFeedback({
          type: 'success',
          message: `סוכן Kosun AI יצר בהצלחה את הגרף "${newChart.title}"!`,
        });
      }
    });

    return () => unsub();
  }, [firebaseApp, tenantId]);

  const handleGenerateAiChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAi(true);
    setFeedback(null);
    try {
      const generated = await generateChartWithGeminiAI(aiPrompt.trim(), effectiveApiKey);
      const newChart: CustomCrmChart = {
        ...generated,
        id: `chart_ai_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await saveCustomChart(newChart, firebaseApp, tenantId);
      await loadCharts();
      setAiPrompt('');
      setFeedback({
        type: 'success',
        message: `גרף ה-AI "${newChart.title}" נוצר ונשמר בהצלחה בבסיס הנתונים!`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'שגיאה בייצור גרף באמצעות AI',
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveManualChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newChart: CustomCrmChart = {
      id: `chart_manual_${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      groupByField: newGroupBy,
      metric: newMetric,
      metricField: newMetric === 'sum' ? 'total_spent' : undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'manual',
    };

    await saveCustomChart(newChart, firebaseApp, tenantId);
    await loadCharts();
    setIsManualModalOpen(false);
    setNewTitle('');
    setFeedback({
      type: 'success',
      message: `הגרף "${newChart.title}" נשמר בהצלחה בבסיס הנתונים!`,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק גרף זה?')) return;
    await deleteCustomChart(id, firebaseApp, tenantId);
    await loadCharts();
  };

  return (
    <div className="space-y-4">
      {/* Header and Creation Bar */}
      <div className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-950/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              גרפים ודוחות מותאמים אישית (Custom AI Charts)
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            צור גרפים חופשיים ידנית או בעזרת סוכן AI (Gemini) – הנתונים נשמרים ישירות ב-Firestore
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Create Manual Button */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף גרף ידני</span>
          </button>
        </div>
      </div>

      {/* AI Prompt Input Bar */}
      <form 
        onSubmit={handleGenerateAiChart}
        className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2 shadow-xs"
      >
        <div className="flex items-center gap-2 pr-2 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-bold">סוכן AI:</span>
        </div>

        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="תאר איזה גרף תרצה לייצר, למשל: 'פילוח לקוחות לפי ערים', או 'עוגת הכנסות לפי מקור הגעה'..."
          className="flex-1 w-full px-3.5 py-2 text-xs bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={isGeneratingAi || !aiPrompt.trim()}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
          <span>{isGeneratingAi ? 'מייצר גרף...' : 'יצירה באמצעות AI'}</span>
        </button>
      </form>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-xs animate-fadeIn ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Grid of Saved Custom Charts */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {charts.map(chart => (
            <CustomChartCard
              key={chart.id}
              chart={chart}
              contacts={contacts}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Manual Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>הגדרת גרף חדש</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualChart} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  כותרת הגרף *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="למשל: התפלגות אנשי קשר לפי ערים"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    סוג הגרף
                  </label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white"
                  >
                    <option value="bar">עמודות (Bar)</option>
                    <option value="pie">עוגה (Pie)</option>
                    <option value="line">קו (Line)</option>
                    <option value="area">שטח (Area)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    סוג המדד
                  </label>
                  <select
                    value={newMetric}
                    onChange={(e: any) => setNewMetric(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white"
                  >
                    <option value="count">כמות רשומות</option>
                    <option value="sum">סכום רכישות מצטבר (₪)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  פילוח לפי שדה (Group By)
                </label>
                <select
                  value={newGroupBy}
                  onChange={(e) => setNewGroupBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white"
                >
                  <option value="tags">תגיות (Tags)</option>
                  <option value="community">קהילה / קבוצה (Community)</option>
                  <option value="lead_source">מקור הגעה (Lead Source)</option>
                  <option value="city">עיר מגורים (City)</option>
                  <option value="status">סטטוס (Status)</option>
                  <option value="contact_type">סוג רשומה (איש קשר / ליד)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  שמור גרף
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
