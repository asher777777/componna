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
// Webhook for Green API
exports.whatsappWebhook = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
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
        const messageText = (_b = (_a = body.messageData) === null || _a === void 0 ? void 0 : _a.textMessageData) === null || _b === void 0 ? void 0 : _b.textMessage;
        const sender = (_c = body.senderData) === null || _c === void 0 ? void 0 : _c.sender;
        const targetChatId = ((_d = body.senderData) === null || _d === void 0 ? void 0 : _d.chatId) || sender;
        if (!messageText || !targetChatId) {
            res.status(200).send('No text or targetChatId');
            return;
        }
        const phone = targetChatId.split('@')[0];
        try {
            // 1. Fetch API Keys
            const settingsDoc = await db.collection('system_settings').doc('global').get();
            const apiKeys = ((_e = settingsDoc.data()) === null || _e === void 0 ? void 0 : _e.apiKeys) || {};
            const geminiKey = apiKeys.googleAiApiKey;
            const greenApiInstanceId = apiKeys.greenApiInstanceId;
            const greenApiToken = apiKeys.greenApiToken;
            if (!geminiKey || !greenApiInstanceId || !greenApiToken) {
                res.status(500).send('Missing keys');
                return;
            }
            // 2. Load Chat History
            const chatDocRef = db.collection('wa_bot_chats').doc(targetChatId);
            const chatDoc = await chatDocRef.get();
            let chatHistory = [];
            if (chatDoc.exists) {
                chatHistory = ((_f = chatDoc.data()) === null || _f === void 0 ? void 0 : _f.messages) || [];
            }
            // 3. Detect Bot Trigger (only if it's the start of a conversation, or if the bot is already engaged)
            let triggeredBot = null;
            let activeBotId = (_g = chatDoc.data()) === null || _g === void 0 ? void 0 : _g.botId;
            const botsSnapshot = await db.collection('whatsapp_ai_bots').where('isActive', '==', true).get();
            const textLower = messageText.toLowerCase();
            // If bot was already engaged in this chat, keep using it
            if (activeBotId) {
                triggeredBot = ((_h = botsSnapshot.docs.find(d => d.id === activeBotId)) === null || _h === void 0 ? void 0 : _h.data()) || null;
            }
            // Otherwise check for keyword triggers
            if (!triggeredBot) {
                for (const doc of botsSnapshot.docs) {
                    const bot = doc.data();
                    if (bot.triggerType === 'all') {
                        triggeredBot = bot;
                        break;
                    }
                    else if (bot.triggerType === 'keyword' && Array.isArray(bot.triggerKeywords)) {
                        const matches = bot.triggerKeywords.some((kw) => {
                            const kwLower = kw.trim().toLowerCase();
                            return kwLower.length > 0 && textLower.includes(kwLower);
                        });
                        if (matches) {
                            triggeredBot = bot;
                            break;
                        }
                    }
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
            const brandDnaSnap = await db.collection('settings').doc('brand_dna').get();
            let brandContext = '';
            if (brandDnaSnap.exists) {
                const dna = brandDnaSnap.data();
                brandContext = `\n\n=== רקע על המותג (Brand DNA) ===\n`;
                if ((_j = dna === null || dna === void 0 ? void 0 : dna.identity) === null || _j === void 0 ? void 0 : _j.name)
                    brandContext += `שם המותג: ${dna.identity.name}\n`;
                if ((_k = dna === null || dna === void 0 ? void 0 : dna.identity) === null || _k === void 0 ? void 0 : _k.description)
                    brandContext += `תיאור קצר: ${dna.identity.description}\n`;
                if ((_l = dna === null || dna === void 0 ? void 0 : dna.voice) === null || _l === void 0 ? void 0 : _l.toneOfVoice)
                    brandContext += `סגנון דיבור: ${dna.voice.toneOfVoice}\n`;
                if ((_o = (_m = dna === null || dna === void 0 ? void 0 : dna.voice) === null || _m === void 0 ? void 0 : _m.brandValues) === null || _o === void 0 ? void 0 : _o.length)
                    brandContext += `ערכי מותג: ${dna.voice.brandValues.join(', ')}\n`;
            }
            // 5. Append strict logic to System Prompt
            let strictPrompt = triggeredBot.systemPrompt + brandContext + '\n\n=== הנחיות חובה נוספות למודל (לא להציג ללקוח) ===\n';
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
            // 6. Generate AI Response
            const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({
                model: triggeredBot.model || 'gemini-1.5-flash',
                systemInstruction: strictPrompt
            });
            const contents = chatHistory.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
            contents.push({ role: 'user', parts: [{ text: messageText }] });
            const result = await model.generateContent({
                contents,
                generationConfig: {
                    temperature: triggeredBot.temperature || 0.7,
                }
            });
            let replyText = result.response.text();
            // Prevent empty loop
            if (!replyText || replyText.trim() === '') {
                replyText = 'אני מיד אבדוק את זה ואחזור אליך. בינתיים, האם יש עוד משהו שאוכל לעזור בו?';
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
            // 9. Send message back via Green API
            let host = 'https://api.green-api.com';
            if (greenApiInstanceId && greenApiInstanceId.length >= 4) {
                const cluster = greenApiInstanceId.slice(0, 4);
                host = `https://${cluster}.api.greenapi.com`;
            }
            const greenApiUrl = `${host}/waInstance${greenApiInstanceId}/sendMessage/${greenApiToken}`;
            await fetch(greenApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: targetChatId,
                    message: replyText
                })
            });
            res.status(200).send('Success');
        }
        catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).send('Internal Error');
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