# KosTikTok Skills & Capabilities

This module acts as the Single Source of Truth for TikTok operations in the KOSUN26 platform.

## Registered Capabilities:
- `tiktok-publisher`: Allows other modules (such as `video-producer-studio` or `KosTube`) to publish videos directly to TikTok using `<CapabilitySlot name="tiktok-publisher" />`.
- `tiktok-lead-receiver`: Intercepts and parses TikTok Instant Form leads into canonical CRM contacts.
- `tiktok-events-tracker`: Server-side conversions dispatcher via TikTok Events API v1.3.
