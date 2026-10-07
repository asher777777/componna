# ambassador-campaigns-hub Isolation & Architecture Rules

## 1. Overview
The `ambassador-campaigns-hub` module provides crowdfunding, ambassador micro-portals, real-time live donations, multi-step donation flows, and automatic cross-module event synchronization.

## 2. Multi-Tenant Firestore Subcollections
All data read or written by this module MUST reside in tenant-isolated paths under `tenants/{tenantId}/`:
- Campaigns: `tenants/{tenantId}/mod_campaigns`
- Ambassadors: `tenants/{tenantId}/mod_campaign_ambassadors`
- Donations: `tenants/{tenantId}/mod_campaign_donations`
- CRM Groups: `tenants/{tenantId}/crm_groups`
- Contacts: `tenants/{tenantId}/contacts`

Direct root collection access without tenant scoping is strictly prohibited. `useTenantScope()` provides `tenantId` and `getScopedCollectionPath()`.

## 3. Zero Cross-Module Imports
- `ambassador-campaigns-hub` must NEVER import directly from other modules (e.g. `crm-groups-hub`, `whatsapp-green-api-hub`, `crm-analytics`).
- Communication is achieved exclusively through:
  - EventBus (emitting `campaign:ambassador:created`, `campaign:donation:pending`, `campaign:donation:completed`)
  - Core Contracts (`src/core/contracts/index.ts`)
  - Collections Registry (`SYSTEM_COLLECTIONS`)

## 4. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Errors in payment validation, WhatsApp webhooks, or donation processing must be handled gracefully within the module boundary.
