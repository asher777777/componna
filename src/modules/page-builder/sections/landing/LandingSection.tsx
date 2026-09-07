import React, { useState } from 'react';
import { LandingSectionConfig } from '../../types/sectionConfigs';
import { Send, CheckCircle2 } from 'lucide-react';

export const LandingSection: React.FC<{ config: LandingSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'השאירו פרטים לקבלת מידע נוסף',
    subtitle = 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
    description = 'מלאו את הפרטים הקצרים בטופס ונציג מקצועי יחזור אליכם בהקדם האפשרי.',
    imageSrc,
    buttonText = 'שלח פרטים עכשיו',
    backgroundColor = 'transparent',
  } = config;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section
      id={anchorId || 'landingSection'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col gap-4 text-right">
            {subtitle && (
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 w-fit">
                {subtitle}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h2>
            {description && <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{description}</p>}

            {imageSrc && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-800 max-w-sm aspect-video">
                <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-3 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">פנייתך התקבלה בהצלחה!</h3>
                <p className="text-xs text-slate-400">נציג מטעמנו יחזור אליך בהקדם האפשרי.</p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  שליחת טופס נוסף
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">שם מלא *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ישראל ישראלי"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">טלפון נייד *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="050-0000000"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">אימייל (אופציונלי)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">הערות / הודעה</label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="רשמו כאן פרטים נוספים..."
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{buttonText}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
