'use client';

import { useState, useEffect } from 'react';

interface SunriseSunsetCardProps {
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

export default function SunriseSunsetCard({
  weddingDate,
  venueLat,
  venueLng,
  primaryColor = '#274E13',
  secondaryColor = '#D0CEB5',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
}: SunriseSunsetCardProps) {
  const [weddingDayData, setWeddingDayData] = useState<SunriseSunsetData | null>(null);
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

        const weddingDateStr = new Date(weddingDate).toISOString().split('T')[0];
        
        // Calculate prior year date
        const priorYearDate = new Date(weddingDate);
        priorYearDate.setFullYear(priorYearDate.getFullYear() - 1);
        const priorYearDateStr = priorYearDate.toISOString().split('T')[0];

        const [weddingRes, priorRes] = await Promise.all([
          fetch(`/api/wedding/sunrise-sunset?lat=${venueLat}&lng=${venueLng}&date=${weddingDateStr}`),
          fetch(`/api/wedding/sunrise-sunset?lat=${venueLat}&lng=${venueLng}&date=${priorYearDateStr}`),
        ]);

        if (weddingRes.ok) {
          const data = await weddingRes.json();
          setWeddingDayData(data);
        }

        if (priorRes.ok) {
          const data = await priorRes.json();
          setPriorYearData(data);
        }

        if (!weddingRes.ok || !priorRes.ok) {
          setError('Failed to load sunrise/sunset data');
        }
      } catch (err) {
        console.error('Error fetching sunrise-sunset data:', err);
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
        Loading sunrise/sunset data...
      </div>
    );
  }

  if (error || !weddingDayData || !priorYearData) {
    return null;
  }

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
        border: `1px solid ${secondaryColor}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <h4 style={{ color: secondaryColor, margin: '0 0 1rem 0', fontFamily: headerFontFamily, fontSize: '1.5em' }}>
        ☀️ Sunrise & Sunset Times
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Prior Year */}
        <div>
          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: fontColor, margin: '0 0 0.75rem 0' }}>
            Prior Year
          </p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Sunrise</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatTime(priorYearData.sunrise)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Solar Noon</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatTime(priorYearData.solarNoon)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Sunset</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatTime(priorYearData.sunset)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Day Length</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatDayLength(priorYearData.dayLength)}
              </p>
            </div>
          </div>
        </div>

        {/* Wedding Day */}
        <div>
          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: secondaryColor, margin: '0 0 0.75rem 0' }}>
            Your Wedding Day
          </p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Sunrise</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatTime(weddingDayData.sunrise)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Solar Noon</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatTime(weddingDayData.solarNoon)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Sunset</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatTime(weddingDayData.sunset)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Day Length</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
                {formatDayLength(weddingDayData.dayLength)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
