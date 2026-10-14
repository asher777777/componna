import React from 'react';
import { KosunUniversalDock } from '../../../components/Navigation/KosunUniversalDock';

export interface KosWebAiFrontDockProps {
  pageId?: string;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onOpenSettings?: () => void;
  onOpenAddSection?: () => void;
  className?: string;
  tenantId?: string;
  isAuthorized?: boolean;
}

/**
 * KosWebAiFrontDock - Frontend Page Builder Dock
 * Wraps canonical KosunUniversalDock in mode="front" with pencil edit and SEO tools.
 */
export const KosWebAiFrontDock: React.FC<KosWebAiFrontDockProps> = ({
  pageId,
  isEditing,
  onToggleEditMode,
  isSaving,
  onOpenSettings,
  onOpenAddSection,
  className = '',
  tenantId,
  isAuthorized,
}) => {
  return (
    <KosunUniversalDock
      mode="front"
      isEditing={isEditing}
      onToggleEditMode={onToggleEditMode}
      isSaving={isSaving}
      onOpenSettings={onOpenSettings}
      tenantId={tenantId}
      className={className}
    />
  );
};

export default KosWebAiFrontDock;
