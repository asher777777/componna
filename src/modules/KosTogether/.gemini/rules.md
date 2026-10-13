# crm-groups-hub Isolation & Architecture Rules

## 1. Overview
The `crm-groups-hub` module provides contact segmentation, dynamic Smart Groups, Community Micro-Portals, internal chat rooms, interaction tracking, and WhatsApp broadcasting for the Kosun platform.

## 2. Multi-Tenant Firestore Subcollections
All data read or written by this module MUST reside in tenant-isolated paths under `tenants/{tenantId}/`:
- Groups: `tenants/{tenantId}/crm_groups`
- Contacts: `tenants/{tenantId}/contacts`
- Community Micro-Portal Pages: `tenants/{tenantId}/mod_pages_documents`
- Community Chat Messages: `tenants/{tenantId}/crm_chat_messages`
- Interactions: `tenants/{tenantId}/crm_interactions`
- Video Rooms: `tenants/{tenantId}/crm_community_video_rooms`

Direct root collection access is strictly prohibited. `useTenantScope()` provides the active `tenantId` and automatically scopes collection paths via `getScopedCollectionPath(SYSTEM_COLLECTIONS.X)`.

## 3. LocalStorage Keys
All local persistence keys must be scoped with the tenant ID:
- `kosun_{tenantId}_crm_groups_columns`

## 4. Zero Cross-Module Imports
- `crm-groups-hub` must NEVER import directly from other modules (e.g., `whatsapp-green-api-hub`, `brand-dna-hub`, `page-builder`).
- Inter-module communication must strictly occur via:
  - EventBus (e.g. emitting `crm:contact:updated`, `crm:lead:created`)
  - Contracts (`src/core/contracts/index.ts`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Any unexpected errors in member filtering, batch tag mutations, or chat listeners must be isolated within the module boundary.
