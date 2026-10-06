# page-builder Skills & Domain Knowledge

## Available Skills & Procedures

### 1. Visual Drag-and-Drop Page Canvas
- Reorder, duplicate, add, and remove section blocks (hero, features, testimonials, pricing, contact, smart forms, video players).
- Render live preview in responsive desktop, tablet, and mobile viewports.

### 2. Multi-Tenant Page Storage & Routing
- Store page configurations in `tenants/{tenantId}/mod_pages_documents`.
- Support custom slugs, SEO meta tags, and instant publishing.
- Serve published public pages with isolated view tracking at `/p/:slug`.

### 3. Brand DNA Global Token Integration
- Dynamically apply colors, fonts, border radii, and button styles from `BrandDnaContract`.
- Re-render canvas components immediately upon `brand:updated` EventBus notifications.

### 4. Interactive Section Extensibility
- Integrate embedded Smart Forms via `FormBuilderContract` without hard dependencies.
- Embed Kesher payment checkouts and media gallery assets through Host Capabilities.
