export type IconName =
  | 'plus' | 'close' | 'check'
  | 'chevron-left' | 'chevron-right' | 'chevron-down'
  | 'eye' | 'eye-off' | 'edit' | 'layers' | 'comment' | 'search'
  | 'feather' | 'text' | 'music' | 'upload' | 'download'
  | 'sort' | 'tag' | 'more' | 'settings' | 'warning'
  | 'breath' | 'intent'

export function Icon({ name, size = 16, color }: { name: IconName; size?: number; color?: string }) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color ?? 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { flexShrink: 0 },
  }
  switch (name) {
    case 'plus':          return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
    case 'close':         return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>
    case 'check':         return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>
    case 'chevron-left':  return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>
    case 'chevron-right': return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>
    case 'chevron-down':  return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>
    case 'eye':           return <svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'eye-off':       return <svg {...p}><path d="M3 3l18 18M10.6 6.1A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 4.1M6.1 6.1C3.4 7.8 2 12 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.2-.8M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
    case 'edit':          return <svg {...p}><path d="M4 20h4L20 8l-4-4L4 16z"/></svg>
    case 'layers':        return <svg {...p}><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5"/></svg>
    case 'comment':       return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>
    case 'search':        return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
    case 'feather':       return <svg {...p}><path d="M20 4C13 5 7 10 7 17v3h3c7 0 12-6 13-13z"/><path d="M16 8L4 20"/><path d="M14 12h-4"/></svg>
    case 'text':          return <svg {...p}><path d="M4 6h16M4 12h10M4 18h16"/></svg>
    case 'music':         return <svg {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
    case 'upload':        return <svg {...p}><path d="M12 16V4M5 11l7-7 7 7"/><path d="M4 20h16"/></svg>
    case 'download':      return <svg {...p}><path d="M12 4v12M5 13l7 7 7-7"/><path d="M4 4h16"/></svg>
    case 'sort':          return <svg {...p}><path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3"/></svg>
    case 'tag':           return <svg {...p}><path d="M20 12L12 20 3 11V3h8z"/><circle cx="7.5" cy="7.5" r="1" fill="currentColor"/></svg>
    case 'more':          return <svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></svg>
    case 'settings':      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>
    case 'warning':       return <svg {...p}><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18.2a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
    case 'breath':        return <svg {...p}><path d="M4 14c2-4 6-4 8 0s6 4 8 0"/></svg>
    case 'intent':        return <svg {...p}><path d="M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11z"/></svg>
    default:              return null
  }
}
