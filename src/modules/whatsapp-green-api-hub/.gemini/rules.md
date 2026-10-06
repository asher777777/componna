# whatsapp-green-api-hub Isolation & Architecture Rules

## 1. Overview
The `whatsapp-green-api-hub` module encapsulates WhatsApp Green API messaging, AI Bot conversational agents, 24/7 status publishing, contact synchronization to CRM, and bulk broadcasting.

## 2. Multi-Tenant Firestore Subcollections
All data queried or persisted by this module MUST reside within tenant-isolated paths under `tenants/{tenantId}/`:
- AI Bots: `tenants/{tenantId}/whatsapp_ai_bots`
- AI Bot Chats: `tenants/{tenantId}/wa_bot_chats`
- Status Archive: `tenants/{tenantId}/wa_statuses` (or `whatsapp_statuses`)
- Status Automations: `tenants/{tenantId}/whatsapp_status_automations`
- CRM Contacts sync: `tenants/{tenantId}/contacts`
- CRM Groups sync: `tenants/{tenantId}/crm_groups`
- Storage paths for media & status assets: `tenants/{tenantId}/whatsapp_statuses/{fileName}`

Direct unscoped root collection queries are forbidden. `useTenantScope()` supplies the current `tenantId` and scoped collection helpers.

## 3. LocalStorage Keys
All local persistence keys must be scoped with the tenant ID:
- `comona_{tenantId}_whatsapp_statuses_archive`
- `comona_{tenantId}_whatsapp_theme`
- `comona_{tenantId}_whatsapp_bots`

## 4. Zero Cross-Module Imports
- `whatsapp-green-api-hub` must NEVER import directly from other modules (e.g. `brand-dna-hub`, `crm-groups-hub`, `kesher-payments-hub`).
- Communication with external modules happens exclusively via:
  - EventBus (e.g., emitting `whatsapp:message_sent`, listening for `payment:completed`)
  - Contracts (`src/core/contracts/index.ts`)
  - Host capabilities (`useHostCapabilities()`, e.g. for Brand DNA presets or Media Picker)

## 5. Runtime Resilience
- Errors in Green API HTTP calls, webhook synchronization, or AI bot response generation must be trapped within the module boundary.
- Module runtime errors must not propagate to the outer shell or crash adjacent tabs.
