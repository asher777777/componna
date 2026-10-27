# flow-player-engine Skills & Domain Knowledge

## Available Skills & Procedures

### 1. Interactive Branching Campaign Execution
- Traverse conversational video nodes based on user intent, button clicks, or speech recognition triggers.
- Support loop-until-trigger, auto-transitions, and timeout fallbacks.

### 2. Multi-Tenant Campaign Ingestion & Playback
- Load campaign node graphs from `tenants/{tenantId}/sdo_player_campaign_configs`.
- Cache video URLs and fallback media for instant zero-buffering transitions.

### 3. Voice Interaction & Intent Parsing
- Listen to real-time voice input using Web Speech API and match keywords against node allowed intents.
- Provide accessible on-screen microphone indicators.

### 4. Lead Capture & Telemetry Logging
- Render embedded lead forms directly over video scenes.
- Emit `crm:lead:created` across EventBus and record telemetry in `tenants/{tenantId}/sdo_player_session_events`.
