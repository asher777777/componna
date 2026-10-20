import React, { useState } from 'react';
import {
  Users,
  Target,
  Calendar,
  Sparkles,
  TrendingUp,
  Shield,
  Plus,
  Trash2,
  Video,
  MapPin,
  Heart,
  MessageCircle,
  Eye,
  CheckCircle2,
  Share2,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import {
  CommunityBlueprint,
  CommunityAffiliationType,
  CommunityEventItem,
  CommunityStoryItem,
} from '../types';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';

interface CommunityBlueprintEditorProps {
  blueprint: CommunityBlueprint;
  onChange: (updated: CommunityBlueprint) => void;
  onGenerateWithAi?: (affiliation: CommunityAffiliationType) => void;
  isAiGenerating?: boolean;
}

const AFFILIATION_OPTIONS: Array<{
  id: CommunityAffiliationType;
  title: string;
  desc: string;
  icon: string;
}> = [
  { id: 'employees', title: 'עובדים וצוות פנים-ארגוני', desc: 'שלוחת עובדים, הווי פנימי, עדכוני הנהלה וגיבוש', icon: '💼' },
  { id: 'customers', title: 'לקוחות ומועדון לקוחות VIP', desc: 'חיבור לקוחות, ערך מוסף, תמיכה והטבות אקסקלוסיביות', icon: '👑' },
  { id: 'partners', title: 'שותפים עסקיים וספקים', desc: 'סינרגיה עסקית, עדכונים מקצועיים והזדמנויות שיתוף פעולה', icon: '🤝' },
  { id: 'volunteers', title: 'מתנדבים ופעילי שטח', desc: 'תיאום פעילויות, תחושת שליחות, הוקרה וגיוס כוחות', icon: '❤️' },
  { id: 'content_consumers', title: 'צרכני תוכן ותלמידים', desc: 'למידה משותפת, מפגשי שו״ת, סיכומים והעשרה שוטפת', icon: '🎓' },
  { id: 'ambassadors', title: 'שגרירים ומפיצים', desc: 'שגרירי המותג, הפצת בשורת הארגון וקמפיינים משותפים', icon: '🚀' },
];

export const CommunityBlueprintEditor: React.FC<CommunityBlueprintEditorProps> = ({
  blueprint,
  onChange,
  onGenerateWithAi,
  isAiGenerating = false,
}) => {
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  // Sub-tab inside blueprint editor
  const [activeSection, setActiveSection] = useState<'purpose' | 'events' | 'stories' | 'growth' | 'gate'>('purpose');

  // Event creation form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('19:00');
  const [newEventType, setNewEventType] = useState<'zoom' | 'physical' | 'webinar' | 'workshop'>('zoom');
  const [newEventLocation, setNewEventLocation] = useState('');

  // Story creation form state
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryAuthor, setNewStoryAuthor] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [newStoryMediaUrl, setNewStoryMediaUrl] = useState('');

  // Growth proposal input
  const [newProposalText, setNewProposalText] = useState('');

  const updateBlueprint = (partial: Partial<CommunityBlueprint>) => {
    onChange({
      ...blueprint,
      ...partial,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    const newEvent: CommunityEventItem = {
      id: `evt_${Date.now()}`,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      date: newEventDate || new Date().toISOString().split('T')[0],
      time: newEventTime,
      type: newEventType,
      locationOrUrl: newEventLocation.trim(),
      rsvpCount: 0,
    };
    updateBlueprint({
      events: [...(blueprint.events || []), newEvent],
    });
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventLocation('');
  };

  const handleRemoveEvent = (id: string) => {
    updateBlueprint({
      events: (blueprint.events || []).filter((e) => e.id !== id),
    });
  };

  const handleAddStory = () => {
    if (!newStoryTitle.trim() || !newStoryContent.trim()) return;
    const newStory: CommunityStoryItem = {
      id: `story_${Date.now()}`,
      title: newStoryTitle.trim(),
      authorName: newStoryAuthor.trim() || 'חבר קהילה',
      storyContent: newStoryContent.trim(),
      mediaUrl: newStoryMediaUrl.trim() || undefined,
      likes: 0,
      featuredDate: new Date().toISOString().split('T')[0],
    };
    updateBlueprint({
      stories: [...(blueprint.stories || []), newStory],
    });
    setNewStoryTitle('');
    setNewStoryAuthor('');
    setNewStoryContent('');
    setNewStoryMediaUrl('');
  };

  const handleRemoveStory = (id: string) => {
    updateBlueprint({
      stories: (blueprint.stories || []).filter((s) => s.id !== id),
    });
  };

  const handleAddProposal = () => {
    if (!newProposalText.trim()) return;
    const currentProposals = blueprint.growth?.proposals || [];
    updateBlueprint({
      growth: {
        ...blueprint.growth,
        proposals: [...currentProposals, newProposalText.trim()],
      },
    });
    setNewProposalText('');
  };

  const handleRemoveProposal = (index: number) => {
    const currentProposals = [...(blueprint.growth?.proposals || [])];
    currentProposals.splice(index, 1);
    updateBlueprint({
      growth: {
        ...blueprint.growth,
        proposals: currentProposals,
      },
    });
  };

  const handleSelectMediaForStory = async () => {
    if (mediaPicker?.openPicker) {
      const selected = await mediaPicker.openPicker({ multiple: false });
      if (selected) {
        setNewStoryMediaUrl(Array.isArray(selected) ? selected[0] : selected);
      }
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Blueprint Sub-nav */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSection('purpose')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'purpose'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>1. מטרת הקהילה ושלוחתה</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('events')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'events'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>2. מפגשים ואירועים ({blueprint.events?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('stories')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'stories'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>3. סיפורים משותפים והווי ({blueprint.stories?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('growth')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'growth'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>4. מנועי צמיחה והגדלה</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('gate')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'gate'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>5. בקרת חשיפה לאורח מול חבר</span>
        </button>
      </div>

      {/* 1. Purpose & Affiliation Section */}
      {activeSection === 'purpose' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-2">
              שיוך הקהילה בארגון (קהל היעד והתפקיד)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {AFFILIATION_OPTIONS.map((opt) => {
                const isSelected = blueprint.affiliationType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateBlueprint({ affiliationType: opt.id })}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{opt.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {opt.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  מטרת הקהילה (Mission Statement)
                </label>
                {onGenerateWithAi && (
                  <button
                    type="button"
                    onClick={() => onGenerateWithAi(blueprint.affiliationType)}
                    disabled={isAiGenerating}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAiGenerating ? 'מנסח עם AI...' : 'הצע מטרה עם AI'}</span>
                  </button>
                )}
              </div>
              <textarea
                value={blueprint.mission || ''}
                onChange={(e) => updateBlueprint({ mission: e.target.value })}
                rows={3}
                placeholder="למה הקהילה הזו קיימת? מה הערך המרכזי שהחברים מקבלים בה?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                יעדים ומדדי הצלחה (Vision & Goals)
              </label>
              <textarea
                value={blueprint.visionAndGoals || ''}
                onChange={(e) => updateBlueprint({ visionAndGoals: e.target.value })}
                rows={3}
                placeholder="מהו היעד המספרי והחזון של הקהילה לשנה הקרובה? (למשל: 500 חברים, 24 מפגשי זום, סינרגיה בין מחלקות)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Events & Gathering Space */}
      {activeSection === 'events' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                  לוח אירועים ומפגשים קהילתיים
                </span>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400">
                  מפגשים אלו מוצגים בתבנית ב-KWB. קישורי ההצטרפות ייחשפו רק למשתמשים מחוברים ורשומים!
                </span>
              </div>
            </div>
          </div>

          {/* Add New Event Form */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              + הוספת מפגש או אירוע חדש
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="כותרת המפגש *"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="zoom">מפגש מקוון (Zoom / Google Meet)</option>
                <option value="webinar">וובינר / שידור חי</option>
                <option value="workshop">סדנה מעשית</option>
                <option value="physical">מפגש פיזי</option>
              </select>
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
              <input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="תיאור קצר של תוכן המפגש"
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="קישור מפגש (Zoom) או כתובת פיזית (נחשף רק לחברים!)"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs"
                />
                <Shield className="w-3.5 h-3.5 text-indigo-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddEvent}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף מפגש ללוח</span>
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-2.5">
            {(blueprint.events || []).length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                טרם הוגדרו מפגשים או אירועים. הוסיפו את המפגש הראשון למעלה.
              </div>
            ) : (
              (blueprint.events || []).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center text-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {evt.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {evt.type === 'zoom' ? 'Zoom' : evt.type === 'webinar' ? 'וובינר' : 'מפגש'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {evt.date} {evt.time ? `בשעה ${evt.time}` : ''} • {evt.description || 'ללא תיאור'}
                      </span>
                      {evt.locationOrUrl && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                          <Shield className="w-3 h-3" />
                          <span>קישור/מיקום חסוי: {evt.locationOrUrl}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(evt.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="מחק אירוע"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Stories & Shared Memories */}
      {activeSection === 'stories' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-950 dark:text-rose-200 block">
                  סיפורים משותפים, עדויות והווי קהילתי
                </span>
                <span className="text-[11px] text-rose-700 dark:text-rose-400">
                  סיפורי הצלחה ורגעי מפתח יוצרים את תחושת הגיבוש והשייכות לארגון.
                </span>
              </div>
            </div>
          </div>

          {/* Add Story Form */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              + הוספת סיפור או רגע הווי משותף
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="כותרת הסיפור *"
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
              <input
                type="text"
                placeholder="שם מספר הסיפור (חבר צוות / לקוח / מתנדב)"
                value={newStoryAuthor}
                onChange={(e) => setNewStoryAuthor(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
            <textarea
              placeholder="תוכן הסיפור / החוויה המשותפת..."
              value={newStoryContent}
              onChange={(e) => setNewStoryContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="קישור לתמונה מתוך KosCloudStore (אופציונלי)"
                value={newStoryMediaUrl}
                onChange={(e) => setNewStoryMediaUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
              <button
                type="button"
                onClick={handleSelectMediaForStory}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                בחר ענן
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddStory}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>שמור סיפור</span>
              </button>
            </div>
          </div>

          {/* Stories List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(blueprint.stories || []).length === 0 ? (
              <div className="sm:col-span-2 text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                טרם הוגדרו סיפורים משותפים.
              </div>
            ) : (
              (blueprint.stories || []).map((story) => (
                <div
                  key={story.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {story.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStory(story.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-2">
                      מאת: {story.authorName}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {story.storyContent}
                    </p>
                  </div>
                  {story.mediaUrl && (
                    <img
                      src={story.mediaUrl}
                      alt={story.title}
                      className="w-full h-28 object-cover rounded-xl mt-3 border border-slate-100 dark:border-slate-800"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Growth & Proposals */}
      {activeSection === 'growth' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                  הצעות להגדלת הקהילה ומנועי צמיחה
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  אסטרטגיות לגיוס חברים רשומים חדשים לשלוחת הארגון.
                </span>
              </div>
            </div>
          </div>

          {/* Add Proposal */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="הוסף רעיון / הצעה להגדלת הקהילה..."
              value={newProposalText}
              onChange={(e) => setNewProposalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProposal()}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={handleAddProposal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              הוסף הצעה
            </button>
          </div>

          {/* Proposals List */}
          <div className="space-y-2">
            {(blueprint.growth?.proposals || []).map((proposal, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-800 dark:text-slate-200">{proposal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProposal(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              הגדרות הצטרפות לטננט
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  אישור הצטרפות אוטומטי
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  כל משתמש רשום בטננט מקבל גישה מיידית, ללא צורך באישור ידני של מנהל הקהילה.
                </span>
              </div>
              <input
                type="checkbox"
                checked={blueprint.growth?.autoApproval ?? true}
                onChange={(e) =>
                  updateBlueprint({
                    growth: {
                      ...blueprint.growth,
                      autoApproval: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Visibility Gate */}
      {activeSection === 'gate' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block">
                  הפרדת הרשאות: מה מוסתר מאורחים ומה נחשף לחברי הקהילה
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">
                  מנגנון זה יוצר את התמריץ להירשם ולהתחבר לטננט כדי לקחת חלק במפגש.
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  הסתרת קישורי מפגשים ושידורים חיים מאורחים
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  אורח יראה רק את נושא המפגש והתאריך, אך קישור הזום/המיקום ייחשף אך ורק לחבר מחובר.
                </span>
              </div>
              <input
                type="checkbox"
                checked={blueprint.visibility?.hideMeetingLinksFromGuests ?? true}
                onChange={(e) =>
                  updateBlueprint({
                    visibility: {
                      ...blueprint.visibility,
                      hideMeetingLinksFromGuests: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  הסתרת צ'אט חי וחדר דיונים מאורחים
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  רק משתמש רשום ומאומת יוכל לשלוח הודעות ולהשתתף בצ'אט הקהילתי.
                </span>
              </div>
              <input
                type="checkbox"
                checked={blueprint.visibility?.hideLiveChatFromGuests ?? true}
                onChange={(e) =>
                  updateBlueprint({
                    visibility: {
                      ...blueprint.visibility,
                      hideLiveChatFromGuests: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  הסתרת ספריית חברי הקהילה מאורחים
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  שמירה על פרטיות חברי הארגון – אורח רואה רק את מונה החברים הכולל.
                </span>
              </div>
              <input
                type="checkbox"
                checked={blueprint.visibility?.hideMembersDirectoryFromGuests ?? true}
                onChange={(e) =>
                  updateBlueprint({
                    visibility: {
                      ...blueprint.visibility,
                      hideMembersDirectoryFromGuests: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                כותרת כפתור הרשמה / הצטרפות עבור אורח (CTA)
              </label>
              <input
                type="text"
                placeholder="למשל: התחברות / הצטרפות לשלוחת הקהילה"
                value={blueprint.visibility?.guestJoinCtaText || 'הצטרפות לקהילת הארגון'}
                onChange={(e) =>
                  updateBlueprint({
                    visibility: {
                      ...blueprint.visibility,
                      guestJoinCtaText: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
