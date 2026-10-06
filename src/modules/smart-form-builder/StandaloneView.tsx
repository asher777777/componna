import React from 'react';
import { SmartFormProvider } from './context/SmartFormContext';
import { FormBuilderStudio } from './components/builder/FormBuilderStudio';
import { useTenantScope } from '../../core/tenant';
import { SYSTEM_COLLECTIONS } from '../../core/contracts';

export interface SmartFormBuilderStandaloneViewProps {
  customFirestore?: any;
  collectionName?: string;
  initialFormId?: string;
}

export const SmartFormBuilderStandaloneView: React.FC<SmartFormBuilderStandaloneViewProps> = ({
  customFirestore,
  collectionName,
  initialFormId,
}) => {
  const { getScopedCollectionPath } = useTenantScope();
  const effectiveCollectionName = collectionName || getScopedCollectionPath(SYSTEM_COLLECTIONS.SMART_FORMS);

  return (
    <SmartFormProvider
      customFirestore={customFirestore}
      collectionName={effectiveCollectionName}
      initialFormId={initialFormId}
    >
      <FormBuilderStudio />
    </SmartFormProvider>
  );
};
