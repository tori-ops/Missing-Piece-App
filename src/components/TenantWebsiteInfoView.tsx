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
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

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

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(loadWebsiteData, 5000);
    setRefreshInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [clientId]);

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
        <p>The client has not yet submitted their website information.</p>
      </div>
    );
  }

  // Format the last updated date
  const lastUpdatedDate = new Date(website.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{ fontFamily: bodyFontFamily, color: fontColor }}>
      {/* Last Updated Info */}
      <div style={{
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        backgroundColor: primaryColor + '10',
        borderLeft: `4px solid ${primaryColor}`,
        borderRadius: '4px',
        fontSize: '0.85rem',
        color: fontColor
      }}>
        Last updated by client on {lastUpdatedDate}
      </div>

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
        </div>

        {/* Engagement Story */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
            Engagement Story
          </label>
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
