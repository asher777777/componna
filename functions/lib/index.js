"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
admin.initializeApp();
const db = admin.firestore();
// Webhook for Green API
exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    // Green API sends POST requests for webhooks
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const body = req.body;
    if (!body || body.typeWebhook !== 'incomingMessageReceived') {
        res.status(200).send('Not an incoming message');
        return;
    }
    const messageText = (_b = (_a = body.messageData) === null || _a === void 0 ? void 0 : _a.textMessageData) === null || _b === void 0 ? void 0 : _b.textMessage;
    const sender = (_c = body.senderData) === null || _c === void 0 ? void 0 : _c.sender;
    if (!messageText || !sender) {
        res.status(200).send('No text or sender');
        return;
    }
    try {
        // 1. Fetch API Keys from Firestore (system_settings/global)
        const settingsDoc = await db.collection('system_settings').doc('global').get();
        const apiKeys = ((_d = settingsDoc.data()) === null || _d === void 0 ? void 0 : _d.apiKeys) || {};
        const geminiKey = apiKeys.googleAiApiKey;
        const greenApiInstanceId = apiKeys.greenApiInstanceId;
        const greenApiToken = apiKeys.greenApiToken;
        if (!geminiKey || !greenApiInstanceId || !greenApiToken) {
            console.error('Missing API keys in system_settings/global');
            res.status(500).send('Missing keys');
            return;
        }
        // 2. Fetch Active Bots from Firestore
        // Note: The frontend needs to be updated to save bots to this collection!
        const botsSnapshot = await db.collection('whatsapp_ai_bots').where('isActive', '==', true).get();
        let triggeredBot = null;
        const textLower = messageText.toLowerCase();
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
        if (!triggeredBot) {
            res.status(200).send('No bot triggered');
            return;
        }
        console.log(`Bot ${triggeredBot.name} triggered by ${sender}`);
        // 3. Generate AI Response
        const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
            model: triggeredBot.model || 'gemini-1.5-flash',
            systemInstruction: triggeredBot.systemPrompt
        });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: messageText }] }],
            generationConfig: {
                temperature: triggeredBot.temperature || 0.7,
            }
        });
        const replyText = result.response.text();
        if (replyText) {
            // 4. Send message back via Green API
            const greenApiUrl = `https://api.green-api.com/waInstance${greenApiInstanceId}/sendMessage/${greenApiToken}`;
            await fetch(greenApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: sender,
                    message: replyText
                })
            });
            console.log('Message sent successfully!');
        }
        res.status(200).send('Success');
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Error');
    }
});
//# sourceMappingURL=index.js.map