import React from 'react';
import { DollarSign, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useKesherPaymentsContext } from '../context/KesherPaymentsContext';

export const QuickMetricsBar: React.FC = () => {
  const { metrics, isDark } = useKesherPaymentsContext();

  const cardBg = isDark
    ? 'bg-slate-900/80 border-slate-800 backdrop-blur-sm'
    : 'bg-white border-slate-200 shadow-sm';
  const labelColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const valColor = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4" dir="rtl">
      {/* סך הכנסות יומי */}
      <div className={`${cardBg} border p-4 rounded-2xl flex items-center gap-3.5 shadow-md`}>
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <span className={`text-[11px] sm:text-xs ${labelColor} font-medium block`}>סך הכנסות יומי</span>
          <span className={`text-lg sm:text-2xl font-black ${valColor}`}>
            ₪{metrics.totalRevenueToday.toLocaleString()}
          </span>
        </div>
      </div>

      {/* עסקאות שאושרו */}
      <div className={`${cardBg} border p-4 rounded-2xl flex items-center gap-3.5 shadow-md`}>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <span className={`text-[11px] sm:text-xs ${labelColor} font-medium block`}>עסקאות שאושרו היום</span>
          <span className={`text-lg sm:text-2xl font-black ${valColor}`}>
            {metrics.approvedCount}
          </span>
        </div>
      </div>

      {/* ממוצע לעסקה */}
      <div className={`${cardBg} border p-4 rounded-2xl flex items-center gap-3.5 shadow-md`}>
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <span className={`text-[11px] sm:text-xs ${labelColor} font-medium block`}>ממוצע לעסקה</span>
          <span className={`text-lg sm:text-2xl font-black ${valColor}`}>
            ₪{metrics.averageTransaction.toLocaleString()}
          </span>
        </div>
      </div>

      {/* עסקאות שנכשלו */}
      <div className={`${cardBg} border p-4 rounded-2xl flex items-center gap-3.5 shadow-md`}>
        <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <span className={`text-[11px] sm:text-xs ${labelColor} font-medium block`}>עסקאות שנכשלו / נדחו</span>
          <span className={`text-lg sm:text-2xl font-black ${metrics.failedCount > 0 ? 'text-rose-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {metrics.failedCount}
          </span>
        </div>
      </div>
    </div>
  );
};
