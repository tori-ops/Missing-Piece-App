import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMeetingNoteById, updateMeetingNote, deleteMeetingNote } from '@/lib/services/meetingNoteService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/meeting-notes/[id] - Get a single meeting note
 * PUT /api/meeting-notes/[id] - Update a meeting note
 * DELETE /api/meeting-notes/[id] - Delete a meeting note
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
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

    const note = await getMeetingNoteById(
      id,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    if (!note) {
      return NextResponse.json({ error: 'Meeting note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error(`GET /api/meeting-notes/${id} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch meeting note' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
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

    const body = await req.json();
    const { title, body: noteBody, meetingDate } = body;

    const updated = await updateMeetingNote(
      id,
      {
        title,
        body: noteBody,
        meetingDate: meetingDate ? new Date(meetingDate) : undefined,
      },
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/meeting-notes/${id} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update meeting note' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
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

    await deleteMeetingNote(
      id,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/meeting-notes/${id} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete meeting note' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
