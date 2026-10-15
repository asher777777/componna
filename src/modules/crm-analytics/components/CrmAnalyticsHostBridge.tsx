import React, { useEffect } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import {
  CrmMetadataContract,
  CrmFieldOption,
  LeadCaptureContract,
  LeadPayload,
  SYSTEM_COLLECTIONS,
} from '../../../core/contracts';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { createContact } from '../services/crmAnalyticsService';

const CORE_CRM_MAPPING_FIELDS: CrmFieldOption[] = [
  { value: 'conta_name', label: 'שם / שם מלא', group: 'שדות מערכת' },
  { value: 'f_m', label: 'שם משפחה', group: 'שדות מערכת' },
  { value: 'conta_phone', label: 'טלפון נייד (וואטסאפ)', group: 'שדות מערכת' },
  { value: 'email', label: 'דוא״ל ראשי', group: 'שדות מערכת' },
  { value: 'company_name', label: 'שם החברה / עסק', group: 'שדות מערכת' },
  { value: 'mh_crm_city', label: 'עיר', group: 'שדות מערכת' },
  { value: 'mh_crm_street', label: 'כתובת / רחוב', group: 'שדות מערכת' },
  { value: 'notes', label: 'הערות / תוכן פנייה', group: 'שדות מערכת' },
  { value: 'gender', label: 'מגדר', group: 'שדות מערכת' },
  { value: 'birth_date', label: 'תאריך לידה', group: 'שדות מערכת' },
  { value: 'work_phone', label: 'טלפון (עבודה)', group: 'שדות מערכת' },
  { value: 'website', label: 'אתר אינטרנט', group: 'שדות מערכת' },
  { value: 'job_title', label: 'תפקיד', group: 'שדות מערכת' },
  { value: 'lead_source', label: 'מקור הליד (אוטומטי)', group: 'שדות מערכת' },
  { value: 'tg1', label: 'תג 1 (סטטוס פנייה)', group: 'שדות מערכת' },
  { value: 'tg2', label: 'תג 2', group: 'שדות מערכת' },
  { value: 'tg3', label: 'תג 3', group: 'שדות מערכת' },
  { value: 'payment_amount', label: 'סכום לתשלום (עבור טופס תשלום)', group: 'שדות מערכת' },
  { value: 'total_spent', label: 'סך הכל תרומות/רכישות', group: 'שדות מערכת' },
  { value: 'order_count', label: 'מספר תרומות/רכישות', group: 'שדות מערכת' },
];

export const CrmAnalyticsHostBridge: React.FC = () => {
  const { registerCapability, unregisterCapability } = useHostCapabilities();
  const { db, firebaseApp } = useSystemConnection();
  const { getScopedCollectionPath } = useTenantScope();

  useEffect(() => {
    const crmContract: CrmMetadataContract = {
      getMappingFields: async (): Promise<CrmFieldOption[]> => {
        const fields = [...CORE_CRM_MAPPING_FIELDS];
        if (db) {
          try {
            const customFieldsPath = getScopedCollectionPath('crm_custom_fields');
            const snap = await getDocs(collection(db, customFieldsPath));
            snap.forEach((docSnap) => {
              const d = docSnap.data();
              fields.push({
                value: d.key || d.id || docSnap.id,
                label: d.label || d.name || docSnap.id,
                group: 'שדות מותאמים אישית',
              });
            });
          } catch (err) {
            console.warn('[CrmHostBridge] Could not load custom fields:', err);
          }
        }
        return fields;
      },

      captureLead: async (lead: LeadPayload): Promise<string | boolean> => {
        try {
          const contactData = {
            conta_name: lead.kosun_crm_name || lead.conta_name || 'ליד חדש',
            conta_phone: lead.kosun_crm_phone || lead.conta_phone || '',
            email: lead.kosun_crm_email || lead.email || '',
            company_name: lead.kosun_crm_company || '',
            mh_crm_city: lead.kosun_crm_city || '',
            mh_crm_street: lead.kosun_crm_street || '',
            notes: lead.kosun_crm_notes || '',
            source: lead.kosun_crm_source || lead.source || 'contact_form',
            tags: lead.kosun_crm_tags || lead.tags || ['ליד חדש'],
            metadata: lead.metadata || {},
          };

          const collections = {
            contacts: getScopedCollectionPath(SYSTEM_COLLECTIONS.CONTACTS),
            leads: getScopedCollectionPath('mod_crm_leads'),
            groups: getScopedCollectionPath(SYSTEM_COLLECTIONS.GROUPS),
            customFields: getScopedCollectionPath('crm_custom_fields'),
            savedViews: getScopedCollectionPath('crm_analytics_saved_views'),
            forms: getScopedCollectionPath(SYSTEM_COLLECTIONS.SMART_FORMS),
            formSubmissionsSubcollection: 'submissions',
          };

          const res = await createContact(firebaseApp, contactData, undefined, collections);
          return res?.id || true;
        } catch (err) {
          console.error('[CrmHostBridge] captureLead error:', err);
          return false;
        }
      },

      createCustomField: async (fieldData: { label: string; key?: string; type?: string }) => {
        if (!db) return { success: false, error: 'Database not connected' };
        try {
          const customFieldsPath = getScopedCollectionPath('crm_custom_fields');
          const safeKey = fieldData.key || `custom_${Date.now()}`;
          const newDoc = {
            key: safeKey,
            label: fieldData.label,
            type: fieldData.type || 'text',
            createdAt: new Date().toISOString(),
          };
          const ref = await addDoc(collection(db, customFieldsPath), newDoc);
          const option: CrmFieldOption = {
            value: safeKey,
            label: fieldData.label,
            group: 'שדות מותאמים אישית',
          };
          return { success: true, field: option };
        } catch (err: any) {
          return { success: false, error: err?.message || 'Error creating custom field' };
        }
      },
    };

    const leadCaptureContract: LeadCaptureContract = {
      captureLead: crmContract.captureLead!,
    };

    registerCapability('crm-service', crmContract);
    registerCapability('lead-capture', leadCaptureContract);

    return () => {
      unregisterCapability('crm-service');
      unregisterCapability('lead-capture');
    };
  }, [db, firebaseApp, getScopedCollectionPath, registerCapability, unregisterCapability]);

  return null;
};

export default CrmAnalyticsHostBridge;
