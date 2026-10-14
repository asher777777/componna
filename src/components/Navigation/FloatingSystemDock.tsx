import React from 'react';
import { KosunUniversalDock, KosunUniversalDockProps } from './KosunUniversalDock';
import { KosNevModal, KosNevModalProps } from './KosNevModal';

export { KosunUniversalDock, KosNevModal };
export type { KosunUniversalDockProps, KosNevModalProps };

// Backward compatibility alias for CashwanDynamicMenu
export interface CashwanDynamicMenuProps extends Partial<KosNevModalProps> {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onEnterDevWorkbench?: () => void;
  onGoToHome?: () => void;
  activeModules?: string[];
  isSubdomain?: boolean;
}

export const CashwanDynamicMenu: React.FC<CashwanDynamicMenuProps> = (props) => {
  return <KosNevModal {...props} />;
};

// Backward compatibility alias for FloatingSystemDock
export interface FloatingSystemDockProps extends KosunUniversalDockProps {}

export const FloatingSystemDock: React.FC<FloatingSystemDockProps> = (props) => {
  return <KosunUniversalDock {...props} />;
};

export default KosunUniversalDock;
