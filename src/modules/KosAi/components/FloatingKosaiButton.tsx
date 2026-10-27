import React from 'react';
import { KosunUniversalDock } from '../../../components/Navigation/KosunUniversalDock';

/**
 * FloatingKosaiButton - Canonical Global Floating Dock for KOSUN26.
 * Automatically delegates to KosunUniversalDock with global collision prevention.
 * If a front page mounts its own dock (with live edit controls), this global dock cleanly steps aside.
 */
export const FloatingKosaiButton: React.FC = () => {
  return <KosunUniversalDock isGlobalFallback={true} />;
};

export default FloatingKosaiButton;
