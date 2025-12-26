import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('id');

    if (!tenantId) {
      return Response.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Update tenant status to suspended
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'SUSPENDED' },
    });

    return Response.json(
      { 
        success: true,
        message: 'Tenant account suspended successfully',
        tenant: updatedTenant 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Suspend tenant error:', error);
    return Response.json(
      { error: 'Failed to suspend tenant' },
      { status: 500 }
    );
  }
}
