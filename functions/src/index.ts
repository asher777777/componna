import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as corsLib from 'cors';

const cors = corsLib({ origin: true });

admin.initializeApp();
const db = admin.firestore();

function normalizeModelName(rawModel?: string): string {
  if (!rawModel) return 'gemini-3.8-flash';
  const clean = rawModel.replace(/^models\//, '').trim();
  if (clean === 'gemini-3.8-flash-lite' || clean.includes('3.8-flash-lite') || clean === 'flash-lite') {
    return 'gemini-flash-lite-latest';
  }
  if (clean === 'gemini-2.5-flash' || clean === 'gemini-1.5-flash') {
    return 'gemini-3.8-flash';
  }
  return clean;
}

// Fire-and-forget contact extraction
async function extractAndSaveContact(
  geminiKey: string, 
  phone: string, 
  messages: any[], 
  fallbackSenderName?: string, 
  contactIdHint?: string
) {
  try {
    const rawDigits = phone.replace(/\D/g, '');
    const normPhone = rawDigits.startsWith('972') ? '0' + rawDigits.slice(3) : rawDigits;

    // 1. Smart lookup existing contact FIRST (Zero-Token Rule)
    let matchedDocId = contactIdHint || null;
    let existingData: any = null;

    if (!matchedDocId) {
      const qSnap = await db.collection('contacts').where('normalizedPhone', '==', normPhone).get();
      if (!qSnap.empty) {
        matchedDocId = qSnap.docs[0].id;
        existingData = qSnap.docs[0].data();
      } else {
        const qSnap2 = await db.collection('contacts').where('phone', '==', phone).get();
        if (!qSnap2.empty) {
          matchedDocId = qSnap2.docs[0].id;
          existingData = qSnap2.docs[0].data();
        } else {
          const qSnap3 = await db.collection('contacts').where('conta_phone', '==', normPhone).get();
          if (!qSnap3.empty) {
            matchedDocId = qSnap3.docs[0].id;
            existingData = qSnap3.docs[0].data();
          }
        }
      }
    } else {
      const docSnap = await db.collection('contacts').doc(matchedDocId).get();
      if (docSnap.exists) {
        existingData = docSnap.data();
      }
    }

    const existingName = existingData?.name || existingData?.conta_name || existingData?.kosun_crm_name;
    const hasValidName = Boolean(existingName && existingName !== phone && existingName !== normPhone && !existingName.startsWith('לקוח '));
    const hasCompany = Boolean(existingData?.company_name || existingData?.kosun_crm_company);
    const hasEmail = Boolean(existingData?.email || existingData?.kosun_crm_email);

    // ZERO-TOKEN SHORTCUT:
    // If contact already has name and company/email, OR extraction ran recently, skip Gemini completely!
    const lastExtracted = existingData?.lastAiExtractionTimestamp || 0;
    const isRecentlyExtracted = (Date.now() - lastExtracted) < (2 * 60 * 60 * 1000); // 2 hours throttle
    const lastMsgText = messages.length > 0 ? (messages[messages.length - 1].text || '') : '';
    const isTrivialMessage = /^(כן|לא|בטח|מחר|תודה|שלום|אהלן|היי|מעולה|אוקי|ok|סבבה|05\d{8})$/i.test(lastMsgText.trim());

    let data: any = {};

    // ONLY call Gemini if we genuinely lack essential info and message might contain details
    if ((!hasValidName || (!hasCompany && !hasEmail)) && !isRecentlyExtracted && !isTrivialMessage && geminiKey) {
      // Send AT MOST the last 4 messages, NOT the whole multi-day conversation!
      const recentSlice = messages.slice(-4);
      const chatText = recentSlice.map(m => `${m.role}: ${m.text}`).join('\n');

      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: normalizeModelName('gemini-flash-lite-latest'),
        generationConfig: {
          maxOutputTokens: 60,
          temperature: 0.1,
          responseMimeType: 'application/json',
        }
      });

      const prompt = `חלץ שם, אימייל או תחום עיסוק והחזר JSON בלבד:
${chatText}
פורמט: {"name":null,"email":null,"businessType":null}`;

      try {
        const result = await model.generateContent(prompt);
        const pTokens = (result.response as any).usageMetadata?.promptTokenCount || 40;
        const cTokens = (result.response as any).usageMetadata?.candidatesTokenCount || 20;
        const tTokens = pTokens + cTokens;
        const costUSD = Number(((pTokens * 0.75 + cTokens * 3.75) / 1000000).toFixed(6));
        await db.doc('tenants/_master/settings/token_usage').set({
          totalTokens: admin.firestore.FieldValue.increment(tTokens),
          contentTokens: admin.firestore.FieldValue.increment(tTokens),
          totalCostUSD: admin.firestore.FieldValue.increment(costUSD),
          totalCostILS: admin.firestore.FieldValue.increment(Number((costUSD * 3.7).toFixed(6))),
          updatedAt: new Date().toISOString()
        }, { merge: true });

        const text = result.response.text().trim();
        data = JSON.parse(text);
      } catch (err) {
        data = {};
      }
    }

    const resolvedName = data.name || existingName || fallbackSenderName || `לקוח ${normPhone.slice(-4)}`;
    const nowIso = new Date().toISOString();

    if (!matchedDocId) {
      // Create new contact in canonical KOSUN CRM schema
      const newContactDoc = {
        name: resolvedName,
        fullName: resolvedName,
        conta_name: resolvedName,
        kosun_crm_name: resolvedName,
        phone: phone,
        conta_phone: normPhone,
        kosun_crm_phone: normPhone,
        normalizedPhone: normPhone,
        email: data.email || '',
        kosun_crm_email: data.email || '',
        company_name: data.businessType || '',
        kosun_crm_company: data.businessType || '',
        status: 'active',
        kosun_crm_status: 'active',
        is_lead: true,
        contact_type: 'lead',
        kosun_crm_type: 'lead',
        lead_source: 'בוט וואטסאפ (WhatsApp AI Bot)',
        kosun_crm_source: 'בוט וואטסאפ (WhatsApp AI Bot)',
        tags: ['ליד חדש', 'WhatsApp AI Bot'],
        kosun_crm_tags: ['ליד חדש', 'WhatsApp AI Bot'],
        last_message: lastMsgText,
        last_channel: 'whatsapp',
        last_conversation_date: nowIso,
        lastAiExtractionTimestamp: Date.now(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const addedRef = await db.collection('contacts').add(newContactDoc);
      matchedDocId = addedRef.id;

      try {
        await db.collection('tenants').doc('_master').collection('contacts').doc(matchedDocId).set(newContactDoc, { merge: true });
      } catch {}
    } else {
      // Update existing contact
      const updates: Record<string, any> = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        last_message: lastMsgText,
        last_channel: 'whatsapp',
        last_conversation_date: nowIso,
        lastAiExtractionTimestamp: Date.now(),
      };

      if (data.name && (!existingData?.name || existingData?.name === phone || existingData?.name === normPhone)) {
        updates.name = data.name;
        updates.conta_name = data.name;
        updates.kosun_crm_name = data.name;
      }
      if (data.email && !existingData?.email) {
        updates.email = data.email;
        updates.kosun_crm_email = data.email;
      }
      if (data.businessType && !existingData?.company_name) {
        updates.company_name = data.businessType;
        updates.kosun_crm_company = data.businessType;
      }

      await db.collection('contacts').doc(matchedDocId).set(updates, { merge: true });
      try {
        await db.collection('tenants').doc('_master').collection('contacts').doc(matchedDocId).set(updates, { merge: true });
      } catch {}
    }

    // Persist full conversation history into contact's subcollection
    if (matchedDocId) {
      const convSubRef = db.collection('contacts').doc(matchedDocId).collection('conversations').doc(`conv_${normPhone}`);
      await convSubRef.set({
        id: `conv_${normPhone}`,
        contactId: matchedDocId,
        channel: 'whatsapp',
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        messages: messages,
      }, { merge: true });

      try {
        await db.collection('tenants').doc('_master').collection('contacts').doc(matchedDocId).collection('conversations').doc(`conv_${normPhone}`).set({
          id: `conv_${normPhone}`,
          contactId: matchedDocId,
          channel: 'whatsapp',
          lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          messages: messages,
        }, { merge: true });
      } catch {}
    }
  } catch (err) {
    console.error('Extraction error:', err);
  }
}

