import React, { useState } from 'react';
import { 
  Eye, EyeOff, Tag, DollarSign, Globe, CheckCircle2, 
  Settings, Sparkles, Shield, Save, ArrowRight, RefreshCw,
  Plus, Layers, ExternalLink, HelpCircle
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';
import { ModulePricingConfig } from '../types';

export const AdminStorefrontManager: React.FC = () => {
  const { 
    catalog, 
    settings, 
    updateCatalogItem, 
    updateSettings, 
    setViewMode 
  } = useStorefront();

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState(settings);
  const [saveToast, setSaveToast] = useState(false);

  const activeEditingModule = catalog.find(m => m.id === editingModuleId);

  const handleSaveSettings = () => {
    updateSettings(tempSettings);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleModulePriceChange = (mod: ModulePricingConfig, field: keyof ModulePricingConfig, val: any) => {
    updateCatalogItem({
      ...mod,
      [field]: val,
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ניהול חנות הרכיבים ותמחור SaaS (Admin Storefront)
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                שליטה מלאה על הרכיבים המוצגים לאורחים, תמחור חודשי/שנתי, הגדרות GoDaddy DNS וניהול סאב-דומיינים
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('catalog')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>צפייה בחנות (Guest View)</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-500 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>ההגדרות נשמרו בהצלחה ומסונכרנות בזמן אמת!</span>
        </div>
      )}

      {/* Domain & DNS Settings Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-indigo-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">הגדרות ספק DNS (Hostinger / GoDaddy)</h2>
          </div>
          <span className="text-[11px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Wildcard DNS פעיל
          </span>
        </div>

        {/* DNS Provider Selector */}
        <div className="mb-4">
          <label className="block text-gray-300 font-medium mb-1.5 text-xs">ספק ה-DNS / הדומיין שלך:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'hostinger', label: 'Hostinger (מומלץ)', desc: 'hPanel DNS / Wildcard' },
              { id: 'godaddy', label: 'GoDaddy', desc: 'DNS Records / API' },
              { id: 'cloudflare', label: 'Cloudflare', desc: 'DNS Proxy' },
              { id: 'custom_wildcard', label: 'ספק אחר (Wildcard)', desc: 'כל ספק דומיינים' },
            ].map(prov => (
              <button
                key={prov.id}
                type="button"
                onClick={() => setTempSettings({ ...tempSettings, dnsProvider: prov.id as any })}
                className={`p-3 rounded-xl border text-right transition ${
                  tempSettings.dnsProvider === prov.id
                    ? 'border-indigo-400 bg-indigo-600/30 text-white ring-1 ring-indigo-400'
                    : 'border-slate-700 bg-slate-800/60 text-gray-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs text-white">{prov.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{prov.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-300 font-medium mb-1">סיומת דומיין בסיס קבועה (Base Domain):</label>
            <input
              type="text"
              value={tempSettings.baseDomain}
              onChange={e => setTempSettings({ ...tempSettings, baseDomain: e.target.value })}
              placeholder="e.g. yourbrand.com"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              כל לקוח יקבל: <span className="text-indigo-300 font-mono">[סאב-דומיין].{tempSettings.baseDomain}</span>
            </span>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">שם הפלטפורמה המוצג:</label>
            <input
              type="text"
              value={tempSettings.platformName}
              onChange={e => setTempSettings({ ...tempSettings, platformName: e.target.value })}
              placeholder="Comona SaaS Hub"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              {tempSettings.dnsProvider === 'hostinger' ? 'Hostinger API Token (אופציונלי):' : 'GoDaddy API Key:'}
            </label>
            <input
              type="text"
              value={tempSettings.dnsProvider === 'hostinger' ? (tempSettings.hostingerApiToken || '') : (tempSettings.godaddyApiKey || '')}
              onChange={e => {
                if (tempSettings.dnsProvider === 'hostinger') {
                  setTempSettings({ ...tempSettings, hostingerApiToken: e.target.value });
                } else {
                  setTempSettings({ ...tempSettings, godaddyApiKey: e.target.value });
                }
              }}
              placeholder={tempSettings.dnsProvider === 'hostinger' ? 'Hostinger API Token...' : 'API Key...'}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>שמור הגדרות דומיין ו-DNS</span>
          </button>
        </div>
      </div>

      {/* Modules Catalog Table / Grid */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              רשימת הרכיבים, חשיפה ותמחור ({catalog.length})
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            {catalog.filter(m => m.isPublished).length} מתוך {catalog.length} מפורסמים בחנות
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="p-4">רכיב ומזהה</th>
                <th className="p-4">סטטוס בחנות</th>
                <th className="p-4">מחיר חודשי ({settings.currencySymbol})</th>
                <th className="p-4">מחיר שנתי לחודש ({settings.currencySymbol})</th>
                <th className="p-4">התנסות חיה (Sandbox)</th>
                <th className="p-4">תגית שיווקית</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {catalog.map(mod => {
                return (
                  <tr key={mod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    {/* Module info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {mod.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{mod.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">{mod.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Publish / Hide toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleModulePriceChange(mod, 'isPublished', !mod.isPublished)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-[11px] transition ${
                          mod.isPublished
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {mod.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>מוצג בחנות</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>מוסתר</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Monthly Price */}
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={mod.monthlyPrice}
                          onChange={e => handleModulePriceChange(mod, 'monthlyPrice', Number(e.target.value))}
                          className="w-20 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 dark:text-white"
                        />
                        <span className="text-gray-400">{settings.currencySymbol}</span>
                      </div>
                    </td>

                    {/* Annual Monthly Price */}
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={mod.annualMonthlyPrice}
                          onChange={e => handleModulePriceChange(mod, 'annualMonthlyPrice', Number(e.target.value))}
                          className="w-20 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                        />
                        <span className="text-gray-400">{settings.currencySymbol}</span>
                      </div>
                    </td>

                    {/* Trial allowed toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleModulePriceChange(mod, 'trialAllowed', !mod.trialAllowed)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                          mod.trialAllowed
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                        }`}
                      >
                        {mod.trialAllowed ? '✓ מאופשר דמו' : '✕ ללא דמו'}
                      </button>
                    </td>

                    {/* Badge */}
                    <td className="p-4">
                      <input
                        type="text"
                        value={mod.badgeText || ''}
                        placeholder="תגית..."
                        onChange={e => handleModulePriceChange(mod, 'badgeText', e.target.value)}
                        className="w-28 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[11px]"
                      />
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <span className="text-[10px] text-gray-400">נשמר אוטומטית</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
