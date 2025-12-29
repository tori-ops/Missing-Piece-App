import { prisma } from '@/lib/prisma';
import type { MeetingNote, MeetingNoteAttachment } from '@prisma/client';

/**
 * Meeting Note Service - handles all meeting note operations with tenant/client isolation
 */

export interface CreateMeetingNoteInput {
  tenantId: string;
  clientId?: string;
  createdByUserId: string;
  title: string;
  body: string;
  meetingDate?: Date;
}

export interface UpdateMeetingNoteInput {
  title?: string;
  body?: string;
  meetingDate?: Date;
}

export interface MeetingNoteWithAttachments extends MeetingNote {
  attachments: MeetingNoteAttachment[];
  creatorName: string;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * List all meeting notes for a user (TENANT or CLIENT)
 * TENANTs see all notes in their tenant
 * CLIENTs see only notes created for them
 */
export async function listMeetingNotes(
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<MeetingNoteWithAttachments[]> {
  try {
    if (userRole === 'TENANT') {
      // TENANT sees all notes in their tenant
      const notes = await prisma.meetingNote.findMany({
        where: {
          tenantId,
        },
        include: {
          attachments: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
              fileType: true,
              fileSizeBytes: true,
              mimeType: true,
              createdAt: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return notes.map((note) => ({
        ...note,
        attachments: note.attachments,
        creatorName: note.createdBy
          ? `${note.createdBy.firstName} ${note.createdBy.lastName}`
          : 'Unknown',
        canEdit: note.createdByUserId === userId,
        canDelete: note.createdByUserId === userId,
      }));
    } else if (userRole === 'CLIENT' && clientId) {
      // CLIENT sees only notes created for them
      const notes = await prisma.meetingNote.findMany({
        where: {
          clientId,
          tenantId, // Ensure it's within their tenant
        },
        include: {
          attachments: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
              fileType: true,
              fileSizeBytes: true,
              mimeType: true,
              createdAt: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return notes.map((note) => ({
        ...note,
        attachments: note.attachments,
        creatorName: note.createdBy
          ? `${note.createdBy.firstName} ${note.createdBy.lastName}`
          : 'Unknown',
        canEdit: note.createdByUserId === userId,
        canDelete: note.createdByUserId === userId,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error listing meeting notes:', error);
    throw error;
  }
}

/**
 * Get a single meeting note by ID with access control
 */
export async function getMeetingNoteById(
  noteId: string,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<MeetingNoteWithAttachments | null> {
  try {
    const note = await prisma.meetingNote.findUnique({
      where: { id: noteId },
      include: {
        attachments: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            fileType: true,
            fileSizeBytes: true,
            mimeType: true,
            createdAt: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!note) return null;

    // Access control: verify user can access this note
    if (note.tenantId !== tenantId) {
      throw new Error('Unauthorized: note does not belong to your tenant');
    }

    if (userRole === 'CLIENT' && clientId) {
      // CLIENT can only see notes created for them
      if (note.clientId !== clientId) {
        throw new Error('Unauthorized: you cannot access this note');
      }
    }

    return {
      ...note,
      attachments: note.attachments,
      creatorName: note.createdBy
        ? `${note.createdBy.firstName} ${note.createdBy.lastName}`
        : 'Unknown',
      canEdit: note.createdByUserId === userId,
      canDelete: note.createdByUserId === userId,
    };
  } catch (error) {
    console.error('Error getting meeting note:', error);
    throw error;
  }
}

/**
 * Create a new meeting note
 */
export async function createMeetingNote(
  input: CreateMeetingNoteInput
): Promise<MeetingNote> {
  try {
    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: input.tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // If clientId provided, verify client exists and belongs to tenant
    if (input.clientId) {
      const client = await prisma.clientProfile.findUnique({
        where: { id: input.clientId },
      });

      if (!client || client.tenantId !== input.tenantId) {
        throw new Error('Client not found or does not belong to this tenant');
      }
    }

    const note = await prisma.meetingNote.create({
      data: {
        tenantId: input.tenantId,
        clientId: input.clientId,
        createdByUserId: input.createdByUserId,
        title: input.title,
        body: input.body,
        meetingDate: input.meetingDate,
      },
    });

    return note;
  } catch (error) {
    console.error('Error creating meeting note:', error);
    throw error;
  }
}

/**
 * Update a meeting note - only creator can update
 */
export async function updateMeetingNote(
  noteId: string,
  input: UpdateMeetingNoteInput,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<MeetingNote> {
  try {
    // Get the note first for access control
    const note = await getMeetingNoteById(noteId, userId, userRole, tenantId, clientId);

    if (!note) {
      throw new Error('Meeting note not found');
    }

    // Only creator can update
    if (note.createdByUserId !== userId) {
      throw new Error('Unauthorized: only the creator can update this note');
    }

    const updated = await prisma.meetingNote.update({
      where: { id: noteId },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        body: input.body !== undefined ? input.body : undefined,
        meetingDate: input.meetingDate !== undefined ? input.meetingDate : undefined,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error updating meeting note:', error);
    throw error;
  }
}

/**
 * Delete a meeting note - only creator can delete
 */
export async function deleteMeetingNote(
  noteId: string,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<void> {
  try {
    // Get the note first for access control
    const note = await getMeetingNoteById(noteId, userId, userRole, tenantId, clientId);

    if (!note) {
      throw new Error('Meeting note not found');
    }

    // Only creator can delete
    if (note.createdByUserId !== userId) {
      throw new Error('Unauthorized: only the creator can delete this note');
    }

    await prisma.meetingNote.delete({
      where: { id: noteId },
    });
  } catch (error) {
    console.error('Error deleting meeting note:', error);
    throw error;
  }
}

/**
 * Add attachment metadata to meeting note
 * (Actual file upload happens in API route)
 */
export async function addAttachment(
  noteId: string,
  attachment: {
    fileName: string;
    filePath: string;
    fileType: 'image' | 'document';
    fileSizeBytes: number;
    mimeType: string;
  }
): Promise<MeetingNoteAttachment> {
  try {
    const attachmentRecord = await prisma.meetingNoteAttachment.create({
      data: {
        meetingNoteId: noteId,
        fileName: attachment.fileName,
        filePath: attachment.filePath,
        fileType: attachment.fileType,
        fileSizeBytes: attachment.fileSizeBytes,
        mimeType: attachment.mimeType,
      },
    });

    return attachmentRecord;
  } catch (error) {
    console.error('Error adding attachment:', error);
    throw error;
  }
}

/**
 * Delete attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  try {
    await prisma.meetingNoteAttachment.delete({
      where: { id: attachmentId },
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
}
