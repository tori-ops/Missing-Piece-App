'use client';

import WeatherGoldenHourWidget from './WeatherGoldenHourWidget';
import PriorYearSunriseSunsetCard from './PriorYearSunriseSunsetCard';
import WeddingDaySunriseSunsetCard from './WeddingDaySunriseSunsetCard';
import WeddingDayWidget from './WeddingDayWidget';

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
          color: fontColor,
          fontFamily: headerFontFamily,
          margin: 0,
          fontSize: '2.5rem',
          lineHeight: 1.2,
        }}>
          Golden Hour Predictor
        </h2>
      </div>

      {/* Wedding Details Card */}
      <WeddingDayWidget
        weddingDate={weddingDate}
        venueLat={venueLat}
        venueLng={venueLng}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        fontColor={fontColor}
        bodyFontFamily={bodyFontFamily}
        headerFontFamily={headerFontFamily}
        showAstrology={false}
      />

      {/* Sunrise/Sunset Cards - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <PriorYearSunriseSunsetCard
          weddingDate={weddingDate}
          venueLat={venueLat}
          venueLng={venueLng}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
        />

        <WeddingDaySunriseSunsetCard
          weddingDate={weddingDate}
          venueLat={venueLat}
          venueLng={venueLng}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
        />
      </div>

      {/* Historical Weather Widget */}
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
          background: primaryColor,
          color: fontColor,
          border: `1px solid ${secondaryColor}`,
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
          (e.currentTarget as HTMLButtonElement).style.background = `${secondaryColor}30`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
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
