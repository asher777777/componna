/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 4: Custom React Hook - Data Fetching & Reactive State
 */

import { useKosunBoard } from '../context/ModuleContext';

export function useBoardComposerData() {
  const {
    audiences,
    selectedAudience,
    discoveredModules,
    selectedModuleIds,
    savedDashboards,
    generatedDashboard,
    isGenerating,
    hasApiKey,
    selectedModel,
    customPrompt,
  } = useKosunBoard();

  return {
    audiences,
    selectedAudience,
    discoveredModules,
    selectedModuleIds,
    savedDashboards,
    generatedDashboard,
    isGenerating,
    hasApiKey,
    selectedModel,
    customPrompt,
  };
}
