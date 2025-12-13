'use client';

import { useState } from 'react';
import CreateClientForm from './CreateClientForm';

interface CreateClientFormModalProps {
  tenantId: string;
  primaryColor?: string;
}

export default function CreateClientFormModal({ tenantId, primaryColor = '#274E13' }: CreateClientFormModalProps) {
  const [showModal, setShowModal] = useState(false);

  const hoverColor = primaryColor === '#274E13' ? '#1a3d0a' : `${primaryColor}dd`;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: primaryColor,
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '3.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 6px ${primaryColor}33`,
          transition: 'all 0.2s ease',
          fontWeight: 'bold'
        }}
        title="Add New Client"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = primaryColor;
        }}
      >
        +
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
              borderRadius: '12px',
              maxWidth: '700px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
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
              <CreateClientForm
                tenantId={tenantId}
                onSuccess={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
