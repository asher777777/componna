import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PageBuilderConfig, BaseSectionConfig, SectionType } from '../types/pageBuilder.types';
import { callGeminiApi } from '../api/functionsApi';
import { getCopilotPrompt } from '../prompts/copilotPrompt';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string; // If user uploaded an image
  isLoading?: boolean;
}

interface BuilderCopilotContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: CopilotMessage[];
  sendMessage: (content: string, imageBase64?: string) => Promise<void>;
  clearChat: () => void;
  draftConfig: PageBuilderConfig;
  saveDraft: () => Promise<void>;
  isSavingDraft: boolean;
}

const BuilderCopilotContext = createContext<BuilderCopilotContextValue | undefined>(undefined);

export const BuilderCopilotProvider: React.FC<{ 
  children: ReactNode;
  config: PageBuilderConfig;
  setConfig: React.Dispatch<React.SetStateAction<PageBuilderConfig>>;
}> = ({ children, config: draftConfig, setConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'היי! אני סייען ה-AI שלך לבניית עמודים. מה נרצה לבנות היום? תאר לי את אזור התוכן שתרצה להוסיף, או תעלה צילום מסך של עיצוב שאהבת ואני אצור אותו עבורך.',
      timestamp: new Date()
    }
  ]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'היי! אני סייען ה-AI שלך לבניית עמודים. נתחיל מחדש, מה נרצה לבנות?',
        timestamp: new Date()
      }
    ]);
  };

  const sendMessage = async (content: string, imageBase64?: string) => {
    const userMsgId = Date.now().toString();
    const newMsg: CopilotMessage = {
      id: userMsgId,
      role: 'user',
      content,
      imageUrl: imageBase64,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: 'חושב ומייצר עבורך...', timestamp: new Date(), isLoading: true }
    ]);

    try {
      // TODO: Call real Gemini API with image and prompt
      // Simulated response for now
      await new Promise(r => setTimeout(r, 2000));
      
      const newSectionId = `custom_${Date.now()}`;
      const newSection: any = {
        id: newSectionId,
        type: 'hero', // In real implementation, this will be dynamic
        title: 'אזור חדש מה-AI',
        description: 'ה-AI ניתח את הבקשה ויצר אזור זה. (זאת רק הדגמה כרגע)',
        visible: true
      };

      if (setConfig && draftConfig) {
        setConfig({
          ...draftConfig,
          sectionOrder: [...draftConfig.sectionOrder, newSectionId],
          sections: {
            ...draftConfig.sections,
            [newSectionId]: newSection
          }
        });
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: 'הוספתי את האזור לעמוד! איך זה נראה? אפשר להמשיך לדייק אותו או ליצור אזור חדש.', isLoading: false }
          : m
      ));
    } catch (err) {
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: 'אופס, אירעה שגיאה ביצירת התוכן. נסה שוב.', isLoading: false }
          : m
      ));
    }
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);
    // TODO: Connect to pageBuilderFirestore to save as draft status
    await new Promise(r => setTimeout(r, 1000));
    setIsSavingDraft(false);
  };

  return (
    <BuilderCopilotContext.Provider value={{
      isOpen,
      setIsOpen,
      messages,
      sendMessage,
      clearChat,
      draftConfig,
      saveDraft,
      isSavingDraft
    }}>
      {children}
    </BuilderCopilotContext.Provider>
  );
};

export const useBuilderCopilot = () => {
  const context = useContext(BuilderCopilotContext);
  if (!context) {
    throw new Error('useBuilderCopilot must be used within a BuilderCopilotProvider');
  }
  return context;
};
