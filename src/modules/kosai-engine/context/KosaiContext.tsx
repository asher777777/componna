import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { KosaiRule, KosaiMessage, KosaiCapability, KosaiActionPayload, KosaiConversation } from '../types';
import { kosaiRulesService, kosaiConversationsService } from '../services/kosaiFirestoreService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { useBrandDna } from '../../KosBranding/context/BrandDnaContext';
import { callGeminiApi } from '../api/kosaiApi';
import { buildKosaiSystemPrompt, KosaiPromptContext } from '../prompts';
import { eventBus } from '../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { KosaiAgentContract, MediaPickerContract } from '../../../core/contracts';
import { kosaiImageAgentService } from '../services/kosaiImageAgentService';
import { kosaiDataGroundingService } from '../services/kosaiDataGroundingService';
import { kosaiContactAutoSyncService } from '../services/kosaiContactAutoSyncService';
import { subscribeToAuth, AuthState } from '../../../services/firebaseAuth';
import { pageBuilderFirestore } from '../../KosWebAi/services/pageBuilderFirestore';
import { 
  MODULE_AGENTS_MAP, 
  resolveActiveModule, 
  createDefaultRuleForModule, 
  ModuleAgentMeta 
} from '../config/moduleAgents';

interface KosaiContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: KosaiMessage[];
  sendMessage: (content: string, imageBase64?: string) => Promise<void>;
  clearChat: () => Promise<void>;
  currentRule: KosaiRule | null;
  setCurrentRule: React.Dispatch<React.SetStateAction<KosaiRule | null>>;
  activeModule: ModuleAgentMeta;
  triggerMediaGallery: () => void;
  openMediaPicker: () => Promise<string | null>;
  saveCurrentConversation: () => Promise<boolean>;
  activeConversationId: string | null;
  conversations: KosaiConversation[];
  loadConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  startNewConversation: () => void;
  refreshConversations: () => Promise<void>;
  refreshRules: () => Promise<void>;
  cachedContentId?: string | null;
  isLoggedIn: boolean;
  isEditMode: boolean;
  setIsEditMode: (isEdit: boolean) => void;
  activeRoleMode: 'editor' | 'support_sales';
  pageSections?: Array<{ id: string; type: string; title?: string }>;
  setPageSections: (sections: Array<{ id: string; type: string; title?: string }>) => void;
}

const KosaiContext = createContext<KosaiContextValue | undefined>(undefined);

