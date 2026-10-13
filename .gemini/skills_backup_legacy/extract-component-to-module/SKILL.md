---
name: extract-component-to-module
description: Extracts, decouples, and refactors existing legacy code, components, or features into a clean, portable, 10-layer isolated module with Firebase DI, Tailwind UI, and Workbench registration.
---

# Extract Component to Isolated Module Skill (The Harvester)

## Purpose
This skill guides the agent when extracting legacy code from an existing project or file into a completely standalone, portable module under `src/modules/[module-name]/`.

## Step-by-Step Extraction Workflow

### 1. Code Analysis & Dependency Audit
- Inspect the source code, components, state management, styles, Firestore queries, and backend calls.
- Identify external dependencies (e.g. icons, date-fns, specific UI libraries) and verify compatibility.
- Determine the domain boundaries and give the module a descriptive kebab-case name (e.g. `billing-center`, `task-kanban`).

### 2. Scaffold & Layer Allocation
Create `src/modules/[module-name]/` using the standard 10-layer anatomy:
1. **Types (`types/index.ts`)**: Extract all interfaces, data models, props, and DTOs. Ensure strict typing.
2. **Configuration (`config/index.ts`)**: Define scoped Firestore collection names using `mod_[module-name]_[coll]` prefix.
3. **Context (`context/ModuleContext.tsx`)**: Build a dedicated Provider for Firebase app injection, user context, and overrides.
4. **Data Service (`services/firestoreService.ts`)**: Isolate all Firestore read/write operations from UI components into reusable async service functions.
5. **API & Cloud Functions (`api/functionsApi.ts`)**: Encapsulate any backend Cloud Function triggers or external endpoints.
6. **AI Prompts (`prompts/index.ts`)**: Extract system prompts or LLM instructions if the component uses AI features.
7. **Sub-Routing (`routes/ModuleRoutes.tsx`)**: Organize internal navigation with `<Routes>` and relative paths.
8. **UI Components (`components/`)**: Refactor UI components to Tailwind CSS, ensuring strict RTL alignment, loading states, and error boundaries.
9. **Standalone Runner (`StandaloneView.tsx`)**: Create an isolated test wrapper that loads `.env` for workbench live preview.
10. **Public Export (`index.ts` & `README.md`)**: Export public components/types and document Firestore Security Rules.

### 3. Register in Workbench
Update `src/workbench/moduleRegistry.ts`:
- Import the new module's `StandaloneView`.
- Add an entry to `REGISTERED_MODULES` with `id`, `name`, `description`, `component`, `route`, and `collectionPrefix`.

### 4. Verification & Validation
1. Run `npm run build` to verify clean TypeScript compilation.
2. Ensure no sibling module imports or global state leaks exist.
3. Verify RTL display, component interactions, and Firestore connectivity in the Workbench.
