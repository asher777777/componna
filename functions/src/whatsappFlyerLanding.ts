import * as admin from 'firebase-admin';

const STORAGE_BUCKET = 'glowmanage.firebasestorage.app';

export interface WaFlyerLandingInput {
  db: admin.firestore.Firestore;
  tenantId: string;
  targetChatId: string;
  normPhone: string;
  cleanDigits: string;
  messageText: string;
  fileData?: {
    downloadUrl?: string;
    mimeType?: string;
    fileName?: string;
    caption?: string;
  } | null;
  apiKeys: Record<string, any>;
  geminiKey: string;
  greenApiInstanceId: string;
  greenApiToken: string;
}

function sanitizeSlug(raw: string): string {
  return (raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function normalizePhoneDigits(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('972') ? '0' + digits.slice(3) : digits;
}

async function sendGreenApiText(
  instanceId: string,
  token: string,
  chatId: string,
  message: string
): Promise<void> {
  const instStr = String(instanceId || '').trim();
  const host =
    instStr.length >= 4
      ? `https://${instStr.slice(0, 4)}.api.greenapi.com`
      : 'https://api.green-api.com';
  const url = `${host}/waInstance${instStr}/sendMessage/${token}`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });
}

async function isAuthorizedLandingAdmin(
  db: admin.firestore.Firestore,
  tenantId: string,
  normPhone: string,
  apiKeys: Record<string, any>
): Promise<boolean> {
  const candidates = new Set<string>();

  const addRaw = (val: any) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach(addRaw);
    } else if (typeof val === 'string') {
      val.split(/[,\s]+/).forEach((part) => {
        const n = normalizePhoneDigits(part);
        if (n.length >= 7) candidates.add(n);
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
        addRaw(tDoc.data()?.ownerPhone);
      }
      const brandDoc = await db
        .collection('tenants')
        .doc(tenantId)
        .collection('brand_dna')
        .doc('settings')
        .get();
      if (brandDoc.exists) {
        const trust = brandDoc.data()?.trust;
        addRaw(trust?.contactPhone);
        addRaw(trust?.whatsappSupportNumber);
      }
    }
  } catch (err) {
    console.warn('[waFlyerLanding] Admin lookup notice:', err);
  }

  return candidates.has(normPhone);
}

async function fetchExistingKosWebSlugs(
  db: admin.firestore.Firestore,
  tenantId: string
): Promise<Set<string>> {
  const slugs = new Set<string>([
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
      const snap =
        tenantId && tenantId !== '_master'
          ? await db.collection('tenants').doc(tenantId).collection(col).get()
          : await db.collection(col).get();
      snap.forEach((d) => {
        const s = sanitizeSlug(String(d.data()?.slug || ''));
        if (s) slugs.add(s);
      });
    } catch {
      // ignore missing collection
    }
  }

  return slugs;
}

function ensureUniqueSlug(candidate: string, takenSlugs: Set<string>): string {
  const base = sanitizeSlug(candidate) || `lp-${Date.now().toString().slice(-5)}`;
  if (!takenSlugs.has(base)) return base;
  let idx = 2;
  while (takenSlugs.has(`${base}-${idx}`) && idx < 100) idx++;
  return `${base}-${idx}`;
}

async function downloadAndStoreMedia(
  downloadUrl: string,
  tenantId: string,
  fileName?: string,
  mimeTypeHint?: string
): Promise<{ publicUrl: string; base64: string; mimeType: string }> {
  const resp = await fetch(downloadUrl);
  if (!resp.ok) {
    throw new Error(`Failed to download media from Green API (${resp.status})`);
  }
  const arrayBuf = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const mimeType =
    mimeTypeHint ||
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
  await fileRef.makePublic().catch(() => {});

  const publicUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${storagePath}`;
  return {
    publicUrl,
    base64: buffer.toString('base64'),
    mimeType,
  };
}

async function callGeminiJson(
  geminiKey: string,
  prompt: string,
  media?: { base64: string; mimeType: string }
): Promise<any> {
  const parts: any[] = [{ text: prompt }];
  if (media?.base64 && media?.mimeType) {
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      geminiKey
    )}`;
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

    const data: any = await res.json();
    if (!res.ok) {
      lastError = data?.error?.message || `HTTP ${res.status}`;
      continue;
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  }

  throw new Error(lastError);
}