export const KosaiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<KosaiMessage[]>([]);
  const [currentRule, setCurrentRule] = useState<KosaiRule | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<KosaiConversation[]>([]);
  const [cachedContentId, setCachedContentId] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [tenantPages, setTenantPages] = useState<Array<{ title: string; slug: string; isHomePage?: boolean }>>([]);
  const [pageSections, setPageSections] = useState<Array<{ id: string; type: string; title?: string }>>([]);
  
  const { db, firebaseApp } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { brandDna } = useBrandDna();
  const brandDnaRef = useRef(brandDna);
  useEffect(() => {
    brandDnaRef.current = brandDna;
  }, [brandDna]);
  const { registerCapability, unregisterCapability, getCapability } = useHostCapabilities();

  // Location listening for dynamic module synchronization
  const location = useLocation();
  const currentPath = location.pathname;

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('edit') === 'true';
    }
    return false;
  });

  const isLoggedIn = Boolean(authState?.isAuthenticated && (authState.role === 'admin' || authState.role === 'editor'));
  const [forcedModuleId, setForcedModuleId] = useState<string | null>(null);

  // Active module synchronization based on URL pathname & auth
  const activeModule = useMemo(() => {
    if (forcedModuleId && MODULE_AGENTS_MAP[forcedModuleId]) {
      return MODULE_AGENTS_MAP[forcedModuleId];
    }
    return resolveActiveModule(currentPath, isLoggedIn, isEditMode);
  }, [currentPath, isLoggedIn, isEditMode, forcedModuleId]);

  // Active role mode: 'editor' when logged in / editing or backoffice; 'support_sales' for public guests
  const activeRoleMode: 'editor' | 'support_sales' = useMemo(() => {
    if (!isLoggedIn && !isEditMode) return 'support_sales';
    if (activeModule.moduleId === 'public-site') return 'support_sales';
    return 'editor';
  }, [activeModule.moduleId, isLoggedIn, isEditMode]);

  useEffect(() => {
    const handleSetAgentMode = (e: any) => {
      const targetModule = e?.detail?.moduleId || 'KosWebAi';
      setForcedModuleId(targetModule);
    };
    window.addEventListener('kosai_set_agent_mode', handleSetAgentMode);
    return () => window.removeEventListener('kosai_set_agent_mode', handleSetAgentMode);
  }, []);

  useEffect(() => {
    const handleEditModeChange = (e: any) => {
      if (typeof e?.detail?.isEditMode === 'boolean') {
        setIsEditMode(e.detail.isEditMode);
      }
    };
    window.addEventListener('kosun_edit_mode_changed', handleEditModeChange);
    return () => window.removeEventListener('kosun_edit_mode_changed', handleEditModeChange);
  }, []);

  // Subscribe to auth state
  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  // Load tenant published pages for public visitor sales and support context
  useEffect(() => {
    let mounted = true;
    pageBuilderFirestore.getAllPages(db, tenantId)
      .then((pages) => {
        if (mounted && pages) {
          const mapped = pages.map((p) => ({
            title: p.pageTitle || 'עמוד',
            slug: p.slug || p.pageId,
            isHomePage: Boolean(p.isHomePage),
          }));
          setTenantPages(mapped);
        }
      })
      .catch((err) => console.warn('[KosaiContext] Failed loading tenant pages:', err));

    return () => {
      mounted = false;
    };
  }, [db, tenantId]);

  // Set initial or module-updated welcome message
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 0 || (prev.length === 1 && prev[0].id === 'welcome')) {
        return [{
          id: 'welcome',
          role: 'assistant',
          content: activeModule.welcomeMessage,
          timestamp: new Date()
        }];
      }
      return prev;
    });
  }, [activeModule]);

  // Register kosai-agent AI capability for cross-module orchestration (uses stable brandDnaRef)
  useEffect(() => {
    const contract: KosaiAgentContract = {
      generateImage: (opts) => kosaiImageAgentService.generateImage({ ...opts, brandDna: opts.brandDna || brandDnaRef.current }),
      generateBrandLogo: (opts) => kosaiImageAgentService.generateBrandLogo({ ...opts, brandDna: opts.brandDna || brandDnaRef.current }),
      generateBrandVibeImage: (opts) => kosaiImageAgentService.generateBrandVibeImage({ ...opts, brandDna: opts.brandDna || brandDnaRef.current }),
      editImageWithAi: (opts) => kosaiImageAgentService.editImageWithAi({ ...opts, brandDna: opts.brandDna || brandDnaRef.current }),
      enhancePromptWithBrandContext: (prompt, type, bDna) => kosaiImageAgentService.enhancePromptWithBrandContext(prompt, type, bDna || brandDnaRef.current),
    };
    registerCapability('kosai-agent', contract);
    return () => {
      unregisterCapability('kosai-agent');
    };
  }, [registerCapability, unregisterCapability]);

  // Route & Module listening - Rule detection synchronized with active component
  const refreshRules = useCallback(async () => {
    if (!db || !tenantId) return;
    try {
      const rules = await kosaiRulesService.getRules(db, tenantId);
      
      const matched = rules.find(r => 
        r.isActive && (
          r.moduleId === activeModule.moduleId ||
          (r.slugPattern && currentPath.includes(r.slugPattern.replace('*', '')))
        )
      );

      if (matched) {
        setCurrentRule(matched);
      } else {
        // Fallback to active module's standard default rule
        setCurrentRule(createDefaultRuleForModule(activeModule));
      }
    } catch (err) {
      console.warn('[KosaiContext] Failed to load rules, using default module rule:', err);
      setCurrentRule(createDefaultRuleForModule(activeModule));
    }
  }, [db, tenantId, activeModule, currentPath]);

  useEffect(() => {
    refreshRules();
  }, [refreshRules]);

  // Load conversations list for this tenant
  const refreshConversations = useCallback(async () => {
    if (!db || !tenantId) return;
    try {
      const list = await kosaiConversationsService.getConversations(db, tenantId, activeModule.moduleId);
      setConversations(list);
    } catch (err) {
      console.warn('[KosaiContext] Failed to load conversations:', err);
    }
  }, [db, tenantId, activeModule.moduleId]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load active conversation on mount or module switch
  useEffect(() => {
    if (!db || !tenantId) return;
    const initActiveChat = async () => {
      const savedConvId = localStorage.getItem(`kosai_active_conv_${tenantId}_${activeModule.moduleId}`);
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
      // If none saved, set clean welcome message for active module
      setActiveConversationId(null);
      setCachedContentId(null);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: activeModule.welcomeMessage,
        timestamp: new Date()
      }]);
    };
    initActiveChat();
  }, [db, tenantId, activeModule.moduleId]);

  // Listen to open_chat event from external buttons
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('kosai:open_chat', handleOpen);
    return () => window.removeEventListener('kosai:open_chat', handleOpen);
  }, []);

  // Clear chat / Delete current conversation and start fresh
  const clearChat = async () => {
    if (activeConversationId && db && tenantId) {
      try {
        await kosaiConversationsService.deleteConversation(db, tenantId, activeConversationId);
      } catch (err) {
        console.warn('[KosaiContext] Failed to delete conversation from Firestore:', err);
      }
    }
    localStorage.removeItem(`kosai_active_conv_${tenantId}_${activeModule.moduleId}`);
    setActiveConversationId(null);
    setCachedContentId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: activeModule.welcomeMessage,
        timestamp: new Date()
      }
    ]);
    refreshConversations();
  };

  // Start new conversation without deleting previous from history
  const startNewConversation = () => {
    localStorage.removeItem(`kosai_active_conv_${tenantId}_${activeModule.moduleId}`);
    setActiveConversationId(null);
    setCachedContentId(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: activeModule.welcomeMessage,
      timestamp: new Date()
    }]);
  };

  // Explicit Save Conversation to Firestore
  const saveCurrentConversation = async (): Promise<boolean> => {
    if (!db || !tenantId) return false;
    let currentConvId = activeConversationId;
    let convTitle = `שיחה עם ${activeModule.name}`;
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      convTitle = firstUserMsg.content.trim().slice(0, 35);
    }
    if (!currentConvId) {
      currentConvId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveConversationId(currentConvId);
      localStorage.setItem(`kosai_active_conv_${tenantId}_${activeModule.moduleId}`, currentConvId);
    }

    const conversationToSave: KosaiConversation = {
      id: currentConvId,
      tenantId,
      moduleId: activeModule.moduleId,
      title: convTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cachedContentId: cachedContentId || undefined,
      status: 'active',
      messages
    };

    try {
      await kosaiConversationsService.saveConversation(db, tenantId, conversationToSave);
      await refreshConversations();
      return true;
    } catch (err) {
      console.warn('[KosaiContext] Failed saving conversation:', err);
      return false;
    }
  };

  // Load specific conversation from history
  const loadConversation = async (conversationId: string) => {
    if (!db || !tenantId) return;
    try {
      const conv = await kosaiConversationsService.getConversation(db, tenantId, conversationId);
      if (conv) {
        setActiveConversationId(conv.id);
        setMessages(conv.messages);
        setCachedContentId(conv.cachedContentId || null);
        localStorage.setItem(`kosai_active_conv_${tenantId}_${activeModule.moduleId}`, conv.id);
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

  // Media Picker Capability Consumption (Rule 2 - Module Monopoly & Contracts)
  const openMediaPicker = async (): Promise<string | null> => {
    const mediaService = getCapability<MediaPickerContract>('media-picker');
    if (mediaService) {
      try {
        const result = await mediaService.openPicker({ accept: 'image/*', multiple: false });
        if (typeof result === 'string') return result;
        if (Array.isArray(result) && result[0]) return result[0];
        return null;
      } catch (err) {
        console.warn('[KosaiContext] Error using media-picker capability:', err);
      }
    }

    // Secondary fallback via EventBus
    return new Promise((resolve) => {
      let resolved = false;
      eventBus.publish('media:request_picker', {
        onSelect: (url: string) => {
          if (!resolved) {
            resolved = true;
            resolve(url);
          }
        }
      });
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 1500);
    });
  };

  const triggerMediaGallery = async () => {
    const url = await openMediaPicker();
    if (url) {
      sendMessage(`בבקשה תשתמש בתמונה הזו מהספרייה שלי: ${url}`);
    }
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
    let convTitle = content.trim().slice(0, 35) || `שיחה עם ${activeModule.name}`;
    if (!currentConvId) {
      currentConvId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveConversationId(currentConvId);
      if (tenantId) {
        localStorage.setItem(`kosai_active_conv_${tenantId}_${activeModule.moduleId}`, currentConvId);
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
      // Determine capabilities based on rule or active module default
      let capabilities: string[] = currentRule?.enabledCapabilities && currentRule.enabledCapabilities.length > 0
        ? [...currentRule.enabledCapabilities]
        : [...activeModule.enabledCapabilities];

      if (activeModule.moduleId === 'KosWebAi') {
        const pageBuilderCaps = ['ADD_SECTION', 'UPDATE_SECTION', 'UPDATE_GLOBAL_SETTINGS', 'UPDATE_SEO'];
        for (const cap of pageBuilderCaps) {
          if (!capabilities.includes(cap)) {
            capabilities.push(cap);
          }
        }
      } else if (activeModule.moduleId === 'crm-analytics') {
        if (!capabilities.includes('CREATE_CRM_CHART')) {
          capabilities.push('CREATE_CRM_CHART');
        }
      } else if (activeModule.moduleId === 'KosTogether') {
        if (!capabilities.includes('REMOVE_CONTACT_TAGS')) {
          capabilities.push('REMOVE_CONTACT_TAGS');
        }
      }

      // Pass conversation history and cachedContentId (Gemini Multi-turn)
      const historyForApi = updatedMessagesWithUser.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Fetch live data from allowed data sources under tenant scope
      const allowedSources = currentRule?.allowedDataSources?.length 
        ? currentRule.allowedDataSources 
        : activeModule.allowedDataSources;

      let groundingData = '';
      try {
        groundingData = await kosaiDataGroundingService.fetchGroundingContext(db, tenantId, {
          allowedDataSources: allowedSources,
          userQuery: content
        });
      } catch (groundingErr) {
        console.warn('[KosaiContext] Grounding data retrieval notice:', groundingErr);
      }

      const promptContext: KosaiPromptContext = {
        isLoggedIn,
        userRole: authState?.role,
        roleMode: activeRoleMode,
        activeModuleId: activeModule.moduleId,
        tenantPages,
        activeSections: pageSections,
        groundingData,
      };

      const systemInstruction = buildKosaiSystemPrompt(currentRule, brandDnaRef.current, capabilities, promptContext);

      const response = await callGeminiApi({
        prompt: content,
        systemInstruction,
        imageBase64,
        history: historyForApi,
        cachedContentId: cachedContentId || undefined
      });

      if (!response || !response.data) throw new Error('No AI response');
      
      if (response.cachedContentId) {
        setCachedContentId(response.cachedContentId);
      }

      // Log usage to Firestore
      if (db && tenantId && currentRule) {
        kosaiRulesService.logAiUsage(db, tenantId, {
          ruleId: currentRule.id,
          moduleName: currentRule.moduleId || activeModule.moduleId,
          actionType: 'CHAT_MESSAGE',
          usage: response.usageReport
        }).catch(console.error);
      }
      
      const parsed = response.data;

      // Execute action via EventBus if action was specified and is not NONE
      if (parsed.action && parsed.action !== 'NONE') {
        // Module-executed actions report back via 'kosai:action_result'
        const crmAsyncActions = [
          'REMOVE_CONTACT_TAGS',
          'CRM_FILTER_VIEW',
          'CRM_BATCH_UPDATE',
          'CRM_CONVERT_LEAD',
          'CRM_SANITIZE_NAMES',
          'CRM_MERGE_DUPLICATES',
          'CRM_EXPORT_VCARD',
          'CRM_EXPORT_DATA',
          'CRM_WHATSAPP_DISPATCH'
        ];

        if (crmAsyncActions.includes(parsed.action)) {
          let acknowledged = false;
          let finished = false;
          const unsubResult = eventBus.subscribe('kosai:action_result', (result) => {
            if (result?.action !== parsed.action || finished) return;
            acknowledged = true;
            if (result.pending) return;
            finished = true;
            unsubResult();
            if (result.message) {
              setMessages(prev => [...prev, {
                id: `result_${Date.now()}`,
                role: 'assistant',
                content: result.message,
                timestamp: new Date()
              }]);
            }
          });
          setTimeout(() => {
            if (acknowledged || finished) return;
            finished = true;
            unsubResult();
          }, 6000);
        }

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

      // Save conversation state under tenants/{tenantId}/kosai_conversations
      if (db && tenantId && currentConvId) {
        const effectiveCachedContentId = response.cachedContentId || cachedContentId || undefined;

        // Auto-extract contact info mentioned in chat, create/update CRM contact card, and archive conversation under contact
        let linkedContactId: string | null = null;
        try {
          linkedContactId = await kosaiContactAutoSyncService.syncChatToContactCard({
            db,
            tenantId,
            conversationId: currentConvId,
            moduleId: currentRule?.moduleId || activeModule.moduleId,
            title: convTitle,
            userMessage: content,
            assistantMessage: finalAssistantMsg.content,
            cachedContentId: effectiveCachedContentId || null,
            messages: finalMessagesList,
          });
        } catch (syncErr) {
          console.warn('[KosaiContext] Auto contact sync notice:', syncErr);
        }

        const updatedConversation: KosaiConversation = {
          id: currentConvId,
          tenantId,
          moduleId: currentRule?.moduleId || activeModule.moduleId,
          title: convTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          cachedContentId: effectiveCachedContentId,
          contactId: linkedContactId || undefined,
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
      activeModule,
      triggerMediaGallery,
      openMediaPicker,
      saveCurrentConversation,
      activeConversationId,
      conversations,
      loadConversation,
      deleteConversation,
      startNewConversation,
      refreshConversations,
      refreshRules,
      cachedContentId,
      isLoggedIn,
      isEditMode,
      setIsEditMode,
      activeRoleMode,
      pageSections,
      setPageSections
    }}>
      {children}
    </KosaiContext.Provider>
  );
};

export const useKosai = () => {
  const context = useContext(KosaiContext);
  if (!context) {
    return {
      isOpen: false,
      setIsOpen: () => {},
      messages: [],
      sendMessage: async () => {},
      clearChat: async () => {},
      currentRule: null,
      setCurrentRule: () => {},
      activeModule: MODULE_AGENTS_MAP['KosWebAi'],
      triggerMediaGallery: () => {},
      openMediaPicker: async () => null,
      saveCurrentConversation: async () => false,
      activeConversationId: null,
      conversations: [],
      loadConversation: async () => {},
      deleteConversation: async () => {},
      startNewConversation: () => {},
      refreshConversations: async () => {},
      refreshRules: async () => {},
      cachedContentId: null,
      isLoggedIn: false,
      isEditMode: false,
      setIsEditMode: () => {},
      activeRoleMode: 'support_sales' as const,
      pageSections: [],
      setPageSections: () => {},
    };
  }
  return context;
};
