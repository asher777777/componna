import React, { useState } from 'react';
import { 
  X, Globe, Lock, ShieldCheck, KeyRound, Sparkles, 
  Layers, Check, Copy, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';
import { TenantProvisionFormState } from '../types';
import { buildTenantAdminUrl } from '../../../core/tenant';

export const TenantCreateModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createTenant } = useTenantProvisioner();

  const [form, setForm] = useState<TenantProvisionFormState>({
    subdomain: '',
    clientName: '',
    adminUsername: '',
    adminPassword: '',
    ownerPhone: '',
    selectedModules: AVAILABLE_MODULES_CATALOG.filter((m) => m.defaultIncluded).map((m) => m.id),
    billingPlan: 'monthly',
    notes: '',
  });

  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdTenantSuccess, setCreatedTenantSuccess] = useState<any | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleSubdomainChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setForm((prev) => ({
      ...prev,
      subdomain: clean,
      adminUsername: prev.adminUsername ? prev.adminUsername : `${clean}@kosun.pro`,
    }));

    if (clean.length > 0 && clean.length < 3) {
      setSubdomainError('לפחות 3 תווים באנגלית');
    } else {
      setSubdomainError(null);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Ks@';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, adminPassword: pass }));
  };

  const toggleModule = (modId: string) => {
    setForm((prev) => {
      const exists = prev.selectedModules.includes(modId);
      return {
        ...prev,
        selectedModules: exists
          ? prev.selectedModules.filter((id) => id !== modId)
          : [...prev.selectedModules, modId],
      };
    });
  };

  const selectAllModules = () => {
    setForm((prev) => ({
      ...prev,
      selectedModules: AVAILABLE_MODULES_CATALOG.map((m) => m.id),
    }));
  };

  const resetToDefaultModules = () => {
    setForm((prev) => ({
      ...prev,
      selectedModules: AVAILABLE_MODULES_CATALOG.filter((m) => m.defaultIncluded).map((m) => m.id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subdomain || form.subdomain.length < 3) {
      setSubdomainError('נא להזין סאב-דומיין תקין (לפחות 3 תווים)');
      return;
    }

    if (!form.adminPassword) {
      generatePassword();
    }

    setSubmitting(true);
    try {
      const result = await createTenant({
        ...form,
        adminPassword: form.adminPassword || 'Ks@1234',
        adminUsername: form.adminUsername || `${form.subdomain}@kosun.pro`,
      });
      setCreatedTenantSuccess(result);
    } catch (err: any) {
      setSubdomainError(err.message || 'שגיאה ביצירת הסאב-דומיין');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setCreatedTenantSuccess(null);
    setSubdomainError(null);
    setForm({
      subdomain: '',
      clientName: '',
      adminUsername: '',
      adminPassword: '',
      ownerPhone: '',
      selectedModules: AVAILABLE_MODULES_CATALOG.filter((m) => m.defaultIncluded).map((m) => m.id),
      billingPlan: 'monthly',
      notes: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                יצירת סאב-דומיין חדש והטענת רכיבים
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                הקצאת סביבה מבודדת 100% לפי חוקי הטננט של KOSUN26
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdTenantSuccess ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                הסאב-דומיין נוצר והוטען בהצלחה! 🎉
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                הסביבה המבודדת עבור{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {createdTenantSuccess.clientName}
                </span>{' '}
                הוקמה עם{' '}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {createdTenantSuccess.activeModules.length} רכיבים מוטענים
                </span>
                .
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3 text-right max-w-lg mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">כתובת הסאב-דומיין:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400" dir="ltr">
                    https://{createdTenantSuccess.fullDomain}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${createdTenantSuccess.fullDomain}`);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="העתק כתובת"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">שם משתמש למנהל:</span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white" dir="ltr">
                  {createdTenantSuccess.adminUsername}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">סיסמה:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20" dir="ltr">
                    {createdTenantSuccess.adminPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdTenantSuccess.adminPassword);
                      setCopiedPass(true);
                      setTimeout(() => setCopiedPass(false), 2000);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="העתק סיסמה"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto pt-2">
              <a
                href={buildTenantAdminUrl(createdTenantSuccess.subdomain, createdTenantSuccess.fullDomain)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>כניסה ללוח הניהול של הסאב-דומיין</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            
            {/* Step 1: Subdomain & Basic Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>1. הגדרת סאב-דומיין ופרטי העסק</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subdomain Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    סאב-דומיין (באנגלית): <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="client1"
                      value={form.subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono text-left focus:ring-2 focus:ring-indigo-500 outline-none"
                      dir="ltr"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono pointer-events-none">
                      .kosun.pro
                    </span>
                  </div>
                  {subdomainError ? (
                    <span className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {subdomainError}
                    </span>
                  ) : form.subdomain ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-mono" dir="ltr">
                      https://{form.subdomain}.kosun.pro
                    </span>
                  ) : null}
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    שם העסק / הלקוח: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="לדוגמה: מרכז הפסיפס בע״מ"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    טלפון מנהל (וואטסאפ):
                  </label>
                  <input
                    type="tel"
                    placeholder="050-1234567"
                    value={form.ownerPhone}
                    onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Billing Plan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    תוכנית מנוי:
                  </label>
                  <select
                    value={form.billingPlan}
                    onChange={(e) => setForm({ ...form, billingPlan: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="monthly">מנוי חודשי</option>
                    <option value="annual">מנוי שנתי (20% הנחה)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Admin Credentials */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>2. פרטי כניסה ואבטחה למנהל הסאב-דומיין</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    שם משתמש / אימייל: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin@kosun.pro"
                    value={form.adminUsername}
                    onChange={(e) => setForm({ ...form, adminUsername: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono text-left focus:ring-2 focus:ring-indigo-500 outline-none"
                    dir="ltr"
                  />
                </div>

                {/* Password with Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      סיסמת כניסה: <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      חולל סיסמה חזקה
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="הזן סיסמה או חולל אוטומטית"
                      value={form.adminPassword}
                      onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono text-left focus:ring-2 focus:ring-indigo-500 outline-none pr-10"
                      dir="ltr"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Module Loader / Provisioner */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span>3. בחירת רכיבים להטענה בסאב-דומיין ({form.selectedModules.length} נבחרו)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    רק הרכיבים שתסמן יופיעו בממשק של מנהל הסאב-דומיין
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllModules}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                  >
                    בחר הכל
                  </button>
                  <button
                    type="button"
                    onClick={resetToDefaultModules}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold transition cursor-pointer"
                  >
                    חבילת בסיס
                  </button>
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {AVAILABLE_MODULES_CATALOG.map((mod) => {
                  const isChecked = form.selectedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`p-3 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ${
                        isChecked
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isChecked ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                            {mod.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0" dir="ltr">
                            {mod.englishPrefix}{mod.englishRest}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ביטול
              </button>

              <button
                type="submit"
                disabled={submitting || form.selectedModules.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>יוצר ומטעין רכיבים...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>צור והפעל סאב-דומיין</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
