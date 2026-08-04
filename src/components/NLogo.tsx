export function NLogo({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          color: '#fff',
          fontWeight: 800,
          fontSize: size * 0.5,
        }}
      >
        N
      </span>
      <svg
        width={size * 0.24}
        height={size * 0.24}
        viewBox="0 0 24 24"
        fill="#fff"
        style={{ position: 'absolute', top: size * 0.14, right: size * 0.14 }}
      >
        <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" />
      </svg>
    </div>
  )
}
