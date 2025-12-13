'use client';

import { useState } from 'react';
import styles from './CreateTenantForm.module.css';

interface CreateTenantFormProps {
  onSuccess?: () => void;
}

export default function CreateTenantForm({ onSuccess }: CreateTenantFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    webAddress: '',
    password: '',
    confirmPassword: '',
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

    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      setLoading(false);
      return;
    }

    if (!formData.businessName.trim()) {
      setError('Business name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (!formData.webAddress.trim()) {
      setError('Website address is required');
      setLoading(false);
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Passwords are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/create-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          primary_email: formData.email,
          phone: formData.phone,
          webAddress: formData.webAddress,
          password: formData.password,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create tenant');
        return;
      }

      setSuccess(`✅ Tenant "${data.tenant.businessName}" created successfully! Configure branding on the Edit page.`);
      setFormData({
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        phone: '',
        webAddress: '',
        password: '',
        confirmPassword: '',
      });

      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>➕ Create New Tenant</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g., John"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g., Smith"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g., Elite Weddings"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g., admin@eliteweddings.local"
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., (555) 123-4567"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Website *</label>
            <input
              type="text"
              name="webAddress"
              value={formData.webAddress}
              onChange={handleChange}
              placeholder="e.g., https://eliteweddings.com"
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Admin Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <p style={{ color: '#666', fontSize: '0.9rem', margin: '1rem 0' }}>
          💡 After creating the tenant, you can customize branding and other settings on the Edit page.
        </p>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Creating Tenant...' : 'Create Tenant'}
        </button>
      </form>
    </div>
  );
}
