import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';

export interface NedarimTransactionInput {
  amount: number;
  paymentType: 'credit' | 'bit';
  clientName: string;
  phone: string;
  mail: string;
  redirectUrl?: string;
  receiptType?: string;
  isRecurring?: boolean;
  installments?: number;
}

export interface NedarimManualInvoiceInput {
  clientName: string;
  amount: number;
  paymentType: 'Cash' | 'Check' | 'BankTransfer' | 'Credit';
  receiptType: string;
  zeout?: string;
  phone?: string;
  details?: string;
  date?: string;
  checkNumber?: string;
  bankName?: string;
  branchNumber?: string;
  accountNumber?: string;
  transferRef?: string;
  cardType?: string;
  last4Digits?: string;
}

class NedarimService {
  private getProxyUrl(): string {
    return '/api/nedarim-proxy';
  }

  private getTenantId(explicitTenantId?: string): string {
    return explicitTenantId || (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master';
  }

  private async callProxy<T = any>(action: string, payload: Record<string, any> = {}, credentials?: Record<string, any>, tenantId?: string): Promise<T> {
    const res = await fetch(this.getProxyUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        tenantId: this.getTenantId(tenantId),
        payload,
        credentials,
      }),
    });
    if (!res.ok) {
      throw new Error(`Nedarim proxy HTTP ${res.status}`);
    }
    return res.json();
  }

  async createTransaction(data: NedarimTransactionInput, tenantId?: string) {
    return this.callProxy('createTransaction', {
      ...data,
      redirectUrl: data.redirectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/nedarim-callback` : ''),
    }, undefined, tenantId);
  }

  async checkBitTransaction(transactionId: string, tenantId?: string) {
    return this.callProxy('checkBitTransaction', { transactionId }, undefined, tenantId);
  }

  async getKupot(credentials?: { mosadid?: string; apivalid?: string; apipassword?: string }, tenantId?: string) {
    return this.callProxy<{ success: boolean; data?: any[]; error?: string }>('getKupot', {}, credentials, tenantId);
  }

  async testConnection(credentials?: { mosadid?: string; apivalid?: string; apipassword?: string }, tenantId?: string) {
    return this.callProxy<{ success: boolean; data?: any; error?: string }>('testConnection', {}, credentials, tenantId);
  }

  async createManualInvoice(data: NedarimManualInvoiceInput, tenantId?: string) {
    return this.callProxy<{ success: boolean; message?: string; error?: string; achnasotId?: string }>(
      'createManualInvoice',
      data,
      undefined,
      tenantId
    );
  }
}

export const nedarimService = new NedarimService();
