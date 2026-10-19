import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Firestore } from 'firebase/firestore';
import { SmartFormDefinition } from '../types';
import {
  getSmartForms,
  subscribeSmartForms,
  saveSmartForm,
  deleteSmartForm,
  getSmartFormById,
} from '../services/formStorageService';
import { generateSmartFormWithAI, AIBrainstormInput } from '../services/aiFormService';
import { DEFAULT_FORMS_COLLECTION, DEFAULT_THEME_SETTINGS, DEFAULT_COMPLETION_SETTINGS } from '../config/constants';
import { eventBus } from '../../../core/bridge/EventBus';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { FormBuilderContract } from '../../../core/contracts';
import { FormSubmissionsTable } from '../components/analytics/FormSubmissionsTable';
import { SmartFormRunner } from '../components/runner/SmartFormRunner';


export interface SmartFormContextValue {
  forms: SmartFormDefinition[];
  activeForm: SmartFormDefinition | null;
  isLoading: boolean;
  isSaving: boolean;
  isGeneratingAI: boolean;
  error: string | null;
  collectionName: string;
  setActiveForm: (form: SmartFormDefinition | null) => void;
  loadFormById: (formId: string) => Promise<SmartFormDefinition | null>;
  saveForm: (form: Partial<SmartFormDefinition>) => Promise<string>;
  deleteForm: (formId: string) => Promise<void>;
  generateFormWithAI: (input: AIBrainstormInput) => Promise<SmartFormDefinition>;
  refreshForms: () => Promise<void>;
}

export const SmartFormContext = createContext<SmartFormContextValue | undefined>(undefined);

export interface SmartFormProviderProps {
  children: ReactNode;
  customFirestore?: Firestore;
  collectionName?: string;
  initialFormId?: string;
}

