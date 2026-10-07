/**
 * Firestore Data Service for Ambassador Campaigns Hub
 * Supports multi-tenant scoping and zero-dependency mock mode for standalone testing.
 */

import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import {
  Campaign,
  Ambassador,
  Donation,
  CreateAmbassadorPayload,
  RecordPendingDonationPayload,
  CompleteDonationPayload,
} from '../types';
import { DEFAULT_COLLECTIONS, DEFAULT_TIERS, DEFAULT_DRAWER_CONFIG } from '../config';
import { eventBus } from '../../../core/bridge/EventBus';

// Mock initial data for standalone development
export const MOCK_CAMPAIGN: Campaign = {
  id: 'campaign-golden-2026',
  title: 'קמפיין גיוס לבניית בית הקהילה והשגרירים 2026',
  subtitle: 'יחד בונים עתיד ומחברים קהילות ברחבי הארץ',
  description: 'הצטרפו לקמפיין הגיוס המרכזי של השנה. כל תרומה מכפילה את כוחנו ומאפשרת פעילות קהילתית ענפה.',
  targetGoal: 500000,
  totalRaised: 318450,
  donorCount: 428,
  currency: 'ILS',
  status: 'active',
  campaignTiers: {
    donationType: 'both',
    tiers: DEFAULT_TIERS,
  },
  drawerConfig: DEFAULT_DRAWER_CONFIG,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_AMBASSADORS: Ambassador[] = [
  {
    id: 'amb-1',
    campaignId: 'campaign-golden-2026',
    name: 'קהילת לב אחד - ירושלים',
    leaderName: 'הרב ישראל כהן',
    slug: 'lev-ehad-jerusalem',
    targetGoal: 50000,
    totalRaised: 38500,
    donorCount: 46,
    message: 'מטרתנו לחבר משפחות צעירות ולבנות מרכז תורני וקהילתי שוקק חיים.',
    vision: 'להקים מוקד קהילתי קבוע בירושלים.',
    gallery: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop'],
    phone: '052-1234567',
    email: 'israel@levehad.org',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'amb-2',
    campaignId: 'campaign-golden-2026',
    name: 'קהילת שירת הים - תל אביב',
    leaderName: 'מיכאל אלוני',
    slug: 'shirat-hayam-tlv',
    targetGoal: 75000,
    totalRaised: 62400,
    donorCount: 78,
    message: 'פעילות לנוער וסדנאות יצירה וחיבור בלב המרכז.',
    vision: 'מרחב פתוח לנוער בסיכון.',
    gallery: ['https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop'],
    phone: '054-9876543',
    email: 'michael@shirat-hayam.org',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'amb-3',
    campaignId: 'campaign-golden-2026',
    name: 'גרעין נתיבות מנצחת',
    leaderName: 'שרה לוי',
    slug: 'netivot-menatzahat',
    targetGoal: 30000,
    totalRaised: 22100,
    donorCount: 31,
    message: 'תמיכה במשפחות נזקקות וחלוקת סלי מזון שבועיים.',
    gallery: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop'],
    phone: '050-4567890',
    email: 'sara@netivot.org',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const MOCK_DONATIONS: Donation[] = [
  {
    id: 'don-1',
    campaignId: 'campaign-golden-2026',
    donorName: 'דוד ורחל לוי',
    amount: 1800,
    isRecurring: false,
    tier: 'פטרון הקהילה',
    dedication: 'לרפואת כל חולי עמו ישראל',
    isAnonymous: false,
    ambassadorId: 'amb-1',
    ambassadorName: 'קהילת לב אחד - ירושלים',
    phone: '050-1112233',
    paymentStatus: 'completed',
    paymentMethod: 'credit_card',
    receiptUrl: 'https://comona.io/receipt/REC-101',
    completedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'don-2',
    campaignId: 'campaign-golden-2026',
    donorName: 'יוסי כהן',
    amount: 360,
    isRecurring: true,
    monthlyAmount: 360,
    recurringMonths: 12,
    tier: 'תומך פעיל',
    isAnonymous: false,
    ambassadorId: 'amb-2',
    ambassadorName: 'קהילת שירת הים - תל אביב',
    phone: '052-3334455',
    paymentStatus: 'completed',
    paymentMethod: 'bit',
    receiptUrl: 'https://comona.io/receipt/REC-102',
    completedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: 'don-3',
    campaignId: 'campaign-golden-2026',
    donorName: 'תורם אנונימי',
    amount: 770,
    isRecurring: false,
    tier: 'ידיד נאמן',
    dedication: 'להצלחה ולברכה',
    isAnonymous: true,
    ambassadorId: 'amb-1',
    ambassadorName: 'קהילת לב אחד - ירושלים',
    phone: '054-7778899',
    paymentStatus: 'completed',
    paymentMethod: 'credit_card',
    completedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

/**
 * Fetch campaign data
 */
export async function fetchCampaignRecord(
  db: Firestore | null,
  collectionPath: string,
  campaignId: string
): Promise<Campaign | null> {
  if (!db) {
    return null;
  }
  try {
    const docRef = doc(db, collectionPath, campaignId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Campaign;
    }
    return null;
  } catch (error) {
    console.error('[CampaignService] Error fetching campaign:', error);
    return null;
  }
}

/**
 * Fetch all available campaigns
 */
export async function fetchAllCampaignsRecord(
  db: Firestore | null,
  collectionPath: string
): Promise<Campaign[]> {
  if (!db) {
    return [];
  }
  try {
    const snap = await getDocs(collection(db, collectionPath));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign));
    }
    return [];
  } catch (error) {
    console.error('[CampaignService] Error fetching all campaigns:', error);
    return [];
  }
}

/**
 * Create a new campaign with HomeEditor design presets
 */
export async function createCampaignRecord(
  db: Firestore | null,
  collectionPath: string,
  payload: any
): Promise<{ success: boolean; campaign?: Campaign; error?: string }> {
  try {
    const campaignId = payload.slug || `camp-${Date.now()}`;
    const newCampaign: Campaign = {
      id: campaignId,
      title: payload.title.trim(),
      subtitle: payload.subtitle || '',
      description: payload.description || '',
      targetGoal: Number(payload.targetGoal || 100000),
      totalRaised: 0,
      donorCount: 0,
      currency: payload.currency || 'ILS',
      status: 'active',
      slug: payload.slug || campaignId,
      featuredImageUrl: payload.featuredImageUrl || '',
      campaignTiers: {
        donationType: payload.donationType || 'both',
        tiers: payload.tiers && payload.tiers.length > 0 ? payload.tiers : DEFAULT_TIERS,
      },
      drawerConfig: payload.drawerConfig || DEFAULT_DRAWER_CONFIG,
      videoGallery: payload.videoGallery || {
        images: payload.featuredImageUrl ? [payload.featuredImageUrl] : [],
        videoUrl: '',
        videoType: 'auto',
        effect: 'fade',
        objectFit: 'cover',
        desktopHeight: '500px',
      },
      branding: payload.branding || {
        primaryColor: '#4f46e5',
        theme: 'gradient',
        svgTrendPreset: 'curve_up',
      },
      donorsConfig: payload.donorsConfig || {
        cardLayout: 'grid-2',
        defaultTab: 'recent',
        showSearch: true,
        showSort: true,
      },
      ownerId: payload.ownerId || '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      const docRef = doc(db, collectionPath, campaignId);
      await setDoc(docRef, newCampaign);
    }

    return { success: true, campaign: newCampaign };
  } catch (err: any) {
    console.error('[CampaignService] Error creating campaign:', err);
    return { success: false, error: err.message || 'שגיאה ביצירת קמפיין' };
  }
}

/**
 * Update campaign details and styling (HomeEditor design config)
 */
export async function updateCampaignRecord(
  db: Firestore | null,
  collectionPath: string,
  campaignId: string,
  updatedData: Partial<Campaign>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatedAt = new Date().toISOString();
    if (db) {
      const docRef = doc(db, collectionPath, campaignId);
      await updateDoc(docRef, { ...updatedData, updatedAt });
    }
    return { success: true };
  } catch (err: any) {
    console.error('[CampaignService] Error updating campaign:', err);
    return { success: false, error: err.message || 'שגיאה בעדכון קמפיין' };
  }
}

/**
 * Fetch ambassadors for a campaign
 */
export async function fetchAmbassadorsRecord(
  db: Firestore | null,
  ambassadorsCollectionPath: string,
  campaignId: string
): Promise<Ambassador[]> {
  if (!db) {
    return [];
  }
  try {
    const q = query(
      collection(db, ambassadorsCollectionPath),
      where('campaignId', '==', campaignId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ambassador));
    }
    return [];
  } catch (error) {
    console.error('[CampaignService] Error fetching ambassadors:', error);
    return [];
  }
}

