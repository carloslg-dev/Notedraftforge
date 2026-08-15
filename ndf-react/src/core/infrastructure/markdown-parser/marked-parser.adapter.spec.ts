import { describe, it, expect } from 'vitest';
import { MarkedParserAdapter } from './marked-parser.adapter';

describe('MarkedParserAdapter', () => {
  it('parses headings and paragraphs with runs', () => {
    const parser = new MarkedParserAdapter();
    const blocks = parser.parse('# Heading\n\nThis is a paragraph with **bold** and *italic*.');

    expect(blocks).toHaveLength(2);

    expect(blocks[0].kind).toBe('heading');
    expect(blocks[0].runs).toHaveLength(1);
    expect(blocks[0].runs[0].text).toBe('Heading');

    expect(blocks[1].kind).toBe('paragraph');
    expect(blocks[1].runs).toHaveLength(5);
    expect(blocks[1].runs[0].text).toBe('This is a paragraph with ');
    expect(blocks[1].runs[1].text).toBe('bold');
    expect(blocks[1].runs[1].marks).toContain('bold');
    expect(blocks[1].runs[2].text).toBe(' and ');
    expect(blocks[1].runs[3].text).toBe('italic');
    expect(blocks[1].runs[3].marks).toContain('italic');
    expect(blocks[1].runs[4].text).toBe('.');
  });

  it('silently ignores unsupported structures like tables and code blocks', () => {
    const parser = new MarkedParserAdapter();
    const blocks = parser.parse('# Heading\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```\ncode\n```\n\nText');

    expect(blocks).toHaveLength(2);
    expect(blocks[0].kind).toBe('heading');
    expect(blocks[1].kind).toBe('paragraph');
    expect(blocks[1].runs[0].text).toBe('Text');
  });

  it('parses blockquotes', () => {
    const parser = new MarkedParserAdapter();
    const blocks = parser.parse('> This is a quote.');

    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe('quote');
    expect(blocks[0].runs[0].text).toBe('This is a quote.');
  });

  it('parses HTML underline tags with nested formatting', () => {
    const parser = new MarkedParserAdapter();
    const blocks = parser.parse('This is <u>underlined</u> text with **<u>underlined bold</u>** and <u>*underlined italic*</u>.');

    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe('paragraph');
    
    const runs = blocks[0].runs;
    expect(runs).toHaveLength(7);

    expect(runs[0].text).toBe('This is ');
    expect(runs[0].marks).toBeUndefined();

    expect(runs[1].text).toBe('underlined');
    expect(runs[1].marks).toContain('underline');

    expect(runs[2].text).toBe(' text with ');
    expect(runs[2].marks).toBeUndefined();

    expect(runs[3].text).toBe('underlined bold');
    expect(runs[3].marks).toContain('underline');
    expect(runs[3].marks).toContain('bold');

    expect(runs[4].text).toBe(' and ');
    expect(runs[4].marks).toBeUndefined();

    expect(runs[5].text).toBe('underlined italic');
    expect(runs[5].marks).toContain('underline');
    expect(runs[5].marks).toContain('italic');

    expect(runs[6].text).toBe('.');
    expect(runs[6].marks).toBeUndefined();
  });
});
