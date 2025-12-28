'use client';

import { useState } from 'react';
import TasksList from './TasksList';

interface TasksWidgetProps {
  primaryColor: string;
  bodyFontFamily: string;
  textColor?: string;
  clientId?: string;
  tenantId?: string;
  userRole?: 'TENANT' | 'CLIENT';
}

export default function TasksWidget({
  primaryColor,
  bodyFontFamily,
  textColor = '#FFFFFF',
  clientId,
  tenantId,
  userRole,
}: TasksWidgetProps) {
  // If userRole not provided, infer from which ID is given
  // (typically widget is used with either clientId or tenantId but not both)
  const role = userRole || (clientId && !tenantId ? 'CLIENT' : 'TENANT');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Widget Button - matches WeatherCard/AstrologyCard format */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: '12px',
          padding: '1.5rem',
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
        <div style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>✓</div>
        <h3 style={{ color: textColor, fontFamily: bodyFontFamily, margin: '0.5rem 0', fontSize: '1.25rem' }}>
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
