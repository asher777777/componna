import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { KosaiRule, KosaiMessage, KosaiCapability, KosaiActionPayload, KosaiConversation } from '../types';
import { kosaiRulesService, kosaiConversationsService } from '../services/kosaiFirestoreService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { useBrandDna } from '../../brand-dna-hub/context/BrandDnaContext';
import { callGeminiApi } from '../api/kosaiApi';
import { buildKosaiSystemPrompt } from '../prompts';
import { eventBus } from '../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { KosaiAgentContract } from '../../../core/contracts';
import { kosaiImageAgentService } from '../services/kosaiImageAgentService';

const DEFAULT_WELCOME_MSG: KosaiMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'היי! אני קושאן AI. העוזר והשותף החכם שלך. מחובר כעת ל-Brand DNA ומודע לכל הרשאות העיצוב והמערכת שלך. מה נרצה לעצב או לעדכן היום?',
  timestamp: new Date()
};

interface KosaiContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: KosaiMessage[];
  sendMessage: (content: string, imageBase64?: string) => Promise<void>;
  clearChat: () => Promise<void>;
  currentRule: KosaiRule | null;
  setCurrentRule: React.Dispatch<React.SetStateAction<KosaiRule | null>>;
  triggerMediaGallery: () => void;
  activeConversationId: string | null;
  conversations: KosaiConversation[];
  loadConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  startNewConversation: () => void;
  refreshConversations: () => Promise<void>;
  refreshRules: () => Promise<void>;
  cachedContentId?: string | null;
}

const KosaiContext = createContext<KosaiContextValue | undefined>(undefined);

