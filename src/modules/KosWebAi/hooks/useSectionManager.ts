import { useCallback } from 'react';
import { usePageBuilderContext } from '../context/PageBuilderContext';
import { SectionType } from '../types/pageBuilder.types';

/**
 * Hook specifically for managing sections (add, remove, duplicate, reorder, visibility)
 */
export const useSectionManager = () => {
  const {
    currentPageConfig,
    selectedSectionId,
    setSelectedSectionId,
    addSection,
    removeSection,
    reorderSections,
    duplicateSection,
    updateSectionData,
    toggleSectionVisibility,
  } = usePageBuilderContext();

  const sectionsList = currentPageConfig?.sectionOrder.map((id) => ({
    id,
    data: currentPageConfig.sections[id],
    isSelected: selectedSectionId === id,
  })) || [];

  const moveSectionUp = useCallback(
    (sectionId: string) => {
      if (!currentPageConfig) return;
      const order = [...currentPageConfig.sectionOrder];
      const idx = order.indexOf(sectionId);
      if (idx > 0) {
        const temp = order[idx];
        order[idx] = order[idx - 1];
        order[idx - 1] = temp;
        reorderSections(order);
      }
    },
    [currentPageConfig, reorderSections]
  );

  const moveSectionDown = useCallback(
    (sectionId: string) => {
      if (!currentPageConfig) return;
      const order = [...currentPageConfig.sectionOrder];
      const idx = order.indexOf(sectionId);
      if (idx >= 0 && idx < order.length - 1) {
        const temp = order[idx];
        order[idx] = order[idx + 1];
        order[idx + 1] = temp;
        reorderSections(order);
      }
    },
    [currentPageConfig, reorderSections]
  );

  return {
    sectionsList,
    selectedSectionId,
    setSelectedSectionId,
    addSection,
    removeSection,
    reorderSections,
    duplicateSection,
    updateSectionData,
    toggleSectionVisibility,
    moveSectionUp,
    moveSectionDown,
  };
};

export default useSectionManager;
