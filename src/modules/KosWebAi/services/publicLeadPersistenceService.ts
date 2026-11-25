import { Firestore, doc, setDoc } from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';

export interface PublicLeadPageContext {
  pageId?: string;
  pageTitle?: string;
  slug?: string;
}

const recentLeadKeys = new Map<string, number>();
const DEDUP_WINDOW_MS = 8000;

function normalizePhone(raw: unknown): string {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('972') && digits.length >= 11) {
    return '0' + digits.slice(3);
  }
  return digits.slice(0, 50);
}

function clampStr(val: unknown, maxLen: number): string {
  if (val === undefined || val === null) return '';
  return String(val).trim().slice(0, maxLen);
}

function resolveContactsCollectionPath(tenantId?: string): string {
  const eff = !tenantId || tenantId === ROOT_TENANT_ID ? '_master' : tenantId;
  return `tenants/${eff}/${SYSTEM_COLLECTIONS.CONTACTS}`;
}

/**
 * Persists a public landing-page / smart-form lead directly to `tenants/{tenantId}/contacts`
 * using a fresh document ID (`allow create` under `isSafePublicContactCreate` in firestore.rules)
 * so leads appear in KosCrm even when KosCrm is not mounted.
 */
export async function persistPublicLeadToCrmContacts(
  db: Firestore | null | undefined,
  tenantId: string | undefined,
  payload: Record<string, any> | null | undefined,
  pageContext?: PublicLeadPageContext
): Promise<string | null> {
  if (!db || !payload || typeof payload !== 'object') {
    return null;
  }

  const meta = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
  const submissionId = clampStr(payload.submissionId || meta.submissionId, 120);

  const rawName =
    payload.kosun_crm_name ||
    payload.conta_name ||
    payload.name ||
    payload.fullName ||
    payload.full_name ||
    meta.name ||
    '';
  const rawPhone =
    payload.kosun_crm_phone ||
    payload.conta_phone ||
    payload.phone ||
    payload.tel ||
    meta.phone ||
    '';
  const rawEmail =
    payload.kosun_crm_email ||
    payload.email ||
    payload.mail ||
    meta.email ||
    '';
  const rawNotes =
    payload.kosun_crm_notes ||
    payload.notes ||
    meta.notes ||
    '';
  const rawCompany =
    payload.kosun_crm_company ||
    payload.company_name ||
    payload.company ||
    meta.businessName ||
    meta.companyName ||
    '';
  const rawCity =
    payload.kosun_crm_city ||
    payload.mh_crm_city ||
    payload.city ||
    '';

  const cleanPhone = normalizePhone(rawPhone);
  const cleanEmail = clampStr(rawEmail, 254);
  const cleanName =
    clampStr(rawName, 200) ||
    (cleanPhone ? `ליד ${cleanPhone.slice(-4)}` : '') ||
    cleanEmail ||
    'ליד מעמוד נחיתה';

  const dedupKey = submissionId || `${tenantId || '_master'}|${cleanName}|${cleanPhone}|${cleanEmail}`;
  const nowMs = Date.now();
  const prevMs = recentLeadKeys.get(dedupKey);
  if (prevMs && nowMs - prevMs < DEDUP_WINDOW_MS) {
    return null;
  }
  recentLeadKeys.set(dedupKey, nowMs);
  if (recentLeadKeys.size > 100) {
    for (const [k, ts] of recentLeadKeys.entries()) {
      if (nowMs - ts > DEDUP_WINDOW_MS) recentLeadKeys.delete(k);
    }
  }

  const nowIso = new Date().toISOString();
  const contactDocId = `lead_${nowMs}_${Math.random().toString(36).slice(2, 8)}`;
  const formTitle =
    clampStr(payload.formTitle || meta.formTitle || pageContext?.pageTitle || 'טופס הרשמה באתר', 160);
  const sourceLabel = clampStr(
    payload.source || payload.lead_source || (pageContext?.pageTitle ? `עמוד נחיתה: ${pageContext.pageTitle}` : 'עמוד נחיתה / Smart Form'),
    200
  );

  const rawTags = Array.isArray(payload.tags) ? payload.tags : [];
  const mergedTags = Array.from(
    new Set(
      [
        'ליד מעמוד נחיתה',
        ...rawTags.map((t: unknown) => clampStr(t, 80)).filter(Boolean),
        pageContext?.pageTitle ? `עמוד: ${clampStr(pageContext.pageTitle, 60)}` : '',
      ].filter(Boolean)
    )
  ).slice(0, 20);

  const contactsPath = resolveContactsCollectionPath(tenantId);

  const contactDoc: Record<string, any> = {
    id: contactDocId,
    // Canonical KOSUN CRM Schema
    kosun_crm_name: cleanName,
    kosun_crm_phone: cleanPhone,
    kosun_crm_email: cleanEmail,
    kosun_crm_company: clampStr(rawCompany, 200),
    kosun_crm_city: clampStr(rawCity, 120),
    kosun_crm_notes: clampStr(rawNotes, 5000),
    kosun_crm_tags: mergedTags,
    kosun_crm_source: sourceLabel,
    kosun_crm_status: 'active',
    kosun_crm_type: 'lead',

    // Legacy / KosCrm CORE_COLUMNS compatibility
    conta_name: cleanName,
    name: cleanName,
    conta_phone: cleanPhone,
    phone: cleanPhone,
    normalizedPhone: cleanPhone,
    email: cleanEmail,
    company_name: clampStr(rawCompany, 200),
    mh_crm_city: clampStr(rawCity, 120),
    lead_source: sourceLabel,
    tags: mergedTags,
    notes: clampStr(rawNotes, 5000) || `התקבל מטופס "${formTitle}" בתאריך ${new Date().toLocaleDateString('he-IL')}`,
    status: 'active',
    is_lead: true,
    contact_type: 'lead',
    last_form_name: formTitle,
    last_form_submission_date: nowIso,
    form_submissions: [
      {
        name: formTitle,
        page: clampStr(pageContext?.slug || pageContext?.pageId || meta.formId || 'landing_page', 120),
        date: nowIso,
        payload: {
          kosun_crm_name: cleanName,
          kosun_crm_phone: cleanPhone,
          kosun_crm_email: cleanEmail,
          kosun_crm_notes: clampStr(rawNotes, 2000),
        },
      },
    ],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Preserve additional custom kosun_crm_* fields safely (without exceeding Firestore field limits)
  for (const [key, val] of Object.entries(payload)) {
    if (
      key.startsWith('kosun_crm_') &&
      !(key in contactDoc) &&
      (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') &&
      Object.keys(contactDoc).length < 95
    ) {
      contactDoc[key] = typeof val === 'string' ? clampStr(val, 1000) : val;
    }
  }

  await setDoc(doc(db, contactsPath, contactDocId), contactDoc);
  return contactDocId;
}
