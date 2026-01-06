'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Calendar, Plus } from 'lucide-react';
import CreateTaskFromNoteModal from './CreateTaskFromNoteModal';

interface MeetingNote {
  id: string;
  title: string;
  body: string;
  meetingDate?: string;
  createdAt: string;
  clientId?: string;
  client?: {
    id: string;
    couple1FirstName?: string;
    couple1LastName?: string;
  };
  attachments?: Array<{
    id: string;
    fileName: string;
  }>;
}

interface MeetingNotesDetailViewProps {
  clientId?: string;
  tenantId: string;
  clients?: Array<{ id: string; couple1FirstName?: string; couple1LastName?: string; fullName?: string; name?: string }>;
  primaryColor?: string;
  fontColor?: string;
  bodyFontFamily?: string;
  headerFontFamily?: string;
  logoUrl?: string | null;
  companyName?: string;
  onBack: () => void;
}

export default function MeetingNotesDetailView({
  clientId,
  tenantId,
  clients = [],
  primaryColor = '#274E13',
  fontColor = '#000000',
  bodyFontFamily = "'Poppins', sans-serif",
  headerFontFamily = "'Playfair Display', serif",
  logoUrl,
  companyName,
  onBack,
}: MeetingNotesDetailViewProps) {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteMeetingDate, setNewNoteMeetingDate] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [newNoteClientId, setNewNoteClientId] = useState<string>('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'voice' | 'camera' | null>(null);
  const [taskFromNoteModal, setTaskFromNoteModal] = useState<{ noteId: string; title: string; body: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filters
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterTags, setFilterTags] = useState('');

  // Fetch notes
  useEffect(() => {
    fetchNotes();
  }, [clientId, tenantId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      console.log('Fetching notes for clientId:', clientId, 'tenantId:', tenantId);
      const params = new URLSearchParams({ tenantId });
      if (clientId) {
        params.append('clientId', clientId);
      }
      const response = await fetch(`/api/meeting-notes?${params.toString()}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched notes:', data);
        setNotes(data);
      } else {
        const errorData = await response.json();
        console.error('Fetch notes error:', errorData);
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
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('title', newNoteTitle);
      formData.append('body', newNoteBody);
      // Use selected clientId if provided, or the component's clientId prop
      const assignedClientId = newNoteClientId || clientId;
      if (assignedClientId) {
        formData.append('clientId', assignedClientId);
      }
      formData.append('tenantId', tenantId);
      if (newNoteMeetingDate) {
        formData.append('meetingDate', new Date(newNoteMeetingDate).toISOString());
      }
      if (newNoteTags) {
        formData.append('tags', JSON.stringify(newNoteTags.split(',').map(t => t.trim())));
      }

      // Add files to FormData
      attachmentFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      console.log('Creating note with clientId:', assignedClientId, 'tenantId:', tenantId);
      const response = await fetch('/api/meeting-notes', {
        method: 'POST',
        body: formData,
      });

      console.log('Create response status:', response.status);
      if (response.ok) {
        const createdNote = await response.json();
        console.log('Note created successfully:', createdNote);
        setSuccessMessage('Meeting note created successfully!');
        setNewNoteTitle('');
        setNewNoteBody('');
        setNewNoteMeetingDate('');
        setNewNoteTags('');
        setNewNoteClientId('');
        setAttachmentFiles([]);
        await fetchNotes();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to create note:', errorData);
        setSuccessMessage(`Error: ${errorData.error || 'Failed to create note'}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      setSuccessMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };


  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        const file = new File([blob], `voice-${Date.now()}.mp3`, { type: 'audio/mp3' });
        setAttachmentFiles([...attachmentFiles, file]);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingType(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType('voice');
    } catch (error) {
      console.error('Failed to start voice recording:', error);
    }
  };

  const startCameraRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const file = new File([blob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
        setAttachmentFiles([...attachmentFiles, file]);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingType(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType('camera');
    } catch (error) {
      console.error('Failed to start camera recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
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
      {/* Branded Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${primaryColor}20`,
      }}>
        {/* Logo */}
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            style={{
              height: '2.5rem',
              width: 'auto',
              maxWidth: '150px',
            }}
          />
        )}

        {/* Title */}
        <h2 style={{ 
          flex: logoUrl || companyName ? 1 : 'auto',
          textAlign: 'center',
          color: primaryColor,
          fontFamily: headerFontFamily,
          marginTop: 0,
          fontSize: '2.5rem',
        }}>
          Meeting Notes
        </h2>

        {/* Company Name */}
        {companyName && (
          <div style={{
            textAlign: 'right',
            fontSize: '0.95rem',
            color: fontColor,
          }}>
            <div style={{ fontWeight: '600' }}>{companyName}</div>
          </div>
        )}
      </div>

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
        marginBottom: '1.5rem',
        fontFamily: bodyFontFamily,
      }}>
        <h3 style={{ marginTop: 0, fontFamily: headerFontFamily, fontSize: '1.75rem' }}>Create New Meeting Note</h3>
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

          <div style={{ marginBottom: '1rem' }}>
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

          <div style={{ marginBottom: '1rem' }}>
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

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={isRecording && recordingType === 'voice' ? stopRecording : startVoiceRecording}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: isRecording && recordingType === 'voice' ? '#d32f2f' : '#ffffff',
                color: isRecording && recordingType === 'voice' ? '#ffffff' : primaryColor,
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: bodyFontFamily,
                whiteSpace: 'nowrap',
              }}
            >
              {isRecording && recordingType === 'voice' ? '⏹ Stop Voice' : '🎤 Voice'}
            </button>
            <button
              type="button"
              onClick={isRecording && recordingType === 'camera' ? stopRecording : startCameraRecording}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: isRecording && recordingType === 'camera' ? '#d32f2f' : '#ffffff',
                color: isRecording && recordingType === 'camera' ? '#ffffff' : primaryColor,
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: bodyFontFamily,
                whiteSpace: 'nowrap',
              }}
            >
              {isRecording && recordingType === 'camera' ? '⏹ Stop Camera' : '📹 Camera'}
            </button>
          </div>

          {!clientId && clients.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Assign to Client (Optional)</label>
              <select
                value={newNoteClientId}
                onChange={(e) => setNewNoteClientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: bodyFontFamily,
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="" disabled>Select a client...</option>
                {clients.map((client) => {
                  const clientName = client.couple1FirstName && client.couple1LastName 
                    ? `${client.couple1FirstName} ${client.couple1LastName}` 
                    : (client.fullName || client.name || 'Unnamed Client');
                  return (
                    <option key={client.id} value={client.id}>
                      {clientName}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Attachments (Documents, Images)</label>
            <input
              type="file"
              multiple
              onChange={(e) => setAttachmentFiles(Array.from(e.target.files || []))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '4px',
                fontFamily: bodyFontFamily,
              }}
            />
            {attachmentFiles.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {attachmentFiles.length} file(s) selected: {attachmentFiles.map(f => f.name).join(', ')}
              </div>
            )}
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
        <h3 style={{ marginTop: 0, color: primaryColor, fontFamily: headerFontFamily, fontSize: '1.9em' }}>Filter Notes</h3>
        
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
        <h3 style={{ color: primaryColor, fontFamily: headerFontFamily, fontSize: '1.9em' }}>
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
                  padding: '1rem',
                  background: '#f9f9f9',
                  fontFamily: bodyFontFamily,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: '0', color: fontColor, fontFamily: headerFontFamily, fontSize: '1.4rem' }}>
                        {note.title}
                      </h4>
                      {note.client && !clientId && (
                        <span style={{
                          display: 'inline-block',
                          background: primaryColor,
                          color: '#ffffff',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}>
                          {note.client.couple1FirstName} {note.client.couple1LastName}
                        </span>
                      )}
                    </div>

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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => setTaskFromNoteModal({ noteId: note.id, title: note.title, body: note.body })}
                      style={{
                        background: primaryColor,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontFamily: bodyFontFamily,
                        fontSize: '0.85rem',
                      }}
                      title="Create task from this note"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task from Note Modal */}
        {taskFromNoteModal && (
          <CreateTaskFromNoteModal
            noteId={taskFromNoteModal.noteId}
            noteTitle={taskFromNoteModal.title}
            noteBody={taskFromNoteModal.body}
            clientId={clientId}
            tenantId={tenantId}
            primaryColor={primaryColor}
            fontColor={fontColor}
            onClose={() => setTaskFromNoteModal(null)}
            onTaskCreated={() => {
              setTaskFromNoteModal(null);
              setSuccessMessage('Task created successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              // Note: Tasks widget will refresh when user navigates to it
            }}
          />
        )}

        {/* Back Button (Bottom) */}
        <button
          onClick={onBack}
          style={{
            background: `${primaryColor}20`,
            color: primaryColor,
            border: `1px solid ${primaryColor}`,
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: bodyFontFamily,
            transition: 'all 0.2s ease',
            marginTop: '2rem',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = primaryColor;
            (e.currentTarget as HTMLButtonElement).style.color = 'white';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}20`;
            (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
