import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Send, Image, Type, Eye, Clock, CheckCircle,
  AlertCircle, RefreshCw, Trash2, ExternalLink, Play, Film,
  Users, Palette, ChevronRight, ChevronLeft, ShieldCheck, Database,
  Search, Filter, Smartphone, CheckCheck, X
} from 'lucide-react';
import { Firestore } from 'firebase/firestore';
import { GreenApiService } from '../services/greenApiService';
import {
  GreenApiStatusFont,
  SavedWhatsAppStatus,
  GreenApiStatusStatisticItem
} from '../types';
import {
  saveStatusToArchive,
  loadStatusesFromArchive,
  updateStatusStatisticsInArchive,
  deleteStatusFromArchive
} from '../services/whatsappStatusService';

interface Props {
  service: GreenApiService;
  db?: Firestore;
  collectionName?: string;
  isDark: boolean;
  connectedAccountName?: string;
  googleAiApiKey?: string;
}

const PRESET_COLORS = [
  '#075E54', '#128C7E', '#25D366', '#8E24AA',
  '#E91E63', '#FF5722', '#34B7F1', '#000000',
  '#1E293B', '#D32F2F', '#5C6BC0', '#F57C00'
];

const PRESET_FONTS: { id: GreenApiStatusFont; name: string; family: string }[] = [
  { id: 'SANS_SERIF', name: 'Sans-Serif (ברירת מחדל)', family: 'sans-serif' },
  { id: 'SERIF', name: 'Serif (קלאסי)', family: 'serif' },
  { id: 'NORICAN_REGULAR', name: 'Norican (קליגרפי)', family: 'cursive' },
  { id: 'BRYNDAN_WRITE', name: 'Bryndan (כתב יד)', family: 'cursive' },
  { id: 'OSWALD_HEAVY', name: 'Oswald (מודגש כותרת)', family: 'impact, sans-serif' },
];

