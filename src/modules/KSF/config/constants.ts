import { FormThemeSettings, FormCompletionSettings } from '../types';

export const DEFAULT_FORMS_COLLECTION = 'mod_forms';
export const SUBMISSIONS_SUBCOLLECTION = 'submissions';

export const DEFAULT_THEME_SETTINGS: FormThemeSettings = {
  primaryColor: '#0F172A',
  accentColor: '#D97706',
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  cardBackground: '#FFFFFF',
  borderRadius: 'xl',
  showProgressBar: true,
  showStepNumbers: true,
  luxuryBorder: true,
  buttonStyle: 'solid',
};

export const DEFAULT_COMPLETION_SETTINGS: FormCompletionSettings = {
  title: 'תודה רבה! פנייתך התקבלה בהצלחה',
  subtitle: 'הפרטים הועברו לטיפול אישי ומסור. ניצור עמך קשר בהקדם האפשרי.',
  iconName: 'CheckCircle2',
  showRedirectButton: false,
  redirectButtonText: 'חזרה לדף הבית',
  redirectUrl: '/',
  autoRedirectSeconds: 0,
};
