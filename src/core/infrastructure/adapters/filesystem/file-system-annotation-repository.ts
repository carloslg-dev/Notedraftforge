import type { Annotation } from '../../../../core/domain/types/index';
import type { AnnotationRepository } from '../../../../core/ports/annotation-repository';

export class FileSystemAnnotationRepository implements AnnotationRepository {
  private readonly configFolder = '.notedraftforge';
  private readonly annotationsFile = 'annotations.json';

  constructor(private readonly dirHandle: FileSystemDirectoryHandle) {}

  private async getAnnotationsFileHandle(create = false): Promise<FileSystemFileHandle | null> {
    try {
      const configDir = await this.dirHandle.getDirectoryHandle(this.configFolder, { create });
      return await configDir.getFileHandle(this.annotationsFile, { create });
    } catch {
      return null;
    }
  }

  private async readAllAnnotations(): Promise<Annotation[]> {
    const fileHandle = await this.getAnnotationsFileHandle(false);
    if (!fileHandle) return [];
    try {
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as Annotation[];
    } catch {
      return [];
    }
  }

  private async writeAllAnnotations(annotations: Annotation[]): Promise<void> {
    const fileHandle = await this.getAnnotationsFileHandle(true);
    if (!fileHandle) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writable = await (fileHandle as any).createWritable();
    await writable.write(JSON.stringify(annotations, null, 2));
    await writable.close();
  }

  async getByPieceId(pieceId: string): Promise<Annotation[]> {
    const all = await this.readAllAnnotations();
    return all.filter(a => a.pieceId === pieceId);
  }

  async save(annotation: Annotation): Promise<void> {
    const all = await this.readAllAnnotations();
    const idx = all.findIndex(a => a.id === annotation.id);
    if (idx >= 0) {
      all[idx] = annotation;
    } else {
      all.push(annotation);
    }
    await this.writeAllAnnotations(all);
  }

  async delete(id: string): Promise<void> {
    const all = await this.readAllAnnotations();
    const filtered = all.filter(a => a.id !== id);
    await this.writeAllAnnotations(filtered);
  }

  async deleteByPieceId(pieceId: string): Promise<void> {
    const all = await this.readAllAnnotations();
    const filtered = all.filter(a => a.pieceId !== pieceId);
    await this.writeAllAnnotations(filtered);
  }
}
