import type { BackupData } from '../application/piece-management/export-backup.use-case';

export interface BackupValidatorPort {
  validate(jsonString: string): BackupData;
}
