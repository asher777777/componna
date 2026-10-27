import { KesherApiResponse, CreditCardTransactionRequest, CashTransactionRequest, BitPaymentRequest } from '../types';

/**
 * Functions API Client Wrapper
 * For production cloud function invocations or server-side proxy proxying
 * to prevent exposing sensitive credentials and cards in plain client logs.
 */
export class KesherFunctionsApi {
  private baseEndpoint: string;

  constructor(baseEndpoint = '/api/kesher') {
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * Proxies a credit card charge through a serverless backend function
   */
  public async chargeViaFunction(req: CreditCardTransactionRequest): Promise<KesherApiResponse> {
    try {
      const response = await fetch(`${this.baseEndpoint}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn('[KesherFunctionsApi] chargeViaFunction error:', err);
      throw err;
    }
  }

  /**
   * Proxies manual receipt generation through a serverless backend function
   */
  public async issueReceiptViaFunction(req: CashTransactionRequest): Promise<KesherApiResponse> {
    try {
      const response = await fetch(`${this.baseEndpoint}/manual-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn('[KesherFunctionsApi] issueReceiptViaFunction error:', err);
      throw err;
    }
  }

  /**
   * Proxies Bit payment initiation through a backend function
   */
  public async initiateBitViaFunction(req: BitPaymentRequest): Promise<KesherApiResponse> {
    try {
      const response = await fetch(`${this.baseEndpoint}/bit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn('[KesherFunctionsApi] initiateBitViaFunction error:', err);
      throw err;
    }
  }
}

export const kesherFunctionsApi = new KesherFunctionsApi();
