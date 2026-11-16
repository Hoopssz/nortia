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
        cursor: onClick ? 'pointer' : undefined,
        userSelect: 'none',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 800,
          fontSize: `${size * 0.72}px`,
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
              fontSize: `${size * 0.22}px`,
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
    </div>
  );
};

export default NortiaLogo;
