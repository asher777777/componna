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
- **Cross-Module Data Ingestion**: במידה ופונקציית הרכיב היא שאיבת נתונים מרכיב אחר והצגתם – חובה לבנות את השאילתה רק לאחר לימוד מדויק של הפרמטרים, המבנה והשדות שנמצאים בקולקציה של הרכיב שמייצא את הנתונים או מקבל אותם. אין לנחש שדות!

## 4. Standard Component Anatomy (אנטומיית הרכיב התקנית)
Every feature module must strictly adhere to the standard isolated structure:
1. `types/index.ts` - Strict TypeScript types and interfaces (no `any`).
2. `config/index.ts` - Collection names and fallback defaults.
3. `context/ModuleContext.tsx` - React Context for DI and state.
4. `hooks/` - Internal scoped React hooks.
5. `services/firestoreService.ts` - Scoped CRUD and database operations under `useTenantScope()`.
6. `api/functionsApi.ts` - Cloud Function calls & proxying for module-specific backend tasks (e.g. webhooks, clearing). **אסור לכלול כאן קריאות ל-Gemini או מנועי AI!**
7. `routes/ModuleRoutes.tsx` - Sub-routes with wildcard support.
8. `components/` - Tailwind UI components with RTL and responsive design.
9. `StandaloneView.tsx`, `index.ts` & `README.md` - Isolated runner, clean export, and documentation.
10. `.gemini/` (`rules.md` & `skills.md`) - Module-specific rules and agent skills.

> **בלעדיות שכבת ה-AI**: שכבת `prompts/` שייכת **אך ורק ל-`kosai-engine`**. רכיבים רגילים אינם יוצרים שכבת פרומפטים ואינם פונים ישירות למודלים, אלא מתחברים דרך `useHostCapabilities().getCapability<AiTextAssistantContract>('ai-assistant')`.

## 5. Module Monopoly & Capability Bridge (סמכות בלעדית)
- לכל תחום מערכתי יש סמכות בלעדית יחידה:
  - התחברות והרשאות: `auth-portal` (סמכות בלעדית לסשן משתמשים והרשאות).
  - הגדרות ומיתוג: `brand-dna-hub` (סמכות בלעדית לשפת מותג, סגנון וערכים).
  - בינה מלאכותית: `kosai-engine` ו-Cloud Functions (סמכות בלעדית ל-Gemini).
  - מסד נתונים וסנכרון: `db-collections-hub` (סמכות בלעדית לקולקציות ו-seed).
  - מדיה וקבצים: `media-gallery-hub` / `media-vault`.
- Never duplicate services or capabilities owned by authoritative modules.
- Consume sibling capabilities strictly via `useHostCapabilities()`.
- **ללא פולבאק ל-AI**: בעת שגיאה ב-AI אין לבצע פולבאק אוטומטי, אלא להציג הודעה ברורה ונעימה למשתמש הקצה בעברית. הרכיב לעולם לא קורס.

## 6. Root Directory Hygiene & Component Scripts
- NEVER create files, scripts, or test utilities in the root project folder.
- All component-related scripts belong in `src/modules/[module-name]/scripts/`.
- Temporary scratch scripts belong strictly in `scratch/`.

## 7. UI, RTL & Accessibility Standards
- All UI components must support RTL layout (`dir="rtl"`) with proper text alignment and directional icons.
- Use Tailwind CSS with scoped styling to prevent global CSS leaks.
- Ensure loading, empty, and error states are handled gracefully in all UI views.

## 8. Mandatory Gatekeeper Audit
- Before finalizing any module task, run `npm run gatekeeper` and provide a certified audit report.
