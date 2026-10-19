import React, { useState } from 'react';
import { X, ArrowRightLeft, Plus, Check } from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';

interface GroupTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'move';
}

export const GroupTransferModal: React.FC<GroupTransferModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  const {
    groups,
    selectedContactIds,
    filteredContacts,
    activeGroupId,
    activeGroup,
    bulkAssignToGroup,
    bulkMoveBetweenGroups,
  } = useCrmGroups();

  const [targetGroupName, setTargetGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);

  if (!isOpen) return null;

  const targetIds = applyToAll ? filteredContacts.map((c) => c.id) : selectedContactIds;

  const handleExecute = async () => {
    if (!targetGroupName) {
      alert('נא לבחור קבוצת יעד');
      return;
    }

    try {
      setSubmitting(true);
      if (mode === 'add') {
        await bulkAssignToGroup(targetIds, targetGroupName);
      } else {
        const sourceName = activeGroupId.startsWith('__') ? '' : activeGroup.name;
        await bulkMoveBetweenGroups(targetIds, sourceName, targetGroupName);
      }
      onClose();
    } catch (err: any) {
      alert('שגיאה: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-900/80 backdrop-blur-md overflow-y-auto flex flex-col items-center justify-start p-2 sm:p-6" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-right animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/kosun-symbol.svg"
              onError={(e: any) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/kosun-official-logo.png';
              }}
              alt="KOSUN"
              className="w-6 h-6 object-contain"
            />
            <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white">KosTogether</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
            <div>
              <p className="text-slate-800 dark:text-slate-200 font-bold">
                פעולה זו תחול על <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-sm">{targetIds.length}</span> אנשי קשר.
              </p>
              <p className="text-[11px] text-slate-500">
                {applyToAll ? `כלל אנשי הקשר בתצוגה הנוכחית (${filteredContacts.length})` : `אנשי הקשר המסומנים כעת (${selectedContactIds.length})`}
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
              />
              <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                בחר הכל ({filteredContacts.length})
              </span>
            </label>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">בחר קבוצה או קהילת יעד:</label>
            <select
              value={targetGroupName}
              onChange={(e) => setTargetGroupName(e.target.value)}
              className="w-full h-10 px-3 rounded-2xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">-- בחר קבוצה מהרשימה --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name} ({g.count || 0} חברים)
                </option>
              ))}
            </select>
          </div>

          {mode === 'move' && !activeGroupId.startsWith('__') && (
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              שים לב: אנשי הקשר יוסרו מהקבוצה הנוכחית ({activeGroup.name}) וישוייכו לקבוצה החדשה.
            </p>
          )}
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
            onClick={handleExecute}
            disabled={submitting || !targetGroupName}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'מבצע...' : 'אשר ובצע'}
          </button>
        </div>
      </div>
    </div>
  );
};
