---
name: modular-firebase-components
description: Standards and architecture guidelines for creating isolated, portable, and zero-collision React full-stack components with Firebase Firestore, Tailwind CSS, API proxying, and modular routing.
---

# Modular Firebase Components Standard

## Core Principles

1. **Self-Contained Full-Stack Modules**
   Each component under `src/modules/[name]/` must contain its own UI, business logic, Firestore access layer, API caller, AI prompts, and sub-routing.

2. **Zero Firestore Collection Collisions**
   - All collections must use module-scoped prefixes (e.g. `mod_[module]_[collection]`).
   - Support Scoped Root paths (`app_modules/{moduleId}/...`).
   - Consumers can override collection names via `customCollections` prop in `ModuleProvider`.

3. **Dependency Injection (Firebase Provider)**
   - The component never hardcodes Firebase keys or direct Firebase initialization in its main bundle.
   - It receives `firebaseApp` through `<ModuleProvider firebaseApp={app}>`.
   - Standalone development uses a local `.env` and `StandaloneView.tsx`.

4. **Modular Sub-Routing**
   - Uses relative paths inside internal `<Routes>`.
   - Host projects mount with a single wildcard path `<Route path="/feature/*" element={<FeatureModule />} />`.

5. **Style & Asset Isolation**
   - Uses Tailwind CSS with proper class scoping.

6. **Centralized API Keys & Integrations Declaration (Rule 6)**
   - Any component or module requiring third-party API credentials, tokens, or AI services (such as Google Gemini API, OpenAI, WhatsApp / Green API, Webhooks) MUST NOT prompt for or store keys in an isolated manner.
   - All modules declare their required keys in `SystemApiKeysConfig` (`src/core/connection/SystemConnectionContext.tsx`) and consume them via `useSystemConnection().apiKeys` or receive them injected via `ModuleProvider`.
   - The user configures, inspects, and validates all API keys centrally inside the **Universal DB Connector Hub UI** (`src/modules/db-connector-hub`).

7. **Mandatory Core DB Connector on Export (Rule 7)**
   - When generating or exporting a client application, `db-connector-hub` is mandatory and automatically included as a core module, ensuring the client platform has full database sync, storage bucket configuration, and AI API keys ready out-of-the-box.
