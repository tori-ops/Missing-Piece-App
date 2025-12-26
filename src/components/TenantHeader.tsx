'use client';

import { useState } from 'react';
import TenantProfileModal from './TenantProfileModal';

interface TenantHeaderProps {
  logo: string | undefined;
  companyName: string;
  userName: string;
  accentColor: string;
  fontColor: string;
  headerFontFamily: string;
  bodyFontFamily: string;
  tenantId: string;
  tenantData: {
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
  logoutButton: React.ReactNode;
}

export default function TenantHeader({
  logo,
  companyName,
  userName,
  accentColor,
  fontColor,
  headerFontFamily,
  bodyFontFamily,
  tenantId,
  tenantData,
  logoutButton
}: TenantHeaderProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div
          onClick={() => setShowModal(true)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {logo && (
              <img 
                src={logo} 
                alt={companyName} 
                style={{ 
                  height: '50px', 
                  width: 'auto',
                  objectFit: 'contain',
                  backgroundColor: 'transparent'
                }} 
              />
            )}
            {!logo && (
              <span style={{ fontSize: '2.5rem' }}>💍</span>
            )}
            <h1 style={{ color: accentColor, margin: 0, fontFamily: headerFontFamily, fontSize: '2.8rem' }}>{companyName}</h1>
          </div>
          <p style={{ color: fontColor, margin: '0.5rem 0 0 0', fontFamily: bodyFontFamily, fontSize: 'calc(1rem + 3px)' }}>Welcome back, {userName || 'Admin'}</p>
        </div>
        {logoutButton}
      </div>

      <TenantProfileModal 
        tenantId={tenantId}
        initialData={tenantData}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        primaryColor={accentColor}
      />
    </>
  );
}
