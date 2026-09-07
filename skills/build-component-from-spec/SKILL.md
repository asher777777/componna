---
name: build-component-from-spec
description: Reads a Component Specification document (תבנית אפיון קומפוננטה) and generates a complete, self-contained, isolated React full-stack component with Firebase, Routing, API, AI Prompts, and Tailwind CSS.
---

# Build Component From Specification Skill

## Purpose
This skill instructs the agent on how to take a structured Component Specification document (such as `templates/component_spec_template.md` or any `.md` file created by the user) and generate the full 10-layer self-contained component module under `src/modules/[module-name]/`.

## Generation Workflow

### Step 1: Read & Validate the Specification
1. Parse the module name, collection prefix, Firestore schemas, UI views, sub-routes, API functions, prompts, security rules, and env requirements.
2. Confirm the module directory name in kebab-case (e.g. `src/modules/task-manager`).

### Step 2: Create the 10 Standard Module Layers
Generate each file in `src/modules/[module-name]/`:
1. **`types/index.ts`**: TypeScript interfaces for data entities, config props, collection maps, and API payloads.
2. **`config/index.ts`**: Default collection names with prefixing logic (`mod_[name]_[coll]`) and fallback resolvers.
3. **`context/ModuleContext.tsx`**: React Context Provider for dependency injection (`firebaseApp`, `customCollections`, `authContext`).
4. **`services/firestoreService.ts`**: CRUD and query operations using Firebase SDK v10/v11 with safe scoped collections.
5. **`api/functionsApi.ts`**: Cloud Functions caller with error handling and secure proxying.
6. **`prompts/index.ts`**: AI system prompts, few-shot templates, and response format schemas.
7. **`routes/ModuleRoutes.tsx`**: Sub-router managing internal views with wildcard support (`""`, `"new"`, `":id"`).
8. **`components/`**: UI components built with Tailwind CSS, RTL-aware layouts, and loading/error states.
9. **`StandaloneView.tsx`**: Development runner reading local `.env` and rendering the module with its own provider.
10. **`index.ts` & `README.md`**: Clean public export and integration guide with security rules.

### Step 3: Register in Workbench
Add the new module to `src/workbench/moduleRegistry.ts` so it immediately appears in the development dashboard sidebar.

### Step 4: Verification
Run TypeScript type-check and ensure the module compiles cleanly with no missing imports or collision risks.
