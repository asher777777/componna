import { LeadPayload } from '../../../core/contracts';

export interface FormSubmissionAnswer {
  stepId: string;
  fieldTitle: string;
  fieldType: string;
  mappingKey?: string;
  value: any;
  displayValue: string;
}

export interface SmartFormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  submittedAt: string;
  answers: Record<string, any>; // mapped by mappingKey or stepId
  detailedAnswers: FormSubmissionAnswer[];
  completionTimeSeconds?: number;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    pageUrl?: string;
    ipCountry?: string;
  };
  crmSyncStatus?: 'synced' | 'pending' | 'failed' | 'not_applicable';
  crmContactId?: string;
  leadPayload?: LeadPayload;
}

export interface FormAnalyticsStats {
  formId: string;
  totalViews: number;
  totalStarts: number;
  totalSubmissions: number;
  completionRate: number; // percentage
  averageCompletionSeconds: number;
  dropoffPerStep: { stepId: string; stepTitle: string; dropoffCount: number; dropoffRate: number }[];
  submissionsByDate: { date: string; count: number }[];
}
