import { useKesherPaymentsContext } from '../context/KesherPaymentsContext';

export const useKesherPayments = () => {
  return useKesherPaymentsContext();
};
