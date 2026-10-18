/**
 * KoSeoPowerEngin - Custom Hooks
 * KOSUN26 Modular Layer: Hooks
 */

import { useKoSeoPowerContext } from '../context/KoSeoPowerContext';

export const useKoSeoPower = () => {
  return useKoSeoPowerContext();
};
