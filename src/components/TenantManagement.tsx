'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './TenantManagement.module.css';

interface TenantData {
  id: string;
  businessName: string;
  email: string;
  status: string;
  subscriptionTier: string;
  createdAt: string;
  userCount: number;
  clientCount: number;
  totalRevenue: number;
  outstandingPayments: number;
  totalPayments: number;
  brandingPrimaryColor?: string | null;
  brandingSecondaryColor?: string | null;
  brandingLogoUrl?: string | null;
  brandingCompanyName?: string | null;
  brandingTagline?: string | null;
  brandingFaviconUrl?: string | null;
  brandingFooterText?: string | null;
}

export default function TenantManagement() {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await fetch('/api/admin/list-tenants');
        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }
        const data = await response.json();
        setTenants(data.tenants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>🏢 Tenant Management</h2>
        <div className={styles.loading}>Loading tenants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>🏢 Tenant Management</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const totalClients = tenants.reduce((sum, t) => sum + t.clientCount, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🏢 Planner Management</h2>
        <p className={styles.subtitle}>Manage all planners and their clients</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Planners</div>
          <div className={styles.statValue}>{tenants.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Clients</div>
          <div className={styles.statValue}>{totalClients}</div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Users</th>
              <th>Clients</th>
              <th>Revenue</th>
              <th>Outstanding</th>
              <th>Joined</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(tenant => (
              <tr key={tenant.id}>
                <td className={styles.businessName}>{tenant.businessName}</td>
                <td>{tenant.email}</td>
                <td>
                  <span className={`${styles.tier} ${styles[`tier-${tenant.subscriptionTier.toLowerCase()}`]}`}>
                    {tenant.subscriptionTier}
                  </span>
                </td>
                <td>
                  <span className={`${styles.status} ${styles[`status-${tenant.status.toLowerCase()}`]}`}>
                    {tenant.status}
                  </span>
                </td>
                <td className={styles.center}>{tenant.userCount}</td>
                <td className={styles.center}>{tenant.clientCount}</td>
                <td className={styles.revenue}>${tenant.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className={styles.outstanding}>
                  ${tenant.outstandingPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={styles.date}>
                  {new Date(tenant.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: '2-digit' 
                  })}
                </td>
                <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                  <Link href={`/dashboard/superadmin/tenants/${tenant.id}`}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: '#274E13',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                    }}>
                      📋 Edit
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tenants.length === 0 && (
        <div className={styles.empty}>
          <p>No tenants created yet. Use the form above to create your first tenant.</p>
        </div>
      )}
    </div>
  );
}
