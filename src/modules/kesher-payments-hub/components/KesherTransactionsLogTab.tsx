import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Search,
  ExternalLink,
  Download,
  Upload,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  Landmark,
  Smartphone,
  CheckCircle2,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  Users,
  FileSpreadsheet
} from 'lucide-react';
import { kesherService } from '../services/kesherService';
import { KesherTransactionItem } from '../types';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface Props {
  refreshTrigger?: number;
}

export const getPaymentMethodInfo = (method: string, raw?: any, last4?: string) => {
  const norm = String(method || '').toLowerCase();
  const rawStr = JSON.stringify(raw || {}).toLowerCase();

  if (norm.includes('bit') || rawStr.includes('bit') || raw?.IsBit) {
    return {
      type: 'Bit',
      label: 'Bit',
      icon: <Smartphone className="w-4 h-4 text-blue-400" />
    };
  }
  if (
    norm.includes('check') ||
    norm.includes('צ\'ק') ||
    norm.includes('שיק') ||
    raw?.CheckNumber ||
    raw?.NumCheck ||
    raw?.PaymentType == 2
  ) {
    const chkNum = raw?.CheckNumber || raw?.NumCheck ? ` (#${raw.CheckNumber || raw.NumCheck})` : '';
    return {
      type: 'Check',
      label: `צ'ק${chkNum}`,
      icon: <Receipt className="w-4 h-4 text-amber-400" />
    };
  }
  if (
    norm.includes('cash') ||
    norm.includes('מזומן') ||
    norm === '1' ||
    raw?.PaymentType == 1 ||
    raw?.ChargeOptionType === 'Cash'
  ) {
    return {
      type: 'Cash',
      label: 'מזומן',
      icon: <Banknote className="w-4 h-4 text-emerald-400" />
    };
  }
  if (
    norm.includes('transfer') ||
    norm.includes('העברה') ||
    norm.includes('bank') ||
    norm === '3' ||
    raw?.Bank ||
    raw?.Branch ||
    raw?.PaymentType == 3 ||
    raw?.ChargeOptionType === 'BankTransfer'
  ) {
    return {
      type: 'BankTransfer',
      label: 'העברה בנקאית',
      icon: <Landmark className="w-4 h-4 text-purple-400" />
    };
  }
  if (
    norm.includes('standing') ||
    norm.includes('הוראת קבע') ||
    norm === '10' ||
    raw?.IsHK ||
    raw?.CreditType === 10
  ) {
    return {
      type: 'StandingOrder',
      label: 'הוראת קבע',
      icon: <Layers className="w-4 h-4 text-teal-400" />
    };
  }

  // אשראי או ברירת מחדל
  const cardDigits = last4 || (raw?.CreditNum ? String(raw.CreditNum).slice(-4) : (raw?.CardNumber ? String(raw.CardNumber).slice(-4) : (raw?.NumCard ? String(raw.NumCard).slice(-4) : '')));
  return {
    type: 'CreditCard',
    label: cardDigits ? `אשראי (..${cardDigits})` : 'אשראי / תקבול',
    icon: <CreditCard className="w-4 h-4 text-indigo-400" />
  };
};

