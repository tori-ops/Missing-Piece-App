import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'TENANT' || !user.tenantId) {
      return NextResponse.json({ error: 'Only TENANT users can update clients' }, { status: 403 });
    }

    const { clientId } = await params;
    const { enabled } = await request.json();

    // Verify client belongs to tenant
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (client.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update website builder enabled flag
    const updated = await prisma.clientProfile.update({
      where: { id: clientId },
      data: { websiteBuilderEnabled: enabled },
      select: {
        id: true,
        websiteBuilderEnabled: true,
      }
    });

    return NextResponse.json(updated, { status: 200 });

  } catch (error) {
    console.error('Error updating website builder:', error);
    return NextResponse.json({ error: 'Failed to update website builder' }, { status: 500 });
  }
}
