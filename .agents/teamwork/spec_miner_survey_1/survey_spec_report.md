# דוח סקר מפרט וארכיטקטורה: קושאן מייל אוטומטי (KOSUN AM)
## Survey Specification & Architectural Discovery Report

<div dir="rtl" style="text-align: right;">

**תאריך ושעה:** 2026-10-11  
**מזהה מודול רשמי:** `kosun-am`  
**שם תצוגה בעברית:** "קושאן מייל אוטומטי"  
**שם תצוגה באנגלית:** "KOSUN AM"  
**נתיב תיקיית המודול:** `src/modules/kosun-am/`  
**קידומת קולקציות רשמית:** `mod_kosun_am_*`  
**סטטוס:** סקר מפרט מלא (Specification Survey Completed)

---

## 1. תקציר מנהלים וסקירת משימה
מטרת סקר זה היא מיפוי מלא, מדויק ובר-אימות של כלל הדרישות, התבניות, החוזים והשכבות המערכתיות הדרושות לבניית רכיב הדגל **"קושאן מייל אוטומטי" (KOSUN AM)**.
הרכיב מיועד לשליחת מיילים, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות חכמות ברמה העולה על Mailchimp, תוך שמירה הדוקה על עקרונות הליבה של קושאן 2026:
- בידוד מודולרי מוחלט (Zero Cross-Module Imports)
- תקשורת דרך EventBus ו-HostCapabilities בלבד
- בידוד דיירים (Multi-Tenant Scoping) תחת `tenants/{tenantId}/`
- אבטחת מפתחות דרך `tenantApiKeys.ts` (איסור מוחלט על שמירה ב-`localStorage`)
- מיתוג קושאן 2026: Mobile First, Bento Grid, Top Nav בלבד, גופן Heebo, RTL קפדני, אפס אימוג'ים טקסטואליים (אייקוני Lucide בלבד), נתונים סטטיסטיים באקורדיון מתקפל, וזהות חיה ונושמת של "קושאן".
- עמידה בכל 5 שערי הביקורת (5 Audit Gates).

