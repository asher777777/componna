# Project: KOSUN AM ("קושאן מייל אוטומטי")
## Smart Email & Multi-Channel Automation Hub

**Module Directory**: `src/modules/kosun-am/`  
**Module ID**: `kosun-am`  
**Official Display Name (Hebrew)**: "קושאן מייל אוטומטי"  
**Official Display Name (English)**: "KOSUN AM"  
**Collections Prefix**: `mod_kosun_am_...` (`mod_kosun_am_campaigns`, `mod_kosun_am_templates`, `mod_kosun_am_automations`, `mod_kosun_am_logs`)  

---

## Architecture
- **Isolation Principle**: Pure modular boundary (Zero Direct Cross-Module Imports).
- **Inter-Module Communication**: Central `eventBus` (`src/core/bridge/EventBus.ts`) & `HostCapabilities` DI (`src/core/bridge/HostCapabilitiesContext.tsx`).
- **Data Persistence**: Strict Multi-Tenant isolation using `useTenantScope().getScopedCollectionRef(db, collectionName)` mapping to `tenants/{tenantId}/{collectionName}`.
- **Security**: Third-party API keys (Resend, SendGrid, Gemini) managed exclusively in Firestore (`tenants/{tenantId}/settings/api_keys`) via `tenantApiKeys.ts` with runtime entitlement checks. Zero `localStorage` keys.
- **UI & Ergonomics**: Kosun 2026 Branding: Mobile First, Bento Grid layout, Top Nav only (zero sidebars), Heebo font exclusively (`font-heebo`), Lucide icons only (zero textual emojis), strict RTL wrapper `<div dir="rtl" style="text-align: right;">`, minimal smart tooltips `(i)`, collapsible statistics accordion, living persona language.
- **AI Copilot**: Kosai Email Copilot using authorized Gemini Flash models (`gemini-3.8-flash` primary, `gemini-3.5-flash` secondary, `gemini-3.8-flash-lite` tertiary), token tracking via `calculateGeminiCost`, Brand DNA integration, and intelligent local mock fallback.
- **Workbench Integration**: Registered dynamically in `src/workbench/moduleRegistry.ts` via `React.lazy()`, icon mapped in `src/workbench/components/CashwanTopNav.tsx`, wrapped with `ModuleErrorBoundary` and `Suspense`.

---

