import { describe, it, expect } from 'vitest';
import { ZodBackupValidator } from './zod-backup-validator';

describe('ZodBackupValidator', () => {
  const validator = new ZodBackupValidator();

  const mockUUID1 = '491f09c6-fae5-4a17-ba5d-9ef3eb706bf8';
  const mockUUID2 = 'db78887b-4028-4034-bc2c-7b0b65bf2d4c';
  const mockUUID3 = 'e1358db3-066e-4bd4-a02c-5678eb611db9';

  const validBackupObj = {
    version: '1',
    exportedAt: new Date().toISOString(),
    pieces: [
      {
        id: mockUUID1,
        title: 'My Song Draft',
        type: 'text',
        content: {
          kind: 'text',
          blocks: [
            {
              id: mockUUID2,
              kind: 'paragraph',
              runs: [
                {
                  id: mockUUID3,
                  text: 'This is a test run of writing.',
                  marks: ['bold', 'italic']
                }
              ]
            }
          ]
        },
        language: 'es',
        tags: [
          { kind: 'type', value: 'text' },
          { kind: 'user', value: 'Draft' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        revision: 3,
        annotations: [
          {
            id: '6095ee8c-ee14-4903-a261-267812bc8f42',
            pieceId: mockUUID1,
            target: {
              kind: 'text-range',
              blockId: mockUUID2,
              startOffset: 0,
              endOffset: 15
            },
            kind: 'comment',
            content: {
              shortNote: 'Check this line context'
            },
            layerId: 'comments',
            status: 'valid'
          }
        ],
        layerVisibility: {
          chord: true,
          meter: false,
          breath: false,
          intention: true,
          comments: true
        }
      }
    ]
  };

  it('successfully validates a correct backup JSON', () => {
    const json = JSON.stringify(validBackupObj);
    const result = validator.validate(json);
    expect(result.version).toBe('1');
    expect(result.pieces).toHaveLength(1);
    expect(result.pieces[0].title).toBe('My Song Draft');
    expect(result.pieces[0].annotations).toHaveLength(1);
  });

  it('rejects malformed JSON', () => {
    expect(() => validator.validate('{ invalid json }')).toThrow('Malformed JSON. Failed to parse.');
  });

  it('rejects backup with unsupported version', () => {
    const invalidObj = { ...validBackupObj, version: '2' };
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/Unsupported backup version/);
  });

  it('rejects backup when piece type does not match content kind', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].type = 'poem'; // doesn't match content.kind = 'text'
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/Piece type 'poem' does not match content kind 'text'/);
  });

  it('rejects backup when there is no type tag', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].tags = [{ kind: 'user', value: 'hello' }];
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/Piece must have exactly one type tag/);
  });

  it('rejects backup when type tag value does not match piece type', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].tags[0].value = 'poem'; // matches type tag kind=type but value=poem, piece type is text
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/Type tag value 'poem' does not match piece type 'text'/);
  });

  it('rejects invalid language codes', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].language = 'ES'; // Uppercase not allowed
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/Language must be lowercase/);
  });

  it('rejects invalid range offset bounds (startOffset >= endOffset)', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].annotations[0].target.startOffset = 20;
    invalidObj.pieces[0].annotations[0].target.endOffset = 10;
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/startOffset must be strictly less than endOffset/);
  });

  it('rejects when annotation pieceId does not match piece id', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].annotations[0].pieceId = 'f0123456-7890-4bcd-af01-234567890abc';
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/does not match piece ID/);
  });

  it('rejects when target blockId does not exist in piece content blocks', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].annotations[0].target.blockId = 'f0123456-7890-4bcd-af01-234567890abc';
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/Target blockId .* not found in piece content/);
  });

  it('rejects when annotation kind does not match layerId', () => {
    const invalidObj = JSON.parse(JSON.stringify(validBackupObj));
    invalidObj.pieces[0].annotations[0].layerId = 'breath'; // comment kind must go to comments layer
    expect(() => validator.validate(JSON.stringify(invalidObj))).toThrow(/Annotation kind 'comment' does not match layerId 'breath'/);
  });
});
