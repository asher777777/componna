import { useEffect, useRef } from 'react';
import { GreenApiService } from '../services/greenApiService';
import { WhatsAppAiBotService } from '../services/whatsappAiBotService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export const useWhatsAppAutoResponder = (
  greenApiService: GreenApiService,
  apiKey: string | undefined
) => {
  const isPollingRef = useRef(false);

  useEffect(() => {
    let active = true;

    const pollLoop = async () => {
      if (!active || !greenApiService.isConfigured() || !apiKey) return;
      
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const notification = await greenApiService.receiveNotification();
        if (notification && notification.receiptId) {
          const body = notification.body;
          
          if (body?.typeWebhook === 'incomingMessageReceived' && body?.messageData?.textMessageData?.textMessage) {
            const sender = body.senderData?.sender;
            const messageText = body.messageData.textMessageData.textMessage;
            
            if (sender && messageText) {
              const bots = WhatsAppAiBotService.getStoredBots();
              const activeBots = bots.filter(b => b.isActive);
              
              let triggeredBot = null;
              
              for (const bot of activeBots) {
                if (bot.triggerType === 'all') {
                  triggeredBot = bot;
                  break;
                } else if (bot.triggerType === 'keyword') {
                  const textLower = messageText.toLowerCase();
                  const matches = bot.triggerKeywords?.some(kw => {
                    const kwLower = kw.trim().toLowerCase();
                    return kwLower.length > 0 && textLower.includes(kwLower);
                  });
                  if (matches) {
                    triggeredBot = bot;
                    break;
                  }
                }
                // (Note: 'welcome' trigger is ignored for now to prevent spam, or requires chat history check)
              }
              
              if (triggeredBot) {
                console.log(`[AutoResponder] Bot ${triggeredBot.name} triggered by message from ${sender}`);
                try {
                  const res = await WhatsAppAiBotService.generateAiResponse({
                    apiKey,
                    botConfig: triggeredBot,
                    userMessage: messageText,
                    chatHistory: [],
                  });
                  
                  if (res.replyText) {
                    await greenApiService.sendMessage({
                      chatId: sender,
                      message: res.replyText
                    });
                  }
                } catch (e) {
                  console.error('Error auto-responding:', e);
                }
              }
            }
          }
          
          // Delete notification so we don't process it again
          await greenApiService.deleteNotification(notification.receiptId);
          
          // Fast loop when there are notifications
          if (active) setTimeout(pollLoop, 100);
          return;
        }
      } catch (err) {
        console.warn('[AutoResponder] polling error:', err);
      } finally {
        isPollingRef.current = false;
      }
      
      // Slow loop when idle
      if (active) {
        setTimeout(pollLoop, 3000);
      }
    };
    
    // Start loop
    pollLoop();
    
    return () => {
      active = false;
    };
  }, [greenApiService, apiKey]);
};
