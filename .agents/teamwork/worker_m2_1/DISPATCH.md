# Task Assignment: Worker Milestone 2 (Backend, Contracts, Multi-Tenancy & EventBus)

**Working Directory**: c:\comona\.agents\teamwork\worker_m2_1
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Project Root**: c:\comona

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own and write:
- `src/modules/kosun-am/types/index.ts`
- `src/modules/kosun-am/config/index.ts`
- `src/modules/kosun-am/services/emailFirestoreService.ts`
- `src/modules/kosun-am/services/emailDispatchService.ts`
- `src/modules/kosun-am/api/functionsApi.ts`
- `src/modules/kosun-am/context/ModuleContext.tsx`
- `src/modules/kosun-am/hooks/useKosunAmData.ts`
- `src/modules/kosun-am/hooks/useKosunAmActions.ts`
- `src/core/contracts/collections.ts`
- `src/modules/db-collections-hub/config/index.ts`
- `src/modules/db-collections-hub/config/seedData.ts`

## Specific Tasks
1. **Triple-Sync Collection Registration**:
   - Register the 4 collections in `src/core/contracts/collections.ts` under `SYSTEM_COLLECTIONS`:
     - `MOD_KOSUN_AM_CAMPAIGNS: 'mod_kosun_am_campaigns'`
     - `MOD_KOSUN_AM_TEMPLATES: 'mod_kosun_am_templates'`
     - `MOD_KOSUN_AM_AUTOMATIONS: 'mod_kosun_am_automations'`
     - `MOD_KOSUN_AM_LOGS: 'mod_kosun_am_logs'`
   - Register in `src/modules/db-collections-hub/config/index.ts` (`PREDEFINED_COLLECTIONS`) with metadata, Hebrew names, descriptions, and Lucide icons.
   - Register rich seed data in `src/modules/db-collections-hub/config/seedData.ts` (`PROJECT_SEED_DATA`) for each of the 4 collections.
2. **Multi-Tenancy Firestore Service**:
   - In `src/modules/kosun-am/services/emailFirestoreService.ts`, enforce strict isolation: `useTenantScope().getScopedCollectionRef(...)` (pointing to `collection(db, 'tenants', tenantId, collectionName)`).
   - Absolute zero global flat collections.
   - Implement robust offline fallback: distinguish between real empty collections and offline/connection failure.
3. **Multi-Provider Email Dispatch Service**:
   - In `services/emailDispatchService.ts`, implement dispatch for Resend, SendGrid, and Cloud Functions SMTP proxy, with offline simulation mock fallback that generates message IDs and logs.
   - In `api/functionsApi.ts`, provide cloud function wrappers.
4. **Security & API Keys**:
   - Zero `localStorage` API key usage. Use `tenantApiKeys.ts` with `isModuleEntitled('kosun-am')` and `getModuleApiKeys('kosun-am')`.
5. **EventBus Listeners & Producers**:
   - In `context/ModuleContext.tsx`, subscribe to EventBus events: `crm:lead:created`, `smart_form:submitted`, `campaign:ambassador:created`.
   - Publish outbound events: `email:campaign:sent`, `email:automation:triggered`, `email:delivery:failed`.
   - Wrap state with HostCapabilities DI.
6. **Naming & Branding**:
   - English: "KOSUN AM", Hebrew: "קושאן מייל אוטומטי", collections `mod_kosun_am_*`, persona language "קושאן דואג...", zero textual emojis.
7. **Verification**:
   - Run `npm run build` to verify 0 errors.
   - Run `node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts` to verify 105/105 tests pass.
8. Deliver handoff report in `c:\comona\.agents\teamwork\worker_m2_1\handoff.md` and send message.


## 2026-10-11T12:16:29Z
You are a teamwork_preview_worker implementing Milestone 2: Backend, Contracts, Multi-Tenancy & EventBus for KOSUN AM ("קושאן מייל אוטומטי").
Working directory: c:\comona\.agents\teamwork\worker_m2_1
Read c:\comona\.agents\teamwork\worker_m2_1\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.
Project blueprint: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
