# kesher-payments-hub Skills & Domain Knowledge

## Available Skills & Procedures

### 1. Terminal Payment Processing
- Initialize terminal session with Kesher API credentials.
- Handle tokenization, credit card authorization, installments, and bit/Apple Pay/Google Pay payment options.
- Emit `payment:completed` event to global EventBus upon successful charge.

### 2. Multi-Tenant Transaction Synchronization
- Synchronize real-time transactions with Firestore under `tenants/{tenantId}/kesher_transactions`.
- Support offline queueing and local cache fallback using `comona_{tenantId}_kesher_transactions`.
- Reconcile status updates from external webhooks or polling.

### 3. Contact Synced History
- Query contact transactions from `tenants/{tenantId}/contacts` and aggregate lifetime customer value (LTV).
- Link customer phone/email to transactional receipts.

### 4. Digital Receipt & WhatsApp Distribution
- Generate EasyCount / digital invoice PDFs.
- Request HostCapability or EventBus notification to send receipt link via WhatsApp (`whatsapp-green-api-hub`) without hard importing the WhatsApp module.
