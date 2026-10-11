<div dir="rtl" style="text-align: right;">

# Handoff Report — Explorer Survey 2: Backend, Contracts, EventBus & Multi-Tenancy

**מזהה רכיב רשמי:** `kosun-am` (`src/modules/kosun-am/`)  
**שם רשמי:** עברית: "קושאן מייל אוטומטי" | אנגלית: "KOSUN AM"  
**קידומת קולקציות:** `mod_kosun_am_...` (`mod_kosun_am_campaigns`, `mod_kosun_am_templates`, `mod_kosun_am_automations`, `mod_kosun_am_logs`)  
**סוג חפיפה (Handoff Type):** Hard (משימת הסקר הושלמה במלואה)

---

## 1. Observation (תצפיות ישירות ועובדתיות)

1. **קולקציות וחוזים:**
   - בקובץ `src/core/contracts/collections.ts` (שורות 8–56): מוגדר אובייקט יחיד `SYSTEM_COLLECTIONS` כ-`as const`. קולקציות מערכתיות מקבלות טיפוס דרך `SystemCollectionKey` ו-`SystemCollectionName`.
   - בקובץ `src/modules/db-collections-hub/config/index.ts` (שורות 14–332): מוגדר מערך `PREDEFINED_COLLECTIONS: CollectionMetadata[]` עם שדות `{ id, name, description, category, icon }`.
   - בקובץ `src/modules/db-collections-hub/config/seedData.ts` (שורות 1–546): מוגדר `PROJECT_SEED_DATA: SeedDataMap` הממפה שמות קולקציות לרשומות אתחול `{ id, name, data }`.
2. **בידוד Multi-Tenancy:**
   - בקובץ `src/core/tenant/TenantScopeContext.tsx` (שורות 47–50):
     ```typescript
     const getScopedCollectionRef = useCallback(<T = DocumentData>(db: Firestore, collectionName: string): CollectionReference<T> => {
       // Scoped Subcollection pattern: collection(db, 'tenants', tenantId, collectionName)
       return collection(db, 'tenants', tenantId, collectionName) as CollectionReference<T>;
     }, [tenantId]);
     ```
   - בקובץ `src/core/tenant/tenantResolver.ts` (שורה 9 ושורות 77–80): מוגדר `ROOT_TENANT_ID = '_master'` והפונקציה `getTenantCollectionPath` מייצרת `tenants/${tenantId}/${collectionName}`.
   - בקובץ `src/modules/crm-analytics/context/CrmAnalyticsContext.tsx` (שורות 64–75): מודולים קיימים שולפים `const { tenantId, getScopedCollectionPath } = useTenantScope();` ומרכיבים נתיבים מבודדים לדייר.
3. **ה-EventBus והאירועים:**
   - בקובץ `src/core/bridge/EventBus.ts` (שורות 5–61): ממומש `TypedEventBus` עם מתודות `subscribe(topic, cb)`, `publish(topic, data)` ו-`emit(topic, data)`. מופע מרכזי מיוצא בשם `eventBus`.
   - בקובץ `src/core/contracts/index.ts` (שורות 69–146): ממשק `CoreEventMap` כולל טיפוסים מפורשים עבור:
     - `'crm:lead:created': LeadPayload;` (שורות 16–24)
     - `'smart_form:submitted': { formId: string; formTitle: string; submissionId: string; data: Record<string, any>; leadPayload?: LeadPayload; submittedAt: string; };` (שורות 76–83)
     - `'campaign:ambassador:created': { campaignId: string; ambassadorId: string; name: string; leaderName?: string; slug: string; targetGoal: number; phone?: string; email?: string; shareUrl: string; createdAt: string; };` (שורות 108–119)
   - בקובץ `src/core/bridge/HostCapabilitiesContext.tsx` (שורות 1–68): מוגדר הוק `useHostCapabilities()` לרישום ושליפת יכולות רוחביות (`registerCapability`, `getCapability`) לצורך מניעת Cross-Imports.
