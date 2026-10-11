import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, Upload, Check, X, AlertTriangle, ArrowRight, ArrowLeft, 
  RefreshCw, CheckCircle2, ChevronDown, Eye, HelpCircle, Sparkles, Layers 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { FirebaseApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, setDoc, getDocs, query } from 'firebase/firestore';
import { Contact } from '../types';
import { DEFAULT_COLLECTIONS } from '../config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
  firebaseApp?: FirebaseApp;
  collections?: typeof DEFAULT_COLLECTIONS;
  ownerId?: string;
}

// Available CRM Contact fields for mapping
export const CRM_FIELD_OPTIONS = [
  { key: 'conta_name', label: 'שם איש קשר / שם מלא', required: true, icon: 'User' },
  { key: 'conta_phone', label: 'טלפון / נייד', required: false, icon: 'Phone' },
  { key: 'email', label: 'אימייל / דוא"ל', required: false, icon: 'Mail' },
  { key: 'company_name', label: 'שם חברה / ארגון', required: false, icon: 'Building' },
  { key: 'job_title', label: 'תפקיד / עיסוק', required: false, icon: 'Briefcase' },
  { key: 'mh_crm_city', label: 'עיר / ישוב', required: false, icon: 'MapPin' },
  { key: 'mh_crm_street', label: 'רחוב / כתובת', required: false, icon: 'MapPin' },
  { key: 'tags', label: 'תגיות / קבוצות', required: false, icon: 'Tag' },
  { key: 'total_spent', label: 'סכום רכישות / תרומות', required: false, icon: 'DollarSign' },
  { key: 'lead_source', label: 'מקור הגעה', required: false, icon: 'Compass' },
  { key: 'contact_type', label: 'סוג רשומה (איש קשר / ליד)', required: false, icon: 'Layers' },
  { key: 'status', label: 'סטטוס', required: false, icon: 'Activity' },
  { key: 'notes', label: 'הערות', required: false, icon: 'FileText' },
  { key: '_ignore', label: '--- התעלם מעמודה זו ---', required: false, icon: 'X' },
];

