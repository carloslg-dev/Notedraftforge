import { marked, Token } from 'marked';
import type { TextBlock, TextRun, TextMark } from '../../domain/types/';
import type { MarkdownParserPort } from '../../ports/';
import { randomUUID } from '../../domain/uuid';
import { parseYamlFrontmatter } from '../markdown/yaml-frontmatter';

export class MarkedParserAdapter implements MarkdownParserPort {
  parse(markdown: string): TextBlock[] {
    const { body } = parseYamlFrontmatter(markdown);
    const tokens = marked.lexer(body);
    const blocks: TextBlock[] = [];

    for (const token of tokens) {
      const block = this.mapBlock(token);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  private mapBlock(token: Token): TextBlock | null {
    switch (token.type) {
      case 'heading':
        return {
          id: randomUUID(),
          kind: 'heading',
          runs: this.mapRuns(token.tokens || []),
        };
      case 'paragraph':
        return {
          id: randomUUID(),
          kind: 'paragraph',
          runs: this.mapRuns(token.tokens || []),
        };
      case 'blockquote': {
        // Blockquote can contain nested blocks (e.g., paragraphs)
        // For simplicity as per MVP and D-05, we just flatten inner text into one blockquote
        // or extract runs from inner paragraphs.
        const runs = token.tokens?.flatMap((child: Token) => {
          if (child.type === 'paragraph') {
            return this.mapRuns(child.tokens || []);
          }
          if (child.type === 'text') {
            return [this.createTextRun(child.raw)];
          }
          return [];
        }) || [this.createTextRun(token.text)];

        return {
          id: randomUUID(),
          kind: 'quote',
          runs: runs.length > 0 ? runs : [this.createTextRun(token.text)],
        };
      }
      default:
        // Ignore unsupported blocks (lists, tables, code, html, hr, etc.)
        return null;
    }
  }

  private mapRuns(tokens: Token[], isUnderlined = false): TextRun[] {
    const runs: TextRun[] = [];
    let currentUnderline = isUnderlined;

    for (const token of tokens) {
      if (token.type === 'html') {
        currentUnderline = this.resolveUnderlineState(token.raw, currentUnderline);
      } else {
        runs.push(...this.mapSingleTokenRuns(token, currentUnderline));
      }
    }

    return runs.filter(run => run.text.length > 0);
  }

  private resolveUnderlineState(raw: string, current: boolean): boolean {
    if (raw === '<u>') return true;
    if (raw === '</u>') return false;
    return current;
  }

  private mapSingleTokenRuns(token: Token, isUnderlined: boolean): TextRun[] {
    switch (token.type) {
      case 'text':
        return [this.createTextRunWithUnderline(token.text, isUnderlined)];
      case 'strong':
        return this.mapMarkedRuns(token, 'bold', isUnderlined);
      case 'em':
        return this.mapMarkedRuns(token, 'italic', isUnderlined);
      case 'del':
      case 'codespan':
      case 'link':
        return this.mapFallbackInlineToken(token, isUnderlined);
      case 'escape':
      case 'br':
        return [this.createTextRunWithUnderline(token.raw, isUnderlined)];
      default:
        return [];
    }
  }

  private mapMarkedRuns(token: Token, mark: TextMark, isUnderlined: boolean): TextRun[] {
    const innerTokens = ('tokens' in token && token.tokens) ? token.tokens : [{ type: 'text', raw: token.raw, text: token.raw } as Token];
    const runs = this.mapRuns(innerTokens, isUnderlined);
    for (const run of runs) {
      run.marks = [...(run.marks || []), mark];
    }
    return runs;
  }

  private mapFallbackInlineToken(token: Token, isUnderlined: boolean): TextRun[] {
    if ('tokens' in token && token.tokens) {
      return this.mapRuns(token.tokens, isUnderlined);
    }
    const text = 'text' in token && typeof token.text === 'string' ? token.text : token.raw;
    return [this.createTextRunWithUnderline(text, isUnderlined)];
  }

  private createTextRunWithUnderline(text: string, isUnderlined: boolean): TextRun {
    const run = this.createTextRun(text);
    if (isUnderlined) {
      run.marks = [...(run.marks || []), 'underline'];
    }
    return run;
  }

  private createTextRun(text: string, marks?: TextMark[]): TextRun {
    const run: TextRun = {
      id: randomUUID(),
      text,
    };
    if (marks && marks.length > 0) {
      run.marks = marks;
    }
    return run;
  }
}