/**
 * Fetch donations for a campaign
 */
export async function fetchDonationsRecord(
  db: Firestore | null,
  donationsCollectionPath: string,
  campaignId: string
): Promise<Donation[]> {
  if (!db) {
    return [];
  }
  try {
    const q = query(
      collection(db, donationsCollectionPath),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donation));
  } catch (error) {
    console.error('[CampaignService] Error fetching donations:', error);
    return [];
  }
}

/**
 * Create a new Ambassador with unique slug and EventBus notification
 */
export async function createAmbassadorRecord(
  db: Firestore | null,
  ambassadorsPath: string,
  groupsPath: string | null,
  contactsPath: string | null,
  payload: CreateAmbassadorPayload
): Promise<{ success: boolean; ambassador?: Ambassador; error?: string }> {
  try {
    const { campaignId, name, leaderName, targetGoal, message, gallery, customSlug, phone, email, ownerId } = payload;
    if (!campaignId || !name || !targetGoal) {
      return { success: false, error: 'נא למלא את כל שדות החובה' };
    }

    // Generate unique slug
    let baseSlug = (customSlug || name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '') || `ambassador-${Date.now().toString().slice(-4)}`;

    const newAmbassador: Ambassador = {
      id: `amb-${Date.now()}`,
      campaignId,
      name: name.trim(),
      leaderName: (leaderName && leaderName.trim()) || name.trim(),
      slug: baseSlug,
      targetGoal: Number(targetGoal),
      totalRaised: 0,
      donorCount: 0,
      message: message || '',
      vision: message || '',
      gallery: gallery || [],
      phone: phone || '',
      email: email || '',
      status: 'active',
      pageUrl: `/${baseSlug}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      const ambRef = doc(collection(db, ambassadorsPath));
      newAmbassador.id = ambRef.id;
      await setDoc(ambRef, newAmbassador);

      // Auto sync to CRM groups if path provided
      if (groupsPath) {
        try {
          const groupRef = doc(collection(db, groupsPath), `leader-${ambRef.id}`);
          await setDoc(groupRef, {
            id: `leader-${ambRef.id}`,
            name: name.trim(),
            leaderName: (leaderName && leaderName.trim()) || name.trim(),
            color: '#4f46e5',
            description: message || `קהילת ${name.trim()}`,
            type: 'manual',
            pageSlug: baseSlug,
            pageUrl: `/${baseSlug}`,
            mainCampaignId: campaignId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (grpErr) {
          console.warn('[CampaignService] Could not auto-create crm_group:', grpErr);
        }
      }

      // Auto sync to CRM contacts if path provided
      if (contactsPath) {
        try {
          const contactRef = doc(collection(db, contactsPath));
          await setDoc(contactRef, {
            conta_name: (leaderName && leaderName.trim()) || name.trim(),
            conta_phone: phone || '',
            email: email || '',
            lead_source: `מוביל קהילה: ${name.trim()}`,
            campaign_role: 'ambassador',
            campaign_id: campaignId,
            campaign_ambassador_slug: baseSlug,
            tags: [name.trim()],
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } catch (cErr) {
          console.warn('[CampaignService] Could not auto-create contact:', cErr);
        }
      }
    }

    // Publish event on EventBus for sibling modules (CRM, WhatsApp, Analytics)
    eventBus.publish('campaign:ambassador:created', {
      campaignId,
      ambassadorId: newAmbassador.id,
      name: newAmbassador.name,
      leaderName: newAmbassador.leaderName,
      slug: newAmbassador.slug,
      targetGoal: newAmbassador.targetGoal,
      phone: newAmbassador.phone,
      email: newAmbassador.email,
      shareUrl: `https://comona.io/${newAmbassador.slug}`,
      createdAt: newAmbassador.createdAt,
    });

    return { success: true, ambassador: newAmbassador };
  } catch (error: any) {
    console.error('[CampaignService] Error creating ambassador:', error);
    return { success: false, error: error.message || 'שגיאה ביצירת שגריר' };
  }
}

