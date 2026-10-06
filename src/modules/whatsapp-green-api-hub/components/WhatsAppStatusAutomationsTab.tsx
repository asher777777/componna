import React, { useState, useEffect } from "react";
import { Firestore, collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { Clock, Plus, Trash2, Calendar, Target, Zap, Settings, Tag } from "lucide-react";
import { useTenantScope } from "../../../core/tenant";

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
  { id: "0", label: "��� �����" },
  { id: "1", label: "��� ���" },
  { id: "2", label: "��� �����" },
  { id: "3", label: "��� �����" },
  { id: "4", label: "��� �����" },
  { id: "5", label: "��� ����" },
  { id: "6", label: "�����" }
];

export const WhatsAppStatusAutomationsTab: React.FC<Props> = ({ db, isDark }) => {
  const { tenantId } = useTenantScope();
  const automationsCollectionPath = tenantId ? `tenants/${tenantId}/whatsapp_status_automations` : "whatsapp_status_automations";
  const [automations, setAutomations] = useState<StatusAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [goal, setGoal] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [timeOfDay, setTimeOfDay] = useState("10:00");
  const [contentType, setContentType] = useState("��� �����");

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
        goal,
        dayOfWeek,
        timeOfDay,
        contentType,
        isActive: true,
        createdAt: Date.now()
      };
      await setDoc(docRef, newAuto);
      setAutomations([newAuto, ...automations]);
      
      setGoal("");
      setContentType("��� �����");
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
  const cardBg = isDark ? "bg-slate-800" : "bg-slate-50";
  const inputBg = isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900";

  return (
    <div className={"p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-6 shadow-sm " + bgClass} dir="rtl" style={{ textAlign: "right" }}>
      <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ��������� ����� �������
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ���� ����� ������ ������� ��� �����, ���� ����� ������� ����.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={"col-span-1 p-5 rounded-2xl border border-slate-800/40 space-y-4 " + cardBg}>
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-indigo-400" />
            ����� �������� ����
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> ���� �����
            </label>
            <input
              type="text"
              placeholder="������: ����� �����, ������..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className={"w-full text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> ��� ����
            </label>
            <input
              type="text"
              placeholder="������: ��� �����, ����..."
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className={"w-full text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> ��� �����
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className={"w-full text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
              >
                {DAYS_OF_WEEK.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> ���
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className={"w-full text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 " + inputBg}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !goal.trim() || !contentType.trim()}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? "����..." : "���� ��������"}
          </button>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            ��������� ������ ({automations.length})
          </h3>

          {isLoading ? (
            <p className="text-xs text-slate-500">����...</p>
          ) : automations.length === 0 ? (
            <div className={"p-8 text-center rounded-2xl border border-dashed border-slate-700/50 " + cardBg}>
              <Zap className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-400">��� ��������� ������</p>
              <p className="text-xs text-slate-500 mt-1">���� �������� ���� ����� �����</p>
            </div>
          ) : (
            <div className="space-y-2">
              {automations.map(auto => (
                <div key={auto.id} className={"p-4 rounded-xl border border-slate-800/40 flex items-center justify-between " + cardBg}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{auto.goal}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {auto.contentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {DAYS_OF_WEEK.find(d => d.id === auto.dayOfWeek)?.label}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {auto.timeOfDay}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(auto.id)}
                    className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition"
                    title="��� ��������"
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