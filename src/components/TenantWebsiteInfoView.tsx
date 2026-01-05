'use client';

import { useState, useEffect } from 'react';

interface WebsiteData {
  id: string;
  howWeMet: string | null;
  engagementStory: string | null;
  headerFont: string;
  bodyFont: string;
  fontColor: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  urlEnding1: string | null;
  urlEnding2: string | null;
  allowTenantEdits: boolean;
  createdAt: Date;
  updatedAt: Date;
  registries?: RegistryData[];
}

interface RegistryData {
  id: string;
  registryName: string;
  registryUrl: string;
  isOptional: boolean;
  registryOrder: number;
}

interface ImageData {
  id: string;
  category: string;
  url: string;
  createdAt: Date;
}

interface TenantWebsiteInfoViewProps {
  clientId: string;
  primaryColor: string;
  fontColor: string;
}

export default function TenantWebsiteInfoView({
  clientId,
  primaryColor,
  fontColor
}: TenantWebsiteInfoViewProps) {
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<WebsiteData>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const headerFontFamily = website?.headerFont || 'Great Vibes';
  const bodyFontFamily = website?.bodyFont || 'Poppins';

  useEffect(() => {
    const loadWebsiteData = async () => {
      try {
        const response = await fetch(`/api/client-websites?clientId=${clientId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.website) {
            setWebsite(data.website);
            setEditData(data.website);
          }
          if (data.images) {
            setImages(data.images);
          }
        }
      } catch (error) {
        console.error('Error loading website data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWebsiteData();
  }, [clientId]);

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const payload = {
        clientId,
        howWeMet: editData.howWeMet || '',
        engagementStory: editData.engagementStory || '',
        headerFont: editData.headerFont || website?.headerFont || 'Great Vibes',
        bodyFont: editData.bodyFont || website?.bodyFont || 'Poppins',
        fontColor: editData.fontColor || website?.fontColor || '#1a1a1a',
        colorPrimary: editData.colorPrimary || website?.colorPrimary || '#274E13',
        colorSecondary: editData.colorSecondary || website?.colorSecondary || '#e1e0d0',
        colorAccent: editData.colorAccent || website?.colorAccent || '#FF69B4',
        urlEnding1: editData.urlEnding1 || website?.urlEnding1 || '',
        urlEnding2: editData.urlEnding2 || website?.urlEnding2 || '',
        allowTenantEdits: website?.allowTenantEdits ?? false
      };

      const response = await fetch('/api/client-websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setWebsite(data.website);
        setEditMode(false);
        setMessage({ type: 'success', text: 'Changes saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save changes' });
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setMessage({ type: 'error', text: 'Error saving changes' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: fontColor }}>
        Loading website information...
      </div>
    );
  }

  if (!website) {
    return (
      <div style={{ padding: '2rem', color: fontColor }}>
        <p>No website information has been added yet.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: bodyFontFamily, color: fontColor }}>
      {/* Message Display */}
      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: message.type === 'success' ? '#4CAF5015' : '#F4433615',
            color: message.type === 'success' ? '#2E7D32' : '#C62828',
            border: `1px solid ${message.type === 'success' ? '#4CAF50' : '#F44336'}`,
            fontSize: '0.9rem'
          }}
        >
          {message.text}
        </div>
      )}

      {/* Edit Toggle */}
      {website.allowTenantEdits && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: primaryColor,
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              Edit Details
            </button>
          ) : (
            <>
              <button
                onClick={handleEditSave}
                disabled={saving}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditData(website);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: primaryColor,
                  border: `2px solid ${primaryColor}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Story Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem', fontFamily: headerFontFamily }}>
          Your Story
        </h2>

        {/* How We Met */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
            How We Met
          </label>
          {editMode && website.allowTenantEdits ? (
            <textarea
              value={editData.howWeMet || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, howWeMet: e.target.value }))}
              spellCheck="true"
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                lineHeight: '1.5'
              }}
            />
          ) : (
            <p style={{
              padding: '0.75rem',
              backgroundColor: primaryColor + '05',
              borderRadius: '4px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {website.howWeMet || 'Not provided'}
            </p>
          )}
        </div>

        {/* Engagement Story */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
            Engagement Story
          </label>
          {editMode && website.allowTenantEdits ? (
            <textarea
              value={editData.engagementStory || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, engagementStory: e.target.value }))}
              spellCheck="true"
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                lineHeight: '1.5'
              }}
            />
          ) : (
            <p style={{
              padding: '0.75rem',
              backgroundColor: primaryColor + '05',
              borderRadius: '4px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {website.engagementStory || 'Not provided'}
            </p>
          )}
        </div>
      </div>

      {/* Design Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem', fontFamily: headerFontFamily }}>
          Design Choices
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Header Font
            </label>
            <p style={{
              padding: '0.75rem',
              backgroundColor: primaryColor + '05',
              borderRadius: '4px',
              fontFamily: headerFontFamily,
              fontSize: '1.2rem'
            }}>
              {website.headerFont}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Body Font
            </label>
            <p style={{
              padding: '0.75rem',
              backgroundColor: primaryColor + '05',
              borderRadius: '4px',
              fontFamily: bodyFontFamily,
              fontSize: '0.95rem'
            }}>
              {website.bodyFont}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Font Color
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: website.fontColor,
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {website.fontColor}
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Primary Color
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: website.colorPrimary,
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {website.colorPrimary}
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Secondary Color
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: website.colorSecondary,
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {website.colorSecondary}
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Accent Color
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: website.colorAccent,
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {website.colorAccent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Images Section */}
      {images.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem', fontFamily: headerFontFamily }}>
            Photos ({images.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {images.map(image => (
              <div key={image.id} style={{ position: 'relative' }}>
                <img
                  src={image.url}
                  alt={image.category}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = image.url;
                    link.download = `photo-${image.id}.jpg`;
                    link.click();
                  }}
                />
                <p style={{
                  position: 'absolute',
                  bottom: '0.5rem',
                  left: '0.5rem',
                  right: '0.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#ffffff',
                  margin: 0,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '2px',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                }}>
                  {image.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URLs Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem', fontFamily: headerFontFamily }}>
          Website URLs
        </h2>

        <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1rem', fontSize: '0.9rem' }}>
          Your website will be hosted at: <strong>https://www.missingpieceplanning.com/events/[your-choice]</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Option 1
            </label>
            <p style={{
              padding: '0.75rem',
              backgroundColor: primaryColor + '05',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              wordBreak: 'break-all'
            }}>
              {website.urlEnding1 ? `https://www.missingpieceplanning.com/events/${website.urlEnding1}` : 'Not provided'}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              Option 2
            </label>
            <p style={{
              padding: '0.75rem',
              backgroundColor: primaryColor + '05',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              wordBreak: 'break-all'
            }}>
              {website.urlEnding2 ? `https://www.missingpieceplanning.com/events/${website.urlEnding2}` : 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Registries Section */}
      {website?.registries && website.registries.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem', fontFamily: headerFontFamily }}>
            Registries
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {website.registries.map((registry) => (
              <div
                key={registry.id}
                style={{
                  padding: '1rem',
                  backgroundColor: primaryColor + '05',
                  borderRadius: '4px',
                  border: `1px solid ${primaryColor}20`
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', color: primaryColor, fontSize: '0.95rem' }}>
                  {registry.registryName}
                  {registry.isOptional && (
                    <span style={{ fontSize: '0.75rem', color: fontColor, opacity: 0.6, marginLeft: '0.5rem' }}>
                      (Optional)
                    </span>
                  )}
                </h4>
                <a
                  href={registry.registryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: primaryColor,
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    wordBreak: 'break-all',
                    display: 'inline-block',
                    transition: 'text-decoration 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {registry.registryUrl}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
