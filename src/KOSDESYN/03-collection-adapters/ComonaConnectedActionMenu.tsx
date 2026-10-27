import React, { useState } from 'react';
import { ComonaAdapterConfig } from './types';
import { useComonaDynamicAdapter } from './useComonaDynamicAdapter';
import { KosActionMenuSheet, KosUserProfile } from '../components/action-menu';
import { Loader2, AlertCircle } from 'lucide-react';

export interface ComonaConnectedActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  adapterConfig: ComonaAdapterConfig;
  profile?: KosUserProfile;
  /**
   * מילון פונקציות עסקיות מ-COMONA (לפי actionType או itemId)
   */
  actionRegistry?: Record<string, (payload?: any) => void>;
  onItemDispatched?: (actionId: string, payload: any) => void;
}

export const ComonaConnectedActionMenu: React.FC<ComonaConnectedActionMenuProps> = ({
  isOpen,
  onClose,
  adapterConfig,
  profile,
  actionRegistry = {},
  onItemDispatched,
}) => {
  const { items, loading, error } = useComonaDynamicAdapter(adapterConfig);

  const handleItemClick = (id: string, item: any) => {
    const actionKey = item.payload?._actionType || id;
    const fn = actionRegistry[actionKey];

    if (fn) {
      fn(item.payload);
    }

    if (onItemDispatched) {
      onItemDispatched(actionKey, item.payload);
    }
  };

  return (
    <KosActionMenuSheet
      isOpen={isOpen}
      onClose={onClose}
      profile={profile}
      headerTitle={adapterConfig.name || 'תפריט COMONA'}
      items={items}
      onItemClick={handleItemClick}
      slotHeaderExtra={
        loading ? (
          <div className="py-2 flex items-center justify-center gap-2 text-xs text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>טוען נתונים חיים מ-Firestore ({adapterConfig.collectionPath})...</span>
          </div>
        ) : error ? (
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>הערת גישה: {error}</span>
          </div>
        ) : null
      }
    />
  );
};
