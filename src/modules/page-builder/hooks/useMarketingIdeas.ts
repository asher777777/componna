import { useState, useEffect, useCallback } from 'react';
import { MarketingIdea } from '../types';
import { aiPageGenerator } from '../services/aiPageGenerator';
import { usePageBuilderContext } from '../context/PageBuilderContext';

import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export interface UseMarketingIdeasResult {
  ideas: MarketingIdea[];
  loading: boolean;
  refreshIdeas: (apiKey?: string) => Promise<void>;
}

export const useMarketingIdeas = (): UseMarketingIdeasResult => {
  const { brandDna } = usePageBuilderContext();
  const { db } = useSystemConnection();
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIdeas = useCallback(
    async (apiKey?: string) => {
      setLoading(true);
      try {
        const pages = await pageBuilderFirestore.getAllPages(db);
        const result = await aiPageGenerator.generatePageIdeas(brandDna, apiKey, pages);
        setIdeas(result);
      } catch (err) {
        console.warn('[useMarketingIdeas] Failed to fetch marketing ideas:', err);
      } finally {
        setLoading(false);
      }
    },
    [brandDna, db]
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
