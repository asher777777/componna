import React, { useState } from 'react';
import { Contact } from '../../types';
import {
  Globe,
  Shield,
  Key,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Layers,
  Save,
  Check,
} from 'lucide-react';
import { tenantContactSyncService } from '../../services/tenantContactSyncService';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
  isDarkMode: boolean;
  onNotify?: (msg: string) => void;
  firebaseApp?: any;
}

interface ModuleItem {
  id: string;
  name: string;
  desc: string;
  category: string;
  color: string;
}

const AVAILABLE_MODULES: ModuleItem[] = [
  { id: 'KosWebAi', name: 'יוצר עמודים ואתרים', desc: 'עיצוב עמודי נחיתה מתקדמים', category: 'שיווק', color: 'indigo' },
  { id: 'KSF', name: 'מחולל טפסים ושאלונים', desc: 'טפסי הרשמה ולידים חכמים', category: 'שיווק', color: 'blue' },
  { id: 'KosWhatsUp', name: 'וואטסאפ בוטים ו-CRM', desc: 'שיגור אוטומטי ותקשורת לקוחות', category: 'מכירות', color: 'emerald' },
  { id: 'crm-analytics', name: 'אנליטיקה ו-CRM', desc: 'כרטיסי לקוח ודוחות גרפיים', category: 'CRM', color: 'amber' },
  { id: 'kesher-payments-hub', name: 'סליקה וקבלות קשר', desc: 'סליקת אשראי והפקת קבלות', category: 'כספים', color: 'teal' },
  { id: 'KosTogether', name: 'קהילות וקבוצות חכמות', desc: 'חדרים וירטואליים ומעורבות', category: 'CRM', color: 'purple' },
  { id: 'media-gallery-hub', name: 'מאגר מדיה וענן', desc: 'אחסון קבצים ויצירת תמונות AI', category: 'מדיה', color: 'cyan' },
  { id: 'kosun-am', name: 'דיוור אוטומטי במייל', desc: 'מערכת ניוזלטרים ואוטומציות דוא״ל', category: 'שיווק', color: 'orange' },
  { id: 'kosun-board-composer', name: 'מחולל לוחות בקרה AI', desc: 'דשבורדים מותאמים אישית', category: 'ליבה', color: 'rose' },
  { id: 'video-producer-studio', name: 'סטודיו וידאו ואווטאר', desc: 'הפקת סרטונים אינטראקטיביים', category: 'מדיה', color: 'violet' },
  { id: 'flow-player-engine', name: 'נגן זרימה אינטראקטיבי', desc: 'נגן מסלולים ושאלונים', category: 'חוויה', color: 'pink' },
];

