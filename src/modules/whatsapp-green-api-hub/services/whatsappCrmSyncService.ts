import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export interface CrmExportContactInput {
  phone: string;
  chatId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  sourceAccountName?: string;
  sourceGroupName?: string;
  customTags?: string[];
  status?: string;
  notes?: string;
  isExplicitNameEdit?: boolean;
}

export interface CrmSyncResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Normalizes a phone number to its core digits by stripping:
 * - Country code (e.g. +972 or 972)
 * - Leading zeros (e.g. 050 -> 50)
 * - All non-digit characters
 * Example: +972-52-6968008 -> 526968008, 0526968008 -> 526968008
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/\D/g, '');

  // Strip international Israeli country code 972
  if (cleaned.startsWith('972')) {
    cleaned = cleaned.substring(3);
  }

  // Strip leading 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  return cleaned;
}

/**
 * Smart merge contacts into Firestore CRM collection:
 * - Matches by normalized phone without country code.
 * - If contact exists: ONLY updates missing/empty fields (does not overwrite existing values unless explicitly edited by user).
 * - Adds sourceAccountName, sourceGroupName, and CRM group.
 * - Appends new tags without duplicates.
 * - If contact does not exist: creates a brand new record.
 * - If new group is specified, registers it in crm_groups collection.
 */
export async function syncContactsToCrm(
  db: Firestore,
  contactsCollectionName: string,
  contactsToSync: CrmExportContactInput[],
  defaultAccountName: string = '',
  defaultGroupName: string = '',
  defaultTags: string[] = [],
  groupsCollectionName: string = 'crm_groups'
): Promise<CrmSyncResult> {
  const result: CrmSyncResult = {
    total: contactsToSync.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (!db || !contactsCollectionName) {
    result.errors.push('מסד הנתונים Firestore או קולקציית אנשי הקשר אינם מוגדרים');
    return result;
  }

  try {
    // 1. Fetch existing CRM contacts to perform local phone matching
    const crmCollectionRef = collection(db, contactsCollectionName);
    const snapshot = await getDocs(crmCollectionRef);

    // Map normalized phones to their doc ID and existing data
    const existingMap = new Map<string, { id: string; data: any }>();

    snapshot.forEach((d) => {
      const data = d.data();
      const raw = data.phone || data.phoneContact || data.mobile || data.phoneNumber || data.conta_phone || '';
      const norm = normalizePhone(String(raw));
      if (norm) {
        existingMap.set(norm, { id: d.id, data });
      }
    });

    // 2. If a group name is provided, ensure group exists in CRM groups collection
    const targetGroupName = defaultGroupName.trim();
    if (targetGroupName && groupsCollectionName) {
      try {
        const groupDocId = `grp_${encodeURIComponent(targetGroupName.replace(/\s+/g, '_'))}`;
        await setDoc(
          doc(db, groupsCollectionName, groupDocId),
          {
            name: targetGroupName,
            category: 'group',
            type: 'manual',
            color: '#6366f1',
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not auto-register group in crm_groups:', err);
      }
    }

    // 3. Process each contact
    for (const item of contactsToSync) {
      const normPhone = normalizePhone(item.phone);
      if (!normPhone || normPhone.length < 6) {
        result.skipped++;
        continue;
      }

      const formattedPhone = item.phone.startsWith('+') ? item.phone : item.phone;
      const accountName = (item.sourceAccountName || defaultAccountName || '').trim();
      const groupName = (item.sourceGroupName || defaultGroupName || '').trim();

      const tagsToMerge = Array.from(
        new Set([
          'WhatsApp',
          ...(item.customTags || []),
          ...defaultTags,
          groupName ? `קבוצה: ${groupName}` : '',
        ].filter(Boolean))
      );

      const existing = existingMap.get(normPhone);

      if (existing) {
        // --- SMART UPDATE: Only fill missing/empty fields, or apply explicit name update ---
        const existingData = existing.data;
        const updates: Record<string, any> = {};

        // Merge tags
        const currentTags: string[] = Array.isArray(existingData.tags) ? existingData.tags : [];
        const combinedTags = Array.from(new Set([...currentTags, ...tagsToMerge]));
        if (combinedTags.length > currentTags.length) {
          updates.tags = combinedTags;
        }

        // Explicit name edit OR missing name fill
        if (item.isExplicitNameEdit && item.name && item.name.trim()) {
          const cleanName = item.name.trim();
          updates.name = cleanName;
          updates.fullName = cleanName;
          updates.conta_name = cleanName;
          updates.firstName = cleanName.split(' ')[0];
          if (cleanName.includes(' ')) {
            updates.lastName = cleanName.split(' ').slice(1).join(' ');
          }
        } else {
          if (!existingData.name || existingData.name === existingData.phone) {
            if (item.name && item.name !== item.phone) {
              updates.name = item.name;
              updates.fullName = item.name;
              updates.conta_name = item.name;
            }
          }
          if (!existingData.firstName && item.firstName) updates.firstName = item.firstName;
          if (!existingData.lastName && item.lastName) updates.lastName = item.lastName;
        }

        // Group update
        if (groupName) {
          updates.group = groupName;
          updates.groupName = groupName;
          updates.sourceGroupName = groupName;
        }

        // Source metadata
        if (!existingData.sourceAccountName && accountName) updates.sourceAccountName = accountName;
        if (!existingData.source) updates.source = 'whatsapp_green_api';
        if (!existingData.normalizedPhone) updates.normalizedPhone = normPhone;

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = Date.now();
          await updateDoc(doc(db, contactsCollectionName, existing.id), updates);
          result.updated++;
        } else {
          result.skipped++;
        }
      } else {
        // --- CREATE NEW CONTACT ---
        const docId = `wa_${Date.now()}_${normPhone}`;
        const contactName = item.name && item.name.trim() ? item.name.trim() : item.phone;
        const firstName = item.firstName || contactName.split(' ')[0];
        const lastName = item.lastName || (contactName.includes(' ') ? contactName.split(' ').slice(1).join(' ') : '');

        const newContactData = {
          name: contactName,
          fullName: contactName,
          conta_name: contactName,
          firstName,
          lastName,
          phone: formattedPhone,
          conta_phone: formattedPhone,
          phoneContact: formattedPhone,
          mobile: formattedPhone,
          phoneNumber: formattedPhone,
          normalizedPhone: normPhone,
          source: 'whatsapp_green_api',
          sourceAccountName: accountName,
          sourceGroupName: groupName,
          group: groupName,
          groupName: groupName,
          tags: tagsToMerge,
          status: item.status || 'lead',
          notes: item.notes || `נוצר דרך WhatsApp Hub${groupName ? ` מקבוצת ${groupName}` : ''}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await setDoc(doc(db, contactsCollectionName, docId), newContactData);
        existingMap.set(normPhone, { id: docId, data: newContactData });
        result.created++;
      }
    }
  } catch (err: any) {
    result.errors.push(err.message || 'שגיאה בסנכרון ל-CRM');
  }

  return result;
}
