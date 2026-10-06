---
name: develop-modular-component
description: Guides the end-to-end creation, isolation, and integration of a new self-contained, exportable full-stack component with Contract-First decoupling, Host Capabilities DI, EventBus, RTL Tailwind UI, and Workbench registration.
---

# Develop Modular Component Skill (The Component Architect)

## Purpose
This skill instructs the agent on how to build, isolate, and register any new component or feature in this workspace, ensuring it can operate 100% standalone and be selectively exported to client platforms without causing broken imports or dependencies.

## Step-by-Step Development Workflow

### Step 1: Contract & Capability Planning
1. Identify if the new module:
   - **Provides a capability** (e.g. `media-picker`, `lead-capture`, `payment-gateway`). If so, define the interface in `src/core/contracts/index.ts`.
   - **Consumes a capability** (e.g. needs to pick an image or save a contact). Use `useHostCapabilities().getCapability<Contract>('name')` with a built-in fallback.
   - **Emits or listens to events**. Register the event payload in `CoreEventMap` in `src/core/contracts/index.ts`.

### Step 2: Scaffold the 11-Layer Anatomy & Present Immediate Skills
Create `src/modules/[module-name]/`:
1. `types/index.ts`: Strict TypeScript interfaces, props, and data models (NO `any`).
2. `config/index.ts`: Define module ID, title, scoped Firestore collection names (`mod_[module]_[coll]`), and defaults.
3. `context/ModuleContext.tsx`: React Context for Firebase app DI, tenant scope, and state.
4. `hooks/`: Internal scoped React hooks (e.g. `use[Module]State.ts`, `index.ts`).
5. `services/`: Scoped Firestore service with live/offline mock dataset fallback.
6. `api/functionsApi.ts`: Cloud Function endpoints and backend callers.
7. `prompts/index.ts`: AI system prompts, few-shot examples, and Gemini schemas (if AI features are used).
8. `routes/ModuleRoutes.tsx`: Internal sub-routing with relative paths.
9. `components/`: UI components with Tailwind CSS, RTL layout (`dir="rtl"`), and responsive styling.
10. `StandaloneView.tsx`, `index.ts` & `README.md`: Public exports, Workbench standalone view, and documented Firestore security rules.
11. `.gemini/` (`rules.md` & `skills.md`):
    - **`rules.md`**: Strict module-specific isolation rules, prohibited sibling imports, host capabilities consumed/provided, and EventBus topics.
    - **`skills.md`**: Core agent capabilities, immediate development skills, and checklist.

**MANDATORY AGENT ACTION UPON MODULE CREATION**:
When creating a new module, the agent MUST immediately present to the user:
- The urgent/critical skills needed for this module.
- The isolation boundaries and consumed/provided capabilities.
- And generate the corresponding `.gemini/rules.md` and `.gemini/skills.md` inside the module.

### Step 3: Register in Workbench via Dynamic React.lazy and Client Platform
1. **Workbench**: Add entry to `REGISTERED_MODULES` in `src/workbench/moduleRegistry.ts` using **ONLY** dynamic `React.lazy()` import:
   ```typescript
   const MyModuleStandaloneView = React.lazy(() =>
     import('../modules/my-module').then((m) => ({ default: m.MyModuleStandaloneView }))
   );
   ```
2. **Client Platform Shell**: Add entry to `MASTER_AVAILABLE_MODULES` in `src/modules/client-receiver-platform/config/index.ts`.

### Step 4: Verification & Compilation
1. Run `npm run build` to verify clean TypeScript compilation with zero broken references.
2. Test exportability via `node scripts/export-client-platform.js --client=test --modules=[module-name]`.

