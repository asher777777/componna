import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import type { CrmContactSummary, CrmGroupSummary } from '../../../core/contracts';
import type { ProjectRecord } from '../types';

export interface CommunitySyncPanelProps {
  project: ProjectRecord;
  crmContacts: CrmContactSummary[];
  communities: CrmGroupSummary[];
  onUpdateProject: (projectId: string, updates: Partial<ProjectRecord>) => Promise<void>;
  onLinkCommunity: (projectId: string, groupId: string, groupName: string) => Promise<void>;
  onRefreshExternalData: () => Promise<void>;
}

function getContactDisplayName(c: CrmContactSummary): string {
  return (c.kosun_crm_name || c.name || c.conta_name || '').trim() || 'איש קשר ללא שם';
}

export const CommunitySyncPanel: React.FC<CommunitySyncPanelProps> = ({
  project,
  crmContacts,
  communities,
  onUpdateProject,
  onLinkCommunity,
  onRefreshExternalData,
}) => {
  const [contactSearch, setContactSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return crmContacts.slice(0, 12);
    return crmContacts
      .filter((c) => {
        const name = getContactDisplayName(c).toLowerCase();
        const phone = (c.kosun_crm_phone || c.phone || c.conta_phone || '').toLowerCase();
        const email = (c.kosun_crm_email || c.email || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || email.includes(q);
      })
      .slice(0, 12);
  }, [crmContacts, contactSearch]);

  const handleSelectClient = async (contact: CrmContactSummary) => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const name = getContactDisplayName(contact);
      await onUpdateProject(project.id, {
        clientContactId: contact.id,
        clientName: name,
      });
      setStatusMessage(`הלקוח "${name}" קושר בהצלחה לפרויקט מול KosCrm.`);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCommunity = async (groupId: string) => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const group = communities.find((g) => g.id === groupId);
      if (!group) return;
      await onLinkCommunity(project.id, group.id, group.name);
      setStatusMessage(`קהילת "${group.name}" חוברה לפרויקט. נרשמים חדשים ישויכו אליה אוטומטית.`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoCommunitySync = async () => {
    setSaving(true);
    try {
      await onUpdateProject(project.id, {
        marketing: {
          ...project.marketing,
          syncedToCommunity: project.marketing.syncedToCommunity === false,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshExternalData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900">סנכרון מול מערכת ה-CRM והקהילות</h3>
          <p className="text-xs text-slate-500">
            חיבור מאובטח ללא ייבוא צולב — מופעל דרך חוזי הליבה של KosCrm ו-KosTogether
          </p>
        </div>
        <button
          type="button"
          disabled={refreshing}
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span>רענן נתוני CRM וקהילות</span>
        </button>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CRM Client Link Card */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">שיוך לקוח בפרויקט (KosCrm)</h4>
              <p className="text-xs text-slate-500">
                לקוח נוכחי: <strong className="text-slate-800">{project.clientName || 'לא משויך'}</strong>
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="חפש איש קשר או לקוח ב-CRM לפי שם, טלפון או מייל..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-xs text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                לא נמצאו אנשי קשר זמינים ב-CRM.
              </div>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = project.clientContactId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={saving}
                    onClick={() => handleSelectClient(c)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-right text-xs transition ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50/70'
                        : 'border-slate-100 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {getContactDisplayName(c)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.kosun_crm_phone || c.phone || c.conta_phone || c.email || 'ללא פרטי קשר'}
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        מקושר
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-indigo-600">קשר לפרויקט</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Communities Link Card */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">חיבור לקהילה / קבוצה (KosTogether)</h4>
              <p className="text-xs text-slate-500">
                קהילה משויכת:{' '}
                <strong className="text-slate-800">
                  {project.communityGroupName || 'טרם נבחרה קהילה'}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                צירוף אוטומטי של נרשמים לקהילה
              </div>
              <div className="text-[11px] text-slate-500">
                כל נרשם מדף הנחיתה של הפרויקט יצורף אוטומטית לקהילה הנבחרת
              </div>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={handleToggleAutoCommunitySync}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                project.marketing.syncedToCommunity !== false ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
              aria-label="הפעל או כבה צירוף אוטומטי לקהילה"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  project.marketing.syncedToCommunity !== false ? '-translate-x-6' : '-translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {communities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                טרם הוקמו קהילות או קבוצות ב-KosTogether.
              </div>
            ) : (
              communities.map((group) => {
                const isLinked = project.communityGroupId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    disabled={saving}
                    onClick={() => handleSelectCommunity(group.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-right text-xs transition ${
                      isLinked
                        ? 'border-indigo-300 bg-indigo-50/70'
                        : 'border-slate-100 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 text-indigo-500" />
                      <div>
                        <div className="font-semibold text-slate-900">{group.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {group.count ?? 0} חברים
                        </div>
                      </div>
                    </div>
                    {isLinked ? (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        מחוברת
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-indigo-600">חבר קהילה</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