---

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Architecture | אנטומיית 12 השכבות המודולרית | מבנה תיקיות וקבצים קשיח ומבודד תחת `src/modules/kosun-am/` הכולל את כל 12 השכבות התקניות | קבצי מודול, הגדרות ורכיבים | מודול עצמאי לחלוטין ללא תלות ישירה באחים | שגיאת קומפילציה או פסילה בשער 1 אם חסרה שכבה | `.gemini/rules/system_audit_workflow.md`, `src/modules/_template` |
| 2 | Architecture | Zero Cross-Imports | איסור מוחלט על ייבוא ישיר מתוך `src/modules/*` שכנים | ניתוח עץ ייבואים של TypeScript | אפס תלויות ישירות בין מודולים אחים | חסימה בשער ביקורת 1 | `system_audit_workflow.md` שער 1, `.gemini/rules.md` |
| 3 | Architecture | טעינה עצלה (Code Splitting) | רישום המודול ב-`src/workbench/moduleRegistry.ts` באמצעות `React.lazy()` בלבד | נתיב רכיב ומודול | Bundle נפרד שנטען רק לפי דרישה | כשל טעינה נתפס ע"י `ModuleErrorBoundary` ו-`Suspense` | `system_audit_workflow.md` שער 5, `moduleRegistry.ts` |
| 4 | Architecture | Standalone Runner | קובץ `StandaloneView.tsx` המספק עטיפת Provider, ניתובים פנימיים והרצה עצמאית | FirebaseApp (מארח או עצמאי) | ממשק רכיב פעיל מלא | מעבר למצב Mock/Offline אם אין חיבור | `src/modules/_template/StandaloneView.tsx`, `whatsapp-green-api-hub` |
| 5 | Multi-Tenancy | Scoped Collection Pattern | כתיבה וקריאה מ-Firestore אך ורק דרך `useTenantScope().getScopedCollectionRef(...)` תחת `tenants/{tenantId}/` | מזהה קולקציית מערכת, מזהה דייר | CollectionReference מבודד לדייר | חסימה קשיחה בשער 2 אם מתבצעת גישה לקולקציה גלובלית שטוחה | `src/core/tenant/TenantScopeContext.tsx`, `system_audit_workflow.md` שער 2 |
| 6 | Data Sync | סנכרון משולש של בסיס הנתונים | רישום מתואם של 4 קולקציות המודול ב-3 מוקדי מטא-דאטה מרכזיים | מזהי קולקציות, שמות, קטגוריות ו-Seed data | תאימות מלאה לסייר הנתונים ולמערכת הדגמה | אזהרת חוסר סנכרון ב-DB Hub | `src/core/contracts/collections.ts`, `db-collections-hub/config` |
| 7 | Security | אבטחת מפתחות API ללא LocalStorage | שליפת מפתחות צד-שלישי (Resend, SendGrid, Gemini) דרך `tenantApiKeys.ts` והגנה על הרשאות רכישה | `moduleId: 'kosun-am'`, הגדרות דייר | מפתחות מורשים או אובייקט ריק אם לא מורשה | אי-מתן מפתחות וחסימה אלגנטית במקרה של דייר שאינו מורשה | `src/core/connection/tenantApiKeys.ts`, שער 2 |
| 8 | EventBus | קליטת אירועי CRM וטפסים | האזנה לאירועים: `crm:lead:created`, `smart_form:submitted`, `campaign:ambassador:created`, `payment:completed` | אירועי מערכת אסינכרוניים | הפעלת אוטומציות מייל, שליחת קמפיינים ורישום לוגים | תפיסת שגיאות ב-try/catch של ה-Subscriber למניעת קריסת Bus | `src/core/contracts/index.ts`, `src/core/bridge/EventBus.ts` |
| 9 | EventBus | הפצת אירועי דיוור (Outbound Events) | הפצת אירועים כגון `email:campaign:sent`, `email:automation:triggered`, `email:delivery:failed` | תוצאות שליחה ושיגור | עדכון CRM, אנליטיקס וסטטיסטיקות מערכתיות | לוג שגיאות פנימי ואירוע כישלון למעקב | `CoreEventMap` ב-`src/core/contracts/index.ts` |
| 10 | Host Capabilities | Capability-Based DI | צריכת שירותי מערכת (`media-picker`, `lead-capture`, `notification`, `brand-dna`) דרך `useHostCapabilities()` | שם יכולת (CapabilityName) | ממשק השירות או null | מנגנון Graceful Fallback מקומי מובנה | `src/core/bridge/HostCapabilitiesContext.tsx` |
| 11 | Campaign Engine | ניהול קמפיינים וניוזלטרים | יצירה, עריכה, תזמון ושיגור קמפיינים של דיוור אלקטרוני וניוזלטרים | פרטי קמפיין, רשימת נמענים, תבנית, מועד שיגור | שיגור לרשימת תפוצה, רישום לוגים ועדכון סטטיסטיקות | מנגנון Retry, סימון סטטוס failed ותיעוד שגיאה בלוג | `ORIGINAL_REQUEST.md` R2, Mailchimp spec parity |
| 12 | Visual Editor | Bento Drag/Visual Email Editor | עורך תבניות חזותי מבוסס בלוקים מודולריים (Header, Hero, Text, CTA, Columns, Footer) | בלוקים גרפיים, טקסטים, קישורים | תבנית HTML רספונסיבית מעוצבת ו-JSON layout | ולידציה של שדות חובה, מניעת שבירת תצוגה במובייל | `ORIGINAL_REQUEST.md` R1/R3, `.gemini/templates` |
| 13 | Automations | Visual Workflow Builder | מסך ניהול ובניית תהליכי אוטומציה מרובי ערוצים (Trigger -> Filter/Condition -> Delay -> Action) | טריגרים (ליד חדש, טופס, רכישה), תנאים, צעדים | שרשרת פעולות אוטומטית (מייל, וואטסאפ, עדכון CRM) | עצירת השרשרת בצעד שנכשל ותיעוד התראה בלוג | `ORIGINAL_REQUEST.md` R2/R3 |
| 14 | Multi-Channel | אינטגרציית WhatsApp Green API | שילוב שליחת הודעות וואטסאפ כחלק משרשרת האוטומציה במקביל או בהמשך למייל | מספר טלפון, תבנית הודעה, משתנים דינמיים | שיגור דרך שירות Green API המתאים | Fallback לשליחת מייל בלבד ותיעוד כישלון וואטסאפ | `ORIGINAL_REQUEST.md` R2, `whatsapp-green-api-hub` |
| 15 | AI Copilot | Kosai Email Copilot (Gemini Flash) | סייען AI ליצירת כותרות מייל מושכות, כתיבת גוף ההודעה, הצעות סגמנטציה וניתוח A/B Testing | פרומפט משתמש, סגנון Brand DNA, מטרת הקמפיין | הצעות תוכן מובנות ב-JSON, וריאציות כותרת | מעבר אוטומטי בשרשרת Fallback (`gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.8-flash-lite`) | `system_audit_workflow.md` שער 3, `ORIGINAL_REQUEST.md` R4 |
| 16 | AI Cost Tracking | ניטור טוקנים וחישוב עלויות | חילוץ `usageMetadata` ממענה ה-AI וחישוב עלות מדויקת ב-$ וב-₪ | קלט ופלט טוקנים, שם מודל | דוח שימוש מעוצב `TokenUsageReport` | שימוש בתעריפי ברירת מחדל אם מודל אינו מוכר | `src/core/ai/geminiCostTracker.ts`, שער 3 |
| 17 | Provider Layer | מנוע ספקי דיוור עם Mock Fallback | שכבת שירותי שליחה התומכת ב-Resend, SendGrid, SMTP, Cloud Functions ובמצב Mock מלא | פרטי הודעה, מפתח ספק | תוצאת שליחה ו-messageId | במצב Offline / היעדר מפתח: סימולציית הצלחה ב-Mock Mode ללא קריסה | `ORIGINAL_REQUEST.md` כלל 4 בבאקנד |
| 18 | UI & Branding | מיתוג קושאן 2026 (Bento Grid) | פריסת כרטיסיות מודרניות, שטוחות ובעלות פינות מעוגלות עם Negative Space | נתוני קמפיינים ותבניות | ממשק הייטקיסטי נקי ומאוורר | התאמה רספונסיבית למובייל (Mobile First) | `cashwan-branding.md`, שער 4 |
| 19 | UI & Branding | ניווט Top Nav בלבד | איסור מוחלט על שימוש בתפריטי צד (Sidebars/Sliders) בתוך המודול | תפריט ניווט עליון | חוויית משתמש יוקרתית וחסכונית במקום | מסך מלא ללא תפיסת שטח צידי | `cashwan-branding.md`, שער 4 |
| 20 | UI & Branding | טיפוגרפיה Heebo ו-RTL קפדני | שימוש בלעדי בגופן Heebo ועטיפה מלאה ב-`<div dir="rtl" style="text-align: right;">` | טקסטים בעברית ובאנגלית | קריאות מושלמת ללא שבירת רצף הקריאה | מניעת היפוך סוגריים וסימני פיסוק | `cashwan-branding.md`, שער 4, `user_global` |
| 21 | UI & Branding | Zero Textual Emojis | איסור מוחלט על אימוג'ים טקסטואליים ושימוש בלעדי באייקוני Lucide | צורכי המחשה ויזואלית | ממשק יוקרתי, נקי ומקצועי לשנת 2026 | סינון מחמיר בביקורת קוד | `cashwan-branding.md` סעיף 8 |
| 22 | UI & Branding | Smart Tooltips מזעריים | כפתור מידע `(i)` עדין עם חלון הסבר הנפתח בלחיצה ונסגר בלחיצה מחוצה לו או ב-X | טקסט הסבר קצר וממוקד | כרטיסיית הסבר נקייה תומכת יום/לילה | מניעת כותרות ענק והסברים ארוכים בגוף המסך | `src/components/Ui/SmartTooltip.tsx`, שער 4 |
| 23 | UI & Branding | נתונים סטטיסטיים באקורדיון מתקפל | הסתרת כרטיסיות נתונים וגרפים כברירת מחדל תחת לשונית מתקפלת (Collapsible) | נתוני פתיחה, הקלקות, המרות | מסך נקי ופנוי ללא עומס מידע משני | פתיחה אך ורק לפי דרישת המשתמש | `cashwan-branding.md` סעיף 7 |
| 24 | UI & Branding | זהות "קושאן" כיישות חיה | שילוב שמו של "קושאן" כשותף אישי פעיל בטקסטים, ב-Placeholders ובדיאלוגים | טקסטים ממשקיים והודעות | תחושת שותף אינטליגנטי שלוקח אחריות | הימנעות משפה טכנית יבשה ומנוכרת | `cashwan-branding.md` סעיף 1, עדכון שמות |
| 25 | Resilience | עטיפת שגיאות עצמאית בריצה | עטיפת המודול והרכיבים ב-`ModuleErrorBoundary` וב-`Suspense` | חריגות או שגיאות ריצה בלתי צפויות | כרטיס שגיאה מקומי עם אפשרות ריענון ללא קריסת המערכת כולה | לוג שגיאה לקונסולה ותצוגת שחזור אלגנטית | `src/workbench/components/ModuleErrorBoundary.tsx`, שער 5 |

