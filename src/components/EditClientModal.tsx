'use client';

import { useState } from 'react';
import styles from './CreateClientForm.module.css';

interface EditClientModalProps {
  client: any;
  tenantId: string;
  onClose: () => void;
  onSave: (updatedClient: any) => void;
}

export default function EditClientModal({ client, tenantId, onClose, onSave }: EditClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    couple1FirstName: client.couple1FirstName || '',
    couple1LastName: client.couple1LastName || '',
    couple2FirstName: client.couple2FirstName || '',
    couple2LastName: client.couple2LastName || '',
    weddingDate: client.weddingDate ? new Date(client.weddingDate).toISOString().split('T')[0] : '',
    budget: client.overallBudgetCents ? (client.overallBudgetCents / 100).toString() : '',
    status: client.status || 'ACTIVE'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          budget: formData.budget ? parseInt(formData.budget) * 100 : null,
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
              <input
                type="date"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

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
