# crm-groups-hub Skills & Domain Knowledge

## Available Skills & Procedures

### 1. Smart Group Segmentation Engine
- Evaluate dynamic rules based on spending tiers, city, gender, purchase frequency, and custom tags.
- Auto-calculate member counts and sync live segments against `tenants/{tenantId}/contacts`.

### 2. Multi-Tenant Community Micro-Portals
- Generate standalone landing pages under `tenants/{tenantId}/mod_pages_documents` for VIP groups and donors.
- Enable community feeds, announcements, and direct action triggers.

### 3. Community Chat & Interaction History
- Manage internal group messaging in `tenants/{tenantId}/crm_chat_messages`.
- Log customer interactions (calls, notes, donations, WhatsApp messages) to `tenants/{tenantId}/crm_interactions`.
- Broadcast state events via EventBus (`crm:contact:updated`).

### 4. Bulk Operations & Audience Transfer
- Perform batch tagging, moving, or group assignments across multiple contact records.
- Broadcast targeted WhatsApp messages to group members via Green API integration without cross-module tight coupling.
