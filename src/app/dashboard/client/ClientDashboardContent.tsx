'use client';

import { useState, useEffect } from 'react';
import WeatherCard from '@/components/WeatherCard';
import AstrologyCard from '@/components/AstrologyCard';
import WeatherDetailView from '@/components/WeatherDetailView';
import AstrologyDetailView from '@/components/AstrologyDetailView';
import TasksDetailView from '@/components/TasksDetailView';
import MeetingNotesDetailView from '@/components/MeetingNotesDetailView';
import LogoutButton from '@/components/LogoutButton';
import TasksWidget from '@/components/TasksWidget';
import MeetingNotesWidget from '@/components/MeetingNotesWidget';
import WebsiteBuilderWidget from '@/components/WebsiteBuilderWidget';
import WebsiteBuilderForm from '@/components/WebsiteBuilderForm';

import { lightenColor } from '@/lib/branding';
import type { ClientProfile } from '@prisma/client';

interface ClientDashboardContentProps {
  clientProfile: ClientProfile;
  companyName: string;
  primaryColor: string;
  
  backgroundColor: string;
  fontColor: string;
  fontFamily: string;
  headerFontFamily: string;
  bodyFontFamily: string;
  logoUrl?: string | null;
  currentUserId: string;
}

export default function ClientDashboardContent({
  clientProfile,
  companyName,
  primaryColor,
  
  backgroundColor,
  fontColor,
  fontFamily,
  headerFontFamily,
  bodyFontFamily,
  logoUrl,
  currentUserId,
}: ClientDashboardContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'weather' | 'astrology' | 'tasks' | 'notes' | 'website'>('dashboard');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: primaryColor }}>
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
        padding: '1.5rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <WeatherDetailView
          weddingDate={clientProfile.weddingDate!.toISOString().split('T')[0]}
          venueLat={clientProfile.venueLat || undefined}
          venueLng={clientProfile.venueLng || undefined}
          venueName={clientProfile.weddingLocation || undefined}
          venueAddress={venueAddress || undefined}
          primaryColor={primaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          logoUrl={logoUrl}
          companyName={companyName}
          onBack={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  if (activeView === 'astrology') {
    return (
      <div style={{ 
        padding: '1.5rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <AstrologyDetailView
          weddingDate={clientProfile.weddingDate!.toISOString().split('T')[0]}
          ceremonyTime={clientProfile.ceremonyTime || undefined}
          clientId={clientProfile.id}
          venueLat={clientProfile.venueLat?.toString()}
          venueLng={clientProfile.venueLng?.toString()}
          venueName={clientProfile.weddingLocation || undefined}
          venueAddress={venueAddress || undefined}
          primaryColor={primaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          logoUrl={logoUrl}
          companyName={companyName}
          onBack={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  if (activeView === 'tasks') {
    return (
      <div style={{ 
        padding: '1.5rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <TasksDetailView
          clientId={clientProfile.id}
          tenantId={clientProfile.tenantId}
          primaryColor={primaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          logoUrl={logoUrl}
          companyName={companyName}
          onBack={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  if (activeView === 'notes') {
    return (
      <div style={{ 
        padding: '1.5rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <MeetingNotesDetailView
          clientId={clientProfile.id}
          tenantId={clientProfile.tenantId}
          primaryColor={primaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          logoUrl={logoUrl}
          companyName={companyName}
          onBack={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  if (activeView === 'website') {
    return (
      <div style={{ 
        padding: '1.5rem', 
        minHeight: '100vh', 
        background: backgroundColor, 
        fontFamily, 
        color: fontColor,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <WebsiteBuilderForm
          clientId={clientProfile.id}
          tenantId={clientProfile.tenantId}
          primaryColor={primaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          logoUrl={logoUrl}
          companyName={companyName}
          onBack={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <>
    <div style={{ 
      padding: '1.5rem', 
      minHeight: '100vh', 
      background: backgroundColor, 
      fontFamily, 
      color: fontColor,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ color: primaryColor, margin: 0, fontSize: '2.5rem', fontFamily: headerFontFamily }}>
            Welcome, {clientProfile.couple1FirstName}!
          </h1>
          <div style={{ color: primaryColor, fontSize: '1rem', margin: '0.25rem 0 0 0', opacity: 0.7, fontFamily: bodyFontFamily }}>
            <div>Coordinated by</div>
            <div style={{ fontWeight: '600' }}>{companyName}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={companyName} 
              style={{ 
                height: '80px', 
                maxWidth: '100%',
                backgroundColor: 'transparent'
              }} 
            />
          ) : (
            <span style={{ fontSize: '2rem' }}>💍</span>
          )}
        </div>
      </div>

      {/* Wedding Details Card */}
      <div style={{ 
        background: primaryColor, 
        border: `2px solid ${primaryColor}`, 
        borderRadius: '6px', 
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        fontFamily: bodyFontFamily,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ color: lightenColor(primaryColor, 100), marginTop: 0, marginBottom: '1rem', fontFamily: headerFontFamily, fontSize: '1.75rem' }}>Your Wedding Details</h2>
        {clientProfile.weddingDate && (
          <p style={{ color: lightenColor(primaryColor, 100), marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            Your Big Day: <strong>{new Date(clientProfile.weddingDate).toLocaleDateString()}</strong>
          </p>
        )}
        {clientProfile.budgetCents && (
          <p style={{ color: lightenColor(primaryColor, 100), marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            Budget: <strong>${(clientProfile.budgetCents / 100).toLocaleString()}</strong>
          </p>
        )}
        {clientProfile.estimatedGuestCount && (
          <p style={{ color: lightenColor(primaryColor, 100), marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            Guest Count: <strong>{clientProfile.estimatedGuestCount}</strong>
          </p>
        )}
        {clientProfile.weddingLocation && (
          <p style={{ color: lightenColor(primaryColor, 100), marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            Venue: <strong>{clientProfile.weddingLocation}</strong>
          </p>
        )}
        {!clientProfile.weddingDate && !clientProfile.budgetCents && !clientProfile.estimatedGuestCount && (
          <p style={{ color: fontColor, fontStyle: 'italic', opacity: 0.7 }}>
            Your wedding details will appear here once they&apos;re added.
          </p>
        )}
      </div>

      {/* Meeting Notes, Tasks, Weather & Astrology Cards */}
      {clientProfile.weddingDate && clientProfile.venueLat && clientProfile.venueLng && (
        <div style={{ 
          width: '100%',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          boxSizing: 'border-box',
          justifyItems: 'center',
          clearfix: 'both',
        }}>
          {/* Row 1 */}
          <MeetingNotesWidget
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            textColor={lightenColor(primaryColor, 120)}
            clientId={clientProfile.id}
            tenantId={clientProfile.tenantId}
            currentUserId={currentUserId}
            userRole="CLIENT"
            onClick={() => setActiveView('notes')}
          />
          <TasksWidget
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            textColor={lightenColor(primaryColor, 120)}
            clientId={clientProfile.id}
            tenantId={clientProfile.tenantId}
            userRole="CLIENT"
            onClick={() => setActiveView('tasks')}
          />
          {clientProfile.websiteBuilderEnabled ? (
            <WebsiteBuilderWidget
              primaryColor={primaryColor}
              bodyFontFamily={bodyFontFamily}
              textColor={lightenColor(primaryColor, 120)}
              onClick={() => setActiveView('website')}
            />
          ) : null}
          
          {/* Row 2 */}
          <WeatherCard
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            textColor={lightenColor(primaryColor, 120)}
            onClick={() => setActiveView('weather')}
          />
          <AstrologyCard
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            textColor={lightenColor(primaryColor, 120)}
            onClick={() => setActiveView('astrology')}
          />
          {/* Empty col for Row 2 */}
        </div>
      )}

      {/* Footer */}
      {/* Logout Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LogoutButton primaryColor={primaryColor} />
      </div>
    </div>
    </>
  );
}
