# Task Assignment: Worker Milestone 4 (AI Copilot & Local Audit Gates)

**Working Directory**: c:\comona\.agents\teamwork\worker_m4_1
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Project Root**: c:\comona

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own and write:
- `src/modules/kosun-am/services/kosaiEmailAiService.ts`
- `src/modules/kosun-am/prompts/index.ts`
- `src/modules/kosun-am/.gemini/rules.md`
- `src/modules/kosun-am/.gemini/skills.md`

## Specific Tasks
1. **Elevate `src/modules/kosun-am/services/kosaiEmailAiService.ts`**:
   - Ensure authorized Gemini Flash model cascade: `gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.8-flash-lite`.
   - Token & Cost Tracking: Call `calculateGeminiCost` from `src/core/ai/geminiCostTracker.ts` for prompt and candidate tokens, reporting both USD and ILS in `usageReport`.
   - Full API Suite:
     - `generateMarketingContent(prompt, context)`
     - `generateSubjectLines(prompt, context)`: Returns 3 distinct A/B testing suggestions (Curiosity hook, Direct benefit, Urgency).
     - `generateEmailBody(prompt, context)`: Returns structured body copy and preheader aligned with Brand DNA.
     - `suggestAudienceSegments(prompt, context)`: Returns suggested audience tags, filters, and rationale.
   - Brand DNA integration: read Brand DNA attributes from `context` (tone of voice, target audience, brand values) and inject into system instructions.
   - Return genuine status: no mock success strings when API keys are absent; return structured deterministic copy or explicit error.
2. **Elevate `src/modules/kosun-am/prompts/index.ts`**:
   - Add comprehensive prompt templates: `EMAIL_COPILOT_SYSTEM_PROMPT`, `SUBJECT_LINE_A_B_PROMPT`, `AUDIENCE_SEGMENTATION_PROMPT`, `EMAIL_BODY_GENERATION_PROMPT`, `CAMPAIGN_IDEATION_PROMPT`.
   - Enforce living entity persona ("קושאן דואג", "קושאן מכין"), Hebrew copywriting rules, strict zero textual emojis, and valid JSON response schemas.
3. **Synchronize `.gemini/rules.md` and `.gemini/skills.md`**:
   - Update to incorporate all User Iron Rules (Zero Mock Data, Zero LocalStorage, 100% Real Scoped Firestore under `tenants/{tenantId}/mod_kosun_am_*`, Kosun 2026 Branding, Gemini Flash models).
4. **Audit Gates Verification**:
   - Verify compliance against the 5 Audit Gates:
     - Gate 1: Modular architecture & 12 layers.
     - Gate 2: Multi-tenancy scoping & zero localStorage.
     - Gate 3: Authorized Gemini Flash models & cost tracking.
     - Gate 4: Kosun 2026 branding & RTL.
     - Gate 5: Runtime stability, ErrorBoundary, Suspense, clean build.
5. **Build & Test Verification**:
   - Run `npm run build` to verify 0 errors.
   - Run `node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts` to verify 105/105 tests pass.
6. Deliver handoff report in `c:\comona\.agents\teamwork\worker_m4_1\handoff.md`.


## 2026-10-11T13:21:41Z
[Message] timestamp=2026-10-11T13:21:41Z sender=dbb276bf-78f9-422a-9c00-cd299ccc30cb priority=MESSAGE_PRIORITY_HIGH content=You are a teamwork_preview_worker implementing Milestone 4: AI Copilot (Kosai Email), Brand DNA & 5 Local Audit Gates for KOSUN AM ("קושאן מייל אוטומטי").
Working directory: c:\comona\.agents\teamwork\worker_m4_1
Read c:\comona\.agents\teamwork\worker_m4_1\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.
Project blueprint: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