export const getDocTypeBadge = (docType?: number | string) => {
  const code = Number(docType || 400);
  switch (code) {
    case 400:
      return { label: '400 (קבלה)', className: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' };
    case 405:
      return { label: '405 (תרומה)', className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' };
    case 320:
      return { label: '320 (מס קבלה)', className: 'bg-purple-500/10 border-purple-500/30 text-purple-300' };
    case 305:
      return { label: '305 (חשבונית מס)', className: 'bg-blue-500/10 border-blue-500/30 text-blue-300' };
    case 330:
      return { label: '330 (חשבונית עסקה)', className: 'bg-amber-500/10 border-amber-500/30 text-amber-300' };
    default:
      return { label: `${code} (קבלה)`, className: 'bg-slate-800 border-slate-700 text-slate-300' };
  }
};

export const KesherTransactionsLogTab: React.FC<Props> = ({ refreshTrigger }) => {
  const { db } = useSystemConnection();
  const [transactions, setTransactions] = useState<KesherTransactionItem[]>(() => kesherService.getLocalTransactions());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadData = () => {
    setTransactions(kesherService.getLocalTransactions());
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Real-time Firestore Listener
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'kesher_transactions'), orderBy('date', 'desc'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudItems: KesherTransactionItem[] = [];
            snapshot.forEach((d) => {
              cloudItems.push({ id: d.id, ...(d.data() as any) });
            });
            setTransactions(cloudItems);
          }
        },
        (err) => {
          console.warn('[KesherTransactionsLogTab] Firestore listener notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('[KesherTransactionsLogTab] Firestore subscription setup notice:', e);
    }
  }, [db]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        searchTerm === '' ||
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.phone && t.phone.includes(searchTerm)) ||
        (t.transactionId && t.transactionId.includes(searchTerm)) ||
        (t.authNumber && t.authNumber.includes(searchTerm)) ||
        t.amount.toString().includes(searchTerm);

      const info = getPaymentMethodInfo(t.paymentMethod, t.raw, t.last4);
      const matchesMethod = filterMethod === 'all' || t.paymentMethod === filterMethod || info.type === filterMethod;
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [transactions, searchTerm, filterMethod, filterStatus]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredTransactions]);

  const methodBreakdown = useMemo(() => {
    const counts = {
      Check: 0,
      BankTransfer: 0,
      Cash: 0,
      Bit: 0,
      CreditCard: 0,
      StandingOrder: 0
    };
    transactions.forEach(t => {
      const info = getPaymentMethodInfo(t.paymentMethod, t.raw, t.last4);
      if (info.type in counts) {
        counts[info.type as keyof typeof counts]++;
      } else {
        counts.CreditCard++;
      }
    });
    return counts;
  }, [transactions]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [syncTimeframe, setSyncTimeframe] = useState<'all' | 'year' | '3months' | 'week'>('all');
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleRunSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncProgress('מתחיל סנכרון מול שרתי קשר...');
    try {
      const res = await kesherService.syncCustomersToCRM(syncTimeframe, (txt) => {
        setSyncProgress(txt);
      }, db);

      setSyncResult({
        success: res.success,
        message: res.message || res.error || 'הסנכרון הושלם בהצלחה'
      });
      loadData();
    } catch (err: any) {
      setSyncResult({ success: false, message: 'שגיאה בסנכרון: ' + (err.message || err) });
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  const handleImportCustomersFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    setSyncProgress('קורא ומנתח קובץ אקסל מקשר...');
    setSyncResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('קובץ האקסל אינו מכיל גליונות נתונים.');
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

      if (rawRows.length < 2) {
        throw new Error('קובץ האקסל ריק או אינו מכיל שורות נתונים.');
      }

      // Find header row (first row with non-empty cells)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        const row = rawRows[i];
        if (Array.isArray(row) && row.some((cell: any) => String(cell).trim().length > 0)) {
          headerRowIndex = i;
          break;
        }
      }

      const rawHeaders = (rawRows[headerRowIndex] || []).map((h: any) => String(h || '').trim().toLowerCase());

      const getColIdx = (aliases: string[]) => {
        return rawHeaders.findIndex((h: string) => aliases.some((a) => h.includes(a.toLowerCase())));
      };

      const dateIdx = getColIdx(['תאריך רישום', 'תאריך', 'date', 'created', 'registration']);
      const fNameIdx = getColIdx(['שם פרטי', 'first name', 'firstname', 'פרטי']);
      const lNameIdx = getColIdx(['שם משפחה', 'last name', 'lastname', 'משפחה', 'שם']);
      const tzIdx = getColIdx(['תעודת זהות', 'ת.ז', 'ח.פ', 'עוסק', 'זהות', 'id', 'vat', 'tz', 'zeout']);
      const phoneIdx = getColIdx(['טלפון', 'סלולרי', 'נייד', 'phone', 'mobile', 'tel']);
      const emailIdx = getColIdx(['אימייל', 'דוא"ל', 'מייל', 'email', 'mail']);
      const cityIdx = getColIdx(['עיר', 'ישוב', 'city']);
      const addressIdx = getColIdx(['כתובת', 'רחוב', 'address', 'street']);

      let importedCount = 0;
      let updatedCount = 0;

      const { db: firestoreDb } = await import('../../../services/firebase');
      const targetDb = db || firestoreDb;

      if (targetDb) {
        const { collection, getDocs, doc, setDoc, updateDoc } = await import('firebase/firestore');
        const contactsRef = collection(targetDb, 'contacts');
        const snap = await getDocs(contactsRef);
        const existingContacts: any[] = [];
        snap.forEach((d) => existingContacts.push({ id: d.id, ...d.data() }));

        const cleanPhoneStr = (p?: any) => {
          if (!p) return '';
          let c = String(p).replace(/\D/g, '');
          if (c.startsWith('972')) c = '0' + c.slice(3);
          else if (c.length === 9 && c.startsWith('5')) c = '0' + c;
          return c;
        };

        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const cols = rawRows[i];
          if (!Array.isArray(cols) || cols.length === 0) continue;

          const fName = String(fNameIdx >= 0 ? cols[fNameIdx] : '').trim();
          const lName = String(lNameIdx >= 0 ? cols[lNameIdx] : '').trim();
          const fullName = [fName, lName].filter(Boolean).join(' ') || fName || lName || '';
          const tz = String(tzIdx >= 0 ? cols[tzIdx] : '').replace(/\D/g, '').trim();
          const rawPhone = String(phoneIdx >= 0 ? cols[phoneIdx] : '').trim();
          const normPhone = cleanPhoneStr(rawPhone);
          const email = String(emailIdx >= 0 ? cols[emailIdx] : '').trim().toLowerCase();
          const regDate = String(dateIdx >= 0 ? cols[dateIdx] : '').trim();
          const city = String(cityIdx >= 0 ? cols[cityIdx] : '').trim();
          const address = String(addressIdx >= 0 ? cols[addressIdx] : '').trim();

          if (!fullName && !normPhone && !tz && !email) continue;

          // Search existing contact
          const existing = existingContacts.find((c: any) => {
            const cP = cleanPhoneStr(c.phone || c.conta_phone || c.mobile);
            const cTz = String(c.tg1 || c.tz || c.idNumber || '').trim();
            const cEmail = String(c.email || '').trim().toLowerCase();
            if (normPhone && cP && (cP === normPhone || cP.endsWith(normPhone) || normPhone.endsWith(cP))) return true;
            if (tz && cTz && cTz === tz) return true;
            if (email && cEmail && cEmail === email) return true;
            return false;
          });

          if (existing) {
            const updates: any = {};
            if (fullName && (!existing.conta_name || existing.conta_name === 'לקוח' || existing.conta_name === 'אנונימי')) {
              updates.conta_name = fullName;
              updates.name = fullName;
              updates.fullName = fullName;
            }
            if (fName && !existing.f_m) updates.f_m = fName;
            if (lName && !existing.l_m) updates.l_m = lName;
            if (normPhone && !existing.conta_phone) updates.conta_phone = normPhone;
            if (tz && !existing.tg1) {
              updates.tg1 = tz;
              updates.tz = tz;
            }
            if (email && !existing.email) updates.email = email;
            if (city && !existing.mh_crm_city) updates.mh_crm_city = city;
            if (address && !existing.mh_crm_street) updates.mh_crm_street = address;

            if (Object.keys(updates).length > 0) {
              updates.updatedAt = new Date().toISOString();
              await updateDoc(doc(targetDb, 'contacts', existing.id), updates);
              updatedCount++;
            }
          } else {
            const docId = `kesher_c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await setDoc(doc(targetDb, 'contacts', docId), {
              status: 'active',
              lead_source: 'קשר (ספר לקוחות אקסל)',
              source: 'kesher_excel_import',
              name: fullName || 'לקוח קשר',
              fullName: fullName || 'לקוח קשר',
              conta_name: fullName || 'לקוח קשר',
              f_m: fName,
              l_m: lName,
              firstName: fName,
              lastName: lName,
              phone: normPhone || rawPhone,
              conta_phone: normPhone || rawPhone,
              normalizedPhone: normPhone,
              email,
              tg1: tz,
              tz,
              mh_crm_city: city,
              mh_crm_street: address,
              tags: ['קשר', 'ספר לקוחות'],
              createdAt: regDate || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            importedCount++;
          }
        }
      }

      setSyncResult({
        success: true,
        message: `ייבוא ספר לקוחות מקשר (Excel) הושלם בהצלחה! ${importedCount} לקוחות חדשים נוצרו, ${updatedCount} לקוחות קיימים עודכנו ב-CRM.`
      });
      loadData();
    } catch (err: any) {
      setSyncResult({ success: false, message: 'שגיאה בייבוא קובץ האקסל: ' + (err.message || err) });
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
      e.target.value = '';
    }
  };

  const exportToCsv = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['מזהה עסקה', 'תאריך', 'שם תורם/לקוח', 'סכום (₪)', 'אמצעי תשלום', 'סוג מסמך', 'סטטוס', 'מספר אישור', 'קישור קבלה'];
    const rows = filteredTransactions.map((t) => [
      t.transactionId || t.id,
      new Date(t.date).toLocaleDateString('he-IL'),
      `"${t.clientName}"`,
      t.amount,
      t.paymentMethod,
      t.documentType,
      t.status,
      t.authNumber || '',
      t.receiptUrl || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kesher_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir="rtl">
      {/* סרגל עליון: סיכום, סנכרון וייצוא */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">סה"כ עסקאות ותקבולים</span>
            <span className="text-xl font-black text-white">{filteredTransactions.length}</span>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">מחזור כספי שנגבה</span>
            <span className="text-xl font-black text-emerald-400">
              ₪{totalAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* סנכרון לקוחות ועסקאות מקשר ל-CRM */}
        <div className="bg-[#141824]/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-2 bg-gradient-to-b from-purple-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              סנכרון לקוחות ועסקאות
            </span>
            <select
              value={syncTimeframe}
              onChange={(e) => setSyncTimeframe(e.target.value as any)}
              disabled={isSyncing}
              className="bg-slate-900 border border-purple-500/40 text-purple-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
            >
              <option value="all">הכל (מפתיחת החשבון)</option>
              <option value="year">שנה אחרונה</option>
              <option value="3months">3 חודשים</option>
              <option value="week">שבוע אחרון</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleRunSync}
            disabled={isSyncing}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-purple-900/30 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? (syncProgress || 'מסנכרן לקוחות ל-CRM...') : 'סנכרן לקוחות ותקבולים ל-CRM'}</span>
          </button>
        </div>

        {/* ייצוא, ייבוא ורענון */}
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 block font-medium">ייבוא / ייצוא נתונים</span>
            <button
              type="button"
              onClick={loadData}
              title="רענן רשימה"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-center">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ייבוא לקוחות (Excel / CSV)</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                className="hidden"
                onChange={handleImportCustomersFile}
              />
            </label>
            <button
              type="button"
              onClick={exportToCsv}
              disabled={filteredTransactions.length === 0}
              className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              title="ייצוא עסקאות ל-CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* פילטרים מהירים לפי אמצעי תשלום */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 ml-1 text-xs font-medium">סינון מהיר:</span>
        <button
          type="button"
          onClick={() => setFilterMethod('all')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            filterMethod === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
              : 'bg-[#141824] text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span>הכל</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded-full">{transactions.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMethod('Check')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            filterMethod === 'Check'
              ? 'bg-amber-600 text-white border-amber-500 font-bold'
              : 'bg-[#141824] text-amber-300/80 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-amber-400" />
          <span>צ'קים</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full font-mono">{methodBreakdown.Check}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMethod('BankTransfer')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            filterMethod === 'BankTransfer'
              ? 'bg-purple-600 text-white border-purple-500 font-bold'
              : 'bg-[#141824] text-purple-300/80 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-purple-400" />
          <span>העברות בנקאיות</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded-full font-mono">{methodBreakdown.BankTransfer}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMethod('Cash')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            filterMethod === 'Cash'
              ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
              : 'bg-[#141824] text-emerald-300/80 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-400" />
          <span>מזומן</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-full font-mono">{methodBreakdown.Cash}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMethod('Bit')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            filterMethod === 'Bit'
              ? 'bg-blue-600 text-white border-blue-500 font-bold'
              : 'bg-[#141824] text-blue-300/80 border-slate-800 hover:border-blue-500/40'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Bit</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded-full font-mono">{methodBreakdown.Bit}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMethod('CreditCard')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            filterMethod === 'CreditCard'
              ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
              : 'bg-[#141824] text-indigo-300/80 border-slate-800 hover:border-indigo-500/40'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
          <span>כרטיסי אשראי</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded-full font-mono">{methodBreakdown.CreditCard}</span>
        </button>
      </div>

      {syncResult && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            syncResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {syncResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" /> : <Clock className="w-5 h-5 shrink-0 text-rose-400" />}
          <div className="flex-1 font-medium leading-relaxed">{syncResult.message}</div>
        </div>
      )}

      {/* פילטרים וחיפוש */}
      <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש לפי שם לקוח, טלפון, סכום, מספר צ'ק, או מספר אישור..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="Approved">אושר (Approved)</option>
            <option value="Success">הצלחה (Success)</option>
            <option value="Pending">ממתין (Pending)</option>
            <option value="Declined">נדחה (Declined)</option>
          </select>
        </div>
      </div>

      {/* טבלת עסקאות */}
      <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                <th className="py-3.5 px-4">תאריך</th>
                <th className="py-3.5 px-4">תורם / לקוח</th>
                <th className="py-3.5 px-4">סכום</th>
                <th className="py-3.5 px-4">אמצעי תשלום</th>
                <th className="py-3.5 px-4">קוד מסמך</th>
                <th className="py-3.5 px-4">אסמכתא / אישור</th>
                <th className="py-3.5 px-4">סטטוס</th>
                <th className="py-3.5 px-4 text-left">מסמך מקור (PDF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    לא נמצאו עסקאות או תקבולים תואמים
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('he-IL')}{' '}
                      <span className="text-[10px] text-slate-500">
                        {new Date(tx.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {tx.clientName}
                      {tx.phone && <span className="block text-[10px] font-normal text-slate-400">{tx.phone}</span>}
                    </td>

                    <td className="py-3 px-4 font-black text-emerald-400 whitespace-nowrap">
                      ₪{Number(tx.amount).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {(() => {
                        const methodInfo = getPaymentMethodInfo(tx.paymentMethod, tx.raw, tx.last4);
                        return (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            {methodInfo.icon}
                            <span className="font-medium text-xs">{methodInfo.label}</span>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {(() => {
                        const badge = getDocTypeBadge(tx.documentType);
                        return (
                          <span className={`px-2 py-0.5 border rounded-md text-[10px] font-mono font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {tx.authNumber || tx.transactionId || '-'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tx.status === 'Approved' || tx.status === 'Success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {tx.status === 'Approved' || tx.status === 'Success' ? 'אושר' : tx.status === 'Pending' ? 'ממתין' : 'נדחה'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-left whitespace-nowrap">
                      {tx.receiptUrl ? (
                        <a
                          href={tx.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          קבלה (PDF)
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-600">אין קישור</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
