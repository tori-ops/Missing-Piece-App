"use client";
import React, { useEffect, useState } from 'react';
import styles from './SuperAdminDashboard.module.css';

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
  const [modal, setModal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch tenants summary (replace with real API route)
      const tenantsRes = await fetch('/api/superadmin/tenants-summary');
      const tenantsData = await tenantsRes.json();
      setTenants(tenantsData);
      // Fetch Square summary
      const squareRes = await fetch('/api/superadmin/square-summary');
      const squareData = await squareRes.json();
      setSquare(squareData);
    }
    fetchData();
  }, []);

  const handleCardClick = (feature: string) => {
    setModal(feature);
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.header}>SuperAdmin Dashboard</h1>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.revenueSummary}>
        <div className={styles.revenueCard}>
          <h3 className={styles.revenueTitle}>Total Revenue (YTD)</h3>
          <div className={styles.revenueAmount}>
            ${square?.ytdRevenue?.toLocaleString()}
          </div>
          <h4 className={styles.revenueSubtitle}>All-Time Revenue</h4>
          <div className={styles.revenueTotal}>
            ${square?.totalRevenue?.toLocaleString()}
          </div>
          <div className={styles.revenueMeta}>
            Payments: {square?.paymentCount}
          </div>
          <div className={styles.revenueMeta}>
            Next Payment Due: {square?.nextPaymentDue || 'N/A'}
          </div>
        </div>
      </div>
      <div className={styles.cardContainer}>
        <div className={styles.topRow}>
          <h2 className={styles.welcome}>Welcome, SuperAdmin</h2>
          <button
            className={styles.addTenantBtn}
            title="Create New Tenant"
            onClick={() => setModal('add-tenant')}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7v18M7 16h18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p className={styles.featureDesc}>
          You have access to all system management features:
        </p>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            Tenant Management
            <div className={styles.featureCardSub}>
              Create, manage, and monitor all tenants
            </div>
          </div>
          <div
            className={`${styles.featureCard} ${styles.featureCardClickable}`}
            onClick={() => handleCardClick('revenue')}
            tabIndex={0}
            role="button"
            aria-label="Revenue & Billing"
          >
            <span className={styles.featureCardTitle}>💰 Revenue & Billing</span>
            <div className={styles.featureCardSub}>
              View subscription analytics and payments
            </div>
          </div>
          <div className={styles.featureCard}>
            User Management
            <div className={styles.featureCardSub}>
              Manage all users across all tenants
            </div>
          </div>
          <div
            className={`${styles.featureCard} ${styles.featureCardClickable}`}
            onClick={() => handleCardClick('settings')}
            tabIndex={0}
            role="button"
            aria-label="System Settings"
          >
            <span className={styles.featureCardTitle}>⚙️ System Settings</span>
            <div className={styles.featureCardSub}>
              Configure platform-wide settings
            </div>
          </div>
          <div
            className={`${styles.featureCard} ${styles.featureCardClickable}`}
            onClick={() => handleCardClick('analytics')}
            tabIndex={0}
            role="button"
            aria-label="Analytics"
          >
            <span className={styles.featureCardTitle}>📈 Analytics</span>
            <div className={styles.featureCardSub}>
              Platform-wide usage and performance metrics
            </div>
          </div>
          <div
            className={`${styles.featureCard} ${styles.featureCardClickable}`}
            onClick={() => handleCardClick('security')}
            tabIndex={0}
            role="button"
            aria-label="Security"
          >
            <span className={styles.featureCardTitle}>🔐 Security</span>
            <div className={styles.featureCardSub}>
              Audit logs and security controls
            </div>
          </div>
        </div>
        {/* Placeholder modal for features not yet implemented */}
        {modal && modal !== 'add-tenant' && (
          <div className={styles.modalOverlay} onClick={() => setModal(null)}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>
                {modal === 'revenue' && 'Revenue & Billing'}
                {modal === 'settings' && 'System Settings'}
                {modal === 'analytics' && 'Analytics'}
                {modal === 'security' && 'Security'}
              </h2>
              <p className={styles.modalDesc}>
                This feature is coming soon!
              </p>
              <button className={styles.modalCloseBtn} onClick={() => setModal(null)}>
                Close
              </button>
            </div>
          </div>
        )}
        {/* Add Tenant Modal */}
        {modal === 'add-tenant' && (
          <div className={styles.modalOverlay} onClick={() => setModal(null)}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Add New Tenant</h2>
              {/* You can render your CreateTenantForm here */}
              <p className={styles.modalDesc}>
                Tenant creation form goes here.
              </p>
              <button className={styles.modalCloseBtn} onClick={() => setModal(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
