/**
 * WhatsApp Cloud Functions API Proxy
 * Routes backend operations and AI assistant requests securely through Cloud Functions.
 * Follows Kosun Module Monopoly: Sibling modules consume backend operations via functionsApi.
 */
import { BrandDna } from '../../../core/contracts';

export interface AiCallResponse {
  text: string;
  costReport?: any;
  error?: string;
}

export const functionsApi = {
  /**
   * Calls the secure backend AI endpoint (Cloud Function)
   * Displays clear, pleasant Hebrew error messages without cascading fallbacks.
   */
  async callAiAssistant(params: {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    brandDna?: BrandDna | null;
  }): Promise<AiCallResponse> {
    try {
      // In production/workbench, this routes to Cloud Functions / Kosai Engine proxy
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }).catch(() => null);

      if (!response || !response.ok) {
        return {
          text: '',
          error: 'שירות הבינה המלאכותית עמוס כעת, אנא נסה שוב בעוד מספר רגעים.'
        };
      }

      const data = await response.json().catch(() => ({}));
      return {
        text: data.text || '',
        costReport: data.costReport
      };
    } catch {
      return {
        text: '',
        error: 'שירות הבינה המלאכותית עמוס כעת, אנא נסה שוב בעוד מספר רגעים.'
      };
    }
  }
};
