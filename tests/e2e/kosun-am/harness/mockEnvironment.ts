/**
 * Mock Environment & Test Harness for KOSUN AM E2E Testing
 * 
 * Provides an isolated, opaque-box simulation environment validating
 * all contracts defined in PROJECT.md and ORIGINAL_REQUEST.md.
 */

import { KOSUN_AM_CONTRACTS, deriveScopedCollectionPath, calculateTokenCost, interpolateVariables } from './contractOracle.ts';

export interface EmailDispatchOptions {
  tenantId: string;
  provider: 'resend' | 'sendgrid' | 'smtp_proxy' | 'mock';
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  campaignId?: string;
  automationId?: string;
  metadata?: Record<string, any>;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId: string;
  provider: string;
  recipientCount: number;
  timestamp: string;
  error?: string;
}

export interface AutomationStep {
  id: string;
  type: 'trigger' | 'condition' | 'delay' | 'email_action' | 'whatsapp_action';
  config: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  tenantId: string;
  name: string;
  triggerEvent: string; // 'crm:lead:created' | 'smart_form:submitted' | 'campaign:ambassador:created'
  steps: AutomationStep[];
  isActive: boolean;
}

export class MockFirestoreScope {
  // Key format: `${tenantId}::${collectionName}::${docId}`
  private store: Map<string, any> = new Map();

  setDoc(tenantId: string, collectionName: string, docId: string, data: any): void {
    const key = `${tenantId}::${collectionName}::${docId}`;
    this.store.set(key, { ...data, id: docId, _updatedAt: new Date().toISOString() });
  }

  getDoc(tenantId: string, collectionName: string, docId: string): any | null {
    const key = `${tenantId}::${collectionName}::${docId}`;
    const item = this.store.get(key);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  deleteDoc(tenantId: string, collectionName: string, docId: string): boolean {
    const key = `${tenantId}::${collectionName}::${docId}`;
    return this.store.delete(key);
  }

  queryCollection(tenantId: string, collectionName: string, filter?: (item: any) => boolean): any[] {
    const prefix = `${tenantId}::${collectionName}::`;
    const results: any[] = [];
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith(prefix)) {
        if (!filter || filter(value)) {
          results.push(JSON.parse(JSON.stringify(value)));
        }
      }
    }
    return results;
  }

  clear(): void {
    this.store.clear();
  }

  getRawStorageKeys(): string[] {
    return Array.from(this.store.keys());
  }
}

export class MockEventBus {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  public eventHistory: Array<{ topic: string; data: any; timestamp: string }> = [];

  subscribe(topic: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    const topicSet = this.listeners.get(topic)!;
    topicSet.add(callback);
    return () => {
      topicSet.delete(callback);
      if (topicSet.size === 0) {
        this.listeners.delete(topic);
      }
    };
  }

