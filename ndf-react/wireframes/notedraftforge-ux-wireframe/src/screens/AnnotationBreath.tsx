import { useState } from 'react'
import { C, F } from '../design-system'
import { AnnotModalShell } from '../components/AnnotModalShell'

export function AnnotationBreath({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<'S' | 'L'>('L')

  return (
    <AnnotModalShell title="Breath" icon="breath" kind="breath" onBack={onBack}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {([
          { mark: 'S' as const, label: 'Short', desc: '½ beat pause' },
          { mark: 'L' as const, label: 'Long',  desc: 'Full rest' },
        ]).map(opt => (
          <button key={opt.mark} onClick={() => setSelected(opt.mark)} style={{
            padding: '24px 18px', borderRadius: 14, cursor: 'pointer',
            border: `${selected === opt.mark ? 2 : 1}px solid ${selected === opt.mark ? C.breath.ink : C.line}`,
            background: selected === opt.mark ? C.breath.bg : C.surface,
            textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <span style={{ fontFamily: F.ui, fontSize: 38, fontWeight: 700, color: selected === opt.mark ? C.breath.ink : C.ink }}>{opt.mark}</span>
            <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 500, color: C.ink }}>{opt.label}</span>
            <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>{opt.desc}</span>
          </button>
        ))}
      </div>
    </AnnotModalShell>
  )
}
