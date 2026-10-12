"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kesherProxy = exports.whatsappWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
const corsLib = require("cors");
const cors = corsLib({ origin: true });
admin.initializeApp();
const db = admin.firestore();
// Fire-and-forget contact extraction
async function extractAndSaveContact(geminiKey, phone, messages) {
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
        const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
        const data = JSON.parse(text);
        if (data.name || data.email || data.businessType) {
            // Find existing contact
            const contactSnap = await db.collection('contacts').where('phone', '==', phone).get();
            if (contactSnap.empty) {
                // Create new
                await db.collection('contacts').add({
                    phone: phone,
                    name: data.name || phone,
                    email: data.email || '',
                    businessType: data.businessType || '',
                    source: 'WhatsApp AI Bot',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            else {
                // Update existing
                const docId = contactSnap.docs[0].id;
                const existing = contactSnap.docs[0].data();
                await db.collection('contacts').doc(docId).set({
                    name: data.name || existing.name,
                    email: data.email || existing.email,
                    businessType: data.businessType || existing.businessType,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
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
        if (!messageText || !targetChatId) {
            res.status(200).send('No text or targetChatId');
            return;
        }
        const phone = targetChatId.split('@')[0];
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
                        Object.assign(apiKeys, ((_o = globalDoc.data()) === null || _o === void 0 ? void 0 : _o.apiKeys) || {});
                }
                catch (e) { }
            }
            const geminiKey = apiKeys.googleAiApiKey || apiKeys.geminiApiKey;
            const greenApiInstanceId = apiKeys.greenApiInstanceId || ((_p = body.instanceData) === null || _p === void 0 ? void 0 : _p.idInstance);
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
                chatHistory = ((_q = chatDoc.data()) === null || _q === void 0 ? void 0 : _q.messages) || [];
            }
            // 3. Detect Bot Trigger (only if it's the start of a conversation, or if the bot is already engaged)
            let triggeredBot = null;
            let activeBotId = (_r = chatDoc.data()) === null || _r === void 0 ? void 0 : _r.botId;
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
                        if ((rule === null || rule === void 0 ? void 0 : rule.isActive) !== false && ((_s = rule === null || rule === void 0 ? void 0 : rule.whatsappTrigger) === null || _s === void 0 ? void 0 : _s.enabled)) {
                            const trigger = rule.whatsappTrigger;
                            if (trigger.triggerType === 'all') {
                                triggeredBot = {
                                    id: `kosai_${doc.id}`,
                                    name: trigger.botDisplayName || rule.name,
                                    systemPrompt: rule.systemPromptAddon || 'אתה נציג שירות ומכירות אינטליגנטי של קושאן.',
                                    model: 'gemini-1.5-flash',
                                    temperature: ((_u = (_t = rule.toneOfVoice) === null || _t === void 0 ? void 0 : _t.creativity) !== null && _u !== void 0 ? _u : 50) / 100
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
                                        model: 'gemini-1.5-flash',
                                        temperature: ((_w = (_v = rule.toneOfVoice) === null || _v === void 0 ? void 0 : _v.creativity) !== null && _w !== void 0 ? _w : 50) / 100
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
            const contactSnap = await db.collection('contacts').where('phone', '==', phone).get();
            const contactName = contactSnap.empty ? null : (contactSnap.docs[0].data().name || null);
            // 4.5 Fetch Brand DNA
            let brandContext = '';
            try {
                const brandDnaSnap = await db.collection('settings').doc('brand_dna').get();
                if (brandDnaSnap.exists) {
                    const dna = brandDnaSnap.data();
                    brandContext = `\n\n=== רקע על המותג (Brand DNA) ===\n`;
                    if ((_x = dna === null || dna === void 0 ? void 0 : dna.identity) === null || _x === void 0 ? void 0 : _x.name)
                        brandContext += `שם המותג: ${dna.identity.name}\n`;
                    if ((_y = dna === null || dna === void 0 ? void 0 : dna.identity) === null || _y === void 0 ? void 0 : _y.description)
                        brandContext += `תיאור קצר: ${dna.identity.description}\n`;
                    if ((_z = dna === null || dna === void 0 ? void 0 : dna.voice) === null || _z === void 0 ? void 0 : _z.toneOfVoice)
                        brandContext += `סגנון דיבור: ${dna.voice.toneOfVoice}\n`;
                    if ((_1 = (_0 = dna === null || dna === void 0 ? void 0 : dna.voice) === null || _0 === void 0 ? void 0 : _0.brandValues) === null || _1 === void 0 ? void 0 : _1.length)
                        brandContext += `ערכי מותג: ${dna.voice.brandValues.join(', ')}\n`;
                }
            }
            catch (e) { }
            // 5. Append strict logic to System Prompt
            let strictPrompt = (triggeredBot.systemPrompt || 'אתה נציג שירות ומכירות אינטליגנטי.') + brandContext + '\n\n=== הנחיות חובה נוספות למודל (לא להציג ללקוח) ===\n';
            strictPrompt += '1. התשובות שלך חייבות להיות **קצרות מאוד ותמציתיות** (עד 2-3 משפטים בלבד).\n';
            strictPrompt += '2. אם הלקוח מבקש מידע ארוך (כמו חבילות), תן לו אותו מתומצת מאוד בנקודות קצרות.\n';
            strictPrompt += '3. סיים כל הודעה שלך ב**שאלה ממוקדת** כדי להוביל את השיחה.\n';
            if (!contactName) {
                strictPrompt += '4. הלקוח הזה חדש ואין לנו את השם שלו! הדבר הראשון שעליך לעשות עכשיו זה לשאול לשמו (בצורה טבעית וקצרה). אל תציע שום חבילה או מידע לפני שהוא מוסר את השם.\n';
            }
            else {
                strictPrompt += `4. שם הלקוח הוא "${contactName}". השתמש בו לפעמים בשיחה.\n`;
            }
            strictPrompt += '5. אם אין לך תשובה טובה, תגיד שאתה מעביר את הפנייה לנציג אנושי.\n';
            // 6. Generate AI Response with valid models cascade
            const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
            const candidateModels = [
                (triggeredBot.model && !triggeredBot.model.includes('3.8') && !triggeredBot.model.includes('3.5')) ? triggeredBot.model : null,
                'gemini-1.5-flash',
                'gemini-2.0-flash',
                'gemini-2.5-flash'
            ].filter(Boolean);
            const contents = chatHistory.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
            contents.push({ role: 'user', parts: [{ text: messageText }] });
            let replyText = '';
            for (const mName of candidateModels) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: mName,
                        systemInstruction: strictPrompt
                    });
                    const result = await model.generateContent({
                        contents,
                        generationConfig: {
                            temperature: triggeredBot.temperature || 0.7,
                        }
                    });
                    const candidate = result.response.text();
                    if (candidate && candidate.trim()) {
                        replyText = candidate.trim();
                        break;
                    }
                }
                catch (err) {
                    console.warn(`[whatsappWebhook] Model ${mName} generation error:`, err);
                }
            }
            // Prevent empty loop
            if (!replyText || replyText.trim() === '') {
                replyText = 'אני מיד אבדוק את זה ואחזור אליך. בינתיים, במה אוכל לעזור?';
            }
            // 7. Update Chat History
            chatHistory.push({ role: 'user', text: messageText, timestamp: Date.now() });
            chatHistory.push({ role: 'model', text: replyText, timestamp: Date.now() });
            await chatDocRef.set({
                phone,
                contactName: contactName || phone,
                botId: triggeredBot.id,
                botName: triggeredBot.name,
                lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                messages: chatHistory
            }, { merge: true });
            // 8. Trigger Async Info Extraction
            extractAndSaveContact(geminiKey, phone, chatHistory);
            // 9. Send message back via Green API using direct cluster host
            const instStr = String(greenApiInstanceId || '').trim();
            let host = 'https://api.green-api.com';
            if (instStr.length >= 4) {
                host = `https://${instStr.slice(0, 4)}.api.greenapi.com`;
            }
            const greenApiUrl = `${host}/waInstance${instStr}/sendMessage/${greenApiToken}`;
            const cleanChatId = targetChatId.includes('@')
                ? targetChatId
                : `${targetChatId.replace(/\D/g, '')}@c.us`;
            await fetch(greenApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: cleanChatId,
                    message: replyText
                })
            });
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
//# sourceMappingURL=index.js.map