---
name: Kosai AI Engine
description: Integration rules for connecting agents to the Kosai Engine module.
---

# Kosai Engine Integration Skill

When a user asks to modify the Kosai Engine, use this skill to ensure correct integration:

- **Adding new capabilities to Kosai**:
  1. Add the capability ID to `types/index.ts` (`KosaiCapability`).
  2. Update the prompt generator in `prompts/index.ts` to instruct Gemini on how to output JSON for this new action.
  3. Update the consuming module (e.g., Page Builder) to listen to `kosai:action` and react appropriately.
- **Accessing Media**:
  Kosai uses the event bus to access the `media-gallery-hub`. It emits `eventBus.publish('media:request_picker', callback)` to allow the user to select an image from their tenant's library instead of local uploads.
- **Kosai Rules**:
  Kosai changes its personality based on the current Route Slug by evaluating `mod_kosai_rules` from Firestore.
