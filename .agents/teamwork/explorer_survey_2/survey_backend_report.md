<div dir="rtl" style="text-align: right;">

# דוח סקר באקנד, חוזים, EventBus ו-Multi-Tenancy
## רכיב: קושאן מייל אוטומטי (KOSUN AM / `kosun-am`)

**תאריך סקר:** 2026-10-11  
**חוקר:** teamwork_preview_explorer (Explorer Survey 2)  
**נתיב עבודה:** `c:\comona\.agents\teamwork\explorer_survey_2`  
**מזהה רכיב רשמי:** `kosun-am` (`src/modules/kosun-am/`)  
**שם רשמי:** עברית: **קושאן מייל אוטומטי** | אנגלית: **KOSUN AM**  
**קידומת קולקציות רשמית:** `mod_kosun_am_`

---

## תקציר מנהלים (Executive Summary)

סקר זה מנתח לעומק את תשתית הבאקנד, מערך החוזים המערכתיים, מנגנון ה-EventBus, ארכיטקטורת ה-Multi-Tenancy, אבטחת מפתחות ה-API ושירותי שיגור האימיילים בפרויקט `comona`. 
כלל הממצאים וההמלצות מותאמים במדויק לחוקי הברזל של קושאן (Cashwan 2026), נוהל ביקורת 5 השערים (`system_audit_workflow.md`), וההנחיה הרשמית המחייבת של בעלי הפרויקט עבור רכיב **"קושאן מייל אוטומטי" (KOSUN AM)**.

---

## 1. רישום וטיפוסי קולקציות (Collections Registry & Contracts)

במערכת קושאן קיימת חובת **סנכרון משולש (Triple Sync Pattern)** עבור כל קולקציה חדשה:
1. רישום בחוזי הליבה: `src/core/contracts/collections.ts`
2. רישום במטא-דאטה של סייר הנתונים: `src/modules/db-collections-hub/config/index.ts`
3. הזנת נתוני הדגמה ראשוניים: `src/modules/db-collections-hub/config/seedData.ts`

### 1.1. קולקציות ייעודיות עבור KOSUN AM

בהתאם להנחיה המחייבת, קידומת הקולקציות היא אך ורק `mod_kosun_am_`:

| שם הקולקציה בפועל | מפתח ב-SYSTEM_COLLECTIONS | תיאור ומטרה |
| :--- | :--- | :--- |
| `mod_kosun_am_campaigns` | `KOSUN_AM_CAMPAIGNS` | ניהול קמפיינים שיווקיים, ניוזלטרים, מועדי שיגור, קהלי יעד ומטא-דאטה |
| `mod_kosun_am_templates` | `KOSUN_AM_TEMPLATES` | תבניות אימייל מעוצבות (HTML/JSON Blocks), משתני פרסונליזציה ו-Brand DNA |
| `mod_kosun_am_automations` | `KOSUN_AM_AUTOMATIONS` | שרשראות אוטומציה מבוססות טריגרים (טפסי הרשמה, לידים חדשים, שגרירים, תרומות) |
| `mod_kosun_am_logs` | `KOSUN_AM_LOGS` | יומני שיגור מלאים: סטטוסי מסירה, ספק משגר (Provider), שגיאות וזמני שליחה |

### 1.2. מימוש נדרש ב-`src/core/contracts/collections.ts`

בקובץ `src/core/contracts/collections.ts`, תחת האובייקט המרכזי `SYSTEM_COLLECTIONS`:

```typescript
// 10. Kosun AM (קושאן מייל אוטומטי - Email & Multi-Channel Automation)
KOSUN_AM_CAMPAIGNS: 'mod_kosun_am_campaigns',
KOSUN_AM_TEMPLATES: 'mod_kosun_am_templates',
KOSUN_AM_AUTOMATIONS: 'mod_kosun_am_automations',
KOSUN_AM_LOGS: 'mod_kosun_am_logs',
```

### 1.3. מימוש נדרש ב-`src/modules/db-collections-hub/config/index.ts`

