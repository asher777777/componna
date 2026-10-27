# crm-analytics Skills & Domain Knowledge

## Available Skills & Procedures

### 1. 360° Contact Profile & Lifetime Metrics
- Aggregate customer spend, order history, form submissions, and campaign donations.
- Compute RFM (Recency, Frequency, Monetary) analytics and customer health metrics.

### 2. Multi-Tenant CRM Data Ingestion & Live Analytics
- Pull contact records from `tenants/{tenantId}/contacts` and `tenants/{tenantId}/mod_crm_leads`.
- Dynamically construct filtered data tables, charts, and export reports.

### 3. Business Card Scanner & OCR Processing
- Extract contact names, phone numbers, emails, and company names from captured card photos via Gemini Vision API.
- Create new contacts in the tenant's CRM with source tagging.

### 4. Saved Analytics Views & Custom Field Schema
- Store user-defined filter presets in `tenants/{tenantId}/crm_analytics_saved_views`.
- Configure custom CRM schema fields in `tenants/{tenantId}/crm_custom_fields`.
