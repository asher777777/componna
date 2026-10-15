"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerScheduledReminders = exports.dispatchScheduledReminders = exports.kesherProxy = exports.whatsappWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
const corsLib = require("cors");
const cors = corsLib({ origin: true });
admin.initializeApp();
const db = admin.firestore();
// Fire-and-forget contact extraction
async function extractAndSaveContact(geminiKey, phone, messages, fallbackSenderName, contactIdHint) {
    var _a, _b;
    try {
        const rawDigits = phone.replace(/\D/g, '');
        const normPhone = rawDigits.startsWith('972') ? '0' + rawDigits.slice(3) : rawDigits;
        const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash-lite' });
        const chatText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
        const prompt = `
    Extract contact information from the following chat log.
    If the user mentions their name, email, or business type, extract it.
    Return ONLY a raw JSON object with the following structure (no markdown tags, no backticks).
    {
      "name": "extracted name or null",
      "email": "extracted email or null",
      "businessType": "extracted business type or null"
    }
    
    Chat:
    ${chatText}
    `;
        const result = await model.generateContent(prompt);
        // Track token usage to platform meter
        try {
            const pTokens = ((_a = result.response.usageMetadata) === null || _a === void 0 ? void 0 : _a.promptTokenCount) || 200;
            const cTokens = ((_b = result.response.usageMetadata) === null || _b === void 0 ? void 0 : _b.candidatesTokenCount) || 80;
            const tTokens = pTokens + cTokens;
            const costUSD = Number(((pTokens * 0.75 + cTokens * 3.75) / 1000000).toFixed(6));
            await db.doc('tenants/_master/settings/token_usage').set({
                totalTokens: admin.firestore.FieldValue.increment(tTokens),
                contentTokens: admin.firestore.FieldValue.increment(tTokens),
                totalCostUSD: admin.firestore.FieldValue.increment(costUSD),
                totalCostILS: admin.firestore.FieldValue.increment(Number((costUSD * 3.7).toFixed(6))),
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }
        catch (_c) { }
        const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
        let data = {};
        try {
            data = JSON.parse(text);
        }
        catch (_d) {
            data = {};
        }
        // Smart lookup existing contact
        let matchedDocId = contactIdHint || null;
        let existingData = null;
        if (!matchedDocId) {
            const qSnap = await db.collection('contacts').where('normalizedPhone', '==', normPhone).get();
            if (!qSnap.empty) {
                matchedDocId = qSnap.docs[0].id;
                existingData = qSnap.docs[0].data();
            }
            else {
                const qSnap2 = await db.collection('contacts').where('phone', '==', phone).get();
                if (!qSnap2.empty) {
                    matchedDocId = qSnap2.docs[0].id;
                    existingData = qSnap2.docs[0].data();
                }
                else {
                    const qSnap3 = await db.collection('contacts').where('conta_phone', '==', normPhone).get();
                    if (!qSnap3.empty) {
                        matchedDocId = qSnap3.docs[0].id;
                        existingData = qSnap3.docs[0].data();
                    }
                }
            }
        }
        else {
            const docSnap = await db.collection('contacts').doc(matchedDocId).get();
            if (docSnap.exists) {
                existingData = docSnap.data();
            }
        }
        const resolvedName = data.name || (existingData === null || existingData === void 0 ? void 0 : existingData.kosun_crm_name) || (existingData === null || existingData === void 0 ? void 0 : existingData.conta_name) || (existingData === null || existingData === void 0 ? void 0 : existingData.name) || fallbackSenderName || `לקוח ${normPhone.slice(-4)}`;
        const nowIso = new Date().toISOString();
        const lastMsgText = messages.length > 0 ? messages[messages.length - 1].text : '';
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
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            const addedRef = await db.collection('contacts').add(newContactDoc);
            matchedDocId = addedRef.id;
            try {
                await db.collection('tenants').doc('_master').collection('contacts').doc(matchedDocId).set(newContactDoc, { merge: true });
            }
            catch (_e) { }
        }
        else {
            // Update existing contact
            const updates = {
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                last_message: lastMsgText,
                last_channel: 'whatsapp',
                last_conversation_date: nowIso,
            };
            if (data.name && (!(existingData === null || existingData === void 0 ? void 0 : existingData.name) || (existingData === null || existingData === void 0 ? void 0 : existingData.name) === phone || (existingData === null || existingData === void 0 ? void 0 : existingData.name) === normPhone)) {
                updates.name = data.name;
                updates.conta_name = data.name;
                updates.kosun_crm_name = data.name;
            }
            if (data.email && !(existingData === null || existingData === void 0 ? void 0 : existingData.email)) {
                updates.email = data.email;
                updates.kosun_crm_email = data.email;
            }
            if (data.businessType && !(existingData === null || existingData === void 0 ? void 0 : existingData.company_name)) {
                updates.company_name = data.businessType;
                updates.kosun_crm_company = data.businessType;
            }
            await db.collection('contacts').doc(matchedDocId).set(updates, { merge: true });
            try {
                await db.collection('tenants').doc('_master').collection('contacts').doc(matchedDocId).set(updates, { merge: true });
            }
            catch (_f) { }
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
            }
            catch (_g) { }
        }
    }
    catch (err) {
        console.error('Extraction error:', err);
    }
}
function normalizeTextForMatching(text) {
    if (!text)
        return '';
    return text
        .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
        .replace(/[\u0591-\u05C7]/g, '')
        .replace(/\u00A0/g, ' ')
        .toLowerCase()
        .trim();
}
function flattenKeywords(keywords) {
    if (!keywords)
        return [];
    const list = Array.isArray(keywords) ? keywords : [String(keywords)];
    const result = [];
    for (const item of list) {
        if (typeof item === 'string') {
            const parts = item.split(/[,;\n\t]+/).map(p => p.trim()).filter(Boolean);
            result.push(...parts);
        }
    }
    return result;
}
function matchKeywords(messageText, keywords = [], matchMode = 'contains') {
    if (!messageText || !keywords)
        return { isMatch: false };
    const normMsg = normalizeTextForMatching(messageText);
    if (!normMsg)
        return { isMatch: false };
    const strippedMsg = normMsg.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'״׳]/g, ' ');
    const msgWords = strippedMsg.split(/\s+/).filter(Boolean);
    const flattened = flattenKeywords(keywords);
    for (const rawKw of flattened) {
        const normKw = normalizeTextForMatching(rawKw);
        if (!normKw)
            continue;
        const strippedKw = normKw.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'״׳]/g, ' ').trim();
        if (!strippedKw)
            continue;
        if (matchMode === 'exact') {
            if (normMsg === normKw || strippedMsg === strippedKw)
                return { isMatch: true, matchedKeyword: rawKw };
            if (msgWords.includes(strippedKw))
                return { isMatch: true, matchedKeyword: rawKw };
            const boundaryRegex = new RegExp(`(^|\\s)${strippedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
            if (boundaryRegex.test(strippedMsg))
                return { isMatch: true, matchedKeyword: rawKw };
        }
        else if (matchMode === 'startsWith') {
            if (normMsg.startsWith(normKw) || strippedMsg.startsWith(strippedKw))
                return { isMatch: true, matchedKeyword: rawKw };
        }
        else {
            if (normMsg.includes(normKw) || strippedMsg.includes(strippedKw))
                return { isMatch: true, matchedKeyword: rawKw };
        }
    }
    return { isMatch: false };
}
// Webhook for Green API
exports.whatsappWebhook = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
        if (req.method !== 'POST' && req.method !== 'GET') {
            res.status(405).send('Method Not Allowed');
            return;
        }
        if (req.method === 'GET') {
            res.status(200).send('Webhook is running');
            return;
        }
        const body = req.body;
        if (!body || body.typeWebhook !== 'incomingMessageReceived') {
            res.status(200).send('Not an incoming message');
            return;
        }
        const messageText = ((_b = (_a = body.messageData) === null || _a === void 0 ? void 0 : _a.textMessageData) === null || _b === void 0 ? void 0 : _b.textMessage) ||
            ((_d = (_c = body.messageData) === null || _c === void 0 ? void 0 : _c.extendedTextMessageData) === null || _d === void 0 ? void 0 : _d.textMessage) ||
            ((_f = (_e = body.messageData) === null || _e === void 0 ? void 0 : _e.buttonsResponseMessageData) === null || _f === void 0 ? void 0 : _f.selectedDisplayText) ||
            ((_h = (_g = body.messageData) === null || _g === void 0 ? void 0 : _g.buttonsResponseMessageData) === null || _h === void 0 ? void 0 : _h.selectedButtonId) ||
            ((_k = (_j = body.messageData) === null || _j === void 0 ? void 0 : _j.listResponseMessageData) === null || _k === void 0 ? void 0 : _k.title) ||
            '';
        const sender = (_l = body.senderData) === null || _l === void 0 ? void 0 : _l.sender;
        const targetChatId = ((_m = body.senderData) === null || _m === void 0 ? void 0 : _m.chatId) || sender;
        const senderName = ((_o = body.senderData) === null || _o === void 0 ? void 0 : _o.senderName) || ((_p = body.senderData) === null || _p === void 0 ? void 0 : _p.senderContactName) || '';
        if (!messageText || !targetChatId) {
            res.status(200).send('No text or targetChatId');
            return;
        }
        const cleanDigits = targetChatId.split('@')[0].replace(/\D/g, '');
        const phone = cleanDigits;
        const normPhone = cleanDigits.startsWith('972') ? '0' + cleanDigits.slice(3) : cleanDigits;
        try {
            // 1. Fetch API Keys with Multi-Tenant and Root Fallbacks
            let apiKeys = {};
            try {
                const masterDoc = await db.collection('tenants').doc('_master').collection('settings').doc('api_keys').get();
                if (masterDoc.exists) {
                    apiKeys = masterDoc.data() || {};
                }
            }
            catch (e) {
                console.warn('Error reading master api_keys:', e);
            }
            if (!apiKeys.googleAiApiKey && !apiKeys.geminiApiKey) {
                try {
                    const rootDoc = await db.collection('settings').doc('api_keys').get();
                    if (rootDoc.exists)
                        Object.assign(apiKeys, rootDoc.data() || {});
                }
                catch (e) { }
            }
            if (!apiKeys.googleAiApiKey && !apiKeys.geminiApiKey) {
                try {
                    const globalDoc = await db.collection('system_settings').doc('global').get();
                    if (globalDoc.exists)
                        Object.assign(apiKeys, ((_q = globalDoc.data()) === null || _q === void 0 ? void 0 : _q.apiKeys) || {});
                }
                catch (e) { }
            }
            const geminiKey = apiKeys.googleAiApiKey || apiKeys.geminiApiKey;
            const greenApiInstanceId = apiKeys.greenApiInstanceId || ((_r = body.instanceData) === null || _r === void 0 ? void 0 : _r.idInstance);
            const greenApiToken = apiKeys.greenApiToken;
            if (!geminiKey || !greenApiInstanceId || !greenApiToken) {
                console.warn('Missing keys for WhatsApp AI Bot:', {
                    hasGeminiKey: Boolean(geminiKey),
                    hasInstanceId: Boolean(greenApiInstanceId),
                    hasToken: Boolean(greenApiToken)
                });
                // Acknowledge with 200 so Green API does not enter an infinite retry storm
                res.status(200).send('Missing keys - acknowledged');
                return;
            }
            // 2. Load Chat History
            const chatDocRef = db.collection('wa_bot_chats').doc(targetChatId);
            const chatDoc = await chatDocRef.get();
            let chatHistory = [];
            if (chatDoc.exists) {
                chatHistory = ((_s = chatDoc.data()) === null || _s === void 0 ? void 0 : _s.messages) || [];
            }
            // 3. Detect Bot Trigger (only if it's the start of a conversation, or if the bot is already engaged)
            let triggeredBot = null;
            let activeBotId = (_t = chatDoc.data()) === null || _t === void 0 ? void 0 : _t.botId;
            // Load active bots from master tenant, root and collectionGroup (without where clause to avoid missing index errors)
            const botDocsList = [];
            try {
                const masterSnap = await db.collection('tenants').doc('_master').collection('whatsapp_ai_bots').get();
                masterSnap.forEach(d => {
                    const data = d.data();
                    if (data && data.isActive !== false) {
                        botDocsList.push(Object.assign(Object.assign({}, data), { id: data.id || d.id }));
                    }
                });
            }
            catch (e) {
                console.warn('Error querying master bots:', e);
            }
            try {
                const groupSnap = await db.collectionGroup('whatsapp_ai_bots').get();
                groupSnap.forEach(d => {
                    const data = d.data();
                    if (data && data.isActive !== false && !botDocsList.some(b => b.id === (data.id || d.id))) {
                        botDocsList.push(Object.assign(Object.assign({}, data), { id: data.id || d.id }));
                    }
                });
            }
            catch (e) {
                console.warn('Error querying collectionGroup bots:', e);
            }
            // If bot was already engaged in this chat, keep using it
            if (activeBotId) {
                triggeredBot = botDocsList.find(b => b.id === activeBotId) || null;
            }
            // Otherwise check for keyword triggers in whatsapp_ai_bots
            if (!triggeredBot) {
                for (const bot of botDocsList) {
                    if (bot.triggerType === 'all') {
                        triggeredBot = bot;
                        break;
                    }
                    else if (bot.triggerType === 'keyword' && (bot.triggerKeywords || bot.keywords)) {
                        const kws = bot.triggerKeywords || bot.keywords;
                        const matchResult = matchKeywords(messageText, kws, bot.matchMode || 'contains');
                        if (matchResult.isMatch) {
                            triggeredBot = bot;
                            break;
                        }
                    }
                }
            }
            // Check Kosai Engine Rules with WhatsApp Triggers if still no bot triggered
            if (!triggeredBot) {
                try {
                    const kosaiRulesSnap = await db.collectionGroup('mod_kosai_rules').get();
                    for (const doc of kosaiRulesSnap.docs) {
                        const rule = doc.data();
                        if ((rule === null || rule === void 0 ? void 0 : rule.isActive) !== false && ((_u = rule === null || rule === void 0 ? void 0 : rule.whatsappTrigger) === null || _u === void 0 ? void 0 : _u.enabled)) {
                            const trigger = rule.whatsappTrigger;
                            if (trigger.triggerType === 'all') {
                                triggeredBot = {
                                    id: `kosai_${doc.id}`,
                                    name: trigger.botDisplayName || rule.name,
                                    systemPrompt: rule.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
                                    model: 'gemini-3.8-flash-lite',
                                    temperature: ((_w = (_v = rule.toneOfVoice) === null || _v === void 0 ? void 0 : _v.creativity) !== null && _w !== void 0 ? _w : 50) / 100
                                };
                                break;
                            }
                            else if (trigger.triggerType === 'keyword' && (trigger.keywords || trigger.triggerKeywords)) {
                                const kws = trigger.keywords || trigger.triggerKeywords;
                                const matchResult = matchKeywords(messageText, kws, trigger.matchMode || 'contains');
                                if (matchResult.isMatch) {
                                    triggeredBot = {
                                        id: `kosai_${doc.id}`,
                                        name: trigger.botDisplayName || rule.name,
                                        systemPrompt: rule.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
                                        model: 'gemini-3.8-flash-lite',
                                        temperature: ((_y = (_x = rule.toneOfVoice) === null || _x === void 0 ? void 0 : _x.creativity) !== null && _y !== void 0 ? _y : 50) / 100
                                    };
                                    break;
                                }
                            }
                        }
                    }
                }
                catch (err) {
                    console.warn('Error querying kosai rules for triggers:', err);
                }
            }
            if (!triggeredBot) {
                res.status(200).send('No bot triggered');
                return;
            }
            // 4. CRM Contact Check
            let contactDocId = null;
            let contactName = null;
            try {
                const qSnap = await db.collection('contacts').where('normalizedPhone', '==', normPhone).get();
                if (!qSnap.empty) {
                    contactDocId = qSnap.docs[0].id;
                    const d = qSnap.docs[0].data();
                    contactName = d.kosun_crm_name || d.conta_name || d.name || null;
                }
                else {
                    const qSnap2 = await db.collection('contacts').where('phone', '==', phone).get();
                    if (!qSnap2.empty) {
                        contactDocId = qSnap2.docs[0].id;
                        const d = qSnap2.docs[0].data();
                        contactName = d.kosun_crm_name || d.conta_name || d.name || null;
                    }
                    else {
                        const qSnap3 = await db.collection('contacts').where('conta_phone', '==', normPhone).get();
                        if (!qSnap3.empty) {
                            contactDocId = qSnap3.docs[0].id;
                            const d = qSnap3.docs[0].data();
                            contactName = d.kosun_crm_name || d.conta_name || d.name || null;
                        }
                    }
                }
            }
            catch (cErr) {
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
                    if ((_z = dna === null || dna === void 0 ? void 0 : dna.identity) === null || _z === void 0 ? void 0 : _z.name)
                        brandContext += `שם המותג: ${dna.identity.name}\n`;
                    if ((_0 = dna === null || dna === void 0 ? void 0 : dna.identity) === null || _0 === void 0 ? void 0 : _0.description)
                        brandContext += `תיאור קצר: ${dna.identity.description}\n`;
                    if ((_1 = dna === null || dna === void 0 ? void 0 : dna.voice) === null || _1 === void 0 ? void 0 : _1.toneOfVoice)
                        brandContext += `סגנון דיבור: ${dna.voice.toneOfVoice}\n`;
                    if ((_3 = (_2 = dna === null || dna === void 0 ? void 0 : dna.voice) === null || _2 === void 0 ? void 0 : _2.brandValues) === null || _3 === void 0 ? void 0 : _3.length)
                        brandContext += `ערכי מותג: ${dna.voice.brandValues.join(', ')}\n`;
                }
            }
            catch (e) { }
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
                triggeredBot.landingPagesCatalog.forEach((lp) => {
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
                const lastReplyTime = ((_4 = throttleSnap.data()) === null || _4 === void 0 ? void 0 : _4.lastReplyTime) || 0;
                if (Date.now() - lastReplyTime < 15000) {
                    console.warn(`[whatsappWebhook] Throttling reply to ${targetChatId} to break loop (last reply < 15s ago).`);
                    res.status(200).send('Throttled');
                    return;
                }
            }
            // 6. Generate AI Response strictly using valid 2026 model per google-ai-studio-gemini skill
            const targetModel = triggeredBot.model || 'gemini-3.8-flash-lite';
            const contents = chatHistory.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
            // Pass dynamic contact info into conversation turn rather than altering static systemPrompt
            const currentMessageWithContext = contactName
                ? `[נתוני לקוח: ${contactName}]\n${messageText}`
                : messageText;
            contents.push({ role: 'user', parts: [{ text: currentMessageWithContext }] });
            const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
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
                    }
                });
                replyText = ((_5 = result.response.text()) === null || _5 === void 0 ? void 0 : _5.trim()) || '';
                // Track token usage to platform meter with Context Caching discounts
                try {
                    const metadata = result.response.usageMetadata;
                    const pTokens = (metadata === null || metadata === void 0 ? void 0 : metadata.promptTokenCount) || 250;
                    const cTokens = (metadata === null || metadata === void 0 ? void 0 : metadata.candidatesTokenCount) || 100;
                    const cachedTokens = (metadata === null || metadata === void 0 ? void 0 : metadata.cachedContentTokenCount) || 0;
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
                }
                catch (trackErr) {
                    console.warn('[whatsappWebhook] Token tracking error:', trackErr);
                }
            }
            catch (err) {
                console.error(`[whatsappWebhook] Gemini model ${targetModel} generation failed:`, (err === null || err === void 0 ? void 0 : err.message) || err);
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
            await chatDocRef.set({
                id: targetChatId,
                phone: normPhone,
                contactName: contactName || senderName || normPhone,
                contactId: contactDocId || null,
                botId: triggeredBot.id,
                botName: triggeredBot.name,
                lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                messages: chatHistory
            }, { merge: true });
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
                    }
                    catch (_8) { }
                }
                catch (subErr) {
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
                extractedImageUrl = ((_6 = imageTagMatch[1]) === null || _6 === void 0 ? void 0 : _6.trim()) || '';
                extractedImageCaption = ((_7 = imageTagMatch[2]) === null || _7 === void 0 ? void 0 : _7.trim()) || '';
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
                }
                catch (imgErr) {
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
                }
                catch (cardErr) {
                    console.warn('[whatsappWebhook] Error sending contact card:', cardErr);
                }
            }
            // 9d. Admin Alert for Hot Lead / Human Handoff
            const isHumanHandoff = replyText.includes('נציג אנושי') ||
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
                }
                catch (adminErr) {
                    console.warn('[whatsappWebhook] Error sending admin alert:', adminErr);
                }
            }
            res.status(200).send('Success');
        }
        catch (error) {
            console.error('Error processing webhook:', error);
            res.status(200).send('Internal Error Handled');
        }
    });
});
/**
 * Proxy Cloud Function for Kesher and EasyCount APIs
 * Prevents ERR_CERT_COMMON_NAME_INVALID and CORS blocking in production (kosun.pro).
 */
exports.kesherProxy = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        var _a, _b;
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }
        try {
            const target = String(req.query.target || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.target) || '');
            let destUrl = '';
            if (target === 'connect') {
                destUrl = 'https://kesherhk.info/ConnectToKesher/ConnectToKesher';
            }
            else if (target === 'ezcount') {
                destUrl = 'https://www.ezcount.co.il/api/get-docs';
            }
            else if (target.startsWith('KesherAPI/')) {
                destUrl = `https://kesherhk.info/${target}`;
            }
            else if (req.query.url) {
                destUrl = String(req.query.url);
            }
            else {
                res.status(400).json({ error: 'Missing valid target parameter (connect, ezcount, KesherAPI/...)' });
                return;
            }
            // Forward request to destination
            const forwardBody = ((_b = req.body) === null || _b === void 0 ? void 0 : _b.payload) !== undefined ? req.body.payload : req.body;
            const headers = {
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
                res.status(200).json(Object.assign({ _upstreamStatus: response.status }, json));
            }
            catch (_c) {
                res.status(200).json({
                    status: response.ok ? 'success' : 'error',
                    _upstreamStatus: response.status,
                    isRawText: true,
                    error: response.ok ? undefined : (responseText.slice(0, 500) || `Upstream returned status ${response.status}`),
                    data: responseText.slice(0, 1000)
                });
            }
        }
        catch (err) {
            console.error('[kesherProxy] Proxy forwarding failed:', err);
            res.status(200).json({ status: 'error', error: 'Proxy request failed: ' + ((err === null || err === void 0 ? void 0 : err.message) || String(err)) });
        }
    });
});
/**
 * Helper to process pending reminders from Firestore
 * Supports Anti-Ban Jitter, vCard contact card dispatch, and status updating.
 */