  publish(topic: string, data: any): void {
    this.eventHistory.push({
      topic,
      data,
      timestamp: new Date().toISOString(),
    });

    const topicSet = this.listeners.get(topic);
    if (topicSet) {
      topicSet.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[MockEventBus] Listener error on topic "${topic}":`, e);
        }
      });
    }
  }

  getHistoryByTopic(topic: string): any[] {
    return this.eventHistory.filter(h => h.topic === topic).map(h => h.data);
  }

  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }
}

export class MockTenantApiKeysRegistry {
  private tenantConfigs: Map<string, { activeModules: string[]; keys: Record<string, string> }> = new Map();

  configureTenant(tenantId: string, activeModules: string[], keys: Record<string, string>): void {
    this.tenantConfigs.set(tenantId, { activeModules, keys });
  }

  isModuleEntitled(tenantId: string, moduleId: string): boolean {
    const config = this.tenantConfigs.get(tenantId);
    if (!config) return false;
    return config.activeModules.includes(moduleId);
  }

  getModuleApiKeys(tenantId: string, moduleId: string): Record<string, string> {
    if (!this.isModuleEntitled(tenantId, moduleId)) {
      return {}; // Empty keys when not entitled
    }
    const config = this.tenantConfigs.get(tenantId);
    return config?.keys || {};
  }
}

export class MockEmailDispatchEngine {
  public dispatchedEmails: Array<EmailDispatchOptions & { result: EmailDispatchResult }> = [];
  public failNextWith: string | null = null;

  async dispatch(options: EmailDispatchOptions): Promise<EmailDispatchResult> {
    if (this.failNextWith) {
      const errorMsg = this.failNextWith;
      this.failNextWith = null;
      const failResult: EmailDispatchResult = {
        success: false,
        messageId: '',
        provider: options.provider,
        recipientCount: Array.isArray(options.to) ? options.to.length : 1,
        timestamp: new Date().toISOString(),
        error: errorMsg,
      };
      this.dispatchedEmails.push({ ...options, result: failResult });
      return failResult;
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const successResult: EmailDispatchResult = {
      success: true,
      messageId,
      provider: options.provider,
      recipientCount: recipients.length,
      timestamp: new Date().toISOString(),
    };

    this.dispatchedEmails.push({ ...options, result: successResult });
    return successResult;
  }

  clear(): void {
    this.dispatchedEmails = [];
    this.failNextWith = null;
  }
}

export class MockWhatsAppGreenApiEngine {
  public sentMessages: Array<{ phone: string; text: string; messageId: string; timestamp: string }> = [];

  async sendMessage(phone: string, text: string): Promise<{ idMessage?: string; error?: string }> {
    if (!phone || phone.trim() === '') {
      return { error: 'Phone number cannot be empty' };
    }
    const messageId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.sentMessages.push({
      phone,
      text,
      messageId,
      timestamp: new Date().toISOString(),
    });
    return { idMessage: messageId };
  }

  clear(): void {
    this.sentMessages = [];
  }
}

export class MockKosaiAiEngine {
  public callCount: number = 0;
  public failModels: Set<string> = new Set();

  async generateEmailContent(
    prompt: string,
    brandContext?: { companyName?: string; voice?: string; powerWords?: string[] },
    preferredModel: string = 'gemini-3.8-flash'
  ): Promise<{
    subject: string;
    body: string;
    modelUsed: string;
    tokensUsed: { input: number; output: number };
    cost: { costUsd: number; costIls: number };
  }> {
    this.callCount++;

    const cascade = [
      preferredModel,
      'gemini-3.5-flash',
      'gemini-3.8-flash-lite',
      'local-mock-copilot',
    ];

    let chosenModel = 'local-mock-copilot';
    for (const model of cascade) {
      if (!this.failModels.has(model)) {
        chosenModel = model;
        break;
      }
    }

    const company = brandContext?.companyName || 'קושאן';
    const subject = `[${company}] הצעת ערך מותאמת אישית: ${prompt.substring(0, 30)}`;
    const body = `<div dir="rtl" style="text-align: right;"><p>שלום רב,</p><p>קושאן דואג שהמייל יגיע ליעד עם התוכן המדויק ביותר עבורך.</p><p>${prompt}</p></div>`;

    const inputTokens = Math.max(12, prompt.length * 2);
    const outputTokens = 150;
    const cost = calculateTokenCost(inputTokens, outputTokens, chosenModel);

    return {
      subject,
      body,
      modelUsed: chosenModel,
      tokensUsed: { input: inputTokens, output: outputTokens },
      cost: { costUsd: cost.costUsd, costIls: cost.costIls },
    };
  }
}

export class TestEnvironmentHarness {
  public db: MockFirestoreScope = new MockFirestoreScope();
  public eventBus: MockEventBus = new MockEventBus();
  public apiKeysRegistry: MockTenantApiKeysRegistry = new MockTenantApiKeysRegistry();
  public emailDispatcher: MockEmailDispatchEngine = new MockEmailDispatchEngine();
  public whatsAppEngine: MockWhatsAppGreenApiEngine = new MockWhatsAppGreenApiEngine();
  public kosaiAi: MockKosaiAiEngine = new MockKosaiAiEngine();

  private automations: Map<string, AutomationRule> = new Map();
  public suppressionList: Set<string> = new Set(); // Suppressed / unsubscribed emails

  registerAutomation(rule: AutomationRule): void {
    this.automations.set(rule.id, rule);
  }

  setupEventListeners(): void {
    // 1. Listen to crm:lead:created
    this.eventBus.subscribe('crm:lead:created', async (lead: any) => {
      await this.processTrigger('crm:lead:created', lead);
    });

    // 2. Listen to smart_form:submitted
    this.eventBus.subscribe('smart_form:submitted', async (formData: any) => {
      await this.processTrigger('smart_form:submitted', formData);
    });

    // 3. Listen to campaign:ambassador:created
    this.eventBus.subscribe('campaign:ambassador:created', async (ambassador: any) => {
      await this.processTrigger('campaign:ambassador:created', ambassador);
    });
  }

  private async processTrigger(triggerEvent: string, eventData: any): Promise<void> {
    for (const automation of this.automations.values()) {
      if (!automation.isActive || automation.triggerEvent !== triggerEvent) continue;

      const recipientEmail = eventData.email || eventData.leadPayload?.email;
      const recipientPhone = eventData.phone || eventData.conta_phone || eventData.leadPayload?.conta_phone;
      const recipientName = eventData.name || eventData.conta_name || eventData.leadPayload?.conta_name || 'לקוח יקר';

      // Unsubscribe check
      if (recipientEmail && this.suppressionList.has(recipientEmail.toLowerCase())) {
        this.db.setDoc(automation.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS, `log_skip_${Date.now()}`, {
          automationId: automation.id,
          recipientEmail,
          status: 'skipped_unsubscribed',
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      for (const step of automation.steps) {
        if (step.type === 'condition') {
          const field = step.config.field;
          const expectedVal = step.config.equals;
          const actualVal = eventData[field] || eventData.data?.[field];
          if (actualVal !== expectedVal) {
            // Condition failed, stop workflow
            break;
          }
        }

        if (step.type === 'email_action') {
          if (!recipientEmail) {
            this.eventBus.publish('email:delivery:failed', {
              automationId: automation.id,
              recipientEmail: '',
              reason: 'Missing recipient email',
              timestamp: new Date().toISOString(),
            });
            continue;
          }

          const rawSubject = step.config.subject || 'הודעה מקושאן';
          const rawHtml = step.config.html || '<p>שלום {{conta_name}}</p>';

          const vars = {
            conta_name: recipientName,
            email: recipientEmail,
            shareUrl: eventData.shareUrl || '',
            ...eventData.data,
          };

          const subject = interpolateVariables(rawSubject, vars);
          const html = interpolateVariables(rawHtml, vars);

          const result = await this.emailDispatcher.dispatch({
            tenantId: automation.tenantId,
            provider: 'mock',
            to: recipientEmail,
            subject,
            html,
            automationId: automation.id,
          });

          // Log in Scoped Firestore
          const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          this.db.setDoc(automation.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS, logId, {
            automationId: automation.id,
            recipientEmail,
            status: result.success ? 'delivered' : 'failed',
            provider: result.provider,
            messageId: result.messageId,
            error: result.error,
            timestamp: result.timestamp,
          });

          if (result.success) {
            this.eventBus.publish('email:automation:triggered', {
              automationId: automation.id,
              triggerEvent,
              recipientEmail,
              actionTaken: 'email_dispatched',
              timestamp: result.timestamp,
            });
          } else {
            this.eventBus.publish('email:delivery:failed', {
              automationId: automation.id,
              recipientEmail,
              reason: result.error || 'Unknown dispatch error',
              timestamp: result.timestamp,
            });
          }
        }

        if (step.type === 'whatsapp_action') {
          if (recipientPhone) {
            const rawText = step.config.text || 'שלום {{conta_name}}';
            const vars = {
              conta_name: recipientName,
              shareUrl: eventData.shareUrl || '',
              ...eventData.data,
            };
            const text = interpolateVariables(rawText, vars);
            await this.whatsAppEngine.sendMessage(recipientPhone, text);
          }
        }
      }
    }
  }

  reset(): void {
    this.db.clear();
    this.eventBus.clear();
    this.emailDispatcher.clear();
    this.whatsAppEngine.clear();
    this.automations.clear();
    this.suppressionList.clear();
  }
}
