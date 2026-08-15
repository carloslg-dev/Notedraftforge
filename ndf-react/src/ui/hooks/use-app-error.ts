import { useCallback } from 'react';
import { dispatchAppError } from '@/ui/lib/error-handler';

export function useAppError() {
  const handleError = useCallback((error: unknown, options?: Parameters<typeof dispatchAppError>[1]) => {
    dispatchAppError(error, options);
  }, []);

  return { handleError };
}
