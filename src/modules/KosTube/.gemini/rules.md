# KosTube Architecture & Monopoly Rules

1. **Module Monopoly:**
   - KosTube is the exclusive authority in KOSUN26 for YouTube channel connection, video ingestion, AI video content transformation, and SEO page generation.
   - All external AI operations must go through `executeCloudAi` from `src/core/ai` or Host Capabilities. Never call `generativelanguage.googleapis.com` directly from the client.
   - Zero fallback cascade loops (`modelsToTry` or `GEMINI_FALLBACK_MODELS`).

2. **Tenant Scoping:**
   - All collections must be scoped per tenant using `useTenantScope()`.
   - Collections used: `SYSTEM_COLLECTIONS.KOS_TUBE_CHANNELS`, `SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS`, `SYSTEM_COLLECTIONS.KOS_TUBE_PAGES`.
   - Unscoped root collections (`contacts`, `leads`, etc.) are strictly forbidden.

3. **Security:**
   - Never store API keys in `localStorage.getItem('gemini...')` or `localStorage.getItem('googleAi...')`.
   - YouTube API Keys and Gemini Keys are managed securely via Tenant settings.

4. **UI Design & Cashwan Branding:**
   - Full RTL (`dir="rtl"`).
   - Exclusive navigation via `KosunUniversalDock`.
   - 100% fullscreen modals (`KosNevModal`).
   - Cross-module integration strictly via `<CapabilitySlot />`.
