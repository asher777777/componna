import { useState, useCallback } from 'react';
import { FunctionsApi, GeneratedLandingPageData } from '../api/functionsApi';
import { MediaItem } from '../types';
import { eventBus } from '../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';

export function useDocToLandingPage() {
  const { getCapability } = useHostCapabilities();
  const brandContract = getCapability<BrandDnaContract>('brand-dna');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPage, setGeneratedPage] = useState<GeneratedLandingPageData | null>(null);
  const [activeSourceItem, setActiveSourceItem] = useState<MediaItem | null>(null);

  /**
   * Reads a media item (URL / text / image) and converts it to Base64 or plain string
   */
  const resolveItemContent = useCallback(async (item: MediaItem): Promise<{ content: string; mimeType: string }> => {
    // If it's code/text/json, fetch text
    if (
      item.type === 'code' ||
      item.mimeType.includes('text') ||
      item.mimeType.includes('json') ||
      item.name.endsWith('.txt') ||
      item.name.endsWith('.md')
    ) {
      if (item.extractedText) {
        return { content: item.extractedText, mimeType: item.mimeType };
      }
      const res = await fetch(item.url);
      const txt = await res.text();
      return { content: txt, mimeType: item.mimeType };
    }

    // If it's an image or PDF, convert to base64
    const res = await fetch(item.url);
    const blob = await res.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return { content: base64, mimeType: item.mimeType || 'image/jpeg' };
  }, []);

  /**
   * Execute the AI doc to landing page generation
   */
  const generateLandingPage = useCallback(
    async (item: MediaItem, customApiKey?: string): Promise<GeneratedLandingPageData> => {
      setIsGenerating(true);
      setError(null);
      setActiveSourceItem(item);

      try {
        const brandDna = brandContract ? brandContract.getBrandDna() : null;
        const { content, mimeType } = await resolveItemContent(item);

        const pageData = await FunctionsApi.generateLandingPageFromDoc(
          content,
          mimeType,
          brandDna,
          customApiKey
        );

        setGeneratedPage(pageData);

        // Publish event through EventBus as required by contracts
        const payload = {
          sourceFileId: item.id,
          sourceFileName: item.name,
          pageTitle: pageData.pageTitle,
          sections: pageData.sections,
          brandStyles: pageData.brandStyles,
          createdAt: new Date().toISOString(),
        };

        eventBus.publish('landing_page:generated_from_doc', payload);

        return pageData;
      } catch (err: any) {
        console.error('[useDocToLandingPage] Generation error:', err);
        setError(err.message || 'שגיאה ביצירת דף הנחיתה מהמסמך');
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [brandContract, resolveItemContent]
  );

  return {
    isGenerating,
    error,
    generatedPage,
    activeSourceItem,
    generateLandingPage,
    setGeneratedPage,
  };
}
