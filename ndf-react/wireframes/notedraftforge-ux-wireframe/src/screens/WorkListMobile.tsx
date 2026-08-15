import { useState } from 'react'
import { C, F, type WorkType } from '../design-system'
import { Icon } from '../components/Icon'
import { IconBtn, Badge, FilterChip, LangToggle } from '../components/Primitives'
import { WORKS } from '../data'

// Tags shown inline on mobile — enough for one row at 390px width.
const VISIBLE_TAGS_MOBILE = 2

export function WorkListMobile({ onView }: { onView: () => void }) {
  const [filter, setFilter]            = useState<string | null>(null)
  const [showMoreTags, setShowMoreTags] = useState(false)
  const [tagQuery, setTagQuery]         = useState('')

  const allTags    = [...new Set(WORKS.flatMap(w => w.tags))]
  const visibleTags  = allTags.slice(0, VISIBLE_TAGS_MOBILE)
  const shown = filter ? WORKS.filter(w => w.type === filter || w.tags.includes(filter)) : WORKS

  function toggleFilter(val: string | null) {
    setFilter(f => f === val ? null : val)
  }

  return (
    <div style={{
      width: 390, height: 780, borderRadius: 20,
      border: `1px solid rgba(0,0,0,0.1)`,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: C.bg, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.surface, borderBottom: `1px solid ${C.lineSoft}`,
      }}>
        <span style={{ fontFamily: F.ui, fontSize: 22, fontWeight: 600, color: C.ink, letterSpacing: -0.3 }}>Works</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <LangToggle size="sm" />
          <IconBtn name="search" title="Search" />
          <IconBtn name="sort" />
          <IconBtn name="settings" title="Settings" />
        </div>
      </div>

      {/* Filter chips — single row; overflow behind "···" */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', gap: 6, alignItems: 'center',
        background: C.surface, borderBottom: `1px solid ${C.lineSoft}`, flexShrink: 0,
      }}>
        <FilterChip active={filter === null}   onClick={() => toggleFilter(null)}>All</FilterChip>
        <FilterChip active={filter === 'poem'} type="poem" onClick={() => toggleFilter('poem')}>poem</FilterChip>
        <FilterChip active={filter === 'text'} type="text" onClick={() => toggleFilter('text')}>text</FilterChip>
        {visibleTags.map(t => (
          <FilterChip key={t} active={filter === t} onClick={() => toggleFilter(t)}>{t}</FilterChip>
        ))}
        {/* "···" chip */}
        <button
          onClick={() => setShowMoreTags(v => !v)}
          style={{
            padding: '3px 9px', borderRadius: 999, cursor: 'pointer', flexShrink: 0,
            background: showMoreTags ? C.ink : (allTags.slice(VISIBLE_TAGS_MOBILE).some(t => t === filter) ? C.ink : 'transparent'),
            color:      showMoreTags ? '#fff'  : (allTags.slice(VISIBLE_TAGS_MOBILE).some(t => t === filter) ? '#fff'  : C.inkMute),
            border: `1px solid ${showMoreTags || allTags.slice(VISIBLE_TAGS_MOBILE).some(t => t === filter) ? C.ink : C.line}`,
            fontFamily: F.ui, fontSize: 11, fontWeight: 600,
          }}
        >
          {allTags.slice(VISIBLE_TAGS_MOBILE).some(t => t === filter) ? filter : '···'}
        </button>
      </div>

      {/* Work list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 80px' }}>
        {shown.map(w => (
          <button key={w.id} onClick={onView} style={{
            width: '100%', textAlign: 'left', border: `1px solid ${C.lineSoft}`,
            padding: '12px 14px', marginBottom: 8,
            background: C.surface, borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: C.surfaceAlt, color: C.inkMute,
            }}>
              <Icon name={w.type === 'poem' ? 'feather' : 'text'} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 500, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.title}</div>
              <div style={{ marginTop: 2, fontFamily: F.ui, fontSize: 12, color: C.inkSoft }}>{w.updatedAt}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Badge type={w.type}>{w.type}</Badge>
              <Icon name="chevron-right" size={14} color={C.inkSoft} />
            </div>
          </button>
        ))}
      </div>

      {/* Extended FAB — New work */}
      <div style={{ position: 'absolute', right: 16, bottom: 20 }}>
        <button style={{
          height: 48, padding: '0 20px 0 16px', borderRadius: 999, border: 0,
          background: C.accent, color: '#fff',
          boxShadow: '0 4px 14px rgba(26,115,232,0.32)',
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer',
          fontFamily: F.ui, fontSize: 14, fontWeight: 600,
        }}>
          <Icon name="plus" size={18} color="#fff" />
          New work
        </button>
      </div>

      {/* ── More tags bottom sheet ── */}
      {showMoreTags && (
        <>
          {/* Dim backdrop */}
          <div
            onClick={() => { setShowMoreTags(false); setTagQuery('') }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 30 }}
          />
          {/* Sheet */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: C.surface, borderRadius: '20px 20px 0 0',
            padding: '0 20px 32px',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
            zIndex: 31,
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 16px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line }} />
            </div>
            <div style={{
              fontFamily: F.ui, fontSize: 10, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft,
              marginBottom: 12,
            }}>
              Search tags
            </div>
            {/* Search input */}
            <input
              autoFocus
              placeholder="Search tags…"
              value={tagQuery}
              onChange={e => setTagQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${C.line}`, background: C.bg,
                fontFamily: F.ui, fontSize: 14, color: C.ink,
                outline: 'none', marginBottom: 14,
              }}
            />
            {/* Filtered results */}
            {(() => {
              const q = tagQuery.trim().toLowerCase()
              const hits = q ? allTags.filter(t => t.toLowerCase().includes(q)) : []
              if (!q) return (
                <p style={{ fontFamily: F.ui, fontSize: 13, color: C.inkSoft, margin: 0 }}>
                  Type to search your tags
                </p>
              )
              if (hits.length === 0) return (
                <p style={{ fontFamily: F.ui, fontSize: 13, color: C.inkSoft, margin: 0 }}>
                  No tags matching "{tagQuery}"
                </p>
              )
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
                marginTop: 20, width: '100%', height: 44, borderRadius: 12,
                border: `1px solid ${C.lineSoft}`, background: C.surfaceAlt,
                fontFamily: F.ui, fontSize: 13, fontWeight: 500, color: C.inkMute, cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  )
}
