'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface MeetingNoteFormProps {
  primaryColor: string;
  bodyFontFamily: string;
  noteId?: string;
  initialTitle?: string;
  initialBody?: string;
  initialMeetingDate?: string;
  onSubmit: (data: {
    title: string;
    body: string;
    meetingDate?: string;
    files?: File[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function MeetingNoteForm({
  primaryColor,
  bodyFontFamily,
  noteId,
  initialTitle = '',
  initialBody = '',
  initialMeetingDate = '',
  onSubmit,
  onCancel,
}: MeetingNoteFormProps) {
  const [formData, setFormData] = useState({
    title: initialTitle,
    body: initialBody,
    meetingDate: initialMeetingDate,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Note title is required');
      return;
    }

    if (!formData.body.trim()) {
      setError('Note content is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title,
        body: formData.body,
        meetingDate: formData.meetingDate || undefined,
        files: files.length > 0 ? files : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '1.5rem',
        fontFamily: bodyFontFamily,
      }}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Title Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="title"
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Note Title <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Planning Meeting - December 28"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Meeting Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="meetingDate"
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Meeting Date
          </label>
          <input
            id="meetingDate"
            name="meetingDate"
            type="date"
            value={formData.meetingDate}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Body Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="body"
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Note Content <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Write your meeting notes here..."
            rows={8}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontWeight: '600',
              color: primaryColor,
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            Attachments (Max 5 files, 7MB each)
          </label>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '4px',
              border: `2px dashed ${primaryColor}40`,
              background: `${primaryColor}05`,
              color: primaryColor,
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontFamily: bodyFontFamily,
              transition: 'all 0.2s',
              marginBottom: '1rem',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}10`;
              (e.currentTarget as HTMLButtonElement).style.borderColor = primaryColor;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}05`;
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${primaryColor}40`;
            }}
          >
            📎 Click to add files or drag & drop
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xlsx,.txt"
            style={{ display: 'none' }}
          />

          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: `${primaryColor}10`,
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      marginLeft: '0.5rem',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit & Cancel */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: `1px solid ${primaryColor}40`,
              background: 'transparent',
              color: primaryColor,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              background: primaryColor,
              color: '#fff',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }
            }}
          >
            {isSubmitting ? 'Saving...' : noteId ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
