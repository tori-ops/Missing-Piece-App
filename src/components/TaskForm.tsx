'use client';

import { useState, useEffect } from 'react';
import BrandedDatePicker from './BrandedDatePicker';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  assigneeType: 'TENANT' | 'CLIENT';
  assigneeId: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  source: 'MANUAL' | 'MEETING_NOTE';
  meetingNoteId?: string | null;
}

interface ClientProfile {
  id: string;
  couple1FirstName?: string;
  couple1LastName?: string;
}

interface TenantProfile {
  id: string;
  businessName?: string;
}


interface TaskFormProps {
  primaryColor: string;
  secondaryColor: string;
  fontColor: string;
  bodyFontFamily: string;
  headerFontFamily: string;
  clientId?: string;
  tenantId?: string;
  userRole?: 'TENANT' | 'CLIENT';
  meetingNoteId?: string;
  onTaskCreated: (task: Task) => void;
  onCancel: () => void;
  clients?: ClientProfile[];
  tenants?: TenantProfile[];
}

export default function TaskForm({
  primaryColor,
  secondaryColor,
  fontColor,
  bodyFontFamily,
  headerFontFamily,
  clientId,
  tenantId,
  userRole = 'TENANT',
  meetingNoteId,
  onTaskCreated,
  onCancel,
  clients = [],
  tenants = [],
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    assignedToClientId: userRole === 'TENANT' ? '' : (clientId || ''),
    assignedToTenantId: userRole === 'TENANT' ? (tenantId || '') : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadedClients, setLoadedClients] = useState<ClientProfile[]>(clients);
  const [loadedTenants, setLoadedTenants] = useState<TenantProfile[]>(tenants);

  // Load clients and tenants if not provided
  useEffect(() => {
    const loadData = async () => {
      try {
        if (userRole === 'TENANT' && loadedClients.length === 0) {
          const response = await fetch('/api/clients');
          if (response.ok) {
            const data = await response.json();
            setLoadedClients(data);
          }
        }
        if (userRole === 'CLIENT' && loadedTenants.length === 0) {
          const response = await fetch('/api/tenants');
          if (response.ok) {
            const data = await response.json();
            setLoadedTenants(data);
          }
        }
      } catch (err) {
        console.error('Error loading clients/tenants:', err);
      }
    };
    loadData();
  }, [userRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    // Validate that at least one assignment is selected
    if (!formData.assignedToClientId && !formData.assignedToTenantId) {
      setError('Please assign this task to either a client or planner');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build assignment data based on what's selected
      let assigneeType: 'TENANT' | 'CLIENT' = 'TENANT';
      let assigneeId: string = '';

      // Determine primary assignment for backward compatibility
      if (formData.assignedToTenantId) {
        assigneeType = 'TENANT';
        assigneeId = formData.assignedToTenantId;
      } else if (formData.assignedToClientId) {
        assigneeType = 'CLIENT';
        assigneeId = formData.assignedToClientId;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          dueDate: formData.dueDate || null,
          priority: formData.priority,
          assigneeType,
          assigneeId,
          assignedToClientId: formData.assignedToClientId || null,
          assignedToTenantId: formData.assignedToTenantId || null,
          clientId: clientId || null,
          source: meetingNoteId ? 'MEETING_NOTE' : 'MANUAL',
          meetingNoteId: meetingNoteId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      onTaskCreated(newTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '1.5rem',
        fontFamily: bodyFontFamily,
      }}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Title Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="title"
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Task Title <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="description"
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add any additional details (optional)"
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Due Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="dueDate"
            style={{
              display: 'block',
              fontWeight: '600',
              color: fontColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Due Date
          </label>
          <BrandedDatePicker
            selected={formData.dueDate ? new Date(formData.dueDate) : null}
            onChange={(date) => setFormData((prev) => ({ ...prev, dueDate: date ? date.toISOString().split('T')[0] : '' }))}
            placeholderText="Select due date"
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            fontColor={fontColor}
            bodyFontFamily={bodyFontFamily}
          />
        </div>

        {/* Priority */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="priority"
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Assign To Client */}
        {userRole === 'TENANT' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="assignedToClientId"
              style={{
                display: 'block',
                fontWeight: '600',
                color: primaryColor,
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
              }}
            >
              Assign to Client
            </label>
            <select
              id="assignedToClientId"
              name="assignedToClientId"
              value={formData.assignedToClientId}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: `1px solid ${primaryColor}40`,
                fontSize: '0.95rem',
                fontFamily: bodyFontFamily,
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select a client --</option>
              {loadedClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.couple1FirstName && client.couple1LastName
                    ? `${client.couple1FirstName} ${client.couple1LastName}`
                    : `Client ${client.id.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Assign To Tenant/Planner */}
        {userRole === 'CLIENT' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="assignedToTenantId"
              style={{
                display: 'block',
                fontWeight: '600',
                color: primaryColor,
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
              }}
            >
              Assign to Planner
            </label>
            <select
              id="assignedToTenantId"
              name="assignedToTenantId"
              value={formData.assignedToTenantId}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: `1px solid ${primaryColor}40`,
                fontSize: '0.95rem',
                fontFamily: bodyFontFamily,
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select a planner --</option>
              {loadedTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.businessName || `Planner ${tenant.id.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Self-Assignment Option */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              color: fontColor,
              fontSize: '0.95rem',
            }}
          >
            <input
              type="checkbox"
              checked={userRole === 'TENANT' ? !!formData.assignedToTenantId : !!formData.assignedToClientId}
              onChange={(e) => {
                if (userRole === 'TENANT') {
                  setFormData((prev) => ({
                    ...prev,
                    assignedToTenantId: e.target.checked ? (tenantId || '') : '',
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    assignedToClientId: e.target.checked ? (clientId || '') : '',
                  }));
                }
              }}
              style={{
                cursor: 'pointer',
              }}
            />
            {userRole === 'TENANT'
              ? 'Assign to myself (Planner)'
              : 'Assign to myself (Client)'}
          </label>
        </div>

        {/* Submit & Cancel */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: `1px solid ${secondaryColor}`,
              background: '#ffffff',
              color: fontColor,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${secondaryColor}30`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: `1px solid ${secondaryColor}`,
              background: primaryColor,
              color: fontColor,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${secondaryColor}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = primaryColor;
              }
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
