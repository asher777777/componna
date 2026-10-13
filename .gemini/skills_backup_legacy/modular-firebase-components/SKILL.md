---
name: modular-firebase-components
description: Standards and architecture guidelines for creating isolated, portable, and zero-collision React full-stack components with Firebase Firestore, Tailwind CSS, API proxying, and modular routing.
---

# Modular Firebase Components Standard

## Core Principles

1. **Standard Component Anatomy**
   Each component under `src/modules/[name]/` must contain its own:
   - `types/index.ts` - Strict TypeScript definitions.
   - `config/index.ts` - Scoped collection prefixes (`mod_[name]_[coll]`) and constants.
   - `context/ModuleContext.tsx` - React Context Provider for DI and state.
   - `hooks/` - Scoped React hooks.
   - `services/firestoreService.ts` - Real DB operations under `useTenantScope()`.
   - `api/functionsApi.ts` - Cloud Function callers for module-specific backend tasks (never Gemini!).
   - `routes/ModuleRoutes.tsx` - Internal relative sub-routing.
   - `components/` - Tailwind UI components with RTL (`dir="rtl"`).
   - `StandaloneView.tsx`, `index.ts` & `README.md` - Clean public export and test runner.
   - `.gemini/` (`rules.md` & `skills.md`) - Module-specific rules and agent skills.

   > **CRITICAL RULE**: Layer `prompts/` is EXCLUSIVE to the AI Authority (`kosai-engine`). Consumer components do NOT create `prompts/` and do NOT call Gemini directly! They connect to AI via `useHostCapabilities().getCapability<AiTextAssistantContract>('ai-assistant')`.

2. **Module Monopoly & Single Authority Principle (סמכות בלעדית)**
   - Every system domain has a single authoritative owner:
     - Auth & Permissions: `auth-portal` (User sessions & RBAC).
     - Settings & Branding: `brand-dna-hub` (Brand voice, styles & values).
     - AI: `kosai-engine` / Cloud Functions (Google Gemini models).
     - DB Collections & Seed: `db-collections-hub`.
     - Media: `media-gallery-hub` / `media-vault`.
   - When a component needs features from another domain, it builds **ONLY the UI layer** and consumes capabilities via `useHostCapabilities()`.
   - Never re-implement or duplicate backend AI calls or database sync services.
   - Mandatory Graceful Degradation: If a capability is unavailable or fails, provide a graceful UI fallback. NEVER crash the application.

3. **Multi-Tenant Firestore Scoping & Cross-Module Ingestion**
   - Writing to or querying flat global collections (`collection(db, 'contacts')`) is STRICTLY FORBIDDEN.
   - All queries must use `useTenantScope()` and `SYSTEM_COLLECTIONS` from `src/core/contracts`:
     ```typescript
     const { getScopedCollectionRef } = useTenantScope();
     const ref = getScopedCollectionRef(db, SYSTEM_COLLECTIONS.MY_COLL);
     // Resolves to: collection(db, 'tenants', tenantId, 'my_coll')
     ```
   - **Cross-Module Ingestion**: במידה ופונקציית הרכיב היא שאיבת נתונים מרכיב אחר והצגתם – חובה לבנות את הקריאה/השאילתה אך ורק לאחר לימוד מעמיק של הפרמטרים, המבנה והשדות שנמצאים בקולקציה של הרכיב שמייצא את הנתונים או מקבל אותם. אין לנחש שדות!
   - Register persistent collections in `SYSTEM_COLLECTIONS` and `PREDEFINED_COLLECTIONS` in `db-collections-hub`.
   - **Never touch `firestore.rules`**: Do not loosen or edit `firestore.rules` to bypass security or fix permission errors.

4. **AI & Gemini Calls via Cloud Functions (No Fallback / Pleasant Error)**
   - Zero direct Gemini API calls from the client browser (`fetch('generativelanguage...')` is banned in client components).
   - All AI calls must go through Cloud Functions backend callers in `api/functionsApi.ts` or the central AI authority.
   - **ללא פולבאק**: אין לבצע שרשרת פולבאק אוטומטית בין מודלים. בעת שגיאה יש להציג תמיד למשתמש הקצה הודעה נעימה, שירותית וברורה בעברית.

5. **Root Directory Hygiene & Scripts Isolation**
   - NEVER create files, scripts, or test utilities in the root project folder.
   - All component-related scripts belong in `src/modules/[module-name]/scripts/`.
   - Temporary scratch scripts belong strictly in `scratch/`.

6. **Centralized API Keys & Entitlement Verification**
   - Modules are STRICTLY FORBIDDEN from reading or storing API keys via `localStorage`.
   - Keys are resolved via `getModuleApiKeys('module-name')` from `src/core/connection/tenantApiKeys.ts` with tenant active module checks.

7. **Mandatory Gatekeeper Audit**
   - Before completing any task, run `npm run gatekeeper` and generate a certified checklist audit report.
