import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTaskComments, createTaskComment } from '@/lib/services/taskCommentService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tasks/[taskId]/comments - Get all comments for a task
 * POST /api/tasks/[taskId]/comments - Create a new comment
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const resolvedParams = await params;
  const { taskId } = resolvedParams;
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

    const comments = await getTaskComments(
      taskId,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || ''
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error(`GET /api/tasks/${taskId}/comments error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch comments' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const resolvedParams = await params;
  const { taskId } = resolvedParams;
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

    const comment = await createTaskComment(
      taskId,
      content,
      user.id,
      userRole as 'TENANT' | 'CLIENT',
      user.tenantId || ''
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${taskId}/comments error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create comment' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
