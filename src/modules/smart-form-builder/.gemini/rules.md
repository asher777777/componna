# smart-form-builder Isolation & Architecture Rules

## 1. Overview
The `smart-form-builder` module enables creation, conversational step customization, AI generation, and multi-step execution of high-converting smart forms with automatic CRM sync and WhatsApp auto-responder sequences.

## 2. Multi-Tenant Firestore Subcollections
All form definitions and submissions MUST be stored in tenant-isolated paths under `tenants/{tenantId}/`:
- Form documents: `tenants/{tenantId}/mod_forms`
- Form submissions: `tenants/{tenantId}/mod_forms/{formId}/submissions`
- Lead creation in CRM contacts: `tenants/{tenantId}/contacts`
- Root / Apex fallback: `tenants/_master/...`

Direct root-level collection access is prohibited. Use `useTenantScope()` to resolve `getScopedCollectionPath(SYSTEM_COLLECTIONS.SMART_FORMS)`.

## 3. LocalStorage Keys
All local persistence keys must be scoped with tenantId:
- `kosun_{tenantId}_smart_forms_cache`
- `kosun_{tenantId}_draft_form_{formId}`

## 4. Zero Cross-Module Imports
- `smart-form-builder` must NEVER import directly from other modules (e.g., `whatsapp-green-api-hub`, `brand-dna-hub`, `crm-analytics`).
- Cross-module interoperability is achieved through:
  - EventBus (e.g., publishing `smart_form:submitted`, `crm:lead:created`)
  - Contracts (`FormBuilderContract`, `LeadPayload`, `SYSTEM_COLLECTIONS`)
  - Host capabilities (`useHostCapabilities()`)

## 5. Runtime Resilience & Isolation
- The module is dynamically loaded via `React.lazy()` in `src/workbench/moduleRegistry.ts`.
- Submission network delays or offline states fall back gracefully to local storage and queueing without impacting the host shell.