function formatReportForWhatsApp(report: any, slug: string, tenantId: string): string {
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
    .map((h: any) => `- ${h.title}${h.description ? `: ${h.description}` : ''}`)
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
    `*כתובת ייחודית (ללא התנגשות ב-KOSWEB):* https://${host}/lp/${slug}`,
    `\n*מה תרצה לעשות עכשיו?*`,
    `- כתוב הוראות עריכה ודיוק (למשל: "שנה כותרת ל...", "הוסף קוד קופון VIP20")`,
    `- שלח תמונה נוספת אם תרצה להחליף את תמונת ה-Hero`,
    `- כתוב *"אשר"* או *"צור דף"* כדי ש-KOSAI ייצור את ה-HTML והטופס ויפרסם מיד`,
    `- כתוב *"בטל"* לביטול`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Handles WhatsApp Green API flyer -> report -> refine -> KOSAI HTML + SmartForm flow for authorized admins.
 * Returns true if the message was handled by this flow, false to fall through to normal bot logic.
 */
export async function handleWhatsAppFlyerLanding(input: WaFlyerLandingInput): Promise<boolean> {
  const {
    db,
    tenantId,
    targetChatId,
    normPhone,
    cleanDigits,
    messageText,
    fileData,
    apiKeys,
    geminiKey,
    greenApiInstanceId,
    greenApiToken,
  } = input;

  const trimmed = (messageText || '').trim();
  const lower = trimmed.toLowerCase();
  const sessionRef = db
    .collection('wa_flyer_landing_sessions')
    .doc(`${tenantId}_${cleanDigits}`);

  const sessionSnap = await sessionRef.get();
  const sessionExists = sessionSnap.exists;
  const sessionData = sessionExists ? (sessionSnap.data() as any) : null;

  const isSessionFresh =
    sessionData &&
    typeof sessionData.updatedAtMs === 'number' &&
    Date.now() - sessionData.updatedAtMs < 60 * 60 * 1000;

  const hasLandingTrigger =
    Boolean(fileData?.downloadUrl) ||
    /^(דף נחיתה|עמוד נחיתה|פלייר|צור דף|בנה דף)/.test(lower);

  if (!isSessionFresh && !hasLandingTrigger) {
    return false;
  }

  const authorized = await isAuthorizedLandingAdmin(db, tenantId, normPhone, apiKeys);
  if (!authorized) {
    return false;
  }

  // Cancel command
  if (isSessionFresh && /^(בטל|ביטול|סגור)$/.test(lower)) {
    await sessionRef.delete();
    await sendGreenApiText(
      greenApiInstanceId,
      greenApiToken,
      targetChatId,
      'תהליך בניית דף הנחיתה בוטל.'
    );
    return true;
  }

  try {
    // CASE A: New flyer uploaded OR explicit landing trigger without active session
    if (!isSessionFresh || (fileData?.downloadUrl && sessionData?.stage !== 'report_ready' && sessionData?.stage !== 'published')) {
      if (!fileData?.downloadUrl && !trimmed) {
        return false;
      }

      await sendGreenApiText(
        greenApiInstanceId,
        greenApiToken,
        targetChatId,
        'קיבלתי את הפלייר וההנחיות. מפיק דוח אפיון מפורט לעמוד נחיתה...'
      );

      let storedMedia: { publicUrl: string; base64: string; mimeType: string } | undefined;
      if (fileData?.downloadUrl) {
        storedMedia = await downloadAndStoreMedia(
          fileData.downloadUrl,
          tenantId,
          fileData.fileName,
          fileData.mimeType
        );
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
      const heroImageUrl =
        storedMedia && storedMedia.mimeType.startsWith('image/') ? storedMedia.publicUrl : '';
      if (heroImageUrl) report.heroImageUrl = heroImageUrl;

      await sessionRef.set({
        stage: 'report_ready',
        tenantId,
        report,
        slug: uniqueSlug,
        heroImageUrl,
        flyerPreviewUrl: storedMedia?.publicUrl || '',
        updatedAtMs: Date.now(),
      });

      await sendGreenApiText(
        greenApiInstanceId,
        greenApiToken,
        targetChatId,
        formatReportForWhatsApp(report, uniqueSlug, tenantId)
      );
      return true;
    }

    // CASE B: Active session -> Approve & Generate HTML + Form with KOSAI
    if (
      sessionData.stage === 'report_ready' &&
      /^(אשר|אישור|צור דף|בנה דף|פרסם|קדימה)$/.test(lower)
    ) {
      await sendGreenApiText(
        greenApiInstanceId,
        greenApiToken,
        targetChatId,
        'שולח ל-KOSAI ליצירת קוד HTML עצמאי באיכות גבוהה + הטופס החכם...'
      );

      const takenSlugs = await fetchExistingKosWebSlugs(db, tenantId);
      const finalSlug = ensureUniqueSlug(sessionData.slug || sessionData.report?.title, takenSlugs);
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

      await sessionRef.set(
        {
          stage: 'published',
          slug: finalSlug,
          pageId: result.pageId,
          formId: result.formId,
          htmlContent: result.htmlContent,
          updatedAtMs: Date.now(),
        },
        { merge: true }
      );

      const host = tenantId && tenantId !== '_master' ? `${tenantId}.kosun.pro` : 'compona.web.app';
      await sendGreenApiText(
        greenApiInstanceId,
        greenApiToken,
        targetChatId,
        `העמוד והטופס פורסמו בהצלחה!\n\n*קישור חי:* https://${host}/lp/${finalSlug}\n\nרוצה לשנות משהו בעמוד? פשוט שלח לי הודעת תיקון ואעדכן מיד.`
      );
      return true;
    }

    // CASE C: Active session -> Refine Report or Update Published Page
    if (sessionData.stage === 'report_ready') {
      let nextHeroUrl = sessionData.heroImageUrl || '';
      if (fileData?.downloadUrl) {
        const stored = await downloadAndStoreMedia(
          fileData.downloadUrl,
          tenantId,
          fileData.fileName,
          fileData.mimeType
        );
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
        if (nextHeroUrl) updatedReport.heroImageUrl = nextHeroUrl;
        if (updatedReport.suggestedSlug && updatedReport.suggestedSlug !== sessionData.report?.suggestedSlug) {
          const takenSlugs = await fetchExistingKosWebSlugs(db, tenantId);
          nextSlug = ensureUniqueSlug(updatedReport.suggestedSlug, takenSlugs);
        }
      } else if (nextHeroUrl) {
        updatedReport = { ...updatedReport, heroImageUrl: nextHeroUrl };
      }

      await sessionRef.set(
        {
          report: updatedReport,
          slug: nextSlug,
          heroImageUrl: nextHeroUrl,
          updatedAtMs: Date.now(),
        },
        { merge: true }
      );

      await sendGreenApiText(
        greenApiInstanceId,
        greenApiToken,
        targetChatId,
        formatReportForWhatsApp(updatedReport, nextSlug, tenantId)
      );
      return true;
    }

    if (sessionData.stage === 'published') {
      let nextHeroUrl = sessionData.heroImageUrl || '';
      if (fileData?.downloadUrl) {
        const stored = await downloadAndStoreMedia(
          fileData.downloadUrl,
          tenantId,
          fileData.fileName,
          fileData.mimeType
        );
        if (stored.mimeType.startsWith('image/')) {
          nextHeroUrl = stored.publicUrl;
        }
      }

      await sendGreenApiText(
        greenApiInstanceId,
        greenApiToken,
        targetChatId,
        'מעדכן את ה-HTML והטופס ב-KOSAI לפי ההנחיה החדשה...'
      );

      const result = await generateAndPersistLanding({
        db,
        tenantId,
        geminiKey,
        report: sessionData.report,
        refinements: trimmed || 'שלב את תמונת ה-Hero החדשה בעיצוב',
        currentHtml: sessionData.htmlContent,
        slug: sessionData.slug,
        existingPageId: sessionData.pageId,
        existingFormId: sessionData.formId,
        heroImageUrl: nextHeroUrl,
        flyerPreviewUrl: sessionData.flyerPreviewUrl || '',
      });

      await sessionRef.set(
        {
          heroImageUrl: nextHeroUrl,
          htmlContent: result.htmlContent,
          updatedAtMs: Date.now(),
        },
        { merge: true }
      );

      const host = tenantId && tenantId !== '_master' ? `${tenantId}.kosun.pro` : 'compona.web.app';
      await sendGreenApiText(
        greenApiInstanceId,
        greenApiToken,
        targetChatId,
        `העמוד עודכן בהצלחה!\n*קישור חי:* https://${host}/lp/${sessionData.slug}`
      );
      return true;
    }
  } catch (err: any) {
    console.error('[waFlyerLanding] Error:', err);
    await sendGreenApiText(
      greenApiInstanceId,
      greenApiToken,
      targetChatId,
      `חלה שגיאה בתהליך: ${err?.message || 'שגיאה לא צפויה'}`
    );
    return true;
  }

  return false;
}

async function generateAndPersistLanding(params: {
  db: admin.firestore.Firestore;
  tenantId: string;
  geminiKey: string;
  report: any;
  refinements: string;
  currentHtml?: string;
  slug: string;
  existingPageId?: string;
  existingFormId?: string;
  heroImageUrl?: string;
  flyerPreviewUrl?: string;
}): Promise<{ pageId: string; formId: string; htmlContent: string }> {
  const {
    db,
    tenantId,
    geminiKey,
    report,
    refinements,
    currentHtml,
    slug,
    existingPageId,
    existingFormId,
    heroImageUrl,
    flyerPreviewUrl,
  } = params;

  const htmlPrompt = `אתה KOSAI – מעצב על ומפתח Frontend + אדריכל טפסים חכמים (KSF).
הדוח הערוך: ${JSON.stringify(report, null, 2)}
${heroImageUrl ? `תמונת Hero: ${heroImageUrl} — חובה לשלב ב-Hero באמצעות <img class="kosun-hero-image" src="${heroImageUrl}" alt="${report?.title || 'Hero'}" />.` : ''}
${refinements ? `דיוקים נוספים: "${refinements}"` : ''}
${currentHtml ? `קוד HTML קודם לעדכון:\n${currentHtml.slice(0, 14000)}` : ''}

חוקים:
1. HTML + <style> רספונסיבי RTL מלא עם גופן Heebo, ללא <html>/<head>/<body>.
2. חובה לכלול במקום הטופס את הסמן המדויק: <div id="kosun-form-slot"></div> (לא לבנות <form> סטטי).
3. אפס אימוג'ים.
החזר JSON תקני בלבד:
{
  "htmlContent": "<style>...</style><div class=\\"lp-root\\" dir=\\"rtl\\">...<div id=\\"kosun-form-slot\\"></div>...</div>",
  "form": {
    "title": "כותרת הטופס",
    "description": "תיאור",
    "category": "דפי נחיתה",
    "tone": "executive_luxury",
    "steps": [
      { "id": "step_1", "order": 1, "title": "מהו שמך המלא?", "fieldType": "text", "iconName": "User", "required": true, "mappingKey": "kosun_crm_name" }
    ],
    "completion": { "title": "תודה רבה!", "subtitle": "פרטיך נקלטו בהצלחה.", "iconName": "CheckCircle2", "showRedirectButton": false }
  }
}`;

  const generated = await callGeminiJson(geminiKey, htmlPrompt);
  let htmlContent = String(generated.htmlContent || '').trim();
  if (!htmlContent.includes('id="kosun-form-slot"') && !htmlContent.includes("id='kosun-form-slot'")) {
    htmlContent += '\n<div id="kosun-form-slot"></div>';
  }

  const now = new Date().toISOString();
  const formId = existingFormId || `form_lp_${Date.now()}`;
  const formsColl =
    tenantId && tenantId !== '_master'
      ? db.collection('tenants').doc(tenantId).collection('mod_forms')
      : db.collection('mod_forms');

  const rawForm = generated.form || {};
  const formDoc = {
    id: formId,
    title: rawForm.title || report?.formPlan?.formTitle || report?.title || 'טופס הרשמה',
    slug: `${slug}-form`,
    description: rawForm.description || report?.subtitle || '',
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
    crmDefaultTags: ['דף נחיתה וואטסאפ', report?.title || 'KSF'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'KOSAI WhatsApp Agent',
  };
  await formsColl.doc(formId).set(formDoc, { merge: true });

  const pageId = existingPageId || `lp_${Date.now()}`;
  const lpColl =
    tenantId && tenantId !== '_master'
      ? db.collection('tenants').doc(tenantId).collection('custom_html_landing_pages')
      : db.collection('custom_html_landing_pages');

  await lpColl.doc(pageId).set(
    {
      id: pageId,
      slug,
      title: report?.title || 'דף נחיתה מפלייר',
      subtitle: report?.subtitle || '',
      htmlContent,
      formId,
      formTitle: formDoc.title,
      flyerPreviewUrl: flyerPreviewUrl || '',
      heroImageUrl: heroImageUrl || '',
      report,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  return { pageId, formId, htmlContent };
}
