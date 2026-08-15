import React from 'react'
import { C, F, kindStyle, type WorkType, type SnapshotState, type AnnotKind } from '../design-system'
import { Icon, type IconName } from './Icon'

export function Btn({ children, icon, variant = 'ghost', size = 'md', onClick, disabled }: {
  children?: React.ReactNode
  icon?: IconName
  variant?: 'ghost' | 'outline' | 'solid' | 'accent' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
}) {
  const sz = { sm: { h: 28, px: 10, fs: 12, r: 8 }, md: { h: 34, px: 12, fs: 13, r: 10 }, lg: { h: 40, px: 16, fs: 14, r: 12 } }[size]
  const v = {
    ghost:   { bg: 'transparent', color: C.ink,       border: 'transparent' },
    outline: { bg: C.surface,     color: C.ink,       border: C.line },
    solid:   { bg: C.ink,         color: C.surface,   border: C.ink },
    accent:  { bg: C.accent,      color: '#fff',      border: C.accent },
    soft:    { bg: C.accentSoft,  color: C.accentInk, border: 'transparent' },
  }[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: sz.h, padding: `0 ${sz.px}px`, borderRadius: sz.r,
        fontFamily: F.ui, fontSize: sz.fs, fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: `1px solid ${v.border}`,
        background: v.bg, color: v.color,
        userSelect: 'none', whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

export function IconBtn({ name, onClick, title, size = 16, active }: {
  name: IconName; onClick?: () => void; title?: string; size?: number; active?: boolean
}) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 32, height: 32, borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', border: '1px solid transparent',
      background: active ? C.surfaceAlt : 'transparent',
      color: active ? C.ink : C.inkMute,
    }}>
      <Icon name={name} size={size} />
    </button>
  )
}

export function Badge({ children, type }: { children: React.ReactNode; type?: WorkType }) {
  const t = type === 'poem'
    ? { bg: 'oklch(0.93 0.04 330)', fg: 'oklch(0.42 0.13 335)' }
    : type === 'text'
    ? { bg: 'oklch(0.93 0.04 150)', fg: 'oklch(0.38 0.10 165)' }
    : { bg: C.surfaceAlt, fg: C.inkMute }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      background: t.bg, color: t.fg,
      fontFamily: F.ui, fontSize: 11, fontWeight: 500,
    }}>{children}</span>
  )
}

export function SnapshotPill({ state }: { state: SnapshotState }) {
  const conf = {
    ready:      { bg: '#dcfce7', color: '#166534', text: 'Snapshot ready' },
    stale:      { bg: '#fef3c7', color: '#92400e', text: 'Snapshot stale' },
    generating: { bg: '#dbeafe', color: '#1e40af', text: 'Generating…' },
  }[state]
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 999,
      background: conf.bg, color: conf.color,
      fontFamily: F.ui, fontSize: 11, fontWeight: 600,
    }}>{conf.text}</span>
  )
}

export function Toggle({ checked, onChange, label, hint, disabled }: {
  checked: boolean; onChange: () => void; label?: string; hint?: string; disabled?: boolean
}) {
  return (
    <label onClick={disabled ? undefined : onChange} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <span style={{
        width: 34, height: 20, borderRadius: 999, padding: 3, flexShrink: 0,
        background: checked ? C.accent : C.line,
        transition: 'background 150ms', display: 'inline-flex',
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%', background: '#fff',
          transform: checked ? 'translateX(14px)' : 'translateX(0)',
          transition: 'transform 150ms',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}/>
      </span>
      <div>
        {label && <div style={{ fontFamily: F.ui, fontSize: 13, color: C.ink, fontWeight: 500 }}>{label}</div>}
        {hint && <div style={{ fontFamily: F.ui, fontSize: 11, color: C.inkSoft }}>{hint}</div>}
      </div>
    </label>
  )
}

export function FilterChip({ children, active, onClick, type }: {
  children: React.ReactNode; active: boolean; onClick: () => void; type?: WorkType
}) {
  const t = type === 'poem'
    ? { bg: active ? 'oklch(0.88 0.06 330)' : 'transparent', fg: active ? 'oklch(0.42 0.13 335)' : C.inkMute, border: active ? 'oklch(0.88 0.06 330)' : C.line }
    : type === 'text'
    ? { bg: active ? 'oklch(0.88 0.06 150)' : 'transparent', fg: active ? 'oklch(0.38 0.10 165)' : C.inkMute, border: active ? 'oklch(0.88 0.06 150)' : C.line }
    : { bg: active ? C.ink : 'transparent', fg: active ? '#fff' : C.inkMute, border: active ? C.ink : C.line }
  return (
    <button onClick={onClick} style={{
      padding: '3px 9px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
      fontFamily: F.ui, fontSize: 11, fontWeight: 500, cursor: 'pointer',
    }}>{children}</button>
  )
}

export function AppChrome({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{
      height: 52, padding: '0 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `1px solid ${C.lineSoft}`,
      background: C.surface, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 16, color: C.ink, letterSpacing: -0.2 }}>
          NoteDraftForge
        </span>
        {left}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{right}</div>
    </div>
  )
}

export function ModePill({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '3px 11px', borderRadius: 999,
      background: active ? C.accentSoft : 'transparent',
      color: active ? C.accentInk : C.inkMute,
      border: `1px solid ${active ? C.accentSoft : 'transparent'}`,
      fontFamily: F.ui, fontSize: 13, fontWeight: active ? 600 : 500,
      cursor: onClick ? 'pointer' : 'default',
    }}>{label}</button>
  )
}

// LangToggle — compact ES/EN UI language switcher.
// Self-contained state (doesn't affect wireframe content, purely presentational).
export function LangToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const [lang, setLang] = React.useState<'ES' | 'EN'>('ES')
  const h = size === 'sm' ? 26 : 30
  const fs = size === 'sm' ? 11 : 12
  const px = size === 'sm' ? 8 : 10
  return (
    <div style={{
      display: 'inline-flex', borderRadius: 8,
      border: `1px solid ${C.line}`, overflow: 'hidden',
    }}>
      {(['ES', 'EN'] as const).map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          height: h, padding: `0 ${px}px`,
          border: 0, cursor: 'pointer',
          background: lang === l ? C.ink : 'transparent',
          color: lang === l ? '#fff' : C.inkMute,
          fontFamily: F.ui, fontSize: fs, fontWeight: 600,
          transition: 'background 120ms',
        }}>{l}</button>
      ))}
    </div>
  )
}

// AnnotKindTag — small colored label used inside annotation cards
export function AnnotKindTag({ kind }: { kind: AnnotKind }) {
  const ks = kindStyle(kind)
  return (
    <span style={{
      display: 'inline-flex', padding: '1px 6px', borderRadius: 999,
      background: ks.bg, color: ks.ink,
      fontFamily: F.ui, fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: 0.6,
    }}>{kind}</span>
  )
}
