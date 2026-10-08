# page-builder Isolation & Architecture Rules

## 1. Overview
The `page-builder` module provides visual drag-and-drop page authoring, section configuration, Brand DNA design token synchronization, previewing, and public responsive page rendering.

## 2. Multi-Tenant Firestore Subcollections
All pages, templates, and analytics MUST reside in tenant-isolated paths under `tenants/{tenantId}/`:
- Pages documents: `tenants/{tenantId}/mod_pages_documents`
- Page templates: `tenants/{tenantId}/mod_pages_templates`
- Page analytics: `tenants/{tenantId}/mod_pages_analytics`
- Apex / Root domain fallback: `tenants/_master/...`

Direct root collection access without tenant scoping is strictly prohibited. `useTenantScope()` provides `tenantId` and ensures proper isolation across subdomains and `_master`.

## 3. LocalStorage Keys
All local persistence keys must be scoped with tenantId:
- `kosun_{tenantId}_pagebuilder_all_pages`
- `kosun_{tenantId}_pagebuilder_active_draft`

## 4. Zero Cross-Module Imports
- `page-builder` must NEVER import directly from other modules (e.g. `kesher-payments-hub`, `whatsapp-green-api-hub`, `smart-form-builder`, `crm-groups-hub`).
- Communication occurs exclusively through:
  - EventBus (e.g., listening for `brand:updated`, emitting `page:published`)
  - Contracts (`BrandDnaContract`, `FormBuilderContract`, `SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Public landing page rendering routes are wrapped with `<ModuleErrorBoundary>` so corrupt JSON configurations in user-built sections do not disrupt the rest of the application.
