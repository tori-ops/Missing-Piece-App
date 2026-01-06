'use client';

interface BrandingData {
  [key: string]: any;
}

interface ExtrasTabProps {
  data: BrandingData;
  onChange: (data: BrandingData) => void;
}

export default function ExtrasTab({ data, onChange }: ExtrasTabProps) {
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_FONT = '#000000';

  return (
    <div style={{ color: SUPERADMIN_FONT }}>
      <h2 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        ✨ Extras
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Additional branding options coming soon! Here you'll be able to customize:
      </p>

      <ul style={{
        color: '#666',
        lineHeight: '1.8',
        fontSize: '0.95rem',
        marginBottom: '2rem',
        paddingLeft: '1.5rem',
      }}>
        <li>Custom button styles and hover effects</li>
        <li>Additional accent colors</li>
        <li>Email template branding</li>
        <li>Border radius and spacing preferences</li>
        <li>Animation and transition preferences</li>
        <li>Custom CSS overrides for advanced users</li>
      </ul>

      <div style={{
        padding: '1.5rem',
        background: `${SUPERADMIN_PRIMARY}10`,
        borderLeft: `4px solid ${SUPERADMIN_PRIMARY}`,
        borderRadius: '4px',
      }}>
        <p style={{ margin: 0, color: SUPERADMIN_PRIMARY, fontWeight: '600' }}>
          🎯 Coming Soon
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
          We're building more ways for you to make your client experience truly unique. Check back soon!
        </p>
      </div>
    </div>
  );
}
