/**
 * KOSUN AM (קושאן מייל אוטומטי) - Module Context & State Provider
 * 12-Layer Scaffolding Layer 3: Central reactive state, Scoped Firestore sync, EventBus listeners & DI
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Firestore, getFirestore } from 'firebase/firestore';
import {
  EmailCampaign,
  EmailTemplate,
  EmailAutomation,
  EmailDeliveryLog,
  EmailProviderType,
  DispatchResult,
  AiGenerationResult,
  KosunAmModuleConfig,
  KosunAmContextValue,
} from '../types';
import {
  MOCK_CAMPAIGNS,
  MOCK_TEMPLATES,
  MOCK_AUTOMATIONS,
  MOCK_LOGS,
  KOSUN_AM_EVENT_TOPICS,
} from '../config';
import { EmailFirestoreService } from '../services/emailFirestoreService';
import { EmailDispatchService } from '../services/emailDispatchService';
import { KosaiEmailAiService } from '../services/kosaiEmailAiService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { eventBus } from '../../../core/bridge/EventBus';

const KosunAmContext = createContext<KosunAmContextValue | null>(null);

export interface KosunAmProviderProps {
  config?: KosunAmModuleConfig;
  children: React.ReactNode;
}

export const KosunAmProvider: React.FC<KosunAmProviderProps> = ({ config, children }) => {
  // Safe extraction of System Connection and Tenant Scope
  let systemDb: Firestore | undefined;
  let activeTenantId = '_master';

  try {
    const sys = useSystemConnection();
    systemDb = sys?.db;
    if (!systemDb && config?.firebaseApp) {
      systemDb = getFirestore(config.firebaseApp);
    }
  } catch {
    if (config?.firebaseApp) {
      try {
        systemDb = getFirestore(config.firebaseApp);
      } catch {
        systemDb = undefined;
      }
    }
  }

  try {
    const scope = useTenantScope();
    if (scope?.tenantId) {
      activeTenantId = scope.tenantId;
    }
  } catch {
    activeTenantId = '_master';
  }

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(MOCK_CAMPAIGNS);
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES);
  const [automations, setAutomations] = useState<EmailAutomation[]>(MOCK_AUTOMATIONS);
  const [logs, setLogs] = useState<EmailDeliveryLog[]>(MOCK_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeProvider, setActiveProvider] = useState<EmailProviderType>('resend');

  // Instantiate services
  const firestoreService = useMemo(
    () => new EmailFirestoreService(systemDb, activeTenantId),
    [systemDb, activeTenantId]
  );
  const dispatchService = useMemo(() => new EmailDispatchService(), []);
  const aiService = useMemo(() => new KosaiEmailAiService(), []);

  // Refresh all state
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cmp, tpl, aut, lg] = await Promise.all([
        firestoreService.getCampaigns(),
        firestoreService.getTemplates(),
        firestoreService.getAutomations(),
        firestoreService.getLogs(),
      ]);
      setCampaigns(cmp);
      setTemplates(tpl);
      setAutomations(aut);
      setLogs(lg);
    } catch (err) {
      console.warn('[Kosun AM] Failed to refresh state, preserving current state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [firestoreService]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // EventBus Subscribers: Inbound CRM, Forms, Ambassador
  useEffect(() => {
    const unsubLead = eventBus.subscribe(KOSUN_AM_EVENT_TOPICS.CRM_LEAD_CREATED, async (lead) => {
      if (!lead?.email) return;
      console.log('[Kosun AM] EventBus lead received:', lead.email);
      // Run active automations matching this trigger
      const matching = automations.filter(
        (a) => a.isActive && a.trigger.event === 'crm:lead:created'
      );
      for (const auto of matching) {
        eventBus.publish(KOSUN_AM_EVENT_TOPICS.AUTOMATION_TRIGGERED, {
          automationId: auto.id,
          triggerEvent: 'crm:lead:created',
          recipientEmail: lead.email,
          actionTaken: 'lead_welcome_dispatched',
          timestamp: new Date().toISOString(),
        });
      }
    });

    const unsubForm = eventBus.subscribe(KOSUN_AM_EVENT_TOPICS.SMART_FORM_SUBMITTED, async (evt) => {
      const email = evt?.data?.email || evt?.leadPayload?.email;
      if (!email) return;
      console.log('[Kosun AM] EventBus smart form submitted:', email);
      const matching = automations.filter(
        (a) => a.isActive && a.trigger.event === 'smart_form:submitted'
      );
      for (const auto of matching) {
        eventBus.publish(KOSUN_AM_EVENT_TOPICS.AUTOMATION_TRIGGERED, {
          automationId: auto.id,
          triggerEvent: 'smart_form:submitted',
          recipientEmail: email,
          actionTaken: 'form_autoresponder_dispatched',
          timestamp: new Date().toISOString(),
        });
      }
    });

    const unsubAmbassador = eventBus.subscribe(
      KOSUN_AM_EVENT_TOPICS.AMBASSADOR_CREATED,
      async (evt) => {
        if (!evt?.email) return;
        console.log('[Kosun AM] EventBus ambassador created:', evt.email);
      }
    );

    return () => {
      unsubLead();
      unsubForm();
      unsubAmbassador();
    };
  }, [automations]);

  // Actions
  const createCampaign = useCallback(
    async (data: Partial<EmailCampaign>): Promise<string> => {
      const id = await firestoreService.saveCampaign(data);
      await refreshAll();
      return id;
    },
    [firestoreService, refreshAll]
  );

  const updateCampaign = useCallback(
    async (id: string, data: Partial<EmailCampaign>): Promise<void> => {
      await firestoreService.saveCampaign({ ...data, id });
      await refreshAll();
    },
    [firestoreService, refreshAll]
  );

  const deleteCampaign = useCallback(
    async (id: string): Promise<void> => {
      await firestoreService.deleteCampaign(id);
      await refreshAll();
    },
    [firestoreService, refreshAll]
  );

  const dispatchCampaign = useCallback(
    async (id: string): Promise<DispatchResult> => {
      const campaign = campaigns.find((c) => c.id === id);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      await firestoreService.saveCampaign({ id, status: 'sending' });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'sending' } : c))
      );

      const result = await dispatchService.send(
        {
          to: campaign.audience.manualEmails || ['demo@kosun.pro'],
          subject: campaign.subject,
          htmlContent: campaign.htmlContent,
          textContent: campaign.textContent,
          fromName: campaign.fromName,
          fromAddress: campaign.fromEmail,
          campaignId: id,
        },
        activeProvider
      );

      const now = new Date().toISOString();
      const updatedStats = {
        ...campaign.stats,
        totalRecipients: (campaign.stats?.totalRecipients || 0) + result.dispatchedCount,
        deliveredCount: (campaign.stats?.deliveredCount || 0) + (result.success ? result.dispatchedCount : 0),
      };

      await firestoreService.saveCampaign({
        id,
        status: result.success ? 'sent' : 'failed',
        sentAt: now,
        stats: updatedStats,
        provider: result.provider,
      });

      await firestoreService.addLog({
        campaignId: id,
        recipientEmail: Array.isArray(campaign.audience.manualEmails) && campaign.audience.manualEmails[0] ? campaign.audience.manualEmails[0] : 'broadcast@kosun.pro',
        subject: campaign.subject,
        status: result.success ? 'delivered' : 'failed',
        provider: result.provider,
        messageId: result.messageId,
        dispatchedAt: now,
      });

      // Publish Outbound Event
      eventBus.publish(KOSUN_AM_EVENT_TOPICS.CAMPAIGN_SENT, {
        campaignId: id,
        campaignTitle: campaign.name,
        recipientCount: result.dispatchedCount,
        sentAt: now,
      });

      await refreshAll();
      return result;
    },
    [campaigns, firestoreService, dispatchService, activeProvider, refreshAll]
  );

  const saveTemplate = useCallback(
    async (data: Partial<EmailTemplate>): Promise<string> => {
      const id = await firestoreService.saveTemplate(data);
      await refreshAll();
      return id;
    },
    [firestoreService, refreshAll]
  );

  const deleteTemplate = useCallback(
    async (id: string): Promise<void> => {
      await firestoreService.deleteTemplate(id);
      await refreshAll();
    },
    [firestoreService, refreshAll]
  );

  const saveAutomation = useCallback(
    async (data: Partial<EmailAutomation>): Promise<string> => {
      const id = await firestoreService.saveAutomation(data);
      await refreshAll();
      return id;
    },
    [firestoreService, refreshAll]
  );

  const toggleAutomation = useCallback(
    async (id: string, active: boolean): Promise<void> => {
      await firestoreService.saveAutomation({ id, isActive: active });
      await refreshAll();
    },
    [firestoreService, refreshAll]
  );

  const generateAiContent = useCallback(
    async (prompt: string, context?: Record<string, unknown>): Promise<AiGenerationResult> => {
      return aiService.generateMarketingContent(prompt, context);
    },
    [aiService]
  );

  const value: KosunAmContextValue = {
    tenantId: activeTenantId,
    campaigns,
    templates,
    automations,
    logs,
    isLoading,
    activeProvider,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    dispatchCampaign,
    saveTemplate,
    deleteTemplate,
    saveAutomation,
    toggleAutomation,
    generateAiContent,
    refreshAll,
  };

  return <KosunAmContext.Provider value={value}>{children}</KosunAmContext.Provider>;
};

export const useKosunAmContext = (): KosunAmContextValue => {
  const ctx = useContext(KosunAmContext);
  if (!ctx) {
    throw new Error('useKosunAmContext must be used within a KosunAmProvider');
  }
  return ctx;
};
