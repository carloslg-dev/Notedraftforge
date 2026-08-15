import { describe, it, expect } from 'vitest';
import { createChord, deriveChordDisplay } from '../factories/chord';
import { SongCell } from '../types/piece';

describe('Chord Domain Logic', () => {
  describe('createChord', () => {
    it('creates a simple valid chord', () => {
      const chord = createChord('C');
      expect(chord.root).toBe('C');
      expect(chord.modifiers).toEqual([]);
      expect(chord.display).toBe('C');
    });

    it('creates a chord with an accidental in root', () => {
      const chord = createChord('C#');
      expect(chord.root).toBe('C');
      expect(chord.modifiers).toEqual(['sharp']);
      expect(chord.display).toBe('C♯');

      const chord2 = createChord('Bb');
      expect(chord2.root).toBe('B');
      expect(chord2.modifiers).toEqual(['flat']);
      expect(chord2.display).toBe('B♭');
    });

    it('rejects duplicate alterations (e.g. C# and sharp)', () => {
      expect(() => createChord('C#', ['sharp'])).toThrow('A chord cannot have multiple alterations');
    });

    it('rejects conflicting alterations (e.g. C# and flat)', () => {
      expect(() => createChord('C#', ['flat', 'minor', 'seventh'])).toThrow('A chord cannot have multiple alterations');
    });

    it('creates a complex chord with an accidental in root', () => {
      const chord = createChord('C#', ['minor', 'seventh']);
      expect(chord.root).toBe('C');
      expect(chord.modifiers).toEqual(['sharp', 'minor', 'seventh']);
      expect(chord.display).toBe('C♯m7');
    });

    it('creates a chord with a single modifier', () => {
      const chord = createChord('A', ['minor']);
      expect(chord.root).toBe('A');
      expect(chord.modifiers).toEqual(['minor']);
      expect(chord.display).toBe('Am');
    });

    it('orders modifiers correctly: alteration, mode, extension', () => {
      const chord1 = createChord('G', ['minor', 'seventh', 'flat']);
      expect(chord1.root).toBe('G');
      expect(chord1.modifiers).toEqual(['flat', 'minor', 'seventh']);
      expect(chord1.display).toBe('G♭m7');

      const chord2 = createChord('D', ['seventh', 'sharp']);
      expect(chord2.root).toBe('D');
      expect(chord2.modifiers).toEqual(['sharp', 'seventh']);
      expect(chord2.display).toBe('D♯7');
    });

    it('rejects invalid roots', () => {
      expect(() => createChord('H')).toThrow('Invalid root note: H. Must be A-G with optional accidental.');
      expect(() => createChord('c')).toThrow('Invalid root note: c. Must be A-G with optional accidental.');
      expect(() => createChord('C##')).toThrow('Invalid root note: C##. Must be A-G with optional accidental.');
    });

    it('rejects invalid modifiers', () => {
      expect(() => createChord('C', ['diminished'])).toThrow('Invalid modifiers found: diminished');
    });

    it('rejects mutually exclusive alterations', () => {
      expect(() => createChord('C', ['sharp', 'flat'])).toThrow('A chord cannot have multiple alterations');
    });

    it('rejects mutually exclusive modes', () => {
      expect(() => createChord('C', ['minor', 'major'])).toThrow('A chord cannot have multiple modes');
    });
  });

  describe('deriveChordDisplay', () => {
    it('correctly maps roots and modifiers to display strings', () => {
      expect(deriveChordDisplay({ root: 'C', modifiers: [] })).toBe('C');
      expect(deriveChordDisplay({ root: 'F', modifiers: ['sharp'] })).toBe('F♯');
      expect(deriveChordDisplay({ root: 'B', modifiers: ['flat'] })).toBe('B♭');
      expect(deriveChordDisplay({ root: 'A', modifiers: ['minor'] })).toBe('Am');
      expect(deriveChordDisplay({ root: 'E', modifiers: ['major', 'seventh'] })).toBe('EM7');
      expect(deriveChordDisplay({ root: 'G', modifiers: ['sharp', 'minor', 'seventh'] })).toBe('G♯m7');
    });
  });

  describe('Invariants', () => {
    it('Invariant 11: chord and meter values belong to SongCell in song content', () => {
      const cell: SongCell = {
        id: 'cell-1',
        text: 'lyrics',
        chord: createChord('C', ['major']),
        meter: '4/4'
      };

      expect(cell.chord).toBeDefined();
      expect(cell.chord?.root).toBe('C');
      expect(cell.meter).toBe('4/4');
    });
  });
});
