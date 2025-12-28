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
}

interface TaskCardProps {
  task: Task;
  primaryColor: string;
  bodyFontFamily: string;
  onStatusChange: (newStatus: Task['status']) => void;
  onDelete: () => void;
}

export default function TaskCard({
  task,
  primaryColor,
  bodyFontFamily,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              marginTop: '1rem',
            }}
          >
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
          </div>
        </div>
      )}
    </div>
  );
}