---

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Multi-Tenant Scoping | דייר רץ עם `tenantId` ריק או לא מוגדר | שימוש בפולבק בטוח ל-`ROOT_TENANT_ID` (`_master`) או מזהה הדומיין שחולץ |
| 2 | Firestore Data Layer | מסד נתונים במצב לא מקוון או חוסר הרשאות Firebase | מעבר חלק ל-Mock Data מובנה (`MOCK_CAMPAIGNS`, `MOCK_TEMPLATES`) ללא קריסת מסך |
| 3 | API Keys Resolution | דייר שטרם רכש את מודול `kosun-am` ניגש למסך | `isModuleEntitled('kosun-am')` מחזיר `false`, סודות מנוקים, מוצגת הודעת רכישה או מצב הדגמה |
| 4 | Gemini AI Generation | חריגה ממכסת קריאות (Quota 429) או Timeout ב-Gemini Flash | שרשרת Fallback מנסה אוטומטית את `gemini-3.5-flash` ולאחר מכן `gemini-3.8-flash-lite` |
| 5 | Visual Email Editor | טקסט עברי מעורב עם קישורים, משתנים באנגלית `{contact_name}` וקוד HTML | מעטפת ה-RTL שומרת על כיווניות נכונה ואינה משבשת סוגריים מסולסלים |
| 6 | Email Dispatch Provider | היעדר מפתחות API של Resend/SendGrid בקונפיגורציית הדייר | השירות פועל במצב סימולציה מקומית (Local Mock Dispatch) עם רישום לוג הצלחה מדומה |
| 7 | Automation Workflow | אירוע `crm:lead:created` מגיע ללא כתובת מייל תקינה | האוטומציה מסננת את הנמען, רושמת לוג אזהרה מפורט ב-`mod_kosun_am_logs` וממשיכה ללא קריסה |
| 8 | EventBus Decoupling | אירוע מפורסם כאשר אין מאזינים רשומים פעילים ב-Bus | פעולת `publish` מסתיימת באופן חלק ושקט ללא שגיאות |
| 9 | UI Viewports | פתיחת עורך הקמפיינים או האוטומציות במסך סמארטפון צר (Mobile Viewport) | Bento Grid מתכנס לעמודה אחת נקייה, אלמנטים משניים עוברים למודאלים, Top Nav נגיש |
| 10 | Secondary Stats Display | משתמש פותח את מסך הקמפיינים | נתוני הסטטיסטיקה מוסתרים בברירת מחדל; לחיצה על לשונית "הצג נתונים סטטיסטיים" מרחיבה את התצוגה |

