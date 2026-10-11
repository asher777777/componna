# Task Assignment: Worker Milestone 3 (Kosun 2026 UI, Visual Campaign & Workflow Builder)

**Working Directory**: c:\comona\.agents\teamwork\worker_m3_1
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Blueprint**: c:\comona\.agents\teamwork\orchestrator_main\PROJECT.md
**Project Root**: c:\comona

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own and write:
- `src/modules/kosun-am/components/KosunAmMainView.tsx`
- `src/modules/kosun-am/components/EmailEditorModal.tsx`
- `src/modules/kosun-am/components/AutomationBuilderView.tsx`
- `src/modules/kosun-am/components/CampaignListCard.tsx`
- `src/modules/kosun-am/components/DeliveryLogsDrawer.tsx`
- `src/modules/kosun-am/StandaloneView.tsx`
- `src/modules/kosun-am/index.ts`
- `src/modules/kosun-am/routes/ModuleRoutes.tsx`
- `src/workbench/moduleRegistry.ts`
- `src/workbench/components/CashwanTopNav.tsx`

## Specific Tasks
1. **Kosun 2026 Branding UI Standards**:
   - Mobile First, Bento Grid layout (`rounded-3xl` / `rounded-2xl`, responsive padding).
   - Top Nav ONLY: Absolutely zero sidebars or drawers as persistent navigation.
   - Typography: `font-heebo` exclusively throughout.
   - RTL: Strict RTL wrapper `<div dir="rtl" style={{ textAlign: 'right' }}>` on all views and modals.
   - Zero Textual Emojis: Strictly Lucide icons only (`Mail`, `Send`, `Sparkles`, `Workflow`, `FileText`, `CheckCircle2`, `X`, `ChevronDown`, `ChevronUp`, `Clock`, `Plus`, `Eye`, `Users`, `Settings`). Zero unicode emojis in TS/TSX.
   - Collapsible Statistics: Metrics and graphs hidden by default in collapsible accordion (`useState(false)`).
   - Smart Tooltips: Minimal `(i)` info triggers using `src/components/Ui/SmartTooltip.tsx`.
   - Living Persona Language: "קושאן דואג שהמייל יגיע ליעד", "קושאן מכין את הקמפיין הבא שלך", uppercase "KOSUN AM".
2. **Visual Campaign & Email Editor**:
   - `components/EmailEditorModal.tsx`: Visual block-based email editor (Header, Hero image, Rich Text, Call-to-Action button, Divider, Footer with auto unsubscribe link). Compatible with Page Builder block paradigm.
   - Real-time mobile & desktop preview toggle.
   - AI Assistant integration button ("קושאן כותב עבורך").
3. **Visual Workflow Automation Builder**:
   - `components/AutomationBuilderView.tsx`: Visual multi-channel workflow builder.
   - Triggers: Lead created (`crm:lead:created`), Form submitted (`smart_form:submitted`), Ambassador created (`campaign:ambassador:created`).
   - Condition & Delay steps.
   - Multi-channel Actions: Email dispatch + WhatsApp Green API message.
4. **StandaloneView & Workbench Registration**:
   - In `src/workbench/moduleRegistry.ts`: Register `kosun-am` using dynamic `React.lazy()`:
     ```typescript
     const KosunAmModule = React.lazy(() => import('../modules/kosun-am').then(m => ({ default: m.KosunAmStandaloneView })));
     ```
     Add definition to `REGISTERED_MODULES`:
     - `id: 'kosun-am'`
     - `name: 'קושאן מייל אוטומטי'`
     - `description: 'מערכת דיוור, ניוזלטרים ואוטומציות שיווקיות רב-ערוציות חכמות'`
     - `route: '/kosun-am'`
     - `collectionPrefix: 'mod_kosun_am_'`
   - In `src/workbench/components/CashwanTopNav.tsx`: Add `'kosun-am': Mail` to `MODULE_ICONS`.
5. **Zero Mock Data & Real Firestore**:
   - UI views must read and write genuinely through `useModuleContext()` and `useKosunAmData()` / `useKosunAmActions()`.
6. **Verification**:
   - Run `npm run build` to verify 0 errors.
   - Run `node --experimental-strip-types tests/e2e/kosun-am/run_e2e_tests.ts` to verify 105/105 tests pass.
7. Deliver handoff report in `c:\comona\.agents\teamwork\worker_m3_1\handoff.md`.
