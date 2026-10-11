# Task Assignment: E2E Test Suite Architect & Writer (Dual Track)

**Working Directory**: c:\comona\.agents\teamwork\test_writer_e2e_1
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Project Root**: c:\comona

## Mission
You are the **E2E Test Writer** for KOSUN AM ("קושאן מייל אוטומטי").
Your responsibility is the **E2E Testing Track (requirement-driven, opaque-box)**.

## Write Ownership
You exclusively own and write:
- `c:\comona\TEST_INFRA.md`
- `c:\comona\TEST_READY.md`
- `tests/e2e/kosun-am/` (or `src/modules/kosun-am/__tests__/`) test files and runners.
Do NOT modify production source code in `src/`.

## Requirements & Methodology
1. Read `c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md` and `PROJECT.md` completely.
2. Design opaque-box test cases derived strictly from user requirements and `PROJECT.md § Feature Inventory` (not implementation internals).
3. Implement the 4-tier systematic approach:
   - **Tier 1 - Feature Coverage**: >=5 test cases per feature covering happy-path in isolation.
   - **Tier 2 - Boundary & Corner Cases**: >=5 test cases per feature at domain limits (empty fields, huge payloads, network disconnect, missing API keys, multi-tenant boundaries).
   - **Tier 3 - Cross-Feature Combinations**: Pairwise interaction tests (e.g., CRM lead creation trigger -> Automation pipeline -> Multi-channel email & WhatsApp dispatch -> Firestore delivery logs).
   - **Tier 4 - Real-World Application Scenarios**: Realistic end-to-end user journeys (Newsletter campaign launch, Form submission lead drip nurture, Ambassador onboarding campaign).
4. Create `TEST_INFRA.md` at project root with test runner command, test layout, and pass/fail semantics.
5. Create executable test files (using the project's test framework or node test runner) that can be run via a single command (e.g. `npm test` or a dedicated test script).
6. When the full test suite is created, publish `TEST_READY.md` at project root with the test summary table.
7. Run the test runner, document results in `handoff.md`, and notify the orchestrator.


## 2026-10-11T11:50:50Z
[Message] sender=dbb276bf-78f9-422a-9c00-cd299ccc30cb priority=MESSAGE_PRIORITY_HIGH
You are a teamwork_preview_test_writer building the E2E Test Suite (Dual Track) for KOSUN AM ("קושאן מייל אוטומטי").
Working directory: c:\comona\.agents\teamwork\test_writer_e2e_1
Read c:\comona\.agents\teamwork\test_writer_e2e_1\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.
Project blueprint: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md

Tasks:
1. Design opaque-box test cases for KOSUN AM covering Tiers 1-4:
   - Tier 1: Feature Coverage (>=5 test cases per feature)
   - Tier 2: Boundary & Corner Cases (>=5 test cases per feature)
   - Tier 3: Cross-Feature Combinations (pairwise interactions: CRM, Form, WhatsApp, Email, Logs)
   - Tier 4: Real-World Scenarios (>=5 application-level workflows)
2. Create `TEST_INFRA.md` at project root with test methodology and commands.
3. Create executable test files in `tests/e2e/kosun-am/` or similar test directory.
4. When tests are constructed, publish `TEST_READY.md` at project root with summary breakdown.
5. Document everything in `c:\comona\.agents\teamwork\test_writer_e2e_1\handoff.md`.
Send message to caller upon completion.
