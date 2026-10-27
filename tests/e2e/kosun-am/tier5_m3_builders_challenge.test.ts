import test, { describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Tier 5: Milestone 3 Adversarial Empirical Challenge Suite
 * 
 * Verifies:
 * 1. Visual Email Block Compiler Engine (6 block types, {{unsubscribe_url}} injection, malformed inputs)
 * 2. Mobile & Desktop Responsive Preview Switcher & Phone Chassis Frame
 * 3. Multi-Channel Automation Pipeline (Triggers, Delays, Email, WhatsApp Green API)
 * 4. Workbench Module Registry & Dynamic Lazy Loading (React.lazy, Top Nav icon)
 * 5. Kosun 2026 Brand Standards (Zero Emojis, Strict RTL, Heebo, Living Persona)
 */

describe('Tier 5: Milestone 3 Visual Builders & Multi-Channel Workflow Engine Challenge Suite', () => {

  const emailEditorModalPath = path.resolve('src/modules/KosMail/components/EmailEditorModal.tsx');
  const automationBuilderPath = path.resolve('src/modules/KosMail/components/AutomationBuilderView.tsx');
  const moduleRegistryPath = path.resolve('src/workbench/moduleRegistry.ts');
  const topNavPath = path.resolve('src/workbench/components/KosTopNav.tsx');

  const emailEditorContent = fs.readFileSync(emailEditorModalPath, 'utf8');
  const automationBuilderContent = fs.readFileSync(automationBuilderPath, 'utf8');
  const moduleRegistryContent = fs.readFileSync(moduleRegistryPath, 'utf8');
  const topNavContent = fs.readFileSync(topNavPath, 'utf8');

  // Extract the live implementation of compileBlocksToHtml directly from EmailEditorModal.tsx
  const compileFnMatch = emailEditorContent.match(
    /export function compileBlocksToHtml\(blocks[^)]*\)[^{]*\{([\s\S]*?)\n\}\n\nexport const EmailEditorModal/
  );
  assert.ok(compileFnMatch, 'Must be able to extract compileBlocksToHtml from EmailEditorModal.tsx');
  const liveCompileBlocksToHtml = new Function('blocks', compileFnMatch[1]) as (blocks: any[]) => string;

  // =========================================================================
  // Challenge 1: Visual Email Block Compiler Engine
  // =========================================================================
  describe('Challenge 1: Visual Email Block Compiler Engine', () => {

    test('1.1 - Empty blocks input renders valid HTML skeleton with RTL and 600px wrapper', () => {
      const html = liveCompileBlocksToHtml([]);
      assert.ok(html.includes('<!DOCTYPE html>'), 'Must start with <!DOCTYPE html>');
      assert.ok(html.includes('<html dir="rtl" lang="he">'), 'Must contain <html dir="rtl" lang="he">');
      assert.ok(html.includes('<body dir="rtl"'), 'Body must be configured with dir="rtl"');
      assert.ok(html.includes('direction: rtl; text-align: right;'), 'Body style must include RTL direction and text alignment');
      assert.ok(html.includes('max-width: 600px;'), 'Container must enforce max-width: 600px');
      assert.ok(html.includes("'Heebo'"), 'Body font-family must include Heebo font');
    });

    test('1.2 - Header block compiles with logo, title, subtitle and styling', () => {
      const blocks = [
        {
          id: 'hdr_1',
          type: 'header',
          content: {
            logoUrl: 'https://kosun.pro/logo.png',
            title: 'כותרת מבצע חגיגית',
            subtitle: 'תת-כותרת מסבירה ומפורטת',
          },
          styles: {
            alignment: 'center',
            backgroundColor: '#f1f5f9',
            textColor: '#1e293b',
          },
        },
      ];
      const html = liveCompileBlocksToHtml(blocks);
      assert.ok(html.includes('<img src="https://kosun.pro/logo.png" alt="Logo"'), 'Must render logo image');
      assert.ok(html.includes('<h1'), 'Must render h1 element');
      assert.ok(html.includes('כותרת מבצע חגיגית'), 'Must render title text');
      assert.ok(html.includes('תת-כותרת מסבירה ומפורטת'), 'Must render subtitle text');
      assert.ok(html.includes('background: #f1f5f9'), 'Must apply background style');
      assert.ok(html.includes('color: #1e293b'), 'Must apply textColor style');
    });

    test('1.3 - Hero block compiles with image URL, title and subtitle', () => {
      const blocks = [
        {
          id: 'hero_1',
          type: 'hero',
          content: {
            imageUrl: 'https://images.unsplash.com/test-hero.jpg',
            title: 'תמונת מבצע מרהיבה',
            subtitle: 'הזדמנות חד פעמית',
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#0f172a',
          },
        },
      ];
      const html = liveCompileBlocksToHtml(blocks);
      assert.ok(html.includes('<img src="https://images.unsplash.com/test-hero.jpg" alt="תמונת מבצע מרהיבה"'), 'Must render hero image');
      assert.ok(html.includes('<h2'), 'Must render h2 title element');
      assert.ok(html.includes('תמונת מבצע מרהיבה'), 'Must include hero title text');
      assert.ok(html.includes('הזדמנות חד פעמית'), 'Must include hero subtitle text');
    });

    test('1.4 - Rich-text block compiles with pre-line bodyText and alignment', () => {
      const blocks = [
        {
          id: 'txt_1',
          type: 'rich-text',
          content: {
            title: 'פסקה ראשית',
            bodyText: 'שורה ראשונה\nשורה שניה\nשורה שלישית',
          },
          styles: {
            alignment: 'right',
            backgroundColor: '#ffffff',
            textColor: '#334155',
          },
        },
      ];
      const html = liveCompileBlocksToHtml(blocks);
      assert.ok(html.includes('<h3'), 'Must render h3 heading');
      assert.ok(html.includes('פסקה ראשית'), 'Must include paragraph title');
      assert.ok(html.includes('white-space: pre-line;'), 'Must preserve line breaks with white-space: pre-line');
      assert.ok(html.includes('שורה ראשונה\nשורה שניה\nשורה שלישית'), 'Must preserve multiline body text');
      assert.ok(html.includes('text-align: right'), 'Must apply text-align right');
    });

    test('1.5 - Button-CTA block compiles with link target and custom colors', () => {
      const blocks = [
        {
          id: 'cta_1',
          type: 'button-cta',
          content: {
            buttonText: 'להרשמה מיידית',
            buttonUrl: 'https://kosun.pro/signup',
          },
          styles: {
            alignment: 'center',
            backgroundColor: '#10b981',
            textColor: '#ffffff',
          },
        },
      ];
      const html = liveCompileBlocksToHtml(blocks);
      assert.ok(html.includes('href="https://kosun.pro/signup"'), 'Must render link href');
      assert.ok(html.includes('להרשמה מיידית'), 'Must render button text');
      assert.ok(html.includes('background: #10b981'), 'Must apply custom button background color');
      assert.ok(html.includes('color: #ffffff'), 'Must apply button text color');
      assert.ok(html.includes('border-radius: 12px'), 'Must apply rounded button styling');
    });

    test('1.6 - Divider block compiles with styled hr element', () => {
      const blocks = [
        {
          id: 'div_1',
          type: 'divider',
          content: {},
          styles: { backgroundColor: '#ffffff' },
        },
      ];
      const html = liveCompileBlocksToHtml(blocks);
      assert.ok(html.includes('<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />'), 'Must render horizontal rule');
    });

    test('1.7 - Footer block strictly injects {{unsubscribe_url}} and privacy notice', () => {
      const blocks = [
        {
          id: 'ftr_1',
          type: 'footer',
          content: {
            bodyText: 'כל הזכויות שמורות לקושאן 2026',
          },
          styles: {
            backgroundColor: '#f8fafc',
          },
        },
      ];
      const html = liveCompileBlocksToHtml(blocks);
      assert.ok(html.includes('כל הזכויות שמורות לקושאן 2026'), 'Must render custom footer body');
      assert.ok(
        html.includes('href="{{unsubscribe_url}}"'),
        'Footer block must strictly inject mandatory {{unsubscribe_url}} token'
      );
      assert.ok(
        html.includes('הסרה מרשימת התפוצה'),
        'Footer block must contain Hebrew unsubscribe anchor text'
      );
    });

    test('1.8 - Footer block injects {{unsubscribe_url}} even when bodyText is empty or undefined', () => {
      const blocks = [
        {
          id: 'ftr_empty',
          type: 'footer',
          content: {},
        },
      ];
      const html = liveCompileBlocksToHtml(blocks);
      assert.ok(html.includes('href="{{unsubscribe_url}}"'), 'Must inject {{unsubscribe_url}} even with empty content');
      assert.ok(html.includes('קושאן מייל אוטומטי - KOSUN AM'), 'Must fall back to default footer text');
    });

    test('1.9 - All 6 block types in a single campaign compile in correct sequential order', () => {
      const allBlocks = [
        { id: 'b1', type: 'header', content: { title: 'שלב 1 כותרת' } },
        { id: 'b2', type: 'hero', content: { title: 'שלב 2 תמונה' } },
        { id: 'b3', type: 'rich-text', content: { title: 'שלב 3 טקסט' } },
        { id: 'b4', type: 'button-cta', content: { buttonText: 'שלב 4 כפתור' } },
        { id: 'b5', type: 'divider', content: {} },
        { id: 'b6', type: 'footer', content: { bodyText: 'שלב 6 סיום' } },
      ];
      const html = liveCompileBlocksToHtml(allBlocks);
      const pos1 = html.indexOf('שלב 1 כותרת');
      const pos2 = html.indexOf('שלב 2 תמונה');
      const pos3 = html.indexOf('שלב 3 טקסט');
      const pos4 = html.indexOf('שלב 4 כפתור');
      const pos5 = html.indexOf('<hr');
      const pos6 = html.indexOf('שלב 6 סיום');

      assert.ok(pos1 !== -1 && pos2 !== -1 && pos3 !== -1 && pos4 !== -1 && pos5 !== -1 && pos6 !== -1);
      assert.ok(pos1 < pos2, 'Header must precede Hero');
      assert.ok(pos2 < pos3, 'Hero must precede Rich Text');
      assert.ok(pos3 < pos4, 'Rich Text must precede CTA');
      assert.ok(pos4 < pos5, 'CTA must precede Divider');
      assert.ok(pos5 < pos6, 'Divider must precede Footer');
    });

    test('1.10 - Compiler handles unknown block types gracefully without throwing', () => {
      const maliciousBlocks = [
        { id: 'b_invalid', type: 'unknown_exploit_type', content: { title: 'Crash Test' } },
        { id: 'b_valid', type: 'footer', content: {} },
      ];
      let html = '';
      assert.doesNotThrow(() => {
        html = liveCompileBlocksToHtml(maliciousBlocks);
      }, 'Unknown block types must not throw exceptions');
      assert.ok(html.includes('href="{{unsubscribe_url}}"'), 'Valid blocks must still render');
    });
  });

  // =========================================================================
  // Challenge 2: Mobile / Desktop Responsive Preview Switcher
  // =========================================================================
  describe('Challenge 2: Mobile & Desktop Responsive Preview Switcher', () => {

    test('2.1 - Preview state supports desktop and mobile modes', () => {
      assert.ok(
        emailEditorContent.includes("previewMode === 'desktop'"),
        'EmailEditorModal must have conditional logic for desktop preview'
      );
      assert.ok(
        emailEditorContent.includes("setPreviewMode('desktop')"),
        'EmailEditorModal must provide setter for desktop preview'
      );
      assert.ok(
        emailEditorContent.includes("setPreviewMode('mobile')"),
        'EmailEditorModal must provide setter for mobile preview'
      );
    });

    test('2.2 - Desktop preview frame renders with max-w-[620px] and shadow card styling', () => {
      assert.ok(
        emailEditorContent.includes('max-w-[620px]'),
        'Desktop preview container must constrain width to max-w-[620px]'
      );
      assert.ok(
        emailEditorContent.includes('rounded-2xl shadow-md border'),
        'Desktop preview must have rounded Bento card borders and shadow'
      );
    });

    test('2.3 - Mobile preview frame renders 340px phone container with camera notch and chassis', () => {
      assert.ok(
        emailEditorContent.includes('w-[340px]'),
        'Mobile container frame must enforce 340px width'
      );
      assert.ok(
        emailEditorContent.includes('rounded-[40px]'),
        'Mobile container frame must render phone rounded chassis'
      );
      assert.ok(
        emailEditorContent.includes('w-24 h-4 bg-neutral-800 rounded-full mx-auto'),
        'Mobile frame must include smartphone top camera/speaker notch'
      );
      assert.ok(
        emailEditorContent.includes('rounded-[28px] overflow-hidden max-h-[500px] overflow-y-auto'),
        'Mobile screen viewport must be scrollable with rounded-[28px]'
      );
    });

    test('2.4 - DangerouslySetInnerHTML binds compiled HTML in both preview modes', () => {
      const occurrences = (emailEditorContent.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*currentCompiledHtml\s*\}\}/g) || []).length;
      assert.strictEqual(occurrences >= 2, true, 'Both desktop and mobile containers must inject currentCompiledHtml');
    });

    test('2.5 - Raw HTML editor tab provides direct synchronization from visual blocks', () => {
      assert.ok(
        emailEditorContent.includes("activeTab === 'code'"),
        'Modal must feature direct HTML code editing tab'
      );
      assert.ok(
        emailEditorContent.includes('setRawHtmlOverride(compileBlocksToHtml(blocks))'),
        'Must provide synchronization action from visual blocks to raw HTML'
      );
    });
  });

  // =========================================================================
  // Challenge 3: Multi-Channel Automation Workflow Engine
  // =========================================================================
  describe('Challenge 3: Multi-Channel Automation Workflow Engine', () => {

    test('3.1 - Automation triggers include CRM lead, Smart Form, Ambassador, and Payment completed', () => {
      const requiredTriggers = [
        'crm:lead:created',
        'smart_form:submitted',
        'campaign:ambassador:created',
        'payment:completed',
      ];
      for (const trig of requiredTriggers) {
        assert.ok(
          automationBuilderContent.includes(`'${trig}'`),
          `AutomationBuilderView must define support for trigger '${trig}'`
        );
      }
    });

    test('3.2 - Multi-channel action steps support both Email and WhatsApp Green API', () => {
      assert.ok(
        automationBuilderContent.includes("case 'send_email':"),
        'AutomationBuilderView must handle send_email step type'
      );
      assert.ok(
        automationBuilderContent.includes("case 'send_whatsapp':"),
        'AutomationBuilderView must handle send_whatsapp step type'
      );
      assert.ok(
        automationBuilderContent.includes('whatsAppConfig:'),
        'WhatsApp step must configure whatsAppConfig payload'
      );
      assert.ok(
        automationBuilderContent.includes('emailConfig:'),
        'Email step must configure emailConfig payload'
      );
    });

    test('3.3 - Flow control supports Delay steps with delayMinutes and Condition steps', () => {
      assert.ok(
        automationBuilderContent.includes("case 'delay':"),
        'AutomationBuilderView must handle delay step type'
      );
      assert.ok(
        automationBuilderContent.includes('delayMinutes:'),
        'Delay step must configure delayMinutes property'
      );
      assert.ok(
        automationBuilderContent.includes("case 'condition':"),
        'AutomationBuilderView must handle condition filter step type'
      );
    });

    test('3.4 - Step re-ordering logic re-indexes order property correctly', () => {
      assert.ok(
        automationBuilderContent.includes("handleMoveStep = (index: number, direction: 'up' | 'down')"),
        'Must provide handleMoveStep handler for sequence adjustments'
      );
      assert.ok(
        automationBuilderContent.includes('s, order: i + 1'),
        'Moving steps must re-index order sequentially (1-based)'
      );
    });

    test('3.5 - New default workflow creates a multi-channel Email + Delay + WhatsApp pipeline', () => {
      assert.ok(
        automationBuilderContent.includes("title: 'שליחת מייל ברוכים הבאים מיידי'"),
        'Default new workflow must include initial email welcome step'
      );
      assert.ok(
        automationBuilderContent.includes("title: 'השהיה של 30 דקות'"),
        'Default new workflow must include delay step'
      );
      assert.ok(
        automationBuilderContent.includes("title: 'שליחת הודעת וואטסאפ Green API'"),
        'Default new workflow must include WhatsApp Green API step'
      );
    });

    test('3.6 - Save workflow connects to real saveAutomation without mock data fallback', () => {
      assert.ok(
        automationBuilderContent.includes('await saveAutomation(updated);'),
        'Saving workflow must dispatch to saveAutomation hook action'
      );
      assert.strictEqual(
        automationBuilderContent.includes('MOCK_'),
        false,
        'AutomationBuilderView must NOT reference mock data'
      );
    });
  });

  // =========================================================================
  // Challenge 4: Workbench Module Registry & Dynamic Lazy Loading
  // =========================================================================
  describe('Challenge 4: Workbench Module Registry & Dynamic Lazy Loading', () => {

    test('4.1 - kosun-am module is registered in REGISTERED_MODULES', () => {
      assert.ok(
        moduleRegistryContent.includes("id: 'kosun-am'"),
        "REGISTERED_MODULES must contain an entry with id: 'kosun-am'"
      );
    });

    test('4.2 - Module route is /kosun-am and collection prefix is mod_kosun_am_', () => {
      assert.ok(
        moduleRegistryContent.includes("route: '/kosun-am'"),
        "Module must route to '/kosun-am'"
      );
      assert.ok(
        moduleRegistryContent.includes("collectionPrefix: 'mod_kosun_am_'"),
        "Module collection prefix must be 'mod_kosun_am_'"
      );
      assert.ok(
        moduleRegistryContent.includes("name: 'קושאן מייל אוטומטי'"),
        "Module name must be strictly 'קושאן מייל אוטומטי'"
      );
    });

    test('4.3 - Module uses dynamic React.lazy with StandaloneView resolution', () => {
      assert.ok(
        moduleRegistryContent.includes("const KosunAmModule = React.lazy("),
        'Must define KosunAmModule via React.lazy'
      );
      assert.ok(
        moduleRegistryContent.includes("import('../modules/KosMail').then((m) => ({ default: m.KosunAmStandaloneView }))"),
        'React.lazy must dynamically import kosun-am StandaloneView'
      );
      assert.ok(
        moduleRegistryContent.includes('component: KosunAmModule'),
        'Module entry must link to KosunAmModule'
      );
    });

    test('4.4 - KosTopNav registers kosun-am with Mail icon from Lucide', () => {
      assert.ok(
        topNavContent.includes("'kosun-am': Mail"),
        "KosTopNav MODULE_ICONS must map 'kosun-am' to Lucide Mail icon"
      );
    });
  });

  // =========================================================================
  // Challenge 5: Kosun 2026 Branding, Zero-Emoji & Typography Compliance
  // =========================================================================
  describe('Challenge 5: Kosun 2026 Branding, Zero-Emoji & Typography Compliance', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    test('5.1 - Zero textual emojis in EmailEditorModal.tsx', () => {
      assert.strictEqual(
        emojiRegex.test(emailEditorContent),
        false,
        'EmailEditorModal.tsx must contain 0 textual emojis (Lucide icons only)'
      );
    });

    test('5.2 - Zero textual emojis in AutomationBuilderView.tsx', () => {
      assert.strictEqual(
        emojiRegex.test(automationBuilderContent),
        false,
        'AutomationBuilderView.tsx must contain 0 textual emojis (Lucide icons only)'
      );
    });

    test('5.3 - Strict RTL root wrapping enforced in all views', () => {
      assert.ok(
        emailEditorContent.includes('dir="rtl"'),
        'EmailEditorModal must enforce dir="rtl"'
      );
      assert.ok(
        emailEditorContent.includes("textAlign: 'right'"),
        'EmailEditorModal must enforce text-align: right'
      );
      assert.ok(
        automationBuilderContent.includes('dir="rtl"'),
        'AutomationBuilderView must enforce dir="rtl"'
      );
      assert.ok(
        automationBuilderContent.includes("textAlign: 'right'"),
        'AutomationBuilderView must enforce text-align: right'
      );
    });

    test('5.4 - font-heebo is applied to modal and builder views', () => {
      assert.ok(
        emailEditorContent.includes('font-heebo'),
        'EmailEditorModal must apply font-heebo styling class'
      );
      assert.ok(
        automationBuilderContent.includes('font-heebo'),
        'AutomationBuilderView must apply font-heebo styling class'
      );
    });

    test('5.5 - Living persona identity "קושאן" / "KOSUN AM" is respected', () => {
      assert.ok(
        emailEditorContent.includes('קושאן שומר את הקמפיין'),
        'Modal must use living persona copy for saving'
      );
      assert.ok(
        automationBuilderContent.includes('קושאן שמר את האוטומציה ב-DB בהצלחה'),
        'Builder must use living persona copy for saving confirmation'
      );
      assert.ok(
        emailEditorContent.includes('KOSUN AM'),
        'Modal must refer to KOSUN AM in uppercase'
      );
    });
  });
});
