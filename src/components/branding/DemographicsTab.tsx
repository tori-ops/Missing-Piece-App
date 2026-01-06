'use client';

interface BrandingData {
  businessName: string;
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
