'use client';

import { useState } from 'react';
import TenantBrandingForm from '@/components/TenantBrandingForm';

interface TenantBrandingModalProps {
  tenantId: string;
  tenantData: {
    businessName: string;
    brandingPrimaryColor?: string | null;
    brandingSecondaryColor?: string | null;
    brandingLogoUrl?: string | null;
    brandingCompanyName?: string | null;
    brandingTagline?: string | null;
    brandingFaviconUrl?: string | null;
    brandingFooterText?: string | null;
  };
}

export default function TenantBrandingModal({ tenantId, tenantData }: TenantBrandingModalProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: '#274E13',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
        }}
      >
        🎨 Edit Branding
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
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              position: 'relative',
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
                zIndex: 10,
              }}
            >
              ✕
            </button>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ color: '#274E13', marginTop: 0 }}>🎨 Edit Tenant Branding</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Customize how this tenant&apos;s clients will see the platform
              </p>

              <TenantBrandingForm
                tenantId={tenantId}
                initialBranding={tenantData}
                onSuccess={() => {
                  setShowModal(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
