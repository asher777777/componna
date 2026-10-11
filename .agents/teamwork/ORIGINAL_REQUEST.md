# Original User Request

## 2026-10-11T11:32:43Z

בניית רכיב דגל מתקדם לשליחת מיילים, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות (Smart Email & Multi-Channel Automation Hub) העולה ביכולותיו על Mailchimp, ומסונכרן באופן מלא ומבוסס EventBus עם רכיבי המערכת: CRM (אנשי קשר ולידים), קבוצות וואטסאפ (WhatsApp Green API), סוכני ה-AI (Kosai Engine), ובונה האתרים ודפי הנחיתה (Page Builder).

Working directory: c:\comona
Integrity mode: development

## Roles & Strict Rules Definitions

### 1. Component Spec Architect (אפיון ותוכנית)
- תפקיד: יצירת מסמך אפיון ותוכנית עבודה מלאה לפי תבנית הרכיבים המודולריים (.gemini/templates/component_spec_template.md).
- חוקי ברזל נוקשים:
  1. הגדרת אנטומיית 12 השכבות המלאה תחת src/modules/smart-email-automation-hub/.
  2. הגדרת קידומת קולקשנים ייעודית: mod_email_campaigns, mod_email_templates, mod_email_automations, mod_email_logs.
  3. תכנון סינכרון מלא דרך EventBus ו-HostCapabilities (מול CRM, WhatsApp Green API, סוכני AI ובונה הדפים) - אפס Cross-Imports ישירים.
  4. תכנון עורך תבניות חכם (Bento Drag/Visual Email Editor) המשתלב עם אלמנטים של Page Builder.
  5. תכנון שרשרת אוטומציות רב-ערוצית (Email + WhatsApp + Trigger from Forms).
  6. תכנון מודלי AI (Gemini 3.8/3.5 Flash בלבד) ליצירת תוכן שיווקי, כותרות ממירות, וניתוח A/B Testing מבוסס Brand DNA.

### 2. Backend & Data Engineer (באקנד, חוזים ו-Firebase)
- תפקיד: הקמת שכבות הנתונים, השירותים, הפונקציות והאבטחה של המודול.
- חוקי ברזל נוקשים:
  1. מימוש types/, config/, services/firestoreService.ts, api/functionsApi.ts, ו-context/ModuleContext.tsx.
  2. אכיפת בידוד Multi-Tenancy מוחלט דרך useTenantScope().getScopedCollectionRef(...) - איסור מוחלט על קולקשנים שטוחים גלובליים.
  3. רישום הקולקשנים ב-src/core/contracts/collections.ts, ב-db-collections-hub/config/index.ts, וב-seedData.ts.
  4. שירות שליחת מיילים עם תמיכה ב-Providers (Resend / SendGrid / SMTP / Cloud Functions) עם Mock/Local fallback מלא.
  5. האזנה לאירועי EventBus: crm:lead:created, smart_form:submitted, campaign:ambassador:created, ושליחת אוטומציות בהתאם.
  6. איסור מוחלט על שמירת או שליפת מפתחות API ב-localStorage; שליפה אך ורק דרך tenantApiKeys.ts.

### 3. Frontend & UI Engineer (פרונטנד ומיתוג קושאן 2026)
- תפקיד: בניית ממשק המשתמש, הקומפוננטות, הניתוב הפנימי והאינטגרציה ל-Workbench.
- חוקי ברזל נוקשים:
  1. יישום מלא של סקיל מיתוג קושאן (cashwan-branding): עיצוב 2026, Mobile First, Bento Grid, ללא Sidebar (Top Nav בלבד), גופן Heebo בלעדי.
  2. איסור מוחלט על שימוש באימוג'י טקסטואליים - שימוש בלעדי באייקוני Lucide.
  3. עטיפה והקפדה על RTL מלא (<div dir="rtl" style="text-align: right;">) ללא שבירת רצף הקריאה.
  4. עורך קמפיינים ותבניות מודרני, מסך ניהול אוטומציות ויזואלי (Workflow Builder נקי ואינטואיטיבי).
  5. טולטיפים חכמים (i) מזעריים; הסתרת נתונים סטטיסטיים/גרפים באקורדיון נפתח כדי לשמור על מסך נקי ונושם.
  6. יצירת StandaloneView.tsx ורישום ב-src/workbench/moduleRegistry.ts אך ורק באמצעות טעינה עצלה (React.lazy).

### 4. Local QA & Security Gate Auditor (בדיקות איכות מקומיות)
- תפקיד: ביקורת איכות קפדנית, הרצת build, ואימות עמידה ב-5 שערי הביקורת של קושאן.
- חוקי ברזל נוקשים:
  1. מעבר קפדני וסימון וי (✅) על כל 5 שערי הביקורת ב-system_audit_workflow.md.
  2. ביצוע בדיקת קומפילציה נקייה עם npm run build - אפס שגיאות TypeScript/Vite/Rollup.
  3. בדיקת Zero Cross-Imports: לוודא שאף קובץ במודול לא מייבא ישירות מודול אח.
  4. בדיקת שגיאות בריצה: וידוא קיום ModuleErrorBoundary ו-Suspense.
  5. בדיקת תקינות מודלי AI (Gemini Flash מורשים בלבד, ללא שמות מומצאים).

