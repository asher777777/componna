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

### Step 2: Scaffold the 10-Layer Anatomy
Create `src/modules/[module-name]/`:
1. `types/index.ts`: Strict TypeScript interfaces, props, and data models (NO `any`).
2. `config/index.ts`: Define module ID, title, scoped Firestore collection names (`mod_[module]_[coll]`), and defaults.
3. `context/ModuleContext.tsx`: React Context for Firebase app DI, tenant scope, and state.
4. `services/`: Scoped Firestore service with live/offline mock dataset fallback.
5. `api/`: Cloud Function endpoints and backend callers.
6. `prompts/`: AI system prompts, few-shot examples, and Gemini schemas (if AI features are used).
7. `routes/`: Internal sub-routing with relative paths.
8. `components/`: UI components with Tailwind CSS, RTL layout (`dir="rtl"`), and responsive styling.
9. `StandaloneView.tsx`: Workbench test runner with local `.env` fallback.
10. `index.ts` & `README.md`: Public exports and documented Firestore security rules.

### Step 3: Register in Workbench and Client Platform
1. **Workbench**: Add entry to `REGISTERED_MODULES` in `src/workbench/moduleRegistry.ts`.
2. **Client Platform Shell**: Add entry to `MASTER_AVAILABLE_MODULES` in `src/modules/client-receiver-platform/config/index.ts`.

### Step 4: Verification & Compilation
1. Run `npm run build` to verify clean TypeScript compilation with zero broken references.
2. Test exportability via `node scripts/export-client-platform.js --client=test --modules=[module-name]`.
