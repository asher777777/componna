/**
 * Compatibility Re-export Layer
 * Delegates all operations to the new clean crmCopilotService
 */

export * from './crmCopilotService';

export {
  generateContactSummary as generateContactAISummary,
  generateSmartMessageDraft,
  parseBusinessCardImage,
  analyzeVoiceDebrief,
} from './crmCopilotService';

export type {
  ContactSummaryResult as AISummaryResult,
  DraftMessageResult as AIDraftMessageResult,
  VoiceDebriefResult,
} from './crmCopilotService';
