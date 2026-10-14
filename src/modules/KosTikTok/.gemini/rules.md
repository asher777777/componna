# KosTikTok Architecture & Monopoly Rules

1. **Module Monopoly:**
   - KosTikTok is the exclusive authority in KOSUN26 for TikTok OAuth authentication, video and carousel publishing, video catalog ingestion, TikTok Lead Generation Webhooks/sync, and TikTok Events API (Conversions).
   - Zero direct client calls to external AI or Generative Language APIs (`generativelanguage.googleapis.com`). All AI-assisted caption generation or video processing must go through `executeCloudAi` from `src/core/ai` or Host Capabilities.
   - Zero fallback cascade loops (`modelsToTry` or `GEMINI_FALLBACK_MODELS`).

2. **Tenant Scoping & Database Isolation:**
   - All Firestore collections must be scoped per tenant using `useTenantScope()`.
   - Collections used: `SYSTEM_COLLECTIONS.KOS_TIKTOK_ACCOUNTS`, `SYSTEM_COLLECTIONS.KOS_TIKTOK_POSTS`, `SYSTEM_COLLECTIONS.KOS_TIKTOK_VIDEOS`, `SYSTEM_COLLECTIONS.KOS_TIKTOK_LEADS`, `SYSTEM_COLLECTIONS.KOS_TIKTOK_EVENTS`.
   - Unscoped root collections (`contacts`, `leads`, etc.) without tenant scope are strictly forbidden.

3. **Security:**
   - Never store TikTok Client Secret, Access Tokens, or Refresh Tokens in `localStorage` or `sessionStorage`.
   - All tokens are stored in the secure tenant-scoped Firestore collection or fetched via Cloud Functions.

4. **UI Design & Cashwan Branding:**
   - Full RTL (`dir="rtl"`).
   - Exclusive navigation via `KosunUniversalDock`.
   - 100% fullscreen modals (`KosNevModal` / `KosTikTokFullscreenModal`).
   - Pure Lucide React icons, no emojis in UI text.
   - Cross-module integration strictly via `<CapabilitySlot />`.
