'use client';

import { useState } from 'react';

interface TenantData {
  id: string;
  businessName: string;
  email: string;
  userCount: number;
  clientCount: number;
}

export default function UserManagementModal() {
  const [showModal, setShowModal] = useState(false);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('[UserMgmt] Fetching /api/admin/users...');
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      console.log('[UserMgmt] Response status:', response.status);
      console.log('[UserMgmt] Response data:', data);
      
      if (!response.ok) {
        const errorMsg = data.error || `HTTP ${response.status}: Failed to fetch users`;
        console.error('[UserMgmt] Error:', errorMsg);
        setError(errorMsg);
        return;
      }
      console.log('[UserMgmt] Tenants fetched successfully:', data.tenants?.length);
      setTenants(data.tenants);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('[UserMgmt] Fetch error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchTenants();
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        style={{
          background: '#F9F8F3',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #E0DED0',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#E0DED0';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#F9F8F3';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <h3 style={{ color: '#274E13', margin: '0 0 0.5rem 0' }}>👥 User Management</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Manage all users across all tenants</p>
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              maxWidth: '1200px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'sticky',
                top: '1rem',
                right: '1rem',
                float: 'right',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#999',
                zIndex: 10
              }}
            >
              ✕
            </button>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ color: '#274E13', marginTop: 0 }}>👥 User Management</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Manage all users and clients across all tenants</p>

              {loading && <p style={{ color: '#666' }}>Loading...</p>}
              {error && <p style={{ color: '#C33' }}>{error}</p>}

              {!loading && !error && tenants.length === 0 && (
                <div style={{
                  background: '#F9F8F3',
                  border: '2px dashed #E0DED0',
                  borderRadius: '8px',
                  padding: '3rem 2rem',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#999', margin: 0 }}>No tenants found</p>
                </div>
              )}

              {!loading && tenants.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '1rem'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #274E13' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Tenant Name</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Contact Email</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Total Users</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#274E13', fontWeight: '600' }}>Total Clients</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => (
                        <tr
                          key={tenant.id}
                          style={{
                            borderBottom: '1px solid #E0DED0',
                            background: 'white'
                          }}
                        >
                          <td style={{ padding: '1rem', color: '#333' }}>
                            <strong>{tenant.businessName}</strong>
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>
                            {tenant.email || '—'}
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>
                            {tenant.userCount}
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>
                            {tenant.clientCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
