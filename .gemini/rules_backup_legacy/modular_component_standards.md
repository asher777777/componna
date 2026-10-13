# Project Rule: Modular Component Standards (חוק פיתוח רכיבים עצמאיים)

Whenever creating, refactoring, or extending any module in this workspace, you MUST strictly adhere to the following 6 Golden Principles:

## 1. Zero Direct Cross-Module Imports
- A module under `src/modules/[name]/` is strictly forbidden from importing files from sibling modules (`import { X } from '../other-module/...'` is NEVER allowed).
- All shared interfaces and DTOs must be placed in or imported from `src/core/contracts/`.

## 2. Module Monopoly & Capability-Based Bridge (עקרון המונופול והסמכות הבלעדית)
- **Single Authority Principle (סמכות בלעדית לכל תחום)**: לכל תחום מערכתי יש רכיב אוטוריטה יחיד בעל מונופול:
  - רכיב ה-AI (`kosai-engine` / סוכני AI דרך Cloud Functions): הסמכות הבלעדית לכל תקשורת עם מודלי Gemini.
  - רכיב מסד הנתונים (`db-collections-hub`): הסמכות לרישום וניהול קולקציות ו-seed.
  - רכיב המדיה (`media-vault` / `media-gallery-hub`): הסמכות לניהול והעלאת קבצים ותמונות.
  - רכיב התחברות והרשאות (`auth-portal`): הסמכות הבלעדית לאימות משתמשים, ניהול סשנים והרשאות מערכת.
  - רכיב הגדרות ומיתוג (`brand-dna-hub`): הסמכות הבלעדית להגדרות מותג, שפת מותג, צבעים ו-Brand DNA.
- **The 4-Step Capability Bridge Protocol (פרוטוקול 4 השלבים לגישור יכולות)**:
  1. **Step 1 - Contracts Only**: רכיבים לעולם אינם מייבאים קוד זה מזה. אם נדרשת יכולת, מגדירים את הטיפוס ב-`src/core/contracts/index.ts` (לדוגמה `AiTextAssistantContract`).
  2. **Step 2 - Authority Registration**: רכיב האוטוריטה (לדוגמה `kosai-engine`) רושם את המימוש שלו בעת טעינה לתוך `HostCapabilitiesProvider`:
     ```typescript
     registerCapability('ai-assistant', kosaiImplementation);
     ```
  3. **Step 3 - Consumer Module (UI Only)**: הרכיב המשתמש (לדוגמה `whatsapp-green-api-hub`) מייבא אך ורק את החוזה מ-`src/core/contracts/` וצורך את השירות דרך ה-Hook:
     ```tsx
     import { AiTextAssistantContract } from '../../../core/contracts';
     const { getCapability } = useHostCapabilities();
     const aiService = getCapability<AiTextAssistantContract>('ai-assistant');
     ```
  4. **Step 4 - Graceful Degradation (התדרדרות חיננית)**:
     ```tsx
     if (!aiService) {
       // הצגת הודעה ברורה ונעימה בעברית - הרכיב לעולם אינו קורס!
       return <AlertNotice text="שירות סוכני ה-AI אינו מופעל או אינו כלול בחבילת המנוי שלכם." />;
     }
     ```
- **Zero Duplication**: חל איסור מוחלט על רכיב לממש בעצמו קריאות API ישירות ל-Gemini, שכפול מנועי תמלול, או יצירת שירותי ענן עצמאיים שכבר קיימים ברכיב האוטוריטה.
- **Graceful Degradation (התדרדרות חיננית)**: אי-זמינות או קריסה של רכיב האוטוריטה **לעולם לא תפיל** את הרכיב המארח או את המערכת. על הרכיב להציג הודעה ברורה או ממשק חלופי שאינו תלוי.

## 3. Asynchronous Decoupling via EventBus
- For background notifications, lead captures, and telemetry, publish events to `eventBus` from `src/core/bridge/EventBus`:
  ```typescript
  eventBus.publish('crm:lead:created', { ... });
  ```
- Modules subscribe only if active. Publishers never depend on subscribers existing.

