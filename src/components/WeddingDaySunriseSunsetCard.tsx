'use client';

import { useState, useEffect } from 'react';

interface WeddingDaySunriseSunsetCardProps {
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

export default function WeddingDaySunriseSunsetCard({
  weddingDate,
  venueLat,
  venueLng,
  primaryColor = '#274E13',
  secondaryColor = '#D0CEB5',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
}: WeddingDaySunriseSunsetCardProps) {
  const [weddingDayData, setWeddingDayData] = useState<SunriseSunsetData | null>(null);
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

        const response = await fetch(
          `/api/wedding/sunrise-sunset?lat=${venueLat}&lng=${venueLng}&date=${weddingDateStr}`
        );

        if (response.ok) {
          const data = await response.json();
          setWeddingDayData(data);
        } else {
          setError('Failed to load sunrise/sunset data');
        }
      } catch (err) {
        console.error('Error fetching wedding day sunrise-sunset data:', err);
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
        Loading wedding day data...
      </div>
    );
  }

  if (error || !weddingDayData) {
    return null;
  }

  return (
    <div
      style={{
        background: `${secondaryColor}33`,
        border: `1px solid ${secondaryColor}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <h4 style={{ color: primaryColor, margin: '0 0 1rem 0', fontFamily: headerFontFamily, fontSize: '1.5em' }}>
        ☀️ Your Wedding Day Sunrise & Sunset
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Sunrise Column */}
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: fontColor, margin: '0 0 0.5rem 0' }}>
            Sunrise
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
            {formatTime(weddingDayData.sunrise)}
          </p>
        </div>

        {/* Sunset Column */}
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: fontColor, margin: '0 0 0.5rem 0' }}>
            Sunset
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
            {formatTime(weddingDayData.sunset)}
          </p>
        </div>
      </div>

      {/* Secondary Info */}
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${secondaryColor}40` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Solar Noon</p>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
              {formatTime(weddingDayData.solarNoon)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: 0 }}>Day Length</p>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: '0.25rem 0 0 0' }}>
              {formatDayLength(weddingDayData.dayLength)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
