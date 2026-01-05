import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  _request: Request,
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
      return NextResponse.json({ error: 'Only TENANT users can view clients' }, { status: 403 });
    }

    const { clientId } = await params;

    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        couple1FirstName: true,
        couple1LastName: true,
        couple2FirstName: true,
        couple2LastName: true,
        contactEmail: true,
        contactPhone: true,
        weddingDate: true,
        weddingLocation: true,
        budgetCents: true,
        status: true,
        createdAt: true,
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify the client belongs to the tenant
    const clientBelongsToTenant = await prisma.clientProfile.findFirst({
      where: {
        id: clientId,
        tenantId: user.tenantId
      }
    });

    if (!clientBelongsToTenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(client, { status: 200 });

  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}
