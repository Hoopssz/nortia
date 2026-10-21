import React from 'react';

export interface NortiaLogoProps {
  variant?: 'isotipo' | 'logotipo' | 'both';
  size?: number;
  lightText?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const NortiaLogo: React.FC<NortiaLogoProps> = ({
  variant = 'both',
  size = 40,
  lightText = false,
  className,
  style,
  onClick,
}) => {
  const textColor = lightText ? '#FFFFFF' : '#265370';

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : undefined,
        userSelect: 'none',
        ...style,
      }}
    >
      {(variant === 'isotipo' || variant === 'both') && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          width={size}
          height={size}
          style={{ flexShrink: 0 }}
        >
          <rect width="64" height="64" rx="18" fill="#265370" />
          <rect x="16" y="13" width="8" height="38" fill="#FFFFFF" />
          <rect x="12" y="13" width="16" height="3" fill="#FFFFFF" />
          <rect x="12" y="48" width="16" height="3" fill="#FFFFFF" />
          <rect x="40" y="13" width="8" height="38" fill="#FFFFFF" />
          <rect x="36" y="13" width="16" height="3" fill="#FFFFFF" />
          <rect x="36" y="48" width="16" height="3" fill="#FFFFFF" />
          <polygon points="24,16 29,16 45,48 40,48" fill="#FFFFFF" />
          <path
            d="M50 4 C50.5 8 51 9.5 55.5 10 C51 10.5 50.5 12 50 16 C49.5 12 49 10.5 44.5 10 C49 9.5 49.5 8 50 4Z"
            fill="#FFFFFF"
          />
        </svg>
      )}

      {(variant === 'logotipo' || variant === 'both') && (
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            fontSize: `${size * 0.65}px`,
            color: textColor,
            letterSpacing: '0.02em',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'baseline',
            whiteSpace: 'nowrap',
          }}
        >
          <span>NORTI</span>
          <span style={{ position: 'relative', display: 'inline-block' }}>
            A
            <span
              style={{
                position: 'absolute',
                top: '-0.28em',
                right: '-0.38em',
                fontFamily: "'Inter', sans-serif",
                fontSize: `${size * 0.2}px`,
                fontWeight: 600,
                lineHeight: 1,
                color: textColor,
              }}
            >
              ®
            </span>
          </span>
          <span>.</span>
        </span>
      )}
    </div>
  );
};

export default NortiaLogo;
