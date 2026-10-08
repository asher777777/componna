# kesher-payments-hub Isolation & Architecture Rules

## 1. Overview
The `kesher-payments-hub` module provides terminal payment integration, transaction recording, receipt glossary management, and contact transaction history syncing for the Kosun platform.

## 2. Multi-Tenant Firestore Subcollections
All data stored or queried by this module MUST reside in tenant-isolated paths under `tenants/{tenantId}/`:
- Transactions: `tenants/{tenantId}/kesher_transactions`
- Receipt Glossary: `tenants/{tenantId}/kesher_receipt_glossary`
- Synced Contacts: `tenants/{tenantId}/contacts`
- Apex / Root domain fallback: `tenants/_master/...`

Direct root-level collection access (e.g. `collection(db, 'kesher_transactions')`) is strictly forbidden.
Always obtain `tenantId` from `useTenantScope()` and pass it into the services via `attachFirestore(db, tenantId)` or `getTenantCollectionPath()`.

## 3. LocalStorage Keys
All local persistence keys must be scoped with the tenant ID:
- `kosun_{tenantId}_kesher_settings`
- `kosun_{tenantId}_kesher_transactions`
- `kosun_{tenantId}_kesher_glossary`

## 4. Zero Cross-Module Imports
- `kesher-payments-hub` must NEVER import directly from other modules (e.g., `whatsapp-green-api-hub`, `brand-dna-hub`, `crm-groups-hub`).
- Communication with other modules must occur exclusively via:
  - EventBus (e.g., emitting `payment:completed` or `receipt:issued`)
  - Contracts (`src/core/contracts/index.ts`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Error Boundary & Resilience
- Any failure in transaction processing, network call to Kesher/EasyCount terminal, or Firestore listener must be handled gracefully without bubbling up to crash the workbench shell.