async function processPendingReminders() {
    var _a, _b, _c;
    let processed = 0;
    let successCount = 0;
    let failedCount = 0;
    try {
        // 1. Fetch API keys
        let apiKeys = {};
        try {
            const masterDoc = await db.collection('tenants').doc('_master').collection('settings').doc('api_keys').get();
            if (masterDoc.exists) {
                apiKeys = masterDoc.data() || {};
            }
        }
        catch (_d) { }
        if (!apiKeys.greenApiInstanceId || !apiKeys.greenApiToken) {
            try {
                const rootDoc = await db.collection('settings').doc('api_keys').get();
                if (rootDoc.exists)
                    Object.assign(apiKeys, rootDoc.data() || {});
            }
            catch (_e) { }
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
        const pendingDocs = [];
        querySnapshot.forEach(d => {
            const data = d.data();
            if (!data.scheduledAt || data.scheduledAt <= nowIso) {
                pendingDocs.push({ ref: d.ref, data: Object.assign(Object.assign({}, data), { id: d.id }) });
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
                        pendingDocs.push({ ref: d.ref, data: Object.assign(Object.assign({}, data), { id: d.id }) });
                    }
                }
            });
        }
        catch (gErr) {
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
                    const json = await res.json();
                    messageId = json.idMessage || '';
                }
                else {
                    const sendMsgUrl = `${host}/waInstance${instStr}/sendMessage/${greenApiToken}`;
                    const res = await fetch(sendMsgUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chatId: cleanChatId,
                            message: reminder.message
                        })
                    });
                    const json = await res.json();
                    messageId = json.idMessage || '';
                }
                // 3b. Send vCard contact card if configured (enables lead to save us -> view statuses + anti-ban)
                if (reminder.sendContactCard) {
                    try {
                        const bPhone = String(((_a = reminder.businessContact) === null || _a === void 0 ? void 0 : _a.phone) || apiKeys.businessContactPhone || apiKeys.adminPhone || instStr).replace(/\D/g, '');
                        const bName = String(((_b = reminder.businessContact) === null || _b === void 0 ? void 0 : _b.name) || apiKeys.businessContactName || 'Kosun');
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
                                        company: ((_c = reminder.businessContact) === null || _c === void 0 ? void 0 : _c.company) || 'Kosun'
                                    }
                                })
                            });
                        }
                    }
                    catch (cErr) {
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
            }
            catch (err) {
                console.error('[dispatchScheduledReminders] Failed sending reminder to', cleanChatId, err);
                await docRef.update({
                    status: 'failed',
                    error: (err === null || err === void 0 ? void 0 : err.message) || String(err),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                failedCount++;
            }
        }
    }
    catch (outerErr) {
        console.error('[dispatchScheduledReminders] Global processing error:', outerErr);
    }
    return { processed, success: successCount, failed: failedCount };
}
/**
 * Cloud Scheduled Reminders Cron (Google Cloud Functions Pub/Sub)
 * Runs automatically every 5 minutes in Google Cloud to dispatch pending reminders.
 */
exports.dispatchScheduledReminders = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async () => {
    const res = await processPendingReminders();
    console.log('[dispatchScheduledReminders] Completed cycle:', res);
});
/**
 * HTTPS Endpoint to trigger reminders processing on-demand or via Webhook
 */
exports.triggerScheduledReminders = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const result = await processPendingReminders();
        res.status(200).json(result);
    });
});
//# sourceMappingURL=index.js.map