export const ContactSubdomainTab: React.FC<Props> = ({
  formData,
  onChange,
  isDarkMode,
  onNotify,
  firebaseApp,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const subdomain = formData.subdomain || '';
  const isSubdomainUser = Boolean(formData.isSubdomainAdmin || formData.subdomain);
  const activeModules = formData.activeModules || ['KosWebAi', 'KSF', 'KosWhatsUp', 'crm-analytics', 'media-gallery-hub'];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    onNotify?.('הועתק ללוח!');
  };

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onChange('adminPassword', result);
    onNotify?.('נוצרה סיסמה חדשה');
  };

  const toggleModule = (modId: string) => {
    const current = [...activeModules];
    const index = current.indexOf(modId);
    if (index > -1) {
      if (current.length === 1) {
        onNotify?.('חובה להשאיר לפחות מודול אחד פעיל');
        return;
      }
      current.splice(index, 1);
    } else {
      current.push(modId);
    }
    onChange('activeModules', current);
  };

  const selectAllModules = () => {
    onChange('activeModules', AVAILABLE_MODULES.map((m) => m.id));
    onNotify?.('כל המודולים נבחרו');
  };

  const selectDefaultModules = () => {
    onChange('activeModules', ['KosWebAi', 'KSF', 'KosWhatsUp', 'crm-analytics', 'media-gallery-hub']);
    onNotify?.('הוגדרו מודולי ברירת מחדל');
  };

  const handleDirectSyncTenant = async () => {
    if (!subdomain) {
      onNotify?.('נא להזין סאב-דומיין תקין');
      return;
    }
    setIsSyncing(true);
    try {
      const ok = await tenantContactSyncService.updateTenantFromContact(
        subdomain,
        {
          subdomain,
          fullDomain: formData.fullDomain || `${subdomain}.kosun.co.il`,
          clientName: formData.kosun_crm_name || formData.conta_name || subdomain,
          adminUsername: formData.adminUsername || `${subdomain}_admin`,
          adminPassword: formData.adminPassword,
          activeModules: activeModules,
          status: formData.tenantStatus || 'active',
          billingPlan: formData.billingPlan || 'monthly',
          notes: formData.subdomainNotes,
          ownerEmail: formData.kosun_crm_email || formData.email,
          ownerPhone: formData.kosun_crm_phone || formData.conta_phone,
        },
        firebaseApp
      );

      if (ok) {
        onNotify?.(`טננט ${subdomain} סונכרן ונשמר בהצלחה ב-Firestore ובמערכת!`);
      } else {
        onNotify?.('שגיאה בסנכרון הטננט');
      }
    } catch (e: any) {
      onNotify?.(e?.message || 'שגיאה בסנכרון');
    } finally {
      setIsSyncing(false);
    }
  };

  const hostUrl = typeof window !== 'undefined' ? window.location.host : '';
  const isLocalhost = hostUrl.includes('localhost') || hostUrl.includes('127.0.0.1');
  const tenantSiteUrl = subdomain
    ? isLocalhost
      ? `http://${subdomain}.localhost:5173`
      : `https://${subdomain}.kosun.co.il`
    : '';

  return (
    <div className="space-y-4 text-xs">
      {/* Toggle Subdomain Admin Association */}
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between ${
          isDarkMode
            ? 'bg-amber-500/10 border-amber-500/20 text-white'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs">משתמש ומנהל סאב-דומיין (טננט)</div>
            <div className="text-[10px] opacity-75">
              איש קשר זה מוגדר כמנהל מערכת ובעל סאב-דומיין עצמאי
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isSubdomainUser}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange('isSubdomainAdmin', checked);
              onChange('isUser', checked);
              if (checked && !formData.subdomain) {
                const autoSub = (formData.conta_name || 'tenant')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '')
                  .slice(0, 15) || 'client';
                onChange('subdomain', autoSub);
                onChange('adminUsername', `${autoSub}_admin`);
                onChange('fullDomain', `${autoSub}.kosun.co.il`);
              }
            }}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {isSubdomainUser && (
        <div className="space-y-3.5">
          {/* Subdomain & Direct Link Card */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-2 ${
              isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400">כתובת סאב-דומיין</span>
              {tenantSiteUrl && (
                <a
                  href={`${tenantSiteUrl}?admin=login`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-amber-500 hover:underline font-bold"
                >
                  <span>כניסה לממשק המנהל</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => {
                  const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  onChange('subdomain', clean);
                  onChange('fullDomain', `${clean}.kosun.co.il`);
                }}
                placeholder="subdomain"
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold text-left ltr ${
                  isDarkMode
                    ? 'bg-black/50 border-white/10 text-amber-400'
                    : 'bg-white border-slate-300 text-amber-700'
                }`}
                dir="ltr"
              />
              <span className="text-[11px] font-bold text-gray-500">.kosun.co.il</span>
            </div>
          </div>

          {/* Credentials Section */}
          <div
            className={`p-3 rounded-xl border space-y-2.5 ${
              isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>פרטי כניסה למנהל הטננט</span>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>צור סיסמה</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">שם משתמש</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.adminUsername || ''}
                    onChange={(e) => onChange('adminUsername', e.target.value)}
                    placeholder="admin_username"
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
                      isDarkMode
                        ? 'bg-black/50 border-white/10 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    dir="ltr"
                  />
                  {formData.adminUsername && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.adminUsername!, 'user')}
                      className="absolute left-2 top-2 text-gray-400 hover:text-white"
                      title="העתק"
                    >
                      {copiedKey === 'user' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">סיסמה</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.adminPassword || ''}
                    onChange={(e) => onChange('adminPassword', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
                      isDarkMode
                        ? 'bg-black/50 border-white/10 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    dir="ltr"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1.5 text-gray-400">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-white"
                      title={showPassword ? 'הסתר' : 'הצג'}
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    {formData.adminPassword && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.adminPassword!, 'pass')}
                        className="hover:text-white"
                        title="העתק"
                      >
                        {copiedKey === 'pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Billing */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">סטטוס טננט</label>
              <select
                value={formData.tenantStatus || 'active'}
                onChange={(e) => onChange('tenantStatus', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                  isDarkMode
                    ? 'bg-black/50 border-white/10 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="active">🟢 פעיל (Active)</option>
                <option value="suspended">🟡 מושהה (Suspended)</option>
                <option value="draft">⚪ טיוטה (Draft)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">תוכנית חיוב</label>
              <select
                value={formData.billingPlan || 'monthly'}
                onChange={(e) => onChange('billingPlan', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                  isDarkMode
                    ? 'bg-black/50 border-white/10 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="monthly">חודשי (Monthly)</option>
                <option value="annual">שנתי (Annual)</option>
                <option value="custom">מותאם אישית (Custom)</option>
              </select>
            </div>
          </div>

          {/* Active Modules Provisioning Grid */}
          <div
            className={`p-3 rounded-xl border space-y-2.5 ${
              isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>מודולים מורשים בסאב-דומיין ({activeModules.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectDefaultModules}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  ברירת מחדל
                </button>
                <span className="text-zinc-600">|</span>
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  בחר הכל
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
              {AVAILABLE_MODULES.map((mod) => {
                const isSelected = activeModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-2 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                          : 'bg-indigo-50 border-indigo-300 text-indigo-950 font-medium'
                        : isDarkMode
                          ? 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold text-[11px] truncate">{mod.name}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{mod.desc}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-zinc-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Sync & Save Tenant Button */}
          <button
            type="button"
            onClick={handleDirectSyncTenant}
            disabled={isSyncing}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>שמור וסנכרן טננט עם Firestore ומערכת המאסטר</span>
          </button>
        </div>
      )}
    </div>
  );
};