/**
 * Record pending donation (leads recovery & CRM registration)
 */
export async function recordPendingDonationRecord(
  db: Firestore | null,
  donationsPath: string,
  payload: RecordPendingDonationPayload
): Promise<{ success: boolean; donationId: string }> {
  const donationId = `don-pending-${Date.now()}`;
  try {
    const { campaignId, donorName, amount, monthlyAmount, recurringMonths, isRecurring, tier, dedication, isAnonymous, ambassadorId, ambassadorName, phone, email } = payload;

    const donationData: Donation = {
      id: donationId,
      campaignId,
      donorName: isAnonymous ? 'אנונימי' : (donorName || 'תורם'),
      realDonorName: donorName || '',
      amount: Number(amount),
      monthlyAmount: monthlyAmount ? Number(monthlyAmount) : null,
      recurringMonths: recurringMonths ? Number(recurringMonths) : null,
      isRecurring: Boolean(isRecurring),
      tier: tier || '',
      dedication: dedication || '',
      isAnonymous: Boolean(isAnonymous),
      ambassadorId: ambassadorId || null,
      ambassadorName: ambassadorName || null,
      phone: phone || '',
      email: email || '',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (db) {
      const docRef = doc(collection(db, donationsPath));
      donationData.id = docRef.id;
      await setDoc(docRef, donationData);
    }

    // Notify EventBus
    eventBus.publish('campaign:donation:pending', {
      campaignId,
      donationId: donationData.id,
      amount: donationData.amount,
      donorName: donationData.donorName,
      phone: donationData.phone,
      email: donationData.email,
      ambassadorId: donationData.ambassadorId || undefined,
      ambassadorName: donationData.ambassadorName || undefined,
      paymentUrl: `https://comona.io/c/${campaignId}?donate=true`,
      createdAt: donationData.createdAt,
    });

    return { success: true, donationId: donationData.id };
  } catch (error) {
    console.error('[CampaignService] Error recording pending donation:', error);
    return { success: true, donationId };
  }
}

/**
 * Complete a donation with atomic counter updates and EventBus broadcast
 */
export async function completeDonationRecord(
  db: Firestore | null,
  campaignPath: string,
  ambassadorsPath: string,
  donationsPath: string,
  payload: CompleteDonationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const { campaignId, donationId, amount, isRecurring, donorName, phone, email, ambassadorId, ambassadorName, receiptUrl, paymentMethod, transactionId } = payload;

    const completedAt = new Date().toISOString();

    if (db) {
      const campRef = doc(db, campaignPath, campaignId);
      const donRef = doc(db, donationsPath, donationId);
      const ambRef = ambassadorId ? doc(db, ambassadorsPath, ambassadorId) : null;

      await runTransaction(db, async (txn) => {
        const cSnap = await txn.get(campRef);
        const curRaised = cSnap.exists() ? (cSnap.data().totalRaised || 0) : 0;
        const curDonors = cSnap.exists() ? (cSnap.data().donorCount || 0) : 0;

        txn.update(campRef, {
          totalRaised: curRaised + Number(amount),
          donorCount: curDonors + 1,
          updatedAt: completedAt,
        });

        if (ambRef) {
          const ambSnap = await txn.get(ambRef);
          if (ambSnap.exists()) {
            const ambRaised = ambSnap.data().totalRaised || 0;
            const ambDonors = ambSnap.data().donorCount || 0;
            txn.update(ambRef, {
              totalRaised: ambRaised + Number(amount),
              donorCount: ambDonors + 1,
              updatedAt: completedAt,
            });
          }
        }

        txn.set(
          donRef,
          {
            paymentStatus: 'completed',
            paymentMethod: paymentMethod || 'credit_card',
            transactionId: transactionId || `TXN-${Date.now()}`,
            receiptUrl: receiptUrl || `https://comona.io/receipt/REC-${Date.now().toString().slice(-4)}`,
            completedAt,
            updatedAt: completedAt,
          },
          { merge: true }
        );
      });
    }

    // Publish EventBus event (triggers crm-analytics, whatsapp-green-api-hub, kesher-payments-hub)
    eventBus.publish('campaign:donation:completed', {
      campaignId,
      donationId,
      amount: Number(amount),
      donorName: donorName || 'תורם',
      phone: phone || '',
      email: email || '',
      ambassadorId: ambassadorId || undefined,
      ambassadorName: ambassadorName || undefined,
      receiptUrl: receiptUrl || `https://comona.io/receipt/REC-${Date.now().toString().slice(-4)}`,
      paymentMethod: paymentMethod || 'credit_card',
      transactionId: transactionId || `TXN-${Date.now()}`,
      completedAt,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[CampaignService] Error completing donation:', error);
    return { success: false, error: error.message || 'שגיאה באישור תרומה' };
  }
}
