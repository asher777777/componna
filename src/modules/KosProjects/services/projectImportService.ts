/**
 * KosProjects - Excel & CSV Workplan Import/Export Service
 * Parses .xlsx / .xls / .csv files with automatic Hebrew & English header detection,
 * and exports structured Gantt workplans to Excel (.xlsx).
 */

import * as XLSX from 'xlsx';
import {
  ProjectImportResult,
  ProjectRecord,
  ProjectRoleAssignment,
  ProjectTask,
  ProjectTaskDraft,
  TaskStatus,
} from '../types';
import { DEFAULT_PHASES, TASK_STATUS_LABELS } from '../config';

type ColumnKey =
  | 'title'
  | 'phase'
  | 'description'
  | 'startDate'
  | 'endDate'
  | 'ownerName'
  | 'ownerRole'
  | 'supplier'
  | 'status'
  | 'progress'
  | 'estimatedCost'
  | 'isMilestone';

const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  title: ['משימה', 'שם משימה', 'כותרת', 'פעילות', 'task', 'title', 'name', 'task name', 'activity'],
  phase: ['שלב', 'קטגוריה', 'מקטע', 'phase', 'stage', 'category', 'group'],
  description: ['תיאור', 'הערות', 'פירוט', 'description', 'notes', 'details'],
  startDate: ['התחלה', 'תאריך התחלה', 'מתאריך', 'start', 'start date', 'startdate', 'from'],
  endDate: ['סיום', 'תאריך סיום', 'עד תאריך', 'יעד', 'end', 'end date', 'enddate', 'due', 'due date', 'to'],
  ownerName: ['אחראי', 'מבצע', 'בעלים', 'owner', 'assignee', 'responsible', 'owner name'],
  ownerRole: ['תפקיד', 'מחלקה', 'role', 'department', 'owner role'],
  supplier: ['ספק', 'ספקים', 'קבלן', 'supplier', 'suppliers', 'vendor', 'vendors'],
  status: ['סטטוס', 'מצב', 'status', 'state'],
  progress: ['התקדמות', 'אחוז', 'אחוז ביצוע', 'progress', 'percent', '%'],
  estimatedCost: ['עלות', 'תקציב', 'עלות משוערת', 'cost', 'budget', 'estimated cost', 'price'],
  isMilestone: ['אבן דרך', 'milestone'],
};

function normalizeHeader(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function resolveColumnMap(headers: string[]): Partial<Record<ColumnKey, string>> {
  const map: Partial<Record<ColumnKey, string>> = {};
  for (const rawHeader of headers) {
    const norm = normalizeHeader(rawHeader);
    for (const [key, aliases] of Object.entries(HEADER_ALIASES) as Array<[ColumnKey, string[]]>) {
      if (map[key]) continue;
      if (aliases.some((alias) => norm === alias || norm.includes(alias))) {
        map[key] = rawHeader;
      }
    }
  }
  return map;
}

function parseExcelOrStringDate(raw: any, fallbackIso: string): string {
  if (raw === null || raw === undefined || raw === '') return fallbackIso;

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().split('T')[0];
  }

  // Excel serial date number
  if (typeof raw === 'number' && raw > 20000 && raw < 90000) {
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      return `${parsed.y}-${m}-${d}`;
    }
  }

  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const dt = new Date(str);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toISOString().split('T')[0];
  }

  return fallbackIso;
}

function addDaysIso(isoDate: string, days: number): string {
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return isoDate;
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split('T')[0];
}

function parseTaskStatus(raw: any): TaskStatus {
  const val = String(raw || '').trim().toLowerCase();
  if (!val) return 'pending';
  if (val.includes('הושלם') || val.includes('בוצע') || val.includes('done') || val.includes('complete')) {
    return 'completed';
  }
  if (val.includes('סיכון') || val.includes('עיכוב') || val.includes('risk') || val.includes('delay') || val.includes('blocked')) {
    return 'at_risk';
  }
  if (val.includes('ביצוע') || val.includes('תהליך') || val.includes('progress') || val.includes('active')) {
    return 'in_progress';
  }
  return 'pending';
}