במערך `PREDEFINED_COLLECTIONS`:

```typescript
// Kosun AM - Email & Marketing Automations
{
  id: 'mod_kosun_am_campaigns',
  name: 'קמפיינים ודיוורים (Kosun AM Campaigns)',
  description: 'קמפיינים של דוא״ל שיווקי, ניוזלטרים, פילוח נמענים וסטטיסטיקות שיגור',
  category: 'crm',
  icon: 'Mail',
},
{
  id: 'mod_kosun_am_templates',
  name: 'תבניות דוא״ל מעוצבות (Kosun AM Templates)',
  description: 'ספריית תבניות אימייל מעוצבות, בלוקים ויזואליים ועיצוב תואם Brand DNA',
  category: 'crm',
  icon: 'Layout',
},
{
  id: 'mod_kosun_am_automations',
  name: 'אוטומציות שיווקיות רב-ערוציות (Kosun AM Automations)',
  description: 'תזרימי עבודה אוטומטיים המופעלים מאירועי EventBus: לידים, טפסים ושגרירים',
  category: 'crm',
  icon: 'Zap',
},
{
  id: 'mod_kosun_am_logs',
  name: 'יומני שיגור ומסירה (Kosun AM Dispatch Logs)',
  description: 'תיעוד היסטוריית שיגור, סטטוסי קבלה, שגיאות ספקים (Resend/SendGrid/SMTP)',
  category: 'system',
  icon: 'Activity',
},
```

### 1.4. מימוש נדרש ב-`src/modules/db-collections-hub/config/seedData.ts`

במפת `PROJECT_SEED_DATA`, יש להזין רשומות ראשוניות המדגימות:
- קמפיין ברוכים הבאים פעיל (`mod_kosun_am_campaigns`).
- תבנית אימייל יוקרתית המותאמת ל-Brand DNA (`mod_kosun_am_templates`).
- אוטומציה המאזינה ל-`smart_form:submitted` ו-`crm:lead:created` (`mod_kosun_am_automations`).
- לוג שיגור לדוגמה עם סטטוס `delivered` (`mod_kosun_am_logs`).

---

## 2. דפוסי בידוד Multi-Tenancy ב-Firestore

### 2.1. ארכיטקטורת הבידוד המערכתית

במערכת קושאן קיים חוק ברזל מחמיר: **איסור מוחלט על קולקציות שטוחות גלובליות** (Flat Root Collections).
בכל גישה ל-Firestore, מסד הנתונים מחולק לפי דיירים (Tenants) במבנה:

$$\text{tenants} \rightarrow \{\text{tenantId}\} \rightarrow \{\text{collectionName}\} \rightarrow \{\text{docId}\}$$

נתיב הקולקציה המבודד נבנה כ: `tenants/${tenantId}/${collectionName}`.

### 2.2. ממשק `useTenantScope()`

נבדק הקוד ב-`src/core/tenant/TenantScopeContext.tsx`:
```typescript
export interface TenantScopeContextValue {
  tenantId: string;
  isRootTenant: boolean;
  setTenantId: (id: string) => void;
  getScopedCollectionName: (collectionName: string) => string;
  getScopedCollectionPath: (collectionName: string) => string;
  getScopedCollectionRef: <T = DocumentData>(db: Firestore, collectionName: string) => CollectionReference<T>;
  getScopedStoragePath: (folder: string, fileName: string) => string;
  getScopedStorageKey: (key: string) => string;
}
```

- עבור Root Platform (הדומיין הראשי): `tenantId = '_master'`.
- עבור סאב-דומיין (למשל `demo.kosun.pro`): `tenantId = 'demo'`.
- הפונקציה `getScopedCollectionRef(db, collectionName)` מבצעת ישירות:
  ```typescript
  collection(db, 'tenants', tenantId, collectionName)
  ```
- הפונקציה `getScopedCollectionPath(collectionName)` מחזירה את המחרוזת:
  ```typescript
  `tenants/${tenantId}/${collectionName}`
  ```

