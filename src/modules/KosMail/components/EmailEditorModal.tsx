/**
 * KOSUN AM (קושאן מייל אוטומטי) - Email Campaign & Visual Block Editor Modal
 * 12-Layer Scaffolding Layer 9: Modular Bento-compatible Visual Email Builder Modal
 *
 * Kosun 2026 Standards:
 * - Mobile First & Bento Grid design (rounded-3xl, rounded-2xl)
 * - Strict RTL: <div dir="rtl" style={{ textAlign: 'right' }}>
 * - Heebo font exclusively (font-heebo)
 * - Zero textual emojis (Lucide icons only)
 * - Modular visual block builder (Header, Hero, Rich Text, CTA Button, Divider, Footer)
 * - Real-time mobile and desktop preview toggle
 * - AI Assistant ("קושאן כותב עבורך") for subject lines and body copy
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  Mail,
  Send,
  Eye,
  Layout,
  Layers,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Minus,
  CheckCircle2,
  HelpCircle,
  Copy,
  Code,
} from 'lucide-react';
import { EmailCampaign, EmailBlockConfig, EmailBlockType } from '../types';
import { useKosunAmActions } from '../hooks/useKosunAmActions';
import { SmartTooltip } from '../../../components/Ui/SmartTooltip';

export interface EmailEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Partial<EmailCampaign>;
  onSave?: (campaign: Partial<EmailCampaign>) => void;
}

const DEFAULT_BLOCKS: EmailBlockConfig[] = [
  {
    id: 'block_header_1',
    type: 'header',
    content: {
      title: 'ברוכים הבאים לקושאן!',
      subtitle: 'קושאן דואג שהמייל יגיע ליעד בזמן ובדיוק מושלם',
      logoUrl: '',
    },
    styles: {
      alignment: 'center',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
    },
  },
  {
    id: 'block_hero_1',
    type: 'hero',
    content: {
      title: 'השקה מיוחדת לשנת 2026',
      subtitle: 'כל הכלים המתקדמים במקום אחד',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    },
    styles: {
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'block_text_1',
    type: 'rich-text',
    content: {
      title: 'חדשות מרגשות מקושאן',
      bodyText:
        'שלום לכולם,\nאנחנו מתרגשים להציג בפניכם את מערכת הדיוור והאוטומציות הרב-ערוציות של קושאן 2026. המערכת מספקת תבניות נקיות בפורמט Bento Grid, סינכרון מלא ל-CRM ווואטסאפ, וחוויית קריאה מושלמת בכל מכשיר.',
    },
    styles: {
      alignment: 'right',
      backgroundColor: '#ffffff',
      textColor: '#334155',
    },
  },
  {
    id: 'block_cta_1',
    type: 'button-cta',
    content: {
      buttonText: 'לפרטים נוספים והתנסות',
      buttonUrl: 'https://kosun.pro',
    },
    styles: {
      alignment: 'center',
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
    },
  },
  {
    id: 'block_divider_1',
    type: 'divider',
    content: {},
    styles: {
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'block_footer_1',
    type: 'footer',
    content: {
      bodyText: 'קושאן מייל אוטומטי - KOSUN AM | שותף אישי חכם לבעלי עסקים',
    },
    styles: {
      backgroundColor: '#f8fafc',
    },
  },
];

export function compileBlocksToHtml(blocks: EmailBlockConfig[]): string {
  const renderedBlocks = blocks
    .map((block) => {
      switch (block.type) {
        case 'header':
          return `
          <div style="padding: 24px 20px; text-align: ${block.styles?.alignment || 'center'}; background: ${block.styles?.backgroundColor || '#ffffff'}; border-bottom: 1px solid #f1f5f9;">
            ${block.content.logoUrl ? `<img src="${block.content.logoUrl}" alt="Logo" style="max-height: 48px; margin-bottom: 12px; display: inline-block;" />` : ''}
            ${block.content.title ? `<h1 style="margin: 0; font-size: 22px; font-weight: 800; color: ${block.styles?.textColor || '#0f172a'}; line-height: 1.3;">${block.content.title}</h1>` : ''}
            ${block.content.subtitle ? `<p style="margin: 6px 0 0; font-size: 13px; color: #64748b; line-height: 1.4;">${block.content.subtitle}</p>` : ''}
          </div>`;
        case 'hero':
          return `
          <div style="padding: 16px 20px; text-align: center; background: ${block.styles?.backgroundColor || '#ffffff'};">
            ${block.content.imageUrl ? `<img src="${block.content.imageUrl}" alt="${block.content.title || 'Hero'}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 16px; display: block; margin: 0 auto;" />` : ''}
            ${block.content.title ? `<h2 style="margin: 14px 0 4px; font-size: 18px; font-weight: 700; color: ${block.styles?.textColor || '#0f172a'};">${block.content.title}</h2>` : ''}
            ${block.content.subtitle ? `<p style="margin: 0; font-size: 12px; color: #64748b;">${block.content.subtitle}</p>` : ''}
          </div>`;
        case 'rich-text':
          return `
          <div style="padding: 20px; background: ${block.styles?.backgroundColor || '#ffffff'}; text-align: ${block.styles?.alignment || 'right'}; line-height: 1.7; color: ${block.styles?.textColor || '#334155'};">
            ${block.content.title ? `<h3 style="margin: 0 0 10px; font-size: 17px; font-weight: 700; color: #0f172a;">${block.content.title}</h3>` : ''}
            <div style="font-size: 14px; white-space: pre-line;">${block.content.bodyText || ''}</div>
          </div>`;
        case 'button-cta':
          return `
          <div style="padding: 24px 20px; text-align: ${block.styles?.alignment || 'center'}; background: ${block.styles?.backgroundColor || '#ffffff'};">
            <a href="${block.content.buttonUrl || '#'}" style="display: inline-block; padding: 13px 30px; background: ${block.styles?.backgroundColor || '#4f46e5'}; color: ${block.styles?.textColor || '#ffffff'}; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
              ${block.content.buttonText || 'לחץ כאן לפעולה'}
            </a>
          </div>`;
        case 'divider':
          return `
          <div style="padding: 14px 20px; background: ${block.styles?.backgroundColor || '#ffffff'};">
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />
          </div>`;
        case 'footer':
          return `
          <div style="padding: 24px 20px; text-align: center; background: ${block.styles?.backgroundColor || '#f8fafc'}; color: #94a3b8; font-size: 11px; border-top: 1px solid #f1f5f9; border-radius: 0 0 16px 16px; line-height: 1.5;">
            <p style="margin: 0 0 6px; color: #64748b;">${block.content.bodyText || 'קושאן מייל אוטומטי - KOSUN AM | כל הזכויות שמורות'}</p>
            <p style="margin: 0;">
              אינך מעוניין לקבל הודעות נוספות? 
              <a href="{{unsubscribe_url}}" style="color: #6366f1; text-decoration: underline; margin-right: 4px;">הסרה מרשימת התפוצה</a>
            </p>
          </div>`;
        default:
          return '';
      }
    })
    .join('\n');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KOSUN AM Campaign</title>
</head>
<body dir="rtl" style="margin: 0; padding: 16px 0; background-color: #f8fafc; font-family: 'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; text-align: right;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    ${renderedBlocks}
  </div>
</body>
</html>`.trim();
}

export const EmailEditorModal: React.FC<EmailEditorModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSave,
}) => {
  const { generateAiContent } = useKosunAmActions();

  // Campaign Meta State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [fromName, setFromName] = useState('קושאן');
  const [fromEmail, setFromEmail] = useState('hello@kosun.pro');
  const [manualEmails, setManualEmails] = useState('test@kosun.pro');

  // Block Builder State
  const [blocks, setBlocks] = useState<EmailBlockConfig[]>(DEFAULT_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // View & Mode State
  const [activeTab, setActiveTab] = useState<'details' | 'blocks' | 'code' | 'preview'>('details');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [rawHtmlOverride, setRawHtmlOverride] = useState<string>('');
  const [isUsingRawHtml, setIsUsingRawHtml] = useState<boolean>(false);

  // AI Assistant State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiTopicPrompt, setAiTopicPrompt] = useState('');
  const [showAiPromptModal, setShowAiPromptModal] = useState(false);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setSubject(campaign.subject || '');
      setPreheader(campaign.preheader || '');
      setFromName(campaign.fromName || 'קושאן');
      setFromEmail(campaign.fromEmail || 'hello@kosun.pro');
      setManualEmails(campaign.audience?.manualEmails?.join(', ') || 'test@kosun.pro');

      if (campaign.htmlContent && !campaign.htmlContent.includes('block_')) {
        setRawHtmlOverride(campaign.htmlContent);
      } else {
        setRawHtmlOverride(compileBlocksToHtml(DEFAULT_BLOCKS));
      }
    } else {
      setName('');
      setSubject('');
      setPreheader('');
      setFromName('קושאן');
      setFromEmail('hello@kosun.pro');
      setManualEmails('test@kosun.pro');
      setBlocks(DEFAULT_BLOCKS);
      setRawHtmlOverride(compileBlocksToHtml(DEFAULT_BLOCKS));
      setIsUsingRawHtml(false);
    }
    setAiSuggestions([]);
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const currentCompiledHtml = isUsingRawHtml ? rawHtmlOverride : compileBlocksToHtml(blocks);

  // Block Manipulation
  const handleAddBlock = (type: EmailBlockType) => {
    const newId = `block_${type}_${Date.now()}`;
    let newBlock: EmailBlockConfig;

    switch (type) {
      case 'header':
        newBlock = {
          id: newId,
          type: 'header',
          content: { title: 'כותרת ראשית חדשה', subtitle: 'תת-כותרת להסבר' },
          styles: { alignment: 'center', backgroundColor: '#ffffff', textColor: '#0f172a' },
        };
        break;
      case 'hero':
        newBlock = {
          id: newId,
          type: 'hero',
          content: {
            title: 'תמונת מבצע מיוחד',
            imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
          },
          styles: { backgroundColor: '#ffffff' },
        };
        break;
      case 'rich-text':
        newBlock = {
          id: newId,
          type: 'rich-text',
          content: { title: 'פסקה חדשה', bodyText: 'הזן כאן את תוכן ההודעה המיועדת לנמענים.' },
          styles: { alignment: 'right', backgroundColor: '#ffffff', textColor: '#334155' },
        };
        break;
      case 'button-cta':
        newBlock = {
          id: newId,
          type: 'button-cta',
          content: { buttonText: 'מעבר לעמוד המוצר', buttonUrl: 'https://kosun.pro' },
          styles: { alignment: 'center', backgroundColor: '#4f46e5', textColor: '#ffffff' },
        };
        break;
      case 'divider':
        newBlock = {
          id: newId,
          type: 'divider',
          content: {},
          styles: { backgroundColor: '#ffffff' },
        };
        break;
      case 'footer':
        newBlock = {
          id: newId,
          type: 'footer',
          content: { bodyText: 'קושאן מייל אוטומטי - KOSUN AM | כל הזכויות שמורות' },
          styles: { backgroundColor: '#f8fafc' },
        };
        break;
      default:
        newBlock = {
          id: newId,
          type: 'rich-text',
          content: { bodyText: 'תוכן בלוק חדש' },
        };
    }

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newId);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleUpdateBlockContent = (id: string, key: string, value: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: { ...b.content, [key]: value } } : b))
    );
  };

  const handleUpdateBlockStyle = (id: string, key: string, value: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, styles: { ...b.styles, [key]: value } } : b))
    );
  };

  // AI Assistant Trigger
  const handleTriggerAiAssistant = async () => {
    setIsGeneratingAi(true);
    try {
      const promptToUse = aiTopicPrompt || subject || name || 'קמפיין שיווקי מתקדם של קושאן 2026';
      const result = await generateAiContent(promptToUse);

      if (result.success) {
        if (result.subjectSuggestions?.length) {
          setAiSuggestions(result.subjectSuggestions);
        }
        if (result.preheader && !preheader) {
          setPreheader(result.preheader);
        }
        if (result.bodyCopy) {
          // Add or update a Rich Text block with AI copy
          const newAiBlock: EmailBlockConfig = {
            id: `block_ai_${Date.now()}`,
            type: 'rich-text',
            content: {
              title: 'ניסוח מקצועי מקושאן AI',
              bodyText: result.bodyCopy,
            },
            styles: {
              alignment: 'right',
              backgroundColor: '#ffffff',
              textColor: '#334155',
            },
          };
          setBlocks((prev) => [...prev, newAiBlock]);
        }
      }
    } catch (err) {
      console.warn('[Kosun AM] AI generator exception:', err);
    } finally {
      setIsGeneratingAi(false);
      setShowAiPromptModal(false);
    }
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailsList = manualEmails
      .split(',')
      .map((em) => em.trim())
      .filter(Boolean);

    const compiledHtml = isUsingRawHtml ? rawHtmlOverride : compileBlocksToHtml(blocks);

    const updated: Partial<EmailCampaign> = {
      ...campaign,
      name: name || 'קמפיין חדש מקושאן',
      subject: subject || 'הודעה חשובה מקושאן',
      preheader,
      fromName,
      fromEmail,
      htmlContent: compiledHtml,
      audience: {
        type: 'manual',
        manualEmails: emailsList,
      },
      status: campaign?.status || 'draft',
    };

    onSave?.(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        dir="rtl"
        style={{ textAlign: 'right' }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-heebo"
      >
        {/* Top Header */}
        <header className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                  {campaign?.id ? 'עריכת קמפיין עם קושאן' : 'קושאן מכין קמפיין חדש'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                  KOSUN AM 2026
                </span>
                <SmartTooltip text="עורך בלוקים ויזואלי לתבניות אימייל וניוזלטרים ברמת דיוק ומסירה מקסימלית" />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                קושאן לוקח אחריות: עיצוב בנטו, שילוב בינה מלאכותית ותצוגה מקדימה למובייל
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAiPromptModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>קושאן כותב עבורך</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Navigation Tabs (Top Nav Only) */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-2.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900 shadow-xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            פרטי שיגור
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blocks')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'blocks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900 shadow-xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            עורך בלוקים ויזואלי ({blocks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900 shadow-xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            קוד HTML ישיר
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900 shadow-xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            תצוגה מקדימה
          </button>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-4 sm:p-6 space-y-5">
            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    שם הקמפיין הפנימי
                    <SmartTooltip text="שם זיהוי פנימי לניהול הקמפיינים במערכת קושאן" />
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="למשל: עדכון חודשי - קיץ 2026"
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center">
                      שורת הנושא (Subject)
                      <SmartTooltip text="הנושא שמוצג לנמענים בתיבת הדואר הנכנס" />
                    </label>
                    <button
                      type="button"
                      onClick={handleTriggerAiAssistant}
                      disabled={isGeneratingAi}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      {isGeneratingAi ? 'קושאן מנסח כותרות...' : 'הצע כותרות A/B עם קושאן'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="הזן נושא מסקרן ומניע לפעולה"
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  {aiSuggestions.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 block">
                        הצעות כותרת מקושאן AI (לחץ לבחירה):
                      </span>
                      {aiSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSubject(sug)}
                          className="w-full text-right p-1.5 text-xs rounded-xl hover:bg-white dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition"
                        >
                          • {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    טקסט מקדים (Preheader)
                    <SmartTooltip text="הטקסט הקצר המוצג לצד שורת הנושא בתיבות הדואר" />
                  </label>
                  <input
                    type="text"
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    placeholder="משפט קצר שיעודד פתיחה מיידית"
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      שם השולח
                    </label>
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      className="w-full px-4 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      כתובת אימייל שולח
                    </label>
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    רשימת נמענים ידנית (מופרדים בפסיק)
                    <SmartTooltip text="לשיגור מהיר או לבדיקת מסירה מול נמענים ספציפיים" />
                  </label>
                  <input
                    type="text"
                    value={manualEmails}
                    onChange={(e) => setManualEmails(e.target.value)}
                    placeholder="user1@example.com, user2@example.com"
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL BLOCKS BUILDER */}
            {activeTab === 'blocks' && (
              <div className="space-y-4">
                {/* Add Block Bar */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    הוסף בלוק מעוצב לאימייל:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddBlock('header')}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-indigo-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                    >
                      <Type className="w-3.5 h-3.5 text-indigo-600" />
                      כותרת
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('hero')}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-indigo-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      תמונת נושא
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('rich-text')}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-indigo-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                    >
                      <Layout className="w-3.5 h-3.5 text-emerald-600" />
                      פסקה
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('button-cta')}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-indigo-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                    >
                      <MousePointerClick className="w-3.5 h-3.5 text-amber-600" />
                      כפתור הנעה
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('divider')}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-indigo-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                    >
                      <Minus className="w-3.5 h-3.5 text-neutral-400" />
                      מפריד
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('footer')}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-indigo-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      כותרת תחתונה
                    </button>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <div
                      key={block.id}
                      className={`p-4 rounded-2xl border transition ${
                        selectedBlockId === block.id
                          ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      {/* Block Controls Header */}
                      <div className="flex items-center justify-between mb-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase">
                            בלוק {block.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30"
                            title="הזז למעלה"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(idx, 'down')}
                            disabled={idx === blocks.length - 1}
                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30"
                            title="הזז למטה"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(block.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="מחק בלוק"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Block Inline Fields */}
                      <div className="space-y-2.5 text-xs">
                        {block.type === 'header' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">כותרת עליונה</label>
                              <input
                                type="text"
                                value={block.content.title || ''}
                                onChange={(e) => handleUpdateBlockContent(block.id, 'title', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">תת-כותרת</label>
                              <input
                                type="text"
                                value={block.content.subtitle || ''}
                                onChange={(e) => handleUpdateBlockContent(block.id, 'subtitle', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'hero' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">קישור לתמונה (Image URL)</label>
                              <input
                                type="text"
                                value={block.content.imageUrl || ''}
                                onChange={(e) => handleUpdateBlockContent(block.id, 'imageUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] text-neutral-500 mb-1 block">כותרת תמונה</label>
                                <input
                                  type="text"
                                  value={block.content.title || ''}
                                  onChange={(e) => handleUpdateBlockContent(block.id, 'title', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-500 mb-1 block">תיאור קצר</label>
                                <input
                                  type="text"
                                  value={block.content.subtitle || ''}
                                  onChange={(e) => handleUpdateBlockContent(block.id, 'subtitle', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === 'rich-text' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">כותרת פסקה (אופציונלי)</label>
                              <input
                                type="text"
                                value={block.content.title || ''}
                                onChange={(e) => handleUpdateBlockContent(block.id, 'title', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">תוכן הפסקה</label>
                              <textarea
                                rows={3}
                                value={block.content.bodyText || ''}
                                onChange={(e) => handleUpdateBlockContent(block.id, 'bodyText', e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'button-cta' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">טקסט הכפתור</label>
                              <input
                                type="text"
                                value={block.content.buttonText || ''}
                                onChange={(e) => handleUpdateBlockContent(block.id, 'buttonText', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">כתובת יעד (URL)</label>
                              <input
                                type="text"
                                value={block.content.buttonUrl || ''}
                                onChange={(e) => handleUpdateBlockContent(block.id, 'buttonUrl', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'footer' && (
                          <div>
                            <label className="text-[11px] text-neutral-500 mb-1 block">טקסט זכויות יוצרים ומשפטי</label>
                            <input
                              type="text"
                              value={block.content.bodyText || ''}
                              onChange={(e) => handleUpdateBlockContent(block.id, 'bodyText', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                            />
                            <p className="text-[10px] text-neutral-400 mt-1">
                              קישור הסרה מרשימת התפוצה מתווסף אוטומטית לפי תקנות הגנת הפרטיות.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CODE VIEW */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    קוד HTML מלא של האימייל
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUsingRawHtml(true);
                      setRawHtmlOverride(compileBlocksToHtml(blocks));
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    סנכרן מבלוקים ויזואליים
                  </button>
                </div>
                <textarea
                  rows={14}
                  value={rawHtmlOverride}
                  onChange={(e) => {
                    setRawHtmlOverride(e.target.value);
                    setIsUsingRawHtml(true);
                  }}
                  className="w-full p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* TAB 4: PREVIEW WITH REAL-TIME MOBILE & DESKTOP TOGGLE */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                {/* Responsive Switcher */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        previewMode === 'desktop'
                          ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      מחשב שולחני (Desktop)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        previewMode === 'mobile'
                          ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      מכשיר נייד (Mobile)
                    </button>
                  </div>
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">
                    תצוגה מקדימה מדויקת ברמת לקוח דואר
                  </span>
                </div>

                {/* Email Meta Card */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-1">
                  <p>
                    <strong className="text-neutral-500">שולח:</strong> {fromName} ({fromEmail})
                  </p>
                  <p>
                    <strong className="text-neutral-500">נושא:</strong> {subject || '(ללא נושא)'}
                  </p>
                  {preheader && (
                    <p>
                      <strong className="text-neutral-500">טקסט מקדים:</strong> {preheader}
                    </p>
                  )}
                </div>

                {/* Render Frame */}
                <div className="flex justify-center p-4 bg-neutral-100/60 dark:bg-neutral-950/60 rounded-3xl overflow-hidden min-h-[360px]">
                  {previewMode === 'desktop' ? (
                    <div
                      className="w-full max-w-[620px] bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: currentCompiledHtml }}
                    />
                  ) : (
                    <div className="w-[340px] max-w-full bg-neutral-900 rounded-[40px] p-2.5 shadow-2xl border-4 border-neutral-800">
                      <div className="w-24 h-4 bg-neutral-800 rounded-full mx-auto mb-2" />
                      <div
                        className="bg-white rounded-[28px] overflow-hidden max-h-[500px] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: currentCompiledHtml }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <footer className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              ביטול
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              קושאן שומר את הקמפיין
            </button>
          </footer>
        </form>
      </div>

      {/* AI Topic Prompt Popup */}
      {showAiPromptModal && (
        <div className="fixed inset-0 z-60 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            dir="rtl"
            style={{ textAlign: 'right' }}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 font-heebo"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  קושאן כותב עבורך
                </h3>
              </div>
              <button
                onClick={() => setShowAiPromptModal(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              תאר לקושאן בכמה מילים על מה הקמפיין, וקושאן ינסח כותרות מנצחות ותוכן שיווקי:
            </p>

            <textarea
              rows={3}
              value={aiTopicPrompt}
              onChange={(e) => setAiTopicPrompt(e.target.value)}
              placeholder="למשל: השקת קורס מקצועי חדש עם 20% הנחה לנרשמים ראשונים..."
              className="w-full p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiPromptModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-neutral-600 dark:text-neutral-400"
              >
                סגור
              </button>
              <button
                type="button"
                onClick={handleTriggerAiAssistant}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isGeneratingAi ? 'קושאן מנסח...' : 'צור ניסוח עכשיו'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailEditorModal;
