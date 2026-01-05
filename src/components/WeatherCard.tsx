'use client';

interface WeatherCardProps {
  primaryColor?: string;
  bodyFontFamily?: string;
  textColor?: string;
  onClick: () => void;
}

export default function WeatherCard({
  primaryColor = '#274E13',
  bodyFontFamily = "'Poppins', sans-serif",
  textColor = '#FFFFFF',
  onClick,
}: WeatherCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: primaryColor,
        border: `2px solid ${primaryColor}`,
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        fontFamily: 'inherit',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '120px',
        margin: '0 auto',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${primaryColor}30`;
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>🌤️</div>
      <h3 style={{ color: textColor, fontFamily: bodyFontFamily, margin: '0.5rem 0', fontSize: '1.25rem' }}>
        Weather & Golden Hour
      </h3>
    </button>
  );
}
