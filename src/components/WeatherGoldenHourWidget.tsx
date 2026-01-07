'use client';

import { useState, useEffect } from 'react';
import WeddingDayWidget from './WeddingDayWidget';

interface WeatherGoldenHourWidgetProps {
  weddingDate: string;
  venueLat?: number;
  venueLng?: number;
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  clientId?: string;
}

interface HistoricalWeatherDay {
  date: string;
  dayOfWeek: string;
  tempMax?: number;
  tempMin?: number;
  tempMean?: number;
  precipitation?: number;
  sunrise?: string;
  sunset?: string;
  sunriseTime?: string;
  sunsetTime?: string;
  morningGoldenStart?: string;
  morningGoldenEnd?: string;
  eveningGoldenStart?: string;
  eveningGoldenEnd?: string;
  isWeddingWeek?: boolean;
  pollen?: {
    tree?: number;
    grass?: number;
    weed?: number;
    ragweed?: number;
  };
}

interface HistoricalWeatherData {
  daily?: HistoricalWeatherDay[];
  summary?: {
    avgHighTemp?: string;
    avgLowTemp?: string;
    totalPrecipitation?: string;
    rainDays?: number;
  };
  priorYearDate?: string;
  error?: string;
}

export default function WeatherGoldenHourWidget({
  weddingDate,
  venueLat,
  venueLng,
  primaryColor = '#274E13',
  secondaryColor = '#D0CEB5',
  fontColor = '#000000',
  bodyFontFamily = "'Georgia', serif",
  headerFontFamily = "'Playfair Display', serif",
  clientId,
}: WeatherGoldenHourWidgetProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dateStr = new Date(weddingDate).toISOString().split('T')[0];

        if (!venueLat || !venueLng) {
          setError('Venue location not available');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/wedding/historical-weather?lat=${venueLat}&lng=${venueLng}&date=${dateStr}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.error || 'Failed to load weather data');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setHistoricalData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load weather data');
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (weddingDate && venueLat && venueLng) {
      fetchData();
    }
  }, [weddingDate, venueLat, venueLng]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: fontColor }}>
        Loading weather data...
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

  if (!historicalData?.daily || historicalData.daily.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: fontColor }}>
        No weather data available
      </div>
    );
  }

  // Helper function to determine pollen level
  const getPollenLevel = (count: number | undefined): { level: string; emoji: string; color: string } => {
    if (!count) return { level: 'None', emoji: '✅', color: '#22c55e' };
    if (count < 50) return { level: 'Low', emoji: '🟢', color: '#86efac' };
    if (count < 500) return { level: 'Moderate', emoji: '🟡', color: '#fbbf24' };
    if (count < 2000) return { level: 'High', emoji: '🟠', color: '#fb923c' };
    return { level: 'Very High', emoji: '🔴', color: '#ef4444' };
  };

  const getMaxPollenLevel = (pollen: any): { level: string; emoji: string; color: string } => {
    const counts = [pollen?.tree || 0, pollen?.grass || 0, pollen?.weed || 0, pollen?.ragweed || 0];
    const max = Math.max(...counts);
    return getPollenLevel(max);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overall Summary */}
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
          border: `1px solid ${secondaryColor}`,
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <h4 style={{ color: secondaryColor, margin: '0 0 1rem 0', fontFamily: headerFontFamily, fontSize: '1.9em' }}>
          Historical Weather Summary
        </h4>
        <p style={{ color: fontColor, fontSize: '0.9rem', margin: '0 0 1rem 0', opacity: 0.7, fontFamily: bodyFontFamily }}>
          Based on {historicalData.daily.length} days of data from the prior year
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
              Avg High
            </p>
            <p style={{ fontSize: '1.3rem', fontWeight: '600', color: fontColor, margin: 0 }}>
              {historicalData.summary?.avgHighTemp}°F
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
              Avg Low
            </p>
            <p style={{ fontSize: '1.3rem', fontWeight: '600', color: fontColor, margin: 0 }}>
              {historicalData.summary?.avgLowTemp}°F
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
              Total Rain
            </p>
            <p style={{ fontSize: '1.3rem', fontWeight: '600', color: fontColor, margin: 0 }}>
              {historicalData.summary?.totalPrecipitation}"
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.25rem 0' }}>
              Rainy Days
            </p>
            <p style={{ fontSize: '1.3rem', fontWeight: '600', color: fontColor, margin: 0 }}>
              {historicalData.summary?.rainDays}
            </p>
          </div>
        </div>
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
        clientId={clientId}
      />

      {/* Full 60-Day Timeline */}
      <details style={{ cursor: 'pointer' }}>
        <summary
          style={{
            color: primaryColor,
            fontWeight: '600',
            padding: '1rem',
            background: `${primaryColor}10`,
            borderRadius: '8px',
            userSelect: 'none',
          }}
        >
          Full 60-Day Weather Timeline (Click to expand)
        </summary>
        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          {historicalData.daily.map((day) => (
            <div
              key={day.date}
              style={{
                background: day.isWeddingWeek ? `${primaryColor}15` : `${fontColor}05`,
                border: `1px solid ${primaryColor}30`,
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: primaryColor }}>
                {day.dayOfWeek} {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p style={{ margin: '0.25rem 0', color: fontColor }}>
                {day.tempMax}° / {day.tempMin}°
              </p>
              <p style={{ margin: '0.25rem 0', color: fontColor }}>
                {day.precipitation}"
              </p>
              <p style={{ margin: '0.25rem 0', color: fontColor, fontSize: '0.75rem', opacity: 0.7 }}>
                {day.sunriseTime}
              </p>
              <p style={{ margin: '0.25rem 0', color: fontColor, fontSize: '0.75rem', opacity: 0.7 }}>
                {day.sunsetTime}
              </p>
              {day.pollen && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${fontColor}10` }}>
                  {(() => {
                    const maxLevel = getMaxPollenLevel(day.pollen);
                    return (
                      <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '600' }}>
                        {maxLevel.level}
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
