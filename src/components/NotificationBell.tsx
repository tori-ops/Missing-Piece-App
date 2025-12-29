'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationPreferencesModal from './NotificationPreferencesModal';

interface NotificationBellProps {
  primaryColor: string;
  bodyFontFamily: string;
  headerFontFamily?: string;
}

export default function NotificationBell({
  primaryColor,
  bodyFontFamily,
  headerFontFamily,
}: NotificationBellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: primaryColor,
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
        title="Notification Preferences"
      >
        <Bell size={24} />
      </button>

      {isModalOpen && (
        <NotificationPreferencesModal
          primaryColor={primaryColor}
          bodyFontFamily={bodyFontFamily}
          headerFontFamily={headerFontFamily}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
