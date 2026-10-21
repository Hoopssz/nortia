const IC: Record<string, string> = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.4 8.6l-2 4.8-4.8 2 2-4.8z"/>',
  truck:
    '<path d="M2.5 6.5h11v8h-11z"/><path d="M13.5 9.5h3.6l3.4 3.4v1.6h-7z"/><circle cx="6.5" cy="16.5" r="1.7"/><circle cx="17" cy="16.5" r="1.7"/>',
  building:
    '<rect x="4.5" y="3.5" width="10" height="17" rx="1"/><path d="M14.5 20.5V9h4.5v11.5"/><path d="M7.5 7h1.5M7.5 10.5h1.5M7.5 14h1.5"/>',
  package: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  pin: '<path d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.6-3.6"/>',
  bell: '<path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  arrowR: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowL: '<path d="M20 12H5M11 18l-6-6 6-6"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  doc: '<path d="M6.5 3.5h7l4 4v13h-11z"/><path d="M13.5 3.5v4h4M9 13h6M9 16.5h6"/>',
  user: '<circle cx="12" cy="8" r="3.7"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.8c0 1.7-2.3 2-2.3 3.5"/><path d="M12 17.2h.01"/>',
  logout: '<path d="M14 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H14"/><path d="M17 8l4 4-4 4M9 12h12"/>',
  snow: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.3 2"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3.5v4M16 3.5v4"/>',
  repeat: '<path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4"/>',
  ruler: '<path d="M3.5 14.5l11-11 6 6-11 11z"/><path d="M7 9l1.6 1.6M9.5 6.5l1.6 1.6M12 4l1.6 1.6"/>',
  weight: '<path d="M5 8.5h14l1.5 11.5H3.5z"/><circle cx="12" cy="5.5" r="2"/>',
  boxes: '<path d="M3 8l4.5-2.5L12 8l-4.5 2.5zM12 8l4.5-2.5L21 8l-4.5 2.5zM7.5 13.5L12 11v5l-4.5 2.5z"/>',
  filter: '<path d="M4 5.5h16l-6 7v6l-4-2.5v-3.5z"/>',
  message: '<path d="M4 5.5h16v11H8l-4 3.5z"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4.5"/>',
  phone:
    '<path d="M6 3.5h4l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v4c0 1-.8 1.8-1.8 1.7C13 24 4 15 3.8 5.3 3.8 4.3 4.6 3.5 6 3.5z"/>',
  camera: '<path d="M4 7.5h3l1.5-2h7L17 7.5h3v12H4z"/><circle cx="12" cy="13" r="3.3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  home: '<path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4M17.5 17.5l-1.4-1.4M7.9 7.9L6.5 6.5"/>',
  sliders: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>',
  dollar: '<path d="M12 3v18M16 7.5c0-2-1.8-3-4-3s-4 1-4 3 1.8 2.7 4 3.2 4 1.2 4 3.3-1.8 3.2-4 3.2-4-1-4-3"/>',
  route:
    '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18h6a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.1 6.6 20l1-6.1L3.2 9.5l6.1-.9z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  sparkles: '<path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  bank: '<path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3l10 7H2l10-7z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.7,
  color,
  style,
  className,
}: {
  name: keyof typeof IC
  size?: number
  strokeWidth?: number
  color?: string
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      dangerouslySetInnerHTML={{ __html: IC[name] ?? '' }}
    />
  )
}

export function StarFill({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d={IC.star.match(/d="([^"]+)"/)?.[1]} />
    </svg>
  )
}

export function Star4Point({
  size = 16,
  color = 'currentColor',
  className = '',
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
    </svg>
  )
}
