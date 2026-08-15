import type { TextBlock } from '../domain/types/';

export interface MarkdownParserPort {
  parse(markdown: string): TextBlock[];
}
