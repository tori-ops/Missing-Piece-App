import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listTasks, createTask } from '@/lib/services/taskService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tasks - List tasks for current user
 * POST /api/tasks - Create a new task
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

    const tasks = await listTasks(
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tasks' },
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
        { error: 'Only tenants and clients can create tasks' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate user has required ID for their role
    if (userRole === 'TENANT' && !user.tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    if (userRole === 'CLIENT' && !user.clientId) {
      return NextResponse.json({ error: 'Client ID not found' }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, dueDate, priority, assigneeType, assigneeId, clientId, meetingNoteId } = body;

    if (!title || !assigneeType || !assigneeId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, assigneeType, assigneeId' },
        { status: 400 }
      );
    }

    // Validate assignment permissions based on user role
    if (userRole === 'CLIENT') {
      // CLIENT can only assign to themselves (CLIENT) or their tenant
      if (assigneeType === 'CLIENT' && assigneeId !== user.clientId) {
        return NextResponse.json(
          { error: 'You can only assign tasks to yourself' },
          { status: 403 }
        );
      }
      if (assigneeType === 'TENANT') {
        if (!user.tenantId) {
          return NextResponse.json(
            { error: 'Tenant not found for this client' },
            { status: 400 }
          );
        }
        if (assigneeId !== user.tenantId) {
          return NextResponse.json(
            { error: 'You can only assign to your coordinator' },
            { status: 403 }
          );
        }
      }
    }

    const task = await createTask({
      tenantId: userRole === 'TENANT' ? user.tenantId! : (user.tenantId || ''),
      clientId: userRole === 'CLIENT' ? user.clientId : (clientId || undefined),
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      assigneeType,
      assigneeId,
      createdByUserId: user.id,
      meetingNoteId,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    );
  }
}
