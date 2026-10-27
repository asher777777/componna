import { useState, useEffect, useMemo } from 'react';
import { Firestore } from 'firebase/firestore';
import { SmartFormDefinition, SmartFormSubmission, FormAnalyticsStats } from '../types';
import {
  subscribeFormSubmissions,
  calculateFormAnalytics,
  exportFormSubmissionsToExcel,
} from '../services/submissionStorageService';
import { DEFAULT_FORMS_COLLECTION } from '../config/constants';
import { useTenantScope } from '../../../core/tenant';

export function useFormSubmissions(
  form: SmartFormDefinition | null,
  customFirestore?: Firestore,
  collectionName?: string
) {
  const { tenantId, getScopedCollectionPath } = useTenantScope();
  const effectiveCollectionName =
    collectionName || getScopedCollectionPath(DEFAULT_FORMS_COLLECTION);

  const [submissions, setSubmissions] = useState<SmartFormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!form?.id) {
      setSubmissions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeFormSubmissions(
      form.id,
      (data) => {
        setSubmissions(data);
        setIsLoading(false);
      },
      customFirestore,
      effectiveCollectionName
    );

    return () => unsubscribe();
  }, [form?.id, customFirestore, effectiveCollectionName, tenantId]);

  const stats: FormAnalyticsStats | null = useMemo(() => {
    if (!form) return null;
    return calculateFormAnalytics(form, submissions);
  }, [form, submissions]);

  const exportExcel = () => {
    if (!form) return;
    exportFormSubmissionsToExcel(form, submissions);
  };

  return {
    submissions,
    stats,
    isLoading,
    error,
    exportExcel,
  };
}
