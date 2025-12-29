'use client';

import { useState } from 'react';
import { lightenColor } from '@/lib/branding';
import LogoutButton from '@/components/LogoutButton';
import ClientList from '@/components/ClientList';
import CreateClientFormModal from '@/components/CreateClientFormModal';
import TasksWidget from '@/components/TasksWidget';
import TasksDetailView from '@/components/TasksDetailView';
import MeetingNotesWidget from '@/components/MeetingNotesWidget';
import MeetingNotesDetailView from '@/components/MeetingNotesDetailView';
import WeatherDetailView from '@/components/WeatherDetailView';
import type { Tenant, ClientProfile } from '@prisma/client';

interface TenantDashboardContentProps {
  tenant: Tenant;
  clients: ClientProfile[];
  user: {
    id: string;
    tenantId: string;
  };
}

export default function TenantDashboardContent({
  tenant,
  clients,
  user,
}: TenantDashboardContentProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'notes' | 'weather'>('dashboard');
  const [selectedClientId, _setSelectedClientId] = useState<string | undefined>(undefined);

  const primaryColor = tenant.brandingPrimaryColor || '#274E13';
  const secondaryColor = tenant.brandingSecondaryColor || '#e1e0d0';
  const backgroundColor = secondaryColor;
  const fontColor = tenant.brandingFontColor || '#1B5E20';
  const companyName = tenant.brandingCompanyName || tenant.businessName || 'The Missing Piece';
  const fontFamily = tenant.brandingFontFamily || "'Poppins', sans-serif";
  const headerFontFamily = tenant.brandingHeaderFontFamily || "'Playfair Display', serif";
  const bodyFontFamily = tenant.brandingBodyFontFamily || "'Poppins', sans-serif";
  const logoUrl = tenant.brandingLogoUrl;

  // If viewing tasks or notes detail view, show those full-screen
  if (activeView === 'tasks') {
    return (
      <TasksDetailView
        clientId={undefined}
        tenantId={user.tenantId}
        primaryColor={primaryColor}
        fontColor={fontColor}
        bodyFontFamily={bodyFontFamily}
        headerFontFamily={headerFontFamily}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'notes') {
    return (
      <MeetingNotesDetailView
        clientId={undefined}
        tenantId={user.tenantId}
        primaryColor={primaryColor}
        fontColor={fontColor}
        bodyFontFamily={bodyFontFamily}
        headerFontFamily={headerFontFamily}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'weather' && selectedClientId) {
    const client = clients.find(c => c.id === selectedClientId);
    if (client && client.weddingDate) {
      return (
        <WeatherDetailView
          weddingDate={client.weddingDate.toISOString().split('T')[0]}
          venueLat={client.venueLat || undefined}
          venueLng={client.venueLng || undefined}
          venueName={client.weddingLocation || undefined}
          primaryColor={primaryColor}
          fontColor={fontColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          onBack={() => setActiveView('dashboard')}
        />
      );
    }
  }

  return (
    <>
      <div
        style={{
          padding: '2rem',
          minHeight: '100vh',
          background: backgroundColor,
          fontFamily,
          color: fontColor,
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: primaryColor, margin: 0, fontSize: '2.5rem', fontFamily: headerFontFamily }}>
              Welcome, {tenant.firstName}!
            </h1>
            <p style={{ color: primaryColor, fontSize: '0.95rem', margin: '0.5rem 0 0 0', opacity: 0.7, fontFamily: bodyFontFamily }}>
              {companyName}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                style={{
                  height: '60px',
                  backgroundColor: 'transparent',
                }}
              />
            ) : (
              <span style={{ fontSize: '3rem' }}>👰</span>
            )}
          </div>
        </div>

        {/* Stats Card with Sidebar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 200px',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Business Info Card */}
          <div
            style={{
              background: primaryColor,
              border: `2px solid ${primaryColor}`,
              borderRadius: '8px',
              padding: '1rem 2rem 2rem 2rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              fontFamily: bodyFontFamily,
            }}
          >
            <h2 style={{ color: lightenColor(primaryColor, 120), marginTop: 0, fontFamily: headerFontFamily, fontSize: '2.05rem' }}>
              Business Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
              <div>
                <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Business Name
                </p>
                <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.businessName}</p>
              </div>
              <div>
                <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Email
                </p>
                <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.email}</p>
              </div>
              <div>
                <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Phone
                </p>
                <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.phone || 'Not provided'}</p>
              </div>
              <div>
                <p style={{ color: lightenColor(primaryColor, 120), fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Subscription
                </p>
                <p style={{ color: lightenColor(primaryColor, 120), margin: 0 }}>{tenant.subscriptionTier || 'FREE'}</p>
              </div>
            </div>
          </div>

          {/* Sidebar with Tasks Widget */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Tasks Widget */}
            <div
              style={{
                background: primaryColor,
                border: `2px solid ${primaryColor}`,
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TasksWidget
                primaryColor={lightenColor(primaryColor, 120)}
                bodyFontFamily={bodyFontFamily}
                tenantId={user.tenantId}
                onClick={() => setActiveView('tasks')}
              />
            </div>

            {/* Meeting Notes Widget */}
            <div
              style={{
                background: primaryColor,
                border: `2px solid ${primaryColor}`,
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MeetingNotesWidget
                primaryColor={lightenColor(primaryColor, 120)}
                bodyFontFamily={bodyFontFamily}
                textColor={lightenColor(primaryColor, 120)}
                tenantId={user.tenantId}
                currentUserId={user.id}
                userRole="TENANT"
                onClick={() => setActiveView('notes')}
              />
            </div>
          </div>
        </div>

        {/* Clients Section */}
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.8rem', fontFamily: headerFontFamily, marginBottom: '1.5rem' }}>
            Your Clients ({clients.length})
          </h2>
          {clients.length > 0 ? (
            <ClientList
              tenantId={tenant.id}
              clients={clients}
              primaryColor={primaryColor}
              fontColor={fontColor}
              bodyFontFamily={bodyFontFamily}
            />
          ) : (
            <div
              style={{
                background: primaryColor,
                border: `2px solid ${primaryColor}`,
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                color: fontColor,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              <p style={{ fontSize: '1.1rem', margin: 0 }}>No clients yet. Create your first client to get started!</p>
            </div>
          )}
        </div>

        {/* Add Client Button */}
        <div style={{ marginTop: '2rem' }}>
          <CreateClientFormModal tenantId={tenant.id} primaryColor={primaryColor} />
        </div>

        {/* Footer */}
        {/* Logout Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LogoutButton primaryColor={primaryColor} />
        </div>
      </div>
    </>
  );
}
