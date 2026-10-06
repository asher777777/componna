# whatsapp-green-api-hub Skills & Domain Knowledge

## Available Skills & Procedures

### 1. Green API Instance Management
- Authorize QR code and phone-based pairings.
- Check state instance (`authorized`, `blocked`, `sleepMode`, `starting`).
- Manage incoming message webhooks and cloud function listeners.

### 2. Multi-Tenant AI Bot Configuration & Simulation
- Maintain Gemini 3.x Flash/Pro powered customer service bots under `tenants/{tenantId}/whatsapp_ai_bots`.
- Manage interactive buttons and quick reply payloads.
- Record bot conversation history in `tenants/{tenantId}/wa_bot_chats`.

### 3. WhatsApp Statuses & Stories Automation
- Generate status posts using Brand DNA presets, Chasidic/marketing tones, and media attachments.
- Upload status media to `tenants/{tenantId}/whatsapp_statuses/`.
- Manage recurring status scheduling in `tenants/{tenantId}/whatsapp_status_automations`.

### 4. Bulk Broadcaster & CRM Sync
- Import recipient lists filtered by CRM groups and tags from `tenants/{tenantId}/crm_groups` and `tenants/{tenantId}/contacts`.
- Throttle message broadcasts with customizable interval delays to prevent WhatsApp anti-spam bans.
- Smart merge contacts from chats into CRM database.
