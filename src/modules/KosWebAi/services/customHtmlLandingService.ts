import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db as defaultDb } from '../../../services/firebase';
import { executeKosaiAi } from '../../KosAi/modelsAiService/executeKosaiAi';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { SmartFormDefinition } from '../../KosForms/types';
import { DEFAULT_THEME_SETTINGS, DEFAULT_COMPLETION_SETTINGS } from '../../KosForms/config/constants';

export const CUSTOM_HTML_LANDING_COLLECTION = 'custom_html_landing_pages';

export interface FlyerLandingReport {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  suggestedSlug: string;
  eventDetails: {
    date?: string;
    time?: string;
    location?: string;
    price?: string;
    audience?: string;
    contactInfo?: string;
  };
  highlights: Array<{ title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  designDirection: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    visualStyle: string;
  };
  formPlan: {
    formTitle: string;
    formCategory: string;
    includeTickets: boolean;
    includeCoupons: boolean;
    includePayment: boolean;
    suggestedStepsSummary: string[];
  };
}

export interface CustomHtmlLandingPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  htmlContent: string;
  formId: string;
  formTitle?: string;
  flyerPreviewUrl?: string;
  report?: FlyerLandingReport;
  status: 'published' | 'draft';
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

const RESERVED_SLUGS = new Set([
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
  'api',
  'assets',
]);