export const ExcelImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  firebaseApp,
  collections = DEFAULT_COLLECTIONS,
  ownerId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Sheet Data
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  
  // Mapping: { [excelHeader]: crmFieldKey }
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  // Import Options
  const [mergeDuplicates, setMergeDuplicates] = useState(true);
  const [defaultTag, setDefaultTag] = useState('ייבוא מאקסל');
  const [importProgress, setImportProgress] = useState(0);

  if (!isOpen) return null;

  // Smart Heuristic Mapping Engine
  const suggestFieldMapping = (header: string): string => {
    const h = header.trim().toLowerCase();
    
    // Name
    if (/^(שם|שם מלא|שם פרטי|איש קשר|שם הלקוח|שם איש קשר|name|full name|first name|contact name)$/i.test(h)) return 'conta_name';
    if (/שם/i.test(h) && !/חברה|עיר|רחוב|ארגון/i.test(h)) return 'conta_name';

    // Phone
    if (/^(טלפון|נייד|סלולרי|פלאפון|טל|phone|mobile|cell|telephone)$/i.test(h)) return 'conta_phone';
    if (/טלפון|נייד|סלולר/i.test(h)) return 'conta_phone';

    // Email
    if (/^(מייל|אימייל|דוא"ל|דואל|email|mail|e-mail)$/i.test(h)) return 'email';
    if (/מייל|email/i.test(h)) return 'email';

    // Company
    if (/^(חברה|שם חברה|ארגון|עסק|company|organization|business)$/i.test(h)) return 'company_name';
    if (/חברה|ארגון/i.test(h)) return 'company_name';

    // City
    if (/^(עיר|ישוב|מגורים|city|town)$/i.test(h)) return 'mh_crm_city';
    if (/עיר|ישוב/i.test(h)) return 'mh_crm_city';

    // Street / Address
    if (/^(רחוב|כתובת|מען|street|address)$/i.test(h)) return 'mh_crm_street';
    if (/כתובת|רחוב/i.test(h)) return 'mh_crm_street';

    // Job Title
    if (/^(תפקיד|עיסוק|מקצוע|role|title|job title|position)$/i.test(h)) return 'job_title';
    if (/תפקיד|עיסוק/i.test(h)) return 'job_title';

    // Tags / Group
    if (/^(תגית|תגיות|קבוצה|קבוצות|תווית|תוויות|tag|tags|group)$/i.test(h)) return 'tags';
    if (/תגית|תווית|קבוצה/i.test(h)) return 'tags';

    // Spent / Amount
    if (/^(סכום|תשלום|תרומה|סה"כ|מחיר|total|amount|spent|donation)$/i.test(h)) return 'total_spent';
    if (/סכום|תשלום/i.test(h)) return 'total_spent';

    // Source
    if (/^(מקור|מקור הגעה|קמפיין|source|lead source|campaign)$/i.test(h)) return 'lead_source';
    if (/מקור/i.test(h)) return 'lead_source';

    // Notes
    if (/^(הערה|הערות|פרטים נוספים|notes|comments|remarks)$/i.test(h)) return 'notes';

    return '_ignore';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Strict validation: reject CSV, accept ONLY Excel (.xlsx, .xls)
    const lowerName = selected.name.toLowerCase();
    if (lowerName.endsWith('.csv')) {
      setErrorMessage('יש להעלות קובץ אקסל (XLSX / XLS) בלבד. קבצי CSV אינם נתמכים בכלי זה.');
      return;
    }
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
      setErrorMessage('פורמט לא נתמך. אנא בחר קובץ אקסל בעל סיומת .xlsx או .xls');
      return;
    }

    setFile(selected);
    parseExcelWorkbook(selected);
  };

  const parseExcelWorkbook = (excelFile: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setErrorMessage('הקובץ אינו מכיל גליונות תקפים.');
          return;
        }

        setSheetNames(workbook.SheetNames);
        const firstSheet = workbook.SheetNames[0];
        setSelectedSheet(firstSheet);
        parseSheetData(workbook, firstSheet);
      } catch (err: any) {
        console.error('Error reading Excel workbook:', err);
        setErrorMessage('אירעה שגיאה בעת קריאת קובץ האקסל. ודא שהקובץ אינו פגום או נעול.');
      }
    };
    reader.readAsBinaryString(excelFile);
  };

  const parseSheetData = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    if (jsonRows.length === 0) {
      setErrorMessage(`הגיליון "${sheetName}" ריק מנתונים.`);
      return;
    }

    setRawRows(jsonRows);
    
    // Discover all unique headers from all rows
    const headerSet = new Set<string>();
    jsonRows.forEach(row => {
      Object.keys(row).forEach(k => {
        const trimmed = k.trim();
        if (trimmed && !trimmed.startsWith('__EMPTY')) {
          headerSet.add(trimmed);
        }
      });
    });

    const headers = Array.from(headerSet);
    setExcelHeaders(headers);

    // Apply Smart Initial Mapping
    const initialMapping: Record<string, string> = {};
    headers.forEach(h => {
      initialMapping[h] = suggestFieldMapping(h);
    });
    setColumnMapping(initialMapping);

    setStep('mapping');
  };

  const handleSheetChange = (newSheet: string) => {
    if (!file) return;
    setSelectedSheet(newSheet);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
      parseSheetData(workbook, newSheet);
    };
    reader.readAsBinaryString(file);
  };

  const handleFieldMappingChange = (excelHeader: string, crmKey: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [excelHeader]: crmKey,
    }));
  };

  // Convert row using mapping
  const mapRowToContact = (row: Record<string, any>, idx: number): Contact => {
    const contactObj: Record<string, any> = {
      id: `excel_${Date.now()}_${idx}`,
      status: 'active',
      contact_type: 'contact',
      is_lead: false,
      createdAt: new Date().toISOString(),
      ownerId: ownerId || null,
      tags: defaultTag.trim() ? [defaultTag.trim()] : [],
    };

    Object.entries(columnMapping).forEach(([excelH, crmKey]) => {
      if (crmKey === '_ignore') return;
      const val = row[excelH];
      if (val === undefined || val === null || val === '') return;

      if (crmKey === 'tags') {
        const existingTags = contactObj.tags || [];
        const rawTagVal = String(val);
        const splitTags = rawTagVal.split(/[,;\n]/).map(t => t.trim()).filter(Boolean);
        contactObj.tags = Array.from(new Set([...existingTags, ...splitTags]));
      } else if (crmKey === 'total_spent') {
        contactObj.total_spent = Number(String(val).replace(/[^0-9.-]+/g, '')) || 0;
      } else if (crmKey === 'conta_phone') {
        // Clean phone representation
        let cleanedPhone = String(val).trim();
        contactObj.conta_phone = cleanedPhone;
        contactObj.phone = cleanedPhone;
      } else {
        contactObj[crmKey] = typeof val === 'string' ? val.trim() : val;
      }
    });

    // Ensure fallback name if only first/last name existed
    if (!contactObj.conta_name) {
      contactObj.conta_name = contactObj.name || contactObj.fullName || `איש קשר ${idx + 1}`;
    }

    return contactObj as Contact;
  };

  const handleExecuteImport = async () => {
    if (!rawRows || rawRows.length === 0) return;
    setStep('importing');
    setImportProgress(10);

    try {
      const contactsToImport = rawRows.map((r, i) => mapRowToContact(r, i));
      
      if (!firebaseApp) {
        // Mock / Offline LocalStorage Save
        onSuccess(contactsToImport.length);
        onClose();
        return;
      }

      const db = getFirestore(firebaseApp);
      const targetColName = collections.contacts;
      
      // If merge duplicates enabled, load existing contacts for quick lookup
      let existingContactsMap = new Map<string, string>(); // phone/email -> docId
      if (mergeDuplicates) {
        try {
          const existingSnap = await getDocs(query(collection(db, targetColName)));
          existingSnap.docs.forEach(d => {
            const data = d.data();
            const normP = (data.conta_phone || data.phone || '').replace(/\D/g, '');
            const email = (data.email || '').toLowerCase().trim();
            if (normP && normP.length >= 7) existingContactsMap.set(`p:${normP}`, d.id);
            if (email && email.includes('@')) existingContactsMap.set(`e:${email}`, d.id);
          });
        } catch {}
      }

      let batch = writeBatch(db);
      let opCount = 0;
      let totalSaved = 0;

      for (let i = 0; i < contactsToImport.length; i++) {
        const contact = contactsToImport[i];
        const normP = (contact.conta_phone || '').replace(/\D/g, '');
        const email = (contact.email || '').toLowerCase().trim();

        let targetDocId = '';
        if (mergeDuplicates) {
          if (normP && normP.length >= 7 && existingContactsMap.has(`p:${normP}`)) {
            targetDocId = existingContactsMap.get(`p:${normP}`)!;
          } else if (email && existingContactsMap.has(`e:${email}`)) {
            targetDocId = existingContactsMap.get(`e:${email}`)!;
          }
        }

        if (!targetDocId) {
          targetDocId = doc(collection(db, targetColName)).id;
        }

        contact.id = targetDocId;

        // Scoped Collection Write
        const contactDocRef = doc(db, targetColName, targetDocId);
        batch.set(contactDocRef, { ...contact, updatedAt: new Date().toISOString() }, { merge: true });

        // Root Collection Dual Mirror for platform compatibility
        if (targetColName !== 'contacts') {
          try {
            const rootRef = doc(db, 'contacts', targetDocId);
            batch.set(rootRef, { ...contact, updatedAt: new Date().toISOString() }, { merge: true });
          } catch {}
        }

        opCount++;
        totalSaved++;

        if (opCount >= 350) {
          await batch.commit();
          batch = writeBatch(db);
          opCount = 0;
          setImportProgress(Math.round(((i + 1) / contactsToImport.length) * 90));
        }
      }

      if (opCount > 0) {
        await batch.commit();
      }

      setImportProgress(100);
      setTimeout(() => {
        onSuccess(totalSaved);
        onClose();
      }, 400);

    } catch (err: any) {
      console.error('Import execution error:', err);
      setErrorMessage(`שגיאה בייבוא הנתונים: ${err.message || 'אנא נסה שוב'}`);
      setStep('mapping');
    }
  };

  const previewMappedList = rawRows.slice(0, 5).map((r, i) => mapRowToContact(r, i));
  const activeMappedCount = Object.values(columnMapping).filter(v => v !== '_ignore').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>ייבוא אנשי קשר מקובץ אקסל (XLSX / XLS)</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                זיהוי חכם של עמודות, מיפוי מותאם אישית ומניעת כפילויות אוטומטית
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* STEP 1: Upload File */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 dark:hover:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all group flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    לחץ כאן לבחירת קובץ אקסל או גרור אותו לכאן
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    תמיכה מלאה בקבצי <span className="font-bold text-emerald-600">.XLSX</span> ו-<span className="font-bold text-emerald-600">.XLS</span> בלבד (ללא CSV)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 text-xs text-gray-600 dark:text-gray-300 space-y-1.5 border border-gray-100 dark:border-gray-800">
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>איך זה עובד?</span>
                </p>
                <p>1. המערכת תסרוק את שורת הכותרות של האקסל ותציע מיפוי חכם לשדות הקולקציה ב-CRM.</p>
                <p>2. תוכל להתאים אישית כל עמודה, לסדר, להוסיף תגיות או להתעלם מעמודות שאינן רלוונטיות.</p>
                <p>3. המערכת תזהה אנשי קשר קיימים לפי טלפון או מייל ותמזג נתונים למניעת כפילויות.</p>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Sheet & Counts Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300">קובץ:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{file?.name}</span>
                  <span className="text-gray-400">({rawRows.length} שורות)</span>
                </div>

                {sheetNames.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">בחר גיליון:</span>
                    <select
                      value={selectedSheet}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs"
                    >
                      {sheetNames.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Mapping Instructions */}
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>מיפוי עמודות האקסל לשדות ה-CRM ({activeMappedCount} מתוך {excelHeaders.length} עמודות ממופות):</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('preview')}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>תצוגה מקדימה</span>
                </button>
              </div>

              {/* Mapping Table */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700 sticky top-0">
                      <tr>
                        <th className="p-3 w-1/3">עמודה באקסל</th>
                        <th className="p-3 w-1/3">דוגמה מהקובץ</th>
                        <th className="p-3 w-1/3">מיפוי לשדה ב-CRM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                      {excelHeaders.map((header) => {
                        const currentCrmKey = columnMapping[header] || '_ignore';
                        const sampleVal = rawRows[0]?.[header] || rawRows[1]?.[header] || '-';

                        return (
                          <tr key={header} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                            <td className="p-3 font-bold text-gray-900 dark:text-white">
                              {header}
                            </td>
                            <td className="p-3 text-gray-500 truncate max-w-[180px]">
                              {String(sampleVal)}
                            </td>
                            <td className="p-2.5">
                              <select
                                value={currentCrmKey}
                                onChange={(e) => handleFieldMappingChange(header, e.target.value)}
                                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-hidden transition ${
                                  currentCrmKey !== '_ignore'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                                }`}
                              >
                                {CRM_FIELD_OPTIONS.map(opt => (
                                  <option key={opt.key} value={opt.key}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Options Box */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={mergeDuplicates}
                      onChange={(e) => setMergeDuplicates(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>מזג עם אנשי קשר קיימים לפי טלפון או אימייל (מונע כפילויות)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">תווית אוטומטית לייבוא:</span>
                    <input
                      type="text"
                      value={defaultTag}
                      onChange={(e) => setDefaultTag(e.target.value)}
                      placeholder="הזן תגית..."
                      className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  תצוגה מקדימה של 5 הרשומות הראשונות שייובאו:
                </span>
                <button
                  onClick={() => setStep('mapping')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  חזור לעריכת מיפוי העמודות
                </button>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-x-auto bg-white dark:bg-gray-900">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="p-3">שם</th>
                      <th className="p-3">טלפון</th>
                      <th className="p-3">אימייל</th>
                      <th className="p-3">חברה</th>
                      <th className="p-3">עיר</th>
                      <th className="p-3">תגיות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {previewMappedList.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{c.conta_name}</td>
                        <td className="p-3 font-mono text-gray-600 dark:text-gray-300">{c.conta_phone || '-'}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">{c.email || '-'}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">{c.company_name || '-'}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">{c.mh_crm_city || '-'}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(c.tags || []).map((t, ti) => (
                              <span key={ti} className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded text-[10px]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: Importing Progress */}
          {step === 'importing' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  מייבא נתונים מאקסל ל-CRM...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  מעבד {rawRows.length} אנשי קשר ומבצע מיזוג למניעת כפילויות
                </p>
              </div>
              <div className="w-64 bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">{importProgress}%</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900">
          <div>
            {step === 'mapping' && (
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>החלף קובץ</span>
              </button>
            )}
            {step === 'preview' && (
              <button
                type="button"
                onClick={() => setStep('mapping')}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>חזור למיפוי</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={step === 'importing'}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              ביטול
            </button>

            {step === 'mapping' && (
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>ייבא {rawRows.length} אנשי קשר</span>
              </button>
            )}

            {step === 'preview' && (
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>אשר וייבא עכשיו</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
