import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { C, F } from '../design-system'
import { Badge, IconBtn, LangToggle } from '../components/Primitives'
import { ModePill } from '../components/Primitives'
import { WORKS, POEM_HTML } from '../data'
import { SelectionToolbar } from '../components/SelectionToolbar'

export function EditorMobile({ onView, onRefine }: {
  onView: () => void
  onRefine?: () => void
}) {
  const work = WORKS[0]
  const [showToolbar, setShowToolbar] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: POEM_HTML,
  })

  return (
    <div style={{
      width: 390, height: 780, borderRadius: 20,
      border: `1px solid rgba(0,0,0,0.1)`,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: C.bg, boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.lineSoft}`,
        padding: '10px 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ModePill label="Editing" active />
            <ModePill label="Visualization" onClick={onView} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <LangToggle size="sm" />
            <IconBtn name="settings" title="Settings" />
          </div>
        </div>
        <div style={{ fontFamily: F.ui, fontSize: 20, fontWeight: 600, color: C.ink, letterSpacing: -0.3 }}>{work.title}</div>
        <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
          <Badge type={work.type}>{work.type}</Badge>
          <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>{work.language}</span>
        </div>
      </div>

      {/* Editing surface */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div className="tiptap-surface" style={{ fontFamily: F.serif, fontSize: 16, lineHeight: 1.85, color: C.ink }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ── Selection toolbar demo ── */}
      {showToolbar && (
        <>
          {/* Simulated selection highlight */}
          <div style={{
            position: 'absolute',
            left: 16, right: 16,
            top: 288, height: 24,
            background: 'rgba(26,115,232,0.15)',
            borderRadius: 3,
            pointerEvents: 'none',
            zIndex: 99,
          }} />

          {/* Floating toolbar above the selection */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 244,
            transform: 'translateX(-50%)',
            zIndex: 100,
          }}>
            <SelectionToolbar
              mode="edit"
              position="above"
              onRefine={onRefine}
              activeFormats={{ bold: false, italic: false }}
            />
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{
        background: C.surface, borderTop: `1px solid ${C.lineSoft}`,
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>Autosaved · 1 min ago</span>
        <button
          onClick={() => setShowToolbar(t => !t)}
          style={{
            fontFamily: F.ui, fontSize: 11,
            color: showToolbar ? C.accentInk : C.inkSoft,
            background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
          }}
        >
          {showToolbar ? 'Hide toolbar demo' : 'Demo: simulate selection'}
        </button>
      </div>
    </div>
  )
}
