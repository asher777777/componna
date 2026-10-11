/**
 * KOSUN AM (קושאן מייל אוטומטי) - Main Dashboard View
 * 12-Layer Scaffolding Layer 9: Kosun 2026 Bento Grid, Top Nav, Collapsible Stats & Strict RTL
 */

import React, { useState } from 'react';
import {
  Mail,
  Send,
  Plus,
  Workflow,
  History,
  LayoutTemplate,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Users,
  Eye,
  MousePointerClick,
  CheckCircle2,
} from 'lucide-react';
import { useKosunAmData } from '../hooks/useKosunAmData';
import { useKosunAmActions } from '../hooks/useKosunAmActions';
import { CampaignListCard } from './CampaignListCard';
import { EmailEditorModal } from './EmailEditorModal';
import { AutomationBuilderView } from './AutomationBuilderView';
import { DeliveryLogsDrawer } from './DeliveryLogsDrawer';
import { EmailCampaign } from '../types';
import { SmartTooltip } from '../../../components/Ui/SmartTooltip';

export const KosunAmMainView: React.FC = () => {
  const { campaigns, templates, automations, metrics, isLoading } = useKosunAmData();
  const { createCampaign, updateCampaign, deleteCampaign, dispatchCampaign, refreshAll } =
    useKosunAmActions();

  // Internal Navigation (Top Nav Only - Rule 2 in cashwan-branding)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'automations'>(
    'campaigns'
  );

  // Collapsible Stats Accordion (Rule 7 in cashwan-branding: Hidden by default)
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Modals & Drawers
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<EmailCampaign> | undefined>(
    undefined
  );
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleOpenNewCampaign = () => {
    setEditingCampaign(undefined);
    setIsEditorOpen(true);
  };

  const handleEditCampaign = (cmp: EmailCampaign) => {
    setEditingCampaign(cmp);
    setIsEditorOpen(true);
  };

  const handleSaveCampaign = async (cmp: Partial<EmailCampaign>) => {
    if (cmp.id) {
      await updateCampaign(cmp.id, cmp);
      setStatusNotice('קושאן עדכן את הקמפיין בהצלחה');
    } else {
      await createCampaign(cmp);
      setStatusNotice('קושאן יצר את הקמפיין החדש בהצלחה');
    }
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleDispatch = async (id: string) => {
    try {
      setStatusNotice('קושאן משגר את הקמפיין עכשיו...');
      const result = await dispatchCampaign(id);
      if (result.success) {
        setStatusNotice(`קושאן השלים את השיגור בהצלחה (${result.dispatchedCount} נמענים)`);
      } else {
        setStatusNotice('קושאן נתקל בשגיאה בשיגור, בדוק את יומן הלוגים');
      }
    } catch {
      setStatusNotice('שגיאה במהלך שיגור הקמפיין');
    }
    setTimeout(() => setStatusNotice(null), 5000);
  };

  const handleDelete = async (id: string) => {
    await deleteCampaign(id);
    setStatusNotice('קושאן מחק את הקמפיין');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  return (
    <div
      dir="rtl"
      style={{ textAlign: 'right' }}
      className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-heebo p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Internal Navigation (Top Nav Only) */}
        <header className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white">
                  קושאן מייל אוטומטי - KOSUN AM
                </h1>
                <SmartTooltip text="מרכז דיוור חכם, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות של קושאן 2026" />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                קושאן לוקח אחריות: מנסח, מעצב, משגר ומסנכרן את הקמפיינים השיווקיים שלך
              </p>
            </div>
          </div>

          {/* Internal Top Nav Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'campaigns'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                קמפיינים ({campaigns.length})
              </button>
              <button
                onClick={() => setActiveTab('automations')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'automations'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                אוטומציות ({automations.length})
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'templates'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                תבניות ({templates.length})
              </button>
            </nav>

            <button
              onClick={() => setIsLogsOpen(true)}
              className="p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="יומן שיגור ומסירה"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={() => refreshAll()}
              className="p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="ריענון נתונים"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenNewCampaign}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              קושאן מכין קמפיין חדש
            </button>
          </div>
        </header>

        {/* Status Notification Toast */}
        {statusNotice && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Collapsible Stats Accordion (Rule 7: Hidden by default) */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-xs overflow-hidden transition-all">
          <button
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="w-full flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                קושאן מציג נתונים וביצועים
              </span>
              <SmartTooltip text="סטטיסטיקות שיגור, אחוזי פתיחה והקלקות על פי עקרונות הממשק הנקי של 2026" />
              <span className="text-xs text-neutral-400">
                ({isStatsOpen ? 'לחץ לצמצום' : 'לחץ לפתיחה'})
              </span>
            </div>
            <div className="p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {isStatsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isStatsOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 flex flex-col items-center text-center">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-xs text-neutral-500">נמענים ששוגרו</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
                  {metrics.totalSent}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 flex flex-col items-center text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-xs text-neutral-500">נמסרו בהצלחה</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
                  {metrics.totalDelivered}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 flex flex-col items-center text-center">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs text-neutral-500">שיעור פתיחה</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
                  {metrics.openRate}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 flex flex-col items-center text-center">
                <MousePointerClick className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                <span className="text-xs text-neutral-500">שיעור הקלקה</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
                  {metrics.clickRate}%
                </span>
              </div>
            </div>
          )}
        </section>

        {/* View Switching */}
        {activeTab === 'campaigns' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                קמפיינים שיווקיים וניוזלטרים
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                סך הכל: {campaigns.length} קמפיינים
              </span>
            </div>

            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {campaigns.map((cmp) => (
                  <CampaignListCard
                    key={cmp.id}
                    campaign={cmp}
                    onDispatch={handleDispatch}
                    onEdit={handleEditCampaign}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                <Mail className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  אין קמפיינים עדיין
                </p>
                <p className="text-xs text-neutral-400 mt-1 mb-4">
                  קושאן מוכן ליצור את הקמפיין השיווקי הראשון שלך
                </p>
                <button
                  onClick={handleOpenNewCampaign}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  יצירת קמפיין חדש
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'automations' && <AutomationBuilderView />}

        {activeTab === 'templates' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                ספריית תבניות מעוצבות (Bento Templates)
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {templates.length} תבניות זמינות
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {tpl.category}
                      </span>
                      {tpl.isDefault && (
                        <span className="text-[10px] text-neutral-400">ברירת מחדל</span>
                      )}
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-1">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                      {tpl.description || 'תבנית מעוצבת מוכנה לשימוש'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCampaign({
                        name: `קמפיין מבוסס ${tpl.name}`,
                        templateId: tpl.id,
                        htmlContent: tpl.htmlSnapshot,
                      });
                      setIsEditorOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                  >
                    השתמש בתבנית זו
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Editor Modal */}
      <EmailEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        campaign={editingCampaign}
        onSave={handleSaveCampaign}
      />

      {/* Delivery Logs Drawer */}
      <DeliveryLogsDrawer isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
    </div>
  );
};
