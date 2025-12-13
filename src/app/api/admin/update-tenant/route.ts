import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
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
      const { firstName, lastName, businessName, phone, email, webAddress, status, subscriptionTier, weddingDate, budget } = basicInfo;

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
          firstName: firstName || null,
          lastName: lastName || null,
          businessName,
          phone: phone || null,
          email,
          webAddress: webAddress || null,
          status: status || 'ACTIVE',
          subscriptionTier: subscriptionTier || 'FREE',
          weddingDate: weddingDate ? new Date(weddingDate) : null,
          budget: budget ? parseFloat(budget.toString()) : null,
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
            }),
            userId: (session.user as any)?.id || 'unknown',
          },
        });
      } catch (auditErr) {
        console.error('Failed to create audit log:', auditErr);
        // Don't fail the request if audit log fails
      }
    }

    // Fetch updated tenant
    const updatedTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        businessName: true,
        email: true,
        status: true,
        subscriptionTier: true,
      },
    });

    return NextResponse.json({
      message: 'Tenant updated successfully',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    );
  }
}
