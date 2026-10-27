# flow-player-engine Isolation & Architecture Rules

## 1. Overview
The `flow-player-engine` module executes branching, voice-activated interactive video campaigns with responsive overlays, lead forms, and telemetry tracking.

## 2. Multi-Tenant Firestore Subcollections
All campaign configurations and session analytics MUST reside under `tenants/{tenantId}/`:
- Campaign configs: `tenants/{tenantId}/sdo_player_campaign_configs`
- Interactive session telemetry: `tenants/{tenantId}/sdo_player_session_events`
- Presenters: `tenants/{tenantId}/presenters`

Direct root collection access without tenant scoping is prohibited. `useTenantScope()` provides `tenantId` and `getScopedCollectionPath(SYSTEM_COLLECTIONS.PLAYER_CAMPAIGNS)`.

## 3. LocalStorage Keys
All local persistence keys must be scoped with tenantId:
- `kosun_{tenantId}_flow_campaigns`
- `kosun_{tenantId}_active_flow_campaign_id`

## 4. Zero Cross-Module Imports
- `flow-player-engine` must NEVER import directly from other modules (e.g. `video-producer-studio`, `crm-analytics`).
- Cross-module communication occurs exclusively via:
  - EventBus (e.g. `crm:lead:created`, `flow:node:transition`)
  - Contracts (`LeadPayload`, `SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Video playback errors, codec incompatibilities, or Web Speech recognition drops must fail over gracefully without terminating the user's session.
