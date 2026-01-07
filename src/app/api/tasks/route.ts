import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listTasks, createTask } from '@/lib/services/taskService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tasks - List tasks for current user
 * POST /api/tasks - Create a new task
 */

export async function GET(req: NextRequest) {
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

    // Get clientId from query params if provided (for filtering to specific client)
    const { searchParams } = new URL(req.url);
    const queryClientId = searchParams.get('clientId');

    // Use query param clientId if provided, otherwise use user's clientId
    const effectiveClientId = queryClientId || user.clientId || undefined;

    const tasks = await listTasks(
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      effectiveClientId
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
    const {
      title,
      description,
      dueDate,
      priority,
      assigneeType,
      assigneeId,
      assignedToClientId,
      assignedToTenantId,
      clientId,
      meetingNoteId,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    // If not creating from a meeting note, require assigneeType and assigneeId
    if (!meetingNoteId && (!assigneeType || !assigneeId)) {
      return NextResponse.json(
        { error: 'Missing required fields: assigneeType, assigneeId' },
        { status: 400 }
      );
    }

    // Validate assignment permissions based on user role (if assignee provided)
    if (assigneeType && assigneeId) {
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
    }

    // Determine the effective assignee based on user role
    let effectiveAssigneeType = assigneeType;
    let effectiveAssigneeId = assigneeId;

    if (!assigneeType || !assigneeId) {
      // Default assignment based on user role
      if (userRole === 'TENANT') {
        effectiveAssigneeType = 'TENANT';
        effectiveAssigneeId = user.tenantId;
      } else if (userRole === 'CLIENT') {
        effectiveAssigneeType = 'CLIENT';
        effectiveAssigneeId = user.clientId;
      }
    }

    const task = await createTask({
      tenantId: userRole === 'TENANT' ? user.tenantId! : (user.tenantId || ''),
      clientId: userRole === 'CLIENT' ? user.clientId : (clientId || undefined),
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      assigneeType: effectiveAssigneeType,
      assigneeId: effectiveAssigneeId,
      createdByUserId: user.id,
      meetingNoteId,
      assignedToClientId: assignedToClientId || undefined,
      assignedToTenantId: assignedToTenantId || undefined,
    });

    // TODO: Create notifications for assigned users
    // if (assignedToClientId) {
    //   await createNotification(assignedToClientId, 'task_assigned', task.id);
    // }
    // if (assignedToTenantId) {
    //   await createNotification(assignedToTenantId, 'task_assigned', task.id);
    // }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    );
  }
}
