import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('List tenants session:', { 
      sessionExists: !!session, 
      role: (session?.user as any)?.role,
      email: (session?.user as any)?.email 
    });

    // Check authorization - only superadmin
    if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
      console.error('List tenants unauthorized:', { session, role: (session?.user as any)?.role });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch all tenants with their stats
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        email: true,
        webAddress: true,
        streetAddress: true,
        city: true,
        state: true,
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
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        businessName: tenant.businessName,
        phone: tenant.phone,
        email: tenant.email,
        webAddress: tenant.webAddress,
        streetAddress: tenant.streetAddress,
        city: tenant.city,
        state: tenant.state,
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
