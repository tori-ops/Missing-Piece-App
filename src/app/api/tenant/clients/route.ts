import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
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

    const clients = await prisma.clientProfile.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        couple1FirstName: true,
        couple1LastName: true,
        couple2FirstName: true,
        couple2LastName: true,
        contactEmail: true,
        contactPhone: true,
        budgetCents: true,
        weddingDate: true,
        weddingLocation: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(clients, { status: 200 });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
