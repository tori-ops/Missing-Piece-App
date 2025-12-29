import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMeetingNoteById, deleteAttachment } from '@/lib/services/meetingNoteService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/meeting-notes/[id]/attachments/[attachmentId] - Delete attachment
 */

export async function DELETE(
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
    
    // Get attachmentId from URL search params or path
    const url = new URL(req.url);
    const attachmentId = url.searchParams.get('attachmentId');

    if (!attachmentId) {
      return NextResponse.json({ error: 'Attachment ID is required' }, { status: 400 });
    }

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

    // Get attachment to verify it belongs to this note
    const attachment = await prisma.meetingNoteAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.meetingNoteId !== params.id) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Delete from database
    await deleteAttachment(attachmentId);

    // TODO: Delete file from disk in production
    // For now, files remain on disk for safety

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE attachment error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
