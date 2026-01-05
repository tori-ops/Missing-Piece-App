'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, Upload } from 'lucide-react';

interface WebsiteImage {
  id: string;
  category: string;
  url: string;
  createdAt: string;
}

interface WebsiteBuilderFormProps {
  clientId: string;
  tenantId: string;
  primaryColor: string;
  fontColor: string;
  bodyFontFamily: string;
  headerFontFamily: string;
  onBack: () => void;
}

// Google Fonts for headers (script/fancy)
const HEADER_FONTS = [
  'Great Vibes',
  'Playfair Display',
  'Cormorant Garamond',
  'Prata',
  'Cinzel',
  'Lora',
  'Bodoni Moda',
  'Crimson Text',
  'Montserrat',
  'Dancing Script',
  'Tangerine',
  'Parisienne',
  'Allura',
  'Satisfy',
  'Caveat',
];

// Google Fonts for body (serif/sans-serif)
const BODY_FONTS = [
  'Poppins',
  'Roboto',
  'Lora',
  'Playfair Display',
  'Merriweather',
  'Open Sans',
  'Montserrat',
  'Raleway',
  'Dosis',
  'Quicksand',
  'Nunito',
  'Inter',
  'Crimson Text',
  'EB Garamond',
  'Barlow',
  'Work Sans',
];

// Image categories with suggestions
const IMAGE_CATEGORIES = [
  { id: 'rings', label: 'Rings', description: 'Engagement & wedding rings' },
  { id: 'together', label: 'Fun Together', description: 'Fun photos of you together' },
  { id: 'proposal', label: 'Proposal', description: 'Proposal photos' },
  { id: 'portraits', label: 'Portraits', description: 'Favorite portraits of one another' },
  { id: 'detail', label: 'Detail Shots', description: 'Special details or close-ups' },
  { id: 'other', label: 'Other', description: 'Any other photos you\'d like to share' },
];

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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingImages, setExistingImages] = useState<WebsiteImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    howWeMet: '',
    engagementStory: '',
    headerFont: 'Great Vibes',
    bodyFont: 'Poppins',
    fontColor: '#1a1a1a',
    colorPrimary: '#274E13',
    colorSecondary: '#e1e0d0',
    colorAccent: '#FF69B4',
    urlEnding1: '',
    urlEnding2: '',
    registries: [
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
    ]
  });

  // Load existing images on mount
  useEffect(() => {
    const loadExistingImages = async () => {
      try {
        const response = await fetch(`/api/client-websites?clientId=${clientId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.images) {
            setExistingImages(data.images);
          }
        }
      } catch (error) {
        console.log('No existing images found');
      }
    };
    loadExistingImages();
  }, [clientId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages > 20) {
      setMessage({ 
        type: 'error', 
        text: `Too many images. Maximum 20 total. You have ${existingImages.length} existing + ${newImages.length} new images.` 
      });
      return;
    }
    
    setNewImages(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    try {
      await fetch(`/api/client-websites/images/${imageId}`, { method: 'DELETE' });
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete image' });
    }
  };

  const handleUploadImages = async () => {
    if (newImages.length === 0) return;
    
    setUploading(true);
    try {
      // Upload images to Supabase
      const uploadedImages: WebsiteImage[] = [];
      
      for (const file of newImages) {
        const formDataImage = new FormData();
        formDataImage.append('file', file);
        formDataImage.append('clientId', clientId);
        
        const response = await fetch('/api/client-websites/images', {
          method: 'POST',
          body: formDataImage,
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data.image);
        }
      }
      
      setExistingImages(prev => [...prev, ...uploadedImages]);
      setNewImages([]);
      setMessage({ type: 'success', text: `${uploadedImages.length} images uploaded successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload images' });
    } finally {
      setUploading(false);
    }
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
          <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1.5rem' }}>
            Upload up to 20 photos. You currently have {existingImages.length + newImages.length} images.
          </p>

          {/* Upload Button */}
          <div style={{ marginBottom: '2rem' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || existingImages.length + newImages.length >= 20}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: primaryColor,
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: uploading || existingImages.length + newImages.length >= 20 ? 'not-allowed' : 'pointer',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                fontWeight: '600',
                opacity: uploading || existingImages.length + newImages.length >= 20 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Select Photos'}
            </button>
          </div>

          {/* Image Categories with Suggestions */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: primaryColor, marginBottom: '1rem' }}>Image Suggestions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {IMAGE_CATEGORIES.map(category => (
                <div key={category.id} style={{
                  padding: '1rem',
                  backgroundColor: primaryColor + '10',
                  borderRadius: '4px',
                  border: `1px solid ${primaryColor}30`
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: primaryColor }}>{category.label}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: primaryColor, marginBottom: '1rem' }}>New Images ({newImages.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {newImages.map((file, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="new"
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: `2px solid ${primaryColor}`
                      }}
                    />
                    <button
                      onClick={() => handleRemoveNewImage(index)}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        backgroundColor: '#FF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUploadImages}
                disabled={uploading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: bodyFontFamily,
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Selected Photos'}
              </button>
            </div>
          )}

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h3 style={{ color: primaryColor, marginBottom: '1rem' }}>Your Uploaded Images ({existingImages.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                {existingImages.map((image) => (
                  <div key={image.id} style={{ position: 'relative' }}>
                    <img
                      src={image.url}
                      alt={image.category}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      onClick={() => handleRemoveExistingImage(image.id)}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        backgroundColor: '#FF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'design' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Design Preferences</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Header Font (Script/Fancy)
            </label>
            <select
              value={formData.headerFont}
              onChange={(e) => handleInputChange('headerFont', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: formData.headerFont,
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              {HEADER_FONTS.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Body Font (Serif/Sans Serif)
            </label>
            <select
              value={formData.bodyFont}
              onChange={(e) => handleInputChange('bodyFont', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: formData.bodyFont,
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              {BODY_FONTS.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Font Color (used throughout website)
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="color"
                value={formData.fontColor}
                onChange={(e) => handleInputChange('fontColor', e.target.value)}
                style={{
                  width: '80px',
                  height: '50px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <input
                type="text"
                value={formData.fontColor}
                onChange={(e) => handleInputChange('fontColor', e.target.value)}
                placeholder="#000000"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: `1px solid ${primaryColor}40`,
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
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
            Your website will be: <strong>https://www.missingpieceplanning.com/events/______</strong>
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              URL Ending Option 1
            </label>
            <input
              type="text"
              value={formData.urlEnding1}
              onChange={(e) => handleInputChange('urlEnding1', e.target.value)}
              placeholder="john-and-jane"
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
            {formData.urlEnding1 && (
              <p style={{ fontSize: '0.85rem', color: fontColor, opacity: 0.6, marginTop: '0.5rem' }}>
                Preview: https://www.missingpieceplanning.com/events/{formData.urlEnding1}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              URL Ending Option 2
            </label>
            <input
              type="text"
              value={formData.urlEnding2}
              onChange={(e) => handleInputChange('urlEnding2', e.target.value)}
              placeholder="jane-and-john"
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
            {formData.urlEnding2 && (
              <p style={{ fontSize: '0.85rem', color: fontColor, opacity: 0.6, marginTop: '0.5rem' }}>
                Preview: https://www.missingpieceplanning.com/events/{formData.urlEnding2}
              </p>
            )}
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
