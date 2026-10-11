# BRIEFING — 2026-10-11T12:17:00Z

## Mission
Implement Milestone 2: Backend, Contracts, Multi-Tenancy & EventBus for KOSUN AM ("קושאן מייל אוטומטי").

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: c:\comona\.agents\teamwork\worker_m2_1
- Original parent: dbb276bf-78f9-422a-9c00-cd299ccc30cb
- Milestone: Milestone 2: Backend, Contracts, Multi-Tenancy & EventBus

## 🔒 Key Constraints
- Strict isolation: zero direct cross-module imports.
- Multi-tenancy: useTenantScope().getScopedCollectionRef(...) under tenants/{tenantId}/. Zero global flat collections.
- Zero localStorage API keys. Use tenantApiKeys.ts with isModuleEntitled and getModuleApiKeys.
- Triple-sync collection registration: collections.ts, db-collections-hub/config/index.ts, and seedData.ts.
- Naming: English "KOSUN AM", Hebrew "קושאן מייל אוטומטי", collections mod_kosun_am_*, zero textual emojis (Lucide icons only).
- EventBus listeners: crm:lead:created, smart_form:submitted, campaign:ambassador:created.
- EventBus publishers: email:campaign:sent, email:automation:triggered, email:delivery:failed.
- Zero cheating: no hardcoding test results or creating facade implementations.

## Current Parent
- Conversation ID: dbb276bf-78f9-422a-9c00-cd299ccc30cb
- Updated: not yet

## Task Summary
- **What to build**: Complete backend and contracts layer for KOSUN AM module, including types, config, scoped Firestore service, multi-provider email dispatch service, cloud function proxy, ModuleContext with EventBus sync, and collection registrations.
- **Success criteria**: TypeScript build passes with zero errors (`npm run build`), all 105 tests in `run_e2e_tests.ts` pass, all audit gates satisfied.
- **Interface contracts**: `c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md`
- **Code layout**: `c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md` § Code Layout

## Key Decisions Made
- [TBD]

## Artifact Index
- `c:\comona\.agents\teamwork\worker_m2_1\BRIEFING.md` — persistent memory
- `c:\comona\.agents\teamwork\worker_m2_1\progress.md` — heartbeat and progress tracker
- `c:\comona\.agents\teamwork\worker_m2_1\handoff.md` — final handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Untested
- **Pending issues**: Implement M2 requirements

## Quality Status
- **Build/test result**: Pending
- **Lint status**: 0 violations
- **Tests added/modified**: Pending verification of 105 E2E tests

## Loaded Skills
- **Source**: C:\Users\ovt57\.gemini\config\skills\cashwan-branding\SKILL.md
- **Local copy**: c:\comona\.agents\teamwork\worker_m2_1\cashwan-branding.md
- **Core methodology**: Kosun brand guidelines, Hebrew RTL with English preservation, living entity persona ("קושאן דואג..."), Bento Grid, zero textual emojis (Lucide only).
