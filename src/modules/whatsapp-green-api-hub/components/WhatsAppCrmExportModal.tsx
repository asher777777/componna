import React, { useState, useEffect } from 'react';
import {
  X, Database, Check, Users, Sparkles, AlertCircle, CheckCircle,
  Tag, ShieldCheck, ArrowRight, RefreshCw, FolderPlus, User, Edit3, Plus
} from 'lucide-react';
import { Firestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { subscribeToAuth } from '../../../services/firebaseAuth';
import {
  CrmExportContactInput,
  syncContactsToCrm,
  CrmSyncResult,
  normalizePhone
} from '../services/whatsappCrmSyncService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contacts: Array<{ id: string; name?: string; phone?: string; isGroup?: boolean }>;
  db?: Firestore;
  firebaseApp?: FirebaseApp;
  contactsCollectionName?: string;
  groupsCollectionName?: string;
  connectedAccountName?: string;
  defaultGroupName?: string;
  isDark: boolean;
  onSynced?: (result: CrmSyncResult) => void;
  onContactNameUpdated?: (chatId: string, newName: string) => void;
}

export const WhatsAppCrmExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contacts,
  db,
  firebaseApp,
  contactsCollectionName = 'contacts',
  groupsCollectionName = 'crm_groups',
  connectedAccountName = '',
  defaultGroupName = '',
  isDark,
  onSynced,
  onContactNameUpdated,
}) => {
  if (!isOpen) return null;

  // Filter out group chats, only include individual contacts
  const individualContacts = contacts.filter((c) => !c.isGroup);

  // Editable Names map: chatId -> editedName
  const [editableNames, setEditableNames] = useState<Record<string, string>>({});
  const [currentUserUid, setCurrentUserUid] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeToAuth(firebaseApp, (st) => {
      setCurrentUserUid(st.uid || '');
    });
    return () => unsub();
  }, [firebaseApp]);

  useEffect(() => {
    const map: Record<string, string> = {};
    individualContacts.forEach((c) => {
      map[c.id] = c.name || '';
    });
    setEditableNames(map);
  }, [contacts]);

  // Account Name state
  const [accountName, setAccountName] = useState(
    connectedAccountName && !/^\d{10,}$/.test(connectedAccountName)
      ? connectedAccountName
      : 'חשבון WhatsApp מחובר'
  );

  // CRM Group Selector State
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [selectedGroupOption, setSelectedGroupOption] = useState<string>(
    defaultGroupName ? defaultGroupName : '__none__'
  );
  const [newGroupNameInput, setNewGroupNameInput] = useState('');

  // Tags & Status
  const [customTagInput, setCustomTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['WhatsApp']);
  const [contactStatus, setContactStatus] = useState('lead');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<CrmSyncResult | null>(null);

  // Load existing CRM groups on modal open
  useEffect(() => {
    if (!db) return;
    let isMounted = true;
    setIsLoadingGroups(true);

    const loadGroups = async () => {
      try {
        const groupSet = new Set<string>();

        // 1. Fetch from crm_groups collection
        try {
          const groupsSnap = await getDocs(collection(db, groupsCollectionName));
          groupsSnap.forEach((d) => {
            const data = d.data();
            const gName = (data.name || '').trim();
            if (gName) groupSet.add(gName);
          });
        } catch (e) {
          console.warn('Could not read crm_groups collection:', e);
        }

        // 2. Fetch distinct groups from contacts collection
        try {
          const contactsSnap = await getDocs(query(collection(db, contactsCollectionName), limit(200)));
          contactsSnap.forEach((d) => {
            const data = d.data();
            const gName = (data.group || data.groupName || data.sourceGroupName || '').trim();
            if (gName) groupSet.add(gName);
          });
        } catch (e) {
          console.warn('Could not read groups from contacts:', e);
        }

        if (defaultGroupName.trim()) {
          groupSet.add(defaultGroupName.trim());
        }

        if (isMounted) {
          const sorted = Array.from(groupSet).sort((a, b) => a.localeCompare(b, 'he'));
          setAvailableGroups(sorted);
          if (defaultGroupName && sorted.includes(defaultGroupName)) {
            setSelectedGroupOption(defaultGroupName);
          }
        }
      } catch (err) {
        console.warn('Error fetching CRM groups:', err);
      } finally {
        if (isMounted) setIsLoadingGroups(false);
      }
    };

    loadGroups();
    return () => {
      isMounted = false;
    };
  }, [db, groupsCollectionName, contactsCollectionName, defaultGroupName]);

  const handleAddTag = () => {
    if (customTagInput.trim() && !tags.includes(customTagInput.trim())) {
      setTags([...tags, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleNameChange = (chatId: string, newName: string) => {
    setEditableNames((prev) => ({
      ...prev,
      [chatId]: newName,
    }));
  };

  // Determine final target group name
  const effectiveGroupName =
    selectedGroupOption === '__new__'
      ? newGroupNameInput.trim()
      : selectedGroupOption === '__none__'
      ? ''
      : selectedGroupOption;

  const handleRunCrmSync = async () => {
    if (!db) {
      alert('מסד הנתונים אינו מחובר. אנא ודא חיבור ברכיב הסנכרון.');
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    const exportInputs: CrmExportContactInput[] = individualContacts.map((c) => {
      const rawPhone = c.phone || c.id.replace('@c.us', '');
      const editedName = (editableNames[c.id] || c.name || '').trim();
      return {
        phone: rawPhone,
        chatId: c.id,
        name: editedName || undefined,
        isExplicitNameEdit: Boolean(editedName && editedName !== rawPhone),
        sourceAccountName: accountName.trim(),
        sourceGroupName: effectiveGroupName,
        customTags: tags,
        status: contactStatus,
      };
    });

    try {
      const res = await syncContactsToCrm(
        db,
        contactsCollectionName,
        exportInputs,
        accountName.trim(),
        effectiveGroupName,
        tags,
        groupsCollectionName,
        currentUserUid || undefined
      );
      setSyncResult(res);

      // Update names in parent chats list in real-time
      exportInputs.forEach((item) => {
        if (item.chatId && item.name) {
          onContactNameUpdated?.(item.chatId, item.name);
        }
      });

      onSynced?.(res);
    } catch (e: any) {
      setSyncResult({
        total: exportInputs.length,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [e.message || 'שגיאה בסנכרון'],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>ייצוא וסנכרון אנשי קשר ל-CRM</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {individualContacts.length} נבחרו
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                מיזוג חכם (Smart Merge) – עדכון שדות חסרים בלבד לפי מספר ללא קידומת
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSyncing}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Smart Merge Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            isDark ? 'bg-indigo-950/30 border-indigo-800/40 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px]">
              <p className="font-bold">מנגנון סנכרון חכם וללא דריסה:</p>
              <p className="opacity-90">
                המערכת מזהה את אנשי הקשר ב-CRM לפי ספרות המספר ללא תלות בקידומת המדינה (05X / 972 / +972).
                אם איש הקשר כבר קיים – יעודכנו <b>רק שדות ריקים</b>, ועריכת השם תעדכן את המערכת וה-WhatsApp.
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Account Name */}
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                שם החשבון המקור (Account Name)
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="למשל: וואטסאפ מכירות ראשי"
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* CRM Group Selector & Creation */}
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                שיוך לקבוצה ב-CRM
              </label>
              <select
                value={selectedGroupOption}
                onChange={(e) => setSelectedGroupOption(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="__none__">-- ללא שיוך לקבוצה --</option>
                {availableGroups.map((g) => (
                  <option key={g} value={g}>
                    👥 {g}
                  </option>
                ))}
                <option value="__new__">➕ צור קבוצה חדשה ב-CRM...</option>
              </select>

              {/* New Group Name Input when __new__ is selected */}
              {selectedGroupOption === '__new__' && (
                <div className="mt-2 animate-fade-in">
                  <input
                    type="text"
                    value={newGroupNameInput}
                    onChange={(e) => setNewGroupNameInput(e.target.value)}
                    placeholder="הזן שם לקבוצה החדשה..."
                    className={`w-full p-2 rounded-xl border text-xs focus:border-indigo-500 ${
                      isDark ? 'bg-slate-950 border-indigo-500/50 text-white' : 'bg-white border-indigo-500 text-slate-900'
                    }`}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Single Contact: Edit Name Direct Input */}
          {individualContacts.length === 1 && (
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <label className={`block font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>עריכת שם איש הקשר (יעודכן ב-CRM וברשימת השיחות)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editableNames[individualContacts[0].id] || ''}
                  onChange={(e) => handleNameChange(individualContacts[0].id, e.target.value)}
                  placeholder="הזן שם מלא לאיש הקשר..."
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <span className="p-2.5 px-3 rounded-xl border font-mono text-xs opacity-75 shrink-0 flex items-center" dir="ltr">
                  {individualContacts[0].phone || individualContacts[0].id.replace('@c.us', '')}
                </span>
              </div>
            </div>
          )}

          {/* Tags & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                סטטוס ב-CRM
              </label>
              <select
                value={contactStatus}
                onChange={(e) => setContactStatus(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="lead">ליד חדש (Lead)</option>
                <option value="prospect">מתעניין (Prospect)</option>
                <option value="customer">לקוח קיים (Customer)</option>
                <option value="vip">לקוח VIP</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                תגיות להוספה (Tags)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="הזן תגית ולחץ Enter..."
                  className={`flex-1 p-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 transition"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Multiple Contacts: Preview & Inline Name Editing */}
          {individualContacts.length > 1 && (
            <div className={`p-3 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>עריכה ותצוגה מקדימה של {individualContacts.length} אנשי קשר:</span>
                <span className="text-slate-400 font-mono">יעד: קולקציית {contactsCollectionName}</span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-800/20">
                {individualContacts.slice(0, 50).map((c, idx) => (
                  <div key={c.id || idx} className="pt-1.5 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <Edit3 className="w-3 h-3 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        value={editableNames[c.id] ?? c.name ?? ''}
                        onChange={(e) => handleNameChange(c.id, e.target.value)}
                        placeholder="שם איש הקשר..."
                        className={`w-full p-1 px-2 rounded-lg border text-xs ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <span className="font-mono text-slate-400 shrink-0" dir="ltr">
                      {c.phone || c.id.replace('@c.us', '')}
                    </span>
                  </div>
                ))}
                {individualContacts.length > 50 && (
                  <p className="text-center text-[10px] text-slate-500 py-1">
                    ...ועוד {individualContacts.length - 50} אנשי קשר נוספים
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results Display */}
          {syncResult && (
            <div className={`p-4 rounded-2xl border space-y-2 ${
              syncResult.errors.length === 0
                ? isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>הסנכרון ל-CRM הושלם בהצלחה!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="block text-emerald-400 font-bold text-base">{syncResult.created}</span>
                  <span className="text-[10px] font-sans">נוצרו כחדשים</span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="block text-indigo-400 font-bold text-base">{syncResult.updated}</span>
                  <span className="text-[10px] font-sans">עודכנו ב-CRM</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="block text-slate-300 font-bold text-base">{syncResult.skipped}</span>
                  <span className="text-[10px] font-sans">ללא שינוי</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
          <span className="text-[11px] text-slate-400">
            {isSyncing ? 'מסנכרן כעת מול מסד הנתונים Firestore...' : 'סנכרון אוטומטי ובטוח ללא כפילויות'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSyncing}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
            >
              סגור
            </button>
            <button
              onClick={handleRunCrmSync}
              disabled={isSyncing || individualContacts.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{isSyncing ? 'מסנכרן...' : `סנכרן ל-CRM (${individualContacts.length})`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
