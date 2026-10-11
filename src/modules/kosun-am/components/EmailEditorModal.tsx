/**
 * KOSUN AM (קושאן מייל אוטומטי) - Email Campaign & Visual Template Editor Modal
 * 12-Layer Scaffolding Layer 9: Modular Bento-compatible Visual Email Builder Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  Mail,
  Send,
  Eye,
  Layout,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { EmailCampaign } from '../types';
import { useKosunAmActions } from '../hooks/useKosunAmActions';
import { SmartTooltip } from '../../../components/Ui/SmartTooltip';

export interface EmailEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Partial<EmailCampaign>;
  onSave?: (campaign: Partial<EmailCampaign>) => void;
}

export const EmailEditorModal: React.FC<EmailEditorModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSave,
}) => {
  const { generateAiContent } = useKosunAmActions();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [fromName, setFromName] = useState('קושאן');
  const [fromEmail, setFromEmail] = useState('hello@kosun.pro');
  const [htmlContent, setHtmlContent] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'preview'>('details');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState('test@kosun.pro');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setSubject(campaign.subject || '');
      setPreheader(campaign.preheader || '');
      setFromName(campaign.fromName || 'קושאן');
      setFromEmail(campaign.fromEmail || 'hello@kosun.pro');
      setHtmlContent(campaign.htmlContent || '<div dir="rtl" style="font-family: Heebo, sans-serif;"><h1>שלום רב!</h1><p>תוכן הקמפיין החדש שלך מקושאן.</p></div>');
      setManualEmails(campaign.audience?.manualEmails?.join(', ') || 'test@kosun.pro');
    } else {
      setName('');
      setSubject('');
      setPreheader('');
      setFromName('קושאן');
      setFromEmail('hello@kosun.pro');
      setHtmlContent('<div dir="rtl" style="font-family: Heebo, sans-serif;"><h1>שלום רב!</h1><p>תוכן הקמפיין החדש שלך מקושאן.</p></div>');
      setManualEmails('test@kosun.pro');
    }
    setAiSuggestions([]);
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await generateAiContent(subject || name || 'קמפיין שיווקי חדש של קושאן');
      if (result.success && result.subjectSuggestions.length > 0) {
        setAiSuggestions(result.subjectSuggestions);
        if (result.bodyCopy && !htmlContent.includes(result.bodyCopy)) {
          setHtmlContent((prev) => `${prev}\n<p>${result.bodyCopy}</p>`);
        }
        if (result.preheader && !preheader) {
          setPreheader(result.preheader);
        }
      }
    } catch (err) {
      console.warn('[Kosun AM] AI generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailsList = manualEmails
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const updated: Partial<EmailCampaign> = {
      ...campaign,
      name: name || 'קמפיין חדש',
      subject: subject || 'הודעה מקושאן',
      preheader,
      fromName,
      fromEmail,
      htmlContent,
      audience: {
        type: 'manual',
        manualEmails: emailsList,
      },
      status: campaign?.status || 'draft',
    };

    onSave?.(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        dir="rtl"
        style={{ textAlign: 'right' }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-heebo"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {campaign?.id ? 'עריכת קמפיין עם קושאן' : 'קושאן מכין קמפיין חדש'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                השותף האישי שלך לניהול דיוורים ותבניות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Internal Top Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            פרטי הקמפיין
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'content'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            תוכן ותבנית
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            תצוגה מקדימה
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  שם הקמפיין הפנימי
                  <SmartTooltip text="שם זיהוי פנימי לניהול הקמפיין במערכת קושאן" />
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="לדוגמה: ניוזלטר השקת קיץ 2026"
                  className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                    שורת הנושא של האימייל
                    <SmartTooltip text="הכותרת הראשית שהנמען יראה בתיבת הדואר הנכנס" />
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAi}
                    disabled={isGeneratingAi}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGeneratingAi ? 'קוסאי מנסח כותרות...' : 'תן לקוסאי להציע כותרות A/B'}
                  </button>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="הזן נושא מושך ומניע לפעולה"
                  className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

                {aiSuggestions.length > 0 && (
                  <div className="mt-2 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-1.5">
                    <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300">
                      הצעות כותרת של סייען קוסאי (לחץ לבחירה):
                    </p>
                    {aiSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSubject(sug)}
                        className="w-full text-right p-1.5 text-xs rounded-xl hover:bg-white dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition line-clamp-1"
                      >
                        • {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  טקסט מקדים (Preheader)
                  <SmartTooltip text="תקציר קצר המוצג לצד שורת הנושא בתיבות הדואר" />
                </label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="משפט קצר שיעודד פתיחה מיידית"
                  className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    שם השולח
                  </label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    כתובת אימייל שולח
                  </label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  רשימת נמענים ידנית (מופרדים בפסיקים)
                  <SmartTooltip text="במצב הדגמה ופיתוח ניתן להזין כתובות אימייל ישירות" />
                </label>
                <input
                  type="text"
                  value={manualEmails}
                  onChange={(e) => setManualEmails(e.target.value)}
                  placeholder="demo@kosun.pro, user@example.com"
                  className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  קוד תוכן / תבנית HTML
                  <SmartTooltip text="תוכן האימייל שיישלח לנמענים. מותאם לתצוגת מובייל ודסקטופ" />
                </label>
                <span className="text-xs text-neutral-400">תומך בתגיות HTML בסיסיות</span>
              </div>
              <textarea
                rows={10}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-xs text-neutral-600 dark:text-neutral-300">
                <p>
                  <strong>מאת:</strong> {fromName} ({fromEmail})
                </p>
                <p>
                  <strong>נושא:</strong> {subject || '(ללא נושא)'}
                </p>
                {preheader && (
                  <p>
                    <strong>תקציר:</strong> {preheader}
                  </p>
                )}
              </div>
              <div
                className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-white dark:bg-neutral-950 min-h-[220px]"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              קושאן שומר את הקמפיין
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
