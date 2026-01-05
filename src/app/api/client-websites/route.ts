import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the clientId from query params
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    // Verify client exists and belongs to user (for CLIENT role) or tenant (for TENANT role)
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check authorization
    if (user.role === 'CLIENT' && user.clientId !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    } else if (user.role === 'TENANT' && client.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get website data
    const website = await prisma.clientWebsite.findUnique({
      where: { clientProfileId: clientId },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        registries: {
          orderBy: { registryOrder: 'asc' }
        }
      }
    });

    return NextResponse.json(website || null, { status: 200 });

  } catch (error) {
    console.error('Error fetching website data:', error);
    return NextResponse.json({ error: 'Failed to fetch website data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only CLIENT users can create website data' }, { status: 403 });
    }

    const clientId = user.clientId;
    if (!clientId) {
      return NextResponse.json({ error: 'No client profile linked' }, { status: 400 });
    }

    const { howWeMet, engagementStory, fontFamily, colorPrimary, colorSecondary, colorAccent, suggestedUrlSlug1, suggestedUrlSlug2 } = await request.json();

    // Validate colors are hex
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(colorPrimary) || !hexRegex.test(colorSecondary) || !hexRegex.test(colorAccent)) {
      return NextResponse.json({ error: 'Invalid color format. Use hex colors.' }, { status: 400 });
    }

    // Create or update website
    const website = await prisma.clientWebsite.upsert({
      where: { clientProfileId: clientId },
      update: {
        howWeMet: howWeMet || null,
        engagementStory: engagementStory || null,
        fontFamily: fontFamily || null,
        colorPrimary,
        colorSecondary,
        colorAccent,
        suggestedUrlSlug1: suggestedUrlSlug1 || null,
        suggestedUrlSlug2: suggestedUrlSlug2 || null,
      },
      create: {
        clientProfileId: clientId,
        tenantId: user.clientId ? (await prisma.clientProfile.findUnique({ where: { id: clientId }, select: { tenantId: true } }))?.tenantId! : '',
        howWeMet: howWeMet || null,
        engagementStory: engagementStory || null,
        fontFamily: fontFamily || null,
        colorPrimary,
        colorSecondary,
        colorAccent,
        suggestedUrlSlug1: suggestedUrlSlug1 || null,
        suggestedUrlSlug2: suggestedUrlSlug2 || null,
      },
      include: {
        images: true,
        registries: true
      }
    });

    return NextResponse.json(website, { status: 201 });

  } catch (error) {
    console.error('Error creating website data:', error);
    return NextResponse.json({ error: 'Failed to create website data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only CLIENT users can update website data' }, { status: 403 });
    }

    const clientId = user.clientId;
    if (!clientId) {
      return NextResponse.json({ error: 'No client profile linked' }, { status: 400 });
    }

    const { howWeMet, engagementStory, fontFamily, colorPrimary, colorSecondary, colorAccent, suggestedUrlSlug1, suggestedUrlSlug2 } = await request.json();

    // Validate colors are hex
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (colorPrimary && !hexRegex.test(colorPrimary)) {
      return NextResponse.json({ error: 'Invalid primary color format' }, { status: 400 });
    }
    if (colorSecondary && !hexRegex.test(colorSecondary)) {
      return NextResponse.json({ error: 'Invalid secondary color format' }, { status: 400 });
    }
    if (colorAccent && !hexRegex.test(colorAccent)) {
      return NextResponse.json({ error: 'Invalid accent color format' }, { status: 400 });
    }

    const website = await prisma.clientWebsite.update({
      where: { clientProfileId: clientId },
      data: {
        ...(howWeMet !== undefined && { howWeMet: howWeMet || null }),
        ...(engagementStory !== undefined && { engagementStory: engagementStory || null }),
        ...(fontFamily !== undefined && { fontFamily: fontFamily || null }),
        ...(colorPrimary && { colorPrimary }),
        ...(colorSecondary && { colorSecondary }),
        ...(colorAccent && { colorAccent }),
        ...(suggestedUrlSlug1 !== undefined && { suggestedUrlSlug1: suggestedUrlSlug1 || null }),
        ...(suggestedUrlSlug2 !== undefined && { suggestedUrlSlug2: suggestedUrlSlug2 || null }),
      },
      include: {
        images: true,
        registries: true
      }
    });

    return NextResponse.json(website, { status: 200 });

  } catch (error) {
    console.error('Error updating website data:', error);
    return NextResponse.json({ error: 'Failed to update website data' }, { status: 500 });
  }
}
