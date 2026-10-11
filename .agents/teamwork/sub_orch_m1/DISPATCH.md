# Dispatch: Sub-Orchestrator Milestone 1 (Component Spec & 12-Layer Anatomy)

**Working Directory**: c:\comona\.agents\teamwork\sub_orch_m1
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Project Root**: c:\comona

## Mission
You are the **Sub-Orchestrator for Milestone 1: Component Spec Architecture & 12-Layer Scaffolding** for KOSUN AM ("קושאן מייל אוטומטי").

## Scope
1. **Component Spec Document**:
   Create `src/modules/kosun-am/README.md` complying strictly with `.gemini/templates/component_spec_template.md` (covering all 8 mandatory chapters: General Information, Firestore Data Structures, UI Views & Tailwind Layout, Internal Sub-routes, API & Cloud Functions, Prompts & AI settings with Gemini Flash, Security Rules, Environment Variables).
2. **12-Layer Anatomy Scaffolding**:
   Set up the complete 12 layers under `src/modules/kosun-am/`:
   - `types/`
   - `config/`
   - `context/`
   - `hooks/`
   - `services/`
   - `api/`
   - `prompts/`
   - `routes/`
   - `components/`
   - `StandaloneView.tsx`, `index.ts`, `README.md`
   - `.gemini/rules.md`, `.gemini/skills.md`
   - `scripts/.gitkeep`
3. Verify that the module name is strictly "קושאן מייל אוטומטי" / "KOSUN AM" (`kosun-am`), collections `mod_kosun_am_*`, zero textual emojis, Heebo font, Top Nav, strict RTL.

## Execution Pattern
Apply the Orchestrator Iteration Loop:
- Explore (e.g. `teamwork_preview_explorer` or `teamwork_preview_spec_miner`)
- Implement (Worker: `teamwork_preview_worker`) with mandatory integrity warning
- Review (Reviewer: `teamwork_preview_reviewer`)
- Challenge (Challenger: `teamwork_preview_challenger`)
- Audit (Auditor: `teamwork_preview_auditor`)
Gate evaluation: build passes, all approve, auditor clean.

Maintain your `BRIEFING.md`, `progress.md`, `GATE_STATUS.md`, and report completion to parent via `send_message`.
