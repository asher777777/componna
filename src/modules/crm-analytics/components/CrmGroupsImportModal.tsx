import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, MessageSquare, Check, X, RefreshCw, CheckCircle2, 
  AlertCircle, Sparkles, Layers, ArrowRight, ShieldCheck,
  Search, CheckSquare, Square, FolderPlus, Tag, Smartphone,
  ExternalLink, UserPlus, Filter
} from 'lucide-react';
import { FirebaseApp } from 'firebase/app';
import { eventBus } from '../../../core/bridge/EventBus';
import { DEFAULT_COLLECTIONS } from '../config';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { 
  WhatsAppGroupItem, 
  WhatsAppParticipant, 
  checkWhatsAppConnection, 
  fetchLiveWhatsAppGroups, 
  fetchGroupParticipants, 
  importParticipantsToCrmContacts, 
  normalizePhoneNumber 
} from '../services/whatsappGroupImportService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  firebaseApp?: FirebaseApp;
  collections?: typeof DEFAULT_COLLECTIONS;
  ownerId?: string;
  tenantId?: string;
}

export const CrmGroupsImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportComplete,
  firebaseApp,
  collections = DEFAULT_COLLECTIONS,
  ownerId,
  tenantId = '_master',
}) => {
  const { apiKeys } = useSystemConnection();

  // Connection settings
  const [instanceId, setInstanceId] = useState(apiKeys?.greenApiInstanceId || '');
  const [token, setToken] = useState(apiKeys?.greenApiToken || '');
  const [isCheckingConn, setIsCheckingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<{ authorized: boolean; message: string }>({
    authorized: false,
    message: 'בודק חיבור...'
  });

  // Groups
  const [groups, setGroups] = useState<WhatsAppGroupItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<WhatsAppGroupItem | null>(null);

  // Participants
  const [participants, setParticipants] = useState<WhatsAppParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);

  // Target CRM Mapping
  const [communityName, setCommunityName] = useState('');
  const [extraTagsInput, setExtraTagsInput] = useState('וואטסאפ');
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state when apiKeys update
  useEffect(() => {
    if (apiKeys?.greenApiInstanceId) setInstanceId(apiKeys.greenApiInstanceId);
    if (apiKeys?.greenApiToken) setToken(apiKeys.greenApiToken);
  }, [apiKeys]);

  // Check connection & load groups
  const checkAndLoad = async () => {
    if (!instanceId || !token) {
      setConnStatus({ authorized: false, message: 'לא הוגדרו מפתחות חיבור ל-WhatsApp' });
      return;
    }

    setIsCheckingConn(true);
    setLoadingGroups(true);
    try {
      const conn = await checkWhatsAppConnection(instanceId, token);
      setConnStatus(conn);
      if (conn.authorized) {
        const fetchedGroups = await fetchLiveWhatsAppGroups(instanceId, token);
        setGroups(fetchedGroups);
        if (fetchedGroups.length > 0 && !selectedGroup) {
          handleSelectGroup(fetchedGroups[0]);
        }
      }
    } finally {
      setIsCheckingConn(false);
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkAndLoad();
    }
  }, [isOpen, instanceId, token]);

  const handleSelectGroup = async (group: WhatsAppGroupItem) => {
    setSelectedGroup(group);
    setCommunityName(group.name);
    setLoadingParticipants(true);
    setFeedback(null);
    try {
      const parts = await fetchGroupParticipants(instanceId, token, group.id);
      setParticipants(parts);
      // Select all by default
      setSelectedPhones(parts.map(p => p.phone).filter(Boolean));
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedPhones.length === filteredParticipants.length) {
      setSelectedPhones([]);
    } else {
      setSelectedPhones(filteredParticipants.map(p => p.phone).filter(Boolean));
    }
  };

  const handleToggleParticipant = (phone: string) => {
    setSelectedPhones(prev => 
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    );
  };

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return groups;
    return groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()));
  }, [groups, groupSearch]);

  const filteredParticipants = useMemo(() => {
    if (!participantSearch.trim()) return participants;
    const q = participantSearch.toLowerCase();
    return participants.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      p.phone.includes(q)
    );
  }, [participants, participantSearch]);

  const handleExecuteImport = async () => {
    if (!communityName.trim()) {
      setFeedback({ type: 'error', message: 'נא להזין שם קהילה או קבוצה' });
      return;
    }

    const targetParticipants = participants.filter(p => selectedPhones.includes(p.phone));
    if (targetParticipants.length === 0) {
      setFeedback({ type: 'error', message: 'לא נבחרו משתתפים לייבוא' });
      return;
    }

    setIsImporting(true);
    setFeedback(null);
    try {
      const extraTags = extraTagsInput
        .split(/[,;\s]+/)
        .map(t => t.trim())
        .filter(Boolean);

      const res = await importParticipantsToCrmContacts(
        firebaseApp,
        collections.contacts,
        targetParticipants,
        communityName.trim(),
        extraTags,
        ownerId
      );

      // Notify EventBus
      eventBus.publish('crm:groups:import_completed', {
        importedCount: res.createdCount,
        groupsCount: 1,
        timestamp: new Date().toISOString(),
      });

      setFeedback({
        type: 'success',
        message: `ייבוא הושלם בהצלחה! ${res.createdCount} משתתפים שויכו לקהילת "${communityName}".`,
      });

      setTimeout(() => {
        onImportComplete();
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `שגיאה בייבוא: ${err?.message || 'שגיאה לא צפויה'}`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 w-screen h-screen z-50 bg-white dark:bg-gray-950 flex flex-col overflow-hidden text-right select-none animate-fadeIn" 
      dir="rtl"
    >
      {/* 100% Full-Screen Header */}
      <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                ייבוא אנשי קשר וקבוצות מ-WhatsApp
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                connStatus.authorized
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${connStatus.authorized ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{connStatus.message}</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              סנכרון מלא של קבוצות, חילוץ משתתפים ומספרי טלפון, ושיוך מאובטח ל-CRM
            </p>
          </div>
        </div>

        {/* Exit Button: Exits ONLY via X button */}
        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition shadow-xs"
          title="סגור חלון (יציאה)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Full-Screen Body */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-gray-50/50 dark:bg-gray-950/50">
        
        {/* Right Pane: WhatsApp Groups List (Col 4) */}
        <div className="lg:col-span-4 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full overflow-hidden">
          {/* Search & Refresh Bar */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>קבוצות WhatsApp פעילות ({groups.length})</span>
              </span>
              <button
                onClick={checkAndLoad}
                disabled={loadingGroups || isCheckingConn}
                className="p-1.5 text-xs text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                title="רענן רשימת קבוצות"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingGroups ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש קבוצה לפי שם..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full pr-8 pl-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Groups List Scroll */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loadingGroups ? (
              <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                <span>טוען קבוצות מחשבון ה-WhatsApp...</span>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700" />
                <p>לא נמצאו קבוצות וואטסאפ זמינות בחשבון המחובר.</p>
                {!connStatus.authorized && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    וודא שחשבון ה-WhatsApp מקושר ומאושר בהגדרות המערכת.
                  </p>
                )}
              </div>
            ) : (
              filteredGroups.map(group => {
                const isSelected = selectedGroup?.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className={`w-full text-right p-3 rounded-2xl border transition flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 shadow-xs'
                        : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{group.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">{group.id}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Left/Center Pane: Group Participants & Import Config (Col 8) */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
          {selectedGroup ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Selected Group Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 dark:bg-gray-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">
                      {selectedGroup.name}
                    </h2>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      סך הכל {participants.length} משתתפים נסרקו | נבחרו {selectedPhones.length} לייבוא
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSelectAll}
                    className="px-3 py-1.5 text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition flex items-center gap-1.5"
                  >
                    {selectedPhones.length === filteredParticipants.length ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>בטל בחירה</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>בחר הכל ({filteredParticipants.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CRM Destination Configuration Box */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                    <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>שם הקהילה / הקבוצה ב-CRM *</span>
                  </label>
                  <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    placeholder="שם הקהילה ב-CRM..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>תגיות נוספות (מופרדות בפסיקים)</span>
                  </label>
                  <input
                    type="text"
                    value={extraTagsInput}
                    onChange={(e) => setExtraTagsInput(e.target.value)}
                    placeholder="וואטסאפ, קהילת תורמים, פעילים..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div className={`mx-4 mt-3 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fadeIn ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span className="font-semibold">{feedback.message}</span>
                  </div>
                  <button onClick={() => setFeedback(null)} className="font-bold opacity-60 hover:opacity-100">✕</button>
                </div>
              )}

              {/* Participants Filter & List */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="חיפוש משתתף לפי שם או טלפון..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <span className="text-xs text-gray-400">
                  נבחרו {selectedPhones.length} מתוך {filteredParticipants.length}
                </span>
              </div>

              {/* Participants Scroll Table */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingParticipants ? (
                  <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span>מושך משתתפים מקבוצת ה-WhatsApp...</span>
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400">
                    לא נמצאו משתתפים העונים לחיפוש בקבוצה זו.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredParticipants.map(participant => {
                      const isChecked = selectedPhones.includes(participant.phone);
                      return (
                        <div
                          key={participant.phone || participant.chatId}
                          onClick={() => handleToggleParticipant(participant.phone)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {participant.name || 'משתתף WhatsApp'}
                                {participant.isAdmin && (
                                  <span className="mr-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                    מנהל
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate" dir="ltr">
                                {participant.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between gap-4 shrink-0 shadow-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white">{selectedPhones.length}</span> משתתפים יתווספו/יעודכנו בקהילת <span className="font-bold text-emerald-600">"{communityName || selectedGroup.name}"</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    disabled={isImporting || selectedPhones.length === 0}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                    <span>{isImporting ? 'מייבא משתתפים...' : `ייבא ${selectedPhones.length} אנשי קשר ל-CRM`}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-3">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-700" />
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                בחר קבוצת WhatsApp מהתפריט לצפייה במשתתפים
              </h3>
              <p className="text-xs text-gray-400 max-w-sm">
                בחר קבוצה מהרשימה בצד ימין כדי לטעון את כל המשתתפים, לסמן את מי לייבא, ולשייך אותם לקהילה ב-CRM.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
