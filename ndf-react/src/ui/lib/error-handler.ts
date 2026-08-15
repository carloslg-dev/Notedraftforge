import { toast } from 'sonner';

type ErrorSeverity = 'info' | 'warning' | 'error';

interface AppErrorOptions {
  severity?: ErrorSeverity;
  title?: string;
  description?: string;
}

export function dispatchAppError(error: unknown, options?: AppErrorOptions) {
  const severity = options?.severity || 'error';
  const title = options?.title || 'An error occurred';
  const message = error instanceof Error ? error.message : String(error);
  const description = options?.description || message;

  switch (severity) {
    case 'error':
      toast.error(title, {
        description,
      });
      break;
    case 'warning':
      toast.warning(title, {
        description,
      });
      break;
    case 'info':
      toast.info(title, {
        description,
      });
      break;
  }
}
