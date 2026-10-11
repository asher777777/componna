# Task Assignment: Explorer Survey 3 (Branding, UI, AI & Module Registry)

**Working Directory**: c:\comona\.agents\teamwork\explorer_survey_3
**Original Request File**: c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md
**Project Root**: c:\comona

## Objectives
1. Read `c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md` completely.
2. Investigate Kosun 2026 UI, branding, AI Copilot, and Module Registry:
   - Kosun branding rules (the entity of Kosun - "קושאן" in Hebrew, "kosun" in English, living & breathing persona, Heebo font, Bento Grid layout, Top Nav only without Sidebar).
   - Zero textual emojis rule (Lucide icons exclusively).
   - Strict RTL wrapper `<div dir="rtl" style="text-align: right;">`.
   - Collapsible stats/graphs accordion, minimal smart tooltips `(i)`.
   - AI Copilot conventions: Gemini Flash models (Gemini 3.8 / 3.5 Flash), Brand DNA integration, prompt generation, token tracking, fallback cascades.
   - Module registration in `src/workbench/moduleRegistry.ts` (React.lazy dynamic loading).
   - Page Builder and Visual Drag Editor compatibility patterns.
3. Deliver a comprehensive survey report in `c:\comona\.agents\teamwork\explorer_survey_3/survey_frontend_report.md` and write a handoff report in `handoff.md`.


## 2026-10-11T11:37:24Z
Sender: dbb276bf-78f9-422a-9c00-cd299ccc30cb
Content:
You are a teamwork_preview_explorer investigating UI, branding, AI Copilot, and module registration.
Your working directory is: c:\comona\.agents\teamwork\explorer_survey_3
Read c:\comona\.agents\teamwork\explorer_survey_3\DISPATCH.md and c:\comona\.agents\teamwork\ORIGINAL_REQUEST.md immediately.
Project root is c:\comona.

Investigate:
1. Kosun 2026 Branding guidelines: Hebrew "קושאן", English "kosun" (specifically NOT cashwan), living and breathing persona ("קושאן דואג...", "קושאן מכין..."), Heebo font, Bento Grid layout, Top Nav only (no sidebar).
2. Zero textual emojis (Lucide icons only).
3. Strict RTL wrapper: <div dir="rtl" style="text-align: right;">.
4. Collapsible stats/graphs accordion, minimal smart tooltips (i).
5. AI Copilot (Kosai Email Copilot): Gemini Flash models (Gemini 3.8 / 3.5 Flash), Brand DNA integration, prompt generation, token tracking, fallback cascades.
6. Module registration in src/workbench/moduleRegistry.ts with React.lazy.
7. Visual campaign & workflow builder components, Page Builder integration compatibility.

Write your findings to c:\comona\.agents\teamwork\explorer_survey_3\survey_frontend_report.md and a handoff report in c:\comona\.agents\teamwork\explorer_survey_3\handoff.md.
Send a message to your caller when done.


## 2026-10-11T11:38:31Z
Sender: dbb276bf-78f9-422a-9c00-cd299ccc30cb
Priority: MESSAGE_PRIORITY_HIGH
Content:
**Context**: Final Official Naming Directive
**Content**: Urgent update from project owner and Sentinel:
The final official name of the module is:
Hebrew: "קושאן מייל אוטומטי"
English: "KOSUN AM"
Module directory / ID: `kosun-am` (src/modules/kosun-am/)
Collections prefix: `mod_kosun_am_...` (mod_kosun_am_campaigns, mod_kosun_am_templates, mod_kosun_am_automations, mod_kosun_am_logs)
**Action**: Incorporate this exact name, directory, and collection prefix in your survey report and handoff.
