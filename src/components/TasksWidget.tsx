'use client';

import { useState, useEffect } from 'react';
import TasksList from './TasksList';

interface TasksWidgetProps {
  primaryColor: string;
  secondaryColor?: string;
  bodyFontFamily: string;
  textColor?: string;
  clientId?: string;
  tenantId?: string;
  userRole?: 'TENANT' | 'CLIENT';
  onClick?: () => void;
}

export default function TasksWidget({
  primaryColor,
  secondaryColor = '#e1e0d0',
  bodyFontFamily,
  textColor = '#FFFFFF',
  clientId,
  tenantId,
  userRole,
  onClick,
}: TasksWidgetProps) {
  // If userRole not provided, infer from which ID is given
  // (typically widget is used with either clientId or tenantId but not both)
  const role = userRole || (clientId && !tenantId ? 'CLIENT' : 'TENANT');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/tasks/notifications/unread');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread task notification count:', error);
      }
    };

    fetchUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Widget Button - matches WeatherCard/AstrologyCard format */}
      <button
        type="button"
        onClick={handleClick}
        style={{
          background: primaryColor,
          border: `2px solid ${secondaryColor}`,
          borderRadius: '6px',
          padding: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '150px',
          margin: '0 auto',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${primaryColor}30`;
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
        aria-label="Open tasks"
      >
        <div style={{ fontSize: '2rem', margin: '0 0 0.35rem 0', position: 'relative' }}>
          ✓
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                background: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <h3 style={{ color: textColor, fontFamily: bodyFontFamily, margin: '0.5rem 0', fontSize: '1rem' }}>
          Tasks
        </h3>
      </button>

      {/* Tasks List Modal */}
      {isOpen && (
        <TasksList
          primaryColor={primaryColor}
          bodyFontFamily={bodyFontFamily}
          clientId={clientId}
          tenantId={tenantId}
          userRole={role}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