## 12-Layer Anatomy Structure
```text
src/modules/kosun-am/
├── types/
│   └── index.ts                 # [Layer 1] Strict TypeScript interfaces (Campaign, Template, Automation, Log, DispatchResult)
├── config/
│   └── index.ts                 # [Layer 2] Module ID, collection names, default configurations, event topics
├── context/
│   └── ModuleContext.tsx        # [Layer 3] Central state provider, Scoped Firestore sync, EventBus listeners, DI
├── hooks/
│   ├── useKosunAmData.ts        # [Layer 4] Data fetching and real-time reactive hooks
│   └── useKosunAmActions.ts     # Action hooks for campaign dispatch, automation triggers, template saves
├── services/
│   ├── emailFirestoreService.ts # [Layer 5] Multi-tenant Firestore persistence with Mock fallback
│   ├── emailDispatchService.ts  # Multi-provider email engine (Resend, SendGrid, SMTP proxy, Mock)
│   └── kosaiEmailAiService.ts   # AI Copilot engine with Gemini Flash models & fallback cascade
├── api/
│   └── functionsApi.ts          # [Layer 6] Cloud Functions proxy client for SMTP & server-side dispatch
├── prompts/
│   └── index.ts                 # [Layer 7] Modular LLM prompts, JSON output schemas & Brand DNA templates
├── routes/
│   └── ModuleRoutes.tsx         # [Layer 8] Internal sub-routes ("", "new", ":id", "templates", "automations", "logs")
├── components/
│   ├── KosunAmMainView.tsx      # [Layer 9] Main Bento Grid dashboard, internal Top Nav, collapsible stats
│   ├── EmailEditorModal.tsx     # Bento-compatible visual block email builder
│   ├── AutomationBuilderView.tsx# Visual multi-channel workflow builder (triggers, delays, email/WhatsApp actions)
│   ├── CampaignListCard.tsx     # Bento campaign card with live status & metrics
│   └── DeliveryLogsDrawer.tsx   # Detailed delivery log viewer drawer
├── StandaloneView.tsx           # [Layer 10] Standalone runner and Workbench entry point
├── index.ts                     # [Layer 10] Module barrel export
├── README.md                    # [Layer 10] Component specification matching component_spec_template.md
├── .gemini/
│   ├── rules.md                 # [Layer 11] Module isolation, Zero Cross-Imports & tenant scoping rules
│   └── skills.md                # [Layer 11] Module capabilities & audit compliance checklist
└── scripts/
    └── .gitkeep                 # [Layer 12] Local maintenance scripts directory
```

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 12-Layer Anatomy Scaffolding | Complete 12-layer directory structure and metadata files | M1 | Survey Spec |
| 2 | Component Spec README.md | Full specification document matching component_spec_template.md (all 8 chapters) | M1 | Survey Spec |
| 3 | Core Types Definition | Strict TypeScript interfaces for campaigns, templates, automations, logs, providers | M2 | Survey Backend |
| 4 | Scoped Firestore Service | Multi-tenant persistence under `tenants/{tenantId}/` via `useTenantScope().getScopedCollectionRef` | M2 | Survey Backend |
| 5 | Triple-Sync Collection Registration | Registration in `collections.ts`, `db-collections-hub/config/index.ts`, and `seedData.ts` | M2 | Survey Backend |
| 6 | Multi-Provider Email Dispatcher | Resend, SendGrid, SMTP Cloud Function proxy, and robust offline mock fallback | M2 | Survey Backend |
| 7 | Secure API Keys via tenantApiKeys | Retrieval via `tenantApiKeys.ts` with module entitlement check; zero localStorage keys | M2 | Survey Backend |
| 8 | EventBus Listeners | Listen to `crm:lead:created`, `smart_form:submitted`, `campaign:ambassador:created` | M2 | Survey Backend |
| 9 | Outbound Email Events | Publish `email:campaign:sent`, `email:automation:triggered`, `email:delivery:failed` | M2 | Survey Backend |
| 10 | HostCapabilities DI Integration | Consume system capabilities (`brand-dna`, `media-picker`, `lead-capture`) via HostCapabilities | M2 | Survey Backend |
| 11 | Kosun 2026 Bento Grid Dashboard | Bento Grid cards (`rounded-3xl`/`rounded-2xl`), clean spacing, Mobile First | M3 | Survey Frontend |
| 12 | Pure Top Nav Navigation | Internal Top Navigation bar, zero sidebars/sliders in the module | M3 | Survey Frontend |
| 13 | Heebo Typography & Strict RTL | Exclusive `font-heebo`, `<div dir="rtl" style="text-align: right;">` wrapper | M3 | Survey Frontend |
| 14 | Zero Textual Emojis | Exclusively Lucide icons across all views and buttons | M3 | Survey Frontend |
| 15 | Collapsible Stats Accordion | Secondary metrics/graphs hidden by default in collapsible accordion | M3 | Survey Frontend |
| 16 | Living Persona Language | "קושאן דואג...", "קושאן מכין..." conversational partner UI copy | M3 | Survey Frontend |
| 17 | Minimal Smart Tooltips | Delicate `(i)` info buttons using `SmartTooltip.tsx` | M3 | Survey Frontend |
| 18 | Bento Visual Email Builder | Block-based modular email editor compatible with Page Builder concepts | M3 | Survey Frontend |
| 19 | Visual Workflow Builder | Multi-channel automation builder (Trigger -> Filter -> Delay -> Email/WhatsApp Action) | M3 | Survey Frontend |
| 20 | Multi-Channel WhatsApp Integration | WhatsApp Green API action step in automation workflows | M3 | Survey Frontend |
| 21 | StandaloneView & Workbench Registration | `StandaloneView.tsx` registered via `React.lazy` in `src/workbench/moduleRegistry.ts` | M3 | Survey Frontend |
| 22 | Kosai Email Copilot (Gemini Flash) | AI assistant for subject lines, body copy, audience segmentation using Gemini Flash | M4 | Survey Frontend |
| 23 | AI Fallback Cascade | Cascade: `gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.8-flash-lite` -> local mock | M4 | Survey Frontend |
| 24 | AI Token Tracking & Cost Calculation | Cost calculation in $ and ₪ via `calculateGeminiCost` | M4 | Survey Frontend |
| 25 | Local Audit Gates Verification | Verification of all 5 Audit Gates, Zero Cross-Imports, ErrorBoundary & Suspense | M4 | Survey Spec |
| 26 | E2E Opaque-Box Test Suite Pass | 100% pass on E2E test suite (Tiers 1-4) designed by E2E Testing Track | M5 | E2E Track |
| 27 | Adversarial Coverage Hardening | Tier 5 white-box stress testing and bug discovery | M5 | E2E Track |
| 28 | Git Commit & Remote Smoke Test | Clean git commit, push, and remote live deployment verification | M5 | Git Deploy |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Specification, Architecture & 12-Layer Scaffolding | Features 1, 2: `README.md` spec + complete 12-layer anatomy structure in `src/modules/kosun-am/` | None | PLANNED |
| M2 | Backend, Contracts, Multi-Tenancy & EventBus | Features 3-10: Types, config, Scoped Firestore, Email Dispatchers, API keys, EventBus sync, triple-sync collections | M1 | PLANNED |
| M3 | Kosun 2026 UI, Visual Campaign & Workflow Builder | Features 11-21: Bento Grid, Top Nav, RTL, Heebo, Lucide icons, Collapsible Stats, Visual Email Editor, Workflow Builder, Module Registration | M2 | PLANNED |
| M4 | AI Copilot (Kosai Email), Brand DNA & Audit Gates | Features 22-25: Gemini Flash Copilot, Token Tracking, Fallback Cascade, 5 Audit Gates validation | M3 | PLANNED |
| M5 | Final Milestone: E2E Verification & Git Deployment | Features 26-28: E2E suite pass (Tiers 1-4), Adversarial hardening (Tier 5), Git commit, Push & Live Smoke Test | M4, E2E Test Suite | PLANNED |

