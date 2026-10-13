# KosTenantProvisioner Module Rules

## 1. Overview
The `KosTenantProvisioner` module manages tenant subdomain creation, module configuration/loading, and credential provisioning across the multi-tenant architecture.

## 2. Multi-Tenant Scoping
- Tenant profiles and active module records are stored at platform level (`tenants/{subdomain}` and `sys_tenants`).
- Sensitive tenant credentials reside in `tenants/{subdomain}/settings/auth_credentials`.
- Individual tenant data remains 100% isolated under `tenants/{subdomain}/`.

## 3. Zero Direct AI Calls
- This module contains zero direct calls to Gemini or generative language endpoints.
- Any AI assistant logic is invoked via `kosai-engine` contracts or Cloud Functions.

## 4. UI Standards
- Follows Cashwan Branding design system.
- Full RTL layout and Arabic/Hebrew numeral hygiene.
- Glassmorphism, modern Tailwind CSS classes, Day/Night theme compliance.
