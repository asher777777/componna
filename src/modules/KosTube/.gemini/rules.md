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

5. **Tenant Ownership & Branding Monopoly Rule (חוק בעלות הטננט וקולקציית המיתוג):**
   - The generated SEO page belongs 100% exclusively to the system tenant (user).
   - Attribution/credit to the original video/channel creator is permitted inside the content description/footer ("זכויות יוצרים / מקור: [שם הערוץ]").
   - Everything else (Header, Logo, Colors, Typography, Footer, CTA, Contact details, WhatsApp/Phone/Email, Brand Voice, Navigation, and Theme) MUST strictly adhere to the tenant's branding collection (`tenants/{tenantId}/settings/kos_branding_dna`).
   - Unless the page producer explicitly configured otherwise, the absolute default is always the tenant's branding collection.
   - Absolutely no fake/fabricated metrics (zero mock data): only genuine page views and truthful YouTube statistics (or 0 if unavailable) are shown.
   - The slug for video pages defaults to `kosvidio` (or `kosvidio-[videoId]`).
