import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { GreenApiService } from '../services/greenApiService';
import { WhatsAppAiBotService, checkKeywordMatch, WhatsAppAiBotConfig } from '../services/whatsappAiBotService';

interface AutoResponderOptions {
  greenApiService: GreenApiService;
  apiKey?: string;
  db?: any;
  tenantId?: string | null;
  enabled?: boolean;
}

export const useWhatsAppAutoResponder = ({
  greenApiService,
  apiKey,
  db,
  tenantId,
  enabled = true,
}: AutoResponderOptions) => {
  const isPollingRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [lastActivity, setLastActivity] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !greenApiService.isConfigured() || !apiKey) {
      setIsListening(false);
      return;
    }

    let active = true;
    setIsListening(true);

    const chatsColPath = tenantId ? `tenants/${tenantId}/wa_bot_chats` : 'wa_bot_chats';
    const botsColPath = tenantId ? `tenants/${tenantId}/whatsapp_ai_bots` : 'whatsapp_ai_bots';
    const kosaiColPath = tenantId ? `tenants/${tenantId}/mod_kosai_rules` : 'mod_kosai_rules';

    const getActiveBots = async (): Promise<WhatsAppAiBotConfig[]> => {
      const botsMap = new Map<string, WhatsAppAiBotConfig>();

      // 1. Load from localStorage first
      try {
        const localBots = WhatsAppAiBotService.getStoredBots();
        for (const b of localBots) {
          if (b.isActive) botsMap.set(b.id, b);
        }
      } catch (err) {
        console.warn('[AutoResponder] error reading local bots:', err);
      }

      // 2. Load from Firestore whatsapp_ai_bots if db available
      if (db) {
        try {
          const snap = await getDocs(collection(db, botsColPath));
          for (const d of snap.docs) {
            const data = d.data() as WhatsAppAiBotConfig;
            if (data && data.isActive) {
              botsMap.set(data.id || d.id, { ...data, id: data.id || d.id });
            }
          }
        } catch (err) {
          console.warn('[AutoResponder] error reading firestore bots:', err);
        }

        // 3. Load from Kosai rules with WhatsApp automation trigger
        try {
          const snap = await getDocs(collection(db, kosaiColPath));
          for (const d of snap.docs) {
            const rule = d.data();
            if (rule && rule.isActive !== false && rule.whatsappTrigger?.enabled) {
              const tr = rule.whatsappTrigger;
              const ruleBot: WhatsAppAiBotConfig = {
                id: `kosai_${d.id}`,
                name: tr.botDisplayName || rule.name || 'סוכן קושאן AI',
                role: rule.name || 'נציג שירות ומכירות',
                avatarIcon: 'Sparkles',
                isActive: true,
                triggerType: tr.triggerType || 'keyword',
                triggerKeywords: tr.keywords || [],
                matchMode: tr.matchMode || 'contains',
                systemPrompt: rule.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
                model: 'gemini-3.8-flash',
                temperature: 0.7,
                interactiveButtons: [],
                autoGenerateButtons: false,
                createdAt: Date.now(),
              };
              botsMap.set(ruleBot.id, ruleBot);
            }
          }
        } catch (err) {
          console.warn('[AutoResponder] error reading kosai rules:', err);
        }
      }

      return Array.from(botsMap.values());
    };

    const pollLoop = async () => {
      if (!active || !greenApiService.isConfigured() || !apiKey) return;

      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const notification = await greenApiService.receiveNotification();
        if (notification && notification.receiptId) {
          const body = notification.body;

          const isIncoming = body?.typeWebhook === 'incomingMessageReceived';
          const isOutgoing = body?.typeWebhook === 'outgoingMessageReceived';

          if (isIncoming || isOutgoing) {
            const senderChatId = body.senderData?.chatId || body.senderData?.sender;
            const senderName = body.senderData?.senderName || body.senderData?.senderContactName || '';
            const messageText =
              body.messageData?.textMessageData?.textMessage ||
              body.messageData?.extendedTextMessageData?.textMessage ||
              body.messageData?.extendedTextMessageData?.description ||
              body.messageData?.templateMessageData?.content ||
              body.messageData?.buttonsResponseMessageData?.selectedDisplayText ||
              body.messageData?.buttonsResponseMessageData?.selectedButtonId ||
              body.messageData?.listResponseMessageData?.title ||
              body.messageData?.listResponseMessageData?.selectedRowId ||
              body.messageData?.quotedMessage?.textMessage ||
              '';

            if (senderChatId && messageText) {
              const activeBots = await getActiveBots();
              let triggeredBot: WhatsAppAiBotConfig | null = null;
              let matchedKeyword = '';

              for (const bot of activeBots) {
                if (bot.triggerType === 'all') {
                  triggeredBot = bot;
                  break;
                } else if (bot.triggerType === 'keyword') {
                  const matchResult = checkKeywordMatch(
                    messageText,
                    bot.triggerKeywords || [],
                    bot.matchMode || 'contains'
                  );
                  if (matchResult.isMatch) {
                    triggeredBot = bot;
                    matchedKeyword = matchResult.matchedKeyword || '';
                    break;
                  }
                }
              }

              if (triggeredBot) {
                console.log(`[AutoResponder] Bot "${triggeredBot.name}" triggered by "${matchedKeyword || 'all'}" from ${senderChatId}`);
                setLastActivity(Date.now());

                // Read chat history from Firestore if available
                let historyForAi: { role: 'user' | 'model'; text: string }[] = [];
                let existingMessages: any[] = [];
                let chatDocRef: any = null;

                if (db) {
                  try {
                    chatDocRef = doc(db, chatsColPath, senderChatId);
                    const chatSnap = await getDoc(chatDocRef);
                    if (chatSnap.exists()) {
                      const chatData = chatSnap.data() as any;
                      existingMessages = chatData?.messages || [];
                      historyForAi = existingMessages.slice(-6).map((m: any) => ({
                        role: m.role === 'model' ? 'model' : 'user',
                        text: m.text,
                      }));
                    }
                  } catch (e) {
                    console.warn('[AutoResponder] could not load chat history:', e);
                  }
                }

                try {
                  const res = await WhatsAppAiBotService.generateAiResponse({
                    apiKey: apiKey || '',
                    botConfig: triggeredBot,
                    userMessage: messageText,
                    chatHistory: historyForAi,
                  });

                  if (res?.replyText) {
                    await greenApiService.sendMessage({
                      chatId: senderChatId,
                      message: res.replyText,
                    });

                    // Save chat log to Firestore so it appears in "שיחות בוט" tab
                    if (db && chatDocRef) {
                      const now = Date.now();
                      const updatedMessages = [
                        ...existingMessages,
                        { role: 'user', text: messageText, timestamp: now },
                        { role: 'model', text: res.replyText, timestamp: now + 50 },
                      ];

                      await setDoc(
                        chatDocRef,
                        {
                          id: senderChatId,
                          phone: senderChatId.replace('@c.us', '').replace('@g.us', ''),
                          contactName: senderName || senderChatId.replace('@c.us', ''),
                          botId: triggeredBot.id,
                          botName: triggeredBot.name,
                          lastUpdatedAt: now,
                          messages: updatedMessages,
                        },
                        { merge: true }
                      );
                    }
                  }
                } catch (e) {
                  console.error('[AutoResponder] Error generating/sending AI response:', e);
                }
              }
            }
          }

          // Always delete notification receipt so we don't re-process
          await greenApiService.deleteNotification(notification.receiptId);

          // Fast loop if notifications are pending
          if (active) setTimeout(pollLoop, 100);
          return;
        }
      } catch (err) {
        console.warn('[AutoResponder] polling error:', err);
      } finally {
        isPollingRef.current = false;
      }

      // Idle poll loop interval
      if (active) {
        setTimeout(pollLoop, 3000);
      }
    };

    pollLoop();

    return () => {
      active = false;
      setIsListening(false);
    };
  }, [greenApiService, apiKey, db, tenantId, enabled]);

  return { isListening, lastActivity };
};
