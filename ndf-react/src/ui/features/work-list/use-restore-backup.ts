import { useState, useCallback } from 'react';
import { RestoreBackupUseCase } from '../../../core/application/piece-management/restore-backup.use-case';
import { ZodBackupValidator } from '../../../core/infrastructure/validation/zod-backup-validator';
import { DexieSystemRestoreRepository } from '../../../core/infrastructure/adapters/dexie/system-restore-repository';
import { useAppError } from '../../hooks/use-app-error';
import { toast } from 'sonner';

export function useRestoreBackup() {
  const [isRestoring, setIsRestoring] = useState(false);
  const { handleError } = useAppError();

  const restoreBackup = useCallback(
    async (jsonString: string): Promise<boolean> => {
      setIsRestoring(true);
      try {
        const validator = new ZodBackupValidator();
        const systemRestoreRepo = new DexieSystemRestoreRepository();

        const useCase = new RestoreBackupUseCase(validator, systemRestoreRepo);
        await useCase.execute(jsonString);

        toast.success('Backup restored successfully!');
        return true;
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: 'error',
          title: 'Restore Failed',
        });
        return false;
      } finally {
        setIsRestoring(false);
      }
    },
    [handleError]
  );

  return { restoreBackup, isRestoring };
}
