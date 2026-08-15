import { C, F } from '../design-system'
import { Icon } from '../components/Icon'
import { AnnotModalShell } from '../components/AnnotModalShell'

export function AnnotationComment({ onBack }: { onBack: () => void }) {
  return (
    <AnnotModalShell title="Comment" icon="comment" kind="comment" onBack={onBack}>
      <div style={{
        padding: '8px 10px', borderRadius: 8,
        background: C.comment.bg, color: C.comment.ink,
        fontFamily: F.ui, fontSize: 11,
        marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <Icon name="comment" size={12} color={C.comment.ink} />
        Editorial note — visible in the comments layer.
      </div>
      <textarea
        placeholder="Write your editorial comment…"
        style={{
          width: '100%', minHeight: 120, padding: 14, borderRadius: 10,
          border: `1px solid ${C.line}`, background: C.surface,
          fontFamily: F.serif, fontSize: 15, lineHeight: 1.6, color: C.ink,
          resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </AnnotModalShell>
  )
}
