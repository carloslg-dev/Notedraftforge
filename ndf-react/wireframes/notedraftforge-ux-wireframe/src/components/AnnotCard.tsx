import { C, F, type AnnotCard } from '../design-system'
import { AnnotKindTag } from './Primitives'

// Simple annotation summary — kept for potential reuse.
// In the current wireframe, the visualization sidebar uses the inline
// ActiveAnn panel (extended note on selection) rather than a static list.

export function AnnotCardItem({ card }: { card: AnnotCard }) {
  return (
    <div style={{
      borderRadius: 10, padding: '12px 14px',
      border: `1px solid ${C.lineSoft}`,
      background: C.surface,
    }}>
      <AnnotKindTag kind={card.kind} />
      <div style={{
        marginTop: 6,
        fontFamily: F.ui, fontSize: 12, fontWeight: 500,
        color: C.ink, lineHeight: 1.4,
      }}>
        {card.shortNote}
      </div>
      <div style={{
        marginTop: 4,
        fontFamily: F.ui, fontSize: 11,
        color: C.inkMute, lineHeight: 1.5,
      }}>
        {card.extendedNote}
      </div>
      <div style={{
        marginTop: 8,
        fontFamily: F.mono, fontSize: 10, color: C.inkSoft,
      }}>
        {card.anchor}
      </div>
    </div>
  )
}
