import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMeetingNoteById, addAttachment } from '@/lib/services/meetingNoteService';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/meeting-notes/[id]/attachments - Upload attachment
 */

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = (session.user as any)?.email;
    const userRole = (session.user as any)?.role;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user can edit this note (must be creator)
    const note = await getMeetingNoteById(
      params.id,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    if (!note) {
      return NextResponse.json({ error: 'Meeting note not found' }, { status: 404 });
    }

    if (!note.canEdit) {
      return NextResponse.json({ error: 'You cannot edit this note' }, { status: 403 });
    }

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Max 5 files per note
    const existingAttachments = note.attachments.length;
    if (existingAttachments + files.length > 5) {
      return NextResponse.json(
        { error: `Maximum 5 attachments per note. Current: ${existingAttachments}` },
        { status: 400 }
      );
    }

    const uploadedAttachments = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 7MB limit` },
          { status: 400 }
        );
      }

      // Determine file type and validate
      const mimeType = file.type;
      let fileType: 'image' | 'document';

      if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        fileType = 'image';
      } else if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
        fileType = 'document';
      } else {
        return NextResponse.json(
          { error: `File type ${mimeType} is not allowed` },
          { status: 400 }
        );
      }

      // Create upload directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'meetings', params.id);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
      const filePath = `/uploads/meetings/${params.id}/${fileName}`;
      const fullPath = join(uploadDir, fileName);

      // Write file to disk
      const bytes = await file.arrayBuffer();
      await writeFile(fullPath, Buffer.from(bytes));

      // Save attachment metadata to database
      const attachment = await addAttachment(params.id, {
        fileName: file.name,
        filePath,
        fileType,
        fileSizeBytes: file.size,
        mimeType,
      });

      uploadedAttachments.push(attachment);
    }

    return NextResponse.json(uploadedAttachments, { status: 201 });
  } catch (error) {
    console.error(`POST /api/meeting-notes/${params.id}/attachments error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload attachments' },
      { status: 500 }
    );
  }
}

