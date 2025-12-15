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
  const [expandedSections, setExpandedSections] = useState({
    commandCenter: false,
    todaysFocus: false,
    upcomingWeddings: false,
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const secondaryColorWithOpacity = hexToRgba(branding.secondaryColor, branding.secondaryColorOpacity);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  const collapsibleStyle = {
    marginBottom: '1rem',
    border: `2px solid ${branding.primaryColor}`,
    borderRadius: '8px',
    overflow: 'hidden',
  };

  const collapsibleHeaderStyle = {
    background: branding.primaryColor,
    color: branding.secondaryColor,
    padding: '1rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
    userSelect: 'none' as const,
  };

  const collapsibleContentStyle = {
    padding: '1rem',
    background: secondaryColorWithOpacity,
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
            This is how your clients and planner workspace will look
          </p>
        </div>

        {/* Preview Content */}
        <div style={{ padding: '2rem' }}>
          {/* Client Dashboard Preview */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>👰 Client Dashboard Preview</h3>
            <div
              style={{
                background: secondaryColorWithOpacity,
                borderRadius: '8px',
                padding: '1.5rem',
                border: `2px solid ${branding.primaryColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ color: branding.primaryColor, margin: 0, fontSize: '1.1rem' }}>
                  Welcome, Sarah to your planning workspace!
                </h2>
                {branding.logoUrl && (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    style={{ 
                      height: '40px',
                      maxWidth: '100px',
                      marginLeft: '1rem',
                      backgroundColor: 'transparent',
                      filter: 'brightness(0) saturate(100%) invert(1) drop-shadow(0 0 0 white)',
                      mixBlendMode: 'lighten',
                      padding: 0,
                      borderRadius: 0,
                      flexShrink: 0
                    }}
                  />
                )}
              </div>
              <p style={{ color: branding.fontColor, fontSize: '0.75rem', margin: '0 0 1rem 0' }}>
                Powered by The Missing Piece Planning
              </p>

              <div
                style={{
                  background: 'white',
                  border: `2px solid ${branding.primaryColor}`,
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <h3 style={{ color: branding.fontColor, marginTop: 0, fontSize: '1rem' }}>
                  Your Big Day: December 15, 2025
                </h3>
                <p style={{ color: branding.fontColor, margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  ✓ Venue Confirmed | ⏳ Vendor Selections Due
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
                  Continue Planning
                </button>
              </div>
            </div>
          </div>

          {/* Planner Dashboard Preview */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>📊 Planner Command Center</h3>
            
            {/* Command Center */}
            <div style={collapsibleStyle}>
              <div 
                style={collapsibleHeaderStyle}
                onClick={() => toggleSection('commandCenter')}
              >
                <span>🚨 Command Center - Urgent Items</span>
                <span style={{ fontSize: '1.2rem' }}>{expandedSections.commandCenter ? '−' : '+'}</span>
              </div>
              {expandedSections.commandCenter && (
                <div style={collapsibleContentStyle}>
                  <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔥</span>
                    <span style={{ color: branding.fontColor }}>Sarah's Wedding - Missing Venue Deposit</span>
                  </div>
                  <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span style={{ color: branding.fontColor }}>Emily's Wedding - 3 Vendors Unconfirmed</span>
                  </div>
                  <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span style={{ color: branding.fontColor }}>Jessica's Wedding - Floral Decisions Overdue (3 days)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Focus */}
            <div style={collapsibleStyle}>
              <div 
                style={collapsibleHeaderStyle}
                onClick={() => toggleSection('todaysFocus')}
              >
                <span>📅 Today's Focus - 6 Tasks</span>
                <span style={{ fontSize: '1.2rem' }}>{expandedSections.todaysFocus ? '−' : '+'}</span>
              </div>
              {expandedSections.todaysFocus && (
                <div style={collapsibleContentStyle}>
                  <div style={{ marginBottom: '0.5rem', color: branding.fontColor, fontSize: '0.9rem' }}>• Call vendor for final headcount (Sarah's)</div>
                  <div style={{ marginBottom: '0.5rem', color: branding.fontColor, fontSize: '0.9rem' }}>• Send seating chart to caterer (Emily's)</div>
                  <div style={{ marginBottom: '0.5rem', color: branding.fontColor, fontSize: '0.9rem' }}>• Confirm transportation times (Jessica's)</div>
                  <div style={{ marginBottom: '0.5rem', color: branding.fontColor, fontSize: '0.9rem' }}>• Final walkthrough schedule (Michael & Lauren)</div>
                </div>
              )}
            </div>

            {/* Upcoming Weddings */}
            <div style={collapsibleStyle}>
              <div 
                style={collapsibleHeaderStyle}
                onClick={() => toggleSection('upcomingWeddings')}
              >
                <span>💍 Upcoming Weddings - Next 30 Days (5)</span>
                <span style={{ fontSize: '1.2rem' }}>{expandedSections.upcomingWeddings ? '−' : '+'}</span>
              </div>
              {expandedSections.upcomingWeddings && (
                <div style={collapsibleContentStyle}>
                  <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${branding.primaryColor}`, color: branding.fontColor }}>
                    <strong>Sarah's Wedding - 8 days</strong><br/>
                    <span style={{ fontSize: '0.85rem' }}>Outstanding: Deposit confirmation, Final headcount</span>
                  </div>
                  <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${branding.primaryColor}`, color: branding.fontColor }}>
                    <strong>Emily's Wedding - 14 days</strong><br/>
                    <span style={{ fontSize: '0.85rem' }}>Outstanding: Seating chart approval, Music selection</span>
                  </div>
                  <div style={{ color: branding.fontColor, fontSize: '0.85rem' }}>
                    <strong>+ 3 more</strong> within 30 days
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clients at a Glance Grid */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>👥 Clients at a Glance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Client Card 1 */}
              <div style={{
                border: `2px solid ${branding.primaryColor}`,
                borderRadius: '8px',
                padding: '1rem',
                background: secondaryColorWithOpacity,
              }}>
                <div style={{ color: branding.primaryColor, fontWeight: 'bold', marginBottom: '0.5rem' }}>Sarah & Michael</div>
                <div style={{ fontSize: '0.85rem', color: branding.fontColor, marginBottom: '0.5rem' }}>📅 Dec 15, 2025</div>
                <div style={{ fontSize: '0.85rem', color: branding.fontColor, marginBottom: '0.5rem' }}>✓ 78% of tasks complete</div>
                <div style={{ fontSize: '0.85rem', color: branding.fontColor, marginBottom: '0.5rem' }}>💰 Under budget by $2,300</div>
                <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold' }}>$5,000 due by Dec 1</div>
              </div>

              {/* Client Card 2 */}
              <div style={{
                border: `2px solid ${branding.primaryColor}`,
                borderRadius: '8px',
                padding: '1rem',
                background: secondaryColorWithOpacity,
              }}>
                <div style={{ color: branding.primaryColor, fontWeight: 'bold', marginBottom: '0.5rem' }}>Emily & David</div>
                <div style={{ fontSize: '0.85rem', color: branding.fontColor, marginBottom: '0.5rem' }}>📅 Jan 22, 2026</div>
                <div style={{ fontSize: '0.85rem', color: branding.fontColor, marginBottom: '0.5rem' }}>⚠️ 42% of tasks (8 days behind)</div>
                <div style={{ fontSize: '0.85rem', color: branding.fontColor, marginBottom: '0.5rem' }}>💰 $1,200 over budget</div>
                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 'bold' }}>$3,750 due by Jan 8</div>
              </div>
            </div>
          </div>

          {/* Notifications Feature */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>💬 Send Encouragement</h3>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: branding.primaryColor,
                color: branding.secondaryColor,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}
            >
              {showNotifications ? '− Hide Options' : '+ Send Message to Client'}
            </button>
            {showNotifications && (
              <div style={{
                background: secondaryColorWithOpacity,
                border: `2px solid ${branding.primaryColor}`,
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ marginBottom: '0.75rem', color: branding.fontColor, fontSize: '0.9rem' }}>
                  <input type="radio" name="message" style={{ marginRight: '0.5rem' }} defaultChecked />
                  <label>"You're doing great! 🎉"</label>
                </div>
                <div style={{ marginBottom: '0.75rem', color: branding.fontColor, fontSize: '0.9rem' }}>
                  <input type="radio" name="message" style={{ marginRight: '0.5rem' }} />
                  <label>"Don't forget to drink water! 💧"</label>
                </div>
                <div style={{ marginBottom: '0.75rem', color: branding.fontColor, fontSize: '0.9rem' }}>
                  <input type="radio" name="message" style={{ marginRight: '0.5rem' }} />
                  <label>"Remember - you can't fill anyone's cup if yours is empty! 💛"</label>
                </div>
                <div style={{ marginBottom: '0.75rem', color: branding.fontColor, fontSize: '0.9rem' }}>
                  <input type="radio" name="message" style={{ marginRight: '0.5rem' }} />
                  <label>"Next step: [Auto-generated based on their timeline]"</label>
                </div>
                <button style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: branding.primaryColor,
                  color: branding.secondaryColor,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                }}>
                  Send Notification
                </button>
              </div>
            )}
          </div>

          {/* Confirmation Section */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: secondaryColorWithOpacity, borderRadius: '8px' }}>
            <p style={{ color: branding.fontColor, margin: 0, fontSize: '0.95rem' }}>
              ✓ This branding will be applied to all your clients&apos; dashboards, your planner workspace, and all communications.
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
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h2 style={{ color: branding.primaryColor, margin: 0, fontSize: '1.1rem' }}>
                    Welcome, {branding.companyName} to your planning workspace!
                  </h2>
                  {branding.logoUrl && (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      style={{ 
                        height: '40px',
                        maxWidth: '100px',
                        marginLeft: '1rem',
                        backgroundColor: 'transparent',
                        filter: 'brightness(0) saturate(100%) invert(1) drop-shadow(0 0 0 white)',
                        mixBlendMode: 'lighten',
                        padding: 0,
                        borderRadius: 0,
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
                <p style={{ color: branding.fontColor, fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
                  Powered by The Missing Piece Planning
                </p>
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

          {/* Tenant Dashboard Preview */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: branding.primaryColor, marginTop: 0 }}>Planner Dashboard Preview</h3>
            <div
              style={{
                background: secondaryColorWithOpacity,
                borderRadius: '8px',
                padding: '1.5rem',
                border: `2px solid ${branding.primaryColor}`,
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h2 style={{ color: branding.primaryColor, margin: 0, fontSize: '1.1rem' }}>
                    Welcome, {branding.companyName} to your planner workspace!
                  </h2>
                  {branding.logoUrl && (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      style={{ 
                        height: '40px',
                        maxWidth: '100px',
                        marginLeft: '1rem',
                        backgroundColor: 'transparent',
                        filter: 'brightness(0) saturate(100%) invert(1) drop-shadow(0 0 0 white)',
                        mixBlendMode: 'lighten',
                        padding: 0,
                        borderRadius: 0,
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
                <p style={{ color: branding.fontColor, fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
                  Powered by The Missing Piece Planning
                </p>
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
                  Your Planning Dashboard
                </h3>
                <p style={{ color: branding.fontColor, margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  👥 Active Clients: 12
                </p>
                <p style={{ color: branding.fontColor, margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  📋 Tasks: 8 pending
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
                  View Clients
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
