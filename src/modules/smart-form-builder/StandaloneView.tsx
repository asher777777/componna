import React from 'react';
import { SmartFormProvider } from './context/SmartFormContext';
import { FormBuilderStudio } from './components/builder/FormBuilderStudio';

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
  return (
    <SmartFormProvider
      customFirestore={customFirestore}
      collectionName={collectionName}
      initialFormId={initialFormId}
    >
      <FormBuilderStudio />
    </SmartFormProvider>
  );
};
