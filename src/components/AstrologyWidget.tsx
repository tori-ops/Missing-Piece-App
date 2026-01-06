'use client';

import { useState, useEffect } from 'react';

interface AstrologyWidgetProps {
  weddingDate: string;
  ceremonyTime?: string;
  lat?: string;
  lng?: string;
  clientId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
}

interface AstrologyData {
  date: string;
  sun: { sign: string; degree: string };
  moon: { sign: string; degree: string; daysUntilNextSign: string };
  mercury: { sign: string; degree: string };
  venus: { sign: string; degree: string; retrograde: boolean };
  mars: { sign: string; degree: string };
  jupiter: { sign: string; degree: string };
  saturn: { sign: string; degree: string };
  chiron: { sign: string; degree: string };
  lilith: { sign: string; degree: string };
  rising?: { sign: string; note?: string };
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
    orb: string;
  }>;
  moonPhase: {
    name: string;
    percentage: string;
    lunarAge: string;
  };
  retrogradeStatus: {
    retrograduatePlanets: string[];
    count: number;
  };
  rulingHour?: {
    hour: string;
    planet: string;
    note: string;
  };
  skyMap?: {
    hour: string;
    planets: Array<{ name: string; azimuth: number; altitude: number }>;
    horizon: string;
  };
  houseSystem: string;
  disclaimer: string;
}

