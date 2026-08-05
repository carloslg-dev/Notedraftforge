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
        if (token.raw === '<u>') {
          currentUnderline = true;
        } else if (token.raw === '</u>') {
          currentUnderline = false;
        }
      } else if (token.type === 'text') {
        const run = this.createTextRun(token.text);
        if (currentUnderline) {
          run.marks = [...(run.marks || []), 'underline'];
        }
        runs.push(run);
      } else if (token.type === 'strong') {
        const strongRuns = this.mapRuns(
          token.tokens || [{ type: 'text', raw: token.raw, text: token.raw } as Token],
          currentUnderline
        );
        for (const run of strongRuns) {
          run.marks = [...(run.marks || []), 'bold'];
          runs.push(run);
        }
      } else if (token.type === 'em') {
        const emRuns = this.mapRuns(
          token.tokens || [{ type: 'text', raw: token.raw, text: token.raw } as Token],
          currentUnderline
        );
        for (const run of emRuns) {
          run.marks = [...(run.marks || []), 'italic'];
          runs.push(run);
        }
      } else if (token.type === 'del' || token.type === 'codespan' || token.type === 'link') {
        if ('tokens' in token && token.tokens) {
          runs.push(...this.mapRuns(token.tokens, currentUnderline));
        } else {
          const text = 'text' in token && typeof token.text === 'string' ? token.text : token.raw;
          const run = this.createTextRun(text);
          if (currentUnderline) {
            run.marks = [...(run.marks || []), 'underline'];
          }
          runs.push(run);
        }
      } else if (token.type === 'escape' || token.type === 'br') {
        const run = this.createTextRun(token.raw);
        if (currentUnderline) {
          run.marks = [...(run.marks || []), 'underline'];
        }
        runs.push(run);
      }
    }

    return runs.filter(run => run.text.length > 0);
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
