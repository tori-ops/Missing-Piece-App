import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized: Must be logged in to change password' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // ========================================================================
    // INPUT VALIDATION
    // ========================================================================
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // ========================================================================
    // FETCH USER AND VERIFY CURRENT PASSWORD
    // ========================================================================

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User not found or password not set' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // ========================================================================
    // UPDATE PASSWORD
    // ========================================================================

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
        mustChangePassword: false, // Clear forced password change
        // Reset any security counters on password change
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    // Log audit trail
    try {
      await prisma.auditLog.create({
        data: {
          entity: 'user',
          entityId: user.id,
          action: 'PASSWORD_CHANGED',
          userId: user.id,
          tenantId: user.tenantId || undefined
        }
      });
    } catch (auditError) {
      console.log('Audit log error (non-blocking):', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}