// Export / Import modal
//
// Two tabs:
//   Export — shows a formatted JSON backup of all works + annotations + layer state.
//            Copy to clipboard or download as .json file.
//   Import — paste JSON or upload a .json file to restore a backup.
//            Warning banner: replaces all current data.

import { useState } from 'react'
import { C, F } from '../design-system'
import { Btn, IconBtn } from '../components/Primitives'

// ─── Sample fixture JSON ─────────────────────────────────────────────────────
// Represents what a real export would look like.

const SAMPLE_JSON = JSON.stringify({
  version: '1',
  exportedAt: '2026-05-03T10:22:00.000Z',
  pieces: [
    {
      id: 'a1b2c3d4-0000-0000-0000-000000000001',
      title: 'El descanso del día',
      type: 'poem',
      language: 'ES',
      tags: [
        { kind: 'type',  value: 'poem' },
        { kind: 'user',  value: 'stage' },
        { kind: 'user',  value: 'quiet' },
      ],
      content: {
        kind: 'poem',
        blocks: [
          {
            id: 'b1', kind: 'line',
            runs: [{ id: 'r1', text: 'Llega la tarde como un pájaro cansado,' }],
          },
          {
            id: 'b2', kind: 'line',
            runs: [{ id: 'r2', text: 'y se posa en los tejados.' }],
          },
        ],
      },
      annotations: [
        {
          id: 'ann-001',
          kind: 'intent',
          target: { kind: 'text-range', blockId: 'b1', startOffset: 22, endOffset: 37 },
          content: {
            shortNote: 'más lento, voz casi rota',
            extendedNote: 'Reducir el tempo hasta casi detenerse en "pájaro". La imagen del pájaro exhausto pide entrega física.',
          },
          layerId: 'intention',
          status: 'valid',
        },
        {
          id: 'ann-002',
          kind: 'breath',
          target: { kind: 'text-node', blockId: 'b1' },
          content: { mark: 'L' },
          layerId: 'breath',
          status: 'valid',
        },
      ],
      layerVisibility: {
        chord: true,
        meter: false,
        breath: true,
        intention: true,
        comments: true,
      },
      revision: 4,
      createdAt: '2026-04-10T08:00:00.000Z',
      updatedAt: '2026-05-01T18:44:00.000Z',
    },
  ],
}, null, 2)

// ─── Tab button ───────────────────────────────────────────────────────────────

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', border: 0, background: 'transparent',
      borderBottom: `2px solid ${active ? C.accent : 'transparent'}`,
      color: active ? C.accentInk : C.inkMute,
      fontFamily: F.ui, fontSize: 13, fontWeight: active ? 600 : 400,
      cursor: 'pointer', transition: 'color 120ms',
    }}>
      {label}
    </button>
  )
}

// ─── Export tab ───────────────────────────────────────────────────────────────

function ExportTab() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText(SAMPLE_JSON).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p style={{ fontFamily: F.ui, fontSize: 13, color: C.inkSoft, margin: '0 0 16px', lineHeight: 1.6 }}>
        Creates a complete JSON backup of all your works, annotations, and layer state.
        Store it somewhere safe — this is your only copy outside the browser.
      </p>

      {/* JSON preview */}
      <textarea
        readOnly
        value={SAMPLE_JSON}
        style={{
          width: '100%', height: 280, boxSizing: 'border-box',
          padding: '12px 14px', borderRadius: 10,
          border: `1px solid ${C.line}`, background: C.bg,
          fontFamily: F.mono, fontSize: 12, lineHeight: 1.55, color: C.ink,
          resize: 'none', outline: 'none',
        }}
      />

      {/* Meta */}
      <div style={{
        marginTop: 10, padding: '8px 12px', borderRadius: 8,
        background: C.surfaceAlt, border: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: F.ui, fontSize: 11, color: C.inkSoft,
      }}>
        <span>1 work · 2 annotations · layer state</span>
        <span style={{ color: C.lineSoft }}>·</span>
        <span>~3 KB</span>
        <span style={{ color: C.lineSoft }}>·</span>
        <span>notedraftforge-backup-2026-05-03.json</span>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Btn variant="accent" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy JSON'}
        </Btn>
        <Btn variant="outline">Download .json</Btn>
      </div>
    </div>
  )
}

// ─── Import tab ───────────────────────────────────────────────────────────────

function ImportTab() {
  const [value, setValue] = useState('')
  const hasContent = value.trim().length > 0

  return (
    <div>
      {/* Danger banner */}
      <div style={{
        padding: '10px 14px', borderRadius: 10, marginBottom: 16,
        background: '#fef2f2', border: `1px solid #fecaca`,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
        <p style={{ fontFamily: F.ui, fontSize: 12, color: '#991b1b', margin: 0, lineHeight: 1.6 }}>
          Restoring a backup <strong>replaces all current data</strong> — works, annotations, and layer state.
          This action cannot be undone. Make sure to export your current data first if you want to keep it.
        </p>
      </div>

      {/* Paste area */}
      <label style={{ display: 'block', marginBottom: 6, fontFamily: F.ui, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft }}>
        Paste backup JSON
      </label>
      <textarea
        placeholder={'{\n  "version": "1",\n  "pieces": [ … ]\n}'}
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{
          width: '100%', height: 220, boxSizing: 'border-box',
          padding: '12px 14px', borderRadius: 10,
          border: `1px solid ${hasContent ? C.accent : C.line}`,
          background: C.bg,
          fontFamily: F.mono, fontSize: 12, lineHeight: 1.55, color: C.ink,
          resize: 'none', outline: 'none',
          transition: 'border-color 120ms',
        }}
      />

      {/* File upload alternative */}
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: C.lineSoft }} />
        <span style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft, flexShrink: 0 }}>or</span>
        <div style={{ flex: 1, height: 1, background: C.lineSoft }} />
      </div>
      <button style={{
        marginTop: 10, width: '100%', height: 38, borderRadius: 10,
        border: `1px dashed ${C.line}`, background: 'transparent',
        fontFamily: F.ui, fontSize: 12, color: C.inkMute, cursor: 'pointer',
      }}>
        Upload .json file
      </button>

      {/* Restore action */}
      <div style={{ marginTop: 16 }}>
        <Btn
          variant={hasContent ? 'accent' : 'outline'}
          disabled={!hasContent}
        >
          Restore backup
        </Btn>
        {hasContent && (
          <span style={{ marginLeft: 12, fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>
            Will validate JSON before applying
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ExportImportModal({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'export' | 'import'>('export')

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
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(32,33,36,0.28)' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 560,
        background: C.surface, borderRadius: 16,
        border: `1px solid ${C.lineSoft}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px 0', borderBottom: `1px solid ${C.lineSoft}`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: C.ink }}>
                Backup
              </div>
              <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
                Export or restore your works as JSON
              </div>
            </div>
            <IconBtn name="close" onClick={onBack} />
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            <Tab label="Export"  active={tab === 'export'}  onClick={() => setTab('export')} />
            <Tab label="Restore" active={tab === 'import'}  onClick={() => setTab('import')} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {tab === 'export' ? <ExportTab /> : <ImportTab />}
        </div>
      </div>
    </div>
  )
}
