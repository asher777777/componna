# KosAccess Module Rules

## 1. Overview
The `KosAccess` module is the single, authoritative Accessibility Monopoly for KOSUN26.
It covers all mandatory regulations under the Israeli Ministry of Communications (משרד התקשורת), the Israeli Equal Rights for Persons with Disabilities Law (תקנות שוויון זכויות לאנשים עם מוגבלות - תקנה 35), Israeli Standard IS 5568 (ת"י 5568), and international standards (W3C WCAG 2.1 & 2.2 Level AA, Section 508, EN 301 549).

## 2. Multi-Tenant Database Scoping
- All accessibility settings, declarations, and feedback reports are stored strictly in multi-tenant Firestore collections:
  `collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_ACCESS_DECLARATIONS)`
  `collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_ACCESS_FEEDBACK)`
  `collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_ACCESS_SETTINGS)`
- Zero flat root collections.

## 3. Zero Direct AI Calls
- Zero direct browser calls to Google Gemini (`generativelanguage.googleapis.com`).
- Any generative AI assistance is routed through Cloud Functions or `kosai-engine`.

## 4. UI & Cashwan Branding Standards
- Full RTL layout and typography optimized for Hebrew and Arabic.
- Responsive design across all screen types (Mobile 320px+, Tablet, Desktop, Ultra-wide).
- Minimum touch target size of 44x44 CSS pixels on mobile.
- Keyboard accessible with visible focus indicators.
- Web Speech API integration for local text-to-speech.
