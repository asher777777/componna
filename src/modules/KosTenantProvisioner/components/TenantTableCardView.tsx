import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Layers, KeyRound, ExternalLink, Lock, 
  Search, SlidersHorizontal, Plus, Trash2, Edit2, Check, X, 
  ShieldCheck, Crown, Cpu, Download, LayoutGrid, Table as TableIcon, 
  ChevronLeft, ChevronRight, Filter, AlertCircle, Sparkles, RefreshCw,
  Building, Mail, Phone, CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';
import { TenantAccount } from '../types';
import { buildTenantAdminUrl, buildTenantPublicUrl } from '../../../core/tenant';

function formatTokens(count?: number): string {
  if (!count || count <= 0) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

function formatCostUSD(usd?: number): string {
  return `$${(usd || 0).toFixed(3)}`;
}

export const TenantTableCardView: React.FC = () => {
  const {
    filteredTenants,
    masterTenant,
    loading,
    searchTerm,
    setSearchTerm,
    selectedModuleFilter,
    setSelectedModuleFilter,
    setIsCreateModalOpen,
    setEditingTenant,
    setViewingCredentialsTenant,
    deleteTenant,
    updateTenantAccount,
    refreshTenants,
  } = useTenantProvisioner();

  // Responsive View Mode (Table by default on desktop, Cards on narrow screens, toggleable)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  
  // Inline editing state (לפי דרישה ד' - כמו ב-CRM אנליטיק)
  const [editingCell, setEditingCell] = useState<{ subdomain: string; field: 'clientName' | 'ownerEmail' | 'ownerPhone' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingCell, setIsSavingCell] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('cards');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Combine Master Domain with other tenants (דרישה ג: כריבוע/שורה רגיל בתוך התצוגה)
  const allTenantsList = useMemo(() => {
    const list: TenantAccount[] = [];

    if (masterTenant) {
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !cleanSearch ||
        masterTenant.subdomain.toLowerCase().includes(cleanSearch) ||
        masterTenant.fullDomain.toLowerCase().includes(cleanSearch) ||
        masterTenant.clientName.toLowerCase().includes(cleanSearch) ||
        masterTenant.adminUsername.toLowerCase().includes(cleanSearch);

      const matchesModule =
        selectedModuleFilter === 'all' ||
        (masterTenant.activeModules && masterTenant.activeModules.includes(selectedModuleFilter));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && masterTenant.status === 'active') ||
        (statusFilter === 'suspended' && masterTenant.status === 'suspended');

      if (matchesSearch && matchesModule && matchesStatus) {
        list.push(masterTenant);
      }
    }

    const filtered = filteredTenants.filter((t) => {
      if (t.subdomain === '_master' || t.isMaster) return false;
      if (statusFilter === 'all') return true;
      return t.status === statusFilter;
    });

    list.push(...filtered);
    return list;
  }, [masterTenant, filteredTenants, searchTerm, selectedModuleFilter, statusFilter]);

  // Paginated Tenants
  const totalPages = Math.ceil(allTenantsList.length / pageSize) || 1;
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allTenantsList.slice(start, start + pageSize);
  }, [allTenantsList, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedModuleFilter, statusFilter, pageSize]);

  // Inline save handler
  const handleSaveInline = async (subdomain: string, field: 'clientName' | 'ownerEmail' | 'ownerPhone') => {
    if (isSavingCell) return;
    setIsSavingCell(true);
    try {
      const updates: Partial<TenantAccount> = {
        [field]: editValue.trim(),
      };
      if (field === 'ownerEmail') {
        updates.adminUsername = editValue.trim();
      }
      await updateTenantAccount(subdomain, updates);
      setEditingCell(null);
      setFeedbackToast('הנתון עודכן ונשמר בהצלחה בבסיס הנתונים');
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch {
      setFeedbackToast('שגיאה בשמירת השינוי');
      setTimeout(() => setFeedbackToast(null), 3000);
    } finally {
      setIsSavingCell(false);
    }
  };

  const handleStartEdit = (subdomain: string, field: 'clientName' | 'ownerEmail' | 'ownerPhone', initialValue: string) => {
    setEditingCell({ subdomain, field });
    setEditValue(initialValue || '');
  };

  // Quick toggle status for tenant
  const handleToggleStatus = async (tenant: TenantAccount) => {
    if (tenant.isMaster || tenant.subdomain === '_master') return;
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    await updateTenantAccount(tenant.subdomain, { status: newStatus });
    setFeedbackToast(`סטטוס הדומיין שונה ל-${newStatus === 'active' ? 'פעיל' : 'מושעה'}`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (allTenantsList.length === 0) return;
    const rows = allTenantsList.map((t, idx) => ({
      '#': idx + 1,
      'סוג': t.isMaster ? 'דומיין ראשי (Master)' : 'סאב-דומיין',
      'סאב דומיין': t.subdomain,
      'כתובת מלאה': t.fullDomain,
      'שם העסק / לקוח': t.clientName,
      'אימייל מנהל': t.ownerEmail || t.adminUsername,
      'טלפון': t.ownerPhone || '',
      'כמות רכיבים': (t.activeModules || []).length,
      'רכיבים פעילים': (t.activeModules || []).join(', '),
      'סה"כ טוקנים': t.tokenUsage?.totalTokens || 0,
      'עלות משוערת דולר': t.tokenUsage?.totalCostUSD || 0,
      'סטטוס': t.status === 'active' ? 'פעיל' : 'מושעה',
      'תאריך הקמה': t.createdAt || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'דומיינים');
    XLSX.writeFile(workbook, `kosun_tenants_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Action Toolbar & Filters (בהשראת CRM אנליטיק) */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72 md:w-80">
          <input
            type="text"
            placeholder="חיפוש לפי סאב-דומיין, שם עסק, מנהל..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-8 top-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            הכל ({allTenantsList.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            פעילים
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'suspended'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            מושעים
          </button>
        </div>

        {/* Filter by Module & View Mode Switcher */}
        <div className="flex items-center gap-2 mr-auto sm:mr-0">
          {/* Module Selector */}
          <div className="relative">
            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
            >
              <option value="all">כל הרכיבים</option>
              {AVAILABLE_MODULES_CATALOG.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="ייצוא נתונים לקובץ אקסל"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ייצוא Excel</span>
          </button>

          {/* View Mode Switcher (Table vs. Cards) */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="תצוגת טבלה ניתנת לעריכה (כמו ב-CRM)"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="תצוגת כרטיסים"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <span>טוען נתוני דומיינים...</span>
        </div>
      ) : allTenantsList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Globe className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            לא נמצאו דומיינים התואמים לחיפוש
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            באפשרותך לאפס את מונחי החיפוש או להקים סאב-דומיין חדש.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הקם סאב-דומיין חדש</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================================================================= */
        /* Table View: Dynamic Editable Table (דרישה ד' - פריסה ועריכה כמו ב-CRM)    */
        /* ========================================================================= */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold select-none">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3 whitespace-nowrap">דומיין / כתובת</th>
                  <th className="p-3 whitespace-nowrap">שם עסק / לקוח (עריכה בלחיצה)</th>
                  <th className="p-3 whitespace-nowrap">אימייל מנהל</th>
                  <th className="p-3 whitespace-nowrap">טלפון</th>
                  <th className="p-3 whitespace-nowrap">רכיבים מוטענים</th>
                  <th className="p-3 whitespace-nowrap">מד טוקנים (שימוש AI)</th>
                  <th className="p-3 whitespace-nowrap text-center">סטטוס</th>
                  <th className="p-3 whitespace-nowrap text-center w-36">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedTenants.map((tenant, idx) => {
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                  const isMaster = Boolean(tenant.isMaster || tenant.subdomain === '_master');
                  const adminUrl = buildTenantAdminUrl(tenant.subdomain, tenant.fullDomain);
                  const publicUrl = isMaster ? '/' : buildTenantPublicUrl(tenant.subdomain, tenant.fullDomain);

                  const isEditingName = editingCell?.subdomain === tenant.subdomain && editingCell?.field === 'clientName';
                  const isEditingEmail = editingCell?.subdomain === tenant.subdomain && editingCell?.field === 'ownerEmail';
                  const isEditingPhone = editingCell?.subdomain === tenant.subdomain && editingCell?.field === 'ownerPhone';

                  return (
                    <tr
                      key={tenant.subdomain}
                      className={`transition ${
                        isMaster
                          ? 'bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/15'
                          : 'hover:bg-indigo-50/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Row # */}
                      <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                        {isMaster ? <Crown className="w-3.5 h-3.5 text-amber-500 mx-auto" /> : rowIndex}
                      </td>

                      {/* Domain / Subdomain */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isMaster ? (
                            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                              <Crown className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                              <Globe className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {isMaster ? 'kosun.pro' : tenant.subdomain}
                              </span>
                              {isMaster && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                  ראשי (Master)
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 block" dir="ltr">
                              {tenant.fullDomain}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client Name (Inline Editable) */}
                      <td className="p-3 whitespace-nowrap">
                        {isEditingName ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInline(tenant.subdomain, 'clientName');
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              autoFocus
                              className="px-2 py-1 text-xs border border-indigo-500 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                            />
                            <button
                              onClick={() => handleSaveInline(tenant.subdomain, 'clientName')}
                              disabled={isSavingCell}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                              title="שמור"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingCell(null)}
                              className="p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 rounded transition"
                              title="בטל"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => !isMaster && handleStartEdit(tenant.subdomain, 'clientName', tenant.clientName)}
                            className={`flex items-center gap-1.5 group ${!isMaster ? 'cursor-pointer hover:text-indigo-600' : ''}`}
                            title={!isMaster ? 'לחץ לעריכה מהירה' : undefined}
                          >
                            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                              {tenant.clientName || '—'}
                            </span>
                            {!isMaster && (
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Admin Email (Inline Editable) */}
                      <td className="p-3 whitespace-nowrap">
                        {isEditingEmail ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="email"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInline(tenant.subdomain, 'ownerEmail');
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              autoFocus
                              className="px-2 py-1 text-xs border border-indigo-500 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                              dir="ltr"
                            />
                            <button
                              onClick={() => handleSaveInline(tenant.subdomain, 'ownerEmail')}
                              disabled={isSavingCell}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingCell(null)}
                              className="p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 rounded transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => !isMaster && handleStartEdit(tenant.subdomain, 'ownerEmail', tenant.ownerEmail || tenant.adminUsername)}
                            className={`flex items-center gap-1.5 group font-mono text-[11px] ${!isMaster ? 'cursor-pointer hover:text-indigo-600' : ''}`}
                            dir="ltr"
                            title={!isMaster ? 'לחץ לעריכה מהירה' : undefined}
                          >
                            <span className="truncate max-w-[180px]">
                              {tenant.ownerEmail || tenant.adminUsername || '—'}
                            </span>
                            {!isMaster && (
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Phone (Inline Editable) */}
                      <td className="p-3 whitespace-nowrap">
                        {isEditingPhone ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInline(tenant.subdomain, 'ownerPhone');
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              autoFocus
                              className="px-2 py-1 text-xs border border-indigo-500 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                              dir="ltr"
                            />
                            <button
                              onClick={() => handleSaveInline(tenant.subdomain, 'ownerPhone')}
                              disabled={isSavingCell}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingCell(null)}
                              className="p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 rounded transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => !isMaster && handleStartEdit(tenant.subdomain, 'ownerPhone', tenant.ownerPhone || '')}
                            className={`flex items-center gap-1.5 group font-mono text-[11px] ${!isMaster ? 'cursor-pointer hover:text-indigo-600' : ''}`}
                            dir="ltr"
                            title={!isMaster ? 'לחץ לעריכה מהירה' : undefined}
                          >
                            <span>{tenant.ownerPhone || '—'}</span>
                            {!isMaster && (
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Active Modules */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingTenant(tenant)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
                          title="לחץ לעריכת הרכיבים של דומיין זה"
                        >
                          <Layers className="w-3 h-3" />
                          <span>
                            {isMaster ? 'כל 18 הרכיבים (Full Suite)' : `${tenant.activeModules?.length || 0} רכיבים`}
                          </span>
                        </button>
                      </td>

                      {/* Token Usage Meter (דרישה ה: חישוב מדויק כולל מסטר) */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <Cpu className="w-3 h-3 text-indigo-500" />
                          </span>
                          <div>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {formatTokens(tenant.tokenUsage?.totalTokens)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {formatCostUSD(tenant.tokenUsage?.totalCostUSD)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 whitespace-nowrap text-center">
                        {isMaster ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                            פעיל ראשי
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(tenant)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                              tenant.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                            }`}
                            title="לחץ לשינוי סטטוס"
                          >
                            {tenant.status === 'active' ? 'פעיל' : 'מושעה'}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Comprehensive Edit (Modules, Keys, Tokens, Details) */}
                          <button
                            type="button"
                            onClick={() => setEditingTenant(tenant)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
                            title={isMaster ? 'ערוך מפתחות מאסטר והגדרות' : 'עריכה מקיפה (רכיבים, מפתחות, טוקנים)'}
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Credentials (Subdomains only) */}
                          {!isMaster && (
                            <button
                              type="button"
                              onClick={() => setViewingCredentialsTenant(tenant)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                              title="פרטי גישה וסיסמה"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* External Link */}
                          <a
                            href={isMaster ? '/' : adminUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer inline-flex items-center"
                            title={isMaster ? 'כניסה למערכת ראשית' : 'כניסה לניהול סאב-דומיין'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete (Protected for Master - דרישה ג: בלי אפשרות למחיקה) */}
                          {isMaster ? (
                            <span
                              className="p-1.5 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                              title="דומיין ראשי מוגן ממחיקה"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`האם אתה בטוח שברצונך להשעות/למחוק את הסאב-דומיין "${tenant.subdomain}"?`)) {
                                  deleteTenant(tenant.subdomain);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="מחק / השעה סאב-דומיין"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>שורות בעמוד:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>(סה"כ {allTenantsList.length} דומיינים)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>
                עמוד {currentPage} מתוך {totalPages}
              </span>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* Cards View: Grid of Regular Box Cards (כולל את הדומיין הראשי כריבוע רגיל) */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTenants.map((tenant) => {
            const isMaster = Boolean(tenant.isMaster || tenant.subdomain === '_master');
            const adminUrl = buildTenantAdminUrl(tenant.subdomain, tenant.fullDomain);
            const publicUrl = isMaster ? '/' : buildTenantPublicUrl(tenant.subdomain, tenant.fullDomain);

            return (
              <div
                key={tenant.subdomain}
                className={`border rounded-3xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between gap-4 group ${
                  isMaster
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 hover:border-amber-500 shadow-amber-500/5 ring-1 ring-amber-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/60'
                }`}
              >
                {/* Card Top: Subdomain & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {isMaster && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                        <span className="font-mono text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {isMaster ? 'kosun.pro' : tenant.subdomain}
                        </span>
                        {isMaster ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400">
                            דומיין ראשי (Master)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                            {tenant.status === 'active' ? 'פעיל' : 'מושעה'}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500 block truncate" dir="ltr">
                        {tenant.fullDomain}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isMaster ? (
                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500" title="מוגן ממחיקה">
                          <Lock className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setViewingCredentialsTenant(tenant)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="הצג וערוך פרטי כניסה"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">עסק:</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {tenant.clientName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">מנהל:</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[180px]" dir="ltr">
                        {tenant.ownerEmail || tenant.adminUsername}
                      </span>
                    </div>
                    {tenant.ownerPhone && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">טלפון:</span>
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300" dir="ltr">
                          {tenant.ownerPhone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Token Usage Bar */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      <span>מונה טוקנים AI:</span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {formatTokens(tenant.tokenUsage?.totalTokens)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {formatCostUSD(tenant.tokenUsage?.totalCostUSD)}
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
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold"
                      >
                        ערוך רכיבים
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {isMaster ? (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          כל 18 הרכיבים פעילים (Full Platform Suite)
                        </span>
                      ) : (tenant.activeModules || []).slice(0, 4).map((modId) => {
                        const info = AVAILABLE_MODULES_CATALOG.find((m) => m.id === modId);
                        return (
                          <span
                            key={modId}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700"
                          >
                            {info ? info.englishPrefix + info.englishRest : modId}
                          </span>
                        );
                      })}
                      {!isMaster && (tenant.activeModules?.length || 0) > 4 && (
                        <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold">
                          +{(tenant.activeModules?.length || 0) - 4} נוספים
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Comprehensive Edit Modal */}
                    <button
                      type="button"
                      onClick={() => setEditingTenant(tenant)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{isMaster ? 'ערוך מפתחות מאסטר' : 'עריכה מקיפה'}</span>
                    </button>

                    {/* External Link */}
                    <a
                      href={isMaster ? '/' : adminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title={isMaster ? 'כניסה למערכת ראשית' : 'כניסה לניהול סאב-דומיין'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Delete Button (Protected for Master - דרישה ג) */}
                  {isMaster ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>מוגן</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`האם אתה בטוח שברצונך להשעות/למחוק את הסאב-דומיין "${tenant.subdomain}"?`)) {
                          deleteTenant(tenant.subdomain);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="מחק סאב-דומיין"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
