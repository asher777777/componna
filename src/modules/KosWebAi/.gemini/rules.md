# KosWebAi Isolation & Architecture Rules

## 1. Overview
The `KosWebAi` module provides visual drag-and-drop page authoring, section configuration, Brand DNA design token synchronization, previewing, and public responsive page rendering.

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
- `KosWebAi` must NEVER import directly from other modules (e.g. `kesher-payments-hub`, `whatsapp-green-api-hub`, `smart-form-builder`, `crm-groups-hub`).
- Communication occurs exclusively through:
  - EventBus (e.g., listening for `brand:updated`, emitting `page:published`)
  - Contracts (`BrandDnaContract`, `FormBuilderContract`, `SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Public landing page rendering routes are wrapped with `<ModuleErrorBoundary>` so corrupt JSON configurations in user-built sections do not disrupt the rest of the application.

## 6. Tenant Ownership & Branding Monopoly Rule (חוק בעלות הטננט וקולקציית המיתוג)
- Any page generated from external feeds (such as YouTube videos in KosTube) belongs 100% exclusively to the system tenant.
- Attribution/credit to the original video/channel creator is permitted inside the content description/footer ("זכויות יוצרים / מקור: [שם הערוץ]").
- Header, Logo, Colors, Typography, Footer, CTA, Contact details, WhatsApp/Phone/Email, Brand Voice, and Theme MUST strictly adhere to the tenant's branding collection (`tenants/{tenantId}/settings/kos_branding_dna`).
- Unless the page producer explicitly configured otherwise, the absolute default is always the tenant's branding collection.
- Zero fake/mock metrics: only authentic page views and genuine YouTube statistics (or 0 if unavailable) are displayed.
- Slugs for video pages default to `kosvidio` (or `kosvidio-[videoId]`).
