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
  logoUrl?: string | null;
  companyName?: string;
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
  logoUrl,
  companyName,
  onBack,
}: WebsiteBuilderFormProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'images' | 'design' | 'hero' | 'url' | 'registries' | 'misc'>('story');
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
    heroImageDescription: '',
    letPlannerDecideHero: false,
    allowTenantEdits: false,
    miscNotes: '',
    registries: [
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
      { registryName: '', registryUrl: '', isOptional: false },
    ]
  });

  // Load existing data on mount and restore from localStorage
  useEffect(() => {
    const loadExistingData = async () => {
      // First check localStorage for unsaved draft data
      const draftKey = `website-form-draft-${clientId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setFormData(draft);
          // Don't return here - still need to fetch images from database
        } catch (error) {
          console.log('Could not parse saved draft');
        }
      } else {
        // If no draft, load form data from server
        try {
          const response = await fetch(`/api/client-websites?clientId=${clientId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.website) {
              setFormData(prev => ({
                ...prev,
                howWeMet: data.website.howWeMet || '',
                engagementStory: data.website.engagementStory || '',
                headerFont: data.website.headerFont || 'Great Vibes',
                bodyFont: data.website.bodyFont || 'Poppins',
                fontColor: data.website.fontColor || '#1a1a1a',
                colorPrimary: data.website.colorPrimary || '#274E13',
                colorSecondary: data.website.colorSecondary || '#e1e0d0',
                colorAccent: data.website.colorAccent || '#FF69B4',
                urlEnding1: data.website.urlEnding1 || '',
                urlEnding2: data.website.urlEnding2 || '',
                registries: data.website.registries || formData.registries,
                allowTenantEdits: data.website.allowTenantEdits || false
              }));
            }
          }
        } catch (error) {
          console.log('No existing website data found');
        }
      }

      // Always fetch images from database (separate from draft logic)
      try {
        const response = await fetch(`/api/client-websites?clientId=${clientId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.images) {
            setExistingImages(data.images);
            console.log('Loaded images from database:', data.images.length);
          }
        }
      } catch (error) {
        console.log('Failed to fetch images:', error);
      }
    };
    loadExistingData();
  }, [clientId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Save draft to localStorage on every change
    const draftKey = `website-form-draft-${clientId}`;
    localStorage.setItem(draftKey, JSON.stringify({
      ...formData,
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
      const response = await fetch(`/api/client-websites/images?id=${imageId}`, { method: 'DELETE' });
      if (response.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setMessage({ type: 'success', text: 'Image deleted successfully' });
        setTimeout(() => setMessage(null), 2000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete image' });
      }
    } catch (error) {
      console.error('Delete error:', error);
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
        
        console.log(`Uploading image: ${file.name} (${file.size} bytes)`);
        
        const response = await fetch('/api/client-websites/images', {
          method: 'POST',
          body: formDataImage,
        });

        console.log(`Upload response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Full response:', data);
          console.log('Image object:', data.image);
          
          if (data.image) {
            uploadedImages.push(data.image);
            console.log(`Successfully added image. Total uploaded: ${uploadedImages.length}`);
          } else {
            console.warn('Response ok but no image object in response:', data);
          }
        } else {
          const error = await response.json();
          console.error('Upload error response:', error);
          setMessage({ type: 'error', text: `Upload failed: ${error.error || 'Unknown error'}` });
        }
      }
      
      console.log(`Final uploadedImages count: ${uploadedImages.length}`);
      setExistingImages(prev => [...prev, ...uploadedImages]);
      setNewImages([]);
      
      if (uploadedImages.length > 0) {
        setMessage({ type: 'success', text: `${uploadedImages.length} image(s) uploaded successfully!` });
      } else {
        setMessage({ type: 'error', text: 'No images were uploaded. Check browser console for details.' });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setUploading(false);
    }
  };

  // Ensure we have at least 5 registries
  const registriesWithDefaults = formData.registries && formData.registries.length >= 5 
    ? formData.registries 
    : Array.from({ length: 5 }, (_, i) => formData.registries?.[i] || { registryName: '', registryUrl: '', isOptional: false });

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
      const payload = {
        clientId,
        ...formData
      };
      
      console.log('Saving website data:', payload);
      
      const response = await fetch('/api/client-websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response status:', response.status, 'Data:', data);

      if (response.ok) {
        // Clear localStorage draft on successful save
        const draftKey = `website-form-draft-${clientId}`;
        localStorage.removeItem(draftKey);
        
        // Re-fetch images from database to confirm persistence
        try {
          const imagesResponse = await fetch(`/api/client-websites?clientId=${clientId}`);
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            if (imagesData.images) {
              setExistingImages(imagesData.images);
              console.log('Images refreshed after save:', imagesData.images.length);
            }
          }
        } catch (error) {
          console.error('Failed to refresh images after save:', error);
        }
        
        setMessage({ type: 'success', text: 'Website information saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || `Failed to save (${response.status})` });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: `Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: bodyFontFamily, color: fontColor }}>
      {/* Header - Title & Tagline Only */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${primaryColor}20`,
      }}>
        <h1 style={{ 
          color: primaryColor,
          fontFamily: headerFontFamily,
          fontSize: '2.5rem',
          margin: '0 0 0.5rem 0',
        }}>
          Web Design Suite
        </h1>
        <p style={{ 
          color: fontColor,
          opacity: 0.7,
          margin: 0,
          fontSize: '0.95rem',
          fontStyle: 'italic',
        }}>
          Your love story, told your way.
        </p>
      </div>

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

      {/* Tabs - Two centered rows */}
      <div style={{
        marginBottom: '2rem',
        borderBottom: `2px solid ${primaryColor}15`,
        paddingBottom: '0.5rem'
      }}>
        {/* Row 1: Story, Images, Design, Hero */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          justifyContent: 'center'
        }}>
          {(['story', 'images', 'design', 'hero'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === tab ? primaryColor : 'transparent',
                color: activeTab === tab ? '#ffffff' : primaryColor,
                border: 'none',
                cursor: 'pointer',
                fontFamily: bodyFontFamily,
                fontSize: '0.85rem',
                fontWeight: activeTab === tab ? '600' : '400',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Row 2: URL, Registries, Miscellaneous */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          {(['url', 'registries', 'misc'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === tab ? primaryColor : 'transparent',
                color: activeTab === tab ? '#ffffff' : primaryColor,
                border: 'none',
                cursor: 'pointer',
                fontFamily: bodyFontFamily,
                fontSize: '0.85rem',
                fontWeight: activeTab === tab ? '600' : '400',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab === 'misc' ? 'Miscellaneous' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'story' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '2rem' }}>Your Story</h2>
          
          {/* Lined Paper Journal Container */}
          <div style={{
            position: 'relative',
            backgroundColor: '#faf8f3',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 32px,
              ${primaryColor}15 32px,
              ${primaryColor}15 33px
            )`,
            backgroundPosition: '0 0',
            backgroundSize: '100% 33px'
          }}>
            <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
              <textarea
                value={formData.howWeMet}
                onChange={(e) => handleInputChange('howWeMet', e.target.value)}
                placeholder="How We Met"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '0 0 0 0',
                  border: 'none',
                  borderRadius: '0px',
                  fontFamily: bodyFontFamily,
                  fontSize: '1rem',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  lineHeight: '33px',
                  color: formData.howWeMet ? fontColor : primaryColor + '60',
                  outline: 'none',
                  resize: 'vertical',
                  fontStyle: formData.howWeMet ? 'normal' : 'italic'
                }}
              />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <textarea
                value={formData.engagementStory}
                onChange={(e) => handleInputChange('engagementStory', e.target.value)}
                placeholder="Engagement Story"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '0 0 0 0',
                  border: 'none',
                  borderRadius: '0px',
                  fontFamily: bodyFontFamily,
                  fontSize: '1rem',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  lineHeight: '33px',
                  color: formData.engagementStory ? fontColor : primaryColor + '60',
                  outline: 'none',
                  resize: 'vertical',
                  fontStyle: formData.engagementStory ? 'normal' : 'italic'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'images' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Images</h2>
          <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1.5rem' }}>
            Upload up to 20 photos. You currently have {existingImages.length + newImages.length} images.
          </p>

          {/* Existing Images - Show FIRST as reference */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: primaryColor, marginBottom: '1rem' }}>Already Uploaded ({existingImages.length})</h3>
              <p style={{ color: fontColor, opacity: 0.6, fontSize: '0.9rem', marginBottom: '1rem' }}>These are the photos you've already sent:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {existingImages.map((image) => (
                  <div key={image.id} style={{ position: 'relative' }}>
                    <img
                      src={image.url}
                      alt={image.category}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: `2px solid ${primaryColor}`
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
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  padding: '0.75rem',
                  backgroundColor: primaryColor + '10',
                  borderRadius: '4px',
                  border: `1px solid ${primaryColor}30`
                }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: primaryColor, fontSize: '0.95rem' }}>{category.label}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{category.description}</p>
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

      {activeTab === 'hero' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '1rem' }}>Hero Images</h2>
          <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1.5rem' }}>
            Select or upload header and background images for your website, or let your planner choose for you.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: primaryColor, fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>Header Image</h3>
            <div style={{
              padding: '2rem',
              border: `2px dashed ${primaryColor}40`,
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: primaryColor + '05',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1rem'
            }}>
              <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1rem' }}>
                Click to upload or drag and drop a header image
              </p>
              <p style={{ fontSize: '0.85rem', color: fontColor, opacity: 0.6 }}>
                Recommended: 1200x400px or wider
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: primaryColor, fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>Background Image</h3>
            <div style={{
              padding: '2rem',
              border: `2px dashed ${primaryColor}40`,
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: primaryColor + '05',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1rem'
            }}>
              <p style={{ color: fontColor, opacity: 0.7, marginBottom: '1rem' }}>
                Click to upload or drag and drop a background image
              </p>
              <p style={{ fontSize: '0.85rem', color: fontColor, opacity: 0.6 }}>
                Recommended: 1920x1080px
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Describe Your Ideal Images (Optional)
            </label>
            <textarea
              value={formData.heroImageDescription}
              onChange={(e) => handleInputChange('heroImageDescription', e.target.value)}
              placeholder="e.g., outdoor garden setting, romantic sunset, minimalist aesthetic, etc."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}40`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
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

          {registriesWithDefaults.map((registry, index) => (
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

      {activeTab === 'misc' && (
        <div>
          <h2 style={{ color: primaryColor, fontSize: '1.5rem', marginBottom: '2rem' }}>Miscellaneous</h2>
          
          {/* Lined Paper Journal Container */}
          <div style={{
            position: 'relative',
            backgroundColor: '#faf8f3',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 32px,
              ${primaryColor}15 32px,
              ${primaryColor}15 33px
            )`,
            backgroundPosition: '0 0',
            backgroundSize: '100% 33px'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <textarea
                value={formData.miscNotes}
                onChange={(e) => handleInputChange('miscNotes', e.target.value)}
                placeholder="Odds and ends, special requests, or anything else you'd like us to know"
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '0 0 0 0',
                  border: 'none',
                  borderRadius: '0px',
                  fontFamily: bodyFontFamily,
                  fontSize: '1rem',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  lineHeight: '33px',
                  color: formData.miscNotes ? fontColor : primaryColor + '60',
                  outline: 'none',
                  resize: 'vertical',
                  fontStyle: formData.miscNotes ? 'normal' : 'italic'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: primaryColor,
            color: '#ffffff',
            border: `1px solid ${primaryColor}`,
            borderRadius: '6px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: bodyFontFamily,
            fontSize: '0.95rem',
            fontWeight: '600',
            opacity: saving ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${primaryColor}30`;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          {saving ? 'Saving...' : 'Save Information'}
        </button>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 1.5rem',
            background: `${primaryColor}20`,
            color: primaryColor,
            border: `1px solid ${primaryColor}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: bodyFontFamily,
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
            (e.currentTarget as HTMLButtonElement).style.color = 'white';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}20`;
            (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
          }}
        >
          Back
        </button>
      </div>

      {/* Business Name & Logo - Centered at Bottom */}
      {(logoUrl || companyName) && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '3rem'
        }}>
          {companyName && (
            <div style={{
              fontSize: '0.75rem',
              color: fontColor,
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: 1.3,
              maxWidth: '200px',
            }}>
              {companyName}
            </div>
          )}
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{
                height: '4rem',
                width: 'auto',
                maxWidth: '200px',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
