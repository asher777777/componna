---
name: component-spec-brainstorm
description: Conducts an interactive, step-by-step brainstorming and requirement elicitation session with the user to design, specify, and generate a complete Component Specification document (אפיון קומפוננטה) based on .gemini/templates/component_spec_template.md.
---

# Component Specification Brainstorming Skill

## Purpose
This skill guides the AI agent to conduct an interactive, structured brainstorming session in Hebrew (full RTL) with the user. The goal is to define all aspects of a new modular React full-stack component and generate a complete specification document ready for automated code generation.

## Communication & Formatting Rules
- **Strict RTL**: All questions, summaries, and outputs must be formatted in Right-To-Left direction.
- **One Question at a Time**: Walk down each branch of the design tree step-by-step.
- **Provide Recommendations**: For every decision point, offer a clear recommended option with rationale.

## Brainstorming Phases (The 6 Design Steps)

### Step 1: Vision & Purpose (חזון ומטרה)
- Component name (English kebab-case, e.g. `support-ticket-system`) and Hebrew display name.
- Core purpose, target users, and key user flows.
- Default collection prefix (e.g. `mod_tickets_`).

### Step 2: Firestore Data Architecture (מבנה נתונים)
- Main collections and field definitions (types, required fields, timestamps, user associations).
- Sub-collections (if any) and relational hierarchy.

### Step 3: UI & UX Layout (מסכים וממשק)
- Screen 1: Default / List View (filters, sorting, action triggers).
- Screen 2: Create / Edit Form View (validations, inputs, modals).
- Screen 3: Detail / Extended View (deep inspection, status changes).
- Tailwind styling preferences and responsive design details.

### Step 4: Internal Sub-Routing (ניתוב פנימי)
- Define relative routes (`""`, `"new"`, `":id"`, `":id/edit"`, `"analytics"`).

### Step 5: AI & Cloud Functions API (שכבת ענן ו-AI)
- Firebase Cloud Functions endpoints, input payloads, and return schemas.
- AI system prompts, few-shot examples, prompt variables, and JSON output format.

### Step 6: Security & Environment (.env וחוקי אבטחה)
- Granular Firestore security rules (read/write/auth policies).
- Required environment variables for standalone development.

## Output Generation & Next Steps
1. Once all 6 steps are agreed upon, generate the completed specification file at `specs/[module-name]-spec.md` using the format in `.gemini/templates/component_spec_template.md`.
2. Present a concise summary to the user and offer to immediately trigger the `build-component-from-spec` skill to implement the module.
