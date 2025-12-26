"use client";
import React, { useEffect, useState } from 'react';
import CreateTenantForm from './CreateTenantForm';
import TenantBasicInfoForm from './TenantBasicInfoForm';
import TenantBrandingForm from './TenantBrandingForm';
import LogoutButton from './LogoutButton';
import styles from './SuperAdminDashboard.module.css';



interface SquareSummary {
  totalRevenue: number;
  ytdRevenue: number;
  nextPaymentDue: string | null;
  paymentCount: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [showTenants, setShowTenants] = useState(false);
  const [square, setSquare] = useState<SquareSummary | null>(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [editingTenant, setEditingTenant] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch tenants from correct endpoint
      const tenantsRes = await fetch('/api/admin/list-tenants');
      const tenantsJson = await tenantsRes.json();
      setTenants(tenantsJson.tenants || []);
      // Fetch Square summary (if needed)
      try {
        const squareRes = await fetch('/api/superadmin/square-summary');
        const squareData = await squareRes.json();
        setSquare(squareData);
      } catch {}
    }
    fetchData();
  }, []);

  // Refresh tenant list from database
  async function refreshTenantList() {
    try {
      const tenantsRes = await fetch('/api/admin/list-tenants');
      const tenantsJson = await tenantsRes.json();
      const updatedTenants = tenantsJson.tenants || [];
      setTenants(updatedTenants);
      
      // If editing a tenant, update editingTenant with fresh data
      if (editingTenant) {
        const updated = updatedTenants.find((t: any) => t.id === editingTenant.id);
        if (updated) {
          setEditingTenant(updated);
        }
      }
    } catch (error) {
      console.error('Error refreshing tenant list:', error);
    }
  }

  // Handle successful tenant edit save
  function handleTenantEditSuccess() {
    refreshTenantList();
    setModal(null);
    // Don't null out editingTenant yet - wait for list to refresh
    // Then modal closes anyway
    window.alert('✓ Tenant information saved successfully!');
  }

  const handleCardClick = (feature: string) => {
    setModal(feature);
  };


  // Delete tenant handler (API call)
  async function handleDeleteTenant(id: string) {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently DELETE this account and ALL data. Are you ABSOLUTELY sure?'
    );
    if (!confirmed) return;
    
    try {
      const response = await fetch(`/api/admin/delete-tenant?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTenants(tenants.filter(t => t.id !== id));
        window.alert('Tenant account has been permanently deleted.');
      } else {
        window.alert('Failed to delete tenant account.');
      }
    } catch (error) {
      window.alert('Error deleting tenant account.');
    }
  }

  // Suspend tenant handler (API call) - locks login only, does NOT delete data
  async function handleSuspendTenant(id: string) {
    if (!window.confirm('Are you sure you want to suspend this tenant account? (This will lock their login but NOT delete any data.)')) return;
    
    try {
      const response = await fetch(`/api/admin/suspend-tenant?id=${id}`, { method: 'POST' });
      if (response.ok) {
        // Update the tenant in the list to reflect suspended status
        setTenants(tenants.map(t => 
          t.id === id ? { ...t, status: 'SUSPENDED' } : t
        ));
        window.alert('✓ Tenant account has been suspended. Their login is now locked.');
      } else {
        window.alert('Failed to suspend tenant account.');
      }
    } catch (error) {
      window.alert('Error suspending tenant account.');
    }
  }

  // Edit tenant handler - opens modal with forms
  function handleEditTenant(tenant: any) {
    setEditingTenant(tenant);
    setModal('edit-tenant');
  }

  return (
    <div className={styles.root}>
      <header className={styles.brandHeader}>
        <img src="/MP_LOGO.png" alt="Missing Piece Logo" className={styles.brandLogo} />
        <h1 className={styles.header}>Welcome, Dean & Tori!</h1>
        <LogoutButton primaryColor="#274E13" />
      </header>
      {/* Revenue summary and tenant search moved to Revenue & Billing modal */}
      <div className={styles.cardContainer}>
        <div className={styles.topRow}>
          <h3 className={styles.managementToolsLabel}>Missing Piece Planning Management Tools</h3>
          <button
            className={styles.addTenantBtn}
            title="Create New Tenant"
            onClick={() => setModal('add-tenant')}
          >
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 6v20M6 16h20" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Management Tools moved to topRow above */}
        <div className={styles.featureGrid}>
          <div
            className={`${styles.featureCard} ${styles.featureCardClickable}`}
            onClick={() => setShowTenants(!showTenants)}
            tabIndex={0}
            role="button"
            aria-label="Planner Management"
          >
            <span className={styles.featureCardTitle}>🗂️ Planner Management</span>
            <div className={styles.featureCardSub}>
              Add, delete or Suspend Planner Accounts
            </div>
            {showTenants && (
              <div className={styles.tenantTableWrapper}>
                <table className={styles.tenantTable}>
                  <thead className={styles.tenantTableHead}>
                    <tr>
                      <th className={styles.tenantTableHeaderCell}>Business Name</th>
                      <th>Clients</th>
                      <th>Next Payment Amount</th>
                      <th>Suspend</th>
                      <th>Delete</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(tenant => (
                      <tr key={tenant.id}>
                        <td className={styles.tenantTableCell}>{tenant.businessName}</td>
                        <td className={styles.centeredCell}>{tenant.clientCount}</td>
                        <td className={styles.centeredCell}>{tenant.outstandingPayments ? `$${tenant.outstandingPayments.toLocaleString()}` : '$0'}</td>
                        <td className={styles.centeredCell}>
                          <button className={styles.suspendTenantBtn} onClick={() => handleSuspendTenant(tenant.id)}>Suspend</button>
                        </td>
                        <td className={styles.centeredCell}>
                          <button className={styles.deleteTenantBtn} onClick={() => handleDeleteTenant(tenant.id)}>Delete</button>
                        </td>
                        <td className={styles.centeredCell}>
                          <button className={styles.editTenantBtn} onClick={() => handleEditTenant(tenant)}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.tenantTableFooter}>
                  Tracking {tenants.length} tenants
                </div>
              </div>
            )}
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
            {/* Search bar moved to Revenue & Billing modal */}
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
              <div className={styles.modalDesc}>
                {modal === 'revenue' ? (
                  <>
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
                    <div className={styles.searchBar} style={{marginTop: '1rem'}}>
                      <input
                        type="text"
                        placeholder="Search tenants..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={styles.searchInput}
                      />
                    </div>
                  </>
                ) : (
                  <p>This feature is coming soon!</p>
                )}
              </div>
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
              <div className={styles.modalDesc}>
                <CreateTenantForm onSuccess={() => setModal(null)} />
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setModal(null)}>
                Close
              </button>
            </div>
          </div>
        )}
        {/* Edit Tenant Modal */}
        {modal === 'edit-tenant' && editingTenant && (
          <div className={styles.modalOverlay} onClick={() => { setModal(null); setEditingTenant(null); }}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '900px' }}>
              <h2 className={styles.modalTitle}>Edit Tenant: {editingTenant.businessName}</h2>
              <div className={styles.modalDesc}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3>Basic Information</h3>
                  <TenantBasicInfoForm 
                    tenantId={editingTenant.id} 
                    onSuccess={handleTenantEditSuccess}
                    initialData={{
                      firstName: editingTenant.firstName || '',
                      lastName: editingTenant.lastName || '',
                      businessName: editingTenant.businessName,
                      phone: editingTenant.phone || '',
                      email: editingTenant.email,
                      webAddress: editingTenant.webAddress || '',
                      status: editingTenant.status || 'ACTIVE',
                      subscriptionTier: editingTenant.subscriptionTier || 'FREE',
                      streetAddress: editingTenant.streetAddress || '',
                      city: editingTenant.city || '',
                      state: editingTenant.state || '',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <h3>Branding</h3>
                  <TenantBrandingForm 
                    tenantId={editingTenant.id}
                    onSuccess={handleTenantEditSuccess}
                    initialBranding={{
                      brandingPrimaryColor: editingTenant.brandingPrimaryColor,
                      brandingSecondaryColor: editingTenant.brandingSecondaryColor,
                      brandingSecondaryColorOpacity: editingTenant.brandingSecondaryColorOpacity,
                      brandingFontColor: editingTenant.brandingFontColor,
                      brandingLogoUrl: editingTenant.brandingLogoUrl,
                      brandingLogoBackgroundRemoval: editingTenant.brandingLogoBackgroundRemoval,
                      brandingCompanyName: editingTenant.brandingCompanyName,
                      brandingTagline: editingTenant.brandingTagline,
                      brandingFaviconUrl: editingTenant.brandingFaviconUrl,
                      brandingFooterText: editingTenant.brandingFooterText,
                      brandingFontFamily: editingTenant.brandingFontFamily,
                      brandingHeaderFontFamily: editingTenant.brandingHeaderFontFamily,
                      brandingBodyFontFamily: editingTenant.brandingBodyFontFamily,
                      businessName: editingTenant.businessName,
                    }}
                  />
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => { setModal(null); setEditingTenant(null); }}>
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
