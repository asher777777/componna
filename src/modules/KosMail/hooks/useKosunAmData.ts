/**
 * KOSUN AM (קושאן מייל אוטומטי) - Reactive Data Hook
 * 12-Layer Scaffolding Layer 4: Slices of campaigns, templates, automations, logs and computed metrics
 */

import { useMemo } from 'react';
import { useKosunAmContext } from '../context/ModuleContext';

export function useKosunAmData() {
  const {
    tenantId,
    campaigns,
    templates,
    automations,
    logs,
    isLoading,
    activeProvider,
    refreshAll,
  } = useKosunAmContext();

  const metrics = useMemo(() => {
    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;

    for (const cmp of campaigns) {
      totalSent += cmp.stats?.totalRecipients || 0;
      totalDelivered += cmp.stats?.deliveredCount || 0;
      totalOpened += cmp.stats?.openedCount || 0;
      totalClicked += cmp.stats?.clickedCount || 0;
    }

    const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
    const clickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 100) : 0;

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
      activeAutomationsCount: automations.filter((a) => a.isActive).length,
      templatesCount: templates.length,
      campaignsCount: campaigns.length,
    };
  }, [campaigns, automations, templates]);

  return {
    tenantId,
    campaigns,
    templates,
    automations,
    logs,
    isLoading,
    activeProvider,
    metrics,
    refreshAll,
  };
}
