import { C, F, kindStyle, type AnnotKind } from '../design-system'
import { Icon, type IconName } from './Icon'
import { Btn, IconBtn } from './Primitives'

const ANNOT_ANCHORS: Record<AnnotKind, string> = {
  intent:  '"pájaro cansado"',
  comment: '"lo que se va en silencio"',
  breath:  'after "últimas monedas"',
}

// Shared modal shell: dim overlay + centered card — used by all annotation screens.

export function AnnotModalShell({ title, icon, kind, onBack, children }: {
  title: string
  icon: IconName
  kind: AnnotKind
  onBack: () => void
  children: React.ReactNode
}) {
  const ks = kindStyle(kind)
  return (
    <div style={{
      width: '100%', maxWidth: 1280, minHeight: 820,
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${C.lineSoft}`,
      background: `linear-gradient(180deg, ${C.surfaceAlt} 0%, ${C.lineSoft} 100%)`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Dim overlay behind the modal card */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(32,33,36,0.28)' }} />

      {/* Modal card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 520,
        background: C.surface, borderRadius: 16,
        border: `1px solid ${C.lineSoft}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.lineSoft}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: ks.bg, color: ks.ink,
              }}>
                <Icon name={icon} size={14} color={ks.ink} />
              </span>
              <span style={{ fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: C.ink }}>
                {title}
              </span>
            </div>
            <div style={{ marginTop: 4, fontFamily: F.ui, fontSize: 12, color: C.inkSoft, paddingLeft: 34 }}>
              Anchored to {ANNOT_ANCHORS[kind]}
            </div>
          </div>
          <IconBtn name="close" onClick={onBack} />
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>{children}</div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: `1px solid ${C.lineSoft}`,
          background: C.surfaceAlt,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <Btn variant="outline" onClick={onBack}>Cancel</Btn>
          <Btn variant="accent" icon="check">Save</Btn>
        </div>
      </div>
    </div>
  )
}
