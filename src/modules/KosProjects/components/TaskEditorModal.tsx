import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Diamond,
  Link2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import type { CrmContactSummary } from '../../../core/contracts';
import { DEFAULT_PHASES, TASK_STATUS_LABELS } from '../config';
import type {
  ProjectRecord,
  ProjectRoleAssignment,
  ProjectTask,
  TaskStatus,
} from '../types';

export interface TaskEditorModalProps {
  isOpen: boolean;
  project: ProjectRecord;
  task?: ProjectTask | null;
  allTasks: ProjectTask[];
  crmContacts: CrmContactSummary[];
  onClose: () => void;
  onSave: (
    data: Omit<ProjectTask, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
    existingTaskId?: string
  ) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onCreateSupplierInCrm: (data: {
    name: string;
    phone?: string;
    email?: string;
    role: string;
  }) => Promise<CrmContactSummary | null>;
  onSendReminder: (supplier: ProjectRoleAssignment, message: string) => Promise<boolean>;
  onDraftBrief: (task: ProjectTask, supplierName: string) => Promise<string>;
}

const CUSTOM_PHASE_VALUE = '__custom_phase__';

function getContactName(c: CrmContactSummary): string {
  return (c.kosun_crm_name || c.name || c.conta_name || '').trim() || 'איש קשר ללא שם';
}

function getContactPhone(c: CrmContactSummary): string {
  return (c.kosun_crm_phone || c.phone || c.conta_phone || '').trim();
}

function getContactEmail(c: CrmContactSummary): string {
  return (c.kosun_crm_email || c.email || '').trim();
}

function getContactRole(c: CrmContactSummary): string {
  return (c.role || c.companyName || '').trim();
}

const STATUS_STYLE_MAP: Record<TaskStatus, string> = {
  pending: 'border-slate-300 bg-slate-100 text-slate-800',
  in_progress: 'border-indigo-300 bg-indigo-50 text-indigo-800',
  at_risk: 'border-rose-300 bg-rose-50 text-rose-800',
  completed: 'border-emerald-300 bg-emerald-50 text-emerald-800',
};

