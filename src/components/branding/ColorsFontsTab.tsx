'use client';

// Google Fonts for headers (script/fancy)
const HEADER_FONTS = [
  'Great Vibes',
  'Playfair Display',
  'Cormorant Garamond',
  'Prata',
  'Cinzel',
  'Lora',
  'Bodoni Moda',
  'Crimson Text',
  'Montserrat',
  'Dancing Script',
  'Tangerine',
  'Parisienne',
  'Allura',
  'Satisfy',
  'Caveat',
];

// Google Fonts for body (serif/sans-serif)
const BODY_FONTS = [
  'Poppins',
  'Roboto',
  'Lora',
  'Playfair Display',
  'Merriweather',
  'Open Sans',
  'Montserrat',
  'Raleway',
  'Dosis',
  'Quicksand',
  'Nunito',
  'Inter',
  'Crimson Text',
  'EB Garamond',
  'Barlow',
  'Work Sans',
];

// General fonts
const GENERAL_FONTS = [
  'Poppins',
  'Roboto',
  'Open Sans',
  'Inter',
  'Montserrat',
  'Raleway',
  'Work Sans',
  'Dosis',
  'Quicksand',
  'Nunito',
  'Barlow',
  'Merriweather',
  'Lora',
];

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

interface ColorsFontsTabProps {
  data: BrandingData;
  onChange: (data: BrandingData) => void;
}

export default function ColorsFontsTab({ data, onChange }: ColorsFontsTabProps) {
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_FONT = '#000000';

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ color: SUPERADMIN_FONT }}>
      <h2 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Colors & Fonts
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Define your brand colors and typography. These will appear throughout your client-facing pages.
      </p>

      {/* Primary Color */}
      <div style={{ marginBottom: '1.5rem' }}>
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
      <div style={{ marginBottom: '1.5rem' }}>
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

      {/* Secondary Color Opacity */}
      <div style={{ marginBottom: '1.5rem' }}>
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
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Font Color (Text Color - Must be Dark)
        </label>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#999' }}>
          ⚠️ Light colors (white, beige, vanilla, etc) are not recommended
        </p>
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

      {/* Font Family - General */}
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
          {GENERAL_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Header & Body Font Families */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Header Font
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
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Body Font
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
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
