# db-connector-hub Isolation & Architecture Rules

## 1. Overview
The `db-connector-hub` module establishes external database bridges (PostgreSQL, MySQL, Supabase, BigQuery, Airtable) and credentials management for the Comona platform.

## 2. Multi-Tenant Connector Credential Storage
All external database connection parameters and API secrets MUST be saved in tenant-isolated paths under `tenants/{tenantId}/`:
- External connectors config: `tenants/{tenantId}/settings/db_connectors`
- Apex / Root domain fallback: `tenants/_master/settings/db_connectors`

Direct access to platform-wide credentials without tenant scoping is forbidden.

## 3. LocalStorage Keys
All local persistence keys must be scoped with tenantId:
- `comona_{tenantId}_db_connectors_config`

## 4. Zero Cross-Module Imports
- `db-connector-hub` must NEVER import directly from other modules (e.g. `db-collections-hub`, `crm-analytics`).
- Communication occurs exclusively through:
  - Contracts (`SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Network connection test timeouts or invalid SQL connection strings must be handled gracefully in UI error modals.
