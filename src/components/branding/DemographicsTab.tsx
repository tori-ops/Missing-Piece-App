'use client';

interface BrandingData {
  businessName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  brandingCompanyName: string | null;
  brandingTagline: string | null;
  brandingFooterText: string | null;
  [key: string]: any;
}

interface DemographicsTabProps {
  data: BrandingData;
  onChange: (data: BrandingData) => void;
}

export default function DemographicsTab({ data, onChange }: DemographicsTabProps) {
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_FONT = '#000000';

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ color: SUPERADMIN_FONT }}>
      <h2 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Demographics
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Update basic information about your business and how you present to clients.
      </p>

      {/* Tenant Contact Information (Read-only) */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '4px', border: `1px solid ${SUPERADMIN_PRIMARY}20` }}>
        <h3 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
          Tenant Information
        </h3>
        <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Read-only. Edit in Basic Information to change these details.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
          {/* First Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY, fontSize: '0.9rem' }}>
              First Name
            </label>
            <input
              type="text"
              value={data.firstName || ''}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}20`,
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                color: '#999',
                background: 'white',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Last Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY, fontSize: '0.9rem' }}>
              Last Name
            </label>
            <input
              type="text"
              value={data.lastName || ''}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}20`,
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                color: '#999',
                background: 'white',
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY, fontSize: '0.9rem' }}>
              Email
            </label>
            <input
              type="email"
              value={data.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}20`,
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                color: '#999',
                background: 'white',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY, fontSize: '0.9rem' }}>
              Phone
            </label>
            <input
              type="tel"
              value={data.phone || ''}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}20`,
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                color: '#999',
                background: 'white',
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>

        {/* Mailing Address */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY, fontSize: '0.9rem' }}>
            Mailing Address
          </label>
          <input
            type="text"
            value={data.streetAddress || ''}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `2px solid ${SUPERADMIN_PRIMARY}20`,
              borderRadius: '4px',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
              color: '#999',
              background: 'white',
              cursor: 'not-allowed',
              marginBottom: '0.5rem',
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <input
              type="text"
              value={data.city || ''}
              disabled
              placeholder="City"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}20`,
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                color: '#999',
                background: 'white',
                cursor: 'not-allowed',
              }}
            />
            <input
              type="text"
              value={data.state || ''}
              disabled
              placeholder="State"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}20`,
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                color: '#999',
                background: 'white',
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>
      </div>

      {/* Business Name (Read-only from tenant) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Business Name (From Account)
        </label>
        <input
          type="text"
          value={data.businessName}
          disabled
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}20`,
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            color: '#999',
            background: '#f5f5f5',
            cursor: 'not-allowed',
          }}
        />
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
          Edit in Basic Information to change this.
        </p>
      </div>

      {/* Company Name (For Branding) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Company Name (Display to Clients)
        </label>
        <input
          type="text"
          value={data.brandingCompanyName || ''}
          onChange={(e) => handleChange('brandingCompanyName', e.target.value)}
          placeholder={`e.g., ${data.businessName}`}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}`,
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            color: SUPERADMIN_FONT,
          }}
        />
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
          This is how your company name appears to clients. Leave blank to use your business name.
        </p>
      </div>

      {/* Tagline */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Tagline
        </label>
        <input
          type="text"
          value={data.brandingTagline || ''}
          onChange={(e) => handleChange('brandingTagline', e.target.value)}
          placeholder="e.g., Where Dreams Come True"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}`,
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            color: SUPERADMIN_FONT,
          }}
        />
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
          A short phrase that describes your business essence.
        </p>
      </div>

      {/* Footer Text */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Footer Text
        </label>
        <textarea
          value={data.brandingFooterText || ''}
          onChange={(e) => handleChange('brandingFooterText', e.target.value)}
          placeholder="e.g., Contact us at hello@example.com | www.example.com"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}`,
            borderRadius: '4px',
            fontSize: '1rem',
            minHeight: '80px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            color: SUPERADMIN_FONT,
          }}
        />
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
          Appears at the bottom of client-facing pages.
        </p>
      </div>
    </div>
  );
}
