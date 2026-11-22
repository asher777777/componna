/**
 * KosProjects - Capability-Based Cross-Module Sync Orchestrator
 * Strictly adheres to KOSUN26 Zero Cross-Import architecture:
 * communicates with CRM, Communities, Forms, Landing Pages, WhatsApp, and Email
 * exclusively via HostCapabilities and Core EventBus.
 */

import { eventBus } from '../../../core/bridge/EventBus';
import type {
  BrandDnaContract,
  CrmContactSummary,
  CrmGroupsContract,
  CrmGroupSummary,
  EmailContract,
  FormBuilderContract,
  FormFieldContract,
  LeadCaptureContract,
  LeadPayload,
  PageBuilderContract,
  WhatsAppContract,
} from '../../../core/contracts';
import { ProjectRecord } from '../types';

export type CapabilityGetter = <T = any>(name: string) => T | null;

// ============================================================================
// 1. CRM Contacts & Suppliers Sync
// ============================================================================

export async function fetchCrmContactsAndSuppliers(
  getCapability: CapabilityGetter,
  search?: string
): Promise<CrmContactSummary[]> {
  try {
    const crmService = getCapability<any>('crm-service');
    if (crmService && typeof crmService.getContactsSummary === 'function') {
      const contacts: CrmContactSummary[] = await crmService.getContactsSummary(
        search ? { search } : undefined
      );
      return Array.isArray(contacts) ? contacts : [];
    }
    return [];
  } catch (err) {
    console.warn('[KosProjects] fetchCrmContactsAndSuppliers fallback:', err);
    return [];
  }
}

export async function syncSupplierOrLeadToCrm(
  getCapability: CapabilityGetter,
  payload: {
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    role?: string;
    projectTitle?: string;
    isSupplier?: boolean;
    communityName?: string;
    tags?: string[];
    notes?: string;
  }
): Promise<{ success: boolean; contactId?: string }> {
  const tags = Array.from(
    new Set([
      ...(payload.tags || []),
      payload.isSupplier ? 'ספק פרויקט' : 'נרשם פרויקט',
      ...(payload.projectTitle ? [`פרויקט: ${payload.projectTitle}`] : []),
      ...(payload.role ? [payload.role] : []),
    ])
  );

  const leadPayload: LeadPayload = {
    kosun_crm_name: payload.name,
    kosun_crm_phone: payload.phone || '',
    kosun_crm_email: payload.email || '',
    kosun_crm_company: payload.company || '',
    kosun_crm_notes: payload.notes || (payload.projectTitle ? `שויך לפרויקט: ${payload.projectTitle}` : ''),
    kosun_crm_tags: tags,
    kosun_crm_source: 'KosProjects',
    conta_name: payload.name,
    conta_phone: payload.phone || '',
    email: payload.email || '',
    tags,
    community: payload.communityName,
    source: 'KosProjects',
  };

  let contactId: string | undefined;
  let captured = false;

  try {
    const leadCapture = getCapability<LeadCaptureContract>('lead-capture');
    if (leadCapture && typeof leadCapture.captureLead === 'function') {
      const res = await leadCapture.captureLead(leadPayload);
      if (typeof res === 'string') {
        contactId = res;
        captured = true;
      } else if (res === true) {
        captured = true;
      }
    }
  } catch (err) {
    console.warn('[KosProjects] captureLead failed:', err);
  }

  // Always publish canonical CRM event so listeners (e.g. KosTogether) stay in sync
  eventBus.publish('crm:lead:created', leadPayload);

  return { success: captured, contactId };
}

// ============================================================================
// 2. Communities Sync (KosTogether)
// ============================================================================

export async function fetchCommunities(
  getCapability: CapabilityGetter
): Promise<CrmGroupSummary[]> {
  try {
    const groupsCap = getCapability<CrmGroupsContract>('crm-groups') || getCapability<CrmGroupsContract>('KosTogether');
    if (groupsCap && typeof groupsCap.getGroups === 'function') {
      const groups = await groupsCap.getGroups();
      return Array.isArray(groups) ? groups : [];
    }
    return [];
  } catch (err) {
    console.warn('[KosProjects] fetchCommunities failed:', err);
    return [];
  }
}

