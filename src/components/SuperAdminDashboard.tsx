"use client";
import React, { useEffect, useState } from 'react';

interface TenantSummary {
  id: string;
  businessName: string;
  clientCount: number;
  subscriptionTier: string;
  status: string;
  nextPaymentDue: string | null;
  revenueYTD: number;
  revenueTotal: number;
}

interface SquareSummary {
  totalRevenue: number;
  ytdRevenue: number;
  nextPaymentDue: string | null;
  paymentCount: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [square, setSquare] = useState<SquareSummary | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch tenants summary (replace with real API route)
      const tenantsRes = await fetch('/api/superadmin/tenants-summary');
      const tenantsData = await tenantsRes.json();
      setTenants(tenantsData);
      // Fetch Square summary
      const squareRes = await fetch('/api/superadmin/square-summary');
      const squareData = await squareRes.json();
      setSquare(squareData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTenants = tenants.filter(t =>
    t.businessName.toLowerCase().includes(search.toLowerCase())
  );

  // Modal state for placeholders
  const [modal, setModal] = useState<string | null>(null);

  const handleCardClick = (feature: string) => {
    setModal(feature);
  };

  return (
    <div
      style={{
        padding: '2rem',
        minHeight: '100vh',
        background: "url('/background.png') center center / cover no-repeat fixed",
      }}
    >
      <h1 style={{ color: '#274E13', marginBottom: '1.5rem' }}>SuperAdmin Dashboard</h1>
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem', width: '300px' }}
        />
      </div>
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', minWidth: '250px' }}>
          <h3 style={{ color: '#274E13' }}>Total Revenue (YTD)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            ${square?.ytdRevenue.toLocaleString()}
          </div>
          <h4 style={{ color: '#274E13', marginTop: '1rem' }}>All-Time Revenue</h4>
          <div style={{ fontSize: '1.2rem' }}>
            ${square?.totalRevenue.toLocaleString()}
          </div>
          <div style={{ marginTop: '1rem', color: '#888' }}>
            Payments: {square?.paymentCount}
          </div>
          <div style={{ marginTop: '1rem', color: '#888' }}>
            Next Payment Due: {square?.nextPaymentDue || 'N/A'}
          </div>
        </div>
      </div>
      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '2px solid #274E13',
          borderRadius: '8px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 10px 40px rgba(39, 78, 19, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#274E13', margin: 0 }}>Welcome, SuperAdmin</h2>
          {/* Add Tenant Button (green circle with white plus) */}
          <button
            style={{
              background: '#274E13',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              fontSize: '2.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(39, 78, 19, 0.2)',
              transition: 'all 0.2s ease',
            }}
            title="Create New Tenant"
            onClick={() => setModal('add-tenant')}
            onMouseEnter={e => (e.currentTarget.style.background = '#1a3d0a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#274E13')}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7v18M7 16h18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p style={{ color: '#666', marginTop: '1rem', lineHeight: '1.6' }}>
          You have access to all system management features:
        </p>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {/* Tenant Management (example, can be made interactive) */}
          <div style={{ background: '#F9F8F3', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E0DED0', fontWeight: 600, color: '#274E13', boxShadow: '0 2px 8px #0001' }}>
            Tenant Management
            <div style={{ fontWeight: 400, color: '#444', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Create, manage, and monitor all tenants
            </div>
          </div>
          {/* Revenue & Billing */}
          <div
            style={{
              background: '#F9F8F3',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #E0DED0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => handleCardClick('revenue')}
            tabIndex={0}
            role="button"
            aria-label="Revenue & Billing"
          >
            <span style={{ fontWeight: 600, color: '#274E13' }}>💰 Revenue & Billing</span>
            <div style={{ fontWeight: 400, color: '#444', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              View subscription analytics and payments
            </div>
          </div>
          {/* User Management */}
          <div style={{ background: '#F9F8F3', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E0DED0', fontWeight: 600, color: '#274E13', boxShadow: '0 2px 8px #0001' }}>
            User Management
            <div style={{ fontWeight: 400, color: '#444', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Manage all users across all tenants
            </div>
          </div>
          {/* System Settings */}
          <div
            style={{
              background: '#F9F8F3',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #E0DED0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => handleCardClick('settings')}
            tabIndex={0}
            role="button"
            aria-label="System Settings"
          >
            <span style={{ fontWeight: 600, color: '#274E13' }}>⚙️ System Settings</span>
            <div style={{ fontWeight: 400, color: '#444', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Configure platform-wide settings
            </div>
          </div>
          {/* Analytics */}
          <div
            style={{
              background: '#F9F8F3',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #E0DED0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => handleCardClick('analytics')}
            tabIndex={0}
            role="button"
            aria-label="Analytics"
          >
            <span style={{ fontWeight: 600, color: '#274E13' }}>📈 Analytics</span>
            <div style={{ fontWeight: 400, color: '#444', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Platform-wide usage and performance metrics
            </div>
          </div>
          {/* Security */}
          <div
            style={{
              background: '#F9F8F3',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #E0DED0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => handleCardClick('security')}
            tabIndex={0}
            role="button"
            aria-label="Security"
          >
            <span style={{ fontWeight: 600, color: '#274E13' }}>🔐 Security</span>
            <div style={{ fontWeight: 400, color: '#444', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Audit logs and security controls
            </div>
          </div>
        </div>

        {/* Placeholder modal for features not yet implemented */}
        {modal && modal !== 'add-tenant' && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setModal(null)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '10px',
                padding: '2rem 3rem',
                minWidth: '320px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
                textAlign: 'center',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ color: '#274E13' }}>
                {modal === 'revenue' && 'Revenue & Billing'}
                {modal === 'settings' && 'System Settings'}
                {modal === 'analytics' && 'Analytics'}
                {modal === 'security' && 'Security'}
              </h2>
              <p style={{ color: '#666', margin: '1rem 0 2rem' }}>
                This feature is coming soon!
              </p>
              <button
                style={{
                  background: '#274E13',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => setModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Add Tenant Modal */}
        {modal === 'add-tenant' && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setModal(null)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '10px',
                padding: '2rem 3rem',
                minWidth: '320px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
                textAlign: 'center',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ color: '#274E13' }}>Add New Tenant</h2>
              {/* You can render your CreateTenantForm here */}
              <p style={{ color: '#666', margin: '1rem 0 2rem' }}>
                Tenant creation form goes here.
              </p>
              <button
                style={{
                  background: '#274E13',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => setModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
