import React, { useState, useMemo } from 'react';
import { X, Search, UserPlus, Check, Square, CheckSquare } from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { isContactInGroup } from '../services/groupsUtils';

interface GroupAddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupAddMembersModal: React.FC<GroupAddMembersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { contacts, activeGroup, bulkAssignToGroup } = useCrmGroups();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Filter contacts who are NOT yet in activeGroup
  const eligibleContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (isContactInGroup(c, activeGroup)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (c.conta_name || '').toLowerCase();
      const phone = (c.conta_phone || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [contacts, activeGroup, searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === eligibleContacts.length && eligibleContacts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleContacts.map((c) => c.id));
    }
  };

  const handleAddMembers = async () => {
    if (selectedIds.length === 0) return;
    try {
      setSubmitting(true);
      await bulkAssignToGroup(selectedIds, activeGroup.name);
      onClose();
      setSelectedIds([]);
    } catch (err: any) {
      alert('שגיאה: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">
              הוספת חברים ל{activeGroup.isCommunity ? 'קהילת' : 'קבוצת'} "{activeGroup.name}"
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם, טלפון או אימייל..."
              className="w-full h-9 pr-9 pl-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 font-bold">
              נמצאו {eligibleContacts.length} אנשי קשר שאינם בקבוצה
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              {selectedIds.length === eligibleContacts.length && eligibleContacts.length > 0
                ? 'בטל בחירת הכל'
                : 'בחר הכל'}
            </button>
          </div>

          {/* List */}
          <div className="border border-slate-200 rounded-2xl max-h-64 overflow-y-auto divide-y divide-slate-100 bg-slate-50/30">
            {eligibleContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                כל אנשי הקשר במערכת כבר משויכים לקבוצה זו או שלא נמצאו תוצאות.
              </div>
            ) : (
              eligibleContacts.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleSelect(c.id)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{c.conta_name || 'ללא שם'}</span>
                        <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                          {c.conta_phone || c.email || '-'}
                        </span>
                      </div>
                    </div>

                    {c.mh_crm_city && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {c.mh_crm_city}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleAddMembers}
            disabled={submitting || selectedIds.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'מוסיף...' : `הוסף ${selectedIds.length} חברים`}
          </button>
        </div>
      </div>
    </div>
  );
};