function parseSuppliers(raw: any): ProjectRoleAssignment[] {
  const str = String(raw || '').trim();
  if (!str) return [];
  return str
    .split(/[,;|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({
      name,
      role: 'ספק',
      isSupplier: true,
    }));
}

function parseBooleanFlag(raw: any): boolean {
  const val = String(raw || '').trim().toLowerCase();
  return ['כן', 'true', '1', 'yes', 'v', 'x', 'אבן דרך', 'milestone'].includes(val);
}

/**
 * Parse an uploaded .xlsx / .xls / .csv file into ProjectTaskDraft[]
 */
export async function parseProjectTasksFromFile(
  file: File,
  defaultStartDate?: string
): Promise<ProjectImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { tasks: [], detectedPhases: [], rowCount: 0, warnings: ['הקובץ אינו מכיל גיליונות נתונים.'] };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  if (rows.length === 0) {
    return { tasks: [], detectedPhases: [], rowCount: 0, warnings: ['לא נמצאו שורות נתונים בגיליון.'] };
  }

  const headers = Object.keys(rows[0] || {});
  const colMap = resolveColumnMap(headers);
  const warnings: string[] = [];

  if (!colMap.title) {
    warnings.push('לא זוהתה עמודת "משימה / Task" באופן אוטומטי; נעשה שימוש בעמודה הראשונה.');
    colMap.title = headers[0];
  }

  const baseDate = defaultStartDate || new Date().toISOString().split('T')[0];
  const phasesSet = new Set<string>();
  const tasks: ProjectTaskDraft[] = [];

  rows.forEach((row, index) => {
    const titleRaw = colMap.title ? String(row[colMap.title] ?? '').trim() : '';
    if (!titleRaw) return;

    const phase = (colMap.phase ? String(row[colMap.phase] ?? '').trim() : '') || DEFAULT_PHASES[0];
    phasesSet.add(phase);

    const fallbackStart = addDaysIso(baseDate, index * 3);
    const startDate = colMap.startDate
      ? parseExcelOrStringDate(row[colMap.startDate], fallbackStart)
      : fallbackStart;

    const fallbackEnd = addDaysIso(startDate, 4);
    let endDate = colMap.endDate
      ? parseExcelOrStringDate(row[colMap.endDate], fallbackEnd)
      : fallbackEnd;

    if (endDate < startDate) {
      endDate = startDate;
    }

    const status = colMap.status ? parseTaskStatus(row[colMap.status]) : 'pending';
    let progress = colMap.progress
      ? Number(String(row[colMap.progress]).replace(/[^\d.]/g, ''))
      : status === 'completed'
        ? 100
        : status === 'in_progress'
          ? 50
          : 0;
    if (Number.isNaN(progress)) progress = 0;
    progress = Math.max(0, Math.min(100, Math.round(progress)));

    const costRaw = colMap.estimatedCost
      ? Number(String(row[colMap.estimatedCost]).replace(/[^\d.]/g, ''))
      : undefined;
    const estimatedCost = costRaw !== undefined && !Number.isNaN(costRaw) && costRaw > 0 ? costRaw : undefined;

    tasks.push({
      phase,
      title: titleRaw,
      description: colMap.description ? String(row[colMap.description] ?? '').trim() : '',
      startDate,
      endDate,
      progress,
      status,
      ownerName: colMap.ownerName ? String(row[colMap.ownerName] ?? '').trim() : '',
      ownerRole: colMap.ownerRole ? String(row[colMap.ownerRole] ?? '').trim() : '',
      suppliers: colMap.supplier ? parseSuppliers(row[colMap.supplier]) : [],
      dependsOnTaskIds: [],
      isMilestone: colMap.isMilestone ? parseBooleanFlag(row[colMap.isMilestone]) : false,
      estimatedCost,
      order: index + 1,
    });
  });

  return {
    tasks,
    detectedPhases: Array.from(phasesSet),
    rowCount: rows.length,
    warnings,
  };
}

/**
 * Export a project's Gantt workplan to a downloadable .xlsx file
 */
export function exportProjectGanttToExcel(project: ProjectRecord, tasks: ProjectTask[]): void {
  const sorted = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.startDate.localeCompare(b.startDate));

  const rows = sorted.map((t, idx) => ({
    '#': idx + 1,
    'שלב': t.phase,
    'משימה': t.title,
    'תיאור': t.description || '',
    'תאריך התחלה': t.startDate,
    'תאריך סיום': t.endDate,
    'סטטוס': TASK_STATUS_LABELS[t.status] || t.status,
    'התקדמות (%)': t.progress,
    'אחראי': t.ownerName,
    'תפקיד': t.ownerRole,
    'ספקים': (t.suppliers || []).map((s) => s.name).join(', '),
    'עלות משוערת': t.estimatedCost ?? '',
    'אבן דרך': t.isMilestone ? 'כן' : 'לא',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 30 },
    { wch: 34 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 10 },
  ];

  const workbook = XLSX.utils.book_new();
  if (!workbook.Workbook) workbook.Workbook = {};
  workbook.Workbook.Views = [{ RTL: true }];
  XLSX.utils.book_append_sheet(workbook, worksheet, 'תוכנית עבודה');

  const safeTitle = (project.title || 'project')
    .replace(/[\\/:*?"<>|]+/g, '')
    .trim()
    .slice(0, 40) || 'project';
  XLSX.writeFile(workbook, `גאנט_${safeTitle}.xlsx`);
}
