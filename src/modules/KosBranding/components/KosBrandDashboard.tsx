import React, { useState } from 'react';
import { useBrandDna } from '../context/BrandDnaContext';
import { KosunTopNavHelper } from './KosunTopNavHelper';
import { KosunRowAction } from './KosunRowAction';
import {
  Wand2,
  Globe,
  Sliders,
  Palette,
  Target,
  Sparkles,
  Layers,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  Lock,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Zap,
} from 'lucide-react';

interface KosBrandDashboardProps {
  onOpenWizard: () => void;
  onOpenScraper: () => void;
  onOpenStrategy: () => void;
  onSwitchToTab: (tabId: string) => void;
}

type WindowIndex = 1 | 2 | 3 | 4;

export const KosBrandDashboard: React.FC<KosBrandDashboardProps> = ({
  onOpenWizard,
  onOpenScraper,
  onOpenStrategy,
  onSwitchToTab,
}) => {
  const {
    brandDna,
    completenessScore,
    saveNow,
    resetToDefaults,
    updateVoice,
    isSaving,
  } = useBrandDna();

  const [currentWindow, setCurrentWindow] = useState<WindowIndex>(1);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Quick sliders state for Window 3
  const personality = brandDna.voice.personality || {
    formality: 3,
    warmth: 4,
    luxury: 3,
    energy: 4,
  };

  const handleSliderChange = (field: keyof typeof personality, val: number) => {
    updateVoice({
      personality: {
        ...personality,
        [field]: val,
      },
    });
  };

  const handleManualSave = async () => {
    const ok = await saveNow();
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes('סריקה') || lower.includes('אתר') || lower.includes('פייסבוק')) {
      onOpenScraper();
    } else if (lower.includes('אשף') || lower.includes('גילוי') || lower.includes('ai')) {
      onOpenWizard();
    } else if (lower.includes('אסטרטגיה') || lower.includes('תוכן') || lower.includes('כותרות')) {
      onOpenStrategy();
    } else if (lower.includes('קול') || lower.includes('טון') || lower.includes('סליידר')) {
      setCurrentWindow(3);
    } else if (lower.includes('מוצר') || lower.includes('שירות') || lower.includes('אקו')) {
      setCurrentWindow(4);
    } else if (lower.includes('שמור') || lower.includes('שמירה')) {
      handleManualSave();
    }
  };

  return (
    <div
      dir="rtl"
      className="w-full h-full max-h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden p-2 select-none"
    >
      {/* Top Universal Navigation Helper */}
      <div className="shrink-0 mb-3">
        <KosunTopNavHelper
          score={completenessScore}
          isAiProcessing={isSaving}
          onCommand={handleVoiceCommand}
          showBack={currentWindow !== 1}
          onBack={() => setCurrentWindow(1)}
          title={
            currentWindow === 1
              ? 'מרכז שליטה Brand DNA'
              : currentWindow === 2
              ? 'מחולל AI וסריקת נכסים'
              : currentWindow === 3
              ? 'טון דיבור ושילוב סליידרים'
              : 'אקו-סיסטם, מוצרים ואמינות'
          }
        />
      </div>

      {/* Main Content Area: Maximum 4 Rows per Window - ZERO SCROLL GUARANTEE */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full gap-2.5 sm:gap-3 py-1">
        {/* ==================== WINDOW 1: EXECUTIVE BRAND DNA PULSE ==================== */}
        {currentWindow === 1 && (
          <>
            {/* Row 1: AI Discovery & Web Scraper */}
            <KosunRowAction
              icon={Wand2}
              title="אשף גילוי מותג וסריקת נכסים"
              subtitle="סריקת אתר קודם, חילוץ צבעים וגיבוש DNA מלא ב-AI"
              badge="מומלץ להתחלה"
              variant="cyan"
              tooltipText="הפעלת אשף גילוי AI מתקדם וסריקת נכסים דיגיטליים קיימים לגיבוש מיידי של זהות המותג."
              onExecute={() => setCurrentWindow(2)}
            />

            {/* Row 2: Brand Voice & Design Tokens */}
            <KosunRowAction
              icon={Sliders}
              title="שפת מותג, טון דיבור וזהות חזותית"
              subtitle="התאמת סליידרים 1-5, מילות כוח ופלטת צבעים"
              badge={`${personality.formality}/5 רשמיות`}
              variant="cobalt"
              tooltipText="הגדרת מדדי טון הדיבור, רשמיות, אנרגיה, מילים אסורות וסנכרון ערכות העיצוב."
              onExecute={() => setCurrentWindow(3)}
            />

            {/* Row 3: Target Audience & Market Research */}
            <KosunRowAction
              icon={Target}
              title="קהלי יעד, פרסונות ומחקר שוק"
              subtitle="מיפוי כאבים, מניעי רכישה וסוכן מודיעין מתחרים"
              badge="סוכן שוק פעיל"
              variant="magenta"
              tooltipText="צפייה ועריכה של פרסונות המותג, נקודות כאב, והפעלת סוכן מחקר מתחרים ייעודי."
              onExecute={() => onSwitchToTab('audience')}
            />

            {/* Row 4: Ecosystem & Trust Assets */}
            <KosunRowAction
              icon={Layers}
              title="מבנה שירותים, מוצרים ונכסי אמינות"
              subtitle="מיפוי Slugs, מוצרי דגל, הצהרות אבטחה ומדיניות"
              badge={`${brandDna.ecosystem?.services?.length || 0} שירותים`}
              variant="default"
              tooltipText="הגדרת שירותי הליבה, מוצרי דגל, שאלות נפוצות, פרטי אבטחה וח.פ עסק."
              onExecute={() => setCurrentWindow(4)}
            />
          </>
        )}

        {/* ==================== WINDOW 2: AI ENGINE & ASSET EXTRACTOR ==================== */}
        {currentWindow === 2 && (
          <>
            {/* Row 1: Web & Social Scraper */}
            <KosunRowAction
              icon={Globe}
              title="סריקת אתר ועמוד עסקי"
              subtitle="חילוץ אוטומטי של צבעים, לוגו ותכנים מכתובת URL"
              badge="סריקה חיה"
              variant="cyan"
              tooltipText="הזנת קישור לאתר הקיים או דף נחיתה וסריקת כל נכסי המיתוג ישירות ל-Brand DNA."
              onExecute={onOpenScraper}
            />

            {/* Row 2: AI Brand Discovery Wizard */}
            <KosunRowAction
              icon={Wand2}
              title="אשף גילוי מותג מונחה AI"
              subtitle="תהליך שלב-אחר-שלב לגיבוש זהות מותג מ-0"
              badge="Interactive"
              variant="magenta"
              tooltipText="אשף אינטראקטיבי המנחה אותך בשיחה קולחת לבניית שפת המותג והבידול."
              onExecute={onOpenWizard}
            />

            {/* Row 3: Competitor Research Agent */}
            <KosunRowAction
              icon={Bot}
              title="סוכן מחקר מתחרים ובידול"
              subtitle="סריקת שוק לזיהוי נקודות תורפה והזדמנויות עסקיות"
              badge="סוכן AI"
              variant="cobalt"
              tooltipText="הפעלת סוכן מודיעין עסקי המנתח את המתחרים ומייצר הצעת ערך ייחודית."
              onExecute={() => onSwitchToTab('market')}
            />

            {/* Row 4: Content Strategy Generator */}
            <KosunRowAction
              icon={FileSpreadsheet}
              title="מחולל אסטרטגיית תוכן וכותרות"
              subtitle="הפקת כותרות שיווקיות, פוסטים ומסרים חדים לפי ה-DNA"
              badge="Content Generator"
              variant="default"
              tooltipText="יצירת כותרות דפי נחיתה, פוסטים לרשתות ומסרי מכירה בלחיצת כפתור אחת."
              onExecute={onOpenStrategy}
            />
          </>
        )}

        {/* ==================== WINDOW 3: BRAND VOICE & PERSONALITY ==================== */}
        {currentWindow === 3 && (
          <>
            {/* Row 1: Interactive Sliders Bar */}
            <div className="w-full bg-[#0D0E1F]/90 backdrop-blur-md border border-[#1A2B4C] hover:border-[#00F0FF]/40 rounded-2xl p-3 sm:p-3.5 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-1.5">
                  <Sliders size={14} />
                  אישיות המותג וטון דיבור (סליידרים 1-5)
                </span>
                <span className="text-[10px] text-[#F0F4FF]/60 font-mono">Real-time sync</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex flex-col gap-1 bg-[#070913]/80 p-2 rounded-xl border border-[#1A2B4C]">
                  <div className="flex justify-between text-[#F0F4FF]/80">
                    <span>רשמיות:</span>
                    <span className="font-bold text-[#00F0FF]">{personality.formality}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={personality.formality}
                    onChange={(e) => handleSliderChange('formality', Number(e.target.value))}
                    className="accent-[#00F0FF] cursor-pointer h-1.5 bg-[#1A2B4C] rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1 bg-[#070913]/80 p-2 rounded-xl border border-[#1A2B4C]">
                  <div className="flex justify-between text-[#F0F4FF]/80">
                    <span>חום ונגישות:</span>
                    <span className="font-bold text-[#BD00FF]">{personality.warmth}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={personality.warmth}
                    onChange={(e) => handleSliderChange('warmth', Number(e.target.value))}
                    className="accent-[#BD00FF] cursor-pointer h-1.5 bg-[#1A2B4C] rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1 bg-[#070913]/80 p-2 rounded-xl border border-[#1A2B4C]">
                  <div className="flex justify-between text-[#F0F4FF]/80">
                    <span>יוקרה:</span>
                    <span className="font-bold text-[#00A3FF]">{personality.luxury}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={personality.luxury}
                    onChange={(e) => handleSliderChange('luxury', Number(e.target.value))}
                    className="accent-[#00A3FF] cursor-pointer h-1.5 bg-[#1A2B4C] rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1 bg-[#070913]/80 p-2 rounded-xl border border-[#1A2B4C]">
                  <div className="flex justify-between text-[#F0F4FF]/80">
                    <span>אנרגיה ותעוזה:</span>
                    <span className="font-bold text-[#00F0FF]">{personality.energy}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={personality.energy}
                    onChange={(e) => handleSliderChange('energy', Number(e.target.value))}
                    className="accent-[#00F0FF] cursor-pointer h-1.5 bg-[#1A2B4C] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Power Words & Forbidden Words Manager */}
            <KosunRowAction
              icon={Sparkles}
              title="ניהול מילות כוח ומילים אסורות"
              subtitle={`מוגדרות ${brandDna.voice.powerWords?.length || 0} מילות כוח ו-${brandDna.voice.forbiddenWords?.length || 0} אסורות`}
              badge="שפה ייחודית"
              variant="magenta"
              tooltipText="עריכת רשימת המילים שמחזקות את המותג ומילים שאסור למחוללי ה-AI להשתמש בהן."
              onExecute={() => onSwitchToTab('voice')}
            />

            {/* Row 3: Design Tokens & Visual Palette */}
            <KosunRowAction
              icon={Palette}
              title="ערכות עיצוב ופלטה חזותית"
              subtitle={`צבע ראשי: ${brandDna.designTokens?.primaryColor || '#00F0FF'} | גופנים ומרווחים`}
              badge="Event Sync"
              variant="cyan"
              tooltipText="הגדרת צבעי המותג, לוגו, גופנים ושידור אירוע סנכרון חזותי לכל רכיבי המערכת."
              onExecute={() => onSwitchToTab('design')}
            />

            {/* Row 4: Instant Cloud Sync */}
            <KosunRowAction
              icon={saveSuccess ? CheckCircle2 : Save}
              title={saveSuccess ? "הנתונים נשמרו בהצלחה!" : "שמירה מיידית וסנכרון מלא"}
              subtitle="סנכרון מיידי ל-Firestore ולכל מודולי KOSUN בענן"
              badge={isSaving ? "שומר..." : "Cloud Ready"}
              variant="cobalt"
              tooltipText="ביצוע שמירה יזומה וסנכרון מלא של כל הגדרות ה-DNA עם בסיס הנתונים בענן."
              onExecute={handleManualSave}
            />
          </>
        )}

        {/* ==================== WINDOW 4: ECOSYSTEM & TRUST ASSETS ==================== */}
        {currentWindow === 4 && (
          <>
            {/* Row 1: Core Services & Slug Mapper */}
            <KosunRowAction
              icon={Layers}
              title="מיפוי שירותי ליבה ו-Slugs"
              subtitle="חיבור שירותים לדפי נחיתה ייעודיים ומשפכי מכירה"
              badge="SEO Slugs"
              variant="cyan"
              tooltipText="הגדרת שירותי הליבה של העסק, מחירים ורישום Slugs אוטומטי במערכת."
              onExecute={() => onSwitchToTab('ecosystem')}
            />

            {/* Row 2: Flagship Products & FAQ Builder */}
            <KosunRowAction
              icon={Zap}
              title="מוצרי דגל ורכיבי FAQ"
              subtitle="הצגת חבילות מובחרות ושאלות ותשובות להסרת התנגדויות"
              badge="המרה גבוהה"
              variant="magenta"
              tooltipText="ניהול מוצרי הדגל של המותג ושאלות נפוצות המגבירות את אחוז ההמרה."
              onExecute={() => onSwitchToTab('ecosystem')}
            />

            {/* Row 3: Trust & Security Credentials */}
            <KosunRowAction
              icon={ShieldCheck}
              title="פרטי אבטחה, ח.פ ומדיניות ביטולים"
              subtitle="הצהרות סליקה מאובטחת, תנאי שימוש ותעודות אמון"
              badge="PCI & SSL"
              variant="cobalt"
              tooltipText="הגדרת רכיבי אמון ללקוח: מספר עוסק/ח.פ, מדיניות החזרים ותקני אבטחה."
              onExecute={() => onSwitchToTab('trust')}
            />

            {/* Row 4: System Reset */}
            <KosunRowAction
              icon={RotateCcw}
              title="איפוס להגדרות ברירת מחדל"
              subtitle="החזרת כל נתוני ה-DNA להגדרות הראשוניות של המערכת"
              badge="פעולה רגישה"
              variant="default"
              tooltipText="איפוס מוחלט של כל נתוני המיתוג להגדרות ברירת המחדל (תיפתח בקשת אישור)."
              onExecute={() => setResetConfirmOpen(true)}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal for Reset (ADHD/Accidental loss prevention) */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-[99999] bg-[#070913]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            dir="rtl"
            className="w-full max-w-sm bg-[#0B0E1A] border border-rose-500/60 rounded-3xl p-5 shadow-[0_0_35px_rgba(244,63,94,0.3)] text-right"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
              <AlertTriangle size={18} />
              <span>אישור איפוס נתונים</span>
            </div>
            <p className="text-xs text-[#F0F4FF]/80 leading-relaxed mb-4">
              האם אתה בטוח שברצונך לאפס את כל נתוני ה-Brand DNA להגדרות ברירת המחדל? פעולה זו תמחק שינויים שלא גובו.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#1A2B4C]">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#12162B] text-[#F0F4FF]/80 hover:text-white text-xs font-semibold cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaults();
                  setResetConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              >
                כן, אפס הכל
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Minimal Indicator Bar */}
      <div className="shrink-0 flex items-center justify-between px-2 pt-2 border-t border-[#1A2B4C]/60 text-[10px] text-[#F0F4FF]/40">
        <div className="flex items-center gap-1.5">
          <span>KOSBRAND ZERO-SCROLL DASHBOARD</span>
          <span>•</span>
          <span className="text-[#00F0FF]">חלון {currentWindow} מתוך 4</span>
        </div>
        <div className="flex items-center gap-2">
          {([1, 2, 3, 4] as WindowIndex[]).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setCurrentWindow(num)}
              className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                currentWindow === num
                  ? 'bg-[#00F0FF] text-[#070913] shadow-[0_0_10px_#00F0FF]'
                  : 'bg-[#12162B] text-[#F0F4FF]/60 hover:text-[#00F0FF] border border-[#1A2B4C]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
