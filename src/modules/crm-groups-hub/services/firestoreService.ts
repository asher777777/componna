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
  CommunityChatMessage,
  CommunityVideoCallRoom,
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
    chatMessages: custom?.chatMessages || DEFAULT_COLLECTIONS.chatMessages,
    videoRooms: custom?.videoRooms || DEFAULT_COLLECTIONS.videoRooms,
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

  // Zero mock data: return real counts directly
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

export async function bulkDeleteContactsRecord(
  db: Firestore,
  contactIds: string[],
  customCollections?: CrmGroupsCollectionsConfig
): Promise<void> {
  const colls = getCollNames(customCollections);
  let batch = writeBatch(db);
  let opCount = 0;

  for (const cid of contactIds) {
    const contactRef = doc(db, colls.contacts, cid);
    batch.update(contactRef, {
      status: 'trashed',
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

export async function addCommunityInteractionRecord(
  db: Firestore | null,
  interaction: Omit<CommunityInteraction, 'id'>,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<string> {
  const colls = getCollNames(customCollections);
  const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  if (!db) return id;

  try {
    const ref = doc(db, colls.interactions, id);
    await setDoc(ref, {
      id,
      ...interaction,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not save interaction:', err);
  }
  return id;
}

// ==========================================
// Community Internal Chat & Video Services
// ==========================================

export async function fetchCommunityChatMessages(
  db: Firestore | null,
  communityId: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<CommunityChatMessage[]> {
  const colls = getCollNames(customCollections);
  if (!db) {
    return MOCK_CHAT_MESSAGES.filter((m) => m.communityId === communityId || m.communityName === communityId);
  }

  try {
    const q = query(
      collection(db, colls.chatMessages),
      where('communityId', '==', communityId)
    );
    const snap = await getDocs(q);
    const messages: CommunityChatMessage[] = [];
    snap.forEach((d) => {
      messages.push({ id: d.id, ...d.data() } as CommunityChatMessage);
    });

    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return messages.length > 0
      ? messages
      : MOCK_CHAT_MESSAGES.filter((m) => m.communityId === communityId || m.communityName === communityId);
  } catch (err) {
    console.warn('Could not fetch community chat messages:', err);
    return MOCK_CHAT_MESSAGES.filter((m) => m.communityId === communityId || m.communityName === communityId);
  }
}

export async function sendCommunityChatMessage(
  db: Firestore | null,
  message: Omit<CommunityChatMessage, 'id' | 'createdAt'>,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<CommunityChatMessage> {
  const colls = getCollNames(customCollections);
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const createdAt = new Date().toISOString();

  const fullMessage: CommunityChatMessage = {
    id,
    ...message,
    createdAt,
  };

  if (db) {
    try {
      const ref = doc(db, colls.chatMessages, id);
      await setDoc(ref, fullMessage);
    } catch (err) {
      console.warn('Could not persist chat message to Firestore:', err);
    }
  }

  return fullMessage;
}

export async function createOrGetCommunityVideoRoom(
  db: Firestore | null,
  community: SmartGroup,
  hostName: string,
  customCollections?: CrmGroupsCollectionsConfig
): Promise<CommunityVideoCallRoom> {
  const colls = getCollNames(customCollections);
  const roomId = `room_${community.id || 'comm'}_${community.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const cleanRoomSlug = `kosun_${community.id || 'comm'}_${Math.abs(
    community.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  )}`;
  const jitsiUrl = `https://meet.jit.si/${cleanRoomSlug}#config.startWithAudioMuted=false&config.prejoinPageEnabled=false`;

  const roomData: CommunityVideoCallRoom = {
    id: roomId,
    communityId: community.id,
    communityName: community.name,
    roomName: `חדר וידאו - ${community.name}`,
    hostName: hostName || community.leaderName || 'מנהל הקהילה',
    isActive: true,
    participantsCount: 1,
    jitsiUrl,
    createdAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const ref = doc(db, colls.videoRooms, roomId);
      await setDoc(ref, roomData, { merge: true });
    } catch (err) {
      console.warn('Could not save video room to Firestore:', err);
    }
  }

  return roomData;
}

export const MOCK_CHAT_MESSAGES: CommunityChatMessage[] = [
  {
    id: 'msg_demo_1',
    communityId: 'comm_ambassadors',
    communityName: 'קהילת שגרירים',
    senderId: 'cnt_4',
    senderName: 'אביגיל שפירא',
    senderPhone: '0584567890',
    content: 'שלום לכל חברי קהילת השגרירים! שמחה לפתוח את הצ\'אט הפנימי שלנו. כאן נוכל להחליף רעיונות, לשתף מסמכים ולתאם פגישות.',
    type: 'text',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'msg_demo_2',
    communityId: 'comm_ambassadors',
    communityName: 'קהילת שגרירים',
    senderId: 'cnt_1',
    senderName: 'יוסי כהן',
    senderPhone: '0501234567',
    content: 'מעולה! מצרף את מצגת היעדים לחודש הקרוב לעיונכם:',
    type: 'file',
    fileName: 'מצגת_יעדי_גיוס_2026.pdf',
    fileSize: '2.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg_demo_3',
    communityId: 'comm_ambassadors',
    communityName: 'קהילת שגרירים',
    senderId: 'cnt_8',
    senderName: 'דניאל מזרחי',
    senderPhone: '0548901234',
    content: 'עברתי על המצגת, נראה מצוין. האם נקבע שיחת וידאו קבוצתית ביום חמישי לסגירת פרטים?',
    type: 'text',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg_demo_4',
    communityId: 'comm_north_volunteers',
    communityName: 'מתנדבי צפון',
    senderId: 'cnt_5',
    senderName: 'רועי ברק',
    senderPhone: '0505678901',
    content: 'שלום לצוות צפון! החלוקה מחר יוצאת בשעה 09:00 ממרכז כרמיאל. אנא אשרו הגעה.',
    type: 'text',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'msg_demo_5',
    communityId: 'comm_gold_vip',
    communityName: 'תורמי זהב VIP',
    senderId: 'cnt_2',
    senderName: 'מרים לוי',
    senderPhone: '0522345678',
    content: 'ברוכים הבאים לפורום תורמי VIP. שמחים לעדכן שהפרויקט השנתי מתקדם כמתוכנן.',
    type: 'text',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const MOCK_COMMUNITIES: SmartGroup[] = [
  {
    id: 'comm_subscriptions',
    name: 'לקוחות מינויים ורכיבים',
    color: '#10b981',
    description: 'קהילת משתמשים בעלי מינויים פעילים ורכיבי מערכת',
    type: 'manual',
    isCommunity: true,
    category: 'community',
    leaderName: 'מנהל מערכת',
    targetGoal: 100000,
    currentRaised: 0,
    engagementScore: 100,
    pageSlug: 'subscriptions-community',
    pageUrl: '/subscriptions-community',
    vision: 'ריכוז משתמשי הפרימיום לחשיפת רכיבים חדשים ועדכונים קריטיים.',
    purpose: 'קשר ישיר עם רוכשי החבילות לשדרוג חווית המשתמש ומתן תמיכה אקסקלוסיבית.',
    gallery: [],
    feedPosts: [],
    count: 0,
  },
  {
    id: 'comm_ambassadors',
    name: 'קהילת שגרירים',
    color: '#6366f1',
    description: 'רשת השגרירים המובילים לקידום הפעילות וגיוס חברים',
    type: 'manual',
    isCommunity: true,
    category: 'community',
    leaderName: 'אביגיל שפירא',
    targetGoal: 75000,
    currentRaised: 52400,
    engagementScore: 94,
    pageSlug: 'ambassadors-hq',
    pageUrl: '/ambassadors-hq',
    vision: 'בניית רשת חברתית תומכת המחברת בין שגרירים מובילים לפעילות חסד ארצית.',
    purpose: 'הרחבת מעגלי ההתנדבות, גיוס תרומות ממוקד וייצוג הפרויקט במוקדי השפעה.',
    gallery: [
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    ],
    feedPosts: [
      {
        id: 'post_1',
        authorName: 'אביגיל שפירא',
        content: 'שלום לכל השגרירים! חצינו את רף ה-50,000 ₪ לקמפיין השנתי בזכות המאמץ המדהים שלכם.',
        type: 'announcement',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        likesCount: 14,
      },
      {
        id: 'post_2',
        authorName: 'צוות הנהלה',
        content: 'מפגש שגרירים מחוז מרכז יתקיים ביום שלישי הבא ב-19:30. לינק לזום נשלח בוואטסאפ.',
        type: 'post',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        likesCount: 9,
      },
    ],
    count: 5,
  },
  {
    id: 'comm_gold_vip',
    name: 'תורמי זהב VIP',
    color: '#eab308',
    description: 'פורום תורמים מרכזיים ושותפי חזון ארוך טווח',
    type: 'manual',
    isCommunity: true,
    category: 'community',
    leaderName: 'יהונתן גולדברג',
    targetGoal: 200000,
    currentRaised: 165000,
    engagementScore: 88,
    pageSlug: 'gold-donors-vip',
    pageUrl: '/gold-donors-vip',
    vision: 'השקעה אסטרטגית בפיתוח תשתיות חינוכיות וחברתיות מתקדמות.',
    purpose: 'ליווי שוטף של פרויקטי הדגל ויצירת רשת תמיכה פיננסית איתנה.',
    gallery: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    ],
    feedPosts: [
      {
        id: 'post_3',
        authorName: 'יהונתן גולדברג',
        content: 'עדכון רבעוני: הושלמה הקמת המרכז הקהילתי החדש. תודה לכל חברי פורום הזהב!',
        type: 'video',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        likesCount: 22,
      },
    ],
    count: 4,
  },
  {
    id: 'comm_north_volunteers',
    name: 'מתנדבי צפון',
    color: '#10b981',
    description: 'חמ"ל מתנדבים פעיל בגליל, בגולן ובעמקים',
    type: 'manual',
    isCommunity: true,
    category: 'community',
    leaderName: 'רועי ברק',
    targetGoal: 40000,
    currentRaised: 31200,
    engagementScore: 91,
    pageSlug: 'north-volunteers',
    pageUrl: '/north-volunteers',
    vision: 'הגעה לכל קשיש ומשפחה מבודדת בצפון עם סיוע חם, ציוד ומזון שבועי.',
    purpose: 'חלוקת סלי מזון, שיפוץ מועדוניות והפעלת מוקד חירום שוטף.',
    gallery: [
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    ],
    feedPosts: [
      {
        id: 'post_4',
        authorName: 'רועי ברק',
        content: 'מבצע חלוקת חורף יוצא לדרך! זקוקים ל-4 רכבים נוספים ביום שישי בבוקר באזור כרמיאל.',
        type: 'announcement',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        likesCount: 18,
      },
    ],
    count: 6,
  },
  {
    id: 'smart_vip_active',
    name: 'תורמים פעילים מעל ₪1,000',
    color: '#8b5cf6',
    description: 'סגמנט אוטומטי של תורמים עם היקף תרומות כולל של 1,000 ₪ ומעלה',
    type: 'smart',
    rules: [{ field: 'total_spent', operator: 'gte', value: 1000 }],
    matchType: 'all',
    isCommunity: false,
    category: 'group',
    count: 6,
  },
  {
    id: 'smart_center_leads',
    name: 'חברי מרכז הארץ',
    color: '#06b6d4',
    description: 'אנשי קשר מאזור תל אביב, רמת גן, גבעתיים ופתח תקווה',
    type: 'smart',
    rules: [{ field: 'mh_crm_city', operator: 'contains', value: 'תל אביב' }],
    matchType: 'all',
    isCommunity: false,
    category: 'group',
    count: 4,
  },
];

export const MOCK_CONTACTS: ContactRecord[] = [
  {
    id: 'cnt_1',
    conta_name: 'יוסי כהן',
    conta_phone: '0501234567',
    email: 'yossi.cohen@example.com',
    mh_crm_city: 'תל אביב',
    company_name: 'כהן טכנולוגיות',
    job_title: 'מנכ"ל',
    total_spent: 8500,
    campaign_amount: 5000,
    lead_source: 'וואטסאפ',
    status: 'פעיל',
    tags: ['קהילת שגרירים', 'תורמי זהב VIP', 'VIP'],
    community: 'קהילת שגרירים',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'cnt_2',
    conta_name: 'מרים לוי',
    conta_phone: '0522345678',
    email: 'miriam.levi@example.com',
    mh_crm_city: 'ירושלים',
    company_name: 'קרן תקווה',
    job_title: 'מנהלת קשרי חוץ',
    total_spent: 12400,
    campaign_amount: 8000,
    lead_source: 'כנס שנתי',
    status: 'פעיל',
    tags: ['תורמי זהב VIP'],
    community: 'תורמי זהב VIP',
    createdAt: '2026-01-12T11:30:00.000Z',
  },
  {
    id: 'cnt_3',
    conta_name: 'דוד אברהם',
    conta_phone: '0543456789',
    email: 'david.avraham@example.com',
    mh_crm_city: 'חיפה',
    company_name: 'אברהם פתרונות',
    job_title: 'סמנכ"ל תפעול',
    total_spent: 450,
    campaign_amount: 300,
    lead_source: 'דף נחיתה',
    status: 'פעיל',
    tags: ['מתנדבי צפון'],
    community: 'מתנדבי צפון',
    createdAt: '2026-02-01T09:15:00.000Z',
  },
  {
    id: 'cnt_4',
    conta_name: 'אביגיל שפירא',
    conta_phone: '0584567890',
    email: 'avigail.shapira@example.com',
    mh_crm_city: 'תל אביב',
    company_name: 'שגרירי חסד',
    job_title: 'מובילת קהילה',
    total_spent: 3200,
    campaign_amount: 2500,
    lead_source: 'שגריר',
    status: 'פעיל',
    tags: ['קהילת שגרירים'],
    community: 'קהילת שגרירים',
    createdAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'cnt_5',
    conta_name: 'רועי ברק',
    conta_phone: '0505678901',
    email: 'roei.barak@example.com',
    mh_crm_city: 'כרמיאל',
    company_name: 'עמותת הצפון',
    job_title: 'רכז מתנדבים',
    total_spent: 200,
    campaign_amount: 0,
    lead_source: 'וואטסאפ',
    status: 'פעיל',
    tags: ['מתנדבי צפון'],
    community: 'מתנדבי צפון',
    createdAt: '2026-02-10T14:20:00.000Z',
  },
  {
    id: 'cnt_6',
    conta_name: 'שרה גולד',
    conta_phone: '0526789012',
    email: 'sara.gold@example.com',
    mh_crm_city: 'רעננה',
    company_name: 'השקעות שרה',
    job_title: 'משקיעה',
    total_spent: 25000,
    campaign_amount: 20000,
    lead_source: 'המלצה',
    status: 'פעיל',
    tags: ['תורמי זהב VIP', 'קהילת שגרירים'],
    community: 'תורמי זהב VIP',
    createdAt: '2026-01-18T16:00:00.000Z',
  },
  {
    id: 'cnt_7',
    conta_name: 'יונתן ישראלי',
    conta_phone: '0537890123',
    email: 'yonatan.israeli@example.com',
    mh_crm_city: 'קרית שמונה',
    company_name: 'גליל לוגיסטיקה',
    job_title: 'נהג חלוקה',
    total_spent: 150,
    campaign_amount: 50,
    lead_source: 'פייסבוק',
    status: 'פעיל',
    tags: ['מתנדבי צפון'],
    community: 'מתנדבי צפון',
    createdAt: '2026-02-15T12:00:00.000Z',
  },
  {
    id: 'cnt_8',
    conta_name: 'דניאל מזרחי',
    conta_phone: '0548901234',
    email: 'daniel.mizrahi@example.com',
    mh_crm_city: 'ראשון לציון',
    company_name: 'מזרחי פרויקטים',
    job_title: 'יועץ',
    total_spent: 1800,
    campaign_amount: 1200,
    lead_source: 'טופס חכם',
    status: 'פעיל',
    tags: ['קהילת שגרירים'],
    community: 'קהילת שגרירים',
    createdAt: '2026-02-20T17:30:00.000Z',
  },
  {
    id: 'cnt_9',
    conta_name: 'מיכל פרידמן',
    conta_phone: '0589012345',
    email: 'michal.friedman@example.com',
    mh_crm_city: 'טבריה',
    company_name: 'חינוך גליל',
    job_title: 'מורָה',
    total_spent: 100,
    campaign_amount: 0,
    lead_source: 'וואטסאפ',
    status: 'פעיל',
    tags: ['מתנדבי צפון'],
    community: 'מתנדבי צפון',
    createdAt: '2026-02-22T08:45:00.000Z',
  },
  {
    id: 'cnt_10',
    conta_name: 'אליהו קליין',
    conta_phone: '0501122334',
    email: 'eliyahu.klein@example.com',
    mh_crm_city: 'בני ברק',
    company_name: 'קליין הפקות',
    job_title: 'מפיק',
    total_spent: 4200,
    campaign_amount: 3500,
    lead_source: 'העברה בנקאית',
    status: 'פעיל',
    tags: ['תורמי זהב VIP'],
    community: 'תורמי זהב VIP',
    createdAt: '2026-01-25T13:10:00.000Z',
  },
  {
    id: 'cnt_11',
    conta_name: 'נועה אטיאס',
    conta_phone: '0522233445',
    email: 'noa.atias@example.com',
    mh_crm_city: 'תל אביב',
    company_name: 'סטודיו אטיאס',
    job_title: 'מעצבת',
    total_spent: 600,
    campaign_amount: 500,
    lead_source: 'אינסטגרם',
    status: 'פעיל',
    tags: ['קהילת שגרירים'],
    community: 'קהילת שגרירים',
    createdAt: '2026-02-25T15:20:00.000Z',
  },
  {
    id: 'cnt_12',
    conta_name: 'אורי שוורץ',
    conta_phone: '0543344556',
    email: 'uri.schwartz@example.com',
    mh_crm_city: 'נהריה',
    company_name: 'שוורץ בנייה',
    job_title: 'קבלן',
    total_spent: 800,
    campaign_amount: 600,
    lead_source: 'קבוצת וואטסאפ',
    status: 'פעיל',
    tags: ['מתנדבי צפון'],
    community: 'מתנדבי צפון',
    createdAt: '2026-02-27T11:00:00.000Z',
  },
  {
    id: 'cnt_13',
    conta_name: 'יעל דגן',
    conta_phone: '0584455667',
    email: 'yael.dagan@example.com',
    mh_crm_city: 'רמת גן',
    company_name: 'דגן תקשורת',
    job_title: 'אשת יחסי ציבור',
    total_spent: 950,
    campaign_amount: 950,
    lead_source: 'לינקדין',
    status: 'פעיל',
    tags: [],
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'cnt_14',
    conta_name: 'אלון חסון',
    conta_phone: '0505566778',
    email: 'alon.hasson@example.com',
    mh_crm_city: 'פתח תקווה',
    company_name: 'חסון השקעות',
    job_title: 'אנליסט',
    total_spent: 0,
    campaign_amount: 0,
    lead_source: 'טופס התעניינות',
    status: 'פעיל',
    tags: [],
    createdAt: '2026-03-02T10:30:00.000Z',
  },
  {
    id: 'cnt_15',
    conta_name: 'רותי נאור',
    conta_phone: '0526677889',
    email: 'ruti.naor@example.com',
    mh_crm_city: 'צפת',
    company_name: 'נאור קולינריה',
    job_title: 'שפית',
    total_spent: 350,
    campaign_amount: 250,
    lead_source: 'וואטסאפ',
    status: 'פעיל',
    tags: ['מתנדבי צפון'],
    community: 'מתנדבי צפון',
    createdAt: '2026-03-03T14:00:00.000Z',
  },
];
