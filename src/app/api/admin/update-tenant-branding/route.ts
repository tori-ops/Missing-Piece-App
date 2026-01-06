import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidHexColor } from '@/lib/branding';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only superadmins can update tenant branding' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tenantId,
      primaryColor,
      secondaryColor,
      secondaryColorOpacity,
      overlayOpacity,
      fontColor,
      logoUrl,
      logoBackgroundRemoval,
      overlayUrl,
      companyName,
      tagline,
      faviconUrl,
      footerText,
      fontFamily,
      headerFontFamily,
      bodyFontFamily,
    } = body;

    // Validate required fields
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    // Validate colors if provided
    if (primaryColor && !isValidHexColor(primaryColor)) {
      return NextResponse.json(
        { error: 'Primary color must be a valid hex color' },
        { status: 400 }
      );
    }

    if (secondaryColor && !isValidHexColor(secondaryColor)) {
      return NextResponse.json(
        { error: 'Secondary color must be a valid hex color' },
        { status: 400 }
      );
    }

    if (fontColor && !isValidHexColor(fontColor)) {
      return NextResponse.json(
        { error: 'Font color must be a valid hex color' },
        { status: 400 }
      );
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Update tenant branding
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        brandingPrimaryColor: primaryColor || null,
        brandingSecondaryColor: secondaryColor || null,
        brandingSecondaryColorOpacity: secondaryColorOpacity !== undefined ? secondaryColorOpacity : null,
        brandingOverlayOpacity: overlayOpacity !== undefined ? overlayOpacity : null,
        brandingFontColor: fontColor || null,
        brandingLogoUrl: logoUrl || null,
        brandingLogoBackgroundRemoval: logoBackgroundRemoval !== undefined ? logoBackgroundRemoval : null,
        brandingOverlayUrl: overlayUrl || null,
        brandingCompanyName: companyName || null,
        brandingTagline: tagline || null,
        brandingFaviconUrl: faviconUrl || null,
        brandingFooterText: footerText || null,
        brandingFontFamily: fontFamily || null,
        brandingHeaderFontFamily: headerFontFamily || null,
        brandingBodyFontFamily: bodyFontFamily || null,
      },
    });

    // Log audit trail
    try {
      await prisma.auditLog.create({
        data: {
          entity: 'tenant',
          entityId: tenantId,
          action: 'TENANT_UPDATED',
          userId: (session.user as any).id,
          tenantId: tenantId,
        },
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Branding update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update branding';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error stack:', errorStack);
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? errorStack : undefined },
      { status: 500 }
    );
  }
}
