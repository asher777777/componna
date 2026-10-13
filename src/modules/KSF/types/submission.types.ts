import { LeadPayload } from '../../../core/contracts';

export interface FormSubmissionAnswer {
  stepId: string;
  fieldTitle: string;
  fieldType: string;
  mappingKey?: string;
  value: any;
  displayValue: string;
}

export interface SubmissionAutomatedMetadata {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  screenResolution: string;
  windowSize: string;
  language: string;
  timezone: string;
  referrer: string;
  pageUrl: string;
  pageTitle?: string;
  pageAuthor?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  leadScore?: number; // 1-100 quality score
  leadTemperature?: 'hot' | 'warm' | 'cold';
  userAgent: string;
}

export interface SmartFormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  submittedAt: string;
  answers: Record<string, any>; // mapped by mappingKey or stepId
  detailedAnswers: FormSubmissionAnswer[];
  completionTimeSeconds?: number;
  metadata?: SubmissionAutomatedMetadata;
  crmSyncStatus?: 'synced' | 'pending' | 'failed' | 'not_applicable';
  crmContactId?: string;
  leadPayload?: LeadPayload;
  whatsappDeliveries?: import('./whatsapp.types').FormWhatsAppDeliveryLog[];
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
