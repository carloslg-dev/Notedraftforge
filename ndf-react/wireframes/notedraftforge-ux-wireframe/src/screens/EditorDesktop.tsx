import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { C, F } from '../design-system'
import { Btn, Badge, IconBtn, LangToggle } from '../components/Primitives'
import { AppChrome, ModePill } from '../components/Primitives'
import { WORKS, POEM_HTML } from '../data'

export function EditorDesktop({ onView, onReturnToList }: { onView: () => void; onReturnToList: () => void }) {
  const work = WORKS[0]
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your piece…' }),
    ],
    content: POEM_HTML,
  })

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
            <ModePill label="Editing" active />
            <ModePill label="Visualization" onClick={onView} />
          </div>
        }
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: F.ui, fontSize: 12, color: C.inkSoft }}>Autosaved · 1 min ago</span>
            <div style={{ width: 1, height: 20, background: C.lineSoft, margin: '0 2px' }} />
            <LangToggle />
            <IconBtn name="settings" title="Settings" />
          </div>
        }
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Editor area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: C.bg }}>
          <div style={{
            padding: '8px 24px', borderBottom: `1px solid ${C.lineSoft}`,
            background: C.surface, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Badge type={work.type}>{work.type}</Badge>
            <span style={{ fontFamily: F.ui, fontSize: 12, color: C.inkMute }}>{work.language} · {work.tags.join(', ')}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft, background: C.surfaceAlt, padding: '2px 8px', borderRadius: 4 }}>
              annotations hidden while editing
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 0 80px' }}>
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 48px' }}>
              <input
                defaultValue={work.title}
                style={{
                  width: '100%', border: 0, outline: 'none', background: 'transparent',
                  fontFamily: F.ui, fontSize: 32, fontWeight: 600,
                  letterSpacing: -0.5, color: C.ink, marginBottom: 14,
                }}
              />
              <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkMute, marginBottom: 28, display: 'flex', gap: 16 }}>
                <span>Language: <b style={{ color: C.ink }}>{work.language}</b></span>
                <span>Type: <b style={{ color: C.ink }}>{work.type}</b></span>
              </div>
              <div className="tiptap-surface" style={{ fontFamily: F.serif, fontSize: 19, lineHeight: 1.85, color: C.ink }}>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata sidecar */}
        <aside style={{
          width: 240, flexShrink: 0,
          borderLeft: `1px solid ${C.lineSoft}`,
          background: C.surface, padding: 20, overflowY: 'auto',
        }}>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, letterSpacing: 1.1, textTransform: 'uppercase', color: C.inkSoft, marginBottom: 16 }}>Metadata</div>
          {[
            { label: 'Title',    value: work.title },
            { label: 'Language', value: work.language },
            { label: 'Type',     value: work.type },
            { label: 'Tags',     value: work.tags.join(', ') },
          ].map(({ label, value }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: F.ui, fontSize: 13, color: C.ink, padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.lineSoft}`, background: C.bg }}>{value}</div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
