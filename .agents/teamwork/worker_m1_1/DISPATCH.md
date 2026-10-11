# Task Assignment: Worker Milestone 1 (Component Spec Architecture & 12-Layer Scaffolding)

**Working Directory**: c:\comona\.agents\teamwork\worker_m1_1
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Survey Spec Report**: c:\comona\.agents\teamwork\spec_miner_survey_1\survey_spec_report.md
**Survey Backend Report**: c:\comona\.agents\teamwork\explorer_survey_2\survey_backend_report.md
**Survey Frontend Report**: c:\comona\.agents\teamwork\explorer_survey_3\survey_frontend_report.md
**Project Root**: c:\comona

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own and write:
- `src/modules/kosun-am/README.md`
- `src/modules/kosun-am/.gemini/rules.md`
- `src/modules/kosun-am/.gemini/skills.md`
- `src/modules/kosun-am/scripts/.gitkeep`
- Scaffolding skeleton for the 12 layers under `src/modules/kosun-am/` (`types/`, `config/`, `context/`, `hooks/`, `services/`, `api/`, `prompts/`, `routes/`, `components/`, `StandaloneView.tsx`, `index.ts`).
Do NOT write to tests or other modules.

## Objectives
1. Read `c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md` completely.
2. Produce `src/modules/kosun-am/README.md` complying strictly with `.gemini/templates/component_spec_template.md`. Must contain all 8 mandatory chapters:
   - פרק 1: פרטים כלליים (General Information) — Module ID `kosun-am`, Hebrew: "קושאן מייל אוטומטי", English: "KOSUN AM", collections `mod_kosun_am_*`.
   - פרק 2: מבנה נתוני Firestore (Collections & Data Schema) — detailed schemas for `mod_kosun_am_campaigns`, `mod_kosun_am_templates`, `mod_kosun_am_automations`, `mod_kosun_am_logs` with tenant scoping under `tenants/{tenantId}/`.
   - פרק 3: ממשק משתמש ומסכים (UI Views & Tailwind Layout) — Kosun 2026 Bento Grid, Mobile First, Top Nav only, Heebo font, Lucide icons (zero emojis), strict RTL wrapper `<div dir="rtl" style="text-align: right;">`, collapsible stats accordion, minimal smart tooltips `(i)`.
   - פרק 4: ניתובים פנימיים (Internal Sub-routes) — `""`, `"new"`, `":id"`, `"templates"`, `"automations"`, `"logs"`.
   - פרק 5: שכבת API ופונקציות ענן (Firebase Cloud Functions / Backend) — Cloud Functions endpoints for SMTP proxy and campaign dispatch.
   - פרק 6: פרומפטים והגדרות AI (Prompts & LLM Settings) — Gemini Flash models (`gemini-3.8-flash`, `gemini-3.5-flash`), Brand DNA contract, cost tracking.
   - פרק 7: חוקי אבטחה של פיירבייס (Firestore Security Rules).
   - פרק 8: משתני סביבה נדרשים ב-.env.
3. Scaffold the complete 12-layer directory structure under `src/modules/kosun-am/`:
   - `types/index.ts`
   - `config/index.ts`
   - `context/ModuleContext.tsx`
   - `hooks/useKosunAmData.ts` & `hooks/useKosunAmActions.ts`
   - `services/emailFirestoreService.ts`, `services/emailDispatchService.ts`, `services/kosaiEmailAiService.ts`
   - `api/functionsApi.ts`
   - `prompts/index.ts`
   - `routes/ModuleRoutes.tsx`
   - `components/KosunAmMainView.tsx`, `components/EmailEditorModal.tsx`, `components/AutomationBuilderView.tsx`, `components/CampaignListCard.tsx`, `components/DeliveryLogsDrawer.tsx`
   - `StandaloneView.tsx` & `index.ts`
   - `.gemini/rules.md` & `.gemini/skills.md`
   - `scripts/.gitkeep`
4. Run `npm run build` and ensure 0 compilation errors.
5. Write your handoff report in `c:\comona\.agents\teamwork\worker_m1_1\handoff.md` with verification commands and results.


## 2026-10-11T11:50:50Z
You are a teamwork_preview_worker implementing Milestone 1: Component Spec Architecture & 12-Layer Scaffolding for KOSUN AM.
Working directory: c:\comona\.agents\teamwork\worker_m1_1
Read c:\comona\.agents\teamwork\worker_m1_1\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.

Tasks:
1. Create `src/modules/kosun-am/README.md` containing the complete 8-chapter component spec adhering to `.gemini/templates/component_spec_template.md`.
2. Scaffold the complete 12 layers under `src/modules/kosun-am/`:
   - types/index.ts
   - config/index.ts
   - context/ModuleContext.tsx
   - hooks/useKosunAmData.ts & hooks/useKosunAmActions.ts
   - services/emailFirestoreService.ts, services/emailDispatchService.ts, services/kosaiEmailAiService.ts
   - api/functionsApi.ts
   - prompts/index.ts
   - routes/ModuleRoutes.tsx
   - components/KosunAmMainView.tsx, components/EmailEditorModal.tsx, components/AutomationBuilderView.tsx, components/CampaignListCard.tsx, components/DeliveryLogsDrawer.tsx
   - StandaloneView.tsx & index.ts
   - .gemini/rules.md & .gemini/skills.md
   - scripts/.gitkeep
3. Run `npm run build` to verify 0 compilation errors.
4. Write handoff report in `c:\comona\.agents\teamwork\worker_m1_1\handoff.md`.
Send message to caller upon completion.