interface SupplierActionState {
  briefText: string;
  drafting: boolean;
  sending: boolean;
  composerOpen: boolean;
  feedback?: { type: 'success' | 'error'; message: string };
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  isOpen,
  project,
  task,
  allTasks,
  crmContacts,
  onClose,
  onSave,
  onDelete,
  onCreateSupplierInCrm,
  onSendReminder,
  onDraftBrief,
}) => {
  const isEditing = Boolean(task?.id);

  // Available phases (default + existing in project)
  const availablePhases = useMemo(() => {
    const set = new Set<string>(DEFAULT_PHASES);
    for (const t of allTasks) {
      if (t.phase?.trim()) set.add(t.phase.trim());
    }
    if (task?.phase?.trim()) set.add(task.phase.trim());
    return Array.from(set);
  }, [allTasks, task?.phase]);

  // Core task fields
  const [title, setTitle] = useState('');
  const [phaseSelect, setPhaseSelect] = useState<string>(DEFAULT_PHASES[0]);
  const [customPhase, setCustomPhase] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [progress, setProgress] = useState<number>(0);
  const [isMilestone, setIsMilestone] = useState<boolean>(false);
  const [estimatedCost, setEstimatedCost] = useState<string>('');
  const [dependsOnTaskIds, setDependsOnTaskIds] = useState<string[]>([]);

  // Owner fields
  const [ownerName, setOwnerName] = useState('');
  const [ownerRole, setOwnerRole] = useState('');
  const [ownerContactId, setOwnerContactId] = useState<string | undefined>(undefined);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  // Suppliers fields
  const [suppliers, setSuppliers] = useState<ProjectRoleAssignment[]>([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Quick-add new supplier to CRM
  const [showQuickAddSupplier, setShowQuickAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierRole, setNewSupplierRole] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierCost, setNewSupplierCost] = useState('');
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [supplierFormError, setSupplierFormError] = useState<string | null>(null);

  // Per-supplier AI brief & reminder states (keyed by index)
  const [supplierActions, setSupplierActions] = useState<Record<number, SupplierActionState>>({});

  // Dependencies filter
  const [depSearch, setDepSearch] = useState('');

  // Form submit / delete state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync form state whenever modal opens or task changes
  useEffect(() => {
    if (!isOpen) return;

    const today = new Date().toISOString().split('T')[0];
    const defaultStart = project.startDate || today;
    const defaultEnd = project.targetEndDate >= defaultStart ? project.targetEndDate : defaultStart;

    if (task) {
      setTitle(task.title || '');
      const existingPhase = task.phase?.trim() || DEFAULT_PHASES[0];
      setPhaseSelect(existingPhase);
      setCustomPhase('');
      setDescription(task.description || '');
      setStartDate(task.startDate || defaultStart);
      setEndDate(task.endDate || task.startDate || defaultStart);
      setStatus(task.status || 'pending');
      setProgress(Number(task.progress) || 0);
      setIsMilestone(Boolean(task.isMilestone));
      setEstimatedCost(
        task.estimatedCost !== undefined && task.estimatedCost !== null
          ? String(task.estimatedCost)
          : ''
      );
      setDependsOnTaskIds(Array.isArray(task.dependsOnTaskIds) ? [...task.dependsOnTaskIds] : []);
      setOwnerName(task.ownerName || '');
      setOwnerRole(task.ownerRole || '');
      setOwnerContactId(task.ownerContactId);
      setSuppliers(Array.isArray(task.suppliers) ? task.suppliers.map((s) => ({ ...s })) : []);
    } else {
      setTitle('');
      setPhaseSelect(DEFAULT_PHASES[0]);
      setCustomPhase('');
      setDescription('');
      setStartDate(defaultStart);
      setEndDate(defaultEnd > defaultStart ? defaultStart : defaultStart);
      setStatus('pending');
      setProgress(0);
      setIsMilestone(false);
      setEstimatedCost('');
      setDependsOnTaskIds([]);
      setOwnerName('');
      setOwnerRole('');
      setOwnerContactId(undefined);
      setSuppliers([]);
    }

    setOwnerSearch('');
    setShowOwnerDropdown(false);
    setSupplierSearch('');
    setShowSupplierDropdown(false);
    setShowQuickAddSupplier(false);
    setNewSupplierName('');
    setNewSupplierRole('');
    setNewSupplierPhone('');
    setNewSupplierEmail('');
    setNewSupplierCost('');
    setSupplierFormError(null);
    setSupplierActions({});
    setDepSearch('');
    setFormError(null);
    setConfirmDelete(false);
  }, [isOpen, task, project.startDate, project.targetEndDate]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving && !deleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, deleting, onClose]);

  const filteredOwnerContacts = useMemo(() => {
    const q = ownerSearch.trim().toLowerCase();
    return crmContacts
      .filter((c) => {
        if (!q) return true;
        const haystack = [
          getContactName(c),
          getContactPhone(c),
          getContactEmail(c),
          getContactRole(c),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 25);
  }, [crmContacts, ownerSearch]);

  const filteredSupplierContacts = useMemo(() => {
    const q = supplierSearch.trim().toLowerCase();
    return crmContacts
      .filter((c) => {
        if (!q) return true;
        const haystack = [
          getContactName(c),
          getContactPhone(c),
          getContactEmail(c),
          getContactRole(c),
          ...(c.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 25);
  }, [crmContacts, supplierSearch]);

  const selectableDependencies = useMemo(() => {
    const q = depSearch.trim().toLowerCase();
    return allTasks
      .filter((t) => t.id !== task?.id)
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          (t.phase || '').toLowerCase().includes(q) ||
          (t.ownerName || '').toLowerCase().includes(q)
        );
      });
  }, [allTasks, task?.id, depSearch]);

  if (!isOpen) return null;

  const handleStatusChange = (nextStatus: TaskStatus) => {
    setStatus(nextStatus);
    if (nextStatus === 'completed') {
      setProgress(100);
    } else if (nextStatus === 'pending' && progress === 100) {
      setProgress(0);
    }
  };

  const handleMilestoneToggle = (checked: boolean) => {
    setIsMilestone(checked);
    if (checked && startDate) {
      setEndDate(startDate);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (isMilestone || (endDate && val > endDate)) {
      setEndDate(val);
    }
  };

  const handleToggleDependency = (depId: string) => {
    setDependsOnTaskIds((prev) =>
      prev.includes(depId) ? prev.filter((id) => id !== depId) : [...prev, depId]
    );
  };

  const handlePickOwnerContact = (contact: CrmContactSummary) => {
    setOwnerContactId(contact.id);
    setOwnerName(getContactName(contact));
    if (!ownerRole.trim()) {
      setOwnerRole(getContactRole(contact) || 'אחראי משימה');
    }
    setOwnerSearch('');
    setShowOwnerDropdown(false);
  };

  const handleClearOwnerContact = () => {
    setOwnerContactId(undefined);
  };

  const handleAddSupplierFromCrm = (contact: CrmContactSummary) => {
    const contactName = getContactName(contact);
    const alreadyExists = suppliers.some(
      (s) => (s.contactId && s.contactId === contact.id) || s.name === contactName
    );
    if (!alreadyExists) {
      setSuppliers((prev) => [
        ...prev,
        {
          contactId: contact.id,
          name: contactName,
          role: getContactRole(contact) || 'ספק',
          phone: getContactPhone(contact) || undefined,
          email: getContactEmail(contact) || undefined,
          isSupplier: true,
          costEstimate: undefined,
        },
      ]);
    }
    setSupplierSearch('');
    setShowSupplierDropdown(false);
  };

  const handleQuickCreateSupplier = async () => {
    const trimmedName = newSupplierName.trim();
    const trimmedRole = newSupplierRole.trim() || 'ספק';
    if (!trimmedName) {
      setSupplierFormError('יש להזין שם ספק.');
      return;
    }

    setSupplierFormError(null);
    setCreatingSupplier(true);
    try {
      const created = await onCreateSupplierInCrm({
        name: trimmedName,
        phone: newSupplierPhone.trim() || undefined,
        email: newSupplierEmail.trim() || undefined,
        role: trimmedRole,
      });

      const parsedCost = newSupplierCost.trim() ? Number(newSupplierCost) : undefined;
      const newEntry: ProjectRoleAssignment = {
        contactId: created?.id,
        name: created ? getContactName(created) : trimmedName,
        role: trimmedRole,
        phone: (created ? getContactPhone(created) : newSupplierPhone.trim()) || undefined,
        email: (created ? getContactEmail(created) : newSupplierEmail.trim()) || undefined,
        isSupplier: true,
        costEstimate: parsedCost !== undefined && !Number.isNaN(parsedCost) ? parsedCost : undefined,
      };

      setSuppliers((prev) => [...prev, newEntry]);
      setNewSupplierName('');
      setNewSupplierRole('');
      setNewSupplierPhone('');
      setNewSupplierEmail('');
      setNewSupplierCost('');
      setShowQuickAddSupplier(false);
    } catch (err: any) {
      setSupplierFormError(err?.message || 'שגיאה ביצירת הספק ב-CRM.');
    } finally {
      setCreatingSupplier(false);
    }
  };

  const handleUpdateSupplier = (index: number, patch: Partial<ProjectRoleAssignment>) => {
    setSuppliers((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const handleRemoveSupplier = (index: number) => {
    setSuppliers((prev) => prev.filter((_, i) => i !== index));
    setSupplierActions((prev) => {
      const next: Record<number, SupplierActionState> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const idx = Number(k);
        if (idx < index) next[idx] = v;
        if (idx > index) next[idx - 1] = v;
      });
      return next;
    });
  };

  const updateSupplierAction = (index: number, patch: Partial<SupplierActionState>) => {
    setSupplierActions((prev) => {
      const current: SupplierActionState = prev[index] || {
        briefText: '',
        drafting: false,
        sending: false,
        composerOpen: false,
      };
      return {
        ...prev,
        [index]: { ...current, ...patch },
      };
    });
  };

  const handleDraftSupplierBrief = async (index: number, supplier: ProjectRoleAssignment) => {
    if (!task) return;
    updateSupplierAction(index, { drafting: true, composerOpen: true, feedback: undefined });
    try {
      const drafted = await onDraftBrief(task, supplier.name);
      updateSupplierAction(index, {
        drafting: false,
        briefText: drafted || '',
        composerOpen: true,
      });
    } catch {
      updateSupplierAction(index, {
        drafting: false,
        feedback: { type: 'error', message: 'לא ניתן היה לנסח בריף כעת.' },
      });
    }
  };

  const handleOpenReminderComposer = (index: number, supplier: ProjectRoleAssignment) => {
    const existing = supplierActions[index];
    const defaultMessage = `שלום ${supplier.name}, תזכורת לגבי המשימה "${title || task?.title || ''}" בפרויקט "${project.title}". תאריך יעד: ${endDate || task?.endDate || ''}. נשמח לעדכון סטטוס.`;
    updateSupplierAction(index, {
      composerOpen: !existing?.composerOpen,
      briefText: existing?.briefText || defaultMessage,
      feedback: undefined,
    });
  };

  const handleSendSupplierReminder = async (index: number, supplier: ProjectRoleAssignment) => {
    const state = supplierActions[index];
    const msg = (state?.briefText || '').trim();
    if (!msg) {
      updateSupplierAction(index, {
        feedback: { type: 'error', message: 'יש להזין תוכן הודעה לפני השליחה.' },
      });
      return;
    }

    updateSupplierAction(index, { sending: true, feedback: undefined });
    try {
      const ok = await onSendReminder(supplier, msg);
      updateSupplierAction(index, {
        sending: false,
        feedback: ok
          ? { type: 'success', message: 'התזכורת נשלחה בהצלחה.' }
          : { type: 'error', message: 'השליחה נכשלה. ודאו שלספק מוגדר טלפון או דוא"ל.' },
      });
    } catch {
      updateSupplierAction(index, {
        sending: false,
        feedback: { type: 'error', message: 'אירעה שגיאה בשליחת התזכורת.' },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('יש להזין שם למשימה.');
      return;
    }

    const resolvedPhase =
      phaseSelect === CUSTOM_PHASE_VALUE
        ? customPhase.trim() || DEFAULT_PHASES[0]
        : phaseSelect.trim() || DEFAULT_PHASES[0];

    const resolvedStart = startDate || project.startDate || new Date().toISOString().split('T')[0];
    const resolvedEnd = isMilestone ? resolvedStart : endDate || resolvedStart;

    if (resolvedEnd < resolvedStart) {
      setFormError('תאריך הסיום חייב להיות מאוחר או שווה לתאריך ההתחלה.');
      return;
    }

    const parsedCost = estimatedCost.trim() ? Number(estimatedCost) : undefined;
    if (parsedCost !== undefined && (Number.isNaN(parsedCost) || parsedCost < 0)) {
      setFormError('אומדן העלות חייב להיות מספר חיובי.');
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      const payload: Omit<ProjectTask, 'id' | 'projectId' | 'createdAt' | 'updatedAt'> = {
        title: trimmedTitle,
        phase: resolvedPhase,
        description: description.trim() || undefined,
        startDate: resolvedStart,
        endDate: resolvedEnd,
        status,
        progress: Math.max(0, Math.min(100, Number(progress) || 0)),
        isMilestone,
        estimatedCost: parsedCost,
        dependsOnTaskIds,
        ownerName: ownerName.trim(),
        ownerRole: ownerRole.trim(),
        ownerContactId,
        suppliers: suppliers.map((s) => ({
          ...s,
          name: s.name.trim(),
          role: s.role.trim() || 'ספק',
          isSupplier: true,
        })),
        order: task?.order ?? allTasks.length + 1,
      };

      await onSave(payload, task?.id);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'שגיאה בשמירת המשימה.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task?.id || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'שגיאה במחיקת המשימה.');
      setDeleting(false);
    }
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'עריכת משימה' : 'יצירת משימה חדשה'}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 overflow-hidden"
    >
      {/* Top Fullscreen Modal Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {isEditing ? 'עריכת משימה' : 'משימה חדשה בגאנט'}
            </h2>
            {isMilestone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-semibold">
                <Diamond className="w-3.5 h-3.5" />
                אבן דרך
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
            פרויקט: <span className="font-medium text-slate-700">{project.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isEditing && onDelete && (
            <>
              {confirmDelete ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                  <span className="text-xs font-medium text-rose-800 hidden sm:inline">
                    לאשר מחיקה?
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteTask}
                    disabled={deleting}
                    className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    מחק
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="px-2 py-1 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200"
                  >
                    ביטול
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">מחיקה</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || deleting}
            style={{ backgroundColor: 'var(--brand-primary, #4f46e5)' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEditing ? 'שמירת שינויים' : 'יצירת משימה'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            aria-label="סגירת חלון"
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrollable Body */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {formError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Column: Details, Dates, Status, Dependencies */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Core Info */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: 'var(--brand-primary, #4f46e5)' }}
                    />
                    פרטי משימה ולוח זמנים
                  </h3>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    שם המשימה <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="לדוגמה: סגירת ספק הגברה ותאורה"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>

                {/* Phase + Estimated Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      שלב בפרויקט
                    </label>
                    <select
                      value={phaseSelect}
                      onChange={(e) => setPhaseSelect(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    >
                      {availablePhases.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      <option value={CUSTOM_PHASE_VALUE}>שלב מותאם אישית...</option>
                    </select>
                    {phaseSelect === CUSTOM_PHASE_VALUE && (
                      <input
                        type="text"
                        value={customPhase}
                        onChange={(e) => setCustomPhase(e.target.value)}
                        placeholder="הזינו שם שלב חדש"
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      אומדן עלות (₪)
                    </label>
                    <div className="relative">
                      <Wallet className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-300 bg-white pr-9 pl-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates + Milestone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      תאריך התחלה
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      תאריך יעד / סיום
                    </label>
                    <input
                      type="date"
                      value={isMilestone ? startDate : endDate}
                      min={startDate || undefined}
                      disabled={isMilestone}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <input
                    type="checkbox"
                    checked={isMilestone}
                    onChange={(e) => handleMilestoneToggle(e.target.checked)}
                    className="w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                  />
                  <Diamond className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      הגדרת משימה כאבן דרך (Milestone)
                    </span>
                    <p className="text-xs text-slate-600">
                      אבן דרך מסומנת כמעוין בולט על ציר הזמן ומייצגת תאריך יעד מרכזי.
                    </p>
                  </div>
                </label>

                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    סטטוס ביצוע
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((st) => {
                      const active = status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(st)}
                          className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            active
                              ? `${STATUS_STYLE_MAP[st]} ring-2 ring-offset-1 ring-indigo-500/40`
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5" />}
                          {TASK_STATUS_LABELS[st]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                      אחוז התקדמות
                    </label>
                    <span
                      className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-indigo-50"
                      style={{ color: 'var(--brand-primary, #4f46e5)' }}
                    >
                      {progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProgress(val);
                      if (val === 100 && status !== 'completed') setStatus('completed');
                      if (val > 0 && val < 100 && status === 'pending') setStatus('in_progress');
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1.5">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setProgress(val);
                          if (val === 100) setStatus('completed');
                          else if (val > 0 && status === 'pending') setStatus('in_progress');
                        }}
                        className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                          progress === val
                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    תיאור, דגשים ותוצרים נדרשים
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="פרטו את הגדרת המשימה, דרישות מיוחדות או הערות לצוות ולספקים..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-y"
                  />
                </div>
              </section>

              {/* Card 2: Dependencies */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Link2
                      className="w-4 h-4"
                      style={{ color: 'var(--brand-primary, #4f46e5)' }}
                    />
                    תלויות במשימות קודמות
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {dependsOnTaskIds.length} נבחרו
                  </span>
                </div>

                {allTasks.filter((t) => t.id !== task?.id).length === 0 ? (
                  <p className="text-sm text-slate-500">
                    אין עדיין משימות אחרות בפרויקט שניתן להגדיר כתלות.
                  </p>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={depSearch}
                        onChange={(e) => setDepSearch(e.target.value)}
                        placeholder="חיפוש משימה לפי שם או שלב..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                      {selectableDependencies.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                          לא נמצאו משימות תואמות לחיפוש.
                        </div>
                      ) : (
                        selectableDependencies.map((depTask) => {
                          const checked = dependsOnTaskIds.includes(depTask.id);
                          return (
                            <label
                              key={depTask.id}
                              className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                                checked ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleDependency(depTask.id)}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-slate-900 truncate">
                                  {depTask.title}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                                  <span>{depTask.phase}</span>
                                  <span>•</span>
                                  <span>
                                    {depTask.startDate} עד {depTask.endDate}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                  STATUS_STYLE_MAP[depTask.status]
                                }`}
                              >
                                {TASK_STATUS_LABELS[depTask.status]}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Secondary Column: Role Owner & Suppliers */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 3: Role Owner */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User
                      className="w-4 h-4"
                      style={{ color: 'var(--brand-primary, #4f46e5)' }}
                    />
                    בעל תפקיד אחראי
                  </h3>
                  {ownerContactId && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      מקושר ל-CRM
                    </span>
                  )}
                </div>

                {/* CRM Picker */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    בחירה מאנשי הקשר ב-CRM (אופציונלי)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ownerSearch}
                      onFocus={() => setShowOwnerDropdown(true)}
                      onChange={(e) => {
                        setOwnerSearch(e.target.value);
                        setShowOwnerDropdown(true);
                      }}
                      placeholder="חיפוש איש קשר לפי שם, טלפון או תפקיד..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {showOwnerDropdown && (
                    <div className="mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-100 z-20 relative">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 text-xs text-slate-500">
                        <span>תוצאות מה-CRM ({filteredOwnerContacts.length})</span>
                        <button
                          type="button"
                          onClick={() => setShowOwnerDropdown(false)}
                          className="text-slate-600 hover:text-slate-900 font-medium"
                        >
                          סגור
                        </button>
                      </div>
                      {filteredOwnerContacts.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">
                          לא נמצאו אנשי קשר תואמים. ניתן להזין פרטים ידנית מטה.
                        </div>
                      ) : (
                        filteredOwnerContacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handlePickOwnerContact(c)}
                            className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-900 truncate">
                                {getContactName(c)}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {[getContactRole(c), getContactPhone(c)]
                                  .filter(Boolean)
                                  .join(' • ') || 'ללא פרטים נוספים'}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Manual / Editable Owner Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      שם האחראי
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => {
                        setOwnerName(e.target.value);
                        if (ownerContactId) handleClearOwnerContact();
                      }}
                      placeholder="לדוגמה: דנה כהן"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      הגדרת תפקיד
                    </label>
                    <input
                      type="text"
                      value={ownerRole}
                      onChange={(e) => setOwnerRole(e.target.value)}
                      placeholder="לדוגמה: מנהל הפקה"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </section>

              {/* Card 4: Required Suppliers */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users
                      className="w-4 h-4"
                      style={{ color: 'var(--brand-primary, #4f46e5)' }}
                    />
                    ספקים נדרשים למשימה
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddSupplier((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    ספק חדש ב-CRM
                  </button>
                </div>

                {/* Quick-Add New Supplier to CRM */}
                {showQuickAddSupplier && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900">
                        הוספת ספק חדש ישירות ל-CRM ולמשימה
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddSupplier(false)}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {supplierFormError && (
                      <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                        {supplierFormError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        placeholder="שם הספק / החברה *"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={newSupplierRole}
                        onChange={(e) => setNewSupplierRole(e.target.value)}
                        placeholder="תחום / תפקיד (לדוגמה: קייטרינג)"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="tel"
                        value={newSupplierPhone}
                        onChange={(e) => setNewSupplierPhone(e.target.value)}
                        placeholder="טלפון / וואטסאפ"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="email"
                        value={newSupplierEmail}
                        onChange={(e) => setNewSupplierEmail(e.target.value)}
                        placeholder="דוא&quot;ל"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        min={0}
                        value={newSupplierCost}
                        onChange={(e) => setNewSupplierCost(e.target.value)}
                        placeholder="אומדן עלות ספק (₪)"
                        className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleQuickCreateSupplier}
                        disabled={creatingSupplier}
                        style={{ backgroundColor: 'var(--brand-primary, #4f46e5)' }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-95 disabled:opacity-50"
                      >
                        {creatingSupplier ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        שמירה ב-CRM ושיוך למשימה
                      </button>
                    </div>
                  </div>
                )}

                {/* Search existing CRM contacts for suppliers */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supplierSearch}
                    onFocus={() => setShowSupplierDropdown(true)}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setShowSupplierDropdown(true);
                    }}
                    placeholder="הוספת ספק קיים מה-CRM..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />

                  {showSupplierDropdown && (
                    <div className="mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-100 z-20 relative">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 text-xs text-slate-500">
                        <span>בחירת ספק מה-CRM ({filteredSupplierContacts.length})</span>
                        <button
                          type="button"
                          onClick={() => setShowSupplierDropdown(false)}
                          className="text-slate-600 hover:text-slate-900 font-medium"
                        >
                          סגור
                        </button>
                      </div>
                      {filteredSupplierContacts.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">
                          לא נמצאו ספקים תואמים. לחצו על &quot;ספק חדש ב-CRM&quot; להוספה מהירה.
                        </div>
                      ) : (
                        filteredSupplierContacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleAddSupplierFromCrm(c)}
                            className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-900 truncate">
                                {getContactName(c)}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {[getContactRole(c), getContactPhone(c), getContactEmail(c)]
                                  .filter(Boolean)
                                  .join(' • ') || 'איש קשר CRM'}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Assigned Suppliers List */}
                {suppliers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                    לא שויכו ספקים למשימה זו.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suppliers.map((sup, idx) => {
                      const actionState = supplierActions[idx];
                      return (
                        <div
                          key={`${sup.contactId || sup.name}_${idx}`}
                          className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 truncate">
                                {sup.name}
                              </div>
                              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-0.5">
                                {sup.phone && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {sup.phone}
                                  </span>
                                )}
                                {sup.email && (
                                  <span className="inline-flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {sup.email}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSupplier(idx)}
                              aria-label="הסרת ספק"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                                תחום / תפקיד
                              </label>
                              <input
                                type="text"
                                value={sup.role || ''}
                                onChange={(e) =>
                                  handleUpdateSupplier(idx, { role: e.target.value })
                                }
                                placeholder="תפקיד הספק"
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                                אומדן עלות (₪)
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={sup.costEstimate ?? ''}
                                onChange={(e) =>
                                  handleUpdateSupplier(idx, {
                                    costEstimate: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  })
                                }
                                placeholder="0"
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          {/* AI Brief & Reminder Actions (when editing existing task) */}
                          {isEditing && task && (
                            <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDraftSupplierBrief(idx, sup)}
                                  disabled={actionState?.drafting}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold disabled:opacity-50 transition-colors"
                                >
                                  {actionState?.drafting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  ניסוח בריף AI
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenReminderComposer(idx, sup)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  שליחת תזכורת
                                </button>
                              </div>

                              {actionState?.composerOpen && (
                                <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2">
                                  <label className="block text-[11px] font-semibold text-slate-600">
                                    תוכן ההודעה / הבריף לשליחה ל-{sup.name}
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={actionState.briefText}
                                    onChange={(e) =>
                                      updateSupplierAction(idx, { briefText: e.target.value })
                                    }
                                    placeholder="טקסט ההודעה לשליחה בוואטסאפ או בדוא&quot;ל..."
                                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-y"
                                  />
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-slate-500">
                                      יישלח דרך ערוץ התקשורת הזמין (וואטסאפ / דוא&quot;ל)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleSendSupplierReminder(idx, sup)}
                                      disabled={actionState.sending || actionState.drafting}
                                      style={{ backgroundColor: 'var(--brand-primary, #4f46e5)' }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-95 disabled:opacity-50"
                                    >
                                      {actionState.sending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Send className="w-3.5 h-3.5" />
                                      )}
                                      שליחה כעת
                                    </button>
                                  </div>
                                </div>
                              )}

                              {actionState?.feedback && (
                                <div
                                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                    actionState.feedback.type === 'success'
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-rose-50 border-rose-200 text-rose-800'
                                  }`}
                                >
                                  {actionState.feedback.type === 'success' ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  <span>{actionState.feedback.message}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