function normalizeTextForMatching(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/\u00A0/g, ' ')
    .toLowerCase()
    .trim();
}

function flattenKeywords(keywords: any): string[] {
  if (!keywords) return [];
  const list = Array.isArray(keywords) ? keywords : [String(keywords)];
  const result: string[] = [];
  for (const item of list) {
    if (typeof item === 'string') {
      const parts = item.split(/[,;\n\t]+/).map(p => p.trim()).filter(Boolean);
      result.push(...parts);
    }
  }
  return result;
}

function matchKeywords(
  messageText: string,
  keywords: string[] = [],
  matchMode: 'contains' | 'exact' | 'startsWith' = 'contains'
): { isMatch: boolean; matchedKeyword?: string } {
  if (!messageText || !keywords) return { isMatch: false };
  const normMsg = normalizeTextForMatching(messageText);
  if (!normMsg) return { isMatch: false };

  const strippedMsg = normMsg.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'״׳]/g, ' ');
  const msgWords = strippedMsg.split(/\s+/).filter(Boolean);
  const flattened = flattenKeywords(keywords);

  for (const rawKw of flattened) {
    const normKw = normalizeTextForMatching(rawKw);
    if (!normKw) continue;
    const strippedKw = normKw.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'״׳]/g, ' ').trim();
    if (!strippedKw) continue;

    if (matchMode === 'exact') {
      if (normMsg === normKw || strippedMsg === strippedKw) return { isMatch: true, matchedKeyword: rawKw };
      if (msgWords.includes(strippedKw)) return { isMatch: true, matchedKeyword: rawKw };
      const boundaryRegex = new RegExp(`(^|\\s)${strippedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
      if (boundaryRegex.test(strippedMsg)) return { isMatch: true, matchedKeyword: rawKw };
    } else if (matchMode === 'startsWith') {
      if (normMsg.startsWith(normKw) || strippedMsg.startsWith(strippedKw)) return { isMatch: true, matchedKeyword: rawKw };
    } else {
      if (normMsg.includes(normKw) || strippedMsg.includes(strippedKw)) return { isMatch: true, matchedKeyword: rawKw };
    }
  }
  return { isMatch: false };
}

// Webhook for Green API
export const whatsappWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    
    if (req.method === 'GET') {
      res.status(200).send('Webhook is running');
      return;
    }

  const body = req.body;
  if (!body) {
    res.status(200).send('No body');
    return;
  }

  // Multi-Tenant & Debug Logger Helper: Log raw event immediately so user sees what arrived in real-time
  const incomingInstanceId = String(body.instanceData?.idInstance || '').trim();
  let resolvedTenantId = '_master';

  const logWebhookEvent = async (tenantId: string, status: string, detail?: any) => {
    try {
      const eventLogId = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logData = {
        id: eventLogId,
        typeWebhook: body.typeWebhook || 'unknown',
        instanceId: incomingInstanceId || 'unknown',
        sender: body.senderData?.chatId || body.senderData?.sender || null,
        messageText: body.messageData?.textMessageData?.textMessage ||
          body.messageData?.extendedTextMessageData?.text ||
          body.messageData?.extendedTextMessageData?.textMessage ||
          body.messageData?.fileMessageData?.caption ||
          body.messageData?.buttonsResponseMessageData?.selectedDisplayText ||
          body.messageData?.buttonsResponseMessageData?.selectedButtonId ||
          body.messageData?.listResponseMessageData?.title ||
          body.textMessage || null,
        status,
        detail: detail || null,
        timestamp: Date.now(),
        serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      // 1. Save in tenant scoped collection
      if (tenantId && tenantId !== '_master') {
        await db.collection('tenants').doc(tenantId).collection('whatsapp_webhook_logs').doc(eventLogId).set(logData);
      }
      // 2. Always mirror to global logs collection for easy overview
      await db.collection('whatsapp_webhook_logs').doc(eventLogId).set({ ...logData, tenantId });
    } catch (logErr) {
      console.warn('[whatsappWebhook] Failed to write webhook log:', logErr);
    }
  };

  // If this is a test ping / non-message notification, log it and return 200 immediately
  if (body.typeWebhook !== 'incomingMessageReceived') {
    // Attempt fast tenant resolution for test notifications
    if (incomingInstanceId) {
      try {
        const tenantsSnap = await db.collection('tenants').get();
        for (const tDoc of tenantsSnap.docs) {
          const tKeysDoc = await db.collection('tenants').doc(tDoc.id).collection('settings').doc('api_keys').get();
          if (tKeysDoc.exists && String(tKeysDoc.data()?.greenApiInstanceId || '').trim() === incomingInstanceId) {
            resolvedTenantId = tDoc.id;
            break;
          }
        }
      } catch {}
    }
    await logWebhookEvent(resolvedTenantId, `Notification received (${body.typeWebhook})`, body);
    res.status(200).send(`Received ${body.typeWebhook}`);
    return;
  }

  const messageText = 
    body.messageData?.textMessageData?.textMessage ||
    body.messageData?.extendedTextMessageData?.text ||
    body.messageData?.extendedTextMessageData?.textMessage ||
    body.messageData?.fileMessageData?.caption ||
    body.messageData?.buttonsResponseMessageData?.selectedDisplayText ||
    body.messageData?.buttonsResponseMessageData?.selectedButtonId ||
    body.messageData?.listResponseMessageData?.title ||
    body.messageData?.listResponseMessageData?.description ||
    body.textMessage ||
    '';
  const sender = body.senderData?.sender;
  const targetChatId = body.senderData?.chatId || sender || body.chatId;
  const senderName = body.senderData?.senderName || body.senderData?.senderContactName || body.senderName || '';
  
  if (!messageText || !targetChatId) {
    await logWebhookEvent(resolvedTenantId, 'Ignored: No text or targetChatId', {
      rawMessageData: body.messageData,
      rawSenderData: body.senderData
    });
    res.status(200).send('No text or targetChatId');
    return;
  }

  const cleanDigits = targetChatId.split('@')[0].replace(/\D/g, '');
  const phone = cleanDigits;
  const normPhone = cleanDigits.startsWith('972') ? '0' + cleanDigits.slice(3) : cleanDigits;

  try {
    // 1. Fetch API Keys with Dynamic Multi-Tenant Resolution
    let apiKeys: any = {};

    if (incomingInstanceId) {
      try {
        const tenantsSnap = await db.collection('tenants').get();
        for (const tDoc of tenantsSnap.docs) {
          const tKeysDoc = await db.collection('tenants').doc(tDoc.id).collection('settings').doc('api_keys').get();
          if (tKeysDoc.exists && String(tKeysDoc.data()?.greenApiInstanceId || '').trim() === incomingInstanceId) {
            resolvedTenantId = tDoc.id;
            apiKeys = tKeysDoc.data() || {};
            break;
          }
        }
      } catch (err) {
        console.warn('[whatsappWebhook] Error matching tenant by instance ID:', err);
      }
    }

    if (!apiKeys.greenApiToken || (!apiKeys.googleAiApiKey && !apiKeys.geminiApiKey)) {
      try {
        const masterDoc = await db.collection('tenants').doc('_master').collection('settings').doc('api_keys').get();
        if (masterDoc.exists) {
          apiKeys = { ...masterDoc.data(), ...apiKeys };
        }
      } catch (e) {
        console.warn('Error reading master api_keys:', e);
      }
    }

    if (!apiKeys.googleAiApiKey && !apiKeys.geminiApiKey) {
      try {
        const rootDoc = await db.collection('settings').doc('api_keys').get();
        if (rootDoc.exists) apiKeys = { ...rootDoc.data(), ...apiKeys };
      } catch (e) {}
    }

    if (!apiKeys.googleAiApiKey && !apiKeys.geminiApiKey) {
      try {
        const globalDoc = await db.collection('system_settings').doc('global').get();
        if (globalDoc.exists) apiKeys = { ...globalDoc.data()?.apiKeys, ...apiKeys };
      } catch (e) {}
    }

    const geminiKey = apiKeys.googleAiApiKey || apiKeys.geminiApiKey;
    const greenApiInstanceId = incomingInstanceId || apiKeys.greenApiInstanceId;
    const greenApiToken = apiKeys.greenApiToken;

    if (!geminiKey || !greenApiInstanceId || !greenApiToken) {
      console.warn('Missing keys for WhatsApp AI Bot:', {
        resolvedTenantId,
        hasGeminiKey: Boolean(geminiKey),
        hasInstanceId: Boolean(greenApiInstanceId),
        hasToken: Boolean(greenApiToken)
      });
      res.status(200).send('Missing keys - acknowledged');
      return;
    }

    // 2. Load Chat History
    const chatDocRef = db.collection('wa_bot_chats').doc(targetChatId);
    const chatDoc = await chatDocRef.get();
    let chatHistory: any[] = [];
    if (chatDoc.exists) {
      chatHistory = chatDoc.data()?.messages || [];
    }

    // 3. Load active bots from resolved tenant, master tenant, and collectionGroup
    // Support both canonical KOSUN26 `kos_whatsup_ai_bots` and legacy `whatsapp_ai_bots`
    const botDocsList: any[] = [];
    const botCollections = ['kos_whatsup_ai_bots', 'whatsapp_ai_bots'];

    for (const col of botCollections) {
      try {
        const tenantSnap = await db.collection('tenants').doc(resolvedTenantId).collection(col).get();
        tenantSnap.forEach(d => {
          const data = d.data();
          if (data && data.isActive !== false && !botDocsList.some(b => b.id === (data.id || d.id))) {
            botDocsList.push({ ...data, id: data.id || d.id, tenantId: resolvedTenantId });
          }
        });
      } catch (e) {}
    }

    if (resolvedTenantId !== '_master') {
      for (const col of botCollections) {
        try {
          const masterSnap = await db.collection('tenants').doc('_master').collection(col).get();
          masterSnap.forEach(d => {
            const data = d.data();
            if (data && data.isActive !== false && !botDocsList.some(b => b.id === (data.id || d.id))) {
              botDocsList.push({ ...data, id: data.id || d.id, tenantId: '_master' });
            }
          });
        } catch (e) {}
      }
    }

    for (const col of botCollections) {
      try {
        const groupSnap = await db.collectionGroup(col).get();
        groupSnap.forEach(d => {
          const data = d.data();
          if (data && data.isActive !== false && !botDocsList.some(b => b.id === (data.id || d.id))) {
            botDocsList.push({ ...data, id: data.id || d.id });
          }
        });
      } catch (e) {}
    }

    for (const col of botCollections) {
      try {
        const rootSnap = await db.collection(col).get();
        rootSnap.forEach(d => {
          const data = d.data();
          if (data && data.isActive !== false && !botDocsList.some(b => b.id === (data.id || d.id))) {
            botDocsList.push({ ...data, id: data.id || d.id });
          }
        });
      } catch (e) {}
    }

    let triggeredBot: any = null;
    let activeBotId = chatDoc.data()?.botId;

    // STEP 3A: Check explicit KEYWORD triggers FIRST!
    // This guarantees the bot responds to search words even if a previous conversation existed
    for (const bot of botDocsList) {
      if (bot.triggerType === 'keyword' && (bot.triggerKeywords || bot.keywords)) {
        const kws = bot.triggerKeywords || bot.keywords;
        const matchResult = matchKeywords(messageText, kws, bot.matchMode || 'contains');
        if (matchResult.isMatch) {
          triggeredBot = bot;
          console.log(`[whatsappWebhook] Keyword matched "${matchResult.matchedKeyword}" for bot: ${bot.name} (${bot.id})`);
          break;
        }
      }
    }

    // STEP 3B: Check Kosai Engine Rules with WhatsApp keyword triggers
    if (!triggeredBot) {
      try {
        const kosaiRulesSnap = await db.collectionGroup('mod_kosai_rules').get();
        for (const doc of kosaiRulesSnap.docs) {
          const rule = doc.data();
          if (rule?.isActive !== false && rule?.whatsappTrigger?.enabled) {
            const trigger = rule.whatsappTrigger;
            if (trigger.triggerType === 'keyword' && (trigger.keywords || trigger.triggerKeywords)) {
              const kws = trigger.keywords || trigger.triggerKeywords;
              const matchResult = matchKeywords(messageText, kws, trigger.matchMode || 'contains');
              if (matchResult.isMatch) {
                triggeredBot = {
                  id: `kosai_${doc.id}`,
                  name: trigger.botDisplayName || rule.name,
                  systemPrompt: rule.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
                  model: 'gemini-3.8-flash',
                  temperature: (rule.toneOfVoice?.creativity ?? 50) / 100
                };
                break;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error querying kosai rules for keyword triggers:', err);
      }
    }

    // STEP 3C: If no keyword matched, but the chat was already engaged with an active bot, continue with it
    if (!triggeredBot && activeBotId) {
      triggeredBot = botDocsList.find(b => b.id === activeBotId) || null;
    }

    // STEP 3D: If still no bot triggered, check for bots configured to catch 'all' messages
    if (!triggeredBot) {
      for (const bot of botDocsList) {
        if (bot.triggerType === 'all') {
          triggeredBot = bot;
          break;
        }
      }
    }

    // STEP 3E: Fallback to Kosai 'all' triggers
    if (!triggeredBot) {
      try {
        const kosaiRulesSnap = await db.collectionGroup('mod_kosai_rules').get();
        for (const doc of kosaiRulesSnap.docs) {
          const rule = doc.data();
          if (rule?.isActive !== false && rule?.whatsappTrigger?.enabled && rule.whatsappTrigger.triggerType === 'all') {
            const trigger = rule.whatsappTrigger;
            triggeredBot = {
              id: `kosai_${doc.id}`,
              name: trigger.botDisplayName || rule.name,
              systemPrompt: rule.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
              model: 'gemini-3.8-flash',
              temperature: (rule.toneOfVoice?.creativity ?? 50) / 100
            };
            break;
          }
        }
      } catch (err) {}
    }

    if (!triggeredBot) {
      // Automatic Fallback: If tenant has any active bot, use it to ensure user gets a response!
      const anyActiveBot = botDocsList.find(b => b.isActive !== false);
      if (anyActiveBot) {
        triggeredBot = anyActiveBot;
        console.log(`[whatsappWebhook] Using default active bot fallback: ${anyActiveBot.name} (${anyActiveBot.id})`);
      }
    }

    if (!triggeredBot) {
      await logWebhookEvent(resolvedTenantId, 'No bot triggered: Message did not match any keywords and no active default bot found', {
        messageText,
        availableBots: botDocsList.map(b => ({ id: b.id, name: b.name, triggerType: b.triggerType, keywords: b.triggerKeywords || b.keywords }))
      });
      res.status(200).send('No bot triggered');
      return;
    }

    // 4. CRM Contact Check
    let contactDocId: string | null = null;
    let contactName: string | null = null;

    try {
      const qSnap = await db.collection('contacts').where('normalizedPhone', '==', normPhone).get();
      if (!qSnap.empty) {
        contactDocId = qSnap.docs[0].id;
        const d = qSnap.docs[0].data();
        contactName = d.kosun_crm_name || d.conta_name || d.name || null;
      } else {
        const qSnap2 = await db.collection('contacts').where('phone', '==', phone).get();
        if (!qSnap2.empty) {
          contactDocId = qSnap2.docs[0].id;
          const d = qSnap2.docs[0].data();
          contactName = d.kosun_crm_name || d.conta_name || d.name || null;
        } else {
          const qSnap3 = await db.collection('contacts').where('conta_phone', '==', normPhone).get();
          if (!qSnap3.empty) {
            contactDocId = qSnap3.docs[0].id;
            const d = qSnap3.docs[0].data();
            contactName = d.kosun_crm_name || d.conta_name || d.name || null;
          }
        }
      }
    } catch (cErr) {
      console.warn('[whatsappWebhook] Contact query error:', cErr);
    }

    if (!contactName && senderName) {
      contactName = senderName;
    }

    // 4.5 Fetch Brand DNA
    let brandContext = '';
    try {
      const brandDnaSnap = await db.collection('settings').doc('brand_dna').get();
      if (brandDnaSnap.exists) {
        const dna = brandDnaSnap.data();
        brandContext = `\n\n=== רקע על המותג (Brand DNA) ===\n`;
        if (dna?.identity?.name) brandContext += `שם המותג: ${dna.identity.name}\n`;
        if (dna?.identity?.description) brandContext += `תיאור קצר: ${dna.identity.description}\n`;
        if (dna?.voice?.toneOfVoice) brandContext += `סגנון דיבור: ${dna.voice.toneOfVoice}\n`;
        if (dna?.voice?.brandValues?.length) brandContext += `ערכי מותג: ${dna.voice.brandValues.join(', ')}\n`;
      }
    } catch (e) {}

    // 5. Append static, stabilized logic to System Prompt (enables Gemini Implicit Context Caching)
    let strictPrompt = (triggeredBot.systemPrompt || 'אתה נציג שירות ומכירות אינטליגנטי.') + brandContext + '\n\n=== הנחיות חובה נוספות למודל (לא להציג ללקוח) ===\n';
    strictPrompt += '1. התשובות שלך חייבות להיות **קצרות מאוד ותמציתיות** (עד 2-3 משפטים בלבד).\n';
    strictPrompt += '2. אם הלקוח מבקש מידע ארוך (כמו חבילות), תן לו אותו מתומצת מאוד בנקודות קצרות.\n';
    strictPrompt += '3. הובלת השיחה וסגירת מעגל: כאשר השיחה בשלב בירור צרכים, סיים בשאלה ממוקדת כדי לקדם את השיחה. אולם, כאשר הלקוח אישר העברה לנציג אנושי, סגרת פנייה, או הגעתם לסיכום - **איסור מוחלט לשאול שאלות נוספות**! תן אישור קצר, ברכת הצלחה חמה ושחרר את הלקוח.\n';
    strictPrompt += '4. מודעות ערוץ וואטסאפ: אתה מתכתב עם הלקוח ישירות בתוך הוואטסאפ! **לעולם אל תשאל מה מספר הטלפון שלו**, שכן המספר שלו כבר גלוי ומוגדר בהקשר השיחה. אם הלקוח מבקש לשלוח לו דוגמאות או לינקים בווטסאפ, השב שיישלח ישירות למספר זה.\n';
    strictPrompt += '5. כרטיס איש קשר (vCard) ושמירת מספר: כשהלקוח מתעניין או כשהשיחה נסגרת, הצע לו לשמור את כרטיס איש הקשר הרשמי שלנו כדי שיוכל לצפות בסטטוסים שלנו ולקבל תזכורות ועדכונים ישירות ללא סינון ספאם. אם יש צורך בשליחת כרטיס, הוסף את התגית [SEND_CONTACT] בסוף התשובה.\n';
    strictPrompt += '6. אם אין לך תשובה טובה, תגיד שאתה מעביר את הפנייה לנציג אנושי.\n';

    if (triggeredBot.conversationGoal) {
      strictPrompt += `\n=== משימת השיחה העיקרית של הבוט ===\n${triggeredBot.conversationGoal}\n`;
    }

    if (triggeredBot.landingPagesCatalog && Array.isArray(triggeredBot.landingPagesCatalog) && triggeredBot.landingPagesCatalog.length > 0) {
      strictPrompt += `\n=== קטלוג דפי נחיתה וקישורים זמינים למשלוח ללקוח ===\n`;
      triggeredBot.landingPagesCatalog.forEach((lp: any) => {
        strictPrompt += `- ${lp.title}: ${lp.url}\n`;
      });
      strictPrompt += `אם הלקוח מתעניין או מבקש דוגמה/קישור, שלח לו ישירות את הקישור המתאים מהקטלוג!\n`;
    }

    // Loop Guard 1: Anti-Duplication via Message ID
    const messageId = body.idMessage;
    if (messageId) {
      const processedRef = db.collection('processed_webhook_messages').doc(messageId);
      const processedSnap = await processedRef.get();
      if (processedSnap.exists) {
        console.log(`[whatsappWebhook] Message ${messageId} already processed. Skipping to prevent loop.`);
        res.status(200).send('Already processed');
        return;
      }
      await processedRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
    }

    // Loop Guard 2: Throttle per Chat (Rate limit: at least 15 seconds between bot replies)
    const chatThrottleRef = db.collection('wa_chat_throttles').doc(targetChatId);
    const throttleSnap = await chatThrottleRef.get();
    if (throttleSnap.exists) {
      const lastReplyTime = throttleSnap.data()?.lastReplyTime || 0;
      if (Date.now() - lastReplyTime < 15000) {
        console.warn(`[whatsappWebhook] Throttling reply to ${targetChatId} to break loop (last reply < 15s ago).`);
        res.status(200).send('Throttled');
        return;
      }
    }

    // 6. Generate AI Response strictly using valid 2026 model per google-ai-studio-gemini skill
    const targetModel = normalizeModelName(triggeredBot.model || 'gemini-3.8-flash');

    // SLIDING WINDOW CONTEXT: Send at most the last 8 messages (4 turns) to prevent token explosion over long chats!
    const recentHistory = chatHistory.length > 8 ? chatHistory.slice(-8) : chatHistory;
    const contents = recentHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Pass dynamic contact info into conversation turn rather than altering static systemPrompt
    const currentMessageWithContext = contactName
      ? `[נתוני לקוח: ${contactName}]\n${messageText}`
      : messageText;

    contents.push({ role: 'user', parts: [{ text: currentMessageWithContext }] });

    const genAI = new GoogleGenerativeAI(geminiKey);
    let replyText = '';

    try {
      const model = genAI.getGenerativeModel({
        model: targetModel,
        systemInstruction: strictPrompt
      });
      const result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: triggeredBot.temperature || 0.7,
          maxOutputTokens: 1000,
          thinkingConfig: { thinkingBudget: 0 }
        } as any
      });
      replyText = result.response.text()?.trim() || '';

      // Track token usage to platform meter with Context Caching discounts
      try {
        const metadata = (result.response as any).usageMetadata;
        const pTokens = metadata?.promptTokenCount || 250;
        const cTokens = metadata?.candidatesTokenCount || 100;
        const cachedTokens = metadata?.cachedContentTokenCount || 0;
        const tTokens = pTokens + cTokens;

        // Retail value (market rate)
        const retailBilledUSD = Number(((pTokens * 0.75 + cTokens * 3.75) / 1000000).toFixed(6));
        // Actual cost to platform (90% discount on cached input tokens!)
        const uncachedInput = Math.max(0, pTokens - cachedTokens);
        const actualCostUSD = Number(((uncachedInput * 0.75 + cachedTokens * 0.075 + cTokens * 3.75) / 1000000).toFixed(6));
        const profitUSD = Math.max(0, Number((retailBilledUSD - actualCostUSD).toFixed(6)));

        await db.doc('tenants/_master/settings/token_usage').set({
          totalTokens: admin.firestore.FieldValue.increment(tTokens),
          chatbotTokens: admin.firestore.FieldValue.increment(tTokens),
          cachedTokens: admin.firestore.FieldValue.increment(cachedTokens),
          totalCostUSD: admin.firestore.FieldValue.increment(actualCostUSD),
          totalCostILS: admin.firestore.FieldValue.increment(Number((actualCostUSD * 3.7).toFixed(6))),
          retailBilledUSD: admin.firestore.FieldValue.increment(retailBilledUSD),
          retailBilledILS: admin.firestore.FieldValue.increment(Number((retailBilledUSD * 3.7).toFixed(6))),
          grossProfitUSD: admin.firestore.FieldValue.increment(profitUSD),
          grossProfitILS: admin.firestore.FieldValue.increment(Number((profitUSD * 3.7).toFixed(6))),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (trackErr) {
        console.warn('[whatsappWebhook] Token tracking error:', trackErr);
      }
    } catch (err: any) {
      console.error(`[whatsappWebhook] Gemini model ${targetModel} generation failed:`, err?.message || err);
      // PER SKILL RULE: Do NOT send looping filler messages if AI fails or quota is exhausted!
      res.status(200).send('AI Generation Failed - Loop Prevented');
      return;
    }
    
    // If empty response, do not send
    if (!replyText) {
      res.status(200).send('Empty reply - not sent');
      return;
    }

    // Mark throttle timestamp
    await chatThrottleRef.set({ lastReplyTime: Date.now() });

    // 7. Update Chat History
    const nowTimestamp = Date.now();
    chatHistory.push({ role: 'user', text: messageText, timestamp: nowTimestamp });
    chatHistory.push({ role: 'model', text: replyText, timestamp: nowTimestamp + 50 });

    const chatDataToSave = {
      id: targetChatId,
      phone: normPhone,
      contactName: contactName || senderName || normPhone,
      contactId: contactDocId || null,
      botId: triggeredBot.id,
      botName: triggeredBot.name,
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      messages: chatHistory
    };

    await chatDocRef.set(chatDataToSave, { merge: true });

    // Also mirror to scoped collection for UI tab: tenants/{resolvedTenantId}/kos_whatsup_bot_chats
    if (resolvedTenantId && resolvedTenantId !== '_master') {
      try {
        await db.collection('tenants').doc(resolvedTenantId).collection('kos_whatsup_bot_chats').doc(targetChatId).set(chatDataToSave, { merge: true });
      } catch (scopedChatErr) {
        console.warn('[whatsappWebhook] Error writing scoped chat:', scopedChatErr);
      }
    }

    // Also mirror conversation to contact's subcollection if contact exists
    if (contactDocId) {
      try {
        await db.collection('contacts').doc(contactDocId).collection('conversations').doc(`conv_${normPhone}`).set({
          id: `conv_${normPhone}`,
          contactId: contactDocId,
          channel: 'whatsapp',
          botName: triggeredBot.name,
          lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          messages: chatHistory
        }, { merge: true });

        await db.collection('contacts').doc(contactDocId).set({
          last_message: messageText,
          last_channel: 'whatsapp',
          last_conversation_date: new Date().toISOString(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Also mirror to master tenant contacts if available
        try {
          await db.collection('tenants').doc('_master').collection('contacts').doc(contactDocId).collection('conversations').doc(`conv_${normPhone}`).set({
            id: `conv_${normPhone}`,
            contactId: contactDocId,
            channel: 'whatsapp',
            botName: triggeredBot.name,
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            messages: chatHistory
          }, { merge: true });
        } catch {}
      } catch (subErr) {
        console.warn('[whatsappWebhook] Error updating contact conversation subcollection:', subErr);
      }
    }

    // 8. Trigger Async Info Extraction
    extractAndSaveContact(geminiKey, phone, chatHistory, senderName, contactDocId || undefined);

    // 9. Process Media / Contact tags in reply
    let sendContactRequested = false;
    if (replyText.includes('[SEND_CONTACT]')) {
      sendContactRequested = true;
      replyText = replyText.replace(/\[SEND_CONTACT\]/g, '').trim();
    }

    let extractedImageUrl = '';
    let extractedImageCaption = '';
    const imageTagMatch = replyText.match(/\[SEND_IMAGE:\s*([^\s|\]]+)(?:\s*\|\s*([^\]]+))?\]/);
    if (imageTagMatch) {
      extractedImageUrl = imageTagMatch[1]?.trim() || '';
      extractedImageCaption = imageTagMatch[2]?.trim() || '';
      replyText = replyText.replace(imageTagMatch[0], '').trim();
    }

    // Send message back via Green API using direct cluster host
    const instStr = String(greenApiInstanceId || '').trim();
    let host = 'https://api.green-api.com';
    if (instStr.length >= 4) {
      host = `https://${instStr.slice(0, 4)}.api.greenapi.com`;
    }
    const cleanChatId = targetChatId.includes('@')
      ? targetChatId
      : `${targetChatId.replace(/\D/g, '')}@c.us`;

    // 9a. Send text message
    if (replyText) {
      const greenApiUrl = `${host}/waInstance${instStr}/sendMessage/${greenApiToken}`;
      await fetch(greenApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: cleanChatId,
          message: replyText
        })
      });
    }

    // 9b. Send image if requested
    if (extractedImageUrl) {
      try {
        const sendFileUrl = `${host}/waInstance${instStr}/sendFileByUrl/${greenApiToken}`;
        await fetch(sendFileUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: cleanChatId,
            urlFile: extractedImageUrl,
            fileName: 'image.jpg',
            caption: extractedImageCaption || undefined
          })
        });
      } catch (imgErr) {
        console.warn('[whatsappWebhook] Error sending image attachment:', imgErr);
      }
    }

    // 9c. Send vCard contact card if requested (enables mutual contact saving for status visibility & anti-ban)
    if (sendContactRequested) {
      try {
        const businessPhone = String(apiKeys.businessContactPhone || apiKeys.adminNotificationPhone || apiKeys.adminPhone || instStr).replace(/\D/g, '');
        const businessName = String(apiKeys.businessContactName || 'Kosun - שירות לקוחות');
        const phoneInt = parseInt(businessPhone, 10);
        if (!isNaN(phoneInt) && phoneInt > 0) {
          const sendContactUrl = `${host}/waInstance${instStr}/sendContact/${greenApiToken}`;
          await fetch(sendContactUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: cleanChatId,
              contact: {
                phoneContact: phoneInt,
                firstName: businessName,
                company: 'Kosun'
              }
            })
          });
        }
      } catch (cardErr) {
        console.warn('[whatsappWebhook] Error sending contact card:', cardErr);
      }
    }

    // 9d. Admin Alert for Hot Lead / Human Handoff
    const isHumanHandoff =
      replyText.includes('נציג אנושי') ||
      replyText.includes('מתקשר אליך') ||
      replyText.includes('מחייג אליך') ||
      replyText.includes('בדקות הקרובות');

    const adminAlertPhone = apiKeys.adminNotificationPhone || apiKeys.adminPhone;
    if (isHumanHandoff && adminAlertPhone) {
      try {
        const adminDigits = String(adminAlertPhone).replace(/\D/g, '');
        const adminChatId = adminDigits.includes('@') ? adminDigits : `${adminDigits}@c.us`;
        const adminMsg = `🚨 *התראת ליד דורש מענה / העברה לנציג אנושי!*\n\n👤 *שם:* ${contactName || 'לקוח חדש'}\n📱 *טלפון:* ${normPhone}\n💬 *הודעת לקוח:* "${messageText}"\n🤖 *מענה בוט:* "${replyText.slice(0, 160)}..."\n\n_Kosun CRM & WhatsApp AI Bot_`;
        const adminSendUrl = `${host}/waInstance${instStr}/sendMessage/${greenApiToken}`;
        await fetch(adminSendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: adminChatId,
            message: adminMsg
          })
        });
      } catch (adminErr) {
        console.warn('[whatsappWebhook] Error sending admin alert:', adminErr);
      }
    }

    res.status(200).send('Success');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(200).send('Internal Error Handled');
  }
  });
});

