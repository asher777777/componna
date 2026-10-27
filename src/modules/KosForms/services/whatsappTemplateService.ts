import { SmartFormDefinition, SmartFormSubmission, FormWhatsAppRule } from '../types';

export interface RenderContext {
  form: SmartFormDefinition;
  rawAnswers: Record<string, any>;
  detailedAnswers?: Array<{
    stepId: string;
    fieldTitle: string;
    fieldType: string;
    mappingKey?: string;
    value: any;
    displayValue: string;
  }>;
  metadata?: any;
  submissionId?: string;
  submittedAt?: string;
}

/**
 * Format dynamic tags available for substitution
 */
export const AVAILABLE_DYNAMIC_TAGS = [
  { tag: '{{conta_name}}', label: 'שם מלא של הליד / איש הקשר', category: 'איש קשר' },
  { tag: '{{conta_phone}}', label: 'מספר טלפון', category: 'איש קשר' },
  { tag: '{{email}}', label: 'דואר אלקטרוני', category: 'איש קשר' },
  { tag: '{{form_title}}', label: 'כותרת הטופס', category: 'מידע כללי' },
  { tag: '{{page_title}}', label: 'כותרת עמוד המקור', category: 'מידע כללי' },
  { tag: '{{page_author}}', label: 'מחבר/יוצר העמוד', category: 'מידע כללי' },
  { tag: '{{submission_date}}', label: 'תאריך ההגשה (DD/MM/YYYY)', category: 'זמנים' },
  { tag: '{{submission_time}}', label: 'שעת ההגשה (HH:mm)', category: 'זמנים' },
  { tag: '{{lead_score}}', label: 'ציון איכות ליד AI (1-100)', category: 'טלמטריה ו-AI' },
  { tag: '{{lead_temperature}}', label: 'טמפרטורת ליד (חם / פעיל / רגיל)', category: 'טלמטריה ו-AI' },
  { tag: '{{all_answers_summary}}', label: 'תקציר מרוכז של כל התשובות שנמסרו', category: 'תשובות' },
];

/**
 * Renders a WhatsApp message template with dynamic values from the submission
 */
