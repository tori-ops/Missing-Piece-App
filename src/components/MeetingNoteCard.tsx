'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface MeetingNoteCardProps {
  note: {
    id: string;
    title: string;
    body: string;
    meetingDate: string | null;
    createdAt: string;
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
  };
  primaryColor: string;
  bodyFontFamily: string;
  userRole: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onUpdate: (note: any) => void;
}

export default function MeetingNoteCard({
  note,
  primaryColor,
  bodyFontFamily,
  userRole,
  currentUserId,
  onDelete,
  onUpdate,
}: MeetingNoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAttachment, setIsDeletingAttachment] = useState<string | null>(null);

  const createdDate = new Date(note.createdAt).toLocaleDateString();
  const creatorName = `${note.createdByUser.firstName} ${note.createdByUser.lastName}`;
  const meetingDateFormatted = note.meetingDate ? new Date(note.meetingDate).toLocaleDateString() : null;
  
  // Determine if user can edit/delete (only creator or admins)
  const isCreator = currentUserId === note.createdByUser.id;
  const canDelete = isCreator;

  const bodyPreview = note.body.split('\n').slice(0, 3).join('\n');
  const isBodyTruncated = note.body.split('\n').length > 3 || note.body.length > 150;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meeting-notes/${note.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');
      onDelete(note.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Remove this attachment?')) return;

    setIsDeletingAttachment(attachmentId);
    try {
      const response = await fetch(`/api/meeting-notes/attachments?attachmentId=${attachmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete attachment');

      // Update note in list
      const updatedNote = {
        ...note,
        attachments: note.attachments.filter((a) => a.id !== attachmentId),
      };
      onUpdate(updatedNote);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete attachment');
    } finally {
      setIsDeletingAttachment(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType.toLowerCase())) {
      return '🖼️';
    }
    return '📄';
  };

  return (
    <div
      style={{
        border: `1px solid ${primaryColor}30`,
        borderRadius: '8px',
        padding: '1rem',
        background: '#fafafa',
        fontFamily: bodyFontFamily,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: primaryColor, fontSize: '1.1rem', fontWeight: '600' }}>
            {note.title}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
            <span style={{ color: primaryColor, fontWeight: '500' }}>{creatorName}</span>
            {' • '}
            {createdDate}
            {meetingDateFormatted && ` • Meeting: ${meetingDateFormatted}`}
          </p>
        </div>

        {/* Actions */}
        {canDelete && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                background: '#FEE2E2',
                border: 'none',
                color: '#DC2626',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                opacity: isDeleting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#FECACA';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2';
                }
              }}
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ marginBottom: '1rem' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: '1.5',
            color: '#333',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {isExpanded ? note.body : bodyPreview}
          {isBodyTruncated && (
            <>
              {!isExpanded && '...'}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: primaryColor,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  padding: '0.25rem 0',
                  marginTop: '0.5rem',
                  textDecoration: 'underline',
                }}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            </>
          )}
        </p>
      </div>

      {/* Attachments */}
      {note.attachments.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${primaryColor}20` }}>
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            style={{
              background: 'transparent',
              border: 'none',
              color: primaryColor,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            📎 {note.attachments.length} file{note.attachments.length !== 1 ? 's' : ''}
            {showAttachments ? ' ▼' : ' ▶'}
          </button>

          {showAttachments && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {note.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: `${primaryColor}10`,
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                  }}
                >
                  <a
                    href={attachment.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      color: primaryColor,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{getFileIcon(attachment.fileType)}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attachment.fileName}
                    </span>
                  </a>

                  {canDelete && (
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      disabled={isDeletingAttachment === attachment.id}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#DC2626',
                        cursor: isDeletingAttachment === attachment.id ? 'not-allowed' : 'pointer',
                        padding: '0.25rem 0.5rem',
                        marginLeft: '0.5rem',
                        opacity: isDeletingAttachment === attachment.id ? 0.6 : 1,
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
