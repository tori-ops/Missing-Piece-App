import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { clientProfile: true }
    });

    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Not a client' }, { status: 400 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: user.clientId },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            brandingPrimaryColor: true,
            brandingSecondaryColor: true,
            brandingFontColor: true,
            brandingLogoUrl: true,
            brandingCompanyName: true,
            brandingTagline: true,
            brandingHeaderFontFamily: true,
            brandingBodyFontFamily: true
          }
        },
        tenantAccessList: {
          include: {
            grantedByClient: {
              select: { id: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json(clientProfile, { status: 200 });

  } catch (error) {
    console.error('Error fetching client profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const {
      couple1FirstName,
      couple1LastName,
      couple2FirstName,
      couple2LastName,
      contactPhone,
      addressLine1,
      addressLine2,
      addressCity,
      addressState,
      addressZip,
      budgetCents,
      weddingDate,
      weddingLocation
    } = body;

    const updatedProfile = await prisma.clientProfile.update({
      where: { id: user.clientId },
      data: {
        couple1FirstName: couple1FirstName || undefined,
        couple1LastName: couple1LastName || undefined,
        couple2FirstName: couple2FirstName || undefined,
        couple2LastName: couple2LastName || undefined,
        contactPhone: contactPhone || undefined,
        addressLine1: addressLine1 || undefined,
        addressLine2: addressLine2 || undefined,
        addressCity: addressCity || undefined,
        addressState: addressState || undefined,
        addressZip: addressZip || undefined,
        budgetCents: budgetCents || undefined,
        weddingDate: weddingDate ? new Date(weddingDate) : undefined,
        weddingLocation: weddingLocation || undefined
      }
    });

    return NextResponse.json(updatedProfile, { status: 200 });

  } catch (error) {
    console.error('Error updating client profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
