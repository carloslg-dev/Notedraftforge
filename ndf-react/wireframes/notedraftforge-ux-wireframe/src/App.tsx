// NoteDraftForge — UX Wireframe 2
//
// MVP screens (10):
//   WorkListDesktop · WorkListMobile
//   VisualizationDesktop · VisualizationMobile
//   EditorDesktop · EditorMobile
//   AnnotationModal (unified: type selector + shortNote + extendedNote)
//   SelectionRefineModal (char-by-char boundary adjuster)
//   ExportImportModal (JSON backup: export + restore)
//   NewPieceModal (title + type text|poem + content language)

import { useState } from 'react'
import { C, F, type ScreenId, type AnnotKind } from './design-system'

import { WorkListDesktop }      from './screens/WorkListDesktop'
import { WorkListMobile }       from './screens/WorkListMobile'
import { VisualizationDesktop } from './screens/VisualizationDesktop'
import { VisualizationMobile }  from './screens/VisualizationMobile'
import { EditorDesktop }        from './screens/EditorDesktop'
import { EditorMobile }         from './screens/EditorMobile'
import { AnnotationModal }      from './screens/AnnotationModal'
import { SelectionRefineModal } from './screens/SelectionRefineModal'
import { ExportImportModal }    from './screens/ExportImportModal'
import { NewPieceModal }        from './screens/NewPieceModal'

const SCREEN_LIST: Array<{ id: ScreenId; label: string }> = [
  { id: 'WorkListDesktop',      label: 'Works / Desktop' },
  { id: 'WorkListMobile',       label: 'Works / Mobile' },
  { id: 'VisualizationDesktop', label: 'Visualization / Desktop' },
  { id: 'VisualizationMobile',  label: 'Visualization / Mobile' },
  { id: 'EditorDesktop',        label: 'Editor / Desktop' },
  { id: 'EditorMobile',         label: 'Editor / Mobile' },
  { id: 'AnnotationModal',      label: 'Modal: Annotation' },
  { id: 'SelectionRefine',      label: 'Modal: Selection Refine' },
  { id: 'ExportImport',         label: 'Modal: Backup' },
  { id: 'NewPiece',             label: 'Modal: New Work' },
]

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('WorkListDesktop')
  // Tracks which annotation kind opened the modal (intent/comment/breath)
  const [pendingKind, setPendingKind] = useState<AnnotKind>('comment')

  function openAnnotModal(kind: AnnotKind) {
    setPendingKind(kind)
    setScreen('AnnotationModal')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.ui }}>
      {/* Wireframe nav bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.lineSoft}`,
        padding: '10px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: C.ink }}>NoteDraftForge — UX Wireframe 2</div>
            <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft, marginTop: 1 }}>MVP screens · React 18 + Tiptap · Material-style design system</div>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.inkMute, paddingTop: 2 }}>
            {SCREEN_LIST.findIndex(s => s.id === screen) + 1} / {SCREEN_LIST.length}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {SCREEN_LIST.map(s => (
            <button key={s.id} onClick={() => setScreen(s.id)} style={{
              padding: '4px 10px', borderRadius: 6,
              background: screen === s.id ? C.accentSoft : 'transparent',
              color: screen === s.id ? C.accentInk : C.inkMute,
              border: `1px solid ${screen === s.id ? C.accentSoft : C.lineSoft}`,
              fontFamily: F.ui, fontSize: 11, fontWeight: screen === s.id ? 600 : 400,
              cursor: 'pointer',
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Screen */}
      <div style={{ padding: '32px 24px 60px', display: 'flex', justifyContent: 'center' }}>
        {screen === 'WorkListDesktop' && (
          <WorkListDesktop
            onView={() => setScreen('VisualizationDesktop')}
            onEdit={() => setScreen('EditorDesktop')}
          />
        )}
        {screen === 'WorkListMobile' && (
          <WorkListMobile onView={() => setScreen('VisualizationMobile')} />
        )}
        {screen === 'VisualizationDesktop' && (
          <VisualizationDesktop
            onEdit={() => setScreen('EditorDesktop')}
            onReturnToList={() => setScreen('WorkListDesktop')}
            onAddNote={openAnnotModal}
          />
        )}
        {screen === 'VisualizationMobile' && (
          <VisualizationMobile
            onEdit={() => setScreen('EditorMobile')}
            onReturnToList={() => setScreen('WorkListMobile')}
            onAddNote={openAnnotModal}
          />
        )}
        {screen === 'EditorDesktop' && (
          <EditorDesktop
            onView={() => setScreen('VisualizationDesktop')}
            onReturnToList={() => setScreen('WorkListDesktop')}
          />
        )}
        {screen === 'EditorMobile' && (
          <EditorMobile
            onView={() => setScreen('VisualizationMobile')}
            onRefine={() => setScreen('SelectionRefine')}
          />
        )}
        {screen === 'AnnotationModal' && (
          <AnnotationModal
            initialKind={pendingKind}
            onBack={() => setScreen('VisualizationDesktop')}
          />
        )}
        {screen === 'SelectionRefine' && (
          <SelectionRefineModal onBack={() => setScreen('EditorMobile')} />
        )}
        {screen === 'ExportImport' && (
          <ExportImportModal onBack={() => setScreen('WorkListDesktop')} />
        )}
        {screen === 'NewPiece' && (
          <NewPieceModal onBack={() => setScreen('WorkListDesktop')} />
        )}
      </div>
    </div>
  )
}
