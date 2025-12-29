import { prisma } from '@/lib/prisma';

export interface TaskCommentWithAuthor {
  id: string;
  taskId: string;
  createdByUserId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Get all comments for a task
 * Returns comments with creator info and permission flags
 */
export async function getTaskComments(
  taskId: string,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string
): Promise<TaskCommentWithAuthor[]> {
  // First verify user has access to the task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, assigneeId: true, assigneeType: true, tenantId: true },
  });

  if (!task || task.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  // Verify task is accessible to user
  if (userRole === 'CLIENT') {
    const client = await prisma.clientProfile.findFirst({
      where: { tenantId },
      select: { id: true },
    });
    if (!client || (task.assigneeType === 'CLIENT' && task.assigneeId !== client.id)) {
      throw new Error('Unauthorized');
    }
  }

  // Get all comments
  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return comments.map((comment) => ({
    ...comment,
    canEdit: comment.createdByUserId === userId,
    canDelete: comment.createdByUserId === userId,
  }));
}

/**
 * Create a new comment on a task
 */
export async function createTaskComment(
  taskId: string,
  content: string,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string
): Promise<TaskCommentWithAuthor> {
  if (!content.trim()) {
    throw new Error('Comment cannot be empty');
  }

  // Verify user has access to the task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, assignedTo: true, assignedToClientId: true, tenantId: true },
  });

  if (!task || task.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  // Verify task is accessible to user
  if (userRole === 'CLIENT') {
    const client = await prisma.clientProfile.findFirst({
      where: { tenantId },
      select: { id: true },
    });
    if (!client || task.assignedToClientId !== client.id) {
      throw new Error('Unauthorized');
    }
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      content,
      createdByUserId: userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    ...comment,
    canEdit: true,
    canDelete: true,
  };
}

/**
 * Update a task comment (creator only)
 */
export async function updateTaskComment(
  commentId: string,
  content: string,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string
): Promise<TaskCommentWithAuthor> {
  if (!content.trim()) {
    throw new Error('Comment cannot be empty');
  }

  // Get the comment and verify ownership
  const comment = await prisma.taskComment.findUnique({
    where: { id: commentId },
    include: {
      task: {
        select: { tenantId: true },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.task.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  if (comment.createdByUserId !== userId) {
    throw new Error('You can only edit your own comments');
  }

  const updated = await prisma.taskComment.update({
    where: { id: commentId },
    data: { content },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    ...updated,
    canEdit: true,
    canDelete: true,
  };
}

/**
 * Delete a task comment (creator only)
 */
export async function deleteTaskComment(
  commentId: string,
  userId: string,
  userRole: 'TENANT' | 'CLIENT',
  tenantId: string
): Promise<void> {
  // Get the comment and verify ownership
  const comment = await prisma.taskComment.findUnique({
    where: { id: commentId },
    include: {
      task: {
        select: { tenantId: true },
      },
    },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.task.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  if (comment.createdByUserId !== userId) {
    throw new Error('You can only delete your own comments');
  }

  await prisma.taskComment.delete({
    where: { id: commentId },
  });
}