export const SmartFormProvider: React.FC<SmartFormProviderProps> = ({
  children,
  customFirestore,
  collectionName = DEFAULT_FORMS_COLLECTION,
  initialFormId,
}) => {
  const [forms, setForms] = useState<SmartFormDefinition[]>([]);
  const [activeForm, setActiveForm] = useState<SmartFormDefinition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to forms
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeSmartForms(
      (data) => {
        setForms(data);
        setIsLoading(false);
      },
      customFirestore,
      collectionName
    );

    return () => unsubscribe();
  }, [customFirestore, collectionName]);

  // Load initial form if specified
  useEffect(() => {
    if (initialFormId) {
      getSmartFormById(initialFormId, customFirestore, collectionName).then((f) => {
        if (f) setActiveForm(f);
      });
    }
  }, [initialFormId, customFirestore, collectionName]);

  const refreshForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSmartForms(customFirestore, collectionName);
      setForms(data);
    } catch (e: any) {
      setError(e.message || 'Error refreshing forms');
    } finally {
      setIsLoading(false);
    }
  }, [customFirestore, collectionName]);

  const loadFormById = useCallback(
    async (formId: string) => {
      try {
        const form = await getSmartFormById(formId, customFirestore, collectionName);
        if (form) setActiveForm(form);
        return form;
      } catch (e: any) {
        setError(e.message || 'Error loading form');
        return null;
      }
    },
    [customFirestore, collectionName]
  );

  const saveForm = useCallback(
    async (formData: Partial<SmartFormDefinition>) => {
      setIsSaving(true);
      setError(null);
      try {
        const id = await saveSmartForm(formData, customFirestore, collectionName);
        const updated = await getSmartFormById(id, customFirestore, collectionName);
        if (updated) setActiveForm(updated);
        return id;
      } catch (e: any) {
        setError(e.message || 'Error saving form');
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [customFirestore, collectionName]
  );

  const deleteForm = useCallback(
    async (formId: string) => {
      setIsSaving(true);
      try {
        await deleteSmartForm(formId, customFirestore, collectionName);
        if (activeForm?.id === formId) {
          setActiveForm(null);
        }
      } catch (e: any) {
        setError(e.message || 'Error deleting form');
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [activeForm, customFirestore, collectionName]
  );

  const generateFormWithAI = useCallback(
    async (input: AIBrainstormInput): Promise<SmartFormDefinition> => {
      setIsGeneratingAI(true);
      setError(null);
      try {
        const result = await generateSmartFormWithAI(input);
        const formDef: SmartFormDefinition = {
          id: `form_${Date.now()}`,
          title: result.form.title || input.goal,
          slug: result.form.slug || 'smart-form',
          description: result.form.description || '',
          category: result.form.category || 'עסקים',
          tone: input.tone,
          toneDescription: result.form.toneDescription || '',
          steps: result.form.steps || [],
          theme: result.form.theme as any,
          completion: result.form.completion as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
          viewsCount: 0,
          startsCount: 0,
          submissionsCount: 0,
          isCrmSyncEnabled: true,
          crmDefaultTags: ['AI Form', input.goal],
        };

        setActiveForm(formDef);
        return formDef;
      } catch (e: any) {
        setError(e.message || 'AI Generation Failed');
        throw e;
      } finally {
        setIsGeneratingAI(false);
      }
    },
    []
  );

  const { registerCapability, unregisterCapability } = useHostCapabilities();

  // Register FormBuilderContract into HostCapabilities
  useEffect(() => {
    const contract: FormBuilderContract = {
      getForms: async () => {
        return forms.map((f) => ({
          id: f.id,
          title: f.title,
          category: f.category,
          submissionsCount: f.submissionsCount,
          hasPaymentStep: Boolean(f.steps?.some((s) => (s as any).fieldType === 'payment')),
          hasWhatsAppTrigger: Boolean(f.whatsappAutomationEnabled),
        }));
      },
      getActiveFormsList: () => {
        return forms.map((f) => ({
          id: f.id,
          title: f.title,
          category: f.category,
          submissionsCount: f.submissionsCount,
          hasPaymentStep: Boolean(f.steps?.some((s) => (s as any).fieldType === 'payment')),
          hasWhatsAppTrigger: Boolean(f.whatsappAutomationEnabled),
        }));
      },
      checkDefaultFormsStatus: async () => {
        const hasLeadForm = forms.some(
          (f) =>
            f.category === 'לידים' ||
            f.title.includes('ליד') ||
            f.title.includes('התאמה') ||
            f.title.includes('יצירת קשר')
        );
        const hasPaymentForm = forms.some(
          (f) =>
            f.category === 'תשלום' ||
            f.category === 'סליקה' ||
            f.title.includes('תשלום') ||
            f.title.includes('סליקה') ||
            f.steps?.some((s) => (s as any).fieldType === 'payment')
        );
        const hasWhatsAppForm = forms.some(
          (f) =>
            Boolean(f.whatsappAutomationEnabled) ||
            f.category === 'וואטסאפ' ||
            f.title.includes('וואטסאפ')
        );

        const missingTypes: ('leads' | 'payment' | 'whatsapp')[] = [];
        if (!hasLeadForm) missingTypes.push('leads');
        if (!hasPaymentForm) missingTypes.push('payment');
        if (!hasWhatsAppForm) missingTypes.push('whatsapp');

        return {
          hasLeadForm,
          hasPaymentForm,
          hasWhatsAppForm,
          missingTypes,
        };
      },
      createDefaultForm: async (type: 'leads' | 'payment' | 'whatsapp') => {
        let newForm: Partial<SmartFormDefinition>;

        if (type === 'payment') {
          newForm = {
            title: 'טופס תשלום וסליקה מהירה (קשר)',
            slug: 'payment-checkout',
            description: 'טופס סליקה מאובטח ומחובר ישירות למסוף קשר',
            category: 'סליקה',
            status: 'published',
            isCrmSyncEnabled: true,
            crmDefaultTags: ['תשלום קשר', 'לקוח משלם'],
            steps: [
              {
                id: 'pay_step_1',
                order: 1,
                title: 'מה שמך המלא?',
                fieldType: 'text',
                iconName: 'User',
                required: true,
                mappingKey: 'kosun_crm_name',
              },
              {
                id: 'pay_step_2',
                order: 2,
                title: 'מספר טלפון לקבלת אישור התשלום',
                fieldType: 'phone',
                iconName: 'Phone',
                required: true,
                mappingKey: 'kosun_crm_phone',
              },
              {
                id: 'pay_step_3',
                order: 3,
                title: 'כתובת דוא״ל למשלוח מסמך מס',
                fieldType: 'email',
                iconName: 'Mail',
                required: true,
                mappingKey: 'kosun_crm_email',
              },
              {
                id: 'pay_step_4',
                order: 4,
                title: 'ביצוע תשלום מאובטח במסוף קשר',
                subtitle: 'סליקת אשראי מאובטחת, ביט או העברה בנקאית',
                fieldType: 'payment' as any,
                iconName: 'CreditCard',
                required: true,
              },
            ],
          };
        } else if (type === 'whatsapp') {
          newForm = {
            title: 'טופס פנייה עם מענה וואטסאפ מיידי',
            slug: 'whatsapp-lead-trigger',
            description: 'איסוף פרטים ושליחת הודעת וואטסאפ אוטומטית ברגע ההרשמה',
            category: 'וואטסאפ',
            status: 'published',
            isCrmSyncEnabled: true,
            whatsappAutomationEnabled: true,
            crmDefaultTags: ['ליד וואטסאפ', 'טריגר פעיל'],
            steps: [
              {
                id: 'wa_step_1',
                order: 1,
                title: 'איך קוראים לך?',
                fieldType: 'text',
                iconName: 'User',
                required: true,
                mappingKey: 'kosun_crm_name',
              },
              {
                id: 'wa_step_2',
                order: 2,
                title: 'מה מספר הוואטסאפ שלך?',
                subtitle: 'נשלח לך הודעת וואטסאפ מיידית עם כל הפרטים',
                fieldType: 'phone',
                iconName: 'MessageSquare',
                required: true,
                mappingKey: 'kosun_crm_phone',
              },
              {
                id: 'wa_step_3',
                order: 3,
                title: 'במה נוכל לסייע לך היום?',
                fieldType: 'textarea',
                iconName: 'FileText',
                required: false,
                mappingKey: 'kosun_crm_notes',
              },
            ],
            whatsappRules: [
              {
                id: `rule_wa_${Date.now()}`,
                name: 'הודעת ברוכים הבאים מיידית',
                enabled: true,
                conditionType: 'always',
                recipientType: 'submitter',
                messageTemplate: 'שלום {{kosun_crm_name}}! קיבלנו את פנייתך בהצלחה ונחזור אליך בהקדם.',
              },
            ],
          };
        } else {
          // 'leads'
          newForm = {
            title: 'טופס רישום לידים והצטרפות',
            slug: 'lead-registration',
            description: 'טופס שלב-אחר-שלב לקליטת מתעניינים וסנכרון מלא לכרטיס הלקוח',
            category: 'לידים',
            status: 'published',
            isCrmSyncEnabled: true,
            crmDefaultTags: ['ליד חדש', 'הצטרפות'],
            steps: [
              {
                id: 'lead_step_1',
                order: 1,
                title: 'מה שמך המלא?',
                fieldType: 'text',
                iconName: 'User',
                required: true,
                mappingKey: 'kosun_crm_name',
              },
              {
                id: 'lead_step_2',
                order: 2,
                title: 'מה מספר הנייד שלך לחיוג ולוואטסאפ?',
                fieldType: 'phone',
                iconName: 'Phone',
                required: true,
                mappingKey: 'kosun_crm_phone',
              },
              {
                id: 'lead_step_3',
                order: 3,
                title: 'לאיזה כתובת אימייל לעדכן אותך?',
                fieldType: 'email',
                iconName: 'Mail',
                required: true,
                mappingKey: 'kosun_crm_email',
              },
              {
                id: 'lead_step_4',
                order: 4,
                title: 'שם העסק או החברה שלך (אופציונלי)',
                fieldType: 'text',
                iconName: 'Building',
                required: false,
                mappingKey: 'kosun_crm_company',
              },
            ],
          };
        }

        const createdId = await saveForm(newForm);
        const fullForm = await getSmartFormById(createdId, customFirestore, collectionName);
        if (fullForm) {
          setActiveForm(fullForm);
        }
        return { id: createdId, title: newForm.title || '' };
      },
      openBrainstormModal: () => {
        window.dispatchEvent(new CustomEvent('ksf_open_ai_brainstorm'));
      },
      openBuilderForForm: (formId: string) => {
        loadFormById(formId);
      },
      renderSubmissionsTable: (formId: string, formTitle?: string) => {
        const targetForm = forms.find(f => f.id === formId) || ({
          id: formId,
          title: formTitle || 'טופס',
          steps: [],
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as SmartFormDefinition);
        return <FormSubmissionsTable form={targetForm} />;
      },
    };

    registerCapability('form-builder', contract);
    registerCapability('form-renderer', SmartFormRunner);
    return () => {
      unregisterCapability('form-builder');
      unregisterCapability('form-renderer');
    };
  }, [forms, saveForm, loadFormById, customFirestore, collectionName, registerCapability, unregisterCapability, setActiveForm]);

  // Listen to AI Agent Actions from Kosai Engine (EventBus Bridge)
  useEffect(() => {
    const unsub = eventBus.subscribe('kosai:action', async (event: any) => {
      if (!event || !event.action) return;
      const { action, payload } = event;

      try {
        if (action === 'CREATE_SMART_FORM') {
          if (!payload) return;
          const now = new Date().toISOString();
          const formId = payload.id || `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          const normalizeStep = (step: any, idx: number): any => {
            const stepObj: any = {
              id: step.id || `step_${idx + 1}`,
              order: idx + 1,
              title: step.title || `שאלה ${idx + 1}`,
              subtitle: step.subtitle || '',
              fieldType: step.fieldType || 'text',
              iconName: step.iconName || 'Sparkles',
              placeholder: step.placeholder || '',
              required: step.required ?? true,
              mappingKey: step.mappingKey || `field_${idx + 1}`,
              minRating: step.minRating || 1,
              maxRating: step.maxRating || 5,
              minScale: step.minScale || 1,
              maxScale: step.maxScale || 10,
              minScaleLabel: step.minScaleLabel || 'נמוך',
              maxScaleLabel: step.maxScaleLabel || 'גבוה מאוד',
            };
            if (Array.isArray(step.options) && step.options.length > 0) {
              stepObj.options = step.options.map((opt: any, optIdx: number) => ({
                id: opt.id || `opt_${optIdx + 1}`,
                label: opt.label || '',
                value: opt.value || opt.label || `opt_${optIdx + 1}`,
                description: opt.description || '',
                iconName: opt.iconName || 'Sparkles',
              }));
            }
            return stepObj;
          };

          const rawSteps = Array.isArray(payload.steps) ? payload.steps : [];
          const normalizedSteps = rawSteps.map(normalizeStep);

          const newForm: SmartFormDefinition = {
            id: formId,
            title: payload.title || 'טופס חכם KSF',
            slug: (payload.slug || payload.title || 'form')
              .toLowerCase()
              .replace(/[^\w\u0590-\u05FF]+/g, '-')
              .slice(0, 40),
            description: payload.description || '',
            category: payload.category || 'כללי',
            tone: payload.tone || 'warm_consulting',
            toneDescription: payload.toneDescription || '',
            steps: normalizedSteps,
            theme: {
              ...DEFAULT_THEME_SETTINGS,
              ...(payload.theme || {}),
            },
            completion: {
              ...DEFAULT_COMPLETION_SETTINGS,
              ...(payload.completion || {}),
            },
            createdAt: now,
            updatedAt: now,
            createdBy: 'KOSAI Agent',
            status: payload.status || 'published',
            viewsCount: 0,
            startsCount: 0,
            submissionsCount: 0,
            isCrmSyncEnabled: payload.isCrmSyncEnabled ?? true,
            crmDefaultTags: payload.crmDefaultTags || ['KSF', payload.title || 'טופס'],
            crmDefaultCommunity: payload.crmDefaultCommunity || '',
            whatsappAutomationEnabled: Boolean(payload.whatsappAutomationEnabled),
            whatsappRules: payload.whatsappRules || [],
          };

          const createdId = await saveForm(newForm);
          const fullForm = await getSmartFormById(createdId, customFirestore, collectionName);
          if (fullForm) {
            setActiveForm(fullForm);
          }

          eventBus.publish('kosai:action_result', {
            action: 'CREATE_SMART_FORM',
            success: true,
            message: `הטופס "${newForm.title}" הוקם בהצלחה עם ${normalizedSteps.length} שלבים ונשמר ב-KSF.`,
          });
        } else if (action === 'UPDATE_SMART_FORM') {
          if (!payload) return;
          const targetForm = activeForm || (payload.formId ? forms.find((f) => f.id === payload.formId) : null);
          if (!targetForm) {
            console.warn('[SmartFormContext] No active form to update');
            return;
          }

          let updatedSteps = targetForm.steps;
          if (Array.isArray(payload.steps)) {
            const normalizeUpdateStep = (step: any, idx: number): any => {
              const stepObj: any = {
                id: step.id || `step_${idx + 1}`,
                order: idx + 1,
                title: step.title || `שאלה ${idx + 1}`,
                subtitle: step.subtitle || '',
                fieldType: step.fieldType || 'text',
                iconName: step.iconName || 'Sparkles',
                placeholder: step.placeholder || '',
                required: step.required ?? true,
                mappingKey: step.mappingKey || `field_${idx + 1}`,
                minRating: step.minRating || 1,
                maxRating: step.maxRating || 5,
                minScale: step.minScale || 1,
                maxScale: step.maxScale || 10,
                minScaleLabel: step.minScaleLabel || 'נמוך',
                maxScaleLabel: step.maxScaleLabel || 'גבוה מאוד',
              };
              if (Array.isArray(step.options) && step.options.length > 0) {
                stepObj.options = step.options.map((opt: any, optIdx: number) => ({
                  id: opt.id || `opt_${optIdx + 1}`,
                  label: opt.label || '',
                  value: opt.value || opt.label || `opt_${optIdx + 1}`,
                  description: opt.description || '',
                  iconName: opt.iconName || 'Sparkles',
                }));
              }
              return stepObj;
            };
            updatedSteps = payload.steps.map(normalizeUpdateStep);
          }

          const updatedForm: SmartFormDefinition = {
            ...targetForm,
            title: payload.title || targetForm.title,
            description: payload.description !== undefined ? payload.description : targetForm.description,
            category: payload.category || targetForm.category,
            tone: payload.tone || targetForm.tone,
            steps: updatedSteps,
            theme: {
              ...targetForm.theme,
              ...(payload.theme || {}),
            },
            completion: {
              ...targetForm.completion,
              ...(payload.completion || {}),
            },
            isCrmSyncEnabled: payload.isCrmSyncEnabled ?? targetForm.isCrmSyncEnabled,
            crmDefaultTags: payload.crmDefaultTags || targetForm.crmDefaultTags,
            whatsappAutomationEnabled:
              payload.whatsappAutomationEnabled !== undefined
                ? payload.whatsappAutomationEnabled
                : targetForm.whatsappAutomationEnabled,
            updatedAt: new Date().toISOString(),
          };

          await saveForm(updatedForm);
          setActiveForm(updatedForm);

          eventBus.publish('kosai:action_result', {
            action: 'UPDATE_SMART_FORM',
            success: true,
            message: `הטופס "${updatedForm.title}" עודכן בהצלחה בסטודיו KSF.`,
          });
        } else if (action === 'SAVE_FORM_TEMPLATE') {
          const targetForm = activeForm || (payload?.formId ? forms.find((f) => f.id === payload.formId) : null);
          if (!targetForm && !payload?.title) {
            console.warn('[SmartFormContext] No form available to save as template');
            return;
          }

          const baseForm = targetForm || {
            title: payload.title || 'תבנית טופס חדשה',
            steps: payload.steps || [],
            theme: DEFAULT_THEME_SETTINGS,
            completion: DEFAULT_COMPLETION_SETTINGS,
            crmDefaultTags: ['תבנית KSF'],
          };

          const templateTitle = payload.templateName || payload.title || baseForm.title;
          const existingTags: string[] = (baseForm as any).crmDefaultTags || [];
          const templateForm: SmartFormDefinition = {
            ...(baseForm as any),
            id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: templateTitle,
            slug: templateTitle.toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-').slice(0, 40),
            category: payload.category || 'תבניות שמורות',
            status: 'published',
            crmDefaultTags: Array.from(new Set([...existingTags, 'תבנית KSF', 'תבנית שמורה'])),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const savedId = await saveForm(templateForm);
          const loaded = await getSmartFormById(savedId, customFirestore, collectionName);
          if (loaded) setActiveForm(loaded);

          eventBus.publish('kosai:action_result', {
            action: 'SAVE_FORM_TEMPLATE',
            success: true,
            message: `התבנית "${templateTitle}" נשמרה בהצלחה במערכת KSF.`,
          });
        } else if (action === 'LOAD_SMART_FORM') {
          if (!payload) return;
          let matched: SmartFormDefinition | undefined;
          if (payload.formId) {
            matched = forms.find((f) => f.id === payload.formId);
          }
          if (!matched && payload.title) {
            matched = forms.find((f) => f.title.toLowerCase().includes(payload.title.toLowerCase()));
          }
          if (matched) {
            setActiveForm(matched);
            eventBus.publish('kosai:action_result', {
              action: 'LOAD_SMART_FORM',
              success: true,
              message: `הטופס "${matched.title}" נטען לעריכה בסטודיו KSF.`,
            });
          }
        }
      } catch (err: any) {
        console.error('[SmartFormContext] Failed to execute kosai action:', action, err);
        eventBus.publish('kosai:action_result', {
          action,
          success: false,
          message: `שגיאה בביצוע פעולת הטופס: ${err?.message || 'שגיאה לא צפויה'}`,
        });
      }
    });

    return () => unsub();
  }, [activeForm, forms, customFirestore, collectionName, saveForm, setActiveForm]);


  return (
    <SmartFormContext.Provider
      value={{
        forms,
        activeForm,
        isLoading,
        isSaving,
        isGeneratingAI,
        error,
        collectionName,
        setActiveForm,
        loadFormById,
        saveForm,
        deleteForm,
        generateFormWithAI,
        refreshForms,
      }}
    >
      {children}
    </SmartFormContext.Provider>
  );
};

export function useSmartFormContext(): SmartFormContextValue {
  const context = useContext(SmartFormContext);
  if (!context) {
    throw new Error('useSmartFormContext must be used within a SmartFormProvider');
  }
  return context;
}
