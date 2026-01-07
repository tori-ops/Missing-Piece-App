'use client';

interface AstrologyCardProps {
  primaryColor?: string;
  secondaryColor?: string;
  bodyFontFamily?: string;
  textColor?: string;
  onClick: () => void;
}

export default function AstrologyCard({
  primaryColor = '#274E13',
  secondaryColor = '#e1e0d0',
  bodyFontFamily = "'Poppins', sans-serif",
  textColor = '#FFFFFF',
  onClick,
}: AstrologyCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: primaryColor,
        border: `2px solid ${secondaryColor}`,
        borderRadius: '6px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        fontFamily: 'inherit',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '150px',
        margin: '0 auto',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${primaryColor}30`;
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: '2rem', margin: '0 0 0.35rem 0' }}>⭐</div>
      <h3 style={{ color: textColor, fontFamily: bodyFontFamily, margin: '0.5rem 0', fontSize: '1rem' }}>
        Astrology
      </h3>
    </button>
  );
}