export const WhatsAppStatusesTab: React.FC<Props> = ({
  service,
  db,
  collectionName = 'whatsapp_statuses',
  isDark,
  connectedAccountName = 'חשבון WhatsApp',
  googleAiApiKey,
}) => {
  // Mode: 'create' | 'archive' | 'analytics'
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'archive'>('create');

  // Creator state
  const [statusType, setStatusType] = useState<'text' | 'media'>('text');
  const [textMessage, setTextMessage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#128C7E');
  const [font, setFont] = useState<GreenApiStatusFont>('SANS_SERIF');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('status.jpg');
  const [mediaCaption, setMediaCaption] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'custom'>('all');
  const [customParticipantsInput, setCustomParticipantsInput] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; msg: string; idMessage?: string } | null>(null);

  // Statuses storage list
  const [statuses, setStatuses] = useState<SavedWhatsAppStatus[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Story Viewer Modal
  const [viewingStory, setViewingStory] = useState<SavedWhatsAppStatus | null>(null);

  // Viewers Details Modal
  const [viewersModalStatus, setViewersModalStatus] = useState<SavedWhatsAppStatus | null>(null);

  // Filter & Search in Archive
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // AI Prompt State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState('');

  // Load archive on mount / when db changes
  useEffect(() => {
    setIsLoadingArchive(true);
    loadStatusesFromArchive(db, collectionName)
      .then((items) => {
        setStatuses(items);
      })
      .finally(() => {
        setIsLoadingArchive(false);
      });
  }, [db, collectionName]);

  // Active stories (created within last 24 hours)
  const now = Date.now();
  const activeStories = useMemo(() => {
    return statuses.filter((s) => s.expiresAt > now);
  }, [statuses, now]);

  const expiredStories = useMemo(() => {
    return statuses.filter((s) => s.expiresAt <= now);
  }, [statuses, now]);

  // Filtered statuses list for archive table/grid
  const filteredStatuses = useMemo(() => {
    return statuses.filter((s) => {
      const isActive = s.expiresAt > now;
      if (filterType === 'active' && !isActive) return false;
      if (filterType === 'expired' && isActive) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const msg = (s.message || s.caption || s.fileName || '').toLowerCase();
        const id = s.id.toLowerCase();
        if (!msg.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [statuses, filterType, searchTerm, now]);

  // Overall statistics KPI
  const totalViews = useMemo(() => {
    return statuses.reduce((acc, s) => acc + (s.viewersCount || 0), 0);
  }, [statuses]);

  // Refresh stats for all active statuses from GREEN-API
  const handleRefreshAllStatistics = async () => {
    if (!service.isConfigured()) return;
    setIsRefreshingStats(true);
    try {
      const updatedStatuses = [...statuses];
      for (const st of updatedStatuses) {
        // Only query statistics for statuses that have an id
        if (st.id) {
          try {
            const stats = await service.getStatusStatistic(st.id);
            if (Array.isArray(stats)) {
              const viewersCount = stats.filter((s) => s.status === 'read').length;
              const deliveredCount = stats.filter((s) => s.status === 'delivered').length;
              const sentCount = stats.filter((s) => s.status === 'sent').length;

              st.statistics = stats;
              st.viewersCount = viewersCount;
              st.deliveredCount = deliveredCount;
              st.sentCount = sentCount;
              st.lastSyncedAt = Date.now();

              // Save updated statistics to Firestore
              await updateStatusStatisticsInArchive(db, collectionName, st.id, stats);
            }
          } catch (err) {
            console.warn(`Failed to refresh stats for status ${st.id}:`, err);
          }
        }
      }
      setStatuses([...updatedStatuses]);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  // Publish Status to WhatsApp
  const handlePublishStatus = async () => {
    if (!service.isConfigured()) {
      alert('GREEN-API אינו מחובר. אנא ודא חיבור ברכיב הסנכרון וההגדרות.');
      return;
    }

    if (statusType === 'text' && !textMessage.trim()) {
      alert('נא להזין תוכן לסטטוס הטקסט');
      return;
    }

    if (statusType === 'media' && !mediaUrl.trim()) {
      alert('נא להזין קישור ישיר לתמונה או לווידאו');
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    const participants =
      targetAudience === 'custom' && customParticipantsInput.trim()
        ? customParticipantsInput
            .split(/[\n,;]+/)
            .map((p) => p.trim().replace(/\D/g, ''))
            .filter((p) => p.length >= 7)
            .map((p) => (p.includes('@c.us') ? p : `${p}@c.us`))
        : undefined;

    try {
      let res: any;
      if (statusType === 'text') {
        res = await service.sendTextStatus({
          message: textMessage.trim(),
          backgroundColor,
          font,
          participants,
        });
      } else {
        res = await service.sendMediaStatus({
          urlFile: mediaUrl.trim(),
          fileName: fileName.trim() || 'status.jpg',
          caption: mediaCaption.trim() || undefined,
          participants,
        });
      }

      const idMessage = res?.idMessage || `status_${Date.now()}`;
      const publishedAt = Date.now();
      const expiresAt = publishedAt + 24 * 60 * 60 * 1000; // 24 hours lifetime in WhatsApp

      const newSavedStatus: SavedWhatsAppStatus = {
        id: idMessage,
        type: statusType,
        message: statusType === 'text' ? textMessage.trim() : undefined,
        urlFile: statusType === 'media' ? mediaUrl.trim() : undefined,
        fileName: statusType === 'media' ? fileName.trim() : undefined,
        caption: statusType === 'media' ? mediaCaption.trim() : undefined,
        backgroundColor: statusType === 'text' ? backgroundColor : undefined,
        font: statusType === 'text' ? font : undefined,
        createdAt: publishedAt,
        expiresAt,
        accountName: connectedAccountName,
        viewersCount: 0,
        deliveredCount: 0,
        sentCount: 0,
        statistics: [],
        lastSyncedAt: publishedAt,
      };

      // Save permanently to Firestore & localStorage
      await saveStatusToArchive(db, collectionName, newSavedStatus);
      setStatuses((prev) => [newSavedStatus, ...prev]);

      setPublishResult({
        success: true,
        msg: 'הסטטוס פורסם בהצלחה בוואטסאפ ונשמר לצמיתות בארכיון!',
        idMessage,
      });

      // Clear input fields
      if (statusType === 'text') {
        setTextMessage('');
      } else {
        setMediaUrl('');
        setMediaCaption('');
      }
    } catch (err: any) {
      setPublishResult({
        success: false,
        msg: `שגיאה בפרסום הסטטוס: ${err.message || 'שגיאת רשת'}`,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Generate AI Status Copy
  const handleGenerateAiStatus = async () => {
    if (!googleAiApiKey) {
      alert('מפתח Google AI (Gemini) אינו מוגדר. ניתן להגדירו ברכיב הסנכרון והחיבורים.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const prompt = `Write an engaging, viral, high-converting WhatsApp status (Story) in Hebrew for a business/community about: "${aiPromptTopic || 'עדכון חשוב ומבצע מיוחד לקהל הלקוחות'}". Keep it under 200 characters, punchy, with relevant emojis and a clear call to action. Return ONLY the Hebrew status text without explanations or quotes.`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleAiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          if (statusType === 'text') {
            setTextMessage(text);
          } else {
            setMediaCaption(text);
          }
        }
      }
    } catch (e: any) {
      alert(`שגיאה ביצירת תוכן AI: ${e.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDeleteStatus = async (statusId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('האם למחוק סטטוס זה מהארכיון השמור?')) return;
    await deleteStatusFromArchive(db, collectionName, statusId);
    setStatuses((prev) => prev.filter((s) => s.id !== statusId));
  };

  return (
    <div className="space-y-6 text-xs" dir="rtl">
      
      {/* Top Header & Analytics KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* KPI 1: Active Stories */}
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center gap-3.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">סטטוסים פעילים (24h)</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-emerald-400">{activeStories.length}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">באוויר</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Views */}
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center gap-3.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">סך צפיות שנרשמו</span>
            <span className="text-xl font-black text-indigo-400">{totalViews}</span>
          </div>
        </div>

        {/* KPI 3: Permanently Archived */}
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center gap-3.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">ארכיון קבוע שמור</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-purple-400">{statuses.length}</span>
              <span className="text-[10px] text-slate-400 font-mono">Firestore</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Refresh Action */}
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center justify-between gap-2 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">מעקב צפיות וסטטיסטיקה</span>
            <span className="text-[10px] text-slate-500">נתונים בזמן אמת</span>
          </div>
          <button
            onClick={handleRefreshAllStatistics}
            disabled={isRefreshingStats}
            className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow transition cursor-pointer disabled:opacity-50"
            title="רענן נתוני צפיות מ-WhatsApp"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingStats ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Active Stories Carousel / Story Rings Bar */}
      {activeStories.length > 0 && (
        <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>סטטוסים פעילים כרגע בוואטסאפ (WhatsApp Stories)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              מוצגים למשך 24 שעות • נשמרים לצמיתות במערכת
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {activeStories.map((story) => {
              const remainingMs = Math.max(0, story.expiresAt - now);
              const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
              const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <div
                  key={story.id}
                  onClick={() => setViewingStory(story)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 shadow-md group-hover:scale-105 transition-transform duration-200">
                    <div
                      className="w-16 h-16 rounded-full border-2 border-slate-950 flex items-center justify-center overflow-hidden text-center p-1 text-[9px] font-bold text-white shadow-inner"
                      style={{
                        backgroundColor: story.backgroundColor || '#128C7E',
                        backgroundImage: story.urlFile ? `url(${story.urlFile})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!story.urlFile && (
                        <span className="line-clamp-2 px-1 leading-tight">
                          {story.message || 'סטטוס'}
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 p-0.5 bg-emerald-600 rounded-full border border-slate-950 text-white">
                      <Eye className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  <span className="text-[10px] font-bold truncate max-w-[70px]">
                    {story.viewersCount || 0} צפיות
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono -mt-1">
                    {remainingHours}h {remainingMinutes}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tabs Navigation: Create vs Archive */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('create')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'create'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>🚀 פרסום ויצירת סטטוס חדש</span>
        </button>

        <button
          onClick={() => setActiveSubTab('archive')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'archive'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>📦 ארכיון קבוע ומעקב צפיות ({statuses.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: CREATE & PUBLISH STATUS STUDIO */}
      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form (7 Cols) */}
          <div className={`lg:col-span-7 p-5 rounded-3xl border space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Status Type Selector */}
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>סטודיו יצירת סטטוס לוואטסאפ</span>
              </span>

              <div className="flex gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusType('text')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    statusType === 'text'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>סטטוס טקסט</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusType('media')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    statusType === 'media'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>מדיה (תמונה / וידאו)</span>
                </button>
              </div>
            </div>

            {/* AI Generator Bar */}
            {googleAiApiKey && (
              <div className={`p-3 rounded-2xl border flex items-center gap-2 ${
                isDark ? 'bg-indigo-950/20 border-indigo-800/40' : 'bg-indigo-50 border-indigo-200'
              }`}>
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={aiPromptTopic}
                  onChange={(e) => setAiPromptTopic(e.target.value)}
                  placeholder="כתוב נושא לסטטוס שיווקי (למשל: מבצע חג, פתיחת קורס, ברכת שבוע טוב)..."
                  className={`flex-1 p-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleGenerateAiStatus}
                  disabled={isGeneratingAi}
                  className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'מייצר...' : 'צור עם AI'}</span>
                </button>
              </div>
            )}

            {/* Form Fields: Text Status */}
            {statusType === 'text' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-300">תוכן הסטטוס (עד 500 תווים)</label>
                    <span className={`text-[10px] font-mono ${textMessage.length > 450 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {textMessage.length} / 500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    placeholder="הקלד כאן את תוכן הסטטוס לוואטסאפ..."
                    className={`w-full p-3 rounded-2xl border text-sm font-medium ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Color Palette Selector */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">צבע רקע לסטטוס</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBackgroundColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                          backgroundColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                      title="בחר צבע מותאם אישית"
                    />
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">גופן (Font Style)</label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value as GreenApiStatusFont)}
                    className={`w-full p-2.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {PRESET_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Form Fields: Media Status */}
            {statusType === 'media' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">קישור ישיר לקובץ מדיה (תמונה / וידאו)</label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg או https://example.com/video.mp4"
                    className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">שם הקובץ</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="status.jpg"
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">כיתוב למדיה (Caption)</label>
                    <input
                      type="text"
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      placeholder="כיתוב שיופיע תחת המדיה..."
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Target Audience */}
            <div className="border-t border-slate-800/40 pt-3 space-y-2">
              <label className="block font-semibold text-slate-300">קהל יעד לצפייה בסטטוס</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'all'}
                    onChange={() => setTargetAudience('all')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>כל אנשי הקשר הרשומים (ברירת מחדל של WhatsApp)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'custom'}
                    onChange={() => setTargetAudience('custom')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>רשימת נמענים ספציפית</span>
                </label>
              </div>

              {targetAudience === 'custom' && (
                <textarea
                  rows={2}
                  value={customParticipantsInput}
                  onChange={(e) => setCustomParticipantsInput(e.target.value)}
                  placeholder="הזן מספרי טלפון מופרדים בפסיקים או שורות חדשות (לדוגמה: 972501234567, 972521234567)..."
                  className={`w-full p-2 rounded-xl border text-xs font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  dir="ltr"
                />
              )}
            </div>

            {/* Publish Feedback */}
            {publishResult && (
              <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 ${
                publishResult.success
                  ? isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                {publishResult.success ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                <div className="text-xs">
                  <p className="font-bold">{publishResult.msg}</p>
                  {publishResult.idMessage && (
                    <span className="text-[10px] font-mono opacity-80">מזהה הודעה: {publishResult.idMessage}</span>
                  )}
                </div>
              </div>
            )}

            {/* Publish Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePublishStatus}
                disabled={isPublishing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span>{isPublishing ? 'מפרסם סטטוס לוואטסאפ...' : '🚀 פרסם סטטוס לוואטסאפ כעת'}</span>
              </button>
            </div>

          </div>

          {/* Right Live Smartphone Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>תצוגה מקדימה חיה של הסטטוס (WhatsApp Story)</span>
            </span>

            {/* Smartphone Mockup Frame */}
            <div className="w-72 h-[480px] rounded-[40px] border-4 border-slate-700 bg-slate-950 shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden">
              
              {/* Phone Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20" />

              {/* Story Content Viewport */}
              <div
                className="w-full h-full rounded-[32px] overflow-hidden flex flex-col justify-between p-4 relative text-white"
                style={{
                  backgroundColor: statusType === 'text' ? backgroundColor : '#000000',
                  backgroundImage: statusType === 'media' && mediaUrl ? `url(${mediaUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Story Top Bar Progress Indicators */}
                <div className="w-full flex gap-1 z-10 pt-4">
                  <div className="h-1 bg-white rounded-full flex-1 animate-pulse" />
                </div>

                {/* Story Account Header */}
                <div className="flex items-center gap-2 z-10 pt-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs border border-white/40">
                    WA
                  </div>
                  <div>
                    <span className="block font-bold text-xs leading-none drop-shadow">{connectedAccountName}</span>
                    <span className="text-[9px] text-white/80 drop-shadow">כרגע</span>
                  </div>
                </div>

                {/* Center Content */}
                <div className="my-auto text-center px-3 z-10">
                  {statusType === 'text' ? (
                    <p
                      className="text-base font-bold whitespace-pre-wrap leading-relaxed drop-shadow-md break-words"
                      style={{
                        fontFamily: PRESET_FONTS.find((f) => f.id === font)?.family || 'sans-serif',
                      }}
                    >
                      {textMessage || 'הקלד טקסט לתצוגה מקדימה...'}
                    </p>
                  ) : !mediaUrl ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
                      <Image className="w-12 h-12" />
                      <span className="text-xs">הזן קישור תמונה או וידאו</span>
                    </div>
                  ) : null}
                </div>

                {/* Bottom Caption */}
                {statusType === 'media' && mediaCaption && (
                  <div className="z-10 bg-black/60 backdrop-blur-sm p-2 rounded-xl text-center text-xs">
                    <p className="leading-snug">{mediaCaption}</p>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: PERMANENT ARCHIVE & FULL VIEWER TRACKING */}
      {activeSubTab === 'archive' && (
        <div className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Header & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/40 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm">ארכיון סטטוסים ומעקב צפיות מלא</h3>
                <span className="text-[11px] text-slate-400">
                  כל הסטטוסים, התמונות והצפיות נשמרים לצמיתות ב-Firestore גם לאחר 24 שעות
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="חפש בארכיון..."
                  className={`pr-8 pl-3 py-1.5 rounded-xl text-xs border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  הכל ({statuses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('active')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filterType === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  פעילים ({activeStories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('expired')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filterType === 'expired' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ארכיון ({expiredStories.length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleRefreshAllStatistics}
                disabled={isRefreshingStats}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin' : ''}`} />
                <span>סנכרן צפיות</span>
              </button>
            </div>
          </div>

          {/* Status List Grid */}
          {filteredStatuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
              <Smartphone className="w-10 h-10 opacity-30 text-emerald-400" />
              <p className="font-bold">לא נמצאו סטטוסים בארכיון</p>
              <p className="text-[11px] opacity-75">סטטוסים שתפרסם יישמרו כאן אוטומטית לצמיתות עם נתוני הצפיות שלהם</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredStatuses.map((st) => {
                const isActive = st.expiresAt > now;
                const remainingMs = Math.max(0, st.expiresAt - now);
                const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));

                return (
                  <div
                    key={st.id}
                    onClick={() => setViewingStory(st)}
                    className={`p-4 rounded-2xl border shadow-sm transition hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isDark ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Type & Lifetime status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'}`} />
                        <span>{isActive ? `פעיל בוואטסאפ (${remainingHours}h)` : 'בארכיון קבוע'}</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(st.createdAt).toLocaleDateString('he-IL', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div
                      className="h-28 rounded-xl flex items-center justify-center p-3 text-center text-white font-bold text-xs relative overflow-hidden shadow-inner"
                      style={{
                        backgroundColor: st.backgroundColor || '#128C7E',
                        backgroundImage: st.urlFile ? `url(${st.urlFile})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {st.type === 'text' ? (
                        <p className="line-clamp-3 whitespace-pre-wrap leading-tight drop-shadow">
                          {st.message}
                        </p>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white/80 group-hover:scale-125 transition-transform" />
                        </div>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-2 text-xs">
                      {/* Viewers Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewersModalStatus(st);
                        }}
                        className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                        title="צפה ברשימת האנשים שצפו בסטטוס"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{st.viewersCount || 0} צפיות</span>
                        <span className="text-[10px] text-slate-500">({st.deliveredCount || 0} נמסרו)</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteStatus(st.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="מחק מהארכיון"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* FULL-SCREEN WHATSAPP STORY VIEWER MODAL */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="w-full max-w-sm h-[600px] rounded-[36px] overflow-hidden flex flex-col justify-between p-5 relative text-white shadow-2xl border border-slate-700"
            style={{
              backgroundColor: viewingStory.backgroundColor || '#075E54',
              backgroundImage: viewingStory.urlFile ? `url(${viewingStory.urlFile})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top Bar */}
            <div className="w-full space-y-2 z-10">
              <div className="h-1 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs border border-white">
                    WA
                  </div>
                  <div>
                    <span className="block font-bold text-sm leading-none drop-shadow">{connectedAccountName}</span>
                    <span className="text-[10px] text-white/80 drop-shadow">
                      {new Date(viewingStory.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingStory(null)}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Story Content */}
            <div className="my-auto text-center px-4 z-10">
              {viewingStory.type === 'text' && (
                <p
                  className="text-xl font-bold whitespace-pre-wrap leading-relaxed drop-shadow-lg"
                  style={{
                    fontFamily: PRESET_FONTS.find((f) => f.id === viewingStory.font)?.family || 'sans-serif',
                  }}
                >
                  {viewingStory.message}
                </p>
              )}
            </div>

            {/* Bottom Bar: Views & Caption */}
            <div className="z-10 space-y-2">
              {viewingStory.caption && (
                <div className="bg-black/60 backdrop-blur-sm p-3 rounded-2xl text-center text-xs">
                  <p>{viewingStory.caption}</p>
                </div>
              )}

              <div
                onClick={() => {
                  setViewersModalStatus(viewingStory);
                }}
                className="bg-black/70 backdrop-blur-sm p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-black/80 transition"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">{viewingStory.viewersCount || 0} אנשים צפו בסטטוס</span>
                </div>
                <span className="text-[11px] text-indigo-400 font-semibold underline">פרטי הצופים</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEWERS ACTIVITY DETAILS MODAL */}
      {viewersModalStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">מעקב צפיות בסטטוס (WhatsApp Activity)</h3>
                  <span className="text-[10px] text-slate-400 font-mono">מזהה: {viewersModalStatus.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewersModalStatus(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewer Counts Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="block text-emerald-400 font-bold text-lg">{viewersModalStatus.viewersCount || 0}</span>
                <span className="text-[10px] font-sans">צפו (Read)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="block text-indigo-400 font-bold text-lg">{viewersModalStatus.deliveredCount || 0}</span>
                <span className="text-[10px] font-sans">נמסרו (Delivered)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <span className="block text-slate-300 font-bold text-lg">{viewersModalStatus.sentCount || 0}</span>
                <span className="text-[10px] font-sans">נשלחו (Sent)</span>
              </div>
            </div>

            {/* Viewers List */}
            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-800/20 max-h-64">
              {(!viewersModalStatus.statistics || viewersModalStatus.statistics.length === 0) ? (
                <div className="p-6 text-center text-slate-500 text-xs space-y-1">
                  <Eye className="w-8 h-8 mx-auto opacity-40 text-emerald-400 mb-1" />
                  <p className="font-bold">טרם נרשמו צפיות או שהנתונים טרם סונכרנו</p>
                  <p className="text-[11px] opacity-75">לחץ על כפתור הסנכרון כדי למשוך את שמות וזמני הצופים מ-GREEN-API</p>
                </div>
              ) : (
                viewersModalStatus.statistics.map((st, i) => (
                  <div key={i} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                        st.status === 'read' ? 'bg-emerald-600' : 'bg-indigo-600'
                      }`}>
                        {st.status === 'read' ? <CheckCheck className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-mono font-bold block" dir="ltr">{st.participant}</span>
                        <span className="text-[10px] text-slate-400">
                          {st.status === 'read' ? '👁️ צפה בסטטוס' : st.status === 'delivered' ? '✓✓ נמסר למכשיר' : '✓ נשלח'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {st.timestamp
                        ? new Date(st.timestamp * 1000).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : ''}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800/40">
              <button
                type="button"
                onClick={() => setViewersModalStatus(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