---

## 2. פירוט אנטומיית 12 השכבות (The 12-Layer Anatomy Structure)
על פי הממצאים ב-`.gemini/rules/system_audit_workflow.md` ובתבנית `src/modules/_template`, מודול `kosun-am` חייב להכיל בדיוק את 12 השכבות הבאות:

```text
src/modules/kosun-am/
├── types/
│   └── index.ts                 # [שכבה 1] טיפוסים וממשקים מלאים ללא any (קמפיינים, תבניות, אוטומציות, לוגים)
├── config/
│   └── index.ts                 # [שכבה 2] מזהה מודול, קידומות mod_kosun_am_*, הגדרות ברירת מחדל
├── context/
│   └── ModuleContext.tsx        # [שכבה 3] ניהול State מרכזי, Scoped Firestore, Mock Fallback, ו-DI
├── hooks/
│   ├── useKosunAmData.ts        # [שכבה 4] הוקים פנימיים לשליפת וסנכרון נתונים
│   └── useKosunAmActions.ts     # הוקים לפעולות שיגור, יצירה ועריכה
├── services/
│   ├── emailFirestoreService.ts # [שכבה 5] שכבת נתוני Firestore עם Tenant Scoping ו-Mock Data
│   ├── emailDispatchService.ts  # שירות שליחת מיילים עם תמיכה בריבוי ספקים ו-Mock fallback
│   └── kosaiEmailAiService.ts   # שירות AI עם מודלי Gemini Flash ו-Fallback Cascade
├── api/
│   └── functionsApi.ts          # [שכבה 6] קריאות ל-Cloud Functions ופרוקסי מאובטח
├── prompts/
│   └── index.ts                 # [שכבה 7] פרומפטים מודולריים, סכמות JSON והנחיות Brand DNA
├── routes/
│   └── ModuleRoutes.tsx         # [שכבה 8] ניתוב פנימי מודולרי ("", "new", ":id", "templates", "automations")
├── components/
│   ├── KosunAmMainView.tsx      # [שכבה 9] תצוגת Bento ראשית, Top Nav פנימי, אקורדיון סטטיסטיקות
│   ├── EmailEditorModal.tsx     # עורך תבניות חזותי מבוסס בלוקים
│   ├── AutomationBuilderView.tsx# בונה תהליכי אוטומציה ויזואלי
│   ├── CampaignListCard.tsx     # כרטיסיית קמפיין בסגנון Bento
│   └── DeliveryLogsDrawer.tsx   # מגירת לוגים ודוחות שליחה
├── StandaloneView.tsx           # [שכבה 10] נקודת כניסה עצמאית ל-Workbench וחיבור FirebaseApp
├── index.ts                     # [שכבה 10] Barrel Export המייצא טיפוסים, קונפיג, קונטקסט ותצוגה
├── README.md                    # [שכבה 10] תיעוד המודול, הוראות הטמעה וחוקי אבטחה
├── .gemini/
│   ├── rules.md                 # [שכבה 11] חוקי בידוד, Zero Cross-Imports ו-Tenant Scoping
│   └── skills.md                # [שכבה 11] כישורי סוכן, צ'קליסט ביקורת ויכולות ליבה
└── scripts/
    └── .gitkeep                 # [שכבה 12] סקריפטים מקומיים לאוטומציה ותחזוקת המודול בלבד
```