export default function AstrologyWidget({
  weddingDate,
  ceremonyTime,
  lat,
  lng,
  clientId,
  primaryColor = '#274E13',
  secondaryColor = '#e1e0d0',
  fontColor = '#000000',
  bodyFontFamily = "'Georgia', serif",
  headerFontFamily = "'Playfair Display', serif",
}: AstrologyWidgetProps) {
  const [displayCeremonyTime, setDisplayCeremonyTime] = useState<string>(ceremonyTime || '');
  const [isSaving, setIsSaving] = useState(false);
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
  }, [dateStr, lat, lng]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayCeremonyTime(e.target.value);
  };

  const saveCeremonyTime = async () => {
    if (!clientId || !displayCeremonyTime) return;
    
    try {
      setIsSaving(true);
      const res = await fetch('/api/client/ceremony-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          ceremonyType: 'Main Ceremony',
          timeOfDay: displayCeremonyTime,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to save');
    } catch (err) {
      console.error('Error saving ceremony time:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      let url = `/api/wedding/astrology-enhanced?date=${dateStr}`;
      if (displayCeremonyTime) url += `&time=${displayCeremonyTime}`;
      if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setAstrology(data);
      setError(null);
      
      // Save ceremony time if clientId is provided
      if (clientId && displayCeremonyTime) {
        await saveCeremonyTime();
      }
    } catch (err) {
      setError('Failed to load astrology data');
      console.error('Error fetching astrology data:', err);
    } finally {
      setLoading(false);
    }
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
        background: `linear-gradient(135deg, ${secondaryColor}20 0%, ${secondaryColor}10 100%)`,
        border: `2px solid ${primaryColor}CC`,
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      <h3
        style={{
          color: secondaryColor,
          margin: '0 0 1.5rem 0',
          fontFamily: headerFontFamily,
          fontSize: '1.9em',
        }}
      >
        Celestial Profile
      </h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ color: fontColor, opacity: 0.6, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
          Ceremony Time (optional)
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
              fontFamily: bodyFontFamily,
              cursor: 'pointer',
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
          <button
            onClick={handleCalculate}
            disabled={loading || isSaving}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.95rem',
              backgroundColor: primaryColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || isSaving ? 'not-allowed' : 'pointer',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              transition: 'all 0.2s ease',
              opacity: loading || isSaving ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && !isSaving) {
                e.currentTarget.style.opacity = '0.85';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isSaving) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {loading || isSaving ? 'Processing...' : 'Calculate'}
          </button>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Sun */}
        <Card title="Sun" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.sun.sign}</strong></p>
          <p style={{ margin: 0 }}>Degree: <strong>{astrology.sun.degree}°</strong></p>
        </Card>

        {/* Moon */}
        <Card title="Moon" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.moon.sign}</strong></p>
          <p style={{ margin: '0 0 0.5rem 0' }}>Degree: <strong>{astrology.moon.degree}°</strong></p>
          <p style={{ margin: '0 0 0.5rem 0' }}>Phase: <strong>{astrology.moonPhase.name}</strong></p>
          <p style={{ margin: '0 0 0.5rem 0' }}>Illumination: <strong>{astrology.moonPhase.percentage}%</strong></p>
          <p style={{ margin: '0 0 0.5rem 0' }}>Lunar Age: <strong>{astrology.moonPhase.lunarAge} days</strong></p>
          <p style={{ margin: 0 }}>Next Sign: <strong>{astrology.moon.daysUntilNextSign}d</strong></p>
        </Card>

        {/* Mercury */}
        <Card title="Mercury" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.mercury.sign}</strong></p>
          <p style={{ margin: 0 }}>Degree: <strong>{astrology.mercury.degree}°</strong></p>
        </Card>

        {/* Venus */}
        <Card title="Venus" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.venus.sign}</strong></p>
          <p style={{ margin: '0 0 0.5rem 0' }}>Degree: <strong>{astrology.venus.degree}°</strong></p>
          <p style={{ margin: 0 }}>Retrograde: <strong>{astrology.venus.retrograde ? 'Yes' : 'No'}</strong></p>
        </Card>

        {/* Mars */}
        <Card title="Mars" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.mars.sign}</strong></p>
          <p style={{ margin: 0 }}>Degree: <strong>{astrology.mars.degree}°</strong></p>
        </Card>

        {/* Jupiter */}
        <Card title="Jupiter" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.jupiter.sign}</strong></p>
          <p style={{ margin: 0 }}>Degree: <strong>{astrology.jupiter.degree}°</strong></p>
        </Card>

        {/* Saturn */}
        <Card title="Saturn" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.saturn.sign}</strong></p>
          <p style={{ margin: 0 }}>Degree: <strong>{astrology.saturn.degree}°</strong></p>
        </Card>

        {/* Chiron */}
        <Card title="Chiron" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.chiron.sign}</strong></p>
          <p style={{ margin: 0 }}>Degree: <strong>{astrology.chiron.degree}°</strong></p>
        </Card>

        {/* Black Moon Lilith */}
        <Card title="Black Moon Lilith" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sign: <strong>{astrology.lilith.sign}</strong></p>
          <p style={{ margin: 0 }}>Degree: <strong>{astrology.lilith.degree}°</strong></p>
        </Card>

        {/* Rising Sign */}
        {astrology.rising && (
          <Card title="Rising Sign (Ascendant)" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
            <p style={{ margin: 0 }}>Sign: <strong>{astrology.rising.sign}</strong></p>
          </Card>
        )}

        {/* Retrograde Status */}
        <Card title="Retrograde Planets" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
          <p style={{ margin: 0 }}>
            {astrology.retrogradeStatus.retrograduatePlanets.join(', ') || 'None'}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.6, fontSize: '0.85rem' }}>
            {astrology.retrogradeStatus.count} retrograde
          </p>
        </Card>

        {/* House System */}
        {astrology.houses && (
          <Card title="House System" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
            <p style={{ margin: '0 0 0.5rem 0' }}>System: <strong>{astrology.houseSystem}</strong></p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Planet house placements shown below
            </p>
          </Card>
        )}

        {/* Planetary Ruling Hour */}
        {astrology.rulingHour && (
          <Card title="Ruling Hour" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
            <p style={{ margin: '0 0 0.5rem 0' }}>Time: <strong>{astrology.rulingHour.hour}</strong></p>
            <p style={{ margin: 0 }}>Planet: <strong>{astrology.rulingHour.planet}</strong></p>
          </Card>
        )}

        {/* Planet-in-House Mappings */}
        {astrology.houses && (
          <>
            <Card title="Sun in House" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>House {astrology.houses.sun}</p>
            </Card>
            <Card title="Moon in House" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>House {astrology.houses.moon}</p>
            </Card>
            <Card title="Venus in House" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>House {astrology.houses.venus}</p>
            </Card>
            <Card title="Mars in House" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>House {astrology.houses.mars}</p>
            </Card>
            <Card title="Rising in House" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>House {astrology.houses.ascending}</p>
            </Card>
          </>
        )}

        {/* Major Aspects */}
        {astrology.aspects.length > 0 && (
          <Card title="Major Aspects" primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily}>
            {astrology.aspects.map((aspect, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                <strong>{aspect.type}</strong>: {aspect.angle}° (orb {aspect.orb}°)
              </p>
            ))}
          </Card>
        )}
      </div>

      {/* Full-Width Sky Map at Bottom */}
      {astrology.skyMap && (
        <div style={{ marginBottom: '1.5rem' }}>
          <SkyMap skyMapData={astrology.skyMap} primaryColor={primaryColor} fontColor={fontColor} headerFontFamily={headerFontFamily} />
        </div>
      )}
    </div>
  );
}

