# Dispatch Log

## 2026-10-11T11:34:04Z
You are the Project Orchestrator for the Smart Email & Multi-Channel Automation Hub module in c:\comona.

Working directory: c:\comona\.agents\teamwork\orchestrator_main
Original Request File: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
Project Root: c:\comona

Read c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately for the full specification, roles, strict rules, and acceptance criteria.

Summary of objectives & constraints:
1. Component Spec Architect:
   - Create complete specification and plan matching .gemini/templates/component_spec_template.md under src/modules/smart-email-automation-hub/README.md.
   - Anatomy of 12 layers under src/modules/smart-email-automation-hub/.
   - Scoped collection prefixes: mod_email_campaigns, mod_email_templates, mod_email_automations, mod_email_logs.
   - EventBus and HostCapabilities integration (zero direct cross-module imports).
   - Bento Drag/Visual Email Editor compatible with Page Builder.
   - Multi-channel automation pipeline (Email + WhatsApp + Form Triggers).
   - AI Copilot using Gemini Flash models (e.g. Gemini 3.8 / 3.5 Flash) with Brand DNA.

2. Backend & Data Engineer:
   - Complete types/, config/, services/firestoreService.ts, api/functionsApi.ts, context/ModuleContext.tsx.
   - Strict Multi-Tenancy isolation using useTenantScope().getScopedCollectionRef(...).
   - Collection registration in src/core/contracts/collections.ts, db-collections-hub/config/index.ts, and seedData.ts.
   - Email dispatch service with providers (Resend / SendGrid / SMTP / Cloud Functions) + Mock/Local fallback.
   - EventBus event listeners (crm:lead:created, smart_form:submitted, campaign:ambassador:created).
   - Zero localStorage API keys (use tenantApiKeys.ts).

3. Frontend & UI Engineer:
   - Kosun 2026 Branding (cashwan-branding): Mobile First, Bento Grid, Top Nav only (no sidebar), Heebo font.
   - Zero textual emojis (Lucide icons only).
   - Strict RTL wrapper: <div dir="rtl" style="text-align: right;">.
   - Clean visual workflow builder and campaign editor.
   - Minimal smart tooltips (i), collapsible accordion stats/graphs.
   - StandaloneView.tsx and lazy registration in src/workbench/moduleRegistry.ts.

4. Local QA & Security:
   - All 5 audit gates in system_audit_workflow.md.
   - Clean npm run build (0 errors).
   - Zero cross-module imports.
   - ErrorBoundary and Suspense.

5. Git & Deployment:
   - Commit & push clean files.
   - Live smoke verification.

Maintain your progress.md and BRIEFING.md in your working directory at c:\comona\.agents\teamwork\orchestrator_main. Update progress.md frequently so the sentinel monitoring crons can track your progress.
When all phases and acceptance criteria are fully met, send a message to the Sentinel claiming victory.


## 2026-10-11T11:34:42Z
עדכון דחוף וקריטי מבעל הפרויקט לגבי מיתוג ושם הרכיב:
לפי חוקי המיתוג של קושאן (cashwan-branding / The Entity of Cashwan):
קושאן היא יישות חיה, אינטליגנטית ונושמת.
השם "קושאן" (Cashwan / Kosun) חייב להיות הכינוי המרכזי ושם הרכיב!
שם הרכיב והמודול נקרא:
- באנגלית/תיקייה: `cashwan-post-hub` או `cashwan-mail-flow` (שם תצוגה: "קושאן פוסט" / "קושאן דיוור ואוטומציה" - Cashwan Post).
- בטקסטים, ב-Placeholders, ובשפה של המערכת: קושאן הוא שותף אישי שלוקח אחריות ("קושאן דואג שהמייל יגיע ליעד", "קושאן מכין את הקמפיין הבא שלך").
נא לעדכן את האפיון, התיקיות, הקבצים והקוד לשם המותג של קושאן!
קובץ ORIGINAL_REQUEST.md עודכן גם הוא בהתאם.


## 2026-10-11T11:35:02Z
עדכון קריטי ומחייב לגבי השם (גובר על כל הנחיה קודמת):
השם של המערכת והרכיב הוא אך ורק:
בעברית: "קושאן"
באנגלית: "kosun" (לא cashwan ולא שום תעתיק אחר!).

שם תיקיית המודול והרכיב:
`kosun-post-hub` (או `kosun-mail-flow`)
קידומות קולקשנים:
`mod_kosun_post_...`

בכל הממשק, בטקסטים, ב-Placeholders, ובשפה של המערכת: אך ורק "קושאן" או "Kosun" כיישות חיה ונושמת!
נא לוודא ששום קובץ או משתנה לא משתמש בשום מילה אחרת מלבד קושאן / kosun.
הקובץ ORIGINAL_REQUEST.md עודכן בהתאם.


## 2026-10-11T11:38:00Z
הוראה חד-משמעית ומחייבת מבעל הפרויקט לגבי השם הסופי והרשמי (חלה על כל האפיון, הקוד, התיקיות והקולקשנים):

שם הרכיב והמודול הוא אך ורק:
בעברית: "קושאן מייל אוטומטי"
באנגלית: "KOSUN AM" (קוד תיקייה/מזהה: `kosun-am` או `kosun-am-hub`)
קידומת קולקשנים: `mod_kosun_am_...`

נא לעדכן מיידית את תוכנית העבודה (PROJECT.md), את כל הסוכנים הפעילים, את האפיון, את שמות התיקיות, הקבצים, הרישום ב-moduleRegistry, והקולקשנים לשם המדויק הזה:
"קושאן מייל אוטומטי" / "KOSUN AM".
הקובץ ORIGINAL_REQUEST.md עודכן בהתאם.


## 2026-10-11T12:02:58Z
עדכון בסקיל המיתוג של קושאן (cashwan-branding / KOSUN Branding):
עודכן סעיף 1 בסקיל המיתוג:
חובה לכתוב תמיד:
- באנגלית: KOSUN (באותיות גדולות או כבסיס קבוע) עם צירוף מגניב וצעיר של שם הרכיב (למשל: KOSUN AM).
- בעברית: קושאן (למשל: קושאן מייל אוטומטי).
נא לוודא שכל הטקסטים והרכיבים עומדים בהגדרה הזו.
הקובץ ORIGINAL_REQUEST.md עודכן בהתאם.


## 2026-10-11T12:28:57Z
הוראת חוק ברזל נוקשת, מיידית ומחייבת מבעל הפרויקט (גוברת על כל הנחיה קודמת):
1. איסור מוחלט על נתוני דמה (Zero Mock Data)!
2. איסור מוחלט על שימוש ב-localStorage / sessionStorage לשמירה או שליפה של נתונים או מפתחות.
3. הכל חייב להיות מחובר תמיד ובאופן ישיר ל-DB / Firestore האמיתי! (Real Database בלבד).
4. חוקי הפרויקט (modular_component_standards ו-system_audit_workflow) עודכנו כעת בהתאם.

פעולה נדרשת באופן מיידי:
להסיר מידית כל שכבת mock fallback, mock emails, mock data מ-emailDispatchService, emailFirestoreService, ModuleContext ומכל קובץ במודול kosun-am.
לוודא שכל קריאה, שליחה, האזנה וכתיבה מתבצעת אך ורק מול ה-Firestore האמיתי והשירותים האמיתיים!
הקובץ ORIGINAL_REQUEST.md עודכן בהתאם. נא להנחות מידית את כל הסוכנים הפעילים.
