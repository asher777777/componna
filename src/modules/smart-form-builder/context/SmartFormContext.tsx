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
import { DEFAULT_FORMS_COLLECTION } from '../config/constants';


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