function Card({ title, children, primaryColor, fontColor, headerFontFamily }: any) {
  return (
    <div
      style={{
        background: `${primaryColor}08`,
        border: `1px solid ${primaryColor}20`,
        borderRadius: '8px',
        padding: '1rem',
      }}
    >
      <h5
        style={{
          color: primaryColor,
          margin: '0 0 0.75rem 0',
          fontSize: '1.5rem',
          fontFamily: headerFontFamily,
          fontWeight: 600,
        }}
      >
        {title}
      </h5>
      <div style={{ color: fontColor, fontSize: '0.9rem', lineHeight: '1.5' }}>
        {children}
      </div>
    </div>
  );
}

function SkyMap({ skyMapData, primaryColor, fontColor, headerFontFamily }: any) {
  // Create a simple SVG sky map
  const width = 500;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  
  return (
    <div
      style={{
        background: `${primaryColor}08`,
        border: `1px solid ${primaryColor}20`,
        borderRadius: '8px',
        padding: '1.5rem',
      }}
    >
      <h5
        style={{
          color: primaryColor,
          margin: '0 0 1rem 0',
          fontSize: '0.95rem',
          fontFamily: headerFontFamily,
          fontWeight: 600,
        }}
      >
        Sky Map ({skyMapData.hour})
      </h5>
      <svg width="100%" height="320" viewBox={`0 0 ${width} ${height}`} style={{ background: '#0f1419', borderRadius: '6px' }}>
        {/* Background circle */}
        <circle cx={centerX} cy={centerY} r={120} fill="none" stroke={`${primaryColor}40`} strokeWidth="2" />
        
        {/* Cardinal directions - White text */}
        <text x={centerX} y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">N</text>
        <text x={centerX} y={height - 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">S</text>
        <text x="15" y={centerY + 5} fill="white" fontSize="14" fontWeight="bold">W</text>
        <text x={width - 15} y={centerY + 5} textAnchor="end" fill="white" fontSize="14" fontWeight="bold">E</text>
        
        {/* Horizon line (E-W) */}
        <line x1="50" y1={centerY} x2={width - 50} y2={centerY} stroke={`${primaryColor}60`} strokeWidth="1" strokeDasharray="5,5" />
        
        {/* Plot planets - Golden dots (#edaf02) with white text */}
        {skyMapData.planets.map((planet: any, i: number) => {
          // Convert azimuth and altitude to SVG coordinates
          const angle = (planet.azimuth - 90) * (Math.PI / 180); // Convert to math angle
          const altitudeRadius = (90 - planet.altitude) * (120 / 90); // Map altitude to radius
          const x = centerX + altitudeRadius * Math.cos(angle);
          const y = centerY + altitudeRadius * Math.sin(angle);
          
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="6" fill="#edaf02" opacity="0.8" />
              <text x={x + 10} y={y - 5} fill="white" fontSize="11" fontWeight="bold">{planet.name}</text>
            </g>
          );
        })}
      </svg>
      <p style={{ color: fontColor, fontSize: '0.85rem', margin: '0.75rem 0 0 0', opacity: 0.7 }}>
        Simplified celestial positions • Inner = Higher altitude • Outer = Lower altitude
      </p>
    </div>
  );
}
