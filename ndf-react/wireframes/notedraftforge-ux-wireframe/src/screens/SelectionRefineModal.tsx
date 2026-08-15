// Selection Refinement Modal
//
// Solves the "fat finger" problem on mobile: instead of dragging tiny selection
// handles on the actual text, this modal shows a zoomed boundary view where
// the user nudges each end of the selection one character at a time using
// large ← → buttons.
//
// Layout:
//   1. Context strip  — full sentence, selection highlighted, read-only overview
//   2. Selected text  — the current selection + character count
//   3. START control  — 8-char window centred on the start boundary + nudge buttons
//   4. END control    — 8-char window centred on the end boundary   + nudge buttons
//   5. Footer         — Cancel / Apply

import { useState } from 'react'
import { C, F } from '../design-system'
import { Btn, IconBtn } from '../components/Primitives'

// ─── Fixture ─────────────────────────────────────────────────────────────────
const CONTEXT =
  'Nadie sabe por qué duele tanto lo que se va en silencio, pero el alma lo reconoce como se reconoce una casa.'

const INIT_START = 31 // 'l' in 'lo'
const INIT_END   = 55 // exclusive end — 'lo que se va en silencio' = 24 chars

// ─── Boundary window ─────────────────────────────────────────────────────────
// Returns 8 chars centred on `boundary`, plus the position of the boundary
// cursor within that window.

const HALF = 4

function getBoundaryWindow(text: string, boundary: number) {
  const start = Math.max(0, Math.min(boundary - HALF, text.length - HALF * 2))
  const slice = text.slice(start, start + HALF * 2)
  const cursorAt = boundary - start
  return { slice, cursorAt }
}

// ─── Char display strip ───────────────────────────────────────────────────────

function BoundaryStrip({
  text,
  boundary,
  onNudge,
  label,
  accentColor,
  disabled,
}: {
  text: string
  boundary: number
  onNudge: (delta: -1 | 1) => void
  label: string
  accentColor: string
  disabled?: { left?: boolean; right?: boolean }
}) {
  const { slice, cursorAt } = getBoundaryWindow(text, boundary)

  return (
    <div style={{ flex: 1 }}>
      {/* Section label */}
      <div style={{
        fontFamily: F.ui, fontSize: 10, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1.1,
        color: C.inkSoft, marginBottom: 10,
      }}>
        {label}
      </div>

      {/* Char strip */}
      <div style={{
        background: C.bg, borderRadius: 10, padding: '12px 8px',
        border: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 1, overflow: 'hidden',
      }}>
        {slice.split('').map((ch, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i === cursorAt && (
              <div style={{
                width: 2, height: 28, borderRadius: 1,
                background: accentColor, flexShrink: 0,
                margin: '0 2px',
              }} />
            )}
            <span style={{
              fontFamily: F.mono,
              fontSize: 20,
              lineHeight: 1,
              padding: '2px 3px',
              borderRadius: 4,
              color: i < cursorAt ? C.inkSoft : C.ink,
              background: i >= cursorAt ? `${accentColor}1a` : 'transparent',
            }}>
              {ch === ' ' ? '·' : ch}
            </span>
          </span>
        ))}
        {cursorAt === slice.length && (
          <div style={{
            width: 2, height: 28, borderRadius: 1,
            background: accentColor, flexShrink: 0,
            margin: '0 2px',
          }} />
        )}
      </div>

      {/* Nudge buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={() => onNudge(-1)}
          disabled={disabled?.left}
          style={{
            flex: 1, height: 36, borderRadius: 8,
            border: `1px solid ${C.line}`, background: C.surface,
            color: disabled?.left ? C.inkSoft : C.ink,
            fontFamily: F.ui, fontSize: 12, fontWeight: 500,
            cursor: disabled?.left ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          ← 1 char
        </button>
        <button
          onClick={() => onNudge(1)}
          disabled={disabled?.right}
          style={{
            flex: 1, height: 36, borderRadius: 8,
            border: `1px solid ${C.line}`, background: C.surface,
            color: disabled?.right ? C.inkSoft : C.ink,
            fontFamily: F.ui, fontSize: 12, fontWeight: 500,
            cursor: disabled?.right ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          1 char →
        </button>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SelectionRefineModal({ onBack }: { onBack: () => void }) {
  const [selStart, setSelStart] = useState(INIT_START)
  const [selEnd,   setSelEnd]   = useState(INIT_END)

  const selectedText = CONTEXT.slice(selStart, selEnd)
  const charCount    = selEnd - selStart

  function nudgeStart(delta: -1 | 1) {
    setSelStart(s => Math.max(0, Math.min(s + delta, selEnd - 1)))
  }
  function nudgeEnd(delta: -1 | 1) {
    setSelEnd(e => Math.max(selStart + 1, Math.min(e + delta, CONTEXT.length)))
  }

  return (
    // Desktop wrapper (matches annotation modal frame)
    <div style={{
      width: '100%', maxWidth: 1280, minHeight: 820,
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${C.lineSoft}`,
      background: `linear-gradient(180deg, ${C.surfaceAlt} 0%, ${C.lineSoft} 100%)`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(32,33,36,0.28)' }} />

      {/* Mobile-sized card — 390px wide to preview realistic mobile layout */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 390,
        background: C.surface, borderRadius: 20,
        border: `1px solid ${C.lineSoft}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.lineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: C.ink }}>
              Adjust selection
            </div>
            <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
              Nudge start and end one character at a time
            </div>
          </div>
          <IconBtn name="close" onClick={onBack} />
        </div>

        {/* Context strip — full sentence with selection highlighted */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.lineSoft}`, background: C.bg }}>
          <div style={{
            fontFamily: F.serif, fontSize: 14, lineHeight: 1.7, color: C.ink,
          }}>
            {CONTEXT.slice(0, selStart)}
            <mark style={{
              background: C.accentSoft, color: C.accentInk,
              borderRadius: 3, padding: '0 1px',
            }}>
              {selectedText}
            </mark>
            {CONTEXT.slice(selEnd)}
          </div>

          {/* Selection preview */}
          <div style={{
            marginTop: 10, padding: '6px 10px', borderRadius: 8,
            background: C.surface, border: `1px solid ${C.lineSoft}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: F.mono, fontSize: 12, color: C.accentInk,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 240,
            }}>
              "{selectedText}"
            </span>
            <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft, flexShrink: 0 }}>
              {charCount} chars
            </span>
          </div>
        </div>

        {/* Boundary controls */}
        <div style={{ padding: '16px 20px', display: 'flex', gap: 16 }}>
          <BoundaryStrip
            text={CONTEXT}
            boundary={selStart}
            onNudge={nudgeStart}
            label="Start"
            accentColor={C.accent}
            disabled={{ left: selStart === 0, right: selStart >= selEnd - 1 }}
          />
          <BoundaryStrip
            text={CONTEXT}
            boundary={selEnd}
            onNudge={nudgeEnd}
            label="End"
            accentColor={C.accentInk}
            disabled={{ left: selEnd <= selStart + 1, right: selEnd >= CONTEXT.length }}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: `1px solid ${C.lineSoft}`,
          background: C.surfaceAlt,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <Btn variant="outline" onClick={onBack}>Cancel</Btn>
          <Btn variant="accent" icon="check">Apply</Btn>
        </div>
      </div>
    </div>
  )
}
