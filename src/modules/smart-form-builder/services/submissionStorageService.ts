import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Firestore,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { SmartFormSubmission, SmartFormDefinition, FormAnalyticsStats } from '../types';
import { DEFAULT_FORMS_COLLECTION, SUBMISSIONS_SUBCOLLECTION } from '../config/constants';
import { LeadPayload } from '../../../core/contracts';
import * as XLSX from 'xlsx';

/**
 * Get the subcollection path for form submissions: mod_forms/{formId}/submissions
 */
export function getSubmissionsCollectionRef(
  formId: string,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
) {
  const targetDb = customFirestore || db;
  if (!targetDb) throw new Error('Firestore is not initialized');
  return collection(targetDb, collectionName, formId, SUBMISSIONS_SUBCOLLECTION);
}

/**
 * Save a new submission in the form's sub-collection
 */
export async function submitFormResponse(
  form: SmartFormDefinition,
  rawAnswers: Record<string, any>,
  completionTimeSeconds?: number,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
): Promise<{ submissionId: string; leadPayload?: LeadPayload }> {
  const targetDb = customFirestore || db;
  if (!targetDb) throw new Error('Firestore is not initialized');

  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  // Map detailed answers
  const detailedAnswers = form.steps.map((step) => {
    const val = rawAnswers[step.mappingKey || step.id];
    let displayVal = '';
    if (val === undefined || val === null) {
      displayVal = '-';
    } else if (Array.isArray(val)) {
      displayVal = val.join(', ');
    } else if (typeof val === 'object') {
      displayVal = JSON.stringify(val);
    } else {
      displayVal = String(val);
    }

    return {
      stepId: step.id,
      fieldTitle: step.title,
      fieldType: step.fieldType,
      mappingKey: step.mappingKey,
      value: val,
      displayValue: displayVal,
    };
  });

  // Build Lead Payload if relevant contact fields exist
  let leadPayload: LeadPayload | undefined = undefined;
  const conta_name = rawAnswers['conta_name'] || rawAnswers['name'] || rawAnswers['fullName'] || '';
  const conta_phone = rawAnswers['conta_phone'] || rawAnswers['phone'] || rawAnswers['tel'] || '';
  const email = rawAnswers['email'] || rawAnswers['mail'] || '';

  if (conta_name || conta_phone || email) {
    leadPayload = {
      conta_name: String(conta_name || 'פנייה מטופס דיגיטלי'),
      conta_phone: String(conta_phone || ''),
      email: String(email || ''),
      source: `טופס: ${form.title}`,
      tags: form.crmDefaultTags || ['טופס חכם', form.category || 'כללי'],
      community: form.crmDefaultCommunity || '',
      metadata: {
        formId: form.id,
        formTitle: form.title,
        submissionId,
        answers: rawAnswers,
      },
    };
  }

  const submissionData: SmartFormSubmission = {
    id: submissionId,
    formId: form.id,
    formTitle: form.title,
    submittedAt: now,
    answers: rawAnswers,
    detailedAnswers,
    completionTimeSeconds: completionTimeSeconds || 0,
    crmSyncStatus: form.isCrmSyncEnabled && leadPayload ? 'synced' : 'not_applicable',
    leadPayload,
    metadata: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    },
  };

  // 1. Save in sub-collection: mod_forms/{formId}/submissions/{submissionId}
  const subDocRef = doc(targetDb, collectionName, form.id, SUBMISSIONS_SUBCOLLECTION, submissionId);
  await setDoc(subDocRef, submissionData);

  // 2. Increment submission count on parent form doc
  try {
    const parentDocRef = doc(targetDb, collectionName, form.id);
    await updateDoc(parentDocRef, {
      submissionsCount: increment(1),
      updatedAt: now,
    });
  } catch (e) {
    console.warn('Could not increment submissionsCount on form doc:', e);
  }

  // 3. Optional: Sync directly to CRM contacts collection if lead data exists and is enabled
  if (form.isCrmSyncEnabled && leadPayload && (conta_phone || email)) {
    try {
      const contactDocId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const contactRef = doc(targetDb, 'contacts', contactDocId);
      await setDoc(
        contactRef,
        {
          id: contactDocId,
          conta_name: leadPayload.conta_name,
          conta_phone: leadPayload.conta_phone,
          email: leadPayload.email,
          lead_source: leadPayload.source,
          tags: leadPayload.tags,
          community: leadPayload.community,
          last_form_name: form.title,
          last_form_submission_date: now,
          status: 'חדש',
          created_at: now,
          updated_at: now,
          notes: `התקבל מטופס "${form.title}" בתאריך ${new Date().toLocaleDateString('he-IL')}`,
        },
        { merge: true }
      );
    } catch (crmErr) {
      console.warn('Direct CRM contact sync failed (may be offline or restricted):', crmErr);
    }
  }

  return { submissionId, leadPayload };
}

