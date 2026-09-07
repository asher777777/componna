import React, { useMemo } from 'react';
import {
  Search,
  Table,
  LayoutGrid,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Database,
  Plus,
  RefreshCw,
  Hash,
  Clock,
  Sparkles,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { useDbContext } from '../context/DbContext';
import { FirestoreDocumentRecord } from '../types';
import { PROJECT_SEED_DATA } from '../config/seedData';

export const DocumentDataGrid: React.FC = () => {
  const {
    documents,
    loadingDocs,
    docError,
    docErrorCode,
    refreshDocuments,
    selectedCollectionId,
    collections,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    setInspectingDoc,
    setEditingDoc,
    handleDeleteDoc,
    seedCollectionData,
    seeding,
    credentials,
    switchDatabase,
    setCredentialsModalOpen,
  } = useDbContext();

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const currentCollectionMeta = collections.find((c) => c.id === selectedCollectionId);
  const hasSeedData = Boolean(PROJECT_SEED_DATA[selectedCollectionId]);

  // Filter documents by search query
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter((doc) => {
      if (doc.id.toLowerCase().includes(q)) return true;
      const str = JSON.stringify(doc.data).toLowerCase();
      return str.includes(q);
    });
  }, [documents, searchQuery]);

  // Extract common top-level column keys for Table view
  const tableColumns = useMemo(() => {
    const keySet = new Set<string>();
    filteredDocs.forEach((d) => {
      Object.keys(d.data).forEach((k) => {
        if (k !== 'id') keySet.add(k);
      });
    });
    return Array.from(keySet).slice(0, 6);
  }, [filteredDocs]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(documents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedCollectionId}_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSeed = async () => {
    try {
      const count = await seedCollectionData(selectedCollectionId);
      alert(`נשמרו בהצלחה ${count} מסמכים ב-Firestore בקולקציה "${selectedCollectionId}"!`);
    } catch (err: any) {
      alert(`שגיאה בהזנת הנתונים: ${err?.message || err}`);
    }
  };

  const renderCellValue = (val: any) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-600 italic">null</span>;
    }
    if (typeof val === 'boolean') {
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          val ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {val ? 'TRUE' : 'FALSE'}
        </span>
      );
    }
    if (typeof val === 'number') {
      return <span className="font-mono text-cyan-300">{val.toLocaleString()}</span>;
    }
    if (typeof val === 'object') {
      if ('seconds' in val && 'nanoseconds' in val) {
        return <span className="text-indigo-300 font-mono text-[11px]">{new Date(val.seconds * 1000).toLocaleString('he-IL')}</span>;
      }
      if (val instanceof Date) {
        return <span className="text-indigo-300 font-mono text-[11px]">{val.toLocaleString('he-IL')}</span>;
      }
      if (Array.isArray(val)) {
        return (
          <span className="text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
            [{val.length} פריטים]
          </span>
        );
      }
      return (
        <span className="text-[11px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
          {'{...}'}
        </span>
      );
    }
    const str = String(val);
    if (str.startsWith('http://') || str.startsWith('https://')) {
      return (
        <a
          href={str}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-400 hover:underline truncate block max-w-xs font-mono text-[11px]"
          onClick={(e) => e.stopPropagation()}
        >
          {str}
        </a>
      );
    }
    return <span className="truncate block max-w-xs text-slate-200 text-xs">{str}</span>;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/50 overflow-hidden select-none">
      
      {/* Action Toolbar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Collection Title and Quick Search */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{currentCollectionMeta?.name || selectedCollectionId}</span>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                {selectedCollectionId}
              </span>
            </h2>
            {currentCollectionMeta?.description && (
              <p className="text-[11px] text-slate-400">{currentCollectionMeta.description}</p>
            )}
          </div>
        </div>

        {/* Center/Right: Search and View Mode Controls */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="סינון שדות וערכים במסמכים..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת טבלה מובנית"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת כרטיסיות JSON"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJson}
            disabled={documents.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium transition disabled:opacity-50"
            title="ייצוא כל המסמכים לקובץ JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>ייצוא JSON</span>
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4">
        
        {/* Error Alert */}
        {docError && (
          <div className="mb-6 p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    שגיאה בקריאת הנתונים מ-Firestore
                  </h4>
                  <p className="text-rose-300 mt-1 font-mono text-[11px]">
                    {docError}
                  </p>
                  {docErrorCode === 'database-not-found' && (
                    <div className="text-slate-200 text-xs mt-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <p>
                        💡 <strong>מסד הנתונים טרם נוצר ב-Firebase Console:</strong>
                      </p>
                      <p className="text-slate-400">
                        יש להיכנס ל-Firebase Console וללחוץ על <strong>Create Database</strong> תחת <em>Firestore Database</em>, או לוודא ששם המסד הוא <code>(default)</code>.
                      </p>
                    </div>
                  )}
                  {docErrorCode === 'permission-denied' && (
                    <p className="text-slate-300 text-xs mt-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      💡 <strong>טיפ הרשאות (Security Rules):</strong> ייתכן שכללי הגישה (Rules) במסד הנתונים של פיירבייס דורשים אימות (Auth). מומלץ לוודא ב-Firebase Console שכללי ה-Firestore מוגדרים ל-<code>allow read, write: if true;</code> בסביבת פיתוח, או להשתמש באימות משתמש.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => refreshDocuments()}
                  className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 border border-rose-700/60 rounded-xl text-white font-semibold transition"
                >
                  נסה שוב
                </button>
                <button
                  onClick={() => switchDatabase(credentials.databaseId === 'aioffice' ? '(default)' : 'aioffice')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-semibold transition text-center"
                >
                  החלף ל-DB: {credentials.databaseId === 'aioffice' ? '(default)' : 'aioffice'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loadingDocs && documents.length === 0 && (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium animate-pulse mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>טוען מסמכים ישירות מ-Firebase API...</span>
            </div>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-14 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State / Seed Data CTA */}
        {!loadingDocs && documents.length === 0 && !docError && (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              אין מסמכים בקולקציה "{selectedCollectionId}"
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              הקולקציה קיימת במסד הנתונים אך עדיין ריקה ממסמכים. ניתן להזין לתוכה את נתוני הפרויקט הראשוניים בלחיצה אחת או ליצור מסמך מותאם ידנית.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasSeedData && (
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'שומר במסד...' : `הזן נתוני פרויקט ל-${selectedCollectionId}`}</span>
                </button>
              )}

              <button
                onClick={() => setEditingDoc('new')}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ צור מסמך חדש ידנית</span>
              </button>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && filteredDocs.length > 0 && (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-44">מזהה מסמך (ID)</th>
                    {tableColumns.map((col) => (
                      <th key={col} className="py-3 px-4 min-w-[120px] font-mono">
                        {col}
                      </th>
                    ))}
                    <th className="py-3 px-4 w-28 text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => setInspectingDoc(doc)}
                      className="hover:bg-slate-900/70 transition cursor-pointer group"
                    >
                      {/* Document ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-indigo-300 font-medium">
                          <span className="truncate max-w-[140px]" title={doc.id}>
                            {doc.id}
                          </span>
                          <button
                            onClick={(e) => handleCopyId(doc.id, e)}
                            className="text-slate-500 hover:text-indigo-300 p-1 transition"
                            title="העתק מזהה מסמך"
                          >
                            {copiedId === doc.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Field Columns */}
                      {tableColumns.map((col) => (
                        <td key={col} className="py-3 px-4">
                          {renderCellValue(doc.data[col])}
                        </td>
                      ))}

                      {/* Action Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setInspectingDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                            title="צפה בפרטים מלאים"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                            title="ערוך מסמך"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`האם למחוק את המסמך "${doc.id}"?`)) {
                                await handleDeleteDoc(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="מחק מסמך"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JSON Cards View */}
        {viewMode === 'json' && filteredDocs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setInspectingDoc(doc)}
                className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 shadow-lg transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-300 font-bold">
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate max-w-[170px]" title={doc.id}>
                        {doc.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleCopyId(doc.id, e)}
                        className="p-1 text-slate-500 hover:text-indigo-300 rounded transition"
                        title="העתק מזהה"
                      >
                        {copiedId === doc.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingDoc(doc)}
                        className="p-1 text-slate-500 hover:text-amber-400 rounded transition"
                        title="ערוך"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`האם למחוק את המסמך "${doc.id}"?`)) {
                            await handleDeleteDoc(doc.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        title="מחק"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* JSON Snippet */}
                  <pre className="font-mono text-[11px] text-slate-300 bg-slate-900/90 p-3 rounded-xl overflow-x-auto max-h-48 leading-relaxed border border-slate-850">
                    {JSON.stringify(doc.data, null, 2)}
                  </pre>
                </div>

                {/* Card Footer */}
                <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{Object.keys(doc.data).length} שדות</span>
                  {doc.updatedAtFormatted && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {doc.updatedAtFormatted}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
