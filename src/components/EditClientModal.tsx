'use client';

import { useState, useRef } from 'react';
import styles from './CreateClientForm.module.css';
import BrandedDatePicker from './BrandedDatePicker';

interface EditClientModalProps {
  client: any;
  tenantId: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  onClose: () => void;
  onSave: (updatedClient: any) => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
}

interface PlaceDetails {
  name: string;
  address: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
}

export default function EditClientModal({ 
  client, 
  tenantId,
  primaryColor = '#274E13',
  secondaryColor = '#e1e0d0',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  onClose, 
  onSave 
}: EditClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [venueSearchLoading, setVenueSearchLoading] = useState(false);
  const [venueSuggestions, setVenueSuggestions] = useState<PlacePrediction[]>([]);
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    couple1FirstName: client.couple1FirstName || '',
    couple1LastName: client.couple1LastName || '',
    couple2FirstName: client.couple2FirstName || '',
    couple2LastName: client.couple2LastName || '',
    weddingDate: client.weddingDate ? new Date(client.weddingDate).toISOString().split('T')[0] : '',
    weddingLocation: client.weddingLocation || '',

    budgetCents: client.budgetCents ? (client.budgetCents / 100).toString() : '',
    estimatedGuestCount: client.estimatedGuestCount ? client.estimatedGuestCount.toString() : '',
    contactEmail: client.contactEmail || '',
    contactPhone: client.contactPhone || '',
    addressLine1: client.addressLine1 || '',
    addressLine2: client.addressLine2 || '',
    addressCity: client.addressCity || '',
    addressState: client.addressState || '',
    addressZip: client.addressZip || '',
    venuePhone: client.venuePhone || '',
    venueWebsite: client.venueWebsite || '',
    venueLat: client.venueLat ? client.venueLat.toString() : '',
    venueLng: client.venueLng ? client.venueLng.toString() : '',
    status: client.status || 'ACTIVE'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If typing in weddingLocation, trigger autocomplete search
    if (name === 'weddingLocation') {
      setShowVenueDropdown(true);
      
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Only search if input is 2+ characters
      if (value.length >= 2) {
        setVenueSearchLoading(true);
        debounceTimer.current = setTimeout(async () => {
          try {
            const response = await fetch(
              `/api/places/autocomplete?input=${encodeURIComponent(value)}`
            );
            const data = await response.json();
            setVenueSuggestions(data.predictions || []);
          } catch (err) {
            console.error('Autocomplete search failed:', err);
            setVenueSuggestions([]);
          } finally {
            setVenueSearchLoading(false);
          }
        }, 300); // Debounce 300ms
      } else {
        setVenueSuggestions([]);
      }
    }
  };

  const handleVenueSelect = async (prediction: PlacePrediction) => {
    try {
      setVenueSearchLoading(true);
      console.log('Fetching venue details for:', prediction.place_id);
      const response = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(prediction.place_id)}`
      );
      const details: PlaceDetails = await response.json();
      
      console.log('Venue details received:', details);

      // Auto-fill venue and address information
      setFormData(prev => ({
        ...prev,
        weddingLocation: details.name,
        addressLine1: details.addressLine1,
        addressCity: details.city,
        addressState: details.state,
        addressZip: details.zip,
        venuePhone: details.phone || '',
        venueWebsite: details.website || '',
        venueLat: details.lat.toString(),
        venueLng: details.lng.toString()
      }));

      setShowVenueDropdown(false);
      setVenueSuggestions([]);
    } catch (err) {
      console.error('Failed to get venue details:', err);
      setError('Failed to load venue details');
    } finally {
      setVenueSearchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/tenant/edit-client`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: client.id,
          tenantId,
          couple1FirstName: formData.couple1FirstName,
          couple1LastName: formData.couple1LastName,
          couple2FirstName: formData.couple2FirstName,
          couple2LastName: formData.couple2LastName,
          weddingDate: formData.weddingDate,
          weddingLocation: formData.weddingLocation,
          budgetCents: formData.budgetCents ? parseFloat(formData.budgetCents) * 100 : null,
          estimatedGuestCount: formData.estimatedGuestCount ? parseInt(formData.estimatedGuestCount) : null,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          addressCity: formData.addressCity,
          addressState: formData.addressState,
          addressZip: formData.addressZip,
          venuePhone: formData.venuePhone,
          venueWebsite: formData.venueWebsite,
          venueLat: formData.venueLat ? parseFloat(formData.venueLat) : null,
          venueLng: formData.venueLng ? parseFloat(formData.venueLng) : null,
          status: formData.status
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update client');
        return;
      }

      onSave(data.clientProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#274E13' }}>✎ Edit Client Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ✕
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Partner One First Name *</label>
              <input
                type="text"
                name="couple1FirstName"
                value={formData.couple1FirstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Partner One Last Name</label>
              <input
                type="text"
                name="couple1LastName"
                value={formData.couple1LastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Partner Two First Name</label>
              <input
                type="text"
                name="couple2FirstName"
                value={formData.couple2FirstName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>Partner Two Last Name</label>
              <input
                type="text"
                name="couple2LastName"
                value={formData.couple2LastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Wedding Date *</label>
              <BrandedDatePicker
                selected={formData.weddingDate ? new Date(formData.weddingDate) : null}
                onChange={(date) => setFormData((prev) => ({ ...prev, weddingDate: date ? date.toISOString().split('T')[0] : '' }))}
                placeholderText="Select wedding date"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                fontColor={fontColor}
                bodyFontFamily={bodyFontFamily}
              />
            </div>

          </div>

          <div className={styles.row}>
            <div className={styles.field} style={{ position: 'relative' }}>
              <label>Wedding Venue / Location</label>
              <input
                type="text"
                name="weddingLocation"
                value={formData.weddingLocation}
                onChange={handleChange}
                placeholder="Type venue name (e.g., Castle Farms)..."
                autoComplete="off"
              />
              {venueSearchLoading && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '38px',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  Searching...
                </div>
              )}
              {showVenueDropdown && venueSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #DDD',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1001,
                  marginTop: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {venueSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.place_id}
                      onClick={() => handleVenueSelect(suggestion)}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #EEE',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        fontSize: '0.95rem'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = '#F5F5F5';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'white';
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#274E13' }}>
                        {suggestion.main_text}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '4px' }}>
                        {suggestion.description.replace(suggestion.main_text, '').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Budget ($)</label>
              <input
                type="number"
                name="budgetCents"
                value={formData.budgetCents}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className={styles.field}>
              <label>Estimated Guest Count</label>
              <input
                type="number"
                name="estimatedGuestCount"
                value={formData.estimatedGuestCount}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #EEE' }} />

          <h3 style={{ color: '#274E13', marginBottom: '1rem', fontSize: '1rem' }}>Contact Information</h3>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Primary Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #EEE' }} />

          <h3 style={{ color: '#274E13', marginBottom: '1rem', fontSize: '1rem' }}>Mailing Address</h3>

          <div className={styles.field}>
            <label>Street Address</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label>Apartment / Suite</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>City</label>
              <input
                type="text"
                name="addressCity"
                value={formData.addressCity}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>State</label>
              <input
                type="text"
                name="addressState"
                value={formData.addressState}
                onChange={handleChange}
                maxLength={2}
              />
            </div>

            <div className={styles.field}>
              <label>ZIP Code</label>
              <input
                type="text"
                name="addressZip"
                value={formData.addressZip}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #EEE' }} />

          <h3 style={{ color: '#274E13', marginBottom: '1rem', fontSize: '1rem' }}>Venue Details</h3>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Venue Phone</label>
              <input
                type="tel"
                name="venuePhone"
                value={formData.venuePhone}
                onChange={handleChange}
                placeholder="Venue contact number"
              />
            </div>

            <div className={styles.field}>
              <label>Venue Website</label>
              <input
                type="url"
                name="venueWebsite"
                value={formData.venueWebsite}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#F9F9F9', borderRadius: '4px' }}>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Latitude</label>
              <div style={{ fontSize: '0.95rem', color: '#333', fontWeight: '500' }}>
                {formData.venueLat ? parseFloat(formData.venueLat).toFixed(4) : 'Not set'}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: '#F9F9F9', borderRadius: '4px' }}>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Longitude</label>
              <div style={{ fontSize: '0.95rem', color: '#333', fontWeight: '500' }}>
                {formData.venueLng ? parseFloat(formData.venueLng).toFixed(4) : 'Not set'}
              </div>
            </div>
          </div>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #EEE' }} />

          <div className={styles.field}>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #DDD',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #DDD',
                background: 'white',
                color: '#333',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '4px',
                border: 'none',
                background: '#274E13',
                color: 'white',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
