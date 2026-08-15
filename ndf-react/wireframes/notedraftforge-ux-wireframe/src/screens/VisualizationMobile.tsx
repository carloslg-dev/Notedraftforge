import { useState } from 'react'
import { C, F, type LayerKey, type AnnotKind } from '../design-system'
import { Icon } from '../components/Icon'
import { Btn, Badge, SnapshotPill, Toggle, IconBtn, LangToggle } from '../components/Primitives'
import { ModePill } from '../components/Primitives'
import { ReadingSurface } from '../components/ReadingSurface'
import { SelectionToolbar } from '../components/SelectionToolbar'
import { WORKS } from '../data'

// Heights used for the bottom drawer so the reading surface padding adapts.
const DRAWER_H_OPEN = 232
const DRAWER_H_CLOSED = 48

export function VisualizationMobile({ onEdit, onReturnToList, onAddNote }: {
  onEdit: () => void
  onReturnToList: () => void
  onAddNote: (kind: AnnotKind) => void
}) {
  const work = WORKS[0]
  const [layers, setLayers] = useState({ intention: true, comments: true, breath: true })
  const toggle = (k: LayerKey) => setLayers(s => ({ ...s, [k]: !s[k] }))

  // Drawer toggle — starts open so the wireframe shows both states on first load
  const [drawerOpen, setDrawerOpen] = useState(true)

  // Simulated text selection demo — shows the view-mode SelectionToolbar
  const [showToolbar, setShowToolbar] = useState(false)

  const drawerHeight = drawerOpen ? DRAWER_H_OPEN : DRAWER_H_CLOSED

  // Active layers for the compact status strip (shown when drawer is closed)
  const activeLayerDots: { color: string; label: string }[] = [
    layers.intention && { color: C.intent.border, label: 'Intention' },
    layers.comments  && { color: C.comment.border, label: 'Comments' },
    layers.breath    && { color: C.breath.border,  label: 'Breath' },
  ].filter(Boolean) as { color: string; label: string }[]

  return (
    <div style={{
      width: 390, height: 780, borderRadius: 20,
      border: `1px solid rgba(0,0,0,0.1)`,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: C.bg, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.lineSoft}`,
        padding: '10px 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Btn icon="chevron-left" variant="ghost" size="sm" onClick={onReturnToList}>Works</Btn>
            <ModePill label="Editing" onClick={onEdit} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <LangToggle size="sm" />
            <IconBtn name="settings" title="Settings" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Badge type={work.type}>{work.type}</Badge>
          <SnapshotPill state={work.snapshotState} />
        </div>
        <div style={{ fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: C.ink }}>{work.title}</div>
      </div>

      {/* Reading surface — bottom padding adapts to drawer height */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `20px 20px ${drawerHeight + 16}px` }}>
        <ReadingSurface layers={layers} mobile />
      </div>

      {/* ── Selection toolbar demo overlay ── */}
      {showToolbar && (
        <>
          {/* Simulated selection highlight */}
          <div style={{
            position: 'absolute',
            left: 20, right: 20,
            top: 308, height: 24,
            background: 'rgba(26,115,232,0.14)',
            borderRadius: 3, pointerEvents: 'none', zIndex: 10,
          }} />

          {/* Floating toolbar above the highlight */}
          <div style={{
            position: 'absolute',
            left: '50%', top: 262,
            transform: 'translateX(-50%)',
            zIndex: 11,
          }}>
            <SelectionToolbar
              mode="view"
              position="above"
              onAnnotate={kind => { setShowToolbar(false); onAddNote(kind) }}
            />
          </div>
        </>
      )}

      {/* Bottom drawer — collapsible */}
      <div style={{
        position: 'absolute', inset: 'auto 0 0 0',
        background: C.surface,
        borderTop: `1px solid ${C.lineSoft}`,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.07)',
        transition: 'height 220ms ease',
        height: drawerHeight,
        overflow: 'hidden',
      }}>
        {/* Handle row — always visible, click to toggle */}
        <button
          onClick={() => setDrawerOpen(o => !o)}
          style={{
            width: '100%', height: DRAWER_H_CLOSED,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 16px', border: 0, background: 'transparent', cursor: 'pointer',
          }}
        >
          {/* Pill handle */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, flexShrink: 0 }} />

          {/* Collapsed: compact layer status dots */}
          {!drawerOpen && (
            activeLayerDots.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                {activeLayerDots.map(d => (
                  <span key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkMute }}>{d.label}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft, flex: 1 }}>All layers hidden</span>
            )
          )}

          {/* Expanded: "Layers" label */}
          {drawerOpen && (
            <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, letterSpacing: 1.1, textTransform: 'uppercase', color: C.inkSoft, flex: 1, textAlign: 'left' }}>
              Layers
            </span>
          )}

          <Icon name={drawerOpen ? 'chevron-down' : 'chevron-right'} size={14} color={C.inkSoft} />
        </button>

        {/* Expanded content */}
        {drawerOpen && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              <Toggle checked={layers.intention} onChange={() => toggle('intention')} label="Intention" hint="Performance cues" />
              <Toggle checked={layers.comments}  onChange={() => toggle('comments')}  label="Comments"  hint="Editorial notes" />
              <Toggle checked={layers.breath}    onChange={() => toggle('breath')}    label="Breath"    hint="Pacing marks" />
            </div>

            {/* Demo toggle — simulate text selection + annotation toolbar */}
            <button
              onClick={() => setShowToolbar(t => !t)}
              style={{
                width: '100%', height: 34, borderRadius: 8,
                border: `1px solid ${showToolbar ? C.accentSoft : C.lineSoft}`,
                background: showToolbar ? C.accentSoft : C.surfaceAlt,
                color: showToolbar ? C.accentInk : C.inkSoft,
                fontFamily: F.ui, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {showToolbar ? '✕ Hide toolbar demo' : '⊹ Demo: select text to annotate'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