/**
 * Proxy Cloud Function for Kesher and EasyCount APIs
 * Prevents ERR_CERT_COMMON_NAME_INVALID and CORS blocking in production (kosun.pro).
 */
export const kesherProxy = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const target = String(req.query.target || req.body?.target || '');
      let destUrl = '';

      if (target === 'connect') {
        destUrl = 'https://kesherhk.info/ConnectToKesher/ConnectToKesher';
      } else if (target === 'ezcount') {
        destUrl = 'https://www.ezcount.co.il/api/get-docs';
      } else if (target.startsWith('KesherAPI/')) {
        destUrl = `https://kesherhk.info/${target}`;
      } else if (req.query.url) {
        destUrl = String(req.query.url);
      } else {
        res.status(400).json({ error: 'Missing valid target parameter (connect, ezcount, KesherAPI/...)' });
        return;
      }

      // Forward request to destination
      const forwardBody = req.body?.payload !== undefined ? req.body.payload : req.body;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const response = await fetch(destUrl, {
        method: req.method === 'GET' ? 'GET' : 'POST',
        headers,
        body: req.method === 'GET' ? undefined : JSON.stringify(forwardBody)
      });

      const responseText = await response.text();
      // Always return JSON with _upstreamStatus so client fetch() can parse cleanly without failing
      try {
        const json = JSON.parse(responseText);
        res.status(200).json({
          _upstreamStatus: response.status,
          ...json
        });
      } catch {
        res.status(200).json({
          status: response.ok ? 'success' : 'error',
          _upstreamStatus: response.status,
          isRawText: true,
          error: response.ok ? undefined : (responseText.slice(0, 500) || `Upstream returned status ${response.status}`),
          data: responseText.slice(0, 1000)
        });
      }
    } catch (err: any) {
      console.error('[kesherProxy] Proxy forwarding failed:', err);
      res.status(200).json({ status: 'error', error: 'Proxy request failed: ' + (err?.message || String(err)) });
    }
  });
});

