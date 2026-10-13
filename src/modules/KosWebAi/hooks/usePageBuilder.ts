import { usePageBuilderContext, PageBuilderContextValue } from '../context/PageBuilderContext';

/**
 * Main hook to consume PageBuilder state and core operations
 */
export const usePageBuilder = (): PageBuilderContextValue => {
  return usePageBuilderContext();
};

export default usePageBuilder;
