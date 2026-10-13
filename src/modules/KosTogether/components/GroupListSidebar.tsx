import React, { useState, useMemo } from 'react';
import {
  Users,
  Globe,
  Tag,
  Zap,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Target,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { SmartGroup } from '../types';

interface GroupListSidebarProps {
  onOpenCreateGroup: (mode: 'group' | 'community' | 'smart') => void;
  onOpenEditGroup: (group: SmartGroup) => void;
}

export const GroupListSidebar: React.FC<GroupListSidebarProps> = ({
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
    totalContacts,
    untaggedCount,
    categoryFilter,
    setCategoryFilter,
    deleteGroup,
  } = useCrmGroups();

  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const displayedGroups = useMemo(() => {
    let list: SmartGroup[] = [];
    if (categoryFilter === 'communities') list = communities;
    else if (categoryFilter === 'groups') list = tagGroups;
    else if (categoryFilter === 'smart') list = smartGroups;
    else list = groups;

    if (!groupSearchQuery.trim()) return list;
    const q = groupSearchQuery.toLowerCase().trim();
    return list.filter((g) => g.name.toLowerCase().includes(q) || (g.leaderName || '').toLowerCase().includes(q));
  }, [categoryFilter, communities, tagGroups, smartGroups, groups, groupSearchQuery]);

  const handleDelete = (e: React.MouseEvent, group: SmartGroup) => {
    e.stopPropagation();
    const typeLabel = group.isCommunity ? 'הקהילה' : 'הקבוצה';
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${typeLabel} "${group.name}"?`)) {
      deleteGroup(group);
    }
  };

  return (
    <div className="w-full lg:w-80 bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col space-y-4 shrink-0">
      {/* Top Header & Quick Add */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">קהילות וקבוצות</h2>
            <span className="text-[10px] text-slate-400 font-medium">
              סה"כ {groups.length} קבוצות מוגדרות
            </span>
          </div>
        </div>

        {/* Quick Add Menu */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenCreateGroup('community')}
            className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs cursor-pointer"
            title="צור קהילה חדשה (עם עמוד ציבורי)"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onOpenCreateGroup('group')}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="צור קבוצת תגיות חדשה"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Global Filter Buttons: All Contacts & Untagged */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveGroupId('__all__')}
          className={`p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
            activeGroupId === '__all__'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
              : 'bg-slate-50/80 border-slate-200/60 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">הכל</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-lg ${
              activeGroupId === '__all__' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {totalContacts}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGroupId('__untagged__')}
          className={`p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
            activeGroupId === '__untagged__'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-100'
              : 'bg-slate-50/80 border-slate-200/60 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">ללא שיוך</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-lg ${
              activeGroupId === '__untagged__' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {untaggedCount}
          </span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`flex-1 py-1 rounded-xl transition-all text-center cursor-pointer ${
            categoryFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          הכל ({groups.length})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter('communities')}
          className={`flex-1 py-1 rounded-xl transition-all text-center cursor-pointer ${
            categoryFilter === 'communities' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          קהילות ({communities.length})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter('groups')}
          className={`flex-1 py-1 rounded-xl transition-all text-center cursor-pointer ${
            categoryFilter === 'groups' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          קבוצות ({tagGroups.length})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter('smart')}
          className={`flex-1 py-1 rounded-xl transition-all text-center cursor-pointer ${
            categoryFilter === 'smart' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          חכמות ({smartGroups.length})
        </button>
      </div>

      {/* Search Groups */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
        <input
          type="text"
          value={groupSearchQuery}
          onChange={(e) => setGroupSearchQuery(e.target.value)}
          placeholder="חיפוש קבוצה או מוביל..."
          className="w-full h-8.5 pr-8 pl-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Groups Scroll List */}
      <div className="space-y-1.5 overflow-y-auto max-h-[480px] pr-1">
        {displayedGroups.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-1">
            <Filter className="w-6 h-6 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">לא נמצאו קבוצות תואמות</p>
          </div>
        ) : (
          displayedGroups.map((g) => {
            const isSelected = activeGroupId === g.id || activeGroupId === g.name;
            return (
              <div
                key={g.id}
                onClick={() => setActiveGroupId(g.id || g.name)}
                className={`group p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-2xs'
                    : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-2xs"
                    style={{ backgroundColor: g.color || '#4f46e5' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs truncate">{g.name}</span>
                      {g.isCommunity && (
                        <span title="קהילה בעלת עמוד אינטרנט">
                          <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                        </span>
                      )}
                      {g.type === 'smart' && (
                        <span title="קבוצה חכמה דינמית">
                          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    {g.leaderName && (
                      <span className="text-[10px] text-slate-400 block truncate">מוביל: {g.leaderName}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200/70 transition-colors">
                    {g.count || 0}
                  </span>

                  <div className="hidden group-hover:flex items-center gap-0.5 mr-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditGroup(g);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-white transition-colors"
                      title="ערוך קבוצה"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, g)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                      title="מחק קבוצה"
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
    </div>
  );
};