/**
 * Helper to process pending reminders from Firestore
 * Supports Anti-Ban Jitter, vCard contact card dispatch, and status updating.
 */
async function processPendingReminders(): Promise<{ processed: number; success: number; failed: number }> {
  let processed = 0;
  let successCount = 0;
  let failedCount = 0;

  try {
    // 1. Fetch API keys
    let apiKeys: any = {};
    try {
      const masterDoc = await db.collection('tenants').doc('_master').collection('settings').doc('api_keys').get();
      if (masterDoc.exists) {
        apiKeys = masterDoc.data() || {};
      }
    } catch {}

    if (!apiKeys.greenApiInstanceId || !apiKeys.greenApiToken) {
      try {
        const rootDoc = await db.collection('settings').doc('api_keys').get();
        if (rootDoc.exists) Object.assign(apiKeys, rootDoc.data() || {});
      } catch {}
    }

    const greenApiInstanceId = apiKeys.greenApiInstanceId;
    const greenApiToken = apiKeys.greenApiToken;

    if (!greenApiInstanceId || !greenApiToken) {
      console.warn('[dispatchScheduledReminders] Green-API credentials missing.');
      return { processed: 0, success: 0, failed: 0 };
    }

    const instStr = String(greenApiInstanceId).trim();
    let host = 'https://api.green-api.com';
    if (instStr.length >= 4) {
      host = `https://${instStr.slice(0, 4)}.api.greenapi.com`;
    }

    // 2. Fetch pending reminders from global and collectionGroup
    const nowIso = new Date().toISOString();
    const querySnapshot = await db.collection('scheduled_reminders')
      .where('status', '==', 'pending')
      .limit(50)
      .get();

    const pendingDocs: any[] = [];
    querySnapshot.forEach(d => {
      const data = d.data();
      if (!data.scheduledAt || data.scheduledAt <= nowIso) {
        pendingDocs.push({ ref: d.ref, data: { ...data, id: d.id } });
      }
    });

    try {
      const groupSnap = await db.collectionGroup('scheduled_reminders')
        .where('status', '==', 'pending')
        .limit(50)
        .get();
      groupSnap.forEach(d => {
        if (!pendingDocs.some(p => p.data.id === d.id)) {
          const data = d.data();
          if (!data.scheduledAt || data.scheduledAt <= nowIso) {
            pendingDocs.push({ ref: d.ref, data: { ...data, id: d.id } });
          }
        }
      });
    } catch (gErr) {
      console.warn('[dispatchScheduledReminders] collectionGroup query skipped:', gErr);
    }

    processed = pendingDocs.length;
    if (processed === 0) {
      return { processed: 0, success: 0, failed: 0 };
    }

    // 3. Process each reminder with Anti-Ban Jitter (2.5s delay between sends)
    for (const item of pendingDocs) {
      const reminder = item.data;
      const docRef = item.ref;
      const rawPhone = String(reminder.recipientPhone || '').replace(/\D/g, '');
      if (!rawPhone) {
        await docRef.update({
          status: 'failed',
          error: 'Missing recipient phone',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        failedCount++;
        continue;
      }

      const cleanChatId = rawPhone.includes('@') ? rawPhone : `${rawPhone}@c.us`;

      try {
        let messageId = '';

        // 3a. Send media or text
        if (reminder.mediaUrl) {
          const sendFileUrl = `${host}/waInstance${instStr}/sendFileByUrl/${greenApiToken}`;
          const res = await fetch(sendFileUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: cleanChatId,
              urlFile: reminder.mediaUrl,
              fileName: reminder.mediaFileName || 'reminder_attachment',
              caption: reminder.message
            })
          });
          const json: any = await res.json();
          messageId = json.idMessage || '';
        } else {
          const sendMsgUrl = `${host}/waInstance${instStr}/sendMessage/${greenApiToken}`;
          const res = await fetch(sendMsgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: cleanChatId,
              message: reminder.message
            })
          });
          const json: any = await res.json();
          messageId = json.idMessage || '';
        }

        // 3b. Send vCard contact card if configured (enables lead to save us -> view statuses + anti-ban)
        if (reminder.sendContactCard) {
          try {
            const bPhone = String(reminder.businessContact?.phone || apiKeys.businessContactPhone || apiKeys.adminPhone || instStr).replace(/\D/g, '');
            const bName = String(reminder.businessContact?.name || apiKeys.businessContactName || 'Kosun');
            const phoneInt = parseInt(bPhone, 10);
            if (!isNaN(phoneInt) && phoneInt > 0) {
              const sendContactUrl = `${host}/waInstance${instStr}/sendContact/${greenApiToken}`;
              await fetch(sendContactUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chatId: cleanChatId,
                  contact: {
                    phoneContact: phoneInt,
                    firstName: bName,
                    company: reminder.businessContact?.company || 'Kosun'
                  }
                })
              });
            }
          } catch (cErr) {
            console.warn('[dispatchScheduledReminders] Error sending contact card:', cErr);
          }
        }

        // Mark as sent
        await docRef.update({
          status: 'sent',
          messageId: messageId || 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        successCount++;

        // Anti-Ban Jitter delay (2500ms)
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (err: any) {
        console.error('[dispatchScheduledReminders] Failed sending reminder to', cleanChatId, err);
        await docRef.update({
          status: 'failed',
          error: err?.message || String(err),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        failedCount++;
      }
    }
  } catch (outerErr) {
    console.error('[dispatchScheduledReminders] Global processing error:', outerErr);
  }

  return { processed, success: successCount, failed: failedCount };
}

/**
 * Cloud Scheduled Reminders Cron (Google Cloud Functions Pub/Sub)
 * Runs automatically every 5 minutes in Google Cloud to dispatch pending reminders.
 */
export const dispatchScheduledReminders = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const res = await processPendingReminders();
    console.log('[dispatchScheduledReminders] Completed cycle:', res);
  });

