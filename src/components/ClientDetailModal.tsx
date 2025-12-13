'use client';

interface ClientDetailModalProps {
  client: any;
  primaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  onClose: () => void;
}

export default function ClientDetailModal({
  client,
  primaryColor = '#274E13',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  onClose
}: ClientDetailModalProps) {
  const weddingDate = client.weddingDate ? new Date(client.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set';
  const budget = client.budgetCents ? `$${(client.budgetCents / 100).toLocaleString()}` : 'Not set';
  const guestCount = client.estimatedGuestCount || 'Not provided';

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
              {client.couple1FirstName} & {client.couple2FirstName || '?'} {client.couple1LastName}
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
                background: client.users?.length > 0 ? `${primaryColor}20` : '#FFE9E9',
                color: client.users?.length > 0 ? primaryColor : '#C62828',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: `2px solid ${client.users?.length > 0 ? `${primaryColor}40` : '#FFB3B3'}`
              }}>
                {client.users?.length > 0 ? '✓ Active' : '○ Pending Invitation'}
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
          background: `${primaryColor}04`
        }}>
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
    </>
  );
}
