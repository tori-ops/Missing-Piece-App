import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Update tenant session:', { 
      sessionExists: !!session, 
      role: (session?.user as any)?.role,
      email: (session?.user as any)?.email 
    });

    if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
      console.error('Unauthorized attempt:', { session, role: (session?.user as any)?.role });
      return NextResponse.json(
        { error: 'Unauthorized: Only superadmins can update tenants' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tenantId, basicInfo } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
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

    // Update basic info if provided
    if (basicInfo) {
      const { firstName, lastName, businessName, phone, email, webAddress, status, subscriptionTier, streetAddress, city, state } = basicInfo;

      // Validate required fields
      if (!businessName?.trim() || !email?.trim()) {
        return NextResponse.json(
          { error: 'Business name and email are required' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another tenant
      if (email !== tenant.email) {
        const existingTenant = await prisma.tenant.findUnique({
          where: { email },
        });
        if (existingTenant) {
          return NextResponse.json(
            { error: 'Email is already in use' },
            { status: 400 }
          );
        }
      }

      // Update tenant
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          firstName: firstName || '',
          lastName: lastName || '',
          businessName,
          brandingCompanyName: businessName, // Keep branding in sync with business name
          phone: phone || '',
          email,
          webAddress: webAddress || '',
          status: status || 'ACTIVE',
          subscriptionTier: subscriptionTier || 'FREE',
        },
      });

      // Also update the User records associated with this tenant to sync firstName/lastName
      // This ensures the welcome message and profile display are consistent
      await prisma.user.updateMany({
        where: { tenantId },
        data: {
          firstName: firstName || '',
          lastName: lastName || '',
        },
      });

      // Create audit log
      try {
        await prisma.auditLog.create({
          data: {
            entity: 'tenant',
            entityId: tenantId,
            action: 'TENANT_UPDATED',
            changes: JSON.stringify({
              firstName,
              lastName,
              businessName,
              phone,
              email,
              webAddress,
              status,
              subscriptionTier,
              streetAddress,
              city,
              state,
            }),
            userId: (session.user as any)?.id || 'unknown',
          },
        });
      } catch (auditErr) {
        console.error('Failed to create audit log:', auditErr);
        // Don't fail the request if audit log fails
      }
    }

    // Fetch updated tenant with all fields
    const updatedTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        email: true,
        webAddress: true,
        status: true,
        subscriptionTier: true,
      },
    });

    // Invalidate tenant's cached profile pages
    revalidatePath('/dashboard/tenant');
    revalidatePath(`/dashboard/superadmin/tenants/${tenantId}`);

    return NextResponse.json({
      message: 'Tenant updated successfully',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to update tenant: ${errorMessage}` },
      { status: 500 }
    );
  }
}
