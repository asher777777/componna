# דוח מסירה - חקירת מיתוג קושאן 2026, פרונטנד, AI ורישום מודול (Handoff Report)

<div dir="rtl" style="text-align: right;">

## 1. תצפית (Observation)

במהלך החקירה נבחנו הקבצים וההנחיות הבאים במערכת:

1. **הנחיית השם הרשמית (הודעת שיגור 2026-10-11T11:38:31Z):**
   - שם רשמי בעברית: **"קושאן מייל אוטומטי"**
   - שם רשמי באנגלית: **"KOSUN AM"** (הנחיה מפורשת: kosun ולא cashwan).
   - מזהה מודול ונתיב: `kosun-am` (`src/modules/kosun-am/`).
   - קידומות קולקציה: `mod_kosun_am_` (`mod_kosun_am_campaigns`, `mod_kosun_am_templates`, `mod_kosun_am_automations`, `mod_kosun_am_logs`).

2. **סקיל מיתוג קושאן (`C:\Users\ovt57\.gemini\config\skills\cashwan-branding\SKILL.md`):**
   - סעיף 1: קושאן היא יישות חיה, אינטליגנטית ודינמית; שותף אישי שלוקח אחריות ("קושאן דואג...", "קושאן מכין...").
   - סעיף 2: עיצוב 2026, מובייל פירסט, Bento Grid Layout, **איסור מוחלט על סרגל צד (Top Nav בלבד)**.
   - סעיף 3: גופן Heebo בלעדי, טולטיפים חכמים `(i)` מזעריים במקום טקסטים ארוכים וכותרות ענק.
   - סעיף 7: הסתרת נתונים סטטיסטיים וגרפים כברירת מחדל בתוך אקורדיון מתקפל (Collapsible).
   - סעיף 8: **איסור מוחלט על אימוג'י טקסטואליים** (שימוש בלעדי ב-Lucide-React).

3. **רישום מודולים ב-`src/workbench/moduleRegistry.ts`:**
   - שורות 3-60: כל המודולים נטענים דינמית אך ורק דרך `React.lazy(() => import('../modules/...').then(m => ({ default: m... })))`.
   - שורות 62-69: מבנה `ModuleDefinition` כולל `id`, `name`, `description`, `component`, `route`, `collectionPrefix`.
   - `src/workbench/components/CashwanTopNav.tsx` שורות 34-49: מיפוי אייקונים `MODULE_ICONS`.

4. **שכבת הבינה המלאכותית וטוקנים:**
   - `src/core/ai/geminiCostTracker.ts`: פונקציית `calculateGeminiCost` ומודלי Flash מורשים: `gemini-3.8-flash` ($0.15/$0.60 למיליון טוקנים), `gemini-3.5-flash` ($0.075/$0.30 למיליון טוקנים), ו-`gemini-3.8-flash-lite`.
   - `src/core/connection/tenantApiKeys.ts`: שליפת מפתחות באמצעות `getModuleGeminiKey('kosun-am')` ללא שמירה ב-`localStorage`.

5. **חוזים, אירועים ובידוד (Zero Cross-Imports):**
   - `src/core/contracts/index.ts`: אירועי EventBus: `crm:lead:created`, `smart_form:submitted`, `campaign:ambassador:created`, `brand:updated`.
   - חוזה `BrandDnaContract`: מספק `getBrandDna()`, `getSystemPrompt()`, `getDesignTokens()`.
   - `src/core/tenant/TenantScopeContext.tsx`: בידוד טננטים דרך `getScopedCollectionRef(db, collectionName)` המחזיר `collection(db, 'tenants', tenantId, collectionName)`.

6. **עורך דפים ואלמנטים ויזואליים (`src/modules/page-builder`):**
   - מבנה בלוקים מודולרי (`sections`, `sectionOrder`, `GlobalPageSettings`), התואם לחלוטין לעורך תבניות מייל מבוסס בלוקים/בנטו גריד.

---

## 2. שרשרת הלוגיקה (Logic Chain)

1. **שם המודול וזהות המותג:**
   - על בסיס הודעת השיגור הרשמית והנחיות המיתוג, נקבע שהמודול ימוקם ב-`src/modules/kosun-am/` עם מזהה `kosun-am`, שם עברי "קושאן מייל אוטומטי", ושם אנגלי "KOSUN AM". המונח "cashwan" אסור לחלוטין בשימוש.
   - השפה והמיקרו-קופי נגזרים ישירות מ"יישות קושאן": שותף אישי שלוקח אחריות ומסיר דאגות.

2. **עיצוב וממשק משתמש (UI/UX 2026):**
   - בהתאם לחוקי המיתוג, העיצוב יתבסס על כרטיסיות Bento Grid עם פינות עגולות (`rounded-3xl` / `rounded-2xl`), מרחב נשימה עשיר (Negative space), ואיסור מוחלט על Sidebar (ניווט עליון נקי בלבד).
   - הגופן הנבחר הוא Heebo בלבד (מוגדר ב-`tailwind.config.js`).
   - כל התצוגות נעטפות ב-`<div dir="rtl" style={{ textAlign: 'right' }}>` למניעת שיבושי כיוון מטקסטים באנגלית.
   - אפס אימוג'י טקסטואליים: אייקוני Lucide בלבד (`Mail`, `Send`, `Sparkles`, `Zap` וכו').

