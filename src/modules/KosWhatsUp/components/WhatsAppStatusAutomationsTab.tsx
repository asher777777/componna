import React, { useState, useEffect } from "react";
import { Firestore, collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { Clock, Plus, Trash2, Calendar, Target, Zap, Settings, Tag } from "lucide-react";
import { useTenantScope } from "../../../core/tenant";
import { SYSTEM_COLLECTIONS } from "../../../core/contracts";

export interface StatusAutomation {
  id: string;
  goal: string;
  dayOfWeek: string;
  timeOfDay: string;
  contentType: string;
  isActive: boolean;
  createdAt: number;
}

interface Props {
  db?: Firestore;
  isDark: boolean;
}

const DAYS_OF_WEEK = [
  { id: "0", label: "יום ראשון" },
  { id: "1", label: "יום שני" },
  { id: "2", label: "יום שלישי" },
  { id: "3", label: "יום רביעי" },
  { id: "4", label: "יום חמישי" },
  { id: "5", label: "יום שישי" },
  { id: "6", label: "מוצאי שבת" }
];

export const WhatsAppStatusAutomationsTab: React.FC<Props> = ({ db, isDark }) => {
  const { getScopedCollectionPath } = useTenantScope();
  const automationsCollectionPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.KOS_WHATSUP_AUTOMATIONS);
  const [automations, setAutomations] = useState<StatusAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [goal, setGoal] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [timeOfDay, setTimeOfDay] = useState("10:00");
  const [contentType, setContentType] = useState("דבר תורה שבועי");

  useEffect(() => {
    loadAutomations();
  }, [db]);

  const loadAutomations = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, automationsCollectionPath));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as StatusAutomation));
      setAutomations(items.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error("Failed to load automations", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!db || !goal.trim() || !contentType.trim()) return;
    setIsSaving(true);
    try {
      const newId = "auto_" + Date.now();
      const docRef = doc(db, automationsCollectionPath, newId);
      const newAuto: StatusAutomation = {
        id: newId,
        goal: goal.trim(),
        dayOfWeek,
        timeOfDay,
        contentType: contentType.trim(),
        isActive: true,
        createdAt: Date.now()
      };
      await setDoc(docRef, newAuto);
      setAutomations([newAuto, ...automations]);
      
      setGoal("");
      setContentType("דבר תורה שבועי");
    } catch (err) {
      console.error("Failed to save automation", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, automationsCollectionPath, id));
      setAutomations(automations.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete automation", err);
    }
  };

  const bgClass = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";
  const cardBg = isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200";
  const inputBg = isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900";

  return (
    <div className={"p-4 sm:p-6 rounded-3xl border space-y-6 shadow-xs " + bgClass} dir="rtl" style={{ textAlign: "right" }}>
      <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            אוטומציות סטטוס מתוזמנות
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            תזמון פרסום סטטוסים שבועיים אוטומטיים לפי ימים, שעות וסוגי תכנים.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={"col-span-1 p-5 rounded-2xl border space-y-4 " + cardBg}>
          <h3 className="font-bold text-xs flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-100">
            <Plus className="w-4 h-4 text-indigo-500" />
            <span>הגדרת אוטומציה חדשה</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>מטרת הסטטוס</span>
            </label>
            <input
              type="text"
              placeholder="למשל: עדכון שבועי, מבצע סופ״ש..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className={"w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>סוג תוכן</span>
            </label>
            <input
              type="text"
              placeholder="למשל: דבר תורה, טיפ מקצועי..."
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className={"w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>יום בשבוע</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className={"w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
              >
                {DAYS_OF_WEEK.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>שעה</span>
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className={"w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !goal.trim() || !contentType.trim()}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer"
          >
            {isSaving ? "שומר..." : "הוסף אוטומציה"}
          </button>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-3">
          <h3 className="font-bold text-xs flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-100">
            <Settings className="w-4 h-4 text-emerald-500" />
            <span>אוטומציות פעילות ({automations.length})</span>
          </h3>

          {isLoading ? (
            <p className="text-xs text-slate-500">טוען אוטומציות...</p>
          ) : automations.length === 0 ? (
            <div className={"p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 " + cardBg}>
              <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">אין אוטומציות מוגדרות</p>
              <p className="text-[11px] text-slate-400 mt-1">הגדר אוטומציה חדשה בתפריט הימני</p>
            </div>
          ) : (
            <div className="space-y-2">
              {automations.map(auto => (
                <div key={auto.id} className={"p-3.5 rounded-2xl border flex items-center justify-between " + cardBg}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{auto.goal}</span>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {auto.contentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {DAYS_OF_WEEK.find(d => d.id === auto.dayOfWeek)?.label}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {auto.timeOfDay}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(auto.id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                    title="מחק אוטומציה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};