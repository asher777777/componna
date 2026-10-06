# saas-storefront-composer Skills & Domain Knowledge

## Available Skills & Procedures

### 1. SaaS Marketplace Bundle Composer
- Configure module pricing, recurring billing intervals, and promotional discounts.
- Allow prospective clients to customize their Comona suite with live cost previews.

### 2. Multi-Tenant Subdomain Provisioning
- Verify subdomain availability against GoDaddy DNS API (`{subdomain}.kosun.pro`).
- Auto-generate CNAME and A records.
- Initialize tenant root structure in Firestore under `tenants/{subdomain}/`.

### 3. Client Onboarding & Payment Integration
- Handle checkout through Kesher terminal or digital payment providers.
- Emit `tenant:provisioned` on successful activation.
- Send tenant welcome notifications and onboarding links.
