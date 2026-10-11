import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, 
  X, Check, Save, Link2, Download, Eye, Layers, Sparkles 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { FirebaseApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, query, setDoc } from 'firebase/firestore';
import { eventBus } from '../../../core/bridge/EventBus';
import { DEFAULT_COLLECTIONS } from '../config';
import { CRM_FIELD_OPTIONS } from './ExcelImportModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: (syncedCount: number) => void;
  firebaseApp?: FirebaseApp;
  collections?: typeof DEFAULT_COLLECTIONS;
  ownerId?: string;
  tenantId?: string;
}

export const GoogleSheetsSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSyncComplete,
  firebaseApp,
  collections = DEFAULT_COLLECTIONS,
  ownerId,
  tenantId = '_master',
}) => {
  const storageKey = `kosun_${tenantId}_crm_linked_gsheet`;
  
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetTitle, setSheetTitle] = useState('טבלת אנשי קשר ולידים');
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url) setSheetUrl(parsed.url);
        if (parsed.title) setSheetTitle(parsed.title);
        if (parsed.lastSync) setLastSyncTime(parsed.lastSync);
      }
    } catch {}
  }, [storageKey]);

  if (!isOpen) return null;

  // Extract Sheet ID
  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const sheetId = extractSheetId(sheetUrl);

  // Direct Embed URL for Google Sheets
  const embedUrl = sheetId 
    ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=minimal` 
    : '';

  // Save reference to Media Gallery
  const handleSaveToGallery = async () => {
    if (!sheetUrl) return;
    try {
      const mediaItem = {
        id: `gsheet_${sheetId || Date.now()}`,
        name: sheetTitle.trim() || 'Google Sheet CRM Asset',
        type: 'spreadsheet',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        url: sheetUrl.trim(),
        thumbnailUrl: '',
        sizeBytes: 0,
        extension: 'gsheet',
        sourceModule: 'crm-analytics',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // 1. Save in local storage gallery items
      try {
        const raw = localStorage.getItem('kosun_media_gallery_items');
        let currentItems = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(currentItems)) currentItems = [];
        // Replace or add
        const filtered = currentItems.filter((it: any) => it.id !== mediaItem.id);
        filtered.unshift(mediaItem);
        localStorage.setItem('kosun_media_gallery_items', JSON.stringify(filtered));
      } catch {}

      // 2. Save in Firestore if available
      if (firebaseApp) {
        try {
          const db = getFirestore(firebaseApp);
          const mediaCol = `tenants/${tenantId}/sdo_media_items`;
          await setDoc(doc(db, mediaCol, mediaItem.id), mediaItem, { merge: true });
        } catch {}
      }

      // 3. Dispatch event to live Media Gallery listeners
      (eventBus as any).publish('media:item:created' as any, mediaItem as any);
      (eventBus as any).publish('media:gallery:refresh' as any, {} as any);
    } catch (e) {
      console.warn('Failed to save Google Sheet to gallery:', e);
    }
  };

  // Perform On-Demand Sync
  const handleSyncNow = async () => {
    setErrorMessage(null);
    setSyncStatus(null);

    if (!sheetUrl.trim()) {
      setErrorMessage('אנא הזן כתובת קישור תקפה של Google Sheets.');
      return;
    }

    if (!sheetId) {
      setErrorMessage('לא זוהה מזהה גיליון (Spreadsheet ID) תקין בקישור שהוזן.');
      return;
    }

    setIsSyncing(true);

    try {
      // 1. Try public export CSV URL
      const exportCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      let csvContent = '';

      try {
        const response = await fetch(exportCsvUrl);
        if (response.ok) {
          csvContent = await response.text();
        } else {
          // Alternative gviz endpoint
          const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
          const altResponse = await fetch(gvizUrl);
          if (altResponse.ok) {
            csvContent = await altResponse.text();
          }
        }
      } catch (fetchErr) {
        console.warn('Direct fetch failed (probably CORS if not published):', fetchErr);
      }

      if (!csvContent || csvContent.includes('<!DOCTYPE html>')) {
        throw new Error('לא ניתן לגשת ישירות לגיליון. אנא ודא שהגיליון מוגדר כ-"גלוי לכל מי שיש לו את הקישור" (Anyone with the link can view) או פירסמת אותו לרשת (File -> Share -> Publish to web).');
      }

      // 2. Parse CSV using XLSX parser
      const workbook = XLSX.read(csvContent, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      if (rows.length === 0) {
        throw new Error('הגיליון ריק מנתונים.');
      }

      // 3. Map rows to Contacts
      const contactsToSync: any[] = [];
      const nowStr = new Date().toISOString();

      rows.forEach((row, idx) => {
        const contact: Record<string, any> = {
          id: `gsheet_${sheetId}_${idx}`,
          status: 'active',
          contact_type: 'contact',
          is_lead: false,
          createdAt: nowStr,
          ownerId: ownerId || null,
          lead_source: 'Google Sheets Sync',
          tags: [sheetTitle.trim() || 'Google Sheets'],
        };

        Object.entries(row).forEach(([colHeader, val]) => {
          const h = colHeader.trim().toLowerCase();
          const strVal = String(val).trim();
          if (!strVal) return;

          if (/שם|name/i.test(h) && !/חברה|עיר/i.test(h)) contact.conta_name = strVal;
          else if (/טלפון|phone|mobile|cell/i.test(h)) contact.conta_phone = strVal;
          else if (/מייל|email|mail/i.test(h)) contact.email = strVal;
          else if (/חברה|company/i.test(h)) contact.company_name = strVal;
          else if (/תפקיד|role|job/i.test(h)) contact.job_title = strVal;
          else if (/עיר|city/i.test(h)) contact.mh_crm_city = strVal;
          else if (/סכום|total|spent/i.test(h)) contact.total_spent = Number(strVal.replace(/[^0-9.-]+/g, '')) || 0;
          else if (/תגית|tag|group/i.test(h)) {
            const extraTags = strVal.split(/[,;\n]/).map(t => t.trim()).filter(Boolean);
            contact.tags = Array.from(new Set([...(contact.tags || []), ...extraTags]));
          }
        });

        if (!contact.conta_name) {
          contact.conta_name = `איש קשר ${idx + 1}`;
        }

        contactsToSync.push(contact);
      });

      // 4. Save to Firestore
      if (firebaseApp) {
        const db = getFirestore(firebaseApp);
        const targetCol = collections.contacts;

        // Build existing phone/email lookup to avoid duplicates
        const existingMap = new Map<string, string>();
        try {
          const snap = await getDocs(query(collection(db, targetCol)));
          snap.docs.forEach(d => {
            const dData = d.data();
            const np = (dData.conta_phone || '').replace(/\D/g, '');
            const em = (dData.email || '').toLowerCase().trim();
            if (np.length >= 7) existingMap.set(`p:${np}`, d.id);
            if (em.includes('@')) existingMap.set(`e:${em}`, d.id);
          });
        } catch {}

        let batch = writeBatch(db);
        let opCount = 0;

        for (const c of contactsToSync) {
          const np = (c.conta_phone || '').replace(/\D/g, '');
          const em = (c.email || '').toLowerCase().trim();

          let targetId = '';
          if (np.length >= 7 && existingMap.has(`p:${np}`)) {
            targetId = existingMap.get(`p:${np}`)!;
          } else if (em.includes('@') && existingMap.has(`e:${em}`)) {
            targetId = existingMap.get(`e:${em}`)!;
          }

          if (!targetId) targetId = doc(collection(db, targetCol)).id;
          c.id = targetId;

          batch.set(doc(db, targetCol, targetId), { ...c, updatedAt: nowStr }, { merge: true });
          if (targetCol !== 'contacts') {
            try {
              batch.set(doc(db, 'contacts', targetId), { ...c, updatedAt: nowStr }, { merge: true });
            } catch {}
          }
          opCount++;

          if (opCount >= 350) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
          }
        }

        if (opCount > 0) {
          await batch.commit();
        }
      }

      // Save in Gallery if requested
      if (saveToGallery) {
        await handleSaveToGallery();
      }

      // Save storage settings
      const syncDateStr = new Date().toLocaleString('he-IL');
      setLastSyncTime(syncDateStr);
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          url: sheetUrl.trim(),
          title: sheetTitle.trim(),
          lastSync: syncDateStr,
        }));
      } catch {}

      setSyncStatus(`סונכרנו בהצלחה ${contactsToSync.length} אנשי קשר מ-Google Sheets!`);
      onSyncComplete(contactsToSync.length);

    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      setErrorMessage(err.message || 'אירעה שגיאה בסנכרון הגיליון.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>שיתוף וסינכרון Google Sheets לפי דרישה</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                קישור גיליון נתונים חי לעריכה, שמירה בגלריה וסנכרון ישיר ל-CRM
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

        {/* Status / Error Toast */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {syncStatus && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              קישור לקובץ Google Sheets (לצפייה ועריכה):
            </label>
            <div className="relative">
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit..."
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute left-2.5 top-2.5 p-1 text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-lg transition"
                  title="פתח לעריכה ב-Google Sheets"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              טיפ: כדי לאפשר סנכרון אוטומטי, ודא שהגיליון מוגדר כ-&quot;כל מי שיש לו את הקישור יכול לצפות&quot; (Anyone with link).
            </p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              שם או כותרת הגיליון (לתצוגה בגלריה ובמערכת):
            </label>
            <input
              type="text"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              placeholder="שם הגיליון..."
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-semibold text-xs"
            />
          </div>

          {/* Options & Gallery save */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={saveToGallery}
                onChange={(e) => setSaveToGallery(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span>שמור פריט זה בכספת הגלריה של המערכת (Media Gallery Digital Vault)</span>
            </label>

            {lastSyncTime && (
              <div className="flex items-center gap-2 text-gray-500 font-medium pt-1 border-t border-gray-100 dark:border-gray-800">
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                <span>סנכרון אחרון: {lastSyncTime}</span>
              </div>
            )}
          </div>

          {/* Embed Preview Toggle */}
          {sheetId && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowEmbed(!showEmbed)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showEmbed ? 'הסתר תצוגת גיליון מוטמעת' : 'הצג גיליון מוטמע לעריכה ישירה כאן'}</span>
              </button>

              {showEmbed && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden h-64 bg-white dark:bg-gray-900 shadow-inner">
                  <iframe
                    src={embedUrl}
                    title="Google Sheet Live Editor"
                    className="w-full h-full border-0"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            סגור
          </button>

          <div className="flex items-center gap-2">
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>פתח לעריכה ב-Google</span>
              </a>
            )}

            <button
              type="button"
              disabled={isSyncing || !sheetUrl.trim()}
              onClick={handleSyncNow}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'מסנכרן כעת...' : 'סנכרן נתונים ל-CRM עכשיו'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
