/**
 * CampaignDashboard: Master Hub Canvas for Managing, Producing & Analyzing Campaigns
 * In the main canvas view:
 * - Shows summary cards: total campaigns, total raised, active ambassadors, total donors
 * - Campaigns Manager Canvas: Table & Grid views of all campaigns in the workspace
 * - Fast Action Bar: Create Campaign, Create Ambassador, Filter by Status, Search
 * - Each campaign card has: "ערוך עיצוב (Studio)", "עמוד דיגיטלי (Public)", "שגרירים", "תרומות"
 * - Separate Tabs for: 
 *     1. 'campaigns' (The Master Canvas of all campaigns)
 *     2. 'ambassadors' (All ambassadors & groups across campaigns)
 *     3. 'donations' (Central donation ledger with search & export)
 *     4. 'analytics' (Performance KPIs, conversion rates, trends)
 */

import React, { useState, useMemo } from 'react';
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
  Sliders,
  FolderPlus,
  Layers,
  Search,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Edit3,
  Wand2,
} from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { AmbassadorsManagementTable } from './AmbassadorsManagementTable';
import { AmbassadorModal } from './AmbassadorModal';
import { DonationDrawer } from './DonationDrawer';
import { LiveDonationAlert } from './LiveDonationAlert';
import { AmbassadorPublicPageView } from './AmbassadorPublicPageView';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CampaignStudioEditor } from './CampaignStudioEditor';
import { CampaignPublicLandingView } from './CampaignPublicLandingView';
import { Campaign, Ambassador } from '../types';

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
  } = useCampaignModule();

  // Primary Workspace Navigation
  const [activeTab, setActiveTab] = useState<'campaigns' | 'ambassadors' | 'donations' | 'analytics' | 'landing_preview'>('campaigns');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');
  const [inspectedAmbassador, setInspectedAmbassador] = useState<Ambassador | null>(null);

  // Overall workspace metrics
  const totalCampaignsCount = campaignsList.length > 0 ? campaignsList.length : (campaign ? 1 : 0);
  const totalRaisedAcrossCampaigns = useMemo(() => {
    if (campaignsList.length > 0) {
      return campaignsList.reduce((sum, c) => sum + (c.totalRaised || 0), 0);
    }
    return campaign?.totalRaised || 0;
  }, [campaignsList, campaign]);

  const totalGoalAcrossCampaigns = useMemo(() => {
    if (campaignsList.length > 0) {
      return campaignsList.reduce((sum, c) => sum + (c.targetGoal || 0), 0);
    }
    return campaign?.targetGoal || 100000;
  }, [campaignsList, campaign]);

  const completedDonations = donations.filter((d) => d.paymentStatus === 'completed');
  const pendingDonations = donations.filter((d) => d.paymentStatus === 'pending');

  // Filtered campaigns for the canvas
  const effectiveCampaigns = useMemo(() => {
    const list = campaignsList.length > 0 ? campaignsList : (campaign ? [campaign] : []);
    return list.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.slug && c.slug.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [campaignsList, campaign, searchTerm, statusFilter]);

  // If user selected to inspect an ambassador's public view
  if (inspectedAmbassador) {
    return (
      <AmbassadorPublicPageView
        ambassador={inspectedAmbassador}
        onBack={() => setInspectedAmbassador(null)}
      />
    );
  }

  // If viewing the campaign's dedicated digital page (Kampin parity)
  if (activeTab === 'landing_preview') {
    return (
      <div className="relative">
        <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs sticky top-0 z-40 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-400">תצוגת עמוד דיגיטלי מלא</span>
            <span className="text-slate-400">({campaign?.title || 'הקמפיין הפעיל'})</span>
          </div>
          <button
            onClick={() => setActiveTab('campaigns')}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all cursor-pointer"
          >
            חזור ללוח הבקרה והקאנבס
          </button>
        </div>
        <CampaignPublicLandingView
          campaignSlug={campaign?.slug}
          canEdit={true}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20 dir-rtl select-none">
      {/* Sleek Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-3 sticky top-0 z-20 shadow-2xs flex items-center justify-between gap-4">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            קאנבס קמפיינים ({totalCampaignsCount})
          </button>

          <button
            onClick={() => setActiveTab('ambassadors')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ambassadors'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            שגרירים וקהילות ({ambassadors.length})
          </button>

          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            יומן תרומות ({completedDonations.length})
            {pendingDonations.length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px]">
                {pendingDonations.length} ממתינות
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            אנליטיקה ומדדים
          </button>
        </div>

        {/* Minimal Refresh Control */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
            title="רענן נתונים"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* KPI Summary Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">קמפיינים במערכת</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCampaignsCount}</div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">מערך קמפיינים מבוזר</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">סה"כ גויס</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dir-rtl">
              ₪{totalRaisedAcrossCampaigns.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              מתוך יעד כולל של ₪{totalGoalAcrossCampaigns.toLocaleString()}
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">מובילי קהילות ושגרירים</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{ambassadors.length}</div>
            <span className="text-[11px] text-indigo-600 font-bold block mt-1">עמודי שגרירים עצמאיים</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">סה"כ תרומות</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{completedDonations.length}</div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">עסקאות שאושרו בהצלחה</span>
          </div>
        </div>

        {/* ================= TAB 1: MASTER CAMPAIGNS CANVAS ================= */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Canvas Toolbar: Search, Status Filter, Layout Toggle */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="חיפוש קמפיין לפי שם או סלאג..."
                    className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">כל הסטטוסים</option>
                  <option value="active">פעיל בלבד</option>
                  <option value="completed">הושלם</option>
                  <option value="draft">טיוטה</option>
                </select>
              </div>

              {/* View Layout Switcher */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="תצוגת כרטיסיות (Grid)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="תצוגת טבלה (Table)"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsCreateCampaignOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>קמפיין AI ומיתוג</span>
                </button>
              </div>
            </div>

            {/* Canvas Body: Grid or Table of Campaigns */}
            {effectiveCampaigns.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <FolderPlus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">לא נמצאו קמפיינים</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    הקם את הקמפיין הראשון שלך ועצב אותו במדויק עם עורך ה-Studio והגלריה.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateCampaignOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  הקמת קמפיין חדש עכשיו
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {effectiveCampaigns.map((camp) => {
                  const percent = camp.targetGoal > 0 ? Math.round(((camp.totalRaised || 0) / camp.targetGoal) * 100) : 0;
                  const isActive = camp.id === activeCampaignId;

                  return (
                    <div
                      key={camp.id}
                      className={`rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                        isActive ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200/90 hover:border-indigo-300'
                      }`}
                    >
                      {/* Campaign Header Image or Gradient Banner */}
                      <div className="h-32 bg-slate-900 relative overflow-hidden">
                        {camp.featuredImageUrl || (camp.videoGallery?.images && camp.videoGallery.images[0]) ? (
                          <img
                            src={camp.featuredImageUrl || camp.videoGallery?.images?.[0]}
                            alt={camp.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-indigo-400/40" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                            {camp.status === 'active' ? 'פעיל' : 'טיוטה'}
                          </span>
                          {camp.themeMode === 'brand_dna' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-white shadow-xs flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Brand DNA
                            </span>
                          )}
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-xs">
                              נבחר
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2 left-3">
                          <span className="text-[11px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded-lg dir-ltr">
                            /{camp.slug}
                          </span>
                        </div>
                      </div>

                      {/* Campaign Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="font-black text-slate-900 text-base leading-snug line-clamp-1">
                            {camp.title}
                          </h4>
                          {camp.subtitle && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {camp.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Progress Meter */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-emerald-700 dir-rtl">
                              ₪{(camp.totalRaised || 0).toLocaleString()}
                            </span>
                            <span className="text-slate-400">יעד: ₪{camp.targetGoal.toLocaleString()}</span>
                            <span className="text-amber-500 font-black">{percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                            <span>{camp.donorCount || 0} תורמים</span>
                            <span>{ambassadors.filter((a) => a.campaignId === camp.id).length} שגרירים</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCampaignId(camp.id);
                              setIsStudioEditorOpen(true);
                            }}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="ערוך עיצוב עם עורך ה-Studio"
                          >
                            <Sliders className="w-3.5 h-3.5 text-amber-400" />
                            <span>עיצוב Studio</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveCampaignId(camp.id);
                              setActiveTab('landing_preview');
                            }}
                            className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 border border-emerald-200 transition-all cursor-pointer"
                            title="צפה בעמוד הדיגיטלי בסגנון Kampin"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>עמוד דיגיטלי</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table Layout */
              <div className="bg-white rounded-3xl p-6 border border-slate-200 overflow-x-auto shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3 pr-2">קמפיין</th>
                      <th className="pb-3">סלאג (URL)</th>
                      <th className="pb-3">יעד גיוס</th>
                      <th className="pb-3">גויס בפועל</th>
                      <th className="pb-3">תורמים</th>
                      <th className="pb-3">סטטוס</th>
                      <th className="pb-3 text-left pl-2">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {effectiveCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{camp.title}</span>
                            {camp.themeMode === 'brand_dna' && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                Brand DNA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-slate-500 dir-ltr">/{camp.slug}</td>
                        <td className="py-3 font-bold">₪{camp.targetGoal.toLocaleString()}</td>
                        <td className="py-3 font-black text-emerald-700">₪{(camp.totalRaised || 0).toLocaleString()}</td>
                        <td className="py-3 font-semibold">{camp.donorCount || 0}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px]">
                            {camp.status}
                          </span>
                        </td>
                        <td className="py-3 text-left pl-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveCampaignId(camp.id);
                                setIsStudioEditorOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                            >
                              Studio
                            </button>
                            <button
                              onClick={() => {
                                setActiveCampaignId(camp.id);
                                setActiveTab('landing_preview');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500"
                            >
                              עמוד מלא
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: AMBASSADORS ================= */}
        {activeTab === 'ambassadors' && (
          <div className="space-y-6">
            <AmbassadorsManagementTable onSelectAmbassador={(a) => setInspectedAmbassador(a)} />
          </div>
        )}

        {/* ================= TAB 3: DONATIONS LEDGER ================= */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200/80">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">יומן תרומות והכנסות מלא</h3>
                <p className="text-xs text-slate-500">פירוט כל התרומות שהתקבלו, אמצעי תשלום וקישורי קבלה</p>
              </div>
              <span className="text-sm font-black text-indigo-950">
                סה"כ נגבה: ₪{totalRaisedAcrossCampaigns.toLocaleString()}
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
                    <th className="pb-3">זמן</th>
                    <th className="pb-3">קבלה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-2 font-bold text-slate-900">{d.donorName}</td>
                      <td className="py-3 font-black text-emerald-700">₪{d.amount.toLocaleString()}</td>
                      <td className="py-3 text-slate-500">{d.isRecurring ? 'הו"ק חודשית' : 'חד פעמי'}</td>
                      <td className="py-3 text-slate-600">{d.ambassadorName || 'קמפיין ישיר'}</td>
                      <td className="py-3 text-slate-500">{d.paymentMethod || 'אשראי'}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.paymentStatus === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.paymentStatus === 'completed' ? 'משולם' : 'ממתין'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{new Date(d.createdAt).toLocaleDateString('he-IL')}</td>
                      <td className="py-3">
                        {d.receiptUrl ? (
                          <a
                            href={d.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline font-bold"
                          >
                            צפה
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ANALYTICS & METRICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200">
              <h3 className="text-xl font-black text-slate-900 mb-2">אנליטיקה ופילוח קמפיינים</h3>
              <p className="text-xs text-slate-500 mb-6">
                מדדי המרה, יעילות שגרירים, וסנכרון ישיר לרכיב crm-analytics ול-EventBus.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">ממוצע תרומה</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ₪
                    {completedDonations.length > 0
                      ? Math.round(totalRaisedAcrossCampaigns / completedDonations.length).toLocaleString()
                      : 0}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">אחוז עמידה ביעד הכולל</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {totalGoalAcrossCampaigns > 0
                      ? Math.round((totalRaisedAcrossCampaigns / totalGoalAcrossCampaigns) * 100)
                      : 0}
                    %
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">תרומות שגויסו ע"י שגרירים</span>
                  <div className="text-2xl font-black text-indigo-700 mt-1">
                    {ambassadors.reduce((sum, a) => sum + (a.donorCount || 0), 0)} תורמים
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Blue Pencil Edit Button (Opens Studio/HomeEditor directly) */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsStudioEditorOpen(true)}
          title="ערוך ועצב את הקמפיין (HomeEditor Studio)"
          className="rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white h-14 w-14 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-indigo-500/20"
        >
          <Edit3 className="w-6 h-6" />
        </button>
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
