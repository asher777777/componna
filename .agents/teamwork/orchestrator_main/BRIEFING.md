# BRIEFING — 2026-10-11T12:05:50Z

## Mission
Orchestrate end-to-end design, implementation, testing, audit, and deployment of KOSUN AM ("קושאן מייל אוטומטי" - Smart Email & Multi-Channel Automation Hub) under src/modules/kosun-am/.

## 🔒 My Identity
- Archetype: orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: c:\comona\.agents\teamwork\orchestrator_main
- Original parent: parent (Sentinel)
- Original parent conversation ID: fbcf8daf-6266-44a2-a55a-fd34e563a211

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
1. **Decompose**: Decomposed into 5 milestones + Dual Track E2E testing.
2. **Dispatch & Execute**: Direct iteration loop per milestone + E2E testing track.
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate.
4. **Succession**: At 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Survey & Architecture Blueprint [done]
  2. Dual Track: E2E Test Suite (Tiers 1-4) [done - 105 tests passing 100%]
  3. Milestone 1: Spec Architecture & 12-Layer Scaffolding [gate in-progress]
  4. Milestone 2: Backend, Contracts, Multi-Tenancy & EventBus [pending]
  5. Milestone 3: Kosun 2026 UI, Visual Campaign & Workflow Builder [pending]
  6. Milestone 4: AI Copilot Integration & 5 Audit Gates [pending]
  7. Milestone 5: E2E Verification, Adversarial Hardening & Git Deployment [pending]
- **Current phase**: 1 (Milestone 1 Gate Verification)
- **Current focus**: Reviewers (2), Challengers (2), Auditor (1) running

## 🔒 Key Constraints
- DISPATCH-ONLY: Never write, modify, or create source code files directly. Never run build/test commands yourself.
- Module naming strictly: Hebrew "קושאן", English "KOSUN" (uppercase, e.g. "KOSUN AM"), module directory `kosun-am` (`src/modules/kosun-am/`), collections `mod_kosun_am_*`. Absolutely NO "cashwan".
- Living entity persona: "קושאן" is a living, intelligent partner ("קושאן דואג...", "קושאן מכין...").
- 12-layer anatomy under `src/modules/kosun-am/`.
- Strict multi-tenancy isolation via `useTenantScope().getScopedCollectionRef(...)`.
- Zero direct cross-module imports; use EventBus & HostCapabilities.
- Kosun 2026 branding: Mobile First, Bento Grid, Top Nav only, Heebo font, Lucide icons only (zero textual emojis), strict RTL wrapper `<div dir="rtl" style="text-align: right;">`.
- Gemini Flash authorized models only (e.g. Gemini 3.8 / 3.5 Flash).
- Local storage API keys strictly forbidden; use `tenantApiKeys.ts`.
- Forensic audit binary veto: CLEAN audit required.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: fbcf8daf-6266-44a2-a55a-fd34e563a211
- Updated: not yet

## Key Decisions Made
- Final official name: "קושאן מייל אוטומטי" / "KOSUN AM" (`src/modules/kosun-am/`), collections `mod_kosun_am_*`.
- E2E Testing Track completed (105 tests passing 100%).
- Milestone 1 Worker completed implementation with clean build; gate verification dispatched.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| spec_miner_survey_1 | teamwork_preview_spec_miner | Phase 0: Spec survey | completed | 42e183e9-4ba8-4e44-b493-ef0a01c14eb2 |
| explorer_survey_2 | teamwork_preview_explorer | Phase 0: Backend survey | completed | 2cd1da4e-44df-420f-94be-89ab7f61bff5 |
| explorer_survey_3 | teamwork_preview_explorer | Phase 0: UI survey | completed | c3ac0607-b9bf-414d-af46-df2dcc807279 |
| worker_m1_1 | teamwork_preview_worker | Milestone 1: 12-layer scaffolding | completed | eea4b777-18e6-41dd-b282-aeb06d8e286e |
| test_writer_e2e_1 | teamwork_preview_test_writer | Dual Track: E2E Test Suite | completed | 4c06313a-5de7-47a3-b5fd-58e015f2403f |
| reviewer_m1_1 | teamwork_preview_reviewer | Milestone 1: Review 1 | in-progress | bd9ff0a4-7c83-402f-a34c-6ab39bd8007e |
| reviewer_m1_2 | teamwork_preview_reviewer | Milestone 1: Review 2 | in-progress | f3a74800-7770-4b61-8590-607886e546fb |
| challenger_m1_1 | teamwork_preview_challenger | Milestone 1: Challenge 1 | in-progress | c9b65f50-c0b4-408b-a880-f3e992eb8e0b |
| challenger_m1_2 | teamwork_preview_challenger | Milestone 1: Challenge 2 | in-progress | 9bea2b7d-9f71-427b-ba34-17add4f11f6e |
| auditor_m1_1 | teamwork_preview_auditor | Milestone 1: Forensic Audit | in-progress | ce986c9c-5313-4aea-a676-4cc79a71c115 |

## Succession Status
- Succession required: no
- Spawn count: 10 / 16
- Pending subagents: bd9ff0a4-7c83-402f-a34c-6ab39bd8007e, f3a74800-7770-4b61-8590-607886e546fb, c9b65f50-c0b4-408b-a880-f3e992eb8e0b, 9bea2b7d-9f71-427b-ba34-17add4f11f6e, ce986c9c-5313-4aea-a676-4cc79a71c115
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-24
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md — Original User Request & Requirements
- c:\comona\.agents\teamwork\orchestrator_main\DISPATCH.md — Incoming Dispatch Messages
- c:\comona\.agents\teamwork\orchestrator_main\progress.md — Progress & Heartbeat
- c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md — Global Project Blueprint
- c:\comona\.agents\teamwork\orchestrator_main\GATE_STATUS.md — Gate Verdict Tracking
- c:\comona\TEST_INFRA.md — E2E Test Suite Infrastructure
- c:\comona\TEST_READY.md — E2E Test Readiness Declaration (105 tests passing)
