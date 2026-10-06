# crm-analytics Isolation & Architecture Rules

## 1. Overview
The `crm-analytics` module delivers 360-degree customer analytics, financial lifetime value summaries, dynamic column visualization, business card scanning, and segmented CRM reporting.

## 2. Multi-Tenant Firestore Subcollections
All data read or updated by this module MUST belong to tenant-isolated paths under `tenants/{tenantId}/`:
- Contacts: `tenants/{tenantId}/contacts`
- Leads: `tenants/{tenantId}/mod_crm_leads`
- Groups: `tenants/{tenantId}/crm_groups`
- Custom Fields: `tenants/{tenantId}/crm_custom_fields`
- Saved Views: `tenants/{tenantId}/crm_analytics_saved_views`
- Smart Forms: `tenants/{tenantId}/mod_forms`

Direct root collection access without tenant scoping is strictly prohibited. `useTenantScope()` provides `tenantId` and `getScopedCollectionPath()`.

## 3. LocalStorage Keys
All local persistence keys must be scoped with tenantId:
- `comona_{tenantId}_crm_analytics_filters`
- `comona_{tenantId}_crm_analytics_columns`

## 4. Zero Cross-Module Imports
- `crm-analytics` must NEVER import directly from other modules (e.g. `smart-form-builder`, `whatsapp-green-api-hub`, `kesher-payments-hub`).
- Communication is achieved through:
  - EventBus (subscribing to `crm:contact:updated`, `crm:lead:created`)
  - Contracts (`LeadCaptureContract`, `SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Complex metric calculations, filtering regressions, or external sync issues must be trapped without breaking the outer application shell.
