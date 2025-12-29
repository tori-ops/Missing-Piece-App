'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import MeetingNoteCard from './MeetingNoteCard';
import MeetingNoteForm from './MeetingNoteForm';

interface MeetingNote {
  id: string;
  title: string;
  body: string;
  meetingDate: string | null;
  createdAt: string;
  createdByUserId: string;
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
  }>;
}

interface MeetingNotesListProps {
  primaryColor: string;
  bodyFontFamily: string;
  clientId?: string;
  tenantId: string;
  userRole: string;
  onClose: () => void;
}

export default function MeetingNotesList({
  primaryColor,
  bodyFontFamily,
  clientId,
  tenantId,
  userRole,
  onClose,
}: MeetingNotesListProps) {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'this-month'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          tenantId,
          ...(clientId && { clientId }),
        });
        const response = await fetch(`/api/meeting-notes?${params}`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [tenantId, clientId]);

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.createdByUser?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.createdByUser?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterBy === 'recent') {
      const daysSinceCreated = (Date.now() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 7;
    }

    if (filterBy === 'this-month') {
      const now = new Date();
      const noteDate = new Date(note.createdAt);
      return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const handleNoteCreated = async () => {
    setIsFormOpen(false);
    // Refresh notes
    try {
      const params = new URLSearchParams({
        tenantId,
        ...(clientId && { clientId }),
      });
      const response = await fetch(`/api/meeting-notes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to refresh notes:', err);
    }
  };

  const handleNoteDeleted = (deletedNoteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== deletedNoteId));
  };

  const handleNoteUpdated = (updatedNote: MeetingNote) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const handleSubmitForm = async (data: {
    title: string;
    body: string;
    meetingDate?: string;
    files?: File[];
  }) => {
    try {
      // Create note
      const noteResponse = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          body: data.body,
          meetingDate: data.meetingDate || null,
          tenantId,
          clientId: clientId || null,
        }),
      });

      if (!noteResponse.ok) throw new Error('Failed to create note');
      const newNote = await noteResponse.json();

      // Upload files if any
      if (data.files && data.files.length > 0) {
        const formData = new FormData();
        data.files.forEach((file) => formData.append('files', file));

        const uploadResponse = await fetch(`/api/meeting-notes/${newNote.id}/attachments`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload files');
        const { note: updatedNote } = await uploadResponse.json();
        setNotes((prev) => [updatedNote, ...prev]);
      } else {
        setNotes((prev) => [newNote, ...prev]);
      }

      setIsFormOpen(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#FFF',
        borderRadius: '8px',
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${primaryColor}20`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '700',
              color: primaryColor,
              fontFamily: bodyFontFamily,
            }}
          >
            📝 Meeting Notes
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.85rem',
              color: '#666',
              fontFamily: bodyFontFamily,
            }}
          >
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Controls */}
      {!isFormOpen && (
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: `1px solid ${primaryColor}20`,
            display: 'flex',
            gap: '1rem',
            flexShrink: 0,
            flexWrap: 'wrap',
            fontFamily: bodyFontFamily,
          }}
        >
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.9rem',
            }}
          />

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'this-month')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Notes</option>
            <option value="recent">Last 7 Days</option>
            <option value="this-month">This Month</option>
          </select>

          {userRole !== 'CLIENT' && (
            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: 'none',
                background: primaryColor,
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              <Plus size={18} />
              New Note
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isFormOpen ? (
        <MeetingNoteForm
          primaryColor={primaryColor}
          bodyFontFamily={bodyFontFamily}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              Loading notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                {notes.length === 0 ? '📝 No meeting notes yet' : 'No notes match your search'}
              </p>
              {notes.length === 0 && userRole !== 'CLIENT' && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  style={{
                    background: primaryColor,
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    marginTop: '0.5rem',
                  }}
                >
                  Create First Note
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredNotes.map((note) => (
                <MeetingNoteCard
                  key={note.id}
                  note={note}
                  primaryColor={primaryColor}
                  bodyFontFamily={bodyFontFamily}
                  userRole={userRole}
                  onDelete={handleNoteDeleted}
                  onUpdate={handleNoteUpdated}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
