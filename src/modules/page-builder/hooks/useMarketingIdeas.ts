import { useState, useEffect, useCallback } from 'react';
import { MarketingIdea } from '../types';
import { aiPageGenerator } from '../services/aiPageGenerator';
import { usePageBuilderContext } from '../context/PageBuilderContext';

export interface UseMarketingIdeasResult {
  ideas: MarketingIdea[];
  loading: boolean;
  refreshIdeas: (apiKey?: string) => Promise<void>;
}

export const useMarketingIdeas = (): UseMarketingIdeasResult => {
  const { brandDna } = usePageBuilderContext();
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIdeas = useCallback(
    async (apiKey?: string) => {
      setLoading(true);
      try {
        const result = await aiPageGenerator.generatePageIdeas(brandDna, apiKey);
        setIdeas(result);
      } catch (err) {
        console.warn('[useMarketingIdeas] Failed to fetch marketing ideas:', err);
      } finally {
        setLoading(false);
      }
    },
    [brandDna]
  );

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const refreshIdeas = useCallback(
    async (apiKey?: string) => {
      await fetchIdeas(apiKey);
    },
    [fetchIdeas]
  );

  return {
    ideas,
    loading,
    refreshIdeas,
  };
};

export default useMarketingIdeas;
