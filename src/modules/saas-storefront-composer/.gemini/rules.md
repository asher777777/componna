# saas-storefront-composer Isolation & Architecture Rules

## 1. Overview
The `saas-storefront-composer` module is the platform's multi-tenant SaaS marketplace and billing engine. It manages module bundle catalogs, tenant onboarding, GoDaddy DNS automation, and client checkout.

## 2. Multi-Tenant vs Global Platform Collections
The Storefront operates primarily at the platform root level to provision new tenants:
- Global Catalog: `GLOBAL_PLATFORM_COLLECTIONS.CATALOG` (`sys_storefront_catalog`)
- Global Tenant Registry: `GLOBAL_PLATFORM_COLLECTIONS.TENANTS` (`sys_tenants`)
- Global Storefront Settings: `GLOBAL_PLATFORM_COLLECTIONS.SETTINGS` (`sys_storefront_settings`)
- Individual Tenant Provisioning: creates `tenants/{subdomain}/settings/brand_dna`, `tenants/{subdomain}/contacts`, etc.

## 3. LocalStorage Keys
- `comona_saas_catalog_v1`
- `comona_saas_settings_v1`
- `comona_saas_tenants_v1`

## 4. Zero Cross-Module Imports
- `saas-storefront-composer` must NEVER import directly from other modules (e.g. `kesher-payments-hub`, `brand-dna-hub`).
- Communication occurs exclusively through:
  - EventBus (e.g. `payment:completed`, `tenant:provisioned`)
  - Contracts (`SYSTEM_COLLECTIONS`, `GLOBAL_PLATFORM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- DNS API failures, payment cancellations, or sandbox demo errors must be handled cleanly within the storefront workflow.
