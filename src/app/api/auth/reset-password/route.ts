import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // ========================================================================
    // INPUT VALIDATION
    // ========================================================================
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // ========================================================================
    // VALIDATE RESET TOKEN
    // ========================================================================

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // ========================================================================
    // UPDATE PASSWORD AND CLEAR RESET TOKEN
    // ========================================================================

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
        // Clear reset token
        passwordResetToken: null,
        passwordResetExpires: null,
        // Reset security counters
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
          action: 'PASSWORD_RESET',
          userId: user.id,
          tenantId: user.tenantId || undefined,
          metadata: JSON.stringify({
            resetTokenUsed: true,
            resetCompleted: true
          })
        }
      });
    } catch (auditError) {
      console.log('Audit log error (non-blocking):', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}