4. **אבטחת מפתחות API:**
   - בקובץ `src/core/connection/tenantApiKeys.ts` (שורות 7–18, 64–82, 190–237):
     - כל המפתחות נשמרים אך ורק ב-Firestore בנתיב: `tenants/{tenantId}/settings/api_keys` (`SYSTEM_COLLECTIONS.SETTINGS`, דוקיומנט `api_keys`).
     - שורות 71–82: הפונקציה `purgeLegacyLocalApiKeys()` מוחקת במפורש מפתחות מ-`localStorage`.
     - שורות 190–222: פונקציות `isModuleEntitled` ו-`getModuleApiKeys` בודקות זכאות דייר לפי רשימת המודולים שנרכשו ומפשיטות סודות עבור מודולים שאינם מורשים.
5. **שירותי שיגור דוא״ל קיימים:**
   - בקובץ `src/modules/saas-storefront-composer/services/tenantWelcomeNotificationService.ts` (שורות 138–168): הודעות דוא״ל שוגרו בעבר כאירוע זמני `eventBus.publish('notification:email:send', ...)` ללא מנוע דיוור ייעודי.
   - בקובץ `functions/src/index.ts` (שורות 318–376): קיים שירות Proxy ייעודי (`kesherProxy`) המדגים עקיפת מגבלות CORS עבור שירותים חיצוניים באמצעות Cloud Function.
6. **רישום ב-Workbench:**
   - בקובץ `src/workbench/moduleRegistry.ts` (שורות 1–60, 71–224): כל המודולים נטענים בטעינה עצלה `React.lazy()` ונרשמים ב-`REGISTERED_MODULES` עם `id`, `name`, `route` ו-`collectionPrefix`.
   - בקובץ `src/workbench/WorkbenchApp.tsx` (שורות 162–177, 218–233): מערכת הראוטינג מייצרת נתיבים דינמיים עטופים ב-`ModuleErrorBoundary` וב-`Suspense`.

---

## 2. Logic Chain (שרשרת לוגית והיסקים)

1. בהתבסס על מבנה `SYSTEM_COLLECTIONS` (תצפית 1) והנחיות הביקורת ב-`system_audit_workflow.md` (שער 2), כל מודול חייב לבצע "סנכרון משולש": רישום 4 הקולקציות ב-`SYSTEM_COLLECTIONS`, רישום ב-`PREDEFINED_COLLECTIONS` והוספת רשומות הדגמה ב-`PROJECT_SEED_DATA`.
2. בהתבסס על מימוש `getScopedCollectionRef` (תצפית 2), שימוש בקולקציה שטוחה גלובלית כגון `collection(db, 'mod_kosun_am_campaigns')` מפר את בידוד ה-Multi-Tenancy של המערכת. לכן, שירות ה-Firestore של המודול חייב לקבל את ה-`tenantId` ולהשתמש אך ורק ב-`collection(db, 'tenants', tenantId, collectionName)`.
3. בהתבסס על עקרון Zero Cross-Imports (תצפית 3) ואירועי ה-EventBus הקיימים, סנכרון הלידים, הטפסים והשגרירים יתבצע באופן מנותק לחלוטין ממימושי המודולים האחים: `kosun-am` יאזין בקונטקסט שלו לאירועים `crm:lead:created`, `smart_form:submitted`, ו-`campaign:ambassador:created`, ויפעיל את תזרימי האוטומציה המתאימים.
4. בהתבסס על `tenantApiKeys.ts` (תצפית 4), חל איסור מוחלט לשמור מפתחות API (Resend, SendGrid, SMTP) ב-`localStorage`. המודול ישלוף מפתחות אלו ישירות דרך `getModuleApiKeys('kosun-am')`.
5. בהתבסס על מגבלות הדפדפן וסביבת הפיתוח (תצפית 5), שירות הדיוור חייב להכיל מנגנון ריבוי ספקים (Resend ו-SendGrid דרך REST API, חיבורי SMTP דרך Cloud Function Proxy), ובנוסף מנגנון Mock/Local Offline Fallback מלא, שמאפשר ריצה חלקה, תיעוד מלא ב-Firestore והתראת UI גם ללא חיבור אינטרנט או בהיעדר מפתח פעיל.
6. בהתבסס על תצפית 6, חיבור המודול ל-Workbench יתבצע בצורה חלקה וללא שגיאות על ידי ייצוא `KosunAmStandaloneView`, טעינתו ב-`React.lazy()` ב-`moduleRegistry.ts`, והוספת האייקון המתאים ב-`CashwanTopNav.tsx`.

