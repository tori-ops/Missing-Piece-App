import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    console.log('=== GET /api/tenant/clients/[clientId] ===');
    const session = await getServerSession(authOptions);
    console.log('Session:', { email: session?.user?.email, role: (session?.user as any)?.role });
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    console.log('User found:', { id: user?.id, role: user?.role, tenantId: user?.tenantId });

    if (!user || user.role !== 'TENANT' || !user.tenantId) {
      return NextResponse.json({ error: 'Only TENANT users can view clients' }, { status: 403 });
    }

    const { clientId } = await params;
    console.log('Looking for clientId:', clientId);

    // Fetch client and verify it belongs to the tenant in one query
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        tenantId: true,
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
        addressLine1: true,
        addressLine2: true,
        addressCity: true,
        addressState: true,
        addressZip: true,
        ceremonyTime: true,
        venuePhone: true,
        venueWebsite: true,
        estimatedGuestCount: true,
      }
    });

    console.log('Client found:', { id: client?.id, couple1FirstName: client?.couple1FirstName, tenantId: client?.tenantId });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify the client belongs to the tenant
    if (client.tenantId !== user.tenantId) {
      console.log('Tenant mismatch:', { clientTenantId: client.tenantId, userTenantId: user.tenantId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Remove tenantId from response before sending
    const { tenantId, ...clientData } = client;
    console.log('Returning client data:', clientData);

    return NextResponse.json(clientData, { status: 200 });

  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}
