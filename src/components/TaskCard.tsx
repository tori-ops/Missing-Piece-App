'use client';

import { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

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
  creatorName?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  assignedToClientId?: string;
  assignedToTenantId?: string;
  lastReassignedAt?: string;
}

interface TaskCardProps {
  task: Task;
  primaryColor: string;
  bodyFontFamily: string;
  fontColor?: string;
  onStatusChange: (newStatus: Task['status']) => void;
  onDelete: () => void;
  onReassign?: () => void;
  clients?: any[];
  tenants?: any[];
  userRole?: 'TENANT' | 'CLIENT';
}

export default function TaskCard({
  task,
  primaryColor,
  bodyFontFamily,
  fontColor = '#333333',
  onStatusChange,
  onDelete,
  onReassign,
  clients = [],
  tenants = [],
  userRole,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(task.assignedToClientId || '');
  const [selectedTenantId, setSelectedTenantId] = useState(task.assignedToTenantId || '');

  const handleStatusChange = async (newStatus: Task['status']) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      const updated = await response.json();
      onStatusChange(updated.status);
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedClientId && !selectedTenantId) {
      alert('Please select a client or tenant to reassign to');
      return;
    }

    setReassignLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToClientId: selectedClientId || null,
          assignedToTenantId: selectedTenantId || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to reassign task');
      const updated = await response.json();
      setShowReassign(false);
      if (onReassign) onReassign();
      alert('Task reassigned successfully');
    } catch (error) {
      console.error('Error reassigning task:', error);
      alert('Failed to reassign task');
    } finally {
      setReassignLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');
      onDelete();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const statusColors = {
    TODO: { bg: '#FEF3C7', text: '#92400E' },
    IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF' },
    DONE: { bg: '#DCFCE7', text: '#166534' },
    BLOCKED: { bg: '#FEE2E2', text: '#991B1B' },
  };

  const priorityColors = {
    HIGH: '#EF4444',
    MEDIUM: '#F59E0B',
    LOW: '#10B981',
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      style={{
        border: `1px solid ${primaryColor}30`,
        borderRadius: '8px',
        padding: '1rem',
        background: '#fff',
        fontFamily: bodyFontFamily,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Task Header - Always Visible */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Status Dropdown */}
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
          onClick={(e) => e.stopPropagation()}
          disabled={isUpdating}
          style={{
            padding: '0.4rem 0.6rem',
            borderRadius: '4px',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            background: statusColors[task.status].bg,
            color: statusColors[task.status].text,
            minWidth: '100px',
            opacity: isUpdating ? 0.6 : 1,
          }}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
          <option value="BLOCKED">Blocked</option>
        </select>

        {/* Title & Meta */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              color: primaryColor,
              fontWeight: '600',
              textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </h3>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', color: primaryColor, opacity: 0.6 }}>
            {task.priority && (
              <span
                style={{
                  background: priorityColors[(task.priority as keyof typeof priorityColors) || 'LOW'] + '30',
                  color: priorityColors[(task.priority as keyof typeof priorityColors) || 'LOW'],
                  padding: '0.2rem 0.6rem',
                  borderRadius: '3px',
                  fontWeight: '600',
                }}
              >
                {task.priority}
              </span>
            )}
            {isOverdue && (
              <span style={{ color: '#DC2626', fontWeight: '600' }}>
                ⚠️ Overdue: {formattedDueDate}
              </span>
            )}
            {!isOverdue && formattedDueDate && (
              <span>📅 {formattedDueDate}</span>
            )}
            {task.source === 'MEETING_NOTE' && (
              <span style={{ color: primaryColor, fontStyle: 'italic' }}>
                📝 From Meeting Note
              </span>
            )}
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            color: primaryColor,
          }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{ marginTop: '1rem', borderTop: `1px solid ${primaryColor}15`, paddingTop: '1rem' }}>
          {/* Creator Info */}
          {task.creatorName && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                From: <strong>{task.creatorName}</strong>
              </p>
            </div>
          )}

          {task.description && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: primaryColor, fontSize: '0.9rem' }}>
                Description
              </p>
              <p
                style={{
                  margin: 0,
                  color: primaryColor,
                  opacity: 0.8,
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                }}
              >
                {task.description}
              </p>
            </div>
          )}

          {/* Reassign Section */}
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${primaryColor}15` }}>
            <button
              onClick={() => setShowReassign(!showReassign)}
              style={{
                background: 'transparent',
                border: 'none',
                color: primaryColor,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              {showReassign ? 'Hide reassign' : 'Reassign task'}
            </button>

            {showReassign && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: `${primaryColor}08`, borderRadius: '4px' }}>
                {userRole === 'TENANT' && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', color: primaryColor }}>
                      Assign to Client
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        borderRadius: '4px',
                        border: `1px solid ${primaryColor}40`,
                        fontSize: '0.8rem',
                        fontFamily: bodyFontFamily,
                      }}
                    >
                      <option value="">-- Select a client --</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.couple1FirstName && client.couple1LastName
                            ? `${client.couple1FirstName} ${client.couple1LastName}`
                            : `Client ${client.id.substring(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {userRole === 'CLIENT' && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', color: primaryColor }}>
                      Assign to Planner
                    </label>
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        borderRadius: '4px',
                        border: `1px solid ${primaryColor}40`,
                        fontSize: '0.8rem',
                        fontFamily: bodyFontFamily,
                      }}
                    >
                      <option value="">-- Select a planner --</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.businessName || `Planner ${tenant.id.substring(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowReassign(false)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      border: `1px solid ${primaryColor}40`,
                      background: 'transparent',
                      color: primaryColor,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReassign}
                    disabled={reassignLoading}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      border: 'none',
                      background: primaryColor,
                      color: fontColor,
                      cursor: reassignLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      opacity: reassignLoading ? 0.6 : 1,
                    }}
                  >
                    {reassignLoading ? 'Reassigning...' : 'Reassign'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              marginTop: '1rem',
            }}
          >
            {task.canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Open edit modal
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: `1px solid ${primaryColor}40`,
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  cursor: 'pointer',
                  color: primaryColor,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}
            {task.canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this task?')) {
                    handleDelete();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: '1px solid #EF4444',
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  cursor: 'pointer',
                  color: '#EF4444',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
