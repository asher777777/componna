import React, { useState, useEffect } from 'react';
import { Zap, Plus, BatteryCharging, AlertTriangle, Sparkles } from 'lucide-react';
import { TenantTokenTracker, TenantTokenUsage } from '../tenantTokenTracker';
import { resolveCurrentTenantId } from '../../tenant/tenantResolver';
import { TokenPurchaseModal } from './TokenPurchaseModal';

interface TenantTokenBadgeProps {
  className?: string;
  showAddButton?: boolean;
  compact?: boolean;
}

export const TenantTokenBadge: React.FC<TenantTokenBadgeProps> = ({
  className = '',
  showAddButton = true,
  compact = false,
}) => {
  const [tokenUsage, setTokenUsage] = useState<TenantTokenUsage | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    const tenantId = resolveCurrentTenantId();
    TenantTokenTracker.getTenantTokenUsage(undefined, tenantId).then(setTokenUsage);

    const unsub = TenantTokenTracker.subscribe(undefined, tenantId, (usage) => {
      setTokenUsage(usage);
    });

    const handleCustomUpdate = (e: any) => {
      if (e.detail?.usage) {
        setTokenUsage(e.detail.usage);
      }
    };
    window.addEventListener('kosun_tenant_tokens_updated', handleCustomUpdate);

    return () => {
      unsub();
      window.removeEventListener('kosun_tenant_tokens_updated', handleCustomUpdate);
    };
  }, []);

  const quota = tokenUsage?.monthlyQuota || 1_000_000;
  const used = tokenUsage?.totalTokens || 0;
  const remaining = Math.max(0, quota - used);
  const percent = Math.min(100, Math.max(0, Math.round((remaining / quota) * 100)));

  // Format numbers nicely (e.g. 750K)
  const formatTokens = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
    return val.toString();
  };

  const isLow = percent <= 15;
  const isModerate = percent <= 40;

  return (
    <>
      <div className={`flex items-center gap-1.5 ${className}`} dir="rtl">
        <button
          type="button"
          onClick={() => setIsPurchaseModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border shadow-sm ${
            isLow
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 animate-pulse hover:bg-rose-100'
              : isModerate
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 hover:bg-amber-100'
              : 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-100'
          }`}
          title={`יתרת טוקנים: ${remaining.toLocaleString()} מתוך ${quota.toLocaleString()} (${percent}% נותרו). לחץ להטענה.`}
        >
          <Zap className={`w-3.5 h-3.5 shrink-0 ${isLow ? 'text-rose-500' : 'text-amber-500'}`} />
          <span>{formatTokens(remaining)}</span>
          {!compact && (
            <span className="text-[10px] opacity-75 font-normal">
              ({percent}%)
            </span>
          )}
          {showAddButton && (
            <span className="w-4 h-4 rounded-md bg-indigo-600/20 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-0.5">
              <Plus className="w-2.5 h-2.5" />
            </span>
          )}
        </button>
      </div>

      <TokenPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        tokenUsage={tokenUsage}
        onTopupSuccess={(newQuota) => {
          if (tokenUsage) {
            setTokenUsage({ ...tokenUsage, monthlyQuota: newQuota });
          }
        }}
      />
    </>
  );
};
