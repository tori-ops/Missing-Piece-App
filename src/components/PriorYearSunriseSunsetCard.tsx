'use client';

import { useState, useEffect } from 'react';

interface PriorYearSunriseSunsetCardProps {
  weddingDate: string;
  venueLat?: number;
  venueLng?: number;
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
}

interface SunriseSunsetData {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: number;
}

export default function PriorYearSunriseSunsetCard({
  weddingDate,
  venueLat,
  venueLng,
  primaryColor = '#274E13',
  secondaryColor = '#D0CEB5',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
}: PriorYearSunriseSunsetCardProps) {
  const [priorYearData, setPriorYearData] = useState<SunriseSunsetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!venueLat || !venueLng) {
          setError('Venue location not available');
          setLoading(false);
          return;
        }

        // Parse date string as YYYY-MM-DD to avoid timezone issues
        const [year, month, day] = weddingDate.split('-').map(Number);
        const priorYearDate = new Date(year - 1, month - 1, day);
        const priorYearDateStr = priorYearDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD

        console.log('[PriorYearSunriseSunsetCard] Fetching data:', { priorYearDateStr, venueLat, venueLng });

        const response = await fetch(
          `/api/wedding/sunrise-sunset?lat=${venueLat}&lng=${venueLng}&date=${priorYearDateStr}`
        );

        if (response.ok) {
          const data = await response.json();
          setPriorYearData(data);
        } else {
          setError('Failed to load sunrise/sunset data');
        }
      } catch (err) {
        console.error('Error fetching prior year sunrise-sunset data:', err);
        setError('Failed to load sunrise/sunset times');
      } finally {
        setLoading(false);
      }
    };

    if (weddingDate && venueLat && venueLng) {
      fetchData();
    }
  }, [weddingDate, venueLat, venueLng]);

  const formatTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return 'N/A';
    }
  };

  const formatDayLength = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: fontColor }}>
        Loading prior year data...
      </div>
    );
  }

  if (error || !priorYearData) {
    return null;
  }

  return (
    <div
      style={{
        background: `${secondaryColor}33`,
        border: `1px solid ${secondaryColor}`,
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      <h4 style={{ color: fontColor, margin: '0 0 1rem 0', fontFamily: headerFontFamily, fontSize: '1.5em' }}>
        Prior Year Sunrise & Sunset
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Sunrise Column */}
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: fontColor, margin: '0 0 0.5rem 0' }}>
            Sunrise
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: fontColor, margin: 0 }}>
            {formatTime(priorYearData.sunrise)}
          </p>
        </div>

        {/* Sunset Column */}
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: fontColor, margin: '0 0 0.5rem 0' }}>
            Sunset
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: fontColor, margin: 0 }}>
            {formatTime(priorYearData.sunset)}
          </p>
        </div>
      </div>

      {/* Secondary Info */}
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${secondaryColor}40` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Solar Noon</p>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
              {formatTime(priorYearData.solarNoon)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Day Length</p>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
              {formatDayLength(priorYearData.dayLength)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
