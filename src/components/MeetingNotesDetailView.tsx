'use client';

import { useState, useEffect } from 'react';
import { Trash2, FileText, Calendar } from 'lucide-react';

interface MeetingNote {
  id: string;
  title: string;
  body: string;
  meetingDate?: string;
  createdAt: string;
  attachments?: Array<{
    id: string;
    fileName: string;
  }>;
}

interface MeetingNotesDetailViewProps {
  clientId: string;
  tenantId: string;
  primaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  onBack: () => void;
}

export default function MeetingNotesDetailView({
  clientId,
  tenantId,
  primaryColor = '#274E13',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  onBack,
}: MeetingNotesDetailViewProps) {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteMeetingDate, setNewNoteMeetingDate] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');

  // Filters
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterTags, setFilterTags] = useState('');

  // Fetch notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meeting-notes?clientId=${clientId}&tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteBody.trim()) return;

    try {
      const response = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNoteTitle,
          body: newNoteBody,
          meetingDate: newNoteMeetingDate ? new Date(newNoteMeetingDate).toISOString() : undefined,
          tags: newNoteTags ? newNoteTags.split(',').map(t => t.trim()) : [],
          clientId,
          tenantId,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Meeting note created successfully!');
        setNewNoteTitle('');
        setNewNoteBody('');
        setNewNoteMeetingDate('');
        setNewNoteTags('');
        await fetchNotes();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/meeting-notes/${noteId}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccessMessage('Note deleted successfully!');
        await fetchNotes();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    if (filterKeyword && !note.title.toLowerCase().includes(filterKeyword.toLowerCase()) && !note.body.toLowerCase().includes(filterKeyword.toLowerCase())) {
      return false;
    }
    
    if (filterDateFrom && note.meetingDate && new Date(note.meetingDate) < new Date(filterDateFrom)) {
      return false;
    }
    
    if (filterDateTo && note.meetingDate && new Date(note.meetingDate) > new Date(filterDateTo)) {
      return false;
    }

    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: primaryColor,
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '1.5rem',
          padding: 0,
          fontFamily: bodyFontFamily,
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Title */}
      <h2 style={{ color: primaryColor, fontFamily: headerFontFamily, marginTop: 0 }}>
        Meeting Notes
      </h2>

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

      {/* Create Note Form */}
      <div style={{
        background: primaryColor,
        color: '#ffffff',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        fontFamily: bodyFontFamily,
      }}>
        <h3 style={{ marginTop: 0, fontFamily: headerFontFamily }}>Create New Meeting Note</h3>
        <form onSubmit={handleCreateNote}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title *</label>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Meeting note title"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Content *</label>
            <textarea
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
              placeholder="Meeting note details"
              rows={5}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Meeting Date</label>
              <input
                type="date"
                value={newNoteMeetingDate}
                onChange={(e) => setNewNoteMeetingDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: bodyFontFamily,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tags (comma-separated)</label>
              <input
                type="text"
                value={newNoteTags}
                onChange={(e) => setNewNoteTags(e.target.value)}
                placeholder="e.g. venue, catering, flowers"
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
              background: '#ffffff',
              color: primaryColor,
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: bodyFontFamily,
            }}
          >
            Create Note
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
      }}>
        <h3 style={{ marginTop: 0, color: primaryColor, fontFamily: headerFontFamily }}>Filter Notes</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Keyword</label>
            <input
              type="text"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              placeholder="Search notes..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Date From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Date To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: fontColor }}>Tags (comma-separated)</label>
            <input
              type="text"
              value={filterTags}
              onChange={(e) => setFilterTags(e.target.value)}
              placeholder="Filter by tags..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${primaryColor}`,
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
              }}
            />
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div>
        <h3 style={{ color: primaryColor, fontFamily: headerFontFamily }}>
          Meeting Notes ({sortedNotes.length})
        </h3>

        {loading ? (
          <p style={{ color: fontColor, fontFamily: bodyFontFamily }}>Loading notes...</p>
        ) : sortedNotes.length === 0 ? (
          <p style={{ color: fontColor, fontFamily: bodyFontFamily, opacity: 0.7 }}>No meeting notes found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  border: `2px solid ${primaryColor}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f9f9f9',
                  fontFamily: bodyFontFamily,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: fontColor, fontFamily: headerFontFamily }}>
                      {note.title}
                    </h4>

                    {note.meetingDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: fontColor, fontSize: '0.9rem' }}>
                        <Calendar size={16} />
                        {new Date(note.meetingDate).toLocaleDateString()}
                      </div>
                    )}

                    <p style={{ margin: '0.75rem 0', color: fontColor, opacity: 0.9, lineHeight: '1.6' }}>
                      {note.body}
                    </p>

                    {note.attachments && note.attachments.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: fontColor }}>Attachments:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {note.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={`/api/meeting-notes/attachments/${attachment.id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: primaryColor,
                                color: '#ffffff',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText size={16} />
                              {attachment.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: fontColor, opacity: 0.6 }}>
                      Created: {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
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
                    title="Delete note"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