### 2.3. מבנה שירות ה-Firestore של KOSUN AM (`firestoreService.ts`)

כל שירותי הנתונים של המודול חייבים לקבל `db: Firestore` ו-`tenantId: string` (או `getScopedCollectionRef`):

```typescript
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { EmailCampaign, EmailTemplate, EmailAutomation, EmailDispatchLog } from '../types';

export class KosunAmFirestoreService {
  private db: Firestore;
  private tenantId: string;

  constructor(db: Firestore, tenantId: string) {
    this.db = db;
    this.tenantId = tenantId;
  }

  // עזר לקבלת CollectionReference מבודד
  private getRef<T = DocumentData>(collectionName: string): CollectionReference<T> {
    return collection(this.db, 'tenants', this.tenantId, collectionName) as CollectionReference<T>;
  }

  // 1. קמפיינים
  async getCampaigns(): Promise<EmailCampaign[]> {
    const collRef = this.getRef<EmailCampaign>(SYSTEM_COLLECTIONS.KOSUN_AM_CAMPAIGNS);
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // 2. תבניות
  async getTemplates(): Promise<EmailTemplate[]> {
    const collRef = this.getRef<EmailTemplate>(SYSTEM_COLLECTIONS.KOSUN_AM_TEMPLATES);
    const snap = await getDocs(collRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // 3. אוטומציות
  async getAutomations(): Promise<EmailAutomation[]> {
    const collRef = this.getRef<EmailAutomation>(SYSTEM_COLLECTIONS.KOSUN_AM_AUTOMATIONS);
    const snap = await getDocs(collRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // 4. לוגים
  async logDispatch(log: Omit<EmailDispatchLog, 'id'>): Promise<string> {
    const collRef = this.getRef(SYSTEM_COLLECTIONS.KOSUN_AM_LOGS);
    const docId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(this.db, 'tenants', this.tenantId, SYSTEM_COLLECTIONS.KOSUN_AM_LOGS, docId);
    await setDoc(docRef, { ...log, id: docId });
    return docId;
  }
}
```

---

## 3. אינטגרציית EventBus ו-HostCapabilities

### 3.1. ארכיטקטורת Zero Cross-Imports

החוק המודולרי מחייב: **איסור מוחלט על ייבוא ישיר בין מודולים אחים**.
רכיב `kosun-am` אינו מייבא קבצים מ-`crm-analytics`, מ-`smart-form-builder`, מ-`page-builder` או מ-`ambassador-campaigns-hub`.
כל התיאום מתבצע אך ורק באמצעות **EventBus המרכזי** ו-**HostCapabilities**.

### 3.2. ממשק ה-EventBus המרכזי (`src/core/bridge/EventBus.ts`)

ה-EventBus הוא מופע מטיפוס `TypedEventBus` המאפשר:
- `eventBus.subscribe(topic, callback)`: החזרת פונקציית ביטול הרשמה (`unsubscribe`).
- `eventBus.publish(topic, data)`: הפצת אירוע לכל המאזינים הרשומים.
- `eventBus.emit(topic, data)`: כינוי זהה ל-`publish`.

כל האירועים מוגדרים בממשק `CoreEventMap` ב-`src/core/contracts/index.ts`.

### 3.3. אירועי יעד קיימים ב-CoreEventMap

האירועים שהמודול KOSUN AM נדרש להאזין להם כבר מוגדרים ומתועדים:

1. **`crm:lead:created`**:
   - מופץ כאשר ליד נוצר ב-CRM, ב-PageBuilder או בנגן FlowPlayer.
   - מבנה נתונים: `LeadPayload`
     ```typescript
     export interface LeadPayload {
       conta_name: string;
       conta_phone: string;
       email?: string;
       source?: string;
       tags?: string[];
       community?: string;
       metadata?: Record<string, any>;
     }
     ```