---

## 3. מבנה מסמך האפיון לפי התבנית הרשמית
על בסיס `.gemini/templates/component_spec_template.md`, מסמך האפיון המלא של הרכיב חייב לכלול 8 פרקים מחייבים:
1. **פרטים כלליים (General Information):**
   - שם המודול: `kosun-am`
   - שם תצוגה בעברית: קושאן מייל אוטומטי (KOSUN AM)
   - תיאור ומטרה: מערכת דיוור, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות
   - קידומת אוספים: `mod_kosun_am_`
2. **מבנה נתוני Firestore (Collections & Data Schema):**
   - `mod_kosun_am_campaigns`: קמפיינים שיווקיים וניוזלטרים
   - `mod_kosun_am_templates`: תבניות מייל מעוצבות
   - `mod_kosun_am_automations`: תהליכי אוטומציה וטריגרים
   - `mod_kosun_am_logs`: יומן שיגור, תוצאות ואירועי מסירה
3. **ממשק משתמש ומסכים (UI Views & Tailwind Layout):**
   - מסך ראשי (Bento Dashboard View): כרטיסיות קמפיינים, כפתורי יצירה, ואקורדיון מתקפל לסטטיסטיקות.
   - מסך עורך תבניות (Visual Email Editor): עריכת בלוקים, תצוגה מקדימה במובייל ודסקטופ.
   - מסך בונה אוטומציות (Visual Workflow Builder): חיבור טריגרים, שלבי השהייה ופעולות מייל/וואטסאפ.
