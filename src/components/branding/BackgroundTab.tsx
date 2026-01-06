'use client';

import { useState } from 'react';

interface BrandingData {
  brandingOverlayUrl: string | null;
  [key: string]: any;
}

interface BackgroundTabProps {
  data: BrandingData;
  onChange: (data: BrandingData) => void;
  tenantId: string;
}

export default function BackgroundTab({ data, onChange, tenantId }: BackgroundTabProps) {
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_FONT = '#000000';

  const [overlayPreview, setOverlayPreview] = useState<string | null>(data.brandingOverlayUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const uploadFile = async (file: File, fileType: 'overlay') => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'overlay') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setOverlayPreview(preview);
      };
      reader.readAsDataURL(file);

      // Upload file
      const url = await uploadFile(file, fileType);
      handleChange('brandingOverlayUrl', url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setOverlayPreview(data.brandingOverlayUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ color: SUPERADMIN_FONT }}>
      <h2 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Background & Overlay
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Add a subtle background pattern or texture that appears on the client dashboard at 45% opacity for a refined look.
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

      {/* Overlay Upload */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: SUPERADMIN_PRIMARY }}>
          Dashboard Overlay (PNG - Recommended for marble/texture patterns)
        </label>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#999' }}>
          📐 Appears on client dashboard at 45% opacity. Best for repeating patterns or textures like marble, watercolor, or geometric designs.
        </p>
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={(e) => handleFileChange(e, 'overlay')}
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
        
        {(overlayPreview || data.brandingOverlayUrl) && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.75rem', fontWeight: '600' }}>
              Preview (45% opacity):
            </p>
            <div style={{
              position: 'relative',
              height: '200px',
              overflow: 'hidden',
              borderRadius: '4px',
              border: `2px solid ${SUPERADMIN_PRIMARY}20`,
              background: 'white',
            }}>
              <img
                src={overlayPreview || data.brandingOverlayUrl || ''}
                alt="Overlay preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.45,
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: SUPERADMIN_FONT,
                fontWeight: '600',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}>
                This is how it looks at 45% opacity
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