---

## Interface Contracts

### EventBus Contracts (`src/core/contracts/index.ts` & `src/core/bridge/EventBus.ts`)
```typescript
// Inbound Subscribed Events:
'crm:lead:created': LeadPayload;
'smart_form:submitted': {
  formId: string;
  formTitle: string;
  submissionId: string;
  data: Record<string, any>;
  leadPayload?: LeadPayload;
  submittedAt: string;
};
'campaign:ambassador:created': {
  campaignId: string;
  ambassadorId: string;
  name: string;
  phone?: string;
  email?: string;
  shareUrl: string;
  createdAt: string;
};

// Outbound Published Events:
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
'email:delivery:failed': {
  campaignId?: string;
  automationId?: string;
  recipientEmail: string;
  reason: string;
  timestamp: string;
};
```

### Module Context Interface (`src/modules/kosun-am/context/ModuleContext.tsx`)
```typescript
export interface KosunAmContextValue {
  tenantId: string;
  campaigns: EmailCampaign[];
  templates: EmailTemplate[];
  automations: EmailAutomation[];
  logs: EmailDeliveryLog[];
  isLoading: boolean;
  activeProvider: EmailProviderType;
  // Actions:
  createCampaign: (data: Partial<EmailCampaign>) => Promise<string>;
  updateCampaign: (id: string, data: Partial<EmailCampaign>) => Promise<void>;
  dispatchCampaign: (id: string) => Promise<DispatchResult>;
  saveTemplate: (data: Partial<EmailTemplate>) => Promise<string>;
  saveAutomation: (data: Partial<EmailAutomation>) => Promise<string>;
  generateAiContent: (prompt: string, context?: Record<string, any>) => Promise<AiGenerationResult>;
}
```

---

## Code Layout
- `src/modules/kosun-am/` - All module source code (12 layers).
- `src/core/contracts/collections.ts` - Registration in `SYSTEM_COLLECTIONS`.
- `src/modules/db-collections-hub/config/index.ts` - Registration in `PREDEFINED_COLLECTIONS`.
- `src/modules/db-collections-hub/config/seedData.ts` - Seed data in `PROJECT_SEED_DATA`.
- `src/workbench/moduleRegistry.ts` - Dynamic `React.lazy` registration.
- `src/workbench/components/CashwanTopNav.tsx` - Icon mapping for top navigation.
