import { useState, useEffect, useCallback } from 'react';
import { MarketingIdea } from '../types';
import { aiPageGenerator } from '../services/aiPageGenerator';
import { usePageBuilderContext } from '../context/PageBuilderContext';

import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export interface UseMarketingIdeasResult {
  ideas: MarketingIdea[];
  loading: boolean;
  error: string | null;
  refreshIdeas: (apiKey?: string) => Promise<void>;
}

export const useMarketingIdeas = (enabled: boolean = false): UseMarketingIdeasResult => {
  const { brandDna } = usePageBuilderContext();
  const { db } = useSystemConnection();
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(
    async (apiKey?: string) => {
      setLoading(true);
      setError(null);
      try {
        const pages = await pageBuilderFirestore.getAllPages(db);
        const result = await aiPageGenerator.generatePageIdeas(brandDna, apiKey, pages);
        setIdeas(result);
      } catch (err: any) {
        console.warn('[useMarketingIdeas] Failed to fetch marketing ideas:', err);
        setError(err?.message || 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.');
      } finally {
        setLoading(false);
      }
    },
    [brandDna, db]
  );

  useEffect(() => {
    if (enabled && ideas.length === 0) {
      fetchIdeas();
    }
  }, [fetchIdeas, enabled, ideas.length]);

  const refreshIdeas = useCallback(
    async (apiKey?: string) => {
      await fetchIdeas(apiKey);
    },
    [fetchIdeas]
  );

  return {
    ideas,
    loading,
    error,
    refreshIdeas,
  };
};

export default useMarketingIdeas;