3. **שמירה על מסך נושם:**
   - מדדי ביצוע, גרפים וכרטיסיות סטטיסטיקה מוסתרים כברירת מחדל תחת אקורדיון מתקפל ("קושאן מציג נתונים וביצועים").
   - הסברים מורחבים מוחלפים בטולטיפים חכמים עדינים `(i)` המשתמשים ב-`src/components/Ui/SmartTooltip.tsx`.

4. **סוכן AI חכם (Kosai Email Copilot):**
   - שימוש בלעדי במודלי Flash מורשים: `gemini-3.8-flash` (ראשי), `gemini-3.5-flash` (משני), `gemini-3.8-flash-lite` (שלישי).
   - שרשרת נפילה (Fallback Cascade) מדורגת, כולל Mock אינטליגנטי מקומי המבטיח שהמערכת לעולם אינה קורסת בהיעדר רשת או מפתח.
   - סנכרון עם Brand DNA דרך חוזי ה-Core ללא Cross-Imports ישירים.
   - חישוב עלויות וטוקנים דרך `calculateGeminiCost`.

5. **אינטגרציה ל-Workbench:**
   - טעינה עצלה ב-`src/workbench/moduleRegistry.ts` עם `React.lazy`.
   - מיפוי אייקון `Mail` ב-`CashwanTopNav.tsx`.

6. **עורך תבניות ואוטומציות רב-ערוצי:**
   - עורך תבניות Bento מודולרי המייצר HTML ריספונסיבי, תואם Page Builder.
   - בונה מסעות אוטומטיים ויזואלי המאזין לטריגרים מ-CRM וטפסים ומבצע פעולות רב-ערוציות (Email + WhatsApp Green API).

---

## 3. הסתייגויות (Caveats)

1. **חקירה לקריאה בלבד:** סוכן זה ביצע סקר ואפיון מלא בלבד, ללא שינוי קוד מקור (פרט לכתיבת קבצי הסקר והמסירה בתיקיית העבודה).
2. **יישום הבאקנד וספקי השליחה:** יישום שירותי השליחה הממשיים (Resend, SendGrid, SMTP, Mock Provider) וחיבור ל-Cloud Functions ייעשה על ידי מהנדס הבאקנד והנתונים בהתאם לאפיון.
3. **היעדר מפתח פעיל בעת בדיקות מקומיות:** מנגנון ה-Mock Fallback נדרש לתפקד בצורה מלאה בכל מצב ללא תלות במפתח API פעיל.

---

## 4. מסקנה (Conclusion)

סקר הפרונטנד, המיתוג, ה-AI ורישום המודול הושלם במלואו. כל הדרישות, החוקים והאילוצים אופיינו ותועדו בפירוט מלא במסמך `survey_frontend_report.md`.
הארכיטקטורה והעקרונות מוכנים ליישום מלא:
1. מודול: `kosun-am` ("קושאן מייל אוטומטי" / "KOSUN AM")
2. קולקציות: `mod_kosun_am_...`
3. עיצוב 2026: Bento Grid, Top Nav, Heebo, Strict RTL, Zero Emojis, Collapsible Stats.
4. AI Copilot: Gemini 3.8/3.5 Flash, Brand DNA, Token Tracking, Fallback Cascade.
5. רישום: `React.lazy` ב-`moduleRegistry.ts`.

---

## 5. שיטת אימות (Verification Method)

כדי לאמת באופן בלתי תלוי את ממצאי הדוח:

1. **אימות קובץ הסקר והדוח:**
   - עיון בקובץ `c:\comona\.agents\teamwork\explorer_survey_3\survey_frontend_report.md`.
   - עיון בקובץ `c:\comona\.agents\teamwork\explorer_survey_3\handoff.md`.

2. **אימות רישום המודולים הקיים ב-Workbench:**
   - פתיחת `c:\comona\src\workbench\moduleRegistry.ts` ואימות מבנה `React.lazy` ומערך `REGISTERED_MODULES`.
   - פתיחת `c:\comona\src\workbench\components\CashwanTopNav.tsx` ואימות מפת האייקונים `MODULE_ICONS`.

3. **אימות הגדרות מיתוג וגופן:**
   - בדיקת `c:\comona\index.html` (שורה 9: הגופן Heebo).
   - בדיקת `c:\comona\tailwind.config.js` (שורות 10-14: `fontFamily.heebo`).
   - בדיקת סקיל `C:\Users\ovt57\.gemini\config\skills\cashwan-branding\SKILL.md`.

4. **אימות שכבת ה-AI והעלויות:**
   - בדיקת `c:\comona\src\core\ai\geminiCostTracker.ts` (פונקציית `calculateGeminiCost` ודגמי `gemini-3.8-flash` / `gemini-3.5-flash`).
   - בדיקת `c:\comona\src\core\connection\tenantApiKeys.ts` (פונקציית `getModuleGeminiKey`).

5. **בדיקת קומפילציה ובנייה כללית:**
   - הרצת `npm run build` ב-`c:\comona` לווידוא שהפרויקט מתקמפל בצורה תקינה (Exit Code 0).

</div>
