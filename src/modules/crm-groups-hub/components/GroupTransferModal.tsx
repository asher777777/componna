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
    activeGroupId,
    activeGroup,
    bulkAssignToGroup,
    bulkMoveBetweenGroups,
  } = useCrmGroups();

  const [targetGroupName, setTargetGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!targetGroupName) {
      alert('נא לבחור קבוצת יעד');
      return;
    }

    try {
      setSubmitting(true);
      if (mode === 'add') {
        await bulkAssignToGroup(selectedContactIds, targetGroupName);
      } else {
        const sourceName = activeGroupId.startsWith('__') ? '' : activeGroup.name;
        await bulkMoveBetweenGroups(selectedContactIds, sourceName, targetGroupName);
      }
      onClose();
    } catch (err: any) {
      alert('שגיאה: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            {mode === 'add' ? (
              <Plus className="w-4 h-4 text-indigo-600" />
            ) : (
              <ArrowRightLeft className="w-4 h-4 text-amber-600" />
            )}
            <h3 className="text-sm font-black text-slate-900">
              {mode === 'add' ? 'הוספת אנשי קשר לקבוצה' : 'העברת אנשי קשר בין קבוצות'}
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

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            פעולה זו תחול על <span className="font-bold text-indigo-700">{selectedContactIds.length}</span> אנשי קשר נבחרים.
          </p>

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