4. **ניתובים פנימיים (Internal Sub-routes):**
   - `""` -> מסך ראשי / לוח בקרה
   - `"campaigns/new"` -> יצירת קמפיין חדש
   - `"campaigns/:id"` -> עריכת קמפיין קיים
   - `"templates"` -> ניהול תבניות
   - `"templates/editor"` -> עורך תבניות חזותי
   - `"automations"` -> ניהול בונה האוטומציות
   - `"logs"` -> דוחות ויומני שיגור
5. **שכבת API ופונקציות ענן (Firebase Cloud Functions / Backend):**
   - פונקציות `dispatchEmailCampaign`, `triggerEmailAutomation`, `verifyEmailDomain`
6. **פרומפטים והגדרות AI (Prompts & LLM Settings):**
   - מודל `gemini-3.8-flash` כברירת מחדל עם סייען Kosai Email Copilot
   - שרשרת Fallback: `gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.8-flash-lite`
   - חישוב עלויות דרך `calculateGeminiCost`
7. **חוקי אבטחה של פיירבייס (Firestore Security Rules):**
   - הרשאות קריאה וכתיבה תחת `tenants/{tenantId}/mod_kosun_am_*` רק למשתמשים מורשים של הדייר
8. **משתני סביבה נדרשים ב-.env:**
   - משתני Firebase, VITE_FUNCTIONS_BASE_URL, ומשתני AI

---

## 4. חמשת שערי הביקורת וקריטריוני הקבלה (The 5 Audit Gates)
על בסיס `system_audit_workflow.md`:

### שער 1: ארכיטקטורה וגבולות מודולריים (Modular Boundaries Gate)
- קיום מלא של 12 השכבות תחת `src/modules/kosun-am/`.
- אפס ייבואים חוצי מודולים (Zero Cross-Imports).
- שימוש בלעדי ב-`useHostCapabilities()` לקבלת יכולות חיצוניות עם פולבק מקומי.
- שימוש בלעדי ב-`eventBus` לתקשורת אסינכרונית.

### שער 2: בידוד נתונים ו-Multi-Tenancy (Data Isolation Gate)
- שימוש ב-`useTenantScope().getScopedCollectionRef(...)` לכל גישה ל-Firestore.
- רישום הקולקציות ב-`SYSTEM_COLLECTIONS` (`src/core/contracts/collections.ts`).
- רישום מטא-דאטה ואייקון ב-`PREDEFINED_COLLECTIONS` (`src/modules/db-collections-hub/config/index.ts`).
- הזנת נתוני Seed ב-`PROJECT_SEED_DATA` (`src/modules/db-collections-hub/config/seedData.ts`).
- איסור מוחלט על שמירה או שליפה מ-`localStorage`; שליפת מפתחות דרך `tenantApiKeys.ts`.

### שער 3: בינה מלאכותית ו-Gemini Standards (AI Standards Gate)
- שימוש במודלים רשמיים בלבד: `gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.8-flash-lite`.
- שרשרת גיבוי אוטומטית (Fallback Cascade) למניעת קריסה בעת עומס.
- חישוב עלות וטוקנים דרך `calculateGeminiCost` (`src/core/ai/geminiCostTracker.ts`).
- פלט עברית תקין ב-RTL מלא בטון של יישות קושאן.

### שער 4: מיתוג קושאן וחוויית משתמש 2026 (Kosun 2026 UI Gate)
- Mobile First ופריסת Bento Grid נקייה ללא עומס ויזואלי.
- ניווט עליון בלבד (Top Nav) - ללא תפריטי צד (Sidebars).
- שימוש בלעדי בגופן Heebo.
- טולטיפים חכמים מזעריים `(i)` הנסגרים בלחיצה מחוצה להם (`SmartTooltip.tsx`).
- נתונים סטטיסטיים מוסתרים בברירת מחדל באקורדיון מתקפל.
- אפס אימוג'ים טקסטואליים - שימוש בלעדי באייקוני Lucide.
- תמיכה מלאה במצב יום ולילה (Light/Dark mode) עם קונטרסט גבוה.
- שמירה מלאה על לוגיקה עסקית ומזהי selectors.