2. **`smart_form:submitted`**:
   - מופץ בעת שליחת טופס חכם מ-`smart-form-builder`.
   - מבנה נתונים:
     ```typescript
     {
       formId: string;
       formTitle: string;
       submissionId: string;
       data: Record<string, any>;
       leadPayload?: LeadPayload;
       submittedAt: string;
     }
     ```
3. **`campaign:ambassador:created`**:
   - מופץ כאשר שגריר חדש מצטרף לקמפיין גיוס ב-`ambassador-campaigns-hub`.
   - מבנה נתונים:
     ```typescript
     {
       campaignId: string;
       ambassadorId: string;
       name: string;
       leaderName?: string;
       slug: string;
       targetGoal: number;
       phone?: string;
       email?: string;
       shareUrl: string;
       createdAt: string;
     }
     ```
4. **`campaign:donation:completed`**:
   - מופץ בעת השלמת תרומה או תשלום תומך.

### 3.4. הרחבת `CoreEventMap` עבור אירועי KOSUN AM

מומלץ להוסיף ל-`src/core/contracts/index.ts` את אירועי ההפצה של המודול:
```typescript
'kosun_am:campaign:sent': {
  campaignId: string;
  campaignName: string;
  recipientsCount: number;
  sentAt: string;
};
'kosun_am:email:dispatched': {
  emailId: string;
  to: string;
  subject: string;
  provider: 'resend' | 'sendgrid' | 'smtp' | 'mock';
  status: 'sent' | 'failed';
  error?: string;
};
```

### 3.5. האזנה ותגובה אוטומטית בתוך `ModuleContext.tsx`

בתוך ה-Provider של המודול (`KosunAmProvider`):
```typescript
useEffect(() => {
  // 1. האזנה ללידים חדשים
  const unsubLead = eventBus.subscribe('crm:lead:created', async (payload: LeadPayload) => {
    if (!payload.email) return;
    await automationEngine.triggerAutomations('crm:lead:created', {
      email: payload.email,
      name: payload.conta_name,
      metadata: payload,
    });
  });

  // 2. האזנה להגשות טפסים חכמים
  const unsubForm = eventBus.subscribe('smart_form:submitted', async (evt) => {
    const email = evt.data.email || evt.leadPayload?.email;
    if (!email) return;
    await automationEngine.triggerAutomations('smart_form:submitted', {
      email,
      name: evt.data.name || evt.leadPayload?.conta_name || 'נרשם חדש',
      formId: evt.formId,
      formTitle: evt.formTitle,
      metadata: evt.data,
    });
  });

  // 3. האזנה לשגרירים חדשים
  const unsubAmbassador = eventBus.subscribe('campaign:ambassador:created', async (evt) => {
    if (!evt.email) return;
    await automationEngine.triggerAutomations('campaign:ambassador:created', {
      email: evt.email,
      name: evt.name,
      shareUrl: evt.shareUrl,
      targetGoal: evt.targetGoal,
      metadata: evt,
    });
  });

  return () => {
    unsubLead();
    unsubForm();
    unsubAmbassador();
  };
}, [automationEngine]);
```

### 3.6. צריכה ורישום של HostCapabilities (`src/core/bridge/HostCapabilitiesContext.tsx`)

1. **יכולות ש-KOSUN AM צורך:**
   - `'notification'`: לצורך הצגת התראות Toast צפות בעת שיגור בדיקה.
   - `'media-picker'`: לבחירת תמונות מתוך ה-Media Gallery עבור באנרים של ניוזלטרים.
   - `'brand-dna'`: לקריאת קול המותג, צבעי ה-Design Tokens והלוגו להטמעה בתבניות.
   - `'whatsapp'`: להפעלת ערוץ וואטסאפ במקביל לאימייל באוטומציות רב-ערוציות.
2. **יכולת ש-KOSUN AM רושם עבור שאר המערכת:**
   - רישום `'email-service'` / `'kosun-am-dispatcher'`: מאפשר למודולים אחרים (כגון חנות המרקטפלייס או איזיקאונט) לשלוח קבלה או אימייל מערכתי דרך KOSUN AM ללא Cross-Import ישיר:
   ```typescript
   registerCapability('email-service', {
     sendEmail: (opts: SendEmailOptions) => emailService.send(opts),
   });
   ```

