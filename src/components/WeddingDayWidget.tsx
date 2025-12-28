'use client';

import { useState, useEffect } from 'react';

interface WeddingDayWidgetProps {
  weddingDate: string;
  venueLat?: number;
  venueLng?: number;
  primaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  showAstrology?: boolean;
  clientId?: string; // For localStorage key
}

interface WeatherData {
  temp?: number;
  description?: string;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  icon?: string;
  message?: string;
}

interface GoldenHourData {
  sunrise?: string;
  sunset?: string;
  morningGoldenHourStart?: string;
  morningGoldenHourEnd?: string;
  eveningGoldenHourStart?: string;
  eveningGoldenHourEnd?: string;
  dayLength?: string;
}

interface AstrologyData {
  moonPhase?: string;
  moonEmoji?: string;
  moonMeaning?: string;
  moonIllumination?: string;
  zodiacSign?: string;
  zodiacEmoji?: string;
  daysUntilFullMoon?: number;
}

export default function WeddingDayWidget({
  weddingDate,
  venueLat,
  venueLng,
  primaryColor = '#274E13',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  showAstrology = true,
  clientId,
}: WeddingDayWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [goldenHour, setGoldenHour] = useState<GoldenHourData | null>(null);
  const [astrology, setAstrology] = useState<AstrologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAstrologyToggle, setShowAstrologyToggle] = useState(showAstrology);

  // Load astrology preference from localStorage on mount
  useEffect(() => {
    if (clientId && typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem(`astrology-${clientId}`);
      if (savedPreference !== null) {
        setShowAstrologyToggle(JSON.parse(savedPreference));
      }
    }
  }, [clientId]);

  // Save astrology preference to localStorage when it changes
  const handleToggleAstrology = () => {
    const newValue = !showAstrologyToggle;
    setShowAstrologyToggle(newValue);
    if (clientId && typeof window !== 'undefined') {
      localStorage.setItem(`astrology-${clientId}`, JSON.stringify(newValue));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dateStr = new Date(weddingDate).toISOString().split('T')[0];

        // Fetch all three in parallel
        const [weatherRes, goldenHourRes, astrologyRes] = await Promise.all([
          venueLat && venueLng
            ? fetch(`/api/wedding/weather?lat=${venueLat}&lng=${venueLng}&date=${dateStr}`)
            : Promise.resolve(new Response(JSON.stringify({}))),
          venueLat && venueLng
            ? fetch(`/api/wedding/golden-hour?lat=${venueLat}&lng=${venueLng}&date=${dateStr}`)
            : Promise.resolve(new Response(JSON.stringify({}))),
          fetch(`/api/wedding/astrology?date=${dateStr}`),
        ]);

        const weatherData = await weatherRes.json();
        const goldenHourData = await goldenHourRes.json();
        const astrologyData = await astrologyRes.json();

        if (weatherRes.ok) setWeather(weatherData);
        if (goldenHourRes.ok) setGoldenHour(goldenHourData);
        if (astrologyRes.ok) setAstrology(astrologyData);

        if (!weatherRes.ok && !goldenHourRes.ok && !astrologyRes.ok) {
          setError('Could not load wedding day details');
        }
      } catch (err) {
        console.error('Error fetching wedding day data:', err);
        setError('Failed to load wedding day details');
      } finally {
        setLoading(false);
      }
    };

    if (weddingDate) {
      fetchData();
    }
  }, [weddingDate, venueLat, venueLng]);

  const getWeatherIcon = (icon?: string) => {
    if (!icon) return '🌤️';
    if (icon.includes('01')) return '☀️';
    if (icon.includes('02')) return '⛅';
    if (icon.includes('03') || icon.includes('04')) return '☁️';
    if (icon.includes('09') || icon.includes('10')) return '🌧️';
    if (icon.includes('11')) return '⛈️';
    if (icon.includes('13')) return '❄️';
    if (icon.includes('50')) return '🌫️';
    return '🌤️';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', fontFamily: bodyFontFamily }}>
        <p style={{ color: fontColor, opacity: 0.6 }}>Loading wedding day details...</p>
      </div>
    );
  }

  if (error && !weather && !goldenHour && !astrology) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', fontFamily: bodyFontFamily }}>
        <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: bodyFontFamily }}>
      {/* Weather Section */}
      {weather && (
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}08 100%)`,
            border: `1px solid ${primaryColor}30`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h4 style={{ color: primaryColor, margin: '0 0 1rem 0', fontFamily: headerFontFamily }}>
            🌤️ Weather Forecast
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Temperature
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
                {weather.temp}°F
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Conditions
              </p>
              <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                {getWeatherIcon(weather.icon)} {weather.condition}
              </p>
            </div>
            {weather.humidity !== undefined && (
              <div>
                <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                  Humidity
                </p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                  {weather.humidity}%
                </p>
              </div>
            )}
            {weather.windSpeed !== undefined && (
              <div>
                <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                  Wind Speed
                </p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                  {weather.windSpeed} mph
                </p>
              </div>
            )}
          </div>
          {weather.message && (
            <p style={{ fontSize: '0.85rem', color: fontColor, opacity: 0.7, margin: '0.75rem 0 0 0', fontStyle: 'italic' }}>
              {weather.message}
            </p>
          )}
        </div>
      )}

      {/* Golden Hour Section */}
      {goldenHour && (
        <div
          style={{
            background: `linear-gradient(135deg, #FF9A5630 0%, #FFD70015 100%)`,
            border: '1px solid #FFB84D50',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h4 style={{ color: '#D97706', margin: '0 0 1rem 0', fontFamily: headerFontFamily }}>
            🌅 Golden Hour & Sunrise/Sunset
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Sunrise
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                {goldenHour.sunrise}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Sunset
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                {goldenHour.sunset}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Morning Golden Hour
              </p>
              <p style={{ fontSize: '0.9rem', color: fontColor, margin: 0 }}>
                {goldenHour.morningGoldenHourStart} — {goldenHour.morningGoldenHourEnd}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Evening Golden Hour
              </p>
              <p style={{ fontSize: '0.9rem', color: fontColor, margin: 0 }}>
                {goldenHour.eveningGoldenHourStart} — {goldenHour.eveningGoldenHourEnd}
              </p>
            </div>
            {goldenHour.dayLength && (
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                  Total Daylight
                </p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                  {goldenHour.dayLength}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Astrology Section */}
      {astrology && showAstrologyToggle && (
        <div
          style={{
            background: `linear-gradient(135deg, #6366F130 0%, #8B5CF630 100%)`,
            border: `1px solid ${primaryColor}30`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <h4 style={{ color: primaryColor, margin: '0 0 1rem 0', fontFamily: headerFontFamily }}>
            🌙 Astrology & Moon Phase
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Moon Phase
              </p>
              <p style={{ fontSize: '1.2rem', margin: 0 }}>
                {astrology.moonEmoji} {astrology.moonPhase}
              </p>
              <p style={{ fontSize: '0.85rem', color: fontColor, opacity: 0.7, margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>
                {astrology.moonMeaning}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                Zodiac Sign
              </p>
              <p style={{ fontSize: '1.2rem', margin: 0 }}>
                {astrology.zodiacEmoji} {astrology.zodiacSign}
              </p>
            </div>
            {astrology.moonIllumination && (
              <div>
                <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                  Moon Illumination
                </p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                  {astrology.moonIllumination}
                </p>
              </div>
            )}
            {astrology.daysUntilFullMoon !== undefined && (
              <div>
                <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
                  Days Until Full Moon
                </p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
                  {astrology.daysUntilFullMoon} days
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Astrology Toggle Button */}
      {astrology && showAstrology !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            onClick={handleToggleAstrology}
            style={{
              background: `${primaryColor}20`,
              color: primaryColor,
              border: `1px solid ${primaryColor}`,
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
              transition: 'all 0.2s ease',
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
            {showAstrologyToggle ? '🌙 Hide Astrology' : '🌙 Show Astrology'}
          </button>
        </div>
      )}

      {/* Astrology Toggle Button */}
      {astrology && showAstrology !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            onClick={handleToggleAstrology}
            style={{
              background: `${primaryColor}20`,
              color: primaryColor,
              border: `1px solid ${primaryColor}`,
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
              transition: 'all 0.2s ease',
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
            {showAstrologyToggle ? '🌙 Hide Astrology' : '🌙 Show Astrology'}
          </button>
        </div>
      )}
    </div>
  );
}