### שער 5: יציבות ריצה, ביצועים ובדיקת Build (Resilience & Build Gate)
- בידוד שגיאות בריצה עם `ModuleErrorBoundary` ו-`Suspense`.
- טעינה עצלה ברישום ב-`moduleRegistry.ts` באמצעות `React.lazy()`.
- קומפילציה נקייה עם `npm run build` (0 שגיאות TypeScript/Vite/Rollup).
- התאמה לסקריפט הייצוא `scripts/export-client-platform.js`.

---

## 5. ממשקי אינטגרציה וחוזים מערכתיים

### 5.1 מילון הקולקציות (`src/core/contracts/collections.ts`)
יש להוסיף ל-`SYSTEM_COLLECTIONS`:
```typescript
KOSUN_AM_CAMPAIGNS: 'mod_kosun_am_campaigns',
KOSUN_AM_TEMPLATES: 'mod_kosun_am_templates',
KOSUN_AM_AUTOMATIONS: 'mod_kosun_am_automations',
KOSUN_AM_LOGS: 'mod_kosun_am_logs',
```

### 5.2 סייר הנתונים (`src/modules/db-collections-hub/config/index.ts`)
יש להוסיף ל-`PREDEFINED_COLLECTIONS`:
- `mod_kosun_am_campaigns`: קמפיינים שיווקיים וניוזלטרים (אייקון `Mail`)
- `mod_kosun_am_templates`: תבניות דיוור חכמות (אייקון `LayoutTemplate`)
- `mod_kosun_am_automations`: תהליכי אוטומציה רב-ערוציים (אייקון `Workflow`)
- `mod_kosun_am_logs`: יומן דיוור ואירועי מסירה (אייקון `History`)

### 5.3 נתוני הדגמה (`src/modules/db-collections-hub/config/seedData.ts`)
יש להוסיף רשומות הדגמה ריאליסטיות תחת כל אחד מ-4 המזהים הנ"ל.

### 5.4 רישום ב-Workbench (`src/workbench/moduleRegistry.ts`)
יש להוסיף טעינה עצלה:
```typescript
const KosunAmStandaloneView = React.lazy(() =>
  import('../modules/kosun-am').then((m) => ({ default: m.KosunAmStandaloneView }))
);
```
והגדרה ב-`REGISTERED_MODULES`:
```typescript
{
  id: 'kosun-am',
  name: 'קושאן מייל אוטומטי - KOSUN AM',
  description: 'מערכת דיוור, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות חכמות מבוססות AI ו-EventBus.',
  component: KosunAmStandaloneView,
  route: '/kosun-am',
  collectionPrefix: 'mod_kosun_am_',
}
```

### 5.5 רישום מפתחות וניתוב (`src/core/connection/tenantApiKeys.ts`)
יש להוסיף מיפוי ב-`ROUTE_TO_MODULE`:
```typescript
['/kosun-am', 'kosun-am'],
```

### 5.6 רישום בפלטפורמת לקוח (`src/modules/client-receiver-platform/config/index.ts`)
יש להוסיף את המודול לרשימת `MASTER_AVAILABLE_MODULES`.

---

## 6. מסקנות והמלצות להמשך עבודת הצוות
1. **ארכיטקטורה מוצקה:** כל התשתיות (EventBus, HostCapabilities, TenantScope, TenantApiKeys, SmartTooltip, ModuleErrorBoundary) קיימות ובשלות ב-`src/core/` וב-`src/workbench/`.
2. **אפס חריגות מיתוג:** חובה להקפיד על שם המותג המדויק: עברית "קושאן מייל אוטומטי", אנגלית "KOSUN AM", תיקייה `src/modules/kosun-am/`, וקידומת `mod_kosun_am_*`.
3. **הפרדת תפקידים נקייה:**
   - ארכיטקט המפרט: יצירת `src/modules/kosun-am/README.md` ומפרט מלא לפי 8 הפרקים.
   - מהנדס הבאקנד: הקמת `types/`, `config/`, `services/`, `api/`, `context/`, וסנכרון משולש ב-DB Hub.
   - מהנדס הפרונטנד: הקמת רכיבי ה-UI (Bento Grid, Top Nav, Heebo, RTL, Collapsible stats, Lucide icons בלבד, עורך ויזואלי ובונה אוטומציות).
   - מבקר האיכות: הרצת `npm run build`, בדיקת 5 שערי הביקורת, ווידוא Zero Cross-Imports.

</div>
