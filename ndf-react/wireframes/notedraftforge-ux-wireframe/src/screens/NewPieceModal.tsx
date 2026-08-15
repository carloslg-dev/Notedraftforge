// New work modal
//
// Fields:
//   Title           — mandatory; creation blocked until non-empty
//   Type            — text | poem (song hidden in MVP1 UX)
//   Content language — ISO 639-1 code for the authored text, not the app UI language

import { useState } from 'react'
import { C, F, type WorkType } from '../design-system'
import { Btn, IconBtn } from '../components/Primitives'

const CONTENT_LANGS: { code: string; label: string }[] = [
  { code: 'ES', label: 'Spanish' },
  { code: 'EN', label: 'English' },
  { code: 'CA', label: 'Catalan' },
  { code: 'FR', label: 'French' },
  { code: 'PT', label: 'Portuguese' },
  { code: 'IT', label: 'Italian' },
  { code: 'DE', label: 'German' },
]

const TYPE_META: Record<WorkType, { label: string; hint: string; bg: string; fg: string; border: string }> = {
  poem: {
    label: 'Poem',
    hint:  'Line-structured verse',
    bg:    'oklch(0.93 0.04 330)',
    fg:    'oklch(0.42 0.13 335)',
    border:'oklch(0.82 0.07 330)',
  },
  text: {
    label: 'Text',
    hint:  'Prose paragraphs',
    bg:    'oklch(0.93 0.04 150)',
    fg:    'oklch(0.38 0.10 165)',
    border:'oklch(0.82 0.07 150)',
  },
}

export function NewPieceModal({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType]   = useState<WorkType>('poem')
  const [lang, setLang]   = useState('ES')

  const canCreate = title.trim().length > 0

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
        width: '100%', maxWidth: 480,
        background: C.surface, borderRadius: 16,
        border: `1px solid ${C.lineSoft}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.lineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: C.ink }}>
            New work
          </div>
          <IconBtn name="close" onClick={onBack} />
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title */}
          <div>
            <label style={{
              display: 'block', marginBottom: 6,
              fontFamily: F.ui, fontSize: 10, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft,
            }}>
              Title{' '}
              <span style={{ color: C.warn, fontWeight: 700 }}>*</span>
            </label>
            <input
              autoFocus
              placeholder="e.g. El descanso del día"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${title.trim() ? C.accent : C.line}`,
                background: C.surface,
                fontFamily: F.ui, fontSize: 15, color: C.ink,
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 120ms',
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label style={{
              display: 'block', marginBottom: 8,
              fontFamily: F.ui, fontSize: 10, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft,
            }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['poem', 'text'] as WorkType[]).map(t => {
                const m = TYPE_META[t]
                const active = type === t
                return (
                  <button key={t} onClick={() => setType(t)} style={{
                    flex: 1, padding: '14px 12px', borderRadius: 12,
                    background: active ? m.bg : 'transparent',
                    border: `${active ? 2 : 1}px solid ${active ? m.border : C.line}`,
                    color: active ? m.fg : C.inkMute,
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'background 120ms, border-color 120ms',
                  }}>
                    <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: active ? 600 : 500 }}>
                      {m.label}
                    </div>
                    <div style={{ fontFamily: F.ui, fontSize: 11, color: active ? m.fg : C.inkSoft, marginTop: 3 }}>
                      {m.hint}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content language */}
          <div>
            <label style={{
              display: 'block', marginBottom: 6,
              fontFamily: F.ui, fontSize: 10, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft,
            }}>
              Content language{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                · language of the authored text
              </span>
            </label>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 10,
                border: `1px solid ${C.line}`, background: C.surface,
                fontFamily: F.ui, fontSize: 14, color: C.ink,
                outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              {CONTENT_LANGS.map(l => (
                <option key={l.code} value={l.code}>{l.code} — {l.label}</option>
              ))}
            </select>
            <p style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft, margin: '6px 0 0', lineHeight: 1.5 }}>
              This is the language of your authored content — not the app display language
              (the ES / EN switch in the header).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: `1px solid ${C.lineSoft}`,
          background: C.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
        }}>
          {!canCreate && (
            <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft, marginRight: 'auto' }}>
              Title is required to create a work
            </span>
          )}
          <Btn variant="outline" onClick={onBack}>Cancel</Btn>
          <Btn variant="accent" disabled={!canCreate} icon="check">
            Create work
          </Btn>
        </div>
      </div>
    </div>
  )
}