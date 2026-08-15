import { C, F, kindStyle, type LayerState, type ActiveAnn } from '../design-system'
import { POEM_PARAS, type PoemSeg } from '../data'

// ─── Single annotated segment ────────────────────────────────────────────────
// breath  → inline pill badge (S / L mark, sits between words)
// intent  → gradient stripe underline + Caveat shortNote floating above
// comment → gradient stripe underline + Caveat shortNote floating above

function PoemAnnotation({ seg, active, onClick }: {
  seg: PoemSeg; active: boolean; onClick: () => void
}) {
  const { ann, text } = seg
  if (!ann) return <span>{text}</span>

  const ks = kindStyle(ann.kind)

  // Breath: inline pill, no floating note
  if (ann.kind === 'breath') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 20, height: 20, padding: '0 6px',
        margin: '0 3px', borderRadius: 4,
        background: ks.bg, color: ks.ink,
        fontFamily: F.ui, fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
        verticalAlign: 'middle',
        border: `1px solid ${ks.ink}`,
      }}>
        {ann.mark || '·'}
      </span>
    )
  }

  // Intent / Comment: soft gradient underline + Caveat shortNote above
  return (
    <span onClick={onClick} style={{ position: 'relative', cursor: 'default' }}>
      <span style={{
        backgroundImage: `linear-gradient(${ks.bg}, ${ks.bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 0.22em',
        backgroundPosition: '0 92%',
        color: C.ink,
        paddingBottom: 1,
      }}>
        {text}
      </span>
      {/* shortNote nestles in the natural inter-line gap — like marginalia in a book */}
      <span aria-hidden style={{
        position: 'absolute',
        left: '50%',
        // 1.4em ≈ 26.6px above baseline at fontSize 19 — clears the cap-height
        // (~14px) and sits centred in the ~15px inter-line gap.
        bottom: '1.4em',
        transform: `translateX(-50%) rotate(${active ? '0deg' : '-1.4deg'})`,
        whiteSpace: 'nowrap',
        fontFamily: F.hand,
        fontSize: 15, lineHeight: 1,
        fontWeight: 600, color: ks.ink,
        pointerEvents: 'none',
        opacity: 0.88,
        letterSpacing: 0.2,
        transition: 'transform 120ms',
      }}>
        {ann.shortNote}
      </span>
    </span>
  )
}

// ─── Poem reading surface ────────────────────────────────────────────────────
// Uniform line-height of 1.85 throughout — matches the editor.
// Annotations sit inside the natural inter-line gap using bottom:'1.1em',
// like handwritten marginalia in a book, without inflating line spacing.

export function ReadingSurface({
  layers,
  mobile = false,
  activeSegId,
  onSegClick,
}: {
  layers: LayerState
  mobile?: boolean
  activeSegId?: string | null
  onSegClick?: (ann: ActiveAnn | null) => void
}) {
  const fs = mobile ? 17 : 19

  return (
    <div style={{ fontFamily: F.serif, fontSize: fs, color: C.ink }}>
      {POEM_PARAS.map((para, pi) => {
        return (
          <p key={pi} style={{
            margin: '0 0 20px',
            position: 'relative',
            lineHeight: 1.85,
          }}>
            {para.map((seg, si) => {
              if (!seg.ann) return <span key={si}>{seg.text}</span>

              const { kind } = seg.ann
              const visible =
                kind === 'breath'  ? layers.breath
                : kind === 'intent'  ? layers.intention
                : layers.comments
              if (!visible) return <span key={si}>{seg.text}</span>

              const segId = `${pi}-${si}`
              const isActive = activeSegId === segId

              return (
                <PoemAnnotation
                  key={si}
                  seg={seg}
                  active={isActive}
                  onClick={() => {
                    if (!onSegClick || !seg.ann) return
                    onSegClick(isActive ? null : {
                      segId,
                      kind: seg.ann.kind,
                      shortNote: seg.ann.shortNote,
                      extendedNote: seg.ann.extendedNote,
                    })
                  }}
                />
              )
            })}
          </p>
        )
      })}
    </div>
  )
}
