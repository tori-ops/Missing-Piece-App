'use client';

import { useState } from 'react';
import MeetingNotesList from './MeetingNotesList';

interface MeetingNotesWidgetProps {
  primaryColor: string;
  bodyFontFamily: string;
  textColor?: string;
  clientId?: string;
  tenantId?: string;
  currentUserId: string;
  userRole?: 'TENANT' | 'CLIENT';
}

export default function MeetingNotesWidget({
  primaryColor,
  bodyFontFamily,
  textColor = '#FFFFFF',
  clientId,
  tenantId,
  currentUserId,
  userRole,
}: MeetingNotesWidgetProps) {
  const role = userRole || (clientId && !tenantId ? 'CLIENT' : 'TENANT');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Widget Button - matches Tasks/Weather/Astrology format */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          background: primaryColor,
          border: `2px solid ${primaryColor}`,
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
        aria-label="Open meeting notes"
      >
        <div style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>📝</div>
        <h3 style={{ color: textColor, fontFamily: bodyFontFamily, margin: '0.5rem 0', fontSize: '1.25rem' }}>
          Notes
        </h3>
      </button>

      {/* Meeting Notes List Modal */}
      {isOpen && (
        <MeetingNotesList
          primaryColor={primaryColor}
          bodyFontFamily={bodyFontFamily}
          clientId={clientId}
          tenantId={tenantId || ''}
          userRole={role}
          currentUserId={currentUserId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
