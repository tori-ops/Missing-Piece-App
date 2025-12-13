import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { tenantEmail } = body;

    if (!tenantEmail) {
      return NextResponse.json({ error: 'Tenant email is required' }, { status: 400 });
    }

    // Find the tenant user
    const tenantUser = await prisma.user.findUnique({
      where: { email: tenantEmail },
      include: { tenant: true }
    });

    if (!tenantUser || !tenantUser.tenantId || tenantUser.role !== 'TENANT') {
      return NextResponse.json({ error: 'Invalid tenant' }, { status: 404 });
    }

    // Check if already shared
    const existingAccess = await prisma.tenantAccess.findUnique({
      where: {
        clientProfileId_tenantId: {
          clientProfileId: user.clientId,
          tenantId: tenantUser.tenantId
        }
      }
    });

    if (existingAccess) {
      return NextResponse.json({ error: 'Access already shared with this tenant' }, { status: 409 });
    }

    // Create tenant access
    const access = await prisma.tenantAccess.create({
      data: {
        clientProfileId: user.clientId,
        tenantId: tenantUser.tenantId,
        grantedByClientUserId: user.id
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'CLIENT_CREATED',
        entity: 'tenant_access',
        entityId: access.id,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `Access shared with ${tenantUser.tenant?.businessName || tenantEmail}`
    }, { status: 201 });

  } catch (error) {
    console.error('Error sharing access:', error);
    return NextResponse.json({ error: 'Failed to share access' }, { status: 500 });
  }
}
