import React, { useEffect } from 'react';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import {
  CrmMetadataContract,
  CrmFieldOption,
  CrmContactSummary,
  LeadCaptureContract,
  LeadPayload,
  SYSTEM_COLLECTIONS,
  CANONICAL_CRM_CONTACT_FIELDS,
} from '../../../core/contracts';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { createContact } from '../services/crmAnalyticsService';
import { createCrmSubscriptionsContract } from '../services/crmSubscriptionsContractService';

const CORE_CRM_MAPPING_FIELDS: CrmFieldOption[] = CANONICAL_CRM_CONTACT_FIELDS;

export const CrmAnalyticsHostBridge: React.FC = () => {
  const { registerCapability, unregisterCapability } = useHostCapabilities();
  const { db, firebaseApp } = useSystemConnection();
  const { tenantId, getScopedCollectionPath } = useTenantScope();

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
                group: d.tabLabel ? `לשונית: ${d.tabLabel}` : 'שדות מותאמים אישית',
                tabId: d.tabId || undefined,
                tabLabel: d.tabLabel || undefined,
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

      createCustomField: async (fieldData: { label: string; key?: string; type?: string; tabId?: string; tabLabel?: string }) => {
        if (!db) return { success: false, error: 'Database not connected' };
        try {
          const customFieldsPath = getScopedCollectionPath('crm_custom_fields');
          const safeKey = fieldData.key || `custom_${Date.now()}`;
          const newDoc = {
            key: safeKey,
            label: fieldData.label,
            type: fieldData.type || 'text',
            ...(fieldData.tabId ? { tabId: fieldData.tabId } : {}),
            ...(fieldData.tabLabel ? { tabLabel: fieldData.tabLabel } : {}),
            createdAt: new Date().toISOString(),
          };
          await addDoc(collection(db, customFieldsPath), newDoc);
          const option: CrmFieldOption = {
            value: safeKey,
            label: fieldData.label,
            group: fieldData.tabLabel ? `לשונית: ${fieldData.tabLabel}` : 'שדות מותאמים אישית',
            tabId: fieldData.tabId,
            tabLabel: fieldData.tabLabel,
          };
          return { success: true, field: option };
        } catch (err: any) {
          return { success: false, error: err?.message || 'Error creating custom field' };
        }
      },

      getCustomTabs: async () => {
        if (!db) return [];
        try {
          const tabsPath = getScopedCollectionPath('crm_contact_tabs');
          const snap = await getDocs(collection(db, tabsPath));
          return snap.docs.map((docSnap) => {
            const d = docSnap.data() || {};
            return {
              id: docSnap.id,
              label: d.label || docSnap.id,
              icon: d.icon || 'FolderPlus',
              description: d.description || '',
            };
          });
        } catch (err) {
          console.warn('[CrmHostBridge] Could not load custom tabs:', err);
          return [];
        }
      },

      createCustomTab: async (tabData: { label: string; icon?: string; description?: string }) => {
        if (!db) return { success: false, error: 'Database not connected' };
        try {
          const tabsPath = getScopedCollectionPath('crm_contact_tabs');
          const newTab = {
            label: tabData.label,
            icon: tabData.icon || 'FolderPlus',
            description: tabData.description || '',
            createdAt: new Date().toISOString(),
          };
          const docRef = await addDoc(collection(db, tabsPath), newTab);
          return {
            success: true,
            tab: {
              id: docRef.id,
              label: newTab.label,
              icon: newTab.icon,
              description: newTab.description,
            },
          };
        } catch (err: any) {
          return { success: false, error: err?.message || 'Error creating custom tab' };
        }
      },

      getContactsSummary: async (options?: { search?: string; tag?: string; limit?: number }): Promise<CrmContactSummary[]> => {
        if (!db) return [];
        try {
          const contactsPath = getScopedCollectionPath(SYSTEM_COLLECTIONS.CONTACTS);
          const snap = await getDocs(collection(db, contactsPath));
          const searchLower = options?.search?.trim().toLowerCase() || '';
          const tagLower = options?.tag?.trim().toLowerCase() || '';
          const maxResults = options?.limit && options.limit > 0 ? options.limit : 100;

          const results: CrmContactSummary[] = [];

          snap.forEach((docSnap) => {
            const d = docSnap.data() || {};
            if (d.kosun_crm_status === 'trashed' || d.status === 'trashed') {
              return;
            }

            const name = String(d.kosun_crm_name || d.conta_name || d.name || '').trim();
            const phone = String(d.kosun_crm_phone || d.conta_phone || d.phone || '').trim();
            const email = String(d.kosun_crm_email || d.email || '').trim();
            const companyName = String(d.kosun_crm_company || d.company_name || d.company || '').trim();
            const role = String(d.kosun_crm_role || d.job_title || d.role || '').trim();

            const rawTags = d.kosun_crm_tags ?? d.tags ?? [];
            const tags: string[] = Array.isArray(rawTags)
              ? rawTags.map((t: unknown) => String(t).trim()).filter(Boolean)
              : typeof rawTags === 'string'
                ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            if (tagLower) {
              const hasTag = tags.some((t) => t.toLowerCase() === tagLower || t.toLowerCase().includes(tagLower));
              if (!hasTag) return;
            }

            if (searchLower) {
              const haystack = `${name} ${phone} ${email} ${companyName} ${role} ${tags.join(' ')}`.toLowerCase();
              if (!haystack.includes(searchLower)) return;
            }

            results.push({
              id: docSnap.id,
              name,
              phone,
              email,
              companyName: companyName || undefined,
              role: role || undefined,
              tags,
              kosun_crm_name: name || undefined,
              kosun_crm_phone: phone || undefined,
              kosun_crm_email: email || undefined,
              kosun_crm_gov_id: d.kosun_crm_gov_id || d.tg1 || undefined,
              conta_name: name || undefined,
              conta_phone: phone || undefined,
              total_spent: typeof d.kosun_crm_total_spent === 'number' ? d.kosun_crm_total_spent : (typeof d.total_spent === 'number' ? d.total_spent : undefined),
              order_count: typeof d.kosun_crm_order_count === 'number' ? d.kosun_crm_order_count : (typeof d.order_count === 'number' ? d.order_count : undefined),
            });
          });

          results.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'he'));
          return results.slice(0, maxResults);
        } catch (err) {
          console.warn('[CrmHostBridge] getContactsSummary error:', err);
          return [];
        }
      },
    };

    const leadCaptureContract: LeadCaptureContract = {
      captureLead: crmContract.captureLead!,
    };

    const crmSubscriptionsContract = createCrmSubscriptionsContract({
      db,
      firebaseApp,
      tenantId,
      getScopedCollectionPath,
    });

    registerCapability('crm-service', crmContract);
    registerCapability('lead-capture', leadCaptureContract);
    registerCapability('crm-subscriptions', crmSubscriptionsContract);

    return () => {
      unregisterCapability('crm-service');
      unregisterCapability('lead-capture');
      unregisterCapability('crm-subscriptions');
    };
  }, [db, firebaseApp, tenantId, getScopedCollectionPath, registerCapability, unregisterCapability]);

  return null;
};

export default CrmAnalyticsHostBridge;
