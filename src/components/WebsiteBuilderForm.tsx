'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface WebsiteBuilderFormProps {
  clientId: string;
  tenantId: string;
  primaryColor: string;
  fontColor: string;
  bodyFontFamily: string;
  headerFontFamily: string;
  onBack: () => void;
}

export default function WebsiteBuilderForm({
  clientId,
  primaryColor,
  fontColor,
  bodyFontFamily,
  headerFontFamily,
  onBack,
}: WebsiteBuilderFormProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'images' | 'design' | 'url' | 'registries'>('story');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    howWeMet: '',
    engagementStory: '',
    fontFamily: 'Poppins',
    colorPrimary: '#274E13',
    colorSecondary: '#e1e0d0',
    colorAccent: '#FF69B4',
    suggestedUrlSlug1: '',
    suggestedUrlSlug2: '',
    registries: [
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
    ]
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegistryChange = (index: number, field: string, value: any) => {
    const newRegistries = [...formData.registries];
    (newRegistries[index] as any)[field] = value;
    setFormData(prev => ({
      ...prev,
      registries: newRegistries
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/client-websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          ...formData
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Website information saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving data' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: bodyFontFamily, color: fontColor }}>
      {/* Header */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          color: primaryColor,
          cursor: 'pointer',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          fontFamily: bodyFontFamily,
          fontWeight: '600'
        }}
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <h1 style={{ color: primaryColor, fontFamily: headerFontFamily, fontSize: '2rem', marginBottom: '0.5rem' }}>
        Build Your Event Website
      </h1>
      <p style={{ color: fontColor, opacity: 0.7, marginBottom: '2rem' }}>
        Share your story and preferences with us
      </p>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          color: message.type === 'success' ? '#2E7D32' : '#C62828',
          border: `1px solid ${message.type === 'success' ? '#4CAF50' : '#F44336'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: `2px solid ${primaryColor}15`,
        overflowX: 'auto'
      }}>
        {(['story', 'images', 'design', 'url', 'registries'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === tab ? primaryColor : 'transparent',
              color: activeTab === tab ? '#ffffff' : primaryColor,
              border: 'none',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
              fontSize: '0.95rem',
              fontWeight: activeTab === tab ? '600' : '400',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'story' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Your Story</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              How We Met
            </label>
            <textarea
              value={formData.howWeMet}
              onChange={(e) => handleInputChange('howWeMet', e.target.value)}
              placeholder="Share how you two met..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Engagement Story
            </label>
            <textarea
              value={formData.engagementStory}
              onChange={(e) => handleInputChange('engagementStory', e.target.value)}
              placeholder="Tell us about the proposal..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'images' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Images</h2>
          <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1rem' }}>
            Upload your engagement ring, couple, and background photos (image upload coming soon)
          </p>
          <div style={{
            padding: '2rem',
            backgroundColor: primaryColor + '10',
            borderRadius: '4px',
            textAlign: 'center',
            color: fontColor,
            opacity: 0.6
          }}>
            Image upload feature coming soon
          </div>
        </div>
      )}

      {activeTab === 'design' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Design Preferences</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Font Family
            </label>
            <select
              value={formData.fontFamily}
              onChange={(e) => handleInputChange('fontFamily', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              <option value="Poppins">Poppins</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {(['colorPrimary', 'colorSecondary', 'colorAccent'] as const).map(color => (
              <div key={color}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  {color === 'colorPrimary' ? 'Primary' : color === 'colorSecondary' ? 'Secondary' : 'Accent'}
                </label>
                <input
                  type="color"
                  value={formData[color]}
                  onChange={(e) => handleInputChange(color, e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={formData[color]}
                  onChange={(e) => handleInputChange(color, e.target.value)}
                  placeholder="#000000"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.5rem',
                    border: `1px solid ${primaryColor}40`,
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'url' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Website URL</h2>
          
          <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1.5rem' }}>
            Your website will be: <strong>https://www.missingpieceplanning.com/events/your-slug</strong>
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              URL Slug Option 1
            </label>
            <input
              type="text"
              value={formData.suggestedUrlSlug1}
              onChange={(e) => handleInputChange('suggestedUrlSlug1', e.target.value)}
              placeholder="your-slug-here (lowercase, hyphens only)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              URL Slug Option 2
            </label>
            <input
              type="text"
              value={formData.suggestedUrlSlug2}
              onChange={(e) => handleInputChange('suggestedUrlSlug2', e.target.value)}
              placeholder="alternative-slug"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'registries' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Registries</h2>
          <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1.5rem' }}>
            Add up to 5 registry links
          </p>

          {formData.registries.map((registry, index) => (
            <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: primaryColor + '05', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: primaryColor }}>Registry {index + 1}</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  Registry Name
                </label>
                <input
                  type="text"
                  value={registry.registryName}
                  onChange={(e) => handleRegistryChange(index, 'registryName', e.target.value)}
                  placeholder="e.g., Williams-Sonoma"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${primaryColor}40`,
                    borderRadius: '4px',
                    fontFamily: bodyFontFamily,
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  Registry URL
                </label>
                <input
                  type="url"
                  value={registry.registryUrl}
                  onChange={(e) => handleRegistryChange(index, 'registryUrl', e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${primaryColor}40`,
                    borderRadius: '4px',
                    fontFamily: bodyFontFamily,
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={registry.isOptional}
                  onChange={(e) => handleRegistryChange(index, 'isOptional', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Mark as optional
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: primaryColor,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: bodyFontFamily,
            fontSize: '1rem',
            fontWeight: '600',
            opacity: saving ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {saving ? 'Saving...' : 'Save Information'}
        </button>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'transparent',
            color: primaryColor,
            border: `2px solid ${primaryColor}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: bodyFontFamily,
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
