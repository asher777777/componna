import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { QuestionPageEditorProps, QuestionPageData, QuestionPageStyleConfig, QuestionCardItem } from './types';
import { QuestionPageView } from './QuestionPageView';

/**
 * 👑 QuestionPageEditor
 * פאנל עריכה מונחה שרת בכרטיסי שאלות מונחות עבור עמוד השאלות ב-KOSUN 2026.
 * חוקי ברזל:
 * 1. מיזעור פעולות עיצוב ידניות (Zero Cognitive Load).
 * 2. בחירות מונחות בכרטיסים עסקיים (Business Goal, Server Atmosphere Preset).
 * 3. תצוגה מקדימה חיה (Live Preview) בתוך מסגרת 9:16 של קושאן.
 * 4. עריכת תוכן שאלות מהירה ללא צורך בהגדרות טכניות.
 */
export const QuestionPageEditor: React.FC<QuestionPageEditorProps> = ({
  isOpen,
  onClose,
  initialData,
  initialStyle = {},
  archetypeId = 'saas',
  tenantProfile,
  onSave,
}) => {
  if (!isOpen) return null;

  const brandColor = initialStyle.primaryColor || tenantProfile?.themeColors?.primary || '#00F0FF';

  // State תוכן
  const [data, setData] = useState<QuestionPageData>({
    mainQuestion: initialData.mainQuestion || 'איך שיטת The Big 3 מייצרת שקט נפשי ו-100% ביצוע?',
    mainAnswer: initialData.mainAnswer || 'השיטה מבוססת על צמצום קוגניטיבי ממוקד: בחירה של 3 משימות מפתח ביום ופירוקן לפעולות של 15 דקות.',
    categoryTitle: initialData.categoryTitle || 'עקרונות פרודוקטיביות',
    relatedQuestions: initialData.relatedQuestions && initialData.relatedQuestions.length >= 3 
      ? initialData.relatedQuestions 
      : [
          { id: 'q1', question: 'איך מתמודדים כשמגיעה משימה דחופה באמצע היום?', icon: 'AlertTriangle', category: 'ניהול עומס ישיר' },
          { id: 'q2', question: 'האם המערכת מבצעת תמלול קולי אוטומטי בעברית?', icon: 'Mic', category: 'טכנולוגיה ויתרון' },
          { id: 'q3', question: 'צפה בחבילות ומסלולי KOSUN 2026 ושריין מקום', icon: 'Layers', category: 'לכל החבילות ◀', isRecommended: true, intentGoal: 'intent_conversion' }
        ]
  });

  // State סגנון שרת מוגדר מראש
  const [selectedGoal, setSelectedGoal] = useState<'conversion' | 'authority' | 'trust' | 'retention'>('conversion');
  const [selectedStylePreset, setSelectedStylePreset] = useState<'cyber_neon' | 'luxury_gold' | 'executive_slate' | 'emerald_calm'>('cyber_neon');
  const [activeTab, setActiveTab] = useState<'guided_cards' | 'content_qa'>('guided_cards');
  const [isSaving, setIsSaving] = useState(false);

  // כרטיסי שאלות מונחות 1: מטרת על עסקית
  const goalDecisionCards = [
    {
      id: 'conversion',
      title: 'הנעה לפעולה ורכישה',
      desc: 'משפך שמכוון את השואל לסגירת עסקה, רכישת חבילה או השארת פרטים מיידית',
      icon: Icons.Target,
      badge: 'מומלץ לעסקים',
      color: '#00F0FF'
    },
    {
      id: 'authority',
      title: 'העמקת סמכות ומומחיות',
      desc: 'הסבר יסודי על המתודולוגיה והערך המקצועי לביסוס מובילות שוק ללא לחץ מכירתי',
      icon: Icons.ShieldCheck,
      badge: 'מיתוג יוקרתי',
      color: '#8B5CF6'
    },
    {
      id: 'trust',
      title: 'בניית אמון והסרת חסמים',
      desc: 'מענה שקוף על שאלות נפוצות, בטיחות, ביטחון ואמינות המותג',
      icon: Icons.HeartHandshake,
      badge: 'הסרת ספקות',
      color: '#10B981'
    },
    {
      id: 'retention',
      title: 'הדרכה והצלחת לקוח',
      desc: 'מתן ערך וטיפים מעשיים ללקוחות קיימים לחיזוק שביעות הרצון והשימוש',
      icon: Icons.Zap,
      badge: 'חיזוק נאמנות',
      color: '#F59E0B'
    }
  ];

  // כרטיסי שאלות מונחות 2: בחירת סגנון אטמוספרי מהשרת (ללא התעסקות בצבעים)
  const serverAtmosphereCards = [
    {
      id: 'cyber_neon',
      title: 'קושאן סייבר ניאון (Cyber Neon)',
      desc: 'רקע שחור עמוק, הילות ציאן זוהרות ואווירה טכנולוגית עתידנית',
      color: '#00F0FF',
      themeProps: { primaryColor: '#00F0FF' }
    },
    {
      id: 'luxury_gold',
      title: 'יוקרה ואלגנטיות (Stealth Gold)',
      desc: 'גווני שחור פחם, נגיעות זהב עדינות ואווירת פרימיום מאופקת',
      color: '#EAB308',
      themeProps: { primaryColor: '#EAB308' }
    },
    {
      id: 'executive_slate',
      title: 'הנהלה נקייה (Executive Slate)',
      desc: 'כחול נייבי עמוק, זכוכית מעושנת וקווים חדים ומדויקים',
      color: '#3B82F6',
      themeProps: { primaryColor: '#3B82F6' }
    },
    {
      id: 'emerald_calm',
      title: 'שלווה וטבעיות (Emerald Calm)',
      desc: 'גווני אמרלד מרגיעים, שקט קוגניטיבי ותחושת ביטחון',
      color: '#10B981',
      themeProps: { primaryColor: '#10B981' }
    }
  ];

  const handleCardContentChange = (index: number, newQuestionText: string) => {
    const updated = [...data.relatedQuestions];
    updated[index] = { ...updated[index], question: newQuestionText };
    setData({ ...data, relatedQuestions: updated });
  };

  const handleApply = async () => {
    setIsSaving(true);
    try {
      const activePreset = serverAtmosphereCards.find(c => c.id === selectedStylePreset);
      const updatedStyle: QuestionPageStyleConfig = {
        ...initialStyle,
        primaryColor: activePreset?.color || brandColor
      };
      await onSave(data, updatedStyle);
      onClose();
    } catch (e) {
      console.error('Error applying question page edits:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn" dir="rtl">
      <div className="w-full max-w-6xl h-[92vh] max-h-[920px] bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* כפתור סגירה */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 z-30 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <Icons.X size={16} />
        </button>

        {/* ─── פאנל עריכה שמאלי מונחה-שאלות (60% רוחב) ─── */}
        <div className="w-full md:w-3/5 h-full flex flex-col justify-between p-4 sm:p-6 overflow-y-auto border-b md:border-b-0 md:border-e border-white/10">
          
          <div className="shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-7 h-7 rounded-xl flex items-center justify-center text-black font-black"
                style={{ backgroundColor: brandColor }}
              >
                <Icons.HelpCircle size={16} />
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                עורך עמוד השאלות • מונחה שרת וכרטיסים
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              בחר כרטיסי החלטה מונחים והשרת יתאים את הארנה והמשפך אוטומטית, ללא מאמץ עיצובי מצידך.
            </p>

            {/* טאבים מהירים */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab('guided_cards')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'guided_cards' 
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Sparkles size={13} />
                <span>החלטות מונחות (מטרה וסגנון)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('content_qa')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'content_qa' 
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icons.FileText size={13} />
                <span>עריכת תוכן השאלות</span>
              </button>
            </div>
          </div>

          {/* תוכן הטאב הפעיל */}
          <div className="flex-1 my-4 overflow-y-auto pe-1">
            
            {/* טאב 1: החלטות מונחות בכרטיסים (Guided Decisions) */}
            {activeTab === 'guided_cards' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white mb-2 block">
                    מה המטרה העסקית המובילה של עמוד השאלות?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {goalDecisionCards.map((g) => {
                      const isSelected = selectedGoal === g.id;
                      const Icon = g.icon;
                      return (
                        <div
                          key={g.id}
                          onClick={() => setSelectedGoal(g.id as any)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'bg-white/10 border-cyan-400 shadow-md shadow-cyan-500/20'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div 
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: `${g.color}30`, color: g.color }}
                            >
                              <Icon size={14} />
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {g.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mb-1">{g.title}</h4>
                          <p className="text-[10.5px] text-slate-400 leading-snug">{g.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <label className="text-xs font-bold text-white mb-2 block">
                    בחר סגנון אטמוספרי מוגדר מראש מהשרת:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {serverAtmosphereCards.map((s) => {
                      const isSelected = selectedStylePreset === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedStylePreset(s.id as any)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white/10 border-cyan-400 shadow-sm'
                              : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                            <h5 className="text-[11px] font-bold text-white">{s.title}</h5>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{s.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* טאב 2: עריכת תוכן השאלות (Content Q&A) */}
            {activeTab === 'content_qa' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white mb-1.5 block">
                    כותרת הקטגוריה:
                  </label>
                  <input
                    type="text"
                    value={data.categoryTitle || ''}
                    onChange={(e) => setData({ ...data, categoryTitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white mb-1.5 block">
                    השאלה המרכזית (בכרטיס העליון):
                  </label>
                  <input
                    type="text"
                    value={data.mainQuestion}
                    onChange={(e) => setData({ ...data, mainQuestion: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white mb-1.5 block">
                    התשובה המלאה (בכרטיס העליון):
                  </label>
                  <textarea
                    rows={4}
                    value={data.mainAnswer}
                    onChange={(e) => setData({ ...data, mainAnswer: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    3 שאלות המשך (בכרטיסים המונמכים):
                  </label>
                  {data.relatedQuestions.slice(0, 3).map((item, idx) => (
                    <div key={item.id || idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-cyan-300 font-bold block mb-1">
                        כרטיס {idx + 1} {idx === 2 ? '• הנעה לפעולה (מומלץ)' : ''}
                      </span>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => handleCardContentChange(idx, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* כפתור אישור והחלת שינויים */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
            <span className="text-[10.5px] text-slate-400">
              השינויים נשמרים לשרת ומעודכנים מיידית
            </span>
            <button
              type="button"
              onClick={handleApply}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-black text-xs transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              {isSaving ? <Icons.Loader2 size={14} className="animate-spin" /> : <Icons.Check size={14} />}
              <span>החל שינויים בעמוד</span>
            </button>
          </div>

        </div>

        {/* ─── פאנל תצוגה מקדימה חיה ימני (40% רוחב) ─── */}
        <div className="w-full md:w-2/5 h-full bg-black/60 p-4 flex flex-col items-center justify-center relative select-none">
          <div className="flex items-center gap-1.5 mb-2 text-slate-400 text-[10px] font-mono">
            <Icons.Eye size={12} className="text-cyan-400" />
            <span>תצוגה מקדימה חיה • תקציב Zero Scroll</span>
          </div>

          {/* מסגרת 9:16 של קושאן */}
          <div className="w-full max-w-[340px] h-[520px] max-h-[85%] rounded-3xl border border-white/15 bg-slate-950 p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <QuestionPageView
              data={data}
              styleConfig={{
                primaryColor: serverAtmosphereCards.find(c => c.id === selectedStylePreset)?.color || brandColor
              }}
              archetypeId={archetypeId}
              tenantProfile={tenantProfile}
              onSelectRelatedQuestion={(item) => setData({ ...data, mainQuestion: item.question })}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
