# Task Assignment: Forensic Auditor Milestone 3 (Integrity Forensics)

**Working Directory**: c:\comona\.agents\teamwork\auditor_m3_1
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Worker Handoff Report**: c:\comona\.agents\teamwork\worker_m3_1\handoff.md
**Project Root**: c:\comona

## Role & Mission
You are the Forensic Auditor for Milestone 3 of KOSUN AM ("קושאן מייל אוטומטי").
Your mission is to conduct an independent, uncompromised integrity audit of all Milestone 3 changes in `src/modules/kosun-am/` and `src/workbench/`.

⚠️ **CRITICAL DIRECTIVE**: You hold a **BINARY VETO**. If you find cheating, mock fallback data, dummy facades, hardcoded outputs, or integrity violations, you MUST render **INTEGRITY VIOLATION**. Only if all integrity checks pass cleanly may you render **CLEAN**.

## Mandatory Checks
1. **ZERO MOCK DATA**:
   - Verify no dummy data or fake arrays are returned in production code or components.
   - Verify empty state displays cleanly when Firestore collections return `[]`.
2. **ZERO LOCALSTORAGE / SESSIONSTORAGE**:
   - Verify no `localStorage` or `sessionStorage` usage for API keys or module state.
3. **100% REAL FIRESTORE**:
   - Verify all mutations (create/update campaign, save automation, save template) write genuinely to Firestore via `useTenantScope()`.
4. **ZERO DIRECT CROSS-MODULE IMPORTS**:
   - Check that `src/modules/kosun-am/` does NOT import from sibling modules in `src/modules/*`.
5. **NAMING INTEGRITY**:
   - Verify Hebrew: "קושאן" / "קושאן מייל אוטומטי".
   - Verify English: "KOSUN AM" (uppercase).
   - Verify collections prefix: `mod_kosun_am_*`.
   - Verify NO "cashwan" in user-facing texts.
6. **BUILD & TESTS**:
   - Run `npm run build` and `node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts`.

## Deliverables
- Write `handoff.md` with:
  1. Observation
  2. Logic Chain
  3. Caveats
  4. Conclusion: **CLEAN** or **INTEGRITY VIOLATION**
  5. Verification Method
- Send completion message to caller with your verdict.


## 2026-10-11T13:14:23Z
You are Forensic Auditor for Milestone 3 of KOSUN AM ("קושאן מייל אוטומטי").
Working directory: c:\comona\.agents\teamwork\auditor_m3_1
Read c:\comona\.agents\teamwork\auditor_m3_1\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.
Conduct independent forensic integrity audit on Milestone 3:
- Verify ZERO MOCK DATA (empty collections return []).
- Verify ZERO LOCALSTORAGE / SESSIONSTORAGE.
- Verify 100% REAL FIRESTORE scoping under tenants/{tenantId}/mod_kosun_am_*.
- Verify ZERO direct cross-module imports.
- Verify naming integrity (Hebrew "קושאן", English "KOSUN AM", collections "mod_kosun_am_*", zero "cashwan" in user copy).
Run `npm run build` and `node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts`.
Render verdict: CLEAN or INTEGRITY VIOLATION.
Write handoff.md and send message to caller.