export function sanitizeLandingSlug(raw: string): string {
  return (raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/**
 * Check that slug does NOT exist in KosWebAi pages or existing custom HTML landing pages
 */
export function checkSlugAvailability(
  candidateSlug: string,
  kosWebPages: PageBuilderConfig[],
  customLandingPages: CustomHtmlLandingPage[],
  currentPageId?: string
): { available: boolean; reason?: string; suggestedSlug: string } {
  const clean = sanitizeLandingSlug(candidateSlug) || `lp-${Date.now().toString().slice(-5)}`;

  const kosWebSlugs = new Set(
    kosWebPages
      .map((p) => sanitizeLandingSlug(p.slug || ''))
      .filter(Boolean)
  );
  const customSlugs = new Set(
    customLandingPages
      .filter((p) => p.id !== currentPageId)
      .map((p) => sanitizeLandingSlug(p.slug || ''))
      .filter(Boolean)
  );

  const isTaken = (s: string) =>
    RESERVED_SLUGS.has(s) || kosWebSlugs.has(s) || customSlugs.has(s);

  if (!isTaken(clean)) {
    return { available: true, suggestedSlug: clean };
  }

  const reason = kosWebSlugs.has(clean)
    ? `הסלאג "${clean}" כבר קיים בעמודי KOSWEB`
    : RESERVED_SLUGS.has(clean)
    ? `הסלאג "${clean}" שמור למערכת`
    : `הסלאג "${clean}" כבר בשימוש בדף נחיתה אחר`;

  let suffix = 2;
  let candidate = `${clean}-lp`;
  while (isTaken(candidate) && suffix < 100) {
    candidate = `${clean}-${suffix}`;
    suffix++;
  }

  return { available: false, reason, suggestedSlug: candidate };
}

function getLandingCollectionPath(tenantId?: string): string {
  if (tenantId && tenantId !== '_master') {
    return `tenants/${tenantId}/${CUSTOM_HTML_LANDING_COLLECTION}`;
  }
  return CUSTOM_HTML_LANDING_COLLECTION;
}

export async function saveCustomHtmlLandingPage(
  page: CustomHtmlLandingPage,
  customDb?: Firestore | null,
  tenantId?: string
): Promise<string> {
  const targetDb = customDb || defaultDb;
  if (!targetDb) throw new Error('Firestore is not initialized');

  const collPath = getLandingCollectionPath(tenantId);
  const cleanSlug = sanitizeLandingSlug(page.slug) || `lp-${Date.now()}`;
  const docId = page.id || `lp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const payload: CustomHtmlLandingPage = {
    ...page,
    id: docId,
    slug: cleanSlug,
    updatedAt: now,
    createdAt: page.createdAt || now,
  };

  await setDoc(doc(targetDb, collPath, docId), JSON.parse(JSON.stringify(payload)), {
    merge: true,
  });
  return docId;
}

export async function listCustomHtmlLandingPages(
  customDb?: Firestore | null,
  tenantId?: string
): Promise<CustomHtmlLandingPage[]> {
  const targetDb = customDb || defaultDb;
  if (!targetDb) return [];
  try {
    const collPath = getLandingCollectionPath(tenantId);
    const snap = await getDocs(
      query(collection(targetDb, collPath), orderBy('updatedAt', 'desc'))
    );
    return snap.docs.map((d) => ({ ...(d.data() as CustomHtmlLandingPage), id: d.id }));
  } catch (err) {
    console.warn('[customHtmlLandingService] list error:', err);
    return [];
  }
}

export async function getCustomHtmlLandingPageBySlug(
  slug: string,
  customDb?: Firestore | null,
  tenantId?: string
): Promise<CustomHtmlLandingPage | null> {
  const targetDb = customDb || defaultDb;
  if (!targetDb) return null;

  const cleanSlug = sanitizeLandingSlug(slug);
  if (!cleanSlug) return null;

  const pathsToTry = [getLandingCollectionPath(tenantId)];
  if (tenantId && tenantId !== '_master') {
    pathsToTry.push(CUSTOM_HTML_LANDING_COLLECTION);
  }

  for (const collPath of pathsToTry) {
    try {
      const snap = await getDocs(
        query(collection(targetDb, collPath), where('slug', '==', cleanSlug))
      );
      if (!snap.empty) {
        const d = snap.docs[0];
        return { ...(d.data() as CustomHtmlLandingPage), id: d.id };
      }
      // Fallback by direct ID
      const byIdSnap = await getDoc(doc(targetDb, collPath, slug));
      if (byIdSnap.exists()) {
        return { ...(byIdSnap.data() as CustomHtmlLandingPage), id: byIdSnap.id };
      }
    } catch {
      // continue to fallback
    }
  }
  return null;
}

export async function deleteCustomHtmlLandingPage(
  pageId: string,
  customDb?: Firestore | null,
  tenantId?: string
): Promise<void> {
  const targetDb = customDb || defaultDb;
  if (!targetDb) return;
  await deleteDoc(doc(targetDb, getLandingCollectionPath(tenantId), pageId));
}

export async function trackCustomHtmlLandingView(
  pageId: string,
  customDb?: Firestore | null,
  tenantId?: string
): Promise<void> {
  const targetDb = customDb || defaultDb;
  if (!targetDb) return;
  try {
    await updateDoc(doc(targetDb, getLandingCollectionPath(tenantId), pageId), {
      viewsCount: increment(1),
    });
  } catch {
    // non-critical
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const str = typeof reader.result === 'string' ? reader.result : '';
      resolve(str.includes('base64,') ? str.split('base64,')[1] : str);
    };
    reader.onerror = () => reject(new Error('שגיאה בקריאת קובץ הפלייר'));
    reader.readAsDataURL(file);
  });
}

/**
 * Step 1 -> 2: Analyze uploaded flyer + user instructions via KOSAI to produce an editable report
 */
export async function generateLandingReportFromFlyer(params: {
  file?: File | null;
  instructions: string;
  companyName: string;
  existingKosWebSlugs: string[];
  tenantId?: string;
}): Promise<{ report: FlyerLandingReport; previewImageDataUrl?: string }> {
  const { file, instructions, companyName, existingKosWebSlugs, tenantId } = params;

  let imageBase64: string | undefined;
  let mimeType: string | undefined;
  let textContent: string | undefined;
  let previewImageDataUrl: string | undefined;

  if (file) {
    const lower = file.name.toLowerCase();
    const isText =
      lower.endsWith('.md') ||
      lower.endsWith('.txt') ||
      file.type.startsWith('text/');
    if (isText) {
      textContent = await file.text();
    } else {
      mimeType = file.type || (lower.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      imageBase64 = await fileToBase64(file);
      if (mimeType.startsWith('image/')) {
        previewImageDataUrl = `data:${mimeType};base64,${imageBase64}`;
      }
    }
  }

  const prompt = `אתה אדריכל דפי נחיתה ומנהל קריאייטיב בכיר במערכת KOSAI עבור העסק "${companyName}".
המשתמש העלה פלייר${file ? ` (${file.name})` : ''} והוסיף את ההנחיות הבאות:
"${instructions || 'הפק דוח מפורט וממיר לבניית עמוד נחיתה HTML יוקרתי עם טופס הרשמה.'}"
${textContent ? `\nתוכן טקסטואלי מהקובץ:\n${textContent.slice(0, 8000)}\n` : ''}

סלאגים קיימים שאסור להשתמש בהם ב-suggestedSlug:
[${existingKosWebSlugs.slice(0, 50).join(', ')}]

משימתך: להפיק דוח אפיון מפורט ומוכן לעריכה עבור עמוד נחיתה עצמאי (ללא תלות באזורים של KosWeb) + טופס חכם תואם.
חל איסור להשתמש באימוג'ים בכלל.
החזר אך ורק JSON תקני במבנה הבא:
{
  "title": "כותרת ראשית חזקה בעברית",
  "subtitle": "תת-כותרת מניעה לפעולה",
  "description": "תיאור מלא ומדויק של ההצעה/האירוע מהפלייר ומההנחיות",
  "ctaText": "טקסט לכפתור הרשמה",
  "suggestedSlug": "unique-english-slug",
  "eventDetails": {
    "date": "",
    "time": "",
    "location": "",
    "price": "",
    "audience": "",
    "contactInfo": ""
  },
  "highlights": [
    { "title": "יתרון / נקודה מרכזית", "description": "פירוט קצר" }
  ],
  "faqs": [
    { "question": "שאלה נפוצה", "answer": "תשובה ברורה" }
  ],
  "designDirection": {
    "primaryColor": "#f59e0b",
    "secondaryColor": "#6366f1",
    "backgroundColor": "#090a0f",
    "textColor": "#f8fafc",
    "visualStyle": "תיאור הסגנון הוויזואלי המתאים לפלייר"
  },
  "formPlan": {
    "formTitle": "כותרת הטופס",
    "formCategory": "אירועים / לידים / מכירות",
    "includeTickets": false,
    "includeCoupons": false,
    "includePayment": false,
    "suggestedStepsSummary": ["שם מלא", "טלפון נייד", "דואר אלקטרוני"]
  }
}`;

  const result = await executeKosaiAi<FlyerLandingReport>('KosWebAi:FlyerReport', prompt, {
    model: 'gemini-3.8-flash',
    imageBase64,
    imageMimeType: mimeType,
    temperature: 0.4,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
    tenantId,
    category: 'content',
    skipCache: true,
    timeoutMs: 60000,
  });

  if (!result.success || !result.data) {
    throw new Error(result.error || 'הפקת הדוח מהפלייר נכשלה');
  }

  return { report: result.data, previewImageDataUrl };
}

export interface KosaiHtmlAndFormOutput {
  htmlContent: string;
  form: SmartFormDefinition;
}

/**
 * Step 2 -> 3: Send edited report + additional refinements to KOSAI to generate high-quality standalone HTML + SmartForm
 */
export async function generateHtmlAndFormWithKosai(params: {
  report: FlyerLandingReport;
  refinements: string;
  currentHtml?: string;
  companyName: string;
  slug: string;
  tenantId?: string;
}): Promise<KosaiHtmlAndFormOutput> {
  const { report, refinements, currentHtml, companyName, slug, tenantId } = params;

  const prompt = `אתה KOSAI – מעצב על, מפתח Frontend בכיר ואדריכל טפסים חכמים (KSF) של קושאן עבור "${companyName}".
המשימה: לייצר עמוד נחיתה **HTML + CSS עצמאי לחלוטין באיכות גבוהה** (שאינו משתמש באזורים של KosWebAi) **ביחד עם טופס חכם (SmartFormDefinition)** תואם.

[הדוח הערוך מהמשתמש]:
${JSON.stringify(report, null, 2)}

[הנחיות נוספות ודיוקים מהמשתמש]:
"${refinements || 'שמור על עיצוב יוקרתי, נקי, ממיר וחד-משמעי בעברית.'}"

${currentHtml ? `[קוד HTML קודם לשיפור ועריכה לפי הדיוקים]:\n${currentHtml.slice(0, 14000)}\n` : ''}

חוקים מחייבים עבור ה-HTML (htmlContent):
1. כתוב HTML סמנטי + תגית <style> פנימית עם עיצוב מודרני, רספונסיבי (מובייל + דסקטופ), כיוון RTL מלא (dir="rtl"), וגופן Heebo.
2. השתמש בצבעים מתוך designDirection שבדוח (primaryColor, secondaryColor, backgroundColor, textColor) עם ניגודיות קריאה מושלמת, כרטיסים מעוצבים, הצללות, וטיפוגרפיה חדה.
3. אל תכלול תגי <html>, <head> או <body> — החזר קטע HTML עם <style> ועטיפה ראשית <div class="lp-root" dir="rtl">...</div>.
4. חובה לכלול במקום המרכזי של הטופס בעמוד את הסמן המדויק הבא (בדיוק כך, ריק מתוכן):
   <div id="kosun-form-slot"></div>
   המערכת תזריק לתוך הסמן הזה את הטופס החכם החי של KosForms. אל תבנה <form> HTML סטטי משלך!
5. כל כפתורי ה-CTA בעמוד צריכים לגלול חלק אל #kosun-form-slot (למשל onclick="document.getElementById('kosun-form-slot')?.scrollIntoView({behavior:'smooth'})").
6. אפס אימוג'ים בכל הטקסטים!

חוקים מחייבים עבור הטופס (form):
1. שאלה אחת בכל שלב (steps).
2. סוגי שדות מותרים: 'text', 'textarea', 'phone', 'email', 'number', 'single_choice', 'multi_choice', 'rating', 'scale', 'date', 'ticket_booking', 'coupon_code', 'payment'.
3. מפתחות CRM תקניים: 'kosun_crm_name', 'kosun_crm_phone', 'kosun_crm_email', 'kosun_crm_notes'.
4. אם report.formPlan.includeTickets=true, כלול שלב 'ticket_booking' עם ticketTiers (id, name, description, price, capacity, soldCount: 0, maxPerOrder: 10).
5. אם report.formPlan.includeCoupons=true, כלול שלב 'coupon_code' עם coupons (id, code, discountType: 'percent'|'fixed', discountValue, maxUses, usedCount: 0, active: true).
6. אם report.formPlan.includePayment=true, כלול שלב 'payment' בסוף.

החזר אך ורק JSON תקני (ללא markdown) במבנה הבא:
{
  "htmlContent": "<style>...</style><div class=\"lp-root\" dir=\"rtl\">...<div id=\"kosun-form-slot\"></div>...</div>",
  "form": {
    "title": "כותרת הטופס",
    "description": "תיאור קצר",
    "category": "אירועים / לידים",
    "tone": "executive_luxury",
    "steps": [ ... ],
    "completion": {
      "title": "תודה רבה! ההרשמה התקבלה",
      "subtitle": "פרטיך נקלטו בהצלחה ונחזור אליך בהקדם.",
      "iconName": "CheckCircle2",
      "showRedirectButton": false
    }
  }
}`;

  const result = await executeKosaiAi<{ htmlContent: string; form: Partial<SmartFormDefinition> }>(
    'KosWebAi:GenerateCustomHtmlLanding',
    prompt,
    {
      model: 'gemini-3.8-flash',
      temperature: 0.5,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      tenantId,
      category: 'content',
      skipCache: true,
      timeoutMs: 90000,
    }
  );

  if (!result.success || !result.data || !result.data.htmlContent) {
    throw new Error(result.error || 'יצירת ה-HTML והטופס ב-KOSAI נכשלה');
  }

  let htmlContent = result.data.htmlContent.trim();
  if (!htmlContent.includes('id="kosun-form-slot"') && !htmlContent.includes("id='kosun-form-slot'")) {
    htmlContent += '\n<div id="kosun-form-slot"></div>';
  }

  const now = new Date().toISOString();
  const rawForm = result.data.form || {};
  const normalizedSteps = (Array.isArray(rawForm.steps) ? rawForm.steps : []).map((s: any, idx: number) => ({
    id: s.id || `step_${idx + 1}`,
    order: idx + 1,
    title: s.title || `שאלה ${idx + 1}`,
    subtitle: s.subtitle || '',
    fieldType: s.fieldType || 'text',
    iconName: s.iconName || 'Sparkles',
    placeholder: s.placeholder || '',
    required: s.required ?? true,
    mappingKey: s.mappingKey || `field_${idx + 1}`,
    ...(s.options ? { options: s.options } : {}),
    ...(s.ticketTiers ? { ticketTiers: s.ticketTiers } : {}),
    ...(s.collectAttendeeNames !== undefined ? { collectAttendeeNames: s.collectAttendeeNames } : {}),
    ...(s.coupons ? { coupons: s.coupons } : {}),
  }));

  const fullForm: SmartFormDefinition = {
    id: `form_lp_${Date.now()}`,
    title: rawForm.title || report.formPlan?.formTitle || report.title,
    slug: `${slug}-form`,
    description: rawForm.description || report.subtitle || '',
    category: rawForm.category || report.formPlan?.formCategory || 'דפי נחיתה',
    tone: (rawForm.tone as any) || 'executive_luxury',
    steps: normalizedSteps,
    theme: {
      ...DEFAULT_THEME_SETTINGS,
      primaryColor: report.designDirection?.primaryColor || DEFAULT_THEME_SETTINGS.primaryColor,
      accentColor: report.designDirection?.primaryColor || DEFAULT_THEME_SETTINGS.accentColor,
      cardBackground: report.designDirection?.backgroundColor || DEFAULT_THEME_SETTINGS.cardBackground,
      textColor: report.designDirection?.textColor || DEFAULT_THEME_SETTINGS.textColor,
    },
    completion: {
      ...DEFAULT_COMPLETION_SETTINGS,
      ...(rawForm.completion || {}),
    },
    status: 'published',
    isCrmSyncEnabled: true,
    crmDefaultTags: ['דף נחיתה HTML', report.title].filter(Boolean),
    createdAt: now,
    updatedAt: now,
    createdBy: 'KOSAI Flyer-to-HTML',
  };

  return { htmlContent, form: fullForm };
}
