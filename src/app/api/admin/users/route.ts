import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error('[Users API] No session found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    console.log('[Users API] User role:', userRole);
    
    if (userRole !== 'SUPERADMIN') {
      console.error('[Users API] Unauthorized - role is:', userRole);
      return NextResponse.json(
        { error: 'Unauthorized - superadmin role required' },
        { status: 403 }
      );
    }

    // Get all tenants with their user and client counts
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true,
        clientProfiles: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('[Users API] Found tenants:', tenants.length);

    return NextResponse.json({
      tenants: tenants.map(tenant => ({
        id: tenant.id,
        businessName: tenant.businessName,
        email: tenant.email,
        userCount: tenant.users.length,
        clientCount: tenant.clientProfiles.length
      }))
    });

  } catch (error) {
    console.error('[Users API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
