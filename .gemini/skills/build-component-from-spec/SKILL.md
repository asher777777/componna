---
name: build-component-from-spec
description: Reads a Component Specification document (תבנית אפיון קומפוננטה) and generates a complete, self-contained, isolated React full-stack component with Firebase, Routing, API, AI Prompts, and Tailwind CSS.
---

# Build Component From Specification Skill

## Purpose
This skill instructs the agent on how to take a structured Component Specification document (such as `templates/component_spec_template.md` or any `.md` file created by the user) and generate the full 11-layer self-contained component module under `src/modules/[module-name]/`, strictly enforcing the Module Monopoly principle, Root Hygiene, and passing the Gatekeeper audit.

## Generation Workflow

### Step 1: Read & Validate the Specification
1. Parse the module name, collection prefix, Firestore schemas, UI views, sub-routes, API functions, prompts, security rules, and env requirements.
2. Confirm the module directory name in kebab-case (e.g. `src/modules/task-manager`).
3. **Module Monopoly & Capability Bridge Protocol**:
   - Check if any requested feature belongs to an authoritative module (Auth -> `auth-portal`, Branding -> `brand-dna-hub`, AI -> `kosai-engine`, DB -> `db-collections-hub`, Media -> `media-gallery-hub`).
   - If an authoritative capability is needed:
     a. **NEVER** import from sibling modules (`import ... from '../sibling'` is forbidden).
     b. Import the contract interface from `src/core/contracts/` (e.g. `AiTextAssistantContract`).
     c. Consume via `useHostCapabilities().getCapability<Contract>('...')`.
     d. Build **ONLY** the UI presentation layer and provide a graceful UI fallback if the capability is unavailable.
     e. **NEVER** create direct client-side fetch calls or duplicate services!

### Step 2: Create the Standard Module Layers
Generate each file in `src/modules/[module-name]/`:
1. **`types/index.ts`**: TypeScript interfaces for data entities, config props, collection maps, and API payloads.
2. **`config/index.ts`**: Default collection names with prefixing logic (`mod_[name]_[coll]`) and fallback resolvers.
3. **`context/ModuleContext.tsx`**: React Context Provider for dependency injection (`firebaseApp`, `customCollections`, `authContext`).
4. **`hooks/`**: Scoped React hooks for module state and capability consumption.
5. **`services/firestoreService.ts`**: CRUD and query operations using `useTenantScope()` and `SYSTEM_COLLECTIONS` (real DB only, zero localStorage mocks).
6. **`api/functionsApi.ts`**: Cloud Functions caller for module-specific backend tasks (e.g. webhooks, clearing). **NEVER write Gemini API calls here!**
7. **`routes/ModuleRoutes.tsx`**: Sub-router managing internal views with wildcard support (`""`, `"new"`, `":id"`).
8. **`components/`**: UI components built with Tailwind CSS, RTL-aware layouts (`dir="rtl"`), and loading/error states.
9. **`StandaloneView.tsx`, `index.ts` & `README.md`**: Development runner, clean public export, and integration guide.
10. **`.gemini/` (`rules.md` & `skills.md`)**: Local module rules, isolation boundaries, contracts, and subagent skills.

> **CRITICAL RULE ON `prompts/`**: Do **NOT** create a `prompts/` layer in consumer components! Layer `prompts/` belongs EXCLUSIVELY to `kosai-engine`. Consumer components connect to AI strictly via `useHostCapabilities().getCapability<AiTextAssistantContract>('ai-assistant')`.

### Step 3: Register in Workbench & Platform
1. Register in `src/workbench/moduleRegistry.ts` using **dynamic lazy loading**:
   ```typescript
   const MyModuleStandaloneView = React.lazy(() =>
     import('../modules/my-module').then((m) => ({ default: m.MyModuleStandaloneView }))
   );
   ```
2. Register collections in `SYSTEM_COLLECTIONS` (`src/core/contracts/collections.ts`) and `db-collections-hub`.

### Step 4: Component Scripts Location (Root Hygiene)
- Any initialization, migration, or test scripts MUST be placed in `src/modules/[module-name]/scripts/`.
- NEVER place any scripts or test files in the root folder (`c:\comona\`).

### Step 5: Mandatory Gatekeeper Audit & Checklist
- Run `npm run gatekeeper` to verify the module against all system rules.
- Produce the certified Gatekeeper Audit Report.
- Only when all checks pass is the component approved!
