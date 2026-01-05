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
      return NextResponse.json({ error: 'Only TENANT users can access this endpoint' }, { status: 403 });
    }

    // Fetch tenant branding
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        brandingPrimaryColor: true,
        brandingSecondaryColor: true,
        brandingSecondaryColorOpacity: true,
        brandingFontColor: true,
        brandingLogoUrl: true,
        brandingLogoBackgroundRemoval: true,
        brandingCompanyName: true,
        brandingTagline: true,
        brandingFaviconUrl: true,
        brandingFooterText: true,
        brandingFontFamily: true,
        brandingHeaderFontFamily: true,
        brandingBodyFontFamily: true,
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      primaryColor: tenant.brandingPrimaryColor,
      secondaryColor: tenant.brandingSecondaryColor,
      secondaryColorOpacity: tenant.brandingSecondaryColorOpacity,
      fontColor: tenant.brandingFontColor,
      logoUrl: tenant.brandingLogoUrl,
      logoBackgroundRemoval: tenant.brandingLogoBackgroundRemoval,
      companyName: tenant.brandingCompanyName,
      tagline: tenant.brandingTagline,
      faviconUrl: tenant.brandingFaviconUrl,
      footerText: tenant.brandingFooterText,
      fontFamily: tenant.brandingFontFamily,
      headerFontFamily: tenant.brandingHeaderFontFamily,
      bodyFontFamily: tenant.brandingBodyFontFamily,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching tenant branding:', error);
    return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 });
  }
}
