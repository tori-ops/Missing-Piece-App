'use client';

import { useState } from 'react';
import EditClientModal from './EditClientModal';

interface ClientDetailModalProps {
  client: any;
  primaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  onClose: () => void;
  tenantId?: string;
  onSaveSuccess?: () => void;
}

export default function ClientDetailModal({
  client,
  primaryColor = '#274E13',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  onClose,
  tenantId,
  onSaveSuccess
}: ClientDetailModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [updatedClient, setUpdatedClient] = useState(client);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const weddingDate = updatedClient.weddingDate ? new Date(updatedClient.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set';
  const budget = updatedClient.budgetCents ? `$${(updatedClient.budgetCents / 100).toLocaleString()}` : 'Not set';
  const guestCount = updatedClient.estimatedGuestCount || 'Not provided';

  const handleSaveClient = (newClientData: any) => {
    setUpdatedClient(newClientData);
    setEditMode(false);
    onSaveSuccess?.();
  };

  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    setEmailFeedback(null);

    try {
      const response = await fetch('/api/tenant/resend-setup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: updatedClient.id })
      });

      if (response.ok) {
        setEmailFeedback({ type: 'success', message: 'Email sent successfully' });
        setShowConfirmation(false);
        // Clear feedback after 3 seconds
        setTimeout(() => setEmailFeedback(null), 3000);
      } else {
        const data = await response.json();
        setEmailFeedback({ type: 'error', message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setEmailFeedback({ type: 'error', message: 'An error occurred while sending the email' });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const InfoSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: primaryColor, fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', fontFamily: headerFontFamily }}>
        {icon} {title}
      </h3>
      {children}
    </section>
  );

  const InfoField = ({ label, value, isLink = false }: { label: string; value: string; isLink?: boolean }) => (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.35rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      {isLink ? (
        <a
          href={`mailto:${value}`}
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: primaryColor,
            margin: 0,
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          {value}
        </a>
      ) : (
        <p style={{ fontSize: '1rem', fontWeight: '600', color: fontColor, margin: 0 }}>
          {value}
        </p>
      )}
    </div>
  );

  const TwoColumnGrid = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {children}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 99
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          zIndex: 100,
          maxWidth: '700px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          fontFamily: bodyFontFamily
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          color: 'white',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.8rem',
              fontFamily: headerFontFamily,
              fontWeight: '600'
            }}>
              {client.couple1FirstName} & {client.couple2FirstName || '?'}
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>Wedding Client Profile</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
              flexShrink: 0
            }}
            onMouseEnter={(e) => (e.currentTarget as any).style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => (e.currentTarget as any).style.background = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Wedding Details */}
          <InfoSection title="Wedding Details" icon="💍">
            <TwoColumnGrid>
              <InfoField label="Wedding Date" value={weddingDate} />
              <InfoField label="Estimated Guests" value={typeof guestCount === 'number' ? guestCount.toLocaleString() : guestCount} />
            </TwoColumnGrid>
            <InfoField label="Wedding Venue / Location" value={client.weddingLocation || 'Not provided'} />
          </InfoSection>

          {/* Contact Information */}
          <InfoSection title="Contact Information" icon="📧">
            <InfoField label="Primary Email" value={client.contactEmail || 'Not provided'} isLink={!!client.contactEmail} />
            {client.contactPhone && <InfoField label="Phone" value={client.contactPhone} />}
          </InfoSection>

          {/* Home Address */}
          {(client.addressLine1 || client.addressCity) && (
            <InfoSection title="Mailing Address" icon="📬">
              <p style={{ fontSize: '1rem', color: fontColor, margin: 0, lineHeight: '1.6' }}>
                {client.addressLine1 && <>{client.addressLine1}<br /></>}
                {client.addressLine2 && <>{client.addressLine2}<br /></>}
                {client.addressCity && `${client.addressCity}, `}
                {client.addressState && `${client.addressState} `}
                {client.addressZip && client.addressZip}
              </p>
              {!client.addressLine1 && !client.addressCity && (
                <p style={{ fontSize: '1rem', color: fontColor, margin: 0, opacity: 0.6 }}>Not provided</p>
              )}
            </InfoSection>
          )}

          {/* Budget */}
          <InfoSection title="Budget" icon="💰">
            <div style={{
              background: `${primaryColor}08`,
              border: `2px solid ${primaryColor}30`,
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: fontColor, opacity: 0.6, margin: '0 0 0.5rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Overall Wedding Budget
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: primaryColor, margin: 0 }}>{budget}</p>
              </div>
              <div style={{ fontSize: '3rem', opacity: 0.2 }}>💍</div>
            </div>
          </InfoSection>
          {/* Status */}
          <InfoSection title="Account Status" icon="📌">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: (updatedClient.status === 'ACTIVE' || updatedClient.users?.length > 0) ? '#E8F5E9' : '#FFEBEE',
                color: (updatedClient.status === 'ACTIVE' || updatedClient.users?.length > 0) ? '#2E7D32' : '#C62828',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {(updatedClient.status === 'ACTIVE' || updatedClient.users?.length > 0) ? '✓ Active' : '⚠ Pending'}
              </span>
            </div>
          </InfoSection>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: `2px solid ${primaryColor}15`,
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          background: `${primaryColor}04`,
          flexWrap: 'wrap'
        }}>
          {emailFeedback && (
            <div style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              background: emailFeedback.type === 'success' ? '#E8F5E9' : '#FFEBEE',
              color: emailFeedback.type === 'success' ? '#2E7D32' : '#C62828',
              border: `2px solid ${emailFeedback.type === 'success' ? '#81C784' : '#EF5350'}`,
              textAlign: 'center'
            }}>
              {emailFeedback.message}
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'white',
              color: primaryColor,
              border: `2px solid ${primaryColor}`,
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as any).style.background = `${primaryColor}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as any).style.background = 'white';
            }}
          >
            Close
          </button>
          <button
            onClick={() => setShowConfirmation(true)}
            style={{
              background: 'white',
              color: primaryColor,
              border: `2px solid ${primaryColor}`,
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
              transition: 'all 0.2s ease',
              opacity: isResendingEmail ? 0.6 : 1
            }}
            disabled={isResendingEmail}
            onMouseEnter={(e) => {
              if (!isResendingEmail) {
                (e.currentTarget as any).style.background = `${primaryColor}10`;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as any).style.background = 'white';
            }}
          >
            {isResendingEmail ? '📧 Sending...' : '📧 Resend Setup Email'}
          </button>
          <button
            onClick={() => setEditMode(true)}
            style={{
              background: primaryColor,
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 12px ${primaryColor}40`
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as any).style.transform = 'translateY(-2px)';
              (e.currentTarget as any).style.boxShadow = `0 6px 16px ${primaryColor}50`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as any).style.transform = 'translateY(0)';
              (e.currentTarget as any).style.boxShadow = `0 4px 12px ${primaryColor}40`;
            }}
          >
            ✎ Edit Client
          </button>
        </div>
      </div>

      {editMode && tenantId && (
        <EditClientModal
          client={updatedClient}
          tenantId={tenantId}
          onClose={() => setEditMode(false)}
          onSave={handleSaveClient}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <>
          <div
            onClick={() => setShowConfirmation(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 150
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              zIndex: 151,
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              fontFamily: bodyFontFamily
            }}
          >
            <h3 style={{ color: primaryColor, margin: '0 0 1rem 0', fontSize: '1.3rem', fontFamily: headerFontFamily }}>
              Resend Setup Email?
            </h3>
            <p style={{ color: fontColor, marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Send the account setup email to <strong>{updatedClient.contactEmail}</strong>? They'll receive a secure link to create their password.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  background: 'white',
                  color: primaryColor,
                  border: `2px solid ${primaryColor}`,
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: bodyFontFamily,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as any).style.background = `${primaryColor}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as any).style.background = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResendEmail}
                disabled={isResendingEmail}
                style={{
                  background: primaryColor,
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isResendingEmail ? 'default' : 'pointer',
                  fontFamily: bodyFontFamily,
                  transition: 'all 0.2s ease',
                  opacity: isResendingEmail ? 0.6 : 1,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
                onMouseEnter={(e) => {
                  if (!isResendingEmail) {
                    (e.currentTarget as any).style.transform = 'translateY(-2px)';
                    (e.currentTarget as any).style.boxShadow = `0 6px 16px ${primaryColor}50`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isResendingEmail) {
                    (e.currentTarget as any).style.transform = 'translateY(0)';
                    (e.currentTarget as any).style.boxShadow = `0 4px 12px ${primaryColor}40`;
                  }
                }}
              >
                {isResendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
