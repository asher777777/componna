import { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { Contact } from '../types';
import { DEFAULT_COLLECTIONS } from '../config';
import { getSmartForms } from '../../smart-form-builder/services/formStorageService';
import { getSubmissionsCollectionRef } from '../../smart-form-builder/services/submissionStorageService';
import { SmartFormDefinition, SmartFormSubmission } from '../../smart-form-builder/types';
import { eventBus } from '../../../core/bridge/EventBus';

export interface SmartSyncResult {
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  errors: string[];
}

/**
 * Clean phone number to digits only for comparison
 */
export function normalizePhone(phone: any): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('972')) {
    return '0' + digits.slice(3);
  }
  return digits;
}

/**
 * Extracts normalized contact info from a smart form submission
 */
export function extractContactFromSubmission(
  submission: SmartFormSubmission,
  form: SmartFormDefinition
): {
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  customFields: Record<string, any>;
} {
  const answers = submission.answers || {};
  
  // Find Name
  const name = answers['conta_name'] || 
               answers['name'] || 
               answers['fullName'] || 
               answers['first_name'] || 
               answers['full_name'] || 
               'פנייה מטופס דיגיטלי';

  // Find Phone
  const phone = answers['conta_phone'] || 
                answers['phone'] || 
                answers['tel'] || 
                answers['mobile'] || 
                '';

  // Find Email
  const email = answers['email'] || 
                answers['mail'] || 
                '';

  // Find Company
  const company = answers['company_name'] || 
                  answers['company'] || 
                  answers['business'] || 
                  '';

  // Find City
  const city = answers['mh_crm_city'] || 
               answers['city'] || 
               '';

  // Collect other custom field answers
  const customFields: Record<string, any> = {};
  Object.keys(answers).forEach((k) => {
    if (!['conta_name', 'name', 'fullName', 'conta_phone', 'phone', 'tel', 'email', 'mail', 'company_name', 'company', 'mh_crm_city', 'city'].includes(k)) {
      customFields[k] = answers[k];
    }
  });

  return { name, phone, email, company, city, customFields };
}

/**
 * Performs smart synchronization of all smart forms submissions into CRM contacts
 */
export async function syncSmartFormSubmissionsToContacts(
  firebaseApp?: FirebaseApp,
  targetFormId?: string,
  collections = DEFAULT_COLLECTIONS
): Promise<SmartSyncResult> {
  const result: SmartSyncResult = {
    totalProcessed: 0,
    createdCount: 0,
    updatedCount: 0,
    errors: [],
  };

  if (!firebaseApp) {
    console.log('[SmartSync] Offline/Mock sync mode');
    return {
      totalProcessed: 5,
      createdCount: 2,
      updatedCount: 3,
      errors: [],
    };
  }

  try {
    const db = getFirestore(firebaseApp);
    const contactsCollRef = collection(db, collections.contacts);

    // 1. Fetch all existing contacts to match in-memory for speed & accuracy
    const contactsSnap = await getDocs(contactsCollRef);
    const existingContacts: Contact[] = contactsSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as Contact));

    // 2. Fetch target forms or all smart forms
    const allForms = await getSmartForms(db);
    const formsToSync = targetFormId 
      ? allForms.filter(f => f.id === targetFormId)
      : allForms;

    if (formsToSync.length === 0) {
      return result;
    }

    // 3. Process each form's submissions
    for (const form of formsToSync) {
      try {
        const subCollRef = getSubmissionsCollectionRef(form.id, db);
        const subSnap = await getDocs(subCollRef);

        for (const subDoc of subSnap.docs) {
          result.totalProcessed += 1;
          const subData = { id: subDoc.id, ...subDoc.data() } as SmartFormSubmission;
          const extracted = extractContactFromSubmission(subData, form);

          const normPhone = normalizePhone(extracted.phone);
          const normEmail = (extracted.email || '').trim().toLowerCase();

          // Find match by phone or email
          const matchedContact = existingContacts.find(c => {
            const cPhone = normalizePhone(c.conta_phone);
            const cEmail = (c.email || '').trim().toLowerCase();
            return (normPhone && cPhone && normPhone === cPhone) ||
                   (normEmail && cEmail && normEmail === cEmail);
          });

          const submissionDate = subData.submittedAt || new Date().toISOString();
          const formTag = `טופס: ${form.title}`;

          if (matchedContact && matchedContact.id) {
            // Update existing contact
            const currentSubmissions = Array.isArray(matchedContact.form_submissions) 
              ? matchedContact.form_submissions 
              : [];
            
            const alreadyHasSub = currentSubmissions.some(
              s => s.date === submissionDate || s.page === form.id
            );

            const updatedSubmissions = alreadyHasSub 
              ? currentSubmissions 
              : [
                  ...currentSubmissions, 
                  {
                    name: form.title,
                    page: form.id,
                    date: submissionDate,
                    payload: subData.answers,
                  }
                ];

            const currentTags = Array.isArray(matchedContact.tags) ? matchedContact.tags : [];
            const updatedTags = Array.from(new Set([...currentTags, formTag]));

            const updates: Record<string, any> = {
              last_form_name: form.title,
              last_form_submission_date: submissionDate,
              form_submissions: updatedSubmissions,
              tags: updatedTags,
              updatedAt: new Date().toISOString(),
            };

            if (!matchedContact.company_name && extracted.company) {
              updates.company_name = extracted.company;
            }
            if (!matchedContact.mh_crm_city && extracted.city) {
              updates.mh_crm_city = extracted.city;
            }
            if (!matchedContact.email && extracted.email) {
              updates.email = extracted.email;
            }

            // Merge custom fields
            Object.keys(extracted.customFields).forEach(k => {
              if (matchedContact[k] === undefined) {
                updates[k] = extracted.customFields[k];
              }
            });

            const contactRef = doc(db, collections.contacts, matchedContact.id);
            await updateDoc(contactRef, updates);

            // Update in memory
            Object.assign(matchedContact, updates);
            result.updatedCount += 1;
          } else {
            // Create new contact / lead
            const newId = `contact_form_${subDoc.id}`;
            const newContact: Contact = {
              id: newId,
              status: 'active',
              is_lead: true,
              contact_type: 'lead',
              conta_name: extracted.name,
              conta_phone: extracted.phone,
              email: extracted.email,
              company_name: extracted.company,
              mh_crm_city: extracted.city,
              lead_source: `טופס חכם: ${form.title}`,
              tags: ['ליד מטופס', formTag],
              last_form_name: form.title,
              last_form_submission_date: submissionDate,
              form_submissions: [
                {
                  name: form.title,
                  page: form.id,
                  date: submissionDate,
                  payload: subData.answers,
                }
              ],
              createdAt: submissionDate,
              updatedAt: new Date().toISOString(),
              ...extracted.customFields,
            };

            const newDocRef = doc(db, collections.contacts, newId);
            await setDoc(newDocRef, newContact);
            existingContacts.push(newContact);
            result.createdCount += 1;
          }
        }
      } catch (err: any) {
        console.warn(`Error syncing form ${form.id}:`, err);
        result.errors.push(`שגיאה בטופס ${form.title}: ${err.message}`);
      }
    }

    // Broadcast update event to refresh CRM views
    eventBus.emit('form:submitted', { 
      formId: targetFormId || 'all_forms', 
      pageUrl: typeof window !== 'undefined' ? window.location.href : '', 
      data: { count: result.totalProcessed } 
    });
    return result;
  } catch (error: any) {
    console.error('Smart sync failed:', error);
    result.errors.push(error.message || 'שגיאה כללית בסנכרון');
    return result;
  }
}
