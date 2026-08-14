import type { BackupValidatorPort } from '../../ports/backup-validator.port';
import type { BackupData } from '../../application/piece-management/export-backup.use-case';
import { backupDataSchema } from './backup-schema';

export class ZodBackupValidator implements BackupValidatorPort {
  validate(jsonString: string): BackupData {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Malformed JSON. Failed to parse.');
    }

    const result = backupDataSchema.safeParse(parsed);
    if (!result.success) {
      const formattedErrors = result.error.issues.map(err => {
        const path = err.path.join('.');
        const prefix = path ? `[${path}] ` : '';
        return `${prefix}${err.message}`;
      }).join('; ');
      
      throw new Error(`Backup schema validation failed: ${formattedErrors}`);
    }

    return result.data as BackupData;
  }
}
