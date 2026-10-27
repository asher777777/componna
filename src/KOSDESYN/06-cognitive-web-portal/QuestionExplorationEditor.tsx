import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { TenantProfile, TenantThemeColors } from './types';
import { QuestionExplorationView, QuestionAffinityItem } from './QuestionExplorationView';
import { KosunUserAvatar } from './KosunUserAvatar';
import { 
  getAreaCollectionSchema, 
  generateBrandAdaptationAi, 
  saveAreaCollectionConfig, 
  AreaCollectionSchema, 
  KOSUN_STYLE_PRESETS, 
  StylePresetDefinition, 
  resolveDiscoveryLayoutMode,
  extractPaletteFromLogoImage 
} from '../../../factory/areaCollectionManager';
import { getTerminology } from '../../../factory/pageTerminologyDictionary';

export interface QuestionExplorationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  tenantProfile: TenantProfile | null;
  tenantTheme: TenantThemeColors;
  initialQuestion?: string;
  initialAnswer?: string;
  initialVisualConfig?: {
    layoutBudget?: string;
    atmosphereTheme?: string;
    languageStyle?: string;
    intentGoal?: string;
    colorMode?: string;
  };
  onSaveConfig: (updatedConfig: any) => Promise<void> | void;
}

export const QuestionExplorationEditor: React.FC<QuestionExplorationEditorProps> = ({
  isOpen,
  onClose,
  tenantProfile,
  tenantTheme,
  initialQuestion,
  initialAnswer,
  initialVisualConfig,
  onSaveConfig
}) => {
  const tenantId = tenantProfile?.id || 'kosun';
  const marketType = tenantProfile?.category || 'saas';

  // 1. קולקציית האזור הדינמית (פרמטרים פעילים)
  const [schema, setSchema] = useState<AreaCollectionSchema | null>(null);
  const [selectedParams, setSelectedParams] = useState<Record<string, any>>({
    layoutBudget: resolveDiscoveryLayoutMode(initialVisualConfig?.layoutBudget, 'accordion_morph'),
    intentGoal: initialVisualConfig?.intentGoal || 'conversion',
    languageStyle: initialVisualConfig?.languageStyle || 'approachable',
    atmosphereTheme: initialVisualConfig?.atmosphereTheme || 'cyber_neon',
    colorMode: initialVisualConfig?.colorMode || 'night'
  });

  const selectedStyleDef: StylePresetDefinition = KOSUN_STYLE_PRESETS[selectedParams.atmosphereTheme] || KOSUN_STYLE_PRESETS.cyber_neon;
  const isDayMode = selectedParams.colorMode === 'day';
  const activeColorSet = isDayMode ? selectedStyleDef.day : selectedStyleDef.night;
  const brandColor = activeColorSet.primaryColor || tenantTheme?.micColor || '#00F0FF';

  // 2. תוכן השאלות
  const [mainQuestion, setMainQuestion] = useState(
    initialQuestion || 'איך שיטת The Big 3 מייצרת שקט נפשי ו-100% ביצוע?'
  );
  const [mainAnswer, setMainAnswer] = useState(
    initialAnswer || 'השיטה מבוססת על צמצום קוגניטיבי ממוקד: בחירה של 3 משימות מפתח ביום ופירוקן לפעולות של 15 דקות.'
  );
  const [relatedQuestions, setRelatedQuestions] = useState<Array<{
    question: string;
    icon: string;
    intentGoal: 'deep_dive' | 'differentiation' | 'intent_conversion';
  }>>([
    { question: 'איך מתמודדים כשמגיעה משימה דחופה באמצע היום?', icon: 'AlertTriangle', intentGoal: 'deep_dive' },
    { question: 'האם המערכת מבצעת תמלול קולי אוטומטי בעברית?', icon: 'Mic', intentGoal: 'differentiation' },
    { question: 'צפה בחבילות ומסלולי KOSUN 2026 ושריין מקום', icon: 'Layers', intentGoal: 'intent_conversion' }
  ]);

  // 3. מודל הבבושקה (Babushka Stack): מחסנית ניווט המבטיחה מקסימום 4 כרטיסים בכל רגע נתון
  const [navStack, setNavStack] = useState<string[]>([]);
  const [isAiAdapting, setIsAiAdapting] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // סנכרון ראשוני
  useEffect(() => {
    if (!isOpen) return;
    getAreaCollectionSchema('area_question_page', tenantId, marketType).then((res) => {
      setSchema(res);
      const initialMap: Record<string, any> = {};
      res.parameters.forEach((p) => {
        initialMap[p.key] = p.currentValue;
      });
      setSelectedParams({
        ...initialMap,
        layoutBudget: resolveDiscoveryLayoutMode(
          initialVisualConfig?.layoutBudget || initialMap.layoutBudget,
          'accordion_morph'
        ),
        atmosphereTheme: initialVisualConfig?.atmosphereTheme || initialMap.atmosphereTheme || 'cyber_neon',
        colorMode: initialVisualConfig?.colorMode || initialMap.colorMode || 'night'
      });
    });
  }, [tenantId, marketType, isOpen, initialVisualConfig?.layoutBudget, initialVisualConfig?.atmosphereTheme, initialVisualConfig?.colorMode]);

  // הצעות פעולה חכמות
  const editorActionSuggestions = [
    'אקורדיון 4 שורות מציג חוויית גילוי עמוקה ומניעה לפעולה',
    'התאם את השפה לטון מנהיגותי כדי למקד מנהלים בתוצאות',
    'חבר את יעד המשפך לרכישה מיידית להגדלת יחסי ההמרה',
    'ערכת יוקרה שקטה (Gold) מתאימה לקהל פרימיום ועסקאות גדולות',
    'סוכן ה-AI יכול להתאים את כל השאלות למותג בלחיצה אחת'
  ];
  const [suggestionIdx, setSuggestionIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIdx((prev) => (prev + 1) % editorActionSuggestions.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const [activeSuggestion, setActiveSuggestion] = useState<string>(editorActionSuggestions[0]);

  useEffect(() => {
    setActiveSuggestion(editorActionSuggestions[suggestionIdx]);
  }, [suggestionIdx]);

  // מילון שמות ידידותיים לאפשרויות
  const layoutTitles: Record<string, { title: string; desc: string }> = {
    accordion_morph: { title: '1. אקורדיון חי • 4 שורות מתרחבות', desc: '4 רצועות שבהן השורה הנבחרת מתרחבת וחושפת תוכן וכפתור פעולה' },
    spotlight_stage: { title: '2. במת זרקור • 1 ראשי + 3 קפסולות', desc: 'כרטיס זרקור מרכזי ענק בראש ו-3 קפסולות תחתונות שמתחלפות בנגיעה' },
    bento_asymmetric: { title: '3. פסיפס בנטו • כרטיס גיבור 1+2+1', desc: 'פסיפס מונחה-משקל: כרטיס גיבור רחב בראש, זוג כרטיסים ופס פעולה' },
    glass_flip_overlay: { title: '4. וילון זכוכית צף • רשת 2x2', desc: 'רשת ממוקדת שבה נגיעה בכרטיס מרימה וילון זכוכית אלגנטי עם התשובה' },
    swipe_action_deck: { title: '5. חפיסת כרטיסים 3D • דפדוף קינטי', desc: 'חפיסת עומק תלת-ממדית עם דפדוף מהיר ופעולה ישירה במרכז הבמה' }
  };

  const intentTitles: Record<string, { title: string; desc: string }> = {
    conversion: { title: '1. הנעה ישירה לפעולה ורכישה', desc: 'כרטיס ההמשך מציע רכישת מנוי או שריון מקום מיידי' },
    authority: { title: '2. ביסוס סמכות ומקצועיות', desc: 'הפניה להעמקה במחקר מדעי והצגת מומחיות ייחודית' },
    trust: { title: '3. בניית אמון והסרת חסמים', desc: 'מענה לשאלות נפוצות, תאימות אישית ובניית ביטחון' },
    retention: { title: '4. הדרכה והצלחת לקוח', desc: 'טיפים וכלים פרקטיים לשגרת עבודה מנצחת והטמעה' }
  };

  const toneTitles: Record<string, { title: string; desc: string }> = {
    approachable: { title: '1. חם ומזמין • בגובה העיניים', desc: 'פשוט, מסביר פנים, מרגיע ומחבר רגשית' },
    executive: { title: '2. מנהלתי ותוצאתי • Executive', desc: 'חד, ממוקד חיסכון בזמן, מספרים ותפוקה' },
    inspirational: { title: '3. מעצים וחדשני • Visionary', desc: 'מעורר השראה, חזון מנהיגותי והפיכת רעיונות לנכסים' },
    minimal: { title: '4. אפס מילים מיותרות • Lean Minimal', desc: 'תמציתי, מדויק ומוביל לפעולה ישירה בלבד' }
  };

  // ביצוע התאמה אישית ע״י AI
  const handleTriggerAiAdaptation = async () => {
    setIsAiAdapting(true);
    setAiNotice('סוכן ה-AI מתאים את השאלות והתשובות למיתוג העסק ולקהל היעד...');
    try {
      const result = await generateBrandAdaptationAi({
        tenantId,
        marketType,
        tenantProfile,
        areaId: 'area_question_page'
      });

      setMainQuestion(result.mainQuestion);
      setMainAnswer(result.mainAnswer);
      setRelatedQuestions(result.funnelCards);
      setHasChanges(true);
      setAiNotice(`הותאמה שפה חדשה: "${result.generatedToneTitle}"`);
      setTimeout(() => setAiNotice(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiAdapting(false);
    }
  };

  // חילוץ צבעים אוטומטי מהלוגו
  const handleExtractFromLogo = async () => {
    if (!tenantProfile?.logoUrl) {
      setAiNotice('לא נמצא לוגו מוגדר בטננט, נשמרים צבעי ברירת המחדל.');
      setTimeout(() => setAiNotice(null), 3000);
      return;
    }
    setAiNotice('סורק את הלוגו ומחלץ פלטת מיתוג ייעודית...');
    try {
      const extracted = await extractPaletteFromLogoImage(tenantProfile.logoUrl);
      setAiNotice(`חולצו גווני מיתוג מהלוגו (${extracted.primary}). נשמרים כסגנון מותאם.`);
      setHasChanges(true);
      setTimeout(() => setAiNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // עדכון בחירה בכרטיס
  const handleSelectParam = (paramKey: string, value: any, userFriendlyNote?: string) => {
    setSelectedParams((prev) => ({ ...prev, [paramKey]: value }));
    setHasChanges(true);
    if (userFriendlyNote) {
      setActiveSuggestion(userFriendlyNote);
    }
  };

  // ניווט בבושקה
  const popNav = () => {
    setNavStack((prev) => prev.slice(0, -1));
  };

  const currentLevel = navStack.length;
  const currentCategory = navStack[0];
  const isSubBabushka = navStack[1] === 'more';

  // ביטול
  const handleUndo = () => {
    setHasChanges(false);
    setViewMode('editor');
    setNavStack([]);
  };

  // אישור ושמירה קבועה
  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const configPayload = {
        mainQuestion,
        mainAnswer,
        categoryTitle: 'עקרונות פרודוקטיביות',
        relatedQuestions,
        selectedParams,
        layoutBudget: selectedParams.layoutBudget,
        atmosphereTheme: selectedParams.atmosphereTheme,
        languageStyle: selectedParams.languageStyle,
        intentGoal: selectedParams.intentGoal,
        colorMode: selectedParams.colorMode || 'night'
      };

      await saveAreaCollectionConfig('area_question_page', tenantId, configPayload);
      await onSaveConfig(configPayload);
      setHasChanges(false);
      setViewMode('editor');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const previewRelatedQuestions: QuestionAffinityItem[] = relatedQuestions.map((rq, idx) => ({
    id: 'rq_' + idx,
    question: rq.question,
    affinityScore: idx === 0 ? 80 : idx === 1 ? 50 : 25,
    intentGoal: rq.intentGoal,
    icon: rq.icon,
    category: idx === 0 ? 'ניהול עומס' : idx === 1 ? 'יתרון טכנולוגי' : 'הנעה לפעולה',
    ctaLabel: idx === 2 ? 'לכל החבילות ◀' : 'העמקה בשיטה'
  }));

  if (!isOpen) return null;

  // כותרת נוכחית בהתאם לעומק הבבושקה
  const getHeaderTitle = () => {
    if (currentLevel === 0) {
      return 'עורך קולקציות עמוד • שיטת 4 הכרטיסים';
    }
    if (currentCategory === 'layout') {
      return isSubBabushka ? 'פריסות ייחודיות נוספות' : 'מבנה הפריסה וגילוי התוכן';
    }
    if (currentCategory === 'branding') {
      return isSubBabushka ? 'פלטות נוספות ומצב תאורה' : 'סגנון מיתוג ואווירה';
    }
    if (currentCategory === 'intent') {
      return 'כוונת המשפך העסקי והמרות';
    }
    if (currentCategory === 'tone') {
      return 'שפת המותג וטון השיחה';
    }
    return 'עריכה מודולרית';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn" dir="rtl">
      
      {/* מסגרת 9:16 מדויקת - Zero Scroll Viewport Contract */}
      <div 
        className="w-full max-w-[430px] h-[92vh] max-h-[880px] my-auto flex flex-col justify-between rounded-3xl border p-3.5 shadow-2xl relative overflow-hidden select-none transition-all duration-300 font-sans"
        style={{
          background: activeColorSet.editorBg,
          color: activeColorSet.textColor,
          borderColor: activeColorSet.borderColor
        }}
      >
        
        {/* הילת רקע זוהרת */}
        <div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-[80px] pointer-events-none opacity-25"
          style={{ backgroundColor: brandColor }}
        />

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* מצב 1: מסך צפייה בשינויים (Live Preview)                           */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {viewMode === 'preview' ? (
          <div className="w-full h-full flex flex-col justify-between relative z-30 animate-fadeIn">
            
            {/* סרגל עליון: ביטול | חזרה לעריכה | אישור */}
            <div className="w-full flex items-center justify-between p-2 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-xl shadow-2xl mb-1 shrink-0">
              <button
                type="button"
                onClick={handleUndo}
                title={getTerminology('owner_btn_tooltip_revert', marketType)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold active:scale-95 transition-all"
              >
                <Icons.RotateCcw size={13} />
                <span>ביטול</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('editor')}
                title="חזור לעריכת כרטיסי הבבושקה"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold active:scale-95 transition-all"
              >
                <Icons.SlidersHorizontal size={13} />
                <span>חזרה לעריכה</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                title={getTerminology('owner_btn_tooltip_save', marketType)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black active:scale-95 transition-all shadow-md shadow-emerald-500/30"
              >
                {isSaving ? <Icons.Loader2 size={13} className="animate-spin" /> : <Icons.Check size={13} />}
                <span>אישור ופרסום</span>
              </button>
            </div>

            {/* עמוד השאלות בתצוגה חיה */}
            <div className="w-full flex-1 overflow-hidden my-auto py-1">
              <QuestionExplorationView
                mainQuestion={mainQuestion}
                mainAnswer={mainAnswer}
                category="פרודוקטיביות ו-The Big 3"
                affinityScore={98}
                relatedQuestions={previewRelatedQuestions}
                tenantProfile={tenantProfile}
                visualConfig={{
                  layoutBudget: selectedParams.layoutBudget || selectedStyleDef.defaultLayout || 'accordion_morph',
                  atmosphereTheme: selectedParams.atmosphereTheme || 'cyber_neon',
                  languageStyle: selectedParams.languageStyle || 'approachable',
                  intentGoal: selectedParams.intentGoal || 'conversion',
                  colorMode: selectedParams.colorMode || 'night'
                }}
                onSelectRelatedQuestion={(q) => setMainQuestion(q)}
                onBack={() => {}}
                onAskAiDirectly={() => {}}
                onActionTrigger={() => {}}
              />
            </div>
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════════════ */
          /* מצב 2: עורך שיטת הבבושקה - בדיוק מקסימום 4 כרטיסים על המסך        */
          /* ═════════════════════════════════════════════════════════════════ */
          <div className="w-full h-full flex flex-col justify-between relative z-30">
            
            {/* 1. כותרת עליונה + ניווט בבושקה */}
            <div className="flex items-center justify-between pb-2 shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-black shadow-md"
                  style={{ backgroundColor: brandColor, color: '#000000' }}
                >
                  <Icons.Layers size={15} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[11.5px] font-black text-white leading-tight">
                    {getHeaderTitle()}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {currentLevel === 0 ? 'שיטת הבבושקה • 4 כרטיסי מפתח' : `שלב ${currentLevel + 1} בבבושקה • מקסימום 4 כרטיסים`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {currentLevel > 0 && (
                  <button
                    type="button"
                    onClick={popNav}
                    title="חזרה לשלב הקודם בבבושקה"
                    className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold active:scale-95 transition-all"
                  >
                    <Icons.ArrowRight size={11} />
                    <span>חזרה</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  title={getTerminology('owner_btn_tooltip_close', marketType)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
                >
                  <Icons.X size={14} />
                </button>
              </div>
            </div>

            {/* הודעת AI חכמה */}
            {aiNotice && (
              <div className="p-2 rounded-xl bg-cyan-950/90 border border-cyan-400/40 text-[10px] text-cyan-200 animate-slideDown my-1 text-center font-bold shadow-lg">
                {aiNotice}
              </div>
            )}

            {/* 2. קפסולת ה-AI העליונה עם KosunUserAvatar וטיפ חכם */}
            <div className="relative z-20 w-full my-1.5" data-area-id="area_editor_ai_capsule">
              <div 
                className="w-full h-14 rounded-2xl p-1.5 flex items-center justify-between gap-2 border-2 shadow-2xl transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: tenantTheme.capsuleBg || '#090d16',
                  borderColor: tenantTheme.capsuleBorder || brandColor,
                  boxShadow: `0 0 20px ${tenantTheme.micGlow || `${brandColor}40`}`
                }}
              >
                {/* אווטאר המערכת הרשמי KosunUserAvatar צבוע לפי הסגנון */}
                <div 
                  onClick={handleTriggerAiAdaptation}
                  title="לחץ להתאמת AI למותג"
                  className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform p-0.5"
                >
                  <KosunUserAvatar 
                    color={brandColor} 
                    size={36} 
                    showGlow={true} 
                  />
                </div>

                {/* הצעת פעולה חכמה המנחה את המשתמש */}
                <div 
                  onClick={() => {
                    if (currentLevel === 0) {
                      if (activeSuggestion.includes('אקורדיון') || activeSuggestion.includes('פריס')) {
                        setNavStack(['layout']);
                      } else if (activeSuggestion.includes('יוקרה') || activeSuggestion.includes('סגנון')) {
                        setNavStack(['branding']);
                      } else if (activeSuggestion.includes('המשפך') || activeSuggestion.includes('המרה')) {
                        setNavStack(['intent']);
                      } else if (activeSuggestion.includes('שפה') || activeSuggestion.includes('טון')) {
                        setNavStack(['tone']);
                      } else {
                        handleTriggerAiAdaptation();
                      }
                    } else {
                      handleTriggerAiAdaptation();
                    }
                  }}
                  className="flex-1 text-right cursor-pointer px-1 overflow-hidden group flex flex-col justify-center"
                >
                  <span className="text-[9px] text-cyan-300/90 block leading-tight truncate mb-0.5 font-bold">
                    💡 המלצת מומחה • לחץ ליישום:
                  </span>
                  <div className="text-[11px] font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                    {activeSuggestion}
                  </div>
                </div>

                {/* מיקרופון אינטראקטיבי */}
                <button
                  type="button"
                  onClick={handleTriggerAiAdaptation}
                  title={getTerminology('owner_btn_tooltip_ai', marketType)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer relative group transition-transform active:scale-95"
                  style={{
                    backgroundColor: `${brandColor}20`,
                    border: `1.5px solid ${brandColor}`
                  }}
                >
                  <div 
                    className="absolute -inset-1 rounded-xl animate-ping opacity-30 pointer-events-none" 
                    style={{ backgroundColor: brandColor }}
                  />
                  <Icons.Mic size={18} style={{ color: brandColor }} />
                </button>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 3. ארנה מרכזית: תמיד בדיוק מקסימום 4 כרטיסים על המסך (Zero Scroll) */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="w-full flex-1 flex flex-col justify-between py-1 my-auto overflow-hidden">
              
              {/* ───────────────────────────────────────────────────────────── */}
              {/* רמה 0: בבושקה ראשית - 4 כרטיסי מפתח בדיוק                      */}
              {/* ───────────────────────────────────────────────────────────── */}
              {currentLevel === 0 && (
                <div className="w-full h-full flex flex-col justify-between gap-2 overflow-hidden py-0.5 animate-fadeIn">
                  
                  {/* כרטיס 1: מבנה הפריסה וגילוי התוכן */}
                  <div
                    onClick={() => setNavStack(['layout'])}
                    className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md group relative overflow-hidden"
                    style={{
                      background: isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                      borderColor: isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                        >
                          <Icons.LayoutGrid size={14} />
                        </div>
                        <span className="text-[11px] font-black" style={{ color: activeColorSet.textColor }}>
                          1. פריסת מסך וגילוי תוכן
                        </span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-bold bg-white/10" style={{ color: brandColor }}>
                        5 מנגנונים ◀
                      </span>
                    </div>

                    <div className="my-auto py-0.5">
                      <div className="text-[11.5px] font-black" style={{ color: brandColor }}>
                        {layoutTitles[selectedParams.layoutBudget]?.title || selectedParams.layoutBudget}
                      </div>
                      <p className="text-[9.5px] line-clamp-1 mt-0.5" style={{ color: activeColorSet.secondaryText }}>
                        {layoutTitles[selectedParams.layoutBudget]?.desc || 'לחץ לבחירת מנגנון הגילוי'}
                      </p>
                    </div>

                    <div className="text-[8.5px] font-bold text-start flex items-center justify-between border-t pt-1" style={{ borderColor: isDayMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', color: activeColorSet.secondaryText }}>
                      <span>אקורדיון, במת זרקור, בנטו וחפיסה 3D</span>
                      <span className="font-bold" style={{ color: brandColor }}>פתח בחירה ◀</span>
                    </div>
                  </div>

                  {/* כרטיס 2: סגנון מיתוג, אווירה ותאורה */}
                  <div
                    onClick={() => setNavStack(['branding'])}
                    className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md group relative overflow-hidden"
                    style={{
                      background: isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                      borderColor: isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                        >
                          <Icons.Palette size={14} />
                        </div>
                        <span className="text-[11px] font-black" style={{ color: activeColorSet.textColor }}>
                          2. סגנון מיתוג, אווירה ותאורה
                        </span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-bold bg-white/10" style={{ color: brandColor }}>
                        {isDayMode ? 'יום ☀️' : 'לילה 🌙'} ◀
                      </span>
                    </div>

                    <div className="my-auto py-0.5">
                      <div className="text-[11.5px] font-black" style={{ color: brandColor }}>
                        {selectedStyleDef.shortLabel || selectedStyleDef.label} • {isDayMode ? 'מצב יום' : 'מצב לילה'}
                      </div>
                      <p className="text-[9.5px] line-clamp-1 mt-0.5" style={{ color: activeColorSet.secondaryText }}>
                        {selectedStyleDef.desc || 'פלטת גוונים, תאורת אווירה ואפקטים'}
                      </p>
                    </div>

                    <div className="text-[8.5px] font-bold text-start flex items-center justify-between border-t pt-1" style={{ borderColor: isDayMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', color: activeColorSet.secondaryText }}>
                      <span>5 פלטות יוקרה + החלפת יום/לילה</span>
                      <span className="font-bold" style={{ color: brandColor }}>התאם מיתוג ◀</span>
                    </div>
                  </div>

                  {/* כרטיס 3: כוונת המשפך העסקי והמרות */}
                  <div
                    onClick={() => setNavStack(['intent'])}
                    className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md group relative overflow-hidden"
                    style={{
                      background: isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                      borderColor: isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                        >
                          <Icons.Target size={14} />
                        </div>
                        <span className="text-[11px] font-black" style={{ color: activeColorSet.textColor }}>
                          3. כוונת המשפך העסקי והמרות
                        </span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-bold bg-white/10" style={{ color: brandColor }}>
                        4 יעדים ◀
                      </span>
                    </div>

                    <div className="my-auto py-0.5">
                      <div className="text-[11.5px] font-black" style={{ color: brandColor }}>
                        {intentTitles[selectedParams.intentGoal]?.title || selectedParams.intentGoal}
                      </div>
                      <p className="text-[9.5px] line-clamp-1 mt-0.5" style={{ color: activeColorSet.secondaryText }}>
                        {intentTitles[selectedParams.intentGoal]?.desc || 'קביעת יעד ההמרה המרכזי'}
                      </p>
                    </div>

                    <div className="text-[8.5px] font-bold text-start flex items-center justify-between border-t pt-1" style={{ borderColor: isDayMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', color: activeColorSet.secondaryText }}>
                      <span>רכישה, סמכות, אמון או הדרכה</span>
                      <span className="font-bold" style={{ color: brandColor }}>כוון יעד ◀</span>
                    </div>
                  </div>

                  {/* כרטיס 4: שפת המותג וטון השיחה */}
                  <div
                    onClick={() => setNavStack(['tone'])}
                    className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md group relative overflow-hidden"
                    style={{
                      background: isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                      borderColor: isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                        >
                          <Icons.MessageSquareQuote size={14} />
                        </div>
                        <span className="text-[11px] font-black" style={{ color: activeColorSet.textColor }}>
                          4. שפת המותג וטון השיחה
                        </span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-bold bg-white/10" style={{ color: brandColor }}>
                        4 סגנונות ◀
                      </span>
                    </div>

                    <div className="my-auto py-0.5">
                      <div className="text-[11.5px] font-black" style={{ color: brandColor }}>
                        {toneTitles[selectedParams.languageStyle]?.title || selectedParams.languageStyle}
                      </div>
                      <p className="text-[9.5px] line-clamp-1 mt-0.5" style={{ color: activeColorSet.secondaryText }}>
                        {toneTitles[selectedParams.languageStyle]?.desc || 'קביעת ניסוח התשובות והשיחה'}
                      </p>
                    </div>

                    <div className="text-[8.5px] font-bold text-start flex items-center justify-between border-t pt-1" style={{ borderColor: isDayMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', color: activeColorSet.secondaryText }}>
                      <span>חם ומזמין, מנהלתי, מעצים או מינימליסטי</span>
                      <span className="font-bold" style={{ color: brandColor }}>בחר טון ◀</span>
                    </div>
                  </div>

                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* רמה 1: בבושקה 1 - פריסת מסך וגילוי תוכן (מקסימום 4 כרטיסים)     */}
              {/* ───────────────────────────────────────────────────────────── */}
              {currentCategory === 'layout' && (
                <div className="w-full h-full flex flex-col justify-between gap-2 overflow-hidden py-0.5 animate-fadeIn">
                  {!isSubBabushka ? (
                    <>
                      {/* אופציה 1: אקורדיון חי */}
                      <div
                        onClick={() => handleSelectParam('layoutBudget', 'accordion_morph', 'נבחרה פריסת אקורדיון 4 שורות מתרחבות')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.layoutBudget === 'accordion_morph' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.layoutBudget === 'accordion_morph' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.layoutBudget === 'accordion_morph' ? brandColor : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.layoutBudget === 'accordion_morph' ? `0 0 16px -4px ${brandColor}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: selectedParams.layoutBudget === 'accordion_morph' ? brandColor : activeColorSet.textColor }}>
                            1. אקורדיון חי • 4 שורות מתרחבות
                          </span>
                          {selectedParams.layoutBudget === 'accordion_morph' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black" style={{ backgroundColor: brandColor }}>✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          4 רצועות שבהן השורה הנבחרת מתרחבת וחושפת שכבת תוכן וכפתור פעולה חי.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          {selectedParams.layoutBudget === 'accordion_morph' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* אופציה 2: במת זרקור */}
                      <div
                        onClick={() => handleSelectParam('layoutBudget', 'spotlight_stage', 'נבחרה פריסת במת זרקור 1+3')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.layoutBudget === 'spotlight_stage' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.layoutBudget === 'spotlight_stage' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.layoutBudget === 'spotlight_stage' ? brandColor : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.layoutBudget === 'spotlight_stage' ? `0 0 16px -4px ${brandColor}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: selectedParams.layoutBudget === 'spotlight_stage' ? brandColor : activeColorSet.textColor }}>
                            2. במת זרקור • 1 ראשי + 3 קפסולות
                          </span>
                          {selectedParams.layoutBudget === 'spotlight_stage' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black" style={{ backgroundColor: brandColor }}>✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          במת זרקור מרכזית ענקית בראש (58%) ו-3 קפסולות בחירה תחתונות שמתחלפות בנגיעה.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          {selectedParams.layoutBudget === 'spotlight_stage' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* אופציה 3: פסיפס בנטו */}
                      <div
                        onClick={() => handleSelectParam('layoutBudget', 'bento_asymmetric', 'נבחרה פריסת פסיפס בנטו אסימטרי')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.layoutBudget === 'bento_asymmetric' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.layoutBudget === 'bento_asymmetric' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.layoutBudget === 'bento_asymmetric' ? brandColor : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.layoutBudget === 'bento_asymmetric' ? `0 0 16px -4px ${brandColor}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: selectedParams.layoutBudget === 'bento_asymmetric' ? brandColor : activeColorSet.textColor }}>
                            3. פסיפס בנטו • כרטיס גיבור 1+2+1
                          </span>
                          {selectedParams.layoutBudget === 'bento_asymmetric' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black" style={{ backgroundColor: brandColor }}>✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          פסיפס בנטו מונחה-משקל: כרטיס גיבור רחב בראש, זוג כרטיסים ופס פעולה תחתון.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          {selectedParams.layoutBudget === 'bento_asymmetric' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* כרטיס 4: בבושקה 2 לפריסות נוספות (קינון היררכי מושלם) */}
                      <div
                        onClick={() => setNavStack(['layout', 'more'])}
                        className="flex-1 min-h-0 rounded-2xl p-3 border border-dashed flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md group relative overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          borderColor: brandColor
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <Icons.Sparkles size={14} style={{ color: brandColor }} />
                            <span className="text-[11.5px] font-black" style={{ color: brandColor }}>
                              עוד 2 פריסות ייחודיות ◀
                            </span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            וילון זכוכית וחפיסת 3D
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          פתח את בבושקת הפריסות המתקדמות: וילון זכוכית צף (Glass Flip) וחפיסת דפדוף 3D קינטית.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          לחץ לפתיחת הפריסות הנוספות ◀
                        </div>
                      </div>
                    </>
                  ) : (
                    /* בבושקה שלב 2 של פריסות: 4 כרטיסים בדיוק */
                    <>
                      {/* אופציה 4: וילון זכוכית צף */}
                      <div
                        onClick={() => handleSelectParam('layoutBudget', 'glass_flip_overlay', 'נבחרה פריסת וילון זכוכית צף 2x2')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.layoutBudget === 'glass_flip_overlay' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.layoutBudget === 'glass_flip_overlay' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.layoutBudget === 'glass_flip_overlay' ? brandColor : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.layoutBudget === 'glass_flip_overlay' ? `0 0 16px -4px ${brandColor}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: selectedParams.layoutBudget === 'glass_flip_overlay' ? brandColor : activeColorSet.textColor }}>
                            4. וילון זכוכית צף • רשת 2x2
                          </span>
                          {selectedParams.layoutBudget === 'glass_flip_overlay' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black" style={{ backgroundColor: brandColor }}>✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          רשת 2x2 ממוקדת שבה נגיעה בכרטיס מרימה וילון זכוכית חצי-שקוף עם התשובה והפעולה.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          {selectedParams.layoutBudget === 'glass_flip_overlay' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* אופציה 5: חפיסת כרטיסים 3D */}
                      <div
                        onClick={() => handleSelectParam('layoutBudget', 'swipe_action_deck', 'נבחרה פריסת חפיסת כרטיסים 3D')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.layoutBudget === 'swipe_action_deck' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.layoutBudget === 'swipe_action_deck' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.layoutBudget === 'swipe_action_deck' ? brandColor : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.layoutBudget === 'swipe_action_deck' ? `0 0 16px -4px ${brandColor}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: selectedParams.layoutBudget === 'swipe_action_deck' ? brandColor : activeColorSet.textColor }}>
                            5. חפיסת כרטיסים 3D • דפדוף קינטי
                          </span>
                          {selectedParams.layoutBudget === 'swipe_action_deck' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black" style={{ backgroundColor: brandColor }}>✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          חפיסת כרטיסים אינטראקטיבית בעומק תלת-ממדי עם דפדוף מהיר ופעולה ישירה במרכז הבמה.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          {selectedParams.layoutBudget === 'swipe_action_deck' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* כרטיס עזר: איפוס לפריסה המקורית של הסגנון */}
                      <div
                        onClick={() => {
                          const def = selectedStyleDef.defaultLayout || 'accordion_morph';
                          handleSelectParam('layoutBudget', def, `הפריסה אופסה לברירת המחדל של ${selectedStyleDef.shortLabel}`);
                        }}
                        className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md"
                        style={{
                          background: isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                          borderColor: isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-black text-amber-300">
                            ↺ אפס לפריסת המקור של הסגנון
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {selectedStyleDef.shortLabel}
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          מחיל מחדש את הפריסה המקורית המומלצת עבור ערכת הצבעים הפעילה.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          אפס פריסה ◀
                        </div>
                      </div>

                      {/* כרטיס חזרה לפריסות הראשיות */}
                      <div
                        onClick={popNav}
                        className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md"
                        style={{
                          background: `${brandColor}12`,
                          borderColor: `${brandColor}40`
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: brandColor }}>
                            חזרה לפריסות הראשיות ◀
                          </span>
                          <Icons.ArrowRight size={14} style={{ color: brandColor }} />
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          חזור ל-3 הפריסות המובילות (אקורדיון, במת זרקור ופסיפס בנטו).
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          חזרה לשלב הקודם ◀
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* רמה 1: בבושקה 2 - סגנון מיתוג ואווירה (מקסימום 4 כרטיסים)        */}
              {/* ───────────────────────────────────────────────────────────── */}
              {currentCategory === 'branding' && (
                <div className="w-full h-full flex flex-col justify-between gap-2 overflow-hidden py-0.5 animate-fadeIn">
                  {!isSubBabushka ? (
                    <>
                      {/* פלטה 1: סייבר ניאון */}
                      <div
                        onClick={() => handleSelectParam('atmosphereTheme', 'cyber_neon', 'נבחר סגנון סייבר ניאון עתידני')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.atmosphereTheme === 'cyber_neon' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.atmosphereTheme === 'cyber_neon' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.atmosphereTheme === 'cyber_neon' ? '#00F0FF' : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.atmosphereTheme === 'cyber_neon' ? '0 0 16px -4px #00F0FF' : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#00F0FF]" />
                            <span className="text-[11.5px] font-black" style={{ color: selectedParams.atmosphereTheme === 'cyber_neon' ? '#00F0FF' : activeColorSet.textColor }}>
                              1. סייבר ניאון (Cyber Neon)
                            </span>
                          </div>
                          {selectedParams.atmosphereTheme === 'cyber_neon' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black bg-[#00F0FF]">✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          גווני ציאן עתידניים, הילות טכנולוגיות וזכוכית כהה. מושלם ל-SaaS וטכנולוגיה.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: '#00F0FF' }}>
                          {selectedParams.atmosphereTheme === 'cyber_neon' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* פלטה 2: יוקרה שקטה */}
                      <div
                        onClick={() => handleSelectParam('atmosphereTheme', 'luxury_gold', 'נבחר סגנון יוקרה שקטה זהב')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.atmosphereTheme === 'luxury_gold' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.atmosphereTheme === 'luxury_gold' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.atmosphereTheme === 'luxury_gold' ? '#EAB308' : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.atmosphereTheme === 'luxury_gold' ? '0 0 16px -4px #EAB308' : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
                            <span className="text-[11.5px] font-black" style={{ color: selectedParams.atmosphereTheme === 'luxury_gold' ? '#EAB308' : activeColorSet.textColor }}>
                              2. יוקרה שקטה (Stealth Gold)
                            </span>
                          </div>
                          {selectedParams.atmosphereTheme === 'luxury_gold' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black bg-[#EAB308]">✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          גווני זהב מעודנים, עומק שחור יוקרתי ואלגנטיות שקטה לקהל פרימיום.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: '#EAB308' }}>
                          {selectedParams.atmosphereTheme === 'luxury_gold' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* פלטה 3: הייטק אקזקוטיב */}
                      <div
                        onClick={() => handleSelectParam('atmosphereTheme', 'executive_slate', 'נבחר סגנון הייטק אקזקוטיב')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.atmosphereTheme === 'executive_slate' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.atmosphereTheme === 'executive_slate' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.atmosphereTheme === 'executive_slate' ? '#38BDF8' : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.atmosphereTheme === 'executive_slate' ? '0 0 16px -4px #38BDF8' : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#38BDF8]" />
                            <span className="text-[11.5px] font-black" style={{ color: selectedParams.atmosphereTheme === 'executive_slate' ? '#38BDF8' : activeColorSet.textColor }}>
                              3. הייטק אקזקוטיב (Executive Slate)
                            </span>
                          </div>
                          {selectedParams.atmosphereTheme === 'executive_slate' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black bg-[#38BDF8]">✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          גווני כחול שמיים וסלייט עסקי. מראה נקי, מהימן ותוצאתי להנהלה בכירה.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: '#38BDF8' }}>
                          {selectedParams.atmosphereTheme === 'executive_slate' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* כרטיס 4: בבושקה 2 לפלטות נוספות ותאורה */}
                      <div
                        onClick={() => setNavStack(['branding', 'more'])}
                        className="flex-1 min-h-0 rounded-2xl p-3 border border-dashed flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md group relative overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          borderColor: brandColor
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <Icons.SunMoon size={14} style={{ color: brandColor }} />
                            <span className="text-[11.5px] font-black" style={{ color: brandColor }}>
                              פלטות נוספות ומצב יום/לילה ◀
                            </span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            אמרלד, ולווט ותאורה
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          שלווה טבעית (Emerald), ולווט קינטי (Rose), החלפת יום/לילה וחילוץ אוטומטי מהלוגו.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          פתח בבושקת מיתוג מתקדמת ◀
                        </div>
                      </div>
                    </>
                  ) : (
                    /* בבושקה שלב 2 של מיתוג: 4 כרטיסים בדיוק */
                    <>
                      {/* פלטה 4: שלווה טבעית */}
                      <div
                        onClick={() => handleSelectParam('atmosphereTheme', 'emerald_calm', 'נבחר סגנון שלווה טבעית ואמרלד')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.atmosphereTheme === 'emerald_calm' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.atmosphereTheme === 'emerald_calm' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.atmosphereTheme === 'emerald_calm' ? '#10B981' : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.atmosphereTheme === 'emerald_calm' ? '0 0 16px -4px #10B981' : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                            <span className="text-[11.5px] font-black" style={{ color: selectedParams.atmosphereTheme === 'emerald_calm' ? '#10B981' : activeColorSet.textColor }}>
                              4. שלווה טבעית (Emerald Calm)
                            </span>
                          </div>
                          {selectedParams.atmosphereTheme === 'emerald_calm' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black bg-[#10B981]">✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          גווני ירוק אמרלד מרגיעים, חיבור לטבע ואיזון. מיועד לקליניקות ובריאות.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: '#10B981' }}>
                          {selectedParams.atmosphereTheme === 'emerald_calm' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* פלטה 5: ולווט קינטי */}
                      <div
                        onClick={() => handleSelectParam('atmosphereTheme', 'rose_kinetic', 'נבחר סגנון ולווט קינטי ורדרד')}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          selectedParams.atmosphereTheme === 'rose_kinetic' ? 'ring-2' : ''
                        }`}
                        style={{
                          background: selectedParams.atmosphereTheme === 'rose_kinetic' ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: selectedParams.atmosphereTheme === 'rose_kinetic' ? '#EC4899' : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: selectedParams.atmosphereTheme === 'rose_kinetic' ? '0 0 16px -4px #EC4899' : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#EC4899]" />
                            <span className="text-[11.5px] font-black" style={{ color: selectedParams.atmosphereTheme === 'rose_kinetic' ? '#EC4899' : activeColorSet.textColor }}>
                              5. ולווט קינטי (Rose Kinetic)
                            </span>
                          </div>
                          {selectedParams.atmosphereTheme === 'rose_kinetic' && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black bg-[#EC4899]">✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          גווני ורוד פנינה ופוקסיה אנרגטיים. מושלם ליופי, אסתטיקה ואיקומרס.
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: '#EC4899' }}>
                          {selectedParams.atmosphereTheme === 'rose_kinetic' ? 'פעיל כעת' : 'לחץ להפעלה'}
                        </div>
                      </div>

                      {/* כרטיס תאורה: מצב יום / לילה */}
                      <div
                        onClick={() => {
                          const newMode = isDayMode ? 'night' : 'day';
                          handleSelectParam('colorMode', newMode, `הוחלף למצב ${newMode === 'day' ? 'יום (בהיר)' : 'לילה (כהה)'}`);
                        }}
                        className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md"
                        style={{
                          background: isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                          borderColor: brandColor
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            {isDayMode ? <Icons.Sun size={15} className="text-amber-400" /> : <Icons.Moon size={15} className="text-cyan-300" />}
                            <span className="text-[11.5px] font-black" style={{ color: activeColorSet.textColor }}>
                              תאורה: {isDayMode ? 'מצב יום (Light)' : 'מצב לילה (Dark)'}
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/10" style={{ color: brandColor }}>
                            החלף עכשיו ◀
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          {isDayMode ? 'כרגע פועל ברקע בהיר עם ניגודיות גבוהה. לחץ למעבר למצב לילה כהה.' : 'כרגע פועל ברקע כהה עם הילות ניאון. לחץ למעבר למצב יום בהיר.'}
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          לחץ להחלפה מיידית בין יום ללילה ◀
                        </div>
                      </div>

                      {/* כרטיס חילוץ אוטומטי מהלוגו ע״י AI */}
                      <div
                        onClick={handleExtractFromLogo}
                        className="flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md"
                        style={{
                          background: 'rgba(168,85,247,0.1)',
                          borderColor: 'rgba(168,85,247,0.4)'
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <Icons.Wand2 size={14} className="text-purple-300" />
                            <span className="text-[11.5px] font-black text-purple-200">
                              חילוץ פלטה אוטומטי מלוגו המותג
                            </span>
                          </div>
                          <span className="text-[8.5px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                            AI Logo
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight my-auto text-purple-200/80">
                          סורק את הלוגו של הטננט, מחלץ את הגוונים הדומיננטיים ובונה ערכת צבעים מותאמת אישית.
                        </p>
                        <div className="text-[8.5px] font-bold text-start text-purple-300">
                          הפעל חילוץ צבעים עכשיו ◀
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* רמה 1: בבושקה 3 - כוונת המשפך העסקי (בדיוק 4 כרטיסים)          */}
              {/* ───────────────────────────────────────────────────────────── */}
              {currentCategory === 'intent' && (
                <div className="w-full h-full flex flex-col justify-between gap-2 overflow-hidden py-0.5 animate-fadeIn">
                  {Object.entries(intentTitles).map(([key, item]) => {
                    const isSelected = selectedParams.intentGoal === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectParam('intentGoal', key, `כוונת המשפך עודכנה ל-${item.title}`)}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          background: isSelected ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: isSelected ? brandColor : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: isSelected ? `0 0 16px -4px ${brandColor}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: isSelected ? brandColor : activeColorSet.textColor }}>
                            {item.title}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black" style={{ backgroundColor: brandColor }}>✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          {item.desc}
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          {isSelected ? 'יעד נבחר פעיל' : 'לחץ לבחירת יעד זה ◀'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* רמה 1: בבושקה 4 - שפת המותג וטון השיחה (בדיוק 4 כרטיסים)       */}
              {/* ───────────────────────────────────────────────────────────── */}
              {currentCategory === 'tone' && (
                <div className="w-full h-full flex flex-col justify-between gap-2 overflow-hidden py-0.5 animate-fadeIn">
                  {Object.entries(toneTitles).map(([key, item]) => {
                    const isSelected = selectedParams.languageStyle === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectParam('languageStyle', key, `טון השיחה עודכן ל-${item.title}`)}
                        className={`flex-1 min-h-0 rounded-2xl p-3 border flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all shadow-md relative overflow-hidden ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          background: isSelected ? activeColorSet.cardBg : (isDayMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
                          borderColor: isSelected ? brandColor : (isDayMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'),
                          boxShadow: isSelected ? `0 0 16px -4px ${brandColor}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11.5px] font-black" style={{ color: isSelected ? brandColor : activeColorSet.textColor }}>
                            {item.title}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black" style={{ backgroundColor: brandColor }}>✓</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight my-auto" style={{ color: activeColorSet.secondaryText }}>
                          {item.desc}
                        </p>
                        <div className="text-[8.5px] font-bold text-start" style={{ color: brandColor }}>
                          {isSelected ? 'טון נבחר פעיל' : 'לחץ לבחירת סגנון זה ◀'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 4. סרגל פעולה תחתון: כפתורי אייקון קומפקטיים עם טולטיפים עסקיים   */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="w-full pt-2.5 border-t border-white/10 flex items-center justify-between shrink-0">
              
              {/* כפתור סוכן AI */}
              <button
                type="button"
                onClick={handleTriggerAiAdaptation}
                disabled={isAiAdapting}
                title={getTerminology('owner_btn_tooltip_ai', marketType)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] font-bold active:scale-95 transition-all shadow-md"
              >
                {isAiAdapting ? <Icons.Loader2 size={13} className="animate-spin" /> : <Icons.Sparkles size={13} />}
                <span>התאמת AI לעסק</span>
              </button>

              <div className="flex items-center gap-2">
                {/* כפתור ביטול / שחזור */}
                <button
                  type="button"
                  onClick={handleUndo}
                  title={getTerminology('owner_btn_tooltip_revert', marketType)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all"
                >
                  <Icons.RotateCcw size={15} />
                </button>

                {/* כפתור תצוגה מקדימה */}
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  title={getTerminology('owner_btn_tooltip_preview', marketType)}
                  className="w-9 h-9 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 active:scale-90 transition-all relative"
                >
                  <Icons.Eye size={15} />
                  {hasChanges && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>

                {/* כפתור אישור ושמירה קבועה */}
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  title={getTerminology('owner_btn_tooltip_save', marketType)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs active:scale-95 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer"
                >
                  {isSaving ? <Icons.Loader2 size={14} className="animate-spin" /> : <Icons.Check size={14} />}
                  <span>פרסם באתר חי</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
