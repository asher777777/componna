import React, { useState } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { PersonaItem, ObjectionItem } from '../types/brandDna';
import {
  Target,
  Users2,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const TargetAudienceSection: React.FC = () => {
  const { brandDna, updateAudience } = useBrandDna();

  const [newAudienceTag, setNewAudienceTag] = useState('');

  // New Persona modal/inline form
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaRole, setNewPersonaRole] = useState('');
  const [newPersonaPain, setNewPersonaPain] = useState('');
  const [newPersonaDream, setNewPersonaDream] = useState('');
  const [showPersonaForm, setShowPersonaForm] = useState(false);

  // New Objection form
  const [newObjection, setNewObjection] = useState('');
  const [newRebuttal, setNewRebuttal] = useState('');
  const [showObjectionForm, setShowObjectionForm] = useState(false);

  const handleAddAudienceTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newAudienceTag.trim();
    if (tag && !brandDna.audience.targetAudiences.includes(tag)) {
      updateAudience({ targetAudiences: [...brandDna.audience.targetAudiences, tag] });
      setNewAudienceTag('');
    }
  };

  const handleRemoveAudienceTag = (tag: string) => {
    updateAudience({ targetAudiences: brandDna.audience.targetAudiences.filter((t) => t !== tag) });
  };

  const handleSavePersona = () => {
    if (!newPersonaName.trim()) {
      alert('נא להזין שם או פרופיל לפרסונה');
      return;
    }
    const item: PersonaItem = {
      id: `p-${Date.now()}`,
      name: newPersonaName.trim(),
      roleOrProfile: newPersonaRole.trim() || 'לקוח יעד מרכזי',
      mainPain: newPersonaPain.trim(),
      dreamOutcome: newPersonaDream.trim(),
    };
    updateAudience({ personas: [...brandDna.audience.personas, item] });
    setNewPersonaName('');
    setNewPersonaRole('');
    setNewPersonaPain('');
    setNewPersonaDream('');
    setShowPersonaForm(false);
  };

  const handleDeletePersona = (id: string) => {
    updateAudience({ personas: brandDna.audience.personas.filter((p) => p.id !== id) });
  };

  const handleSaveObjection = () => {
    if (!newObjection.trim() || !newRebuttal.trim()) {
      alert('נא להזין גם את החשש וגם את מענה המותג');
      return;
    }
    const item: ObjectionItem = {
      id: `o-${Date.now()}`,
      objection: newObjection.trim(),
      rebuttal: newRebuttal.trim(),
    };
    updateAudience({ commonObjections: [...brandDna.audience.commonObjections, item] });
    setNewObjection('');
    setNewRebuttal('');
    setShowObjectionForm(false);
  };

  const handleDeleteObjection = (id: string) => {
    updateAudience({ commonObjections: brandDna.audience.commonObjections.filter((o) => o.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* 1. Main UVP (Unique Value Proposition) */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">הצעת ערך ייחודית (UVP) ובידול שוק</h3>
            <p className="text-xs text-slate-400">הסבר מדוע הלקוח צריך לבחור דווקא בך ולא באף מתחרה אחר</p>
          </div>
        </div>

        <div>
          <textarea
            rows={3}
            value={brandDna.audience.mainUvp}
            onChange={(e) => updateAudience({ mainUvp: e.target.value })}
            placeholder="לדוגמה: פתרון All-in-One המשלב סליקה מאובטחת, דפי נחיתה מהירים וטפסים מבוססי AI עם מענה אנושי מהיר..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Target Audience Tags */}
        <div className="pt-2 border-t border-slate-700/60 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">קהלי יעד ראשיים (סגמנטים)</label>
          <form onSubmit={handleAddAudienceTag} className="flex gap-2">
            <input
              type="text"
              value={newAudienceTag}
              onChange={(e) => setNewAudienceTag(e.target.value)}
              placeholder="הוסף קהל יעד (למשל: מנהלי עמותות, עצמאיים)..."
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              הוסף
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {brandDna.audience.targetAudiences.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveAudienceTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Customer Personas */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">פרופילי לקוח ופרסונות (Client Personas)</h3>
              <p className="text-xs text-slate-400">מאפשר ל-Gemini להבין את הכאבים, המוטיבציות והתוצאה המבוקשת</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPersonaForm(!showPersonaForm)}
            className="text-xs px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {showPersonaForm ? 'סגור טופס' : 'הוסף פרסונה'}
          </button>
        </div>

        {/* Persona Form */}
        {showPersonaForm && (
          <div className="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-xl space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-cyan-300">הגדרת פרסונה חדשה</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">שם הפרסונה ופרופיל</label>
                <input
                  type="text"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  placeholder="למשל: יוני, בעל חנות דיגיטלית"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">תפקיד / רקע קצר</label>
                <input
                  type="text"
                  value={newPersonaRole}
                  onChange={(e) => setNewPersonaRole(e.target.value)}
                  placeholder="למשל: פעיל בתחום כבר 3 שנים, עובד מהבית"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">כאב או אתגר מרכזי (Main Pain Point)</label>
              <input
                type="text"
                value={newPersonaPain}
                onChange={(e) => setNewPersonaPain(e.target.value)}
                placeholder="מה משאיר אותו ער בלילה או גורם לו תסכול?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">התוצאה החלומית (Dream Outcome)</label>
              <input
                type="text"
                value={newPersonaDream}
                onChange={(e) => setNewPersonaDream(e.target.value)}
                placeholder="איזו תוצאה תגרום לו להרגיש ניצחון מוחלט?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPersonaForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleSavePersona}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                שמור פרסונה
              </button>
            </div>
          </div>
        )}

        {/* Personas List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandDna.audience.personas.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-2 relative group hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <span className="text-[11px] text-cyan-400">{p.roleOrProfile}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePersona(p.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                  title="מחק פרסונה"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                <p>
                  <strong className="text-red-300">כאב:</strong> {p.mainPain}
                </p>
                <p>
                  <strong className="text-emerald-300">יעד רצוי:</strong> {p.dreamOutcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Common Objections & Rebuttals */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">התנגדויות נפוצות ומענה המותג (Objections & Rebuttals)</h3>
              <p className="text-xs text-slate-400">Gemini ישלב מענה מובלע להתנגדויות אלו בדפי התוכן ובסליקה</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowObjectionForm(!showObjectionForm)}
            className="text-xs px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {showObjectionForm ? 'סגור' : 'הוסף מענה לחשש'}
          </button>
        </div>

        {/* Objection Form */}
        {showObjectionForm && (
          <div className="p-4 bg-slate-900/90 border border-orange-500/30 rounded-xl space-y-3 animate-in fade-in">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">החשש או השאלה של הלקוח</label>
              <input
                type="text"
                value={newObjection}
                onChange={(e) => setNewObjection(e.target.value)}
                placeholder="למשל: האם זה דורש ידע טכני מוקדם?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">המענה המרגיע והמשכנע של המותג</label>
              <input
                type="text"
                value={newRebuttal}
                onChange={(e) => setNewRebuttal(e.target.value)}
                placeholder="למשל: ממש לא, המערכת נבנתה במיוחד לפשטות מקסימלית בליווי צעד-אחר-צעד..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowObjectionForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleSaveObjection}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                שמור
              </button>
            </div>
          </div>
        )}

        {/* Objections list */}
        <div className="space-y-3">
          {brandDna.audience.commonObjections.map((o) => (
            <div
              key={o.id}
              className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl flex items-start justify-between gap-4"
            >
              <div className="space-y-1 text-xs">
                <p className="font-bold text-orange-300">❓ חשש: "{o.objection}"</p>
                <p className="text-slate-300">💡 מענה: {o.rebuttal}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteObjection(o.id)}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
