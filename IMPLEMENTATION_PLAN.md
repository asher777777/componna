# Modular React Component Development Environment (Full-Stack Portable Modules)

A professional development workbench and environment based on **React + Vite + TypeScript + Tailwind CSS** for building, testing, and distributing completely isolated, portable full-stack components (Self-Contained Feature Modules).

Each component is built from a structured **Component Specification (אפיון קומפוננטה)** and generated automatically using a dedicated **AI Skill** that implements all 10 architectural layers.

---

## Architectural Principles & Assets in `.gemini`

1. **Component Specification Template (`.gemini/templates/component_spec_template.md`):**
   * Standardized specification document defining Firestore collections, UI views, sub-routes, API endpoints, AI prompts, and security rules.
2. **Build Component from Spec Skill (`.gemini/skills/build-component-from-spec`):**
   * AI Skill instructing the agent to parse a specification file and generate the complete 10-layer module under `src/modules/[module-name]/`.
3. **Modular Firebase Skill (`.gemini/skills/modular-firebase-components`):**
   * Enforces zero-collision Firestore collections (`mod_[module]_[collection]`), scoped root access, and Context-based Firebase dependency injection.
4. **Strict RTL Rules (`.gemini/rules/rtl_rules.md`):**
   * Project-level rule enforcing clean Right-to-Left alignment for Hebrew documentation and chat outputs.
5. **API & AI Proxy Layer:**
   * Secure backend calls to Firebase Cloud Functions to protect sensitive AI keys.
   * Dedicated `prompts/` directory for system prompts, few-shot examples, and LLM output schemas.
6. **Interactive Development Workbench:**
   * Sidebar navigation, dynamic module registry, live Firebase connection status indicator, and isolated standalone testing view.

---

## Project Structure

```text
comona/
├── .gemini/
│   ├── rules/
│   │   └── rtl_rules.md                         # Strict RTL rule
│   ├── templates/
│   │   └── component_spec_template.md           # Component specification template
│   └── skills/
│       ├── build-component-from-spec/
│       │   └── SKILL.md                         # Generator skill from spec
│       └── modular-firebase-components/
│           └── SKILL.md                         # Firebase modularity standard
├── scripts/
│   └── create-module.js                         # Rapid module CLI generator
├── src/
│   ├── modules/
│   │   └── _template/                           # Clean 10-layer starter template
│   │       ├── api/                             # Cloud Function API callers
│   │       ├── prompts/                         # AI system prompts and schemas
│   │       ├── components/                      # Tailwind UI components
│   │       ├── hooks/                           # Custom React state & logic hooks
│   │       ├── services/                        # Scoped Firestore data services
│   │       ├── routes/                          # Internal sub-routes
│   │       ├── types/                           # TypeScript interfaces & types
│   │       ├── config/                          # Collection registry & defaults
│   │       ├── context/                         # Firebase DI Provider
│   │       ├── .env.example                     # Sample environment variables
│   │       ├── index.ts                         # Main public export
│   │       ├── StandaloneView.tsx               # Standalone runner for development
│   │       └── README.md                        # Integration guide & security rules
│   ├── workbench/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx                      # Module list sidebar & filter
│   │   │   ├── FirebaseStatus.tsx               # Firebase connection health
│   │   │   └── Header.tsx                       # Workbench header & actions
│   │   ├── WorkbenchApp.tsx                     # Main Workbench shell
│   │   └── moduleRegistry.ts                    # Dynamic module registry
│   ├── App.tsx                                  # Application root
│   ├── main.tsx                                 # React entry point
│   └── index.css                                # Tailwind CSS and RTL baseline
├── IMPLEMENTATION_PLAN.md                       # English Work Plan
├── package.json                                 # Dependencies & scripts
├── tsconfig.json                                # TypeScript configuration
├── tailwind.config.js                           # Tailwind CSS configuration
└── vite.config.ts                               # Vite bundler configuration
```

---

## Implementation Steps

### Phase 1: Core Project Infrastructure & Dependencies
- `package.json`: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Firebase SDK, React Router DOM.
- `vite.config.ts`: Vite setup with path aliases and RTL support.
- `tsconfig.json`: Strict TypeScript configuration.
- `tailwind.config.js`: Tailwind configuration with CSS isolation.
- `src/index.css`: Baseline styles and RTL direction defaults.

### Phase 2: Base 10-Layer Module Template (`_template`)
- Complete implementation of all 10 layers in `src/modules/_template/`.

### Phase 3: Module CLI Generator
- `scripts/create-module.js`: Automated module cloning and registry updating script.

### Phase 4: Interactive Workbench Shell
- Build `src/workbench/` components, module switcher, Firebase status indicator, and standalone runner.

---

## Verification Plan

1. **Build Verification:** Run `npm run build` to verify clean TypeScript compilation and zero bundle errors.
2. **Generator Verification:** Run `npm run new-module my-test-feature` to test automated scaffolding.
3. **Workbench Verification:** Run `npm run dev` to verify browser rendering, RTL layout, sidebar navigation, and standalone module mounting.