/**
 * HTTPS Endpoint to trigger reminders processing on-demand or via Webhook
 */
export const triggerScheduledReminders = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const result = await processPendingReminders();
    res.status(200).json(result);
  });
});

/**
 * TikTok Official Webhook Handler (Multi-Tenant)
 * Listens for TikTok events (User authorization, video upload status, lead generation, chat)
 * Automatically scopes all received data and leads under the matching tenant (default: manager '_master').
 */
export const tiktokWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 1. Method guard
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // 2. TikTok Challenge / Ping Verification (e.g. Test URL button in Developer Portal)
    const challenge = req.query.challenge || req.body?.challenge;
    if (challenge) {
      res.status(200).send(challenge);
      return;
    }

    if (req.method === 'GET') {
      res.status(200).json({ code: 0, status: 'online', message: 'TikTok Webhook Gateway is running' });
      return;
    }

    try {
      const body = req.body || {};
      const queryTenant = (req.query.tenant as string) || '';
      
      // Determine tenant (query param > reverse lookup open_id > manager default '_master')
      let tenantId = queryTenant.trim().toLowerCase();
      if (!tenantId || tenantId === 'manager') {
        tenantId = '_master';
      }

      // If payload has user_openid and not explicitly set by query, try reverse lookup
      const openId = body.user_openid || body.open_id || body.entry?.[0]?.open_id;
      if (openId && tenantId === '_master') {
        try {
          const lookupDoc = await db.collection('system_tiktok_lookup').doc(openId).get();
          if (lookupDoc.exists && lookupDoc.data()?.tenantId) {
            tenantId = lookupDoc.data()!.tenantId;
          }
        } catch (lookupErr) {
          console.warn('[tiktokWebhook] Lookup error:', lookupErr);
        }
      }

      const eventType = body.event || body.type || 'test_ping';
      const eventId = `tt_evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const timestamp = new Date().toISOString();

      console.log(`[tiktokWebhook] Received event: ${eventType} for tenant: ${tenantId}`, body);

      // 3. Save raw webhook event under the tenant scope
      await db
        .collection('tenants')
        .doc(tenantId)
        .collection('mod_kos_tiktok_events')
        .doc(eventId)
        .set({
          eventId,
          event: eventType,
          payload: body,
          receivedAt: timestamp,
          tenantId,
          status: 'received',
          _serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

      // 4. Special Handling: TikTok Lead Generation (Instant Forms)
      // When a lead arrives, extract and sync directly to tenant's CRM contacts
      const leadData = body.lead_data || body.content?.lead || body.entry?.[0]?.changes?.[0]?.value;
      if (eventType.includes('lead') || leadData) {
        const leadId = `tt_lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const formId = body.form_id || body.content?.form_id || 'general_form';
        
        const extractedName = leadData?.full_name || leadData?.name || body.name || '';
        const extractedPhone = leadData?.phone_number || leadData?.phone || body.phone || '';
        const extractedEmail = leadData?.email || body.email || '';

        // Save to tenant's TikTok leads collection
        await db
          .collection('tenants')
          .doc(tenantId)
          .collection('mod_kos_tiktok_leads')
          .doc(leadId)
          .set({
            id: leadId,
            formId,
            leadData: {
              fullName: extractedName,
              phone: extractedPhone,
              email: extractedEmail,
              customAnswers: leadData?.answers || {},
            },
            submittedAt: timestamp,
            syncedToCrm: true,
            _serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

        // Sync directly to tenant's CRM contacts
        if (extractedPhone || extractedEmail || extractedName) {
          const contactId = `contact_tt_${Date.now()}`;
          await db
            .collection('tenants')
            .doc(tenantId)
            .collection('contacts')
            .doc(contactId)
            .set({
              id: contactId,
              kosun_crm_name: extractedName || 'ליד מטיקטוק',
              kosun_crm_phone: extractedPhone,
              kosun_crm_email: extractedEmail,
              kosun_crm_source: 'tiktok_lead_generation',
              kosun_crm_tags: ['tiktok_lead', formId],
              kosun_crm_notes: `התקבל מטופס טיקטוק בתאריך ${timestamp}`,
              createdAt: timestamp,
              updatedAt: timestamp,
              _serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
      }

      // 5. Always respond 200 OK with code 0 to satisfy TikTok Webhook Verification
      res.status(200).json({
        code: 0,
        message: 'success',
        eventId,
        tenantId,
      });
    } catch (err: any) {
      console.error('[tiktokWebhook] Processing error:', err);
      // TikTok requires 200 OK to prevent retries on processing issues
      res.status(200).json({
        code: 0,
        message: 'acknowledged_with_error',
        error: err.message,
      });
    }
  });
});

