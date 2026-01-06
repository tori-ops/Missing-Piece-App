'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import DemographicsTab from '@/components/branding/DemographicsTab';
import ColorsFontsTab from '@/components/branding/ColorsFontsTab';
import ImagesTab from '@/components/branding/ImagesTab';
import ExtrasTab from '@/components/branding/ExtrasTab';

interface BrandingData {
  businessName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  brandingCompanyName: string | null;
  brandingTagline: string | null;
  brandingFooterText: string | null;
  brandingPrimaryColor: string | null;
  brandingSecondaryColor: string | null;
  brandingSecondaryColorOpacity: number | null;
  brandingOverlayOpacity: number | null;
  brandingAccentColor: string | null;
  brandingFontColor: string | null;
  brandingFontFamily: string | null;
  brandingHeaderFontFamily: string | null;
  brandingBodyFontFamily: string | null;
  brandingLogoUrl: string | null;
  brandingLogoBackgroundRemoval: boolean | null;
  brandingFaviconUrl: string | null;
  brandingOverlayUrl: string | null;
}

type TabType = 'demographics' | 'colors' | 'images' | 'extras';

export default function TenantBrandingSuitePage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('demographics');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tenantName, setTenantName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [brandingData, setBrandingData] = useState<BrandingData>({
    businessName: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    brandingCompanyName: '',
    brandingTagline: '',
    brandingFooterText: '',
    brandingPrimaryColor: '#274E13',
    brandingSecondaryColor: '#D0CEB5',
    brandingSecondaryColorOpacity: 55,
    brandingOverlayOpacity: 60,
    brandingAccentColor: '#FFB6C1',
    brandingFontColor: '#000000',
    brandingFontFamily: 'Poppins',
    brandingHeaderFontFamily: 'Playfair Display',
    brandingBodyFontFamily: 'Poppins',
    brandingLogoUrl: '',
    brandingLogoBackgroundRemoval: false,
    brandingFaviconUrl: '',
    brandingOverlayUrl: '',
  });

  // Fetch tenant branding data on mount
  useEffect(() => {
    const fetchBrandingData = async () => {
      try {
        const response = await fetch(`/api/admin/get-tenant-branding?tenantId=${tenantId}`);
        if (response.ok) {
          const data = await response.json();
          setBrandingData(data);
          setTenantName(data.businessName);
        }
      } catch (error) {
        console.error('Failed to fetch branding data:', error);
        setMessage({ type: 'error', text: 'Failed to load branding data' });
      } finally {
        setLoading(false);
      }
    };

    fetchBrandingData();
  }, [tenantId]);

  // Auto-save whenever brandingData changes
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      if (loading) return; // Don't auto-save while initial load is happening

      setSaving(true);
      try {
        const response = await fetch('/api/admin/update-tenant-branding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            primaryColor: brandingData.brandingPrimaryColor,
            secondaryColor: brandingData.brandingSecondaryColor,
            secondaryColorOpacity: brandingData.brandingSecondaryColorOpacity,
            overlayOpacity: brandingData.brandingOverlayOpacity,
            accentColor: brandingData.brandingAccentColor,
            fontColor: brandingData.brandingFontColor,
            logoUrl: brandingData.brandingLogoUrl,
            logoBackgroundRemoval: brandingData.brandingLogoBackgroundRemoval,
            overlayUrl: brandingData.brandingOverlayUrl,
            companyName: brandingData.brandingCompanyName,
            tagline: brandingData.brandingTagline,
            faviconUrl: brandingData.brandingFaviconUrl,
            footerText: brandingData.brandingFooterText,
            fontFamily: brandingData.brandingFontFamily,
            headerFontFamily: brandingData.brandingHeaderFontFamily,
            bodyFontFamily: brandingData.brandingBodyFontFamily,
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Changes saved' });
          setTimeout(() => setMessage(null), 2000);
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to save' });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        setMessage({ type: 'error', text: 'Failed to save changes' });
      } finally {
        setSaving(false);
      }
    }, 1000); // Wait 1 second after last change before saving

    return () => clearTimeout(saveTimer);
  }, [brandingData, tenantId, loading]);

  // SuperAdmin styling constants
  const SUPERADMIN_PRIMARY = '#274E13';
  const SUPERADMIN_SECONDARY = '#D0CEB5';
  const SUPERADMIN_FONT = '#000000';

  if (loading) {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', background: SUPERADMIN_SECONDARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: SUPERADMIN_PRIMARY, fontSize: '1.2rem' }}>Loading branding suite...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: SUPERADMIN_SECONDARY }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: SUPERADMIN_PRIMARY, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>🎨 Branding Suite</h1>
          <p style={{ color: '#666', margin: '0', fontSize: '0.95rem' }}>{tenantName}</p>
        </div>

        {/* Status Messages */}
        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: message.type === 'success' ? '#274E13' : '#c33',
            border: `1px solid ${message.type === 'success' ? '#81c784' : '#ef5350'}`,
          }}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}{saving && ' (saving...)'}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: `2px solid ${SUPERADMIN_PRIMARY}20`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}>
            {(['demographics', 'colors', 'images', 'extras'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1rem',
                  background: activeTab === tab ? SUPERADMIN_PRIMARY : `${SUPERADMIN_PRIMARY}10`,
                  color: activeTab === tab ? 'white' : SUPERADMIN_PRIMARY,
                  border: `2px solid ${SUPERADMIN_PRIMARY}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    (e.currentTarget as HTMLButtonElement).style.background = SUPERADMIN_PRIMARY;
                    (e.currentTarget as HTMLButtonElement).style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    (e.currentTarget as HTMLButtonElement).style.background = `${SUPERADMIN_PRIMARY}10`;
                    (e.currentTarget as HTMLButtonElement).style.color = SUPERADMIN_PRIMARY;
                  }
                }}
              >
                {tab === 'colors' ? 'Colors & Fonts' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          border: `2px solid ${SUPERADMIN_PRIMARY}20`,
          minHeight: '500px',
        }}>
          {activeTab === 'demographics' && (
            <DemographicsTab
              data={brandingData}
              onChange={setBrandingData}
            />
          )}

          {activeTab === 'colors' && (
            <ColorsFontsTab
              data={brandingData}
              onChange={setBrandingData}
            />
          )}

          {activeTab === 'images' && (
            <ImagesTab
              data={brandingData}
              onChange={setBrandingData}
              tenantId={tenantId}
            />
          )}

          {activeTab === 'extras' && (
            <ExtrasTab
              data={brandingData}
              onChange={setBrandingData}
            />
          )}
        </div>

        {/* Footer with Back and Preview Buttons */}
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <button
            onClick={() => router.push('/dashboard/superadmin')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: SUPERADMIN_PRIMARY,
              border: `2px solid ${SUPERADMIN_PRIMARY}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = SUPERADMIN_PRIMARY;
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'white';
              (e.currentTarget as HTMLButtonElement).style.color = SUPERADMIN_PRIMARY;
            }}
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => setShowPreview(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: SUPERADMIN_PRIMARY,
              color: 'white',
              border: `2px solid ${SUPERADMIN_PRIMARY}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            👁️ Preview Branding
          </button>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
            }}
            onClick={() => setShowPreview(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '2rem',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: SUPERADMIN_PRIMARY,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                }}
              >
                Close
              </button>

              <h2 style={{ color: SUPERADMIN_PRIMARY, marginTop: 0, marginBottom: '2rem', fontSize: '1.8rem' }}>
                Branding Preview
              </h2>

              {/* Preview Background */}
              <div
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '2rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    background: brandingData.brandingSecondaryColor || '#D0CEB5',
                    padding: '3rem 2rem',
                    position: 'relative',
                  }}
                >
                  {brandingData.brandingOverlayUrl && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${brandingData.brandingOverlayUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: (brandingData.brandingSecondaryColorOpacity || 55) / 100 * 0.45,
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Logo */}
                    {brandingData.brandingLogoUrl && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <img
                          src={brandingData.brandingLogoUrl}
                          alt="Logo"
                          style={{
                            maxHeight: '80px',
                            maxWidth: '100%',
                          }}
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h1
                      style={{
                        color: brandingData.brandingFontColor || '#000000',
                        fontFamily: brandingData.brandingHeaderFontFamily || 'Playfair Display',
                        fontSize: '2.5rem',
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      {brandingData.brandingCompanyName || brandingData.businessName}
                    </h1>

                    {/* Tagline */}
                    {brandingData.brandingTagline && (
                      <p
                        style={{
                          color: brandingData.brandingFontColor || '#000000',
                          fontFamily: brandingData.brandingBodyFontFamily || 'Poppins',
                          fontSize: '1.1rem',
                          margin: 0,
                        }}
                      >
                        {brandingData.brandingTagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sample Card */}
                <div
                  style={{
                    padding: '2rem',
                    background: 'white',
                  }}
                >
                  <div
                    style={{
                      padding: '1.5rem',
                      borderLeft: `4px solid ${brandingData.brandingAccentColor || '#FFB6C1'}`,
                      background: (brandingData.brandingAccentColor || '#FFB6C1') + '20',
                      borderRadius: '4px',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h3
                      style={{
                        color: brandingData.brandingPrimaryColor || '#274E13',
                        fontFamily: brandingData.brandingHeaderFontFamily || 'Playfair Display',
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      Sample Card
                    </h3>
                    <p
                      style={{
                        color: brandingData.brandingFontColor || '#000000',
                        fontFamily: brandingData.brandingBodyFontFamily || 'Poppins',
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      This is how your content will look with your selected colors, fonts, and accent color.
                    </p>
                  </div>

                  {/* Color Swatches */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          height: '60px',
                          background: brandingData.brandingPrimaryColor || '#274E13',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>Primary</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>
                        {brandingData.brandingPrimaryColor || '#274E13'}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          background: brandingData.brandingSecondaryColor || '#D0CEB5',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          border: '1px solid #ddd',
                        }}
                      />
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>Secondary</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>
                        {brandingData.brandingSecondaryColor || '#D0CEB5'}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          height: '60px',
                          background: brandingData.brandingAccentColor || '#FFB6C1',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>Accent</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>
                        {brandingData.brandingAccentColor || '#FFB6C1'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
