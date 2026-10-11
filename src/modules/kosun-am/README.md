<div dir="rtl" style="text-align: right;">

# תבנית אפיון קומפוננטה: קושאן מייל אוטומטי (KOSUN AM)
## Smart Email & Multi-Channel Marketing Automation Hub

---

## 1. פרטים כלליים (General Information)
- **שם הקומפוננטה (באנגלית, באותיות קטנות עם מקפים):** `kosun-am`
- **שם תצוגה בעברית:** קושאן מייל אוטומטי (KOSUN AM)
- **שם תצוגה באנגלית:** KOSUN AM (Smart Email & Multi-Channel Automation Hub)
- **תיאור ומטרת הקומפוננטה:**  
  רכיב דגל מתקדם לשליחת מיילים, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות (Email + WhatsApp Green API + CRM + Page Builder), העולה ביכולותיו על Mailchimp. הרכיב מעוצב בסטנדרט 2026 של קושאן (Mobile First, Bento Grid, Top Nav, Heebo, ללא אימוג'ים טקסטואליים), ופועל כיישות חיה, אינטליגנטית ונושמת בליווי סייען ה-AI קוסאי (Kosai Email Copilot). הרכיב מבודד ארכיטקטונית ומסונכרן באופן מלא ומבוסס EventBus בלבד (אפס Cross-Imports ישירים) עם רכיבי המערכת השונים: CRM (אנשי קשר ולידים), קבוצות וואטסאפ (WhatsApp Green API), סוכני ה-AI (Kosai Engine), ובונה האתרים ודפי הנחיתה (Page Builder).
- **קידומת אוספים ברירת מחדל (Default Collection Prefix):** `mod_kosun_am_`

---

## 2. מבנה נתוני Firestore (Collections & Data Schema)

כלל הנתונים נשמרים תחת בידוד Multi-Tenancy מוחלט בנתיב המבודד:  
`tenants/{tenantId}/{collectionName}/{docId}`  
באמצעות `useTenantScope().getScopedCollectionRef(...)`. חל איסור מוחלט על קולקציות שטוחות גלובליות.

### אוסף ראשי 1: `mod_kosun_am_campaigns`
ניהול קמפיינים שיווקיים, ניוזלטרים, מועדי שיגור, פילוח קהלי יעד ומדדי ביצוע.
- **id** (`string`): מזהה ייחודי של הקמפיין (`cmp_...`).
- **name** (`string`): שם הקמפיין הפנימי (למשל: "ניוזלטר השקת קולקציית קיץ").
- **subject** (`string`): שורת הנושא של המייל.
- **preheader** (`string`, אופציונלי): טקסט מקדים המוצג בתיבת הדואר הנכנס.
- **fromName** (`string`): שם השולח המוצג (ברירת מחדל: "קושאן").
- **fromEmail** (`string`): כתובת אימייל השולח.
- **replyTo** (`string`, אופציונלי): כתובת למענה.
- **templateId** (`string`, אופציונלי): מזהה תבנית מעוצבת משויכת מ-`mod_kosun_am_templates`.
- **htmlContent** (`string`): תוכן ה-HTML המלא של האימייל לאחר עיבוד והזרקת משתנים.
- **status** (`'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed'`): סטטוס מחזור חיי הקמפיין.
- **audience** (`object`): הגדרת קהל היעד:
  - `type` (`'all' | 'segment' | 'crm_group' | 'tags' | 'manual'`): סוג הפילוח.
  - `crmGroupIds` (`string[]`, אופציונלי): מזהי קבוצות מתוך ה-CRM.
  - `tags` (`string[]`, אופציונלי): תגיות לידים לסינון.
  - `manualEmails` (`string[]`, אופציונלי): רשימת מיילים ידנית.
- **scheduledAt** (`string`, אופציונלי ISO 8601): מועד שיגור מתוזמן.
- **sentAt** (`string`, אופציונלי ISO 8601): מועד שיגור בפועל.
- **stats** (`object`): מדדי שיגור ומסירה:
  - `totalRecipients` (`number`): סך נמענים יעד.
  - `deliveredCount` (`number`): נמסרו בהצלחה.
  - `openedCount` (`number`): מיילים שנפתחו.
  - `clickedCount` (`number`): הקלקות על קישורים.
  - `bouncedCount` (`number`): מיילים שחזרו (Bounce).
  - `unsubscribedCount` (`number`): בקשות הסרה מרשימת תפוצה.
- **provider** (`'resend' | 'sendgrid' | 'functions_smtp' | 'mock_local'`): ספק השיגור ששימש להפצה.
- **createdAt** (`string` ISO 8601): תאריך יצירה.
- **updatedAt** (`string` ISO 8601): תאריך עדכון אחרון.
- **createdById** (`string`): מזהה המשתמש שיצר את הקמפיין.

---

### אוסף ראשי 2: `mod_kosun_am_templates`
ספריית תבניות אימייל מעוצבות, בלוקים ויזואליים ועיצוב תואם Brand DNA.
- **id** (`string`): מזהה ייחודי של התבנית (`tpl_...`).
- **name** (`string`): שם התבנית (למשל: "תבנית ברוכים הבאים מודרנית").
- **description** (`string`, אופציונלי): תיאור קצר ומטרת התבנית.
- **category** (`'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'event'`): קטגוריית התבנית.
- **thumbnailUrl** (`string`, אופציונלי): תמונת תצוגה מקדימה.
- **blocks** (`EmailBlockConfig[]`): מערך בלוקים מודולרי של עורך הבנטו:
  - `id` (`string`): מזהה הבלוק.
  - `type` (`'header' | 'hero' | 'bento-grid' | 'rich-text' | 'button-cta' | 'whatsapp-link' | 'divider' | 'footer'`): סוג הבלוק.
  - `content` (`Record<string, any>`): נתוני הבלוק (כותרות, טקסטים, צבעים, קישורים, תמונות).
  - `styles` (`Record<string, any>`, אופציונלי): סגנונות מותאמים אישית (ריווחים, צבע רקע).
- **htmlSnapshot** (`string`): ייצוג HTML מלא ורספונסיבי המוכן לשליחה.
- **variables** (`string[]`): רשימת משתני פרסונליזציה דינמיים הנתמכים בתבנית (כגון: `{{contact_name}}`, `{{business_name}}`).
- **isDefault** (`boolean`): האם התבנית מוגדרת כתבנית ברירת מחדל של המערכת.
- **createdAt** (`string` ISO 8601): תאריך יצירה.
- **updatedAt** (`string` ISO 8601): תאריך עדכון אחרון.

---

### אוסף ראשי 3: `mod_kosun_am_automations`
תזרימי עבודה רב-ערוציים (Workflows) המופעלים אוטומטית מאירועי EventBus: טפסים, לידים, שגרירים ותשלומים.
- **id** (`string`): מזהה ייחודי של האוטומציה (`aut_...`).
- **name** (`string`): שם האוטומציה (למשל: "סדרת קליטת ליד חדש + וואטסאפ").
- **description** (`string`, אופציונלי): תיאור תהליך האוטומציה.
- **isActive** (`boolean`): האם האוטומציה פעילה ומאזינה לאירועים.
- **trigger** (`object`): הגדרת אירוע הטריגר:
  - `event` (`'crm:lead:created' | 'smart_form:submitted' | 'campaign:ambassador:created' | 'payment:completed' | 'manual:subscribed'`): נושא האירוע ב-EventBus.
  - `filterCondition` (`object`, אופציונלי): סינון מותנה (למשל: `source == 'landing-page'`, `tag == 'vip'`).
- **steps** (`AutomationStepConfig[]`): שרשרת הצעדים בתהליך:
  - `id` (`string`): מזהה הצעד.
  - `order` (`number`): מיקום סידורי בשרשרת.
  - `type` (`'delay' | 'send_email' | 'send_whatsapp' | 'update_crm_lead' | 'condition'`): סוג הפעולה.
  - `delayMinutes` (`number`, אופציונלי): זמן השהיה בדקות לפני ביצוע הצעד הבא.
  - `emailConfig` (`object`, אופציונלי): פרטי שליחת אימייל (תבנית, נושא, שולח).
  - `whatsAppConfig` (`object`, אופציונלי): פרטי שליחת הודעת וואטסאפ דרך Green API (תבנית טקסט).
  - `crmConfig` (`object`, אופציונלי): עדכון שדות ותגיות ב-CRM.
- **executionCount** (`number`): מונה כמות ההפעלות הכוללת של האוטומציה.
- **lastExecutedAt** (`string`, אופציונלי ISO 8601): תאריך הפעלה אחרון.
- **createdAt** (`string` ISO 8601): תאריך יצירה.
- **updatedAt** (`string` ISO 8601): תאריך עדכון.

---

### אוסף ראשי 4: `mod_kosun_am_logs`
יומן שיגור מלא, סטטוסי קבלה, שגיאות ספקים ואירועי מסירה.
- **id** (`string`): מזהה הלוג (`log_...`).
- **campaignId** (`string`, אופציונלי): מזהה הקמפיין הרלוונטי.
- **automationId** (`string`, אופציונלי): מזהה האוטומציה שהפעילה את השליחה.
- **recipientEmail** (`string`): כתובת אימייל הנמען.
- **subject** (`string`): נושא ההודעה שנשלחה.
- **status** (`'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'simulated_success'`): סטטוס המסירה.
- **provider** (`'resend' | 'sendgrid' | 'functions_smtp' | 'mock_local'`): ספק השיגור בפועל.
- **messageId** (`string`): מזהה השיגור שהוחזר מהספק.
- **errorMessage** (`string`, אופציונלי): פירוט השגיאה אם השליחה נכשלה.
- **dispatchedAt** (`string` ISO 8601): מועד השיגור.
- **metadata** (`Record<string, any>`, אופציונלי): מטא-דאטה נוסף (ערוץ, IP, פרטי דפדפן).

---

## 3. ממשק משתמש ומסכים (UI Views & Tailwind Layout)

עיצוב הממשק מבוסס במלואו על עקרונות **מיתוג קושאן 2026 (Kosun 2026 Branding)**:
- **Mobile First ו-Negative Space:** מסכים נושמים ומאווררים, נטולי עומס ויזואלי.
- **Bento Grid Layout:** כרטיסיות נקיות, שטוחות, בעלות פינות מעוגלות מודרניות (`rounded-3xl` ו-`rounded-2xl`).
- **ניווט עליון בלבד (Top Nav Only):** איסור מוחלט על תפריטי צד (Sidebars/Sliders).
- **גופן Heebo בלבד:** שימוש אקסקלוסיבי ב-`font-heebo`.
- **איסור מוחלט על אימוג'י טקסטואליים:** שימוש בלעדי בספריית **Lucide Icons** (`Mail`, `Send`, `Sparkles`, `Workflow`, `Layout`, `ChevronDown`, `ChevronUp`, `Info`, `X`).
- **עטיפת RTL מוחלטת:** עטיפה מחייבת ב-`<div dir="rtl" style="text-align: right;">` למניעת שיבוש קריאה במונחים מעורבים.
- **אקורדיון סטטיסטיקות מתקפל (Collapsible Stats):** נתונים סטטיסטיים וגרפים מוסתרים בברירת מחדל באקורדיון מתקפל ("קושאן מציג נתונים וביצועים (לחץ לפתיחה)"), ונפתחים רק לפי בקשת המשתמש.
- **טולטיפים חכמים מזעריים `(i)`:** החלפת טקסטים ארוכים וכותרות ענק באייקון `(i)` עדין הנפתח בלחיצה ונסגר בלחיצה מחוצה לו.
- **שפת יישות "קושאן":** שותף אישי שלוקח אחריות ("קושאן דואג שהמייל יגיע ליעד", "קושאן מכין את הקמפיין הבא שלך").

### מסך 1: לוח בקרה ראשי ורשימת קמפיינים (`KosunAmMainView.tsx`)
- כותרת עליונה בסגנון קושאן עם מיתוג "קושאן מייל אוטומטי - KOSUN AM" ושותף אישי.
- תפריט ניווט עליון פנימי נקי (Top Nav) למעבר בין קמפיינים, תבניות, אוטומציות ויומני שיגור.
- אקורדיון מתקפל לנתונים סטטיסטיים (סה״כ נמענים, פתיחות, הקלקות, מסירות) השומר על מסך מאוורר.
- גריד בנטו (Bento Grid) המציג את כרטיסיות הקמפיינים עם סטטוס חי, מועד שיגור, כפתור שליחה מיידית ועריכה.
- כפתור הנעה לפעולה בולט: "קושאן מכין קמפיין חדש" לפתיחת יצירה.

### מסך 2: עורך תבניות אימייל ויזואלי (`EmailEditorModal.tsx`)
- מודאל קופץ מרווח ומאוורר לעריכת תוכן בלוקים של אימייל בסגנון Page Builder.
- בלוקים נתמכים: כותרת ולוגו, Hero באנר, כרטיסיות בנטו, טקסט עשיר, כפתור CTA, קישור לוואטסאפ Green API ופוטר הסרה.
- שילוב סייען ה-AI קוסאי (Kosai Email Copilot) ליצירת שורות נושא ממירות ותוכן שיווקי בלחיצה אחת.
- תצוגה מקדימה במובייל ודסקטופ בזמן אמת.

### מסך 3: בונה תהליכי אוטומציה רב-ערוצי (`AutomationBuilderView.tsx`)
- ממשק Pipeline חזותי ונקי המחבר שרשרת צעדים: טריגר (טופס/ליד) -> השהיה (Delay) -> שליחת מייל -> שליחת הודעת וואטסאפ -> עדכון CRM.
- מתג הפעלה/השהיה של תהליך האוטומציה.
- הצגת מונה הרצות נקי וחיווי תקינות.

### מסך 4: מגירת יומני שיגור ומסירה (`DeliveryLogsDrawer.tsx`)
- מגירה צדדית נשלפת (Drawer) או מודאל Bento לבדיקת היסטוריית השיגורים האחרונים.
- פירוט סטטוס (נמסר, נפתח, סימולציה, שגיאה), ספק משגר (Resend/SendGrid/SMTP/Mock), וזמן מדויק.

---

## 4. ניתובים פנימיים (Internal Sub-routes)

הניתוב הפנימי מתבצע באמצעות State פנימי או תת-נתיבים של ה-Router בתוך המודול:
- `""` (נתיב ראשי ריק): תצוגת לוח הבקרה ורשימת הקמפיינים (`KosunAmMainView`).
- `"campaigns/new"`: פתיחת עורך יצירת קמפיין חדש.
- `"campaigns/:id"`: עריכת קמפיין קיים וצפייה בביצועיו.
- `"templates"`: ספריית תבניות האימייל המעוצבות.
- `"templates/editor"`: עורך התבניות הוויזואלי (`EmailEditorModal`).
- `"automations"`: מסך ניהול ובונה האוטומציות הרב-ערוציות (`AutomationBuilderView`).
- `"logs"`: יומן שיגור ומסירה מורחב (`DeliveryLogsDrawer`).

---

## 5. שכבת API ופונקציות ענן (Firebase Cloud Functions / Backend)

קריאות השרת מתבצעות דרך `src/modules/kosun-am/api/functionsApi.ts` עם מנגנון Graceful Fallback מובנה:

### Endpoint 1: `dispatchEmailCampaign`
- **מטרה:** שיגור קמפיין לרשימת תפוצה גדולה בצד השרת כדי למנוע חסימות רשת בדפדפן.
- **Payload (קלט):**
  ```typescript
  {
    tenantId: string;
    campaignId: string;
    providerPreference?: 'resend' | 'sendgrid' | 'smtp';
  }
  ```
- **Response (פלט):**
  ```typescript
  {
    success: boolean;
    dispatchedCount: number;
    provider: string;
    batchId: string;
  }
  ```
- **אופן אבטחה:** אימות Firebase Auth Token + בדיקת הרשאות הדייר (`tenantId`).

### Endpoint 2: `sendSmtpEmailProxy`
- **מטרה:** שליחת מייל בודד או מייל בדיקה דרך שרת SMTP חיצוני (פתרון למגבלת היעדר TCP Sockets בדפדפנים).
- **Payload (קלט):**
  ```typescript
  {
    tenantId: string;
    to: string;
    subject: string;
    html: string;
    fromName?: string;
  }
  ```
- **Response (פלט):**
  ```typescript
  {
    success: boolean;
    messageId: string;
  }
  ```

### Endpoint 3: `triggerEmailAutomation`
- **מטרה:** הפעלת שלב באוטומציה מתוזמנת או מבוססת Webhook בצד השרת.

---

## 6. פרומפטים והגדרות AI (Prompts & LLM Settings)

- **מטרת ה-AI בקומפוננטה:**  
  סייען השיווק החכם קוסאי (Kosai Email Copilot) מסייע לבעל העסק לייצר שורות נושא ממירות (A/B Testing), לנסח תוכן מייל שיווקי מרתק, ולהמליץ על פילוח קהלי יעד מותאם אישית – הכל בהתאם ל-Brand DNA של העסק.
- **מודלים מורשים בלבד:**
  1. ראשי: `gemini-3.8-flash`
  2. משני (Cascade Fallback): `gemini-3.5-flash`
  3. שלישי (Lite Fallback): `gemini-3.8-flash-lite`
  4. מקומי: Smart Mock Fallback מובנה הפועל ללא אינטרנט או בהיעדר מפתחות.
- **חישוב עלויות וטוקנים:** שימוש בפונקציה המערכתית `calculateGeminiCost` מ-`src/core/ai/geminiCostTracker.ts`.
- **System Prompt מובנה:**
  ```text
  אתה קוסאי (Kosai), סייען הבינה המלאכותית של מערכת "קושאן מייל אוטומטי" (KOSUN AM).
  תפקידך לנסח כותרות אימייל קולעות, טקסטים מקדימים ותוכן ניוזלטרים מניע לפעולה בעברית רהוטה ומושכת.
  הקפד על טון דיבור מותאם ל-Brand DNA של העסק: צעיר, נקי, מקצועי ומניע לפעולה.
  החזר תמיד מענה מובנה בפורמט JSON בלבד.
  ```
- **משתני פרומפט דינמיים:**
  `{businessName}`, `{brandTone}`, `{campaignObjective}`, `{targetAudience}`, `{keyBenefits}`, `{preferredLength}`.

---

## 7. חוקי אבטחה של פיירבייס (Firestore Security Rules)

החוקים אוכפים בידוד Multi-Tenancy מוחלט. גישה לקולקציות מותרת רק למשתמשים מאומתים השייכים לדייר המבוקש:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // חוקי בידוד לקולקציות KOSUN AM תחת דייר ספציפי
    match /tenants/{tenantId}/mod_kosun_am_campaigns/{campaignId} {
      allow read, write: if request.auth != null && (
        request.auth.token.tenantId == tenantId || 
        request.auth.token.role == 'admin' ||
        tenantId == '_master'
      );
    }

    match /tenants/{tenantId}/mod_kosun_am_templates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.token.tenantId == tenantId || 
        request.auth.token.role == 'admin' ||
        tenantId == '_master'
      );
    }

    match /tenants/{tenantId}/mod_kosun_am_automations/{automationId} {
      allow read, write: if request.auth != null && (
        request.auth.token.tenantId == tenantId || 
        request.auth.token.role == 'admin' ||
        tenantId == '_master'
      );
    }

    match /tenants/{tenantId}/mod_kosun_am_logs/{logId} {
      allow read: if request.auth != null && (
        request.auth.token.tenantId == tenantId || 
        request.auth.token.role == 'admin' ||
        tenantId == '_master'
      );
      allow create: if request.auth != null;
    }
  }
}
```

---

## 8. משתני סביבה נדרשים ב-.env

```env
# הגדרות Firebase בסיסיות
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# כתובת בסיס לפונקציות ענן
VITE_FUNCTIONS_BASE_URL=

# מפתחות צד-שלישי נטענים אך ורק דרך tenantApiKeys.ts מתוך Firestore (ולא מ-.env מקומי או localStorage!)
# דוגמאות למפתחות המנוהלים בדייר:
# resendApiKey, sendgridApiKey, smtpHost, smtpPort, smtpUser, smtpPass
```

</div>
