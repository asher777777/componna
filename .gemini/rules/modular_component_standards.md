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

## 4. Strict 10-Layer Self-Contained Anatomy
Every module MUST contain:
1. `types/index.ts` - Strict TypeScript definitions.
2. `config/index.ts` - Scoped collection prefixes (`mod_[name]_[coll]`) and constants.
3. `context/ModuleContext.tsx` - React Context Provider for DI.
4. `services/` - Scoped Firestore/backend CRUD services with mock data fallback.
5. `api/` - Cloud Function callers / proxy.
6. `prompts/` - AI system prompts & schemas (if AI-enabled).
7. `routes/` - Internal relative sub-routing.
8. `components/` - Tailwind UI components with strict RTL support (`dir="rtl"`).
9. `StandaloneView.tsx` - Standalone test runner for Workbench.
10. `index.ts` & `README.md` - Clean public export and Firestore security rules.

## 5. Master Registration & Exporter Compatibility
- Always register the new module in:
  - `src/workbench/moduleRegistry.ts` (for Workbench development preview).
  - `src/modules/client-receiver-platform/config/index.ts` (for Client Platform Checklist Table).
- Ensure the module is exportable via `npm run export-client -- --client=X --modules=Y`.

## 6. Verification
- Always verify clean compilation with `npm run build` after changes.
