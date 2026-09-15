import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ContactRecord,
  CommunityInteraction,
  SelectableCampaignOrPage,
  SmartGroup,
  GroupRule,
  CrmGroupsCollectionsConfig,
} from '../types';
import { DEFAULT_COLLECTIONS, PRESET_COLORS } from '../config';
import { isContactInGroup } from './groupsUtils';

function getCollNames(custom?: CrmGroupsCollectionsConfig) {
  return {
    groups: custom?.groups || DEFAULT_COLLECTIONS.groups,
    contacts: custom?.contacts || DEFAULT_COLLECTIONS.contacts,
    pages: custom?.pages || DEFAULT_COLLECTIONS.pages,
    campaigns: custom?.campaigns || DEFAULT_COLLECTIONS.campaigns,
    interactions: custom?.interactions || DEFAULT_COLLECTIONS.interactions,
  };
}

export async function fetchGroupsAndContactsData(
  db: Firestore,
  ownerId: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<{
  groups: SmartGroup[];
  contacts: ContactRecord[];
  totalContacts: number;
  untaggedCount: number;
  availableCities: string[];
}> {
  const colls = getCollNames(customCollections);

  // 1. Fetch contacts
  const contactsQuery = ownerId
    ? query(collection(db, colls.contacts), where('ownerId', '==', ownerId))
    : query(collection(db, colls.contacts));

  const contactsSnap = await getDocs(contactsQuery);
  const contacts: ContactRecord[] = [];
  const tagsMap = new Map<string, number>();
  const citiesSet = new Set<string>();
  const isNumericTag = (t: string) => /^\d+$/.test(t.trim());

  contactsSnap.forEach((d) => {
    const data = d.data();
    if (data.status === 'trashed') return;

    const tags: string[] = Array.isArray(data.tags)
      ? data.tags.filter((t: any) => typeof t === 'string' && t.trim() !== '' && !isNumericTag(t))
      : [];

    if (data.mh_crm_city && typeof data.mh_crm_city === 'string' && data.mh_crm_city.trim()) {
      citiesSet.add(data.mh_crm_city.trim());
    }

    const contactItem: ContactRecord = {
      id: d.id,
      ...data,
      tags,
    };

    contacts.push(contactItem);

    tags.forEach((tag) => {
      const cleanTag = tag.trim();
      if (!isNumericTag(cleanTag)) {
        tagsMap.set(cleanTag, (tagsMap.get(cleanTag) || 0) + 1);
      }
    });
  });

  // 2. Fetch saved groups from crm_groups collection
  const groupsQuery = ownerId
    ? query(collection(db, colls.groups), where('ownerId', '==', ownerId))
    : query(collection(db, colls.groups));

  const groupsSnap = await getDocs(groupsQuery);
  const savedGroups = new Map<string, SmartGroup>();

  groupsSnap.forEach((gDoc) => {
    const gData = gDoc.data() as SmartGroup;
    const gName = (gData.name || '').trim();

    if (gName && !isNumericTag(gName)) {
      const isCommunity = Boolean(gData.isCommunity || gData.pageSlug || gData.pageUrl || gData.pageId);
      savedGroups.set(gName, {
        ...gData,
        id: gDoc.id,
        isCommunity,
        category: isCommunity ? 'community' : 'group',
      });
    }
  });

  // 3. Auto-discover tags from contacts that are not yet saved in crm_groups
  let colorIdx = 0;
  tagsMap.forEach((_cnt, tagName) => {
    const cleanTag = tagName.trim();
    if (!savedGroups.has(cleanTag) && cleanTag && !isNumericTag(cleanTag)) {
      savedGroups.set(cleanTag, {
        id: `tag_${encodeURIComponent(cleanTag)}`,
        name: cleanTag,
        color: PRESET_COLORS[colorIdx % PRESET_COLORS.length],
        description: 'קבוצת תגית אוטומטית',
        type: 'manual',
        isCommunity: false,
        category: 'group',
        rules: [],
        matchType: 'all',
        ownerId,
      });
      colorIdx++;
    }
  });

  // 4. Calculate dynamic member count for all groups and communities
  const groups: SmartGroup[] = Array.from(savedGroups.values()).map((g) => {
    const count = contacts.filter((c) => isContactInGroup(c, g)).length;
    return {
      ...g,
      count,
    };
  });

  // Sort groups: communities first, then by count descending
  groups.sort((a, b) => {
    if (a.isCommunity && !b.isCommunity) return -1;
    if (!a.isCommunity && b.isCommunity) return 1;
    return (b.count || 0) - (a.count || 0);
  });

  // Calculate untagged count
  const untaggedCount = contacts.filter((c) => {
    return !groups.some((g) => isContactInGroup(c, g));
  }).length;

  return {
    groups,
    contacts,
    totalContacts: contacts.length,
    untaggedCount,
    availableCities: Array.from(citiesSet).sort(),
  };
}

export async function fetchSelectableCampaignsList(
  db: Firestore,
  ownerId: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<SelectableCampaignOrPage[]> {
  const colls = getCollNames(customCollections);
  const items: SelectableCampaignOrPage[] = [
    {
      id: 'home',
      title: '🏠 דף הבית הראשי',
      category: 'עמוד ראשי',
      type: 'home',
      url: '/',
    },
  ];

  try {
    const campQuery = ownerId
      ? query(collection(db, colls.campaigns), where('ownerId', '==', ownerId))
      : query(collection(db, colls.campaigns));

    const campSnap = await getDocs(campQuery);
    campSnap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        title: `🎯 ${data.title || data.name || 'קמפיין'}`,
        category: 'קמפיינים ותרומות',
        type: 'campaign',
        url: `/c/${d.id}`,
        target: Number(data.target || data.goal || 0),
        currentAmount: Number(data.currentAmount || data.raised || 0),
        coverImage: data.coverImage || data.image || '',
      });
    });

    const pagesSnap = await getDocs(collection(db, colls.pages));
    pagesSnap.forEach((d) => {
      if (d.id === 'home' || items.some((it) => it.id === d.id)) return;
      const data = d.data();
      items.push({
        id: d.id,
        title: `🌐 ${data.title || d.id}`,
        category: 'עמודי אתר וקהילה',
        type: 'page',
        url: `/${d.id}`,
      });
    });
  } catch (err) {
    console.warn('Could not fetch selectable campaigns:', err);
  }

  return items;
}