---

## 3. Caveats (סייגים והנחות)

1. **חיבורי SMTP ישירים מהדפדפן:** לא ניתן לבצע חיבור TCP Socket ישיר (Port 587/465) לקוד Client-Side של React ללא שרת Node.js / Cloud Function ייעודי. לכן, עבור ספקי SMTP הוגדר שימוש ב-Cloud Function proxy ב-`functionsApi.ts`.
2. **Quota ועלויות ספקים חיצוניים:** שליחת אימיילים דרך Resend או SendGrid דורשת דומיין מאומת (SPF/DKIM) בפרודקשן. בסביבת פיתוח ובדיקות, מנגנון ה-Mock Fallback מבטיח שכל תהליכי המערכת נבדקים ב-100% הצלחה ללא תלות באימות דומיין.
3. **שמות קולקציות:** הוטמעה ההנחיה הרשמית המחייבת של בעלי הפרויקט: קידומת `mod_kosun_am_...` ושם המודול `kosun-am`.

---

## 4. Conclusion (מסקנה והערכה סופית)

התשתית הטכנולוגית של פרויקט `comona` מציגה ארכיטקטורה מודולרית בשלה, בעלת הפרדת רשויות מלאה, התומכת באופן אידיאלי בהקמת המודול **"קושאן מייל אוטומטי" (KOSUN AM / `kosun-am`)**.
דוח הסקר המקיף נכתב במלואו ונשמר בנתיב:
`c:\comona\.agents\teamwork\explorer_survey_2\survey_backend_report.md`

כל החוזים, הטיפוסים, דפוסי ה-Multi-Tenancy, מפתחות ה-API, דפוסי ה-EventBus ומבנה שירותי ה-Firestore והדיוור הוגדרו במדויק ומוכנים למימוש ישיר על ידי מהנדס הבאקנד והנתונים.

---

## 5. Verification Method (שיטת אימות עצמאית)

הסוכן המקבל יכול לאמת את ממצאי הדוח באופן הבא:

1. **אימות חוזי הקולקציות:**
   - עיון בקובץ `c:\comona\src\core\contracts\collections.ts` שורות 8–70.
   - עיון בקובץ `c:\comona\src\modules\db-collections-hub\config\index.ts` שורות 14–60.
2. **אימות בידוד ה-Multi-Tenancy:**
   - עיון בקובץ `c:\comona\src\core\tenant\TenantScopeContext.tsx` שורות 47–50 ו-89–93.
   - בדיקת השימוש ב-`useTenantScope()` בקובץ `c:\comona\src\modules\crm-analytics\context\CrmAnalyticsContext.tsx` שורות 64–75.
3. **אימות ה-EventBus והאירועים:**
   - עיון בקובץ `c:\comona\src\core\contracts\index.ts` שורות 69–146 (אימות הגדרות `crm:lead:created`, `smart_form:submitted`, `campaign:ambassador:created`).
   - עיון בקובץ `c:\comona\src\core\bridge\EventBus.ts` שורות 1–62.
4. **אימות אבטחת מפתחות API:**
   - עיון בקובץ `c:\comona\src\core\connection\tenantApiKeys.ts` שורות 70–82 (פונקציית `purgeLegacyLocalApiKeys`) ושורות 212–237.
5. **אימות תקינות הבנייה הכללית:**
   - הרצת בדיקת קומפילציה: `npm run build` (לוודא שאין שגיאות קיימות בסביבה).

</div>
