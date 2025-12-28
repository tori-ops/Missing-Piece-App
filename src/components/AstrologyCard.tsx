'use client';

interface AstrologyCardProps {
  primaryColor?: string;
  fontColor?: string;
  onClick: () => void;
}

export default function AstrologyCard({
  primaryColor = '#274E13',
  fontColor = '#000000',
  onClick,
}: AstrologyCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, #6366F320 0%, #8B5CF620 100%)`,
        border: `2px solid ${primaryColor}`,
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        fontFamily: 'inherit',
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
      <div style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>🌙⭐</div>
      <h3 style={{ color: primaryColor, margin: '0.5rem 0', fontSize: '1.1rem' }}>
        Astrology
      </h3>
      <p style={{ color: fontColor, margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>
        Moon & Zodiac
      </p>
    </button>
  );
}
