# media-gallery-hub Skills & Domain Knowledge

## Available Skills & Procedures

### 1. Unified Media Upload & Storage Pipeline
- Stream direct uploads to Firebase Cloud Storage at `tenants/{tenantId}/media/`.
- Maintain real-time sync with Firestore `tenants/{tenantId}/sdo_media_items`.
- Pre-save blobs to client-side IndexedDB for zero-latency local previews.

### 2. Media Picker Capability Provider
- Implement and register the `MediaPickerContract` via `HostCapabilitiesContext`.
- Allow modal image selection for PageBuilder, SmartForms, and WhatsApp with custom mime filters.

### 3. HeyGen Cloud Sync Engine
- Synchronize AI avatar video assets from HeyGen API.
- Persist cloud video assets into the tenant's media vault.

### 4. Image Optimization & Studio Tools
- In-browser format conversion (JPEG/PNG -> WebP/AVIF).
- AI background removal and Gemini-powered image generation/editing.
