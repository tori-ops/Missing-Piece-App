import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Increase max payload size for form submissions
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

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
    } else if (user.role === 'TENANT') {
      // Tenant can only view clients they have explicit access to
      const hasAccess = await prisma.tenantAccess.findUnique({
        where: {
          clientProfileId_tenantId: {
            clientProfileId: clientId,
            tenantId: user.tenantId!
          }
        }
      });
      
      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Get website images
    const images = await prisma.websiteImage.findMany({
      where: { clientWebsiteId: clientId },
      select: {
        id: true,
        storageBucket: true,
        storagePath: true,
        category: true,
        createdAt: true
      }
    });

    // Get public URLs from Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const imagesWithUrls = images.map((img: any) => ({
      id: img.id,
      category: img.category,
      url: supabase.storage.from(img.storageBucket).getPublicUrl(img.storagePath).data.publicUrl,
      createdAt: img.createdAt
    }));

    // Get website data
    const website = await prisma.clientWebsite.findUnique({
      where: { clientProfileId: clientId },
      include: {
        registries: {
          orderBy: { registryOrder: 'asc' }
        },
        clientProfile: {
          select: {
            couple1FirstName: true,
            couple1LastName: true,
            couple2FirstName: true,
            couple2LastName: true,
            weddingLocation: true,
            weddingDate: true
          }
        }
      }
    });

    return NextResponse.json({ 
      website: website || null,
      images: imagesWithUrls
    }, { status: 200 });

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

    const { howWeMet, engagementStory, headerFont, bodyFont, fontColor, colorPrimary, colorSecondary, colorAccent, urlEnding1, urlEnding2, registries, allowTenantEdits } = await request.json();

    // Validate colors are hex
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    [colorPrimary, colorSecondary, colorAccent, fontColor].forEach(color => {
      if (color && !hexRegex.test(color)) {
        throw new Error('Invalid color format. Use hex colors.');
      }
    });

    // Get tenant info
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: { tenantId: true }
    });

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Create or update website
    const website = await prisma.clientWebsite.upsert({
      where: { clientProfileId: clientId },
      update: {
        howWeMet: howWeMet || null,
        engagementStory: engagementStory || null,
        headerFont: headerFont || null,
        bodyFont: bodyFont || null,
        fontColor: fontColor || null,
        colorPrimary,
        colorSecondary,
        colorAccent,
        urlEnding1: urlEnding1 || null,
        urlEnding2: urlEnding2 || null,
        allowTenantEdits: allowTenantEdits || false,
        registries: registries ? {
          deleteMany: {},
          create: registries
            .filter((reg: any) => reg.registryUrl && reg.registryUrl.trim())
            .map((reg: any, idx: number) => ({
              registryName: reg.registryName || '',
              registryUrl: reg.registryUrl,
              isOptional: reg.isOptional,
              registryOrder: idx
            }))
        } : undefined
      },
      create: {
        clientProfileId: clientId,
        tenantId: clientProfile.tenantId,
        howWeMet: howWeMet || null,
        engagementStory: engagementStory || null,
        headerFont: headerFont || null,
        bodyFont: bodyFont || null,
        fontColor: fontColor || null,
        colorPrimary,
        colorSecondary,
        colorAccent,
        urlEnding1: urlEnding1 || null,
        urlEnding2: urlEnding2 || null,
        allowTenantEdits: allowTenantEdits || false,
        registries: registries ? {
          create: registries
            .filter((reg: any) => reg.registryUrl && reg.registryUrl.trim())
            .map((reg: any, idx: number) => ({
              registryName: reg.registryName || '',
              registryUrl: reg.registryUrl,
              isOptional: reg.isOptional,
              registryOrder: idx
            }))
        } : undefined
      },
      include: {
        registries: true
      }
    });

    return NextResponse.json({ website, images: [] }, { status: 201 });

  } catch (error) {
    console.error('Error creating website data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create website data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
