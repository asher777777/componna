export * from './contactPrompts';

// Backward compatibility aliases for previous schema names
export type {
  ContactSummaryResultSchema as AISummaryResultSchema,
  DraftMessageResultSchema as AIDraftMessageResultSchema,
  ContactSummaryPromptInput as AISummaryPromptInput,
  DraftMessagePromptInput as AIDraftMessagePromptInput,
} from './contactPrompts';

export {
  BUILD_CONTACT_SUMMARY_PROMPT as buildContactSummaryPrompt,
  BUILD_DRAFT_MESSAGE_PROMPT as buildDraftMessagePrompt,
  BUILD_BUSINESS_CARD_PROMPT as buildBusinessCardExtractionPrompt,
  BUILD_VOICE_DEBRIEF_PROMPT as buildVoiceDebriefAnalysisPrompt,
} from './contactPrompts';
