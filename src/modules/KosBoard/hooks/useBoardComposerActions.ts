/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 4: Custom React Hook - Actions & Mutations
 */

import { useKosunBoard } from '../context/ModuleContext';

export function useBoardComposerActions() {
  const {
    setSelectedAudience,
    toggleModuleSelection,
    setSelectedModuleIds,
    setCustomPrompt,
    setSelectedModel,
    generateAiDashboard,
    saveCurrentDashboard,
    pairDashboardToSubdomain,
    deleteDashboard,
    openApiKeysSettings,
    refreshSavedDashboards,
    setGeneratedDashboard,
  } = useKosunBoard();

  return {
    setSelectedAudience,
    toggleModuleSelection,
    setSelectedModuleIds,
    setCustomPrompt,
    setSelectedModel,
    generateAiDashboard,
    saveCurrentDashboard,
    pairDashboardToSubdomain,
    deleteDashboard,
    openApiKeysSettings,
    refreshSavedDashboards,
    setGeneratedDashboard,
  };
}
