'use client';

import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationPreferencesModalProps {
  primaryColor: string;
  bodyFontFamily: string;
  headerFontFamily?: string;
  onClose: () => void;
}

export default function NotificationPreferencesModal({
  primaryColor,
  bodyFontFamily,
  headerFontFamily,
  onClose,
}: NotificationPreferencesModalProps) {
  const [preferences, setPreferences] = useState({
    emailOnTaskCreated: true,
    emailOnTaskCompleted: true,
    emailOnTaskCommented: true,
    emailOnMeetingNoteCreated: true,
    emailOnMeetingNoteCommented: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/notifications/preferences');
        if (!response.ok) throw new Error('Failed to load preferences');
        const data = await response.json();
        setPreferences(data);
      } catch (err) {
        console.error('Failed to load preferences:', err);
        setError('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to save preferences');
      setSuccess('Preferences saved successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save preferences';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          fontFamily: bodyFontFamily,
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
            borderBottom: `1px solid ${primaryColor}20`,
            position: 'sticky',
            top: 0,
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={20} color={primaryColor} />
            <h2
              style={{
                margin: 0,
                color: primaryColor,
                fontSize: '1.25rem',
                fontWeight: '700',
                fontFamily: headerFontFamily || bodyFontFamily,
              }}
            >
              Notification Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#DCFCE7',
                color: '#166534',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {success}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              Loading preferences...
            </div>
          ) : (
            <div>
              <p
                style={{
                  color: '#666',
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                }}
              >
                Choose which notifications you'd like to receive via email.
              </p>

              {/* Task Notifications */}
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: primaryColor,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                  }}
                >
                  📋 Task Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.emailOnTaskCreated}
                      onChange={() => handleToggle('emailOnTaskCreated')}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: primaryColor,
                        cursor: 'pointer',
                      }}
                    />
                    <span>Email when a new task is assigned to me</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.emailOnTaskCompleted}
                      onChange={() => handleToggle('emailOnTaskCompleted')}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: primaryColor,
                        cursor: 'pointer',
                      }}
                    />
                    <span>Email when a task is marked as complete</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.emailOnTaskCommented}
                      onChange={() => handleToggle('emailOnTaskCommented')}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: primaryColor,
                        cursor: 'pointer',
                      }}
                    />
                    <span>Email when someone comments on my task</span>
                  </label>
                </div>
              </div>

              {/* Meeting Notes Notifications */}
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: primaryColor,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                  }}
                >
                  📝 Meeting Notes Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.emailOnMeetingNoteCreated}
                      onChange={() => handleToggle('emailOnMeetingNoteCreated')}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: primaryColor,
                        cursor: 'pointer',
                      }}
                    />
                    <span>Email when a meeting note is created for me</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.emailOnMeetingNoteCommented}
                      onChange={() => handleToggle('emailOnMeetingNoteCommented')}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: primaryColor,
                        cursor: 'pointer',
                      }}
                    />
                    <span>Email when there's activity on my meeting notes</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.5rem',
            borderTop: `1px solid ${primaryColor}20`,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: `1px solid ${primaryColor}40`,
              background: 'transparent',
              color: primaryColor,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              background: primaryColor,
              color: '#fff',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