export async function assignRegistrantToProjectCommunity(
  getCapability: CapabilityGetter,
  contactId: string,
  groupId: string
): Promise<boolean> {
  if (!contactId || !groupId) return false;
  try {
    const groupsCap = getCapability<CrmGroupsContract>('crm-groups') || getCapability<CrmGroupsContract>('KosTogether');
    if (groupsCap && typeof groupsCap.assignContactToGroup === 'function') {
      return await groupsCap.assignContactToGroup(contactId, groupId);
    }
    return false;
  } catch (err) {
    console.warn('[KosProjects] assignRegistrantToProjectCommunity failed:', err);
    return false;
  }
}

// ============================================================================
// 3. Marketing Assets Sync (KosForms + KosWebAi)
// ============================================================================

export interface CreateProjectMarketingOptions {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  coverImageUrl?: string;
  customFields?: Array<{
    label: string;
    type: string;
    required?: boolean;
    map_to?: string;
    options?: string;
  }>;
}

export interface CreateProjectMarketingResult {
  success: boolean;
  formId?: string;
  formTitle?: string;
  landingPageId?: string;
  landingPageSlug?: string;
  landingPageUrl?: string;
  warnings: string[];
}

export async function createProjectMarketingAssets(
  getCapability: CapabilityGetter,
  project: ProjectRecord,
  options: CreateProjectMarketingOptions = {}
): Promise<CreateProjectMarketingResult> {
  const warnings: string[] = [];
  let formId: string | undefined = project.marketing?.formId;
  let formTitle: string | undefined = project.marketing?.formTitle;
  let landingPageId: string | undefined = project.marketing?.landingPageId;
  let landingPageSlug: string | undefined = project.marketing?.landingPageSlug;
  let landingPageUrl: string | undefined = project.marketing?.landingPageUrl;

  const headline = options.headline || project.marketing?.headline || project.title;
  const subheadline = options.subheadline || project.marketing?.subheadline || project.description;
  const ctaText = options.ctaText || project.marketing?.ctaText || 'הרשמה לפרויקט';

  // Step 1: Create Registration Form via 'form-builder'
  const formBuilder = getCapability<FormBuilderContract>('form-builder');
  if (formBuilder && typeof formBuilder.saveForm === 'function') {
    try {
      const fields: FormFieldContract[] =
        options.customFields && options.customFields.length > 0
          ? options.customFields.map((f) => ({
              label: f.label,
              type: f.type || 'text',
              map_to: f.map_to || '',
              required: Boolean(f.required),
              options: f.options,
            }))
          : [
              { label: 'שם מלא', type: 'text', map_to: 'kosun_crm_name', required: true },
              { label: 'טלפון נייד', type: 'tel', map_to: 'kosun_crm_phone', required: true },
              { label: 'דוא"ל', type: 'email', map_to: 'kosun_crm_email', required: false },
              { label: 'הערות / שאלות', type: 'textarea', map_to: 'kosun_crm_notes', required: false },
            ];

      const title = `טופס הרשמה - ${project.title}`;
      const formPayload = {
        id: formId,
        title,
        category: 'projects',
        projectId: project.id,
        communityGroupId: project.communityGroupId,
        config: {
          enabled: true,
          form_type: 'register' as const,
          submit_button_text: ctaText,
          fields,
          save_to_crm: true,
          standard_success_message: `תודה שנרשמת לפרויקט "${project.title}"! פרטיך נקלטו בהצלחה.`,
        },
      };

      const savedForm = await formBuilder.saveForm(formPayload);
      if (savedForm?.success && savedForm.id) {
        formId = savedForm.id;
        formTitle = title;
      } else {
        warnings.push('שמירת טופס ההרשמה לא החזירה מזהה תקין.');
      }
    } catch (err: any) {
      warnings.push(`שגיאה ביצירת טופס הרשמה: ${err?.message || 'שגיאה לא ידועה'}`);
    }
  } else {
    warnings.push('רכיב הטפסים (KosForms) אינו זמין כרגע בסביבה.');
  }

  // Step 2: Create Landing Page via 'page-builder'
  const pageBuilder = getCapability<PageBuilderContract>('page-builder');
  const brandDnaCap = getCapability<BrandDnaContract>('brand-dna');
  const brandDna = brandDnaCap?.getBrandDna?.() || null;

  if (pageBuilder) {
    try {
      const slugBase = `project-${project.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(-8)}`;
      const servicePayload = {
        id: project.id,
        nameAndSlogan: headline,
        shortDescription: subheadline,
        longDescription: project.description || subheadline,
        imageUrl: options.coverImageUrl || project.marketing?.coverImageUrl,
        painPointSolved: `הצטרפות מסודרת ומקצועית לפרויקט ${project.title}`,
        targetAudience: project.clientName || 'לקוחות וחברי קהילה',
        competitiveAdvantage: ctaText,
        seo: {
          slug: landingPageSlug || slugBase,
          metaTitle: headline,
          metaDescription: subheadline,
        },
        linkedPageId: landingPageId,
        linkedPageSlug: landingPageSlug,
      };

      if (typeof pageBuilder.createPageFromService === 'function' && brandDna) {
        const res = await pageBuilder.createPageFromService({
          service: servicePayload,
          brandDna,
        });
        if (res?.success) {
          landingPageId = res.pageId;
          landingPageSlug = res.slug;
          landingPageUrl = res.publicUrl;
        } else if (res?.error) {
          warnings.push(`יצירת דף הנחיתה נכשלה: ${res.error}`);
        }
      } else if (typeof pageBuilder.createPageFromProduct === 'function') {
        const res = await pageBuilder.createPageFromProduct({
          product: servicePayload,
          brandDna,
        });
        if (res?.success) {
          landingPageId = res.pageId;
          landingPageSlug = res.slug;
          landingPageUrl = res.publicUrl;
        } else if (res?.error) {
          warnings.push(`יצירת דף הנחיתה נכשלה: ${res.error}`);
        }
      } else {
        warnings.push('בונה האתרים אינו תומך ביצירת דף פרויקט בגרסה זו.');
      }
    } catch (err: any) {
      warnings.push(`שגיאה ביצירת דף הנחיתה: ${err?.message || 'שגיאה לא ידועה'}`);
    }
  } else {
    warnings.push('רכיב דפי הנחיתה (KosWebAi) אינו זמין כרגע בסביבה.');
  }

  return {
    success: Boolean(formId || landingPageId),
    formId,
    formTitle,
    landingPageId,
    landingPageSlug,
    landingPageUrl,
    warnings,
  };
}

