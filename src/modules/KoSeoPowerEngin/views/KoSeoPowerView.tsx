/**
 * KoSeoPowerEngin - Main View
 * KOSUN26 Modular Layer: Views
 */

import React from 'react';
import { KoSeoPowerHub } from '../components/KoSeoPowerHub';

export interface KoSeoPowerViewProps {
  onBackToPages?: () => void;
}

export const KoSeoPowerView: React.FC<KoSeoPowerViewProps> = ({ onBackToPages }) => {
  return <KoSeoPowerHub onBackToPages={onBackToPages} />;
};

export default KoSeoPowerView;