export function renderWhatsAppMessage(
  template: string,
  context: RenderContext
): string {
  if (!template) return '';

  const { form, rawAnswers, detailedAnswers, metadata, submissionId, submittedAt } = context;

  const conta_name =
    rawAnswers['conta_name'] ||
    rawAnswers['name'] ||
    rawAnswers['fullName'] ||
    'לקוח יקר';

  const conta_phone =
    rawAnswers['conta_phone'] ||
    rawAnswers['phone'] ||
    rawAnswers['tel'] ||
    '';

  const email =
    rawAnswers['email'] ||
    rawAnswers['mail'] ||
    '';

  const submissionDateObj = submittedAt ? new Date(submittedAt) : new Date();
  const submissionDate = submissionDateObj.toLocaleDateString('he-IL');
  const submissionTime = submissionDateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  const leadScore = metadata?.leadScore ? String(metadata.leadScore) : '85';
  const leadTemperature =
    metadata?.leadTemperature === 'hot'
      ? 'ליד חם'
      : metadata?.leadTemperature === 'cold'
      ? 'קר'
      : 'רגיל';

  // Build full answers summary
  let allAnswersSummary = '';
  if (detailedAnswers && detailedAnswers.length > 0) {
    allAnswersSummary = detailedAnswers
      .filter((a) => a.displayValue && a.displayValue !== '-')
      .map((a) => `• *${a.fieldTitle}*: ${a.displayValue}`)
      .join('\n');
  } else if (form.steps && form.steps.length > 0) {
    allAnswersSummary = form.steps
      .map((step) => {
        const val = rawAnswers[step.mappingKey || step.id];
        if (val === undefined || val === null || val === '') return null;
        const display = Array.isArray(val) ? val.join(', ') : String(val);
        return `• *${step.title}*: ${display}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  // Predefined replacements map
  const replacements: Record<string, string> = {
    '{{conta_name}}': String(conta_name),
    '{{name}}': String(conta_name),
    '{{fullName}}': String(conta_name),
    '{{שם}}': String(conta_name),
    '{{שם_מלא}}': String(conta_name),

    '{{conta_phone}}': String(conta_phone),
    '{{phone}}': String(conta_phone),
    '{{tel}}': String(conta_phone),
    '{{טלפון}}': String(conta_phone),

    '{{email}}': String(email),
    '{{mail}}': String(email),
    '{{מייל}}': String(email),
    '{{אימייל}}': String(email),

    '{{form_title}}': form.title || 'טופס חכם',
    '{{שם_הטופס}}': form.title || 'טופס חכם',
    '{{form_id}}': form.id || '',
    '{{submission_id}}': submissionId || '',

    '{{page_title}}': metadata?.pageTitle || document?.title || form.title || '',
    '{{כותרת_העמוד}}': metadata?.pageTitle || document?.title || form.title || '',
    '{{page_author}}': metadata?.pageAuthor || form.createdBy || 'מנהל המערכת',
    '{{מחבר_העמוד}}': metadata?.pageAuthor || form.createdBy || 'מנהל המערכת',

    '{{submission_date}}': submissionDate,
    '{{תאריך}}': submissionDate,
    '{{submission_time}}': submissionTime,
    '{{שעה}}': submissionTime,

    '{{lead_score}}': leadScore,
    '{{ציון_ליד}}': leadScore,
    '{{lead_temperature}}': leadTemperature,
    '{{טמפרטורת_ליד}}': leadTemperature,

    '{{all_answers_summary}}': allAnswersSummary,
    '{{תקציר_כל_התשובות}}': allAnswersSummary,
    '{{תקציר_תשובות}}': allAnswersSummary,
  };

  let rendered = template;

  // Replace standard predefined tokens
  Object.entries(replacements).forEach(([token, value]) => {
    rendered = rendered.split(token).join(value);
  });

  // Replace any dynamic form step tokens by mappingKey or stepId
  form.steps.forEach((step) => {
    const rawVal = rawAnswers[step.mappingKey || step.id];
    let valStr = '';
    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      if (Array.isArray(rawVal)) valStr = rawVal.join(', ');
      else if (typeof rawVal === 'boolean') valStr = rawVal ? 'כן' : 'לא';
      else valStr = String(rawVal);
    }

    if (step.mappingKey) {
      rendered = rendered.split(`{{${step.mappingKey}}}`).join(valStr);
      rendered = rendered.split(`{{[${step.mappingKey}]}}`).join(valStr);
    }
    rendered = rendered.split(`{{${step.id}}}`).join(valStr);
    rendered = rendered.split(`{{[${step.id}]}}`).join(valStr);
    rendered = rendered.split(`{{${step.title}}}`).join(valStr);
    rendered = rendered.split(`{{[${step.title}]}}`).join(valStr);
  });

  // Clean up any remaining unpopulated {{...}} placeholders gracefully
  rendered = rendered.replace(/\{\{[^}]+\}\}/g, '');

  return rendered.trim();
}

/**
 * Evaluates whether a WhatsApp Rule condition is met
 */
export function evaluateRuleCondition(
  rule: FormWhatsAppRule,
  answers: Record<string, any>,
  metadata?: any
): boolean {
  if (!rule.enabled) return false;
  if (!rule.conditionType || rule.conditionType === 'always') return true;

  const targetKey = rule.conditionFieldKey || '';
  const val = targetKey ? answers[targetKey] : undefined;
  const targetValStr = val !== undefined && val !== null ? String(val).trim().toLowerCase() : '';
  const ruleValStr = (rule.conditionValue || '').trim().toLowerCase();

  switch (rule.conditionType) {
    case 'field_equals':
      return targetValStr === ruleValStr;

    case 'field_not_equals':
      return targetValStr !== ruleValStr;

    case 'field_contains':
      return targetValStr.includes(ruleValStr);

    case 'field_not_empty':
      return val !== undefined && val !== null && String(val).trim().length > 0;

    case 'score_gte': {
      const score = metadata?.leadScore !== undefined ? Number(metadata.leadScore) : 75;
      const threshold = rule.conditionScoreThreshold !== undefined ? rule.conditionScoreThreshold : 80;
      return score >= threshold;
    }

    case 'lead_temperature_hot':
      return metadata?.leadTemperature === 'hot' || (metadata?.leadScore && metadata.leadScore >= 85);

    case 'numeric_greater_than': {
      const numVal = parseFloat(String(val || '').replace(/[^\d.-]/g, ''));
      const targetNum = parseFloat(rule.conditionValue || '0');
      return !isNaN(numVal) && !isNaN(targetNum) && numVal > targetNum;
    }

    case 'numeric_less_than': {
      const numVal = parseFloat(String(val || '').replace(/[^\d.-]/g, ''));
      const targetNum = parseFloat(rule.conditionValue || '0');
      return !isNaN(numVal) && !isNaN(targetNum) && numVal < targetNum;
    }

    default:
      return true;
  }
}
