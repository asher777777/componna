import React, { useState } from 'react';
import {
  Layers,
  Code2,
  Sparkles,
  ChevronLeft,
  Eye,
  Sliders,
  Copy,
  Check,
  Palette,
  Database,
  Play,
} from 'lucide-react';
import {
  KosActionMenuSheet,
  KosActionItem,
  KosUserProfile,
  KosCloudStoreIconPicker,
} from '../components/action-menu';
import {
  ComonaAdapterBuilder,
  ComonaConnectedActionMenu,
  ComonaAdapterConfig,
} from '../adapters';
import { KosCognitivePortal } from '../components/action-portal/cognitive-portal/KosCognitivePortal';
import { ArchetypeProvider } from '../theme/ArchetypeEngine';

interface ComponentDoc {
  id: string;
  name: string;
  category: 'Navigation & Docks' | 'Menus & Sheets' | 'Forms & Inputs' | 'AI & Chat' | 'Lists & Cards';
  status: 'Ready' | 'In Progress' | 'Planned';
  description: string;
  schemaExample: string;
  propsDoc: Array<{ name: string; type: string; description: string }>;
}

const CATALOG: ComponentDoc[] = [
  {
    id: 'KosCognitivePortal',
    name: 'KosCognitivePortal (פורטל קוגניטיבי רב-טננטי 2026)',
    category: 'Lists & Cards',
    status: 'Ready',
    description: 'מערכת KOSUN מלאה המחוברת בזמן אמת ל-Firestore. כוללת את עמוד הבית, עמוד חקר שאילתות The Big 3, בורר יום/לילה, קפסולת AI עליונה, ומרכז ניהול בעל עסק.',
    schemaExample: `<KosCognitivePortal
  tenantId="kosun"
  targetProject="comona"
  defaultAudience="guest"
/>`,
    propsDoc: [
      { name: 'tenantId', type: 'string', description: 'מזהה הטננט (kosun / turbo_motors)' },
      { name: 'targetProject', type: '"comona" | "kosun"', description: 'פרויקט ה-DB' },
      { name: 'defaultAudience', type: '"guest" | "owner"', description: 'מצב אורח / בעל עסק' },
    ],
  },
  {
    id: 'KosActionMenuSheet',
    name: 'KosActionMenuSheet (תפריט פעולות ואקורדיון לשוניות)',
    category: 'Menus & Sheets',
    status: 'Ready',
    description:
      'תפריט פעולות ואקורדיון לשוניות אקסקלוסיבי (לכל היותר לשונית אחת פתוחה, הכל סגור כברירת מחדל). תומך בתיאורים דינמיים, תת-פריטים מקוננים (כמו הגדרות), שוליים פנימיים מוקפדים, ואינטגרציית CloudStore.',
    schemaExample: `// דוגמת הזנת פריט רגיל + פריט לשונית עם תת-הגדרות
const items: KosActionItem[] = [
  { id: 'install', title: 'התקן אפליקציה', subtitle: 'PWA מהיר', icon: 'Smartphone', badgeText: 'פתח' },
  {
    id: 'settings_tab',
    title: 'הגדרות מערכת',
    subtitle: 'שמע, תצוגה והתאמה אישית',
    icon: 'Settings',
    description: 'התאמת פרמטרים אישיים לחוויית עבודה ממוקדת',
    subItems: [
      { id: 'toggle_sound', title: 'צלילים ואפקטים', subtitle: 'צלילים פעילים', icon: 'Volume2', badgeText: 'פעיל' },
      { id: 'toggle_theme', title: 'מצב תצוגה (יום / לילה)', subtitle: 'מצב לילה פעיל', icon: 'Sun', badgeText: 'לילה' },
    ],
  },
  { id: 'logout', title: 'התנתק', subtitle: 'יציאה מאובטחת', icon: 'LogOut', badgeText: 'יציאה', variant: 'danger' },
];

<KosActionMenuSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  profile={userProfile}
  items={items}
  onItemClick={(id, item) => handleDispatch(id)}
/>`,
    propsDoc: [
      { name: 'isOpen', type: 'boolean', description: 'האם התפריט פתוח' },
      { name: 'onClose', type: '() => void', description: 'אירוע סגירה' },
      { name: 'profile', type: 'KosUserProfile', description: 'פרטי משתמש, תמונה ומצב אונליין' },
      { name: 'items', type: 'KosActionItem[]', description: 'מערך שורות הפעולה והלשוניות הדינמיות' },
      { name: 'openTabId', type: 'string | null', description: 'מזהה הלשונית הפתוחה (אופציונלי לשליטה מבחוץ)' },
      { name: 'onItemClick', type: '(id, item) => void', description: 'משגר אירועים מבוסס ID' },
      { name: 'slotHeaderExtra / slotFooterExtra', type: 'ReactNode', description: 'שקעים לסוכנים הבאים' },
    ],
  },
  {
    id: 'ComonaAdapter',
    name: 'ComonaAdapter (בונה מתאם קולקציות וסינון UI)',
    category: 'Menus & Sheets',
    status: 'Ready',
    description: 'מתאם ויזואלי המאפשר לבחור קולקציה מ-Firestore (COMONA), להגדיר תנאי סינון (Where), ולמפות שדות ל-UI בקלות ללא נגיעה בקוד!',
    schemaExample: `const adapterConfig: ComonaAdapterConfig = {
  id: 'my-tasks-adapter',
  name: 'משימות פעילות',
  collectionPath: 'todayTasks',
  conditions: [{ field: 'completed', operator: '==', value: false }],
  fieldMapping: {
    titleField: 'title',
    badgeTextField: 'priorityIndex',
    subtitleField: 'date'
  }
};

<ComonaConnectedActionMenu
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  adapterConfig={adapterConfig}
  actionRegistry={{
    complete_task: (data) => console.log('הושלמה משימה', data)
  }}
/>`,
    propsDoc: [
      { name: 'config', type: 'ComonaAdapterConfig', description: 'הגדרת מקור הקולקציה, תנאי הסינון ומיפוי השדות' },
      { name: 'onChange', type: '(config) => void', description: 'עדכון ההגדרה מה-UI' },
      { name: 'actionRegistry', type: 'Record<string, Function>', description: 'מילון פונקציות להפעלה לפי מזהה' },
    ],
  },
  {
    id: 'KosCloudStoreIconPicker',
    name: 'KosCloudStoreIconPicker (בורר אייקונים)',
    category: 'Menus & Sheets',
    status: 'Ready',
    description: 'מודאל עצמאי לבחירת אייקונים מתוך ספריית ה-CloudStore של קושאן / COMONA, עם חלוקה לקטגוריות וחיפוש בזמן אמת.',
    schemaExample: `<KosCloudStoreIconPicker
  isOpen={isPickerOpen}
  onClose={() => setIsPickerOpen(false)}
  selectedIcon="Smartphone"
  onSelectIcon={(iconName) => updateItemIcon(iconName)}
/>`,
    propsDoc: [
      { name: 'isOpen', type: 'boolean', description: 'האם המודאל פתוח' },
      { name: 'onClose', type: '() => void', description: 'אירוע סגירה' },
      { name: 'selectedIcon', type: 'string', description: 'שם האייקון הנבחר כרגע' },
      { name: 'onSelectIcon', type: '(iconName: string) => void', description: 'החזרת שם האייקון הנבחר' },
    ],
  },
];

