# Project Rule: Modular Boundaries & Anti-Spaghetti Architecture

This rule strictly governs all code generation, refactoring, and component creation in this workspace.

## 1. Strict Module Boundary & Zero Cross-Imports
- Every module under `src/modules/[module-name]/` is an isolated, autonomous entity.
- **NEVER** import internal files from sibling modules (e.g. `import { X } from '../other-module/components/Y'` is FORBIDDEN).
- If module A needs to interact with module B, it must do so strictly via public props, events, or shared context provided by the host application.
- Each module MUST expose only its clean public API via `src/modules/[module-name]/index.ts`.

## 2. Dependency Injection (Firebase & Auth)
- NEVER hardcode Firebase credentials or global singleton instances inside feature module components.
- Modules must accept their Firebase context, authenticated user, and configuration via their dedicated `<ModuleProvider>`.
- Local standalone testing must use `StandaloneView.tsx` with environment variables.

## 3. Firestore Namespacing & Zero Collision
- Every module must maintain its collection names in `config/index.ts`.
- All collections must use module-scoped prefixes (e.g. `mod_[module-name]_[collection]`) or support a tenant prefix (`tenant_{id}_...`).
- Module consumers can override collection names via `customCollections` prop.

## 4. Strict 10-Layer Anatomy
Every feature module must strictly adhere to the standard 10-layer structure:
1. `types/index.ts` - Strict TypeScript types and interfaces (no `any`).
2. `config/index.ts` - Collection names and fallback defaults.
3. `context/ModuleContext.tsx` - React Context for DI and state.
4. `services/firestoreService.ts` - Scoped CRUD and database operations.
5. `api/functionsApi.ts` - Cloud Function calls & proxying.
6. `prompts/index.ts` - AI/LLM system prompts & response schemas.
7. `routes/ModuleRoutes.tsx` - Sub-routes with wildcard support.
8. `components/` - Tailwind UI components with RTL and responsive design.
9. `StandaloneView.tsx` - Isolated runner for the Workbench.
10. `index.ts` & `README.md` - Public entry point and security rules.

## 5. UI, RTL & Accessibility Standards
- All UI components must support RTL layout (`dir="rtl"`) with proper text alignment and directional icons.
- Use Tailwind CSS with scoped styling to prevent global CSS leaks.
- Ensure loading, empty, and error states are handled gracefully in all UI views.
