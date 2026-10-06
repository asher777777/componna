# media-gallery-hub Isolation & Architecture Rules

## 1. Overview
The `media-gallery-hub` module acts as the centralized digital asset vault for the Comona platform. It manages image/video uploads, HeyGen video avatar synchronization, background removal, WebP/AVIF compression, and media folder hierarchies.

## 2. Multi-Tenant Firestore Subcollections & Cloud Storage
All media records and uploaded files MUST reside in tenant-isolated paths:
- Firestore Media Items: `tenants/{tenantId}/sdo_media_items`
- Firestore Media Folders: `tenants/{tenantId}/sdo_media_folders`
- Cloud Storage Assets: `tenants/{tenantId}/media/{timestamp}_{filename}`
- Apex / Root domain fallback: `tenants/_master/...`

Direct root bucket paths (`sdo_media_vault/...`) or unscoped collections are strictly forbidden. `useTenantScope()` provides `tenantId` and `getScopedCollectionPath(SYSTEM_COLLECTIONS.MEDIA_ITEMS)`.

## 3. LocalStorage & IndexedDB Isolation
- IndexedDB stores local blobs keyed by canonical item IDs.
- Any local cache keys must include the tenant ID: `comona_{tenantId}_media_cached_items`.

## 4. Zero Cross-Module Imports
- `media-gallery-hub` must NEVER import directly from other modules (e.g. `video-producer-studio`, `brand-dna-hub`, `page-builder`).
- Communication occurs exclusively through:
  - Host Capabilities (`MediaPickerContract`, `useHostCapabilities()`)
  - EventBus (e.g. emitting `media:item:created`, `sdo_media_updated`)
  - Contracts (`SYSTEM_COLLECTIONS`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Storage upload failures or browser CORS interruptions automatically fall back to local IndexedDB and ObjectURLs so users never experience a frozen UI.
