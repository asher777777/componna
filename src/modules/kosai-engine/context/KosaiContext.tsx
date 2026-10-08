import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { KosaiRule, KosaiMessage, KosaiCapability, KosaiActionPayload } from '../types';
import { kosaiRulesService } from '../services/kosaiFirestoreService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { useBrandDna } from '../../brand-dna-hub/context/BrandDnaContext';
import { callGeminiApi } from '../api/kosaiApi';
import { buildKosaiSystemPrompt } from '../prompts';
import { eventBus } from '../../../core/bridge/EventBus';

interface KosaiContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: KosaiMessage[];
  sendMessage: (content: string, imageBase64?: string) => Promise<void>;
  clearChat: () => void;
  currentRule: KosaiRule | null;
  triggerMediaGallery: () => void;
}

const KosaiContext = createContext<KosaiContextValue | undefined>(undefined);

export const KosaiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<KosaiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'היי! אני KOSAI. העוזר החכם שלך. מחובר כעת ל-Brand DNA ויודע בדיוק מה הצרכים שלך. מה נרצה לעשות?',
      timestamp: new Date()
    }
  ]);
  const [currentRule, setCurrentRule] = useState<KosaiRule | null>(null);
  
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { brandDna } = useBrandDna();

  // Route listening
  useEffect(() => {
    const checkRules = async () => {
      const path = window.location.hash || window.location.pathname;
      const rules = await kosaiRulesService.getRules(db!, tenantId);
      
      const activeRule = rules.find(r => r.isActive && path.includes(r.slugPattern.replace('*', '')));
      setCurrentRule(activeRule || null);
    };
    checkRules();
  }, [db!, tenantId, window.location.hash, window.location.pathname]);

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'היי! אני KOSAI. התחלנו מחדש, איך אפשר לעזור?',
        timestamp: new Date()
      }
    ]);
  };

  const triggerMediaGallery = () => {
    eventBus.publish('media:request_picker', {
      onSelect: (url: string) => {
        // We simulate passing the URL to the AI as a message
        sendMessage(`בבקשה תשתמש בתמונה הזו מהספרייה שלי: ${url}`);
      }
    });
  };

  const sendMessage = async (content: string, imageBase64?: string) => {
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      content,
      imageUrl: imageBase64,
      timestamp: new Date()
    }]);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { 
      id: assistantMsgId, 
      role: 'assistant', 
      content: 'מעבד נתונים...', 
      timestamp: new Date(), 
      isLoading: true 
    }]);

    try {
      const capabilities = currentRule?.enabledCapabilities || ['ADD_SECTION', 'UPDATE_SECTION', 'UPDATE_GLOBAL_SETTINGS', 'UPDATE_SEO'];
      
      const response = await callGeminiApi({
        prompt: content,
        systemInstruction: buildKosaiSystemPrompt(currentRule, brandDna, capabilities),
        imageBase64
      });

      if (!response || !response.data) throw new Error('No AI response');
      
      // LOG USAGE TO FIRESTORE
      if (db && currentRule) {
        Promise.resolve({ kosaiRulesService }).then(({ kosaiRulesService }) => {
          kosaiRulesService.logAiUsage(db, tenantId, {
            ruleId: currentRule.id,
            moduleName: currentRule.moduleId || 'unknown',
            actionType: 'CHAT_MESSAGE',
            usage: response.usageReport
          }).catch(console.error);
        });
      }
      
            let parsed;
      try {
        if (typeof response.data === 'string') {
          let cleanJson = response.data.replace(/\s*\n\s*/g, ' ').replace(/^[\`\s]*(json)?\s*|\s*[\`\s]*$/g, '');
          parsed = JSON.parse(cleanJson);
        } else {
          parsed = response.data;
        }
      } catch (e) {
        console.error('KOSAI Parsing Error:', e, 'Raw:', response.data);
        throw new Error('Failed to parse Kosai JSON response');
      }

      if (parsed.action && parsed.action !== 'NONE') {
        // Publish event for 10-layer decoupling!
        eventBus.publish('kosai:action', {
          action: parsed.action,
          payload: parsed.payload
        });
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: parsed.message || 'בוצע!', isLoading: false }
          : m
      ));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: 'אופס, אירעה שגיאה. נסה שוב.', isLoading: false }
          : m
      ));
    }
  };

  return (
    <KosaiContext.Provider value={{ isOpen, setIsOpen, messages, sendMessage, clearChat, currentRule, triggerMediaGallery }}>
      {children}
    </KosaiContext.Provider>
  );
};

export const useKosai = () => {
  const context = useContext(KosaiContext);
  if (!context) throw new Error('useKosai must be used within KosaiProvider');
  return context;
};
