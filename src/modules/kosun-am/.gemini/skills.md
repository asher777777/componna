# סקילים והגדרות סוכנים לרכיב: קושאן מייל אוטומטי (`kosun-am`)

קובץ זה מגדיר את היכולות, המשימות הדחופות והסקילים הייעודיים שסוכן AI צריך להכיר בעת הרחבה, בדיקה או שיפוץ של רכיב זה.

---

## [1] סקילים ויכולות ליבה של הרכיב (Core Capabilities)
1. **ניהול קמפיינים וניוזלטרים חכם (Campaign Engine):**
   - יצירה, עריכה, תזמון ושיגור קמפיינים שיווקיים עם מעקב ביצועים חי (מסירות, פתיחות, הקלקות).
2. **עורך תבניות אימייל ויזואלי (Bento Visual Email Builder):**
   - עריכת בלוקים מודולרית (Header, Hero, Bento Cards, Rich Text, CTA, WhatsApp Link, Footer).
3. **בונה אוטומציות רב-ערוצי (Multi-Channel Automation Engine):**
   - תזרימי עבודה המשלבים אימייל, הודעות וואטסאפ (Green API), השהיות חכמות וסנכרון לידים ב-CRM.
4. **סייען בינה מלאכותית מובנה (Kosai Email Copilot):**
   - שימוש במודלי Gemini Flash (`gemini-3.8-flash`, `gemini-3.5-flash`) ליצירת כותרות ממירות A/B ותוכן מותאם Brand DNA.
5. **בידוד Multi-Tenancy מלא (Scoped Persistence):**
   - כל הנתונים מנוהלים תחת `tenants/{tenantId}/mod_kosun_am_*` דרך `useTenantScope()`.
6. **מנוע ריבוי ספקים ו-Mock Fallback:**
   - תמיכה ב-Resend, SendGrid, Cloud Functions Proxy ומצב סימולציה מקומית (Offline Mock).

---

## [2] צ'קליסט ביקורת 5 השערים (5 Audit Gates Checklist)
בעת ביקורת או שדרוג הרכיב, על הסוכן לוודא ולסמן וי על כל הסעיפים הבאים:

- [ ] **שער 1: ארכיטקטורה וגבולות מודולריים (Modular Boundaries Gate):**
  - קיום כל 12 השכבות תחת `src/modules/kosun-am/`.
  - אפס ייבואים צולבים ישירים (Zero Cross-Imports מתוך `src/modules/*` שכנים).
  - תקשורת דרך EventBus ו-HostCapabilities בלבד.

- [ ] **שער 2: בידוד נתונים ו-Multi-Tenancy (Data Isolation Gate):**
  - שמירה ושליפה אך ורק דרך `useTenantScope().getScopedCollectionRef(...)`.
  - אפס שימוש ב-`localStorage` למפתחות API; שליפה דרך `tenantApiKeys.ts`.
  - סנכרון משולש של הקולקציות ב-`collections.ts`, `db-collections-hub/config/index.ts`, ו-`seedData.ts`.

- [ ] **שער 3: מודלי AI ותקני Gemini (AI Standards Gate):**
  - שימוש במודלים מורשים בלבד (`gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.8-flash-lite`).
  - שרשרת Fallback Cascade למניעת קריסות.
  - חישוב עלויות וטוקנים דרך `calculateGeminiCost`.

- [ ] **שער 4: מיתוג קושאן 2026 (Kosun 2026 UI Gate):**
  - פריסת Bento Grid נקייה ומאווררת (Mobile First).
  - ניווט עליון בלבד (Top Nav) - אפס תפריטי צד.
  - גופן Heebo בלבד.
  - אפס אימוג'ים טקסטואליים - שימוש בלעדי באייקוני Lucide.
  - עטיפת RTL מלאה ב-`<div dir="rtl" style="text-align: right;">`.
  - נתונים סטטיסטיים מוסתרים בברירת מחדל באקורדיון מתקפל.
  - שימוש בטולטיפים חכמים מזעריים `(i)` הנסגרים בלחיצה מחוצה להם.

- [ ] **שער 5: יציבות ריצה, ביצועים ובדיקת Build (Resilience & Build Gate):**
  - עטיפה ב-`ModuleErrorBoundary` ו-`Suspense`.
  - טעינה עצלה ברישום ב-`moduleRegistry.ts` באמצעות `React.lazy()`.
  - קומפילציה נקייה עם `npm run build` ללא שגיאות.
