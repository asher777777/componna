# video-producer-studio Isolation & Architecture Rules

## 1. Overview
The `video-producer-studio` module manages AI storyboard creation, HeyGen video avatar generation, Veo scene creation, TTS narration, and bridges scenes into interactive Flow Player campaigns.

## 2. Multi-Tenant Firestore Subcollections
All projects, scenes, and media syncs MUST be isolated under `tenants/{tenantId}/`:
- Video projects: `tenants/{tenantId}/sdo_video_projects`
- Media items sync: `tenants/{tenantId}/sdo_media_items`
- Flow campaigns bridge: `tenants/{tenantId}/sdo_player_campaign_configs`
- Apex / Root domain fallback: `tenants/_master/...`

Direct root collection access without tenant scoping is strictly prohibited. `useTenantScope()` provides `tenantId` and ensures proper isolation across subdomains and `_master`.

## 3. LocalStorage & IndexedDB Isolation
- IndexedDB database isolates projects per user session.
- LocalStorage keys must be tenant-prefixed:
  - `kosun_{tenantId}_video_studio_projects`

## 4. Zero Cross-Module Imports
- `video-producer-studio` must NEVER import directly from other modules (e.g. `media-gallery-hub`, `page-builder`, `flow-player-engine`).
- Communication occurs exclusively through:
  - EventBus (e.g. `sdo_media_updated`)
  - Contracts (`BrandDnaContract`, `MediaPickerContract`, `SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- AI generation errors, API quotas, or third-party service latency must be caught and reported gracefully without disrupting the workbench.
