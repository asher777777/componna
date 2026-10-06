# db-collections-hub Isolation & Architecture Rules

## 1. Overview
The `db-collections-hub` module is the platform's multi-database explorer, document editor, and real-time Firestore collection inspector.

## 2. Multi-Tenant Scoped Collection Browsing
- When operating in standard tenant mode, collection explorer requests are constrained to the current tenant's root (`tenants/{tenantId}/`).
- Root administrators (`_master`) can inspect platform-wide collections with appropriate security credentials.
- Document mutations must respect tenant isolation boundaries.

## 3. LocalStorage Keys
All local persistence keys must be scoped with tenantId:
- `comona_{tenantId}_db_collections_custom`
- `comona_{tenantId}_db_active_collection`

## 4. Zero Cross-Module Imports
- `db-collections-hub` must NEVER import directly from other modules (e.g. `db-connector-hub`, `brand-dna-hub`).
- Communication occurs exclusively through:
  - Contracts (`SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Firestore permission errors, invalid field types, or corrupt JSON documents must be trapped in DocumentDataGrid without halting the app shell.
