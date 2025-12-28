import { prisma } from '@/lib/prisma';
import type { Task, TaskStatus, TaskPriority } from '@prisma/client';

/**
 * Task Service - handles all task operations with tenant/client isolation
 */

export interface CreateTaskInput {
  tenantId: string;
  clientId?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  assigneeType: 'TENANT' | 'CLIENT';
  assigneeId: string; // tenantId or clientId based on assigneeType
  createdByUserId: string;
  source?: 'MANUAL' | 'MEETING_NOTE';
  meetingNoteId?: string;
}

export interface UpdateTaskInput {
  status?: TaskStatus;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
}

/**
 * List all tasks for a user (TENANT or CLIENT)
 * Enforces strict isolation - TENANTs see their tasks, CLIENTs see their own tasks
 */
export async function listTasks(
  _userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<Task[]> {
  try {
    if (userRole === 'TENANT') {
      // TENANT sees all tasks they're assigned to OR tasks in their tenant
      return await prisma.task.findMany({
        where: {
          tenantId,
          OR: [
            { assigneeType: 'TENANT', assigneeId: tenantId },
            { assigneeType: 'CLIENT' }, // Also show CLIENT tasks for visibility
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === 'CLIENT' && clientId) {
      // CLIENT sees only tasks assigned to them
      return await prisma.task.findMany({
        where: {
          clientId,
          assigneeType: 'CLIENT',
          assigneeId: clientId,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  } catch (error) {
    console.error('Error listing tasks:', error);
    throw error;
  }
}

/**
 * Get a single task by ID with access control
 */
export async function getTaskById(
  taskId: string,
  _userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<Task | null> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) return null;

    // Access control: verify user can access this task
    if (task.tenantId !== tenantId) {
      throw new Error('Unauthorized: task does not belong to your tenant');
    }

    if (userRole === 'CLIENT' && clientId) {
      // CLIENT can only see tasks assigned to them
      if (task.assigneeType !== 'CLIENT' || task.assigneeId !== clientId) {
        throw new Error('Unauthorized: you cannot access this task');
      }
    }

    return task;
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  try {
    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: input.tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // If assigning to CLIENT, verify client exists and belongs to tenant
    if (input.assigneeType === 'CLIENT' && input.clientId) {
      const client = await prisma.clientProfile.findUnique({
        where: { id: input.clientId },
      });

      if (!client || client.tenantId !== input.tenantId) {
        throw new Error('Client not found or does not belong to this tenant');
      }
    }

    const task = await prisma.task.create({
      data: {
        tenantId: input.tenantId,
        clientId: input.clientId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        priority: input.priority || 'MEDIUM',
        assigneeType: input.assigneeType,
        assigneeId: input.assigneeId,
        createdByUserId: input.createdByUserId,
        source: input.source || 'MANUAL',
        meetingNoteId: input.meetingNoteId,
      },
    });

    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Update a task - with access control
 */
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<Task> {
  try {
    // Verify access first
    const task = await getTaskById(taskId, userId, userRole, tenantId, clientId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: input.status,
        description: input.description,
        dueDate: input.dueDate,
        priority: input.priority,
        updatedAt: new Date(),
      },
    });

    return updated;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Delete a task - with access control
 */
export async function deleteTask(
  taskId: string,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string,
  clientId?: string
): Promise<void> {
  try {
    // Verify access first
    const task = await getTaskById(taskId, userId, userRole, tenantId, clientId);
    if (!task) {
      throw new Error('Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Create tasks from a meeting note
 * If assignTo is 'BOTH', creates two tasks with the same taskGroupId
 */
export async function createTasksFromNote(
  meetingNoteId: string,
  tenantId: string,
  clientId: string | undefined,
  input: {
    title: string;
    description?: string;
    dueDate?: Date;
    priority?: TaskPriority;
    assignTo: 'TENANT' | 'CLIENT' | 'BOTH';
  },
  createdByUserId: string
): Promise<Task[]> {
  try {
    const taskGroupId = Math.random().toString(36).substring(7); // Simple grouping ID
    const createdTasks: Task[] = [];

    if (input.assignTo === 'TENANT' || input.assignTo === 'BOTH') {
      const tenantTask = await createTask({
        tenantId,
        clientId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        priority: input.priority,
        assigneeType: 'TENANT',
        assigneeId: tenantId,
        createdByUserId,
        source: 'MEETING_NOTE',
        meetingNoteId,
      });

      // Update with taskGroupId if BOTH
      if (input.assignTo === 'BOTH') {
        await prisma.task.update({
          where: { id: tenantTask.id },
          data: { taskGroupId },
        });
      }

      createdTasks.push(tenantTask);
    }

    if ((input.assignTo === 'CLIENT' || input.assignTo === 'BOTH') && clientId) {
      const clientTask = await createTask({
        tenantId,
        clientId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        priority: input.priority,
        assigneeType: 'CLIENT',
        assigneeId: clientId,
        createdByUserId,
        source: 'MEETING_NOTE',
        meetingNoteId,
      });

      // Update with taskGroupId if BOTH
      if (input.assignTo === 'BOTH') {
        await prisma.task.update({
          where: { id: clientTask.id },
          data: { taskGroupId },
        });
      }

      createdTasks.push(clientTask);
    }

    return createdTasks;
  } catch (error) {
    console.error('Error creating tasks from note:', error);
    throw error;
  }
}
