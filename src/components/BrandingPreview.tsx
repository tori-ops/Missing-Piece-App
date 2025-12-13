'use client';

import { useState } from 'react';
import { hexToRgba } from '@/lib/branding';

interface BrandingPreviewProps {
  branding: {
    primaryColor: string;
    secondaryColor: string;
    secondaryColorOpacity: number;
    fontColor: string;
    logoUrl: string | null;
    logoBackgroundRemoval: boolean;
    companyName: string;
    tagline: string | null;
    headerFontFamily?: string;
    bodyFontFamily?: string;
  };
  onClose: () => void;
  onConfirm: () => void;
}

export default function BrandingPreview({ branding, onClose, onConfirm }: BrandingPreviewProps) {
  const [confirming, setConfirming] = useState(false);
  const secondaryColorWithOpacity = hexToRgba(branding.secondaryColor, branding.secondaryColorOpacity);

  const handleConfirm = async () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#999',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ padding: '2rem', background: secondaryColorWithOpacity, borderBottom: `3px solid ${branding.primaryColor}` }}>
          <h2 style={{ color: branding.primaryColor, margin: '0 0 1rem 0', fontSize: '1.5rem', fontFamily: branding.headerFontFamily || 'inherit' }}>
            🎨 Brand Preview
          </h2>
          <p style={{ color: branding.fontColor, margin: 0, fontSize: '0.95rem', fontFamily: branding.bodyFontFamily || 'inherit' }}>
            This is how your clients will see your brand
          </p>
        </div>

        {/* Preview Content */}
        <div style={{ padding: '2rem' }}>
          {/* Logo & Company Name Preview */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0, fontFamily: branding.headerFontFamily || 'inherit' }}>Company Identity</h3>
            {branding.logoUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <img
                  src={branding.logoUrl}
                  alt="Logo preview"
                  style={{
                    maxHeight: '60px',
                    maxWidth: '100%',
                    marginBottom: '0.5rem',
                    backgroundColor: 'transparent',
                    filter: 'brightness(0) saturate(100%) invert(1) drop-shadow(0 0 0 white)',
                    mixBlendMode: 'lighten',
                  }}
                />
              </div>
            )}
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: branding.primaryColor, margin: '0 0 0.5rem 0', fontFamily: branding.headerFontFamily || 'inherit' }}>
              {branding.companyName}
            </p>
            {branding.tagline && (
              <p style={{ color: '#666', margin: 0, fontSize: '0.95rem', fontFamily: branding.bodyFontFamily || 'inherit' }}>
                {branding.tagline}
              </p>
            )}
          </div>

          {/* Color Palette Preview */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0, fontFamily: branding.headerFontFamily || 'inherit' }}>Color Scheme</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {/* Primary Color */}
              <div>
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    background: branding.primaryColor,
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    border: '2px solid #ddd',
                  }}
                />
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#333' }}>Primary Color</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{branding.primaryColor}</p>
              </div>

              {/* Secondary Color */}
              <div>
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    background: branding.secondaryColor,
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    border: '2px solid #ddd',
                  }}
                />
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#333' }}>Secondary Color</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{branding.secondaryColor}</p>
              </div>

              {/* Font Color */}
              <div>
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    background: branding.fontColor,
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    border: '2px solid #ddd',
                  }}
                />
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#333' }}>Font Color</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{branding.fontColor}</p>
              </div>
            </div>
          </div>

          {/* Client Dashboard Preview */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>Client Dashboard Preview</h3>
            <div
              style={{
                background: secondaryColorWithOpacity,
                borderRadius: '8px',
                padding: '1.5rem',
                border: `2px solid ${branding.primaryColor}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  {branding.logoUrl && (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      style={{ 
                        height: '30px', 
                        marginBottom: '0.5rem',
                        backgroundColor: 'transparent',
                        filter: 'brightness(0) saturate(100%) invert(1) drop-shadow(0 0 0 white)',
                        mixBlendMode: 'lighten',
                        padding: 0,
                        borderRadius: 0
                      }}
                    />
                  )}
                  <h2 style={{ color: branding.primaryColor, margin: 0, fontSize: '1.1rem' }}>
                    💍 My Wedding Planning Workspace
                  </h2>
                  <p style={{ color: branding.fontColor, fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
                    Powered by {branding.companyName}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: 'white',
                  border: `2px solid ${branding.primaryColor}`,
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <h3 style={{ color: branding.fontColor, marginTop: 0, fontSize: '1rem' }}>
                  Welcome, Sarah!
                </h3>
                <p style={{ color: branding.fontColor, margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  📅 Your Big Day: December 15, 2025
                </p>
                <button style={{
                  background: branding.primaryColor,
                  color: branding.secondaryColor,
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginTop: '1rem',
                  cursor: 'pointer',
                }}>
                  Start Planning
                </button>
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: secondaryColorWithOpacity, borderRadius: '8px' }}>
            <p style={{ color: branding.fontColor, margin: 0, fontSize: '0.95rem' }}>
              ✓ This branding will be applied to all your clients&apos; dashboards and login pages.
            </p>
            {confirming && (
              <p style={{ color: branding.primaryColor, margin: '0.5rem 0 0 0', fontWeight: 'bold', fontSize: '0.9rem' }}>
                🔄 Applying changes and reloading...
              </p>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={confirming}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: branding.primaryColor,
              border: `2px solid ${branding.primaryColor}`,
              borderRadius: '4px',
              cursor: confirming ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: confirming ? 0.5 : 1,
            }}
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            style={{
              padding: '0.75rem 1.5rem',
              background: branding.primaryColor,
              color: branding.secondaryColor,
              border: 'none',
              borderRadius: '4px',
              cursor: confirming ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: confirming ? 0.7 : 1,
            }}
          >
            {confirming ? '✓ Applying...' : '✓ Looks Great!'}
          </button>
        </div>
      </div>
    </div>
  );
}
