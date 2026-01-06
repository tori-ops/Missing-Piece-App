'use client';

import WeatherGoldenHourWidget from './WeatherGoldenHourWidget';

interface WeatherDetailViewProps {
  weddingDate: string;
  venueLat?: number;
  venueLng?: number;
  venueName?: string;
  venueAddress?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  logoUrl?: string | null;
  companyName?: string;
  onBack: () => void;
}

export default function WeatherDetailView({
  weddingDate,
  venueLat,
  venueLng,
  venueName,
  venueAddress,
  primaryColor = '#274E13',
  secondaryColor = '#D0CEB5',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  logoUrl,
  companyName,
  onBack,
}: WeatherDetailViewProps) {
  return (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${primaryColor}20`,
      }}>
        <h2 style={{ 
          color: primaryColor,
          fontFamily: headerFontFamily,
          margin: 0,
          fontSize: '2.5rem',
          lineHeight: 1.2,
        }}>
          Weather & Golden Hour
        </h2>
      </div>

      {/* Venue Info */}
      {venueName && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: fontColor, fontSize: '0.9rem', margin: '0 0 0.25rem 0', opacity: 0.7 }}>
            Venue:
          </p>
          <p style={{ color: fontColor, fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
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
      <p style={{ color: fontColor, marginBottom: '1.5rem', fontSize: '1rem', opacity: 0.8 }}>
        Wedding Date: <strong>{new Date(weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
      </p>

      {/* Widget */}
      <WeatherGoldenHourWidget
        weddingDate={weddingDate}
        venueLat={venueLat}
        venueLng={venueLng}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
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

      {/* Business Name & Logo - Centered at Bottom */}
      {(logoUrl || companyName) && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '3rem'
        }}>
          {companyName && (
            <div style={{
              fontSize: '0.75rem',
              color: fontColor,
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: 1.3,
              maxWidth: '200px',
            }}>
              {companyName}
            </div>
          )}
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{
                height: '4rem',
                width: 'auto',
                maxWidth: '200px',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
