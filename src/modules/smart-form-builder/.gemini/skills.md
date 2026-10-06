# smart-form-builder Skills & Domain Knowledge

## Available Skills & Procedures

### 1. Conversational Multi-Step Form Builder
- Construct interactive multi-step forms with rich input types (phone, email, radio, multi-choice, rating, signature, file upload).
- Customize luxury themes, gradients, and Brand DNA styling.

### 2. Multi-Tenant Form Storage & Submissions
- Store form definitions under `tenants/{tenantId}/mod_forms`.
- Collect submission responses under `tenants/{tenantId}/mod_forms/{formId}/submissions`.
- Calculate lead scoring, temperature, and UTM telemetry on submission.

### 3. CRM Lead Pipeline Synchronization
- Automatically generate new lead contacts in `tenants/{tenantId}/contacts` upon successful submission.
- Fire `smart_form:submitted` and `crm:lead:created` events across EventBus for real-time CRM updates.

### 4. WhatsApp Automation Integration
- Trigger customized WhatsApp notifications to customer and team admins upon submission without tight module coupling.
- Leverage dynamic replacement tags (`{fullName}`, `{phone}`, `{answers}`).