export const ViewComponaScreen: React.FC<{ onBackHome: () => void }> = ({ onBackHome }) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>('KosCognitivePortal');

  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isLiveComonaMenuOpen, setIsLiveComonaMenuOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lastEventLog, setLastEventLog] = useState<string>('ממתין ללחיצה על פריט או לשונית...');

  // נתונים חיים להדגמה
  const [soundActive, setSoundActive] = useState(true);
  const [nightMode, setNightMode] = useState(true);

  // קונפיגורציית מתאם דינמי ל-COMONA
  const [comonaConfig, setComonaConfig] = useState<ComonaAdapterConfig>({
    id: 'comona_tasks_adapter',
    name: 'משימות ונתונים מ-COMONA',
    collectionPath: 'todayTasks',
    conditions: [],
    fieldMapping: {
      titleField: 'title',
      subtitleField: 'date',
      badgeTextField: 'priorityIndex',
      iconField: 'icon',
      descriptionField: 'createdAt',
    },
    limitCount: 15,
  });

  const demoProfile: KosUserProfile = {
    name: 'אשר משולם',
    emailOrSubtext: 'ovt5771@gmail.com',
    avatarUrl: '/kosun-user.webp',
    isOnline: true,
  };

  const [demoItems, setDemoItems] = useState<KosActionItem[]>([
    {
      id: 'install_app',
      title: 'התקן אפליקציה למכשיר',
      subtitle: 'התקנת PWA לגישה מהירה',
      icon: 'Smartphone',
      badgeText: 'פתח',
      description: 'התקן את האפליקציה ישירות על שולחן העבודה או מסך הבית לגישה מהירה ועבודה במצב לא מקוון.',
    },
    {
      id: 'evening_ritual',
      title: 'טקס ערב לסגירת יום',
      subtitle: 'סיכום הישגים ושחרור מנטלי',
      icon: 'Sparkles',
      badgeText: 'התחל',
      description: 'טקס של 3 דקות לסיכום המשימות של היום, ניקוי הראש, ובחירת 3 משימות מפתח למחר.',
    },
    {
      id: 'system_settings_tab',
      title: 'הגדרות מערכת',
      subtitle: 'צלילים, מצב תצוגה והתאמה אישית',
      icon: 'Settings',
      description: 'מרכז בקרת המערכת: שליטה באפקטים הקוליים ומצב יום/לילה מותאם.',
      subItems: [
        {
          id: 'toggle_sound',
          title: 'צלילים ואפקטים קוליים',
          subtitle: soundActive ? 'צלילים פעילים' : 'צלילים מושתקים',
          icon: soundActive ? 'Volume2' : 'VolumeX',
          badgeText: soundActive ? 'פעיל' : 'כבוי',
        },
        {
          id: 'toggle_theme',
          title: 'מצב תצוגה (יום / לילה)',
          subtitle: nightMode ? 'מצב לילה פעיל' : 'מצב יום פעיל',
          icon: nightMode ? 'Moon' : 'Sun',
          badgeText: nightMode ? 'לילה' : 'יום',
        },
      ],
    },
    {
      id: 'kosun_guide',
      title: 'אודות ומדריך קושאן',
      subtitle: 'חוק ה-3 והמתודה העסקית',
      icon: 'HelpCircle',
      badgeText: 'מידע',
      description: 'מתודולוגיית הניהול של קושאן: מקסימום 3 משימות ביום, אפס עומס קוגניטיבי, ומיקוד מלא בנכסים.',
    },
    {
      id: 'user_logout',
      title: 'התנתק מהחשבון',
      subtitle: 'יציאה מאובטחת',
      icon: 'LogOut',
      badgeText: 'יציאה',
      variant: 'danger',
    },
  ]);

  const handleDemoClick = (id: string, item: KosActionItem) => {
    setLastEventLog(`אירוע [${id}] - "${item.title}"`);
    if (id === 'user_logout') alert('התנתקות שוגרה בהצלחה!');
  };

  const handleSelectIconFromPicker = (iconName: string) => {
    if (!editingItemId) return;
    setDemoItems((prev) =>
      prev.map((item) => (item.id === editingItemId ? { ...item, icon: iconName } : item))
    );
    setLastEventLog(`הוחלף אייקון לפריט [${editingItemId}] ל-${iconName}`);
    setEditingItemId(null);
  };

  const currentComp = CATALOG.find((c) => c.id === selectedComponentId) || CATALOG[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentComp.schemaExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#060810] text-[#F0F4FF] font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* סרגל עליון */}
      <header className="sticky top-0 z-30 bg-[#111827]/90 backdrop-blur-md border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>חזרה לאפליקציה</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              /VIEWCOMPONA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-mono hidden sm:inline">KOSUN2026 UI LAB</span>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            {CATALOG.filter((c) => c.status === 'Ready').length} מוכנים
          </span>
        </div>
      </header>

      {/* אזור תוכן מרכזי בגריד */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* סרגל צד - קטלוג הקומפוננטות */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-700">
            <h2 className="text-sm font-bold text-white/90 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              ספריית קומפוננטות
            </h2>
            <div className="space-y-1.5">
              {CATALOG.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedComponentId(item.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    selectedComponentId === item.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-100 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="truncate">{item.name.split(' ')[0]}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.status === 'Ready'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {item.status === 'Ready' ? 'מוכן' : 'בתכנון'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* לוח תצוגת אירועים חיים */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-700 space-y-2">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              אירועים חיים (Dispatcher Log)
            </h3>
            <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-900/40 font-mono text-[11px] text-cyan-400 break-all">
              {lastEventLog}
            </div>
          </div>
        </aside>

        {/* שטח עבודה מרכזי */}
        <main className="lg:col-span-9 space-y-6">
          <div className="p-6 rounded-3xl bg-[#111827] border border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                  {currentComp.category}
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">{currentComp.name}</h1>
              </div>

              <div className="flex items-center gap-2">
                {currentComp.id === 'KosActionPortal' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsPortalEditorOpen(!isPortalEditorOpen)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>{isPortalEditorOpen ? 'סגור עורך עיצוב' : 'ערוך קומפוננטה (Editor)'}</span>
                    </button>
                  </>
                )}
                {currentComp.id === 'KosActionMenuSheet' && (
                  <button
                    type="button"
                    onClick={() => setIsDemoMenuOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 fill-current" />
                    הפעל תפריט בדיקה חי
                  </button>
                )}

                {currentComp.id === 'ComonaAdapter' && (
                  <button
                    type="button"
                    onClick={() => setIsLiveComonaMenuOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    פתח תפריט חי מ-Firestore
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-100 leading-relaxed">{currentComp.description}</p>
          </div>

          {/* 🌟 אזור תצוגה חיה של KosCognitivePortal מחובר ל-Firestore */}
          {selectedComponentId === 'KosCognitivePortal' && (
            <div className="p-4 sm:p-6 rounded-3xl bg-[#111827] border border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  KosCognitivePortal (חיבור חי לקולקציות Firestore & COMONA)
                </h2>
                <span className="text-xs text-cyan-300 font-mono">
                  ארכיטקטורת 9:16 מודולרית
                </span>
              </div>

              <div className="w-full max-w-[430px] h-[820px] mx-auto rounded-[36px] overflow-hidden border-4 border-slate-700/80 shadow-2xl relative bg-black">
                <KosCognitivePortal
                  tenantId="kosun"
                  targetProject="comona"
                  defaultAudience="guest"
                />
              </div>
            </div>
          )}

          {/* אם בחרנו במתאם COMONA - מציגים את ה-UI הקל להגדרה! */}
          {selectedComponentId === 'ComonaAdapter' ? (
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-700 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                ממשק ויזואלי להגדרת חיבור COMONA & Firestore
              </h2>

              <ComonaAdapterBuilder
                config={comonaConfig}
                onChange={(updated) => setComonaConfig(updated)}
              />
            </div>
          ) : (
            /* מפרט Props וקוד רגיל */
            <>
              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-700 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  מפרט Props ושקעים (Slots)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-300">
                        <th className="pb-2.5 pr-2 font-mono">Prop / Slot</th>
                        <th className="pb-2.5 pr-2 font-mono">סוג (Type)</th>
                        <th className="pb-2.5 pr-2">תיאור והלבשה</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentComp.propsDoc.map((p) => (
                        <tr key={p.name} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 pr-2 font-mono font-bold text-cyan-300">{p.name}</td>
                          <td className="py-2.5 pr-2 font-mono text-amber-300/80">{p.type}</td>
                          <td className="py-2.5 pr-2 text-slate-100">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    דוגמת קוד והזנת נתונים
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'הועתק!' : 'העתק קוד'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-[#04060C] border border-white/5 font-mono text-xs text-cyan-200/90 overflow-x-auto text-left" dir="ltr">
                  {currentComp.schemaExample}
                </pre>
              </div>
            </>
          )}
        </main>
      </div>

      {/* 1. תפריט בדיקה פנימי */}
      <KosActionMenuSheet
        isOpen={isDemoMenuOpen}
        onClose={() => setIsDemoMenuOpen(false)}
        profile={demoProfile}
        items={demoItems}
        onItemClick={handleDemoClick}
      />

      {/* 2. תפריט המחובר חי ל-Firestore של COMONA דרך המתאם! */}
      <ComonaConnectedActionMenu
        isOpen={isLiveComonaMenuOpen}
        onClose={() => setIsLiveComonaMenuOpen(false)}
        adapterConfig={comonaConfig}
        profile={demoProfile}
        actionRegistry={{
          PWA_INSTALL: () => alert('[COMONA Handler] הפעלת התקנת אפליקציה!'),
          TOGGLE_SOUND: () => alert('[COMONA Handler] החלפת מצב צליל!'),
        }}
        onItemDispatched={(actionId, payload) => {
          setLastEventLog(`שוגרה פקודת COMONA: [${actionId}] על מסמך ${payload?._docId}`);
        }}
      />

      {/* 3. בורר אייקונים מ-CloudStore */}
      <KosCloudStoreIconPicker
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={handleSelectIconFromPicker}
      />
    </div>
  );
};
