/**
 * KOSUN AM (קושאן מייל אוטומטי) - Action Hooks
 * 12-Layer Scaffolding Layer 4: Dispatches, AI Copilot invocations, template & automation mutations
 */

import { useKosunAmContext } from '../context/ModuleContext';

export function useKosunAmActions() {
  const {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    dispatchCampaign,
    saveTemplate,
    deleteTemplate,
    saveAutomation,
    toggleAutomation,
    generateAiContent,
    refreshAll,
  } = useKosunAmContext();

  return {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    dispatchCampaign,
    saveTemplate,
    deleteTemplate,
    saveAutomation,
    toggleAutomation,
    generateAiContent,
    refreshAll,
  };
}