export const KosaiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<KosaiMessage[]>([DEFAULT_WELCOME_MSG]);
  const [currentRule, setCurrentRule] = useState<KosaiRule | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<KosaiConversation[]>([]);
  const [cachedContentId, setCachedContentId] = useState<string | null>(null);
  
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { brandDna } = useBrandDna();
  const { registerCapability, unregisterCapability } = useHostCapabilities();

  // Register kosai-agent AI capability for cross-module orchestration
  useEffect(() => {
    const contract: KosaiAgentContract = {
      generateImage: (opts) => kosaiImageAgentService.generateImage({ ...opts, brandDna: opts.brandDna || brandDna }),
      generateBrandLogo: (opts) => kosaiImageAgentService.generateBrandLogo({ ...opts, brandDna: opts.brandDna || brandDna }),
      generateBrandVibeImage: (opts) => kosaiImageAgentService.generateBrandVibeImage({ ...opts, brandDna: opts.brandDna || brandDna }),
      editImageWithAi: (opts) => kosaiImageAgentService.editImageWithAi({ ...opts, brandDna: opts.brandDna || brandDna }),
      enhancePromptWithBrandContext: (prompt, type, bDna) => kosaiImageAgentService.enhancePromptWithBrandContext(prompt, type, bDna || brandDna),
    };
    registerCapability('kosai-agent', contract);
    return () => {
      unregisterCapability('kosai-agent');
    };
  }, [brandDna, registerCapability, unregisterCapability]);

  // Route listening & Rule detection
  const refreshRules = useCallback(async () => {
    if (!db || !tenantId) return;
    try {
      const path = window.location.hash || window.location.pathname;
      const rules = await kosaiRulesService.getRules(db, tenantId);
      
      const activeRule = rules.find(r => r.isActive && (path.includes(r.slugPattern.replace('*', '')) || (r.moduleId === 'page-builder' && path.includes('page-builder'))));
      setCurrentRule(activeRule || null);
    } catch (err) {
      console.warn('[KosaiContext] Failed to load rules:', err);
    }
  }, [db, tenantId]);

  useEffect(() => {
    refreshRules();
  }, [refreshRules]);

  // Load conversations list for this tenant
  const refreshConversations = useCallback(async () => {
    if (!db || !tenantId) return;
    try {
      const list = await kosaiConversationsService.getConversations(db, tenantId);
      setConversations(list);
    } catch (err) {
      console.warn('[KosaiContext] Failed to load conversations:', err);
    }
  }, [db, tenantId]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load active conversation on mount (persists across drawer closes and page reloads)
  useEffect(() => {
    if (!db || !tenantId) return;
    const initActiveChat = async () => {
      const savedConvId = localStorage.getItem(`kosai_active_conv_${tenantId}`);
      if (savedConvId) {
        try {
          const conv = await kosaiConversationsService.getConversation(db, tenantId, savedConvId);
          if (conv && conv.status !== 'deleted' && conv.messages?.length > 0) {
            setActiveConversationId(conv.id);
            setMessages(conv.messages);
            setCachedContentId(conv.cachedContentId || null);
            return;
          }
        } catch (e) {
          console.warn('[KosaiContext] Could not load saved conversation:', e);
        }
      }
    };
    initActiveChat();
  }, [db, tenantId]);

  // Listen to open_chat event from external buttons
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('kosai:open_chat', handleOpen);
    return () => window.removeEventListener('kosai:open_chat', handleOpen);
  }, []);

  // Point ג: Clear chat = Throw current conversation to TRASH and start fresh!
  const clearChat = async () => {
    if (activeConversationId && db && tenantId) {
      try {
        await kosaiConversationsService.deleteConversation(db, tenantId, activeConversationId);
      } catch (err) {
        console.warn('[KosaiContext] Failed to delete conversation from Firestore:', err);
      }
    }
    localStorage.removeItem(`kosai_active_conv_${tenantId}`);
    setActiveConversationId(null);
    setCachedContentId(null);
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'השיחה נמחקה בהצלחה. התחלנו שיחה חדשה ונקייה! איך אפשר לעזור?',
        timestamp: new Date()
      }
    ]);
    refreshConversations();
  };

  // Start new conversation without necessarily deleting the previous one from history
  const startNewConversation = () => {
    localStorage.removeItem(`kosai_active_conv_${tenantId}`);
    setActiveConversationId(null);
    setCachedContentId(null);
    setMessages([DEFAULT_WELCOME_MSG]);
  };

  // Load specific conversation from history (Point ג)
  const loadConversation = async (conversationId: string) => {
    if (!db || !tenantId) return;
    try {
      const conv = await kosaiConversationsService.getConversation(db, tenantId, conversationId);
      if (conv) {
        setActiveConversationId(conv.id);
        setMessages(conv.messages);
        setCachedContentId(conv.cachedContentId || null);
        localStorage.setItem(`kosai_active_conv_${tenantId}`, conv.id);
      }
    } catch (err) {
      console.warn('[KosaiContext] Failed to load conversation:', err);
    }
  };

  // Delete a specific conversation from history
  const deleteConversation = async (conversationId: string) => {
    if (!db || !tenantId) return;
    try {
      await kosaiConversationsService.deleteConversation(db, tenantId, conversationId);
      if (activeConversationId === conversationId) {
        startNewConversation();
      }
      refreshConversations();
    } catch (err) {
      console.warn('[KosaiContext] Failed to delete conversation:', err);
    }
  };

  const triggerMediaGallery = () => {
    eventBus.publish('media:request_picker', {
      onSelect: (url: string) => {
        sendMessage(`בבקשה תשתמש בתמונה הזו מהספרייה שלי: ${url}`);
      }
    });
  };

  const sendMessage = async (content: string, imageBase64?: string) => {
    const userMsgId = Date.now().toString();
    const newUserMsg: KosaiMessage = {
      id: userMsgId,
      role: 'user',
      content,
      imageUrl: imageBase64,
      timestamp: new Date()
    };

    // Ensure conversation exists or create one
    let currentConvId = activeConversationId;
    let convTitle = content.trim().slice(0, 35) || 'שיחה עם קושאן';
    if (!currentConvId) {
      currentConvId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveConversationId(currentConvId);
      if (tenantId) {
        localStorage.setItem(`kosai_active_conv_${tenantId}`, currentConvId);
      }
    } else {
      const found = conversations.find(c => c.id === currentConvId);
      if (found) convTitle = found.title;
    }

    const updatedMessagesWithUser = [...messages, newUserMsg];
    setMessages(updatedMessagesWithUser);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { 
      id: assistantMsgId, 
      role: 'assistant', 
      content: 'מעבד נתונים ומבצע...', 
      timestamp: new Date(), 
      isLoading: true 
    }]);

    try {
      // Point א: Check capabilities and make sure agent is 100% aware of them
      const isPageBuilderRoute = window.location.hash.includes('page-builder') || 
                                 window.location.pathname.includes('page-builder') || 
                                 currentRule?.moduleId === 'page-builder';

      let capabilities: string[] = currentRule?.enabledCapabilities && currentRule.enabledCapabilities.length > 0
        ? [...currentRule.enabledCapabilities]
        : [];

      // If in page-builder, ensure design & builder capabilities are enabled
      if (isPageBuilderRoute || capabilities.length === 0) {
        const pageBuilderCaps = ['ADD_SECTION', 'UPDATE_SECTION', 'UPDATE_GLOBAL_SETTINGS', 'UPDATE_SEO'];
        for (const cap of pageBuilderCaps) {
          if (!capabilities.includes(cap)) {
            capabilities.push(cap);
          }
        }
      }

      // Point ג: Pass conversation history and cachedContentId (Gemini Cache / Multi-turn)
      const historyForApi = updatedMessagesWithUser.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await callGeminiApi({
        prompt: content,
        systemInstruction: buildKosaiSystemPrompt(currentRule, brandDna, capabilities),
        imageBase64,
        history: historyForApi,
        cachedContentId: cachedContentId || undefined
      });

      if (!response || !response.data) throw new Error('No AI response');
      
      // Update cachedContentId if returned by Gemini API
      if (response.cachedContentId) {
        setCachedContentId(response.cachedContentId);
      }

      // LOG USAGE TO FIRESTORE
      if (db && tenantId && currentRule) {
        kosaiRulesService.logAiUsage(db, tenantId, {
          ruleId: currentRule.id,
          moduleName: currentRule.moduleId || 'page-builder',
          actionType: 'CHAT_MESSAGE',
          usage: response.usageReport
        }).catch(console.error);
      }
      
      const parsed = response.data;

      // Execute action via EventBus if action was specified and is not NONE
      if (parsed.action && parsed.action !== 'NONE') {
        eventBus.publish('kosai:action', {
          action: parsed.action,
          payload: parsed.payload
        });
      }

      const finalAssistantMsg: KosaiMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: parsed.message || 'בוצע בהצלחה!',
        timestamp: new Date(),
        isLoading: false
      };

      const finalMessagesList = [...updatedMessagesWithUser, finalAssistantMsg];
      setMessages(finalMessagesList);

      // Point ב & ג: Save conversation state under tenants/{tenantId}/kosai_conversations
      if (db && tenantId && currentConvId) {
        const updatedConversation: KosaiConversation = {
          id: currentConvId,
          tenantId,
          moduleId: currentRule?.moduleId || 'page-builder',
          title: convTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          cachedContentId: response.cachedContentId || cachedContentId || undefined,
          status: 'active',
          messages: finalMessagesList
        };

        kosaiConversationsService.saveConversation(db, tenantId, updatedConversation)
          .then(() => refreshConversations())
          .catch(err => console.warn('[KosaiContext] Failed saving conversation to Firestore:', err));
      }
    } catch (err) {
      console.error('[KosaiContext] Error processing message:', err);
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: 'אופס, אירעה שגיאה בעיבוד הבקשה. אנא נסה שוב.', isLoading: false }
          : m
      ));
    }
  };

  return (
    <KosaiContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      messages, 
      sendMessage, 
      clearChat, 
      currentRule, 
      setCurrentRule,
      triggerMediaGallery,
      activeConversationId,
      conversations,
      loadConversation,
      deleteConversation,
      startNewConversation,
      refreshConversations,
      refreshRules,
      cachedContentId
    }}>
      {children}
    </KosaiContext.Provider>
  );
};

export const useKosai = () => {
  const context = useContext(KosaiContext);
  if (!context) throw new Error('useKosai must be used within KosaiProvider');
  return context;
};

