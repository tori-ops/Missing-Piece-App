import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export interface AuthorizedUser {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: 'SUPERADMIN' | 'TENANT' | 'CLIENT';
  accountStatus: string;
  isActive: boolean;
  tenantId: string | null;
  clientId: string | null;
}

/**
 * Get the authenticated and authorized user from session
 */
export async function getAuthorizedUser(): Promise<AuthorizedUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return null;
  }

  // Get full user data from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      accountStatus: true,
      isActive: true,
      tenantId: true,
      clientId: true
    }
  });

  if (!user || !user.isActive || user.accountStatus !== 'ACTIVE') {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as 'SUPERADMIN' | 'TENANT' | 'CLIENT',
    accountStatus: user.accountStatus,
    isActive: user.isActive,
    tenantId: user.tenantId,
    clientId: user.clientId
  };
}

/**
 * Require specific role access
 */
export async function requireRole(
  allowedRoles: ('SUPERADMIN' | 'TENANT' | 'CLIENT')[]
): Promise<{ user: AuthorizedUser } | NextResponse> {
  const user = await getAuthorizedUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: `Access denied. Required roles: ${allowedRoles.join(', ')}` },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Require tenant access and verify tenant ownership
 */
export async function requireTenantAccess(
  tenantId: string
): Promise<{ user: AuthorizedUser } | NextResponse> {
  const user = await getAuthorizedUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // SUPERADMIN can access any tenant
  if (user.role === 'SUPERADMIN') {
    return { user };
  }

  // TENANT can only access their own tenant
  if (user.role === 'TENANT' && user.tenantId === tenantId) {
    return { user };
  }

  return NextResponse.json(
    { error: 'Access denied. You can only access your own tenant data.' },
    { status: 403 }
  );
}

/**
 * Require client access and verify client ownership
 */
export async function requireClientAccess(
  clientId: string
): Promise<{ user: AuthorizedUser } | NextResponse> {
  const user = await getAuthorizedUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // SUPERADMIN can access any client
  if (user.role === 'SUPERADMIN') {
    return { user };
  }

  // CLIENT can only access their own profile
  if (user.role === 'CLIENT' && user.clientId === clientId) {
    return { user };
  }

  // TENANT can access clients under their tenant
  if (user.role === 'TENANT') {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: { tenantId: true }
    });

    if (clientProfile && clientProfile.tenantId === user.tenantId) {
      return { user };
    }
  }

  return NextResponse.json(
    { error: 'Access denied. You can only access your own client data.' },
    { status: 403 }
  );
}

/**
 * Verify that a client belongs to a specific tenant
 */
export async function verifyClientTenantRelationship(
  clientId: string,
  tenantId: string
): Promise<boolean> {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    select: { tenantId: true }
  });

  return clientProfile?.tenantId === tenantId;
}

/**
 * Create audit log entry for access control violations
 */
export async function logAccessViolation(
  user: AuthorizedUser | null,
  attemptedAction: string,
  resourceType: string,
  resourceId: string,
  request: NextRequest
) {
  try {
    await prisma.auditLog.create({
      data: {
        entity: 'security',
        entityId: resourceId,
        action: 'ACCESS_DENIED' as any,
        userId: user?.id || null,
        tenantId: user?.tenantId || null,
        metadata: JSON.stringify({
          attemptedAction,
          resourceType,
          resourceId,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        })
      }
    });
  } catch (error) {
    console.error('Failed to log access violation:', error);
  }
}