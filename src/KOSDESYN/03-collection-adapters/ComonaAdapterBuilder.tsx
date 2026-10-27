import React, { useState, useEffect } from 'react';
import {
  Database,
  Filter,
  Sliders,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { kosunDb, comonaDb } from '../../src/lib/firebase';
import { ComonaAdapterConfig, FirestoreFilterOperator, FirebaseTargetProject } from './types';

// קולקציות מוכרות ומהירות
const PRESET_COLLECTIONS: Record<FirebaseTargetProject, Array<{ id: string; label: string; desc: string }>> = {
  comona: [
    { id: 'tenants', label: 'רשימת טננטים (Tenants)', desc: 'דיירים, עסקים ומותגים רשומים' },
    { id: 'todayTasks', label: 'משימות יומיות (todayTasks)', desc: 'משימות ופעולות של היום' },
    { id: 'inbox', label: 'תיבת נכנסת (inbox)', desc: 'רעיונות ומשימות גולמיות' },
    { id: 'archetype_presets', label: 'סגנונות עיצוב (archetype_presets)', desc: 'ערכות נושא בענן' },
    { id: 'custom', label: '✏️ קולקציה מותאמת אישית...', desc: 'הקלד נתיב מלא חופשי' }
  ],
  kosun: [
    { id: 'archetype_presets', label: 'קולקציית עיצוב קושאן (archetype_presets)', desc: 'סגנונות מקומיים' },
    { id: 'todayTasks', label: 'משימות קושאן (todayTasks)', desc: 'משימות מקומיות' },
    { id: 'brandDna', label: 'DNA מיתוג (brandDna)', desc: 'הגדרות צבעים ומותג' },
    { id: 'custom', label: '✏️ קולקציה מותאמת אישית...', desc: 'הקלד נתיב מלא חופשי' }
  ]
};

// שדות UI פופולריים שכל רכיב צריך
const UI_TARGET_SLOTS = [
  { key: 'titleField', label: 'כותרת ראשית (Title)', icon: '📝', required: true, hint: 'מה הטקסט הבולט בכרטיס' },
  { key: 'subtitleField', label: 'כותרת משנה (Subtitle)', icon: '💬', required: false, hint: 'פירוט קצר מתחת לכותרת' },
  { key: 'badgeTextField', label: 'תגית / סטטוס (Badge)', icon: '🏷️', required: false, hint: 'תג צף בצד (למשל: דחוף, פעיל)' },
  { key: 'iconField', label: 'אייקון (Icon)', icon: '🎨', required: false, hint: 'שם אייקון או תמונת אווטאר' },
  { key: 'actionTypeField', label: 'סוג פעולה (ActionType)', icon: '⚡', required: false, hint: 'מה יקרה בלחיצה על הפריט' }
];

export interface ComonaAdapterBuilderProps {
  config: ComonaAdapterConfig;
  onChange: (updated: ComonaAdapterConfig) => void;
  onTestDispatchedAction?: (actionKey: string, payload?: any) => void;
}

export const ComonaAdapterBuilder: React.FC<ComonaAdapterBuilderProps> = ({
  config,
  onChange,
  onTestDispatchedAction
}) => {
  const currentTargetProject: FirebaseTargetProject = config.targetProject || 'comona';

  // State לגילוי שדות אוטומטי
  const [discoveredFields, setDiscoveredFields] = useState<string[]>([]);
  const [sampleDoc, setSampleDoc] = useState<Record<string, any> | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // מנהל אירועים - פעולות רשומות
  const [testActionPayload, setTestActionPayload] = useState<string>('{"source": "adapter_ui_test"}');

  // סריקה אוטומטית של שדות בכל שינוי קולקציה או פרויקט
  const scanCollectionFields = async (targetProj: FirebaseTargetProject, path: string) => {
    if (!path || path === 'custom') return;
    setIsScanning(true);
    setScanError(null);

    try {
      const activeDb = targetProj === 'comona' ? comonaDb : kosunDb;
      const colRef = collection(activeDb, path);
      const q = query(colRef, limit(1));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firstDoc = snap.docs[0].data();
        setSampleDoc(firstDoc);
        const keys = Object.keys(firstDoc).filter(k => typeof firstDoc[k] !== 'object' || firstDoc[k] === null);
        setDiscoveredFields(keys);

        // 🪄 קסם לילדים: מיפוי אוטומטי חכם אם השדות עדיין ריקים!
        const autoMap: Record<string, string> = { ...config.fieldMapping };
        if (!autoMap.titleField) {
          const titleCandidate = keys.find(k => ['title', 'name', 'label', 'taskName', 'productName', 'headline'].includes(k));
          if (titleCandidate) autoMap.titleField = titleCandidate;
        }
        if (!autoMap.subtitleField) {
          const subCandidate = keys.find(k => ['subtitle', 'description', 'desc', 'category', 'note', 'email'].includes(k));
          if (subCandidate) autoMap.subtitleField = subCandidate;
        }
        if (!autoMap.iconField) {
          const iconCandidate = keys.find(k => ['icon', 'iconName', 'primaryIcon', 'avatar', 'avatarUrl'].includes(k));
          if (iconCandidate) autoMap.iconField = iconCandidate;
        }
        if (!autoMap.badgeTextField) {
          const badgeCandidate = keys.find(k => ['badge', 'badgeText', 'status', 'priorityIndex', 'tag'].includes(k));
          if (badgeCandidate) autoMap.badgeTextField = badgeCandidate;
        }
        onChange({ ...config, targetProject: targetProj, collectionPath: path, fieldMapping: autoMap as any });
      } else {
        setSampleDoc(null);
        setDiscoveredFields(['title', 'subtitle', 'icon', 'status', 'createdAt']);
      }
    } catch (e: any) {
      console.warn('[FieldScanner] Failed to scan collection:', e);
      setScanError(e.message);
      setDiscoveredFields(['title', 'subtitle', 'icon', 'status']);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanCollectionFields(currentTargetProject, config.collectionPath);
  }, [currentTargetProject, config.collectionPath]);

  // עדכוני עזר
  const setTargetProject = (proj: FirebaseTargetProject) => {
    const defaultCol = PRESET_COLLECTIONS[proj][0].id;
    onChange({ ...config, targetProject: proj, collectionPath: defaultCol });
  };

  const handleUpdateMapping = (slotKey: string, fieldName: string) => {
    onChange({
      ...config,
      fieldMapping: {
        ...config.fieldMapping,
        [slotKey]: fieldName
      }
    });
  };

  return (
    <div dir="rtl" className="space-y-6 text-xs font-sans text-right">
      
      {/* 🚀 שלב 1 (בחירת פרויקט): מתג פרויקט ענק וברור */}
      <div className="p-5 rounded-3xl bg-[#111827] border border-slate-700/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs border border-cyan-500/30">
              1
            </span>
            <span className="font-extrabold text-white text-sm">בחר מאיזה פרויקט פיירבייס לשאוב נתונים:</span>
          </div>
          <span className="text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono">
            Dual Firebase Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* כפתור פרויקט COMONA */}
          <button
            type="button"
            onClick={() => setTargetProject('comona')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              currentTargetProject === 'comona'
                ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                : 'bg-black/30 border-white/5 hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span>🟢</span>
                <span>פרויקט קמונה (glowmanage)</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-1">מסד הנתונים של הלקוחות, משימות ודיירים</p>
            </div>
            {currentTargetProject === 'comona' && (
              <CheckCircle2 size={18} className="text-emerald-400" />
            )}
          </button>

          {/* כפתור פרויקט KOSUN */}
          <button
            type="button"
            onClick={() => setTargetProject('kosun')}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              currentTargetProject === 'kosun'
                ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                : 'bg-black/30 border-white/5 hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span>🔵</span>
                <span>פרויקט קושאן (gen-lang-client)</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-1">סגנונות העיצוב, הגדרות מקומיות ו-Presets</p>
            </div>
            {currentTargetProject === 'kosun' && (
              <CheckCircle2 size={18} className="text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* 📁 שלב 2: בחירת קולקציה בקליק אחד */}
      <div className="p-5 rounded-3xl bg-[#111827] border border-slate-700/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/30">
              2
            </span>
            <span className="font-extrabold text-white text-sm">בחר קולקציה:</span>
          </div>
          {isScanning && (
            <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1 font-mono">
              <RefreshCw size={12} className="animate-spin" /> סורק מסמך לדוגמה...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {PRESET_COLLECTIONS[currentTargetProject].map((col) => {
            const isSelected = config.collectionPath === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => onChange({ ...config, collectionPath: col.id })}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10'
                    : 'bg-black/30 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white text-xs">{col.label}</span>
                  {isSelected && <CheckCircle2 size={15} className="text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-300 mt-1 font-mono truncate">{col.desc}</span>
              </button>
            );
          })}
        </div>

        {/* שדה הזנה ידנית אם בחר custom */}
        {config.collectionPath === 'custom' && (
          <div className="pt-2">
            <label className="text-[11px] text-amber-300 font-bold mb-1 block">הקלד נתיב קולקציה מדויק (Custom Path):</label>
            <input
              type="text"
              placeholder="למשל: tenants/vip-store/products או users"
              onChange={(e) => onChange({ ...config, collectionPath: e.target.value })}
              className="w-full bg-[#0f172a] border border-amber-500/40 focus:border-amber-400 rounded-xl p-3 text-xs text-white outline-none font-mono"
            />
          </div>
        )}
      </div>

      {/* 🪄 שלב 3: התאמת שדות "שגם ילד קטן יכול" (One-Click Pills) */}
      <div className="p-5 rounded-3xl bg-[#111827] border border-slate-700/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
              3
            </span>
            <div>
              <span className="font-extrabold text-white text-sm">התאמת שדות ל-UI בלחיצה אחת:</span>
              <p className="text-[11px] text-slate-200">לחץ על השדה שנמצא במסמך כדי לשדך אותו לאלמנט ב-UI</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800">
            {discoveredFields.length} שדות זוהו במסמך
          </span>
        </div>

        {/* שורת השדות הזמינים שנמצאו במסמך האמיתי */}
        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-2">
          <span className="text-[10px] font-bold text-slate-100 block">שדות שקיימים כרגע במסמכים בקולקציה זו:</span>
          <div className="flex flex-wrap gap-1.5">
            {discoveredFields.map((field) => (
              <span
                key={field}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono border border-cyan-800/40 select-all"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* חריצי ה-UI להתאמה */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {UI_TARGET_SLOTS.map((slot) => {
            const currentSelectedField = (config.fieldMapping as any)[slot.key] || '';

            return (
              <div key={slot.key} className="p-3.5 rounded-2xl bg-[#1f2937] border border-white/10 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{slot.icon}</span>
                      <span>{slot.label}</span>
                      {slot.required && <span className="text-rose-400">*</span>}
                    </span>
                    <span className="text-[10px] text-slate-300">{slot.hint}</span>
                  </div>

                  {/* כפתורי Pills מהירים לבחירה מבין השדות שנסרקו */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {discoveredFields.map((df) => {
                      const isChosen = currentSelectedField === df;
                      return (
                        <button
                          key={df}
                          type="button"
                          onClick={() => handleUpdateMapping(slot.key, df)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-emerald-500 text-black font-extrabold shadow-sm shadow-emerald-500/40'
                              : 'bg-white/5 text-white font-medium hover:bg-white/15'
                          }`}
                        >
                          {df}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* שדה הזנה חופשי לגיבוי */}
                <input
                  type="text"
                  value={currentSelectedField}
                  onChange={(e) => handleUpdateMapping(slot.key, e.target.value)}
                  placeholder="הקלד שם שדה ידנית..."
                  className="w-full bg-[#0f172a] border border-white/10 focus:border-emerald-400 rounded-lg p-1.5 text-[11px] text-white font-mono outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ⚡ שלב 4: מנהל האירועים והפעולות (Action Registry Visualizer) */}
      <div className="p-5 rounded-3xl bg-[#111827] border border-slate-700/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs border border-purple-500/30">
              4
            </span>
            <div>
              <span className="font-extrabold text-white text-sm">מנהל אירועים ופקודות (Action Registry Simulator):</span>
              <p className="text-[11px] text-slate-200">בדוק בלחיצה מה קורה כאשר נשלח אירוע מקומפוננטת ה-UI לפרויקט קמונה</p>
            </div>
          </div>
          <span className="text-[10px] bg-purple-950 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800">
            Event Dispatcher
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { action: 'VIEW_KOSUNS', label: 'צפייה בקושאנים', desc: 'פותח מסך צפייה בקושאנים של הטננט' },
            { action: 'OPEN_LEARNING', label: 'לימוד והעשרה', desc: 'מפנה לספריית הלימוד' },
            { action: 'CREATE_EDIT', label: 'יצירה ועריכה', desc: 'פותח מסך עריכת מוצר חדש' }
          ].map((act) => (
            <button
              key={act.action}
              type="button"
              onClick={() => onTestDispatchedAction?.(act.action, JSON.parse(testActionPayload || '{}'))}
              className="p-3 rounded-2xl bg-black/40 hover:bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/60 text-right transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs group-hover:text-purple-300">{act.label}</span>
                <Zap size={14} className="text-purple-400 group-hover:scale-125 transition-transform" />
              </div>
              <span className="text-[10px] font-mono text-purple-400 block mt-1">[{act.action}]</span>
              <p className="text-[10px] text-slate-300 mt-1">{act.desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
