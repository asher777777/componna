import { Firestore } from 'firebase/firestore';
import { LivingStorageService } from '../services/livingStorageService';
import { DEFAULT_LIVING_CAMPAIGN } from '../config';

export async function seedDefaultLivingCampaigns(db: Firestore | undefined, tenantId: string): Promise<void> {
  try {
    await LivingStorageService.saveCampaign(db, tenantId, DEFAULT_LIVING_CAMPAIGN);
    console.log('[KosLive] Seeded default living campaign successfully.');
  } catch (err) {
    console.warn('[KosLive] Error seeding default living campaign:', err);
  }
}
