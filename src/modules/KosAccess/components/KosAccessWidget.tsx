import React, { useState } from 'react';
import {
  Accessibility,
  X,
  RotateCcw,
  Sun,
  Moon,
  Contrast,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Minimize2,
  MousePointer,
  Eye,
  Sliders,
  FileText,
  AlertTriangle,
  Sparkles,
  Pause,
  Play,
  BookOpen,
  AlignRight,
  AlignCenter,
  AlignLeft,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useKosAccess } from '../hooks/useKosAccess';
import KosAccessContext, { KosAccessProvider } from '../context/KosAccessContext';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { ACCESSIBILITY_PRESETS } from '../config';
import { KosAccessReadingOverlay } from './KosAccessReadingOverlay';
import { KosAccessStatementModal } from './KosAccessStatementModal';
import { KosAccessFeedbackModal } from './KosAccessFeedbackModal';
import { KosAccessSkipLink } from './KosAccessSkipLink';

export interface KosAccessWidgetProps {
  position?: 'center-left' | 'center-right' | 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
  hideFloatingTrigger?: boolean;
}

const KosAccessWidgetInner: React.FC<KosAccessWidgetProps> = ({
  position = 'center-left',
  hideFloatingTrigger = false,
}) => {
  const {
    preferences,
    activePreset,
    updatePreference,
    resetPreferences,
    applyPreset,
    isToolbarOpen,
    openToolbar,
    closeToolbar,
    toggleToolbar,
    openStatement,
    openFeedback,
    isSpeaking,
    speakText,
    stopSpeaking,
  } = useKosAccess();

  const [activeTab, setActiveTab] = useState<'profiles' | 'display' | 'reading' | 'audio'>('profiles');

  const positionClasses = {
    'center-left': 'top-1/2 -translate-y-1/2 left-1.5 sm:left-3',
    'center-right': 'top-1/2 -translate-y-1/2 right-1.5 sm:right-3',
    'bottom-left': 'bottom-5 left-5',
    'bottom-right': 'bottom-5 right-5',
    'top-right': 'top-5 right-5',
    'top-left': 'top-5 left-5',
  }[position] || 'top-1/2 -translate-y-1/2 left-1.5 sm:left-3';

  return (
    <>
      {/* 1. Skip to Content Link (WCAG 2.4.1) */}
      <KosAccessSkipLink />

      {/* 2. Interactive Reading Overlays (Ruler / Mask) */}
      <KosAccessReadingOverlay />

      {/* 3. Floating Trigger Button */}
      {!hideFloatingTrigger && (
        <div className={`fixed z-[99980] ${positionClasses} group`}>
          <button
            onClick={toggleToolbar}
            className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2 ${
              isToolbarOpen
                ? 'bg-blue-800 text-yellow-300 rotate-90 scale-95 ring-2 ring-yellow-400'
                : 'bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/40 border border-white/20'
            }`}
            aria-label="פתיחת תפריט נגישות (Alt+A)"
            aria-haspopup="dialog"
            aria-expanded={isToolbarOpen}
            title="תפריט נגישות (Alt+A)"
          >
            <Accessibility className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />

            {/* Desktop Tooltip Label - points inward to the right */}
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap hidden sm:flex items-center gap-2 border border-slate-700 z-[99999]">
              <span>סרגל נגישות</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-yellow-300 rounded text-[10px] font-mono border border-slate-700">Alt+A</kbd>
            </div>

            {/* Visual Active Badge if any setting is active */}
            {(preferences.fontSize !== 'normal' ||
              preferences.contrast !== 'normal' ||
              preferences.dyslexicFont ||
              preferences.pauseAnimations ||
              preferences.readingRuler ||
              preferences.highlightLinks) && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400 text-[9px] font-black text-blue-900 items-center justify-center">
                  !
                </span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* 4. Accessibility Main Drawer / Modal */}
      {isToolbarOpen && (
        <div
          id="kos-access-portal"
          className="fixed inset-0 z-[99990] flex items-end sm:items-center justify-center sm:justify-start p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-menu-title"
        >
          <div
            className="w-full sm:w-[420px] max-h-[88vh] sm:max-h-[86vh] bg-white text-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 sm:mr-auto sm:ml-4 sm:my-auto"
            dir="rtl"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Accessibility className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h2 id="accessibility-menu-title" className="text-base font-bold">
                    תפריט נגישות
                  </h2>
                  <p className="text-[11px] text-blue-100">
                    תקן ת"י 5568 ומשרד התקשורת (WCAG AA)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetPreferences}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-yellow-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="איפוס כל ההגדרות (Alt+0)"
                  aria-label="איפוס הגדרות נגישות"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  איפוס
                </button>
                <button
                  onClick={closeToolbar}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="סגירת תפריט (Esc)"
                  aria-label="סגירת תפריט נגישות"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Header Navigation Tabs */}
            <div className="flex items-center border-b border-gray-200 bg-gray-50/80 px-2 py-1 text-xs">
              <button
                onClick={() => setActiveTab('profiles')}
                className={`flex-1 py-2 px-1 text-center font-semibold rounded-lg transition-all ${
                  activeTab === 'profiles'
                    ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                פרופילים מהירים
              </button>
              <button
                onClick={() => setActiveTab('display')}
                className={`flex-1 py-2 px-1 text-center font-semibold rounded-lg transition-all ${
                  activeTab === 'display'
                    ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                תצוגה וגופנים
              </button>
              <button
                onClick={() => setActiveTab('reading')}
                className={`flex-1 py-2 px-1 text-center font-semibold rounded-lg transition-all ${
                  activeTab === 'reading'
                    ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                עזרי קריאה
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex-1 py-2 px-1 text-center font-semibold rounded-lg transition-all ${
                  activeTab === 'audio'
                    ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                שמע ומיקוד
              </button>
            </div>

            {/* Panel Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* TAB 1: PRESETS / PROFILES */}
              {activeTab === 'profiles' && (
                <div className="space-y-3">
                  <p className="text-gray-500 font-medium">
                    בחרו פרופיל מותאם בלחיצה אחת:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ACCESSIBILITY_PRESETS.map((preset) => {
                      const isSelected = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(isSelected ? 'none' : preset.id)}
                          className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between min-h-[72px] ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-1 ring-blue-600'
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs">{preset.title}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                          <span className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: DISPLAY & FONTS */}
              {activeTab === 'display' && (
                <div className="space-y-4">
                  {/* Font Sizing */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">גודל טקסט</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => updatePreference('fontSize', 'normal')}
                        className={`py-2 rounded-lg border font-bold text-xs transition-colors ${
                          preferences.fontSize === 'normal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        100%
                      </button>
                      <button
                        onClick={() => updatePreference('fontSize', 'large')}
                        className={`py-2 rounded-lg border font-bold text-xs transition-colors ${
                          preferences.fontSize === 'large'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        125%
                      </button>
                      <button
                        onClick={() => updatePreference('fontSize', 'larger')}
                        className={`py-2 rounded-lg border font-bold text-xs transition-colors ${
                          preferences.fontSize === 'larger'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        150%
                      </button>
                      <button
                        onClick={() => updatePreference('fontSize', 'huge')}
                        className={`py-2 rounded-lg border font-bold text-xs transition-colors ${
                          preferences.fontSize === 'huge'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        200%
                      </button>
                    </div>
                  </div>

                  {/* High Contrast */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">ניגודיות צבעים</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          updatePreference('contrast', preferences.contrast === 'dark' ? 'normal' : 'dark')
                        }
                        className={`flex items-center gap-2 p-2.5 rounded-xl border font-medium transition-all ${
                          preferences.contrast === 'dark'
                            ? 'bg-gray-900 text-yellow-300 border-gray-900 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Moon className="w-4 h-4 text-yellow-400" />
                        ניגודיות כהה
                      </button>
                      <button
                        onClick={() =>
                          updatePreference('contrast', preferences.contrast === 'light' ? 'normal' : 'light')
                        }
                        className={`flex items-center gap-2 p-2.5 rounded-xl border font-medium transition-all ${
                          preferences.contrast === 'light'
                            ? 'bg-white text-gray-900 border-blue-600 shadow-xs ring-1 ring-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Sun className="w-4 h-4 text-amber-500" />
                        ניגודיות בהירה
                      </button>
                      <button
                        onClick={() =>
                          updatePreference('contrast', preferences.contrast === 'monochrome' ? 'normal' : 'monochrome')
                        }
                        className={`flex items-center gap-2 p-2.5 rounded-xl border font-medium transition-all ${
                          preferences.contrast === 'monochrome'
                            ? 'bg-gray-300 text-gray-900 border-gray-500 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Contrast className="w-4 h-4" />
                        גווני אפור (מונוכרום)
                      </button>
                      <button
                        onClick={() =>
                          updatePreference('contrast', preferences.contrast === 'inverted' ? 'normal' : 'inverted')
                        }
                        className={`flex items-center gap-2 p-2.5 rounded-xl border font-medium transition-all ${
                          preferences.contrast === 'inverted'
                            ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        היפוך צבעים
                      </button>
                    </div>
                  </div>

                  {/* Font Features */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => updatePreference('dyslexicFont', !preferences.dyslexicFont)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        preferences.dyslexicFont
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-blue-600" />
                        <span>גופן קריא מותאם לדיסלקציה</span>
                      </div>
                      <span className="text-xs">{preferences.dyslexicFont ? 'פעיל' : 'כבוי'}</span>
                    </button>

                    <button
                      onClick={() => updatePreference('textSpacing', !preferences.textSpacing)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        preferences.textSpacing
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Maximize2 className="w-4 h-4 text-indigo-600" />
                        <span>ריווח שורות ואותיות מוגדל (WCAG)</span>
                      </div>
                      <span className="text-xs">{preferences.textSpacing ? 'פעיל' : 'כבוי'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: READING AIDS */}
              {activeTab === 'reading' && (
                <div className="space-y-3">
                  {/* Reading Guides */}
                  <button
                    onClick={() => updatePreference('readingRuler', !preferences.readingRuler)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      preferences.readingRuler
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-900 font-bold shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <div className="text-right">
                        <div className="font-bold">סרגל קריאה צף</div>
                        <div className="text-[11px] text-gray-500">קו מנחה אופקי העוקב אחר הסמן לקריאה רציפה</div>
                      </div>
                    </div>
                    <span>{preferences.readingRuler ? 'פעיל' : 'כבוי'}</span>
                  </button>

                  <button
                    onClick={() => updatePreference('readingMask', !preferences.readingMask)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      preferences.readingMask
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <div className="text-right">
                        <div className="font-bold">מיסוך קריאה ממוקד (ADHD)</div>
                        <div className="text-[11px] text-gray-500">מחשיך את סביבת המסך ומאיר שורת קריאה נוכחית</div>
                      </div>
                    </div>
                    <span>{preferences.readingMask ? 'פעיל' : 'כבוי'}</span>
                  </button>

                  {/* Highlights */}
                  <button
                    onClick={() => updatePreference('highlightLinks', !preferences.highlightLinks)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      preferences.highlightLinks
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>הדגשת קישורים וקו תחתון</span>
                    <span>{preferences.highlightLinks ? 'פעיל' : 'כבוי'}</span>
                  </button>

                  <button
                    onClick={() => updatePreference('highlightHeadings', !preferences.highlightHeadings)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      preferences.highlightHeadings
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>הדגשת כותרות ומבנה</span>
                    <span>{preferences.highlightHeadings ? 'פעיל' : 'כבוי'}</span>
                  </button>

                  {/* Large Cursor */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">סמן עכבר מוגדל</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updatePreference('largeCursor', 'normal')}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold ${
                          preferences.largeCursor === 'normal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        רגיל
                      </button>
                      <button
                        onClick={() => updatePreference('largeCursor', 'large-black')}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold ${
                          preferences.largeCursor === 'large-black'
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        שחור ענק
                      </button>
                      <button
                        onClick={() => updatePreference('largeCursor', 'large-white')}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold ${
                          preferences.largeCursor === 'large-white'
                            ? 'bg-white text-gray-900 border-blue-600 ring-1 ring-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        לבן ענק
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIO & FOCUS */}
              {activeTab === 'audio' && (
                <div className="space-y-3">
                  {/* Speech assistance */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-blue-700" />
                        <span className="font-bold text-blue-900">הקראה קולית מקומית</span>
                      </div>
                      {isSpeaking ? (
                        <button
                          onClick={stopSpeaking}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-md text-[11px] font-bold"
                        >
                          עצירת הקראה
                        </button>
                      ) : (
                        <button
                          onClick={() => speakText('ברוכים הבאים לאתר. מערכת הנגישות פעילה.')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold"
                        >
                          בדיקת קול
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      הדגישו כל טקסט בעמוד באמצעות העכבר והוא יוקרא אוטומטית בקול רם.
                    </p>
                  </div>

                  {/* Screen Reader Helper */}
                  <button
                    onClick={() => updatePreference('screenReaderHelper', !preferences.screenReaderHelper)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      preferences.screenReaderHelper
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>הקראת טקסט מסומן אוטומטית</span>
                    <span>{preferences.screenReaderHelper ? 'פעיל' : 'כבוי'}</span>
                  </button>

                  {/* Pause Animations */}
                  <button
                    onClick={() => updatePreference('pauseAnimations', !preferences.pauseAnimations)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      preferences.pauseAnimations
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Pause className="w-4 h-4 text-indigo-600" />
                      <span>עצירת אנימציות והבהובים (אפילפסיה)</span>
                    </div>
                    <span>{preferences.pauseAnimations ? 'פעיל' : 'כבוי'}</span>
                  </button>

                  {/* Hide Images */}
                  <button
                    onClick={() => updatePreference('hideImages', !preferences.hideImages)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      preferences.hideImages
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>הסתרת תמונות ומדיה (מצב טקסט נקי)</span>
                    <span>{preferences.hideImages ? 'פעיל' : 'כבוי'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Panel Footer: Legal & Barrier Report */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => {
                  closeToolbar();
                  openStatement();
                }}
                className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                הצהרת נגישות
              </button>
              <button
                onClick={() => {
                  closeToolbar();
                  openFeedback();
                }}
                className="flex items-center gap-1.5 text-gray-700 hover:text-red-700 font-medium py-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                דיווח על תקלה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Statement & Feedback Modals */}
      <KosAccessStatementModal />
      <KosAccessFeedbackModal />
    </>
  );
};

export const KosAccessWidget: React.FC<KosAccessWidgetProps> = (props) => {
  const context = React.useContext(KosAccessContext);
  let activeTenantId = '_master';

  try {
    const scope = useTenantScope();
    if (scope?.tenantId) {
      activeTenantId = scope.tenantId;
    }
  } catch {
    // If rendered outside TenantScopeContext
  }

  if (!context) {
    return (
      <KosAccessProvider tenantId={activeTenantId}>
        <KosAccessWidgetInner {...props} />
      </KosAccessProvider>
    );
  }

  return <KosAccessWidgetInner {...props} />;
};

export default KosAccessWidget;
