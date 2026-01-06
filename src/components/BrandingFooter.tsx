'use client';

interface BrandingFooterProps {
  primaryColor?: string;
}

export default function BrandingFooter({ primaryColor = '#274E13' }: BrandingFooterProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 100,
        textAlign: 'right',
        padding: '1rem 2rem',
        fontSize: '0.75rem',
        color: primaryColor,
        fontStyle: 'italic',
        opacity: 0.7,
        borderTop: `1px solid ${primaryColor}20`,
      }}
    >
      Engineered by The Missing Piece Planning
    </div>
  );
}
