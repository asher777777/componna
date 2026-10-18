import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Award,
  Play,
  Edit3,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import { useKosSubscribed } from '../hooks/useKosSubscribed';

export const QuizzesFormsTab: React.FC = () => {
  const {
    quizzes,
    contacts,
    setEditingQuiz,
    setModalMode,
    deleteQuiz,
    setSelectedContact,
    setActiveQuizForAttempt,
  } = useKosSubscribed();

  const [previewKsfQuizId, setPreviewKsfQuizId] = useState<string | null>(null);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-500" />
            טפסים של מבחנים ושאלוני הסמכה למנויים
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            צור מבחנים שלביים המשויכים לחבילות המנוי, סנכרן אותם עם מנוע הטפסים (KSF) ושמור את הציונים ישירות בכרטיס איש הקשר ב-CRM
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingQuiz(null);
            setModalMode('create-quiz');
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>יצירת טופס מבחן חדש</span>
        </button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 mb-1">
                    <Award className="w-3 h-3" /> ציון מעבר נדרש: {quiz.passingScore}%
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {quiz.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuiz(quiz);
                      setModalMode('create-quiz');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="ערוך מבחן"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuiz(quiz.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="מחק מבחן"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">{quiz.description}</p>

              {quiz.packageName && (
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  משויך לחבילה: {quiz.packageName}
                </div>
              )}

              {/* Questions Summary */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500">
                  שאלות במבחן ({quiz.questions.length}):
                </div>
                {quiz.questions.slice(0, 3).map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {idx + 1}. {q.questionText}
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 shrink-0">
                      {q.points} נק׳
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {quiz.submissionsCount} הגשות מתועדות ב-CRM
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewKsfQuizId((prev) => (prev === quiz.id ? null : quiz.id))
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>תצוגת שקע KSF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedContact(contacts[0] || null);
                    setActiveQuizForAttempt(quiz);
                    setModalMode('take-quiz');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>הפעל מבחן לאיש קשר</span>
                </button>
              </div>
            </div>

            {/* Zero Cross-Import CapabilitySlot for KSF Form Renderer */}
            {previewKsfQuizId === quiz.id && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <CapabilitySlot
                  name="form-renderer"
                  props={{
                    formId: quiz.ksfFormId || quiz.id,
                  }}
                  fallback={
                    <div className="p-4 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-800 text-center text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="font-bold text-purple-600 dark:text-purple-400">
                        שקע טופס מבחן חכם (CapabilitySlot: form-renderer)
                      </div>
                      <div>
                        מזהה טופס KSF מסונכרן: <span className="font-mono">{quiz.ksfFormId || quiz.id}</span>
                      </div>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
