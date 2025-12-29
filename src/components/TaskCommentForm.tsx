'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface TaskCommentFormProps {
  taskId: string;
  primaryColor: string;
  bodyFontFamily: string;
  onCommentAdded: (comment: any) => void;
  onError?: (error: string) => void;
}

export default function TaskCommentForm({
  taskId,
  primaryColor,
  bodyFontFamily,
  onCommentAdded,
  onError,
}: TaskCommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      const comment = await response.json();
      onCommentAdded(comment);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add comment';
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Add a comment..."
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '6px',
            border: `1px solid ${primaryColor}40`,
            fontFamily: bodyFontFamily,
            fontSize: '0.9rem',
            resize: 'none',
            maxHeight: '150px',
            minHeight: '40px',
            boxSizing: 'border-box',
          }}
          rows={1}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: primaryColor,
            color: '#fff',
            cursor: !content.trim() || isSubmitting ? 'not-allowed' : 'pointer',
            opacity: !content.trim() || isSubmitting ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            fontSize: '0.85rem',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            if (content.trim() && !isSubmitting) {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (content.trim() && !isSubmitting) {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }
          }}
        >
          <Send size={16} />
          Post
        </button>
      </div>
    </form>
  );
}
