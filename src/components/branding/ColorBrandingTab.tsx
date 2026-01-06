'use client';

import { AVAILABLE_FONTS, HEADER_FONTS, BODY_FONTS } from '@/lib/fonts';

interface BrandingData {
  brandingPrimaryColor: string | null;
  brandingSecondaryColor: string | null;
  brandingSecondaryColorOpacity: number | null;
  brandingFontColor: string | null;
  brandingFontFamily: string | null;
  brandingHeaderFontFamily: string | null;
  brandingBodyFontFamily: string | null;
  [key: string]: any;
}

interface ColorBrandingTabProps {
  data: BrandingData;
  onChange: (data: BrandingData) => void;
}

export default function ColorBrandingTab({ data, onChange }: ColorBrandingTabProps) {
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_FONT = '#000000';

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ color: SUPERADMIN_FONT }}>
      <h2 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Color Branding
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Define your brand colors and typography. These will appear throughout your client-facing pages.
      </p>

      {/* Color Pickers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Primary Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Primary Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="color"
              value={data.brandingPrimaryColor || '#274E13'}
              onChange={(e) => handleChange('brandingPrimaryColor', e.target.value)}
              style={{
                width: '60px',
                height: '40px',
                border: `2px solid ${SUPERADMIN_PRIMARY}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={data.brandingPrimaryColor || '#274E13'}
              onChange={(e) => handleChange('brandingPrimaryColor', e.target.value)}
              placeholder="#274E13"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}`,
                borderRadius: '4px',
                fontSize: '0.9rem',
                color: SUPERADMIN_FONT,
              }}
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Secondary Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="color"
              value={data.brandingSecondaryColor || '#D0CEB5'}
              onChange={(e) => handleChange('brandingSecondaryColor', e.target.value)}
              style={{
                width: '60px',
                height: '40px',
                border: `2px solid ${SUPERADMIN_PRIMARY}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={data.brandingSecondaryColor || '#D0CEB5'}
              onChange={(e) => handleChange('brandingSecondaryColor', e.target.value)}
              placeholder="#D0CEB5"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}`,
                borderRadius: '4px',
                fontSize: '0.9rem',
                color: SUPERADMIN_FONT,
              }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Color Opacity & Font Color */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Secondary Color Opacity */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Secondary Color Opacity
          </label>
          <div>
            <input
              type="range"
              min="0"
              max="100"
              value={data.brandingSecondaryColorOpacity || 55}
              onChange={(e) => handleChange('brandingSecondaryColorOpacity', parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: SUPERADMIN_FONT }}>
              {data.brandingSecondaryColorOpacity || 55}% opacity
            </p>
          </div>
        </div>

        {/* Font Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Font Color (Text Color)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="color"
              value={data.brandingFontColor || '#000000'}
              onChange={(e) => handleChange('brandingFontColor', e.target.value)}
              style={{
                width: '60px',
                height: '40px',
                border: `2px solid ${SUPERADMIN_PRIMARY}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={data.brandingFontColor || '#000000'}
              onChange={(e) => handleChange('brandingFontColor', e.target.value)}
              placeholder="#000000"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `2px solid ${SUPERADMIN_PRIMARY}`,
                borderRadius: '4px',
                fontSize: '0.9rem',
                color: SUPERADMIN_FONT,
              }}
            />
          </div>
        </div>
      </div>

      {/* Font Families */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Font Family (General)
        </label>
        <select
          value={data.brandingFontFamily || 'Poppins'}
          onChange={(e) => handleChange('brandingFontFamily', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}`,
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            color: SUPERADMIN_FONT,
          }}
        >
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.name} value={font.name} style={{ fontFamily: font.family, ...(font.displayStyle || {}) }}>
              {font.displayName} - {font.description}
            </option>
          ))}
        </select>
      </div>

      {/* Header & Body Font Families */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Header Font (Elegant, Script, Serif)
          </label>
          <select
            value={data.brandingHeaderFontFamily || 'Playfair Display'}
            onChange={(e) => handleChange('brandingHeaderFontFamily', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `2px solid ${SUPERADMIN_PRIMARY}`,
              borderRadius: '4px',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
              color: SUPERADMIN_FONT,
            }}
          >
            {HEADER_FONTS.map((font) => (
              <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                {font.displayName} - {font.category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Body Font (Readable, Professional)
          </label>
          <select
            value={data.brandingBodyFontFamily || 'Poppins'}
            onChange={(e) => handleChange('brandingBodyFontFamily', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `2px solid ${SUPERADMIN_PRIMARY}`,
              borderRadius: '4px',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
              color: SUPERADMIN_FONT,
            }}
          >
            {BODY_FONTS.map((font) => (
              <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                {font.displayName} - {font.category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
