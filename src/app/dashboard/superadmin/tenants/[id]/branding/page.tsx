'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import DemographicsTab from '@/components/branding/DemographicsTab';
import ColorBrandingTab from '@/components/branding/ColorBrandingTab';
import LogoTab from '@/components/branding/LogoTab';
import BackgroundTab from '@/components/branding/BackgroundTab';
import ExtrasTab from '@/components/branding/ExtrasTab';

interface BrandingData {
  businessName: string;
  brandingCompanyName: string | null;
  brandingTagline: string | null;
  brandingFooterText: string | null;
  brandingPrimaryColor: string | null;
  brandingSecondaryColor: string | null;
  brandingSecondaryColorOpacity: number | null;
  brandingFontColor: string | null;
  brandingFontFamily: string | null;
  brandingHeaderFontFamily: string | null;
  brandingBodyFontFamily: string | null;
  brandingLogoUrl: string | null;
  brandingLogoBackgroundRemoval: boolean | null;
  brandingFaviconUrl: string | null;
  brandingOverlayUrl: string | null;
}

type TabType = 'demographics' | 'colors' | 'logo' | 'background' | 'extras';

export default function TenantBrandingSuitePage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('demographics');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tenantName, setTenantName] = useState('');
  
  const [brandingData, setBrandingData] = useState<BrandingData>({
    businessName: '',
    brandingCompanyName: '',
    brandingTagline: '',
    brandingFooterText: '',
    brandingPrimaryColor: '#274E13',
    brandingSecondaryColor: '#D0CEB5',
    brandingSecondaryColorOpacity: 55,
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
        {/* Header with Back Button */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'white',
              color: SUPERADMIN_PRIMARY,
              border: `2px solid ${SUPERADMIN_PRIMARY}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div>
            <h1 style={{ color: SUPERADMIN_PRIMARY, margin: '0', fontSize: '2rem' }}>🎨 Branding Suite</h1>
            <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>{tenantName}</p>
          </div>
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
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.75rem',
          }}>
            {(['demographics', 'colors', 'logo', 'background', 'extras'] as const).map(tab => (
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
                {tab === 'colors' ? 'Color Branding' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            <ColorBrandingTab
              data={brandingData}
              onChange={setBrandingData}
            />
          )}

          {activeTab === 'logo' && (
            <LogoTab
              data={brandingData}
              onChange={setBrandingData}
              tenantId={tenantId}
            />
          )}

          {activeTab === 'background' && (
            <BackgroundTab
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
      </div>
    </div>
  );
}
