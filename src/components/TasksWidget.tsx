'use client';

import { useState } from 'react';
import { CheckSquare2 } from 'lucide-react';
import TasksList from './TasksList';

interface TasksWidgetProps {
  primaryColor: string;
  bodyFontFamily: string;
  clientId?: string; // If provided, show client-specific tasks. If not, show tenant tasks
  tenantId?: string;
}

export default function TasksWidget({
  primaryColor,
  bodyFontFamily,
  clientId,
  tenantId,
}: TasksWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Icon/Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
        aria-label="Open tasks"
      >
        <CheckSquare2 size={32} color={primaryColor} strokeWidth={1.5} />
      </button>

      {/* Tasks List Modal */}
      {isOpen && (
        <TasksList
          primaryColor={primaryColor}
          bodyFontFamily={bodyFontFamily}
          clientId={clientId}
          tenantId={tenantId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
