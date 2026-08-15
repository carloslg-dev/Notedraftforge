// Contextual floating toolbar — appears when text is selected.
//
// Two modes, same visual container:
//   'edit' — Bold / Italic / Underline / Strikethrough + Refine
//   'view' — Intent / Comment / Breath annotation shortcuts + Refine
//
// Position 'above' | 'below' is decided by the caller based on whether the
// selection is in the upper or lower half of the viewport.

import { C, F, type AnnotKind } from '../design-system'

const BG     = 'rgba(255,255,255,0.96)'
const FG     = C.ink
const FG_ACT = C.accentInk
const SEP    = C.line

function TBtn({ label, onClick, active }: {
  label: React.ReactNode; onClick?: () => void; active?: boolean
}) {
  return (
    <button onClick={onClick} style={{
      height: 38, padding: '0 12px',
      border: 0,
      background: active ? C.accentSoft : 'transparent',
      color: active ? FG_ACT : FG,
      fontFamily: F.ui, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {label}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: SEP, flexShrink: 0, margin: '0 2px' }} />
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
}

export function SelectionToolbar({
  mode,
  position = 'above',
  onRefine,
  onAnnotate,
  activeFormats = {},
}: {
  mode: 'edit' | 'view'
  position?: 'above' | 'below'
  onRefine?: () => void
  onAnnotate?: (kind: AnnotKind) => void
  activeFormats?: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean }
}) {
  const bar = (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 1,
      background: BG, borderRadius: 999, padding: '0 5px',
      border: `1px solid ${C.lineSoft}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
      backdropFilter: 'blur(14px)',
    }}>
      {mode === 'edit' ? (
        <>
          <TBtn active={activeFormats.bold}      label={<b>B</b>} />
          <TBtn active={activeFormats.italic}    label={<i style={{ fontStyle: 'italic' }}>I</i>} />
          <TBtn active={activeFormats.underline} label={<span style={{ textDecoration: 'underline' }}>U</span>} />
          <TBtn active={activeFormats.strike}    label={<span style={{ textDecoration: 'line-through' }}>S</span>} />
          <Divider />
        </>
      ) : (
        <>
          <TBtn onClick={() => onAnnotate?.('intent')}  label={<><Dot color={C.intent.border} /> Intent</>} />
          <TBtn onClick={() => onAnnotate?.('comment')} label={<><Dot color={C.comment.border}/> Comment</>} />
          <TBtn onClick={() => onAnnotate?.('breath')}  label={<><Dot color={C.breath.border} /> Breath</>} />
          <Divider />
        </>
      )}
      <TBtn onClick={onRefine} label={<span style={{ fontWeight: 500, color: C.accentInk }}>Refine ⊹</span>} />
    </div>
  )

  const arrow = (
    <div style={{
      width: 0, height: 0,
      borderLeft: '7px solid transparent',
      borderRight: '7px solid transparent',
      alignSelf: 'center',
      ...(position === 'above'
        ? { borderTop: `7px solid rgba(255,255,255,0.96)` }
        : { borderBottom: `7px solid rgba(255,255,255,0.96)` }),
    }} />
  )

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {position === 'above' && <>{bar}{arrow}</>}
      {position === 'below' && <>{arrow}{bar}</>}
    </div>
  )
}