/**
 * Media Proxy Cloud Function (Tenant-Aware CDN Proxy for kosun.pro/media/*)
 * Serves media files directly under https://kosun.pro/media/... or https://[tenant].kosun.pro/media/...
 * Automatically resolves tenant isolation and caches assets with aggressive HTTP Cache-Control.
 */
export const mediaProxy = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      // 1. Determine tenant from Host header or query param
      const host = req.hostname || (req.headers.host || '').split(':')[0].toLowerCase();
      let tenantId = (req.query.tenant as string) || '';

      if (!tenantId && host.endsWith('.kosun.pro')) {
        const sub = host.replace('.kosun.pro', '').trim();
        if (sub && sub !== 'www' && sub !== 'admin' && sub !== 'app') {
          tenantId = sub;
        }
      }

      // 2. Extract requested path
      let rawPath = req.path || '';
      rawPath = rawPath.replace(/^\/api\/media-proxy\/?/, '').replace(/^\/media\/?/, '');
      rawPath = decodeURIComponent(rawPath).trim();

      if (!rawPath) {
        res.status(400).send('Missing media file path');
        return;
      }

      // 3. Resolve bucket storage path
      let storagePath = rawPath;
      if (tenantId && tenantId !== '_master') {
        if (!storagePath.startsWith(`tenants/${tenantId}/`)) {
          storagePath = `tenants/${tenantId}/media/${storagePath.replace(/^sdo_media_vault\//, '')}`;
        }
      } else {
        if (!storagePath.startsWith('sdo_media_vault/') && !storagePath.startsWith('tenants/')) {
          storagePath = `sdo_media_vault/${storagePath}`;
        }
      }

      const bucket = admin.storage().bucket('glowmanage.firebasestorage.app');
      const file = bucket.file(storagePath);

      const [exists] = await file.exists();
      if (!exists) {
        // Fallback: check legacy vault path
        const legacyFile = bucket.file(`sdo_media_vault/${rawPath.replace(/^.*[\\/]/, '')}`);
        const [legacyExists] = await legacyFile.exists();
        if (legacyExists) {
          serveStorageFile(legacyFile, req, res);
          return;
        }
        res.status(404).send('Media not found');
        return;
      }

      serveStorageFile(file, req, res);
    } catch (err: any) {
      console.error('[mediaProxy] Error serving media:', err);
      res.status(500).send('Internal Media Proxy Error');
    }
  });
});

