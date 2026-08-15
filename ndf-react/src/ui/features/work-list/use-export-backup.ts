import { useState, useCallback } from 'react';
import { ExportBackupUseCase } from '../../../core/application/piece-management/export-backup.use-case';
import { triggerDownload } from '../../lib/download';
import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';
import { DexieAnnotationRepository } from '../../../core/infrastructure/adapters/dexie/annotation-repository';
import { DexieSnapshotRepository } from '../../../core/infrastructure/adapters/dexie/snapshot-repository';
import { useAppError } from '../../hooks/use-app-error';

export function useExportBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const { handleError } = useAppError();

  const exportBackup = useCallback(async () => {
    setIsExporting(true);
    try {
      const pieceRepo = new DexiePieceRepository();
      const annotationRepo = new DexieAnnotationRepository();
      const snapshotRepo = new DexieSnapshotRepository();

      const useCase = new ExportBackupUseCase(pieceRepo, annotationRepo, snapshotRepo);
      const { filename, content } = await useCase.execute();

      triggerDownload(filename, content);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), { severity: 'error', title: 'Export Failed' });
    } finally {
      setIsExporting(false);
    }
  }, [handleError]);

  return { exportBackup, isExporting };
}
