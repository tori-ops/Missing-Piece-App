'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

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
}

interface TasksListProps {
  primaryColor: string;
  bodyFontFamily: string;
  clientId?: string;
  tenantId?: string;
  userRole?: 'TENANT' | 'CLIENT';
  onClose: () => void;
}

export default function TasksList({
  primaryColor,
  bodyFontFamily,
  clientId,
  tenantId,
  userRole = 'TENANT',
  onClose,
}: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'>('ALL');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [showForm, setShowForm] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter !== 'ALL' && task.status !== activeFilter) return false;
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
    }
    if (sortBy === 'priority') {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const prioA = priorityOrder[(a.priority || 'LOW') as keyof typeof priorityOrder] || 2;
      const prioB = priorityOrder[(b.priority || 'LOW') as keyof typeof priorityOrder] || 2;
      return prioA - prioB;
    }
    // createdAt
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: bodyFontFamily,
      }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            borderBottom: `2px solid ${primaryColor}20`,
            background: '#fafafa',
          }}
        >
          <h2 style={{ margin: 0, color: primaryColor, fontSize: '1.5rem' }}>Your Tasks</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} color={primaryColor} />
          </button>
        </div>

        {/* Descriptor Text */}
        <div style={{ padding: '1rem 1.5rem 0 1.5rem' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#666',
              fontStyle: 'italic',
              fontFamily: bodyFontFamily,
              lineHeight: 1.5,
            }}
          >
            This is where plans turn into action. Create tasks with all the details you need, set priority levels and due dates, and decide whether the task is assigned to you or your planner. This keeps responsibilities clear, progress visible, and planning moving forward without anything falling through the cracks.
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem 1.5rem',
            borderBottom: `1px solid ${primaryColor}15`,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                style={{
                  background: activeFilter === status ? primaryColor : `${primaryColor}10`,
                  color: activeFilter === status ? '#fff' : primaryColor,
                  border: `1px solid ${primaryColor}`,
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: primaryColor,
            }}
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="createdAt">Sort: Created</option>
          </select>

          {/* Create New Task Button */}
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: primaryColor,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.9')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          >
            <Plus size={16} />
            New Task
          </button>
        </div>

        {/* Task List or Form */}
        {showForm ? (
          <TaskForm
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            clientId={clientId}
            tenantId={tenantId}
            userRole={userRole}
            onTaskCreated={handleTaskCreated}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '1rem 1.5rem',
            }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: primaryColor }}>
                <p>Loading tasks...</p>
              </div>
            ) : sortedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: primaryColor, opacity: 0.6 }}>
                <p>No tasks yet. Create one to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    primaryColor={primaryColor}
                    bodyFontFamily={bodyFontFamily}
                    onStatusChange={(newStatus) => {
                      // TODO: Call API to update task status
                      handleTaskUpdated({ ...task, status: newStatus });
                    }}
                    onDelete={() => {
                      // TODO: Call API to delete task
                      handleTaskDeleted(task.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