// ============================================================================
// 4. Vendor Reminder Dispatch (WhatsApp / Email)
// ============================================================================

export interface VendorReminderResult {
  success: boolean;
  channel?: 'whatsapp' | 'email';
  error?: string;
}

export async function sendVendorReminder(
  getCapability: CapabilityGetter,
  params: {
    phone?: string;
    email?: string;
    message: string;
    subject?: string;
  }
): Promise<VendorReminderResult> {
  // Prefer WhatsApp if phone is provided and WhatsApp capability is configured
  if (params.phone && params.phone.trim()) {
    const waCap =
      getCapability<WhatsAppContract>('whatsapp-service') ||
      getCapability<WhatsAppContract>('KosWhatsUp');

    if (waCap && typeof waCap.sendMessage === 'function' && (!waCap.isConfigured || waCap.isConfigured())) {
      try {
        const res = await waCap.sendMessage({
          phone: params.phone.trim(),
          message: params.message,
        });
        if (res?.success) {
          return { success: true, channel: 'whatsapp' };
        }
        return {
          success: false,
          channel: 'whatsapp',
          error: res?.error || 'שליחת הודעת הוואטסאפ נכשלה.',
        };
      } catch (err: any) {
        return {
          success: false,
          channel: 'whatsapp',
          error: err?.message || 'שגיאה בשליחת הודעת וואטסאפ.',
        };
      }
    }
  }

  // Fallback to Email if email is provided and Email capability is configured
  if (params.email && params.email.trim()) {
    const emailCap = getCapability<EmailContract>('email-dispatcher');
    if (emailCap && typeof emailCap.sendEmail === 'function' && (!emailCap.isConfigured || emailCap.isConfigured())) {
      try {
        const res = await emailCap.sendEmail({
          to: params.email.trim(),
          subject: params.subject || 'עדכון ותזכורת פרויקט',
          htmlContent: `<div dir="rtl" style="font-family:sans-serif;line-height:1.6;">${params.message.replace(/\n/g, '<br/>')}</div>`,
        });
        if (res?.success) {
          return { success: true, channel: 'email' };
        }
        return {
          success: false,
          channel: 'email',
          error: res?.error || 'שליחת המייל נכשלה.',
        };
      } catch (err: any) {
        return {
          success: false,
          channel: 'email',
          error: err?.message || 'שגיאה בשליחת המייל.',
        };
      }
    }
  }

  return {
    success: false,
    error: 'לא נמצא ערוץ שליחה מוגדר (וואטסאפ או מייל) או שחסרים פרטי התקשרות לספק.',
  };
}
