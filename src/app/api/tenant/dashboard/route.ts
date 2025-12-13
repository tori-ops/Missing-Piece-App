import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get tenant info
    const user = await prisma.user.findUnique({
      where: { email: (session.user as any)?.email || '' },
      include: { tenant: true }
    });

    if (!user || !user.tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get clients
    const clients = await prisma.clientProfile.findMany({
      where: { tenantId: user.tenantId },
      include: { users: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      businessName: user.tenant?.businessName || 'Tenant Dashboard',
      userName: session.user?.name || 'Admin',
      tenantId: user.tenantId,
      clients
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
