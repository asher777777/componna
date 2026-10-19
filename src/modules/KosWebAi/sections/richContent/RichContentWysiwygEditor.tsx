import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  Sparkles,
  Code,
  Eye,
  Eraser,
  Wand2,
  Check,
  X,
  Loader2,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { BrandDna } from '../../../../core/contracts';
import { kosaiWebAiContract } from '../../../kosai-engine/modelsAiService';

interface RichContentWysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  brandDna?: BrandDna | null;
  placeholder?: string;
  isDarkMode?: boolean;
}

export const RichContentWysiwygEditor: React.FC<RichContentWysiwygEditorProps> = ({
  value,
  onChange,
  brandDna,
  placeholder = 'כתבו כאן את תוכן האודות והחזון שלכם...',
  isDarkMode = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'wysiwyg' | 'code'>('wysiwyg');
  const [htmlCode, setHtmlCode] = useState(value || '');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreviewHtml, setAiPreviewHtml] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'p' | 'h2' | 'h3' | 'lead'>('p');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep internal HTML state in sync with external value if editor isn't focused
  useEffect(() => {
    setHtmlCode(value || '');
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const exec = (command: string, value: string | undefined = undefined) => {
    if (viewMode === 'code') return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlCode(newHtml);
      onChange(newHtml);
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setHtmlCode(newHtml);
    onChange(newHtml);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlCode(val);
    onChange(val);
    if (editorRef.current) {
      editorRef.current.innerHTML = val;
    }
  };

  const applyHeadingFormat = (format: 'p' | 'h2' | 'h3' | 'lead') => {
    setSelectedFormat(format);
    if (format === 'p') {
      exec('formatBlock', '<p>');
    } else if (format === 'h2') {
      exec('formatBlock', '<h2>');
    } else if (format === 'h3') {
      exec('formatBlock', '<h3>');
    } else if (format === 'lead') {
      exec('formatBlock', '<p>');
      // wrap selection or active paragraph in lead class
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentP = range.commonAncestorContainer.parentElement;
        if (parentP && parentP.tagName.toLowerCase() === 'p') {
          parentP.className = 'text-lg font-semibold leading-relaxed text-amber-400/90';
          handleInput();
        }
      }
    }
  };

  const handleInsertQuote = () => {
    exec('formatBlock', '<blockquote>');
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const bq = range.commonAncestorContainer.parentElement;
      if (bq && (bq.tagName.toLowerCase() === 'blockquote' || bq.parentElement?.tagName.toLowerCase() === 'blockquote')) {
        const target = bq.tagName.toLowerCase() === 'blockquote' ? bq : bq.parentElement;
        if (target) {
          target.className = 'border-r-4 border-amber-500 pr-4 py-2 italic my-3 text-slate-300 bg-amber-500/5 rounded-l-lg';
          handleInput();
        }
      }
    }
  };

  const handleInsertCallout = () => {
    const calloutHtml = `<div class="p-4 my-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200"><strong>עקרון מפתח:</strong> כתבו כאן נקודת מפתח בעלת חשיבות עליונה...</div><p><br></p>`;
    exec('insertHTML', calloutHtml);
  };

  const handleInsertLink = () => {
    const url = prompt('הזינו כתובת URL לקישור:', 'https://');
    if (url) {
      exec('createLink', url);
    }
  };

  const handleApplyColor = (color: string) => {
    exec('foreColor', color);
  };

  // Deterministic generator if KOSAI network call fails or for immediate offline preview
  const generateLocalBrandVisionHtml = (actionType: string): string => {
    const company = brandDna?.identity?.companyName || 'החברה';
    const vision = brandDna?.identity?.companyVision || brandDna?.identity?.shortVision || '';
    const purpose = brandDna?.identity?.organizationPurpose || brandDna?.audience?.mainUvp || '';
    const slogan = brandDna?.identity?.slogan || '';

    switch (actionType) {
      case 'full_vision':
        return `
<p class="text-lg font-bold leading-relaxed text-amber-400"><strong>החזון שלנו ב-${company}:</strong></p>
<p class="leading-relaxed text-slate-200">${vision || `להוביל בסטנדרטים הגבוהים ביותר, לחבר בין אנשים וטכנולוגיה, וליצור השפעה מתמשכת ואיכותית.`}</p>
<p class="leading-relaxed text-slate-300">${purpose || `אנו פועלים במסירות ובמקצועיות ללא פשרות, תוך הקשבה לצורכי הקהילה והבאת פתרונות פורצי דרך.`}</p>
${slogan ? `<blockquote class="border-r-4 border-amber-500 pr-4 py-2 italic my-3 text-amber-300/90 bg-amber-500/5 rounded-l-lg">״${slogan}״</blockquote>` : ''}
<p class="leading-relaxed text-slate-300">אנו מזמינים אתכם לקחת חלק במסע המשותף שלנו לעבר עתיד טוב ומשמעותי יותר.</p>
        `.trim();

      case 'pillars':
        return `
<p class="text-lg font-bold text-amber-400"><strong>עמודי התווך והערכים של ${company}:</strong></p>
<ul class="space-y-2 my-3 text-slate-200 list-disc pr-6">
  <li><strong>מצוינות ומקצועיות:</strong> שאיפה בלתי מתפשרת לאיכות הגבוהה ביותר בכל פרט ושלב.</li>
  <li><strong>אמינות ושקיפות מלאה:</strong> שותפות אמת המבוססת על אמון, יושרה ויחס אישי לכל אדם.</li>
  <li><strong>חדשנות ויצירתיות:</strong> פיתוח מתמיד של כלים ומענים מותאמים לצרכי המחר.</li>
  <li><strong>שליחות וקהילה:</strong> ${purpose || 'חיבור עמוק לערכי הקהילה וקידום מטרות משותפות.'}</li>
</ul>
${slogan ? `<blockquote class="border-r-4 border-amber-500 pr-4 py-2 italic my-3 text-amber-200">״${slogan}״</blockquote>` : ''}
        `.trim();

      case 'short_vision':
        return `
<p class="text-xl font-extrabold leading-snug text-white">
  ${brandDna?.identity?.shortVision || vision || `${company} - מובילים באיכות, חדשנות ועשייה משמעותית.`}
</p>
<p class="leading-relaxed text-slate-300 mt-2">
  ${purpose || `חיבור אמיתי, מקצועיות חסרת פשרות והשגת יעדים פורצי דרך יחד עם לקוחותינו.`}
</p>
        `.trim();

      case 'closing_cta':
        return (
          (value || '') +
          `
<div class="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-indigo-500/10 border border-amber-500/30">
  <p class="text-base font-bold text-amber-300">מוכנים לקחת חלק בהצלחה של ${company}?</p>
  <p class="text-sm text-slate-200 mt-1">צרו איתנו קשר עוד היום וגלו כיצד החזון שלנו מתחבר ישירות להצלחה שלכם.</p>
</div>
          `.trim()
        );

      default:
        return `
<p class="text-lg font-semibold leading-relaxed text-white">
  <strong>השליחות של ${company}:</strong> ${vision || purpose || 'ליצור עולם של הזדמנויות והצלחה משותפת.'}
</p>
<p class="leading-relaxed text-slate-300 mt-2">
  ${purpose || 'אנו פועלים מתוך תשוקה אמיתית להוביל, לתמוך ולהעצים כל יוזמה ופרויקט.'}
</p>
        `.trim();
    }
  };

  // AI execution via KOSAI Monopoly Contract
  const handleExecuteAiRewrite = async (actionType: string, customInstruction?: string) => {
    setAiLoading(true);
    setAiPreviewHtml(null);

    const company = brandDna?.identity?.companyName || '';
    const vision = brandDna?.identity?.companyVision || brandDna?.identity?.shortVision || '';
    const purpose = brandDna?.identity?.organizationPurpose || brandDna?.audience?.mainUvp || '';
    const slogan = brandDna?.identity?.slogan || '';

    const instruction =
      customInstruction ||
      (actionType === 'full_vision'
        ? 'נסח חזון מלא, עשיר ומשכנע המשלב את חזון החברה, מטרת הארגון והסלוגן.'
        : actionType === 'pillars'
        ? 'המר את החזון והערכים לרשימה מעוצבת של 4 עמודי תווך עם תיאור מנומק.'
        : actionType === 'short_vision'
        ? 'תמצת את החזון לשתי פסקאות מחץ קצרות, מדויקות וסוחפות.'
        : actionType === 'closing_cta'
        ? 'הוסף פסקת הנעה לפעולה חמה, סוחפת ומקצועית בסיום הטקסט.'
        : 'שכתב את הטקסט לשפה עשירה, מלוטשת ומעוררת השראה.');

    const prompt = `
אתה קופירייטר מיתוגי בכיר וארכיטקט תוכן ב-KOSUN26.
משימתך היא לנסח או לשכתב תוכן מעוצב עבור אזור "אודות והחזון שלנו" באתר אינטרנט.

מידע מיתוגי מתוך ה-Brand DNA של הטננט:
- שם החברה/ארגון: "${company}"
- חזון החברה: "${vision}"
- חזון מקוצר: "${brandDna?.identity?.shortVision || ''}"
- מטרת הארגון: "${purpose}"
- סלוגן: "${slogan}"
- הצעת ערך ייחודית (UVP): "${brandDna?.audience?.mainUvp || ''}"

טקסט נוכחי באזור:
"${htmlCode || 'אין טקסט קודם'}"

הנחיית שכתוב:
"${instruction}"

הנחיות קריטיות:
1. כתוב בעברית ישראלית טבעית, עשירה, רהוטה ומשכנעת.
2. פלוט אך ורק קוד HTML תקין ללא שום \`\`\`html או סימוני markdown!
3. השתמש בתגיות <p>, <strong>, <blockquote>, <ul>, <li>.
`;

    try {
      const res = await kosaiWebAiContract.enhanceSection(prompt);
      if (res && res.success && res.data) {
        let cleanHtml = typeof res.data === 'string' ? res.data : res.data.content || res.data.html || JSON.stringify(res.data);
        cleanHtml = cleanHtml.replace(/```html/gi, '').replace(/```/g, '').trim();
        setAiPreviewHtml(cleanHtml);
      } else {
        // Fallback to high-fidelity deterministic generator
        setAiPreviewHtml(generateLocalBrandVisionHtml(actionType));
      }
    } catch {
      setAiPreviewHtml(generateLocalBrandVisionHtml(actionType));
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResult = () => {
    if (!aiPreviewHtml) return;
    setHtmlCode(aiPreviewHtml);
    onChange(aiPreviewHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = aiPreviewHtml;
    }
    setShowAiModal(false);
    setAiPreviewHtml(null);
  };

  return (
    <div
      className={`w-full rounded-2xl border transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 shadow-2xl flex flex-col bg-[#0f0f11]'
          : 'relative overflow-hidden'
      } ${
        isDarkMode
          ? 'bg-[#121214] border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
      dir="rtl"
    >
      {/* Top Main Toolbar */}
      <div
        className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-1.5 ${
          isDarkMode ? 'border-white/10 bg-[#161619]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {/* Left Toolbar Controls (RTL - Right Side in Visual flow) */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Format Selector */}
          <select
            value={selectedFormat}
            onChange={(e) => applyHeadingFormat(e.target.value as any)}
            disabled={viewMode === 'code'}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
              isDarkMode
                ? 'bg-[#202024] border-white/10 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
            title="סגנון פסקה וכותרות"
          >
            <option value="p">פסקה רגילה</option>
            <option value="lead">פסקת פתיחה (מודגשת)</option>
            <option value="h2">כותרת H2</option>
            <option value="h3">כותרת משנה H3</option>
          </select>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          {/* Text Styling */}
          <button
            type="button"
            onClick={() => exec('bold')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="מודגש (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="נטוי (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="קו תחתי (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="קו חוצה"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="יישור לימין (RTL)"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="יישור למרכז"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="יישור לשמאל"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="יישור לשני הצדדים"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="רשימת תבליטים"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="רשימה ממוספרת"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          {/* Quotes and Callouts */}
          <button
            type="button"
            onClick={handleInsertQuote}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-amber-400 hover:text-amber-300"
            title="ציטוט חזון מעוצב (Blockquote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInsertCallout}
            disabled={viewMode === 'code'}
            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors"
            title="הוספת תיבת הדגשה"
          >
            + כרטיס הדגשה
          </button>

          {/* Quick Color Swatches */}
          <div className="flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => handleApplyColor('#f59e0b')}
              disabled={viewMode === 'code'}
              className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:scale-125 transition-transform"
              title="צבע זהב / אמבר"
            />
            <button
              type="button"
              onClick={() => handleApplyColor('#6366f1')}
              disabled={viewMode === 'code'}
              className="w-3.5 h-3.5 rounded-full bg-indigo-500 hover:scale-125 transition-transform"
              title="צבע אינדיגו"
            />
            <button
              type="button"
              onClick={() => handleApplyColor('#f43f5e')}
              disabled={viewMode === 'code'}
              className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:scale-125 transition-transform"
              title="צבע רוז"
            />
            <button
              type="button"
              onClick={() => handleApplyColor('#06b6d4')}
              disabled={viewMode === 'code'}
              className="w-3.5 h-3.5 rounded-full bg-cyan-500 hover:scale-125 transition-transform"
              title="צבע טורקיז"
            />
            <button
              type="button"
              onClick={() => handleApplyColor('#ffffff')}
              disabled={viewMode === 'code'}
              className="w-3.5 h-3.5 rounded-full bg-white hover:scale-125 transition-transform border border-slate-600"
              title="צבע לבן"
            />
          </div>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          {/* Links & Clear Format */}
          <button
            type="button"
            onClick={handleInsertLink}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="הוספת קישור"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('removeFormat')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-rose-400"
            title="נקה עיצוב"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('undo')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="בטל (Undo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            disabled={viewMode === 'code'}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="בצע שוב (Redo)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons: KOSAI AI Assistant, View Toggle & Fullscreen */}
        <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
          {/* AI Rewrite Assistant Button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="שכתוב והשבחה עם KOSAI המחובר לחזון המותג"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>KOSAI חזון AI</span>
          </button>

          {/* Mode Switch (WYSIWYG vs Code) */}
          <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('wysiwyg')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'wysiwyg'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="תצוגה ויזואלית (WYSIWYG)"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'code'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="תצוגת קוד מקור HTML"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title={isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className={`p-4 ${isFullscreen ? 'flex-1 overflow-y-auto' : 'min-h-[220px]'}`}>
        {viewMode === 'wysiwyg' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: value || '' }}
            className="w-full min-h-[200px] outline-none prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-slate-200 font-sans focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 cursor-text"
            data-placeholder={placeholder}
          />
        ) : (
          <textarea
            value={htmlCode}
            onChange={handleCodeChange}
            rows={isFullscreen ? 20 : 10}
            className="w-full h-full min-h-[200px] font-mono text-xs bg-black/50 border border-white/10 rounded-xl p-3 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
            placeholder="<div>קוד HTML מעוצב...</div>"
            dir="ltr"
          />
        )}
      </div>

      {/* Footer Info & Word Count */}
      <div
        className={`px-3 py-1.5 border-t text-[11px] flex items-center justify-between ${
          isDarkMode ? 'border-white/5 bg-[#141416] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>עורך ויזואלי WYSIWYG פעיל</span>
          {brandDna?.identity?.companyName && (
            <span className="text-amber-400/80">
              • מחובר לחזון: {brandDna.identity.companyName}
            </span>
          )}
        </div>
        <div>
          {htmlCode.replace(/<[^>]*>?/gm, '').trim().length} תווים
        </div>
      </div>

      {/* KOSAI AI Modal / Assistant Dialog */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-3xl bg-[#141417] border border-amber-500/30 p-6 shadow-2xl relative text-right flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    שכתוב והשבחת תוכן עם KOSAI
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Brand DNA
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    מבוסס על חזון המותג, מטרת הארגון והסלוגן של {brandDna?.identity?.companyName || 'העסק'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiPreviewHtml(null);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brand DNA Context Pill */}
            {(brandDna?.identity?.companyVision || brandDna?.identity?.shortVision || brandDna?.identity?.organizationPurpose) && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold block mb-1">תמצית החזון הרשומה במיתוג:</span>
                <span className="italic">
                  ״{brandDna.identity.companyVision || brandDna.identity.shortVision || brandDna.identity.organizationPurpose}״
                </span>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                בחרו פעולת AI מהירה:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteAiRewrite('full_vision')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-right transition-all group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      ניסוח חזון מלא לפי Brand DNA
                    </div>
                    <div className="text-[10px] text-slate-400">
                      יצירת סיפור שליחות שלם ומרגש
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteAiRewrite('pillars')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-right transition-all group cursor-pointer"
                >
                  <List className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      עמודי תווך וערכים (4 עקרונות)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      פירוק החזון לרשימת עקרונות מעוצבת
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteAiRewrite('short_vision')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-right transition-all group cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      תמצות למשפטי מפתח עוצמתיים
                    </div>
                    <div className="text-[10px] text-slate-400">
                      מיקוד החזון ב-2 פסקאות מחץ
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteAiRewrite('closing_cta')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-right transition-all group cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      הוספת פסקת הנעה לפעולה חמה
                    </div>
                    <div className="text-[10px] text-slate-400">
                      סגירה מזמינה להתחברות והצטרפות
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Instruction Prompt */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                או הזינו הנחיה מותאמת אישית ל-KOSAI:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiCustomPrompt.trim() && !aiLoading) {
                      handleExecuteAiRewrite('custom', aiCustomPrompt);
                    }
                  }}
                  placeholder="לדוגמה: הדגש 20 שנות ניסיון והתאם לקהל יעד צעיר והייטקי..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleExecuteAiRewrite('custom', aiCustomPrompt)}
                  disabled={!aiCustomPrompt.trim() || aiLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
                >
                  שכתב
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {aiLoading && (
              <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>KOSAI מעבד את תמצית המותג ומנסח מחדש...</span>
              </div>
            )}

            {/* Result Preview */}
            {aiPreviewHtml && !aiLoading && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> תוצאה מוכנה לתצוגה מקדימה:
                  </span>
                </div>
                <div
                  className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[220px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: aiPreviewHtml }}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAiPreviewHtml(null)}
                    className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs text-slate-300"
                  >
                    נסה שוב
                  </button>
                  <button
                    type="button"
                    onClick={applyAiResult}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    החל תוכן זה בעורך
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
