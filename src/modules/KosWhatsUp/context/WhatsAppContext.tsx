import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { GreenApiState, GreenApiChat, GreenApiChatMessage } from '../types';
import { GreenApiService } from '../services/greenApiService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import {
  WhatsAppContract,
  WhatsAppSendResult,
  WhatsAppSendMessageParams,
  WhatsAppSendFileParams,
  WhatsAppSendPollParams,
  KosWhatsUpContract
} from '../../../core/contracts';

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
  const { apiKeys } = useSystemConnection();
  const { registerCapability, unregisterCapability } = useHostCapabilities();

  const [state, setState] = useState<GreenApiState>('unknown');
  const [chats, setChats] = useState<GreenApiChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<GreenApiChat | null>(null);

  const isConfigured = Boolean(apiKeys.greenApiInstanceId && apiKeys.greenApiToken);

  const greenApi = useMemo(() => {
    if (!isConfigured) return null;
    return new GreenApiService({
      idInstance: apiKeys.greenApiInstanceId!,
      apiTokenInstance: apiKeys.greenApiToken!,
      apiUrl: apiKeys.greenApiApiUrl,
    });
  }, [isConfigured, apiKeys.greenApiInstanceId, apiKeys.greenApiToken, apiKeys.greenApiApiUrl]);

  const unreadCount = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

  const refreshChats = useCallback(async () => {
    if (!greenApi) return;
    try {
      const chatList = await greenApi.getChats();
      setChats(chatList || []);
    } catch (err) {
      console.warn('[WhatsAppProvider] Error refreshing chats:', err);
    }
  }, [greenApi]);

  const sendMessage = useCallback(async (chatId: string, text: string) => {
    if (!greenApi) {
      console.warn('[WhatsAppProvider] GreenApi is not configured');
      return;
    }
    await greenApi.sendMessage({ chatId, message: text });
  }, [greenApi]);

  // Register WhatsAppContract / KosWhatsUpContract with HostCapabilities for zero cross-import usage
  useEffect(() => {
    const contract: WhatsAppContract = {
      isConfigured: () => Boolean(greenApi),
      sendMessage: async (
        phoneOrParams: string | WhatsAppSendMessageParams,
        optionalText?: string
      ): Promise<WhatsAppSendResult> => {
        let phone = '';
        let text = '';
        let quotedMessageId: string | undefined;
        let linkPreview: boolean | undefined;

        if (typeof phoneOrParams === 'object' && phoneOrParams !== null) {
          phone = phoneOrParams.phone || phoneOrParams.chatId || '';
          text = phoneOrParams.message || phoneOrParams.text || '';
          quotedMessageId = phoneOrParams.quotedMessageId;
          linkPreview = phoneOrParams.linkPreview;
        } else {
          phone = String(phoneOrParams || '');
          text = optionalText || '';
        }

        const cleanPhone = phone.replace(/[^\d@a-z._-]/gi, '');
        const chatId = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@c.us`;

        if (greenApi) {
          try {
            const res = await greenApi.sendMessage({
              chatId,
              message: text,
              quotedMessageId,
              linkPreview
            });
            return {
              success: Boolean(res?.idMessage),
              idMessage: res?.idMessage,
              error: res?.error,
            };
          } catch (err: any) {
            return {
              success: false,
              error: err?.message || 'שגיאה בשליחת הודעת וואטסאפ',
            };
          }
        }

        return {
          success: false,
          error: 'מסוף וואטסאפ אינו מחובר',
        };
      },
      sendFile: async (params: WhatsAppSendFileParams): Promise<WhatsAppSendResult> => {
        if (!greenApi) return { success: false, error: 'מסוף וואטסאפ אינו מחובר' };
        try {
          const rawTarget = params.chatId || params.phone || '';
          const clean = rawTarget.replace(/[^\d@a-z._-]/gi, '');
          const chatId = clean.includes('@') ? clean : `${clean}@c.us`;
          const res = await greenApi.sendFileByUrl({
            chatId,
            urlFile: params.urlFile,
            fileName: params.fileName || 'document',
            caption: params.caption,
          });
          return { success: Boolean(res?.idMessage), idMessage: res?.idMessage, error: res?.error };
        } catch (err: any) {
          return { success: false, error: err?.message || 'שגיאה בשליחת קובץ' };
        }
      },
      sendPoll: async (params: WhatsAppSendPollParams): Promise<WhatsAppSendResult> => {
        if (!greenApi) return { success: false, error: 'מסוף וואטסאפ אינו מחובר' };
        try {
          const rawTarget = params.chatId || params.phone || '';
          const clean = rawTarget.replace(/[^\d@a-z._-]/gi, '');
          const chatId = clean.includes('@') ? clean : `${clean}@c.us`;
          const options = Array.isArray(params.options)
            ? params.options.map((opt: any) => typeof opt === 'string' ? { optionName: opt } : opt)
            : [];
          const res = await greenApi.sendPoll({
            chatId,
            message: params.message,
            options,
            multipleAnswers: params.multipleAnswers,
          });
          return { success: Boolean(res?.idMessage), idMessage: res?.idMessage, error: res?.error };
        } catch (err: any) {
          return { success: false, error: err?.message || 'שגיאה בשליחת סקר' };
        }
      },
      fetchGroups: async () => {
        if (!greenApi) return [];
        try {
          const chats = await greenApi.getChats();
          return (chats || [])
            .filter((c) => c.isGroup || (typeof c.id === 'string' && c.id.endsWith('@g.us')))
            .map((c) => ({
              id: c.id,
              name: c.name || c.contactName || c.id.replace('@g.us', ''),
            }));
        } catch {
          return [];
        }
      },
      fetchGroupParticipants: async (groupId: string) => {
        if (!greenApi || !groupId) return [];
        try {
          const groupData = await greenApi.getGroupData(groupId);
          return (groupData?.participants || []).map((p: any) => ({
            phone: (p.id || '').replace('@c.us', ''),
            name: p.name || (p.id || '').replace('@c.us', ''),
            isAdmin: Boolean(p.admin),
            chatId: p.id,
          }));
        } catch {
          return [];
        }
      },
      sendTemplateNotification: async (phone: string, templateText: string, variables?: Record<string, string>) => {
        let text = templateText;
        if (variables) {
          Object.entries(variables).forEach(([key, val]) => {
            text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
          });
        }
        const cleanPhone = phone.replace(/[^\d@a-z._-]/gi, '');
        const chatId = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@c.us`;
        if (greenApi) {
          try {
            const res = await greenApi.sendMessage({ chatId, message: text });
            return { success: Boolean(res?.idMessage), idMessage: res?.idMessage, error: res?.error };
          } catch (e: any) {
            return { success: false, error: e?.message };
          }
        }
        return { success: false, error: 'וואטסאפ לא מחובר' };
      },
      buildWaMeUrl: (phone: string, text?: string) => {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '972' + cleanPhone.slice(1);
        }
        const encoded = text ? encodeURIComponent(text) : '';
        return `https://wa.me/${cleanPhone}${encoded ? `?text=${encoded}` : ''}`;
      },
    };

    registerCapability('whatsapp-service', contract);
    registerCapability('whatsapp', contract);
    registerCapability('KosWhatsUp', contract);
    registerCapability('koswhatsup', contract);

    return () => {
      unregisterCapability('whatsapp-service');
      unregisterCapability('whatsapp');
      unregisterCapability('KosWhatsUp');
      unregisterCapability('koswhatsup');
    };
  }, [greenApi, registerCapability, unregisterCapability]);

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

export const KosWhatsUpProvider = WhatsAppProvider;
export const useKosWhatsUpState = useWhatsAppState;