export async function saveGroupOrCommunityRecord(
  db: Firestore,
  ownerId: string,
  groupData: Partial<SmartGroup> & { previousName?: string; createPage?: boolean },
  customCollections?: CrmGroupsCollectionsConfig
): Promise<{ success: boolean; id: string; pageUrl?: string }> {
  const colls = getCollNames(customCollections);

  if (!groupData.name || !groupData.name.trim()) {
    throw new Error('שם קבוצה או קהילה הוא שדה חובה');
  }

  const cleanName = groupData.name.trim();
  const previousName = groupData.previousName ? groupData.previousName.trim() : '';
  const docId = groupData.id && !groupData.id.startsWith('new_') && !groupData.id.startsWith('tag_')
    ? groupData.id
    : doc(collection(db, colls.groups)).id;

  const shouldCreatePage = Boolean(groupData.createPage || groupData.isCommunity);
  const targetGoalNum = isNaN(Number(groupData.targetGoal)) ? 5000 : Math.max(0, Number(groupData.targetGoal));

  let pageSlug = '';
  let pageUrl = '';

  if (shouldCreatePage) {
    let rawSlug = (groupData.pageSlug || '').trim().toLowerCase();
    if (!rawSlug || rawSlug === '/' || rawSlug.length < 2) {
      const cleanIdPart = docId.replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 8) || Math.random().toString(36).substring(2, 8);
      rawSlug = `comm-${cleanIdPart}`;
    }
    pageSlug = rawSlug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    pageUrl = `/${pageSlug}`;

    // Auto-create/update page in 'pages' collection
    try {
      const pageRef = doc(db, colls.pages, pageSlug);
      const pageSnap = await getDoc(pageRef);

      const cleanGallery = (groupData.gallery || []).filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

      const pagePayload: any = {
        id: pageSlug,
        ownerId,
        title: cleanName,
        slug: pageSlug,
        collectionName: colls.pages,
        updatedAt: new Date().toISOString(),
        seo: {
          title: cleanName,
          description: (groupData.vision || groupData.purpose || groupData.description || `קהילת ${cleanName}`).trim(),
        },
        richContent: {
          visible: true,
          anchorId: 'richContent',
          heading: cleanName,
          title: cleanName,
          body: groupData.vision
            ? `${groupData.vision}${groupData.purpose ? `\n\nמטרות ויעדים:\n${groupData.purpose}` : ''}`
            : (groupData.purpose || groupData.description || `ברוכים הבאים לעמוד קהילת ${cleanName}`),
          layout: 'center',
        },
        campaignHeader: {
          visible: true,
          anchorId: 'campaignHeader',
          campaignId: groupData.mainCampaignId || 'home',
          ambassadorSlug: pageSlug,
          ambassadorName: cleanName,
          targetGoal: targetGoalNum,
        },
      };

      if (!pageSnap.exists()) {
        pagePayload.createdAt = new Date().toISOString();
        pagePayload.sectionOrder = ['videoGallery', 'richContent', 'campaignTiers', 'campaignHeader', 'campaignDonors'];
        pagePayload.videoGallery = {
          visible: true,
          anchorId: 'videoGallery',
          images: cleanGallery,
          videoUrl: '',
          videoType: 'youtube',
        };
      }

      await setDoc(pageRef, pagePayload, { merge: true });
    } catch (pageErr) {
      console.warn('Could not auto-create/update community page document:', pageErr);
    }
  }

  // If previousName changed, rename tags across all contacts
  if (previousName && previousName !== cleanName) {
    try {
      const contactsQuery = query(
        collection(db, colls.contacts),
        where('tags', 'array-contains', previousName)
      );
      const snap = await getDocs(contactsQuery);
      if (!snap.empty) {
        let batch = writeBatch(db);
        let opCount = 0;

        for (const contactDoc of snap.docs) {
          const currentTags = contactDoc.data().tags || [];
          const newTags = currentTags.map((t: string) => (t === previousName ? cleanName : t));
          batch.update(contactDoc.ref, {
            tags: newTags,
            updatedAt: new Date().toISOString(),
          });
          opCount++;

          if (opCount >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
          }
        }

        if (opCount > 0) {
          await batch.commit();
        }
      }
    } catch (renameErr) {
      console.warn('Could not update contact tags during rename:', renameErr);
    }
  }

  const cleanRules: GroupRule[] = (groupData.rules || []).map((r) => ({
    field: r.field || 'mh_crm_city',
    operator: r.operator || 'eq',
    value: r.value !== undefined ? r.value : '',
  }));

  const dataToSave: SmartGroup = {
    id: docId,
    name: cleanName,
    leaderName: (groupData.leaderName || '').trim() || cleanName,
    targetGoal: targetGoalNum,
    color: groupData.color || '#4f46e5',
    description: (groupData.description || '').trim(),
    type: groupData.type === 'smart' ? 'smart' : 'manual',
    rules: groupData.type === 'smart' ? cleanRules : [],
    matchType: groupData.matchType === 'any' ? 'any' : 'all',
    isCommunity: shouldCreatePage,
    category: shouldCreatePage ? 'community' : 'group',
    ownerId,
    gallery: groupData.gallery || [],
    vision: (groupData.vision || '').trim(),
    purpose: (groupData.purpose || '').trim(),
    pageId: shouldCreatePage ? pageSlug : '',
    pageSlug: shouldCreatePage ? pageSlug : '',
    pageUrl: shouldCreatePage ? pageUrl : '',
    mainCampaignId: shouldCreatePage ? (groupData.mainCampaignId || 'home') : '',
    campaignTitle: shouldCreatePage ? (groupData.campaignTitle || '').trim() : '',
    updatedAt: new Date().toISOString(),
  };

  const groupRef = doc(db, colls.groups, docId);
  await setDoc(groupRef, dataToSave, { merge: true });

  return { success: true, id: docId, pageUrl: shouldCreatePage ? pageUrl : undefined };
}

