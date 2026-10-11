import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import {
  TrendingUp,
  Activity,
  Users,
  CreditCard,
  MailCheck,
  MessageSquare,
  Inbox,
  Globe,
  PieChart,
  Film,
  Sparkles,
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { BentoWidgetSize } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  TrendingUp,
  Activity,
  Users,
  CreditCard,
  MailCheck,
  MessageSquare,
  Inbox,
  Globe,
  PieChart,
  Film,
  Sparkles,
};

export interface LiveCollectionMetricCardProps {
  id: string;
  title: string;
  subtitle?: string;
  iconName?: string;
  size?: BentoWidgetSize;
  collectionName?: string;
  calculation?: 'count' | 'sum' | 'active_count' | 'latest' | 'latest_status';
  field?: string;
  statPrefix?: string;
  statSuffix?: string;
  accentColor?: string;
  targetRoute?: string;
  onNavigate?: (route: string) => void;
}

export const LiveCollectionMetricCard: React.FC<LiveCollectionMetricCardProps> = ({
  title,
  subtitle,
  iconName = 'Activity',
  size = 'sm',
  collectionName,
  calculation = 'count',
  field,
  statPrefix = '',
  statSuffix = '',
  accentColor = 'indigo',
  targetRoute,
  onNavigate,
}) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [metricValue, setMetricValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!db || !collectionName) {
      setMetricValue(0);
      setIsLoading(false);
      return;
    }

    try {
      // Scoped path under tenants/{tenantId}/{collectionName}
      const collRef = collection(db, 'tenants', tenantId || '_master', collectionName);

      const unsubscribe = onSnapshot(
        collRef,
        (snapshot) => {
          if (snapshot.empty) {
            setMetricValue(0);
          } else {
            if (calculation === 'sum' && field) {
              let total = 0;
              snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const val = Number(data[field]) || 0;
                total += val;
              });
              setMetricValue(total);
            } else {
              setMetricValue(snapshot.size);
            }
          }
          setIsLoading(false);
        },
        (error) => {
          // If subcollection doesn't exist yet or is empty, gracefully show 0
          console.warn(`[LiveCollectionMetricCard] Live snapshot notice on ${collectionName}:`, error);
          setMetricValue(0);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn(`[LiveCollectionMetricCard] Error creating listener:`, err);
      setMetricValue(0);
      setIsLoading(false);
    }
  }, [db, tenantId, collectionName, calculation, field]);

  const IconComp = ICON_MAP[iconName] || Activity;

  // Format display value
  const formattedValue =
    metricValue === null
      ? '-'
      : calculation === 'sum'
      ? metricValue.toLocaleString('he-IL', { maximumFractionDigits: 0 })
      : metricValue.toLocaleString('he-IL');

  return (
    <div
      onClick={() => targetRoute && onNavigate && onNavigate(targetRoute)}
      className={`p-4 rounded-2xl border transition duration-200 select-none bg-slate-900/70 border-slate-800 hover:border-slate-700/90 flex flex-col justify-between ${
        targetRoute ? 'cursor-pointer hover:bg-slate-900' : ''
      } ${
        size === 'lg'
          ? 'col-span-1 md:col-span-2'
          : size === 'full'
          ? 'col-span-1 md:col-span-3'
          : 'col-span-1'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              accentColor === 'emerald'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/20'
            }`}
          >
            <IconComp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-200">{title}</h4>
            {subtitle && (
              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Live sync pulse */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded-full text-[10px] text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[9px]">חי</span>
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        {statPrefix && (
          <span className="text-sm font-bold text-slate-400 font-mono">
            {statPrefix}
          </span>
        )}
        <span className="text-2xl font-black text-white tracking-tight font-mono">
          {isLoading ? '...' : formattedValue}
        </span>
        {statSuffix && (
          <span className="text-xs text-slate-400 mr-1">{statSuffix}</span>
        )}
      </div>

      {collectionName && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="truncate max-w-[140px]">{collectionName}</span>
          <span>טננט: {tenantId}</span>
        </div>
      )}
    </div>
  );
};
