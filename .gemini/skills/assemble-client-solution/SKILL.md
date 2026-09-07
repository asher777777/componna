---
name: assemble-client-solution
description: Composes and wires multiple isolated modules from src/modules/ into a complete, customized client application with unified routing, Firebase configuration, merged Firestore rules, and custom theming.
---

# Assemble Client Solution Skill (The Assembler)

## Purpose
This skill guides the agent when assembling a tailor-made web application for a specific client by picking and combining modular building blocks from `src/modules/`.

## Assembly Workflow

### 1. Requirements & Module Selection
- Determine the client's business requirements and select the required feature modules (e.g. `auth-portal`, `page-builder`, `media-gallery-hub`).
- Review module configuration overrides (e.g., custom collection prefixes `tenant_clientA_...`).
- Gather client branding requirements (color palette, logo, Hebrew/English strings).

### 2. Client Application Shell Generation
Generate the client application shell:
1. **Root Providers**: Set up Firebase App, Auth Provider, and Theme Provider.
2. **Main Router**: Mount each selected module using wildcard sub-routes:
   ```tsx
   <Route path="/auth/*" element={<AuthPortalModule config={clientConfig.auth} />} />
   <Route path="/pages/*" element={<PageBuilderModule config={clientConfig.pageBuilder} />} />
   <Route path="/media/*" element={<MediaGalleryModule config={clientConfig.media} />} />
   ```
3. **Navigation & Layout**: Create the client-specific navigation bar / sidebar linking to each module.

### 3. Rules & Indexes Merging
- Extract Firestore security rules from each module's `README.md`.
- Merge them into a single consolidated `firestore.rules` file for the client's Firebase project.
- Merge any composite index definitions into `firestore.indexes.json`.

### 4. Customization & Theming
- Apply client brand colors via Tailwind theme or CSS variables.
- Inject custom business logic or hooks using the module's props/context.

### 5. Deployment Verification
1. Run `npm run build` to verify end-to-end type safety.
2. Verify that all selected modules interact cleanly without collection collisions or state conflicts.
