import type { Piece } from '../../../../core/domain/types/index';
import type { PieceRepository } from '../../../../core/ports/piece-repository';
import { parseYamlMarkdownToPiece, serializePieceToYamlMarkdown } from '../../markdown/yaml-frontmatter';

export class FileSystemPieceRepository implements PieceRepository {
  constructor(private readonly dirHandle: FileSystemDirectoryHandle) {}

  async getAll(): Promise<Piece[]> {
    const pieces: Piece[] = [];

    // Iterate directory entries for .md files
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const entry of (this.dirHandle as any).values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        try {
          const file = await entry.getFile();
          const text = await file.text();
          const piece = parseYamlMarkdownToPiece(text, entry.name.replace(/\.md$/, ''));
          pieces.push(piece);
        } catch (err) {
          console.warn(`Failed to parse Markdown file ${entry.name}:`, err);
        }
      }
    }

    return pieces.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getById(id: string): Promise<Piece | null> {
    const allPieces = await this.getAll();
    return allPieces.find(p => p.id === id) || null;
  }

  async save(piece: Piece): Promise<void> {
    const filename = `${this.slugify(piece.title)}_${piece.id}.md`;
    const content = serializePieceToYamlMarkdown(piece);

    // Get file handle and create writer stream
    const fileHandle = await this.dirHandle.getFileHandle(filename, { create: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writable = await (fileHandle as any).createWritable();
    await writable.write(content);
    await writable.close();
  }

  async delete(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const entry of (this.dirHandle as any).values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        try {
          const file = await entry.getFile();
          const text = await file.text();
          const piece = parseYamlMarkdownToPiece(text, entry.name);
          if (piece.id === id) {
            await this.dirHandle.removeEntry(entry.name);
            break;
          }
        } catch {
          // ignore error
        }
      }
    }
  }

  private slugify(text: string): string {
    const slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-');
    let start = 0;
    while (start < slug.length && slug[start] === '-') {
      start++;
    }
    let end = slug.length;
    while (end > start && slug[end - 1] === '-') {
      end--;
    }
    const trimmed = slug.slice(start, end);
    return trimmed.length > 0 ? trimmed : 'piece';
  }
}
