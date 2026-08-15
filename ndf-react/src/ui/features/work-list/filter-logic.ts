import type { Piece } from '../../../core/domain/types/';

export function computeVisiblePieces(pieces: Piece[]): Piece[] {
  return pieces.filter(piece => {
    const typeTag = piece.tags?.find(t => t.kind === 'type');
    const typeDisplay = typeTag ? typeTag.value : piece.type;
    return typeDisplay !== 'song';
  });
}

export function computeAvailableUserTags(visiblePieces: Piece[]): string[] {
  const tagMap = new Map<string, string>();
  visiblePieces.forEach(piece => {
    piece.tags?.filter(t => t.kind === 'user').forEach(tag => {
      const lower = tag.value.toLowerCase();
      if (!tagMap.has(lower)) {
        tagMap.set(lower, tag.value);
      }
    });
  });
  return Array.from(tagMap.values()).sort((a, b) => a.localeCompare(b));
}

export function computeFilteredPieces(
  visiblePieces: Piece[],
  activeTypeFilters: string[],
  activeUserFilters: string[]
): Piece[] {
  return visiblePieces.filter(piece => {
    const typeTag = piece.tags?.find(t => t.kind === 'type');
    const typeDisplay = typeTag ? typeTag.value : piece.type;

    if (activeTypeFilters.length > 0) {
      if (!activeTypeFilters.includes(typeDisplay)) {
        return false;
      }
    }

    if (activeUserFilters.length > 0) {
      const pieceUserTags = piece.tags?.filter(t => t.kind === 'user').map(t => t.value.toLowerCase()) || [];
      const hasAllTags = activeUserFilters.every(filterTag =>
        pieceUserTags.includes(filterTag.toLowerCase())
      );
      if (!hasAllTags) {
        return false;
      }
    }

    return true;
  });
}
