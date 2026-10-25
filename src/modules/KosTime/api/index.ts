import { KosTimeFirestoreService } from '../services/kosTimeFirestoreService';
import { KosTimeAiService } from '../services/kosTimeAiService';

export const KosTimeApi = {
  firestore: KosTimeFirestoreService,
  ai: KosTimeAiService,
};
