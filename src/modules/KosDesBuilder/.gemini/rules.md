# KosDesBuilder Module Rules

## 1. Overview
The `KosDesBuilder` module serves as the official Dashboard & Backoffice UI Builder monopoly for KOSUN26.
It is an admin/system module managed strictly by Tenant Manager (`isSystemModule: true`).

## 2. Multi-Tenant Scoping
- All dashboard pages and dashboard templates are stored under tenant scope:
  `collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.DASHBOARD_PAGES)`
- Zero flat root collections.

## 3. Zero Direct AI Calls
- AI generation, styling, and copy enhancements are invoked strictly through `kosai-engine` or Cloud Functions.
- Zero direct browser calls to Google Gemini.

## 4. UI & Cashwan Branding Standards
- Full RTL layout and Hebrew language typography with Heebo font.
- Floating Dock navigation (`KosunUniversalDock` style).
- Fullscreen modals (`KosNevModal` style).
- Dynamic view switcher between Desktop and Mobile.
- Section show/hide toggles and live inline editors.
