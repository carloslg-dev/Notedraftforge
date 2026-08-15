import { describe, it, expect } from 'vitest';
import { domainToTiptap, tiptapToDomain } from './tiptap-mapper';
import { PieceContent } from '../../../domain/types/';
import type { JSONContent } from '@tiptap/core';

describe('tiptap-mapper', () => {
  it('maps simple text domain content to tiptap json', () => {
    const content: PieceContent = {
      kind: 'text',
      blocks: [
        {
          id: 'block-1',
          kind: 'paragraph',
          runs: [
            {
              id: 'run-1',
              text: 'Hello world',
            }
          ]
        }
      ]
    };

    const expected: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { id: 'block-1' },
          content: [
            {
              type: 'text',
              text: 'Hello world'
            }
          ]
        }
      ]
    };

    expect(domainToTiptap(content)).toEqual(expected);
  });

  it('maps domain content with marks (bold, italic, underline) to tiptap json', () => {
    const content: PieceContent = {
      kind: 'text',
      blocks: [
        {
          id: 'block-2',
          kind: 'paragraph',
          runs: [
            {
              id: 'run-2',
              text: 'Styled text',
              marks: ['bold', 'italic', 'underline']
            }
          ]
        }
      ]
    };

    const expected: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { id: 'block-2' },
          content: [
            {
              type: 'text',
              text: 'Styled text',
              marks: [
                { type: 'bold' },
                { type: 'italic' },
                { type: 'underline' }
              ]
            }
          ]
        }
      ]
    };

    expect(domainToTiptap(content)).toEqual(expected);
  });

  it('maps heading and blockquote blocks to tiptap json', () => {
     const content: PieceContent = {
       kind: 'text',
       blocks: [
         {
           id: 'heading-1',
           kind: 'heading',
           runs: [{ id: 'r1', text: 'Title' }]
         },
         {
           id: 'quote-1',
           kind: 'quote',
           runs: [{ id: 'r2', text: 'To be or not to be' }]
         }
       ]
     };

     const expected: JSONContent = {
       type: 'doc',
       content: [
         {
           type: 'heading',
           attrs: { id: 'heading-1', level: 1 },
           content: [
             { type: 'text', text: 'Title' }
           ]
         },
         {
           type: 'blockquote',
           attrs: { id: 'quote-1' },
           content: [
             { type: 'text', text: 'To be or not to be' }
           ]
         }
       ]
     };

     expect(domainToTiptap(content)).toEqual(expected);
  });

  it('maps tiptap json back to domain and preserves block ids', () => {
    const json: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { id: 'block-3' },
          content: [
            {
              type: 'text',
              text: 'Round trip'
            }
          ]
        }
      ]
    };

    const result = tiptapToDomain(json, 'text');

    expect(result.kind).toBe('text');
    if (result.kind === 'text') {
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].id).toBe('block-3');
      expect(result.blocks[0].kind).toBe('paragraph');
      expect(result.blocks[0].runs).toHaveLength(1);
      expect(result.blocks[0].runs[0].text).toBe('Round trip');
      expect(result.blocks[0].runs[0].id).toBeDefined(); // should be a UUID
    }
  });

  it('maps tiptap json marks (bold, italic, underline) back to domain', () => {
    const json: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { id: 'block-4' },
          content: [
            {
              type: 'text',
              text: 'BoldItalic',
              marks: [{ type: 'bold' }, { type: 'italic' }]
            }
          ]
        }
      ]
    };

    const result = tiptapToDomain(json, 'text');

    if (result.kind === 'text') {
      expect(result.blocks[0].runs[0].marks).toEqual(['bold', 'italic']);
    }
  });

  it('handles missing block ids by generating new ones', () => {
    const json: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'No ID here'
            }
          ]
        }
      ]
    };

    const result = tiptapToDomain(json, 'poem');

    if (result.kind === 'poem') {
      expect(result.blocks[0].id).toBeDefined();
      expect(typeof result.blocks[0].id).toBe('string');
      expect(result.blocks[0].id.length).toBeGreaterThan(0);
    }
  });

  it('handles hardBreak by mapping it to a newline text run', () => {
    const json: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { id: 'block-5' },
          content: [
            { type: 'text', text: 'Line 1' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Line 2' }
          ]
        }
      ]
    };

    const result = tiptapToDomain(json, 'text');

    if (result.kind === 'text') {
      expect(result.blocks[0].runs).toHaveLength(3);
      expect(result.blocks[0].runs[0].text).toBe('Line 1');
      expect(result.blocks[0].runs[1].text).toBe('\n');
      expect(result.blocks[0].runs[2].text).toBe('Line 2');
    }
  });
});