/**
 * Subscribe to submissions of a form sub-collection in real time
 */
export function subscribeFormSubmissions(
  formId: string,
  onData: (submissions: SmartFormSubmission[]) => void,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
) {
  const targetDb = customFirestore || db;
  if (!targetDb || !formId) return () => {};

  const collRef = collection(targetDb, collectionName, formId, SUBMISSIONS_SUBCOLLECTION);
  const q = query(collRef, orderBy('submittedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const submissions = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SmartFormSubmission[];
      onData(submissions);
    },
    (err) => {
      console.warn(`Error subscribing to submissions for form ${formId}:`, err);
    }
  );
}

/**
 * Fetch submissions one-time for a form
 */
export async function getFormSubmissions(
  formId: string,
  customFirestore?: Firestore,
  collectionName: string = DEFAULT_FORMS_COLLECTION
): Promise<SmartFormSubmission[]> {
  const targetDb = customFirestore || db;
  if (!targetDb || !formId) return [];

  try {
    const collRef = collection(targetDb, collectionName, formId, SUBMISSIONS_SUBCOLLECTION);
    const q = query(collRef, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as SmartFormSubmission[];
  } catch (e) {
    console.warn(`Error getting submissions for form ${formId}:`, e);
    return [];
  }
}

/**
 * Calculate analytics metrics for a form
 */
export function calculateFormAnalytics(
  form: SmartFormDefinition,
  submissions: SmartFormSubmission[]
): FormAnalyticsStats {
  const totalViews = form.viewsCount || 0;
  const totalStarts = form.startsCount || 0;
  const totalSubmissions = submissions.length || form.submissionsCount || 0;

  const completionRate =
    totalStarts > 0 ? Math.round((totalSubmissions / totalStarts) * 100) : totalSubmissions > 0 ? 100 : 0;

  let totalTime = 0;
  let timeCount = 0;
  submissions.forEach((s) => {
    if (s.completionTimeSeconds && s.completionTimeSeconds > 0) {
      totalTime += s.completionTimeSeconds;
      timeCount++;
    }
  });

  const averageCompletionSeconds = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;

  // Submissions grouped by Date
  const dateMap: Record<string, number> = {};
  submissions.forEach((s) => {
    const dateStr = s.submittedAt ? s.submittedAt.split('T')[0] : 'תאריך לא ידוע';
    dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
  });

  const submissionsByDate = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    formId: form.id,
    totalViews,
    totalStarts,
    totalSubmissions,
    completionRate,
    averageCompletionSeconds,
    dropoffPerStep: [],
    submissionsByDate,
  };
}

/**
 * Export Form Submissions directly to Excel (.xlsx)
 */
export function exportFormSubmissionsToExcel(
  form: SmartFormDefinition,
  submissions: SmartFormSubmission[]
) {
  if (submissions.length === 0) {
    alert('אין הגשות לייצוא');
    return;
  }

  // Build rows dynamically based on form steps
  const rows = submissions.map((sub, index) => {
    const row: Record<string, any> = {
      'מספר סידורי': index + 1,
      'תאריך ושעה': new Date(sub.submittedAt).toLocaleString('he-IL'),
      'זמן מילוי (שניות)': sub.completionTimeSeconds || '-',
      'סטטוס סנכרון CRM': sub.crmSyncStatus === 'synced' ? 'סונכרן' : 'לא סונכרן',
    };

    // Add each step's value
    form.steps.forEach((step) => {
      const val = sub.answers[step.mappingKey || step.id];
      let formattedVal = '-';
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) formattedVal = val.join(', ');
        else if (typeof val === 'object') formattedVal = JSON.stringify(val);
        else formattedVal = String(val);
      }
      row[step.title] = formattedVal;
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'הגשות טופס');

  const safeTitle = form.title.replace(/[^\w\u0590-\u05FF]+/g, '_');
  const filename = `${safeTitle}_הגשות_${new Date().toISOString().split('T')[0]}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
