import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  Users,
  RefreshCw,
  Search,
  Check,
  CheckSquare,
  Square,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Shield,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import {
  checkWhatsAppConnectionStatus,
  fetchWhatsAppGroups,
  fetchWhatsAppGroupParticipants,
  importWhatsAppParticipantsToCrm,
} from '../services/whatsappService';
import { normalizePhoneNumber } from '../services/groupsUtils';
import { WhatsAppConnectionInfo, WhatsAppGroupItem, WhatsAppGroupParticipant } from '../types';
import { PRESET_COLORS } from '../config';

interface WhatsAppGroupImportViewProps {
  onBackToManage: () => void;
}

export const WhatsAppGroupImportView: React.FC<WhatsAppGroupImportViewProps> = ({
  onBackToManage,
}) => {
  const { db, ownerId, groups, contacts, refreshData, greenApiConfig } = useCrmGroups();

  const [connection, setConnection] = useState<WhatsAppConnectionInfo>({ status: 'checking' });
  const [checkingConn, setCheckingConn] = useState(false);

  // Group list
  const [waGroups, setWaGroups] = useState<WhatsAppGroupItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Selected group details
  const [selectedGroupDetails, setSelectedGroupDetails] = useState<{
    groupName: string;
    groupId: string;
    participants: WhatsAppGroupParticipant[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');

  // Target Community
  const [targetMode, setTargetMode] = useState<'new' | 'existing'>('new');
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityColor, setNewCommunityColor] = useState(PRESET_COLORS[0]);
  const [selectedExistingName, setSelectedExistingName] = useState('');
  const [extraTagsInput, setExtraTagsInput] = useState('');

  // Import execution
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    createdCount: number;
    updatedCount: number;
    totalProcessed: number;
  } | null>(null);

  // 1. Check connection
  const checkConn = useCallback(async () => {
    setCheckingConn(true);
    try {
      const res = await checkWhatsAppConnectionStatus(greenApiConfig);
      setConnection(res);
    } catch (err: any) {
      setConnection({ status: 'error', error: err.message });
    } finally {
      setCheckingConn(false);
    }
  }, [greenApiConfig]);

  useEffect(() => {
    checkConn();
  }, [checkConn]);

  // 2. Fetch groups
  const loadWaGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const list = await fetchWhatsAppGroups(greenApiConfig);
      setWaGroups(list);
    } catch (err) {
      console.warn('Error fetching groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, [greenApiConfig]);

  useEffect(() => {
    if (connection.status === 'authorized' && waGroups.length === 0) {
      loadWaGroups();
    }
  }, [connection.status, waGroups.length, loadWaGroups]);

  // 3. Select Group & Load Participants
  const handleSelectGroup = async (group: WhatsAppGroupItem) => {
    setSelectedGroupId(group.id);
    setLoadingDetails(true);
    setNewCommunityName(group.name);
    setImportResult(null);

    try {
      const participants = await fetchWhatsAppGroupParticipants(group.id, greenApiConfig);

      // Check which contacts already exist in CRM by normalized phone
      const enriched: WhatsAppGroupParticipant[] = participants.map((p) => {
        const norm = normalizePhoneNumber(p.phone);
        const match = contacts.find((c) => normalizePhoneNumber(c.conta_phone) === norm);
        return {
          ...p,
          existsInCRM: Boolean(match),
          matchedContactId: match?.id,
        };
      });

      setSelectedGroupDetails({
        groupId: group.id,
        groupName: group.name,
        participants: enriched,
      });
      setSelectedPhones(enriched.map((p) => p.phone).filter(Boolean));
    } catch (err: any) {
      alert('שגיאה בטעינת משתתפים: ' + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return waGroups;
    const q = groupSearch.toLowerCase().trim();
    return waGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [waGroups, groupSearch]);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    if (!selectedGroupDetails) return [];
    if (!participantSearch.trim()) return selectedGroupDetails.participants;
    const q = participantSearch.toLowerCase().trim();
    return selectedGroupDetails.participants.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q)
    );
  }, [selectedGroupDetails, participantSearch]);

  const toggleSelectPhone = (phone: string) => {
    setSelectedPhones((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPhones.length === filteredParticipants.length && filteredParticipants.length > 0) {
      setSelectedPhones([]);
    } else {
      setSelectedPhones(filteredParticipants.map((p) => p.phone).filter(Boolean));
    }
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (!db || !selectedGroupDetails) return;
    if (selectedPhones.length === 0) {
      alert('נא לסמן לפחות משתתף אחד לייבוא');
      return;
    }

    const targetName = targetMode === 'new' ? newCommunityName.trim() : selectedExistingName.trim();
    if (!targetName) {
      alert('נא להזין או לבחור שם קהילה לשיוך החברים');
      return;
    }

    const participantsToImport = selectedGroupDetails.participants
      .filter((p) => selectedPhones.includes(p.phone))
      .map((p) => ({ phone: p.phone, name: p.name }));

    const extraTags = extraTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setImporting(true);
    try {
      const res = await importWhatsAppParticipantsToCrm(
        db,
        ownerId,
        {
          participants: participantsToImport,
          targetCommunityName: targetName,
          extraTags,
        }
      );

      setImportResult(res);
      await refreshData();
    } catch (err: any) {
      alert('שגיאה בייבוא: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Top Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToManage}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="חזור לניהול קהילות"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>ייבוא קבוצות ואנשי קשר מוואטסאפ (Green API)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              חילוץ משתתפים מקבוצות וואטסאפ, נרמול מספרי טלפון, מניעת כפילויות ושיוך ל-CRM.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {connection.status === 'authorized' ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-2xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>וואטסאפ מחובר</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-2xl text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>וואטסאפ אינו מחובר</span>
            </div>
          )}

          <button
            type="button"
            onClick={checkConn}
            disabled={checkingConn}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="רענן חיבור"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingConn ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: WhatsApp Groups List */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>קבוצות הוואטסאפ שלך</span>
            </h3>
            <button
              type="button"
              onClick={loadWaGroups}
              disabled={loadingGroups}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loadingGroups ? 'animate-spin' : ''}`} />
              <span>סנכרן קבוצות</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="חיפוש קבוצה לפי שם..."
              className="w-full h-9 pr-9 pl-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {loadingGroups ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
              <p className="text-xs font-semibold">סורק קבוצות משרתי Green API...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">לא נמצאו קבוצות וואטסאפ</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredGroups.map((g) => {
                const isSelected = selectedGroupId === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => handleSelectGroup(g)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs font-bold'
                        : 'bg-slate-50/60 border-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs truncate block">{g.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block" dir="ltr">
                          {g.id}
                        </span>
                      </div>
                    </div>
                    <ChevronLeft className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Group Participants & Import Form */}
        <div className="lg:col-span-7 space-y-4">
          {!selectedGroupDetails ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-slate-800">בחר קבוצת וואטסאפ מהרשימה</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                לאחר הבחירה, תוכל לצפות בכל המשתתפים, לבחור למי לייצר כרטיס CRM ולשייך אותם לקהילה קיימת או חדשה.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
              {/* Group Name Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    קבוצה נבחרת
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{selectedGroupDetails.groupName}</h3>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl font-mono">
                  {selectedGroupDetails.participants.length} משתתפים
                </span>
              </div>

              {/* Target Community Options */}
              <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-indigo-600" />
                  <span>הגדרת שיוך לקהילה וקבוצה ב-CRM</span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetMode('new')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      targetMode === 'new'
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/10 shadow-2xs font-bold'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs text-slate-800">צור קהילה חדשה</div>
                    <div className="text-[10px] text-slate-400">ייצר קבוצת CRM חדשה</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMode('existing')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      targetMode === 'existing'
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/10 shadow-2xs font-bold'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs text-slate-800">שייך לקהילה קיימת</div>
                    <div className="text-[10px] text-slate-400">הוסף לקבוצה מתוך הרשימה</div>
                  </button>
                </div>

                {targetMode === 'new' ? (
                  <div className="pt-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">שם הקהילה החדשה</label>
                    <input
                      type="text"
                      value={newCommunityName}
                      onChange={(e) => setNewCommunityName(e.target.value)}
                      placeholder="שם הקהילה ב-CRM..."
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">בחר קהילת יעד קיימת</label>
                    <select
                      value={selectedExistingName}
                      onChange={(e) => setSelectedExistingName(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs focus:outline-none"
                    >
                      <option value="">-- בחר קהילה מהרשימה --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name} ({g.count || 0} חברים)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    תגיות נוספות (מופרדות בפסיקים)
                  </label>
                  <input
                    type="text"
                    placeholder="לדוגמה: כנס 2026, VIP, ליד חם"
                    value={extraTagsInput}
                    onChange={(e) => setExtraTagsInput(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Participants Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    משתתפים לייבוא ({selectedPhones.length} מתוך {selectedGroupDetails.participants.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      {selectedPhones.length === filteredParticipants.length ? 'בטל הכל' : 'בחר הכל'}
                    </button>
                    <input
                      type="text"
                      placeholder="סינון משתתף..."
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      className="h-8 px-2.5 rounded-xl border border-slate-200 text-xs w-36 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 bg-slate-50/30">
                  {filteredParticipants.map((p) => {
                    const isSelected = selectedPhones.includes(p.phone);
                    return (
                      <div
                        key={p.phone}
                        onClick={() => toggleSelectPhone(p.phone)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">{p.name}</span>
                              {p.isAdmin && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">
                                  מנהל
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                              {p.phone}
                            </span>
                          </div>
                        </div>

                        {p.existsInCRM ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            קיים (יעודכן)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <UserPlus className="w-3 h-3 text-indigo-600" />
                            חדש (ייווצר)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Import Result Notification */}
              {importResult && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>הייבוא הושלם בהצלחה!</span>
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    נוצרו <strong className="font-mono">{importResult.createdCount}</strong> אנשי קשר חדשים, עודכנו{' '}
                    <strong className="font-mono">{importResult.updatedCount}</strong> כרטיסים קיימים.
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing || selectedPhones.length === 0}
                className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>מייבא {selectedPhones.length} אנשי קשר ל-CRM...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>ייבא {selectedPhones.length} אנשי קשר ל-CRM</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
