'use client';

import WeatherGoldenHourWidget from './WeatherGoldenHourWidget';

interface WeatherDetailViewProps {
  weddingDate: string;
  venueLat?: number;
  venueLng?: number;
  venueName?: string;
  venueAddress?: string;
  primaryColor?: string;
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
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  logoUrl,
  companyName,
  onBack,
}: WeatherDetailViewProps) {
  return (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      {/* Branded Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${primaryColor}20`,
        gap: '2rem',
      }}>
        {/* Left: Title & Tagline */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ 
            color: primaryColor,
            fontFamily: headerFontFamily,
            margin: '0 0 0.25rem 0',
            fontSize: '2.5rem',
            lineHeight: 1.2,
          }}>
            Weather &
          </h2>
          <h2 style={{ 
            color: primaryColor,
            fontFamily: headerFontFamily,
            margin: '0 0 0.5rem 0',
            fontSize: '2.5rem',
            lineHeight: 1.2,
          }}>
            Golden Hour
          </h2>
          {/* Tagline placeholder - to be added */}
        </div>

        {/* Right: Logo & Business Name */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem',
          flexShrink: 0,
        }}>
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
          {companyName && (
            <div style={{
              fontSize: '0.75rem',
              color: fontColor,
              fontWeight: '600',
              textAlign: 'right',
              lineHeight: 1.3,
              maxWidth: '200px',
            }}>
              {companyName}
            </div>
          )}
        </div>
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
