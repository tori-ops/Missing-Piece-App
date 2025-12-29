import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listMeetingNotes, createMeetingNote } from '@/lib/services/meetingNoteService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/meeting-notes - List meeting notes for current user
 * POST /api/meeting-notes - Create a new meeting note
 */

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = (session.user as any)?.email;
    const userRole = (session.user as any)?.role;

    if (!userRole || !['TENANT', 'CLIENT'].includes(userRole)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    // Fetch user to get tenant/client IDs
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userRole === 'TENANT' && !user.tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    if (userRole === 'CLIENT' && !user.clientId) {
      return NextResponse.json({ error: 'Client ID not found' }, { status: 400 });
    }

    const notes = await listMeetingNotes(
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/meeting-notes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch meeting notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = (session.user as any)?.email;
    const userRole = (session.user as any)?.role;

    if (!userRole || !['TENANT', 'CLIENT'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only tenants and clients can create meeting notes' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userRole === 'TENANT' && !user.tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    if (userRole === 'CLIENT' && !user.clientId) {
      return NextResponse.json({ error: 'Client ID not found' }, { status: 400 });
    }

    const body = await req.json();
    const { title, body: noteBody, meetingDate, clientId } = body;

    if (!title || !noteBody) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body' },
        { status: 400 }
      );
    }

    // Validation: TENANT can create notes and assign to themselves or their clients
    // CLIENT can only create notes for themselves
    let finalClientId: string | undefined;

    if (userRole === 'TENANT') {
      // TENANT can optionally assign to a client
      finalClientId = clientId || undefined;
      if (clientId) {
        const client = await prisma.clientProfile.findUnique({
          where: { id: clientId },
        });
        if (!client || client.tenantId !== user.tenantId) {
          return NextResponse.json(
            { error: 'Client does not belong to your tenant' },
            { status: 403 }
          );
        }
      }
    } else {
      // CLIENT can only create notes for themselves (not assignable)
      finalClientId = undefined;
    }

    const note = await createMeetingNote({
      tenantId: user.tenantId!,
      clientId: finalClientId,
      createdByUserId: user.id,
      title,
      body: noteBody,
      meetingDate: meetingDate ? new Date(meetingDate) : undefined,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('POST /api/meeting-notes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting note' },
      { status: 500 }
    );
  }
}
