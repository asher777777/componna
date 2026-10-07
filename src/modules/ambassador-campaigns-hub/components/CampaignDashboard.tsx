/**
 * CampaignDashboard: Master Hub View for Crowdfunding & Ambassador Campaigns
 * Provides campaign switcher, campaign creation, HomeEditor Studio design launcher,
 * ambassadors management, and live donation ledger.
 */

import React, { useState } from 'react';
import {
  Trophy,
  Users,
  Target,
  Heart,
  Settings,
  Sparkles,
  BarChart3,
  FileText,
  Plus,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Sliders,
  FolderPlus,
  Layers,
} from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { CampaignHeaderWidget } from './CampaignHeaderWidget';
import { CampaignTiersWidget } from './CampaignTiersWidget';
import { CampaignDonorsWidget } from './CampaignDonorsWidget';
import { AmbassadorsManagementTable } from './AmbassadorsManagementTable';
import { AmbassadorModal } from './AmbassadorModal';
import { DonationDrawer } from './DonationDrawer';
import { LiveDonationAlert } from './LiveDonationAlert';
import { AmbassadorPublicPageView } from './AmbassadorPublicPageView';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CampaignStudioEditor } from './CampaignStudioEditor';
import { Ambassador } from '../types';

export const CampaignDashboard: React.FC = () => {
  const {
    campaign,
    campaignsList,
    activeCampaignId,
    setActiveCampaignId,
    ambassadors,
    donations,
    loading,
    refreshData,
    isAmbassadorModalOpen,
    setIsAmbassadorModalOpen,
    isDonationDrawerOpen,
    setIsDonationDrawerOpen,
    isCreateCampaignOpen,
    setIsCreateCampaignOpen,
    isStudioEditorOpen,
    setIsStudioEditorOpen,
    selectedTierForDonation,
    updateCampaignSettings,
  } = useCampaignModule();

  const [activeTab, setActiveTab] = useState<'overview' | 'ambassadors' | 'donations' | 'settings'>('overview');
  const [inspectedAmbassador, setInspectedAmbassador] = useState<Ambassador | null>(null);

  // If user selected to inspect an ambassador's public view
  if (inspectedAmbassador) {
    return (
      <AmbassadorPublicPageView
        ambassador={inspectedAmbassador}
        onBack={() => setInspectedAmbassador(null)}
      />
    );
  }

  const completedDonations = donations.filter((d) => d.paymentStatus === 'completed');
  const pendingDonations = donations.filter((d) => d.paymentStatus === 'pending');

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20 dir-rtl">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-10 py-5 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                  מרכז קמפיינים ושגרירים
                </h1>
                {/* Active Campaign Selector */}
                {campaignsList.length > 1 && (
                  <select
                    value={activeCampaignId}
                    onChange={(e) => setActiveCampaignId(e.target.value)}
                    className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    {campaignsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  פעיל
                </span>
                {campaign?.testMode && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    מצב בדיקה (Sandbox)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                גיוס המונים, עמודי שגרירים, לוח יעדים, עיצוב HomeEditor וסנכרון מדיה ו-CRM
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="רענן נתונים"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Open Studio / HomeEditor Design */}
            <button
              onClick={() => setIsStudioEditorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
              title="ערוך ועצב את הקמפיין עם כל אפשרויות HomeEditor"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              עיצוב קמפיין (Studio)
            </button>

            {/* Create Campaign Modal */}
            <button
              onClick={() => setIsCreateCampaignOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all hover:scale-[1.02]"
            >
              <FolderPlus className="w-4 h-4" />
              הקמת קמפיין חדש
            </button>

            {/* Create Ambassador Modal */}
            <button
              onClick={() => setIsAmbassadorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              הקמת שגריר
            </button>

            {/* Donate Drawer */}
            <button
              onClick={() => setIsDonationDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              ביצוע תרומה
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-100 pt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            לוח קמפיין ראשי
          </button>

          <button
            onClick={() => setActiveTab('ambassadors')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'ambassadors'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            שגרירים וקהילות ({ambassadors.length})
          </button>

          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'donations'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            יומן תרומות ({completedDonations.length})
            {pendingDonations.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
                {pendingDonations.length} ממתינות
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            הגדרות מהירות
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <CampaignHeaderWidget />
            <CampaignTiersWidget />
            <AmbassadorsManagementTable onSelectAmbassador={(a) => setInspectedAmbassador(a)} />
            <CampaignDonorsWidget />
          </div>
        )}

        {activeTab === 'ambassadors' && (
          <div className="space-y-6">
            <AmbassadorsManagementTable onSelectAmbassador={(a) => setInspectedAmbassador(a)} />
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">יומן תרומות והכנסות מלא</h3>
                <p className="text-xs text-slate-500">פירוט כל התרומות שהתקבלו, אמצעי תשלום וקישורי קבלה</p>
              </div>
              <span className="text-sm font-black text-indigo-950">
                סה"כ נגבה: ₪{(campaign?.totalRaised || 0).toLocaleString()}
              </span>
            </div>

            <div className="pt-6 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3 pr-2">תורם</th>
                    <th className="pb-3">סכום</th>
                    <th className="pb-3">סוג תרומה</th>
                    <th className="pb-3">שגריר / קהילה</th>
                    <th className="pb-3">אמצעי תשלום</th>
                    <th className="pb-3">סטטוס</th>
                    <th className="pb-3">תאריך</th>
                    <th className="pb-3 pl-2">קבלה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-slate-900">
                        {d.donorName}
                        {d.phone && <span className="block text-[11px] text-slate-400 font-normal">{d.phone}</span>}
                      </td>
                      <td className="py-3.5 font-black text-emerald-700 text-sm">
                        ₪{d.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        {d.isRecurring ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                            הוראת קבע
                          </span>
                        ) : (
                          <span className="text-slate-500">חד פעמי</span>
                        )}
                      </td>
                      <td className="py-3.5 text-indigo-700 font-semibold">
                        {d.ambassadorName || '-'}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {d.paymentMethod === 'bit' ? 'Bit' : 'כרטיס אשראי'}
                      </td>
                      <td className="py-3.5">
                        {d.paymentStatus === 'completed' ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            הושלם
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">
                            ממתין
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(d.createdAt).toLocaleDateString('he-IL')}
                      </td>
                      <td className="py-3.5 pl-2">
                        {d.receiptUrl ? (
                          <a
                            href={d.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline font-bold"
                          >
                            צפה
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">הגדרות קמפיין מהירות</h3>
                <p className="text-xs text-slate-500">לעיצוב מלא של גרפיקה, מדרגות, וסרטוני וידאו — פתח את ה-Studio</p>
              </div>
              <button
                onClick={() => setIsStudioEditorOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                פתח את ה-HomeEditor Studio
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">כותרת הקמפיין הראשי</label>
                <input
                  type="text"
                  value={campaign?.title || ''}
                  onChange={(e) => updateCampaignSettings({ title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">יעד גיוס ראשי (₪)</label>
                <input
                  type="number"
                  value={campaign?.targetGoal || 100000}
                  onChange={(e) => updateCampaignSettings({ targetGoal: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">תיאור הקמפיין</label>
              <textarea
                rows={3}
                value={campaign?.description || ''}
                onChange={(e) => updateCampaignSettings({ description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-950">התראות WhatsApp אוטומטיות (GREEN-API)</h4>
                <p className="text-xs text-emerald-700">
                  שליחת תזכורת נטישה לאחר 5 דק' ושליחת קבלה מידית בעת הצלחה
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                מופעל
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Alerts & Modals */}
      <LiveDonationAlert />

      <CreateCampaignModal />

      <CampaignStudioEditor
        isOpen={isStudioEditorOpen}
        onClose={() => setIsStudioEditorOpen(false)}
      />

      <AmbassadorModal
        isOpen={isAmbassadorModalOpen}
        onClose={() => setIsAmbassadorModalOpen(false)}
      />

      <DonationDrawer
        isOpen={isDonationDrawerOpen}
        onClose={() => setIsDonationDrawerOpen(false)}
        initialTier={selectedTierForDonation}
      />
    </div>
  );
};
