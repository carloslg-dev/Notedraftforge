import { useState } from 'react'
import { C, F, kindStyle, type LayerKey, type AnnotKind, type ActiveAnn } from '../design-system'
import { Icon } from '../components/Icon'
import { Btn, IconBtn, Badge, SnapshotPill, Toggle, AnnotKindTag, LangToggle } from '../components/Primitives'
import { AppChrome, ModePill } from '../components/Primitives'
import { ReadingSurface } from '../components/ReadingSurface'
import { SelectionToolbar } from '../components/SelectionToolbar'
import { WORKS } from '../data'

export function VisualizationDesktop({ onEdit, onReturnToList, onAddNote }: {
  onEdit: () => void
  onReturnToList: () => void
  onAddNote: (kind: AnnotKind) => void
}) {
  const work = WORKS[0]
  const [layers, setLayers] = useState({ intention: true, comments: true, breath: true })
  const toggle = (k: LayerKey) => setLayers(s => ({ ...s, [k]: !s[k] }))
  const canAnnotate = work.snapshotState !== 'generating'

  // Active annotation — selected by clicking in the reading surface.
  const [activeAnn, setActiveAnn] = useState<ActiveAnn | null>(null)

  // Simulated text selection demo — shows the view-mode SelectionToolbar
  const [showToolbar, setShowToolbar] = useState(false)

  return (
    <div style={{
      width: '100%', maxWidth: 1280, minHeight: 820,
      border: `1px solid ${C.lineSoft}`, borderRadius: 12,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: C.surface, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <AppChrome
        left={
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: C.lineSoft }}>·</span>
            <Btn icon="chevron-left" variant="ghost" size="sm" onClick={onReturnToList}>Works</Btn>
            <span style={{ color: C.lineSoft }}>·</span>
            <ModePill label="Visualization" active />
            <ModePill label="Editing" onClick={onEdit} />
          </div>
        }
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SnapshotPill state={work.snapshotState} />
            <LangToggle />
            <IconBtn name="settings" title="Settings" />
          </div>
        }
      />

      {/* Main body — position:relative so the toolbar overlay can anchor here */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>

        {/* Reading surface */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: C.bg }}>
          <article style={{ maxWidth: 680, margin: '0 auto', padding: '48px 56px 100px' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Badge type={work.type}>{work.type}</Badge>
                <SnapshotPill state={work.snapshotState} />
                <span style={{ fontFamily: F.ui, fontSize: 12, color: C.inkSoft }}>{work.language}</span>
              </div>
              <h1 style={{ fontFamily: F.ui, fontSize: 30, fontWeight: 600, color: C.ink, letterSpacing: -0.3, margin: '0 0 8px' }}>
                {work.title}
              </h1>
              {work.snapshotState === 'stale' && (
                <div style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: '#fef3c7', color: '#92400e',
                  fontFamily: F.ui, fontSize: 12,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon name="warning" size={14} color="#92400e" />
                  Snapshot stale — regenerating in the background
                </div>
              )}
            </div>

            <ReadingSurface
              layers={layers}
              activeSegId={activeAnn?.segId ?? null}
              onSegClick={setActiveAnn}
            />
          </article>
        </main>

        {/* ── Selection toolbar demo overlay ── */}
        {showToolbar && (
          <>
            {/* Simulated selection highlight — centred in reading column */}
            <div style={{
              position: 'absolute',
              // reading column is maxWidth 680, centred in (total - 272px aside)
              left: 'calc((100% - 272px) / 2 - 200px)',
              right: 'calc(272px + (100% - 272px) / 2 - 200px)',
              top: 318, height: 26,
              background: 'rgba(26,115,232,0.14)',
              borderRadius: 3, pointerEvents: 'none', zIndex: 10,
            }} />

            {/* Floating toolbar above the highlight */}
            <div style={{
              position: 'absolute',
              left: 'calc((100% - 272px) / 2)',
              top: 270,
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

        {/* Right panel */}
        <aside style={{
          width: 272, flexShrink: 0,
          borderLeft: `1px solid ${C.lineSoft}`,
          background: C.surface,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Layer toggles */}
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.lineSoft}`, flexShrink: 0 }}>
            <div style={{
              fontFamily: F.ui, fontSize: 11, fontWeight: 600,
              letterSpacing: 1.1, textTransform: 'uppercase', color: C.inkSoft,
              marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="layers" size={14} />
              Layers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Toggle checked={layers.intention} onChange={() => toggle('intention')} label="Intention" hint="Performance cues" disabled={!canAnnotate} />
              <Toggle checked={layers.comments}  onChange={() => toggle('comments')}  label="Comments"  hint="Editorial notes"  disabled={!canAnnotate} />
              <Toggle checked={layers.breath}    onChange={() => toggle('breath')}    label="Breath"    hint="Pacing marks"    disabled={!canAnnotate} />
            </div>
          </div>

          {/* Contextual extended note — shown when an annotation is selected */}
          {activeAnn ? (
            <ActiveNotePanel ann={activeAnn} onClose={() => setActiveAnn(null)} />
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '24px 20px', gap: 16,
            }}>
              <p style={{
                fontFamily: F.ui, fontSize: 12, color: C.inkSoft,
                textAlign: 'center', lineHeight: 1.6, margin: 0,
              }}>
                Click an annotated word in the text to read its note
              </p>
              <button
                onClick={() => setShowToolbar(t => !t)}
                style={{
                  fontFamily: F.ui, fontSize: 11,
                  color: showToolbar ? C.accentInk : C.inkSoft,
                  background: showToolbar ? C.accentSoft : C.surfaceAlt,
                  border: `1px solid ${showToolbar ? C.accentSoft : C.lineSoft}`,
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                }}
              >
                {showToolbar ? '✕ Hide toolbar demo' : '⊹ Demo: select text to annotate'}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// ─── Extended note panel ─────────────────────────────────────────────────────

function ActiveNotePanel({ ann, onClose }: { ann: ActiveAnn; onClose: () => void }) {
  const ks = kindStyle(ann.kind)
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: ks.bg,
      }}>
        <AnnotKindTag kind={ann.kind} />
        <IconBtn name="close" onClick={onClose} />
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{
          fontFamily: F.hand, fontSize: 18, fontWeight: 600,
          color: ks.ink, lineHeight: 1.3, marginBottom: 14,
        }}>
          {ann.shortNote}
        </div>

        {ann.extendedNote && (
          <div style={{
            fontFamily: F.serif, fontSize: 14, color: C.ink,
            lineHeight: 1.65,
            borderTop: `1px solid ${C.lineSoft}`, paddingTop: 12,
          }}>
            {ann.extendedNote}
          </div>
        )}
      </div>
    </div>
  )
}
