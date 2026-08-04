export function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: 24, margin: 0 }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: 'var(--slate)', fontSize: 14, margin: 0 }}>{subtitle}</p>}
    </div>
  )
}