export async function deleteCommunityPageRecord(
  db: Firestore,
  groupId: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<void> {
  const colls = getCollNames(customCollections);
  const groupRef = doc(db, colls.groups, groupId);
  const snap = await getDoc(groupRef);

  if (snap.exists()) {
    const data = snap.data() as SmartGroup;
    const pageSlug = data.pageSlug || data.pageId;
    if (pageSlug) {
      await deleteDoc(doc(db, colls.pages, pageSlug)).catch(() => {});
    }

    await updateDoc(groupRef, {
      pageId: '',
      pageSlug: '',
      pageUrl: '',
      mainCampaignId: '',
      campaignTitle: '',
      isCommunity: false,
      category: 'group',
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function deleteGroupRecord(
  db: Firestore,
  group: SmartGroup,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<void> {
  const colls = getCollNames(customCollections);

  if (group.pageSlug || group.pageId) {
    await deleteDoc(doc(db, colls.pages, group.pageSlug || group.pageId || '')).catch(() => {});
  }

  // Delete group doc
  if (group.id && !group.id.startsWith('tag_')) {
    await deleteDoc(doc(db, colls.groups, group.id)).catch(() => {});
  }

  // Remove tag from contacts in batches
  try {
    const snap = await getDocs(
      query(collection(db, colls.contacts), where('tags', 'array-contains', group.name))
    );

    if (!snap.empty) {
      let batch = writeBatch(db);
      let opCount = 0;

      for (const contactDoc of snap.docs) {
        const currentTags: string[] = contactDoc.data().tags || [];
        const newTags = currentTags.filter((t) => t !== group.name);
        batch.update(contactDoc.ref, { tags: newTags, updatedAt: new Date().toISOString() });
        opCount++;

        if (opCount >= 450) {
          await batch.commit();
          batch = writeBatch(db);
          opCount = 0;
        }
      }

      if (opCount > 0) {
        await batch.commit();
      }
    }
  } catch (err) {
    console.warn('Could not unassign group tag from contacts:', err);
  }
}

export async function bulkAssignGroupToContacts(
  db: Firestore,
  contactIds: string[],
  groupName: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<void> {
  const colls = getCollNames(customCollections);
  let batch = writeBatch(db);
  let opCount = 0;

  for (const cid of contactIds) {
    const contactRef = doc(db, colls.contacts, cid);
    const snap = await getDoc(contactRef);
    if (snap.exists()) {
      const currentTags: string[] = snap.data().tags || [];
      if (!currentTags.includes(groupName)) {
        batch.update(contactRef, {
          tags: [...currentTags, groupName],
          updatedAt: new Date().toISOString(),
        });
        opCount++;
      }
    }

    if (opCount >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
}

export async function moveContactsBetweenGroups(
  db: Firestore,
  contactIds: string[],
  sourceGroupName: string,
  targetGroupName: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<void> {
  const colls = getCollNames(customCollections);
  let batch = writeBatch(db);
  let opCount = 0;

  for (const cid of contactIds) {
    const contactRef = doc(db, colls.contacts, cid);
    const snap = await getDoc(contactRef);
    if (snap.exists()) {
      let currentTags: string[] = snap.data().tags || [];
      if (sourceGroupName) {
        currentTags = currentTags.filter((t) => t !== sourceGroupName);
      }
      if (!currentTags.includes(targetGroupName)) {
        currentTags.push(targetGroupName);
      }
      batch.update(contactRef, {
        tags: currentTags,
        updatedAt: new Date().toISOString(),
      });
      opCount++;
    }

    if (opCount >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
}

export async function toggleContactTag(
  db: Firestore,
  contactId: string,
  tagName: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<string[]> {
  const colls = getCollNames(customCollections);
  const contactRef = doc(db, colls.contacts, contactId);
  const snap = await getDoc(contactRef);

  if (!snap.exists()) throw new Error('Contact not found');

  const currentTags: string[] = snap.data().tags || [];
  const hasTag = currentTags.includes(tagName);
  const newTags = hasTag ? currentTags.filter((t) => t !== tagName) : [...currentTags, tagName];

  await updateDoc(contactRef, {
    tags: newTags,
    updatedAt: new Date().toISOString(),
  });

  return newTags;
}

export async function fetchCommunityInteractionsList(
  db: Firestore,
  groupName: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<CommunityInteraction[]> {
  const colls = getCollNames(customCollections);
  const interactions: CommunityInteraction[] = [];

  try {
    const q = query(
      collection(db, colls.interactions),
      where('groupName', '==', groupName)
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      interactions.push({ id: d.id, ...d.data() } as CommunityInteraction);
    });
  } catch (err) {
    console.warn('Could not fetch interactions:', err);
  }

  return interactions;
}