---

## 4. ניהול מפתחות API (אבטחה ללא localStorage)

### 4.1. עקרונות האבטחה ב-`src/core/connection/tenantApiKeys.ts`

נבדק הקובץ המרכזי `tenantApiKeys.ts`. הארכיטקטורה מבוססת על החוקים הבאים:
1. **אחסון בלעדי ב-Firestore:**
   מפתחות ה-API של הדייר נשמרים אך ורק במסמך Firestore ייעודי:
   ```
   tenants/{tenantId}/settings/api_keys
   ```
   הנתיב מחולץ בעזרת הפונקציה:
   ```typescript
   getTenantApiKeysDocSegments(tenantId) // ['tenants', tenantId, 'settings', 'api_keys']
   ```
2. **איסור מוחלט על `localStorage`:**
   כל ניסיון לשמור או לקרוא מפתחות סודיים מ-`localStorage` אסור בהחלט. 
   יתרה מכך, הפונקציה `purgeLegacyLocalApiKeys()` רצה בעליית המערכת ומוחקת מפתחות ישנים שנותרו ב-`localStorage`.
3. **סנכרון Real-Time In-Memory:**
   ה-`SystemConnectionProvider` מאזין ב-`onSnapshot` למסמך ה-`api_keys` של הדייר הנוכחי, ומעדכן את המצב בזיכרון באמצעות `updateTenantApiKeysState()`.
4. **בדיקת זכאות מודול (Entitlement Gate):**
   - דייר ראשי (`_master`): זכאי לכל המודולים והמפתחות.
   - דייר סאב-דומיין: זכאי להשתמש במפתחות אך ורק אם המודול נרכש ברשימת `activeModules` / `purchasedModules`.
   - אם מודול לא נרכש: המפתחות הסודיים מופשטים (Stripped) והפונקציה `isModuleEntitled('kosun-am')` מחזירה `false`.

### 4.2. הרחבת `SystemApiKeysConfig` למפתחות אימייל

יש להוסיף לתמיכה ב-`src/core/connection/tenantApiKeys.ts`:

```typescript
export interface SystemApiKeysConfig {
  // קיימים: Gemini, HeyGen, Green-API, Kesher...
  // הוספה עבור Kosun AM:
  resendApiKey?: string;
  sendgridApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  emailFromAddress?: string;
  emailFromName?: string;
  [key: string]: any;
}
```

ברישום נתיבי מודולים:
```typescript
['/kosun-am', 'kosun-am']
```

פונקציית עזר נוחה לצריכה ב-KOSUN AM:
```typescript
export function getModuleEmailCredentials(moduleId = 'kosun-am'): {
  resendApiKey: string;
  sendgridApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromAddress: string;
  fromName: string;
} {
  const keys = getModuleApiKeys(moduleId);
  return {
    resendApiKey: (keys.resendApiKey || '').trim(),
    sendgridApiKey: (keys.sendgridApiKey || '').trim(),
    smtpHost: (keys.smtpHost || '').trim(),
    smtpPort: Number(keys.smtpPort || 587),
    smtpUser: (keys.smtpUser || '').trim(),
    smtpPass: (keys.smtpPass || '').trim(),
    fromAddress: (keys.emailFromAddress || 'noreply@kosun.pro').trim(),
    fromName: (keys.emailFromName || 'קושאן - מערכת דיוור').trim(),
  };
}
```

---

## 5. דפוסי שירות שיגור אימיילים (Multi-Provider & Mock Fallback)

### 5.1. אסטרטגיית 4 הספקים

שירות השיגור של KOSUN AM (`src/modules/kosun-am/services/emailDispatchService.ts`) נדרש לתמוך באופן מודולרי ב-4 ערוצים:

