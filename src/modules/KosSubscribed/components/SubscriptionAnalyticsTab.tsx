import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Award,
  Package,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useKosSubscribed } from '../hooks/useKosSubscribed';

export const SubscriptionAnalyticsTab: React.FC = () => {
  const { analytics, contacts } = useKosSubscribed();

  const allSubscriptions = contacts.flatMap((c) => c.contentSubscriptions || []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Analytics Header */}
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          אנליטיקת מנויים, גבייה וביצועי חבילות
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          כל הנתונים מחושבים ישירות מתוך כרטיסי אנשי הקשר ב-CRM תחת הטננט של הסאב-דומיין
        </p>
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>הכנסה חודשית חוזרת (MRR)</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            ₪{analytics.mrr.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            צפי שנתי משוקלל (ARR): ₪{analytics.arr.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>התפלגות סטטוס מנויים</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-4 pt-1">
            <div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {analytics.activeSubscribers}
              </div>
              <div className="text-[11px] text-slate-500">פעילים</div>
            </div>
            <div>
              <div className="text-xl font-black text-sky-600 dark:text-sky-400">
                {analytics.trialSubscribers}
              </div>
              <div className="text-[11px] text-slate-500">בניסיון</div>
            </div>
            <div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {analytics.pastDueSubscribers}
              </div>
              <div className="text-[11px] text-slate-500">בפיגור</div>
            </div>
            <div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                {analytics.canceledSubscribers}
              </div>
              <div className="text-[11px] text-slate-500">מבוטלים</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>הצלחה במבחני תוכן וערך לקוח</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
            {analytics.quizPassRate}%
          </div>
          <div className="text-xs text-slate-500">
            הכנסה ממוצעת למנוי (ARPU): ₪{analytics.averageRevenuePerUser.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Revenue by Package Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            ביצועים והכנסות לפי חבילת תוכן
          </h3>
        </div>

        <div className="p-5 space-y-4">
          {analytics.revenueByPackage.map((row) => {
            const maxRev = Math.max(
              ...analytics.revenueByPackage.map((r) => r.monthlyRevenue),
              1
            );
            const widthPct = Math.max(8, Math.round((row.monthlyRevenue / maxRev) * 100));

            return (
              <div key={row.packageId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {row.packageName}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-semibold">
                      {row.subscribersCount} מנויים פעילים
                    </span>
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₪{row.monthlyRevenue.toLocaleString()} / חודש
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-indigo-600 to-purple-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Subscription Transactions Ledger */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            יומן חיובים ותשלומי מנויים אחרונים
          </h3>
        </div>

        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {allSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                {sub.status === 'active' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {sub.contactName}
                  </span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-600 dark:text-slate-300">{sub.packageName}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <span className="text-slate-500">{sub.startDate}</span>
                {sub.discountCode && (
                  <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                    קופון {sub.discountCode}
                  </span>
                )}
                <span className="font-black text-slate-900 dark:text-white">
                  ₪{sub.finalAmount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
