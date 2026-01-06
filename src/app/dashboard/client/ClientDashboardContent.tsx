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
  secondaryColorOpacity: number;
  overlayOpacity: number;
  fontColor: string;
  fontFamily: string;
  headerFontFamily: string;
  bodyFontFamily: string;
  logoUrl?: string | null;
  overlayUrl?: string | null;
  floraUrl?: string | null;
  currentUserId: string;
  greeting: string;
}

export default function ClientDashboardContent({
  clientProfile,
  companyName,
  primaryColor,
  
  backgroundColor,
  secondaryColorOpacity,
  overlayOpacity,
  fontColor,
  fontFamily,
  headerFontFamily,
  bodyFontFamily,
  logoUrl,
  overlayUrl,
  floraUrl,
  currentUserId,
  greeting,
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: backgroundColor,
      overflow: 'auto'
    }}>
      {/* Overlay - Fixed behind all content (if provided) */}
      {overlayUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('${overlayUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: overlayOpacity / 100,
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}
      <div style={{ 
        padding: '1.5rem 1.5rem 6rem 1.5rem', 
        minHeight: '100vh', 
        fontFamily, 
        color: fontColor,
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
      {/* Welcome Card with Floral Decorations */}
      <div style={{ 
        position: 'relative',
        width: '100%',
        marginBottom: '2rem',
        borderRadius: '6px',
        minHeight: '160px',
        background: primaryColor,
        border: `2px solid ${primaryColor}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '2rem'
      }}>
        {/* Top Left Flora - Only show if floraUrl is provided */}
        {floraUrl && (
          <img 
            src={floraUrl} 
            alt="floral decoration" 
            style={{ 
              position: 'absolute',
              top: '-38px',
              left: '-46px',
              width: '200px',
              height: 'auto',
              zIndex: 1,
              pointerEvents: 'none'
            }} 
          />
        )}

        {/* Bottom Right Flora - 70% size, rotated 180 degrees - Only show if floraUrl is provided */}
        {floraUrl && (
          <img 
            src={floraUrl} 
            alt="floral decoration" 
            style={{ 
              position: 'absolute',
              bottom: '-22px',
              right: '-28px',
              width: '140px',
              height: 'auto',
              zIndex: 1,
              pointerEvents: 'none',
              transform: 'rotate(180deg)'
            }} 
          />
        )}
        
        {/* Welcome Message Overlay */}
        <h1 style={{ 
          color: fontColor, 
          margin: 0, 
          marginTop: '5px',
          marginLeft: '2px',
          fontSize: '2.5rem', 
          fontFamily: headerFontFamily,
          position: 'relative',
          zIndex: 2
        }}>
          {greeting}
        </h1>
      </div>

      {/* Wedding Details Card */}
      <div style={{ 
        background: primaryColor, 
        border: `2px solid ${primaryColor}`, 
        borderRadius: '3px',
        padding: '1rem',
        marginBottom: '0.5rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        fontFamily: bodyFontFamily,
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Wedding Bands - positioned on the right, vertically centered */}
        <img 
          src="/uploads/silver-bands.png" 
          alt="wedding bands" 
          style={{ 
            position: 'absolute',
            right: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            maxHeight: 'calc(100% - 3rem)',
            maxWidth: '30%',
            backgroundColor: 'transparent',
            objectFit: 'contain'
          }} 
        />
        <h2 style={{ color: fontColor, marginTop: 0, marginBottom: '1rem', fontFamily: headerFontFamily, fontSize: '1.75rem' }}>Your Wedding Details</h2>
        {clientProfile.weddingDate && (
          <p style={{ color: fontColor, marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            Your Big Day: <strong>{new Date(clientProfile.weddingDate).toLocaleDateString()}</strong>
          </p>
        )}
        {clientProfile.budgetCents && (
          <p style={{ color: fontColor, marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            Budget: <strong>${(clientProfile.budgetCents / 100).toLocaleString()}</strong>
          </p>
        )}
        {clientProfile.estimatedGuestCount && (
          <p style={{ color: fontColor, marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            Guest Count: <strong>{clientProfile.estimatedGuestCount}</strong>
          </p>
        )}
        {clientProfile.weddingLocation && (
          <p style={{ color: fontColor, marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            Venue: <strong>{clientProfile.weddingLocation}</strong>
          </p>
        )}
        {!clientProfile.weddingDate && !clientProfile.budgetCents && !clientProfile.estimatedGuestCount && (
          <p style={{ color: fontColor, fontStyle: 'italic', opacity: 0.7 }}>
            Your wedding details will appear here once they&apos;re added.
          </p>
        )}
        <p style={{ color: fontColor, marginTop: '1rem', marginBottom: '0', fontSize: '0.9rem', paddingTop: '1rem' }}>
          Coordinated by <strong style={{ fontWeight: '600' }}>{companyName}</strong>
        </p>
      </div>

      {/* Your Tools Card */}
      <div style={{ 
        position: 'relative',
        width: 'fit-content',
        marginBottom: '2rem',
        borderRadius: '6px',
        minHeight: 'auto',
        background: primaryColor,
        border: `2px solid ${primaryColor}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 2rem',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h2 style={{ 
          color: fontColor, 
          margin: 0, 
          fontSize: '1.85rem', 
          fontFamily: headerFontFamily,
          position: 'relative',
          zIndex: 2
        }}>
          Your Tools
        </h2>
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
            textColor={fontColor}
            clientId={clientProfile.id}
            tenantId={clientProfile.tenantId}
            currentUserId={currentUserId}
            userRole="CLIENT"
            onClick={() => setActiveView('notes')}
          />
          <TasksWidget
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            textColor={fontColor}
            clientId={clientProfile.id}
            tenantId={clientProfile.tenantId}
            userRole="CLIENT"
            onClick={() => setActiveView('tasks')}
          />
          {clientProfile.websiteBuilderEnabled ? (
            <WebsiteBuilderWidget
              primaryColor={primaryColor}
              bodyFontFamily={bodyFontFamily}
              textColor={fontColor}
              onClick={() => setActiveView('website')}
            />
          ) : null}
          
          {/* Row 2 */}
          <WeatherCard
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            textColor={fontColor}
            onClick={() => setActiveView('weather')}
          />
          <AstrologyCard
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            textColor={fontColor}
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
    </div>
  );
}
