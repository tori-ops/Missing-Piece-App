'use client';

import { useState } from 'react';
import { Trash2, Edit2, X, Check } from 'lucide-react';

interface TaskCommentListProps {
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
    canEdit: boolean;
    canDelete: boolean;
  }>;
  taskId: string;
  primaryColor: string;
  bodyFontFamily: string;
  onCommentUpdated: (comment: any) => void;
  onCommentDeleted: (commentId: string) => void;
  onError?: (error: string) => void;
}

export default function TaskCommentList({
  comments,
  taskId,
  primaryColor,
  bodyFontFamily,
  onCommentUpdated,
  onCommentDeleted,
  onError,
}: TaskCommentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleStartEdit = (comment: any) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsSubmitting(commentId);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update comment');
      }

      const updated = await response.json();
      onCommentUpdated(updated);
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update comment';
      onError?.(message);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    setIsSubmitting(commentId);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      onCommentDeleted(commentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment';
      onError?.(message);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#999',
          padding: '2rem 1rem',
          fontSize: '0.9rem',
        }}
      >
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {comments.map((comment) => (
        <div
          key={comment.id}
          style={{
            padding: '1rem',
            background: `${primaryColor}08`,
            border: `1px solid ${primaryColor}20`,
            borderRadius: '6px',
            fontFamily: bodyFontFamily,
          }}
        >
          {/* Header with author and timestamp */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.5rem',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: primaryColor,
                }}
              >
                {comment.createdBy.firstName} {comment.createdBy.lastName}
              </p>
              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.75rem',
                  color: '#999',
                }}
              >
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Action buttons */}
            {(comment.canEdit || comment.canDelete) && !editingId && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {comment.canEdit && (
                  <button
                    onClick={() => handleStartEdit(comment)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: primaryColor,
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {comment.canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isSubmitting === comment.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#DC2626',
                      cursor: isSubmitting === comment.id ? 'not-allowed' : 'pointer',
                      padding: '0.25rem 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isSubmitting === comment.id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content - editing or display */}
          {editingId === comment.id ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: `1px solid ${primaryColor}40`,
                  fontFamily: bodyFontFamily,
                  fontSize: '0.9rem',
                  marginBottom: '0.75rem',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: `1px solid ${primaryColor}40`,
                    background: 'transparent',
                    color: primaryColor,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={!editContent.trim() || isSubmitting === comment.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: primaryColor,
                    color: '#fff',
                    cursor:
                      !editContent.trim() || isSubmitting === comment.id
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    opacity:
                      !editContent.trim() || isSubmitting === comment.id ? 0.5 : 1,
                  }}
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#333',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {comment.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
