'use client';

import { useState, useEffect } from 'react';

interface AstrologyWidgetProps {
  weddingDate: string;
  ceremonyTime?: string;
  lat?: string;
  lng?: string;
  primaryColor?: string;
  fontColor?: string;
  headerFontFamily?: string;
}

interface AstrologyData {
  date: string;
  sun: {
    sign: string;
    degree: string;
  };
  moon: {
    sign: string;
    degree: string;
  };
  venus: {
    sign: string;
    degree: string;
    retrograde: boolean;
  };
  mars: {
    sign: string;
    degree: string;
  };
  rising?: {
    sign: string;
    note?: string;
  };
  houses?: {
    sun: number;
    moon: number;
    venus: number;
    mars: number;
    ascending: number;
  };
  aspects: Array<{
    type: string;
    angle: number;
    meaning: string;
  }>;
  moonPhase: {
    name: string;
    percentage: string;
  };
  disclaimer: string;
}

export default function AstrologyWidget({
  weddingDate,
  ceremonyTime,
  lat,
  lng,
  primaryColor = '#274E13',
  fontColor = '#000000',
  headerFontFamily = "'Playfair Display', serif",
}: AstrologyWidgetProps) {
  const [displayCeremonyTime, setDisplayCeremonyTime] = useState<string>(ceremonyTime || '');
  const dateStr = new Date(weddingDate).toISOString().split('T')[0];
  const [astrology, setAstrology] = useState<AstrologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAstrology = async () => {
      try {
        setLoading(true);
        let url = `/api/wedding/astrology-enhanced?date=${dateStr}`;
        if (displayCeremonyTime) url += `&time=${displayCeremonyTime}`;
        if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
        
        const res = await fetch(url);
        const data = await res.json();
        setAstrology(data);
        setError(null);
      } catch (err) {
        setError('Failed to load astrology data');
        console.error('Error fetching astrology data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAstrology();
  }, [dateStr, displayCeremonyTime, lat, lng]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayCeremonyTime(e.target.value);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: fontColor }}>
        Loading astrology data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: fontColor }}>
        {error}
      </div>
    );
  }

  if (!astrology) {
    return null;
  }

  return (
    <div
      style={{
        background: `linear-gradient(135deg, #6366F110 0%, #8B5CF610 100%)`,
        border: `1px solid ${primaryColor}20`,
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      <h3
        style={{
          color: primaryColor,
          margin: '0 0 1.5rem 0',
          fontFamily: headerFontFamily,
          fontSize: '1.4rem',
        }}
      >
        Celestial Profile
      </h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ color: fontColor, opacity: 0.6, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
          Ceremony Time (optional)
        </label>
        <input
          type="time"
          value={displayCeremonyTime}
          onChange={handleTimeChange}
          placeholder="HH:MM"
          style={{
            padding: '0.5rem',
            fontSize: '0.95rem',
            border: `1px solid ${primaryColor}40`,
            borderRadius: '6px',
            backgroundColor: `${primaryColor}08`,
            color: fontColor,
            fontFamily: "'Poppins', sans-serif",
            cursor: 'pointer',
            width: '100%',
            maxWidth: '150px',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = primaryColor;
            e.currentTarget.style.backgroundColor = `${primaryColor}15`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = `${primaryColor}40`;
            e.currentTarget.style.backgroundColor = `${primaryColor}08`;
          }}
        />
      </div>

      {/* Sun Position */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${primaryColor}15` }}>
        <h4 style={{ color: primaryColor, margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontFamily: headerFontFamily }}>
          Sun
        </h4>
        <div style={{ color: fontColor, fontSize: '0.95rem', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Sign: <strong>{astrology.sun.sign}</strong>
          </p>
          <p style={{ margin: 0 }}>
            Degree: <strong>{astrology.sun.degree}°</strong>
          </p>
        </div>
      </div>

      {/* Moon Position */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${primaryColor}15` }}>
        <h4 style={{ color: primaryColor, margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontFamily: headerFontFamily }}>
          Moon
        </h4>
        <div style={{ color: fontColor, fontSize: '0.95rem', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Sign: <strong>{astrology.moon.sign}</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Degree: <strong>{astrology.moon.degree}°</strong>
          </p>
          <p style={{ margin: 0 }}>
            Phase: <strong>{astrology.moonPhase.name}</strong> ({astrology.moonPhase.percentage}% illuminated)
          </p>
        </div>
      </div>

      {/* Venus Position */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${primaryColor}15` }}>
        <h4 style={{ color: primaryColor, margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontFamily: headerFontFamily }}>
          Venus
        </h4>
        <div style={{ color: fontColor, fontSize: '0.95rem', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Sign: <strong>{astrology.venus.sign}</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Degree: <strong>{astrology.venus.degree}°</strong>
          </p>
          <p style={{ margin: 0 }}>
            Retrograde: <strong>{astrology.venus.retrograde ? 'Yes' : 'No'}</strong>
          </p>
        </div>
      </div>

      {/* Mars Position */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${primaryColor}15` }}>
        <h4 style={{ color: primaryColor, margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontFamily: headerFontFamily }}>
          Mars
        </h4>
        <div style={{ color: fontColor, fontSize: '0.95rem', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Sign: <strong>{astrology.mars.sign}</strong>
          </p>
          <p style={{ margin: 0 }}>
            Degree: <strong>{astrology.mars.degree}°</strong>
          </p>
        </div>
      </div>

      {/* Rising Sign - only if ceremony time provided */}
      {astrology.rising && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${primaryColor}15` }}>
          <h4 style={{ color: primaryColor, margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontFamily: headerFontFamily }}>
            Rising Sign (Ascendant)
          </h4>
          <div style={{ color: fontColor, fontSize: '0.95rem', lineHeight: '1.6' }}>
            <p style={{ margin: 0 }}>
              Sign: <strong>{astrology.rising.sign}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Houses Grid - only if ceremony time provided */}
      {astrology.houses && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${primaryColor}15` }}>
          <h4 style={{ color: primaryColor, margin: '0 0 1rem 0', fontSize: '1.1rem', fontFamily: headerFontFamily }}>
            Houses
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ background: `${primaryColor}08`, padding: '0.75rem', borderRadius: '6px', border: `1px solid ${primaryColor}15` }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }}>
                Sun
              </p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: fontColor }}>
                House {astrology.houses.sun}
              </p>
            </div>
            <div style={{ background: `${primaryColor}08`, padding: '0.75rem', borderRadius: '6px', border: `1px solid ${primaryColor}15` }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }}>
                Moon
              </p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: fontColor }}>
                House {astrology.houses.moon}
              </p>
            </div>
            <div style={{ background: `${primaryColor}08`, padding: '0.75rem', borderRadius: '6px', border: `1px solid ${primaryColor}15` }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }}>
                Venus
              </p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: fontColor }}>
                House {astrology.houses.venus}
              </p>
            </div>
            <div style={{ background: `${primaryColor}08`, padding: '0.75rem', borderRadius: '6px', border: `1px solid ${primaryColor}15` }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }}>
                Mars
              </p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: fontColor }}>
                House {astrology.houses.mars}
              </p>
            </div>
            <div style={{ background: `${primaryColor}08`, padding: '0.75rem', borderRadius: '6px', border: `1px solid ${primaryColor}15` }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }}>
                Rising
              </p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: fontColor }}>
                House {astrology.houses.ascending}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Major Aspects */}
      {astrology.aspects.length > 0 && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${primaryColor}15` }}>
          <h4 style={{ color: primaryColor, margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontFamily: headerFontFamily }}>
            Major Aspects
          </h4>
          <div style={{ color: fontColor, fontSize: '0.95rem', lineHeight: '1.8' }}>
            {astrology.aspects.map((aspect, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>
                  {aspect.type}: <strong>{aspect.angle}°</strong>
                </p>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  {aspect.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div
        style={{
          background: `${primaryColor}08`,
          border: `1px dashed ${primaryColor}40`,
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: fontColor,
          opacity: 0.8,
          fontStyle: 'italic',
        }}
      >
        {astrology.disclaimer}
      </div>
    </div>
  );
}
