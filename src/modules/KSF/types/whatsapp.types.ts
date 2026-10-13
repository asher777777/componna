export type FormWhatsAppConditionType =
  | 'always'                  // Always send on submission
  | 'field_equals'            // Field value equals specific value
  | 'field_not_equals'        // Field value does not equal specific value
  | 'field_contains'          // Field value contains substring
  | 'field_not_empty'         // Field is not empty / answered
  | 'score_gte'               // AI Lead Score is greater than or equal to threshold
  | 'lead_temperature_hot'    // Lead is classified as hot
  | 'numeric_greater_than'    // Field numeric value > threshold
  | 'numeric_less_than';      // Field numeric value < threshold

export type FormWhatsAppRecipientType =
  | 'submitter'               // Send to the phone number entered in the form
  | 'custom_phone'            // Send to a fixed admin / sales phone number
  | 'both';                   // Send to both submitter and custom phone

export interface FormWhatsAppRule {
  id: string;
  name: string;
  enabled: boolean;
  recipientType: FormWhatsAppRecipientType;
  customPhone?: string;       // E.g. '0521234567' or '12036304...-group@g.us'
  conditionType: FormWhatsAppConditionType;
  conditionFieldKey?: string; // mappingKey or stepId
  conditionValue?: string;    // Comparison value
  conditionScoreThreshold?: number; // E.g. 80
  messageTemplate: string;    // E.g. "שלום {{conta_name}}, תודה שפנית בנושא {{service_type}}!..."
  mediaUrl?: string;          // Optional image/PDF URL to attach
  mediaFileName?: string;     // Optional filename
}

export interface FormWhatsAppDeliveryLog {
  ruleId: string;
  ruleName: string;
  recipientPhone: string;
  recipientType: 'submitter' | 'admin';
  status: 'sent' | 'failed' | 'skipped';
  messageId?: string;
  sentAt: string;
  renderedMessage?: string;
  error?: string;
}
