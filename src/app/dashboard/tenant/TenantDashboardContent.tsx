'use client';

import { useState } from 'react';
import { Menu, X, CheckSquare, MessageSquare, Cloud } from 'lucide-react';
import { lightenColor } from '@/lib/branding';
import LogoutButton from '@/components/LogoutButton';
import ClientList from '@/components/ClientList';
import CreateClientFormModal from '@/components/CreateClientFormModal';
import TasksDetailView from '@/components/TasksDetailView';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const primaryColor = tenant.brandingPrimaryColor || '#274E13';
  const secondaryColor = tenant.brandingSecondaryColor || '#e1e0d0';
  const backgroundColor = secondaryColor;
  const fontColor = tenant.brandingFontColor || '#1B5E20';
  const companyName = tenant.brandingCompanyName || tenant.businessName || 'The Missing Piece';
  const fontFamily = tenant.brandingFontFamily || "'Poppins', sans-serif";
  const headerFontFamily = tenant.brandingHeaderFontFamily || "'Playfair Display', serif";
  const bodyFontFamily = tenant.brandingBodyFontFamily || "'Poppins', sans-serif";
  const logoUrl = tenant.brandingLogoUrl;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: backgroundColor, fontFamily }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '200px' : '60px',
          background: primaryColor,
          borderRight: `2px solid ${primaryColor}`,
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1rem 0',
          gap: '1rem',
          position: 'relative',
        }}
      >
        {/* Hamburger Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: lightenColor(primaryColor, 120),
            cursor: 'pointer',
            fontSize: '1.5rem',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu Items */}
        <button
          onClick={() => {
            setActiveView('tasks');
            setSidebarOpen(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: lightenColor(primaryColor, 120),
            cursor: 'pointer',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem',
            fontFamily: bodyFontFamily,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <CheckSquare size={20} />
          {sidebarOpen && <span>Tasks</span>}
        </button>

        <button
          onClick={() => {
            setActiveView('notes');
            setSidebarOpen(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: lightenColor(primaryColor, 120),
            cursor: 'pointer',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem',
            fontFamily: bodyFontFamily,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <MessageSquare size={20} />
          {sidebarOpen && <span>Notes</span>}
        </button>

        <button
          onClick={() => {
            setActiveView('weather');
            setSidebarOpen(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: lightenColor(primaryColor, 120),
            cursor: 'pointer',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem',
            fontFamily: bodyFontFamily,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Cloud size={20} />
          {sidebarOpen && <span>Weather</span>}
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          background: backgroundColor,
          fontFamily,
          color: fontColor,
        }}
      >
        {/* Header - Always on top */}
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
            <LogoutButton primaryColor={primaryColor} />
          </div>
        </div>

        {/* Conditional Views */}
        {activeView === 'tasks' && (
          <TasksDetailView
            clientId={undefined}
            tenantId={user.tenantId}
            clients={clients}
            primaryColor={primaryColor}
            fontColor={fontColor}
            bodyFontFamily={bodyFontFamily}
            headerFontFamily={headerFontFamily}
            onBack={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'notes' && (
          <MeetingNotesDetailView
            clientId={undefined}
            tenantId={user.tenantId}
            clients={clients}
            primaryColor={primaryColor}
            fontColor={fontColor}
            bodyFontFamily={bodyFontFamily}
            headerFontFamily={headerFontFamily}
            onBack={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'weather' && selectedClientId && (
          (() => {
            const client = clients.find(c => c.id === selectedClientId);
            return client && client.weddingDate ? (
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
            ) : null;
          })()
        )}

        {activeView === 'dashboard' && (
          <>
            {/* Business Info Card */}
            <div
              style={{
                background: primaryColor,
                border: `2px solid ${primaryColor}`,
                borderRadius: '8px',
                padding: '1rem 2rem 2rem 2rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                fontFamily: bodyFontFamily,
                marginBottom: '2rem',
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
          </>
        )}
      </div>
    </div>
  );
}
