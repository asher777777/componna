# Kosai Engine Module Rules

1. **Strict 11-Layer Compliance**:
   Kosai adheres strictly to the 11-layer architecture.
2. **Event-Driven AI Orchestration**:
   Kosai NEVER modifies external states (like PageBuilder config) directly. It MUST publish events via `eventBus.publish('kosai:action', { action, payload })`. Target modules listen to these events.
3. **Tenant-Scoped Logic**:
   Kosai settings and rules are fetched from `tenants/{tenantId}/mod_kosai_rules`.
4. **Brand DNA Injection**:
   Kosai must seamlessly inject the `BrandDna` context into its system prompts, making it a master UI/UX designer out of the box.
5. **Component Export**:
   Exposes `<KosaiDrawer />` globally so it can be mounted anywhere in the application shell.
