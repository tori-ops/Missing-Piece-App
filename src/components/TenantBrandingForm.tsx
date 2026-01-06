'use client';

import { useState } from 'react';
import { isValidHexColor } from '@/lib/branding';
import { AVAILABLE_FONTS, HEADER_FONTS, BODY_FONTS } from '@/lib/fonts';
import BrandingPreview from '@/components/BrandingPreview';

interface TenantBrandingFormProps {
  tenantId: string;
  initialBranding: {
    brandingPrimaryColor?: string | null;
    brandingSecondaryColor?: string | null;
    brandingSecondaryColorOpacity?: number | null;
    brandingOverlayOpacity?: number | null;
    brandingFontColor?: string | null;
    brandingLogoUrl?: string | null;
    brandingLogoBackgroundRemoval?: boolean | null;
    brandingOverlayUrl?: string | null;
    brandingCompanyName?: string | null;
    brandingTagline?: string | null;
    brandingFaviconUrl?: string | null;
    brandingFooterText?: string | null;
    brandingFontFamily?: string | null;
    brandingHeaderFontFamily?: string | null;
    brandingBodyFontFamily?: string | null;
    businessName: string;
  };
  onSuccess?: () => void;
  isInEditPage?: boolean;
}

export default function TenantBrandingForm({
  tenantId,
  initialBranding,
  onSuccess,
  isInEditPage = false,
}: TenantBrandingFormProps) {

  const [formData, setFormData] = useState({
    primaryColor: initialBranding.brandingPrimaryColor || '#274E13',
    secondaryColor: initialBranding.brandingSecondaryColor || '#D0CEB5',
    secondaryColorOpacity: initialBranding.brandingSecondaryColorOpacity || 55,
    overlayOpacity: initialBranding.brandingOverlayOpacity || 60,
    fontColor: initialBranding.brandingFontColor || '#000000',
    logoFile: null as File | null,
    logoUrl: initialBranding.brandingLogoUrl || '',
    logoBackgroundRemoval: initialBranding.brandingLogoBackgroundRemoval || false,
    overlayFile: null as File | null,
    overlayUrl: initialBranding.brandingOverlayUrl || '',
    companyName: initialBranding.brandingCompanyName || initialBranding.businessName || '',
    tagline: initialBranding.brandingTagline || '',
    faviconFile: null as File | null,
    faviconUrl: initialBranding.brandingFaviconUrl || '',
    footerText: initialBranding.brandingFooterText || '',
    fontFamily: initialBranding.brandingFontFamily || 'Poppins',
    headerFontFamily: initialBranding.brandingHeaderFontFamily || 'Playfair Display',
    bodyFontFamily: initialBranding.brandingBodyFontFamily || 'Poppins',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBranding, setPreviewBranding] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialBranding.brandingLogoUrl || null);
  const [overlayPreview, setOverlayPreview] = useState<string | null>(initialBranding.brandingOverlayUrl || null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(initialBranding.brandingFaviconUrl || null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, fileType: 'logo' | 'favicon' | 'overlay') => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('fileType', fileType);
      formDataToSend.append('tenantId', tenantId);

      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      return data.filePath;
    } catch (err) {
      throw err;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'logo' | 'favicon' | 'overlay') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fieldName = fileType === 'logo' ? 'logoFile' : fileType === 'favicon' ? 'faviconFile' : 'overlayFile';
    const previewSetter = fileType === 'logo' ? setLogoPreview : fileType === 'favicon' ? setFaviconPreview : setOverlayPreview;

    setFormData((prev) => ({ ...prev, [fieldName]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      previewSetter(preview);
    };
    reader.readAsDataURL(file);

    setError('');
    setSuccess(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert opacity to number if it's the opacity field
    const parsedValue = name === 'secondaryColorOpacity' ? parseInt(value, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    setError('');
    setSuccess(false);

    // Validate colors
    if (!isValidHexColor(formData.primaryColor)) {
      setError('Primary color must be a valid hex color (e.g., #274E13)');
      setLoading(false);
      setUploading(false);
      return;
    }
    if (!isValidHexColor(formData.secondaryColor)) {
      setError('Secondary color must be a valid hex color (e.g., #D0CEB5)');
      setLoading(false);
      setUploading(false);
      return;
    }

    try {
      let logoUrl = formData.logoUrl;
      let faviconUrl = formData.faviconUrl;

      // Upload logo if a new file was selected
      if (formData.logoFile) {
        logoUrl = await uploadFile(formData.logoFile, 'logo');
      }

      // Upload favicon if a new file was selected
      if (formData.faviconFile) {
        faviconUrl = await uploadFile(formData.faviconFile, 'favicon');
      }

      // Upload overlay if a new file was selected
      let overlayUrl = formData.overlayUrl;
      if (formData.overlayFile) {
        overlayUrl = await uploadFile(formData.overlayFile, 'overlay');
      }

      setUploading(false);

      const response = await fetch('/api/admin/update-tenant-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          secondaryColorOpacity: formData.secondaryColorOpacity,
          overlayOpacity: formData.overlayOpacity,
          fontColor: formData.fontColor,
          logoUrl,
          logoBackgroundRemoval: formData.logoBackgroundRemoval,
          overlayUrl,
          companyName: formData.companyName,
          tagline: formData.tagline,
          faviconUrl,
          footerText: formData.footerText,
          fontFamily: formData.fontFamily,
          headerFontFamily: formData.headerFontFamily,
          bodyFontFamily: formData.bodyFontFamily,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save branding');
        return;
      }

      // Show preview modal with the new branding
      setPreviewBranding({
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        secondaryColorOpacity: formData.secondaryColorOpacity,
        overlayOpacity: formData.overlayOpacity,
        fontColor: formData.fontColor,
        logoUrl: logoUrl || null,
        logoBackgroundRemoval: formData.logoBackgroundRemoval,
        overlayUrl: overlayUrl || null,
        companyName: formData.companyName,
        tagline: formData.tagline || null,
        headerFontFamily: formData.headerFontFamily,
        bodyFontFamily: formData.bodyFontFamily,
      });
      setShowPreview(true);
      setSuccess(true);
      
      // Call onSuccess callback after successful save
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // SuperAdmin styling (fixed, not based on tenant branding being edited)
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_SECONDARY = '#D0CEB5';
  const SUPERADMIN_FONT = '#000000';

  return (
    <form onSubmit={handleSubmit} style={{ 
      maxWidth: '600px',
      color: SUPERADMIN_FONT,
      fontFamily: 'Lora, serif',
      fontStyle: 'italic'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Company Name
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="e.g., Elite Weddings"
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
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Tagline
        </label>
        <input
          type="text"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Primary Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="color"
              name="primaryColor"
              value={formData.primaryColor}
              onChange={handleChange}
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
              value={formData.primaryColor}
              onChange={handleChange}
              name="primaryColor"
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

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Secondary Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="color"
              name="secondaryColor"
              value={formData.secondaryColor}
              onChange={handleChange}
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
              value={formData.secondaryColor}
              onChange={handleChange}
              name="secondaryColor"
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Secondary Color Opacity
          </label>
          <div>
            <input
              type="range"
              name="secondaryColorOpacity"
              min="0"
              max="100"
              value={formData.secondaryColorOpacity}
              onChange={handleChange}
              style={{
                width: '100%',
              }}
            />
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: SUPERADMIN_FONT }}>
              {formData.secondaryColorOpacity}% opacity
            </p>
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY, cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="logoBackgroundRemoval"
              checked={formData.logoBackgroundRemoval}
              onChange={(e) => setFormData({ ...formData, logoBackgroundRemoval: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            Remove Logo Background
          </label>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: SUPERADMIN_FONT }}>
            For logos with white backgrounds
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Font Color (Text Color - Must be Dark)
        </label>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: SUPERADMIN_FONT }}>
          ⚠️ Light colors (white, beige, vanilla, etc) are not recommended
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="color"
            name="fontColor"
            value={formData.fontColor}
            onChange={handleChange}
            style={{
              width: '60px',
              height: '40px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          />
          <input
            type="text"
            value={formData.fontColor}
            onChange={handleChange}
            name="fontColor"
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

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Logo (PNG, JPG, or SVG)
        </label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={(e) => handleFileChange(e, 'logo')}
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
        {(logoPreview || formData.logoUrl) && (
          <img
            src={logoPreview || formData.logoUrl}
            alt="Logo preview"
            style={{
              marginTop: '0.5rem',
              maxHeight: '80px',
              maxWidth: '100%',
              backgroundColor: 'transparent',
              filter: 'brightness(0) saturate(100%) invert(1) drop-shadow(0 0 0 white)',
              mixBlendMode: 'lighten',
            }}
          />
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Dashboard Overlay (PNG - Recommended for marble/texture patterns)
        </label>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: SUPERADMIN_FONT }}>
          📐 Appears on client dashboard at 45% opacity. Best for repeating patterns or textures.
        </p>
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={(e) => handleFileChange(e, 'overlay')}
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
        {(overlayPreview || formData.overlayUrl) && (
          <div style={{ marginTop: '0.5rem', position: 'relative', height: '150px', overflow: 'hidden', borderRadius: '4px', border: `1px solid ${SUPERADMIN_PRIMARY}20` }}>
            <img
              src={overlayPreview || formData.overlayUrl}
              alt="Overlay preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.45,
              }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: SUPERADMIN_FONT, fontWeight: '600' }}>
              Preview (45% opacity)
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Font Family
        </label>
        <select
          name="fontFamily"
          value={formData.fontFamily}
          onChange={(e) => setFormData(prev => ({ ...prev, fontFamily: e.target.value }))}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}`,
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            color: SUPERADMIN_FONT,
          }}
        >
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.name} value={font.name} style={{ fontFamily: font.family, ...(font.displayStyle || {}) }}>
              {font.displayName} - {font.description}
            </option>
          ))}
        </select>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: SUPERADMIN_FONT }}>
          Preview: <span style={{ fontFamily: AVAILABLE_FONTS.find(f => f.name === formData.fontFamily)?.family || 'inherit', ...(AVAILABLE_FONTS.find(f => f.name === formData.fontFamily)?.displayStyle || {}) }}>
            The Quick Brown Fox Jumps Over the Lazy Dog
          </span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Header Font (Elegant, Script, Serif)
          </label>
          <select
            value={formData.headerFontFamily}
            onChange={(e) => setFormData(prev => ({ ...prev, headerFontFamily: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `2px solid ${SUPERADMIN_PRIMARY}`,
              borderRadius: '4px',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              color: SUPERADMIN_FONT,
            }}
          >
            {HEADER_FONTS.map((font) => (
              <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                {font.displayName} - {font.category}
              </option>
            ))}
          </select>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: SUPERADMIN_FONT }}>
            Preview: <span style={{ fontFamily: HEADER_FONTS.find(f => f.name === formData.headerFontFamily)?.family || 'inherit', fontSize: '1.3rem', fontWeight: 'bold' }}>
              Elegant Heading
            </span>
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
            Body Font (Readable, Professional)
          </label>
          <select
            value={formData.bodyFontFamily}
            onChange={(e) => setFormData(prev => ({ ...prev, bodyFontFamily: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `2px solid ${SUPERADMIN_PRIMARY}`,
              borderRadius: '4px',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              color: SUPERADMIN_FONT,
            }}
          >
            {BODY_FONTS.map((font) => (
              <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                {font.displayName} - {font.category}
              </option>
            ))}
          </select>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: SUPERADMIN_FONT }}>
            Preview: <span style={{ fontFamily: BODY_FONTS.find(f => f.name === formData.bodyFontFamily)?.family || 'inherit' }}>
              Body text for paragraphs
            </span>
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Favicon (PNG, JPG, or SVG)
        </label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={(e) => handleFileChange(e, 'favicon')}
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
        {(faviconPreview || formData.faviconUrl) && (
          <div style={{ marginTop: '0.5rem' }}>
            <img
              src={faviconPreview || formData.faviconUrl}
              alt="Favicon preview"
              style={{
                maxHeight: '32px',
                maxWidth: '32px',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Footer Text
        </label>
        <textarea
          name="footerText"
          value={formData.footerText}
          onChange={handleChange}
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
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: '#ffebee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '1rem',
            background: '#e8f5e9',
            color: '#274E13',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          ✓ Branding saved! Check the preview...
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem 1.5rem',
          background: SUPERADMIN_PRIMARY,
          color: SUPERADMIN_SECONDARY,
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {uploading ? 'Uploading files...' : loading ? 'Saving...' : 'Save & Preview Branding'}
      </button>

      {showPreview && previewBranding && (
        <BrandingPreview
          branding={previewBranding}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            // Auto-reload to apply branding across all pages
            if (isInEditPage) {
              window.location.reload();
            } else {
              window.location.reload();
            }
          }}
        />
      )}
    </form>
  );
}
