'use client';

import React from 'react';

// Google Fonts for headers (cursive/handwriting)
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

interface BrandingData {
  brandingPrimaryColor: string | null;
  brandingSecondaryColor: string | null;
  brandingSecondaryColorOpacity: number | null;
  brandingOverlayOpacity: number | null;
  brandingAccentColor: string | null;
  brandingFontColor: string | null;
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

  // Load Google Fonts dynamically
  React.useEffect(() => {
    const fontsToLoad = Array.from(new Set([
      data.brandingHeaderFontFamily || 'Playfair Display',
      data.brandingBodyFontFamily || 'Poppins',
      ...HEADER_FONTS,
      ...BODY_FONTS,
    ]));

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f.replace(/ /g, '+')}`).join('&')}:wght@400;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, [data.brandingHeaderFontFamily, data.brandingBodyFontFamily]);

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

      {/* Accent Color */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Accent Color (For Highlights & Cards)
        </label>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#999' }}>
          Used for highlights, buttons, and card accents
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="color"
            value={data.brandingAccentColor || '#FFB6C1'}
            onChange={(e) => handleChange('brandingAccentColor', e.target.value)}
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
            value={data.brandingAccentColor || '#FFB6C1'}
            onChange={(e) => handleChange('brandingAccentColor', e.target.value)}
            placeholder="#FFB6C1"
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

      {/* Header Font */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Header Font (Cursive/Handwriting)
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
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font.replace(/\+/g, ' ')}
            </option>
          ))}
        </select>
        <div style={{
          marginTop: '0.75rem',
          padding: '1rem',
          background: '#f9f9f9',
          borderRadius: '4px',
          fontFamily: data.brandingHeaderFontFamily || 'Playfair Display',
          fontSize: '1.5rem',
          color: SUPERADMIN_FONT,
        }}>
          This is how your header font looks
        </div>
      </div>

      {/* Body Font */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Body Font (Serif/Sans-Serif)
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
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font.replace(/\+/g, ' ')}
            </option>
          ))}
        </select>
        <div style={{
          marginTop: '0.75rem',
          padding: '1rem',
          background: '#f9f9f9',
          borderRadius: '4px',
          fontFamily: data.brandingBodyFontFamily || 'Poppins',
          fontSize: '1rem',
          color: SUPERADMIN_FONT,
          lineHeight: '1.5',
        }}>
          This is how your body font looks. Use this for all body text, paragraphs, and general content.
        </div>
      </div>
    </div>
  );
}
