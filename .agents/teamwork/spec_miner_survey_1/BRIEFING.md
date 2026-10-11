# BRIEFING — 2026-10-11T11:40:00Z

## Mission
Survey project specifications, 12-layer anatomy, component spec template, 5 audit gates, and module conventions for KOSUN AM ("קושאן מייל אוטומטי").

## 🔒 My Identity
- Archetype: teamwork_preview_spec_miner
- Roles: Specification Miner, Domain Expert (Kosun Architecture & Branding)
- Working directory: c:\comona\.agents\teamwork\spec_miner_survey_1
- Original parent: dbb276bf-78f9-422a-9c00-cd299ccc30cb
- Milestone: Survey & Specification Phase for KOSUN AM module

## 🔒 Key Constraints
- Read-only investigation: probe, document, discover. Do NOT implement source code in production dirs.
- Final official naming directive: Hebrew "קושאן מייל אוטומטי", English "KOSUN AM", directory `src/modules/kosun-am/`, collections `mod_kosun_am_*`.
- Strict multi-tenancy via `useTenantScope().getScopedCollectionRef(...)` (no global flat collections).
- Zero direct cross-module imports (EventBus and HostCapabilities only).
- 12-layer anatomy structure per standard module blueprint.
- 5 audit gates per system_audit_workflow.md.
- Kosun 2026 branding: Heebo font, Bento Grid, Top Nav (no sidebars), RTL alignment, zero textual emojis (Lucide icons only), collapsible secondary stats, living entity persona.
- Output required: `survey_spec_report.md` and `handoff.md`.

## Current Parent
- Conversation ID: dbb276bf-78f9-422a-9c00-cd299ccc30cb
- Updated: 2026-10-11T11:38:22Z

## Task Summary
- **What to survey**:
  1. `.gemini/templates/component_spec_template.md` (mandatory sections, structure).
  2. `system_audit_workflow.md` (5 audit gates & acceptance standards).
  3. Existing modules in `src/modules/` (12-layer anatomy, types, exports, StandaloneView, error boundary, context).
  4. Integration contracts (`src/core/contracts/collections.ts`, module registry, event bus).
- **Success criteria**: Comprehensive `survey_spec_report.md` with full feature discovery tables, edge cases, 12-layer anatomy breakdown, 5 audit gates criteria, and self-contained `handoff.md`.
- **Interface contracts**: `src/core/contracts/collections.ts`, EventBus contracts, HostCapabilities.
- **Code layout**: `src/modules/kosun-am/`

## Key Decisions Made
- Confirmed module identity as `kosun-am` ("קושאן מייל אוטומטי" / "KOSUN AM") and collection prefix as `mod_kosun_am_*`.
- Verified 12-layer anatomy requirements from `system_audit_workflow.md` and `src/modules/_template/.gemini/rules.md`.
- Verified 5 Audit Gates and acceptance checklist criteria.
- Verified system build baseline: `npm run build` succeeds with exit code 0.
- Documented full features table (25 items) and edge cases table (10 items) in `survey_spec_report.md`.

## Artifact Index
- `cashwan-branding.md` — Local copy of branding skill instructions
- `DISPATCH.md` — Dispatch log with prompt directives
- `survey_spec_report.md` — Main specification survey report
- `handoff.md` — 5-component self-contained handoff report
- `progress.md` — Liveness heartbeat and step tracker


## Loaded Skills
- **Source**: `C:\Users\ovt57\.gemini\config\skills\cashwan-branding\SKILL.md`
- **Local copy**: `c:\comona\.agents\teamwork\spec_miner_survey_1\cashwan-branding.md`
- **Core methodology**: Living entity persona ("קושאן"), 2026 Modern Minimalist UI, Bento Grid, Top Nav only, Heebo font, Lucide icons only (no emojis), collapsible stats cards, strict RTL.
