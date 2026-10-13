import React, { useState } from 'react';
import { SmartFormProvider } from './context/SmartFormContext';
import { FormBuilderStudio } from './components/builder/FormBuilderStudio';
import { useTenantScope } from '../../core/tenant';
import { SYSTEM_COLLECTIONS } from '../../core/contracts';
import { KosunShell } from '../../core/layout/KosunShell';
import { FileText, Sliders, MessageSquare, BarChart3, Wand2, Eye } from 'lucide-react';

export interface KSFStandaloneViewProps {
  customFirestore?: any;
  collectionName?: string;
  initialFormId?: string;
}

export const KSFStandaloneView: React.FC<KSFStandaloneViewProps> = ({
  customFirestore,
  collectionName,
  initialFormId,
}) => {
  const { getScopedCollectionPath } = useTenantScope();
  const effectiveCollectionName =
    collectionName || getScopedCollectionPath(SYSTEM_COLLECTIONS.SMART_FORMS);

  // Floating Drawer Navigation items for KSF
  const navItems = [
    {
      id: 'forms-list',
      label: 'רשימת הטפסים',
      icon: FileText,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'list' } }));
      },
    },
    {
      id: 'editor',
      label: 'עורך שלבים ושאלות',
      icon: Sliders,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'editor' } }));
      },
    },
    {
      id: 'whatsapp',
      label: 'אוטומציות WhatsApp',
      icon: MessageSquare,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'whatsapp' } }));
      },
    },
    {
      id: 'analytics',
      label: 'אנליטיקה ולידים',
      icon: BarChart3,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'analytics' } }));
      },
    },
    {
      id: 'ai-wizard',
      label: 'סיעור מוחות AI',
      icon: Wand2,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('ksf_open_ai_brainstorm'));
      },
    },
  ];

  return (
    <KosunShell componentName="KSF" navItems={navItems}>
      <SmartFormProvider
        customFirestore={customFirestore}
        collectionName={effectiveCollectionName}
        initialFormId={initialFormId}
      >
        <FormBuilderStudio />
      </SmartFormProvider>
    </KosunShell>
  );
};

// Backwards compatibility alias
export const SmartFormBuilderStandaloneView = KSFStandaloneView;
export default KSFStandaloneView;
