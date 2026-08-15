import { useState } from 'react'
import { C, F, kindStyle, type AnnotKind } from '../design-system'
import { Icon, type IconName } from '../components/Icon'
import { Btn, IconBtn } from '../components/Primitives'

// ─── Anchor labels per kind (fixture) ───────────────────────────────────────
const ANNOT_ANCHORS: Record<AnnotKind, string> = {
  intent:  '"pájaro cansado"',
  comment: '"lo que se va en silencio"',
  breath:  'after "últimas monedas"',
}

const KIND_ICON: Record<AnnotKind, IconName> = {
  intent:  'intent',
  comment: 'comment',
  breath:  'breath',
}

// ─── Type selector ────────────────────────────────────────────────────────────
function TypeSelector({ kind, onChange }: { kind: AnnotKind; onChange: (k: AnnotKind) => void }) {
  const options: { value: AnnotKind; label: string }[] = [
    { value: 'intent',  label: 'Intention' },
    { value: 'comment', label: 'Comment' },
    { value: 'breath',  label: 'Breath' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(opt => {
        const ks = kindStyle(opt.value)
        const active = opt.value === kind
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            padding: '5px 12px', borderRadius: 999,
            background: active ? ks.bg : 'transparent',
            color: active ? ks.ink : C.inkMute,
            border: `1px solid ${active ? ks.border : C.line}`,
            fontFamily: F.ui, fontSize: 12, fontWeight: active ? 600 : 500,
            cursor: 'pointer',
          }}>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Content: Intention / Comment ────────────────────────────────────────────
// shortNote → shown floating above the text in Caveat
// extendedNote → shown in the sidebar when the annotation is selected

function NoteContent({ kind }: { kind: AnnotKind }) {
  const ks = kindStyle(kind)
  const icon: IconName = KIND_ICON[kind]
  const hint = kind === 'intent'
    ? 'Personal — only you can see and write here.'
    : 'Editorial note — visible in the comments layer.'

  return (
    <div>
      {/* Kind info banner */}
      <div style={{
        padding: '8px 10px', borderRadius: 8,
        background: ks.bg, color: ks.ink,
        fontFamily: F.ui, fontSize: 11,
        marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <Icon name={icon} size={12} color={ks.ink} />
        {hint}
      </div>

      {/* Short note — shown inline on text in Caveat */}
      <div style={{ marginBottom: 14 }}>
        <label style={{
          display: 'block', marginBottom: 6,
          fontFamily: F.ui, fontSize: 10, fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft,
        }}>
          Short note{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            · shown floating above the text
          </span>
        </label>
        <input
          placeholder="e.g. más lento, voz casi rota"
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${C.line}`, background: C.surface,
            // Caveat so the author sees how the note will look in situ
            fontFamily: F.hand, fontSize: 16, color: C.ink,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Extended note — shown in sidebar on selection */}
      <div>
        <label style={{
          display: 'block', marginBottom: 6,
          fontFamily: F.ui, fontSize: 10, fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft,
        }}>
          Extended note{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            · detail shown in sidebar when selected
          </span>
        </label>
        <textarea
          placeholder="Add more detail, context, or interpretation guidance…"
          style={{
            width: '100%', minHeight: 90, padding: '10px 12px', borderRadius: 8,
            border: `1px solid ${C.line}`, background: C.surface,
            fontFamily: F.serif, fontSize: 14, lineHeight: 1.6, color: C.ink,
            resize: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  )
}

// ─── Content: Breath ─────────────────────────────────────────────────────────
function BreathContent({ mark, setMark }: { mark: 'S' | 'L'; setMark: (m: 'S' | 'L') => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {([
        { mark: 'S' as const, label: 'Short', desc: '½ beat pause' },
        { mark: 'L' as const, label: 'Long',  desc: 'Full rest' },
      ]).map(opt => (
        <button key={opt.mark} onClick={() => setMark(opt.mark)} style={{
          padding: '24px 18px', borderRadius: 14, cursor: 'pointer',
          border: `${mark === opt.mark ? 2 : 1}px solid ${mark === opt.mark ? C.breath.ink : C.line}`,
          background: mark === opt.mark ? C.breath.bg : C.surface,
          textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <span style={{ fontFamily: F.ui, fontSize: 38, fontWeight: 700, color: mark === opt.mark ? C.breath.ink : C.ink }}>
            {opt.mark}
          </span>
          <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 500, color: C.ink }}>{opt.label}</span>
          <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>{opt.desc}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Unified annotation modal ─────────────────────────────────────────────────
// One modal for all annotation types. Switching type via the type selector
// updates the header icon/colour and the body content.

export function AnnotationModal({ initialKind = 'comment', onBack }: {
  initialKind?: AnnotKind
  onBack: () => void
}) {
  const [kind, setKind]     = useState<AnnotKind>(initialKind)
  const [mark, setMark]     = useState<'S' | 'L'>('L')

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
      {/* Dim overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(32,33,36,0.28)' }} />

      {/* Modal card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 540,
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
            {/* Icon + type label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: ks.bg, color: ks.ink,
                transition: 'background 150ms',
              }}>
                <Icon name={KIND_ICON[kind]} size={14} color={ks.ink} />
              </span>
              <span style={{ fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: C.ink }}>
                Add annotation
              </span>
            </div>
            {/* Type selector */}
            <TypeSelector kind={kind} onChange={setKind} />
            {/* Anchor */}
            <div style={{ marginTop: 6, fontFamily: F.ui, fontSize: 12, color: C.inkSoft }}>
              Anchored to {ANNOT_ANCHORS[kind]}
            </div>
          </div>
          <IconBtn name="close" onClick={onBack} />
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {kind === 'breath'
            ? <BreathContent mark={mark} setMark={setMark} />
            : <NoteContent kind={kind} />
          }
        </div>

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
