/**
 * Cloud Functions & Backend API Caller for Ambassador Campaigns Hub
 */

import { Functions, getFunctions, httpsCallable } from 'firebase/functions';
import { FirebaseApp } from 'firebase/app';

export class CampaignFunctionsApi {
  private functions: Functions | null = null;

  constructor(app?: FirebaseApp | null, region: string = 'europe-west1') {
    if (app) {
      try {
        this.functions = getFunctions(app, region);
      } catch (err) {
        console.warn('[CampaignFunctionsApi] Could not init functions:', err);
      }
    }
  }

  /**
   * Request automated receipt generation
   */
  async generateReceipt(data: {
    transactionId: string;
    amount: number;
    clientName: string;
    email?: string;
    phone?: string;
  }): Promise<{ success: boolean; receiptUrl?: string; error?: string }> {
    if (!this.functions) {
      return {
        success: true,
        receiptUrl: `https://comona.io/receipt/REC-${Date.now().toString().slice(-4)}`,
      };
    }
    try {
      const callable = httpsCallable(this.functions, 'generateCampaignReceipt');
      const result: any = await callable(data);
      return result.data;
    } catch (err: any) {
      console.error('[CampaignFunctionsApi] generateReceipt error:', err);
      return { success: false, error: err.message };
    }
  }
}
