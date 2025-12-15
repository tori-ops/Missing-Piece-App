import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * DELETE /api/tenant/clients/[clientId]
 * Delete a client profile (TENANT only)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true }
    });

    if (!user || user.role !== 'TENANT' || !user.tenantId) {
      return NextResponse.json({ error: 'Only tenants can delete clients' }, { status: 403 });
    }

    // Get the client to verify they belong to this tenant
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      include: { tenant: true }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify the client belongs to this tenant
    if (client.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Cannot delete client from another tenant' }, { status: 403 });
    }

    // Delete the client profile (CASCADE will handle related records)
    const deletedClient = await prisma.clientProfile.delete({
      where: { id: clientId }
    });

    return NextResponse.json(
      {
        message: 'Client deleted successfully',
        client: {
          id: deletedClient.id,
          email: deletedClient.contactEmail,
          name: `${deletedClient.couple1FirstName} ${deletedClient.couple1LastName}`
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
