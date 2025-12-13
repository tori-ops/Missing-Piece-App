'use client';

import { useState } from 'react';
import TenantManagement from './TenantManagement';

export default function TenantManagementModal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
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
        <h3 style={{ color: '#274E13', margin: '0 0 0.5rem 0' }}>📊 Planner Management</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Create, manage, and monitor all planners</p>
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
              <TenantManagement />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
