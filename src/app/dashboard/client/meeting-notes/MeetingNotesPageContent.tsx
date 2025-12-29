'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';

interface MeetingNote {
  id: string;
  title: string;
  description: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attachments: Array<{
    id: string;
    fileName: string;
  }>;
}

interface MeetingNotesPageContentProps {
  _userId: string;
  clientId: string;
  tenantId: string;
  tenantName: string;
  primaryColor: string;
  backgroundColor: string;
  fontColor: string;
  fontFamily: string;
  headerFontFamily: string;
  bodyFontFamily: string;
  logoUrl: string | null;
}

export default function MeetingNotesPageContent({
  _userId,
  clientId,
  tenantId,
  tenantName,
  primaryColor,
  backgroundColor,
  fontColor,
  fontFamily,
  headerFontFamily,
  bodyFontFamily,
  logoUrl,
}: MeetingNotesPageContentProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<MeetingNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/meeting-notes?clientId=${clientId}&tenantId=${tenantId}`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        const data = await response.json();
        // Sort by newest first
        const sorted = data.sort((a: MeetingNote, b: MeetingNote) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotes(sorted);
        setFilteredNotes(sorted);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [clientId, tenantId]);

  useEffect(() => {
    // Filter notes based on search term
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = notes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(lowerSearch);
      const descriptionMatch = note.description?.toLowerCase().includes(lowerSearch) || false;
      const contentMatch = note.content.toLowerCase().includes(lowerSearch);
      const attachmentMatch = note.attachments.some(att => 
        att.fileName.toLowerCase().includes(lowerSearch)
      );
      return titleMatch || descriptionMatch || contentMatch || attachmentMatch;
    });
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: backgroundColor, 
      fontFamily, 
      color: fontColor
    }}>
      {/* Header with back button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '2rem',
        maxWidth: '900px',
        margin: '0 auto 2rem'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: primaryColor,
            fontSize: '1rem',
            fontFamily: bodyFontFamily,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 style={{
          color: primaryColor,
          margin: 0,
          fontSize: '2rem',
          fontFamily: headerFontFamily,
          flex: 1,
        }}>
          Meeting Notes
        </h1>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {/* Summary Card */}
        <div style={{
          background: primaryColor,
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          color: 'white',
          fontFamily: bodyFontFamily,
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            <strong>{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'note' : 'notes'}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Search Box */}
        <div style={{
          marginBottom: '2rem',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            border: `2px solid ${primaryColor}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontFamily: bodyFontFamily,
          }}>
            <Search size={18} color={primaryColor} style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search by title, description, content, or attachment filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                flex: 1,
                outline: 'none',
                fontSize: '1rem',
                fontFamily: bodyFontFamily,
              }}
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: primaryColor,
            fontFamily: bodyFontFamily,
          }}>
            <p>Loading notes...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredNotes.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem', 
            color: primaryColor,
            fontFamily: bodyFontFamily,
            opacity: 0.7,
          }}>
            <p style={{ fontSize: '1.1rem' }}>
              {searchTerm ? 'No notes match your search.' : 'No meeting notes yet.'}
            </p>
          </div>
        )}

        {/* Notes list - chronological (newest first) */}
        {!isLoading && filteredNotes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: 'white',
                  border: `1px solid ${primaryColor}20`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontFamily: bodyFontFamily,
                }}
              >
                {/* Title */}
                <h3 style={{
                  color: primaryColor,
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.3rem',
                  fontFamily: headerFontFamily,
                }}>
                  {note.title}
                </h3>

                {/* Meta info */}
                <p style={{
                  color: fontColor,
                  opacity: 0.7,
                  margin: '0 0 1rem 0',
                  fontSize: '0.9rem',
                }}>
                  Created by {note.createdByUser.firstName} {note.createdByUser.lastName} • {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                </p>

                {/* Description */}
                {note.description && (
                  <p style={{
                    color: fontColor,
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                  }}>
                    {note.description}
                  </p>
                )}

                {/* Content */}
                <p style={{
                  color: fontColor,
                  margin: '0 0 1rem 0',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {note.content}
                </p>

                {/* Attachments */}
                {note.attachments.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: `1px solid ${primaryColor}20`,
                  }}>
                    <p style={{
                      color: primaryColor,
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0',
                    }}>
                      Attachments ({note.attachments.length})
                    </p>
                    <ul style={{
                      list: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}>
                      {note.attachments.map((attachment) => (
                        <li
                          key={attachment.id}
                          style={{
                            background: `${primaryColor}10`,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            color: primaryColor,
                          }}
                        >
                          📎 {attachment.fileName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
