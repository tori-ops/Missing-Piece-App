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
          maxWidth: '800px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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

        <div style={{ padding: '2rem', background: secondaryColorWithOpacity, borderBottom: `3px solid ${branding.primaryColor}` }}>
          <h2 style={{ color: branding.primaryColor, margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
            🎨 Brand Preview
          </h2>
          <p style={{ color: branding.fontColor, margin: 0, fontSize: '0.95rem' }}>
            This is how your clients and planner workspace will look
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>👰 Client Dashboard Preview</h3>
          <div style={{ background: secondaryColorWithOpacity, borderRadius: '8px', padding: '1.5rem', border: `2px solid ${branding.primaryColor}` }}>
            <h2 style={{ color: branding.primaryColor, margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Welcome, Sarah!</h2>
            <p style={{ color: branding.fontColor, fontSize: '0.75rem', margin: '0 0 1rem 0' }}>
              Powered by The Missing Piece Planning
            </p>
            <div style={{ background: 'white', border: `2px solid ${branding.primaryColor}`, borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ color: branding.fontColor, marginTop: 0, fontSize: '1rem' }}>Your Big Day: December 15, 2025</h3>
              <p style={{ color: branding.fontColor, margin: '0.5rem 0', fontSize: '0.9rem' }}>✓ Venue Confirmed | ⏳ Vendor Selections Due</p>
              <button style={{ background: branding.primaryColor, color: branding.secondaryColor, padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Continue Planning
              </button>
            </div>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>📊 Planner Dashboard</h3>
            <div style={{ background: secondaryColorWithOpacity, borderRadius: '8px', padding: '1.5rem', border: `2px solid ${branding.primaryColor}` }}>
              <h2 style={{ color: branding.primaryColor, margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Welcome to your planner workspace!</h2>
              <div style={{ background: 'white', border: `2px solid ${branding.primaryColor}`, borderRadius: '8px', padding: '1rem' }}>
                <h3 style={{ color: branding.fontColor, marginTop: 0, fontSize: '1rem' }}>Your Planning Dashboard</h3>
                <p style={{ color: branding.fontColor, margin: '0.5rem 0' }}>👥 Active Clients: 12</p>
                <p style={{ color: branding.fontColor, margin: '0.5rem 0' }}>📋 Tasks: 8 pending | 3 overdue</p>
                <button style={{ background: branding.primaryColor, color: branding.secondaryColor, padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  View Dashboard
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: secondaryColorWithOpacity, borderRadius: '8px' }}>
            <p style={{ color: branding.fontColor, margin: 0 }}>✓ This branding will be applied to all your clients' dashboards and workspace.</p>
            {confirming && <p style={{ color: branding.primaryColor, margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>🔄 Applying changes...</p>}
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={confirming} style={{ padding: '0.75rem 1.5rem', background: 'white', color: branding.primaryColor, border: `2px solid ${branding.primaryColor}`, borderRadius: '4px', cursor: 'pointer' }}>
            Back
          </button>
          <button onClick={handleConfirm} disabled={confirming} style={{ padding: '0.75rem 1.5rem', background: branding.primaryColor, color: branding.secondaryColor, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {confirming ? '✓ Applying...' : '✓ Looks Great!'}
          </button>
        </div>
      </div>
    </div>
  );
}
