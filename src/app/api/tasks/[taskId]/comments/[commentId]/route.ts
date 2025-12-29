import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateTaskComment, deleteTaskComment } from '@/lib/services/taskCommentService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PUT /api/tasks/[taskId]/comments/[commentId] - Update a comment
 * DELETE /api/tasks/[taskId]/comments/[commentId] - Delete a comment
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string; commentId: string }> }
) {
  const resolvedParams = await params;
  const { taskId, commentId } = resolvedParams;
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
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const updated = await updateTaskComment(
      commentId,
      content,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || ''
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/tasks/${taskId}/comments/${commentId} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update comment' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string; commentId: string }> }
) {
  const resolvedParams = await params;
  const { taskId, commentId } = resolvedParams;
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

    await deleteTaskComment(
      commentId,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || ''
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/tasks/${taskId}/comments/${commentId} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete comment' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
