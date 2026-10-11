# Task Assignment: Explorer Survey 2 (Backend, Contracts, EventBus & Multi-Tenancy)

**Working Directory**: c:\comona\.agents\teamwork\explorer_survey_2
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Root**: c:\comona

## Objectives
1. Read `c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md` completely.
2. Investigate the backend contracts, persistence, and event integration in the project:
   - `src/core/contracts/collections.ts`, `db-collections-hub/config/index.ts`, and `seedData.ts` (how collections are declared and registered).
   - Multi-tenancy implementation: `useTenantScope().getScopedCollectionRef(...)` and Firestore collections setup.
   - EventBus implementation and events: `crm:lead:created`, `smart_form:submitted`, `campaign:ambassador:created`, EventBus API, host capabilities.
   - API key management: `tenantApiKeys.ts` (strictly zero localStorage keys).
   - Email dispatch providers and services: existing mailing/messaging implementations, Resend/SendGrid/SMTP/Cloud Functions patterns, Mock/Local fallback patterns.
3. Deliver a comprehensive survey report in `c:\comona\.agents\teamwork\explorer_survey_2/survey_backend_report.md` and write a handoff report in `handoff.md`.


## 2026-10-11T11:37:24Z
You are a teamwork_preview_explorer investigating backend, contracts, EventBus, and multi-tenancy.
Your working directory is: c:\comona\.agents\teamwork\explorer_survey_2
Read c:\comona\.agents\teamwork\explorer_survey_2\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.

Investigate:
1. src/core/contracts/collections.ts, db-collections-hub/config/index.ts, and seedData.ts to see how collections are typed and registered.
2. Multi-tenancy isolation patterns: useTenantScope().getScopedCollectionRef(...), collections naming, Firestore services.
3. EventBus implementation: eventBus API, events (crm:lead:created, smart_form:submitted, campaign:ambassador:created), event listeners, host capabilities.
4. API key handling: tenantApiKeys.ts (zero localStorage API keys).
5. Email dispatch service patterns: Resend / SendGrid / SMTP / Cloud Functions, and mock/local fallback mechanisms.

Write your findings to c:\comona\.agents\teamwork\explorer_survey_2\survey_backend_report.md and a handoff report in c:\comona\.agents\teamwork\explorer_survey_2\handoff.md.
Send a message to your caller when done.


## 2026-10-11T11:38:26Z
**Context**: Final Official Naming Directive
**Content**: Urgent update from project owner and Sentinel:
The final official name of the module is:
Hebrew: "קושאן מייל אוטומטי"
English: "KOSUN AM"
Module directory / ID: `kosun-am` (src/modules/kosun-am/)
Collections prefix: `mod_kosun_am_...` (mod_kosun_am_campaigns, mod_kosun_am_templates, mod_kosun_am_automations, mod_kosun_am_logs)
**Action**: Incorporate this exact name, directory, and collection prefix in your survey report and handoff.
