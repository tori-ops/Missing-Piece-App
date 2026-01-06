'use client';

import { useState } from 'react';

interface BrandingData {
  brandingLogoUrl: string | null;
  brandingLogoBackgroundRemoval: boolean | null;
  brandingFaviconUrl: string | null;
  [key: string]: any;
}

interface LogoTabProps {
  data: BrandingData;
  onChange: (data: BrandingData) => void;
  tenantId: string;
}

export default function LogoTab({ data, onChange, tenantId }: LogoTabProps) {
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_FONT = '#000000';

  const [logoPreview, setLogoPreview] = useState<string | null>(data.brandingLogoUrl);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(data.brandingFaviconUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const uploadFile = async (file: File, fileType: 'logo' | 'favicon') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('tenantId', tenantId);

      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formData,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        if (fileType === 'logo') {
          setLogoPreview(preview);
        } else {
          setFaviconPreview(preview);
        }
      };
      reader.readAsDataURL(file);

      // Upload file
      const url = await uploadFile(file, fileType);
      if (fileType === 'logo') {
        handleChange('brandingLogoUrl', url);
      } else {
        handleChange('brandingFaviconUrl', url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      if (fileType === 'logo') {
        setLogoPreview(data.brandingLogoUrl);
      } else {
        setFaviconPreview(data.brandingFaviconUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ color: SUPERADMIN_FONT }}>
      <h2 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Logo & Favicon
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Upload your company logo and favicon (browser tab icon). These appear throughout the client interface.
      </p>

      {error && (
        <div style={{
          padding: '1rem',
          background: '#ffebee',
          color: '#c33',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
        }}>
          {error}
        </div>
      )}

      {/* Logo Upload */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Logo (PNG, JPG, or SVG)
        </label>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#999' }}>
          High-resolution logo for client-facing pages. Best size: 200x100px or larger.
        </p>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={(e) => handleFileChange(e, 'logo')}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}`,
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            color: SUPERADMIN_FONT,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        />
        {(logoPreview || data.brandingLogoUrl) && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>Preview:</p>
            <img
              src={logoPreview || data.brandingLogoUrl || ''}
              alt="Logo preview"
              style={{
                maxHeight: '100px',
                maxWidth: '100%',
                backgroundColor: '#f5f5f5',
                padding: '0.5rem',
                borderRadius: '4px',
              }}
            />
          </div>
        )}
      </div>

      {/* Logo Background Removal */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600', color: SUPERADMIN_PRIMARY, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.brandingLogoBackgroundRemoval || false}
            onChange={(e) => handleChange('brandingLogoBackgroundRemoval', e.target.checked)}
            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
          />
          Remove Logo Background
        </label>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
          Use this if your logo has a white or light background that should be transparent.
        </p>
      </div>

      {/* Favicon Upload */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Favicon (PNG, JPG, or SVG)
        </label>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#999' }}>
          Small icon that appears in browser tabs. Best size: 32x32px or 64x64px.
        </p>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={(e) => handleFileChange(e, 'favicon')}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${SUPERADMIN_PRIMARY}`,
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            color: SUPERADMIN_FONT,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        />
        {(faviconPreview || data.brandingFaviconUrl) && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>Preview:</p>
            <img
              src={faviconPreview || data.brandingFaviconUrl || ''}
              alt="Favicon preview"
              style={{
                maxHeight: '32px',
                maxWidth: '32px',
                backgroundColor: '#f5f5f5',
                padding: '0.25rem',
                borderRadius: '4px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
