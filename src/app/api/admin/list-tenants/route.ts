import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization - only superadmin
    if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch all tenants with their stats
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        email: true,
        status: true,
        subscriptionTier: true,
        createdAt: true,
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
        users: {
          select: { id: true }
        },
        clientProfiles: {
          select: { id: true }
        },
        payments: {
          select: {
            id: true,
            amountCents: true,
            status: true,
            recordedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate revenue and outstanding payments for each tenant
    const tenantsWithStats = tenants.map(tenant => {
      const totalRevenue = tenant.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.amountCents || 0), 0) / 100;

      const outstandingPayments = tenant.payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + (p.amountCents || 0), 0) / 100;

      return {
        id: tenant.id,
        businessName: tenant.businessName,
        email: tenant.email,
        status: tenant.status,
        subscriptionTier: tenant.subscriptionTier,
        createdAt: tenant.createdAt,
        brandingPrimaryColor: tenant.brandingPrimaryColor,
        brandingSecondaryColor: tenant.brandingSecondaryColor,
        brandingSecondaryColorOpacity: tenant.brandingSecondaryColorOpacity,
        brandingFontColor: tenant.brandingFontColor,
        brandingLogoUrl: tenant.brandingLogoUrl,
        brandingLogoBackgroundRemoval: tenant.brandingLogoBackgroundRemoval,
        brandingCompanyName: tenant.brandingCompanyName,
        brandingTagline: tenant.brandingTagline,
        brandingFaviconUrl: tenant.brandingFaviconUrl,
        brandingFooterText: tenant.brandingFooterText,
        userCount: tenant.users.length,
        clientCount: tenant.clientProfiles.length,
        totalRevenue,
        outstandingPayments,
        totalPayments: tenant.payments.length
      };
    });

    return NextResponse.json({
      tenants: tenantsWithStats,
      count: tenantsWithStats.length
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}
