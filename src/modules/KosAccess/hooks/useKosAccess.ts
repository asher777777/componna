import { useKosAccessContext } from '../context/KosAccessContext';

export const useKosAccess = () => {
  return useKosAccessContext();
};

export default useKosAccess;
