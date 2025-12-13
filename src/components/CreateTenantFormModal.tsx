'use client';

import { useState } from 'react';
import CreateTenantForm from './CreateTenantForm';

export default function CreateTenantFormModal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: '#274E13',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(39, 78, 19, 0.2)',
          transition: 'all 0.2s ease'
        }}
        title="Create New Tenant"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1a3d0a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#274E13';
        }}
      >
        ➕
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
              maxWidth: '600px',
              width: '90%',
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
                position: 'absolute',
                top: '1rem',
                right: '1rem',
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
            <div style={{ padding: '2rem', paddingTop: '3rem' }}>
              <CreateTenantForm
                onSuccess={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
