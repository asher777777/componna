import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  CheckCircle2,
  Sparkles,
  GripVertical,
  Plus,
  ArrowDownCircle,
  Check,
  Eye,
  Info,
  Brain
} from 'lucide-react';
import { ContactRecord, SmartGroup } from '../types';
import { Contact360Modal } from '../../crm-analytics/components/Contact360Modal';

interface CommunityGrowthTabProps {
  activeGroup: SmartGroup;
  allContacts: ContactRecord[];
  onAssignToGroup: (contactIds: string[], groupName: string) => Promise<void>;
  onOpenContactDetail?: (contact: ContactRecord) => void;
  onOpenSmartRulesModal?: () => void;
}

export const CommunityGrowthTab: React.FC<CommunityGrowthTabProps> = ({
  activeGroup,
  allContacts,
  onAssignToGroup,
  onOpenContactDetail,
  onOpenSmartRulesModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<'all' | 'unassigned' | string>('all');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [draggedContactIds, setDraggedContactIds] = useState<string[]>([]);
  const [recentlyAddedNotice, setRecentlyAddedNotice] = useState<{ count: number; name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fallback 360 modal state to ensure CRM Analytics monopoly is honored
  const [active360Contact, setActive360Contact] = useState<ContactRecord | null>(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  const handleOpen360 = (contact: ContactRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActive360Contact(contact);
    setIs360ModalOpen(true);
    if (onOpenContactDetail) {
      onOpenContactDetail(contact);
    }
  };

  // Group name to target
  const targetCommunityName = activeGroup?.name || 'קהילת קושאן';

  // Determine membership for this community
  const isMember = (contact: ContactRecord): boolean => {
    const tags = Array.isArray(contact.tags) ? contact.tags : [];
    return tags.includes(targetCommunityName) || contact.community === targetCommunityName;
  };

  // Community members count
  const communityMembers = useMemo(() => {
    return allContacts.filter(isMember);
  }, [allContacts, targetCommunityName]);

  const memberCount = Math.max(activeGroup?.count || 0, communityMembers.length);

  // Distinct tags for quick filtering
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    allContacts.forEach((c) => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t) => {
          if (t && t.trim() && t !== targetCommunityName) set.add(t.trim());
        });
      }
      if (c.job_title && c.job_title.trim()) {
        set.add(c.job_title.trim());
      }
    });
    return Array.from(set).slice(0, 6);
  }, [allContacts, targetCommunityName]);

  // Filtered contacts list
  const filteredContacts = useMemo(() => {
    let list = allContacts;

    if (tagFilter === 'unassigned') {
      list = list.filter((c) => !isMember(c));
    } else if (tagFilter !== 'all') {
      list = list.filter((c) => {
        const tags = Array.isArray(c.tags) ? c.tags : [];
        return tags.includes(tagFilter) || c.job_title === tagFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const name = (c.conta_name || c.kosun_crm_name || '').toLowerCase();
        const phone = (c.conta_phone || c.kosun_crm_phone || '').toLowerCase();
        const role = (c.job_title || '').toLowerCase();
        const tags = Array.isArray(c.tags) ? c.tags.join(' ').toLowerCase() : '';
        return name.includes(q) || phone.includes(q) || role.includes(q) || tags.includes(q);
      });
    }

    return list;
  }, [allContacts, tagFilter, searchQuery, targetCommunityName]);

  // Contacts that can be added (not currently members)
  const assignableContacts = useMemo(() => {
    return filteredContacts.filter((c) => !isMember(c));
  }, [filteredContacts, targetCommunityName]);

  const allAssignableSelected =
    assignableContacts.length > 0 &&
    assignableContacts.every((c) => selectedContactIds.includes(c.id));

  const toggleSelectContact = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allAssignableSelected) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(assignableContacts.map((c) => c.id));
    }
  };

  const clearSelection = () => {
    setSelectedContactIds([]);
  };

  // Handle Drag Start (multi-drag if part of selection)
  const handleDragStart = (e: React.DragEvent, contact: ContactRecord) => {
    let idsToDrag = [contact.id];
    if (selectedContactIds.includes(contact.id)) {
      idsToDrag = selectedContactIds;
    } else {
      idsToDrag = [contact.id];
    }

    setDraggedContactIds(idsToDrag);
    e.dataTransfer.setData('text/plain', idsToDrag.join(','));
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        ids: idsToDrag,
        count: idsToDrag.length,
        name:
          idsToDrag.length === 1
            ? contact.conta_name || contact.kosun_crm_name || 'איש קשר'
            : `${idsToDrag.length} אנשי קשר`,
      })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    setDraggedContactIds([]);
  };

  // Handle Drag Over Dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handle Drop onto Community Image
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    let contactIds: string[] = [];
    let displayName = 'איש קשר';

    try {
      const rawJson = e.dataTransfer.getData('application/json');
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed.ids) && parsed.ids.length > 0) {
          contactIds = parsed.ids;
        } else if (parsed.id) {
          contactIds = [parsed.id];
        }
        if (parsed.name) displayName = parsed.name;
      }
    } catch {}

    if (contactIds.length === 0) {
      const text = e.dataTransfer.getData('text/plain');
      if (text) {
        contactIds = text.split(',').map((x) => x.trim()).filter(Boolean);
      }
    }

    if (contactIds.length === 0 && draggedContactIds.length > 0) {
      contactIds = draggedContactIds;
    }

    if (contactIds.length === 0) return;

    if (contactIds.length === 1 && (displayName === 'איש קשר' || !displayName)) {
      const contact = allContacts.find((c) => c.id === contactIds[0]);
      if (contact) {
        displayName = contact.conta_name || contact.kosun_crm_name || 'איש קשר';
      }
    } else if (contactIds.length > 1) {
      displayName = `${contactIds.length} אנשי קשר`;
    }

    try {
      setIsProcessing(true);
      await onAssignToGroup(contactIds, targetCommunityName);
      setRecentlyAddedNotice({ count: contactIds.length, name: displayName });
      setSelectedContactIds((prev) => prev.filter((id) => !contactIds.includes(id)));
      setTimeout(() => {
        setRecentlyAddedNotice(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to add contacts to community:', err);
    } finally {
      setIsProcessing(false);
      setDraggedContactIds([]);
    }
  };

  // Direct Assign All Selected
  const handleAssignSelected = async () => {
    if (selectedContactIds.length === 0) return;
    const count = selectedContactIds.length;
    const displayName =
      count === 1
        ? allContacts.find((c) => c.id === selectedContactIds[0])?.conta_name || 'איש קשר'
        : `${count} אנשי קשר`;

    try {
      setIsProcessing(true);
      await onAssignToGroup(selectedContactIds, targetCommunityName);
      setRecentlyAddedNotice({ count, name: displayName });
      setSelectedContactIds([]);
      setTimeout(() => {
        setRecentlyAddedNotice(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to assign selected contacts:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Click Add (single contact)
  const handleDirectAdd = async (contact: ContactRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const contactName = contact.conta_name || contact.kosun_crm_name || 'איש קשר';
    try {
      setIsProcessing(true);
      await onAssignToGroup([contact.id], targetCommunityName);
      setRecentlyAddedNotice({ count: 1, name: contactName });
      setSelectedContactIds((prev) => prev.filter((id) => id !== contact.id));
      setTimeout(() => {
        setRecentlyAddedNotice(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to add contact to community:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Image URL: Community custom logo or system default
  const logoSrc = activeGroup?.logoUrl || '/images/community-default-logo.png';

  return (
    <div className="space-y-4 text-right font-sans" dir="rtl">
      {/* Toast notification for successful addition */}
      {recentlyAddedNotice && (
        <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span className="text-xs font-black">
              {recentlyAddedNotice.count === 1
                ? `${recentlyAddedNotice.name} נוסף/ה בהצלחה ל${targetCommunityName}!`
                : `${recentlyAddedNotice.name} נוספו בהצלחה ל${targetCommunityName}!`}
            </span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono">נוסף עכשיו</span>
        </div>
      )}

      {/* Main Growth Workspace:
          Right Column (Span 7): מאגר אנשי הקשר (Contacts list)
          Left Column (Span 5): תמונת הקהילה ויעד הגרירה
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* 1. Right Column: Contacts Pool (Span 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
          
          {/* Header Bar with Search & Info Icon + Select All */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>אנשי קשר</span>
                <span className="text-[11px] font-mono font-normal text-slate-400">
                  ({filteredContacts.length})
                </span>
                <span
                  className="cursor-help text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  title="סמן אנשי קשר וגרור אותם יחד אל תמונת הקהילה משמאל, או לחץ על כפתור הצירוף."
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
              </h2>

              {/* Select All Toggle Button */}
              {assignableContacts.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    allAssignableSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                  title={allAssignableSelected ? 'בטל את כל הסימונים' : 'סמן את כל אנשי הקשר הזמינים לצירוף'}
                >
                  <span className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center text-[9px] font-black leading-none">
                    {allAssignableSelected ? '✓' : ''}
                  </span>
                  <span>{allAssignableSelected ? 'בטל הכל' : 'סמן הכל'}</span>
                </button>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש לפי שם, תווית, טלפון..."
                className="w-full h-8 pr-8 pl-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setTagFilter('all')}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                tagFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="הצג את כל אנשי הקשר הזמינים"
            >
              הכל ({allContacts.length})
            </button>
            <button
              type="button"
              onClick={() => setTagFilter('unassigned')}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                tagFilter === 'unassigned'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="אנשי קשר שטרם צורפו לקהילה"
            >
              זמינים לצירוף ({allContacts.length - communityMembers.length})
            </button>

            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={`px-2 py-1 rounded-xl transition cursor-pointer ${
                  tagFilter === tag
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title={`סנן לפי ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Floating / Sticky Multi-Select Action Banner */}
          {selectedContactIds.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/70 dark:from-indigo-950/70 dark:to-indigo-900/40 border border-indigo-200/90 dark:border-indigo-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  {selectedContactIds.length}
                </span>
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                  נבחרו {selectedContactIds.length} אנשי קשר (גרור לתמונה משמאל או צרף)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  נקה בחירה
                </button>
                <button
                  type="button"
                  onClick={handleAssignSelected}
                  disabled={isProcessing}
                  className="h-8 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="צרף את כל המסומנים לקהילה זו"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>צרף לקהילה</span>
                </button>
              </div>
            </div>
          )}

          {/* Contact Cards List with Checkboxes & Drag Handles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredContacts.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 space-y-1">
                <Users className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-bold">לא נמצאו אנשי קשר מתאימים</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const contactName = contact.conta_name || contact.kosun_crm_name || 'איש קשר';
                const tagLabel = contact.job_title || (Array.isArray(contact.tags) && contact.tags[0]) || 'עובד';
                const alreadyInCommunity = isMember(contact);
                const isSelected = selectedContactIds.includes(contact.id);
                const isCurrentlyDragged = draggedContactIds.includes(contact.id);

                return (
                  <div
                    key={contact.id}
                    draggable={!alreadyInCommunity}
                    onDragStart={(e) => handleDragStart(e, contact)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (!alreadyInCommunity) toggleSelectContact(contact.id);
                    }}
                    className={`relative select-none rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-2 transition-all duration-150 ${
                      alreadyInCommunity
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 opacity-70'
                        : isCurrentlyDragged
                        ? 'opacity-40 border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 shadow-none'
                        : isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 shadow-2xs ring-1 ring-indigo-500/30 cursor-grab active:cursor-grabbing'
                        : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 hover:border-indigo-400 hover:shadow-xs cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    {/* Right side: Checkbox + Grip + Name + Tag (Compact) */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Checkbox for selection */}
                      {!alreadyInCommunity ? (
                        <div
                          onClick={(e) => toggleSelectContact(contact.id, e)}
                          className="p-0.5 cursor-pointer shrink-0"
                          title={isSelected ? 'בטל בחירה' : 'סמן לבחירה מרובה וגרירה'}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                          />
                        </div>
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}

                      {!alreadyInCommunity && (
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 hover:text-indigo-500 shrink-0 cursor-grab" />
                      )}

                      <div className="min-w-0">
                        <span className={`text-xs font-black block truncate leading-tight ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                          {contactName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 truncate block leading-tight">
                          {tagLabel}
                        </span>
                      </div>
                    </div>

                    {/* Left side actions: CRM 360 eye button + direct add button */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Batch drag count badge if dragged */}
                      {isSelected && draggedContactIds.length > 1 && isCurrentlyDragged && (
                        <span className="text-[10px] bg-indigo-600 text-white font-black px-1.5 py-0.5 rounded-md">
                          +{draggedContactIds.length - 1}
                        </span>
                      )}

                      {/* View 360 modal button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpen360(contact, e)}
                        className="w-6 h-6 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="צפה בכרטיס איש הקשר (CRM Analytics 360)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct + button */}
                      {!alreadyInCommunity ? (
                        <button
                          type="button"
                          onClick={(e) => handleDirectAdd(contact, e)}
                          className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="צרף לקהילה בלחיצה"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md">
                          חבר
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Left Column: Community Logo & Dropzone Target (Span 5) */}
        <div className="lg:col-span-5 space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative bg-white dark:bg-slate-900 border-2 rounded-3xl p-5 transition-all duration-300 shadow-sm flex flex-col items-center text-center ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 scale-[1.01] ring-4 ring-indigo-500/20'
                : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            {/* Top Toolbar: Community Info & איקון איש חושב */}
            <div className="flex items-center justify-between w-full mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {targetCommunityName} ({memberCount} ח')
                </span>
                <span
                  className="cursor-help text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  title="גרור אנשי קשר אל התמונה כדי לצרפם לקהילה, או השתמש באיקון האיש החושב להגדרה אוטומטית לפי תנאים."
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* איקון איש חושב (Smart Community Rules Modal) */}
              {onOpenSmartRulesModal && (
                <button
                  type="button"
                  onClick={onOpenSmartRulesModal}
                  className="h-8 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 text-xs font-black shadow-xs transition-all cursor-pointer"
                  title="איש חושב: הוספה אוטומטית לקהילה בעזרת תנאים לוגיים"
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-[11px] font-bold">איש חושב</span>
                </button>
              )}
            </div>

            {/* Logo Image Drop Area */}
            <div className="relative w-full aspect-4/3 max-w-xs rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-2 group shadow-inner">
              <img
                src={logoSrc}
                alt={targetCommunityName}
                onError={(e: any) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/community-default-logo.png';
                }}
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  isDragOver ? 'scale-105 filter brightness-105' : 'group-hover:scale-102'
                }`}
              />

              {/* Dragging over overlay indicator */}
              {isDragOver && (
                <div className="absolute inset-0 bg-indigo-600/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 animate-in fade-in duration-200">
                  <ArrowDownCircle className="w-10 h-10 mb-1.5 animate-bounce text-white" />
                  <span className="text-xs font-black">
                    {draggedContactIds.length > 1
                      ? `שחרר כאן להוספת ${draggedContactIds.length} אנשי קשר לקהילה!`
                      : 'שחרר כאן להוספה לקהילה!'}
                  </span>
                </div>
              )}
            </div>

            {/* Compact Community Title underneath */}
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                קהילת {targetCommunityName} ({memberCount} חברים)
              </span>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/75 rounded-3xl flex items-center justify-center backdrop-blur-xs z-10">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>מעדכן חברות...</span>
                </div>
              </div>
            )}
          </div>

          {/* Mini List of Community Members (Compact) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>חברים בקהילה ({communityMembers.length})</span>
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {communityMembers.slice(0, 8).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {member.conta_name || member.kosun_crm_name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {member.job_title || (Array.isArray(member.tags) && member.tags[0]) || ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleOpen360(member, e)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                    title="צפה בכרטיס 360 (CRM Analytics)"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CRM Analytics Contact 360 Modal (Monopoly Enforced) */}
      {is360ModalOpen && active360Contact && (
        <Contact360Modal
          isOpen={is360ModalOpen}
          onClose={() => setIs360ModalOpen(false)}
          contact={active360Contact as any}
        />
      )}
    </div>
  );
};
