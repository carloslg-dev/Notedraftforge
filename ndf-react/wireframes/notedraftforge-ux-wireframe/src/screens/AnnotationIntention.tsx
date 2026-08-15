import { C, F } from '../design-system'
import { Icon } from '../components/Icon'
import { AnnotModalShell } from '../components/AnnotModalShell'

export function AnnotationIntention({ onBack }: { onBack: () => void }) {
  return (
    <AnnotModalShell title="Intention" icon="intent" kind="intent" onBack={onBack}>
      <div style={{
        padding: '8px 10px', borderRadius: 8,
        background: C.intent.bg, color: C.intent.ink,
        fontFamily: F.ui, fontSize: 11,
        marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <Icon name="intent" size={12} color={C.intent.ink} />
        Personal — only you can see and write here.
      </div>
      <textarea
        defaultValue="Abrir el pecho, dejar que la palabra se vaya largo. Voz casi rota, sin vibrato."
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
