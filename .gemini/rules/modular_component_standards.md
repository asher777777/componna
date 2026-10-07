# Project Rule: Modular Component Standards (חוק פיתוח רכיבים עצמאיים)

Whenever creating, refactoring, or extending any module in this workspace, you MUST strictly adhere to the following 6 Golden Principles:

## 1. Zero Direct Cross-Module Imports
- A module under `src/modules/[name]/` is strictly forbidden from importing files from sibling modules (`import { X } from '../other-module/...'` is NEVER allowed).
- All shared interfaces and DTOs must be placed in or imported from `src/core/contracts/`.

## 2. Capability-Based Communication & Graceful Degradation
- If Module A needs a feature typically provided by Module B (e.g. Media Picker, Lead Capture), it MUST use `useHostCapabilities()` from `src/core/bridge/HostCapabilitiesContext`:
  ```tsx
  const { getCapability } = useHostCapabilities();
  const mediaService = getCapability<MediaPickerContract>('media-picker');
  if (mediaService) {
    // Rich module interaction
  } else {
    // MANDATORY: Built-in local fallback (e.g. native file input)
  }
  ```
- Every feature MUST have a graceful fallback if the target module is not included in the client export.

## 3. Asynchronous Decoupling via EventBus
- For background notifications, lead captures, and telemetry, publish events to `eventBus` from `src/core/bridge/EventBus`:
  ```typescript
  eventBus.publish('crm:lead:created', { ... });
  ```
- Modules subscribe only if active. Publishers never depend on subscribers existing.

## 4. Strict 11-Layer Self-Contained Anatomy
Every module MUST contain:
1. `types/index.ts` - Strict TypeScript definitions.
2. `config/index.ts` - Scoped collection prefixes (`mod_[name]_[coll]`) and constants.
3. `context/ModuleContext.tsx` - React Context Provider for DI.
4. `hooks/` - Internal scoped React hooks.
5. `services/` - Scoped Firestore/backend CRUD services with mock data fallback.
6. `api/functionsApi.ts` - Cloud Function callers / proxy.
7. `prompts/index.ts` - AI system prompts & schemas (if AI-enabled).
8. `routes/` - Internal relative sub-routing.
9. `components/` - Tailwind UI components with strict RTL support (`dir="rtl"`).
10. `StandaloneView.tsx`, `index.ts` & `README.md` - Clean public export and test runner.
11. `.gemini/` (`rules.md` & `skills.md`) - **MANDATORY**: Module-specific rules, isolation boundaries, EventBus contracts, and agent skills definition.


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
- **Apex / Root Domain Handling**: When running on the apex domain without a subdomain, `tenantId` is automatically `_master`.
- **Cloud Storage**: File uploads must be isolated to `tenants/${tenantId}/${folder}/${fileName}`.

## 8. Database Collections Hub & Seed Registration (סנכרון רכיב DB)
- Whenever a module introduces persistent collections:
  - Register the collection string in `SYSTEM_COLLECTIONS` (`src/core/contracts/collections.ts`).
  - Add metadata to `PREDEFINED_COLLECTIONS` in `src/modules/db-collections-hub/config/index.ts`.
  - Add sample seed records to `PROJECT_SEED_DATA` in `src/modules/db-collections-hub/config/seedData.ts`.
  - Distinguish tenant collections (e.g. `settings/brand_dna`, `contacts`, `crm_groups`) from platform-wide infrastructure (`system_settings/global`).

## 10. Official Google AI Studio & Gemini API Standards (חוק שימוש בבינה מלאכותית)
- **Zero Hallucinated Models**: Only use active Google AI Studio models documented in `@skill:google-ai-studio-gemini` (`gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.1-pro`). Calling non-existent (`gemini-3.6-flash`) or shut-down models (`gemini-2.0-flash`, `gemini-1.5-flash`) is strictly forbidden.
- **Mandatory Fallback Chain**: Every service or AI agent calling Gemini MUST implement automatic model fallback cascading (`['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.8-flash-lite', 'gemini-3.5-flash-lite']`).
- **Token & Cost Tracking**: Every generation call must extract `usageMetadata` and calculate costs with `calculateGeminiCost` from `src/core/ai`.
- **System Prompt & Brand DNA**: Inject brand voice and enforce RTL-compliant Hebrew without mixing disruptive English terms.

## 11. Verification
- Always verify clean compilation with `npm run build` after changes.


