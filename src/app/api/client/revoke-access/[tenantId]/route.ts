import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Not a client' }, { status: 400 });
    }

    // Delete the access record
    const { tenantId } = await params;
    await prisma.tenantAccess.deleteMany({
      where: {
        clientProfileId: user.clientId,
        tenantId: tenantId
      }
    });

    return NextResponse.json({ success: true, message: 'Access revoked' }, { status: 200 });

  } catch (error) {
    console.error('Error revoking access:', error);
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
  }
}