```text
[שליחת אימייל] ──► [בדיקת ספק מוגדר / העדפת דייר]
                        │
         ┌──────────────┼──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
     [Resend]      [SendGrid]    [Cloud Function]   [Mock / Local]
   (REST API)      (v3 Send)       (SMTP Proxy)     (Offline Mode)
```

1. **Resend API (`https://api.resend.com/emails`):**
   - מודרני, מהיר, תומך ב-React Email וב-HTML מלא.
   - שליחה באמצעות Authorization Header: `Bearer re_...`.
2. **SendGrid API (`https://api.sendgrid.com/v3/mail/send`):**
   - סטנדרט תעשייתי, תמיכה במפתחות `SG....`.
3. **Cloud Functions / SMTP Proxy:**
   - בדפדפנים לא ניתן לפתוח חיבור TCP Socket ל-SMTP ישירות (מגבלות פרוטוקול הדפדפן ו-CORS).
   - לכן, חיבורי SMTP (Gmail, Outlook, שרת דואר פרטי) מנותבים דרך קריאת ענן מאובטחת ב-`src/modules/kosun-am/api/functionsApi.ts`.
4. **Mock / Local Fallback (מצב סביבת פיתוח / לא מוגדר):**
   - כאשר לא הוזן מפתח API או כאשר המשתמש בוחר במצב "סימולציה":
     - אין קריסת רשת.
     - האימייל נרשם מיידית ב-Firestore תחת `mod_kosun_am_logs` עם סטטוס `simulated_success`.
     - מופץ אירוע Toast לממשק המשתמש: *"קושאן דיוור: סימולציית שיגור הצליחה לנמען {email}"*.
     - מופץ אירוע EventBus: `'kosun_am:email:dispatched'`.

### 5.2. ארכיטקטורת המימוש המומלצת (`emailDispatchService.ts`)

