'use client';

interface BrandingFooterProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export default function BrandingFooter({ primaryColor = '#274E13', secondaryColor = '#e1e0d0' }: BrandingFooterProps) {
  return (
    <div
      style={{
        position: 'relative',
        textAlign: 'right',
        padding: '2rem 2rem 1rem 2rem',
        fontSize: '0.75rem',
        color: primaryColor,
        fontStyle: 'italic',
        opacity: 0.7,
        borderTop: `1px solid ${primaryColor}20`,
      }}
    >
      <span style={{ color: secondaryColor }}>Engineered by The Missing Piece Planning</span>
    </div>
  );
}