## 4. Standard Component Anatomy (אנטומיית הרכיב התקנית)
Every feature module MUST strictly adhere to the standard isolated structure:
1. `types/index.ts` - Strict TypeScript definitions.
2. `config/index.ts` - Scoped collection prefixes (`mod_[name]_[coll]`) and constants.
3. `context/ModuleContext.tsx` - React Context Provider for DI and state.
4. `hooks/` - Internal scoped React hooks.
5. `services/` - Scoped Firestore CRUD services connected directly to real DB under `useTenantScope()`.
6. `api/functionsApi.ts` - Dedicated Cloud Function callers for module-specific backend tasks (e.g. webhooks, payment clearing). **חל איסור מוחלט לשכפל כאן קריאות ל-Gemini או מנועי AI!**
7. `routes/ModuleRoutes.tsx` - Internal relative sub-routing.
8. `components/` - Tailwind UI components with strict RTL support (`dir="rtl"`).
9. `StandaloneView.tsx`, `index.ts` & `README.md` - Clean public export, isolated test runner, and docs.
10. `.gemini/` (`rules.md` & `skills.md`) - **MANDATORY**: Module-specific rules, isolation boundaries, and skills.

> **חוק בלעדיות שכבת ה-AI (`prompts/`)**: שכבת `prompts/` ושירותי קריאה ל-Gemini שייכים **אך ורק לרכיב האוטוריטה ל-AI (`kosai-engine`)**. רכיבים רגילים (וואטסאפ, טפסים, דפי נחיתה וכו') אינם יוצרים שכבת פרומפטים ואינם פונים ישירות למודלים, אלא צורכים את שירות ה-AI אך ורק דרך החוזה המערכתי: `useHostCapabilities().getCapability<AiTextAssistantContract>('ai-assistant')`.

## 5. Master Registration & Dynamic Lazy Loading
- Always register the new module in:
  - `src/workbench/moduleRegistry.ts`: **MANDATORY**: Register standalone views **ONLY** via dynamic `React.lazy()` imports to ensure code-splitting and prevent one module's runtime issues from crashing others:
    ```typescript
    const MyModuleStandaloneView = React.lazy(() =>
      import('../modules/my-module').then((m) => ({ default: m.MyModuleStandaloneView }))
    );
    ```
    *(Never use static `import { ... }` at the top of `moduleRegistry.ts`!)*
  - `src/modules/client-receiver-platform/config/index.ts` (for Client Platform Checklist Table).
- Ensure the module is exportable via `npm run export-client -- --client=X --modules=Y`.

## 6. True Runtime Isolation & Error Boundaries
- Modules must be completely self-resilient at runtime.
- In `WorkbenchApp.tsx`, every module view is wrapped inside `<ModuleErrorBoundary>` and `<Suspense>`.
- A module's internal crash or missing API key must gracefully degrade and never break sibling modules or the shell workbench layout.

## 7. Multi-Tenant Scoped Subcollections & Storage (Zero Cross-Tenant Leakage)
- **MANDATORY**: Modules are strictly forbidden from writing to or querying flat global collections (`collection(db, 'contacts')` is BANNED).
- All Firestore queries must use the system collections registry from `src/core/contracts/collections.ts` and the tenant subcollection scope:
  ```typescript
  import { SYSTEM_COLLECTIONS } from '../../../core/contracts';
  import { useTenantScope } from '../../../core/tenant';

  const { getScopedCollectionRef } = useTenantScope();
  const contactsRef = getScopedCollectionRef(db, SYSTEM_COLLECTIONS.CONTACTS);
  // Yields: collection(db, 'tenants', tenantId, 'contacts')
  ```
- **Never touch `firestore.rules`**: חל איסור חמור לשנות את `firestore.rules` או להרפות הרשאות כדי "לפתור" שגיאות גישה. אם יש שגיאת הרשאה, הבעיה היא בקוד שקרא לקולקציה שטוחה במקום ל-tenant scope!
- **Data Ingestion Schema Verification (שאיבת נתונים מרכיב אחר)**: במידה ופונקציית הרכיב היא שאיבת נתונים מרכיב אחר והצגתם, **חובה לבנות את הקריאה/השאילתה אך ורק לאחר לימוד מעמיק של הפרמטרים והשדות** הקיימים בפועל בקולקציה של הרכיב שמייצא את הנתונים או מקבל אותם. חל איסור מוחלט לנחש שמות שדות או מבנה נתונים.
- **Apex / Root Domain Handling**: When running on the apex domain without a subdomain, `tenantId` is automatically `_master`.
- **Cloud Storage**: File uploads must be isolated to `tenants/${tenantId}/${folder}/${fileName}`.

## 8. Database Collections Hub & Seed Registration (סנכרון רכיב DB)
- Whenever a module introduces persistent collections:
  - Register the collection string in `SYSTEM_COLLECTIONS` (`src/core/contracts/collections.ts`).
  - Add metadata to `PREDEFINED_COLLECTIONS` in `src/modules/db-collections-hub/config/index.ts`.
  - Add sample seed records to `PROJECT_SEED_DATA` in `src/modules/db-collections-hub/config/seedData.ts`.
  - Distinguish tenant collections (e.g. `settings/brand_dna`, `contacts`, `crm_groups`) from platform-wide infrastructure (`system_settings/global`).

## 9. API Keys & Multi-Tenant Entitlements (חוק הרשאות ומפתחות API לוקאליים)
- **Zero LocalStorage for Keys**: Modules are STRICTLY FORBIDDEN from reading or storing API keys (Gemini, Green API, HeyGen, etc.) directly via `localStorage`.
- **Tenant API Keys Resolver**: All modules MUST fetch their keys via the central connection core `getModuleApiKeys('module-name')`, `getModuleGeminiKey(...)`, or `getModuleGreenApiCredentials(...)` from `src/core/connection/tenantApiKeys.ts`.
- **Entitlement Checks**: The resolver automatically checks `activeModules` on the tenant document (`tenants/{tenantId}`). If the tenant hasn't purchased the module, the keys are stripped and the component must gracefully degrade (block access/functionality).
- **Master Fallback**: Keys are stored at `tenants/_master/settings/api_keys` and inherited by subdomain tenants ONLY if they purchased the component.

## 10. AI Standards & Firebase Cloud Functions Backend (חוק קריאות AI ו-Gemini)
- **Cloud Functions Only**: חל איסור מוחלט על קריאות Gemini ישירות מתוך דפדפן הלקוח (`fetch('https://generativelanguage...')` אסור בקליינט). כל קריאות ה-Gemini מבוצעות אך ורק דרך Firebase Cloud Functions (או רכיב ה-AI האוטוריטי).
- **Zero Hallucinated Models**: Only use active Google AI Studio models documented in `@skill:google-ai-studio-gemini` (`gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.1-pro`). Calling non-existent or shut-down models is strictly forbidden.
- **הצגת שגיאה ברורה ללא פולבאק (No Fallbacks / Clear User Errors)**: אין לבצע שרשרת פולבאק (Fallback) אוטומטית בין מודלים. במקרה של שגיאה, עומס או מכסה שהסתיימה – יש לתפוס את השגיאה ולהציג תמיד למשתמש הקצה הודעה בשפה ברורה, נעימה, שירותית ובעברית מלאה (לדוגמה: "שירות הבינה המלאכותית עמוס כעת, אנא נסה שוב בעוד מספר רגעים"), מבלי להפיל את המערכת.
- **Token & Cost Tracking**: Every generation call must extract `usageMetadata` and calculate costs with `calculateGeminiCost` from `src/core/ai`.
- **System Prompt & Brand DNA**: Inject brand voice and enforce RTL-compliant Hebrew without mixing disruptive English terms.

## 11. Root Directory Hygiene & Component Scripts (איסור זיהום תקיית השורש)
- **Zero Root Pollution**: חל איסור מוחלט על יצירת קבצים חדשים (סקריפטים, קבצי בדיקה, seeds, דוחות וכו') בתיקיית השורש הראשית של הפרויקט.
- **Component Scripts Folder**: כל סקריפט תחזוקה, יבוא, בדיקה או seed ששייך לרכיב ספציפי חייב להישמר אך ורק בתוך:
  `src/modules/[module-name]/scripts/`
- **Temporary Scratch**: קבצי scratch זמניים מותרים אך ורק בתיקיית `scratch/` ואסור שיישמרו בשורש הפרויקט.

## 12. Mandatory Gatekeeper Audit (שומר הסף)
- לפני סיום כל משימה, עדכון פיצ'ר או יצירת רכיב, הסוכן מחויב להריץ את שומר הסף:
  `npm run gatekeeper`
- הסוכן חייב לצרף דו"ח צ'קליסט מלא המוודא שכל 12 הכללים מתקיימים. רכיב שאינו עובר את ביקורת שומר הסף אינו מאושר להגשה!