### 5. Git Deployment & Live Online QA Engineer (שליחה לגיט ו-QA ברשת)
- תפקיד: הכנת גרסה, בדיקת git status, ביצוע commit ו-push, ובדיקת איכות של הרכיב החי ברשת.
- חוקי ברזל נוקשים:
  1. וידוא שכל הקבצים הדרושים נוספו ושאין קבצי זבל או secrets/keys שלא ב-.gitignore.
  2. ביצוע בדיקת build נוספת לפני commit.
  3. ביצוע git push לענף הרלוונטי.
  4. ביצוע Live QA ברשת (בדיקת כתובת האתר / סביבת הפרודקשן או Staging): אימות טעינת הדף, בדיקת קונסולת שגיאות בדפדפן, ובדיקת תגובתיות הרשת.

## Requirements

### R1. Specification & Architecture Document
Produce src/modules/smart-email-automation-hub/README.md and complete spec covering the 12-layer anatomy, multi-channel triggers, email template engine, and data contracts.

### R2. Isolated Multi-Tenant Backend & Event Synchronization
Implement backend services handling email campaigns, newsletter dispatches, automation trigger pipelines (listening to CRM leads, form submissions, and WhatsApp statuses), with tenant scoping and mock fallback.

### R3. 2026 Kosun Brand-Compliant UI & Visual Workflow Editor
Build visual campaign creator, email template builder, and automation workflow view matching Kosun 2026 Bento Grid, Top Nav, Heebo typography, strict RTL, zero emojis, and Collapsible stats.

### R4. AI Assistant Integration (Kosai Email Copilot)
Integrate Gemini AI copilot generating subject lines, body copy, and audience segmentation based on Brand DNA, with fallback cascade and token tracking.

### R5. Verification, Quality Gate Sign-Off & Remote Deployment
Run local npm run build, pass the 5 Audit Gates, push to Git, and verify the deployed remote application.

## Acceptance Criteria

### Spec & Standards Compliance
- [ ] Module spec created with all mandatory sections from component_spec_template.md.
- [ ] Zero direct cross-module imports detected in src/modules/smart-email-automation-hub/.
- [ ] Registered in src/workbench/moduleRegistry.ts using dynamic React.lazy().

### Backend & Integrations
- [ ] Scoped collection refs used for all Firestore persistence (mod_email_*).
- [ ] Integration with eventBus for CRM leads (crm:lead:created) and form submissions (smart_form:submitted).
- [ ] Zero localStorage API key usage; uses tenantApiKeys.ts.

### UI & Kosun 2026 Branding
- [ ] Full RTL wrapper applied with Hebrew text alignment.
- [ ] No textual emojis used in UI components (Lucide icons only).
- [ ] Heebo font family used throughout the module components.
- [ ] Top Nav and Bento Grid layout with no Sidebar menus.

### Verification & Deployment
- [ ] npm run build exits with code 0 without TypeScript errors.
- [ ] Git commit and push completed cleanly.
- [ ] Live online smoke test verifies that the module loads without runtime exceptions.


## 2026-10-11T11:33:55Z

עדכון קריטי במיתוג ושם הרכיב:
לפי חוקי המיתוג של קושאן (cashwan-branding / The Entity of Cashwan):
קושאן היא יישות חיה, אינטליגנטית ונושמת.
השם "קושאן" (Cashwan / Kosun) חייב להיות הכינוי המרכזי ושם הרכיב!
שם הרכיב והמודול נקרא:
- באנגלית/תיקייה: `cashwan-post-hub` או `cashwan-mail-flow` (שם תצוגה: "קושאן פוסט" / "קושאן דיוור ואוטומציה" - Cashwan Post).
- בטקסטים, ב-Placeholders, ובשפה של המערכת: קושאן הוא שותף אישי שלוקח אחריות ("קושאן דואג שהמייל יגיע ליעד", "קושאן מכין את הקמפיין הבא שלך").
נא לעדכן את האפיון, התיקיות, הקבצים והקוד לשם המותג של קושאן!


## 2026-10-11T11:34:47Z

עדכון קריטי ומחייב לגבי השם:
השם של המערכת והרכיב הוא אך ורק:
בעברית: "קושאן"
באנגלית: "kosun" (לא cashwan ולא שום תעתיק אחר!).

שם תיקיית המודול והרכיב:
`kosun-post-hub` (או `kosun-mail-flow`)
קידומות קולקשנים:
`mod_kosun_post_...`

בכל הממשק, בטקסטים, ב-Placeholders, ובשפה של המערכת: אך ורק "קושאן" או "Kosun" כיישות חיה ונושמת!
נא לוודא ששום קובץ או משתנה לא משתמש בשום מילה אחרת מלבד קושאן / kosun.


## 2026-10-11T11:37:29Z

הוראת שם חד-משמעית ומחייבת מהמשתמש:
שם הרכיב והמודול הוא אך ורק:
בעברית: "קושאן מייל אוטומטי"
באנגלית: "KOSUN AM" (קוד תיקייה/מזהה: `kosun-am` או `kosun-am-hub`)
קידומת קולקשנים: `mod_kosun_am_...`

נא לעדכן מיידית את כל הקבצים, התיקיות, האפיון, הרגיסטרציה וכלל הסוכנים לשם המדויק הזה:
"קושאן מייל אוטומטי" / "KOSUN AM".


## 2026-10-11T12:02:45Z

עדכון בסקיל המיתוג של קושאן (cashwan-branding / KOSUN Branding):
עודכן סעיף 1 בסקיל המיתוג:
חובה לכתוב תמיד:
- באנגלית: KOSUN (באותיות גדולות או כבסיס קבוע) עם צירוף מגניב וצעיר של שם הרכיב (למשל: KOSUN AM).
- בעברית: קושאן (למשל: קושאן מייל אוטומטי).
נא לוודא שכל הטקסטים והרכיבים עומדים בהגדרה הזו.
