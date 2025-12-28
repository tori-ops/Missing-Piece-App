'use client';

import { useState, useEffect } from 'react';
import WeatherCard from '@/components/WeatherCard';
import AstrologyCard from '@/components/AstrologyCard';
import WeatherDetailView from '@/components/WeatherDetailView';
import AstrologyDetailView from '@/components/AstrologyDetailView';
import LogoutButton from '@/components/LogoutButton';
import type { ClientProfile } from '@prisma/client';

interface ClientDashboardContentProps {
  clientProfile: ClientProfile;
  companyName: string;
  accentColor: string;
  backgroundColor: string;
  fontColor: string;
  fontFamily: string;
  headerFontFamily: string;
  bodyFontFamily: string;
  logoUrl?: string | null;
}

export default function ClientDashboardContent({
  clientProfile,
  companyName,
  accentColor,
  backgroundColor,
  fontColor,
  fontFamily,
  headerFontFamily,
  bodyFontFamily,
  logoUrl,
}: ClientDashboardContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'weather' | 'astrology'>('dashboard');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: accentColor }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Prepare venue information
  const venueAddress = [
    clientProfile.addressLine1,
    clientProfile.addressCity,
    clientProfile.addressState,
    clientProfile.addressZip,
  ]
    .filter(Boolean)
    .join(', ');

  // Render different views based on activeView
  if (activeView === 'weather') {
    return (
      <div style={{ 
        padding: '2rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <WeatherDetailView
          weddingDate={clientProfile.weddingDate!.toISOString().split('T')[0]}
          venueLat={clientProfile.venueLat || undefined}
          venueLng={clientProfile.venueLng || undefined}
          venueName={clientProfile.weddingLocation || undefined}
          venueAddress={venueAddress || undefined}
          primaryColor={accentColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          onBack={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  if (activeView === 'astrology') {
    return (
      <div style={{ 
        padding: '2rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <AstrologyDetailView
          weddingDate={clientProfile.weddingDate!.toISOString().split('T')[0]}
          ceremonyTime={clientProfile.ceremonyTime || undefined}
          venueLat={clientProfile.venueLat?.toString()}
          venueLng={clientProfile.venueLng?.toString()}
          venueName={clientProfile.weddingLocation || undefined}
          venueAddress={venueAddress || undefined}
          primaryColor={accentColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          onBack={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: backgroundColor, 
      fontFamily, 
      color: fontColor,
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: accentColor, margin: 0, fontSize: '2rem', fontFamily: headerFontFamily }}>
            Welcome, {clientProfile.couple1FirstName}!
          </h1>
          <p style={{ color: accentColor, fontSize: '0.95rem', margin: '0.5rem 0 0 0', opacity: 0.7, fontFamily: bodyFontFamily }}>
            Coordinated by {companyName}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={companyName} 
              style={{ 
                height: '50px', 
                backgroundColor: 'transparent'
              }} 
            />
          ) : (
            <span style={{ fontSize: '2.5rem' }}>💍</span>
          )}
        </div>
      </div>

      {/* Wedding Details Card */}
      <div style={{ 
        background: 'white', 
        border: `2px solid ${accentColor}`, 
        borderRadius: '8px', 
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: `0 10px 40px ${accentColor}26`,
        fontFamily: bodyFontFamily
      }}>
        <h2 style={{ color: accentColor, marginTop: 0, fontFamily: headerFontFamily }}>Your Wedding Details</h2>
        {clientProfile.weddingDate && (
          <p style={{ color: fontColor }}>
            📅 Your Big Day: <strong>{new Date(clientProfile.weddingDate).toLocaleDateString()}</strong>
          </p>
        )}
        {clientProfile.budgetCents && (
          <p style={{ color: fontColor }}>
            💰 Budget: <strong>${(clientProfile.budgetCents / 100).toLocaleString()}</strong>
          </p>
        )}
        {clientProfile.estimatedGuestCount && (
          <p style={{ color: fontColor }}>
            👥 Guest Count: <strong>{clientProfile.estimatedGuestCount}</strong>
          </p>
        )}
        {clientProfile.weddingLocation && (
          <p style={{ color: fontColor }}>
            🏛️ Venue: <strong>{clientProfile.weddingLocation}</strong>
          </p>
        )}
        {clientProfile.addressLine1 && (
          <p style={{ color: fontColor, fontSize: '0.9rem' }}>
            📍 {clientProfile.addressLine1}{clientProfile.addressCity ? `, ${clientProfile.addressCity}` : ''}{clientProfile.addressState ? `, ${clientProfile.addressState}` : ''}
          </p>
        )}
        {!clientProfile.weddingDate && !clientProfile.budgetCents && !clientProfile.estimatedGuestCount && (
          <p style={{ color: fontColor, fontStyle: 'italic', opacity: 0.7 }}>
            Your wedding details will appear here once they&apos;re added.
          </p>
        )}
      </div>

      {/* Weather & Astrology Cards */}
      {clientProfile.weddingDate && clientProfile.venueLat && clientProfile.venueLng && (
        <div style={{ 
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}>
          <WeatherCard
            primaryColor={accentColor}
            fontColor={fontColor}
            onClick={() => setActiveView('weather')}
          />
          <AstrologyCard
            primaryColor={accentColor}
            fontColor={fontColor}
            onClick={() => setActiveView('astrology')}
          />
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '4rem', 
        paddingTop: '2rem', 
        borderTop: `1px solid ${accentColor}40`,
        textAlign: 'center',
        fontSize: '0.8rem',
        color: fontColor,
        opacity: 0.6,
        marginBottom: '2rem'
      }}>
        Powered by {companyName}
      </div>

      {/* Logout Button */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center'
      }}>
        <LogoutButton primaryColor={accentColor} />
      </div>
    </div>
  );
}
