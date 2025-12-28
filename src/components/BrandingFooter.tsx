'use client';

interface BrandingFooterProps {
  primaryColor?: string;
}

export default function BrandingFooter({ primaryColor = '#274E13' }: BrandingFooterProps) {
  return (
    <div
      style={{
        textAlign: 'right',
        padding: '2rem 2rem 1rem 1rem',
        fontSize: '0.75rem',
        color: primaryColor,
        fontStyle: 'italic',
        opacity: 0.7,
        borderTop: `1px solid ${primaryColor}20`,
        marginTop: '2rem',
      }}
    >
      Engineered by The Missing Piece Planning
    </div>
  );
}
