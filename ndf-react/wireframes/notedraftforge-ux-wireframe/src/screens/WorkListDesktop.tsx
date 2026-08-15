import { useState } from 'react'
import { C, F } from '../design-system'
import { Icon } from '../components/Icon'
import { Btn, IconBtn, Badge, SnapshotPill, FilterChip, LangToggle } from '../components/Primitives'
import { AppChrome } from '../components/Primitives'
import { WORKS } from '../data'

// Tags shown by default in the filter bar (fits comfortably in ~2 rows at 280px rail width).
// Everything beyond this appears in the "more tags" overlay.
const VISIBLE_TAGS = 4

export function WorkListDesktop({ onView, onEdit }: { onView: () => void; onEdit: () => void }) {
  const [selected, setSelected]        = useState(WORKS[0].id)
  const [filter, setFilter]            = useState<string | null>(null)
  const [showMoreTags, setShowMoreTags] = useState(false)
  const [tagQuery, setTagQuery]         = useState('')

  const allTags    = [...new Set(WORKS.flatMap(w => w.tags))]
  const visibleTags  = allTags.slice(0, VISIBLE_TAGS)
  const overflowTags = allTags.slice(VISIBLE_TAGS)

  const shown   = filter ? WORKS.filter(w => w.type === filter || w.tags.includes(filter)) : WORKS
  const current = WORKS.find(w => w.id === selected) ?? WORKS[0]

  function toggleFilter(val: string | null) {
    setFilter(f => f === val ? null : val)
  }

  return (
    <div style={{
      width: '100%', maxWidth: 1280, minHeight: 820,
      border: `1px solid ${C.lineSoft}`, borderRadius: 12,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: C.surface, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <AppChrome right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LangToggle />
          <IconBtn name="settings" title="Settings" />
        </div>
      } />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left rail */}
        <aside style={{
          width: 280, flexShrink: 0,
          borderRight: `1px solid ${C.lineSoft}`,
          display: 'flex', flexDirection: 'column',
          background: C.surface,
          position: 'relative',       // anchor for more-tags overlay
        }}>
          {/* Rail header */}
          <div style={{
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${C.lineSoft}`,
          }}>
            <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.ink, textTransform: 'uppercase', letterSpacing: 0.3 }}>Works</span>
            <div style={{ display: 'flex', gap: 2 }}>
              <IconBtn name="search" title="Search" />
              <IconBtn name="plus"   title="New work" />
              <IconBtn name="upload" title="Restore backup" />
              <IconBtn name="sort"   title="Sort" />
            </div>
          </div>

          {/* Filter chips — max 2 rows, overflow in "…" overlay */}
          <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 4, borderBottom: `1px solid ${C.lineSoft}` }}>
            <FilterChip active={filter === null}    onClick={() => toggleFilter(null)}>All</FilterChip>
            <FilterChip active={filter === 'poem'}  type="poem" onClick={() => toggleFilter('poem')}>poem</FilterChip>
            <FilterChip active={filter === 'text'}  type="text" onClick={() => toggleFilter('text')}>text</FilterChip>
            {visibleTags.map(t => (
              <FilterChip key={t} active={filter === t} onClick={() => toggleFilter(t)}>{t}</FilterChip>
            ))}
            {/* "…" chip — always shown so users know more tags exist */}
            <button
              onClick={() => setShowMoreTags(v => !v)}
              style={{
                padding: '3px 9px', borderRadius: 999, cursor: 'pointer',
                background: showMoreTags ? C.ink : (overflowTags.some(t => t === filter) ? C.ink : 'transparent'),
                color:      showMoreTags ? '#fff'  : (overflowTags.some(t => t === filter) ? '#fff'  : C.inkMute),
                border: `1px solid ${showMoreTags || overflowTags.some(t => t === filter) ? C.ink : C.line}`,
                fontFamily: F.ui, fontSize: 11, fontWeight: 600,
              }}
            >
              {overflowTags.some(t => t === filter) ? filter : '···'}
            </button>
          </div>

          {/* Work list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {shown.map(w => (
              <button key={w.id} onClick={() => setSelected(w.id)} style={{
                width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
                padding: '10px 16px',
                background: w.id === selected ? C.accentSoft : 'transparent',
                borderLeft: `2px solid ${w.id === selected ? C.accent : 'transparent'}`,
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <div style={{ color: w.id === selected ? C.accentInk : C.inkMute, marginTop: 1 }}>
                  <Icon name={w.type === 'poem' ? 'feather' : 'text'} size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: F.ui, fontSize: 13, fontWeight: 500,
                    color: w.id === selected ? C.accentInk : C.ink,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{w.title}</div>
                  <div style={{ marginTop: 2, fontFamily: F.ui, fontSize: 11, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge type={w.type}>{w.type}</Badge>
                    {w.updatedAt}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── More tags overlay — tag search ── */}
          {showMoreTags && (
            <div style={{
              position: 'absolute', top: 44 + 48, left: 0, right: 0,
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderTop: 'none',
              boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
              zIndex: 20,
              padding: '12px 16px 16px',
            }}>
              {/* Search input */}
              <input
                autoFocus
                placeholder="Search tags…"
                value={tagQuery}
                onChange={e => setTagQuery(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '7px 10px', borderRadius: 8,
                  border: `1px solid ${C.line}`, background: C.bg,
                  fontFamily: F.ui, fontSize: 13, color: C.ink,
                  outline: 'none', marginBottom: 10,
                }}
              />
              {/* Filtered results */}
              {(() => {
                const q = tagQuery.trim().toLowerCase()
                const hits = q ? allTags.filter(t => t.toLowerCase().includes(q)) : []
                if (!q) return (
                  <p style={{ fontFamily: F.ui, fontSize: 12, color: C.inkSoft, margin: 0 }}>
                    Type to search your tags
                  </p>
                )
                if (hits.length === 0) return (
                  <p style={{ fontFamily: F.ui, fontSize: 12, color: C.inkSoft, margin: 0 }}>
                    No tags matching "{tagQuery}"
                  </p>
                )
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {hits.map(t => (
                      <FilterChip key={t} active={filter === t} onClick={() => { toggleFilter(t); setShowMoreTags(false); setTagQuery('') }}>
                        {t}
                      </FilterChip>
                    ))}
                  </div>
                )
              })()}
              <button
                onClick={() => { setShowMoreTags(false); setTagQuery('') }}
                style={{
                  marginTop: 14, width: '100%', height: 30, borderRadius: 8,
                  border: `1px solid ${C.lineSoft}`, background: C.surfaceAlt,
                  fontFamily: F.ui, fontSize: 12, color: C.inkMute, cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          )}
        </aside>

        {/* Main preview */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '14px 24px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            borderBottom: `1px solid ${C.lineSoft}`, background: C.surface,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Badge type={current.type}>{current.type}</Badge>
                <SnapshotPill state={current.snapshotState} />
                <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>{current.updatedAt}</span>
              </div>
              <div style={{ fontFamily: F.ui, fontSize: 22, fontWeight: 600, color: C.ink, letterSpacing: -0.3 }}>{current.title}</div>
              <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                {current.tags.map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>
                    <Icon name="tag" size={10} />#{t}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <Btn icon="eye" variant="accent" size="sm" onClick={onView}>View</Btn>
              <Btn icon="edit" variant="outline" size="sm" onClick={onEdit}>Edit</Btn>
              <Btn icon="download" variant="outline" size="sm">Backup</Btn>
            </div>
          </div>

          {/* Reading preview */}
          <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', background: C.bg }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <div style={{ marginBottom: 16, fontFamily: F.ui, fontSize: 11, color: C.inkMute, textTransform: 'uppercase', letterSpacing: 0.8 }}>Reading preview</div>
              {current.type === 'poem' ? (
                <div style={{ fontFamily: F.serif, fontSize: 18, lineHeight: 1.9, color: C.ink }}>
                  <p style={{ margin: '0 0 14px' }}>
                    Llega la tarde como un{' '}
                    <span style={{ backgroundImage: `linear-gradient(${C.intent.bg},${C.intent.bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 0.22em', backgroundPosition: '0 92%' }}>pájaro cansado</span>
                    , y se posa en los tejados.
                  </p>
                  <p style={{ margin: '0 0 14px' }}>El sol guarda sus últimas monedas en el bolsillo del horizonte.</p>
                  <p style={{ margin: '0 0 14px' }}>
                    Nadie sabe por qué duele tanto{' '}
                    <span style={{ backgroundImage: `linear-gradient(${C.comment.bg},${C.comment.bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 0.22em', backgroundPosition: '0 92%' }}>lo que se va en silencio</span>
                    , pero el alma lo reconoce como se reconoce una casa.
                  </p>
                  <p style={{ margin: 0 }}>Y entonces, <span style={{ backgroundImage: `linear-gradient(${C.intent.bg},${C.intent.bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 0.22em', backgroundPosition: '0 92%' }}>respiramos</span>.</p>
                </div>
              ) : (
                <div style={{ fontFamily: F.serif, fontSize: 17, lineHeight: 1.85, color: C.inkMute }}>
                  <p style={{ margin: '0 0 14px' }}>Silence is not empty. It arrives carrying the shape of what was almost said.</p>
                  <p style={{ margin: '0 0 14px' }}>The room keeps its furniture, but every object feels heavier after the pause.</p>
                  <p style={{ margin: 0 }}>A text piece still benefits from interpretation cues even without a poem-like layout.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
