'use client';

import AstrologyWidget from './AstrologyWidget';

interface AstrologyDetailViewProps {
  weddingDate: string;
  ceremonyTime?: string;
  clientId?: string;
  venueLat?: string;
  venueLng?: string;
  venueName?: string;
  venueAddress?: string;
  primaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  onBack: () => void;
}

export default function AstrologyDetailView({
  weddingDate,
  ceremonyTime,
  clientId,
  venueLat,
  venueLng,
  venueName,
  venueAddress,
  primaryColor = '#274E13',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  onBack,
}: AstrologyDetailViewProps) {
  return (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: primaryColor,
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '1.5rem',
          padding: 0,
          fontFamily: bodyFontFamily,
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Title */}
      <h2 style={{ color: primaryColor, fontFamily: headerFontFamily, marginTop: 0, fontSize: '2.25em' }}>
        Astrology & Moon Phase
      </h2>

      {/* Venue Info */}
      {venueName && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: fontColor, fontSize: '0.9rem', margin: '0 0 0.25rem 0', opacity: 0.7 }}>
            Venue:
          </p>
          <p style={{ color: fontColor, fontSize: '1.2rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
            {venueName}
          </p>
          {venueAddress && (
            <p style={{ color: fontColor, fontSize: '0.9rem', margin: 0, opacity: 0.7 }}>
              {venueAddress}
            </p>
          )}
        </div>
      )}

      {/* Wedding Date */}
      <p style={{ color: fontColor, marginBottom: '2rem', fontSize: '0.95rem', opacity: 0.8 }}>
        Wedding Date: <strong>{new Date(weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
      </p>

      {/* Widget */}
      <AstrologyWidget
        weddingDate={weddingDate}
        ceremonyTime={ceremonyTime}
        clientId={clientId}
        lat={venueLat}
        lng={venueLng}
        primaryColor={primaryColor}
        fontColor={fontColor}
        bodyFontFamily={bodyFontFamily}
        headerFontFamily={headerFontFamily}
      />

      {/* Back Button (Bottom) */}
      <button
        onClick={onBack}
        style={{
          background: `${primaryColor}20`,
          color: primaryColor,
          border: `1px solid ${primaryColor}`,
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: bodyFontFamily,
          transition: 'all 0.2s ease',
          marginTop: '2rem',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}20`;
          (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
        }}
      >
        ← Back to Dashboard
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
