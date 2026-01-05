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
  updatedAt: Date;
  registries?: RegistryData[];
  clientProfile?: {
    couple1FirstName: string;
    couple1LastName: string;
    couple2FirstName: string | null;
    couple2LastName: string | null;
    weddingLocation: string | null;
    weddingDate: Date | null;
  };
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
  const [error, setError] = useState<string | null>(null);

  const headerFontFamily = website?.headerFont || 'Great Vibes';
  const bodyFontFamily = website?.bodyFont || 'Poppins';

  useEffect(() => {
    const loadWebsiteData = async () => {
      try {
        setError(null);
        console.log('Fetching website data for clientId:', clientId);
        
        const response = await fetch(`/api/client-websites?clientId=${clientId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.website) {
          setWebsite(data.website);
        }
        if (data.images) {
          setImages(data.images);
        }
      } catch (error) {
        console.error('Error loading website data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load website data');
      } finally {
        setLoading(false);
      }
    };

    loadWebsiteData();

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(loadWebsiteData, 5000);

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

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#C62828', backgroundColor: '#F4433615', borderRadius: '4px' }}>
        <p>Error loading information: {error}</p>
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

  // Format couple names
  const coupleName = website.clientProfile
    ? `${website.clientProfile.couple1FirstName} ${website.clientProfile.couple1LastName}${
        website.clientProfile.couple2FirstName
          ? ` & ${website.clientProfile.couple2FirstName} ${website.clientProfile.couple2LastName}`
          : ''
      }`
    : 'Couple';

  // Format wedding date
  const weddingDate = website.clientProfile?.weddingDate
    ? new Date(website.clientProfile.weddingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Date TBD';

  const venue = website.clientProfile?.weddingLocation || 'Venue TBD';

  // Format last updated
  const lastUpdatedDate = new Date(website.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{ fontFamily: bodyFontFamily, color: fontColor, lineHeight: '1.6' }}>
      {/* Header Section */}
      <div style={{
        padding: '2rem',
        backgroundColor: primaryColor + '10',
        borderLeft: `4px solid ${primaryColor}`,
        marginBottom: '2rem',
        borderRadius: '4px'
      }}>
        <h1 style={{
          fontFamily: headerFontFamily,
          fontSize: '2.5rem',
          color: primaryColor,
          margin: '0 0 1rem 0'
        }}>
          {coupleName}
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
          <div>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: fontColor }}>
              <strong>Wedding Date:</strong> {weddingDate}
            </p>
          </div>
          <div>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: fontColor }}>
              <strong>Venue:</strong> {venue}
            </p>
          </div>
        </div>
        <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: fontColor + '80' }}>
          Last updated by client on {lastUpdatedDate}
        </p>
      </div>

      {/* Story Section */}
      {(website.howWeMet || website.engagementStory) && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: headerFontFamily,
            fontSize: '1.8rem',
            color: primaryColor,
            marginBottom: '1.5rem',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '0.5rem'
          }}>
            Our Story
          </h2>

          {website.howWeMet && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: primaryColor,
                marginBottom: '0.75rem'
              }}>
                How We Met
              </h3>
              <p style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: primaryColor + '05',
                padding: '1rem',
                borderRadius: '4px',
                lineHeight: '1.8'
              }}>
                {website.howWeMet}
              </p>
            </div>
          )}

          {website.engagementStory && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: primaryColor,
                marginBottom: '0.75rem'
              }}>
                Engagement Story
              </h3>
              <p style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: primaryColor + '05',
                padding: '1rem',
                borderRadius: '4px',
                lineHeight: '1.8'
              }}>
                {website.engagementStory}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Images Section */}
      {images && images.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: headerFontFamily,
            fontSize: '1.8rem',
            color: primaryColor,
            marginBottom: '1.5rem',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '0.5rem'
          }}>
            Photos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {images.map((image) => (
              <div key={image.id} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <img
                  src={image.url}
                  alt={image.category}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: `1px solid ${primaryColor}40`
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.backgroundColor = primaryColor + '20';
                  }}
                />
                <a
                  href={image.url}
                  download
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: primaryColor,
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Design Choices Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{
          fontFamily: headerFontFamily,
          fontSize: '1.8rem',
          color: primaryColor,
          marginBottom: '1.5rem',
          borderBottom: `2px solid ${primaryColor}`,
          paddingBottom: '0.5rem'
        }}>
          Design Choices
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Fonts */}
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '1rem'
            }}>
              Fonts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: fontColor + '80', margin: '0 0 0.5rem 0' }}>Header Font</p>
                <p style={{
                  fontFamily: headerFontFamily,
                  fontSize: '1.5rem',
                  margin: '0',
                  padding: '0.75rem',
                  backgroundColor: primaryColor + '05',
                  borderRadius: '4px'
                }}>
                  {website.headerFont}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: fontColor + '80', margin: '0 0 0.5rem 0' }}>Body Font</p>
                <p style={{
                  fontFamily: bodyFontFamily,
                  fontSize: '1rem',
                  margin: '0',
                  padding: '0.75rem',
                  backgroundColor: primaryColor + '05',
                  borderRadius: '4px'
                }}>
                  {website.bodyFont}
                </p>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '1rem'
            }}>
              Colors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: website.colorPrimary || '#274E13',
                  borderRadius: '4px',
                  border: `1px solid ${fontColor}40`
                }} />
                <div>
                  <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '600' }}>Primary</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: fontColor + '80' }}>
                    {website.colorPrimary}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: website.colorSecondary || '#e1e0d0',
                  borderRadius: '4px',
                  border: `1px solid ${fontColor}40`
                }} />
                <div>
                  <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '600' }}>Secondary</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: fontColor + '80' }}>
                    {website.colorSecondary}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: website.colorAccent || '#FF69B4',
                  borderRadius: '4px',
                  border: `1px solid ${fontColor}40`
                }} />
                <div>
                  <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '600' }}>Accent</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: fontColor + '80' }}>
                    {website.colorAccent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URLs Section */}
      {(website.urlEnding1 || website.urlEnding2) && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: headerFontFamily,
            fontSize: '1.8rem',
            color: primaryColor,
            marginBottom: '1.5rem',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '0.5rem'
          }}>
            Website URLs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {website.urlEnding1 && (
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: fontColor, margin: '0 0 0.5rem 0' }}>
                  URL Option 1
                </p>
                <p style={{
                  padding: '0.75rem',
                  backgroundColor: primaryColor + '05',
                  borderRadius: '4px',
                  margin: '0'
                }}>
                  {website.urlEnding1}
                </p>
              </div>
            )}
            {website.urlEnding2 && (
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: fontColor, margin: '0 0 0.5rem 0' }}>
                  URL Option 2
                </p>
                <p style={{
                  padding: '0.75rem',
                  backgroundColor: primaryColor + '05',
                  borderRadius: '4px',
                  margin: '0'
                }}>
                  {website.urlEnding2}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Registries Section */}
      {website.registries && website.registries.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: headerFontFamily,
            fontSize: '1.8rem',
            color: primaryColor,
            marginBottom: '1.5rem',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '0.5rem'
          }}>
            Registries
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {website.registries.map((registry) => (
              <div key={registry.id} style={{
                padding: '1rem',
                backgroundColor: primaryColor + '05',
                borderLeft: `3px solid ${primaryColor}`,
                borderRadius: '4px'
              }}>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0',
                  color: primaryColor
                }}>
                  {registry.registryName}
                  {registry.isOptional && (
                    <span style={{ fontSize: '0.85rem', fontWeight: '400', color: fontColor + '80' }}>
                      {' '}(Optional)
                    </span>
                  )}
                </p>
                <a
                  href={registry.registryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: primaryColor,
                    textDecoration: 'underline',
                    fontSize: '0.95rem'
                  }}
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
