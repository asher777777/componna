import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users,
  Globe,
  Tag,
  Zap,
  Plus,
  Search,
  Edit3,
  Trash2,
  ChevronDown,
  Sparkles,
  Check,
  FolderPlus,
  SlidersHorizontal,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { SmartGroup } from '../types';

interface GroupSelectorDropdownProps {
  onOpenCreateGroup: (mode: 'group' | 'community' | 'smart') => void;
  onOpenEditGroup: (group: SmartGroup) => void;
}

export const GroupSelectorDropdown: React.FC<GroupSelectorDropdownProps> = ({
  onOpenCreateGroup,
  onOpenEditGroup,
}) => {
  const {
    groups,
    communities,
    tagGroups,
    smartGroups,
    activeGroupId,
    setActiveGroupId,
    activeGroup,
    totalContacts,
    untaggedCount,
    categoryFilter,
    setCategoryFilter,
    deleteGroup,
  } = useCrmGroups();

  const [isOpen, setIsOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const displayedGroups = useMemo(() => {
    let list: SmartGroup[] = [];
    if (categoryFilter === 'communities') list = communities;
    else if (categoryFilter === 'groups') list = tagGroups;
    else if (categoryFilter === 'smart') list = smartGroups;
    else list = groups;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.leaderName || '').toLowerCase().includes(q)
    );
  }, [categoryFilter, communities, tagGroups, smartGroups, groups, searchQuery]);

  const handleDelete = (e: React.MouseEvent, group: SmartGroup) => {
    e.stopPropagation();
    const typeLabel = group.isCommunity ? 'הקהילה' : 'הקבוצה';
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${typeLabel} "${group.name}"?`)) {
      deleteGroup(group);
    }
  };

  const getGroupIcon = (group: SmartGroup) => {
    if (group.id === '__all__') return <Users className="w-4 h-4 text-indigo-600" />;
    if (group.id === '__untagged__') return <Tag className="w-4 h-4 text-rose-600" />;
    if (group.isCommunity || group.pageSlug || group.pageUrl) return <Globe className="w-4 h-4 text-indigo-600" />;
    if (group.type === 'smart') return <Zap className="w-4 h-4 text-amber-500" />;
    return <Users className="w-4 h-4 text-slate-600" />;
  };

  const currentCount =
    activeGroupId === '__all__'
      ? totalContacts
      : activeGroupId === '__untagged__'
      ? untaggedCount
      : activeGroup.count || 0;

  return (
    <div className="flex items-center gap-1.5" dir="rtl">
      {/* 1. Main Group Selector Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setIsPlusMenuOpen(false);
          }}
          className="h-10 px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs flex items-center gap-2.5 transition-all cursor-pointer group"
          title="בחר קהילה או קבוצה להצגה"
        >
          {/* Group Indicator Color */}
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: activeGroup.color || '#4f46e5' }}
          />

          {/* Group Icon */}
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            {getGroupIcon(activeGroup)}
          </div>

          {/* Group Name */}
          <span className="font-extrabold text-xs text-slate-900 dark:text-white max-w-[140px] sm:max-w-[200px] truncate text-right">
            {activeGroup.name}
          </span>

          {/* Count Badge */}
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
            {currentCount}
          </span>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu Panel */}
        {isOpen && (
          <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-right">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש קהילה, קבוצה או מוביל..."
                className="w-full h-8.5 pr-8 pl-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                autoFocus
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                הכל ({groups.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('communities')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  categoryFilter === 'communities'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                קהילות ({communities.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('groups')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  categoryFilter === 'groups'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                קבוצות ({tagGroups.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('smart')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  categoryFilter === 'smart'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                חכמות ({smartGroups.length})
              </button>
            </div>

            {/* Special System Views: All Contacts & Untagged */}
            <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
              {/* All Contacts */}
              <button
                type="button"
                onClick={() => {
                  setActiveGroupId('__all__');
                  setIsOpen(false);
                }}
                className={`w-full p-2 rounded-xl transition flex items-center justify-between text-right cursor-pointer ${
                  activeGroupId === '__all__'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">כל אנשי הקשר הרשומים</span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {totalContacts}
                </span>
              </button>

              {/* Untagged */}
              <button
                type="button"
                onClick={() => {
                  setActiveGroupId('__untagged__');
                  setIsOpen(false);
                }}
                className={`w-full p-2 rounded-xl transition flex items-center justify-between text-right cursor-pointer ${
                  activeGroupId === '__untagged__'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-extrabold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">ללא שיוך לקבוצה או קהילה</span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {untaggedCount}
                </span>
              </button>
            </div>

            {/* Scrollable Groups List */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {displayedGroups.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  לא נמצאו קהילות או קבוצות תואמות
                </div>
              ) : (
                displayedGroups.map((group) => {
                  const isSelected = activeGroupId === group.id || activeGroupId === group.name;
                  return (
                    <div
                      key={group.id}
                      onClick={() => {
                        setActiveGroupId(group.id);
                        setIsOpen(false);
                      }}
                      className={`group p-2 rounded-xl transition flex items-center justify-between text-right cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-extrabold border border-indigo-200/60 dark:border-indigo-900'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: group.color || '#4f46e5' }}
                        />
                        <div className="truncate">
                          <span className="text-xs block truncate font-bold">{group.name}</span>
                          {group.leaderName && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              מוביל: {group.leaderName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {group.count || 0}
                        </span>

                        {/* Hover Action Buttons */}
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditGroup(group);
                              setIsOpen(false);
                            }}
                            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 cursor-pointer"
                            title="ערוך קהילה"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, group)}
                            className="p-1 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="מחק"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Footer with Add shortcuts */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{displayedGroups.length} קבוצות מוגדרות</span>
              <button
                type="button"
                onClick={() => {
                  onOpenCreateGroup('community');
                  setIsOpen(false);
                }}
                className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>צור קהילה</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Plus Button (איקון הפלוס ליד תפריט הבחירה) */}
      <div className="relative" ref={plusMenuRef}>
        <button
          type="button"
          onClick={() => {
            setIsPlusMenuOpen((prev) => !prev);
            setIsOpen(false);
          }}
          className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          title="צור קהילה או קבוצה חדשה"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Plus Action Popup Menu */}
        {isPlusMenuOpen && (
          <div className="absolute top-full mt-2 right-0 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-right">
            <button
              type="button"
              onClick={() => {
                onOpenCreateGroup('community');
                setIsPlusMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-black text-slate-900 dark:text-white">קהילה חדשה</span>
                <span className="text-[10px] text-slate-400">כולל עמוד ציבורי, שגרירים ופיד</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenCreateGroup('group');
                setIsPlusMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-black text-slate-900 dark:text-white">קבוצת תגיות</span>
                <span className="text-[10px] text-slate-400">פילוח ידני מהיר לפי תוויות CRM</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenCreateGroup('smart');
                setIsPlusMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-black text-slate-900 dark:text-white">קבוצה חכמה</span>
                <span className="text-[10px] text-slate-400">סינון אוטומטי לפי תנאים לוגיים</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 3. Direct Edit Active Group Button (if an actual group/community is selected) */}
      {activeGroupId !== '__all__' && activeGroupId !== '__untagged__' && (
        <button
          type="button"
          onClick={() => onOpenEditGroup(activeGroup)}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 text-slate-500 hover:text-indigo-600 flex items-center justify-center shadow-xs transition-all cursor-pointer"
          title={`ערוך את ${activeGroup.name}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
