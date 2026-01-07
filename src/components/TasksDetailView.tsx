'use client';

import { useState, useEffect } from 'react';
import { Trash2, Check } from 'lucide-react';
import BrandedDatePicker from './BrandedDatePicker';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  createdAt: string;
  clientId?: string;
  client?: {
    id: string;
    couple1FirstName?: string;
    couple1LastName?: string;
  };
}

interface TasksDetailViewProps {
  clientId?: string;
  tenantId: string;
  clients?: Array<{ id: string; couple1FirstName?: string; couple1LastName?: string; fullName?: string; name?: string }>;
  primaryColor?: string;
  secondaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  logoUrl?: string | null;
  companyName?: string;
  onBack: () => void;
}

export default function TasksDetailView({
  clientId,
  tenantId,
  clients = [],
  primaryColor = '#274E13',
  secondaryColor = '#e1e0d0',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  logoUrl,
  companyName,
  onBack,
}: TasksDetailViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newTaskClientId, setNewTaskClientId] = useState<string>('');

  // Filters
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'>('ALL');
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, [clientId, tenantId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ tenantId });
      if (clientId) {
        params.append('clientId', clientId);
      }
      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || undefined,
          dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
          priority: newTaskPriority,
          clientId: newTaskClientId || clientId,
          assigneeType: (newTaskClientId || clientId) ? 'CLIENT' : 'TENANT',
          assigneeId: (newTaskClientId || clientId) || tenantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      setSuccessMessage('Task created successfully!');
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskPriority('MEDIUM');
      setNewTaskClientId('');
      await fetchTasks();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to create task:', error);
      setSuccessMessage(`Error: ${error instanceof Error ? error.message : 'Failed to create task'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccessMessage('Task deleted successfully!');
        await fetchTasks();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' }),
      });
      if (response.ok) {
        setSuccessMessage('Task completed!');
        await fetchTasks();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
    if (filterKeyword && !task.title.toLowerCase().includes(filterKeyword.toLowerCase())) return false;
    if (filterDueDate && task.dueDate && new Date(task.dueDate).toDateString() !== new Date(filterDueDate).toDateString()) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#d32f2f';
      case 'MEDIUM': return '#f57c00';
      case 'LOW': return '#388e3c';
      default: return primaryColor;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return '#388e3c';
      case 'IN_PROGRESS': return '#1976d2';
      case 'BLOCKED': return '#d32f2f';
      case 'TODO': return '#757575';
      default: return primaryColor;
    }
  };

  return (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${secondaryColor}`,
      }}>
        <h2 style={{ 
          color: fontColor,
          fontFamily: headerFontFamily,
          marginTop: 0,
          marginBottom: 0,
          fontSize: '2.5rem',
        }}>
          Tasks
        </h2>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          background: '#c8e6c9',
          color: '#2e7d32',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontFamily: bodyFontFamily,
        }}>
          {successMessage}
        </div>
      )}

      {/* Create Task Form */}
      <div style={{
        background: primaryColor,
        color: fontColor,
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        fontFamily: bodyFontFamily,
        border: `1px solid ${secondaryColor}`,
      }}>
        <h3 style={{ marginTop: 0, fontFamily: headerFontFamily, fontSize: '1.75rem' }}>Create New Task</h3>
        <form onSubmit={handleCreateTask}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Title *</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${secondaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Description</label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${secondaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${secondaryColor}`,
                  borderRadius: '4px',
                  fontFamily: bodyFontFamily,
                  color: fontColor,
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {!clientId && clients.length > 0 && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Assign to Client</label>
                <select
                  value={newTaskClientId}
                  onChange={(e) => setNewTaskClientId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${secondaryColor}`,
                    borderRadius: '4px',
                    fontFamily: bodyFontFamily,
                    color: fontColor,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="" disabled>Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.couple1FirstName && client.couple1LastName
                        ? `${client.couple1FirstName} ${client.couple1LastName}`
                        : client.fullName || client.name || 'Unnamed Client'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Due Date</label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: bodyFontFamily,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: primaryColor,
              color: fontColor,
              border: `1px solid ${secondaryColor}`,
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${secondaryColor}30`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = primaryColor;
            }}
          >
            Create Task
          </button>
        </form>
      </div>

      {/* Filters */}
      <div style={{
        background: '#f5f5f5',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        fontFamily: bodyFontFamily,
        border: `1px solid ${secondaryColor}`,
      }}>
        <h3 style={{ marginTop: 0, color: fontColor, fontFamily: headerFontFamily, fontSize: '1.9em' }}>Filter Tasks</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${secondaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                color: fontColor,
                backgroundColor: '#ffffff',
              }}
            >
              <option value="ALL">All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${secondaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                color: fontColor,
                backgroundColor: '#ffffff',
              }}
            >
              <option value="ALL">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Due Date</label>
            <BrandedDatePicker
              selected={filterDueDate ? new Date(filterDueDate) : null}
              onChange={(date) => setFilterDueDate(date ? date.toISOString().split('T')[0] : '')}
              placeholderText="Select due date"
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              fontColor={fontColor}
              bodyFontFamily={bodyFontFamily}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Keyword</label>
            <input
              type="text"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              placeholder="Search tasks..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${secondaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                color: fontColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div>
        <h3 style={{ color: fontColor, fontFamily: headerFontFamily, fontSize: '1.9em' }}>
          Tasks ({filteredTasks.length})
        </h3>

        {loading ? (
          <p style={{ color: fontColor, fontFamily: bodyFontFamily }}>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p style={{ color: fontColor, fontFamily: bodyFontFamily, opacity: 0.7 }}>No tasks found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  border: `2px solid ${getStatusColor(task.status)}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f9f9f9',
                  fontFamily: bodyFontFamily,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: '0', color: fontColor }}>
                        {task.title}
                      </h4>
                      {task.client && !clientId && (
                        <span style={{
                          display: 'inline-block',
                          background: primaryColor,
                          color: '#ffffff',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}>
                          {task.client.couple1FirstName} {task.client.couple1LastName}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p style={{ margin: '0 0 0.75rem 0', color: fontColor, opacity: 0.8, fontSize: '0.9rem' }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: getStatusColor(task.status),
                        color: '#ffffff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                      }}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span style={{
                        background: getPriorityColor(task.priority),
                        color: '#ffffff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                      }}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span style={{
                          background: '#e0e0e0',
                          color: fontColor,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                        }}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {task.status !== 'DONE' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        style={{
                          background: '#4caf50',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontFamily: bodyFontFamily,
                        }}
                        title="Mark as complete"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        background: '#f44336',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontFamily: bodyFontFamily,
                      }}
                      title="Delete task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button (Bottom) */}
        <button
          onClick={onBack}
          style={{
            background: primaryColor,
            color: fontColor,
            border: `1px solid ${secondaryColor}`,
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: bodyFontFamily,
            transition: 'background-color 0.2s ease',
            marginTop: '2rem',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${secondaryColor}30`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = primaryColor;
          }}
        >
          ← Back to Dashboard
        </button>

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
    </div>
  );
}
