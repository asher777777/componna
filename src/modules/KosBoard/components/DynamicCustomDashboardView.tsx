import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  Settings,
  Share2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { GeneratedCustomDashboard, DashboardWidget } from '../types';
import { LiveCollectionMetricCard } from './LiveCollectionMetricCard';
import { QuickActionsWidget } from './QuickActionsWidget';
import { Tooltip } from './Tooltip';
import { SubdomainPairingModal } from './SubdomainPairingModal';
import { useKosunBoard } from '../context/ModuleContext';

export interface DynamicCustomDashboardViewProps {
  dashboard: GeneratedCustomDashboard;
  onBackToForge?: () => void;
}

export const DynamicCustomDashboardView: React.FC<DynamicCustomDashboardViewProps> = ({
  dashboard,
  onBackToForge,
}) => {
  const navigate = useNavigate();
  const { pairDashboardToSubdomain } = useKosunBoard();

  // Collapsible AI Advisor & Strategy (Cashwan Branding Rule 7: Hidden by default behind button)
  const [showAiInsights, setShowAiInsights] = useState(false);
  // Collapsible Secondary Statistics (Rule 7: Hidden by default behind button)
  const [showSecondaryStats, setShowSecondaryStats] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

  const kpiWidgets = dashboard.widgets.filter((w) => w.type === 'kpi_metric');
  const actionWidgets = dashboard.widgets.filter((w) => w.type === 'quick_actions');
  const streamWidgets = dashboard.widgets.filter((w) => w.type === 'data_stream');

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="space-y-4 pb-28 text-slate-900 dark:text-slate-100" dir="rtl">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          {onBackToForge && (
            <button
              type="button"
              onClick={onBackToForge}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="חזרה לעורך"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {dashboard.title}
              </h2>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                {dashboard.targetAudienceName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {dashboard.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dashboard.pairedSubdomain ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>משודך ל: {dashboard.pairedSubdomain}.kosun.pro</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsPairingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{dashboard.pairedSubdomain ? 'שנה שידוך סאב-דומיין' : 'שדך לסאב-דומיין'}</span>
          </button>
        </div>
      </div>

      {/* AI Partner Greeting & Strategy (Collapsible On-Demand - Rule 7 Strict Compliance) */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAiInsights((prev) => !prev)}
          className="w-full py-2.5 px-4 flex items-center justify-between text-xs text-indigo-950 dark:text-indigo-200 hover:bg-indigo-100/40 dark:hover:bg-indigo-900/30 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>תובנות אסטרטגיות מקושאן AI (לחץ לפתיחה)</span>
          </div>
          {showAiInsights ? (
            <ChevronUp className="w-4 h-4 text-indigo-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {showAiInsights && (
          <div className="p-4 pt-1 border-t border-indigo-100 dark:border-indigo-900/40 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {dashboard.aiAdvisor.greeting}
                  </h3>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full font-medium">
                    קושאן AI
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {dashboard.aiAdvisor.executiveSummary}
                </p>

                {dashboard.aiAdvisor.recommendedActions?.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {dashboard.aiAdvisor.recommendedActions.map((rec, i) => (
                      <div
                        key={i}
                        className="text-[11px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Bento Grid: Dynamic Live KPIs & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Dynamic Live KPI Metric Cards */}
        {kpiWidgets.map((widget) => (
          <LiveCollectionMetricCard
            key={widget.id}
            id={widget.id}
            title={widget.title}
            subtitle={widget.subtitle}
            iconName={widget.iconName}
            size={widget.size}
            collectionName={widget.config?.collectionName}
            calculation={widget.config?.calculation || 'count'}
            field={widget.config?.field}
            statPrefix={widget.config?.statPrefix}
            statSuffix={widget.config?.statSuffix}
            accentColor={widget.config?.accentColor || 'indigo'}
          />
        ))}

        {/* Quick Action Widgets */}
        {actionWidgets.map((widget) => (
          <QuickActionsWidget
            key={widget.id}
            title={widget.title}
            subtitle={widget.subtitle}
            actions={widget.config?.actions || []}
            size={widget.size}
            onNavigate={handleNavigate}
          />
        ))}

        {/* Live Data Stream Cards */}
        {streamWidgets.map((widget) => (
          <LiveCollectionMetricCard
            key={widget.id}
            id={widget.id}
            title={widget.title}
            subtitle={widget.subtitle}
            iconName={widget.iconName}
            size={widget.size}
            collectionName={widget.config?.collectionName}
            calculation="count"
            statSuffix={widget.config?.statSuffix || 'רשומות'}
            accentColor="emerald"
          />
        ))}
      </div>

      {/* Collapsible Secondary Statistics (Rule 7: Hidden by default behind button) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowSecondaryStats((prev) => !prev)}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition flex items-center justify-between shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-bold">הצג נתונים סטטיסטיים ומידע משני</span>
          </div>
          {showSecondaryStats ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showSecondaryStats && (
          <div className="mt-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150 shadow-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                אסטרטגיית קהל יעד
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {dashboard.aiAdvisor.audienceStrategy}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                רכיבים מקושרים
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {dashboard.selectedModuleIds.map((id) => (
                  <span
                    key={id}
                    className="text-[10px] bg-slate-200 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                פרטי יצירה וגרסה
              </span>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono space-y-0.5">
                <div>מזהה: {dashboard.id}</div>
                <div>נוצר: {new Date(dashboard.createdAt).toLocaleDateString('he-IL')}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subdomain Pairing Modal */}
      <SubdomainPairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        dashboard={dashboard}
        onPair={async (subdomain) => {
          await pairDashboardToSubdomain(subdomain, dashboard);
        }}
      />
    </div>
  );
};
