import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Unauthorized: Only tenant admins can edit clients' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      clientId,
      tenantId,
      couple1FirstName,
      couple1LastName,
      couple2FirstName,
      couple2LastName,
      weddingDate,
      budget,
      status
    } = body;

    // Verify user owns this tenant
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any)?.id || '' },
      include: { tenant: true }
    });

    if (!user || user.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized: You cannot edit clients for this tenant' },
        { status: 403 }
      );
    }

    // Verify client belongs to this tenant
    const existingClient = await prisma.clientProfile.findUnique({
      where: { id: clientId }
    });

    if (!existingClient || existingClient.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Client not found or does not belong to this tenant' },
        { status: 404 }
      );
    }

    // Update client profile
    const updatedClient = await prisma.clientProfile.update({
      where: { id: clientId },
      data: {
        couple1FirstName,
        couple1LastName: couple1LastName || '',
        couple2FirstName: couple2FirstName || null,
        couple2LastName: couple2LastName || null,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        budgetCents: budget || null,
        status
      },
      include: { users: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      clientProfile: updatedClient
    });

  } catch (error) {
    console.error('Client edit error:', error);
    return NextResponse.json(
      { error: 'Failed to edit client: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
