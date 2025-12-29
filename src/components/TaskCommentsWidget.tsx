'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import TaskCommentForm from './TaskCommentForm';
import TaskCommentList from './TaskCommentList';

interface TaskCommentsWidgetProps {
  taskId: string;
  primaryColor: string;
  bodyFontFamily: string;
  headerFontFamily?: string;
  isCollapsed?: boolean;
}

export default function TaskCommentsWidget({
  taskId,
  primaryColor,
  bodyFontFamily,
  headerFontFamily,
  isCollapsed = false,
}: TaskCommentsWidgetProps) {
  const [isOpen, setIsOpen] = useState(!isCollapsed);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/comments`);
        if (!response.ok) throw new Error('Failed to load comments');
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load comments:', err);
        setError('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [taskId]);

  const handleCommentAdded = (comment: any) => {
    setComments((prev) => [...prev, comment]);
    setError('');
  };

  const handleCommentUpdated = (updatedComment: any) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: `${primaryColor}05`,
        border: `2px solid ${primaryColor}30`,
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: 0,
          marginBottom: isOpen ? '1rem' : 0,
          width: '100%',
        }}
      >
        <MessageCircle size={18} color={primaryColor} />
        <h3
          style={{
            margin: 0,
            color: primaryColor,
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: headerFontFamily || bodyFontFamily,
          }}
        >
          Comments ({comments.length})
        </h3>
        <span style={{ marginLeft: 'auto', color: primaryColor }}>
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div>
          {error && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Comment Form */}
          <TaskCommentForm
            taskId={taskId}
            primaryColor={primaryColor}
            bodyFontFamily={bodyFontFamily}
            onCommentAdded={handleCommentAdded}
            onError={setError}
          />

          {/* Comment List */}
          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>
              Loading comments...
            </div>
          ) : (
            <TaskCommentList
              comments={comments}
              taskId={taskId}
              primaryColor={primaryColor}
              bodyFontFamily={bodyFontFamily}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              onError={setError}
            />
          )}
        </div>
      )}
    </div>
  );
}
