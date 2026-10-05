import { BrandDna } from '../types/brandDna';

export interface BrandAiRephrasePayload {
  originalText: string;
  brandDna: BrandDna;
  customInstructions?: string;
}

export interface BrandAiRephraseResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface BrandAiDiscoveryPayload {
  interviewNotes: string;
}

export interface BrandAiDiscoveryResponse {
  success: boolean;
  brandDna?: Partial<BrandDna>;
  error?: string;
}

export interface BrandScraperPayload {
  websiteUrl: string;
}

export interface BrandScraperResponse {
  success: boolean;
  extractedBrand?: Partial<BrandDna>;
  error?: string;
}

/**
 * Call backend Cloud Function to rephrase text with brand tone securely
 */
export async function callBrandAiRephrase(
  baseUrl: string | undefined,
  payload: BrandAiRephrasePayload
): Promise<BrandAiRephraseResponse> {
  const url = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/processBrandAiRephrase`
    : '/api/processBrandAiRephrase';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown network error',
    };
  }
}

/**
 * Call backend Cloud Function to generate Brand DNA from interview notes
 */
export async function callBrandAiDiscovery(
  baseUrl: string | undefined,
  payload: BrandAiDiscoveryPayload
): Promise<BrandAiDiscoveryResponse> {
  const url = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/processBrandAiDiscovery`
    : '/api/processBrandAiDiscovery';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown network error',
    };
  }
}

/**
 * Call backend Cloud Function to scrape and extract brand assets from website URL
 */
export async function callBrandScraper(
  baseUrl: string | undefined,
  payload: BrandScraperPayload
): Promise<BrandScraperResponse> {
  const url = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/scrapeBrandFromUrl`
    : '/api/scrapeBrandFromUrl';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown network error',
    };
  }
}
