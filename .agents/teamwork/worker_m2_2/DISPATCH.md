# Task Assignment: Worker Milestone 2 (Iteration 2 Remediation)

**Working Directory**: c:\comona\.agents\teamwork\worker_m2_2
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Reviewer 2 Handoff**: c:\comona\.agents\teamwork\reviewer_m2_2\handoff.md
**Project Root**: c:\comona

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own and write:
- `src/modules/kosun-am/api/functionsApi.ts`
- `src/core/contracts/index.ts`
- `src/core/connection/tenantApiKeys.ts`
- `src/modules/kosun-am/services/emailDispatchService.ts`

## Specific Remediation Tasks
1. **Fix `src/modules/kosun-am/api/functionsApi.ts`**:
   - In `dispatchCampaign` and `sendSmtpProxy`, completely remove the fallback `{ success: true, messageId: 'smtp_proxy_mock_*' }` returns.
   - When `baseUrl` is missing or network call fails, genuinely return `{ success: false, error: error.message || 'Functions service unavailable or unconfigured' }`.
   - Zero simulated mock success!
2. **Fix `src/core/contracts/index.ts` (`CoreEventMap`)**:
   - In `CoreEventMap`, replace `any` for `'email:automation:triggered'` and `'email:campaign:sent'` with strict payload types matching `PROJECT.md § Interface Contracts`:
     ```typescript
     'email:campaign:sent': {
       campaignId: string;
       campaignTitle: string;
       recipientCount: number;
       sentAt: string;
     };
     'email:automation:triggered': {
       automationId: string;
       triggerEvent: string;
       recipientEmail: string;
       actionTaken: string;
       timestamp: string;
     };
     ```
3. **Fix `src/core/connection/tenantApiKeys.ts`**:
   - Add `'/kosun-am': 'kosun-am'` to the `ROUTE_TO_MODULE` mapping dictionary.
4. **Verification**:
   - Run `npm run build` to verify 0 errors.
   - Run `node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts` to verify 105/105 tests pass.
5. Deliver handoff report in `c:\comona\.agents\teamwork\worker_m2_2\handoff.md` and send message.


## 2026-10-11T12:46:50Z
You are a teamwork_preview_worker executing Milestone 2 Remediation (Iteration 2) for KOSUN AM ("קושאן מייל אוטומטי").
Working directory: c:\comona\.agents\teamwork\worker_m2_2
Read c:\comona\.agents\teamwork\worker_m2_2\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.
Reviewer 2 feedback: c:\comona\.agents\teamwork\reviewer_m2_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Remediate the 3 items:
1. `src/modules/kosun-am/api/functionsApi.ts`: In `dispatchCampaign` and `sendSmtpProxy`, replace simulated mock returns `{ success: true, messageId: 'smtp_proxy_mock_*' }` with `{ success: false, error: ... }` when `baseUrl` is missing or network fails, per Zero Mock Data rule.
2. `src/core/contracts/index.ts`: In `CoreEventMap`, replace `any` for `'email:automation:triggered'` and `'email:campaign:sent'` with explicit typed interfaces from `PROJECT.md`.
3. `src/core/connection/tenantApiKeys.ts`: Add `'/kosun-am': 'kosun-am'` to `ROUTE_TO_MODULE` dictionary.

Verify:
- Run `npm run build`
- Run `node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts`
Write handoff report in c:\comona\.agents\teamwork\worker_m2_2\handoff.md.
Send message to caller upon completion.