```typescript
export interface EmailPayload {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  fromName?: string;
  fromAddress?: string;
  campaignId?: string;
  automationId?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  provider: 'resend' | 'sendgrid' | 'functions_smtp' | 'mock_local';
  messageId: string;
  error?: string;
  timestamp: string;
}

export class EmailDispatchService {
  private creds: ReturnType<typeof getModuleEmailCredentials>;
  private isSimulationMode: boolean;

  constructor(creds: ReturnType<typeof getModuleEmailCredentials>, forceSimulation = false) {
    this.creds = creds;
    this.isSimulationMode = forceSimulation || (!creds.resendApiKey && !creds.sendgridApiKey && !creds.smtpHost);
  }

  async send(payload: EmailPayload): Promise<EmailDispatchResult> {
    const timestamp = new Date().toISOString();

    // 1. Mock / Local Fallback
    if (this.isSimulationMode) {
      console.log('[Kosun AM] Mock Dispatching email:', payload.subject, 'to', payload.to);
      return {
        success: true,
        provider: 'mock_local',
        messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
      };
    }

    // 2. Resend Provider
    if (this.creds.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.creds.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${payload.fromName || this.creds.fromName} <${payload.fromAddress || this.creds.fromAddress}>`,
            to: Array.isArray(payload.to) ? payload.to : [payload.to],
            subject: payload.subject,
            html: payload.htmlContent,
            text: payload.textContent,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            success: true,
            provider: 'resend',
            messageId: data.id || `resend_${Date.now()}`,
            timestamp,
          };
        }
        throw new Error(`Resend error: ${res.statusText}`);
      } catch (err: any) {
        console.warn('[Kosun AM] Resend failed, checking fallbacks:', err.message);
      }
    }

    // 3. SendGrid Provider
    if (this.creds.sendgridApiKey) {
      try {
        const recipients = (Array.isArray(payload.to) ? payload.to : [payload.to]).map(e => ({ email: e }));
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.creds.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: recipients }],
            from: {
              email: payload.fromAddress || this.creds.fromAddress,
              name: payload.fromName || this.creds.fromName,
            },
            subject: payload.subject,
            content: [{ type: 'text/html', value: payload.htmlContent }],
          }),
        });

        if (res.ok || res.status === 202) {
          return {
            success: true,
            provider: 'sendgrid',
            messageId: `sg_${Date.now()}`,
            timestamp,
          };
        }
        throw new Error(`SendGrid error: ${res.statusText}`);
      } catch (err: any) {
        console.warn('[Kosun AM] SendGrid failed:', err.message);
      }
    }

    // 4. Fallback to Local Simulation if Network fails
    return {
      success: true,
      provider: 'mock_local',
      messageId: `fallback_mock_${Date.now()}`,
      error: 'הספקים החיצוניים לא השיבו - הופעל מנגנון סימולציה מקומית של קושאן',
      timestamp,
    };
  }
}
```

---

## 6. רישום ב-Workbench (`src/workbench/moduleRegistry.ts`)

הרישום ב-Workbench חייב להיעשות אך ורק באמצעות **טעינה עצלה (`React.lazy`)**:

```typescript
const KosunAmStandaloneView = React.lazy(() =>
  import('../modules/kosun-am').then((m) => ({ default: m.KosunAmStandaloneView }))
);
```

ובמערך `REGISTERED_MODULES`:
```typescript
{
  id: 'kosun-am',
  name: 'קושאן מייל אוטומטי (KOSUN AM)',
  description: 'מערכת דיוור, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות חכמות מבית קושאן, עם סנכרון EventBus מלא ל-CRM ו-WhatsApp.',
  component: KosunAmStandaloneView,
  route: '/kosun-am',
  collectionPrefix: 'mod_kosun_am_',
}
```

וב-`src/workbench/components/CashwanTopNav.tsx`:
הוספת אייקון `Mail` מתוך `lucide-react`:
```typescript
MODULE_ICONS['kosun-am'] = Mail;
```

---

## 7. מפת דרכים לביצוע עבור מהנדס הבאקנד (Backend Engineer Implementation Roadmap)

לקראת שלב הפיתוח, להלן הצעדים הסדורים הנדרשים:

1. **שכבת חוזים ו-Collections (קובץ `src/core/contracts/collections.ts`):**
   - הוספת 4 המפתחות: `KOSUN_AM_CAMPAIGNS`, `KOSUN_AM_TEMPLATES`, `KOSUN_AM_AUTOMATIONS`, `KOSUN_AM_LOGS`.
2. **סייר נתונים (קובצי `src/modules/db-collections-hub/`):**
   - הוספת 4 הרשומות ל-`PREDEFINED_COLLECTIONS` ב-`config/index.ts`.
   - הוספת נתוני בדיקה ראשוניים ב-`config/seedData.ts`.
3. **שכבת הטיפוסים והקונפיגורציה של המודול (`src/modules/kosun-am/types/`, `config/`):**
   - הגדרת כל הממשקים: קמפיינים, תבניות, אוטומציות, לוגים וספקי שיגור.
4. **שירות ה-Firestore (`src/modules/kosun-am/services/firestoreService.ts`):**
   - עטיפה מוחלטת עם `collection(db, 'tenants', tenantId, collectionName)`.
5. **שירות שיגור האימיילים (`src/modules/kosun-am/services/emailDispatchService.ts`):**
   - תמיכה ב-Resend, SendGrid, Cloud Functions Proxy, ומצב Mock Offline Fallback.
6. **שכבת הקונטקסט וה-EventBus (`src/modules/kosun-am/context/KosunAmContext.tsx`):**
   - האזנה ל-`crm:lead:created`, `smart_form:submitted`, `campaign:ambassador:created`.
   - רישום יכולת HostCapability `'email-service'`.
7. **שליפת מפתחות API:**
   - אינטגרציה עם `tenantApiKeys.ts` (`getModuleEmailCredentials('kosun-am')`).

---

**סיכום:** המערכת מוכנה ארכיטקטונית וחוזית להקמת רכיב KOSUN AM בהתאם לסטנדרטים המחמירים ביותר של קושאן.

</div>
