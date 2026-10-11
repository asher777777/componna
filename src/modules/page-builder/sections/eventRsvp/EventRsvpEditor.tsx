import React from 'react';
import { EventRsvpSectionConfig } from '../../types/sectionConfigs';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  CalendarPlus,
  BellRing,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface EventRsvpEditorProps {
  config: EventRsvpSectionConfig;
  onChange: (updated: EventRsvpSectionConfig) => void;
}

export const EventRsvpEditor: React.FC<EventRsvpEditorProps> = ({ config, onChange }) => {
  const updateField = (key: keyof EventRsvpSectionConfig, val: any) => {
    onChange({
      ...config,
      [key]: val,
    });
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* 1. General Event Details */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>פרטי האירוע והמיקום</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">כותרת האירוע</label>
            <input
              type="text"
              value={config.eventTitle || ''}
              onChange={(e) => updateField('eventTitle', e.target.value)}
              placeholder="לדוגמה: כנס קהילה והשקת 2026"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">תת-כותרת / תיאור קצר</label>
            <input
              type="text"
              value={config.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="כל הפרטים החשובים במקום אחד..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">תאריך האירוע (YYYY-MM-DD)</label>
            <input
              type="date"
              value={config.eventDate || ''}
              onChange={(e) => updateField('eventDate', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">שעת התחלה</label>
              <input
                type="time"
                value={config.eventTime || ''}
                onChange={(e) => updateField('eventTime', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">שעת סיום</label>
              <input
                type="time"
                value={config.eventEndTime || ''}
                onChange={(e) => updateField('eventEndTime', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">שם המקום / המתחם</label>
            <input
              type="text"
              value={config.locationName || ''}
              onChange={(e) => updateField('locationName', e.target.value)}
              placeholder="לדוגמה: אולמי ריזורט תל אביב"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">כתובת מלאה</label>
            <input
              type="text"
              value={config.locationAddress || ''}
              onChange={(e) => updateField('locationAddress', e.target.value)}
              placeholder="רחוב, מספר ועיר"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Three Cards Settings */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>הגדרות שלושת הכרטיסיות (Waze, יומן, וואטסאפ)</span>
        </h4>

        {/* Card 1: Waze */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Navigation className="w-4 h-4" />
              <span>כרטיס 1: ניווט Waze</span>
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.showWazeCard !== false}
                onChange={(e) => updateField('showWazeCard', e.target.checked)}
                className="rounded"
              />
              <span>הצג כרטיס</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">שאילתת ניווט ל-Waze (כתובת או קואורדינטות)</label>
              <input
                type="text"
                value={config.wazeQuery || ''}
                onChange={(e) => updateField('wazeQuery', e.target.value)}
                placeholder="לדוגמה: דרך מנחם בגין 144 תל אביב"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">כותרת הכרטיס</label>
              <input
                type="text"
                value={config.wazeCardTitle || 'ניווט ב-Waze'}
                onChange={(e) => updateField('wazeCardTitle', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Calendar */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <CalendarPlus className="w-4 h-4" />
              <span>כרטיס 2: הוספה ליומן</span>
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.showCalendarCard !== false}
                onChange={(e) => updateField('showCalendarCard', e.target.checked)}
                className="rounded"
              />
              <span>הצג כרטיס</span>
            </label>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">כותרת הכרטיס</label>
            <input
              type="text"
              value={config.calendarCardTitle || 'הוסף ליומן'}
              onChange={(e) => updateField('calendarCardTitle', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        {/* Card 3: WhatsApp Automation */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <BellRing className="w-4 h-4" />
              <span>כרטיס 3: אוטומציית תזכורת בוואטסאפ מבוססת זמן</span>
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.showWhatsappCard !== false}
                onChange={(e) => updateField('showWhatsappCard', e.target.checked)}
                className="rounded"
              />
              <span>הצג כרטיס</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">כותרת הכרטיס</label>
              <input
                type="text"
                value={config.whatsappCardTitle || 'תזכורת אוטומטית בוואטסאפ'}
                onChange={(e) => updateField('whatsappCardTitle', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">מועד תזמון השליחה המתוכנן</label>
              <input
                type="text"
                value={config.whatsappReminderTimeText || 'שעתיים לפני האירוע'}
                onChange={(e) => updateField('whatsappReminderTimeText', e.target.value)}
                placeholder="למשל: שעתיים לפני האירוע / בבוקר האירוע"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. RSVP Yes/No Buttons & Attendee Counter */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>כפתורי אישור הגעה (כן / לא) ומונה אורחים</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">טקסט כפתור הגעה (כן)</label>
            <input
              type="text"
              value={config.yesButtonText || 'מגיע/ה בשמחה'}
              onChange={(e) => updateField('yesButtonText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">טקסט כפתור אי-הגעה (לא)</label>
            <input
              type="text"
              value={config.noButtonText || 'לא מתאפשר לי הפעם'}
              onChange={(e) => updateField('noButtonText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">מונה מגיעים התחלתי (אישרו הגעה)</label>
            <input
              type="number"
              value={config.yesCountInitial ?? 38}
              onChange={(e) => updateField('yesCountInitial', parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">תווית המונה בעמוד</label>
            <input
              type="text"
              value={config.attendeeCounterLabel || 'אישרו הגעה עד כה'}
              onChange={(e) => updateField('attendeeCounterLabel', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={config.showRsvpButtons !== false}
              onChange={(e) => updateField('showRsvpButtons', e.target.checked)}
              className="rounded"
            />
            <span>הצג כפתורי אישור הגעה</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={config.showAttendeeCounter !== false}
              onChange={(e) => updateField('showAttendeeCounter', e.target.checked)}
              className="rounded"
            />
            <span>הצג מונה אורחים חי בעמוד</span>
          </label>
        </div>
      </div>
    </div>
  );
};
export default EventRsvpEditor;
