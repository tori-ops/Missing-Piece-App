'use client';

import TenantBasicInfoForm from './TenantBasicInfoForm';

interface TenantProfileModalProps {
  tenantId: string;
  initialData: {
    firstName?: string;
    lastName?: string;
    businessName: string;
    phone?: string;
    email: string;
    webAddress?: string;
    status: string;
    subscriptionTier: string;
    streetAddress?: string;
    city?: string;
    state?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
}

export default function TenantProfileModal({
  tenantId,
  initialData,
  isOpen,
  onClose,
  primaryColor = '#274E13'
}: TenantProfileModalProps) {
  if (!isOpen) return null;

  return (
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
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '2rem',
          borderBottom: `1px solid ${primaryColor}20`
        }}>
          <h2 style={{ margin: 0, color: primaryColor, fontFamily: "'Playfair Display', serif" }}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#999',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '2rem' }}>
          <TenantBasicInfoForm tenantId={tenantId} initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
