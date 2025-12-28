'use client';

import { useState } from 'react';

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

interface TaskFormProps {
  primaryColor: string;
  bodyFontFamily: string;
  clientId?: string;
  tenantId?: string;
  userRole?: 'TENANT' | 'CLIENT';
  meetingNoteId?: string;
  onTaskCreated: (task: Task) => void;
  onCancel: () => void;
}

export default function TaskForm({
  primaryColor,
  bodyFontFamily,
  clientId,
  tenantId,
  userRole = 'TENANT',
  meetingNoteId,
  onTaskCreated,
  onCancel,
}: TaskFormProps) {
  const defaultAssign = userRole === 'CLIENT' ? 'CLIENT_SELF' : 'TENANT_SELF';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    assignTo: defaultAssign,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

    setIsSubmitting(true);
    try {
      let assigneeType: 'TENANT' | 'CLIENT';
      let assigneeId: string;

      if (formData.assignTo === 'TENANT_SELF' || formData.assignTo === 'CLIENT_TO_TENANT') {
        assigneeType = 'TENANT';
        assigneeId = tenantId || '';
      } else {
        assigneeType = 'CLIENT';
        assigneeId = clientId || '';
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
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
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

        {/* Assign To */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="assignTo"
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Assign To
          </label>
          <select
            id="assignTo"
            name="assignTo"
            value={formData.assignTo}
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
            {userRole === 'TENANT' && (
              <>
                <option value="TENANT_SELF">Me (Tenant)</option>
                {clientId && <option value="CLIENT_SELF">My Client</option>}
              </>
            )}
            {userRole === 'CLIENT' && (
              <>
                <option value="CLIENT_SELF">Me (Client)</option>
                {tenantId && <option value="CLIENT_TO_TENANT">My Coordinator (Tenant)</option>}
              </>
            )}
          </select>
        </div>

        {/* Submit & Cancel */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              background: 'transparent',
              color: primaryColor,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
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
              border: 'none',
              background: primaryColor,
              color: '#fff',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
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
