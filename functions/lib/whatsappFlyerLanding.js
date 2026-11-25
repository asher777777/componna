"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWhatsAppFlyerLanding = void 0;
const admin = require("firebase-admin");
const STORAGE_BUCKET = 'glowmanage.firebasestorage.app';
function sanitizeSlug(raw) {
    return (raw || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0590-\u05ff-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64);
}
function normalizePhoneDigits(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (!digits)
        return '';
    return digits.startsWith('972') ? '0' + digits.slice(3) : digits;
}
async function sendGreenApiText(instanceId, token, chatId, message) {
    const instStr = String(instanceId || '').trim();
    const host = instStr.length >= 4
        ? `https://${instStr.slice(0, 4)}.api.greenapi.com`
        : 'https://api.green-api.com';
    const url = `${host}/waInstance${instStr}/sendMessage/${token}`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
    });
}
async function isAuthorizedLandingAdmin(db, tenantId, normPhone, apiKeys) {
    var _a, _b;
    const candidates = new Set();
    const addRaw = (val) => {
        if (!val)
            return;
        if (Array.isArray(val)) {
            val.forEach(addRaw);
        }
        else if (typeof val === 'string') {
            val.split(/[,\s]+/).forEach((part) => {
                const n = normalizePhoneDigits(part);
                if (n.length >= 7)
                    candidates.add(n);
            });
        }
    };
    addRaw(apiKeys.whatsappAdminPhones);
    addRaw(apiKeys.adminPhones);
    addRaw(apiKeys.whatsappSupportNumber);
    addRaw(apiKeys.contactPhone);
    try {
        if (tenantId && tenantId !== '_master') {
            const tDoc = await db.collection('tenants').doc(tenantId).get();
            if (tDoc.exists) {
                addRaw((_a = tDoc.data()) === null || _a === void 0 ? void 0 : _a.ownerPhone);
            }
            const brandDoc = await db
                .collection('tenants')
                .doc(tenantId)
                .collection('brand_dna')
                .doc('settings')
                .get();
            if (brandDoc.exists) {
                const trust = (_b = brandDoc.data()) === null || _b === void 0 ? void 0 : _b.trust;
                addRaw(trust === null || trust === void 0 ? void 0 : trust.contactPhone);
                addRaw(trust === null || trust === void 0 ? void 0 : trust.whatsappSupportNumber);
            }
        }
    }
    catch (err) {
        console.warn('[waFlyerLanding] Admin lookup notice:', err);
    }
    return candidates.has(normPhone);
}
async function fetchExistingKosWebSlugs(db, tenantId) {
    const slugs = new Set([
        'home',
        'p',
        'lp',
        'ksf',
        'smart-forms',
        'smart-form',
        'kosass',
        'kosvidio',
        'kosinfo',
        'kosevent',
        'koscheckout',
        'koscommunity',
        'kosfunrise',
        'koscourse',
        'login',
        'admin',
        'workbench',
    ]);
    const collections = [
        'kos_web_ai_documents',
        'mod_pages_documents',
        'mod_pagebuilder_pages',
        'pages',
        'custom_html_landing_pages',
    ];
    for (const col of collections) {
        try {
            const snap = tenantId && tenantId !== '_master'
                ? await db.collection('tenants').doc(tenantId).collection(col).get()
                : await db.collection(col).get();
            snap.forEach((d) => {
                var _a;
                const s = sanitizeSlug(String(((_a = d.data()) === null || _a === void 0 ? void 0 : _a.slug) || ''));
                if (s)
                    slugs.add(s);
            });
        }
        catch (_a) {
            // ignore missing collection
        }
    }
    return slugs;
}
function ensureUniqueSlug(candidate, takenSlugs) {
    const base = sanitizeSlug(candidate) || `lp-${Date.now().toString().slice(-5)}`;
    if (!takenSlugs.has(base))
        return base;
    let idx = 2;
    while (takenSlugs.has(`${base}-${idx}`) && idx < 100)
        idx++;
    return `${base}-${idx}`;
}
async function downloadAndStoreMedia(downloadUrl, tenantId, fileName, mimeTypeHint) {
    const resp = await fetch(downloadUrl);
    if (!resp.ok) {
        throw new Error(`Failed to download media from Green API (${resp.status})`);
    }
    const arrayBuf = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const mimeType = mimeTypeHint ||
        (resp.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
    const ext = mimeType.includes('pdf')
        ? 'pdf'
        : mimeType.includes('png')
            ? 'png'
            : mimeType.includes('webp')
                ? 'webp'
                : 'jpg';
    const safeName = (fileName || `flyer_${Date.now()}.${ext}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `tenants/${tenantId || '_master'}/flyers/${Date.now()}_${safeName}`;
    const bucket = admin.storage().bucket(STORAGE_BUCKET);
    const fileRef = bucket.file(storagePath);
    await fileRef.save(buffer, {
        metadata: { contentType: mimeType },
    });
    await fileRef.makePublic().catch(() => { });
    const publicUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${storagePath}`;
    return {
        publicUrl,
        base64: buffer.toString('base64'),
        mimeType,
    };
}
async function callGeminiJson(geminiKey, prompt, media) {
    var _a, _b, _c, _d, _e, _f;
    const parts = [{ text: prompt }];
    if ((media === null || media === void 0 ? void 0 : media.base64) && (media === null || media === void 0 ? void 0 : media.mimeType)) {
        parts.push({
            inlineData: {
                mimeType: media.mimeType,
                data: media.base64,
            },
        });
    }
    const models = ['gemini-3.8-flash', 'gemini-2.5-flash'];
    let lastError = 'Gemini request failed';
    for (const model of models) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                },
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            lastError = ((_a = data === null || data === void 0 ? void 0 : data.error) === null || _a === void 0 ? void 0 : _a.message) || `HTTP ${res.status}`;
            continue;
        }
        const rawText = ((_f = (_e = (_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) || '';
        const cleaned = rawText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
        return JSON.parse(cleaned);
    }
    throw new Error(lastError);
}
function formatReportForWhatsApp(report, slug, tenantId) {
    const details = report.eventDetails || {};
    const detailsLines = [
        details.date ? `תאריך: ${details.date}` : '',
        details.time ? `שעה: ${details.time}` : '',
        details.location ? `מיקום: ${details.location}` : '',
        details.price ? `מחיר: ${details.price}` : '',
        details.audience ? `קהל יעד: ${details.audience}` : '',
    ]
        .filter(Boolean)
        .join('\n');
    const highlights = (report.highlights || [])
        .slice(0, 5)
        .map((h) => `- ${h.title}${h.description ? `: ${h.description}` : ''}`)
        .join('\n');
    const formPlan = report.formPlan || {};
    const host = tenantId && tenantId !== '_master' ? `${tenantId}.kosun.pro` : 'compona.web.app';
    return [
        `*דוח עמוד נחיתה מוכן לעריכה:*`,
        `*כותרת:* ${report.title || ''}`,
        report.subtitle ? `*תת-כותרת:* ${report.subtitle}` : '',
        report.description ? `\n${report.description}` : '',
        detailsLines ? `\n*פרטים מרכזיים:*\n${detailsLines}` : '',
        highlights ? `\n*יתרונות ודגשים:*\n${highlights}` : '',
        `\n*טופס משולב:* ${formPlan.formTitle || 'טופס הרשמה'} (${[
            formPlan.includeTickets ? 'כרטיסים' : '',
            formPlan.includeCoupons ? 'קופונים' : '',
            formPlan.includePayment ? 'סליקה' : '',
        ]
            .filter(Boolean)
            .join(', ') || 'לידים'})`,
        `*כתובת העמוד ב-KOSWEB:* https://${host}/p/${slug}`,
        `\n*מה תרצה לעשות עכשיו?*`,
        `- כתוב הוראות עריכה ודיוק (למשל: "שנה כותרת ל...", "הוסף קוד קופון VIP20")`,
        `- שלח תמונה נוספת אם תרצה להחליף את תמונת ה-Hero`,
        `- כתוב *"אשר"* או *"צור דף"* כדי לבנות את העמוד מכמה אזורים + הטופס ב-KOSWEB`,
        `- כתוב *"בטל"* לביטול`,
    ]
        .filter(Boolean)
        .join('\n');
}
/**
 * Handles WhatsApp Green API flyer -> report -> refine -> KOSAI HTML + SmartForm flow for authorized admins.
 * Returns true if the message was handled by this flow, false to fall through to normal bot logic.
 */
async function handleWhatsAppFlyerLanding(input) {
    var _a, _b;
    const { db, tenantId, targetChatId, normPhone, cleanDigits, messageText, fileData, apiKeys, geminiKey, greenApiInstanceId, greenApiToken, } = input;
    const trimmed = (messageText || '').trim();
    const lower = trimmed.toLowerCase();
    const sessionRef = db
        .collection('wa_flyer_landing_sessions')
        .doc(`${tenantId}_${cleanDigits}`);
    const sessionSnap = await sessionRef.get();
    const sessionExists = sessionSnap.exists;
    const sessionData = sessionExists ? sessionSnap.data() : null;
    const isSessionFresh = sessionData &&
        typeof sessionData.updatedAtMs === 'number' &&
        Date.now() - sessionData.updatedAtMs < 60 * 60 * 1000;
    const isStartTrigger = /^קושאן[\s,:-]+(צריך|צור\s*לי|תכין\s*לי|בנה\s*לי)?\s*(עמוד|דף)\s+נחיתה/.test(lower);
    if (!isSessionFresh && !isStartTrigger) {
        return false;
    }
    const authorized = await isAuthorizedLandingAdmin(db, tenantId, normPhone, apiKeys);
    if (!authorized) {
        return false;
    }
    // Cancel command
    if (isSessionFresh && /^(בטל|ביטול|סגור)$/.test(lower)) {
        await sessionRef.delete();
        await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, 'תהליך בניית עמוד הנחיתה בוטל.');
        return true;
    }
    try {
        // STEP 0: Admin initiates with "קושאן צריך/צור לי עמוד נחיתה" -> ask for flyer
        if (isStartTrigger && !(fileData === null || fileData === void 0 ? void 0 : fileData.downloadUrl)) {
            await sessionRef.set({
                stage: 'awaiting_flyer',
                tenantId,
                updatedAtMs: Date.now(),
            });
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, 'אין בעיה בוס\nיש לך פלייר שאני יוכל להתחיל לעבוד עליו?');
            return true;
        }
        // CASE A: Admin sends flyer/instructions while in awaiting_flyer (or together with start trigger + flyer)
        if ((isSessionFresh && (sessionData === null || sessionData === void 0 ? void 0 : sessionData.stage) === 'awaiting_flyer') ||
            (isStartTrigger && Boolean(fileData === null || fileData === void 0 ? void 0 : fileData.downloadUrl))) {
            if (!(fileData === null || fileData === void 0 ? void 0 : fileData.downloadUrl) && !trimmed) {
                return false;
            }
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, 'קיבלתי את הפלייר וההנחיות. מפיק דוח אפיון מפורט לעמוד נחיתה...');
            let storedMedia;
            if (fileData === null || fileData === void 0 ? void 0 : fileData.downloadUrl) {
                storedMedia = await downloadAndStoreMedia(fileData.downloadUrl, tenantId, fileData.fileName, fileData.mimeType);
            }
            const takenSlugs = await fetchExistingKosWebSlugs(db, tenantId);
            const reportPrompt = `אתה אדריכל דפי נחיתה במערכת KOSAI.
המנהל שלח פלייר והנחיות בוואטסאפ: "${trimmed || 'צור דוח לעמוד נחיתה ממיר מהפלייר'}".
סלאגים תפוסים שאסור להשתמש בהם: [${Array.from(takenSlugs).slice(0, 50).join(', ')}].
החזר JSON תקני בלבד (ללא אימוג'ים):
{
  "title": "כותרת ראשית",
  "subtitle": "תת-כותרת",
  "description": "תיאור מלא",
  "ctaText": "טקסט לכפתור הרשמה",
  "suggestedSlug": "unique-english-slug",
  "eventDetails": { "date": "", "time": "", "location": "", "price": "", "audience": "", "contactInfo": "" },
  "highlights": [{ "title": "נקודה", "description": "פירוט" }],
  "faqs": [{ "question": "שאלה", "answer": "תשובה" }],
  "designDirection": { "primaryColor": "#f59e0b", "secondaryColor": "#6366f1", "backgroundColor": "#090a0f", "textColor": "#f8fafc", "visualStyle": "יוקרתי" },
  "formPlan": { "formTitle": "טופס הרשמה", "formCategory": "אירועים", "includeTickets": false, "includeCoupons": false, "includePayment": false, "suggestedStepsSummary": ["שם מלא", "טלפון נייד", "דוא\"ל"] }
}`;
            const report = await callGeminiJson(geminiKey, reportPrompt, storedMedia);
            const uniqueSlug = ensureUniqueSlug(report.suggestedSlug || report.title, takenSlugs);
            const heroImageUrl = storedMedia && storedMedia.mimeType.startsWith('image/') ? storedMedia.publicUrl : '';
            if (heroImageUrl)
                report.heroImageUrl = heroImageUrl;
            await sessionRef.set({
                stage: 'report_ready',
                tenantId,
                report,
                slug: uniqueSlug,
                heroImageUrl,
                flyerPreviewUrl: (storedMedia === null || storedMedia === void 0 ? void 0 : storedMedia.publicUrl) || '',
                updatedAtMs: Date.now(),
            });
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, formatReportForWhatsApp(report, uniqueSlug, tenantId));
            return true;
        }
        // CASE B: Active session -> Approve & Generate Multi-Section Page + Form with KOSAI
        if (sessionData.stage === 'report_ready' &&
            /^(אשר|אישור|צור דף|בנה דף|פרסם|קדימה)$/.test(lower)) {
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, 'שולח ל-KOSAI לבניית תבנית מרובת-אזורים ב-KOSWEB + הטופס החכם...');
            const takenSlugs = await fetchExistingKosWebSlugs(db, tenantId);
            const finalSlug = ensureUniqueSlug(sessionData.slug || ((_a = sessionData.report) === null || _a === void 0 ? void 0 : _a.title), takenSlugs);
            const result = await generateAndPersistLanding({
                db,
                tenantId,
                geminiKey,
                report: sessionData.report,
                refinements: '',
                slug: finalSlug,
                heroImageUrl: sessionData.heroImageUrl || '',
                flyerPreviewUrl: sessionData.flyerPreviewUrl || '',
            });
            await sessionRef.set({
                stage: 'published',
                slug: finalSlug,
                pageId: result.pageId,
                formId: result.formId,
                sections: result.sections,
                updatedAtMs: Date.now(),
            }, { merge: true });
            const host = tenantId && tenantId !== '_master' ? `${tenantId}.kosun.pro` : 'compona.web.app';
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, `העמוד מרובה-האזורים והטופס פורסמו בהצלחה ב-KOSWEB!\n\n*קישור חי:* https://${host}/p/${finalSlug}\n\nניתן לערוך כל אזור בעורך העמודים, או לשלוח לי כאן הודעת תיקון ואעדכן מיד.`);
            return true;
        }
        // CASE C: Active session -> Refine Report or Update Published Page
        if (sessionData.stage === 'report_ready') {
            let nextHeroUrl = sessionData.heroImageUrl || '';
            if (fileData === null || fileData === void 0 ? void 0 : fileData.downloadUrl) {
                const stored = await downloadAndStoreMedia(fileData.downloadUrl, tenantId, fileData.fileName, fileData.mimeType);
                if (stored.mimeType.startsWith('image/')) {
                    nextHeroUrl = stored.publicUrl;
                }
            }
            let updatedReport = sessionData.report;
            let nextSlug = sessionData.slug;
            if (trimmed) {
                const refinePrompt = `עדכן את דוח עמוד הנחיתה הבא לפי הוראות המנהל:
הדוח הנוכחי:
${JSON.stringify(sessionData.report, null, 2)}

הוראות המנהל: "${trimmed}"
החזר JSON תקני בלבד באותו מבנה בדיוק (ללא אימוג'ים).`;
                updatedReport = await callGeminiJson(geminiKey, refinePrompt);
                if (nextHeroUrl)
                    updatedReport.heroImageUrl = nextHeroUrl;
                if (updatedReport.suggestedSlug && updatedReport.suggestedSlug !== ((_b = sessionData.report) === null || _b === void 0 ? void 0 : _b.suggestedSlug)) {
                    const takenSlugs = await fetchExistingKosWebSlugs(db, tenantId);
                    nextSlug = ensureUniqueSlug(updatedReport.suggestedSlug, takenSlugs);
                }
            }
            else if (nextHeroUrl) {
                updatedReport = Object.assign(Object.assign({}, updatedReport), { heroImageUrl: nextHeroUrl });
            }
            await sessionRef.set({
                report: updatedReport,
                slug: nextSlug,
                heroImageUrl: nextHeroUrl,
                updatedAtMs: Date.now(),
            }, { merge: true });
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, formatReportForWhatsApp(updatedReport, nextSlug, tenantId));
            return true;
        }
        if (sessionData.stage === 'published') {
            let nextHeroUrl = sessionData.heroImageUrl || '';
            if (fileData === null || fileData === void 0 ? void 0 : fileData.downloadUrl) {
                const stored = await downloadAndStoreMedia(fileData.downloadUrl, tenantId, fileData.fileName, fileData.mimeType);
                if (stored.mimeType.startsWith('image/')) {
                    nextHeroUrl = stored.publicUrl;
                }
            }
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, 'מעדכן את אזורי העמוד והטופס ב-KOSWEB לפי ההנחיה החדשה...');
            const result = await generateAndPersistLanding({
                db,
                tenantId,
                geminiKey,
                report: sessionData.report,
                refinements: trimmed || 'שלב את תמונת ה-Hero החדשה באזור העליון',
                existingSections: sessionData.sections,
                slug: sessionData.slug,
                existingPageId: sessionData.pageId,
                existingFormId: sessionData.formId,
                heroImageUrl: nextHeroUrl,
                flyerPreviewUrl: sessionData.flyerPreviewUrl || '',
            });
            await sessionRef.set({
                heroImageUrl: nextHeroUrl,
                sections: result.sections,
                updatedAtMs: Date.now(),
            }, { merge: true });
            const host = tenantId && tenantId !== '_master' ? `${tenantId}.kosun.pro` : 'compona.web.app';
            await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, `העמוד עודכן בהצלחה!\n*קישור חי:* https://${host}/p/${sessionData.slug}`);
            return true;
        }
    }
    catch (err) {
        console.error('[waFlyerLanding] Error:', err);
        await sendGreenApiText(greenApiInstanceId, greenApiToken, targetChatId, `חלה שגיאה בתהליך: ${(err === null || err === void 0 ? void 0 : err.message) || 'שגיאה לא צפויה'}`);
        return true;
    }
    return false;
}
exports.handleWhatsAppFlyerLanding = handleWhatsAppFlyerLanding;
async function generateAndPersistLanding(params) {
    var _a, _b, _c, _d, _e;
    const { db, tenantId, geminiKey, report, refinements, existingSections, slug, existingPageId, existingFormId, heroImageUrl, } = params;
    const design = (report === null || report === void 0 ? void 0 : report.designDirection) || {};
    const primaryColor = design.primaryColor || '#f59e0b';
    const backgroundColor = design.backgroundColor || '#090a0f';
    const textColor = design.textColor || '#f8fafc';
    const aiPrompt = `אתה KOSAI – מעצב אירועים ואדריכל טפסים חכמים (KSF) של KOSWEB.
הדוח הערוך: ${JSON.stringify(report, null, 2)}
${heroImageUrl ? `תמונת רקע/אולם: ${heroImageUrl}` : ''}
${refinements ? `דיוקים נוספים מהמנהל: "${refinements}"` : ''}
${existingSections ? `קונפיגורציה קודמת לעדכון:\n${JSON.stringify(existingSections).slice(0, 8000)}` : ''}

משימתך: למלא את אזור הפוסטר האירועי ("eventPoster") ביחד עם הטופס החכם (SmartFormDefinition) שיוטמע בתחתיתו.
אסור להשתמש באימוג'ים.

החזר JSON תקני בלבד:
{
  "posterConfig": {
    "headline": "כותרת ראשית חזקה",
    "dateBadge": "תגית תאריך עברי / מועד",
    "subtitle": "כותרת אווירה",
    "highlightTitle": "כותרת כרטיס ההדגשה",
    "highlightSpeaker": "שם הדוברת / אורחת",
    "featuredBannerTopText": "טקסט עליון בבאנר המרכזי",
    "featuredBannerTitle": "כותרת בולטת בבאנר המרכזי",
    "featuredDescription": "פירוט נוסף",
    "hospitalityBadge": "תגית אירוח / סעודה",
    "eventDateLabel": "יום ותאריך",
    "eventTimeLabel": "20:00",
    "priceLines": ["מחיר מנויות", "מחיר רגיל"],
    "closingQuote": "משפט סיום השראתי",
    "addressText": "כתובת מלאה",
    "formTitle": "שמירת מקום ורכישת כרטיסים",
    "formSubtitle": "מלא את הפרטים להרשמה מהירה",
    "submitButtonText": "שליחה והרשמה",
    "semanticStyle": {
      "moodLabel": "שם הסגנון",
      "primaryColor": "#0f5c66",
      "accentColor": "#d4a24c",
      "secondaryColor": "#0b444c",
      "surfaceColor": "#fdf9ef",
      "cardBgColor": "#f5e3ba",
      "textColor": "#0d3b42",
      "frameBorderColor": "#c8943c"
    }
  },
  "form": {
    "title": "כותרת הטופס",
    "description": "תיאור",
    "category": "אירועים",
    "tone": "executive_luxury",
    "steps": [
      { "id": "step_1", "order": 1, "title": "מהו שמך המלא?", "fieldType": "text", "iconName": "User", "required": true, "mappingKey": "kosun_crm_name" }
    ],
    "completion": { "title": "תודה רבה!", "subtitle": "פרטיך נקלטו בהצלחה.", "iconName": "CheckCircle2", "showRedirectButton": false }
  }
}`;
    const generated = await callGeminiJson(geminiKey, aiPrompt);
    const now = new Date().toISOString();
    const formId = existingFormId || `form_lp_${Date.now()}`;
    const formsColl = tenantId && tenantId !== '_master'
        ? db.collection('tenants').doc(tenantId).collection('mod_forms')
        : db.collection('mod_forms');
    const rawForm = generated.form || {};
    const formDoc = {
        id: formId,
        title: rawForm.title || ((_a = report === null || report === void 0 ? void 0 : report.formPlan) === null || _a === void 0 ? void 0 : _a.formTitle) || (report === null || report === void 0 ? void 0 : report.title) || 'טופס הרשמה',
        slug: `${slug}-form`,
        description: rawForm.description || (report === null || report === void 0 ? void 0 : report.subtitle) || '',
        category: rawForm.category || 'דפי נחיתה',
        tone: rawForm.tone || 'executive_luxury',
        steps: Array.isArray(rawForm.steps) ? rawForm.steps : [],
        completion: rawForm.completion || {
            title: 'תודה רבה! ההרשמה התקבלה',
            subtitle: 'פרטיך נקלטו בהצלחה.',
            iconName: 'CheckCircle2',
            showRedirectButton: false,
        },
        status: 'published',
        isCrmSyncEnabled: true,
        crmDefaultTags: ['דף נחיתה וואטסאפ', (report === null || report === void 0 ? void 0 : report.title) || 'KSF'],
        createdAt: now,
        updatedAt: now,
        createdBy: 'KOSAI WhatsApp Agent',
    };
    await formsColl.doc(formId).set(formDoc, { merge: true });
    const posterSecId = `sec_eventPoster_${Date.now()}`;
    const p = generated.posterConfig || {};
    const eventPosterSection = {
        id: posterSecId,
        type: 'eventPoster',
        visible: true,
        anchorId: 'event-poster',
        stylePreset: 'standard',
        semanticStyle: p.semanticStyle || {
            moodLabel: 'מלכותי טורקיז וזהב',
            primaryColor: '#0f5c66',
            accentColor: '#d4a24c',
            secondaryColor: '#0b444c',
            surfaceColor: '#fdf9ef',
            cardBgColor: '#f5e3ba',
            textColor: '#0d3b42',
            frameBorderColor: '#c8943c',
        },
        logoUrl: '',
        venueImageUrl: heroImageUrl || '',
        speakerImageUrl: '',
        headline: p.headline || (report === null || report === void 0 ? void 0 : report.title) || 'אירוע חגיגי',
        dateBadge: p.dateBadge || ((_b = report === null || report === void 0 ? void 0 : report.eventDetails) === null || _b === void 0 ? void 0 : _b.date) || '',
        subtitle: p.subtitle || (report === null || report === void 0 ? void 0 : report.subtitle) || '',
        highlightTitle: p.highlightTitle || '',
        highlightSpeaker: p.highlightSpeaker || '',
        featuredBannerTopText: p.featuredBannerTopText || '',
        featuredBannerTitle: p.featuredBannerTitle || '',
        featuredDescription: p.featuredDescription || (report === null || report === void 0 ? void 0 : report.description) || '',
        hospitalityBadge: p.hospitalityBadge || '',
        eventDateLabel: p.eventDateLabel || ((_c = report === null || report === void 0 ? void 0 : report.eventDetails) === null || _c === void 0 ? void 0 : _c.date) || '',
        eventTimeLabel: p.eventTimeLabel || ((_d = report === null || report === void 0 ? void 0 : report.eventDetails) === null || _d === void 0 ? void 0 : _d.time) || '',
        priceLines: Array.isArray(p.priceLines) ? p.priceLines : [],
        closingQuote: p.closingQuote || '',
        addressText: p.addressText || ((_e = report === null || report === void 0 ? void 0 : report.eventDetails) === null || _e === void 0 ? void 0 : _e.location) || '',
        formId,
        formTitle: p.formTitle || formDoc.title,
        formSubtitle: p.formSubtitle || '',
        submitButtonText: p.submitButtonText || (report === null || report === void 0 ? void 0 : report.ctaText) || 'שליחה והרשמה',
    };
    const normalizedSections = [eventPosterSection];
    const pageId = existingPageId || `page_${Date.now()}`;
    const pagesColl = tenantId && tenantId !== '_master'
        ? db.collection('tenants').doc(tenantId).collection('kos_web_ai_documents')
        : db.collection('kos_web_ai_documents');
    await pagesColl.doc(pageId).set({
        pageId,
        slug,
        pageTitle: eventPosterSection.headline,
        description: (report === null || report === void 0 ? void 0 : report.description) || '',
        published: true,
        isHomePage: false,
        category: 'דפי נחיתה',
        sectionOrder: [posterSecId],
        sections: {
            [posterSecId]: eventPosterSection,
        },
        globalSettings: {
            primaryColor: eventPosterSection.semanticStyle.primaryColor || primaryColor,
            backgroundColor: eventPosterSection.semanticStyle.surfaceColor || backgroundColor,
            textColor: eventPosterSection.semanticStyle.textColor || textColor,
            fontFamily: 'Heebo',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: 'KOSAI WhatsApp Agent',
    }, { merge: true });
    return { pageId, formId, sections: normalizedSections };
}
//# sourceMappingURL=whatsappFlyerLanding.js.map