import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTaskById, updateTask, deleteTask } from '@/lib/services/taskService';
import { createTaskNotifications, clearTaskNotifications } from '@/lib/services/notificationService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tasks/[taskId] - Get a specific task
 * PATCH /api/tasks/[taskId] - Update a task
 * DELETE /api/tasks/[taskId] - Delete a task
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
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

    const task = await getTaskById(
      taskId,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('GET /api/tasks/[taskId] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
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
    const { status, description, dueDate, priority, assignedToClientId, assignedToTenantId } = body;

    // Check if this is a reassignment request
    const isReassignment = assignedToClientId !== undefined || assignedToTenantId !== undefined;

    if (isReassignment) {
      // Handle reassignment - update the task with new assignment fields
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          assignedToClientId: assignedToClientId || null,
          assignedToTenantId: assignedToTenantId || null,
          lastReassignedAt: new Date(),
        },
      });

      // Create notifications for the newly assigned users
      if (assignedToClientId || assignedToTenantId) {
        try {
          await createTaskNotifications(taskId, assignedToClientId, assignedToTenantId, 'task_reassigned');
        } catch (err) {
          console.error('Error creating task notification:', err);
        }
      }

      return NextResponse.json(updatedTask);
    }

    // Handle regular task updates (status, description, etc)
    const task = await updateTask(
      taskId,
      {
        status,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
      },
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    // Handle notifications based on status change
    if (status) {
      try {
        // Get the task to find assigned users
        const fullTask = await prisma.task.findUnique({
          where: { id: taskId },
          select: {
            assignedToClientId: true,
            assignedToTenantId: true,
            clientId: true,
          },
        });

        if (fullTask) {
          // Status changed TO TODO or IN_PROGRESS - create notifications
          if (status === 'TODO' || status === 'IN_PROGRESS') {
            const clientToNotify = fullTask.assignedToClientId || fullTask.clientId;
            await createTaskNotifications(
              taskId,
              clientToNotify || undefined,
              fullTask.assignedToTenantId || undefined,
              'task_assigned'
            );
          }
          // Status changed TO COMPLETED or DELETED - clear notifications
          else if (status === 'COMPLETED' || status === 'DELETED') {
            await clearTaskNotifications(taskId);
          }
        }
      } catch (notificationError) {
        console.error('Error managing task notifications:', notificationError);
        // Don't fail the update if notifications fail
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('PATCH /api/tasks/[taskId] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
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

    await deleteTask(
      taskId,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || '',
      user.clientId || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[taskId] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete task' },
      { status: 500 }
    );
  }
}
