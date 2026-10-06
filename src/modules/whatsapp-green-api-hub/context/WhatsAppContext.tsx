import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { GreenApiState, GreenApiChat, GreenApiChatMessage } from '../types';

export interface WhatsAppContextValue {
  state: GreenApiState;
  setState: (state: GreenApiState) => void;
  chats: GreenApiChat[];
  setChats: (chats: GreenApiChat[]) => void;
  selectedChat: GreenApiChat | null;
  setSelectedChat: (chat: GreenApiChat | null) => void;
  unreadCount: number;
  refreshChats: () => Promise<void>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextValue | undefined>(undefined);

export const WhatsAppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GreenApiState>('unknown');
  const [chats, setChats] = useState<GreenApiChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<GreenApiChat | null>(null);

  const unreadCount = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

  const refreshChats = useCallback(async () => {
    // implementation stub
  }, []);

  const sendMessage = useCallback(async (chatId: string, text: string) => {
    // implementation stub
  }, []);

  return (
    <WhatsAppContext.Provider value={{
      state, setState, chats, setChats, selectedChat, setSelectedChat, unreadCount, refreshChats, sendMessage
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsAppState = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsAppState must be used within a WhatsAppProvider');
  }
  return context;
};
