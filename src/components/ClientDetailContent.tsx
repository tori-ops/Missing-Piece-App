'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import TenantWebsiteInfoView from './TenantWebsiteInfoView';

interface ClientDetailContentProps {
  client: {
    id: string;
    couple1FirstName?: string;
    couple1LastName?: string;
    couple2FirstName?: string;
    couple2LastName?: string;
    weddingDate?: string;
    weddingVenue?: string;
    city?: string;
    state?: string;
    notes?: string;
    websiteBuilderEnabled?: boolean;
  };
  branding?: {
    primaryColor?: string;
    fontColor?: string;
    bodyFontFamily?: string;
    headerFontFamily?: string;
  };
  onBack: () => void;
  onWebsiteBuilderToggle?: (enabled: boolean) => void;
}

interface Note {
  id: string;
  title: string;
  body: string;
  meetingDate?: string;
  createdAt: string;
  clientId?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string;
  clientId?: string;
  createdAt: string;
}

export default function ClientDetailContent({
  client,
  branding = {},
  onBack,
  onWebsiteBuilderToggle,
}: ClientDetailContentProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'website-info'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [websiteBuilderEnabled, setWebsiteBuilderEnabled] = useState(client.websiteBuilderEnabled || false);
  const [togglingWebsite, setTogglingWebsite] = useState(false);

  const primaryColor = branding?.primaryColor || '#274E13';
  const fontColor = branding?.fontColor || '#000000';
  const bodyFontFamily = branding?.bodyFontFamily || "'Poppins', sans-serif";
  const headerFontFamily = branding?.headerFontFamily || "'Playfair Display', serif";

  const clientName = client.couple1FirstName && client.couple1LastName
    ? `${client.couple1FirstName} ${client.couple1LastName}`
    : 'Client';

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const response = await fetch(
          `/api/meeting-notes?clientId=${client.id}&tenantLevel=true`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoadingNotes(false);
      }
    };

    if (activeTab === 'notes') {
      fetchNotes();
    }
  }, [client.id, activeTab]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await fetch(
          `/api/tasks?clientId=${client.id}&tenantLevel=true`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [client.id, activeTab]);

  const handleWebsiteBuilderToggle = async (enabled: boolean) => {
    setTogglingWebsite(true);
    try {
      const response = await fetch(
        `/api/tenant/clients/${client.id}/website-builder`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled })
        }
      );

      if (response.ok) {
        setWebsiteBuilderEnabled(enabled);
        onWebsiteBuilderToggle?.(enabled);
      } else {
        console.error('Failed to toggle website builder');
      }
    } catch (error) {
      console.error('Error toggling website builder:', error);
    } finally {
      setTogglingWebsite(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header with client info */}
      <div style={{ backgroundColor: primaryColor, color: '#ffffff', padding: '1.25rem 2rem', position: 'relative' }}>
        {/* Top row with back button and toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
            }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          {/* Website Builder Toggle - Top Right */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9, textAlign: 'right' }}>
              Building Client Wedding Site?
            </p>
            <button
              onClick={() => handleWebsiteBuilderToggle(!websiteBuilderEnabled)}
              disabled={togglingWebsite}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: websiteBuilderEnabled ? '#4CAF50' : '#ccc',
                cursor: togglingWebsite ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
                opacity: togglingWebsite ? 0.6 : 1,
              }}
              title={websiteBuilderEnabled ? 'Disable Website Builder' : 'Enable Website Builder'}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transform: websiteBuilderEnabled ? 'translateX(12px)' : 'translateX(-12px)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </button>
          </div>
        </div>

        <div style={{ fontFamily: headerFontFamily }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '600' }}>
            {clientName}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              {client.couple2FirstName && client.couple2LastName && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <p style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.2' }}>
                    Partner
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.2' }}>
                    {client.couple2FirstName} {client.couple2LastName}
                  </p>
                </div>
              )}

              {client.weddingDate && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <p style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.2' }}>
                    Wedding Date
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.2' }}>
                    {new Date(client.weddingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            <div>
              {client.weddingVenue && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <p style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.2' }}>
                    Venue
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.2' }}>
                    {client.weddingVenue}
                  </p>
                </div>
              )}

              {(client.city || client.state) && (
                <div>
                  <p style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.2' }}>
                    Location
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.2' }}>
                    {client.city}
                    {client.city && client.state ? ', ' : ''}
                    {client.state}
                  </p>
                </div>
              )}
            </div>
          </div>

          {client.notes && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: 'rgba(255,255,255,0.2) 1px solid' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.2' }}>
                Tenant Notes
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.3' }}>
                {client.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar navigation */}
        <div
          style={{
            width: '200px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            padding: '1.5rem 0',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => setActiveTab('notes')}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: activeTab === 'notes' ? `${primaryColor}15` : 'transparent',
                borderLeft: activeTab === 'notes' ? `4px solid ${primaryColor}` : '4px solid transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                fontWeight: activeTab === 'notes' ? '600' : '500',
                color: activeTab === 'notes' ? primaryColor : fontColor,
                transition: 'all 0.2s ease',
              }}
            >
              📝 Notes
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: activeTab === 'tasks' ? `${primaryColor}15` : 'transparent',
                borderLeft: activeTab === 'tasks' ? `4px solid ${primaryColor}` : '4px solid transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                fontWeight: activeTab === 'tasks' ? '600' : '500',
                color: activeTab === 'tasks' ? primaryColor : fontColor,
                transition: 'all 0.2s ease',
              }}
            >
              ✓ Tasks
            </button>

            <button
              onClick={() => setActiveTab('website-info')}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: activeTab === 'website-info' ? `${primaryColor}15` : 'transparent',
                borderLeft: activeTab === 'website-info' ? `4px solid ${primaryColor}` : '4px solid transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: bodyFontFamily,
                fontSize: '1rem',
                fontWeight: activeTab === 'website-info' ? '600' : '500',
                color: activeTab === 'website-info' ? primaryColor : fontColor,
                transition: 'all 0.2s ease',
                display: websiteBuilderEnabled ? 'block' : 'none'
              }}
            >
              🌐 Website Info
            </button>
          </nav>
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
          {activeTab === 'notes' && (
            <div>
              <h2 style={{ fontFamily: headerFontFamily, color: primaryColor, marginTop: 0 }}>
                Meeting Notes
              </h2>

              {loadingNotes ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  <p>No notes yet. Create notes from the dashboard.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: `1px solid ${primaryColor}20`,
                        borderRadius: '8px',
                        padding: '1.5rem',
                      }}
                    >
                      <h3 style={{ margin: '0 0 0.5rem 0', color: primaryColor, fontFamily: headerFontFamily }}>
                        {note.title}
                      </h3>

                      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#666' }}>
                        {note.meetingDate && (
                          <span>📅 {new Date(note.meetingDate).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                        {note.clientId && (
                          <span style={{ color: primaryColor, fontWeight: '500' }}>📌 Client-Assigned</span>
                        )}
                      </div>

                      <p style={{ margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {note.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <h2 style={{ fontFamily: headerFontFamily, color: primaryColor, marginTop: 0 }}>
                Tasks
              </h2>

              {loadingTasks ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  Loading tasks...
                </div>
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  <p>No tasks yet. Create tasks from the dashboard.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: `1px solid ${primaryColor}20`,
                        borderRadius: '8px',
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: primaryColor, fontFamily: headerFontFamily }}>
                          {task.title}
                        </h3>

                        {task.description && (
                          <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.95rem' }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
                          {task.dueDate && (
                            <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem', textAlign: 'right' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: task.priority === 'HIGH' ? '#fee2e2' : task.priority === 'MEDIUM' ? '#fef3c7' : '#dbeafe',
                            color: task.priority === 'HIGH' ? '#991b1b' : task.priority === 'MEDIUM' ? '#92400e' : '#1e40af',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {task.priority}
                        </span>

                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: task.status === 'COMPLETED' ? '#dcfce7' : task.status === 'IN_PROGRESS' ? '#fef3c7' : '#f3f4f6',
                            color: task.status === 'COMPLETED' ? '#166534' : task.status === 'IN_PROGRESS' ? '#92400e' : '#374151',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {task.status.replace(/_/g, ' ')}
                        </span>

                        {task.clientId && (
                          <span style={{ color: primaryColor, fontWeight: '500', fontSize: '0.8rem' }}>
                            📌 Client-Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'website-info' && (
            <div>
              <h2 style={{ fontFamily: headerFontFamily, color: primaryColor, marginTop: 0 }}>
                Website Information
              </h2>
              <TenantWebsiteInfoView
                clientId={client.id}
                primaryColor={primaryColor}
                fontColor={fontColor}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
