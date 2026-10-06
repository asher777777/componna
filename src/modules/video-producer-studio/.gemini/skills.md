# video-producer-studio Skills & Domain Knowledge

## Available Skills & Procedures

### 1. AI Storyboard & Multi-Scene Script Generation
- Generate structured, cinematic scenes using Gemini 3.x Flash/Pro with character dialogue, camera angles, and visual prompts.
- Refine storyboards based on Brand DNA values, UVPs, and tone of voice.

### 2. Multi-Tenant Project Synchronization
- Save video projects and scenes to `tenants/{tenantId}/sdo_video_projects`.
- Cache and pre-render scenes into client-side IndexedDB for zero-lag playback.

### 3. HeyGen & Veo Video Production
- Dispatch video rendering jobs to HeyGen and Google Veo.
- Poll render progress and automatically sync final mp4 video URLs to the tenant's media gallery (`tenants/{tenantId}/sdo_media_items`).

### 4. Interactive Flow Player Bridge
- Export completed video scenes into interactive branching campaigns under `tenants/{tenantId}/sdo_player_campaign_configs`.
