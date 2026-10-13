import { useState, useCallback } from 'react';
import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { aiPageGenerator } from '../services/aiPageGenerator';
import { GenerationStep } from '../types';
import { usePageBuilderContext } from '../context/PageBuilderContext';
import { resolveApiKey } from '../api/functionsApi';

export interface UseAiPageGeneratorResult {
  isGenerating: boolean;
  currentStep: GenerationStep | null;
  streamedConfig: PageBuilderConfig | null;
  error: string | null;
  hasApiKey: boolean;
  generatePage: (userPrompt: string, options?: { generateImages?: boolean; apiKey?: string }) => Promise<PageBuilderConfig>;
  refineSection: (sectionType: SectionType, prompt: string, currentData: any, apiKey?: string) => Promise<any>;
  cancelGeneration: () => void;
}

export const useAiPageGenerator = (): UseAiPageGeneratorResult => {
  const { brandDna, setCurrentPageConfig } = usePageBuilderContext();

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [streamedConfig, setStreamedConfig] = useState<PageBuilderConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasApiKey = !!resolveApiKey();

  const generatePage = useCallback(
    async (
      userPrompt: string,
      options?: { generateImages?: boolean; apiKey?: string }
    ): Promise<PageBuilderConfig> => {
      setIsGenerating(true);
      setError(null);
      setCurrentStep({
        stepIndex: 0,
        totalSteps: 6,
        sectionType: 'hero',
        stepTitle: 'מנתח Brand DNA ויעדי שיווק...',
        statusText: 'מתחיל...',
        progressPercent: 5,
      });

      try {
        const finalConfig = await aiPageGenerator.generatePageLive(
          userPrompt,
          brandDna,
          (step, partial) => {
            setCurrentStep(step);
            setStreamedConfig(partial);
          },
          options
        );

        setCurrentPageConfig(finalConfig);
        setIsGenerating(false);
        return finalConfig;
      } catch (err: any) {
        console.error('[useAiPageGenerator] Error generating page:', err);
        setError(err?.message || 'שגיאה ביצירת העמוד');
        setIsGenerating(false);
        throw err;
      }
    },
    [brandDna, setCurrentPageConfig]
  );

  const refineSection = useCallback(
    async (
      sectionType: SectionType,
      prompt: string,
      currentData: any,
      apiKey?: string
    ): Promise<any> => {
      return aiPageGenerator.generateSectionLive(
        sectionType,
        prompt,
        brandDna,
        currentData,
        apiKey
      );
    },
    [brandDna]
  );

  const cancelGeneration = useCallback(() => {
    setIsGenerating(false);
    setCurrentStep(null);
    setStreamedConfig(null);
  }, []);

  return {
    isGenerating,
    currentStep,
    streamedConfig,
    error,
    hasApiKey,
    generatePage,
    refineSection,
    cancelGeneration,
  };
};

export default useAiPageGenerator;
