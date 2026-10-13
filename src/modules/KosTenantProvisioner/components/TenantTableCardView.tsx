import React from 'react';
import { 
  Globe, Layers, KeyRound, ExternalLink, Lock, 
  Search, SlidersHorizontal, Plus, Trash2, Eye, ShieldCheck 
} from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';
import { TenantAccount } from '../types';

export const TenantTableCardView: React.FC = () => {
  const {
    filteredTenants,
    loading,
    searchTerm,
    setSearchTerm,
    selectedModuleFilter,
    setSelectedModuleFilter,
    setIsCreateModalOpen,
    setEditingTenant,
    setViewingCredentialsTenant,
    deleteTenant,
  } = useTenantProvisioner();

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search and Filters Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="חיפוש לפי סאב-דומיין, שם עסק, שם משתמש..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        {/* Filter by Module */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>סנן לפי רכיב:</span>
          </div>
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
          >
            <option value="all">כל הרכיבים</option>
            {AVAILABLE_MODULES_CATALOG.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.englishPrefix}{m.englishRest})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">סאב-דומיין חדש</span>
          </button>
        </div>

      </div>

      {/* Tenants Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          טוען סאב-דומיינים...
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Globe className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            לא נמצאו סאב-דומיינים התואמים לחיפוש
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            באפשרותך ליצור סאב-דומיין חדש ולהטעין אותו ברכיבים בלחיצת כפתור אחת.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>הקם סאב-דומיין ראשון</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((tenant) => {
            const adminUrl = `/?tenant=${tenant.subdomain}&mode=admin`;
            const publicUrl = `https://${tenant.fullDomain}`;

            return (
              <div
                key={tenant.subdomain}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/60 rounded-3xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between gap-4 group"
              >
                {/* Card Top: Subdomain & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tenant.subdomain}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                          {tenant.status === 'active' ? 'פעיל' : 'מושעה'}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500 block truncate" dir="ltr">
                        {tenant.fullDomain}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingCredentialsTenant(tenant)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="הצג וערוך פרטי כניסה"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Client Info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">עסק:</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {tenant.clientName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">מנהל:</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[180px]" dir="ltr">
                        {tenant.adminUsername}
                      </span>
                    </div>
                  </div>

                  {/* Active Modules Badges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>רכיבים מוטענים ({tenant.activeModules?.length || 0}):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingTenant(tenant)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                      >
                        ערוך רכיבים
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {(tenant.activeModules || []).map((modId) => {
                        const meta = AVAILABLE_MODULES_CATALOG.find((m) => m.id === modId);
                        return (
                          <span
                            key={modId}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                          >
                            <span>{meta ? meta.name : modId}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    title="כניסה ישירה ללוח הניהול"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>לוח ניהול</span>
                  </a>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    title="צפייה באתר עבור מבקרים"
                  >
                    <Eye className="w-4 h-4 text-emerald-500" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`האם אתה בטוח שברצונך למחוק/להשעות את הסאב-דומיין ${tenant.subdomain}?`)) {
                        deleteTenant(tenant.subdomain);
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="מחק / השעה סאב-דומיין"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
