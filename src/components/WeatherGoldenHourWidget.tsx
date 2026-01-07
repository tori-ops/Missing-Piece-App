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
  windSpeed?: number;
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
  const [activeTab, setActiveTab] = useState<string>('wedding-week');

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

  // Get wedding week data
  const weddingWeekData = historicalData.daily.filter((d) => d.isWeddingWeek);
  
  // Get 2 weeks before wedding week
  const twoWeeksBeforeStart = Math.max(0, weddingWeekData.length > 0 ? historicalData.daily.indexOf(weddingWeekData[0]) - 14 : 0);
  const twoWeeksBefore = historicalData.daily.slice(twoWeeksBeforeStart, weddingWeekData.length > 0 ? historicalData.daily.indexOf(weddingWeekData[0]) : 0);
  
  // Get 2 weeks after wedding week  
  const twoWeeksAfterStart = weddingWeekData.length > 0 ? historicalData.daily.indexOf(weddingWeekData[weddingWeekData.length - 1]) + 1 : 0;
  const twoWeeksAfter = historicalData.daily.slice(twoWeeksAfterStart, Math.min(twoWeeksAfterStart + 14, historicalData.daily.length));

  const DayCard = ({ day }: { day: HistoricalWeatherDay }) => (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.3)',
        padding: '1rem',
        borderRadius: '8px',
        borderLeft: `4px solid ${primaryColor}`,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: fontColor, opacity: 0.6, margin: 0 }}>
            {day.dayOfWeek}
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: fontColor, opacity: 0.6, margin: 0 }}>
            High / Low
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
            {day.tempMax}° / {day.tempMin}°
          </p>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: fontColor, opacity: 0.6, margin: 0 }}>
            Precipitation
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
            {day.precipitation}"
          </p>
        </div>
      </div>
      {day.pollen && (
        <div
          style={{
            fontSize: '0.85rem',
            color: fontColor,
            opacity: 0.8,
            paddingTop: '0.75rem',
            borderTop: `1px solid ${fontColor}20`,
          }}
        >
          {(() => {
            const maxLevel = getMaxPollenLevel(day.pollen);
            return (
              <>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                  Pollen: {maxLevel.level}
                </p>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  {(day.pollen?.tree || 0) > 0 && <p style={{ margin: '0.1rem 0' }}>Tree: {day.pollen.tree}</p>}
                  {(day.pollen?.grass || 0) > 0 && <p style={{ margin: '0.1rem 0' }}>Grass: {day.pollen.grass}</p>}
                  {(day.pollen?.weed || 0) > 0 && <p style={{ margin: '0.1rem 0' }}>Weed: {day.pollen.weed}</p>}
                  {(day.pollen?.ragweed || 0) > 0 && <p style={{ margin: '0.1rem 0' }}>Ragweed: {day.pollen.ragweed}</p>}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );

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
          Based on 5 weeks (35 days) of data centered on your wedding date from the prior year
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

        {/* Expandable Tabs */}
        <div style={{ marginTop: '1.5rem', borderTop: `1px solid ${fontColor}20`, paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              { id: 'two-weeks-before', label: '2 Weeks Before' },
              { id: 'wedding-week', label: 'Wedding Week' },
              { id: 'two-weeks-after', label: '2 Weeks After' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? primaryColor : 'transparent',
                  color: activeTab === tab.id ? fontColor : fontColor,
                  border: `1px solid ${primaryColor}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: bodyFontFamily,
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  transition: 'all 0.2s ease',
                  opacity: activeTab === tab.id ? 1 : 0.7,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {activeTab === 'two-weeks-before' &&
              (twoWeeksBefore.length > 0 ? (
                twoWeeksBefore.map((day) => <DayCard key={day.date} day={day} />)
              ) : (
                <p style={{ color: fontColor, opacity: 0.6 }}>No data available</p>
              ))}
            {activeTab === 'wedding-week' &&
              (weddingWeekData.length > 0 ? (
                weddingWeekData.map((day) => <DayCard key={day.date} day={day} />)
              ) : (
                <p style={{ color: fontColor, opacity: 0.6 }}>No data available</p>
              ))}
            {activeTab === 'two-weeks-after' &&
              (twoWeeksAfter.length > 0 ? (
                twoWeeksAfter.map((day) => <DayCard key={day.date} day={day} />)
              ) : (
                <p style={{ color: fontColor, opacity: 0.6 }}>No data available</p>
              ))}
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
    </div>
  );
}
