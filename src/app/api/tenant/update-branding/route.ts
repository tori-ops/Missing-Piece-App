import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidHexColor } from '@/lib/branding';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      primaryColor,
      secondaryColor,
      secondaryColorOpacity,
      fontColor,
      companyName,
      tagline,
      footerText,
      fontFamily,
      headerFontFamily,
      bodyFontFamily,
    } = body;

    // Get tenant ID from session
    const userRole = (session.user as any)?.role;
    const tenantId = (session.user as any)?.tenantId;

    if (userRole !== 'TENANT') {
      return NextResponse.json(
        { error: 'Unauthorized: Only tenant admins can update their branding' },
        { status: 403 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found in session' },
        { status: 400 }
      );
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

    // Update tenant branding (text/color fields only - NO file uploads)
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        brandingPrimaryColor: primaryColor || undefined,
        brandingSecondaryColor: secondaryColor || undefined,
        brandingSecondaryColorOpacity: secondaryColorOpacity !== undefined ? secondaryColorOpacity : undefined,
        brandingFontColor: fontColor || undefined,
        brandingCompanyName: companyName || undefined,
        brandingTagline: tagline || undefined,
        brandingFooterText: footerText || undefined,
        brandingFontFamily: fontFamily || undefined,
        brandingHeaderFontFamily: headerFontFamily || undefined,
        brandingBodyFontFamily: bodyFontFamily || undefined,
      },
    });

    // Log audit trail
    try {
      await prisma.auditLog.create({
        data: {
          entity: 'tenant',
          entityId: tenantId,
          action: 'UPDATE_BRANDING',
          userId: (session.user as any)?.id,
          changes: JSON.stringify({
            primaryColor,
            secondaryColor,
            fontColor,
            companyName,
            tagline,
          }),
        },
      });
    } catch (auditErr) {
      console.error('Audit log error:', auditErr);
    }

    return NextResponse.json(
      { 
        message: 'Branding updated successfully',
        tenant: updatedTenant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Branding update error:', error);
    return NextResponse.json(
      { error: 'Failed to update branding' },
      { status: 500 }
    );
  }
}