async function serveStorageFile(file: any, req: functions.Request, res: functions.Response) {
  try {
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Kosun-Tenant-Media', 'true');

    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }

    const readStream = file.createReadStream();
    readStream.on('error', (streamErr: any) => {
      console.error('[mediaProxy] Stream error:', streamErr);
      if (!res.headersSent) {
        res.status(500).send('Stream error');
      }
    });

    readStream.pipe(res);
  } catch (metaErr) {
    console.error('[mediaProxy] Metadata fetch error:', metaErr);
    res.status(500).send('Could not fetch media');
  }
}

/**
 * Dynamic XML Sitemap Generator (Multi-Tenant & SEO Optimized)
 * Serves standard application/xml sitemaps for Google Search Console and crawlers.
 * Discovers root pages, published landing pages, and tenant subdomains from Firestore.
 */
export const sitemapXml = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');

      const host = (req.hostname || (req.headers.host || '')).split(':')[0].toLowerCase();
      let tenantId = (req.query.tenant as string) || '';

      if (!tenantId && host.endsWith('.kosun.pro')) {
        const sub = host.replace('.kosun.pro', '').trim();
        if (sub && sub !== 'www' && sub !== 'admin' && sub !== 'app') {
          tenantId = sub;
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

      if (!tenantId || tenantId === '_master') {
        // Master / Root domain URLs
        const baseUrl = 'https://kosun.pro';
        urls.push(
          { loc: `${baseUrl}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
          { loc: `${baseUrl}/kosass`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${baseUrl}/terms`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
          { loc: `${baseUrl}/privacy`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
          { loc: `${baseUrl}/accessibility`, lastmod: today, changefreq: 'monthly', priority: '0.5' }
        );

        // Fetch published custom pages from Firestore
        try {
          const pagesSnap = await db.collection('tenants').doc('_master').collection('pages').get();
          pagesSnap.forEach(doc => {
            const data = doc.data();
            if (data?.published !== false && data?.slug) {
              urls.push({
                loc: `${baseUrl}/p/${data.slug}`,
                lastmod: data.updatedAt ? new Date(data.updatedAt).toISOString().split('T')[0] : today,
                changefreq: 'weekly',
                priority: '0.7',
              });
            }
          });
        } catch (err) {
          console.warn('[sitemapXml] Error loading master pages:', err);
        }

        // Fetch active tenant subdomains from 'tenants' collection
        try {
          const tenantsSnap = await db.collection('tenants').get();
          tenantsSnap.forEach(doc => {
            const data = doc.data();
            const sub = data?.subdomain || doc.id;
            if (sub && sub !== '_master' && !sub.startsWith('_') && data?.status !== 'suspended') {
              urls.push({
                loc: `https://${sub}.kosun.pro/`,
                lastmod: data?.updatedAt ? new Date(data.updatedAt).toISOString().split('T')[0] : today,
                changefreq: 'weekly',
                priority: '0.7',
              });
            }
          });
        } catch (err) {
          console.warn('[sitemapXml] Error loading tenant subdomains:', err);
        }
      } else {
        // Tenant Subdomain URLs
        const tenantBaseUrl = `https://${tenantId}.kosun.pro`;
        urls.push({
          loc: `${tenantBaseUrl}/`,
          lastmod: today,
          changefreq: 'daily',
          priority: '1.0',
        });

        try {
          const pagesSnap = await db.collection('tenants').doc(tenantId).collection('pages').get();
          pagesSnap.forEach(doc => {
            const data = doc.data();
            if (data?.published !== false && data?.slug) {
              urls.push({
                loc: `${tenantBaseUrl}/p/${data.slug}`,
                lastmod: data.updatedAt ? new Date(data.updatedAt).toISOString().split('T')[0] : today,
                changefreq: 'weekly',
                priority: '0.8',
              });
            }
          });
        } catch (err) {
          console.warn(`[sitemapXml] Error loading pages for tenant ${tenantId}:`, err);
        }
      }

      // Generate XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      for (const u of urls) {
        xml += `  <url>\n`;
        xml += `    <loc>${u.loc}</loc>\n`;
        xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
        xml += `    <priority>${u.priority}</priority>\n`;
        xml += `  </url>\n`;
      }
      xml += '</urlset>\n';

      res.status(200).send(xml);
    } catch (error: any) {
      console.error('[sitemapXml] Failed generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });
});



