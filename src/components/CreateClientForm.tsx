'use client';

import { useState } from 'react';
import styles from './CreateClientForm.module.css';

interface CreateClientFormProps {
  tenantId: string;
  onSuccess?: () => void;
}

export default function CreateClientForm({ tenantId, onSuccess }: CreateClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
  const [formData, setFormData] = useState({
    partnerOneFirstName: '',
    partnerOneLastName: '',
    partnerOneEmail: '',
    partnerTwoFirstName: '',
    partnerTwoLastName: '',
    contactPhone: '',
    weddingDate: '',
    weddingLocation: '',
    estimatedGuestCount: '',
    addressLine1: '',
    addressLine2: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    budget: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.partnerOneEmail || !formData.weddingDate) {
      setError('Partner one email and wedding date are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tenant/create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId,
          partnerOneFirstName: formData.partnerOneFirstName,
          partnerOneLastName: formData.partnerOneLastName,
          partnerOneEmail: formData.partnerOneEmail,
          partnerTwoFirstName: formData.partnerTwoFirstName,
          partnerTwoLastName: formData.partnerTwoLastName,
          contactPhone: formData.contactPhone || null,
          weddingDate: formData.weddingDate,
          weddingLocation: formData.weddingLocation || null,
          estimatedGuestCount: formData.estimatedGuestCount ? parseInt(formData.estimatedGuestCount) : null,
          addressLine1: formData.addressLine1 || null,
          addressLine2: formData.addressLine2 || null,
          addressCity: formData.addressCity || null,
          addressState: formData.addressState || null,
          addressZip: formData.addressZip || null,
          budget: formData.budget ? parseInt(formData.budget) * 100 : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create client');
        return;
      }

      setSuccess(`✅ Client created successfully!`);
      setGeneratedCredentials(data.credentials);
      setFormData({
        partnerOneFirstName: '',
        partnerOneLastName: '',
        partnerOneEmail: '',
        partnerTwoFirstName: '',
        partnerTwoLastName: '',
        contactPhone: '',
        weddingDate: '',
        weddingLocation: '',
        estimatedGuestCount: '',
        addressLine1: '',
        addressLine2: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        budget: ''
      });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          // Refresh page to show updated client list
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>➕ Create New Client</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div>
          <div className={styles.success}>{success}</div>
          {generatedCredentials && (
            <div className={styles.credentialsBox}>
              <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#274E13' }}>📧 Login Credentials Generated</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>Share these with your client so they can access their account:</p>
              
              <div className={styles.credentialBlock}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>👤 {generatedCredentials.email}</h4>
                <div style={{ background: '#F9F8F3', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Email:</strong> {generatedCredentials.email}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Temporary Password:</strong> <code style={{ background: '#fff', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>{generatedCredentials.temporaryPassword}</code>
                  </div>
                  <div style={{ color: '#999', fontSize: '0.8rem' }}>They will be prompted to change this password on first login</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Partner One First Name *</label>
            <input
              type="text"
              name="partnerOneFirstName"
              value={formData.partnerOneFirstName}
              onChange={handleChange}
              placeholder="Emma"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Partner One Last Name</label>
            <input
              type="text"
              name="partnerOneLastName"
              value={formData.partnerOneLastName}
              onChange={handleChange}
              placeholder="Smith"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Partner One Email *</label>
          <input
            type="email"
            name="partnerOneEmail"
            value={formData.partnerOneEmail}
            onChange={handleChange}
            placeholder="emma@example.com"
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Partner Two First Name</label>
            <input
              type="text"
              name="partnerTwoFirstName"
              value={formData.partnerTwoFirstName}
              onChange={handleChange}
              placeholder="James"
            />
          </div>

          <div className={styles.field}>
            <label>Partner Two Last Name</label>
            <input
              type="text"
              name="partnerTwoLastName"
              value={formData.partnerTwoLastName}
              onChange={handleChange}
              placeholder="Smith"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Primary Contact Phone</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Wedding Date *</label>
            <input
              type="date"
              name="weddingDate"
              value={formData.weddingDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Wedding Venue / Location</label>
            <input
              type="text"
              name="weddingLocation"
              value={formData.weddingLocation}
              onChange={handleChange}
              placeholder="e.g., The Grand Ballroom, Downtown Hotel"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Estimated Guest Count</label>
            <input
              type="number"
              name="estimatedGuestCount"
              value={formData.estimatedGuestCount}
              onChange={handleChange}
              placeholder="150"
              min="0"
            />
          </div>

          <div className={styles.field}>
            <label>Budget ($)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="50000"
              min="0"
              step="1000"
            />
          </div>
        </div>

        {/* Mailing Address */}
        <fieldset style={{ border: 'none', padding: 0, margin: '1.5rem 0 0 0' }}>
          <legend style={{ fontWeight: '600', color: '#333', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Mailing Address (Optional)</legend>
          
          <div className={styles.field}>
            <label>Street Address</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="123 Main Street"
            />
          </div>

          <div className={styles.field}>
            <label>Apartment / Unit (Optional)</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="Apt 4B"
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
                placeholder="New York"
              />
            </div>

            <div className={styles.field}>
              <label>State</label>
              <input
                type="text"
                name="addressState"
                value={formData.addressState}
                onChange={handleChange}
                placeholder="NY"
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
                placeholder="10001"
              />
            </div>
          </div>
        </fieldset>

        <div className={styles.field}>
          <label>Budget ($)</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="50000"
            min="0"
            step="1000"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Creating Client...' : 'Create Client'}
        </button>
      </form>
    </div>
  );
}
